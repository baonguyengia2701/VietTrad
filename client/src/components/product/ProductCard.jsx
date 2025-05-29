import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './ProductCard.scss';

const ProductCard = ({ product, isFeatured = false }) => {
  const navigate = useNavigate();
  const { _id, name, image, price, discountPrice, slug, craftVillage } = product;

  // Placeholder image nếu không có ảnh
  const imageUrl = image && image.length > 0 
    ? image[0] 
    : 'https://via.placeholder.com/300x300?text=No+Image';
  
  // Tính % giảm giá
  const discountPercentage = discountPrice 
    ? Math.round(((price - discountPrice) / price) * 100) 
    : 0;

  // Xử lý click vào sản phẩm nổi bật
  const handleFeaturedClick = (e) => {
    e.preventDefault();
    if (isFeatured) {
      // Điều hướng đến trang Products với filter bestseller và search theo tên sản phẩm
      navigate(`/products?sort=bestseller&search=${encodeURIComponent(name)}`);
    } else {
      // Điều hướng bình thường đến trang chi tiết sản phẩm
      navigate(`/products/${slug}`);
    }
  };

  return (
    <div className="product-card" onClick={isFeatured ? handleFeaturedClick : undefined}>
      <div className="product-card__image">
        <Link to={`/products/${slug}`} onClick={isFeatured ? handleFeaturedClick : undefined}>
          <img src={imageUrl} alt={name} />
        </Link>
        
        {isFeatured && (
          <div className="product-card__bestseller-badge">
            Bán chạy
          </div>
        )}
        
        {discountPrice && (
          <div className="product-card__discount-badge">
            -{discountPercentage}%
          </div>
        )}
      </div>
      
      <div className="product-card__content">
        <h3 className="product-card__title">
          <Link to={`/products/${slug}`} onClick={isFeatured ? handleFeaturedClick : undefined}>{name}</Link>
        </h3>
        
        {craftVillage && (
          <div className="product-card__village">
            <Link to={`/craft-villages/${craftVillage.slug || craftVillage._id}`}>
              {craftVillage.name}
            </Link>
          </div>
        )}
        
        <div className="product-card__price">
          {discountPrice ? (
            <>
              <span className="product-card__price--discounted">
                {discountPrice.toLocaleString('vi-VN')}₫
              </span>
              <span className="product-card__price--original">
                {price.toLocaleString('vi-VN')}₫
              </span>
            </>
          ) : (
            <span className="product-card__price--regular">
              {price.toLocaleString('vi-VN')}₫
            </span>
          )}
        </div>
        
        <div className="product-card__actions">
          <Link to={`/products/${slug}`} className="btn-view" onClick={isFeatured ? handleFeaturedClick : undefined}>
            {isFeatured ? 'Tìm sản phẩm tương tự' : 'Xem chi tiết'}
          </Link>
          <button className="btn-cart">
            <i className="fa fa-shopping-cart"></i>
            Thêm vào giỏ
          </button>
        </div>
        
        {isFeatured && (
          <div className="product-card__featured-note">
            💡 Click để tìm sản phẩm bán chạy tương tự
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard; 