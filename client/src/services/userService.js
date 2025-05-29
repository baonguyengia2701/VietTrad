import api from './api';

// Service xử lý các API liên quan đến user
const userService = {
  // Đăng nhập
  login: async (email, password) => {
    try {
      const response = await api.post('/users/login', { email, password });
      if (response.data) {
        localStorage.setItem('userInfo', JSON.stringify(response.data));
      }
      return response.data;
    } catch (error) {
      throw error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
    }
  },

  // Đăng ký
  register: async (name, email, password) => {
    try {
      const response = await api.post('/users', { name, email, password });
      if (response.data) {
        localStorage.setItem('userInfo', JSON.stringify(response.data));
      }
      return response.data;
    } catch (error) {
      throw error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
    }
  },

  // Đăng xuất
  logout: () => {
    localStorage.removeItem('userInfo');
  },

  // Lấy thông tin người dùng hiện tại
  getCurrentUser: () => {
    const userInfo = localStorage.getItem('userInfo');
    return userInfo ? JSON.parse(userInfo) : null;
  },

  // Lấy thông tin profile
  getUserProfile: async () => {
    try {
      const response = await api.get('/users/profile');
      return response.data;
    } catch (error) {
      throw error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
    }
  },

  // Cập nhật thông tin user
  updateUserProfile: async (userData) => {
    try {
      const response = await api.put('/users/profile', userData);
      if (response.data) {
        // Cập nhật thông tin user trong localStorage
        const currentUser = JSON.parse(localStorage.getItem('userInfo'));
        const updatedUser = { ...currentUser, ...response.data };
        localStorage.setItem('userInfo', JSON.stringify(updatedUser));
      }
      return response.data;
    } catch (error) {
      throw error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
    }
  },

  // Đổi mật khẩu
  changePassword: async (currentPassword, newPassword) => {
    try {
      const response = await api.put('/users/change-password', {
        currentPassword,
        newPassword
      });
      return response.data;
    } catch (error) {
      throw error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
    }
  },

  // Refresh token
  refreshToken: async () => {
    try {
      const currentUser = userService.getCurrentUser();
      if (!currentUser || !currentUser.refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await api.post('/users/refresh-token', {
        refreshToken: currentUser.refreshToken
      });

      if (response.data) {
        const updatedUser = { ...currentUser, ...response.data };
        localStorage.setItem('userInfo', JSON.stringify(updatedUser));
        return updatedUser;
      }
    } catch (error) {
      // Nếu refresh token thất bại, logout user
      userService.logout();
      throw error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
    }
  },

  // Admin methods
  // Lấy tất cả users (admin only)
  getAllUsers: async () => {
    try {
      const response = await api.get('/users');
      return response.data;
    } catch (error) {
      throw error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
    }
  },

  // Lấy thông tin user theo ID (admin only)
  getUserById: async (userId) => {
    try {
      const response = await api.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
    }
  },

  // Cập nhật thông tin user (admin only)
  updateUser: async (userId, userData) => {
    try {
      const response = await api.put(`/users/${userId}`, userData);
      return response.data;
    } catch (error) {
      throw error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
    }
  },

  // Xóa user (admin only)
  deleteUser: async (userId) => {
    try {
      const response = await api.delete(`/users/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
    }
  },

  // Cập nhật trạng thái user (admin only)
  updateUserStatus: async (userId, status) => {
    try {
      const response = await api.put(`/users/${userId}/status`, { status });
      return response.data;
    } catch (error) {
      throw error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
    }
  },

  // Cập nhật vai trò user (admin only)
  updateUserRole: async (userId, isAdmin) => {
    try {
      const response = await api.put(`/users/${userId}`, { isAdmin });
      return response.data;
    } catch (error) {
      throw error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
    }
  }
};

export default userService; 