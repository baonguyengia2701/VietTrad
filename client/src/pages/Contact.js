import React from 'react';
import './Contact.scss';
import { 
  VIETNAMESE_TRADITIONAL_BACKGROUND,
  PHOENIX_DIVIDER
} from '../assets/images';

const Contact = () => {

  return (
    <div className="contact-page">
      {/* Hero Section */}
      <section className="contact-hero" style={{ backgroundImage: `url(${VIETNAMESE_TRADITIONAL_BACKGROUND})` }}>
        <div className="overlay"></div>
        <div className="container">
          <div className="hero-content">
            <h1>Liên hệ với chúng tôi</h1>
            <p>Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn</p>
          </div>
        </div>
        <div className="traditional-border"></div>
      </section>

      {/* Contact Info Section */}
      <section className="contact-info-section">
        <div className="container">
          <div className="contact-info-single">
            <h2 className="section-title center">Thông tin liên hệ</h2>
            <div className="contact-items">
              <div className="contact-item">
                <div className="contact-icon">
                  <i className="icon-location"></i>
                </div>
                <div className="contact-content">
                  <h3>Địa chỉ</h3>
                  <p>CT3C-X2 Khu đô thị Bắc Linh Đàm, Hoàng Mai, Hà Nội</p>
                </div>
              </div>
              
              <div className="contact-item">
                <div className="contact-icon">
                  <i className="icon-phone"></i>
                </div>
                <div className="contact-content">
                  <h3>Điện thoại</h3>
                  <p>0334 133 154</p>
                  <p>Thời gian làm việc: 8:00 - 17:30 (Thứ 2 - Chủ nhật)</p>
                </div>
              </div>
              
              <div className="contact-item">
                <div className="contact-icon">
                  <i className="icon-mail"></i>
                </div>
                <div className="contact-content">
                  <h3>Email</h3>
                  <p>baonguyengia2701@gmail.com</p>
                  <p>Chúng tôi phản hồi trong vòng 24 giờ</p>
                </div>
              </div>
              
              <div className="contact-item">
                <div className="contact-icon">
                  <i className="icon-clock"></i>
                </div>
                <div className="contact-content">
                  <h3>Giờ làm việc</h3>
                  <p>Thứ 2 - Thứ 6: 8:00 - 17:30</p>
                  <p>Thứ 7 - Chủ nhật: 9:00 - 17:00</p>
                </div>
              </div>
            </div>
            
            <div className="social-contact">
              <h3>Kết nối với chúng tôi</h3>
              <div className="social-links">
                <a href="https://www.facebook.com/baodz2701/" target="_blank" rel="noopener noreferrer">
                  <i className="icon-facebook"></i>
                  <span>Facebook</span>
                </a>
                <a href="https://www.instagram.com/baoyeutminhvcl/" target="_blank" rel="noopener noreferrer">
                  <i className="icon-instagram"></i>
                  <span>Instagram</span>
                </a>
                <a href="https://www.youtube.com/watch?v=liQPn9zCVNE" target="_blank" rel="noopener noreferrer">
                  <i className="icon-youtube"></i>
                  <span>YouTube</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="divider">
        <img src={PHOENIX_DIVIDER} alt="Hoa văn phượng" />
      </div>

      {/* FAQ Section */}
      <section className="faq-section">
        <div className="container">
          <h2 className="section-title center">Câu hỏi thường gặp</h2>
          <div className="faq-list">
            <div className="faq-item">
              <div className="faq-question">
                <h3>Làm thế nào để đặt hàng trên VietTrad?</h3>
                <i className="icon-plus"></i>
              </div>
              <div className="faq-answer">
                <p>
                  Bạn có thể duyệt sản phẩm, thêm vào giỏ hàng và thanh toán dễ dàng. 
                  Chúng tôi hỗ trợ nhiều phương thức thanh toán an toàn.
                </p>
              </div>
            </div>
            
            <div className="faq-item">
              <div className="faq-question">
                <h3>Thời gian giao hàng là bao lâu?</h3>
                <i className="icon-plus"></i>
              </div>
              <div className="faq-answer">
                <p>
                  Thời gian giao hàng từ 2-7 ngày làm việc tùy theo khu vực. 
                  Các sản phẩm thủ công có thể cần thời gian sản xuất thêm.
                </p>
              </div>
            </div>
            
            <div className="faq-item">
              <div className="faq-question">
                <h3>Tôi có thể đổi trả sản phẩm không?</h3>
                <i className="icon-plus"></i>
              </div>
              <div className="faq-answer">
                <p>
                  Chúng tôi chấp nhận đổi trả trong vòng 7 ngày kể từ khi nhận hàng 
                  với điều kiện sản phẩm còn nguyên vẹn.
                </p>
              </div>
            </div>
            
            <div className="faq-item">
              <div className="faq-question">
                <h3>Làm thế nào để trở thành đối tác bán hàng?</h3>
                <i className="icon-plus"></i>
              </div>
              <div className="faq-answer">
                <p>
                  Vui lòng liên hệ với chúng tôi qua email hoặc điện thoại. 
                  Chúng tôi luôn chào đón các nghệ nhân và làng nghề hợp tác.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="map-section">
        <div className="container">
          <h2 className="section-title center">Tìm chúng tôi</h2>
          <div className="map-container">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3725.1016240624345!2d105.88088571495456!3d20.982441494654027!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135acce762c2bb9%3A0x6cc3c0e3d7b5e725!2zQ1QzQy1YMiBLaHUgxJHDtCB0aOG7iyBCxINjIExpbmggxJDDoG0!5e0!3m2!1svi!2s!4v1634567890123!5m2!1svi!2s"
              width="100%"
              height="400"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="VietTrad Location"
            ></iframe>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact; 