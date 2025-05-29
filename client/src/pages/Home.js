import React from 'react';
import { Link } from 'react-router-dom';
import FeaturedProducts from '../components/product/FeaturedProducts';
import FeaturedCategories from '../components/category/FeaturedCategories';
import './Home.scss';
import { 
  VIETNAMESE_TRADITIONAL_BACKGROUND, 
  PHOENIX_DIVIDER
} from '../assets/images';

const Home = () => {
  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section" style={{ backgroundImage: `url(${VIETNAMESE_TRADITIONAL_BACKGROUND})` }}>
        <div className="overlay"></div>
        <div className="container">
          <div className="hero-content">
            <h1>Việt<span>Trad</span></h1>
            <h2>Tinh hoa nghệ thuật Việt Nam</h2>
            <p>Khám phá những sản phẩm mang đậm bản sắc văn hóa và nghệ thuật truyền thống Việt Nam</p>
            <div className="hero-buttons">
              <Link to="/products" className="btn btn-primary">Khám phá sản phẩm</Link>
              <Link to="/di-san" className="btn btn-outline">Tìm hiểu làng nghề</Link>
            </div>
          </div>
        </div>
        <div className="traditional-border"></div>
      </section>

      {/* Featured Categories - Sử dụng component với API thật */}
      <FeaturedCategories />

      {/* Featured Products - Sử dụng component với API thật */}
      <FeaturedProducts />
      
      {/* Divider */}
      <div className="divider">
        <img src={PHOENIX_DIVIDER} alt="Hoa văn phượng" />
      </div>

      {/* Heritage Story Section */}
      <section className="heritage-story">
        <div className="container">
          <div className="heritage-content">
            <div className="heritage-text">
              <h2 className="section-title">Câu chuyện di sản</h2>
              <p>
                Mỗi sản phẩm là một câu chuyện, một phần lịch sử và văn hóa Việt Nam. 
                Chúng tôi không chỉ mang đến những sản phẩm chất lượng mà còn kể lại 
                câu chuyện phía sau mỗi làng nghề, mỗi nghệ nhân tài hoa.
              </p>
              <p>
                Tại VietTrad, chúng tôi tự hào góp phần bảo tồn và phát triển các giá trị 
                văn hóa truyền thống, đồng thời giúp các làng nghề có thêm nguồn thu nhập 
                bền vững trong thời đại hiện nay.
              </p>
              <Link to="/di-san" className="btn btn-primary">Khám phá câu chuyện</Link>
            </div>
            <div className="heritage-image">
              <div className="image-frame">
                <img src="https://dantra.vn/assets/san-pham/2023_09/lang-non-tay-ho.jpg" alt="Di sản văn hóa Việt Nam" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="newsletter-section">
        <div className="container">
          <div className="newsletter-content">
            <h2>Đăng ký nhận tin</h2>
            <p>Cập nhật thông tin về sản phẩm mới, câu chuyện văn hóa và ưu đãi đặc biệt</p>
            <form className="newsletter-form">
              <input type="email" placeholder="Địa chỉ email của bạn" required />
              <button type="submit" className="btn btn-primary">Đăng ký</button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home; 