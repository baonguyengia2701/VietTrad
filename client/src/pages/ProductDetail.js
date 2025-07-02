import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { productService, transformProductData } from '../services/productService';
import { reviewService } from '../services/reviewService';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useCartNotification } from '../components/common/CartNotification';
import './ProductDetail.scss';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, items } = useCart();
  const { currentUser } = useAuth();
  const { showSuccess, showError, NotificationComponent } = useCartNotification();
  const [product, setProduct] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [additionalQuantity, setAdditionalQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState({
    title: 'Đũa trắc duôi trai vuông',
    size: 'Gắc con cá trai nâu'
  });
  const [userRating, setUserRating] = useState(0);
  const [userReview, setUserReview] = useState('');
  const [reviews, setReviews] = useState([]);
  const [canReview, setCanReview] = useState(false);
  const [reviewCheckMessage, setReviewCheckMessage] = useState('');
  const [reviewCheckReason, setReviewCheckReason] = useState('');
  const [hoveredProductIndex, setHoveredProductIndex] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationProduct, setNotificationProduct] = useState(null);
  const [notificationQuantity, setNotificationQuantity] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Force unlock scroll khi component mount (fix cho navigate từ modal)
  useEffect(() => {
    // Đơn giản hóa - chỉ đảm bảo body có thể scroll
    const unlockScroll = () => {
      try {
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
        document.body.classList.add('force-unlock-scroll');
        // Không touch modal-open class hoặc backdrop - để tự nhiên cleanup
      } catch (err) {
        console.warn('Error in ProductDetail scroll unlock:', err);
      }
    };
    
    // Gọi ngay và sau một delay để đảm bảo
    unlockScroll();
    const timer = setTimeout(unlockScroll, 100);
    
    return () => {
      clearTimeout(timer);
      try {
        document.body.classList.remove('force-unlock-scroll');
      } catch (err) {
        // Ignore cleanup errors
      }
    };
  }, []);

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch product details
        const productData = await productService.getProduct(id);
        const transformedProduct = transformProductData(productData);
        setProduct(transformedProduct);

        // Fetch related products
        const relatedData = await productService.getRelatedProducts(id, 4);
        const transformedRelated = relatedData.map(transformProductData);
        setRelatedProducts(transformedRelated);

        // Fetch reviews
        try {
          const productReviews = await reviewService.getProductReviews(id);
          setReviews(productReviews.data.reviews || []);
        } catch (reviewError) {
          // If reviews fail, use mock data for demo
          setReviews([
            {
              _id: '1',
              user: { name: 'Nguyễn Văn A' },
              rating: 5,
              comment: "Sản phẩm chất lượng tốt, đóng gói cẩn thận",
              createdAt: "2024-01-15"
            },
            {
              _id: '2',
              user: { name: 'Trần Thị B' },
              rating: 4,
              comment: "Sản phẩm đẹp, giao hàng nhanh",
              createdAt: "2024-01-10"
            }
          ]);
        }

        // Check if user can review (only if logged in)
        if (currentUser) {
          try {
            const canReviewResult = await reviewService.checkCanReview(id);
            setCanReview(canReviewResult.canReview);
            setReviewCheckMessage(canReviewResult.message);
            setReviewCheckReason(canReviewResult.reason);
          } catch (error) {
            console.error('Error checking review permission:', error);
            setCanReview(false);
            setReviewCheckMessage('Không thể kiểm tra quyền đánh giá');
          }
        } else {
          setCanReview(false);
          setReviewCheckMessage('Bạn cần đăng nhập để đánh giá sản phẩm');
          setReviewCheckReason('not_logged_in');
        }

      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Không thể tải thông tin sản phẩm. Vui lòng thử lại sau.');
        // Redirect to products page if product not found
        if (err.message === 'Sản phẩm không tìm thấy') {
          navigate('/products');
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProductData();
    }
  }, [id, navigate, currentUser]);

  // Loading state
  if (loading) {
    return (
      <div className="product-detail-loading">
        <Container>
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Đang tải thông tin sản phẩm...</p>
          </div>
        </Container>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="product-detail-loading">
        <Container>
          <div className="error-state">
            <h3>Có lỗi xảy ra</h3>
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>Thử lại</button>
          </div>
        </Container>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-detail-loading">
        <Container>
          <p>Sản phẩm không tồn tại.</p>
          <Link to="/products">Quay lại danh sách sản phẩm</Link>
        </Container>
      </div>
    );
  }

  // Format giá tiền
  const formatPrice = (price) => {
    return price.toLocaleString('vi-VN');
  };

  // Tính giá sau khi giảm
  const getDiscountedPrice = (price, discount) => {
    if (discount > 0) {
      return price * (1 - discount / 100);
    }
    return price;
  };

  // Hiển thị rating dạng sao
  const renderStars = (rating, interactive = false, onStarClick = null) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const stars = [];

    for (let i = 1; i <= 5; i++) {
      let starClass = 'star';
      if (i <= fullStars) {
        starClass += ' filled';
      } else if (i === fullStars + 1 && hasHalfStar) {
        starClass += ' half';
      } else {
        starClass += ' empty';
      }

      stars.push(
        <span 
          key={i} 
          className={starClass}
          onClick={interactive ? () => onStarClick(i) : undefined}
          style={interactive ? { cursor: 'pointer' } : {}}
        >
          ★
        </span>
      );
    }

    return stars;
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1 && newQuantity <= product.countInStock) {
      setQuantity(newQuantity);
    }
  };

  const handleAdditionalQuantityChange = (newQuantity) => {
    if (newQuantity >= 1 && newQuantity <= product.countInStock) {
      setAdditionalQuantity(newQuantity);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    
    try {
      setIsAddingToCart(true);
      
      const quantityToAdd = existingCartItem ? additionalQuantity : quantity;
      
      if (quantityToAdd > 0) {
        // Normalize selectedVariant for consistency
        const normalizedVariant = {
          title: selectedVariant.title || '',
          size: selectedVariant.size || '',
          price: selectedVariant.price || 0
        };

        await addToCart(product, quantityToAdd, normalizedVariant);
        
        // Show success notification with product info
        if (existingCartItem) {
          showSuccess(
            `Đã thêm ${quantityToAdd} sản phẩm vào giỏ hàng!`,
            {
              name: product.name,
              brand: product.brandName,
              price: product.price,
              discount: product.discount || 0,
              image: product.images[0]
            },
            quantityToAdd
          );
          // Reset additional quantity after adding
          setAdditionalQuantity(1);
        } else {
          showSuccess(
            'Thêm sản phẩm vào giỏ hàng thành công!',
            {
              name: product.name,
              brand: product.brandName,
              price: product.price,
              discount: product.discount || 0,
              image: product.images[0]
            },
            quantityToAdd
          );
        }
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      showError(error.message || 'Không thể thêm sản phẩm vào giỏ hàng');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!product) return;
    
    try {
      setIsAddingToCart(true);
      
      const quantityToAdd = existingCartItem ? additionalQuantity : quantity;
      
      if (quantityToAdd > 0) {
        // Normalize selectedVariant for consistency
        const normalizedVariant = {
          title: selectedVariant.title || '',
          size: selectedVariant.size || '',
          price: selectedVariant.price || 0
        };

        await addToCart(product, quantityToAdd, normalizedVariant);
        
        // Navigate to cart page immediately after adding
        navigate('/cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      showError(error.message || 'Không thể thêm sản phẩm vào giỏ hàng');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleSubmitReview = async () => {
    // Kiểm tra đăng nhập
    if (!currentUser) {
      alert('Bạn cần đăng nhập để đánh giá sản phẩm!');
      navigate('/login');
      return;
    }

    // Kiểm tra quyền đánh giá
    if (!canReview) {
      alert(reviewCheckMessage);
      return;
    }

    // Kiểm tra dữ liệu đầu vào
    if (userRating <= 0 || !userReview.trim()) {
      alert('Vui lòng nhập đầy đủ đánh giá và nhận xét!');
      return;
    }

    try {
      setIsSubmittingReview(true);
      
      // Gọi API để thêm review (API sẽ tự động kiểm tra lại quyền)
      await reviewService.addProductReview(product._id, userRating, userReview.trim());
      
      // Reset form
      setUserRating(0);
      setUserReview('');
      
      // Refresh reviews và product data để cập nhật rating
      const [updatedProduct, updatedReviews] = await Promise.all([
        productService.getProduct(id),
        reviewService.getProductReviews(id)
      ]);
      
      setProduct(transformProductData(updatedProduct));
      setReviews(updatedReviews.data.reviews || []);
      
      // Refresh review permission (user can't review again)
      try {
        const canReviewResult = await reviewService.checkCanReview(id);
        setCanReview(canReviewResult.canReview);
        setReviewCheckMessage(canReviewResult.message);
        setReviewCheckReason(canReviewResult.reason);
      } catch (error) {
        setCanReview(false);
        setReviewCheckMessage('Bạn đã đánh giá sản phẩm này rồi');
      }
      
      alert('Đánh giá của bạn đã được gửi thành công!');
      
    } catch (error) {
      console.error('Error submitting review:', error);
      
      // Xử lý lỗi cụ thể
      if (error.includes('đã đánh giá sản phẩm này rồi')) {
        alert('Bạn đã đánh giá sản phẩm này rồi!');
      } else if (error.includes('cần mua và nhận sản phẩm')) {
        alert('Bạn cần mua và nhận sản phẩm này trước khi có thể đánh giá!');
      } else {
        alert('Có lỗi xảy ra khi gửi đánh giá. Vui lòng thử lại!');
      }
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleRelatedProductHover = (index) => {
    setHoveredProductIndex(index);
  };

  const handleRelatedProductLeave = () => {
    setHoveredProductIndex(null);
  };

  const getRelatedProductImage = (relatedProduct, index) => {
    if (hoveredProductIndex === index && relatedProduct.images.length > 1) {
      return relatedProduct.images[1]; // Hiển thị hình ảnh thứ 2 khi hover
    }
    return relatedProduct.images[0]; // Hiển thị hình ảnh đầu tiên mặc định
  };

  const handleRelatedProductClick = (relatedProduct) => {
    // Navigate to related product using its actual ID
    navigate(`/products/${relatedProduct.id || relatedProduct._id}`);
  };

  // Variants từ dữ liệu sản phẩm
  const getProductVariants = () => {
    if (!product || !product.variants) {
      return {
        titles: ['Mẫu cơ bản'],
        sizes: ['Kích thước tiêu chuẩn']
      };
    }

    return {
      titles: product.variants.title || ['Mẫu cơ bản'],
      sizes: product.variants.size || ['Kích thước tiêu chuẩn']
    };
  };

  const variants = getProductVariants();

  // Format date for reviews
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  // Function to check if product exists in cart with same variant
  const getExistingCartItem = () => {
    if (!product || !items) return null;
    
    // Normalize current selectedVariant for comparison
    const normalizedCurrentVariant = {
      title: selectedVariant.title || '',
      size: selectedVariant.size || '',
      price: selectedVariant.price || 0
    };
    
    return items.find(item => {
      // Check by productId if available
      if (item.productId && product._id) {
        const sameProduct = String(item.productId) === String(product._id);
        const sameVariant = JSON.stringify(item.selectedVariant || {}) === JSON.stringify(normalizedCurrentVariant);
        return sameProduct && sameVariant;
      }
      
      // Fallback to name comparison
      const sameProduct = item.name === product.name;
      const sameVariant = JSON.stringify(item.selectedVariant || {}) === JSON.stringify(normalizedCurrentVariant);
      return sameProduct && sameVariant;
    });
  };

  const existingCartItem = getExistingCartItem();

  return (
    <div className="product-detail-page">
      <Container>
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <Link to="/">Trang chủ</Link>
          <span className="separator">/</span>
          <Link to="/products">Đồ gia dụng</Link>
          <span className="separator">/</span>
          <span>{product.name}</span>
        </div>

        <div className="product-detail-container">
          <Row>
            {/* Product Images */}
            <Col lg={4} md={5} className="product-images">
              <div className="main-image">
                <img 
                  src={product.images[selectedImageIndex]} 
                  alt={product.name}
                  className="img-fluid"
                />
                {product.discount > 0 && (
                  <div className="discount-badge">-{product.discount}%</div>
                )}
                {product.countInStock === 0 && (
                  <div className="out-of-stock-badge">Hết hàng</div>
                )}
              </div>
              
              {product.images.length > 1 && (
                <div className="image-thumbnails">
                  {product.images.map((img, index) => (
                    <div 
                      key={index}
                      className={`thumbnail ${selectedImageIndex === index ? 'active' : ''}`}
                      onClick={() => setSelectedImageIndex(index)}
                    >
                      <img src={img} alt={`${product.name} ${index + 1}`} />
                    </div>
                  ))}
                </div>
              )}
            </Col>

            {/* Product Info */}
            <Col lg={8} md={7} className="product-info">
              <h1 className="product-title">{product.name}</h1>
              
              <div className="product-meta">
                <div className="meta-row">
                  <span className="label">Danh mục:</span>
                  <span className="value">{product.categoryName}</span>
                </div>
                <div className="meta-row">
                  <span className="label">Thương hiệu:</span>
                  <span className="value brand">{product.brandName}</span>
                </div>
                <div className="meta-row">
                  <span className="label">Tình trạng:</span>
                  <span className={`value stock-status ${product.countInStock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                    {product.countInStock > 0 ? `Còn ${product.countInStock} sản phẩm` : 'Hết hàng'}
                  </span>
                </div>
                {product.discount > 0 && (
                  <div className="meta-row">
                    <span className="label">Giảm giá:</span>
                    <span className="value discount">{product.discount}%</span>
                  </div>
                )}
              </div>

              <div className="product-price">
                <span className="current-price">
                  Giá: <span className="price-value">{formatPrice(getDiscountedPrice(product.price, product.discount))}đ</span>
                </span>
                {product.discount > 0 && (
                  <span className="original-price">
                    {formatPrice(product.price)}đ
                  </span>
                )}
              </div>

              {/* Product Variants */}
              <div className="product-variants">
                <div className="variant-group">
                  <label>Tiêu đề:</label>
                  <div className="variant-options">
                    {variants.titles.map((title, index) => (
                      <button 
                        key={index}
                        className={`variant-btn ${selectedVariant.title === title ? 'active' : ''}`}
                        onClick={() => setSelectedVariant({...selectedVariant, title})}
                      >
                        {title}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="variant-group">
                  <label>Kích thước:</label>
                  <div className="variant-options">
                    {variants.sizes.map((size, index) => (
                      <button 
                        key={index}
                        className={`variant-btn ${selectedVariant.size === size ? 'active' : ''}`}
                        onClick={() => setSelectedVariant({...selectedVariant, size})}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quantity Selector */}
              {product.countInStock > 0 && (
                <div className="quantity-section">
                  {existingCartItem ? (
                    <>
                      {/* Product already in cart - show existing info and additional quantity */}
                      <div className="existing-in-cart-info">
                        <div className="existing-info">
                          <span className="existing-label">✅ Sản phẩm đã có trong giỏ:</span>
                          <span className="existing-quantity">{existingCartItem.quantity} sản phẩm</span>
                        </div>
                        <div className="existing-details">
                          <small>Variant: {existingCartItem.selectedVariant?.title} • {existingCartItem.selectedVariant?.size}</small>
                        </div>
                      </div>
                      
                      <div className="additional-quantity-section">
                        <label>Số lượng muốn thêm:</label>
                        <div className="quantity-controls">
                          <button 
                            className="qty-btn minus"
                            onClick={() => handleAdditionalQuantityChange(additionalQuantity - 1)}
                            disabled={additionalQuantity <= 1}
                          >
                            −
                          </button>
                          <input 
                            type="number" 
                            value={additionalQuantity}
                            onChange={(e) => handleAdditionalQuantityChange(parseInt(e.target.value) || 1)}
                            min="1"
                            max={product.countInStock}
                          />
                          <button 
                            className="qty-btn plus"
                            onClick={() => handleAdditionalQuantityChange(additionalQuantity + 1)}
                            disabled={additionalQuantity >= product.countInStock}
                          >
                            +
                          </button>
                        </div>
                        <small className="total-info">
                          Tổng sau khi thêm: <strong>{existingCartItem.quantity + additionalQuantity}</strong> sản phẩm
                        </small>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Product not in cart - show normal quantity selector */}
                      <label>Số lượng:</label>
                      <div className="quantity-controls">
                        <button 
                          className="qty-btn minus"
                          onClick={() => handleQuantityChange(quantity - 1)}
                          disabled={quantity <= 1}
                        >
                          −
                        </button>
                        <input 
                          type="number" 
                          value={quantity}
                          onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                          min="1"
                          max={product.countInStock}
                        />
                        <button 
                          className="qty-btn plus"
                          onClick={() => handleQuantityChange(quantity + 1)}
                          disabled={quantity >= product.countInStock}
                        >
                          +
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="action-buttons">
                <Button 
                  className="add-to-cart-btn"
                  onClick={handleAddToCart}
                  disabled={product.countInStock === 0 || isAddingToCart}
                >
                  {isAddingToCart ? (
                    'ĐANG THÊM...'
                  ) : existingCartItem ? (
                    `THÊM ${additionalQuantity} VÀO GIỎ`
                  ) : (
                    'THÊM VÀO GIỎ'
                  )}
                </Button>
                <Button 
                  className="buy-now-btn"
                  onClick={handleBuyNow}
                  disabled={product.countInStock === 0 || isAddingToCart}
                >
                  {isAddingToCart ? 'ĐANG XỬ LÝ...' : 'MUA NGAY'}
                </Button>
              </div>

              {/* Facebook Inbox */}
              <div className="facebook-inbox">
                <a 
                  href="https://www.facebook.com/baodz2701/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="facebook-btn"
                >
                  INBOX FACEBOOK ĐỂ TƯ VẤN THÊM
                </a>
              </div>

              {/* Social Share */}
              <div className="social-share">
                <span className="share-label">Chia sẻ:</span>
                <div className="social-icons">
                  <a href="#" className="social-link facebook">
                    <i className="fab fa-facebook-f"></i>
                  </a>
                  <a href="#" className="social-link messenger">
                    <i className="fab fa-facebook-messenger"></i>
                  </a>
                  <a href="#" className="social-link twitter">
                    <i className="fab fa-twitter"></i>
                  </a>
                  <a href="#" className="social-link pinterest">
                    <i className="fab fa-pinterest"></i>
                  </a>
                  <a href="#" className="social-link copy">
                    <i className="fas fa-link"></i>
                  </a>
                </div>
              </div>
            </Col>
          </Row>
        </div>

        {/* Product Description and Review Section */}
        <div className="product-description-section">
          <Row>
            <Col lg={12}>
              <div className="description-content">
                {/* Rating and sales info */}
                <div className="rating-section">
                  <div className="stars">
                    {renderStars(product.averageRating || product.rating)}
                  </div>
                  <span className="rating-text">({product.averageRating || product.rating} / 5)</span>
                  <span className="sold-count">Đã bán: {product.sold || product.selled}</span>
                </div>

                {/* Price display */}
                <div className="price-section">
                  <span className="current-price-large">
                    {formatPrice(getDiscountedPrice(product.price, product.discount))}đ
                  </span>
                  {product.discount > 0 && (
                    <>
                      <span className="original-price-large">
                        {formatPrice(product.price)}đ
                      </span>
                      <span className="discount-badge-large">
                        Tiết kiệm {product.discount}%
                      </span>
                    </>
                  )}
                </div>

                {/* Product description */}
                <div className="description-text">
                  <h3>Mô tả sản phẩm</h3>
                  <p>{product.description}</p>
                </div>

                {/* Product details */}
                <div className="product-details">
                  <div className="detail-row">
                    <span className="label">Danh mục:</span>
                    <span className="value">{product.categoryName}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Thương hiệu:</span>
                    <span className="value">{product.brandName}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Tình trạng:</span>
                    <span className={`value stock-status ${product.countInStock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                      {product.countInStock > 0 ? `Còn ${product.countInStock} sản phẩm` : 'Hết hàng'}
                    </span>
                  </div>
                  {product.discount > 0 && (
                    <div className="detail-row">
                      <span className="label">Giảm giá:</span>
                      <span className="value">{product.discount}%</span>
                    </div>
                  )}
                </div>

                {/* Reviews section */}
                <div className="reviews-section">
                  <h3>Đánh giá sản phẩm</h3>
                  
                  {/* Add review form */}
                  <div className="add-review">
                    <h4>Viết đánh giá của bạn</h4>
                    {!currentUser ? (
                      <div className="login-required">
                        <p>Bạn cần đăng nhập để đánh giá sản phẩm.</p>
                        <Link to="/login" className="login-link">Đăng nhập ngay</Link>
                      </div>
                    ) : !canReview ? (
                      <div className="review-not-allowed">
                        <p className="restriction-message">{reviewCheckMessage}</p>
                        {reviewCheckReason === 'not_purchased_or_not_delivered' && (
                          <div className="purchase-info">
                            <p>Để đánh giá sản phẩm này, bạn cần:</p>
                            <ul>
                              <li>Mua sản phẩm này</li>
                              <li>Đợi đơn hàng được giao thành công hoặc xác nhận đã nhận hàng</li>
                              <li>Sau đó bạn sẽ có thể đánh giá sản phẩm</li>
                            </ul>
                          </div>
                        )}
                        {reviewCheckReason === 'already_reviewed' && (
                          <p>Cảm ơn bạn đã đánh giá sản phẩm này!</p>
                        )}
                      </div>
                    ) : (
                      <>
                        <div className="review-eligible">
                          <p className="eligible-message">✅ Bạn có thể đánh giá sản phẩm này</p>
                        </div>
                        <div className="rating-input">
                          <span>Đánh giá: </span>
                          <div className="stars-input">
                            {renderStars(userRating, true, setUserRating)}
                          </div>
                        </div>
                        <textarea
                          className="review-textarea"
                          placeholder="Chia sẻ nhận xét về sản phẩm..."
                          value={userReview}
                          onChange={(e) => setUserReview(e.target.value)}
                          rows="4"
                          disabled={isSubmittingReview}
                        />
                        <button 
                          className="submit-review-btn" 
                          onClick={handleSubmitReview}
                          disabled={isSubmittingReview || userRating <= 0 || !userReview.trim()}
                        >
                          {isSubmittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
                        </button>
                      </>
                    )}
                  </div>

                  {/* Existing reviews */}
                  <div className="reviews-list">
                    <h4>Đánh giá từ khách hàng ({reviews.length})</h4>
                    {reviews.map((review) => (
                      <div key={review._id || review.id} className="review-item">
                        <div className="review-header">
                          <div className="reviewer-info">
                            <span className="reviewer-name">{review.user?.name || review.userName}</span>
                            <span className="review-date">{formatDate(review.createdAt || review.date)}</span>
                          </div>
                          <div className="review-rating">
                            {renderStars(review.rating)}
                          </div>
                        </div>
                        <div className="review-comment">
                          {review.comment}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="related-products">
            <h2>Sản phẩm liên quan</h2>
            <Row className="related-products-row">
              {relatedProducts.map((relatedProduct, index) => (
                <Col xl={3} lg={3} md={6} sm={6} key={relatedProduct.id || relatedProduct._id} className="mb-4">
                  <div
                    className="related-product-card"
                    onMouseEnter={() => handleRelatedProductHover(index)}
                    onMouseLeave={handleRelatedProductLeave}
                    onClick={() => handleRelatedProductClick(relatedProduct)}
                  >
                    <div className="product-image">
                      <img 
                        src={getRelatedProductImage(relatedProduct, index)} 
                        alt={relatedProduct.name}
                      />
                      {relatedProduct.discount > 0 && (
                        <div className="discount-badge">-{relatedProduct.discount}%</div>
                      )}
                    </div>
                    <div className="product-info">
                      <div className="brand">{relatedProduct.brandName}</div>
                      <div className="name">{relatedProduct.name}</div>
                      <div className="price">
                        {relatedProduct.discount > 0 ? (
                          <>
                            <span className="discounted">
                              {formatPrice(getDiscountedPrice(relatedProduct.price, relatedProduct.discount))}đ
                            </span>
                            <span className="original">
                              {formatPrice(relatedProduct.price)}đ
                            </span>
                          </>
                        ) : (
                          <span className="current">{formatPrice(relatedProduct.price)}đ</span>
                        )}
                      </div>
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          </div>
        )}
      </Container>
      
      {/* Cart Notifications */}
      <NotificationComponent />
    </div>
  );
};

export default ProductDetail; 