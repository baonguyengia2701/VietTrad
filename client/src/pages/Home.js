import React from 'react';
import { Link } from 'react-router-dom';
import './Home.scss';
import { 
  VIETNAMESE_TRADITIONAL_BACKGROUND, 
  DONG_HO_PAINTING, 
  BAT_TRANG_POTTERY, 
  HUE_EMBROIDERY,
  NON_LA,
  SILK_PAINTING,
  EMBROIDERED_SILK,
  DRAGON_DIVIDER,
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
              <Link to="/heritage" className="btn btn-outline">Tìm hiểu làng nghề</Link>
            </div>
          </div>
        </div>
        <div className="traditional-border"></div>
      </section>

      {/* Featured Categories */}
      <section className="featured-categories">
        <div className="container">
          <h2 className="section-title">Danh mục nổi bật</h2>
          <div className="category-description">
            <p>Nghệ thuật truyền thống Việt Nam qua các sản phẩm tinh hoa hàng trăm năm lịch sử</p>
          </div>
          <div className="categories-grid">
            <div className="category-card">
              <div className="category-image">
                <img src={DONG_HO_PAINTING} alt="Tranh dân gian" />
              </div>
              <h3>Tranh dân gian</h3>
              <Link to="/products/paintings" className="category-link">Khám phá</Link>
            </div>
            <div className="category-card">
              <div className="category-image">
                <img src={BAT_TRANG_POTTERY} alt="Gốm sứ" />
              </div>
              <h3>Gốm sứ</h3>
              <Link to="/products/pottery" className="category-link">Khám phá</Link>
            </div>
            <div className="category-card">
              <div className="category-image">
                <img src={HUE_EMBROIDERY} alt="Thêu thùa" />
              </div>
              <h3>Thêu thùa</h3>
              <Link to="/products/embroidery" className="category-link">Khám phá</Link>
            </div>
          </div>
        </div>
        <div className="divider">
          <img src={DRAGON_DIVIDER} alt="Hoa văn rồng" />
        </div>
      </section>

      {/* Featured Products */}
      <section className="featured-products">
        <div className="container">
          <h2 className="section-title">Sản phẩm nổi bật</h2>
          <div className="products-grid">
            <div className="product-card">
              <div className="product-image">
                <img src={NON_LA} alt="Nón lá truyền thống" />
                <div className="product-overlay">
                  <div className="overlay-buttons">
                    <button className="btn-icon"><i className="icon-heart"></i></button>
                    <button className="btn-icon"><i className="icon-cart"></i></button>
                    <Link to="/products/non-la-truyen-thong" className="btn-icon"><i className="icon-eye"></i></Link>
                  </div>
                </div>
              </div>
              <div className="product-info">
                <h3>Nón lá truyền thống</h3>
                <div className="product-price">
                  <span>120.000₫</span>
                </div>
                <div className="product-origin">
                  <span>Làng nghề: Chuông, Hà Nội</span>
                </div>
              </div>
            </div>
            
            <div className="product-card">
              <div className="product-image">
                <img src={SILK_PAINTING} alt="Tranh lụa" />
                <div className="product-overlay">
                  <div className="overlay-buttons">
                    <button className="btn-icon"><i className="icon-heart"></i></button>
                    <button className="btn-icon"><i className="icon-cart"></i></button>
                    <Link to="/products/tranh-lua-phong-canh" className="btn-icon"><i className="icon-eye"></i></Link>
                  </div>
                </div>
              </div>
              <div className="product-info">
                <h3>Tranh lụa phong cảnh</h3>
                <div className="product-price">
                  <span>1.500.000₫</span>
                </div>
                <div className="product-origin">
                  <span>Làng nghề: Vạn Phúc, Hà Đông</span>
                </div>
              </div>
            </div>
            
            <div className="product-card">
              <div className="product-image">
                <img src={EMBROIDERED_SILK} alt="Khăn lụa thêu" />
                <div className="product-overlay">
                  <div className="overlay-buttons">
                    <button className="btn-icon"><i className="icon-heart"></i></button>
                    <button className="btn-icon"><i className="icon-cart"></i></button>
                    <Link to="/products/khan-lua-theu" className="btn-icon"><i className="icon-eye"></i></Link>
                  </div>
                </div>
              </div>
              <div className="product-info">
                <h3>Khăn lụa thêu hoa sen</h3>
                <div className="product-price">
                  <span>450.000₫</span>
                </div>
                <div className="product-origin">
                  <span>Làng nghề: Quất Động, Thường Tín</span>
                </div>
              </div>
            </div>
          </div>
          <div className="view-all-container">
            <Link to="/products" className="btn btn-outline">Xem tất cả sản phẩm</Link>
          </div>
        </div>
        <div className="divider">
          <img src={PHOENIX_DIVIDER} alt="Hoa văn phượng" />
        </div>
      </section>

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
              <Link to="/heritage" className="btn btn-primary">Khám phá câu chuyện</Link>
            </div>
            <div className="heritage-image">
              <div className="image-frame">
                <img src="https://upload.wikimedia.org/wikipedia/commons/8/8c/Imperial_City%2C_Hu%E1%BA%BF%2C_Vietnam_%2840559743483%29.jpg" alt="Di sản văn hóa Việt Nam" />
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