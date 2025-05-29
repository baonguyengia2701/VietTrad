import React, { useState, useEffect } from 'react';
import { brandService } from '../../services/brandService';
import './AdminBrands.scss';

const AdminBrands = () => {
  const [brands, setBrands] = useState([]);
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
  const [selectedBrand, setSelectedBrand] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    logo: '',
    website: '',
    order: 0,
    isActive: true
  });
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      setError('');
      
      const filters = {};
      if (filterStatus !== '') {
        filters.active = filterStatus === 'true';
      }

      const response = await brandService.getAllBrands(filters);
      setBrands(response || []);
    } catch (error) {
      console.error('Error fetching brands:', error);
      setError('Không thể tải danh sách thương hiệu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (brandId, newStatus) => {
    try {
      await brandService.toggleBrandStatus(brandId);
      setBrands(brands.map(brand => 
        brand._id === brandId 
          ? { ...brand, isActive: newStatus }
          : brand
      ));
      setSuccessMessage('Cập nhật trạng thái thương hiệu thành công!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error updating brand status:', error);
      setError('Có lỗi xảy ra khi cập nhật trạng thái!');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleViewBrand = (brand) => {
    setSelectedBrand(brand);
    setShowViewModal(true);
  };

  const handleCreateBrand = () => {
    setFormData({
      name: '',
      description: '',
      logo: '',
      website: '',
      order: 0,
      isActive: true
    });
    setShowCreateModal(true);
  };

  const handleEditBrand = (brand) => {
    setSelectedBrand(brand);
    setFormData({
      name: brand.name || '',
      description: brand.description || '',
      logo: brand.logo || '',
      website: brand.website || '',
      order: brand.order || 0,
      isActive: brand.isActive
    });
    setShowEditModal(true);
  };

  const handleDeleteBrand = (brand) => {
    setSelectedBrand(brand);
    setShowDeleteModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      setFormLoading(true);
      
      const brandData = {
        ...formData
      };

      if (showCreateModal) {
        const response = await brandService.createBrand(brandData);
        setBrands([...brands, response]);
        setSuccessMessage('Tạo thương hiệu thành công!');
        setShowCreateModal(false);
      } else if (showEditModal) {
        const response = await brandService.updateBrand(selectedBrand._id, brandData);
        setBrands(brands.map(brand => 
          brand._id === selectedBrand._id ? response : brand
        ));
        setSuccessMessage('Cập nhật thương hiệu thành công!');
        setShowEditModal(false);
      }
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error saving brand:', error);
      setError(typeof error === 'string' ? error : 'Có lỗi xảy ra khi lưu thương hiệu!');
      setTimeout(() => setError(''), 3000);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      setFormLoading(true);
      await brandService.deleteBrand(selectedBrand._id);
      setBrands(brands.filter(brand => brand._id !== selectedBrand._id));
      setSuccessMessage('Xóa thương hiệu thành công!');
      setShowDeleteModal(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error deleting brand:', error);
      setError(typeof error === 'string' ? error : 'Có lỗi xảy ra khi xóa thương hiệu!');
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

  // Filter brands locally
  const filteredBrands = brands.filter(brand => {
    const matchesSearch = searchTerm === '' || 
      brand.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      brand.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      brand.website?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === '' || 
      (filterStatus === 'true' && brand.isActive) ||
      (filterStatus === 'false' && !brand.isActive);
    
    return matchesSearch && matchesStatus;
  });

  if (loading && brands.length === 0) {
    return (
      <div className="admin-brands">
        <div className="loading">
          <i className="fas fa-spinner fa-spin"></i>
          <span>Đang tải dữ liệu...</span>
        </div>
      </div>
    );
  }

  if (error && !brands.length) {
    return (
      <div className="admin-brands">
        <div className="error-message">
          <i className="fas fa-exclamation-triangle"></i>
          <h3>Có lỗi xảy ra</h3>
          <p>{error}</p>
          <button onClick={fetchBrands} className="btn btn-primary">
            <i className="fas fa-redo"></i>
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-brands">
      <div className="page-header">
        <div className="header-left">
          <h1>Quản Lý Thương Hiệu</h1>
          <p>Quản lý tất cả thương hiệu sản phẩm trong hệ thống</p>
        </div>
        <div className="header-right">
          <button onClick={handleCreateBrand} className="btn btn-primary">
            <i className="fas fa-plus"></i>
            Thêm thương hiệu
          </button>
          <button onClick={fetchBrands} className="btn btn-secondary">
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
            placeholder="Tìm kiếm thương hiệu (tên, mô tả, website)..."
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
          Hiển thị {filteredBrands.length} / {brands.length} thương hiệu
        </div>
      </div>

      <div className="brands-table">
        <table>
          <thead>
            <tr>
              <th>Tên thương hiệu</th>
              <th>Slug</th>
              <th>Website</th>
              <th>Thứ tự</th>
              <th>Trạng thái</th>
              <th>Ngày tạo</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredBrands.map(brand => (
              <tr key={brand._id}>
                <td className="brand-name">
                  <div className="brand-info">
                    {brand.logo && (
                      <img 
                        src={brand.logo} 
                        alt={brand.name}
                        className="brand-logo"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    )}
                    <div>
                      <h4>{brand.name}</h4>
                      {brand.description && (
                        <p className="description">{brand.description}</p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="brand-slug">
                  <code>{brand.slug}</code>
                </td>
                <td className="brand-website">
                  {brand.website ? (
                    <a 
                      href={brand.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="website-link"
                    >
                      <i className="fas fa-external-link-alt"></i>
                      {brand.website}
                    </a>
                  ) : (
                    <span className="no-website">Chưa có website</span>
                  )}
                </td>
                <td className="brand-order">
                  {brand.order}
                </td>
                <td>
                  <label className="status-toggle">
                    <input
                      type="checkbox"
                      checked={brand.isActive}
                      onChange={(e) => handleStatusChange(brand._id, e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                    <span className={`status-text ${brand.isActive ? 'active' : 'inactive'}`}>
                      {brand.isActive ? 'Hoạt động' : 'Không hoạt động'}
                    </span>
                  </label>
                </td>
                <td>
                  {new Date(brand.createdAt).toLocaleDateString('vi-VN')}
                </td>
                <td className="actions">
                  <button
                    className="btn btn-sm btn-info"
                    title="Xem chi tiết"
                    onClick={() => handleViewBrand(brand)}
                  >
                    <i className="fas fa-eye"></i>
                  </button>
                  <button
                    className="btn btn-sm btn-warning"
                    title="Chỉnh sửa"
                    onClick={() => handleEditBrand(brand)}
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    title="Xóa thương hiệu"
                    onClick={() => handleDeleteBrand(brand)}
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredBrands.length === 0 && (
          <div className="no-data">
            <i className="fas fa-tags"></i>
            <h3>Không có thương hiệu nào</h3>
            <p>Không tìm thấy thương hiệu phù hợp với bộ lọc hiện tại.</p>
          </div>
        )}
      </div>

      {/* View Brand Modal */}
      {showViewModal && selectedBrand && (
        <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Chi tiết thương hiệu: {selectedBrand.name}</h3>
              <button 
                className="close-btn"
                onClick={() => setShowViewModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="brand-detail-grid">
                <div className="detail-section">
                  <h4>Thông tin cơ bản</h4>
                  <div className="detail-item">
                    <label>Tên thương hiệu:</label>
                    <span>{selectedBrand.name}</span>
                  </div>
                  <div className="detail-item">
                    <label>Slug:</label>
                    <span><code>{selectedBrand.slug}</code></span>
                  </div>
                  <div className="detail-item">
                    <label>Mô tả:</label>
                    <span>{selectedBrand.description || 'Không có mô tả'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Website:</label>
                    <span>
                      {selectedBrand.website ? (
                        <a 
                          href={selectedBrand.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="website-link"
                        >
                          <i className="fas fa-external-link-alt"></i>
                          {selectedBrand.website}
                        </a>
                      ) : (
                        'Chưa có website'
                      )}
                    </span>
                  </div>
                  <div className="detail-item">
                    <label>Thứ tự hiển thị:</label>
                    <span>{selectedBrand.order}</span>
                  </div>
                  <div className="detail-item">
                    <label>Trạng thái:</label>
                    <span className={`status ${selectedBrand.isActive ? 'active' : 'inactive'}`}>
                      {selectedBrand.isActive ? 'Đang hoạt động' : 'Không hoạt động'}
                    </span>
                  </div>
                </div>
                
                {selectedBrand.logo && (
                  <div className="detail-section">
                    <h4>Logo</h4>
                    <div className="brand-logo-preview">
                      <img 
                        src={selectedBrand.logo} 
                        alt={selectedBrand.name}
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
                    <span>{new Date(selectedBrand.createdAt).toLocaleString('vi-VN')}</span>
                  </div>
                  <div className="detail-item">
                    <label>Cập nhật lần cuối:</label>
                    <span>{new Date(selectedBrand.updatedAt).toLocaleString('vi-VN')}</span>
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

      {/* Create/Edit Brand Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="modal-overlay" onClick={() => {
          setShowCreateModal(false);
          setShowEditModal(false);
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{showCreateModal ? 'Thêm thương hiệu mới' : 'Chỉnh sửa thương hiệu'}</h3>
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
                  <label htmlFor="name">Tên thương hiệu *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    placeholder="Nhập tên thương hiệu"
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
                    placeholder="Nhập mô tả cho thương hiệu"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="logo">Logo (URL)</label>
                  <input
                    type="url"
                    id="logo"
                    name="logo"
                    value={formData.logo}
                    onChange={handleFormChange}
                    placeholder="https://example.com/logo.jpg"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="website">Website</label>
                  <input
                    type="url"
                    id="website"
                    name="website"
                    value={formData.website}
                    onChange={handleFormChange}
                    placeholder="https://example.com"
                  />
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
                    <span>Kích hoạt thương hiệu</span>
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
                    showCreateModal ? 'Tạo thương hiệu' : 'Cập nhật'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedBrand && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Xác nhận xóa thương hiệu</h3>
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
                <p>Bạn có chắc chắn muốn xóa thương hiệu <strong>"{selectedBrand.name}"</strong>?</p>
                <p className="warning-text">
                  Hành động này không thể hoàn tác. Thương hiệu sẽ bị xóa vĩnh viễn.
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
                    Xóa thương hiệu
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

export default AdminBrands; 