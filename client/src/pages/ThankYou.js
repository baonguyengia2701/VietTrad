import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import './ThankYou.scss';

const ThankYou = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get order data from navigation state
    if (location.state?.orderData) {
      setOrderData(location.state.orderData);
      setLoading(false);
    } else {
      // If no order data, redirect to home after a short delay
      const timer = setTimeout(() => {
        navigate('/', { replace: true });
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [location.state, navigate]);

  const formatPrice = (price) => {
    return price?.toLocaleString('vi-VN') || '0';
  };

  const copyOrderNumber = () => {
    if (orderData?.orderNumber) {
      navigator.clipboard.writeText(orderData.orderNumber);
      // You could add a toast notification here
      alert('Đã sao chép mã đơn hàng!');
    }
  };

  if (loading) {
    return (
      <div className="thank-you-page">
        <Container>
          <div className="text-center" style={{ padding: '100px 0' }}>
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Đang tải thông tin đơn hàng...</p>
          </div>
        </Container>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="thank-you-page">
        <Container>
          <div className="text-center" style={{ padding: '100px 0' }}>
            <h3>Không tìm thấy thông tin đơn hàng</h3>
            <p>Đang chuyển hướng về trang chủ...</p>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="thank-you-page">
      <Container fluid className="thank-you-container">
        <div className="content-wrapper">
          {/* Success Header */}
          <div className="success-header">
            <div className="success-icon">
              <div className="checkmark-circle">
                <svg viewBox="0 0 52 52" className="checkmark">
                  <circle className="checkmark-circle-bg" cx="26" cy="26" r="25" fill="none"/>
                  <path className="checkmark-check" fill="none" d="m14.1 27.2l7.1 7.2 16.7-16.8"/>
                </svg>
              </div>
            </div>
            
            <h1 className="success-title">Đặt hàng thành công</h1>
            <p className="success-subtitle">
              Mã đơn hàng <strong onClick={copyOrderNumber} style={{ cursor: 'pointer' }} title="Click để sao chép">
                {orderData.orderNumber}
              </strong>
            </p>
            <p className="success-message">
              Cảm ơn bạn đã mua hàng!
            </p>
          </div>

          <div className="main-content-row">
            {/* Order Information */}
            <div className="info-card-container">
              <Card className="info-card">
                <Card.Header>
                  <h5 className="mb-0">📦 Thông tin đơn hàng</h5>
                </Card.Header>
                <Card.Body>
                  <div className="info-section">
                    <h6>Thông tin giao hàng</h6>
                    <div className="info-item">
                      <span className="label">Người nhận:</span>
                      <span className="value">{orderData.shippingInfo?.fullName}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Số điện thoại:</span>
                      <span className="value">{orderData.shippingInfo?.phone}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Địa chỉ:</span>
                      <span className="value">
                        {orderData.shippingInfo?.address}, {orderData.shippingInfo?.ward}, {orderData.shippingInfo?.district}, {orderData.shippingInfo?.city}
                      </span>
                    </div>
                  </div>

                  <div className="info-section">
                    <h6>Phương thức thanh toán</h6>
                    <div className="payment-method">
                      {orderData.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng (COD)' : 'Chuyển khoản ngân hàng'}
                    </div>
                  </div>

                  <div className="info-section">
                    <h6>Phương thức vận chuyển</h6>
                    <div className="payment-method">
                      {orderData.shippingMethod === 'standard' ? 'Giao hàng tiêu chuẩn (2-3 ngày)' : 'Giao hàng nhanh (1-2 ngày)'}
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="summary-card-container">
              <Card className="summary-card">
                <Card.Header>
                  <h5 className="mb-0">🛒 Chi tiết đơn hàng</h5>
                </Card.Header>
                <Card.Body>
                  {/* Product List */}
                  <div className="product-list">
                    {orderData.items?.map((item, index) => (
                      <div key={index} className="product-item">
                        <div className="product-image">
                          <img src={item.image} alt={item.name} />
                          <span className="quantity-badge">{item.quantity}</span>
                        </div>
                        <div className="product-details">
                          <h6 className="product-name">{item.name}</h6>
                          <p className="product-variant">
                            {item.selectedVariant?.title} • {item.selectedVariant?.size}
                          </p>
                          <p className="product-category">{item.brand}</p>
                        </div>
                        <div className="product-price">
                          {formatPrice(item.price * item.quantity)}đ
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Price Summary */}
                  <div className="price-summary">
                    <div className="price-row">
                      <span>Tạm tính</span>
                      <span>{formatPrice(orderData.originalTotalPrice)}đ</span>
                    </div>
                    
                    {orderData.totalDiscount > 0 && (
                      <div className="price-row discount">
                        <span>Giảm giá</span>
                        <span>-{formatPrice(orderData.totalDiscount)}đ</span>
                      </div>
                    )}
                    
                    <div className="price-row">
                      <span>Phí vận chuyển</span>
                      <span>
                        {orderData.shippingFee === 0 ? (
                          <span className="free-shipping">Miễn phí</span>
                        ) : (
                          `${formatPrice(orderData.shippingFee)}đ`
                        )}
                      </span>
                    </div>
                    
                    {orderData.appliedVoucher && orderData.voucherDiscount > 0 && (
                      <div className="price-row discount">
                        <span>Mã giảm giá ({orderData.appliedVoucher.code})</span>
                        <span>-{formatPrice(orderData.voucherDiscount)}đ</span>
                      </div>
                    )}
                    
                    <div className="price-row total">
                      <span>Tổng cộng</span>
                      <span className="total-amount">
                        <small>VND</small> {formatPrice(orderData.finalTotal)}đ
                      </span>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </div>
          </div>

          {/* Next Steps */}
          <Card className="next-steps-card">
            <Card.Body>
              <h5 className="mb-3">⏰ Các bước tiếp theo</h5>
              <Row>
                <Col md={4} className="text-center mb-3">
                  <div className="step-icon step-1">1</div>
                  <h6>Xác nhận đơn hàng</h6>
                  <p>Chúng tôi sẽ liên hệ xác nhận đơn hàng trong 30 phút</p>
                </Col>
                <Col md={4} className="text-center mb-3">
                  <div className="step-icon step-2">2</div>
                  <h6>Đóng gói & Giao hàng</h6>
                  <p>Đơn hàng sẽ được đóng gói và giao trong 1-3 ngày</p>
                </Col>
                <Col md={4} className="text-center mb-3">
                  <div className="step-icon step-3">3</div>
                  <h6>Cập nhật trạng thái</h6>
                  <p>Bạn sẽ nhận được email cập nhật trạng thái đơn hàng</p>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Support Section */}
          <div className="support-section">
            <p className="support-text">
              <span className="support-icon">❓</span>
              Cần hỗ trợ? <a href="tel:0331200203" className="support-link">Liên hệ chúng tôi</a>
            </p>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <Button 
              variant="primary" 
              size="lg" 
              className="continue-shopping-btn"
              onClick={() => navigate('/products')}
            >
              Tiếp tục mua hàng
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default ThankYou; 