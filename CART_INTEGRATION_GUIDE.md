# VietTrad Cart API - Hướng dẫn tích hợp Frontend

## 🎯 Tổng quan

Tài liệu này hướng dẫn cách tích hợp Cart API vào các components React của VietTrad. Hệ thống đã được cập nhật để:

- ✅ Đồng bộ dữ liệu giữa localStorage và server
- ✅ Hỗ trợ authentication tự động
- ✅ Loading states và error handling
- ✅ Toast notifications cho user feedback
- ✅ Fallback offline cho user chưa login

## 📁 Files đã được cập nhật

### 1. Core Context & Services
- `client/src/contexts/CartContext.js` - Cart state management với API integration
- `client/src/services/cartService.js` - Cart API service functions

### 2. UI Components
- `client/src/pages/Cart.js` - Cart page với loading/error states
- `client/src/components/common/CartSidebar.js` - Cart sidebar với API support
- `client/src/components/common/CartNotification.js` - Toast notifications

### 3. Styling
- `client/src/pages/Cart.scss` - Cart page styles với loading animations
- `client/src/components/common/CartSidebar.scss` - Sidebar styles với loading states
- `client/src/components/common/CartNotification.scss` - Toast notification styles

## 🚀 Cách sử dụng

### 1. Trong ProductDetail Component

```javascript
import React, { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { useCartNotification } from '../components/common/CartNotification';

const ProductDetail = ({ product }) => {
  const { addToCart, loading } = useCart();
  const { showSuccess, showError, NotificationComponent } = useCartNotification();
  
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async () => {
    try {
      setIsAdding(true);
      
      const result = await addToCart(product, quantity, selectedVariant);
      
      // Hiển thị thông báo thành công với product info
      showSuccess('', product, quantity);
      
    } catch (error) {
      // Hiển thị thông báo lỗi
      showError(error.message || 'Không thể thêm sản phẩm vào giỏ hàng');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="product-detail">
      {/* Product info */}
      
      <button 
        onClick={handleAddToCart}
        disabled={isAdding || loading}
        className="add-to-cart-btn"
      >
        {isAdding ? (
          <>
            <Spinner size="sm" className="me-2" />
            Đang thêm...
          </>
        ) : (
          'Thêm vào giỏ hàng'
        )}
      </button>

      {/* Toast notifications */}
      <NotificationComponent />
    </div>
  );
};
```

### 2. Trong Header Component (Cart Badge)

```javascript
import React, { useEffect, useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { cartService } from '../services/cartService';
import { useAuth } from '../contexts/AuthContext';

const Header = () => {
  const { getTotalItems, items } = useCart();
  const { currentUser } = useAuth();
  const [cartSummary, setCartSummary] = useState(null);

  // Lấy cart summary cho user đã login
  useEffect(() => {
    const fetchCartSummary = async () => {
      if (currentUser) {
        try {
          const result = await cartService.getCartSummary();
          if (result.success) {
            setCartSummary(result.data);
          }
        } catch (error) {
          console.error('Error fetching cart summary:', error);
        }
      }
    };

    fetchCartSummary();
  }, [currentUser]);

  const totalItems = currentUser ? cartSummary?.totalItems || 0 : getTotalItems();

  return (
    <header>
      <div className="cart-badge">
        <ShoppingCartIcon />
        {totalItems > 0 && (
          <span className="badge">{totalItems}</span>
        )}
      </div>
    </header>
  );
};
```

### 3. Sync khi User Login

```javascript
// Trong AuthContext hoặc Login component
import { useCart } from '../contexts/CartContext';

const LoginComponent = () => {
  const { login } = useAuth();
  const { refreshCart } = useCart();

  const handleLogin = async (credentials) => {
    try {
      await login(credentials);
      
      // Cart sẽ tự động sync thông qua useEffect trong CartContext
      // nhưng có thể manually trigger nếu cần:
      // await refreshCart();
      
    } catch (error) {
      console.error('Login error:', error);
    }
  };
};
```

### 4. Sử dụng trong Cart Page

Cart page đã được cập nhật tự động với:
- Loading spinners khi cập nhật quantity
- Error alerts
- Disabled states khi processing
- Loading overlay khi fetch data

```javascript
// Cart.js đã được cập nhật - không cần thay đổi gì thêm
// Tự động handle tất cả loading/error states
```

### 5. Sử dụng CartSidebar

```javascript
import React, { useState } from 'react';
import CartSidebar from '../components/common/CartSidebar';

const Layout = ({ children }) => {
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <div className="layout">
      <Header onCartClick={() => setIsCartOpen(true)} />
      
      <main>{children}</main>
      
      <CartSidebar 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
      />
    </div>
  );
};
```

## 🔄 Sync Strategy

### Khi user chưa login:
- Tất cả cart operations sử dụng localStorage
- UI hoạt động bình thường như cũ

### Khi user login:
1. CartContext tự động detect user state change
2. Sync localStorage cart lên server via API
3. Xóa localStorage cart sau khi sync thành công
4. Tất cả operations chuyển sang sử dụng API

### Khi user logout:
1. Cart context chuyển về localStorage mode
2. Load cart từ localStorage (nếu có)

## 💡 Advanced Usage

### 1. Custom Error Handling

```javascript
import { useCart } from '../contexts/CartContext';

const MyComponent = () => {
  const { error, clearError, addToCart } = useCart();

  useEffect(() => {
    if (error) {
      // Handle error theo cách riêng
      console.error('Cart error:', error);
      
      // Có thể show modal thay vì alert
      showErrorModal(error);
      
      // Clear error sau khi handle
      clearError();
    }
  }, [error, clearError]);

  // ...
};
```

### 2. Loading States

```javascript
const { loading, items } = useCart();

return (
  <div className="my-cart-component">
    {loading && <LoadingSpinner />}
    
    <div className={`cart-content ${loading ? 'disabled' : ''}`}>
      {/* Cart content */}
    </div>
  </div>
);
```

### 3. Optimistic Updates

```javascript
const handleQuickAdd = async (product) => {
  // Optimistic update (chỉ với localStorage)
  if (!currentUser) {
    addToCart(product); // Sync function
    return;
  }

  // Server-side update với loading state
  try {
    await addToCart(product); // Async function
  } catch (error) {
    // Handle error
  }
};
```

## 🛠️ Troubleshooting

### 1. Cart không sync sau khi login

**Nguyên nhân:** Token authentication issue
**Giải pháp:**
```javascript
// Kiểm tra localStorage
const userInfo = localStorage.getItem('userInfo');
console.log('User token:', JSON.parse(userInfo)?.accessToken);

// Manually refresh cart
const { refreshCart } = useCart();
await refreshCart();
```

### 2. Loading states không hiển thị

**Nguyên nhân:** Async operations không được await
**Giải pháp:**
```javascript
// Sai
const handleClick = () => {
  addToCart(product); // Không await
};

// Đúng
const handleClick = async () => {
  await addToCart(product); // Có await
};
```

### 3. Toast notifications không hiển thị

**Nguyên nhân:** NotificationComponent không được render
**Giải pháp:**
```javascript
const MyComponent = () => {
  const { NotificationComponent } = useCartNotification();
  
  return (
    <div>
      {/* Component content */}
      
      {/* Render notification component */}
      <NotificationComponent />
    </div>
  );
};
```

## 📱 Responsive Behavior

- **Desktop:** Toast notifications ở góc phải trên
- **Tablet:** Sidebar cart full width
- **Mobile:** Toast notifications full width, sidebar over entire screen

## 🔐 Security Features

- Tất cả API calls đều có JWT authentication
- Input validation trên cả client và server
- Rate limiting tự động qua interceptors
- Sanitization để tránh XSS attacks

## ⚡ Performance Tips

1. **Debounce quantity updates:**
```javascript
const debouncedUpdate = useMemo(
  () => debounce(updateQuantity, 500),
  [updateQuantity]
);
```

2. **Optimize re-renders:**
```javascript
const cartItems = useMemo(() => items, [items]);
```

3. **Use cart summary for headers:**
```javascript
// Thay vì gọi full cart
const { data } = useSWR('/cart/summary', cartService.getCartSummary);
```

## 🧪 Testing

### 1. Test scenarios:
- [ ] Add product khi chưa login
- [ ] Add product khi đã login  
- [ ] Sync cart sau khi login
- [ ] Update quantity với API
- [ ] Remove items với loading states
- [ ] Error handling khi API fails
- [ ] Offline mode fallback

### 2. Manual testing:
```bash
# Start development server
cd server && npm run dev

# In another terminal
cd client && npm start

# Test với/không JWT token trong localStorage
```

## 🚀 Deployment Notes

1. **Environment variables:**
```bash
# Server
MONGODB_URI=your_mongo_connection
JWT_SECRET=your_jwt_secret
```

2. **Build và deploy:**
```bash
# Build client
cd client && npm run build

# Deploy server với cart routes
cd server && npm start
```

---

## ✅ Checklist Implementation

- [x] ✅ CartContext với API integration
- [x] ✅ Loading states và error handling  
- [x] ✅ Toast notifications system
- [x] ✅ Sync localStorage ↔ Server
- [x] ✅ Responsive design
- [x] ✅ Authentication integration
- [x] ✅ Fallback offline support
- [x] ✅ Comprehensive documentation

**🎉 Cart API integration hoàn tất! Hệ thống sẵn sàng cho production.** 