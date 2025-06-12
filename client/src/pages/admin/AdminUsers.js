import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './AdminUsers.scss';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Edit form state
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    phone: '',
    isAdmin: false,
    address: {
      street: '',
      city: '',
      postalCode: '',
      country: 'Vietnam'
    }
  });
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Không thể tải danh sách người dùng. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (userId, newStatus) => {
    try {
      await api.put(`/users/${userId}/status`, { status: newStatus });
      setUsers(users.map(user => 
        user._id === userId 
          ? { ...user, status: newStatus }
          : user
      ));
      setSuccessMessage('Cập nhật trạng thái người dùng thành công!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error updating user status:', error);
      setError('Có lỗi xảy ra khi cập nhật trạng thái!');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const isAdmin = newRole === 'admin';
      await api.put(`/users/${userId}`, { isAdmin });
      setUsers(users.map(user => 
        user._id === userId 
          ? { ...user, isAdmin }
          : user
      ));
      setSuccessMessage('Cập nhật vai trò người dùng thành công!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error updating user role:', error);
      setError('Có lỗi xảy ra khi cập nhật vai trò!');
      setTimeout(() => setError(''), 3000);
    }
  };

  // View user details
  const handleViewUser = async (userId) => {
    try {
      const response = await api.get(`/users/${userId}`);
      setSelectedUser(response.data);
      setShowViewModal(true);
    } catch (error) {
      console.error('Error fetching user details:', error);
      setError('Không thể tải thông tin chi tiết người dùng!');
      setTimeout(() => setError(''), 3000);
    }
  };

  // Edit user
  const handleEditUser = async (userId) => {
    try {
      const response = await api.get(`/users/${userId}`);
      const user = response.data;
      setSelectedUser(user);
      setEditFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        isAdmin: user.isAdmin || false,
        address: {
          street: user.address?.street || '',
          city: user.address?.city || '',
          postalCode: user.address?.postalCode || '',
          country: user.address?.country || 'Vietnam'
        }
      });
      setShowEditModal(true);
    } catch (error) {
      console.error('Error fetching user details:', error);
      setError('Không thể tải thông tin người dùng để chỉnh sửa!');
      setTimeout(() => setError(''), 3000);
    }
  };

  // Update user
  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      setEditLoading(true);
      const response = await api.put(`/users/${selectedUser._id}`, editFormData);
      
      // Update users list
      setUsers(users.map(user => 
        user._id === selectedUser._id 
          ? { ...user, ...response.data }
          : user
      ));
      
      setShowEditModal(false);
      setSuccessMessage('Cập nhật thông tin người dùng thành công!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error updating user:', error);
      setError('Có lỗi xảy ra khi cập nhật thông tin người dùng!');
      setTimeout(() => setError(''), 3000);
    } finally {
      setEditLoading(false);
    }
  };

  // Delete user
  const handleDeleteUser = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const confirmDeleteUser = async () => {
    try {
      await api.delete(`/users/${selectedUser._id}`);
      setUsers(users.filter(user => user._id !== selectedUser._id));
      setShowDeleteModal(false);
      setSuccessMessage('Xóa người dùng thành công!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error deleting user:', error);
      setError('Có lỗi xảy ra khi xóa người dùng!');
      setTimeout(() => setError(''), 3000);
    }
  };

  // Handle edit form changes
  const handleEditFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setEditFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setEditFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
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
      case 'active': return '#28a745';
      case 'inactive': return '#6c757d';
      case 'blocked': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Hoạt động';
      case 'inactive': return 'Không hoạt động';
      case 'blocked': return 'Bị khóa';
      default: return 'Không xác định';
    }
  };

  const getRoleText = (isAdmin) => {
    return isAdmin ? 'Quản trị viên' : 'Khách hàng';
  };

  const getRoleValue = (isAdmin) => {
    return isAdmin ? 'admin' : 'customer';
  };

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.phone && user.phone.includes(searchTerm));
    const matchesRole = filterRole === '' || 
                       (filterRole === 'admin' && user.isAdmin) ||
                       (filterRole === 'customer' && !user.isAdmin);
    return matchesSearch && matchesRole;
  });

  // Pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const roles = ['admin', 'customer'];

  if (loading) {
    return (
      <div className="admin-users">
        <div className="loading">
          <i className="fas fa-spinner fa-spin"></i>
          <span>Đang tải dữ liệu...</span>
        </div>
      </div>
    );
  }

  if (error && !users.length) {
    return (
      <div className="admin-users">
        <div className="error-message">
          <i className="fas fa-exclamation-triangle"></i>
          <h3>Có lỗi xảy ra</h3>
          <p>{error}</p>
          <button onClick={fetchUsers} className="btn btn-primary">
            <i className="fas fa-redo"></i>
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-users admin-page">
      <div className="page-header">
        <div className="header-left">
          <h1>Quản Lý Người Dùng</h1>
          <p>Quản lý tất cả người dùng trong hệ thống</p>
        </div>
        <div className="header-right">
          <button onClick={fetchUsers} className="btn btn-secondary">
            <i className="fas fa-sync-alt"></i>
            Làm mới
          </button>
        </div>
      </div>

      {/* Alert Messages */}
      {error && (
        <div className="alert alert-danger">
          <i className="fas fa-exclamation-triangle"></i>
          {error}
        </div>
      )}

      {successMessage && (
        <div className="alert alert-success">
          <i className="fas fa-check-circle"></i>
          {successMessage}
        </div>
      )}

      <div className="filters-section">
        <div className="search-box">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Tìm kiếm người dùng (tên, email, số điện thoại)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-dropdown">
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
          >
            <option value="">Tất cả vai trò</option>
            {roles.map(role => (
              <option key={role} value={role}>{getRoleText(role === 'admin')}</option>
            ))}
          </select>
        </div>

        <div className="results-info">
          Hiển thị {currentUsers.length} / {filteredUsers.length} người dùng
        </div>
      </div>

      <div className="users-table">
        <table>
          <thead>
            <tr>
              <th>Thông tin người dùng</th>
              <th>Vai trò</th>
              <th>Trạng thái</th>
              <th>Tổng đơn hàng</th>
              <th>Tổng chi tiêu</th>
              <th>Ngày tham gia</th>
              <th>Lần đăng nhập cuối</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.map(user => (
              <tr key={user._id}>
                <td className="user-info">
                  <div className="user-details">
                    <h4>{user.name}</h4>
                    <span className="email">{user.email}</span>
                    <span className="phone">{user.phone || 'Chưa cập nhật'}</span>
                  </div>
                </td>
                <td>
                  <select
                    value={getRoleValue(user.isAdmin)}
                    onChange={(e) => handleRoleChange(user._id, e.target.value)}
                    className="role-select"
                  >
                    {roles.map(role => (
                      <option key={role} value={role}>
                        {getRoleText(role === 'admin')}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <select
                    value={user.status || 'active'}
                    onChange={(e) => handleStatusChange(user._id, e.target.value)}
                    className="status-select"
                    style={{ color: getStatusColor(user.status || 'active') }}
                  >
                    <option value="active">Hoạt động</option>
                    <option value="inactive">Không hoạt động</option>
                    <option value="blocked">Bị khóa</option>
                  </select>
                </td>
                <td className="total-orders">
                  {user.totalOrders || 0}
                </td>
                <td className="total-spent">
                  {formatCurrency(user.totalSpent || 0)}
                </td>
                <td>
                  {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                </td>
                <td>
                  {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('vi-VN') : 'Chưa đăng nhập'}
                </td>
                <td className="actions">
                  <button
                    className="btn btn-sm btn-info"
                    title="Xem chi tiết"
                    onClick={() => handleViewUser(user._id)}
                  >
                    <i className="fas fa-eye"></i>
                  </button>
                  <button
                    className="btn btn-sm btn-warning"
                    title="Chỉnh sửa"
                    onClick={() => handleEditUser(user._id)}
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user)}
                    className="btn btn-sm btn-danger"
                    title="Xóa người dùng"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {currentUsers.length === 0 && (
          <div className="no-data">
            <i className="fas fa-users"></i>
            <h3>Không có người dùng nào</h3>
            <p>Không tìm thấy người dùng phù hợp với bộ lọc hiện tại.</p>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="btn btn-outline"
          >
            <i className="fas fa-chevron-left"></i>
            Trước
          </button>

          <div className="page-numbers">
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index + 1}
                onClick={() => setCurrentPage(index + 1)}
                className={`btn ${currentPage === index + 1 ? 'btn-primary' : 'btn-outline'}`}
              >
                {index + 1}
              </button>
            ))}
          </div>

          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="btn btn-outline"
          >
            Sau
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>
      )}

      {/* View User Modal */}
      {showViewModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Chi tiết người dùng</h3>
              <button 
                className="close-btn"
                onClick={() => setShowViewModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="user-detail-grid">
                <div className="detail-item">
                  <label>Họ và tên:</label>
                  <span>{selectedUser.name}</span>
                </div>
                <div className="detail-item">
                  <label>Email:</label>
                  <span>{selectedUser.email}</span>
                </div>
                <div className="detail-item">
                  <label>Số điện thoại:</label>
                  <span>{selectedUser.phone || 'Chưa cập nhật'}</span>
                </div>
                <div className="detail-item">
                  <label>Vai trò:</label>
                  <span className={`role-badge ${selectedUser.isAdmin ? 'admin' : 'customer'}`}>
                    {getRoleText(selectedUser.isAdmin)}
                  </span>
                </div>
                <div className="detail-item">
                  <label>Trạng thái:</label>
                  <span 
                    className="status-badge"
                    style={{ color: getStatusColor(selectedUser.status || 'active') }}
                  >
                    {getStatusText(selectedUser.status || 'active')}
                  </span>
                </div>
                <div className="detail-item">
                  <label>Ngày tham gia:</label>
                  <span>{new Date(selectedUser.createdAt).toLocaleDateString('vi-VN')}</span>
                </div>
                <div className="detail-item">
                  <label>Lần đăng nhập cuối:</label>
                  <span>
                    {selectedUser.lastLogin 
                      ? new Date(selectedUser.lastLogin).toLocaleDateString('vi-VN')
                      : 'Chưa đăng nhập'
                    }
                  </span>
                </div>
                {selectedUser.address && (
                  <>
                    <div className="detail-item full-width">
                      <label>Địa chỉ:</label>
                      <span>
                        {[
                          selectedUser.address.street,
                          selectedUser.address.city,
                          selectedUser.address.postalCode,
                          selectedUser.address.country
                        ].filter(Boolean).join(', ') || 'Chưa cập nhật'}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowViewModal(false)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Chỉnh sửa thông tin người dùng</h3>
              <button 
                className="close-btn"
                onClick={() => setShowEditModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleUpdateUser}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="name">Họ và tên *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={editFormData.name}
                      onChange={handleEditFormChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">Email *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={editFormData.email}
                      onChange={handleEditFormChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="phone">Số điện thoại</label>
                    <input
                      type="text"
                      id="phone"
                      name="phone"
                      value={editFormData.phone}
                      onChange={handleEditFormChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>
                      <input
                        type="checkbox"
                        name="isAdmin"
                        checked={editFormData.isAdmin}
                        onChange={handleEditFormChange}
                      />
                      Quyền quản trị viên
                    </label>
                  </div>
                  <div className="form-group">
                    <label htmlFor="address.street">Địa chỉ</label>
                    <input
                      type="text"
                      id="address.street"
                      name="address.street"
                      value={editFormData.address.street}
                      onChange={handleEditFormChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="address.city">Thành phố</label>
                    <input
                      type="text"
                      id="address.city"
                      name="address.city"
                      value={editFormData.address.city}
                      onChange={handleEditFormChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="address.postalCode">Mã bưu điện</label>
                    <input
                      type="text"
                      id="address.postalCode"
                      name="address.postalCode"
                      value={editFormData.address.postalCode}
                      onChange={handleEditFormChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="address.country">Quốc gia</label>
                    <input
                      type="text"
                      id="address.country"
                      name="address.country"
                      value={editFormData.address.country}
                      onChange={handleEditFormChange}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowEditModal(false)}
                  disabled={editLoading}
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  className="btn btn-primary"
                  disabled={editLoading}
                >
                  {editLoading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Đang cập nhật...
                    </>
                  ) : (
                    'Cập nhật'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      {showDeleteModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Xác nhận xóa người dùng</h3>
              <button 
                className="close-btn"
                onClick={() => setShowDeleteModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="delete-confirmation">
                <i className="fas fa-exclamation-triangle warning-icon"></i>
                <p>
                  Bạn có chắc chắn muốn xóa người dùng <strong>{selectedUser.name}</strong>?
                </p>
                <p className="warning-text">
                  Hành động này không thể hoàn tác và sẽ xóa tất cả dữ liệu liên quan đến người dùng này.
                </p>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowDeleteModal(false)}
              >
                Hủy
              </button>
              <button 
                className="btn btn-danger"
                onClick={confirmDeleteUser}
              >
                <i className="fas fa-trash"></i>
                Xóa người dùng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers; 