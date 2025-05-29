import React, { useState, useEffect } from 'react';
import { Container, Form } from 'react-bootstrap';
import { Link, useSearchParams } from 'react-router-dom';
import { productService, categoryService, brandService, transformProductsData } from '../services/productService';
import { useCart } from '../contexts/CartContext';
import { useCartNotification } from '../components/common/CartNotification';
import ProductModal from '../components/ProductModal';
import './Products.scss';

const Products = () => {
  const { addToCart } = useCart();
  const { showSuccess, showError, NotificationComponent } = useCartNotification();
  const [searchParams, setSearchParams] = useSearchParams();
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState(['all']);
  const [brands, setBrands] = useState(['all']);
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeBrand, setActiveBrand] = useState('all');
  const [priceRange, setPriceRange] = useState(10000000); // Tăng lên 10 triệu để hiển thị tất cả sản phẩm
  const [maxPrice, setMaxPrice] = useState(10000000); // Giá cao nhất để set cho slider
  const [sortOption, setSortOption] = useState('newest');
  const [expandedFilters, setExpandedFilters] = useState({
    category: true,
    brand: true,
    price: true
  });
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const productsPerPage = 8;

  useEffect(() => {
    fetchInitialData();
    
    // Đọc sort parameter từ URL
    const sortParam = searchParams.get('sort');
    if (sortParam && ['newest', 'price_asc', 'price_desc', 'bestseller', 'rating'].includes(sortParam)) {
      setSortOption(sortParam);
    }
  }, [searchParams]);

  useEffect(() => {
    const searchTerm = searchParams.get('search');
    fetchProducts({
      category: activeCategory,
      brand: activeBrand,
      maxPrice: priceRange,
      sort: sortOption,
      search: searchTerm
    });
  }, [activeCategory, activeBrand, priceRange, sortOption, searchParams]);

  const fetchInitialData = async () => {
    try {
      const [categoriesData, brandsData] = await Promise.all([
        categoryService.getCategories(),
        brandService.getBrands()
      ]);
      setCategories(['all', ...categoriesData.map(cat => cat.name)]);
      setBrands(['all', ...brandsData.map(brand => brand.name)]);
    } catch (error) {
      console.error('Error fetching initial data:', error);
      setError('Không thể tải dữ liệu ban đầu');
    }
  };

  const fetchProducts = async (filters) => {
    try {
      setLoading(true);
      // Thêm limit: 1000 để lấy tất cả sản phẩm thay vì chỉ 8 sản phẩm mặc định
      const data = await productService.getProducts({
        ...filters,
        limit: 1000 // Đặt limit lớn để lấy tất cả sản phẩm
      });
      setAllProducts(data.products);
      setFilteredProducts(data.products);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Không thể tải danh sách sản phẩm');
      setLoading(false);
    }
  };

  // Lọc sản phẩm khi các bộ lọc thay đổi
  useEffect(() => {
    if (allProducts.length === 0) return;

    let result = [...allProducts];
    
    // Lọc theo danh mục
    if (activeCategory !== 'all') {
      result = result.filter(product => product.categoryName === activeCategory);
    }
    
    // Lọc theo thương hiệu
    if (activeBrand !== 'all') {
      result = result.filter(product => product.brandName === activeBrand);
    }
    
    // Lọc theo giá
    result = result.filter(product => product.price <= priceRange);
    
    // Sắp xếp sản phẩm
    if (sortOption === 'price_asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortOption === 'price_desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortOption === 'bestseller') {
      result.sort((a, b) => (b.sold || 0) - (a.sold || 0));
    } else if (sortOption === 'rating') {
      result.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
    }
    
    setFilteredProducts(result);
    setCurrentPage(1); // Reset về trang 1 khi filter thay đổi
  }, [allProducts, activeCategory, activeBrand, priceRange, sortOption]);

  // Tính toán phân trang
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const endIndex = startIndex + productsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  const handleCategoryClick = (category) => {
    setActiveCategory(category);
  };

  const handleBrandClick = (brand) => {
    setActiveBrand(brand);
  };

  const handlePriceChange = (e) => {
    setPriceRange(Number(e.target.value));
  };

  const handleSortChange = (e) => {
    const newSortOption = e.target.value;
    setSortOption(newSortOption);
    
    // Cập nhật URL parameters
    const newSearchParams = new URLSearchParams(searchParams);
    if (newSortOption !== 'newest') {
      newSearchParams.set('sort', newSortOption);
    } else {
      newSearchParams.delete('sort'); // Xóa param nếu là default
    }
    setSearchParams(newSearchParams);
  };

  const toggleFilter = (filter) => {
    setExpandedFilters(prev => ({
      ...prev,
      [filter]: !prev[filter]
    }));
  };

  const toggleFiltersPanel = () => {
    setShowFilters(!showFilters);
  };

  // Xử lý chuyển trang
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    // Scroll to top khi chuyển trang
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  // Tạo array số trang để hiển thị
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      let startPage = Math.max(1, currentPage - 2);
      let endPage = Math.min(totalPages, currentPage + 2);
      
      if (currentPage <= 3) {
        endPage = Math.min(totalPages, 5);
      }
      
      if (currentPage >= totalPages - 2) {
        startPage = Math.max(1, totalPages - 4);
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
    }
    
    return pageNumbers;
  };

  // Format giá tiền
  const formatPrice = (price) => {
    return price.toLocaleString('vi-VN');
  };

  // Tính giá sau khi giảm
  const getDiscountedPrice = (price, discount) => {
    if (discount > 0) {
      return price * (1 - discount / 100);
    }
    return price;
  };

  // Hiển thị rating dạng sao
  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const stars = [];

    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className="star filled">★</span>);
    }

    if (hasHalfStar) {
      stars.push(<span key="half" className="star half">★</span>);
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<span key={`empty-${i}`} className="star empty">★</span>);
    }

    return stars;
  };

  // Xử lý khi click nút "Thêm vào giỏ hàng"
  const handleAddToCartClick = (product) => {
    setSelectedProduct(product);
    setShowProductModal(true);
  };

  // Xử lý thêm sản phẩm vào giỏ từ modal
  const handleAddToCartFromModal = async (productWithOptions) => {
    try {
      // Chuẩn hóa dữ liệu trước khi thêm vào giỏ
      const normalizedProduct = {
        ...productWithOptions,
        // Đảm bảo selectedVariant có cấu trúc đúng
        selectedVariant: productWithOptions.selectedVariant || {
          title: '',
          size: ''
        }
      };
      
      await addToCart(normalizedProduct, productWithOptions.quantity || 1, normalizedProduct.selectedVariant);
      
      // Hiển thị thông báo thành công với product info
      showSuccess(
        'Thêm sản phẩm vào giỏ hàng thành công!',
        {
          name: normalizedProduct.name,
          brand: normalizedProduct.brandName,
          price: normalizedProduct.price,
          discount: normalizedProduct.discount || 0,
          image: normalizedProduct.images[0]
        },
        productWithOptions.quantity || 1
      );
      
    } catch (error) {
      console.error('Error adding to cart:', error);
      showError(error.message || 'Không thể thêm sản phẩm vào giỏ hàng');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="products-page">
        <Container>
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Đang tải sản phẩm...</p>
          </div>
        </Container>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="products-page">
        <Container>
          <div className="error-state">
            <h3>Có lỗi xảy ra</h3>
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>Thử lại</button>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="products-page">
      <Container>
        <div className="products-heading">
          <div className="breadcrumb">
            <Link to="/">Trang chủ</Link>
            <span className="separator">/</span>
            <span>Sản phẩm</span>
          </div>
          <div className="products-title-row">
            <h1>SẢN PHẨM <span className="products-count">{filteredProducts.length} sản phẩm</span></h1>
            <button className="filter-toggle-btn" onClick={toggleFiltersPanel}>
              <span className="filter-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.128.334L10 8.692V13.5a.5.5 0 0 1-.342.474l-3 1A.5.5 0 0 1 6 14.5V8.692L1.628 3.834A.5.5 0 0 1 1.5 3.5v-2z"/>
                </svg>
              </span>
              Bộ lọc
            </button>
          </div>
        </div>
        
        <div className="products-container">
          <div className={`filter-sidebar ${showFilters ? 'show' : ''}`}>
            <div className="filter-header">
              <h3>Bộ lọc sản phẩm</h3>
              <button className="close-filters" onClick={toggleFiltersPanel}>×</button>
            </div>
            
            <div className="filter-groups-container">
              <div className="filter-group">
                <div className="filter-heading" onClick={() => toggleFilter('brand')}>
                  <h4>
                    Thương hiệu
                    <span className={`icon ${expandedFilters.brand ? 'open' : ''}`}>
                      ▼
                    </span>
                  </h4>
                </div>
                {expandedFilters.brand && (
                  <div className="filter-content">
                    <ul className="filter-list">
                      {brands.map((brand, index) => (
                        <li 
                          key={index}
                          className={`filter-item ${activeBrand === brand ? 'active' : ''}`}
                          onClick={() => handleBrandClick(brand)}
                        >
                          {brand === 'all' ? 'Tất cả thương hiệu' : brand}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              
              <div className="filter-group">
                <div className="filter-heading" onClick={() => toggleFilter('price')}>
                  <h4>
                    Giá (đến {formatPrice(priceRange)} đ)
                    <span className={`icon ${expandedFilters.price ? 'open' : ''}`}>
                      ▼
                    </span>
                  </h4>
                </div>
                {expandedFilters.price && (
                  <div className="filter-content">
                    <div className="price-range">
                      <div className="range-slider">
                        <Form.Range 
                          min={0} 
                          max={maxPrice} 
                          step={10000}
                          value={priceRange}
                          onChange={handlePriceChange}
                        />
                      </div>
                      <div className="price-labels">
                        <span>0 đ</span>
                        <span>{formatPrice(maxPrice)} đ</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="filter-group">
                <div className="filter-heading" onClick={() => toggleFilter('category')}>
                  <h4>
                    Danh mục
                    <span className={`icon ${expandedFilters.category ? 'open' : ''}`}>
                      ▼
                    </span>
                  </h4>
                </div>
                {expandedFilters.category && (
                  <div className="filter-content">
                    <ul className="filter-list">
                      {categories.map((category, index) => (
                        <li 
                          key={index}
                          className={`filter-item ${activeCategory === category ? 'active' : ''}`}
                          onClick={() => handleCategoryClick(category)}
                        >
                          {category === 'all' ? 'Tất cả sản phẩm' : category}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
            
            <div className="apply-filters">
              <button className="apply-btn" onClick={toggleFiltersPanel}>Áp dụng</button>
            </div>
          </div>
          
          <div className="products-content">
            <div className="products-toolbar">
              <div className="sort-by">
                <label>Sắp xếp theo</label>
                <select onChange={handleSortChange} value={sortOption}>
                  <option value="newest">Mới nhất</option>
                  <option value="price_asc">Giá: Thấp đến cao</option>
                  <option value="price_desc">Giá: Cao đến thấp</option>
                  <option value="bestseller">Bán chạy nhất</option>
                  <option value="rating">Đánh giá cao nhất</option>
                </select>
              </div>
              <div className="page-info">
                Trang {currentPage} / {totalPages} - Hiển thị {currentProducts.length} / {filteredProducts.length} sản phẩm
              </div>
            </div>
            
            {currentProducts.length === 0 ? (
              <div className="no-products">
                <p>Không tìm thấy sản phẩm phù hợp với bộ lọc.</p>
              </div>
            ) : (
              <div className="products-grid">
                {currentProducts.map((product, index) => (
                  <div className="product-item" key={product.id || product._id}>
                    <div className="product-card">
                      {product.countInStock === 0 && (
                        <div className="product-status">Hết hàng</div>
                      )}
                      {product.discount > 0 && (
                        <div className="product-discount">-{product.discount}%</div>
                      )}
                      <div className="product-image">
                        <img src={product.images[0]} alt={product.name} className="image-primary" />
                        {product.images.length > 1 && (
                          <img src={product.images[1]} alt={product.name} className="image-secondary" />
                        )}
                        <Link to={`/products/${product.id || product._id}`} className="quick-view">
                          Xem nhanh
                        </Link>
                      </div>
                      <div className="product-info">
                        <div className="product-brand">{product.brandName}</div>
                        <Link to={`/products/${product.id || product._id}`} className="product-name">
                          {product.name}
                        </Link>
                        <div className="product-rating">
                          {renderStars(product.averageRating || product.rating)}
                          <span className="rating-text">({product.averageRating || product.rating})</span>
                        </div>
                        <div className="product-price-container">
                          {product.discount > 0 ? (
                            <>
                              <div className="product-price discounted">
                                {formatPrice(getDiscountedPrice(product.price, product.discount))}đ
                              </div>
                              <div className="product-price original">
                                {formatPrice(product.price)}đ
                              </div>
                            </>
                          ) : (
                            <div className="product-price">
                              {formatPrice(product.price)}đ
                            </div>
                          )}
                        </div>
                        <div className="product-sold">Đã bán: {product.sold || product.selled}</div>
                        <button 
                          className="add-to-cart" 
                          disabled={product.countInStock === 0}
                          onClick={() => handleAddToCartClick(product)}
                        >
                          {product.countInStock === 0 ? 'Hết hàng' : 'Thêm vào giỏ'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {totalPages > 1 && (
              <div className="pagination-container">
                <ul className="pagination">
                  <li className={`page-item prev ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button className="page-link" onClick={handlePrevPage} disabled={currentPage === 1}>
                      Trước
                    </button>
                  </li>
                  
                  {getPageNumbers().map((pageNumber) => (
                    <li key={pageNumber} className={`page-item ${currentPage === pageNumber ? 'active' : ''}`}>
                      <button className="page-link" onClick={() => handlePageChange(pageNumber)}>
                        {pageNumber}
                      </button>
                    </li>
                  ))}
                  
                  <li className={`page-item next ${currentPage === totalPages ? 'disabled' : ''}`}>
                    <button className="page-link" onClick={handleNextPage} disabled={currentPage === totalPages}>
                      Sau
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </Container>
      {showProductModal && (
        <ProductModal
          show={showProductModal}
          onHide={() => setShowProductModal(false)}
          product={selectedProduct}
          onAddToCart={handleAddToCartFromModal}
        />
      )}
      {/* Cart Notifications */}
      <NotificationComponent />
    </div>
  );
};

export default Products; 