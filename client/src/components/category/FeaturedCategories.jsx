import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { categoryService } from '../../services/categoryService';
import './FeaturedCategories.scss';
import { DRAGON_DIVIDER } from '../../assets/images';

const FeaturedCategories = () => {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFeaturedCategories();
  }, []);

  const fetchFeaturedCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Gọi API để lấy danh mục hoạt động với tất cả thông tin
      const allCategories = await categoryService.getAllCategories({ active: true });
      
      // Lấy 3 danh mục đầu tiên để hiển thị
      const featuredCategories = allCategories.slice(0, 3);
      setCategories(featuredCategories);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError(err.message || 'Không thể tải danh mục');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryImage = (category) => {
    // Ưu tiên sử dụng image từ database
    if (category.image && category.image.trim()) {
      return category.image;
    }
    
    // Fallback về placeholder đơn giản
    return 'https://via.placeholder.com/400x300?text=' + encodeURIComponent(category.name);
  };

  const getCategoryLink = (category) => {
    // Tạo link đến trang products với filter theo danh mục
    return `/products?category=${encodeURIComponent(category.name)}`;
  };

  if (error) {
    return <div className="error-message">Không thể tải danh mục: {error}</div>;
  }

  return (
    <section className="featured-categories">
      <div className="container">
        <h2 className="section-title">Danh mục nổi bật</h2>
        <div className="category-description">
          <p>Nghệ thuật truyền thống Việt Nam qua các sản phẩm tinh hoa hàng trăm năm lịch sử</p>
        </div>
        
        {loading ? (
          <div className="loading">Đang tải danh mục...</div>
        ) : categories.length > 0 ? (
          <div className="categories-grid">
            {categories.map(category => (
              <div key={category._id} className="category-card">
                <div className="category-image">
                  <img 
                    src={getCategoryImage(category)} 
                    alt={category.name} 
                  />
                </div>
                <h3>{category.name}</h3>
                <Link to={getCategoryLink(category)} className="category-link">Khám phá</Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-categories">Không có danh mục nào để hiển thị</div>
        )}
        
        <div className="divider">
          <img src={DRAGON_DIVIDER} alt="Hoa văn rồng" />
        </div>
      </div>
    </section>
  );
};

export default FeaturedCategories; 