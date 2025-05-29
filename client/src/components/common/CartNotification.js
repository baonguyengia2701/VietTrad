import React, { useState, useEffect } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';
import './CartNotification.scss';

const CartNotification = ({ show, type, message, onHide, duration = 3000, product, quantity }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      if (type !== 'loading') {
        const timer = setTimeout(() => {
          setIsVisible(false);
          setTimeout(() => {
            onHide();
          }, 300); // Wait for fade out animation
        }, duration);

        return () => clearTimeout(timer);
      }
    }
  }, [show, duration, onHide, type]);

  const formatPrice = (price) => {
    return price.toLocaleString('vi-VN');
  };

  const getDiscountedPrice = (price, discount) => {
    if (discount > 0) {
      return price * (1 - discount / 100);
    }
    return price;
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <div className="notification-icon success">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" fill="currentColor"/>
            </svg>
          </div>
        );
      case 'error':
        return (
          <div className="notification-icon error">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" fill="currentColor"/>
            </svg>
          </div>
        );
      case 'loading':
        return (
          <div className="notification-icon loading">
            <div className="spinner-border spinner-border-sm" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'success':
        return product ? 'Đã thêm vào giỏ hàng!' : 'Thành công';
      case 'error':
        return 'Lỗi';
      case 'loading':
        return 'Đang xử lý';
      default:
        return 'Thông báo';
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onHide();
    }, 300);
  };

  if (!show) return null;

  return (
    <ToastContainer position="top-end" className="cart-notification-container">
      <Toast 
        show={isVisible} 
        onClose={handleClose}
        className={`cart-notification ${type}`}
        autohide={false}
      >
        <Toast.Header>
          {getIcon()}
          <strong className="notification-title">{getTitle()}</strong>
          {type !== 'loading' && (
            <button 
              type="button" 
              className="btn-close" 
              onClick={handleClose}
              aria-label="Close"
            ></button>
          )}
        </Toast.Header>
        <Toast.Body>
          {product ? (
            <div className="product-notification">
              <div className="product-image">
                <img src={product.image || product.images?.[0]} alt={product.name} />
              </div>
              <div className="product-details">
                <h5 className="product-name">{product.name}</h5>
                <p className="product-brand">{product.brandName || product.brand}</p>
                <div className="product-price">
                  <span className="current-price">
                    {formatPrice(getDiscountedPrice(product.price, product.discount || 0))}đ
                  </span>
                  {product.discount > 0 && (
                    <span className="original-price">
                      {formatPrice(product.price)}đ
                    </span>
                  )}
                </div>
                {quantity && <p className="quantity">Số lượng: {quantity}</p>}
              </div>
            </div>
          ) : (
            <div className="message-notification">
              {message}
            </div>
          )}
        </Toast.Body>
      </Toast>
    </ToastContainer>
  );
};

// Hook để sử dụng CartNotification dễ dàng hơn
export const useCartNotification = () => {
  const [notification, setNotification] = useState({
    show: false,
    type: 'success',
    message: '',
    product: null,
    quantity: null
  });

  const showNotification = (type, message, product = null, quantity = null, duration = 3000) => {
    setNotification({
      show: true,
      type,
      message,
      product,
      quantity,
      duration
    });
  };

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, show: false }));
  };

  const showSuccess = (message, product = null, quantity = null) => {
    showNotification('success', message, product, quantity);
  };

  const showError = (message) => {
    showNotification('error', message, null, null, 4000);
  };

  const showLoading = (message) => {
    showNotification('loading', message, null, null, 0);
  };

  return {
    notification,
    showSuccess,
    showError,
    showLoading,
    hideNotification,
    NotificationComponent: () => (
      <CartNotification
        show={notification.show}
        type={notification.type}
        message={notification.message}
        product={notification.product}
        quantity={notification.quantity}
        onHide={hideNotification}
        duration={notification.duration}
      />
    )
  };
};

export default CartNotification; 