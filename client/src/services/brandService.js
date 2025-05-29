import api from './api';

export const brandService = {
  // Lấy tất cả thương hiệu
  getAllBrands: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      
      if (filters.active !== undefined) {
        params.append('active', filters.active);
      }
      
      const response = await api.get(`/brands?${params}`);
      return response.data;
    } catch (error) {
      throw error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
    }
  },

  // Lấy thương hiệu theo ID
  getBrandById: async (id) => {
    try {
      const response = await api.get(`/brands/${id}`);
      return response.data;
    } catch (error) {
      throw error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
    }
  },

  // Lấy thương hiệu theo slug
  getBrandBySlug: async (slug) => {
    try {
      const response = await api.get(`/brands/slug/${slug}`);
      return response.data;
    } catch (error) {
      throw error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
    }
  },

  // Lấy sản phẩm theo thương hiệu
  getBrandProducts: async (id, page = 1, limit = 8) => {
    try {
      const response = await api.get(`/brands/${id}/products?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      throw error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
    }
  },

  // Admin methods
  // Tạo thương hiệu mới (Admin only)
  createBrand: async (brandData) => {
    try {
      const response = await api.post('/brands', brandData);
      return response.data;
    } catch (error) {
      throw error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
    }
  },

  // Cập nhật thương hiệu (Admin only)
  updateBrand: async (id, brandData) => {
    try {
      const response = await api.put(`/brands/${id}`, brandData);
      return response.data;
    } catch (error) {
      throw error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
    }
  },

  // Xóa thương hiệu (Admin only)
  deleteBrand: async (id) => {
    try {
      const response = await api.delete(`/brands/${id}`);
      return response.data;
    } catch (error) {
      throw error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
    }
  },

  // Chuyển đổi trạng thái thương hiệu (Admin only)
  toggleBrandStatus: async (id) => {
    try {
      const response = await api.patch(`/brands/${id}/toggle`);
      return response.data;
    } catch (error) {
      throw error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
    }
  }
};

export default brandService; 