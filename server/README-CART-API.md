# Cart API Documentation

## Tổng quan
RESTful API cho chức năng giỏ hàng của hệ thống VietTrad. API hỗ trợ đầy đủ các thao tác CRUD với giỏ hàng và đồng bộ dữ liệu với client.

## Base URL
```
http://localhost:5000/api/cart
```

## Authentication
Tất cả các endpoint đều yêu cầu xác thực JWT. Token phải được gửi trong header:
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### 1. Lấy giỏ hàng hiện tại
**GET** `/api/cart`

**Description:** Lấy toàn bộ thông tin giỏ hàng của user hiện tại

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "64a1b2c3d4e5f6a7b8c9d0e1",
    "user": "64a1b2c3d4e5f6a7b8c9d0e2",
    "items": [
      {
        "_id": "64a1b2c3d4e5f6a7b8c9d0e3",
        "product": "64a1b2c3d4e5f6a7b8c9d0e4",
        "name": "Khăn lụa tơ tằm xẻ tay hoa sen Vạn Phúc",
        "price": 750000,
        "discount": 10,
        "image": "/uploads/products/khan-lua-van-phuc.jpg",
        "quantity": 1,
        "selectedVariant": {
          "title": "Màu đỏ",
          "size": "M",
          "price": 0
        },
        "brand": "Vạn Phúc",
        "category": "Khăn lụa",
        "countInStock": 50,
        "discountedPrice": 675000,
        "itemTotal": 675000,
        "originalItemTotal": 750000,
        "createdAt": "2023-07-01T10:00:00.000Z",
        "updatedAt": "2023-07-01T10:00:00.000Z"
      }
    ],
    "totalItems": 1,
    "totalPrice": 675000,
    "totalDiscount": 75000,
    "originalTotalPrice": 750000,
    "lastUpdated": "2023-07-01T10:00:00.000Z",
    "createdAt": "2023-07-01T09:00:00.000Z",
    "updatedAt": "2023-07-01T10:00:00.000Z"
  },
  "message": "Lấy giỏ hàng thành công"
}
```

### 2. Lấy thông tin tóm tắt giỏ hàng
**GET** `/api/cart/summary`

**Description:** Lấy thông tin tóm tắt giỏ hàng (dùng cho header/navigation)

**Response:**
```json
{
  "success": true,
  "data": {
    "totalItems": 3,
    "totalPrice": 1850000,
    "totalDiscount": 200000,
    "originalTotalPrice": 2050000,
    "lastUpdated": "2023-07-01T10:00:00.000Z"
  },
  "message": "Lấy thông tin tóm tắt giỏ hàng thành công"
}
```

### 3. Thêm sản phẩm vào giỏ hàng
**POST** `/api/cart/add`

**Description:** Thêm sản phẩm mới vào giỏ hàng hoặc tăng số lượng nếu đã có

**Request Body:**
```json
{
  "productId": "64a1b2c3d4e5f6a7b8c9d0e4",
  "quantity": 2,
  "selectedVariant": {
    "title": "Màu xanh",
    "size": "L",
    "price": 0
  }
}
```

**Parameters:**
- `productId` (string, required): ID của sản phẩm
- `quantity` (number, optional): Số lượng thêm vào (default: 1)
- `selectedVariant` (object, optional): Thông tin variant đã chọn

**Response:**
```json
{
  "success": true,
  "data": {
    // ... cart object with updated items
  },
  "message": "Thêm sản phẩm vào giỏ hàng thành công"
}
```

**Error Responses:**
```json
{
  "success": false,
  "message": "Không tìm thấy sản phẩm"
}
```

```json
{
  "success": false,
  "message": "Chỉ còn 5 sản phẩm trong kho"
}
```

### 4. Cập nhật số lượng sản phẩm
**PUT** `/api/cart/update/:itemId`

**Description:** Cập nhật số lượng của một item trong giỏ hàng

**Parameters:**
- `itemId` (string): ID của item trong giỏ hàng

**Request Body:**
```json
{
  "quantity": 3
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    // ... updated cart object
  },
  "message": "Cập nhật số lượng thành công"
}
```

**Notes:**
- Nếu quantity = 0, sản phẩm sẽ bị xóa khỏi giỏ hàng
- Quantity phải <= countInStock của sản phẩm

### 5. Xóa sản phẩm khỏi giỏ hàng
**DELETE** `/api/cart/remove/:itemId`

**Description:** Xóa một sản phẩm cụ thể khỏi giỏ hàng

**Parameters:**
- `itemId` (string): ID của item trong giỏ hàng

**Response:**
```json
{
  "success": true,
  "data": {
    // ... updated cart object
  },
  "message": "Xóa sản phẩm khỏi giỏ hàng thành công"
}
```

### 6. Xóa toàn bộ giỏ hàng
**DELETE** `/api/cart/clear`

**Description:** Xóa tất cả sản phẩm trong giỏ hàng

**Response:**
```json
{
  "success": true,
  "data": {
    // ... empty cart object
  },
  "message": "Xóa toàn bộ giỏ hàng thành công"
}
```

### 7. Đồng bộ giỏ hàng từ localStorage
**POST** `/api/cart/sync`

**Description:** Đồng bộ giỏ hàng từ localStorage lên server (dùng khi user login)

**Request Body:**
```json
{
  "items": [
    {
      "name": "Khăn lụa tơ tằm xẻ tay hoa sen Vạn Phúc",
      "price": 750000,
      "discount": 10,
      "image": "/uploads/products/khan-lua-van-phuc.jpg",
      "quantity": 1,
      "selectedVariant": {
        "title": "Màu đỏ",
        "size": "M"
      },
      "brand": "Vạn Phúc",
      "category": "Khăn lụa"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    // ... synchronized cart object
  },
  "message": "Đồng bộ giỏ hàng thành công"
}
```

## Error Handling

### HTTP Status Codes
- `200`: Success
- `400`: Bad Request (validation error)
- `401`: Unauthorized (authentication required)
- `404`: Not Found (cart/item not found)
- `500`: Internal Server Error

### Error Response Format
```json
{
  "success": false,
  "message": "Mô tả lỗi",
  "error": "Chi tiết lỗi (chỉ trong development mode)"
}
```

## Frontend Integration

### 1. Cập nhật CartContext để đồng bộ với server

```javascript
// services/cartService.js
import api from './api';

export const cartService = {
  // Lấy giỏ hàng từ server
  getCart: async () => {
    const response = await api.get('/cart');
    return response.data;
  },

  // Thêm sản phẩm vào giỏ hàng
  addToCart: async (productId, quantity = 1, selectedVariant = null) => {
    const response = await api.post('/cart/add', {
      productId,
      quantity,
      selectedVariant
    });
    return response.data;
  },

  // Cập nhật số lượng
  updateQuantity: async (itemId, quantity) => {
    const response = await api.put(`/cart/update/${itemId}`, { quantity });
    return response.data;
  },

  // Xóa sản phẩm
  removeItem: async (itemId) => {
    const response = await api.delete(`/cart/remove/${itemId}`);
    return response.data;
  },

  // Xóa toàn bộ giỏ hàng
  clearCart: async () => {
    const response = await api.delete('/cart/clear');
    return response.data;
  },

  // Đồng bộ giỏ hàng
  syncCart: async (items) => {
    const response = await api.post('/cart/sync', { items });
    return response.data;
  },

  // Lấy thông tin tóm tắt
  getCartSummary: async () => {
    const response = await api.get('/cart/summary');
    return response.data;
  }
};
```

### 2. Cập nhật CartContext để sử dụng API

```javascript
// contexts/CartContext.js
import { createContext, useContext, useReducer, useEffect } from 'react';
import { cartService } from '../services/cartService';
import { useAuth } from './AuthContext';

// ... existing code ...

export const CartProvider = ({ children }) => {
  const [cartState, dispatch] = useReducer(cartReducer, initialState);
  const { user, isAuthenticated } = useAuth();

  // Load cart từ server khi user đăng nhập
  useEffect(() => {
    if (isAuthenticated && user) {
      loadCartFromServer();
    } else {
      // Load từ localStorage nếu chưa đăng nhập
      loadCartFromLocalStorage();
    }
  }, [isAuthenticated, user]);

  const loadCartFromServer = async () => {
    try {
      const result = await cartService.getCart();
      if (result.success) {
        dispatch({ type: 'LOAD_CART', payload: result.data.items });
      }
    } catch (error) {
      console.error('Error loading cart from server:', error);
      // Fallback to localStorage
      loadCartFromLocalStorage();
    }
  };

  const loadCartFromLocalStorage = () => {
    const savedCart = localStorage.getItem('viettrad_cart');
    if (savedCart) {
      dispatch({ type: 'LOAD_CART', payload: JSON.parse(savedCart) });
    }
  };

  const addToCart = async (product, quantity = 1, selectedVariant = null) => {
    if (isAuthenticated) {
      try {
        const result = await cartService.addToCart(product._id, quantity, selectedVariant);
        if (result.success) {
          dispatch({ type: 'LOAD_CART', payload: result.data.items });
          return result;
        }
      } catch (error) {
        console.error('Error adding to cart:', error);
        throw error;
      }
    } else {
      // Fallback to local storage logic
      const cartItem = {
        id: `${product.name}_${selectedVariant?.title || 'default'}_${selectedVariant?.size || 'default'}_${Date.now()}`,
        name: product.name,
        price: product.price,
        discount: product.discount || 0,
        image: product.images[0],
        brand: product.brand,
        category: product.category,
        quantity,
        selectedVariant,
        countInStock: product.countInStock
      };

      dispatch({ type: 'ADD_TO_CART', payload: cartItem });
    }
  };

  // ... other methods với logic tương tự
};
```

## Usage Examples

### Thêm sản phẩm vào giỏ hàng
```javascript
const handleAddToCart = async () => {
  try {
    const result = await cartService.addToCart(
      '64a1b2c3d4e5f6a7b8c9d0e4', 
      2, 
      { title: 'Màu đỏ', size: 'M' }
    );
    
    if (result.success) {
      console.log('Thêm thành công:', result.message);
      // Cập nhật UI
    }
  } catch (error) {
    console.error('Lỗi:', error.response?.data?.message);
  }
};
```

### Cập nhật số lượng
```javascript
const handleUpdateQuantity = async (itemId, newQuantity) => {
  try {
    const result = await cartService.updateQuantity(itemId, newQuantity);
    if (result.success) {
      console.log('Cập nhật thành công');
    }
  } catch (error) {
    console.error('Lỗi:', error.response?.data?.message);
  }
};
```

### Đồng bộ khi login
```javascript
const handleLogin = async (loginData) => {
  try {
    // Login logic
    const loginResult = await authService.login(loginData);
    
    if (loginResult.success) {
      // Đồng bộ giỏ hàng từ localStorage
      const localCartItems = JSON.parse(localStorage.getItem('viettrad_cart') || '[]');
      
      if (localCartItems.length > 0) {
        await cartService.syncCart(localCartItems);
        localStorage.removeItem('viettrad_cart'); // Xóa local cart
      }
    }
  } catch (error) {
    console.error('Login error:', error);
  }
};
```

## Notes

1. **Authentication**: Tất cả endpoints đều cần authentication
2. **Validation**: Input được validate nghiêm ngặt 
3. **Stock Management**: Luôn kiểm tra tồn kho trước khi thêm/cập nhật
4. **Sync Strategy**: Đồng bộ localStorage với server khi login
5. **Error Handling**: Implement fallback cho trường hợp offline
6. **Performance**: Sử dụng summary endpoint cho header updates
7. **Security**: Input được sanitize để tránh injection attacks 