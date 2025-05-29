import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { Spinner, Alert } from 'react-bootstrap';
import './CartSidebar.scss';

const CartSidebar = ({ isOpen, onClose }) => {
  const { 
    items, 
    loading,
    error,
    removeFromCart, 
    updateQuantity, 
    getTotalItems, 
    getTotalPrice,
    getTotalDiscount,
    getOriginalTotalPrice,
    clearError
  } = useCart();

  const navigate = useNavigate();
  const [operationLoading, setOperationLoading] = useState({});

  const formatPrice = (price) => {
    return price.toLocaleString('vi-VN');
  };

  const getDiscountedPrice = (price, discount) => {
    if (discount > 0) {
      return price * (1 - discount / 100);
    }
    return price;
  };

  const handleQuantityChange = async (itemId, newQuantity) => {
    try {
      setOperationLoading(prev => ({ ...prev, [itemId]: true }));
      
      if (newQuantity <= 0) {
        await removeFromCart(itemId);
      } else {
        await updateQuantity(itemId, newQuantity);
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
    } finally {
      setOperationLoading(prev => ({ ...prev, [itemId]: false }));
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      setOperationLoading(prev => ({ ...prev, [`remove_${itemId}`]: true }));
      await removeFromCart(itemId);
    } catch (error) {
      console.error('Error removing item:', error);
    } finally {
      setOperationLoading(prev => ({ ...prev, [`remove_${itemId}`]: false }));
    }
  };

  const handleCheckout = () => {
    onClose(); // Close the sidebar first
    navigate('/checkout'); // Navigate to checkout page
  };

  const freeShippingThreshold = 2815000; // Mức miễn phí vận chuyển
  const currentTotal = getTotalPrice();
  const needMoreForFreeShipping = Math.max(0, freeShippingThreshold - currentTotal);
  const freeShippingProgress = Math.min(100, (currentTotal / freeShippingThreshold) * 100);

  return (
    <>
      {isOpen && <div className="cart-sidebar-overlay" onClick={onClose} />}
      <div className={`cart-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="cart-sidebar-header">
          <h3>Giỏ hàng của bạn</h3>
          <button className="close-btn" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 20 20">
              <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </button>
        </div>

        <div className="cart-sidebar-content">
          {/* Error Alert */}
          {error && (
            <Alert variant="danger" dismissible onClose={clearError} className="mb-3">
              <small>{error}</small>
            </Alert>
          )}

          {/* Loading state for initial load */}
          {loading && items.length === 0 ? (
            <div className="loading-state">
              <Spinner animation="border" size="sm" />
              <p>Đang tải giỏ hàng...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="empty-cart">
              <div className="empty-cart-icon">
                <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
                  <path d="M20 25H40L37 45H23L20 25Z" stroke="#ccc" strokeWidth="2" fill="none"/>
                  <path d="M20 25L18 15H10" stroke="#ccc" strokeWidth="2"/>
                  <circle cx="25" cy="50" r="3" stroke="#ccc" strokeWidth="2" fill="none"/>
                  <circle cx="35" cy="50" r="3" stroke="#ccc" strokeWidth="2" fill="none"/>
                </svg>
              </div>
              <p>Giỏ hàng của bạn đang trống</p>
              <Link to="/products" className="continue-shopping" onClick={onClose}>
                Tiếp tục mua sắm
              </Link>
            </div>
          ) : (
            <>
              {/* Loading overlay */}
              {loading && (
                <div className="sidebar-loading-overlay">
                  <Spinner animation="border" size="sm" />
                </div>
              )}

              {/* Free shipping progress */}
              <div className="free-shipping-section">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${freeShippingProgress}%` }}
                  />
                </div>
                {needMoreForFreeShipping > 0 ? (
                  <p className="shipping-text">
                    Bạn cần mua thêm <strong>{formatPrice(needMoreForFreeShipping)}đ</strong> để được MIỄN PHÍ VẬN CHUYỂN
                  </p>
                ) : (
                  <p className="shipping-text free">
                    🎉 Bạn được MIỄN PHÍ VẬN CHUYỂN
                  </p>
                )}
              </div>

              {/* Cart items */}
              <div className="cart-items">
                <p className="items-count">
                  Bạn đang có <strong>{getTotalItems()} sản phẩm</strong> trong giỏ hàng
                </p>
                
                {items.map((item) => (
                  <div key={item.id} className={`cart-item ${operationLoading[item.id] ? 'updating' : ''}`}>
                    <div className="item-image">
                      <img src={item.image} alt={item.name} />
                    </div>
                    
                    <div className="item-details">
                      <h4 className="item-name">{item.name}</h4>
                      {item.selectedVariant && (
                        <p className="item-variant">
                          {item.selectedVariant.title} • {item.selectedVariant.size}
                        </p>
                      )}
                      
                      <div className="item-price">
                        <span className="current-price">
                          {formatPrice(getDiscountedPrice(item.price, item.discount))}đ
                        </span>
                        {item.discount > 0 && (
                          <span className="original-price">
                            {formatPrice(item.price)}đ
                          </span>
                        )}
                      </div>
                      
                      <div className="quantity-controls">
                        <button 
                          className="qty-btn"
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          disabled={operationLoading[item.id]}
                        >
                          {operationLoading[item.id] ? (
                            <Spinner animation="border" size="sm" />
                          ) : (
                            '−'
                          )}
                        </button>
                        <span className="quantity">{item.quantity}</span>
                        <button 
                          className="qty-btn"
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          disabled={operationLoading[item.id]}
                        >
                          {operationLoading[item.id] ? (
                            <Spinner animation="border" size="sm" />
                          ) : (
                            '+'
                          )}
                        </button>
                      </div>
                      
                      <div className="item-total">
                        {formatPrice(getDiscountedPrice(item.price, item.discount) * item.quantity)}đ
                      </div>
                    </div>
                    
                    <button 
                      className="remove-item"
                      onClick={() => handleRemoveItem(item.id)}
                      disabled={operationLoading[`remove_${item.id}`]}
                    >
                      {operationLoading[`remove_${item.id}`] ? (
                        <Spinner animation="border" size="sm" />
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 16 16">
                          <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                      )}
                    </button>
                  </div>
                ))}
              </div>

              {/* Cart summary */}
              <div className="cart-summary">
                <h3>Thông tin đơn hàng</h3>
                
                {getTotalDiscount() > 0 && (
                  <div className="summary-row">
                    <span>Tổng tiền:</span>
                    <span>{formatPrice(getOriginalTotalPrice())}đ</span>
                  </div>
                )}
                
                {getTotalDiscount() > 0 && (
                  <div className="summary-row discount">
                    <span>Tiết kiệm:</span>
                    <span>-{formatPrice(getTotalDiscount())}đ</span>
                  </div>
                )}
                
                <div className="summary-row total">
                  <span>Tổng tiền:</span>
                  <span className="total-price">{formatPrice(currentTotal)}đ</span>
                </div>
                
                <div className="cart-actions">
                  <Link 
                    to="/cart" 
                    className="view-cart-btn"
                    onClick={onClose}
                  >
                    Xem giỏ hàng
                  </Link>
                  <button 
                    className="checkout-btn"
                    disabled={currentTotal < 100000 || loading}
                    onClick={handleCheckout}
                  >
                    {loading ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-1" />
                        Đang xử lý...
                      </>
                    ) : (
                      'THANH TOÁN'
                    )}
                  </button>
                </div>
                
                <p className="payment-note">
                  {currentTotal < 100000 
                    ? "Giỏ hàng của bạn hiện chưa đạt mức tối thiểu để thanh toán."
                    : "Phí vận chuyển sẽ được tính ở trang thanh toán. Bạn cũng có thể nhận mã giảm giá ở trang thanh toán."
                  }
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default CartSidebar; 