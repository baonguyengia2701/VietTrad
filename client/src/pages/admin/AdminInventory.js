import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Modal, Form, Table, Alert, Badge } from 'react-bootstrap';
import inventoryService from '../../services/inventoryService';
import { productService } from '../../services/productService';
import './AdminInventory.scss';

const AdminInventory = () => {
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Modal states
  const [showStockModal, setShowStockModal] = useState(false);
  const [stockModalType, setStockModalType] = useState('in');
  
  // Form states  
  const [stockForm, setStockForm] = useState({
    productId: '',
    quantity: '',
    newQuantity: '',
    reason: '',
    note: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(''); // Clear previous errors
      
      console.log('Loading inventory data...'); // Debug log
      
      // Check if user is logged in
      const userInfo = localStorage.getItem('userInfo');
      if (!userInfo) {
        setError('Bạn cần đăng nhập để truy cập trang này');
        return;
      }
      
      try {
        const parsedUserInfo = JSON.parse(userInfo);
        console.log('🔍 Parsed UserInfo:', parsedUserInfo);
        console.log('🔍 User object:', parsedUserInfo.user);
        console.log('🔍 User role:', parsedUserInfo.user?.role);
        
        if (!parsedUserInfo.accessToken) {
          setError('Token không hợp lệ. Vui lòng đăng nhập lại.');
          return;
        }
        
        // Check if user is admin - sử dụng isAdmin từ root level
        const isAdmin = parsedUserInfo.isAdmin;
        console.log('🔍 isAdmin value:', isAdmin);
        console.log('🔍 Full userInfo structure:', Object.keys(parsedUserInfo));
        
        if (!isAdmin) {
          console.error('❌ User is not admin. isAdmin:', isAdmin);
          setError('Bạn không có quyền admin để truy cập trang này.');
          return;
        }
        
        console.log('✅ Admin access granted');
      } catch (error) {
        console.error('Error parsing userInfo:', error);
        setError('Thông tin đăng nhập không hợp lệ. Vui lòng đăng nhập lại.');
        return;
      }
      
      // Load stats
      console.log('Loading stats...'); // Debug log
      const statsData = await inventoryService.getStats();
      console.log('Stats data received:', statsData); // Debug log
      setStats(statsData.data);
      
      // Load products for selection
      console.log('Loading products...'); // Debug log
      const productsData = await productService.getAllProducts({ limit: 1000 });
      console.log('Products data received:', productsData); // Debug log
      setProducts(productsData.products || []);
      
    } catch (error) {
      console.error('Error loading data:', error);
      
      // More specific error handling
      if (error.response?.status === 401) {
        setError('Bạn không có quyền truy cập. Vui lòng đăng nhập lại.');
      } else if (error.response?.status === 403) {
        setError('Bạn không có quyền admin để truy cập trang này.');
      } else if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else if (error.message) {
        setError(`Lỗi: ${error.message}`);
      } else {
        setError('Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStockOperation = async (e) => {
    e.preventDefault();
    
    try {
      let response;
      
      switch (stockModalType) {
        case 'in':
          response = await inventoryService.stockIn({
            productId: stockForm.productId,
            quantity: parseInt(stockForm.quantity),
            reason: stockForm.reason,
            note: stockForm.note
          });
          break;
          
        case 'out':
          response = await inventoryService.stockOut({
            productId: stockForm.productId,
            quantity: parseInt(stockForm.quantity),
            reason: stockForm.reason,
            note: stockForm.note
          });
          break;
          
        case 'adjust':
          response = await inventoryService.adjustStock({
            productId: stockForm.productId,
            newQuantity: parseInt(stockForm.newQuantity),
            reason: stockForm.reason,
            note: stockForm.note
          });
          break;
          
        default:
          break;
      }
      
      setSuccess(response.message);
      setShowStockModal(false);
      resetStockForm();
      loadData();
      
      setTimeout(() => setSuccess(''), 3000);
      
    } catch (error) {
      console.error('Error in stock operation:', error);
      setError(error.message || 'Có lỗi xảy ra');
      setTimeout(() => setError(''), 3000);
    }
  };

  const openStockModal = (type, product = null) => {
    setStockModalType(type);
    if (product) {
      setStockForm(prev => ({ ...prev, productId: product._id }));
    }
    setShowStockModal(true);
  };

  const resetStockForm = () => {
    setStockForm({
      productId: '',
      quantity: '',
      newQuantity: '',
      reason: '',
      note: ''
    });
  };

  const handleCloseModal = useCallback(() => {
    console.log('🔄 Closing modal...'); // Debug log
    setShowStockModal(false);
    setTimeout(() => {
      resetStockForm();
      setError('');
      setSuccess('');
    }, 100);
    console.log('✅ Modal closed'); // Debug log
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(amount);
  };

  const getStockStatusColor = (stock) => {
    if (stock === 0) return 'danger';
    if (stock <= 5) return 'warning';
    return 'success';
  };

  if (loading) {
    return (
      <Container className="admin-inventory-loading">
        <div className="loading-content">
          <div className="spinner-border" role="status">
            <span className="sr-only">Loading...</span>
          </div>
          <p>Đang tải dữ liệu...</p>
        </div>
      </Container>
    );
  }

  return (
    <div className="admin-inventory admin-page">
      {/* Enhanced Header Section */}
      <div className="inventory-header">
        <Container fluid>
          <Row>
        <Col>
          <h2>Quản lý kho hàng</h2>
        </Col>
      </Row>
        </Container>
      </div>

      {/* Main Content */}
      <Container fluid className="inventory-content">
      {error && (
        <Alert variant="danger" className="d-flex justify-content-between align-items-center">
          <span>{error}</span>
          <div>
            <Button 
              variant="outline-info" 
              size="sm"
              className="me-2"
              onClick={() => {
                const userInfo = localStorage.getItem('userInfo');
                console.log('🔍 Debug userInfo:', userInfo);
                if (userInfo) {
                  try {
                    const parsed = JSON.parse(userInfo);
                    console.log('🔍 Parsed userInfo:', parsed);
                    alert(`UserInfo Debug:\n- isAdmin: ${parsed.isAdmin}\n- Email: ${parsed.email}\n- Name: ${parsed.name}\n- Has AccessToken: ${!!parsed.accessToken}`);
                  } catch (e) {
                    alert('Error parsing userInfo: ' + e.message);
                  }
                } else {
                  alert('No userInfo found in localStorage');
                }
              }}
            >
              Debug
            </Button>
            <Button 
              variant="outline-danger" 
              size="sm"
              onClick={() => {
                setError('');
                loadData();
              }}
            >
              Thử lại
            </Button>
          </div>
        </Alert>
      )}
      {success && <Alert variant="success">{success}</Alert>}

        {/* Statistics Cards Section */}
      {stats && (
          <div className="stats-section">
        <Row className="mb-4">
          <Col md={3}>
            <Card className="stat-card total-products">
              <Card.Body>
                    <div className="stat-icon"></div>
                <h3>{stats.stockStats.totalProducts}</h3>
                <p>Tổng sản phẩm</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="stat-card total-stock">
              <Card.Body>
                    <div className="stat-icon"></div>
                <h3>{formatCurrency(stats.stockStats.totalStock)}</h3>
                <p>Tổng tồn kho</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="stat-card low-stock">
              <Card.Body>
                    <div className="stat-icon"></div>
                <h3>{stats.stockStats.lowStock}</h3>
                <p>Sắp hết hàng</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="stat-card out-of-stock">
              <Card.Body>
                    <div className="stat-icon"></div>
                <h3>{stats.stockStats.outOfStock}</h3>
                <p>Hết hàng</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
          </div>
      )}

        {/* Action Buttons Section */}
        <div className="actions-section">
          <Row className="mb-4">
        <Col>
              <div className="actions-container">
                <div className="actions-title">
                  <h4>Thao tác kho hàng</h4>
                  <p>Chọn thao tác cần thực hiện với kho hàng</p>
                </div>
                <div className="actions-buttons">
          <Button 
            variant="success" 
            onClick={() => openStockModal('in')}
          >
                    <i className="fas fa-arrow-down me-2"></i>
            Nhập kho
          </Button>
          <Button 
            variant="danger" 
            onClick={() => openStockModal('out')}
          >
                    <i className="fas fa-arrow-up me-2"></i>
            Xuất kho
          </Button>
          <Button 
            variant="warning"
            onClick={() => openStockModal('adjust')}
          >
                    <i className="fas fa-edit me-2"></i>
            Điều chỉnh kho
          </Button>
                </div>
              </div>
        </Col>
      </Row>
        </div>

        {/* Products Table Section */}
        <div className="products-section">
          <Row>
            <Col>
              <div className="table-container">
                <div className="table-header">
          <h5>Danh sách sản phẩm</h5>
                </div>
                <div className="table-body">
          <Table responsive hover>
            <thead>
              <tr>
                <th>Sản phẩm</th>
                <th>Danh mục</th>
                <th>Giá</th>
                <th>Tồn kho</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product._id}>
                  <td>
                    <div className="d-flex align-items-center">
                      <img 
                        src={product.images?.[0] || '/placeholder.jpg'}
                        alt={product.name}
                                className="product-image me-3"
                        style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                      />
                      <div>
                        <strong>{product.name}</strong>
                        <br />
                        <small className="text-muted">ID: {product._id}</small>
                      </div>
                    </div>
                  </td>
                  <td>{product.categoryName || 'N/A'}</td>
                  <td>{formatCurrency(product.price)}đ</td>
                  <td>
                    <Badge bg={getStockStatusColor(product.countInStock)}>
                      {product.countInStock}
                    </Badge>
                  </td>
                  <td>
                    <Badge bg={getStockStatusColor(product.countInStock)}>
                      {product.countInStock === 0 ? 'Hết hàng' : 
                       product.countInStock <= 5 ? 'Sắp hết' : 'Còn hàng'}
                    </Badge>
                  </td>
                  <td>
                    <Button 
                      size="sm" 
                      variant="success" 
                      className="me-1"
                      onClick={() => openStockModal('in', product)}
                    >
                              <i className="fas fa-plus me-1"></i>
                      Nhập
                    </Button>
                    <Button 
                      size="sm" 
                      variant="danger" 
                      className="me-1"
                      onClick={() => openStockModal('out', product)}
                    >
                              <i className="fas fa-minus me-1"></i>
                      Xuất
                    </Button>
                    <Button 
                      size="sm" 
                      variant="warning"
                      onClick={() => openStockModal('adjust', product)}
                    >
                              <i className="fas fa-edit me-1"></i>
                      Điều chỉnh
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </Container>

      {/* Stock Operation Modal */}
      <Modal 
        show={showStockModal} 
        onHide={handleCloseModal}
        size="xl"
        centered
        backdrop={true}
        keyboard={true}
        className="stock-operation-modal"
        style={{ zIndex: 1055, display: showStockModal ? 'block' : 'none' }}
        dialogClassName="custom-modal-dialog"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {stockModalType === 'in' && (
              <>
                <i className="fas fa-box-open me-3"></i>
                Nhập kho hàng
              </>
            )}
            {stockModalType === 'out' && (
              <>
                <i className="fas fa-shipping-fast me-3"></i>
                Xuất kho hàng
              </>
            )}
            {stockModalType === 'adjust' && (
              <>
                <i className="fas fa-sliders-h me-3"></i>
                Điều chỉnh kho hàng
              </>
            )}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleStockOperation}>
          <Modal.Body className="enhanced-modal-body">
            {/* Product Selection Section */}
            <div className="modal-section">
              <div className="section-header">
                <h6><i className="fas fa-search me-2"></i>Chọn sản phẩm</h6>
              </div>
              <Row>
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>Sản phẩm</Form.Label>
                    <Form.Select
                      value={stockForm.productId}
                      onChange={(e) => setStockForm(prev => ({ ...prev, productId: e.target.value }))}
                      required
                    >
                      <option value="">🔍 Chọn sản phẩm để thao tác</option>
                      {products.map(product => (
                        <option key={product._id} value={product._id}>
                          📦 {product.name} | Tồn kho: {product.countInStock} | Giá: {formatCurrency(product.price)}đ
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              {/* Product Preview */}
              {stockForm.productId && (() => {
                const selectedProduct = products.find(p => p._id === stockForm.productId);
                return selectedProduct ? (
                  <div className="product-preview">
                    <div className="preview-header">
                      <h6><i className="fas fa-eye me-2"></i>Thông tin sản phẩm</h6>
                    </div>
                    <div className="preview-content">
                      <Row>
                        <Col md={3}>
                          <div className="preview-image">
                            <img 
                              src={selectedProduct.images?.[0] || '/placeholder.jpg'}
                              alt={selectedProduct.name}
                              className="img-fluid rounded"
                            />
                          </div>
                        </Col>
                        <Col md={9}>
                          <div className="preview-details">
                            <h5 className="product-name">{selectedProduct.name}</h5>
                            <div className="product-info">
                              <Row>
                                <Col md={6}>
                                  <div className="info-item">
                                    <span className="label">Danh mục:</span>
                                    <span className="value">{selectedProduct.categoryName || 'N/A'}</span>
                                  </div>
                                  <div className="info-item">
                                    <span className="label">Giá bán:</span>
                                    <span className="value">{formatCurrency(selectedProduct.price)}đ</span>
                                  </div>
                                </Col>
                                <Col md={6}>
                                  <div className="info-item">
                                    <span className="label">Tồn kho hiện tại:</span>
                                    <span className={`value current-stock ${getStockStatusColor(selectedProduct.countInStock)}`}>
                                      {selectedProduct.countInStock} sản phẩm
                                    </span>
                                  </div>
                                  <div className="info-item">
                                    <span className="label">Trạng thái:</span>
                                    <span className={`value status-badge ${
                                      selectedProduct.countInStock === 0 ? 'text-danger' : 
                                      selectedProduct.countInStock <= 5 ? 'text-warning' : 'text-success'
                                    }`}>
                                      {selectedProduct.countInStock === 0 ? 'Hết hàng' : 
                                       selectedProduct.countInStock <= 5 ? 'Sắp hết' : 'Còn hàng'}
                                    </span>
                                  </div>
                                </Col>
                              </Row>
                            </div>
                          </div>
                        </Col>
                      </Row>
                    </div>
                  </div>
                ) : null;
              })()}
            </div>

            {/* Transaction Details Section */}
            <div className="modal-section">
              <div className="section-header">
                <h6><i className="fas fa-edit me-2"></i>Chi tiết giao dịch</h6>
              </div>
              <Row>
                {stockModalType !== 'adjust' ? (
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Số lượng</Form.Label>
                      <div className="input-group">
                        <Form.Control
                          type="number"
                          min="1"
                          value={stockForm.quantity}
                          onChange={(e) => setStockForm(prev => ({ ...prev, quantity: e.target.value }))}
                          required
                          placeholder="Nhập số lượng"
                        />
                        <span className="input-group-text">
                          {stockModalType === 'in' ? 'sản phẩm nhập' : 'sản phẩm xuất'}
                        </span>
                      </div>
                    </Form.Group>
                  </Col>
                ) : (
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Số lượng mới</Form.Label>
                      <div className="input-group">
                        <Form.Control
                          type="number"
                          min="0"
                          value={stockForm.newQuantity}
                          onChange={(e) => setStockForm(prev => ({ ...prev, newQuantity: e.target.value }))}
                          required
                          placeholder="Nhập số lượng mới"
                        />
                        <span className="input-group-text">sản phẩm</span>
                      </div>
                    </Form.Group>
                  </Col>
                )}

                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Lý do</Form.Label>
                    <Form.Select
                      value={stockForm.reason}
                      onChange={(e) => setStockForm(prev => ({ ...prev, reason: e.target.value }))}
                      required
                    >
                      <option value="">Chọn lý do thao tác</option>
                      {stockModalType === 'in' && (
                        <>
                          <option value="Nhập hàng mới">📦 Nhập hàng mới</option>
                          <option value="Trả lại từ khách hàng">↩️ Trả lại từ khách hàng</option>
                          <option value="Chuyển kho">🔄 Chuyển kho</option>
                          <option value="Nhập bổ sung">➕ Nhập bổ sung</option>
                        </>
                      )}
                      {stockModalType === 'out' && (
                        <>
                          <option value="Bán hàng">💰 Bán hàng</option>
                          <option value="Hư hỏng">❌ Hư hỏng</option>
                          <option value="Chuyển kho">🔄 Chuyển kho</option>
                          <option value="Khuyến mãi">🎁 Khuyến mãi</option>
                          <option value="Mẫu thử">🧪 Mẫu thử</option>
                        </>
                      )}
                      {stockModalType === 'adjust' && (
                        <>
                          <option value="Kiểm kê">📊 Kiểm kê</option>
                          <option value="Điều chỉnh lỗi">⚙️ Điều chỉnh lỗi</option>
                          <option value="Thất thoát">⚠️ Thất thoát</option>
                          <option value="Cập nhật hệ thống">🔄 Cập nhật hệ thống</option>
                        </>
                      )}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              {/* Calculation Preview */}
              {stockForm.productId && (stockForm.quantity || stockForm.newQuantity) && (() => {
                const selectedProduct = products.find(p => p._id === stockForm.productId);
                if (!selectedProduct) return null;
                
                let newStock = selectedProduct.countInStock;
                if (stockModalType === 'in') {
                  newStock += parseInt(stockForm.quantity || 0);
                } else if (stockModalType === 'out') {
                  newStock -= parseInt(stockForm.quantity || 0);
                } else if (stockModalType === 'adjust') {
                  newStock = parseInt(stockForm.newQuantity || 0);
                }

                return (
                  <div className="calculation-preview">
                    <h6><i className="fas fa-calculator me-2"></i>Dự tính kết quả</h6>
                    <div className="calculation-content">
                      <Row>
                        <Col md={4} className="text-center">
                          <div className="calc-item current">
                            <div className="calc-value">{selectedProduct.countInStock}</div>
                            <div className="calc-label">Tồn kho hiện tại</div>
                          </div>
                        </Col>
                        <Col md={4} className="text-center">
                          <div className="calc-item operation">
                            <div className="calc-icon">
                              {stockModalType === 'in' && <i className="fas fa-plus"></i>}
                              {stockModalType === 'out' && <i className="fas fa-minus"></i>}
                              {stockModalType === 'adjust' && <i className="fas fa-arrow-right"></i>}
                            </div>
                            <div className="calc-value">
                              {stockModalType === 'adjust' 
                                ? stockForm.newQuantity 
                                : stockForm.quantity}
                            </div>
                            <div className="calc-label">
                              {stockModalType === 'in' && 'Số lượng nhập'}
                              {stockModalType === 'out' && 'Số lượng xuất'}
                              {stockModalType === 'adjust' && 'Số lượng mới'}
                            </div>
                          </div>
                        </Col>
                        <Col md={4} className="text-center">
                          <div className={`calc-item result ${newStock < 0 ? 'error' : ''}`}>
                            <div className={`calc-value ${newStock < 0 ? 'error' : ''}`}>
                              {newStock}
                              {newStock < 0 && <i className="fas fa-exclamation-triangle ms-1"></i>}
                            </div>
                            <div className="calc-label">Tồn kho sau thao tác</div>
                            {newStock < 0 && (
                              <div className="error-message">
                                <small className="text-danger">⚠️ Không đủ hàng để xuất!</small>
                              </div>
                            )}
                          </div>
                        </Col>
                      </Row>
                    </div>
                  </div>
                );
              })()}

              <Row>
                <Col md={12}>
                  <Form.Group className="mb-0">
                    <Form.Label className="optional">Ghi chú</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={stockForm.note}
                      onChange={(e) => setStockForm(prev => ({ ...prev, note: e.target.value }))}
                      placeholder="Thêm ghi chú chi tiết về giao dịch này (không bắt buộc)..."
                      style={{ resize: 'vertical' }}
                    />
                    <Form.Text className="text-muted">
                      Ghi chú sẽ giúp theo dõi lịch sử giao dịch tốt hơn
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>
            </div>
          </Modal.Body>
          <Modal.Footer className="modal-footer-enhanced">
            <div className="footer-content">
              <div className="footer-info">
                <small className="text-muted">
                  <i className="fas fa-info-circle me-1"></i>
                  Thao tác này sẽ được ghi lại trong lịch sử kho hàng
                </small>
              </div>
              <div className="footer-actions">
                <Button 
                  variant="secondary" 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleCloseModal();
                  }}
                  className="me-3"
                  type="button"
                >
                  <i className="fas fa-times me-2"></i>
                  Hủy bỏ
                </Button>
                <Button 
                  type="submit" 
                  variant="primary"
                  disabled={(() => {
                    const selectedProduct = products.find(p => p._id === stockForm.productId);
                    if (!selectedProduct) return true;
                    
                    if (stockModalType === 'out') {
                      const newStock = selectedProduct.countInStock - parseInt(stockForm.quantity || 0);
                      return newStock < 0;
                    }
                    return false;
                  })()}
                >
                  {stockModalType === 'in' && (
                    <>
                      <i className="fas fa-arrow-down me-2"></i>
                      Xác nhận nhập kho
                    </>
                  )}
                  {stockModalType === 'out' && (
                    <>
                      <i className="fas fa-arrow-up me-2"></i>
                      Xác nhận xuất kho
                    </>
                  )}
                  {stockModalType === 'adjust' && (
                    <>
                      <i className="fas fa-edit me-2"></i>
                      Xác nhận điều chỉnh
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminInventory;
