import api from './api';

export const reviewService = {
  // Lấy tất cả reviews với filter
  getAllReviews: async (page = 1, limit = 10, filters = {}) => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...filters
      });
      const response = await api.get(`/reviews?${params}`);
      return response.data;
    } catch (error) {
      throw error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
    }
  },

  // Lấy reviews của sản phẩm
  getProductReviews: async (productId, page = 1, limit = 10) => {
    try {
      const response = await api.get(`/reviews/product/${productId}?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      throw error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
    }
  },

  // Lấy một review cụ thể
  getReview: async (reviewId) => {
    try {
      const response = await api.get(`/reviews/${reviewId}`);
      return response.data;
    } catch (error) {
      throw error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
    }
  },

  // Kiểm tra xem user có thể review sản phẩm không
  checkCanReview: async (productId) => {
    try {
      const response = await api.get(`/reviews/can-review/${productId}`);
      return response.data;
    } catch (error) {
      throw error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
    }
  },

  // Thêm review cho sản phẩm (cần đăng nhập)
  addProductReview: async (productId, rating, comment, images = []) => {
    try {
      const response = await api.post('/reviews', {
        product: productId,
        rating,
        comment,
        images
      });
      return response.data;
    } catch (error) {
      throw error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
    }
  },

  // Cập nhật review
  updateReview: async (reviewId, rating, comment, images = []) => {
    try {
      const response = await api.put(`/reviews/${reviewId}`, {
        rating,
        comment,
        images
      });
      return response.data;
    } catch (error) {
      throw error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
    }
  },

  // Xóa review
  deleteReview: async (reviewId) => {
    try {
      const response = await api.delete(`/reviews/${reviewId}`);
      return response.data;
    } catch (error) {
      throw error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
    }
  },

  // Kiểm tra user đã review sản phẩm này chưa
  checkUserReview: async (productId) => {
    try {
      const response = await api.get(`/reviews/user-review/${productId}`);
      return response.data;
    } catch (error) {
      // Nếu error 404 có nghĩa là chưa có review
      if (error.response && error.response.status === 404) {
        return null;
      }
      throw error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
    }
  },

  // Thêm helpful vote
  addHelpfulVote: async (reviewId) => {
    try {
      const response = await api.put(`/reviews/${reviewId}/helpful`);
      return response.data;
    } catch (error) {
      throw error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
    }
  },

  // Toggle approval (Admin only)
  toggleReviewApproval: async (reviewId) => {
    try {
      const response = await api.put(`/reviews/${reviewId}/approve`);
      return response.data;
    } catch (error) {
      throw error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
    }
  }
};

export default reviewService; 