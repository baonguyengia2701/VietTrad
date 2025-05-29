import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productService, categoryService, brandService } from '../../services/productService';
import './AdminProducts.scss';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterBrand, setFilterBrand] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [currentPage, searchTerm, filterCategory, filterBrand]);

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

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');
      
      const filters = {
        page: currentPage,
        limit: productsPerPage,
        search: searchTerm,
        category: filterCategory,
        brand: filterBrand
      };

      const response = await productService.getAllProducts(filters);
      
      if (response.products) {
        setProducts(response.products);
        setTotalPages(response.pagination?.pages || 1);
        setTotalProducts(response.pagination?.total || 0);
      } else {
        // Fallback for different response structure
        setProducts(response);
        setTotalPages(Math.ceil(response.length / productsPerPage));
        setTotalProducts(response.length);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Không thể tải danh sách sản phẩm. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (product) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  const confirmDeleteProduct = async () => {
    try {
      await productService.deleteProduct(selectedProduct._id);
      setProducts(products.filter(product => product._id !== selectedProduct._id));
      setShowDeleteModal(false);
      setSuccessMessage('Xóa sản phẩm thành công!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error deleting product:', error);
      setError('Có lỗi xảy ra khi xóa sản phẩm!');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleStatusChange = async (productId, newStatus) => {
    try {
      const isActive = newStatus === 'active';
      await productService.updateProductStatus(productId, isActive);
      setProducts(products.map(product => 
        product._id === productId 
          ? { ...product, isActive, status: newStatus }
          : product
      ));
      setSuccessMessage('Cập nhật trạng thái sản phẩm thành công!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error updating product status:', error);
      setError('Có lỗi xảy ra khi cập nhật trạng thái!');
      setTimeout(() => setError(''), 3000);
    }
  };

  // View product details
  const handleViewProduct = async (productId) => {
    try {
      const product = await productService.getProduct(productId);
      setSelectedProduct(product);
      setShowViewModal(true);
    } catch (error) {
      console.error('Error fetching product details:', error);
      setError('Không thể tải thông tin chi tiết sản phẩm!');
      setTimeout(() => setError(''), 3000);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getStatusColor = (product) => {
    if (!product.isActive) return '#dc3545'; // red for inactive
    if (product.countInStock === 0) return '#ffc107'; // yellow for out of stock
    return '#28a745'; // green for active
  };

  const getStatusText = (product) => {
    if (!product.isActive) return 'Không hoạt động';
    if (product.countInStock === 0) return 'Hết hàng';
    return 'Hoạt động';
  };

  const getStatusValue = (product) => {
    if (!product.isActive) return 'inactive';
    if (product.countInStock === 0) return 'out_of_stock';
    return 'active';
  };

  // Filter products locally if needed
  const filteredProducts = products.filter(product => {
    const matchesSearch = searchTerm === '' || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.brandName && product.brandName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = filterCategory === '' || product.categoryName === filterCategory;
    const matchesBrand = filterBrand === '' || product.brandName === filterBrand;
    return matchesSearch && matchesCategory && matchesBrand;
  });

  if (loading && products.length === 0) {
    return (
      <div className="admin-products">
        <div className="loading">
          <i className="fas fa-spinner fa-spin"></i>
          <span>Đang tải dữ liệu...</span>
        </div>
      </div>
    );
  }

  if (error && !products.length) {
    return (
      <div className="admin-products">
        <div className="error-message">
          <i className="fas fa-exclamation-triangle"></i>
          <h3>Có lỗi xảy ra</h3>
          <p>{error}</p>
          <button onClick={fetchProducts} className="btn btn-primary">
            <i className="fas fa-redo"></i>
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-products">
      <div className="page-header">
        <div className="header-left">
          <h1>Quản Lý Sản Phẩm</h1>
          <p>Quản lý tất cả sản phẩm trong hệ thống</p>
        </div>
        <div className="header-right">
          <button onClick={fetchProducts} className="btn btn-secondary">
            <i className="fas fa-sync-alt"></i>
            Làm mới
          </button>
          <Link to="/admin/products/new" className="btn btn-primary">
            <i className="fas fa-plus"></i>
            Thêm Sản Phẩm
          </Link>
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
            placeholder="Tìm kiếm sản phẩm (tên, thương hiệu)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-dropdown">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="">Tất cả danh mục</option>
            {categories.map(category => (
              <option key={category._id} value={category.name}>{category.name}</option>
            ))}
          </select>
        </div>

        <div className="filter-dropdown">
          <select
            value={filterBrand}
            onChange={(e) => setFilterBrand(e.target.value)}
          >
            <option value="">Tất cả thương hiệu</option>
            {brands.map(brand => (
              <option key={brand._id} value={brand.name}>{brand.name}</option>
            ))}
          </select>
        </div>

        <div className="results-info">
          Hiển thị {filteredProducts.length} / {totalProducts} sản phẩm
        </div>
      </div>

      <div className="products-table">
        <table>
          <thead>
            <tr>
              <th>Sản phẩm</th>
              <th>Danh mục</th>
              <th>Thương hiệu</th>
              <th>Giá</th>
              <th>Tồn kho</th>
              <th>Trạng thái</th>
              <th>Ngày tạo</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map(product => (
              <tr key={product._id}>
                <td className="product-info">
                  <div className="product-image">
                    <img 
                      src={product.images?.[0] || '/images/placeholder.jpg'} 
                      alt={product.name}
                      onError={(e) => {
                        e.target.src = '/images/placeholder.jpg';
                      }}
                    />
                  </div>
                  <div className="product-details">
                    <h4>{product.name}</h4>
                    <span className="product-id">ID: {product._id}</span>
                  </div>
                </td>
                <td>{product.categoryName || 'Chưa phân loại'}</td>
                <td>{product.brandName || 'Chưa có thương hiệu'}</td>
                <td className="price">{formatCurrency(product.price)}</td>
                <td className={`stock ${product.countInStock === 0 ? 'out-of-stock' : ''}`}>
                  {product.countInStock}
                </td>
                <td>
                  <select
                    value={getStatusValue(product)}
                    onChange={(e) => handleStatusChange(product._id, e.target.value)}
                    className="status-select"
                    style={{ color: getStatusColor(product) }}
                  >
                    <option value="active">Hoạt động</option>
                    <option value="inactive">Không hoạt động</option>
                    <option value="out_of_stock">Hết hàng</option>
                  </select>
                </td>
                <td>{new Date(product.createdAt).toLocaleDateString('vi-VN')}</td>
                <td className="actions">
                  <button
                    className="btn btn-sm btn-info"
                    title="Xem chi tiết"
                    onClick={() => handleViewProduct(product._id)}
                  >
                    <i className="fas fa-eye"></i>
                  </button>
                  <Link
                    to={`/admin/products/${product._id}/edit`}
                    className="btn btn-sm btn-warning"
                    title="Chỉnh sửa"
                  >
                    <i className="fas fa-edit"></i>
                  </Link>
                  <button
                    onClick={() => handleDeleteProduct(product)}
                    className="btn btn-sm btn-danger"
                    title="Xóa sản phẩm"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredProducts.length === 0 && (
          <div className="no-data">
            <i className="fas fa-box-open"></i>
            <h3>Không có sản phẩm nào</h3>
            <p>Không tìm thấy sản phẩm phù hợp với bộ lọc hiện tại.</p>
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

      {/* View Product Modal */}
      {showViewModal && selectedProduct && (
        <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Chi tiết sản phẩm</h3>
              <button 
                className="close-btn"
                onClick={() => setShowViewModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="product-detail-grid">
                <div className="detail-item">
                  <label>Tên sản phẩm:</label>
                  <span>{selectedProduct.name}</span>
                </div>
                <div className="detail-item">
                  <label>Danh mục:</label>
                  <span>{selectedProduct.categoryName || 'Chưa phân loại'}</span>
                </div>
                <div className="detail-item">
                  <label>Thương hiệu:</label>
                  <span>{selectedProduct.brandName || 'Chưa có thương hiệu'}</span>
                </div>
                <div className="detail-item">
                  <label>Giá:</label>
                  <span className="price">{formatCurrency(selectedProduct.price)}</span>
                </div>
                <div className="detail-item">
                  <label>Giảm giá:</label>
                  <span>{selectedProduct.discount || 0}%</span>
                </div>
                <div className="detail-item">
                  <label>Tồn kho:</label>
                  <span>{selectedProduct.countInStock}</span>
                </div>
                <div className="detail-item">
                  <label>Trạng thái:</label>
                  <span 
                    className="status-badge"
                    style={{ color: getStatusColor(selectedProduct) }}
                  >
                    {getStatusText(selectedProduct)}
                  </span>
                </div>
                <div className="detail-item">
                  <label>Ngày tạo:</label>
                  <span>{new Date(selectedProduct.createdAt).toLocaleDateString('vi-VN')}</span>
                </div>
                <div className="detail-item full-width">
                  <label>Mô tả:</label>
                  <span>{selectedProduct.description || 'Chưa có mô tả'}</span>
                </div>
                {selectedProduct.images && selectedProduct.images.length > 0 && (
                  <div className="detail-item full-width">
                    <label>Hình ảnh:</label>
                    <div className="product-images">
                      {selectedProduct.images.map((image, index) => (
                        <img 
                          key={index} 
                          src={image} 
                          alt={`${selectedProduct.name} ${index + 1}`}
                          onError={(e) => {
                            e.target.src = '/images/placeholder.jpg';
                          }}
                        />
                      ))}
                    </div>
                  </div>
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

      {/* Delete Product Modal */}
      {showDeleteModal && selectedProduct && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Xác nhận xóa sản phẩm</h3>
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
                  Bạn có chắc chắn muốn xóa sản phẩm <strong>{selectedProduct.name}</strong>?
                </p>
                <p className="warning-text">
                  Hành động này sẽ ẩn sản phẩm khỏi cửa hàng và không thể hoàn tác.
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
                onClick={confirmDeleteProduct}
              >
                <i className="fas fa-trash"></i>
                Xóa sản phẩm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts; 