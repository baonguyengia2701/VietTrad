import api from './api';

export const blogService = {
  // Get all blogs with pagination and filters
  async getBlogs(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await api.get(`/blogs?${queryString}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Không thể lấy danh sách bài viết';
    }
  },

  // Get single blog by slug
  async getBlogBySlug(slug) {
    try {
      const response = await api.get(`/blogs/${slug}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Không thể lấy bài viết';
    }
  },

  // Get featured blogs
  async getFeaturedBlogs(limit = 6) {
    try {
      const response = await api.get(`/blogs/featured?limit=${limit}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Không thể lấy bài viết nổi bật';
    }
  },

  // Get latest blogs
  async getLatestBlogs(limit = 5) {
    try {
      const response = await api.get(`/blogs/latest?limit=${limit}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Không thể lấy bài viết mới nhất';
    }
  },

  // Get blog categories
  async getBlogCategories() {
    try {
      const response = await api.get('/blogs/categories');
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Không thể lấy danh mục';
    }
  },

  // Add comment to blog
  async addComment(slug, commentData) {
    try {
      const response = await api.post(`/blogs/${slug}/comments`, commentData);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Không thể thêm bình luận';
    }
  },

  // Admin functions
  async createBlog(blogData) {
    try {
      const response = await api.post('/blogs', blogData);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Không thể tạo bài viết';
    }
  },

  async updateBlog(id, blogData) {
    try {
      const response = await api.put(`/blogs/${id}`, blogData);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Không thể cập nhật bài viết';
    }
  },

  async deleteBlog(id) {
    try {
      const response = await api.delete(`/blogs/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Không thể xóa bài viết';
    }
  },

  async togglePublishStatus(id) {
    try {
      const response = await api.patch(`/blogs/${id}/publish`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Không thể thay đổi trạng thái bài viết';
    }
  }
};

export default blogService; 