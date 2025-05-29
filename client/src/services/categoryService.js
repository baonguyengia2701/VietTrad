import api from './api';

export const categoryService = {
  // Lấy tất cả danh mục
  getAllCategories: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      
      if (filters.active !== undefined) {
        params.append('active', filters.active);
      }
      
      const response = await api.get(`/categories?${params}`);
      return response.data;
    } catch (error) {
      throw error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
    }
  },

  // Lấy danh mục theo ID
  getCategoryById: async (id) => {
    try {
      const response = await api.get(`/categories/${id}`);
      return response.data;
    } catch (error) {
      throw error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
    }
  },

  // Lấy danh mục theo slug
  getCategoryBySlug: async (slug) => {
    try {
      const response = await api.get(`/categories/slug/${slug}`);
      return response.data;
    } catch (error) {
      throw error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
    }
  },

  // Lấy sản phẩm theo danh mục
  getCategoryProducts: async (id, page = 1, limit = 8) => {
    try {
      const response = await api.get(`/categories/${id}/products?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      throw error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
    }
  },

  // Admin methods
  // Tạo danh mục mới (Admin only)
  createCategory: async (categoryData) => {
    try {
      const response = await api.post('/categories', categoryData);
      return response.data;
    } catch (error) {
      throw error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
    }
  },

  // Cập nhật danh mục (Admin only)
  updateCategory: async (id, categoryData) => {
    try {
      const response = await api.put(`/categories/${id}`, categoryData);
      return response.data;
    } catch (error) {
      throw error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
    }
  },

  // Xóa danh mục (Admin only)
  deleteCategory: async (id) => {
    try {
      const response = await api.delete(`/categories/${id}`);
      return response.data;
    } catch (error) {
      throw error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
    }
  },

  // Chuyển đổi trạng thái danh mục (Admin only)
  toggleCategoryStatus: async (id) => {
    try {
      const response = await api.patch(`/categories/${id}/toggle`);
      return response.data;
    } catch (error) {
      throw error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
    }
  }
};

export default categoryService; 