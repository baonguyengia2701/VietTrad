import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderService } from '../../services/orderService';
import './AdminOrders.scss';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPaymentMethod, setFilterPaymentMethod] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Update form state
  const [updateFormData, setUpdateFormData] = useState({
    status: '',
    notes: '',
    trackingNumber: ''
  });
  const [updateLoading, setUpdateLoading] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [currentPage, searchTerm, filterStatus, filterPaymentMethod]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      
      const filters = {};
      if (filterStatus) filters.status = filterStatus;
      if (filterPaymentMethod) filters.paymentMethod = filterPaymentMethod;
      if (searchTerm) filters.search = searchTerm;

      const response = await orderService.getAllOrders(currentPage, ordersPerPage, filters);
      
      if (response.success && response.data) {
        setOrders(response.data.orders || []);
        setTotalPages(response.data.pagination?.pages || 1);
        setTotalOrders(response.data.pagination?.total || 0);
      } else {
        setOrders([]);
        setTotalPages(1);
        setTotalOrders(0);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Không thể tải danh sách đơn hàng. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const response = await orderService.updateOrderStatus(orderId, newStatus);
      if (response.success) {
        setOrders(orders.map(order => 
          order._id === orderId 
            ? { ...order, status: newStatus, updatedAt: new Date().toISOString() }
            : order
        ));
        setSuccessMessage('Cập nhật trạng thái đơn hàng thành công!');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      setError('Có lỗi xảy ra khi cập nhật trạng thái!');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleViewOrder = async (orderId) => {
    try {
      const response = await orderService.getOrderById(orderId);
      if (response.success) {
        setSelectedOrder(response.data);
        setShowViewModal(true);
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      setError('Không thể tải thông tin chi tiết đơn hàng!');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleUpdateOrder = (order) => {
    setSelectedOrder(order);
    setUpdateFormData({
      status: order.status,
      notes: order.notes || '',
      trackingNumber: order.trackingNumber || ''
    });
    setShowUpdateModal(true);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      setUpdateLoading(true);
      const response = await orderService.updateOrderStatus(
        selectedOrder._id,
        updateFormData.status,
        updateFormData.notes,
        updateFormData.trackingNumber
      );

      if (response.success) {
        setOrders(orders.map(order => 
          order._id === selectedOrder._id 
            ? { ...order, ...updateFormData, updatedAt: new Date().toISOString() }
            : order
        ));
        setShowUpdateModal(false);
        setSuccessMessage('Cập nhật đơn hàng thành công!');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error updating order:', error);
      setError('Có lỗi xảy ra khi cập nhật đơn hàng!');
      setTimeout(() => setError(''), 3000);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleUpdateFormChange = (e) => {
    const { name, value } = e.target;
    setUpdateFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#ffc107';
      case 'confirmed': return '#17a2b8';
      case 'processing': return '#6f42c1';
      case 'shipped': return '#fd7e14';
      case 'delivered': return '#28a745';
      case 'cancelled': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Chờ xử lý';
      case 'confirmed': return 'Đã xác nhận';
      case 'processing': return 'Đang xử lý';
      case 'shipped': return 'Đã gửi hàng';
      case 'delivered': return 'Đã giao hàng';
      case 'cancelled': return 'Đã hủy';
      default: return 'Không xác định';
    }
  };

  const getPaymentMethodText = (method) => {
    switch (method) {
      case 'cod': return 'Thanh toán khi nhận hàng';
      case 'banking': return 'Chuyển khoản ngân hàng';
      case 'momo': return 'Ví MoMo';
      default: return 'Không xác định';
    }
  };

  const getPaymentStatusColor = (isPaid) => {
    return isPaid ? '#28a745' : '#ffc107';
  };

  const getPaymentStatusText = (isPaid) => {
    return isPaid ? 'Đã thanh toán' : 'Chưa thanh toán';
  };

  // Filter orders locally if needed
  const filteredOrders = orders.filter(order => {
    const matchesSearch = searchTerm === '' || 
      order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.shippingInfo?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.shippingInfo?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
  const paymentMethods = ['cod', 'banking', 'momo'];

  if (loading && orders.length === 0) {
    return (
      <div className="admin-orders">
        <div className="loading">
          <i className="fas fa-spinner fa-spin"></i>
          <span>Đang tải dữ liệu...</span>
        </div>
      </div>
    );
  }

  if (error && !orders.length) {
    return (
      <div className="admin-orders">
        <div className="error-message">
          <i className="fas fa-exclamation-triangle"></i>
          <h3>Có lỗi xảy ra</h3>
          <p>{error}</p>
          <button onClick={fetchOrders} className="btn btn-primary">
            <i className="fas fa-redo"></i>
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-orders">
      <div className="page-header">
        <div className="header-left">
          <h1>Quản Lý Đơn Hàng</h1>
          <p>Quản lý tất cả đơn hàng trong hệ thống</p>
        </div>
        <div className="header-right">
          <button onClick={fetchOrders} className="btn btn-secondary">
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
            placeholder="Tìm kiếm đơn hàng (mã đơn, tên khách hàng, email)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-dropdown">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">Tất cả trạng thái</option>
            {statuses.map(status => (
              <option key={status} value={status}>{getStatusText(status)}</option>
            ))}
          </select>
        </div>

        <div className="filter-dropdown">
          <select
            value={filterPaymentMethod}
            onChange={(e) => setFilterPaymentMethod(e.target.value)}
          >
            <option value="">Tất cả phương thức</option>
            {paymentMethods.map(method => (
              <option key={method} value={method}>{getPaymentMethodText(method)}</option>
            ))}
          </select>
        </div>

        <div className="results-info">
          Hiển thị {filteredOrders.length} / {totalOrders} đơn hàng
        </div>
      </div>

      <div className="orders-table">
        <table>
          <thead>
            <tr>
              <th>Mã đơn hàng</th>
              <th>Khách hàng</th>
              <th>Sản phẩm</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
              <th>Thanh toán</th>
              <th>Ngày đặt</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map(order => (
              <tr key={order._id}>
                <td className="order-id">
                  <strong>{order.orderNumber}</strong>
                </td>
                <td className="customer-info">
                  <div className="customer-details">
                    <h4>{order.shippingInfo?.fullName || 'N/A'}</h4>
                    <span className="email">{order.shippingInfo?.email || 'N/A'}</span>
                    <span className="phone">{order.shippingInfo?.phone || 'N/A'}</span>
                  </div>
                </td>
                <td className="order-items">
                  <div className="items-list">
                    {order.orderItems?.slice(0, 2).map((item, index) => (
                      <div key={index} className="item">
                        <span className="item-name">{item.name}</span>
                        <span className="item-quantity">x{item.quantity}</span>
                      </div>
                    ))}
                    {order.orderItems?.length > 2 && (
                      <div className="item">
                        <span className="more-items">+{order.orderItems.length - 2} sản phẩm khác</span>
                      </div>
                    )}
                  </div>
                </td>
                <td className="total-amount">
                  {formatCurrency(order.totalPrice)}
                </td>
                <td>
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    className="status-select"
                    style={{ color: getStatusColor(order.status) }}
                  >
                    {statuses.map(status => (
                      <option key={status} value={status}>
                        {getStatusText(status)}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <span 
                    className="payment-status"
                    style={{ color: getPaymentStatusColor(order.isPaid) }}
                  >
                    {getPaymentStatusText(order.isPaid)}
                  </span>
                  <br />
                  <small>{getPaymentMethodText(order.paymentMethod)}</small>
                </td>
                <td>
                  {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                </td>
                <td className="actions">
                  <button
                    className="btn btn-sm btn-info"
                    title="Xem chi tiết"
                    onClick={() => handleViewOrder(order._id)}
                  >
                    <i className="fas fa-eye"></i>
                  </button>
                  <button
                    className="btn btn-sm btn-warning"
                    title="Cập nhật đơn hàng"
                    onClick={() => handleUpdateOrder(order)}
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="btn btn-sm btn-secondary"
                    title="In đơn hàng"
                  >
                    <i className="fas fa-print"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredOrders.length === 0 && (
          <div className="no-data">
            <i className="fas fa-shopping-cart"></i>
            <h3>Không có đơn hàng nào</h3>
            <p>Không tìm thấy đơn hàng phù hợp với bộ lọc hiện tại.</p>
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

      {/* View Order Modal */}
      {showViewModal && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Chi tiết đơn hàng #{selectedOrder.orderNumber}</h3>
              <button 
                className="close-btn"
                onClick={() => setShowViewModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="order-detail-grid">
                <div className="detail-section">
                  <h4>Thông tin đơn hàng</h4>
                  <div className="detail-item">
                    <label>Mã đơn hàng:</label>
                    <span>{selectedOrder.orderNumber}</span>
                  </div>
                  <div className="detail-item">
                    <label>Trạng thái:</label>
                    <span style={{ color: getStatusColor(selectedOrder.status) }}>
                      {getStatusText(selectedOrder.status)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <label>Phương thức thanh toán:</label>
                    <span>{getPaymentMethodText(selectedOrder.paymentMethod)}</span>
                  </div>
                  <div className="detail-item">
                    <label>Trạng thái thanh toán:</label>
                    <span style={{ color: getPaymentStatusColor(selectedOrder.isPaid) }}>
                      {getPaymentStatusText(selectedOrder.isPaid)}
                    </span>
                  </div>
                  {selectedOrder.trackingNumber && (
                    <div className="detail-item">
                      <label>Mã vận đơn:</label>
                      <span>{selectedOrder.trackingNumber}</span>
                    </div>
                  )}
                </div>

                <div className="detail-section">
                  <h4>Thông tin khách hàng</h4>
                  <div className="detail-item">
                    <label>Họ tên:</label>
                    <span>{selectedOrder.shippingInfo?.fullName}</span>
                  </div>
                  <div className="detail-item">
                    <label>Email:</label>
                    <span>{selectedOrder.shippingInfo?.email}</span>
                  </div>
                  <div className="detail-item">
                    <label>Số điện thoại:</label>
                    <span>{selectedOrder.shippingInfo?.phone}</span>
                  </div>
                  <div className="detail-item">
                    <label>Địa chỉ:</label>
                    <span>
                      {selectedOrder.shippingInfo?.address}, {selectedOrder.shippingInfo?.ward}, {selectedOrder.shippingInfo?.district}, {selectedOrder.shippingInfo?.city}
                    </span>
                  </div>
                  {selectedOrder.shippingInfo?.note && (
                    <div className="detail-item">
                      <label>Ghi chú:</label>
                      <span>{selectedOrder.shippingInfo.note}</span>
                    </div>
                  )}
                </div>

                <div className="detail-section full-width">
                  <h4>Sản phẩm đặt hàng</h4>
                  <div className="order-items-detail">
                    {selectedOrder.orderItems?.map((item, index) => (
                      <div key={index} className="order-item">
                        <div className="item-image">
                          <img 
                            src={item.image || '/images/placeholder.jpg'} 
                            alt={item.name}
                            onError={(e) => {
                              e.target.src = '/images/placeholder.jpg';
                            }}
                          />
                        </div>
                        <div className="item-details">
                          <h5>{item.name}</h5>
                          {item.selectedVariant && (
                            <div className="variant-info">
                              <span>{item.selectedVariant.title}: {item.selectedVariant.size}</span>
                            </div>
                          )}
                          <div className="item-price">
                            <span>Số lượng: {item.quantity}</span>
                            <span>Đơn giá: {formatCurrency(item.price)}</span>
                            <span>Thành tiền: {formatCurrency(item.price * item.quantity)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="detail-section full-width">
                  <h4>Tổng kết đơn hàng</h4>
                  <div className="order-summary">
                    <div className="summary-item">
                      <label>Tổng tiền hàng:</label>
                      <span>{formatCurrency(selectedOrder.itemsPrice)}</span>
                    </div>
                    <div className="summary-item">
                      <label>Phí vận chuyển:</label>
                      <span>{formatCurrency(selectedOrder.shippingPrice)}</span>
                    </div>
                    {selectedOrder.discountPrice > 0 && (
                      <div className="summary-item">
                        <label>Giảm giá sản phẩm:</label>
                        <span>-{formatCurrency(selectedOrder.discountPrice)}</span>
                      </div>
                    )}
                    {selectedOrder.voucherDiscount > 0 && (
                      <div className="summary-item">
                        <label>Giảm giá voucher:</label>
                        <span>-{formatCurrency(selectedOrder.voucherDiscount)}</span>
                      </div>
                    )}
                    <div className="summary-item total">
                      <label>Tổng thanh toán:</label>
                      <span>{formatCurrency(selectedOrder.totalPrice)}</span>
                    </div>
                  </div>
                </div>
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

      {/* Update Order Modal */}
      {showUpdateModal && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowUpdateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Cập nhật đơn hàng #{selectedOrder.orderNumber}</h3>
              <button 
                className="close-btn"
                onClick={() => setShowUpdateModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleUpdateSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="status">Trạng thái đơn hàng *</label>
                  <select
                    id="status"
                    name="status"
                    value={updateFormData.status}
                    onChange={handleUpdateFormChange}
                    required
                  >
                    {statuses.map(status => (
                      <option key={status} value={status}>
                        {getStatusText(status)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="trackingNumber">Mã vận đơn</label>
                  <input
                    type="text"
                    id="trackingNumber"
                    name="trackingNumber"
                    value={updateFormData.trackingNumber}
                    onChange={handleUpdateFormChange}
                    placeholder="Nhập mã vận đơn"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="notes">Ghi chú</label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={updateFormData.notes}
                    onChange={handleUpdateFormChange}
                    rows="4"
                    placeholder="Nhập ghi chú cho đơn hàng"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowUpdateModal(false)}
                  disabled={updateLoading}
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  className="btn btn-primary"
                  disabled={updateLoading}
                >
                  {updateLoading ? (
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
    </div>
  );
};

export default AdminOrders; 