import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from './ProductCard';
import './FeaturedProducts.scss';

const FeaturedProducts = () => {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Trong thực tế, bạn sẽ gọi API từ backend
    // Ex: fetch('/api/products/featured')
    
    // Giả lập dữ liệu cho demo
    setTimeout(() => {
      const demoProducts = [
        {
          _id: '1',
          name: 'Bình gốm Bát Tràng hoa văn truyền thống',
          slug: 'binh-gom-bat-trang-hoa-van-truyen-thong',
          price: 750000,
          images: [{ url: 'https://via.placeholder.com/300x300?text=Pottery', alt: 'Bình gốm Bát Tràng' }],
          craftVillage: { name: 'Làng gốm Bát Tràng', slug: 'lang-gom-bat-trang' }
        },
        {
          _id: '2',
          name: 'Tranh đồng mạ vàng Đồng Xâm',
          slug: 'tranh-dong-ma-vang-dong-xam',
          price: 2500000,
          discountPrice: 2200000,
          images: [{ url: 'https://via.placeholder.com/300x300?text=Metal+Art', alt: 'Tranh đồng mạ vàng' }],
          craftVillage: { name: 'Làng nghề Đồng Xâm', slug: 'lang-nghe-dong-xam' }
        },
        {
          _id: '3',
          name: 'Nón lá Huế thêu hoa sen',
          slug: 'non-la-hue-theu-hoa-sen',
          price: 350000,
          images: [{ url: 'https://via.placeholder.com/300x300?text=Conical+Hat', alt: 'Nón lá Huế' }],
          craftVillage: { name: 'Làng nón Huế', slug: 'lang-non-hue' }
        },
        {
          _id: '4',
          name: 'Đèn lồng Hội An vẽ tay',
          slug: 'den-long-hoi-an-ve-tay',
          price: 450000,
          discountPrice: 380000,
          images: [{ url: 'https://via.placeholder.com/300x300?text=Lantern', alt: 'Đèn lồng Hội An' }],
          craftVillage: { name: 'Phố cổ Hội An', slug: 'pho-co-hoi-an' }
        }
      ];
      
      setProducts(demoProducts);
      setLoading(false);
    }, 1000);
  }, []);

  if (error) {
    return <div className="error-message">Không thể tải sản phẩm: {error}</div>;
  }

  return (
    <section className="featured-products">
      <div className="container">
        <div className="section-header">
          <h2>Sản phẩm nổi bật</h2>
          <Link to="/products" className="view-all">Xem tất cả</Link>
        </div>

        {loading ? (
          <div className="loading">Đang tải sản phẩm...</div>
        ) : (
          <div className="product-grid">
            {products.map(product => (
              <div key={product._id} className="product-grid__item">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedProducts; 