import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Header.scss';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const location = useLocation();
  const accountMenuRef = useRef(null);
  const searchInputRef = useRef(null);

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

  return (
    <header className={`site-header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="header-top">
        <div className="logo">
          <Link to="/">
            <span className="logo-text">Việt<span>Trad</span></span>
          </Link>
        </div>

        <div className={`search-bar ${isSearchExpanded ? 'expanded' : ''}`} ref={searchInputRef}>
          <input type="text" placeholder="Tìm kiếm sản phẩm..." />
          <button type="submit" className="search-button">
            <i className="icon-search"></i>
          </button>
        </div>

        <div className="header-actions">
          <div className="action-item search-icon" onClick={toggleSearch}>
            <i className="icon-search"></i>
          </div>
          <Link to="/cart" className="action-item cart-icon">
            <i className="icon-cart"></i>
            <span className="cart-count">0</span>
          </Link>
          <div className="action-item account-icon" onClick={toggleAccountMenu} ref={accountMenuRef}>
            <i className="icon-user"></i>
            {isAccountMenuOpen && (
              <div className="account-dropdown">
                <div className="dropdown-item">
                  <Link to="/login">Đăng nhập</Link>
                </div>
                <div className="dropdown-item">
                  <Link to="/register">Đăng ký</Link>
                </div>
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
            <li className={location.pathname.includes('/heritage') ? 'active' : ''}>
              <Link to="/heritage">Di sản</Link>
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
  );
};

export default Header; 