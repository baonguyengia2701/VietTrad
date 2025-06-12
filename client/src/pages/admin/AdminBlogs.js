import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { blogService } from '../../services/blogService';
import './AdminBlogs.scss';

const AdminBlogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [blogsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBlogs, setTotalBlogs] = useState(0);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchBlogs();
  }, [currentPage, searchTerm, filterCategory, filterStatus]);

  const fetchInitialData = async () => {
    try {
      const categoriesData = await blogService.getCategories();
      if (categoriesData && categoriesData.data) {
        // Ensure categories is always an array
        const cats = Array.isArray(categoriesData.data) ? categoriesData.data : [];
        setCategories(cats);
      }
    } catch (error) {
      console.error('Error fetching initial data:', error);
      setError('Không thể tải dữ liệu ban đầu');
      setCategories([]); // Set empty array on error
    }
  };

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      setError('');
      
      let response;
      
      // Use admin endpoint to get all blogs including drafts
      response = await blogService.getAllBlogsAdmin(currentPage, blogsPerPage, filterCategory, searchTerm);
      
      console.log('API Response:', response);
      
      if (response) {
        // Handle response with {success: true, data: {blogs: [...], ...}} structure
        if (response.success && response.data && response.data.blogs) {
          const responseData = response.data;
          setBlogs(Array.isArray(responseData.blogs) ? responseData.blogs : []);
          setTotalPages(responseData.totalPages || Math.ceil(responseData.blogs.length / blogsPerPage) || 1);
          setTotalBlogs(responseData.totalBlogs || responseData.blogs.length || 0);
        }
        // Handle response with {blogs: [...], ...} structure
        else if (response.blogs && Array.isArray(response.blogs)) {
          setBlogs(response.blogs);
          setTotalPages(response.totalPages || 1);
          setTotalBlogs(response.totalBlogs || 0);
        } 
        // Handle response with direct array
        else if (Array.isArray(response)) {
          setBlogs(response);
          setTotalPages(Math.ceil(response.length / blogsPerPage));
          setTotalBlogs(response.length);
        } else {
          console.log('Unexpected response structure:', response);
          setBlogs([]);
          setTotalPages(1);
          setTotalBlogs(0);
        }
      } else {
        setBlogs([]);
        setTotalPages(1);
        setTotalBlogs(0);
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
      setError('Không thể tải danh sách bài viết. Vui lòng thử lại.');
      setBlogs([]);
      setTotalPages(1);
      setTotalBlogs(0);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBlog = async (blog) => {
    setSelectedBlog(blog);
    setShowDeleteModal(true);
  };

  const confirmDeleteBlog = async () => {
    try {
      await blogService.deleteBlog(selectedBlog._id || selectedBlog.id);
      setBlogs(blogs.filter(blog => (blog._id || blog.id) !== (selectedBlog._id || selectedBlog.id)));
      setShowDeleteModal(false);
      setSuccessMessage('Xóa bài viết thành công!');
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchBlogs();
    } catch (error) {
      console.error('Error deleting blog:', error);
      setError('Có lỗi xảy ra khi xóa bài viết!');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleTogglePublish = async (blogId, currentStatus) => {
    try {
      await blogService.togglePublishStatus(blogId);
      setBlogs(blogs.map(blog => 
        (blog._id || blog.id) === blogId 
          ? { ...blog, published: !currentStatus, isPublished: !currentStatus, status: !currentStatus ? 'published' : 'draft' }
          : blog
      ));
      setSuccessMessage('Cập nhật trạng thái bài viết thành công!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error updating blog status:', error);
      setError('Có lỗi xảy ra khi cập nhật trạng thái!');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleViewBlog = async (blog) => {
    setSelectedBlog(blog);
    setShowViewModal(true);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (blog) => {
    if (blog.published || blog.isPublished || blog.status === 'published') return '#28a745';
    return '#ffc107';
  };

  const getStatusText = (blog) => {
    if (blog.published || blog.isPublished || blog.status === 'published') return 'Đã xuất bản';
    return 'Bản nháp';
  };

  const filteredBlogs = Array.isArray(blogs) ? blogs.filter(blog => {
    const matchesStatus = filterStatus === '' || 
      (filterStatus === 'published' && (blog.published || blog.isPublished || blog.status === 'published')) ||
      (filterStatus === 'draft' && !(blog.published || blog.isPublished || blog.status === 'published'));
    return matchesStatus;
  }) : [];

  if (loading && blogs.length === 0) {
    return (
      <div className="admin-blogs">
        <div className="loading">
          <i className="fas fa-spinner fa-spin"></i>
          <span>Đang tải dữ liệu...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-blogs">
      <div className="page-header">
        <div className="header-left">
          <h1>Quản Lý Bài Viết</h1>
          <p>Quản lý tất cả bài viết trong hệ thống</p>
        </div>
        <div className="header-right">
          <Link to="/admin/blogs/new" className="btn btn-primary">
            <i className="fas fa-plus"></i>
            Thêm Bài Viết Mới
          </Link>
        </div>
      </div>

      {successMessage && (
        <div className="alert alert-success">
          <i className="fas fa-check-circle"></i>
          {successMessage}
        </div>
      )}

      {error && (
        <div className="alert alert-danger">
          <i className="fas fa-exclamation-triangle"></i>
          {error}
        </div>
      )}

      <div className="filters-section">
        <div className="search-box">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Tìm kiếm bài viết..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="filter-select"
          >
            <option value="">Tất cả danh mục</option>
            {Array.isArray(categories) && categories.map(category => (
              <option key={category._id} value={category._id}>
                {category._id} ({category.count})
              </option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="published">Đã xuất bản</option>
            <option value="draft">Bản nháp</option>
          </select>
        </div>

        <div className="results-info">
          <span>Tìm thấy {filteredBlogs.length} bài viết</span>
        </div>
      </div>

      <div className="table-section">
        {filteredBlogs.length === 0 && !loading ? (
          <div className="no-data">
            <i className="fas fa-file-alt"></i>
            <h3>Không có bài viết nào</h3>
            <p>Chưa có bài viết nào phù hợp với tiêu chí tìm kiếm.</p>
            <Link to="/admin/blogs/new" className="btn btn-primary">
              <i className="fas fa-plus"></i>
              Tạo bài viết đầu tiên
            </Link>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="blogs-table">
              <thead>
                <tr>
                  <th>Hình ảnh</th>
                  <th>Tiêu đề</th>
                  <th>Danh mục</th>
                  <th>Tác giả</th>
                  <th>Trạng thái</th>
                  <th>Ngày tạo</th>
                  <th>Lượt xem</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredBlogs.map(blog => (
                  <tr key={blog._id || blog.id}>
                    <td>
                      <div className="blog-image">
                        <img 
                          src={blog.featuredImage || 'https://via.placeholder.com/80x60?text=No+Image'} 
                          alt={blog.title}
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/80x60?text=No+Image';
                          }}
                        />
                      </div>
                    </td>
                    <td>
                      <div className="blog-title">
                        <h4>{blog.title}</h4>
                        <p>{blog.excerpt?.substring(0, 80) || 'Không có mô tả'}...</p>
                      </div>
                    </td>
                    <td>
                      <span className="category-badge">
                        {blog.category || 'Chưa phân loại'}
                      </span>
                    </td>
                    <td>
                      <div className="author-info">
                        <span>{blog.author?.name || blog.author || 'Không rõ'}</span>
                      </div>
                    </td>
                    <td>
                      <div className="status-cell">
                        <span 
                          className="status-badge"
                          style={{ backgroundColor: getStatusColor(blog) }}
                        >
                          {getStatusText(blog)}
                        </span>
                        <button
                          className="toggle-status-btn"
                          onClick={() => handleTogglePublish(blog._id || blog.id, blog.published || blog.isPublished || blog.status === 'published')}
                                                      title={blog.published || blog.isPublished || blog.status === 'published' ? 'Chuyển về bản nháp' : 'Xuất bản'}
                        >
                                                      <i className={`fas ${blog.published || blog.isPublished || blog.status === 'published' ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                        </button>
                      </div>
                    </td>
                    <td>
                      <span className="date">
                        {formatDate(blog.createdAt || blog.publishedAt)}
                      </span>
                    </td>
                    <td>
                      <span className="views">
                        <i className="fas fa-eye"></i>
                        {blog.views || 0}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn btn-info btn-sm"
                          onClick={() => handleViewBlog(blog)}
                          title="Xem chi tiết"
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        <Link
                          to={`/admin/blogs/edit/${blog._id || blog.id}`}
                          className="btn btn-warning btn-sm"
                          title="Chỉnh sửa"
                        >
                          <i className="fas fa-edit"></i>
                        </Link>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeleteBlog(blog)}
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
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="pagination-section">
          <div className="pagination-info">
            <span>
              Trang {currentPage} / {totalPages} - Tổng cộng {totalBlogs} bài viết
            </span>
          </div>
          <div className="pagination-controls">
            <button
              className="btn btn-outline-primary"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <i className="fas fa-chevron-left"></i>
              Trang trước
            </button>
            
            <div className="page-numbers">
              {[...Array(totalPages)].map((_, index) => {
                const pageNum = index + 1;
                if (pageNum >= currentPage - 2 && pageNum <= currentPage + 2) {
                  return (
                    <button
                      key={pageNum}
                      className={`btn ${pageNum === currentPage ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </button>
                  );
                }
                return null;
              })}
            </div>

            <button
              className="btn btn-outline-primary"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Trang sau
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>
      )}

      {showViewModal && selectedBlog && (
        <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Chi tiết bài viết</h3>
              <button 
                className="close-btn"
                onClick={() => setShowViewModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="blog-detail">
                {selectedBlog.featuredImage && (
                  <div className="blog-image">
                    <img src={selectedBlog.featuredImage} alt={selectedBlog.title} />
                  </div>
                )}
                <div className="blog-info">
                  <h2>{selectedBlog.title}</h2>
                  <div className="blog-meta">
                    <span><strong>Tác giả:</strong> {selectedBlog.author?.name || selectedBlog.author || 'Không rõ'}</span>
                    <span><strong>Danh mục:</strong> {selectedBlog.category || 'Chưa phân loại'}</span>
                    <span><strong>Trạng thái:</strong> {getStatusText(selectedBlog)}</span>
                    <span><strong>Ngày tạo:</strong> {formatDate(selectedBlog.createdAt || selectedBlog.publishedAt)}</span>
                    <span><strong>Lượt xem:</strong> {selectedBlog.views || 0}</span>
                  </div>
                  <div className="blog-excerpt">
                    <strong>Mô tả:</strong>
                    <p>{selectedBlog.excerpt || 'Không có mô tả'}</p>
                  </div>
                  {selectedBlog.tags && selectedBlog.tags.length > 0 && (
                    <div className="blog-tags">
                      <strong>Tags:</strong>
                      <div className="tags-list">
                        {selectedBlog.tags.map((tag, index) => (
                          <span key={index} className="tag">{tag}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && selectedBlog && (
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
              <div className="delete-confirmation">
                <i className="fas fa-exclamation-triangle warning-icon"></i>
                <h4>Bạn có chắc chắn muốn xóa bài viết này?</h4>
                <p><strong>"{selectedBlog.title}"</strong></p>
                <p>Hành động này không thể hoàn tác!</p>
                <div className="action-buttons">
                  <button 
                    className="btn btn-secondary"
                    onClick={() => setShowDeleteModal(false)}
                  >
                    Hủy
                  </button>
                  <button 
                    className="btn btn-danger"
                    onClick={confirmDeleteBlog}
                  >
                    <i className="fas fa-trash"></i>
                    Xóa bài viết
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBlogs; 