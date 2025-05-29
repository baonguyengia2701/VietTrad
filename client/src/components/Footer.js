import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.scss';

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="traditional-border"></div>
      
      <div className="footer-main">
        <div className="container">
          <div className="footer-columns">
            <div className="footer-column">
              <div className="footer-logo">
                <span className="logo-text">Việt<span>Trad</span></span>
              </div>
              <p className="footer-description">
                Nền tảng thương mại điện tử kết nối người tiêu dùng với các sản phẩm thủ công truyền thống
                đậm đà bản sắc văn hóa Việt Nam
              </p>
              <div className="social-icons">
                <a href="https://www.facebook.com/baodz2701/" target="_blank" rel="noopener noreferrer">
                  <i className="icon-facebook"></i>
                </a>
                <a href="https://www.instagram.com/baoyeutminhvcl/" target="_blank" rel="noopener noreferrer">
                  <i className="icon-instagram"></i>
                </a>
                <a href="https://www.youtube.com/watch?v=liQPn9zCVNE" target="_blank" rel="noopener noreferrer">
                  <i className="icon-youtube"></i>
                </a>
              </div>
            </div>
            
            <div className="footer-column">
              <h3 className="footer-heading">Khám phá</h3>
              <ul className="footer-links">
                <li><Link to="/products">Sản phẩm</Link></li>
                <li><Link to="/heritage">Di sản Việt Nam</Link></li>
                <li><Link to="/about">Giới thiệu</Link></li>
                <li><Link to="/contact">Liên hệ</Link></li>
              </ul>
            </div>
            
            <div className="footer-column">
              <h3 className="footer-heading">Chính sách</h3>
              <ul className="footer-links">
                <li><Link to="/policies/shipping">Chính sách vận chuyển</Link></li>
                <li><Link to="/policies/returns">Chính sách đổi trả</Link></li>
                <li><Link to="/policies/privacy">Chính sách bảo mật</Link></li>
                <li><Link to="/policies/terms">Điều khoản dịch vụ</Link></li>
              </ul>
            </div>
            
            <div className="footer-column">
              <h3 className="footer-heading">Liên hệ</h3>
              <address className="footer-contact">
                <p><i className="icon-location"></i> CT3C-X2 Khu đô thị Bắc Linh Đàm, Hà Nội</p>
                <p><i className="icon-phone"></i> 0334133154</p>
                <p><i className="icon-mail"></i> baonguyengia2701@gmail.com</p>
              </address>
            </div>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <div className="container">
          <div className="copyright">
            <p>&copy; {new Date().getFullYear()} VietTrad. Tất cả quyền được bảo lưu.</p>
          </div>
          <div className="payment-icons">
            <img src="https://cdn-icons-png.flaticon.com/512/196/196578.png" alt="Visa" />
            <img src="https://cdn-icons-png.flaticon.com/512/196/196561.png" alt="MasterCard" />
            <img src="https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png" alt="MoMo" />
            <img src="https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-VNPAY-QR-1.png" alt="VNPay" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 