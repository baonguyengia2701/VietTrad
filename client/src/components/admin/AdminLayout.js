import React, { useState, useEffect } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './AdminLayout.scss';

const AdminLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

  // Check if screen is mobile
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
      // Auto collapse sidebar on mobile
      if (window.innerWidth <= 768) {
        setSidebarCollapsed(true);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const menuItems = [
    {
      path: '/admin',
      icon: 'fas fa-tachometer-alt',
      label: 'Bảng Điều Khiển',
      exact: true
    },
    {
      path: '/admin/products',
      icon: 'fas fa-box',
      label: 'Quản Lý Sản Phẩm'
    },
    {
      path: '/admin/orders',
      icon: 'fas fa-shopping-cart',
      label: 'Quản Lý Đơn Hàng'
    },
    {
      path: '/admin/users',
      icon: 'fas fa-users',
      label: 'Quản Lý Người Dùng'
    },
    {
      path: '/admin/categories',
      icon: 'fas fa-tags',
      label: 'Quản Lý Danh Mục'
    },
    {
      path: '/admin/brands',
      icon: 'fas fa-star',
      label: 'Quản Lý Thương Hiệu'
    },
    {
      path: '/admin/reviews',
      icon: 'fas fa-comment',
      label: 'Quản Lý Đánh Giá'
    },
    {
      path: '/admin/settings',
      icon: 'fas fa-cog',
      label: 'Cài Đặt'
    }
  ];

  const isActiveRoute = (path, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleOverlayClick = () => {
    if (isMobile) {
      setSidebarCollapsed(true);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleProfileDropdown = () => {
    setShowProfileDropdown(!showProfileDropdown);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showProfileDropdown && !event.target.closest('.admin-profile')) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfileDropdown]);

  return (
    <div className={`admin-layout ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <i className="fas fa-store"></i>
            {!sidebarCollapsed && <span>VietTrad Admin</span>}
          </div>
          <button className="toggle-btn" onClick={toggleSidebar}>
            <i className={`fas ${sidebarCollapsed ? 'fa-chevron-right' : 'fa-chevron-left'}`}></i>
          </button>
        </div>

        <nav className="sidebar-nav">
          <ul>
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`nav-link ${isActiveRoute(item.path, item.exact) ? 'active' : ''}`}
                  title={sidebarCollapsed ? item.label : ''}
                  onClick={() => isMobile && setSidebarCollapsed(true)}
                >
                  <i className={item.icon}></i>
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <Link 
            to="/" 
            className="nav-link" 
            title={sidebarCollapsed ? 'Về Trang Chủ' : ''}
            onClick={() => isMobile && setSidebarCollapsed(true)}
          >
            <i className="fas fa-home"></i>
            {!sidebarCollapsed && <span>Về Trang Chủ</span>}
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="admin-main">
        {/* Header */}
        <header className="admin-header">
          <div className="header-left">
            <button className="mobile-menu-btn" onClick={toggleSidebar}>
              <i className="fas fa-bars"></i>
            </button>
            <h1>Quản Trị VietTrad</h1>
          </div>

          <div className="header-right">
            <div className="notifications">
              <button className="notification-btn">
                <i className="fas fa-bell"></i>
                <span className="notification-badge">3</span>
              </button>
            </div>

            <div className="admin-profile">
              <div className="profile-info" onClick={toggleProfileDropdown}>
                <span className="admin-name">{currentUser?.name || 'Admin User'}</span>
                <span className="admin-role">Quản trị viên</span>
              </div>
              <div className="profile-avatar" onClick={toggleProfileDropdown}>
                <i className="fas fa-user-circle"></i>
              </div>
              
              {showProfileDropdown && (
                <div className="profile-dropdown">
                  <div className="dropdown-header">
                    <div className="user-info">
                      <strong>{currentUser?.name || 'Admin User'}</strong>
                      <span>{currentUser?.email}</span>
                    </div>
                  </div>
                  <div className="dropdown-menu">
                    <Link to="/profile" className="dropdown-item">
                      <i className="fas fa-user"></i>
                      Thông tin cá nhân
                    </Link>
                    <Link to="/admin/settings" className="dropdown-item">
                      <i className="fas fa-cog"></i>
                      Cài đặt
                    </Link>
                    <div className="dropdown-divider"></div>
                    <button onClick={handleLogout} className="dropdown-item logout-btn">
                      <i className="fas fa-sign-out-alt"></i>
                      Đăng xuất
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="admin-content">
          <Outlet />
        </main>
      </div>

      {/* Mobile Overlay - Only show on mobile when sidebar is open */}
      {isMobile && !sidebarCollapsed && (
        <div className="mobile-overlay" onClick={handleOverlayClick}></div>
      )}
    </div>
  );
};

export default AdminLayout; 