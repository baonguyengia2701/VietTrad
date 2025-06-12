import React, { useState, useEffect } from 'react';
import { categoryService } from '../../services/categoryService';
import './AdminCategories.scss';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    parentCategory: '',
    order: 0,
    isActive: true
  });
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError('');
      
      const filters = {};
      if (filterStatus !== '') {
        filters.active = filterStatus === 'true';
      }

      const response = await categoryService.getAllCategories(filters);
      setCategories(response || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('Không thể tải danh sách danh mục. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (categoryId, newStatus) => {
    try {
      await categoryService.toggleCategoryStatus(categoryId);
      setCategories(categories.map(category => 
        category._id === categoryId 
          ? { ...category, isActive: newStatus }
          : category
      ));
      setSuccessMessage('Cập nhật trạng thái danh mục thành công!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error updating category status:', error);
      setError('Có lỗi xảy ra khi cập nhật trạng thái!');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleViewCategory = (category) => {
    setSelectedCategory(category);
    setShowViewModal(true);
  };

  const handleCreateCategory = () => {
    setFormData({
      name: '',
      description: '',
      image: '',
      parentCategory: '',
      order: 0,
      isActive: true
    });
    setShowCreateModal(true);
  };

  const handleEditCategory = (category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name || '',
      description: category.description || '',
      image: category.image || '',
      parentCategory: category.parentCategory?._id || '',
      order: category.order || 0,
      isActive: category.isActive
    });
    setShowEditModal(true);
  };

  const handleDeleteCategory = (category) => {
    setSelectedCategory(category);
    setShowDeleteModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      setFormLoading(true);
      
      const categoryData = {
        ...formData,
        parentCategory: formData.parentCategory || null
      };

      if (showCreateModal) {
        const response = await categoryService.createCategory(categoryData);
        setCategories([...categories, response]);
        setSuccessMessage('Tạo danh mục thành công!');
        setShowCreateModal(false);
      } else if (showEditModal) {
        const response = await categoryService.updateCategory(selectedCategory._id, categoryData);
        setCategories(categories.map(category => 
          category._id === selectedCategory._id ? response : category
        ));
        setSuccessMessage('Cập nhật danh mục thành công!');
        setShowEditModal(false);
      }
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error saving category:', error);
      setError(typeof error === 'string' ? error : 'Có lỗi xảy ra khi lưu danh mục!');
      setTimeout(() => setError(''), 3000);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      setFormLoading(true);
      await categoryService.deleteCategory(selectedCategory._id);
      setCategories(categories.filter(category => category._id !== selectedCategory._id));
      setSuccessMessage('Xóa danh mục thành công!');
      setShowDeleteModal(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error deleting category:', error);
      setError(typeof error === 'string' ? error : 'Có lỗi xảy ra khi xóa danh mục!');
      setTimeout(() => setError(''), 3000);
    } finally {
      setFormLoading(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Filter categories locally
  const filteredCategories = categories.filter(category => {
    const matchesSearch = searchTerm === '' || 
      category.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === '' || 
      (filterStatus === 'true' && category.isActive) ||
      (filterStatus === 'false' && !category.isActive);
    
    return matchesSearch && matchesStatus;
  });

  // Get parent categories for dropdown (exclude current category when editing)
  const getParentCategories = () => {
    return categories.filter(category => 
      category._id !== selectedCategory?._id && 
      !category.parentCategory // Only root categories can be parents
    );
  };

  if (loading && categories.length === 0) {
    return (
      <div className="admin-categories">
        <div className="loading">
          <i className="fas fa-spinner fa-spin"></i>
          <span>Đang tải dữ liệu...</span>
        </div>
      </div>
    );
  }

  if (error && !categories.length) {
    return (
      <div className="admin-categories">
        <div className="error-message">
          <i className="fas fa-exclamation-triangle"></i>
          <h3>Có lỗi xảy ra</h3>
          <p>{error}</p>
          <button onClick={fetchCategories} className="btn btn-primary">
            <i className="fas fa-redo"></i>
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-categories admin-page">
      <div className="page-header">
        <div className="header-left">
          <h1>Quản Lý Danh Mục</h1>
          <p>Quản lý tất cả danh mục sản phẩm trong hệ thống</p>
        </div>
        <div className="header-right">
          <button onClick={handleCreateCategory} className="btn btn-primary">
            <i className="fas fa-plus"></i>
            Thêm danh mục
          </button>
          <button onClick={fetchCategories} className="btn btn-secondary">
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
            placeholder="Tìm kiếm danh mục (tên, mô tả)..."
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
            <option value="true">Đang hoạt động</option>
            <option value="false">Không hoạt động</option>
          </select>
        </div>

        <div className="results-info">
          Hiển thị {filteredCategories.length} / {categories.length} danh mục
        </div>
      </div>

      <div className="categories-table">
        <table>
          <thead>
            <tr>
              <th>Tên danh mục</th>
              <th>Slug</th>
              <th>Danh mục cha</th>
              <th>Thứ tự</th>
              <th>Trạng thái</th>
              <th>Ngày tạo</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredCategories.map(category => (
              <tr key={category._id}>
                <td className="category-name">
                  <div className="category-info">
                    {category.image && (
                      <img 
                        src={category.image} 
                        alt={category.name}
                        className="category-image"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    )}
                    <div>
                      <h4>{category.name}</h4>
                      {category.description && (
                        <p className="description">{category.description}</p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="category-slug">
                  <code>{category.slug}</code>
                </td>
                <td className="parent-category">
                  {category.parentCategory ? (
                    <span className="parent-name">{category.parentCategory.name}</span>
                  ) : (
                    <span className="no-parent">Danh mục gốc</span>
                  )}
                </td>
                <td className="category-order">
                  {category.order}
                </td>
                <td>
                  <label className="status-toggle">
                    <input
                      type="checkbox"
                      checked={category.isActive}
                      onChange={(e) => handleStatusChange(category._id, e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                    <span className={`status-text ${category.isActive ? 'active' : 'inactive'}`}>
                      {category.isActive ? 'Hoạt động' : 'Không hoạt động'}
                    </span>
                  </label>
                </td>
                <td>
                  {new Date(category.createdAt).toLocaleDateString('vi-VN')}
                </td>
                <td className="actions">
                  <button
                    className="btn btn-sm btn-info"
                    title="Xem chi tiết"
                    onClick={() => handleViewCategory(category)}
                  >
                    <i className="fas fa-eye"></i>
                  </button>
                  <button
                    className="btn btn-sm btn-warning"
                    title="Chỉnh sửa"
                    onClick={() => handleEditCategory(category)}
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    title="Xóa danh mục"
                    onClick={() => handleDeleteCategory(category)}
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredCategories.length === 0 && (
          <div className="no-data">
            <i className="fas fa-folder-open"></i>
            <h3>Không có danh mục nào</h3>
            <p>Không tìm thấy danh mục phù hợp với bộ lọc hiện tại.</p>
          </div>
        )}
      </div>

      {/* View Category Modal */}
      {showViewModal && selectedCategory && (
        <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Chi tiết danh mục: {selectedCategory.name}</h3>
              <button 
                className="close-btn"
                onClick={() => setShowViewModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="category-detail-grid">
                <div className="detail-section">
                  <h4>Thông tin cơ bản</h4>
                  <div className="detail-item">
                    <label>Tên danh mục:</label>
                    <span>{selectedCategory.name}</span>
                  </div>
                  <div className="detail-item">
                    <label>Slug:</label>
                    <span><code>{selectedCategory.slug}</code></span>
                  </div>
                  <div className="detail-item">
                    <label>Mô tả:</label>
                    <span>{selectedCategory.description || 'Không có mô tả'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Danh mục cha:</label>
                    <span>{selectedCategory.parentCategory?.name || 'Danh mục gốc'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Thứ tự hiển thị:</label>
                    <span>{selectedCategory.order}</span>
                  </div>
                  <div className="detail-item">
                    <label>Trạng thái:</label>
                    <span className={`status ${selectedCategory.isActive ? 'active' : 'inactive'}`}>
                      {selectedCategory.isActive ? 'Đang hoạt động' : 'Không hoạt động'}
                    </span>
                  </div>
                </div>
                
                {selectedCategory.image && (
                  <div className="detail-section">
                    <h4>Hình ảnh</h4>
                    <div className="category-image-preview">
                      <img 
                        src={selectedCategory.image} 
                        alt={selectedCategory.name}
                        onError={(e) => {
                          e.target.src = '/images/placeholder.jpg';
                        }}
                      />
                    </div>
                  </div>
                )}

                <div className="detail-section full-width">
                  <h4>Thông tin hệ thống</h4>
                  <div className="detail-item">
                    <label>Ngày tạo:</label>
                    <span>{new Date(selectedCategory.createdAt).toLocaleString('vi-VN')}</span>
                  </div>
                  <div className="detail-item">
                    <label>Cập nhật lần cuối:</label>
                    <span>{new Date(selectedCategory.updatedAt).toLocaleString('vi-VN')}</span>
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

      {/* Create/Edit Category Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="modal-overlay" onClick={() => {
          setShowCreateModal(false);
          setShowEditModal(false);
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{showCreateModal ? 'Thêm danh mục mới' : 'Chỉnh sửa danh mục'}</h3>
              <button 
                className="close-btn"
                onClick={() => {
                  setShowCreateModal(false);
                  setShowEditModal(false);
                }}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleFormSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="name">Tên danh mục *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    placeholder="Nhập tên danh mục"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="description">Mô tả</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleFormChange}
                    rows="3"
                    placeholder="Nhập mô tả cho danh mục"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="image">Hình ảnh (URL)</label>
                  <input
                    type="url"
                    id="image"
                    name="image"
                    value={formData.image}
                    onChange={handleFormChange}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="parentCategory">Danh mục cha</label>
                  <select
                    id="parentCategory"
                    name="parentCategory"
                    value={formData.parentCategory}
                    onChange={handleFormChange}
                  >
                    <option value="">Danh mục gốc</option>
                    {getParentCategories().map(category => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="order">Thứ tự hiển thị</label>
                  <input
                    type="number"
                    id="order"
                    name="order"
                    value={formData.order}
                    onChange={handleFormChange}
                    min="0"
                    placeholder="0"
                  />
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleFormChange}
                    />
                    <span>Kích hoạt danh mục</span>
                  </label>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowCreateModal(false);
                    setShowEditModal(false);
                  }}
                  disabled={formLoading}
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  className="btn btn-primary"
                  disabled={formLoading}
                >
                  {formLoading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      {showCreateModal ? 'Đang tạo...' : 'Đang cập nhật...'}
                    </>
                  ) : (
                    showCreateModal ? 'Tạo danh mục' : 'Cập nhật'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedCategory && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Xác nhận xóa danh mục</h3>
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
                <p>Bạn có chắc chắn muốn xóa danh mục <strong>"{selectedCategory.name}"</strong>?</p>
                <p className="warning-text">
                  Hành động này không thể hoàn tác. Danh mục sẽ bị xóa vĩnh viễn.
                </p>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowDeleteModal(false)}
                disabled={formLoading}
              >
                Hủy
              </button>
              <button 
                type="button"
                className="btn btn-danger"
                onClick={handleDeleteConfirm}
                disabled={formLoading}
              >
                {formLoading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Đang xóa...
                  </>
                ) : (
                  <>
                    <i className="fas fa-trash"></i>
                    Xóa danh mục
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories; 