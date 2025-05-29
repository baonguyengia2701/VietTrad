import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { cartService } from '../services/cartService';
import { useAuth } from './AuthContext';

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };

    case 'LOAD_CART':
      return {
        ...state,
        items: action.payload,
        loading: false,
        error: null
      };

    case 'ADD_TO_CART':
      // Helper function để so sánh 2 items
      const isSameItem = (existingItem, newItem) => {
        // 1. So sánh bằng productId nếu cả hai đều có
        if (existingItem.productId && newItem.productId) {
          const sameProductId = String(existingItem.productId) === String(newItem.productId);
          const sameVariant = existingItem.selectedVariant?.title === newItem.selectedVariant?.title && 
                            existingItem.selectedVariant?.size === newItem.selectedVariant?.size;
          return sameProductId && sameVariant;
        }
        
        // 2. Fallback: so sánh bằng name nếu không có productId
        const sameName = existingItem.name === newItem.name;
        const sameVariant = existingItem.selectedVariant?.title === newItem.selectedVariant?.title && 
                          existingItem.selectedVariant?.size === newItem.selectedVariant?.size;
        return sameName && sameVariant;
      };

      // Tìm item đã tồn tại
      const existingItemIndex = state.items.findIndex(item => isSameItem(item, action.payload));
      const existingItem = existingItemIndex > -1 ? state.items[existingItemIndex] : null;

      if (existingItem) {
        return {
          ...state,
          items: state.items.map((item, index) => 
            index === existingItemIndex 
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item
          )
        };
      }

      return {
        ...state,
        items: [...state.items, action.payload]
      };

    case 'REMOVE_FROM_CART':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload.id)
      };

    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        )
      };

    case 'CLEAR_CART':
      return {
        ...state,
        items: []
      };

    default:
      return state;
  }
};

const initialState = {
  items: [],
  loading: false,
  error: null,
  isOpen: false
};

export const CartProvider = ({ children }) => {
  const [cartState, dispatch] = useReducer(cartReducer, initialState);
  const { currentUser } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);

  // Load cart khi component mount hoặc user thay đổi
  useEffect(() => {
    if (!isInitialized) {
      loadCart();
      setIsInitialized(true);
    } else if (currentUser) {
      // Khi user login, đồng bộ localStorage với server
      syncCartFromLocalStorage();
    } else {
      // Khi user logout, load từ localStorage
      loadCartFromLocalStorage();
    }
  }, [currentUser, isInitialized]);

  // Save cart vào localStorage khi có thay đổi (cho user chưa login)
  useEffect(() => {
    if (!currentUser && cartState.items.length >= 0) {
    localStorage.setItem('viettrad_cart', JSON.stringify(cartState.items));
    }
  }, [cartState.items, currentUser]);

  const loadCart = async () => {
    if (currentUser) {
      await loadCartFromServer();
    } else {
      loadCartFromLocalStorage();
    }
  };

  const loadCartFromServer = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const result = await cartService.getCart();
      
      if (result.success) {
        // Convert API cart items to match frontend format
        const formattedItems = result.data.items.map(item => ({
          id: item._id,
          productId: item.productId || item._id,
          name: item.name,
          price: item.price,
          discount: item.discount,
          image: item.image,
          brand: item.brand,
          category: item.category,
          quantity: item.quantity,
          selectedVariant: item.selectedVariant || {},
          countInStock: item.countInStock
        }));
        
        dispatch({ type: 'LOAD_CART', payload: formattedItems });
      } else {
        dispatch({ type: 'LOAD_CART', payload: [] });
      }
    } catch (error) {
      console.error('Error loading cart from server:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Không thể tải giỏ hàng từ server' });
      // Fallback to localStorage
      loadCartFromLocalStorage();
    }
  };

  const loadCartFromLocalStorage = () => {
    try {
      const savedCart = localStorage.getItem('viettrad_cart');
      if (savedCart) {
        const items = JSON.parse(savedCart);
        // Normalize loaded items to ensure selectedVariant consistency
        const normalizedItems = items.map(item => ({
          ...item,
          selectedVariant: item.selectedVariant || {}
        }));
        
        dispatch({ type: 'LOAD_CART', payload: normalizedItems });
      } else {
        dispatch({ type: 'LOAD_CART', payload: [] });
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      dispatch({ type: 'LOAD_CART', payload: [] });
    }
  };

  const syncCartFromLocalStorage = async () => {
    try {
      const savedCart = localStorage.getItem('viettrad_cart');
      if (savedCart) {
        const localItems = JSON.parse(savedCart);
        if (localItems.length > 0) {
          dispatch({ type: 'SET_LOADING', payload: true });
          
          const result = await cartService.syncCart(localItems);
          if (result.success) {
            // Format and load synced cart
            const formattedItems = result.data.items.map(item => ({
              id: item._id,
              productId: item.productId || item._id,
              name: item.name,
              price: item.price,
              discount: item.discount,
              image: item.image,
              brand: item.brand,
              category: item.category,
              quantity: item.quantity,
              selectedVariant: item.selectedVariant || {},
              countInStock: item.countInStock
            }));
            
            dispatch({ type: 'LOAD_CART', payload: formattedItems });
            // Clear localStorage after successful sync
            localStorage.removeItem('viettrad_cart');
          } else {
            // If sync fails, load from server
            await loadCartFromServer();
          }
        } else {
          // No local items, just load from server
          await loadCartFromServer();
        }
      } else {
        // No local cart, load from server
        await loadCartFromServer();
      }
    } catch (error) {
      console.error('Error syncing cart:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Không thể đồng bộ giỏ hàng' });
      // Fallback to loading from server
      await loadCartFromServer();
    }
  };

  const addToCart = async (product, quantity = 1, selectedVariant = null) => {
    try {
      dispatch({ type: 'CLEAR_ERROR' });

      // Normalize selectedVariant trước để đảm bảo consistency
      const normalizedVariant = selectedVariant ? {
        title: selectedVariant.title || '',
        size: selectedVariant.size || ''
      } : null;

      if (currentUser) {
        // User đã login, gọi API
        dispatch({ type: 'SET_LOADING', payload: true });
        
        const result = await cartService.addToCart(product._id, quantity, normalizedVariant);
        if (result.success) {
          // Format and update cart
          const formattedItems = result.data.items.map(item => ({
            id: item._id,
            productId: item.productId || item._id,
            name: item.name,
            price: item.price,
            discount: item.discount,
            image: item.image,
            brand: item.brand,
            category: item.category,
            quantity: item.quantity,
            selectedVariant: item.selectedVariant || null,
            countInStock: item.countInStock
          }));
          
          dispatch({ type: 'LOAD_CART', payload: formattedItems });
          return result;
        } else {
          throw new Error(result.message || 'Không thể thêm sản phẩm vào giỏ hàng');
        }
      }

        // User chưa login, sử dụng localStorage
        const cartItem = {
        id: product._id || `${product.name}_${selectedVariant?.title || ''}_${selectedVariant?.size || ''}`,
          productId: product._id,
          name: product.name,
          price: product.price,
          discount: product.discount || 0,
        image: product.images[0],
          brand: product.brandName || product.brand,
          category: product.categoryName || product.category,
          quantity,
          selectedVariant: normalizedVariant,
          countInStock: product.countInStock
        };

        dispatch({ type: 'ADD_TO_CART', payload: cartItem });
        return { success: true, message: 'Thêm sản phẩm vào giỏ hàng thành công' };
    } catch (error) {
      console.error('Error adding to cart:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra khi thêm sản phẩm';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      dispatch({ type: 'CLEAR_ERROR' });

      if (currentUser) {
        // User đã login, gọi API
        dispatch({ type: 'SET_LOADING', payload: true });
        
        const result = await cartService.removeItem(itemId);
        if (result.success) {
          const formattedItems = result.data.items.map(item => ({
            id: item._id,
            productId: item.productId || item._id,
            name: item.name,
            price: item.price,
            discount: item.discount,
            image: item.image,
            brand: item.brand,
            category: item.category,
            quantity: item.quantity,
            selectedVariant: item.selectedVariant || {},
            countInStock: item.countInStock
          }));
          
          dispatch({ type: 'LOAD_CART', payload: formattedItems });
          return result;
        }
      } else {
        // User chưa login, sử dụng localStorage
        dispatch({ type: 'REMOVE_FROM_CART', payload: { id: itemId } });
        return { success: true, message: 'Xóa sản phẩm thành công' };
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra khi xóa sản phẩm';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      dispatch({ type: 'CLEAR_ERROR' });

      if (currentUser) {
        // User đã login, gọi API
        dispatch({ type: 'SET_LOADING', payload: true });
        
        const result = await cartService.updateQuantity(itemId, quantity);
        if (result.success) {
          const formattedItems = result.data.items.map(item => ({
            id: item._id,
            productId: item.productId || item._id,
            name: item.name,
            price: item.price,
            discount: item.discount,
            image: item.image,
            brand: item.brand,
            category: item.category,
            quantity: item.quantity,
            selectedVariant: item.selectedVariant || {},
            countInStock: item.countInStock
          }));
          
          dispatch({ type: 'LOAD_CART', payload: formattedItems });
          return result;
        }
      } else {
        // User chưa login, sử dụng localStorage
        if (quantity <= 0) {
          dispatch({ type: 'REMOVE_FROM_CART', payload: { id: itemId } });
        } else {
          dispatch({ type: 'UPDATE_QUANTITY', payload: { id: itemId, quantity } });
        }
        return { success: true, message: 'Cập nhật số lượng thành công' };
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra khi cập nhật số lượng';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const clearCart = async () => {
    try {
      dispatch({ type: 'CLEAR_ERROR' });

      if (currentUser) {
        // User đã login, gọi API
        dispatch({ type: 'SET_LOADING', payload: true });
        
        const result = await cartService.clearCart();
        if (result.success) {
          dispatch({ type: 'CLEAR_CART' });
          dispatch({ type: 'SET_LOADING', payload: false });
          return result;
        }
      } else {
        // User chưa login, sử dụng localStorage
        dispatch({ type: 'CLEAR_CART' });
        return { success: true, message: 'Xóa giỏ hàng thành công' };
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra khi xóa giỏ hàng';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const getTotalItems = () => {
    return cartState.items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cartState.items.reduce((total, item) => {
      const discountedPrice = item.discount > 0 
        ? item.price * (1 - item.discount / 100)
        : item.price;
      return total + (discountedPrice * item.quantity);
    }, 0);
  };

  const getOriginalTotalPrice = () => {
    return cartState.items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  };

  const getTotalDiscount = () => {
    return getOriginalTotalPrice() - getTotalPrice();
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value = {
    items: cartState.items,
    loading: cartState.loading,
    error: cartState.error,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice,
    getOriginalTotalPrice,
    getTotalDiscount,
    clearError,
    refreshCart: loadCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}; 