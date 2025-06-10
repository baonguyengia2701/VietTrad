import { useState, useEffect, useCallback } from 'react';
import { blogService } from '../services/blogService';

// Custom hook for fetching blog details
export const useBlogDetail = (slug) => {
  const [blog, setBlog] = useState(null);
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBlog = useCallback(async () => {
    if (!slug) return;

    try {
      setLoading(true);
      setError(null);
      const response = await blogService.getBlogBySlug(slug);
              // Handle backend response format { success: true, data: { blog, relatedBlogs } }
        const responseData = response.data?.data || response.data || response;
        const blogData = responseData.blog || responseData;
        const relatedBlogsData = responseData.relatedBlogs || [];
        setBlog(blogData);
        setRelatedBlogs(relatedBlogsData);
    } catch (err) {
      setError(err.message || 'Không thể tải bài viết');
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchBlog();
  }, [fetchBlog]);

  return { blog, relatedBlogs, loading, error, refetch: fetchBlog };
};

// Custom hook for fetching related blogs
export const useRelatedBlogs = (blogId, limit = 6) => {
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRelatedBlogs = useCallback(async () => {
    if (!blogId) return;

    try {
      setLoading(true);
      setError(null);
      const response = await blogService.getRelatedBlogs(blogId, limit);
      // Handle backend response format { success: true, data: [...] }
      const relatedData = response.data?.data || response.data || response || [];
      setRelatedBlogs(relatedData);
    } catch (err) {
      setError(err.message || 'Không thể tải bài viết liên quan');
      setRelatedBlogs([]);
    } finally {
      setLoading(false);
    }
  }, [blogId, limit]);

  useEffect(() => {
    fetchRelatedBlogs();
  }, [fetchRelatedBlogs]);

  return { relatedBlogs, loading, error, refetch: fetchRelatedBlogs };
};

// Custom hook for fetching latest blogs
export const useLatestBlogs = (limit = 4) => {
  const [latestBlogs, setLatestBlogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchLatestBlogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await blogService.getLatestBlogs(limit);
      // Handle backend response format { success: true, data: [...] }
      const blogs = response.data?.data || response.data || response || [];
      setLatestBlogs(blogs);
    } catch (err) {
      setError(err.message || 'Không thể tải bài viết mới nhất');
      setLatestBlogs([]);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchLatestBlogs();
  }, [fetchLatestBlogs]);

  return { latestBlogs, loading, error, refetch: fetchLatestBlogs };
};

// Custom hook for fetching categories
export const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await blogService.getCategories();
      // Handle backend response format { success: true, data: [...] }
      const categoriesData = response.data?.data || response.data || response || [];
      // Transform backend format {_id: "category", count: x} to frontend format {id: "category", name: "category", count: x}
      const transformedCategories = categoriesData.map(cat => ({
        id: cat._id,
        name: cat._id,
        count: cat.count
      }));
      setCategories(transformedCategories);
    } catch (err) {
      setError(err.message || 'Không thể tải danh mục');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return { categories, loading, error, refetch: fetchCategories };
};

// Custom hook for fetching all blogs with pagination
export const useBlogs = (page = 1, limit = 10, category = null) => {
  const [blogs, setBlogs] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBlogs, setTotalBlogs] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBlogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await blogService.getAllBlogs(page, limit, category);
      
      // Handle different response formats
      if (response.data && response.data.data) {
        // Backend returns { success: true, data: { blogs: [...], pages: x, total: y } }
        const apiData = response.data.data;
        if (apiData.blogs && Array.isArray(apiData.blogs)) {
          setBlogs(apiData.blogs);
          setTotalPages(apiData.pages || 1);
          setTotalBlogs(apiData.total || apiData.blogs.length);
        } else {
          setBlogs([]);
          setTotalPages(1);
          setTotalBlogs(0);
        }
      } else if (response.data) {
        // If response has data property
        if (Array.isArray(response.data)) {
          setBlogs(response.data);
          setTotalPages(response.totalPages || 1);
          setTotalBlogs(response.total || response.data.length);
        } else if (response.data.blogs && Array.isArray(response.data.blogs)) {
          setBlogs(response.data.blogs);
          setTotalPages(response.data.totalPages || response.data.pages || 1);
          setTotalBlogs(response.data.total || response.data.blogs.length);
        } else {
          setBlogs([]);
          setTotalPages(1);
          setTotalBlogs(0);
        }
      } else if (Array.isArray(response)) {
        // If response is directly an array
        setBlogs(response);
        setTotalPages(1);
        setTotalBlogs(response.length);
      } else if (response.blogs && Array.isArray(response.blogs)) {
        // If response has blogs property
        setBlogs(response.blogs);
        setTotalPages(response.totalPages || response.pages || 1);
        setTotalBlogs(response.total || response.blogs.length);
      } else {
        // Fallback: ensure blogs is always an array
        console.warn('Unexpected API response format:', response);
        setBlogs([]);
        setTotalPages(1);
        setTotalBlogs(0);
      }
    } catch (err) {
      console.error('Error fetching blogs:', err);
      setError(err.message || 'Không thể tải danh sách bài viết');
      setBlogs([]);
      setTotalPages(1);
      setTotalBlogs(0);
    } finally {
      setLoading(false);
    }
  }, [page, limit, category]);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  return { 
    blogs, 
    totalPages, 
    totalBlogs, 
    loading, 
    error,
    refetch: fetchBlogs
  };
}; 