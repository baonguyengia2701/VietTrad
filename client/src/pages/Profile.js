import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import userService from '../services/userService';
import { orderService } from '../services/orderService';
import PasswordInput from '../components/PasswordInput';
import './Profile.scss';

const Profile = () => {
  const navigate = useNavigate();
  const { currentUser, updateUserProfile } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('account'); // 'account', 'orders', 'password'
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersPagination, setOrdersPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
    limit: 10
  });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      postalCode: '',
      country: 'Vietnam'
    },
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState({});

  // Tải thông tin người dùng khi component được mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        if (!currentUser) {
          // Nếu chưa đăng nhập, chuyển về trang login
          navigate('/login');
          return;
        }

        setLoading(true);
        // Lấy thông tin profile đầy đủ từ API
        const userProfile = await userService.getUserProfile();
        setUser(userProfile);
        
        // Cập nhật formData từ thông tin người dùng
        setFormData({
          name: userProfile.name || '',
          email: userProfile.email || '',
          phone: userProfile.phone || '',
          address: {
            street: userProfile.address?.street || '',
            city: userProfile.address?.city || '',
            postalCode: userProfile.address?.postalCode || '',
            country: userProfile.address?.country || 'Vietnam'
          },
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } catch (error) {
        setApiError('Không thể tải thông tin người dùng. Vui lòng thử lại sau.');
        console.error('Error fetching user profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [currentUser, navigate]);

  // Fetch orders when orders tab is active
  useEffect(() => {
    if (activeTab === 'orders' && currentUser) {
      fetchOrders();
    }
  }, [activeTab, currentUser, ordersPagination.page]);

  const fetchOrders = async () => {
    try {
      setOrdersLoading(true);
      const response = await orderService.getMyOrders(ordersPagination.page, ordersPagination.limit);
      
      if (response.success) {
        setOrders(response.data.orders);
        setOrdersPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setApiError('Không thể tải lịch sử đơn hàng. Vui lòng thử lại sau.');
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
    
    // Xóa thông báo lỗi khi người dùng nhập lại
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
    
    // Xóa thông báo lỗi/thành công khi người dùng thay đổi form
    setApiError('');
    setSuccessMessage('');
  };

  const validateForm = () => {
    const tempErrors = {};
    
    if (!formData.name) {
      tempErrors.name = 'Vui lòng nhập họ tên';
    }
    
    if (!formData.email) {
      tempErrors.email = 'Vui lòng nhập email';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      tempErrors.email = 'Email không hợp lệ';
    }
    
    // Kiểm tra mật khẩu nếu người dùng muốn thay đổi
    if (formData.newPassword) {
      if (!formData.currentPassword) {
        tempErrors.currentPassword = 'Vui lòng nhập mật khẩu hiện tại';
      }
      
      if (formData.newPassword.length < 6) {
        tempErrors.newPassword = 'Mật khẩu phải có ít nhất 6 ký tự';
      }
      
      if (formData.newPassword !== formData.confirmPassword) {
        tempErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
      }
    }
    
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        setLoading(true);
        setApiError('');
        setSuccessMessage('');
        
        // Chuẩn bị dữ liệu cập nhật
        const updateData = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address
        };
        
        // Thêm password nếu người dùng muốn thay đổi
        if (formData.newPassword) {
          updateData.password = formData.newPassword;
        }
        
        // Gọi API cập nhật thông tin
        const updatedUser = await updateUserProfile(updateData);
        
        // Cập nhật state với thông tin mới
        setUser(updatedUser);
        setSuccessMessage('Cập nhật thông tin thành công!');
        setIsEditing(false);
        
        // Reset password fields
        setFormData({
          ...formData,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } catch (error) {
        setApiError(error.toString());
      } finally {
        setLoading(false);
      }
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setApiError('');
    setSuccessMessage('');
  };

  const formatPrice = (price) => {
    return price?.toLocaleString('vi-VN') || '0';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusText = (status) => {
    const statusMap = {
      pending: 'Chờ xác nhận',
      confirmed: 'Đã xác nhận',
      processing: 'Đang xử lý',
      shipped: 'Đang giao hàng',
      delivered: 'Đã giao hàng',
      cancelled: 'Đã hủy'
    };
    return statusMap[status] || status;
  };

  const getStatusClass = (status) => {
    const statusClasses = {
      pending: 'status-pending',
      confirmed: 'status-confirmed',
      processing: 'status-processing',
      shipped: 'status-shipped',
      delivered: 'status-delivered',
      cancelled: 'status-cancelled'
    };
    return statusClasses[status] || '';
  };

  const handleCancelOrder = async (orderId) => {
    if (window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) {
      try {
        const response = await orderService.cancelOrder(orderId, 'Khách hàng yêu cầu hủy');
        
        if (response.success) {
          setSuccessMessage('Đơn hàng đã được hủy thành công');
          // Refresh orders list
          fetchOrders();
        }
      } catch (error) {
        console.error('Error cancelling order:', error);
        setApiError('Không thể hủy đơn hàng. Vui lòng thử lại sau.');
      }
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    const fieldName = name.replace('Tab', ''); // Remove 'Tab' suffix from field names
    setPasswordForm({
      ...passwordForm,
      [fieldName]: value
    });
    
    // Xóa thông báo lỗi khi người dùng nhập lại
    if (passwordErrors[fieldName]) {
      setPasswordErrors({
        ...passwordErrors,
        [fieldName]: ''
      });
    }
    
    // Xóa thông báo lỗi/thành công khi người dùng thay đổi form
    setApiError('');
    setSuccessMessage('');
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (validatePassword()) {
      try {
        setPasswordLoading(true);
        setApiError('');
        setSuccessMessage('');
        
        // Gọi API đổi mật khẩu mới
        await userService.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
        
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setSuccessMessage('Đổi mật khẩu thành công!');
      } catch (error) {
        setApiError(error.toString());
      } finally {
        setPasswordLoading(false);
      }
    }
  };

  const validatePassword = () => {
    const tempErrors = {};
    
    if (!passwordForm.currentPassword) {
      tempErrors.currentPassword = 'Vui lòng nhập mật khẩu hiện tại';
    }
    
    if (!passwordForm.newPassword) {
      tempErrors.newPassword = 'Vui lòng nhập mật khẩu mới';
    } else if (passwordForm.newPassword.length < 6) {
      tempErrors.newPassword = 'Mật khẩu phải có ít nhất 6 ký tự';
    }
    
    if (!passwordForm.confirmPassword) {
      tempErrors.confirmPassword = 'Vui lòng nhập lại mật khẩu mới';
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      tempErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }
    
    setPasswordErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  if (loading && !user) {
    return (
      <div className="profile-loading">
        <div className="container">
          <h2>Đang tải thông tin...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="container">
        <div className="profile-header">
          <h1>Thông tin tài khoản</h1>
          <p>Quản lý thông tin cá nhân của bạn</p>
        </div>

        {apiError && (
          <div className="alert alert-danger" role="alert">
            {apiError}
          </div>
        )}

        {successMessage && (
          <div className="alert alert-success" role="alert">
            {successMessage}
          </div>
        )}

        <div className="profile-content">
          <div className="profile-sidebar">
            <div className="user-info">
              <div className="avatar">
                <span>{user?.name?.charAt(0) || 'U'}</span>
              </div>
              <h3>{user?.name}</h3>
              <p>{user?.email}</p>
              {user?.isAdmin && <span className="admin-badge">Admin</span>}
            </div>
            <ul className="sidebar-menu">
              <li 
                className={activeTab === 'account' ? 'active' : ''}
                onClick={() => handleTabChange('account')}
              >
                Thông tin tài khoản
              </li>
              <li 
                className={activeTab === 'orders' ? 'active' : ''}
                onClick={() => handleTabChange('orders')}
              >
                Lịch sử đơn hàng
              </li>
              <li 
                className={activeTab === 'password' ? 'active' : ''}
                onClick={() => handleTabChange('password')}
              >
                Đổi mật khẩu
              </li>
            </ul>
          </div>

          <div className="profile-details">
            {activeTab === 'account' && (
              <>
                <div className="profile-action">
                  {!isEditing ? (
                    <button 
                      className="btn btn-primary" 
                      onClick={() => setIsEditing(true)}
                    >
                      Chỉnh sửa thông tin
                    </button>
                  ) : (
                    <button 
                      className="btn btn-outline" 
                      onClick={() => setIsEditing(false)}
                    >
                      Hủy
                    </button>
                  )}
                </div>

                <form className="profile-form" onSubmit={handleSubmit}>
                  <div className="form-section">
                    <h3>Thông tin cá nhân</h3>
                    <div className="form-group">
                      <label htmlFor="name">Họ và tên</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        disabled={!isEditing || loading}
                        className={errors.name ? 'error' : ''}
                      />
                      {errors.name && <span className="error-message">{errors.name}</span>}
                    </div>

                    <div className="form-group">
                      <label htmlFor="email">Email</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={!isEditing || loading}
                        className={errors.email ? 'error' : ''}
                      />
                      {errors.email && <span className="error-message">{errors.email}</span>}
                    </div>

                    <div className="form-group">
                      <label htmlFor="phone">Số điện thoại</label>
                      <input
                        type="text"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        disabled={!isEditing || loading}
                      />
                    </div>
                  </div>

                  <div className="form-section">
                    <h3>Địa chỉ giao hàng</h3>
                    <div className="form-group">
                      <label htmlFor="address.street">Địa chỉ</label>
                      <input
                        type="text"
                        id="address.street"
                        name="address.street"
                        value={formData.address.street}
                        onChange={handleChange}
                        disabled={!isEditing || loading}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="address.city">Thành phố</label>
                      <input
                        type="text"
                        id="address.city"
                        name="address.city"
                        value={formData.address.city}
                        onChange={handleChange}
                        disabled={!isEditing || loading}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="address.postalCode">Mã bưu điện</label>
                      <input
                        type="text"
                        id="address.postalCode"
                        name="address.postalCode"
                        value={formData.address.postalCode}
                        onChange={handleChange}
                        disabled={!isEditing || loading}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="address.country">Quốc gia</label>
                      <input
                        type="text"
                        id="address.country"
                        name="address.country"
                        value={formData.address.country}
                        onChange={handleChange}
                        disabled={!isEditing || loading}
                      />
                    </div>
                  </div>

                  {isEditing && (
                    <div className="form-actions">
                      <button 
                        type="submit" 
                        className="btn btn-primary"
                        disabled={loading}
                      >
                        {loading ? 'Đang xử lý...' : 'Lưu thay đổi'}
                      </button>
                    </div>
                  )}
                </form>
              </>
            )}

            {activeTab === 'orders' && (
              <div className="orders-section">
                <div className="section-header">
                  <h3>Lịch sử đơn hàng</h3>
                  <p>Quản lý và theo dõi các đơn hàng của bạn</p>
                </div>

                {ordersLoading ? (
                  <div className="loading-state">
                    <p>Đang tải lịch sử đơn hàng...</p>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="empty-state">
                    <h4>Chưa có đơn hàng nào</h4>
                    <p>Bạn chưa có đơn hàng nào. Hãy bắt đầu mua sắm ngay!</p>
                    <button 
                      className="btn btn-primary"
                      onClick={() => navigate('/products')}
                    >
                      Mua sắm ngay
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="orders-list">
                      {orders.map((order) => (
                        <div key={order._id} className="order-card">
                          <div className="order-header">
                            <div className="order-info">
                              <h4>Đơn hàng #{order.orderNumber}</h4>
                              <p className="order-date">{formatDate(order.createdAt)}</p>
                            </div>
                            <div className="order-status">
                              <span className={`status-badge ${getStatusClass(order.status)}`}>
                                {getStatusText(order.status)}
                              </span>
                            </div>
                          </div>

                          <div className="order-items">
                            {order.orderItems.slice(0, 2).map((item, index) => (
                              <div key={index} className="order-item">
                                <img 
                                  src={item.image} 
                                  alt={item.name}
                                  className="item-image"
                                />
                                <div className="item-details">
                                  <h5>{item.name}</h5>
                                  <p>Số lượng: {item.quantity}</p>
                                  {item.selectedVariant && (
                                    <p className="variant">
                                      {item.selectedVariant.title} • {item.selectedVariant.size}
                                    </p>
                                  )}
                                </div>
                                <div className="item-price">
                                  {formatPrice(item.price * item.quantity)}đ
                                </div>
                              </div>
                            ))}
                            {order.orderItems.length > 2 && (
                              <p className="more-items">
                                và {order.orderItems.length - 2} sản phẩm khác
                              </p>
                            )}
                          </div>

                          <div className="order-footer">
                            <div className="order-total">
                              <strong>Tổng cộng: {formatPrice(order.totalPrice)}đ</strong>
                            </div>
                            <div className="order-actions">
                              {order.status === 'pending' && (
                                <button 
                                  className="btn btn-danger"
                                  onClick={() => handleCancelOrder(order._id)}
                                >
                                  Hủy đơn
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {ordersPagination.pages > 1 && (
                      <div className="pagination">
                        <button 
                          className="btn btn-outline"
                          disabled={ordersPagination.page === 1}
                          onClick={() => setOrdersPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                        >
                          Trang trước
                        </button>
                        <span className="page-info">
                          Trang {ordersPagination.page} / {ordersPagination.pages}
                        </span>
                        <button 
                          className="btn btn-outline"
                          disabled={ordersPagination.page === ordersPagination.pages}
                          onClick={() => setOrdersPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                        >
                          Trang sau
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}



            {activeTab === 'password' && (
              <div className="password-section">
                <div className="section-header">
                  <h3>Đổi mật khẩu</h3>
                  <p>Cập nhật mật khẩu để bảo mật tài khoản</p>
                </div>
                
                <form className="password-form" onSubmit={handlePasswordSubmit}>
                  <div className="form-group">
                    <PasswordInput
                      id="currentPasswordTab"
                      name="currentPasswordTab"
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordChange}
                      disabled={passwordLoading}
                      className={passwordErrors.currentPassword ? 'error' : ''}
                      label="Mật khẩu hiện tại *"
                      error={passwordErrors.currentPassword}
                    />
                  </div>

                  <div className="form-group">
                    <PasswordInput
                      id="newPasswordTab"
                      name="newPasswordTab"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                      disabled={passwordLoading}
                      className={passwordErrors.newPassword ? 'error' : ''}
                      label="Mật khẩu mới *"
                      error={passwordErrors.newPassword}
                    />
                  </div>

                  <div className="form-group">
                    <PasswordInput
                      id="confirmPasswordTab"
                      name="confirmPasswordTab"
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordChange}
                      disabled={passwordLoading}
                      className={passwordErrors.confirmPassword ? 'error' : ''}
                      label="Xác nhận mật khẩu mới *"
                      error={passwordErrors.confirmPassword}
                    />
                  </div>

                  <div className="form-actions">
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      disabled={passwordLoading}
                    >
                      {passwordLoading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 