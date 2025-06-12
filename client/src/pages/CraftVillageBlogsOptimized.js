import React, { useState } from 'react';
import { Container, Row, Col, Spinner, Alert, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useBlogs, useLatestBlogs, useCategories } from '../hooks/useBlog';
import './CraftVillageBlogs.scss';

const CraftVillageBlogsOptimized = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const pageSize = 6;

  // Use custom hooks for data fetching
  const { 
    blogs, 
    totalPages, 
    totalBlogs, 
    loading: blogsLoading, 
    error: blogsError,
    refetch: refetchBlogs
  } = useBlogs(currentPage, pageSize, selectedCategory);

  const { latestBlogs, loading: latestLoading } = useLatestBlogs(4);
  const { categories, loading: categoriesLoading } = useCategories();

  // Format date to Vietnamese format
  const formatDateShort = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${day} Tháng ${month.toString().padStart(2, '0')}, ${year}`;
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);
  };

  const handleRetry = () => {
    refetchBlogs();
  };

  // Loading skeleton component
  const BlogSkeleton = () => (
    <Col lg={4} md={6} sm={12} className="mb-4">
      <div className="blog-card">
        <div className="blog-image">
          <div className="skeleton-image"></div>
        </div>
        <div className="blog-content">
          <div className="skeleton-title"></div>
          <div className="skeleton-excerpt"></div>
          <div className="skeleton-meta"></div>
        </div>
      </div>
    </Col>
  );

  if (blogsLoading && currentPage === 1) {
    return (
      <div className="craft-village-blogs-page">
        <Container>
          <div className="breadcrumb">
            <Link to="/">Trang chủ</Link>
            <span className="separator">/</span>
            <span>Làng nghề</span>
          </div>
          
          <div className="page-header">
            <h1>Làng nghề</h1>
          </div>

          <div className="main-content">
            <div className="content-area">
              <Row className="blog-grid">
                {[...Array(6)].map((_, index) => (
                  <BlogSkeleton key={index} />
                ))}
              </Row>
            </div>
            <div className="blog-sidebar">
              <div className="sidebar-loading">
                <Spinner animation="border" size="sm" />
                <span className="ms-2">Đang tải...</span>
              </div>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  if (blogsError) {
    return (
      <Container>
        <Alert variant="danger" className="mt-4">
          <Alert.Heading>Có lỗi xảy ra!</Alert.Heading>
          <p>{blogsError}</p>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-danger" onClick={handleRetry}>
              Thử lại
            </button>
            <Link to="/" className="btn btn-secondary">
              Về trang chủ
            </Link>
          </div>
        </Alert>
      </Container>
    );
  }

  return (
    <div className="craft-village-blogs-page">
      <Container>
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <Link to="/">Trang chủ</Link>
          <span className="separator">/</span>
          <span>Làng nghề</span>
        </div>

        {/* Page Header */}
        <div className="page-header">
          <h1>Làng nghề</h1>
          {totalBlogs > 0 && (
            <p className="page-subtitle">
              Tìm thấy <Badge bg="primary">{totalBlogs}</Badge> bài viết về làng nghề
            </p>
          )}
        </div>

        {/* Category Filter */}
        {!categoriesLoading && categories && categories.length > 0 && (
          <div className="category-filter mb-4">
            <div className="filter-label">Lọc theo danh mục:</div>
            <div className="filter-buttons">
              <button 
                className={`filter-btn ${selectedCategory === 'all' ? 'active' : ''}`}
                onClick={() => handleCategoryChange('all')}
              >
                Tất cả làng nghề
              </button>
              {categories
                .filter(cat => cat && cat.id && cat.name && 
                  (cat.id.includes('lang') || cat.name.toLowerCase().includes('làng')))
                .map(category => (
                <button 
                  key={category.id}
                  className={`filter-btn ${selectedCategory === category.id ? 'active' : ''}`}
                  onClick={() => handleCategoryChange(category.id)}
                >
                  {category.name} {category.count > 0 && `(${category.count})`}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="main-content">
          {/* Main Content Area */}
          <div className="content-area">
            {!blogs || blogs.length === 0 ? (
              <div className="no-blogs-message">
                <Alert variant="info">
                  <div className="text-center">
                    <h4>Chưa có bài viết nào</h4>
                    <p>Hiện tại chưa có bài viết nào về làng nghề trong danh mục này.</p>
                    <button 
                      className="btn btn-primary"
                      onClick={() => handleCategoryChange('all')}
                    >
                      Xem tất cả làng nghề
                    </button>
                  </div>
                </Alert>
              </div>
            ) : (
              <>
                {/* Blog Grid */}
                <Row className="blog-grid">
                  {blogs && blogs.map(blog => (
                    <Col key={blog._id || blog.id} lg={4} md={6} sm={12} className="mb-4">
                      <div className="blog-card">
                        <div className="blog-image">
                          <img 
                            src={blog.featuredImage || 'https://via.placeholder.com/300x200?text=Làng+nghề'} 
                            alt={blog.title}
                            loading="lazy"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/300x200?text=Làng+nghề';
                            }}
                          />
                          {blog.category && (
                            <div className="blog-category-badge">
                              {blog.category}
                            </div>
                          )}
                        </div>
                        
                        <div className="blog-content">
                          <h3 className="blog-title">
                            <Link to={`/lang-nghe/${blog.slug}`}>
                              {blog.title}
                            </Link>
                          </h3>
                          
                          <p className="blog-excerpt">
                            {blog.excerpt}
                          </p>
                          
                          <div className="blog-meta">
                            <span className="blog-author">
                              <i className="fas fa-user"></i>
                              {blog.author?.name || blog.author || 'Trại Cá'}
                            </span>
                            <span className="blog-date">
                              <i className="fas fa-calendar"></i>
                              {formatDateShort(blog.publishedAt)}
                            </span>
                            <span className="blog-comments">
                              <i className="fas fa-comments"></i>
                              {blog.commentCount || 0}
                            </span>
                          </div>

                          <div className="blog-tags">
                            {blog.tags && blog.tags.slice(0, 3).map((tag, index) => (
                              <span key={index} className="tag">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </Col>
                  ))}
                </Row>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="blog-pagination">
                    <div className="pagination-info">
                      Trang {currentPage} / {totalPages} 
                      <span className="total-info">({totalBlogs} bài viết)</span>
                    </div>
                    <div className="pagination justify-content-center">
                      {/* First page */}
                      {currentPage > 2 && (
                        <div className="page-item">
                          <button
                            className="page-link"
                            onClick={() => handlePageChange(1)}
                          >
                            1
                          </button>
                        </div>
                      )}

                      {/* Ellipsis */}
                      {currentPage > 3 && <span className="page-ellipsis">...</span>}

                      {/* Previous button */}
                      {currentPage > 1 && (
                        <div className="page-item">
                          <button
                            className="page-link"
                            onClick={() => handlePageChange(currentPage - 1)}
                          >
                            « Trước
                          </button>
                        </div>
                      )}

                      {/* Current and adjacent pages */}
                      {[...Array(totalPages)].map((_, index) => {
                        const pageNum = index + 1;
                        if (pageNum >= currentPage - 1 && pageNum <= currentPage + 1) {
                          return (
                            <div
                              key={pageNum}
                              className={`page-item ${pageNum === currentPage ? 'active' : ''}`}
                            >
                              <button
                                className="page-link"
                                onClick={() => handlePageChange(pageNum)}
                              >
                                {pageNum}
                              </button>
                            </div>
                          );
                        }
                        return null;
                      })}

                      {/* Next button */}
                      {currentPage < totalPages && (
                        <div className="page-item">
                          <button
                            className="page-link"
                            onClick={() => handlePageChange(currentPage + 1)}
                          >
                            Sau »
                          </button>
                        </div>
                      )}

                      {/* Ellipsis */}
                      {currentPage < totalPages - 2 && <span className="page-ellipsis">...</span>}

                      {/* Last page */}
                      {currentPage < totalPages - 1 && (
                        <div className="page-item">
                          <button
                            className="page-link"
                            onClick={() => handlePageChange(totalPages)}
                          >
                            {totalPages}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Loading indicator for pagination */}
                {blogsLoading && currentPage > 1 && (
                  <div className="text-center my-4">
                    <Spinner animation="border" size="sm" />
                    <span className="ms-2">Đang tải trang {currentPage}...</span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="blog-sidebar">
            {/* Latest Posts */}
            {!latestLoading && latestBlogs.length > 0 && (
              <div className="sidebar-section">
                <h4>
                  <i className="fas fa-fire"></i>
                  Bài viết mới nhất
                </h4>
                <div className="latest-blogs">
                  {latestBlogs.map(blog => (
                    <div key={blog._id || blog.id} className="latest-blog-item">
                      <Link to={`/bai-viet/${blog.slug}`} className="latest-blog-link">
                        {blog.title}
                      </Link>
                      <span className="latest-blog-meta">
                        <i className="fas fa-user"></i>
                        {blog.author?.name || blog.author || 'Đội ngũ'} - {formatDateShort(blog.publishedAt)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* All Categories */}
            {!categoriesLoading && categories.length > 0 && (
              <div className="sidebar-section">
                <h4>
                  <i className="fas fa-list"></i>
                  Tất cả danh mục
                </h4>
                <div className="category-list">
                  <div className="category-item">
                    <button 
                      className={`category-link ${selectedCategory === 'all' ? 'active' : ''}`}
                      onClick={() => handleCategoryChange('all')}
                    >
                      Tất cả làng nghề
                      {totalBlogs > 0 && <Badge bg="secondary" className="ms-2">{totalBlogs}</Badge>}
                    </button>
                  </div>
                  {categories.map(category => (
                    <div key={category.id} className="category-item">
                      <button 
                        className={`category-link ${selectedCategory === category.id ? 'active' : ''}`}
                        onClick={() => handleCategoryChange(category.id)}
                      >
                        {category.name}
                        {category.count > 0 && <Badge bg="secondary" className="ms-2">{category.count}</Badge>}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Loading states for sidebar */}
            {(latestLoading || categoriesLoading) && (
              <div className="sidebar-loading">
                <Spinner animation="border" size="sm" />
                <span className="ms-2">Đang tải...</span>
              </div>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
};

export default CraftVillageBlogsOptimized; 