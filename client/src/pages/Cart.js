import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Spinner, Alert } from 'react-bootstrap';
import { useCart } from '../contexts/CartContext';
import './Cart.scss';

const Cart = () => {
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

  const [deliveryOption, setDeliveryOption] = useState('standard');
  const [selectedDate, setSelectedDate] = useState('today');
  const [selectedTime, setSelectedTime] = useState('');
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
      // Error sẽ được hiển thị qua error state từ context
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

  const freeShippingThreshold = 2815000;
  const currentTotal = getTotalPrice();
  const needMoreForFreeShipping = Math.max(0, freeShippingThreshold - currentTotal);
  const freeShippingProgress = Math.min(100, (currentTotal / freeShippingThreshold) * 100);

  const timeSlots = [
    '08:00 - 09:00', '09:00 - 10:00', '10:00 - 11:00', '11:00 - 12:00',
    '12:00 - 13:00', '13:00 - 14:00', '14:00 - 15:00', '15:00 - 16:00',
    '16:00 - 17:00', '17:00 - 18:00'
  ];

  // Loading state cho lần đầu load cart
  if (loading && items.length === 0) {
    return (
      <div className="cart-page loading">
        <Container>
          <div className="loading-content">
            <Spinner animation="border" role="status" variant="primary">
              <span className="visually-hidden">Đang tải giỏ hàng...</span>
            </Spinner>
            <p>Đang tải giỏ hàng...</p>
          </div>
        </Container>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="cart-page empty">
        <Container>
          {/* Error Alert */}
          {error && (
            <Alert variant="danger" dismissible onClose={clearError} className="mb-4">
              {error}
            </Alert>
          )}
          
          <div className="empty-cart-content">
            <div className="empty-cart-icon">
              <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
                <path d="M40 50H80L74 90H46L40 50Z" stroke="#ccc" strokeWidth="3" fill="none"/>
                <path d="M40 50L36 30H20" stroke="#ccc" strokeWidth="3"/>
                <circle cx="50" cy="100" r="6" stroke="#ccc" strokeWidth="3" fill="none"/>
                <circle cx="70" cy="100" r="6" stroke="#ccc" strokeWidth="3" fill="none"/>
              </svg>
            </div>
            <h2>Giỏ hàng của bạn đang trống</h2>
            <p>Hãy khám phá các sản phẩm thủ công truyền thống tuyệt vời của chúng tôi!</p>
            <Link to="/products" className="continue-shopping-btn">
              Tiếp tục mua sắm
            </Link>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <Container>
        {/* Error Alert */}
        {error && (
          <Alert variant="danger" dismissible onClose={clearError} className="mb-4">
            {error}
          </Alert>
        )}

        {/* Loading Overlay */}
        {loading && (
          <div className="loading-overlay">
            <Spinner animation="border" role="status" variant="primary" />
          </div>
        )}

        {/* Breadcrumb */}
        <div className="breadcrumb">
          <Link to="/">Trang chủ</Link>
          <span className="separator">/</span>
          <span>Giỏ hàng của bạn</span>
        </div>

        <div className="page-header">
          <h1>Giỏ hàng của bạn</h1>
          <p className="items-summary">
            Bạn đang có <strong>{getTotalItems()} sản phẩm</strong> trong giỏ hàng
          </p>
        </div>

        <Row className="cart-main-row">
          <Col lg={7} md={7} className="cart-left-col">
            <div className="cart-content">
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

              {/* Cart Items */}
              <div className="cart-items">
                {items.map((item) => (
                  <div key={item.id} className={`cart-item ${operationLoading[item.id] ? 'updating' : ''}`}>
                    <div className="item-image">
                      <img src={item.image} alt={item.name} />
                    </div>
                    
                    <div className="item-info">
                      <h3 className="item-name">{item.name}</h3>
                      <p className="item-brand">{item.brand}</p>
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
                    </div>
                    
                    <div className="item-actions">
                      <div className="quantity-controls">
                        <button 
                          className="qty-btn minus"
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
                          className="qty-btn plus"
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
                      
                      <button 
                        className="remove-item"
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={operationLoading[`remove_${item.id}`]}
                      >
                        {operationLoading[`remove_${item.id}`] ? (
                          <Spinner animation="border" size="sm" />
                        ) : (
                          <svg width="20" height="20" viewBox="0 0 20 20">
                            <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="2"/>
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Col>

          <Col lg={5} md={5} className="cart-right-col">
            <div className="order-summary">
              <h2>Thông tin đơn hàng</h2>
              
              {/* Delivery Options */}
              <div className="delivery-section">
                <h3>Thời gian giao hàng</h3>
                
                <div className="delivery-options">
                  <div className="delivery-option">
                    <input 
                      type="radio" 
                      id="standard" 
                      name="delivery" 
                      value="standard"
                      checked={deliveryOption === 'standard'}
                      onChange={(e) => setDeliveryOption(e.target.value)}
                    />
                    <label htmlFor="standard">
                      <strong>Giao khi có hàng</strong>
                      <span>Chọn thời gian</span>
                    </label>
                  </div>
                  
                  <div className="delivery-option">
                    <input 
                      type="radio" 
                      id="scheduled" 
                      name="delivery" 
                      value="scheduled"
                      checked={deliveryOption === 'scheduled'}
                      onChange={(e) => setDeliveryOption(e.target.value)}
                    />
                    <label htmlFor="scheduled">
                      <strong>Chọn thời gian giao</strong>
                      <span>Đặt lịch giao hàng</span>
                    </label>
                  </div>
                </div>

                {deliveryOption === 'scheduled' && (
                  <div className="schedule-delivery">
                    <div className="date-selection">
                      <label>Ngày giao:</label>
                      <select 
                        value={selectedDate} 
                        onChange={(e) => setSelectedDate(e.target.value)}
                      >
                        <option value="today">Hôm nay</option>
                        <option value="tomorrow">Ngày mai</option>
                        <option value="day-after">Ngày kia</option>
                      </select>
                    </div>
                    
                    <div className="time-selection">
                      <label>Thời gian giao:</label>
                      <select 
                        value={selectedTime} 
                        onChange={(e) => setSelectedTime(e.target.value)}
                      >
                        <option value="">Chọn thời gian</option>
                        {timeSlots.map((slot, index) => (
                          <option key={index} value={slot}>{slot}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="summary-details">
                <div className="summary-row">
                  <span>Tổng tiền:</span>
                  <span>{formatPrice(getOriginalTotalPrice())}đ</span>
                </div>
                
                {getTotalDiscount() > 0 && (
                  <div className="summary-row discount">
                    <span>Tiết kiệm:</span>
                    <span>-{formatPrice(getTotalDiscount())}đ</span>
                  </div>
                )}
                
                <div className="summary-row total">
                  <span>Thành tiền:</span>
                  <span className="total-price">{formatPrice(currentTotal)}đ</span>
                </div>
              </div>
              
              <div className="checkout-section">
                <Button 
                  className="checkout-btn" 
                  size="lg"
                  disabled={currentTotal < 100000 || loading}
                  onClick={() => navigate('/checkout')}
                >
                  {loading ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Đang xử lý...
                    </>
                  ) : (
                    'THANH TOÁN'
                  )}
                </Button>
                
                <div className={`payment-methods ${currentTotal < 100000 ? 'minimum-warning' : ''}`}>
                  {currentTotal < 100000 ? (
                    <p className="minimum-order">
                      Giỏ hàng của bạn hiện chưa đạt mức tối thiểu để thanh toán.
                    </p>
                  ) : (
                    <p>Phí vận chuyển sẽ được tính ở trang thanh toán.</p>
                  )}
                </div>
              </div>
              
              <div className="promotions">
                <h3>Chính sách mua hàng</h3>
                <div className="promo-item">
                  <p>• Hiện chúng tôi chỉ áp dụng thanh toán với đơn hàng có giá trị tối thiểu <strong>100.000đ</strong> trở lên.</p>
                  <p>• Phí vận chuyển sẽ được tính ở trang thanh toán.</p>
                  <p>• Bạn cũng có thể nhận mã giảm giá ở trang thanh toán.</p>
                </div>
              </div>
            </div>
          </Col>
        </Row>

        {/* Continue Shopping */}
        <div className="continue-shopping-section">
          <Link to="/products" className="continue-shopping-link">
            ← Tiếp tục mua sắm
          </Link>
        </div>
      </Container>
    </div>
  );
};

export default Cart; 