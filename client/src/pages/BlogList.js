import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Dropdown, Form, Pagination, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { blogService } from '../services/blogService';
import './BlogList.scss';

const BlogList = () => {
  const [blogs, setBlogs] = useState([]);
  const [latestBlogs, setLatestBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter and pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('publishedAt');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const pageSize = 12;

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        const [blogsResponse, latestResponse, categoriesResponse] = await Promise.all([
          blogService.getBlogs({ 
            page: currentPage, 
            limit: pageSize,
            category: selectedCategory,
            search: searchQuery,
            sortBy: sortBy
          }),
          blogService.getLatestBlogs(5),
          blogService.getBlogCategories()
        ]);

        setBlogs(blogsResponse.data.blogs);
        setTotalPages(blogsResponse.data.pages);
        setLatestBlogs(latestResponse.data);
        setCategories(categoriesResponse.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [currentPage, selectedCategory, searchQuery, sortBy]);

  // Load blogs when filters change
  const loadBlogs = async () => {
    try {
      setLoading(true);
      const response = await blogService.getBlogs({
        page: currentPage,
        limit: pageSize,
        category: selectedCategory,
        search: searchQuery,
        sortBy: sortBy
      });

      setBlogs(response.data.blogs);
      setTotalPages(response.data.pages);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    setSearchQuery(searchInput);
    setCurrentPage(1);
  };

  // Handle category change
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  // Handle sort change
  const handleSortChange = (sort) => {
    setSortBy(sort);
    setCurrentPage(1);
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };

  // Get category display name
  const getCategoryDisplayName = (categoryId) => {
    const categoryMap = {
      'làng gốm': 'Làng gốm',
      'làng dệt': 'Làng dệt',
      'làng dao': 'Làng dao',
      'làng vàng bạc': 'Làng vàng bạc',
      'làng thêu': 'Làng thêu',
      'khác': 'Khác',
      'all': 'Tất cả'
    };
    return categoryMap[categoryId] || categoryId;
  };

  if (loading && blogs.length === 0) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <div className="blog-list-page">
      <Container>
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <Link to="/">Trang chủ</Link>
          <span className="separator">/</span>
          <span>Làng nghề</span>
        </div>

        {/* Page Header */}
        <div className="page-header">
          <Row>
            <Col lg={8}>
              <h1>LÀNG NGHỀ</h1>
              <p className="subtitle">Khám phá vẻ đẹp và giá trị văn hóa của các làng nghề truyền thống Việt Nam</p>
            </Col>
            <Col lg={4}>
              <div className="blog-count">
                <span className="count-text">
                  {blogs.length > 0 && `Hiển thị ${blogs.length} trong số nhiều làng nghề`}
                </span>
              </div>
            </Col>
          </Row>
        </div>

        <Row>
          {/* Main Content */}
          <Col lg={8} md={7} className="blog-main">
            {/* Search and Filter Bar */}
            <div className="blog-filters">
              <Row className="align-items-center">
                <Col md={6}>
                  <Form onSubmit={handleSearch} className="search-form">
                    <div className="search-input-group">
                      <Form.Control
                        type="text"
                        placeholder="Tìm kiếm làng nghề..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                      />
                      <Button type="submit" variant="outline-primary">
                        <i className="fas fa-search"></i>
                      </Button>
                    </div>
                  </Form>
                </Col>
                
                <Col md={3}>
                  <Dropdown>
                    <Dropdown.Toggle variant="outline-secondary" size="sm">
                      {getCategoryDisplayName(selectedCategory)}
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item onClick={() => handleCategoryChange('all')}>
                        Tất cả
                      </Dropdown.Item>
                      {categories.map(category => (
                        <Dropdown.Item 
                          key={category._id} 
                          onClick={() => handleCategoryChange(category._id)}
                        >
                          {getCategoryDisplayName(category._id)} ({category.count})
                        </Dropdown.Item>
                      ))}
                    </Dropdown.Menu>
                  </Dropdown>
                </Col>

                <Col md={3}>
                  <Dropdown>
                    <Dropdown.Toggle variant="outline-secondary" size="sm">
                      Sắp xếp
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item onClick={() => handleSortChange('publishedAt')}>
                        Mới nhất
                      </Dropdown.Item>
                      <Dropdown.Item onClick={() => handleSortChange('views')}>
                        Xem nhiều nhất
                      </Dropdown.Item>
                      <Dropdown.Item onClick={() => handleSortChange('likes')}>
                        Yêu thích nhất
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </Col>
              </Row>
            </div>

            {/* Error Alert */}
            {error && (
              <Alert variant="danger" className="mb-4">
                {error}
              </Alert>
            )}

            {/* Blog Grid */}
            {loading ? (
              <div className="d-flex justify-content-center py-5">
                <Spinner animation="border" variant="primary" />
              </div>
            ) : blogs.length === 0 ? (
              <div className="no-blogs">
                <p>Không tìm thấy bài viết nào.</p>
              </div>
            ) : (
              <>
                <Row className="blog-grid">
                  {blogs.map(blog => (
                    <Col key={blog._id} lg={6} md={6} sm={12} className="mb-4">
                      <Card className="blog-card h-100">
                        <div className="blog-image">
                          <img 
                            src={blog.featuredImage} 
                            alt={blog.title}
                            className="card-img-top"
                          />
                          <div className="blog-category">
                            {getCategoryDisplayName(blog.category)}
                          </div>
                        </div>
                        
                        <Card.Body className="d-flex flex-column">
                          <div className="blog-meta">
                            <span className="blog-author">bởi: {blog.author?.name || 'VietTrad'}</span>
                            <span className="blog-date">{formatDate(blog.publishedAt)}</span>
                          </div>
                          
                          <Card.Title className="blog-title">
                            <Link to={`/di-san/${blog.slug}`}>
                              {blog.title}
                            </Link>
                          </Card.Title>
                          
                          <Card.Text className="blog-excerpt">
                            {blog.excerpt}
                          </Card.Text>
                          
                          <div className="blog-stats mt-auto">
                            <span className="stat-item">
                              <i className="fas fa-eye"></i> {blog.views}
                            </span>
                            <span className="stat-item">
                              <i className="fas fa-comment"></i> {blog.commentCount || 0}
                            </span>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="blog-pagination">
                    <Pagination className="justify-content-center">
                      <Pagination.Prev 
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(currentPage - 1)}
                      />
                      
                      {[...Array(totalPages)].map((_, index) => (
                        <Pagination.Item
                          key={index + 1}
                          active={index + 1 === currentPage}
                          onClick={() => setCurrentPage(index + 1)}
                        >
                          {index + 1}
                        </Pagination.Item>
                      ))}
                      
                      <Pagination.Next 
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(currentPage + 1)}
                      />
                    </Pagination>
                  </div>
                )}
              </>
            )}
          </Col>

          {/* Sidebar */}
          <Col lg={4} md={5} className="blog-sidebar">
            {/* Latest Blogs */}
            <div className="sidebar-section">
              <h4>Bài viết mới nhất</h4>
              {latestBlogs.length > 0 ? (
                <div className="latest-blogs">
                  {latestBlogs.map(blog => (
                    <div key={blog._id} className="latest-blog-item">
                      <div className="latest-blog-image">
                        <img src={blog.featuredImage} alt={blog.title} />
                      </div>
                      <div className="latest-blog-content">
                        <Link to={`/di-san/${blog.slug}`} className="latest-blog-title">
                          {blog.title}
                        </Link>
                        <span className="latest-blog-date">
                          {formatDate(blog.publishedAt)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>Chưa có bài viết nào.</p>
              )}
            </div>

            {/* Categories */}
            <div className="sidebar-section">
              <h4>Danh mục</h4>
              <div className="category-list">
                <div 
                  className={`category-item ${selectedCategory === 'all' ? 'active' : ''}`}
                  onClick={() => handleCategoryChange('all')}
                >
                  <span>Tất cả</span>
                </div>
                {categories.map(category => (
                  <div 
                    key={category._id}
                    className={`category-item ${selectedCategory === category._id ? 'active' : ''}`}
                    onClick={() => handleCategoryChange(category._id)}
                  >
                    <span>{getCategoryDisplayName(category._id)}</span>
                    <span className="category-count">({category.count})</span>
                  </div>
                ))}
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default BlogList; 