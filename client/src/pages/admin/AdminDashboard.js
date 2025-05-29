import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderService } from '../../services/orderService';
import './AdminDashboard.scss';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
    paidRevenue: 0,
    ordersByStatus: {},
    recentOrders: [],
    topProducts: [],
    lowStockProducts: [],
    monthlyStats: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await orderService.getDashboardStats();
      
      if (response.success) {
        setStats(response.data);
      } else {
        setError('Không thể tải dữ liệu dashboard');
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setError(error.message || 'Có lỗi xảy ra khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return '#28a745';
      case 'shipped': return '#17a2b8';
      case 'processing': return '#ffc107';
      case 'confirmed': return '#007bff';
      case 'pending': return '#dc3545';
      case 'cancelled': return '#6c757d';
      default: return '#6c757d';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'delivered': return 'Đã giao';
      case 'shipped': return 'Đang giao';
      case 'processing': return 'Đang xử lý';
      case 'confirmed': return 'Đã xác nhận';
      case 'pending': return 'Chờ xử lý';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered': return 'fas fa-check-circle';
      case 'shipped': return 'fas fa-truck';
      case 'processing': return 'fas fa-cog';
      case 'confirmed': return 'fas fa-check';
      case 'pending': return 'fas fa-clock';
      case 'cancelled': return 'fas fa-times-circle';
      default: return 'fas fa-question-circle';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="dashboard-header">
          <h1>Bảng Điều Khiển Admin</h1>
          <p>Đang tải dữ liệu...</p>
        </div>
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard">
        <div className="dashboard-header">
          <h1>Bảng Điều Khiển Admin</h1>
          <p>Có lỗi xảy ra</p>
        </div>
        <div className="error-message">
          <p>{error}</p>
          <button onClick={fetchDashboardStats} className="retry-btn">
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Bảng Điều Khiển Admin</h1>
        <p>Chào mừng bạn đến với trang quản trị VietTrad</p>
        <div className="last-updated">
          Cập nhật lần cuối: {formatDate(new Date())}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon products">
            <i className="fas fa-box"></i>
          </div>
          <div className="stat-content">
            <h3>{stats.totalProducts.toLocaleString('vi-VN')}</h3>
            <p>Tổng Sản Phẩm</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon orders">
            <i className="fas fa-shopping-cart"></i>
          </div>
          <div className="stat-content">
            <h3>{stats.totalOrders.toLocaleString('vi-VN')}</h3>
            <p>Tổng Đơn Hàng</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon users">
            <i className="fas fa-users"></i>
          </div>
          <div className="stat-content">
            <h3>{stats.totalUsers.toLocaleString('vi-VN')}</h3>
            <p>Tổng Người Dùng</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon revenue">
            <i className="fas fa-dollar-sign"></i>
          </div>
          <div className="stat-content">
            <h3>{formatCurrency(stats.totalRevenue)}</h3>
            <p>Tổng Doanh Thu (Đã Giao)</p>
            <small className="paid-revenue">
              Đã thanh toán: {formatCurrency(stats.paidRevenue)}
            </small>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2>Thao Tác Nhanh</h2>
        <div className="actions-grid">
          <Link to="/admin/products/new" className="action-card">
            <i className="fas fa-plus"></i>
            <span>Thêm Sản Phẩm</span>
          </Link>
          <Link to="/admin/orders" className="action-card">
            <i className="fas fa-list"></i>
            <span>Quản Lý Đơn Hàng</span>
          </Link>
          <Link to="/admin/users" className="action-card">
            <i className="fas fa-user-cog"></i>
            <span>Quản Lý Người Dùng</span>
          </Link>
          <Link to="/admin/categories" className="action-card">
            <i className="fas fa-tags"></i>
            <span>Quản Lý Danh Mục</span>
          </Link>
          <Link to="/admin/brands" className="action-card">
            <i className="fas fa-award"></i>
            <span>Quản Lý Thương Hiệu</span>
          </Link>
          <button onClick={fetchDashboardStats} className="action-card refresh-card">
            <i className="fas fa-sync-alt"></i>
            <span>Làm Mới Dữ Liệu</span>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="dashboard-content">
        <div className="recent-orders">
          <h2>Đơn Hàng Gần Đây</h2>
          {stats.recentOrders.length > 0 ? (
            <div className="orders-table">
              <table>
                <thead>
                  <tr>
                    <th>Mã Đơn</th>
                    <th>Khách Hàng</th>
                    <th>Tổng Tiền</th>
                    <th>Trạng Thái</th>
                    <th>Ngày Đặt</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentOrders.map(order => (
                    <tr key={order.id}>
                      <td>
                        <Link to={`/admin/orders/${order.id}`} className="order-link">
                          {order.id}
                        </Link>
                      </td>
                      <td>{order.customer}</td>
                      <td>{formatCurrency(order.total)}</td>
                      <td>
                        <span 
                          className="status-badge"
                          style={{ backgroundColor: getStatusColor(order.status) }}
                        >
                          {getStatusText(order.status)}
                        </span>
                      </td>
                      <td>{formatDate(order.date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="no-data">
              <p>Chưa có đơn hàng nào</p>
            </div>
          )}
        </div>

        <div className="sidebar-widgets">
          <div className="top-products">
            <h2>Sản Phẩm Bán Chạy</h2>
            {stats.topProducts.length > 0 ? (
              <div className="products-list">
                {stats.topProducts.map((product, index) => (
                  <div key={index} className="product-item">
                    <div className="product-info">
                      {product.image && (
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="product-image"
                        />
                      )}
                      <span className="product-name">{product.name}</span>
                    </div>
                    <span className="product-sales">
                      {product.sales.toLocaleString('vi-VN')} đã bán
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-data">
                <p>Chưa có dữ liệu bán hàng</p>
              </div>
            )}
          </div>

          {/* Low Stock Alert */}
          {stats.lowStockProducts.length > 0 && (
            <div className="low-stock-alert">
              <h2>
                <i className="fas fa-exclamation-triangle"></i>
                Sản Phẩm Sắp Hết Hàng
              </h2>
              <div className="products-list">
                {stats.lowStockProducts.map((product, index) => (
                  <div key={index} className="product-item low-stock">
                    <div className="product-info">
                      {product.image && (
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="product-image"
                        />
                      )}
                      <span className="product-name">{product.name}</span>
                    </div>
                    <span className="product-stock">
                      Còn {product.stock}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Order Status Breakdown */}
      {stats.ordersByStatus && Object.keys(stats.ordersByStatus).length > 0 && (
        <div className="order-status-section">
          <h2>Thống Kê Đơn Hàng Theo Trạng Thái</h2>
          <div className="status-grid">
            {Object.entries(stats.ordersByStatus).map(([status, count]) => (
              <div key={status} className="status-card">
                <div className="status-icon" style={{ backgroundColor: getStatusColor(status) }}>
                  <i className={getStatusIcon(status)}></i>
                </div>
                <div className="status-content">
                  <h3>{count.toLocaleString('vi-VN')}</h3>
                  <p>{getStatusText(status)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Monthly Revenue Chart */}
      {stats.monthlyStats.length > 0 && (
        <div className="monthly-chart-section">
          <h2>Doanh Thu 6 Tháng Gần Đây</h2>
          <div className="chart-container">
            <div className="chart-bars">
              {stats.monthlyStats.map((month, index) => {
                const maxRevenue = Math.max(...stats.monthlyStats.map(m => m.revenue));
                const height = maxRevenue > 0 ? (month.revenue / maxRevenue) * 200 : 0;
                
                return (
                  <div key={index} className="chart-bar">
                    <div 
                      className="bar" 
                      style={{ height: `${height}px` }}
                      title={`${month.month}: ${formatCurrency(month.revenue)}`}
                    ></div>
                    <div className="bar-label">
                      <div className="month">{month.month}</div>
                      <div className="orders">{month.orders} đơn</div>
                      <div className="revenue">{formatCurrency(month.revenue)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard; 