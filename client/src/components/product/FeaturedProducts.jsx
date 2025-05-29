import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productService } from '../../services/productService';
import './FeaturedProducts.scss';

const FeaturedProducts = () => {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBestsellerProducts();
  }, []);

  const fetchBestsellerProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Gọi API để lấy sản phẩm bán chạy nhất
      const bestsellerProducts = await productService.getBestsellerProducts(3); // Lấy 3 sản phẩm
      setProducts(bestsellerProducts);
    } catch (err) {
      console.error('Error fetching bestseller products:', err);
      setError(err.message || 'Không thể tải sản phẩm bán chạy');
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = (product) => {
    // Điều hướng đến trang Products với filter bestseller và search theo tên sản phẩm
    window.location.href = `/products?sort=bestseller&search=${encodeURIComponent(product.name)}`;
  };

  if (error) {
    return <div className="error-message">Không thể tải sản phẩm: {error}</div>;
  }

  return (
    <section className="featured-products">
      <div className="container">
        <h2 className="section-title">Sản phẩm nổi bật</h2>
        
        {loading ? (
          <div className="loading">Đang tải sản phẩm...</div>
        ) : products.length > 0 ? (
          <div className="products-grid">
            {products.map(product => (
              <div key={product._id} className="product-card" onClick={() => handleProductClick(product)}>
                <div className="product-image">
                  <img 
                    src={product.images && product.images[0] ? product.images[0] : 'https://via.placeholder.com/300x300?text=No+Image'} 
                    alt={product.name} 
                  />
                  <div className="product-overlay">
                    <div className="overlay-buttons">
                      <button className="btn-icon"><i className="icon-heart"></i></button>
                      <button className="btn-icon"><i className="icon-cart"></i></button>
                      <div className="btn-icon"><i className="icon-eye"></i></div>
                    </div>
                  </div>
                </div>
                <div className="product-info">
                  <h3>{product.name}</h3>
                  <div className="product-price">
                    <span>{product.price?.toLocaleString('vi-VN') || '0'}₫</span>
                  </div>
                  <div className="product-origin">
                    <span>Làng nghề: {product.brand?.name || product.brandName || product.specifications?.origin || 'Phú Kiện'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-products">Không có sản phẩm nào để hiển thị</div>
        )}
        
        <div className="view-all-container">
          <Link to="/products?sort=bestseller" className="btn btn-outline">Xem tất cả sản phẩm bán chạy</Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts; 