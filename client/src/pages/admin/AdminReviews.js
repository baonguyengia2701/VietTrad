import React, { useState, useEffect } from 'react';
import { reviewService } from '../../services/reviewService';
import { formatDate } from '../../utils/dateUtils';
import './AdminReviews.scss';

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Pagination and filters
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalReviews, setTotalReviews] = useState(0);
  
  // Filter states
  const [filters, setFilters] = useState({
    rating: '',
    isApproved: '',
    product: '',
    user: '',
    searchTerm: ''
  });
  
  // Modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [currentPage, pageSize, filters]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError('');

      const queryFilters = {};
      if (filters.rating) queryFilters.rating = filters.rating;
      if (filters.isApproved !== '') queryFilters.isApproved = filters.isApproved;
      if (filters.product) queryFilters.product = filters.product;
      if (filters.user) queryFilters.user = filters.user;

      // For admin, don't add default isApproved filter to see all reviews
      const response = await reviewService.getAllReviews(currentPage, pageSize, queryFilters);
      
      if (response.success) {
        let filteredReviews = response.data.reviews;
        
        // Apply search filter on frontend if needed
        if (filters.searchTerm) {
          const searchLower = filters.searchTerm.toLowerCase();
          filteredReviews = filteredReviews.filter(review => 
            review.user?.name?.toLowerCase().includes(searchLower) ||
            review.product?.name?.toLowerCase().includes(searchLower) ||
            review.comment?.toLowerCase().includes(searchLower)
          );
        }

        setReviews(filteredReviews);
        setTotalPages(response.data.pagination?.pages || 1);
        setTotalReviews(response.data.pagination?.total || 0);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setError('Không thể tải danh sách đánh giá!');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handleViewReview = (review) => {
    setSelectedReview(review);
    setShowViewModal(true);
  };

  const handleDeleteReview = (review) => {
    setSelectedReview(review);
    setShowDeleteModal(true);
  };

  const confirmDeleteReview = async () => {
    if (!selectedReview) return;

    try {
      setDeleteLoading(true);
      const response = await reviewService.deleteReview(selectedReview._id);
      
      if (response.success) {
        setSuccessMessage('Xóa đánh giá thành công!');
        setShowDeleteModal(false);
        setSelectedReview(null);
        fetchReviews(); // Refresh the list
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      setError('Có lỗi xảy ra khi xóa đánh giá!');
      setTimeout(() => setError(''), 3000);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleToggleApproval = async (review) => {
    try {
      const response = await reviewService.toggleReviewApproval(review._id);
      
      if (response.success) {
        setSuccessMessage(`Đánh giá đã được ${response.data.isApproved ? 'duyệt' : 'từ chối'}!`);
        fetchReviews(); // Refresh the list
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error toggling approval:', error);
      setError('Có lỗi xảy ra khi cập nhật trạng thái duyệt!');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (e) => {
    setPageSize(parseInt(e.target.value));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      rating: '',
      isApproved: '',
      product: '',
      user: '',
      searchTerm: ''
    });
    setCurrentPage(1);
  };

  const getStatusColor = (isApproved) => {
    return isApproved ? '#28a745' : '#ffc107';
  };

  const getStatusText = (isApproved) => {
    return isApproved ? 'Đã duyệt' : 'Chờ duyệt';
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span 
          key={i} 
          className={`star ${i <= rating ? 'filled' : 'empty'}`}
        >
          ★
        </span>
      );
    }
    return stars;
  };

  const renderPagination = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <button
          key={i}
          className={`pagination-btn ${currentPage === i ? 'active' : ''}`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="pagination">
        <button
          className="pagination-btn"
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1}
        >
          Đầu
        </button>
        <button
          className="pagination-btn"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Trước
        </button>
        {pageNumbers}
        <button
          className="pagination-btn"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Sau
        </button>
        <button
          className="pagination-btn"
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages}
        >
          Cuối
        </button>
      </div>
    );
  };

  return (
    <div className="admin-reviews">
      <div className="page-header">
        <div className="header-left">
          <h1>Quản Lý Đánh Giá</h1>
          <p>Quản lý tất cả đánh giá sản phẩm trong hệ thống</p>
        </div>
        <div className="header-right">
        <div className="header-stats">
          <div className="stat-item">
            <span className="stat-number">{totalReviews}</span>
            <span className="stat-label">Tổng đánh giá</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{reviews.filter(r => r.isApproved).length}</span>
            <span className="stat-label">Đã duyệt</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{reviews.filter(r => !r.isApproved).length}</span>
            <span className="stat-label">Chờ duyệt</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      {error && <div className="alert alert-error">{error}</div>}
      {successMessage && <div className="alert alert-success">{successMessage}</div>}

      {/* Filters */}
      <div className="filters-section">
        <div className="filters-row">
          <div className="filter-group">
            <label>Tìm kiếm:</label>
            <input
              type="text"
              placeholder="Tìm theo tên người dùng, sản phẩm, nội dung..."
              value={filters.searchTerm}
              onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
            />
          </div>
          
          <div className="filter-group">
            <label>Đánh giá:</label>
            <select
              value={filters.rating}
              onChange={(e) => handleFilterChange('rating', e.target.value)}
            >
              <option value="">Tất cả</option>
              <option value="1">1 sao</option>
              <option value="2">2 sao</option>
              <option value="3">3 sao</option>
              <option value="4">4 sao</option>
              <option value="5">5 sao</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Trạng thái:</label>
            <select
              value={filters.isApproved}
              onChange={(e) => handleFilterChange('isApproved', e.target.value)}
            >
              <option value="">Tất cả</option>
              <option value="true">Đã duyệt</option>
              <option value="false">Chờ duyệt</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Hiển thị:</label>
            <select value={pageSize} onChange={handlePageSizeChange}>
              <option value="5">5 mục</option>
              <option value="10">10 mục</option>
              <option value="20">20 mục</option>
              <option value="50">50 mục</option>
            </select>
          </div>

          <div className="filter-actions">
            <button className="clear-filters-btn" onClick={clearFilters}>
              Xóa bộ lọc
            </button>
          </div>
        </div>
      </div>

      {/* Reviews Table */}
      <div className="table-container">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Đang tải danh sách đánh giá...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="empty-state">
            <h3>Không có đánh giá nào</h3>
            <p>Chưa có đánh giá nào phù hợp với bộ lọc của bạn.</p>
          </div>
        ) : (
          <>
            <table className="reviews-table">
              <thead>
                <tr>
                  <th>Người dùng</th>
                  <th>Sản phẩm</th>
                  <th>Đánh giá</th>
                  <th>Nội dung</th>
                  <th>Trạng thái</th>
                  <th>Ngày tạo</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((review) => (
                  <tr key={review._id}>
                    <td>
                      <div className="user-info" style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: '4px' 
                      }}>
                        <span className="user-name" style={{ 
                          fontWeight: '600', 
                          color: '#343a40', 
                          fontSize: '0.9rem' 
                        }}>{review.user?.name || 'N/A'}</span>
                        <span className="user-email" style={{ 
                          color: '#6c757d', 
                          fontSize: '0.8rem' 
                        }}>{review.user?.email || 'N/A'}</span>
                      </div>
                    </td>
                    <td>
                      <div className="product-info">
                        {review.product?.images?.[0] && (
                          <img 
                            src={review.product.images[0]} 
                            alt={review.product.name}
                            className="product-image"
                          />
                        )}
                        <span className="product-name">{review.product?.name || 'N/A'}</span>
                      </div>
                    </td>
                    <td>
                      <div className="rating">
                        {renderStars(review.rating)}
                        <span className="rating-number">({review.rating}/5)</span>
                      </div>
                    </td>
                    <td>
                      <div className="comment-preview">
                        {review.comment?.length > 100 
                          ? `${review.comment.substring(0, 100)}...` 
                          : review.comment
                        }
                      </div>
                    </td>
                    <td>
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(review.isApproved) }}
                      >
                        {getStatusText(review.isApproved)}
                      </span>
                    </td>
                    <td>{formatDate(review.createdAt)}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn btn-view"
                          onClick={() => handleViewReview(review)}
                          title="Xem chi tiết"
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        <button
                          className={`btn ${review.isApproved ? 'btn-reject' : 'btn-approve'}`}
                          onClick={() => handleToggleApproval(review)}
                          title={review.isApproved ? 'Từ chối' : 'Duyệt'}
                        >
                          <i className={`fas ${review.isApproved ? 'fa-times' : 'fa-check'}`}></i>
                        </button>
                        <button
                          className="btn btn-delete"
                          onClick={() => handleDeleteReview(review)}
                          title="Xóa"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination-container">
                <div className="pagination-info">
                  Hiển thị {reviews.length} trong tổng số {totalReviews} đánh giá
                </div>
                {renderPagination()}
              </div>
            )}
          </>
        )}
      </div>

      {/* View Review Modal */}
      {showViewModal && selectedReview && (
        <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Chi tiết đánh giá</h3>
              <button 
                className="close-btn"
                onClick={() => setShowViewModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="review-detail">
                <div className="detail-section">
                  <h4>Thông tin người dùng</h4>
                  <div className="detail-item">
                    <label>Tên:</label>
                    <span>{selectedReview.user?.name || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Email:</label>
                    <span>{selectedReview.user?.email || 'N/A'}</span>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Thông tin sản phẩm</h4>
                  <div className="detail-item">
                    <label>Tên sản phẩm:</label>
                    <span>{selectedReview.product?.name || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Giá:</label>
                    <span>{selectedReview.product?.price?.toLocaleString('vi-VN')}đ</span>
                  </div>
                  {selectedReview.product?.images?.[0] && (
                    <div className="detail-item">
                      <label>Hình ảnh:</label>
                      <img 
                        src={selectedReview.product.images[0]} 
                        alt={selectedReview.product.name}
                        className="product-detail-image"
                      />
                    </div>
                  )}
                </div>

                <div className="detail-section">
                  <h4>Nội dung đánh giá</h4>
                  <div className="detail-item">
                    <label>Đánh giá:</label>
                    <div className="rating-detail">
                      {renderStars(selectedReview.rating)}
                      <span>({selectedReview.rating}/5 sao)</span>
                    </div>
                  </div>
                  <div className="detail-item">
                    <label>Nhận xét:</label>
                    <div className="comment-detail">
                      {selectedReview.comment}
                    </div>
                  </div>
                  <div className="detail-item">
                    <label>Trạng thái:</label>
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(selectedReview.isApproved) }}
                    >
                      {getStatusText(selectedReview.isApproved)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <label>Ngày tạo:</label>
                    <span>{formatDate(selectedReview.createdAt)}</span>
                  </div>
                  {selectedReview.images && selectedReview.images.length > 0 && (
                    <div className="detail-item">
                      <label>Hình ảnh đính kèm:</label>
                      <div className="review-images">
                        {selectedReview.images.map((image, index) => (
                          <img 
                            key={index}
                            src={image} 
                            alt={`Review image ${index + 1}`}
                            className="review-image"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className={`btn ${selectedReview.isApproved ? 'btn-reject' : 'btn-approve'}`}
                onClick={() => {
                  handleToggleApproval(selectedReview);
                  setShowViewModal(false);
                }}
              >
                {selectedReview.isApproved ? 'Từ chối duyệt' : 'Duyệt đánh giá'}
              </button>
              <button 
                className="btn btn-delete"
                onClick={() => {
                  setShowViewModal(false);
                  handleDeleteReview(selectedReview);
                }}
              >
                Xóa đánh giá
              </button>
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedReview && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Xác nhận xóa</h3>
              <button 
                className="close-btn"
                onClick={() => setShowDeleteModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <p>Bạn có chắc chắn muốn xóa đánh giá này không?</p>
              <div className="review-preview">
                <div className="rating">
                  {renderStars(selectedReview.rating)}
                </div>
                <p className="comment">{selectedReview.comment}</p>
                <p className="author">Bởi: {selectedReview.user?.name}</p>
              </div>
              <p className="warning">⚠️ Hành động này không thể hoàn tác!</p>
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-delete"
                onClick={confirmDeleteReview}
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Đang xóa...' : 'Xóa'}
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleteLoading}
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReviews; 