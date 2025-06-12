import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import CartSidebar from './common/CartSidebar';
import './Header.scss';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isCartSidebarOpen, setIsCartSidebarOpen] = useState(false);
  const location = useLocation();
  const accountMenuRef = useRef(null);
  const searchInputRef = useRef(null);
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const { getTotalItems } = useCart();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    const handleClickOutside = (event) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target)) {
        setIsAccountMenuOpen(false);
      }
      if (searchInputRef.current && !searchInputRef.current.contains(event.target) && !event.target.classList.contains('icon-search')) {
        setIsSearchExpanded(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleAccountMenu = () => {
    setIsAccountMenuOpen(!isAccountMenuOpen);
  };

  const toggleSearch = () => {
    setIsSearchExpanded(!isSearchExpanded);
    if (!isSearchExpanded) {
      setTimeout(() => {
        searchInputRef.current && searchInputRef.current.focus();
      }, 100);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm('');
      setIsSearchExpanded(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const toggleCartSidebar = () => {
    setIsCartSidebarOpen(!isCartSidebarOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <header className={`site-header ${isScrolled ? 'scrolled' : ''}`}>
        <div className="header-top">
          <div className="logo">
            <Link to="/">
              <span className="logo-text">Việt<span>Trad</span></span>
            </Link>
          </div>

          <form onSubmit={handleSearchSubmit} className={`search-bar ${isSearchExpanded ? 'expanded' : ''}`}>
            <input 
              type="text" 
              placeholder="Tìm kiếm sản phẩm..." 
              value={searchTerm}
              onChange={handleSearchChange}
              ref={searchInputRef}
            />
            <button type="submit" className="search-button">
              <i className="icon-search"></i>
            </button>
          </form>

          <div className="header-actions">
            <div className="action-item search-icon" onClick={toggleSearch}>
              <i className="icon-search"></i>
            </div>
            <div className="action-item cart-icon" onClick={toggleCartSidebar}>
              <i className="icon-cart"></i>
              <span className="cart-count">{getTotalItems()}</span>
            </div>
            <div className="action-item account-icon" onClick={toggleAccountMenu} ref={accountMenuRef}>
              <i className="icon-user"></i>
              {isAccountMenuOpen && (
                <div className="account-dropdown">
                  {currentUser ? (
                    <>
                      <div className="dropdown-header">
                        <h4>THÔNG TIN TÀI KHOẢN</h4>
                      </div>
                      <div className="dropdown-user-name">{currentUser.name}</div>
                      <div className="dropdown-item">
                        <Link to="/profile">Tài khoản của tôi</Link>
                      </div>
                      {currentUser.isAdmin && (
                        <div className="dropdown-item">
                          <Link to="/admin">Quản trị viên</Link>
                        </div>
                      )}
                      <div className="dropdown-item">
                        <button className="logout-btn" onClick={handleLogout}>Đăng xuất</button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="dropdown-item">
                        <Link to="/login">Đăng nhập</Link>
                      </div>
                      <div className="dropdown-item">
                        <Link to="/register">Đăng ký</Link>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="mobile-menu-toggle" onClick={toggleMobileMenu}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>

        <div className="header-bottom">
          <nav className={`main-nav ${isMobileMenuOpen ? 'open' : ''}`}>
            <ul>
              <li className={location.pathname === '/' ? 'active' : ''}>
                <Link to="/">Trang chủ</Link>
              </li>
              <li className={location.pathname.includes('/products') ? 'active' : ''}>
                <Link to="/products">Sản phẩm</Link>
              </li>
              <li className={location.pathname.includes('/lang-nghe') ? 'active' : ''}>
                <Link to="/lang-nghe">Làng nghề</Link>
              </li>
              <li className={location.pathname.includes('/about') ? 'active' : ''}>
                <Link to="/about">Giới thiệu</Link>
              </li>
              <li className={location.pathname.includes('/contact') ? 'active' : ''}>
                <Link to="/contact">Liên hệ</Link>
              </li>
            </ul>
          </nav>
        </div>

        <div className="traditional-border"></div>
      </header>

      {/* Cart Sidebar */}
      <CartSidebar 
        isOpen={isCartSidebarOpen}
        onClose={() => setIsCartSidebarOpen(false)}
      />
    </>
  );
};

export default Header; 