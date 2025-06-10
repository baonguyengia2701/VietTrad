import React from 'react';
import { Container, Spinner, Alert } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import { useBlogDetail, useLatestBlogs, useCategories } from '../hooks/useBlog';
import './BlogDetail.scss';

const BlogDetailOptimized = () => {
  const { slug } = useParams();
  
  // Use custom hooks for data fetching
  const { blog, relatedBlogs, loading: blogLoading, error: blogError } = useBlogDetail(slug);
  const { latestBlogs } = useLatestBlogs(4);
  const { categories } = useCategories();

  // Format date to Vietnamese format
  const formatDateShort = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${day.toString().padStart(2, '0')}.${month.toString().padStart(2, '0')}.${year}`;
  };

  if (blogLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (blogError || !blog) {
    return (
      <Container>
        <Alert variant="danger" className="mt-4">
          {blogError || 'Không tìm thấy bài viết'}
        </Alert>
      </Container>
    );
  }

  return (
    <div className="blog-detail-page">
      <Container>
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <Link to="/">Trang chủ</Link>
          <span className="separator">/</span>
          <Link to="/lang-nghe">Làng nghề</Link>
          <span className="separator">/</span>
          <span>{blog.title}</span>
        </div>

        <div className="main-content">
          {/* Article Content */}
          <div className="article-content">
            <article className="blog-article">
              <header className="article-header">
                <h1 className="article-title">{blog.title}</h1>
                <div className="article-meta">
                  <span className="author">bởi: <strong>{blog.author?.name || blog.author || 'Tác giả'}</strong></span>
                  <span className="date">{formatDateShort(blog.publishedAt)}</span>
                  <span className="comments">{blog.commentCount || 0} Bình luận</span>
                  <span className="views">{blog.views || 0} Lượt xem</span>
                </div>
                {blog.featuredImage && (
                  <div className="article-featured-image">
                    <img 
                      src={blog.featuredImage} 
                      alt={blog.title}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </header>

              <div className="article-body">
                <div 
                  className="content" 
                  dangerouslySetInnerHTML={{ __html: blog.content }}
                />
              </div>

              {blog.tags && blog.tags.length > 0 && (
                <div className="article-tags">
                  <h4>Tags:</h4>
                  <div className="tags-list">
                    {blog.tags.map((tag, index) => (
                      <span key={index} className="tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </article>

            {/* Related Posts */}
            {relatedBlogs && relatedBlogs.length > 0 && (
              <div className="related-posts">
                <h3>Bài viết liên quan</h3>
                <div className="related-posts-grid">
                  {relatedBlogs.map(relatedBlog => (
                    <div key={relatedBlog._id || relatedBlog.id} className="related-post-card">
                      {relatedBlog.featuredImage && (
                        <div className="related-post-image">
                          <img 
                            src={relatedBlog.featuredImage} 
                            alt={relatedBlog.title}
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                      <div className="related-post-content">
                        <h4>
                          <Link to={`/lang-nghe/${relatedBlog.slug}`}>
                            {relatedBlog.title}
                          </Link>
                        </h4>
                        {relatedBlog.excerpt && <p className="excerpt">{relatedBlog.excerpt}</p>}
                        <span className="date">{formatDateShort(relatedBlog.publishedAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="blog-sidebar">
            {/* Latest Posts */}
            {latestBlogs && latestBlogs.length > 0 && (
              <div className="sidebar-section">
                <h4>
                  <i className="fas fa-fire"></i>
                  Bài viết mới nhất
                </h4>
                <div className="latest-blogs">
                  {latestBlogs.map(latestBlog => (
                    <div key={latestBlog._id || latestBlog.id} className="latest-blog-item">
                      {latestBlog.featuredImage && (
                        <div className="latest-blog-image">
                          <img 
                            src={latestBlog.featuredImage} 
                            alt={latestBlog.title}
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                      <div className="latest-blog-content">
                        <Link to={`/lang-nghe/${latestBlog.slug}`} className="latest-blog-link">
                          {latestBlog.title}
                        </Link>
                        <span className="latest-blog-meta">
                          <i className="fas fa-user"></i>
                          {latestBlog.author?.name || latestBlog.author || 'Đội ngũ'} - {formatDateShort(latestBlog.publishedAt)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Categories */}
            {categories && categories.length > 0 && (
              <div className="sidebar-section">
                <h4>
                  <i className="fas fa-list"></i>
                  Danh mục bài viết
                </h4>
                <div className="category-list">
                  {categories.map(category => (
                    <div key={category.id} className="category-item">
                      <Link to={`/danh-muc/${category.id}`}>
                        <i className="fas fa-tag"></i>
                        {category.name}
                        {category.count > 0 && <span className="count">({category.count})</span>}
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
};

export default BlogDetailOptimized; 