import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { blogService } from '../../services/blogService';
import './AdminBlogForm.scss';

const AdminBlogForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: '',
    tags: [],
    featuredImage: '',
    published: false,
    author: ''
  });

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    fetchCategories();
    if (isEditMode) {
      fetchBlogData();
    }
  }, [id, isEditMode]);

  const fetchCategories = async () => {
    try {
      const response = await blogService.getCategories();
      if (response && response.data) {
        // Ensure categories is always an array
        const cats = Array.isArray(response.data) ? response.data : [];
        setCategories(cats);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]); // Set empty array on error
    }
  };

  const fetchBlogData = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Fetching blog data for ID:', id);
      
      // For testing, let's add a fallback mock data if API fails
      let response;
      
      try {
        response = await blogService.getBlogBySlug(id);
        console.log('Blog API response:', response);
      } catch (apiError) {
        console.error('API Error:', apiError);
        setError(`Không thể kết nối tới server: ${apiError.message}`);
        return;
      }
      
      if (response && response.success && response.data && response.data.blog) {
        const blog = response.data.blog;
        console.log('Blog data loaded:', blog.title);
        
        setFormData({
          title: blog.title || '',
          excerpt: blog.excerpt || '',
          content: blog.content || '',
          category: blog.category || '',
          tags: Array.isArray(blog.tags) ? blog.tags : [],
          featuredImage: blog.featuredImage || '',
          published: Boolean(blog.published || blog.isPublished || blog.status === 'published'),
          author: blog.author?.name || blog.author || ''
        });
      } else {
        console.error('Invalid response structure:', response);
        setError('Dữ liệu bài viết không hợp lệ');
      }
    } catch (error) {
      console.error('Error fetching blog data:', error);
      setError(`Không thể tải dữ liệu bài viết: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleTagAdd = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleTagRemove = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const submitData = {
        ...formData,
        status: formData.published ? 'published' : 'draft'
      };

      // Remove author field from submit data when editing (server will preserve original author)
      if (isEditMode) {
        delete submitData.author;
        await blogService.updateBlog(id, submitData);
        setSuccessMessage('Cập nhật bài viết thành công!');
      } else {
        await blogService.createBlog(submitData);
        setSuccessMessage('Tạo bài viết thành công!');
      }

      setTimeout(() => {
        navigate('/admin/blogs');
      }, 2000);

    } catch (error) {
      console.error('Error saving blog:', error);
      setError(isEditMode ? 'Có lỗi xảy ra khi cập nhật bài viết' : 'Có lỗi xảy ra khi tạo bài viết');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/blogs');
  };

  if (loading && isEditMode) {
    return (
      <div className="admin-blog-form">
        <div className="loading">
          <i className="fas fa-spinner fa-spin"></i>
          <span>Đang tải dữ liệu...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-blog-form">
      <div className="form-header">
        <div className="header-left">
          <h1>{isEditMode ? 'Chỉnh Sửa Bài Viết' : 'Thêm Bài Viết Mới'}</h1>
          <p>{isEditMode ? 'Cập nhật thông tin bài viết' : 'Tạo bài viết mới cho website'}</p>
        </div>
        <div className="header-right">
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={handleCancel}
          >
            <i className="fas fa-arrow-left"></i>
            Quay lại
          </button>
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

      <form onSubmit={handleSubmit} className="blog-form">
        <div className="form-content">
          <div className="main-content">
            <div className="form-section">
              <h3>Thông tin cơ bản</h3>
              
              <div className="form-group">
                <label htmlFor="title">Tiêu đề bài viết *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  placeholder="Nhập tiêu đề bài viết..."
                />
              </div>

              <div className="form-group">
                <label htmlFor="excerpt">Mô tả ngắn</label>
                <textarea
                  id="excerpt"
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Nhập mô tả ngắn về bài viết..."
                />
              </div>

              <div className="form-group">
                <label htmlFor="content">Nội dung bài viết *</label>
                <textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  rows="15"
                  required
                  placeholder="Nhập nội dung bài viết..."
                />
              </div>
            </div>

            <div className="form-section">
              <h3>Tags</h3>
              
              <div className="form-group">
                <label>Thẻ tag</label>
                <div className="tag-input-group">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Nhập tag và nhấn thêm..."
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleTagAdd())}
                  />
                  <button 
                    type="button" 
                    onClick={handleTagAdd}
                    className="btn btn-outline-primary"
                  >
                    Thêm
                  </button>
                </div>
                
                {formData.tags.length > 0 && (
                  <div className="tags-list">
                    {formData.tags.map((tag, index) => (
                      <span key={index} className="tag">
                        {tag}
                        <button 
                          type="button"
                          onClick={() => handleTagRemove(tag)}
                          className="tag-remove"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="sidebar-content">
            <div className="form-section">
              <h3>Xuất bản</h3>
              
              <div className="form-group">
                <label htmlFor="published" className="checkbox-label">
                  <input
                    type="checkbox"
                    id="published"
                    name="published"
                    checked={formData.published}
                    onChange={handleInputChange}
                  />
                  <span className="checkmark"></span>
                  Xuất bản ngay lập tức
                </label>
              </div>

              <div className="publish-actions">
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save"></i>
                      {isEditMode ? 'Cập nhật' : 'Tạo bài viết'}
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="form-section">
              <h3>Phân loại</h3>
              
              <div className="form-group">
                <label htmlFor="category">Danh mục</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                >
                  <option value="">Chọn danh mục</option>
                  {Array.isArray(categories) && categories.map(category => (
                    <option key={category._id} value={category._id}>
                      {category._id} ({category.count})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="author">Tác giả</label>
                <input
                  type="text"
                  id="author"
                  name="author"
                  value={formData.author}
                  onChange={handleInputChange}
                  placeholder="Nhập tên tác giả..."
                  disabled={isEditMode}
                  title={isEditMode ? "Không thể thay đổi tác giả khi chỉnh sửa" : ""}
                />
              </div>
            </div>

            <div className="form-section">
              <h3>Hình ảnh đại diện</h3>
              
              <div className="form-group">
                <label htmlFor="featuredImage">URL hình ảnh</label>
                <input
                  type="url"
                  id="featuredImage"
                  name="featuredImage"
                  value={formData.featuredImage}
                  onChange={handleInputChange}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              {formData.featuredImage && (
                <div className="image-preview">
                  <img 
                    src={formData.featuredImage} 
                    alt="Preview"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AdminBlogForm; 