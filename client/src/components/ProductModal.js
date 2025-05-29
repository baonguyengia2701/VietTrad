import React, { useState, useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import './ProductModal.scss';

const ProductModal = ({ show, onHide, product, onAddToCart }) => {
  const [selectedVariant, setSelectedVariant] = useState({
    title: '',
    size: ''
  });
  const [quantity, setQuantity] = useState(1);

  // Reset form khi modal mở/đóng hoặc product thay đổi
  useEffect(() => {
    if (show && product) {
      const variants = getProductVariants();
      setSelectedVariant({
        title: variants.titles[0] || '',
        size: variants.sizes[0] || ''
      });
      setQuantity(1);
    }
  }, [show, product]);

  // Lấy variants từ dữ liệu sản phẩm
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

  const handleQuantityChange = (type) => {
    if (type === 'increase') {
      setQuantity(prev => prev + 1);
    } else if (type === 'decrease' && quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleAddToCart = () => {
    if (selectedVariant.title && selectedVariant.size) {
      onAddToCart({
        ...product,
        selectedVariant: selectedVariant,
        quantity: quantity
      });
      onHide();
    }
  };

  const handleClose = () => {
    // Reset form khi đóng
    setSelectedVariant({ title: '', size: '' });
    setQuantity(1);
    onHide();
  };

  const formatPrice = (price) => {
    return price.toLocaleString('vi-VN');
  };

  const getDiscountedPrice = (price, discount) => {
    if (discount > 0) {
      return price * (1 - discount / 100);
    }
    return price;
  };

  if (!product) return null;

  return (
    <Modal 
      show={show} 
      onHide={handleClose}
      centered 
      size="lg"
      className="product-modal"
      backdrop={true}
      keyboard={true}
    >
      <Modal.Body className="p-0">
        {/* Custom close button */}
        <button 
          className="btn-close" 
          onClick={handleClose}
          aria-label="Close"
        />
        
        <div className="product-modal-content">
          <div className="product-modal-image">
            <img src={product.images[0]} alt={product.name} />
          </div>
          
          <div className="product-modal-info">
            <h3 className="product-modal-title">{product.name}</h3>
            
            <div className="product-modal-meta">
              <span className="status">
                Tình trạng: <strong>{product.countInStock > 0 ? 'Còn hàng' : 'Hết hàng'}</strong>
              </span>
              <span className="brand">Thương hiệu: <strong>{product.brandName}</strong></span>
            </div>
            
            <div className="product-modal-price">
              <span className="price-label">Giá:</span>
              {product.discount > 0 ? (
                <>
                  <span className="current-price">
                    {formatPrice(getDiscountedPrice(product.price, product.discount))}đ
                  </span>
                  <span className="original-price">
                    {formatPrice(product.price)}đ
                  </span>
                </>
              ) : (
                <span className="current-price">
                  {formatPrice(product.price)}đ
                </span>
              )}
            </div>
            
            {/* Variants */}
            {variants.titles.length > 1 && (
              <div className="product-modal-variants">
                <h4>Tiêu đề:</h4>
                <div className="variants-grid">
                  {variants.titles.map((title) => (
                    <button
                      key={title}
                      className={`variant-btn ${selectedVariant.title === title ? 'selected' : ''}`}
                      onClick={() => setSelectedVariant({...selectedVariant, title})}
                    >
                      {title}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {variants.sizes.length > 1 && (
              <div className="product-modal-variants">
                <h4>Kích thước:</h4>
                <div className="variants-grid">
                  {variants.sizes.map((size) => (
                    <button
                      key={size}
                      className={`variant-btn ${selectedVariant.size === size ? 'selected' : ''}`}
                      onClick={() => setSelectedVariant({...selectedVariant, size})}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <div className="product-modal-quantity">
              <span className="quantity-label">Số lượng:</span>
              <div className="quantity-controls">
                <button 
                  className="quantity-btn decrease"
                  onClick={() => handleQuantityChange('decrease')}
                  disabled={quantity <= 1}
                >
                  −
                </button>
                <span className="quantity-value">{quantity}</span>
                <button 
                  className="quantity-btn increase"
                  onClick={() => handleQuantityChange('increase')}
                  disabled={quantity >= product.countInStock}
                >
                  +
                </button>
              </div>
            </div>
            
            <button 
              className="add-to-cart-modal-btn"
              onClick={handleAddToCart}
              disabled={product.countInStock === 0 || !selectedVariant.title || !selectedVariant.size}
            >
              {product.countInStock === 0 ? 'HẾT HÀNG' : 'THÊM VÀO GIỎ'}
            </button>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default ProductModal; 