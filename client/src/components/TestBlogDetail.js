import React from 'react';
import { useBlogDetail } from '../hooks/useBlog';

const TestBlogDetail = ({ slug = 'lang-nghe-bat-trang' }) => {
  const { blog, relatedBlogs, loading, error } = useBlogDetail(slug);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!blog) return <div>No blog found</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h1>Test Blog Detail</h1>
      <h2>{blog.title}</h2>
      <p>Author: {blog.author?.name || blog.author || 'Unknown'}</p>
      <p>Published: {blog.publishedAt}</p>
      <p>Views: {blog.views || 0}</p>
      <div dangerouslySetInnerHTML={{ __html: blog.content || blog.excerpt }} />
      
      {relatedBlogs && relatedBlogs.length > 0 && (
        <div>
          <h3>Related Blogs ({relatedBlogs.length})</h3>
          <ul>
            {relatedBlogs.map(related => (
              <li key={related._id || related.id}>
                {related.title} - {related.publishedAt}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default TestBlogDetail; 