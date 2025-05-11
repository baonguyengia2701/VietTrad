import React from 'react';
import { Link } from 'react-router-dom';
import './ProductCard.scss';

const ProductCard = ({ product }) => {
  const { _id, name, images, price, discountPrice, slug, craftVillage } = product;

  // Placeholder image nếu không có ảnh
  const imageUrl = images && images.length > 0 
    ? images[0].url 
    : 'https://via.placeholder.com/300x300?text=No+Image';
  
  // Tính % giảm giá
  const discountPercentage = discountPrice 
    ? Math.round(((price - discountPrice) / price) * 100) 
    : 0;

  return (
    <div className="product-card">
      <div className="product-card__image">
        <Link to={`/products/${slug}`}>
          <img src={imageUrl} alt={name} />
        </Link>
        
        {discountPrice && (
          <div className="product-card__discount-badge">
            -{discountPercentage}%
          </div>
        )}
      </div>
      
      <div className="product-card__content">
        <h3 className="product-card__title">
          <Link to={`/products/${slug}`}>{name}</Link>
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
          <Link to={`/products/${slug}`} className="btn-view">
            Xem chi tiết
          </Link>
          <button className="btn-cart">
            <i className="fa fa-shopping-cart"></i>
            Thêm vào giỏ
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard; 