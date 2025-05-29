import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Form } from 'react-bootstrap';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { orderService } from '../services/orderService';
import './Checkout.scss';

const Checkout = () => {
  const { items, getTotalPrice, getTotalDiscount, getOriginalTotalPrice, getTotalItems, clearCart } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Form states
  const [shippingInfo, setShippingInfo] = useState({
    fullName: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: '',
    address: '',
    city: '',
    district: '',
    ward: '',
    note: ''
  });

  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [useVoucherCode, setUseVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  // Cities data (simplified for demo)
  const cities = [
    'Hà Nội', 'TP.Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ',
    'An Giang', 'Bà Rịa - Vũng Tàu', 'Bắc Giang', 'Bắc Kạn', 'Bạc Liêu'
  ];

  const districts = {
    'Hà Nội': ['Ba Đình', 'Hoàn Kiếm', 'Tây Hồ', 'Long Biên', 'Cầu Giấy', 'Đống Đa', 'Hai Bà Trưng', 'Hoàng Mai'],
    'TP.Hồ Chí Minh': ['Quận 1', 'Quận 2', 'Quận 3', 'Quận 4', 'Quận 5', 'Quận 6', 'Quận 7', 'Quận 8'],
    'Đà Nẵng': ['Hải Châu', 'Thanh Khê', 'Sơn Trà', 'Ngũ Hành Sơn', 'Liên Chiểu', 'Cẩm Lệ']
  };

  const wards = {
    'Ba Đình': ['Phúc Xá', 'Trúc Bạch', 'Vĩnh Phúc', 'Cống Vị', 'Liễu Giai'],
    'Hoàn Kiếm': ['Phúc Tân', 'Đồng Xuân', 'Hàng Mã', 'Hàng Buồm', 'Hàng Đào'],
    'Quận 1': ['Bến Nghé', 'Bến Thành', 'Đa Kao', 'Cô Giang', 'Nguyễn Thái Bình']
  };

  // Shipping fee calculation
  const getShippingFee = () => {
    const totalPrice = getTotalPrice();
    const freeShippingThreshold = 2815000;
    
    // Kiểm tra ngưỡng miễn phí vận chuyển trước
    if (totalPrice >= freeShippingThreshold) {
      return 0;
    }
    
    // Tính phí vận chuyển dựa trên phương thức
    if (shippingMethod === 'express') {
      return 50000;
    }
    
    // Standard shipping fee based on city
    const cityFees = {
      'Hà Nội': 30000,
      'TP.Hồ Chí Minh': 35000,
      'Đà Nẵng': 40000,
      'Hải Phòng': 45000,
      'Cần Thơ': 50000
    };
    
    return cityFees[shippingInfo.city] || 60000; // Default fee for other cities
  };

  // Voucher codes (demo data)
  const vouchers = {
    'WELCOME10': { discount: 10, minOrder: 500000, type: 'percentage', description: 'Giảm 10% cho đơn hàng từ 500K' },
    'SAVE50K': { discount: 50000, minOrder: 1000000, type: 'fixed', description: 'Giảm 50K cho đơn hàng từ 1 triệu' },
    'FREESHIP': { discount: 0, minOrder: 200000, type: 'freeship', description: 'Miễn phí vận chuyển cho đơn hàng từ 200K' }
  };

  const formatPrice = (price) => {
    return price.toLocaleString('vi-VN');
  };

  // Helper function to get discounted price for an item
  const getItemDiscountedPrice = (item) => {
    if (item.discount && item.discount > 0) {
      return Math.round(item.price * (1 - item.discount / 100));
    }
    return Math.round(item.price);
  };

  // Helper function to get item total (discounted price * quantity)
  const getItemTotal = (item) => {
    return Math.round(getItemDiscountedPrice(item) * item.quantity);
  };

  const handleInputChange = (field, value) => {
    setShippingInfo(prev => ({
      ...prev,
      [field]: value
    }));

    // Reset district and ward when city changes
    if (field === 'city') {
      setShippingInfo(prev => ({
        ...prev,
        district: '',
        ward: ''
      }));
    }

    // Reset ward when district changes
    if (field === 'district') {
      setShippingInfo(prev => ({
        ...prev,
        ward: ''
      }));
    }
  };

  const handleApplyVoucher = () => {
    const voucher = vouchers[useVoucherCode.toUpperCase()];
    const totalPrice = getTotalPrice();
    
    if (!voucher) {
      alert('Mã giảm giá không hợp lệ!');
      return;
    }
    
    if (totalPrice < voucher.minOrder) {
      alert(`Đơn hàng cần tối thiểu ${formatPrice(voucher.minOrder)}đ để sử dụng mã này!`);
      return;
    }
    
    // Kiểm tra voucher FREESHIP khi đã đủ điều kiện miễn phí
    if (voucher.type === 'freeship' && totalPrice >= 2815000) {
      alert('Đơn hàng của bạn đã được miễn phí vận chuyển!');
      return;
    }
    
    setAppliedVoucher({
      code: useVoucherCode.toUpperCase(),
      ...voucher
    });
    
    alert('Áp dụng mã giảm giá thành công!');
  };

  const getVoucherDiscount = () => {
    if (!appliedVoucher) return 0;
    
    const totalPrice = getTotalPrice();
    
    if (appliedVoucher.type === 'percentage') {
      return Math.round(Math.min(totalPrice * appliedVoucher.discount / 100, 200000)); // Max 200K discount
    } else if (appliedVoucher.type === 'fixed') {
      return Math.round(appliedVoucher.discount);
    }
    
    return 0;
  };

  const getShippingDiscount = () => {
    // Chỉ áp dụng voucher FREESHIP nếu chưa được miễn phí
    if (appliedVoucher && appliedVoucher.type === 'freeship') {
      const originalShippingFee = getOriginalShippingFee();
      return Math.round(originalShippingFee);
    }
    return 0;
  };

  // Hàm tính phí vận chuyển gốc (không tính ngưỡng miễn phí)
  const getOriginalShippingFee = () => {
    if (shippingMethod === 'express') {
      return 50000;
    }
    
    const cityFees = {
      'Hà Nội': 30000,
      'TP.Hồ Chí Minh': 35000,
      'Đà Nẵng': 40000,
      'Hải Phòng': 45000,
      'Cần Thơ': 50000
    };
    
    return cityFees[shippingInfo.city] || 60000;
  };

  const getFinalTotal = () => {
    // Tính toán từ giá gốc và trừ discount để nhất quán với UI
    const subtotal = getOriginalTotalPrice(); // Giá gốc
    const productDiscount = getTotalDiscount(); // Số tiền discount sản phẩm
    const shippingFee = getShippingFee();
    const voucherDiscount = getVoucherDiscount();
    const shippingDiscount = getShippingDiscount();
    
    // Tính toán: giá gốc - discount sản phẩm + phí ship - voucher discount
    const total = subtotal - productDiscount + shippingFee - voucherDiscount - shippingDiscount;
    return Math.max(0, Math.round(total));
  };

  const validateForm = () => {
    const required = ['fullName', 'email', 'phone', 'address', 'city', 'district', 'ward'];
    
    for (let field of required) {
      if (!shippingInfo[field].trim()) {
        alert(`Vui lòng nhập ${getFieldLabel(field)}`);
        return false;
      }
    }
    
    if (!agreeTerms) {
      alert('Vui lòng đồng ý với điều khoản và Điều kiện');
      return false;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(shippingInfo.email)) {
      alert('Email không hợp lệ');
      return false;
    }
    
    // Phone validation
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(shippingInfo.phone.replace(/\s/g, ''))) {
      alert('Số điện thoại không hợp lệ');
      return false;
    }
    
    return true;
  };

  const getFieldLabel = (field) => {
    const labels = {
      fullName: 'Họ và tên',
      email: 'Email',
      phone: 'Số điện thoại',
      address: 'Địa chỉ',
      city: 'Tỉnh/Thành phố',
      district: 'Quận/Huyện',
      ward: 'Phường/Xã'
    };
    return labels[field];
  };

  const handleSubmitOrder = async () => {
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      
      // Prepare order data for API
      const orderData = {
        orderItems: items.map(item => ({
          product: item.productId || item.product || item.id, // Handle different ID fields
          name: item.name,
          image: item.image,
          price: Math.round(item.price), // Giá gốc
          quantity: item.quantity,
          selectedVariant: item.selectedVariant || {}
        })),
        shippingInfo,
        paymentMethod,
        shippingMethod,
        itemsPrice: Math.round(getOriginalTotalPrice()), // Sử dụng giá gốc thay vì getTotalPrice()
        shippingPrice: Math.round(getShippingFee()),
        discountPrice: Math.round(getTotalDiscount()), // Số tiền discount
        voucherCode: appliedVoucher?.code || '',
        voucherDiscount: Math.round(getVoucherDiscount() + getShippingDiscount()),
        totalPrice: getFinalTotal()
      };
      
      // Create order via API
      const result = await orderService.createOrder(orderData);
      
      // Clear cart and navigate to thank you page
      await clearCart();
      
      // Prepare order data for thank you page
      const thankYouData = {
        orderNumber: result.data.orderNumber,
        items: items,
        totalItems: getTotalItems(),
        originalTotalPrice: getOriginalTotalPrice(),
        totalDiscount: getTotalDiscount(),
        shippingFee: getShippingFee(),
        finalTotal: getFinalTotal(),
        appliedVoucher: appliedVoucher,
        voucherDiscount: getVoucherDiscount(),
        shippingInfo: shippingInfo,
        paymentMethod: paymentMethod,
        shippingMethod: shippingMethod
      };
      
      // Navigate to thank you page with order data
      navigate('/thank-you', { 
        state: { orderData: thankYouData },
        replace: true 
      });
      
    } catch (error) {
      console.error('Order submission error:', error);
      alert(typeof error === 'string' ? error : 'Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  // Redirect if cart is empty or user not authenticated (but not when showing success modal)
  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart');
    } else if (!currentUser) {
      // Redirect to login if user is not authenticated
      navigate('/login');
    }
  }, [items, currentUser, navigate]);

  if (items.length === 0 || !currentUser) {
    return null;
  }

  return (
    <div className="checkout-page">
      <Container>
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <Link to="/">Trang chủ</Link>
          <span className="separator">/</span>
          <Link to="/cart">Giỏ hàng</Link>
          <span className="separator">/</span>
          <span>Thanh toán</span>
        </div>

        <div className="page-header">
          <h1>Thanh toán</h1>
        </div>

        <Row className="checkout-row">
          {/* Left Column - Forms */}
          <Col lg={8} md={7} className="checkout-left">
            {/* Shipping Information */}
            <div className="checkout-section">
              <h2>Thông tin giao hàng</h2>
              
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Họ và tên *</Form.Label>
                    <Form.Control
                      type="text"
                      value={shippingInfo.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      placeholder="Nhập họ và tên"
                    />
                  </Form.Group>
                </Col>
                
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Email *</Form.Label>
                    <Form.Control
                      type="email"
                      value={shippingInfo.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="Nhập email"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Số điện thoại *</Form.Label>
                    <Form.Control
                      type="tel"
                      value={shippingInfo.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="Nhập số điện thoại"
                    />
                  </Form.Group>
                </Col>
                
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Tỉnh/Thành phố *</Form.Label>
                    <Form.Select
                      value={shippingInfo.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                    >
                      <option value="">Chọn tỉnh/thành phố</option>
                      {cities.map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Quận/Huyện *</Form.Label>
                    <Form.Select
                      value={shippingInfo.district}
                      onChange={(e) => handleInputChange('district', e.target.value)}
                      disabled={!shippingInfo.city}
                    >
                      <option value="">Chọn quận/huyện</option>
                      {shippingInfo.city && districts[shippingInfo.city]?.map(district => (
                        <option key={district} value={district}>{district}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Phường/Xã *</Form.Label>
                    <Form.Select
                      value={shippingInfo.ward}
                      onChange={(e) => handleInputChange('ward', e.target.value)}
                      disabled={!shippingInfo.district}
                    >
                      <option value="">Chọn phường/xã</option>
                      {shippingInfo.district && wards[shippingInfo.district]?.map(ward => (
                        <option key={ward} value={ward}>{ward}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Địa chỉ cụ thể *</Form.Label>
                <Form.Control
                  type="text"
                  value={shippingInfo.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Số nhà, tên đường..."
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Ghi chú đơn hàng</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={shippingInfo.note}
                  onChange={(e) => handleInputChange('note', e.target.value)}
                  placeholder="Ghi chú cho đơn hàng (tùy chọn)"
                />
              </Form.Group>
            </div>

            {/* Shipping Method */}
            <div className="checkout-section">
              <h2>Phương thức vận chuyển</h2>
              
              <div className="shipping-options">
                <div className="shipping-option">
                  <Form.Check
                    type="radio"
                    id="standard-shipping"
                    name="shipping"
                    value="standard"
                    checked={shippingMethod === 'standard'}
                    onChange={(e) => setShippingMethod(e.target.value)}
                  />
                  <label htmlFor="standard-shipping" className="shipping-label">
                    <div className="shipping-info">
                      <strong>Giao hàng tiêu chuẩn</strong>
                      <span className="shipping-desc">2-3 ngày làm việc</span>
                    </div>
                    <div className="shipping-fee">
                      {getShippingFee() === 0 ? 'Miễn phí' : `${formatPrice(getShippingFee())}đ`}
                    </div>
                  </label>
                </div>

                <div className="shipping-option">
                  <Form.Check
                    type="radio"
                    id="express-shipping"
                    name="shipping"
                    value="express"
                    checked={shippingMethod === 'express'}
                    onChange={(e) => setShippingMethod(e.target.value)}
                  />
                  <label htmlFor="express-shipping" className="shipping-label">
                    <div className="shipping-info">
                      <strong>Giao hàng nhanh</strong>
                      <span className="shipping-desc">1-2 ngày làm việc</span>
                    </div>
                    <div className="shipping-fee">
                      50,000đ
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="checkout-section">
              <h2>Phương thức thanh toán</h2>
              
              <div className="payment-options">
                <div className="payment-option">
                  <Form.Check
                    type="radio"
                    id="cod"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <label htmlFor="cod" className="payment-label">
                    <div className="payment-info">
                      <strong>Thanh toán khi nhận hàng (COD)</strong>
                      <span className="payment-desc">Thanh toán bằng tiền mặt khi nhận hàng</span>
                    </div>
                    <div className="payment-icon">💵</div>
                  </label>
                </div>

                <div className="payment-option">
                  <Form.Check
                    type="radio"
                    id="banking"
                    name="payment"
                    value="banking"
                    checked={paymentMethod === 'banking'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <label htmlFor="banking" className="payment-label">
                    <div className="payment-info">
                      <strong>Chuyển khoản ngân hàng</strong>
                      <span className="payment-desc">Chuyển khoản qua Internet Banking</span>
                    </div>
                    <div className="payment-icon">🏦</div>
                  </label>
                </div>

              </div>

              {paymentMethod === 'banking' && (
                <div className="banking-info">
                  <h4>Thông tin chuyển khoản</h4>
                  <div className="bank-details">
                    <p><strong>Ngân hàng:</strong> MBBank</p>
                    <p><strong>Số tài khoản:</strong> 0334133154</p>
                    <p><strong>Chủ tài khoản:</strong> Nguyễn Gia Bảo</p>
                    <p><strong>Nội dung:</strong> [Số điện thoại ] - [Họ tên]</p>
                  </div>
                </div>
              )}
            </div>

            {/* Voucher */}
            <div className="checkout-section">
              <h2>Mã giảm giá</h2>
              
              <div className="voucher-section">
                <div className="voucher-input">
                  <Form.Control
                    type="text"
                    value={useVoucherCode}
                    onChange={(e) => setUseVoucherCode(e.target.value)}
                    placeholder="Nhập mã giảm giá"
                  />
                  <Button onClick={handleApplyVoucher} variant="outline-primary">
                    Áp dụng
                  </Button>
                </div>
                
                {appliedVoucher && (
                  <div className="applied-voucher">
                    <div className="voucher-info">
                      <span className="voucher-code">✅ {appliedVoucher.code}</span>
                      <span className="voucher-desc">{appliedVoucher.description}</span>
                    </div>
                    <Button 
                      variant="outline-danger" 
                      size="sm"
                      onClick={() => setAppliedVoucher(null)}
                    >
                      Xóa
                    </Button>
                  </div>
                )}
                
                <div className="voucher-suggestions">
                  <small>Mã có sẵn: WELCOME10, SAVE50K, FREESHIP</small>
                </div>
              </div>
            </div>

            {/* Terms */}
            <div className="checkout-section">
              <Form.Check
                type="checkbox"
                id="agree-terms"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                label={
                  <span>
                    Tôi đã đọc và đồng ý với{' '}
                    <a href="#" target="_blank">Điều khoản và Điều kiện</a>{' '}
                    của VietTrad
                  </span>
                }
              />
            </div>
          </Col>

          {/* Right Column - Order Summary */}
          <Col lg={4} md={5} className="checkout-right">
            <div className="order-summary-section">
              <h2>Đơn hàng của bạn</h2>
              
              {/* Cart Items */}
              <div className="order-items">
                {items.map((item) => (
                  <div key={item.id} className="order-item">
                    <div className="item-image">
                      <img src={item.image} alt={item.name} />
                      <span className="item-quantity">{item.quantity}</span>
                    </div>
                    <div className="item-details">
                      <h4>{item.name}</h4>
                      <p className="item-variant">
                        {item.selectedVariant?.title} • {item.selectedVariant?.size}
                      </p>
                      <p className="item-price">
                        {(() => {
                          const discountedPrice = getItemDiscountedPrice(item);
                          const itemTotal = getItemTotal(item);
                          
                          if (item.discount && item.discount > 0) {
                            return (
                              <span>
                                <span style={{ textDecoration: 'line-through', color: '#999', fontSize: '12px' }}>
                                  {formatPrice(item.price * item.quantity)}đ
                                </span>
                                <br />
                                <span style={{ color: '#d32f2f', fontWeight: 'bold' }}>
                                  {formatPrice(itemTotal)}đ
                                </span>
                              </span>
                            );
                          }
                          
                          return `${formatPrice(itemTotal)}đ`;
                        })()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="order-totals">
                <div className="total-row">
                  <span>Tạm tính ({getTotalItems()} sản phẩm):</span>
                  <span>{formatPrice(getOriginalTotalPrice())}đ</span>
                </div>
                
                {getTotalDiscount() > 0 && (
                  <div className="total-row discount">
                    <span>Giảm giá sản phẩm:</span>
                    <span>-{formatPrice(getTotalDiscount())}đ</span>
                  </div>
                )}
                
                <div className="total-row">
                  <span>Phí vận chuyển:</span>
                  <span>
                    {(() => {
                      const originalShippingFee = getOriginalShippingFee();
                      const currentShippingFee = getShippingFee();
                      const totalPrice = getTotalPrice();
                      
                      // Nếu đã đạt ngưỡng miễn phí vận chuyển
                      if (totalPrice >= 2815000) {
                        return <span className="free">Miễn phí</span>;
                      }
                      
                      // Nếu có voucher FREESHIP
                      if (appliedVoucher && appliedVoucher.type === 'freeship') {
                        return (
                          <span>
                            <span style={{ textDecoration: 'line-through', color: '#999' }}>
                              {formatPrice(originalShippingFee)}đ
                            </span>
                            <span className="free" style={{ marginLeft: '8px' }}>Miễn phí</span>
                          </span>
                        );
                      }
                      
                      // Phí vận chuyển thông thường
                      return `${formatPrice(currentShippingFee)}đ`;
                    })()}
                  </span>
                </div>
                
                {appliedVoucher && getVoucherDiscount() > 0 && (
                  <div className="total-row discount">
                    <span>Mã giảm giá ({appliedVoucher.code}):</span>
                    <span>-{formatPrice(getVoucherDiscount())}đ</span>
                  </div>
                )}
                
                <div className="total-row final-total">
                  <span>Tổng cộng:</span>
                  <span className="final-price">{formatPrice(getFinalTotal())}đ</span>
                </div>
              </div>

              {/* Checkout Button */}
              <Button 
                className="place-order-btn"
                size="lg"
                onClick={handleSubmitOrder}
                disabled={loading}
              >
                {loading ? 'Đang xử lý...' : 'ĐẶT HÀNG'}
              </Button>

              <div className="checkout-security">
                <p>🔒 Thông tin của bạn được bảo mật an toàn</p>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Checkout; 