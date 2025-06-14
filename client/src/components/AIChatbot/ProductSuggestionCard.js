import React from 'react';
import './ProductSuggestionCard.scss';

const ProductSuggestionCard = ({ product, onProductClick }) => {
  if (!product) return null;

  // Xử lý hình ảnh - có thể là images array hoặc image string
  const getImageUrl = () => {
    if (product.images && product.images.length > 0) {
      return product.images[0];
    }
    if (product.image) {
      return product.image;
    }
    return 'https://via.placeholder.com/200x200?text=No+Image';
  };

  // Tính giá sau giảm giá
  const getDiscountedPrice = () => {
    if (product.discount && product.discount > 0) {
      return Math.round(product.price * (1 - product.discount / 100));
    }
    if (product.originalPrice && product.originalPrice > product.price) {
      return product.price;
    }
    return null;
  };

  const discountedPrice = getDiscountedPrice();
  const originalPrice = product.originalPrice || product.price;

  // Sử dụng _id thay vì slug để tương thích với API
  const productId = product._id || product.id;
  


  // Handle click để đóng modal trước khi navigate
  const handleProductClick = (e) => {
    e.preventDefault();
    
    // Sử dụng window.location để tránh conflicts với React Router trong modal
    window.location.href = `/products/${productId}`;
  };

  return (
    <div className="product-suggestion-card">
      <div className="product-image">
        <a href={`/products/${productId}`} onClick={handleProductClick}>
          <img 
            src={getImageUrl()} 
            alt={product.name}
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/200x200?text=VietTrad';
            }}
          />
        </a>
        
        {product.discount > 0 && (
          <div className="discount-badge">
            -{product.discount}%
          </div>
        )}

        {product.averageRating && product.averageRating > 0 && (
          <div className="rating-badge">
            ⭐ {product.averageRating.toFixed(1)}
          </div>
        )}
      </div>
      
      <div className="product-info">
        <h4 className="product-name">
          <a href={`/products/${productId}`} onClick={handleProductClick}>
            {product.name}
          </a>
        </h4>
        
        {product.shortDescription && (
          <p className="product-description">
            {product.shortDescription.length > 60 
              ? product.shortDescription.substring(0, 60) + '...'
              : product.shortDescription
            }
          </p>
        )}

        <div className="product-meta">
          {product.category?.name && (
            <span className="product-category">
              📂 {product.category.name}
            </span>
          )}
          
          {product.brand?.name && (
            <span className="product-brand">
              🏷️ {product.brand.name}
            </span>
          )}
        </div>
        
        <div className="product-price">
          {discountedPrice ? (
            <>
              <span className="price-discounted">
                {discountedPrice.toLocaleString('vi-VN')}₫
              </span>
              <span className="price-original">
                {originalPrice.toLocaleString('vi-VN')}₫
              </span>
            </>
          ) : (
            <span className="price-regular">
              {originalPrice.toLocaleString('vi-VN')}₫
            </span>
          )}
        </div>
        
        <div className="product-actions">
          <a 
            href={`/products/${productId}`} 
            onClick={handleProductClick}
            className="btn btn-primary btn-sm"
          >
            📖 Xem chi tiết
          </a>
        </div>

        {product.numOfReviews > 0 && (
          <div className="product-reviews">
            👥 {product.numOfReviews} đánh giá
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductSuggestionCard; 