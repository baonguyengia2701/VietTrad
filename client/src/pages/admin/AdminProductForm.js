import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { productService, categoryService, brandService } from '../../services/productService';
import './AdminProductForm.scss';

const AdminProductForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    discount: 0,
    countInStock: '',
    category: '',
    brand: '',
    images: [''],
    isActive: true,
    isFeatured: false,
    variants: {
      title: [''],
      size: ['']
    }
  });

  useEffect(() => {
    fetchInitialData();
    if (isEdit) {
      fetchProduct();
    }
  }, [id, isEdit]);

  const fetchInitialData = async () => {
    try {
      const [categoriesData, brandsData] = await Promise.all([
        categoryService.getCategories(),
        brandService.getBrands()
      ]);
      setCategories(categoriesData);
      setBrands(brandsData);
    } catch (error) {
      console.error('Error fetching initial data:', error);
      setError('Không thể tải dữ liệu ban đầu');
    }
  };

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const product = await productService.getProduct(id);
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        discount: product.discount || 0,
        countInStock: product.countInStock || '',
        category: product.category || '',
        brand: product.brand || '',
        images: product.images && product.images.length > 0 ? product.images : [''],
        isActive: product.isActive !== undefined ? product.isActive : true,
        isFeatured: product.isFeatured || false,
        variants: {
          title: product.variants?.title && product.variants.title.length > 0 ? product.variants.title : [''],
          size: product.variants?.size && product.variants.size.length > 0 ? product.variants.size : ['']
        }
      });
    } catch (error) {
      console.error('Error fetching product:', error);
      setError('Không thể tải thông tin sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');

      // Validate required fields
      if (!formData.name || !formData.price || !formData.category || !formData.brand) {
        setError('Vui lòng điền đầy đủ các trường bắt buộc');
        return;
      }

      // Filter out empty images
      const filteredImages = formData.images.filter(img => img.trim() !== '');
      if (filteredImages.length === 0) {
        setError('Vui lòng thêm ít nhất một hình ảnh');
        return;
      }

      // Filter out empty variants
      const filteredVariants = {
        title: formData.variants.title.filter(title => title.trim() !== ''),
        size: formData.variants.size.filter(size => size.trim() !== '')
      };

      const productData = {
        ...formData,
        images: filteredImages,
        variants: filteredVariants,
        price: parseFloat(formData.price),
        discount: parseFloat(formData.discount) || 0
      };

      // Chỉ thêm countInStock khi tạo sản phẩm mới (mặc định = 0)
      if (!isEdit) {
        productData.countInStock = 0;
      }

      if (isEdit) {
        await productService.updateProduct(id, productData);
        setSuccessMessage('Cập nhật sản phẩm thành công!');
      } else {
        await productService.createProduct(productData);
        setSuccessMessage('Tạo sản phẩm mới thành công!');
      }

      setTimeout(() => {
        navigate('/admin/products');
      }, 2000);
    } catch (error) {
      console.error('Error saving product:', error);
      setError(typeof error === 'string' ? error : 'Có lỗi xảy ra khi lưu sản phẩm');
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

  const handleImageChange = (index, value) => {
    const newImages = [...formData.images];
    newImages[index] = value;
    setFormData(prev => ({
      ...prev,
      images: newImages
    }));
  };

  const addImageField = () => {
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, '']
    }));
  };

  const removeImageField = (index) => {
    if (formData.images.length > 1) {
      const newImages = formData.images.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        images: newImages
      }));
    }
  };

  const handleVariantChange = (type, index, value) => {
    const newVariants = { ...formData.variants };
    newVariants[type][index] = value;
    setFormData(prev => ({
      ...prev,
      variants: newVariants
    }));
  };

  const addVariantField = (type) => {
    setFormData(prev => ({
      ...prev,
      variants: {
        ...prev.variants,
        [type]: [...prev.variants[type], '']
      }
    }));
  };

  const removeVariantField = (type, index) => {
    if (formData.variants[type].length > 1) {
      const newVariants = { ...formData.variants };
      newVariants[type] = newVariants[type].filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        variants: newVariants
      }));
    }
  };

  if (loading && isEdit) {
    return (
      <div className="admin-product-form">
        <div className="loading">
          <i className="fas fa-spinner fa-spin"></i>
          <span>Đang tải dữ liệu...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-product-form">
      <div className="page-header">
        <div className="header-left">
          <h1>{isEdit ? 'Chỉnh Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới'}</h1>
          <p>{isEdit ? 'Cập nhật thông tin sản phẩm' : 'Tạo sản phẩm mới cho cửa hàng'}</p>
        </div>
        <div className="header-right">
          <button 
            type="button"
            onClick={() => navigate('/admin/products')}
            className="btn btn-secondary"
          >
            <i className="fas fa-arrow-left"></i>
            Quay lại
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

      <div className="form-container">
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            {/* Basic Information */}
            <div className="form-section">
              <h3>Thông tin cơ bản</h3>
              
              <div className="form-group">
                <label htmlFor="name">Tên sản phẩm *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Nhập tên sản phẩm"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="category">Danh mục *</label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Chọn danh mục</option>
                    {categories.map(category => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="brand">Thương hiệu *</label>
                  <select
                    id="brand"
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Chọn thương hiệu</option>
                    {brands.map(brand => (
                      <option key={brand._id} value={brand._id}>
                        {brand.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="description">Mô tả sản phẩm</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="5"
                  placeholder="Nhập mô tả chi tiết về sản phẩm"
                />
              </div>
            </div>

            {/* Pricing & Inventory */}
            <div className="form-section">
              <h3>Giá & Kho hàng</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="price">Giá bán *</label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    min="0"
                    step="1000"
                    required
                    placeholder="0"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="discount">Giảm giá (%)</label>
                  <input
                    type="number"
                    id="discount"
                    name="discount"
                    value={formData.discount}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Số lượng tồn kho</label>
                <p className="form-note">
                  <i className="fas fa-info-circle"></i>
                  Số lượng tồn kho sẽ được quản lý thông qua trang "Quản lý kho". 
                  Tồn kho hiện tại: <strong>{formData.countInStock || 0}</strong>
                </p>
              </div>
            </div>

            {/* Images */}
            <div className="form-section full-width">
              <h3>Hình ảnh sản phẩm</h3>
              
              {formData.images.map((image, index) => (
                <div key={index} className="image-input-group">
                  <input
                    type="url"
                    value={image}
                    onChange={(e) => handleImageChange(index, e.target.value)}
                    placeholder="URL hình ảnh"
                  />
                  {formData.images.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeImageField(index)}
                      className="btn btn-sm btn-danger"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  )}
                </div>
              ))}
              
              <button
                type="button"
                onClick={addImageField}
                className="btn btn-sm btn-secondary"
              >
                <i className="fas fa-plus"></i>
                Thêm hình ảnh
              </button>
            </div>

            {/* Variants */}
            <div className="form-section full-width">
              <h3>Biến thể sản phẩm</h3>
              
              <div className="variants-container">
                <div className="variant-group">
                  <label>Tiêu đề biến thể</label>
                  {formData.variants.title.map((title, index) => (
                    <div key={index} className="variant-input-group">
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => handleVariantChange('title', index, e.target.value)}
                        placeholder="Ví dụ: Màu sắc, Kích thước..."
                      />
                      {formData.variants.title.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeVariantField('title', index)}
                          className="btn btn-sm btn-danger"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addVariantField('title')}
                    className="btn btn-sm btn-secondary"
                  >
                    <i className="fas fa-plus"></i>
                    Thêm tiêu đề
                  </button>
                </div>

                <div className="variant-group">
                  <label>Giá trị biến thể</label>
                  {formData.variants.size.map((size, index) => (
                    <div key={index} className="variant-input-group">
                      <input
                        type="text"
                        value={size}
                        onChange={(e) => handleVariantChange('size', index, e.target.value)}
                        placeholder="Ví dụ: Đỏ, Xanh, S, M, L..."
                      />
                      {formData.variants.size.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeVariantField('size', index)}
                          className="btn btn-sm btn-danger"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addVariantField('size')}
                    className="btn btn-sm btn-secondary"
                  >
                    <i className="fas fa-plus"></i>
                    Thêm giá trị
                  </button>
                </div>
              </div>
            </div>

            {/* Settings */}
            <div className="form-section full-width">
              <h3>Cài đặt</h3>
              
              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                  />
                  <span>Sản phẩm hoạt động</span>
                </label>

                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={formData.isFeatured}
                    onChange={handleInputChange}
                  />
                  <span>Sản phẩm nổi bật</span>
                </label>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="button"
              onClick={() => navigate('/admin/products')}
              className="btn btn-secondary"
              disabled={loading}
            >
              Hủy
            </button>
            <button 
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  {isEdit ? 'Đang cập nhật...' : 'Đang tạo...'}
                </>
              ) : (
                <>
                  <i className={`fas ${isEdit ? 'fa-save' : 'fa-plus'}`}></i>
                  {isEdit ? 'Cập nhật sản phẩm' : 'Tạo sản phẩm'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminProductForm; 