import React from 'react';
import { Link } from 'react-router-dom';
import './About.scss';
import { 
  VIETNAMESE_TRADITIONAL_BACKGROUND,
  PHOENIX_DIVIDER,
  DONG_HO_PAINTING,
  BAT_TRANG_POTTERY,
  HUE_EMBROIDERY,
  HUE_IMPERIAL_CITY
} from '../assets/images';

const About = () => {
  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero" style={{ backgroundImage: `url(${VIETNAMESE_TRADITIONAL_BACKGROUND})` }}>
        <div className="overlay"></div>
        <div className="container">
          <div className="hero-content">
            <h1>Giới thiệu về Việt<span>Trad</span></h1>
            <p>Nơi kết nối tinh hoa nghệ thuật truyền thống Việt Nam với thế giới hiện đại</p>
          </div>
        </div>
        <div className="traditional-border"></div>
      </section>

      {/* Mission Section */}
      <section className="mission-section">
        <div className="container">
          <div className="mission-content">
            <div className="mission-text">
              <h2 className="section-title">Sứ mệnh của chúng tôi</h2>
              <p className="mission-description">
                VietTrad ra đời với sứ mệnh bảo tồn và phát huy những giá trị văn hóa truyền thống 
                Việt Nam qua việc kết nối người tiêu dùng với các sản phẩm thủ công đậm đà bản sắc dân tộc.
              </p>
              <div className="mission-points">
                <div className="mission-point">
                  <div className="icon">
                    <span>❤️</span>
                  </div>
                  <div className="content">
                    <h3>Bảo tồn di sản</h3>
                    <p>Gìn giữ và phát triển các nghề thủ công truyền thống của Việt Nam</p>
                  </div>
                </div>
                <div className="mission-point">
                  <div className="icon">
                    <span>🤝</span>
                  </div>
                  <div className="content">
                    <h3>Kết nối cộng đồng</h3>
                    <p>Tạo cầu nối giữa nghệ nhân làng nghề và người tiêu dùng hiện đại</p>
                  </div>
                </div>
                <div className="mission-point">
                  <div className="icon">
                    <span>⭐</span>
                  </div>
                  <div className="content">
                    <h3>Chất lượng đảm bảo</h3>
                    <p>Cam kết mang đến những sản phẩm chất lượng cao, chính hãng</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mission-image">
              <img src={HUE_IMPERIAL_CITY} alt="Di sản văn hóa Việt Nam" />
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="divider">
        <img src={PHOENIX_DIVIDER} alt="Hoa văn phượng" />
      </div>

      {/* Story Section */}
      <section className="story-section">
        <div className="container">
          <h2 className="section-title center">Câu chuyện của VietTrad</h2>
          <div className="story-content">
            <div className="story-text">
              <p>
                Trong thời đại công nghệ 4.0, nhiều nghề thủ công truyền thống đang dần mai một. 
                VietTrad được thành lập với mong muốn tạo ra một nền tảng số hóa hiện đại, 
                giúp các nghệ nhân và làng nghề có thể tiếp cận được với thị trường rộng lớn hơn.
              </p>
              <p>
                Chúng tôi tin rằng mỗi sản phẩm thủ công không chỉ là một món đồ, mà còn là 
                một câu chuyện, một phần lịch sử và văn hóa Việt Nam. Qua VietTrad, chúng tôi 
                muốn những câu chuyện này được kể lại và lan toa đến mọi miền đất nước và 
                cả thế giới.
              </p>
              <p>
                Từ những sản phẩm gốm sứ Bát Tràng tinh xảo, tranh Đông Hồ đầy màu sắc, 
                đến thêm thổ cẩm Tây Bắc đậm đà bản sắc - tất cả đều mang trong mình tâm huyết 
                và tài năng của những nghệ nhân tài hoa.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Heritage Products */}
      <section className="heritage-products">
        <div className="container">
          <h2 className="section-title center">Sản phẩm di sản</h2>
          <div className="heritage-grid">
            <div className="heritage-item">
              <div className="heritage-image">
                <img src={DONG_HO_PAINTING} alt="Tranh Đông Hồ" />
              </div>
              <div className="heritage-content">
                <h3>Tranh Đông Hồ</h3>
                <p>
                  Nghệ thuật tranh dân gian truyền thống với lịch sử hàng trăm năm, 
                  mang đậm tinh thần văn hóa Việt Nam.
                </p>
              </div>
            </div>
            <div className="heritage-item">
              <div className="heritage-image">
                <img src={BAT_TRANG_POTTERY} alt="Gốm sứ Bát Tràng" />
              </div>
              <div className="heritage-content">
                <h3>Gốm sứ Bát Tràng</h3>
                <p>
                  Làng nghề gốm sứ nổi tiếng với những sản phẩm tinh xảo, 
                  kỹ thuật chế tác truyền thống được truyền từ đời này sang đời khác.
                </p>
              </div>
            </div>
            <div className="heritage-item">
              <div className="heritage-image">
                <img src={HUE_EMBROIDERY} alt="Thêu Huế" />
              </div>
              <div className="heritage-content">
                <h3>Thêu Huế</h3>
                <p>
                  Nghệ thuật thêu truyền thống cung đình với những họa tiết tinh tế, 
                  thể hiện vẻ đẹp hoàng gia của cố đô Huế.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="values-section">
        <div className="container">
          <h2 className="section-title center">Giá trị cốt lõi</h2>
          <div className="values-grid">
            <div className="value-item">
              <div className="value-icon">
                <span>🛡️</span>
              </div>
              <h3>Chính hãng</h3>
              <p>Cam kết 100% sản phẩm chính hãng từ các nghệ nhân và làng nghề uy tín</p>
            </div>
            <div className="value-item">
              <div className="value-icon">
                <span>🌱</span>
              </div>
              <h3>Bền vững</h3>
              <p>Hỗ trợ phát triển bền vững các làng nghề và cộng đồng nghệ nhân</p>
            </div>
            <div className="value-item">
              <div className="value-icon">
                <span>👥</span>
              </div>
              <h3>Cộng đồng</h3>
              <p>Xây dựng cộng đồng yêu thích và bảo tồn văn hóa truyền thống</p>
            </div>
            <div className="value-item">
              <div className="value-icon">
                <span>⭐</span>
              </div>
              <h3>Chất lượng</h3>
              <p>Không ngừng nâng cao chất lượng sản phẩm và dịch vụ khách hàng</p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="team-section">
        <div className="container">
          <h2 className="section-title center">Đội ngũ của chúng tôi</h2>
          <div className="team-content">
            <p className="team-description">
              VietTrad được xây dựng bởi một đội ngũ trẻ tài năng với niềm đam mê 
              bảo tồn văn hóa truyền thống và công nghệ hiện đại.
            </p>
            <div className="team-stats">
              <div className="stat-item">
                <div className="stat-number">10+</div>
                <div className="stat-label">Thành viên</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">50+</div>
                <div className="stat-label">Làng nghề hợp tác</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">1000+</div>
                <div className="stat-label">Sản phẩm</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">5000+</div>
                <div className="stat-label">Khách hàng tin tưởng</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Cùng chúng tôi bảo tồn di sản văn hóa Việt Nam</h2>
            <p>
              Hãy tham gia vào hành trình khám phá và bảo tồn những giá trị văn hóa 
              truyền thống quý báu của dân tộc Việt Nam.
            </p>
            <div className="cta-buttons">
              <Link to="/products" className="btn btn-primary">Khám phá sản phẩm</Link>
              <Link to="/contact" className="btn btn-outline">Liên hệ với chúng tôi</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About; 