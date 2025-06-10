// API base URL - configure this in your environment
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Helper function for API calls
const apiCall = async (endpoint, options = {}) => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Get auth token from userInfo
    const userInfo = localStorage.getItem('userInfo');
    let token = null;
    if (userInfo) {
      try {
        const parsed = JSON.parse(userInfo);
        token = parsed.accessToken; // Fix: use accessToken instead of token
      } catch (error) {
        console.error('Error parsing userInfo:', error);
      }
    }
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }), // Add auth header if token exists
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data; // Return data directly instead of wrapping it
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

export const blogService = {
  // Get all blogs with pagination and filters
  getAllBlogs: async (page = 1, limit = 12, category = '') => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (category) {
      params.set('category', category);
    }
    
    return await apiCall(`/blogs?${params.toString()}`);
  },

  // Get blog by slug
  getBlogBySlug: async (slug) => {
    return await apiCall(`/blogs/${slug}`);
  },

  // Search blogs
  searchBlogs: async (query, page = 1, limit = 10) => {
    const params = new URLSearchParams({
      search: query,
      page: page.toString(),
      limit: limit.toString(),
    });
    
    return await apiCall(`/blogs?${params.toString()}`);
  },

  // Get latest blogs
  getLatestBlogs: async (limit = 4) => {
    const params = new URLSearchParams({
      limit: limit.toString(),
    });
    
    return await apiCall(`/blogs/latest?${params.toString()}`);
  },

  // Get featured blogs
  getFeaturedBlogs: async (limit = 6) => {
    const params = new URLSearchParams({
      limit: limit.toString(),
    });
    
    return await apiCall(`/blogs/featured?${params.toString()}`);
  },

  // Get blog categories
  getCategories: async () => {
    return await apiCall('/blogs/categories');
  },

  // Get blogs by category
  getBlogsByCategory: async (categoryId, page = 1, limit = 10) => {
    return await blogService.getAllBlogs(page, limit, categoryId);
  },

  // Add comment to blog
  addComment: async (slug, commentData) => {
    return await apiCall(`/blogs/${slug}/comments`, {
      method: 'POST',
      body: JSON.stringify(commentData),
    });
  },

  // Create new blog
  createBlog: async (blogData) => {
    return await apiCall('/blogs', {
      method: 'POST',
      body: JSON.stringify(blogData),
    });
  },

  // Update existing blog
  updateBlog: async (id, blogData) => {
    return await apiCall(`/blogs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(blogData),
    });
  },

  // Delete blog
  deleteBlog: async (id) => {
    return await apiCall(`/blogs/${id}`, {
      method: 'DELETE',
    });
  },

  // Toggle publish status
  togglePublishStatus: async (id) => {
    return await apiCall(`/blogs/${id}/publish`, {
      method: 'PATCH',
    });
  }
};

export default blogService; 