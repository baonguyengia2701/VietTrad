import axios from 'axios';

const API_BASE_URL = '/api/inventory';

// Tạo axios instance với cấu hình mặc định
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor để thêm token vào mỗi request
api.interceptors.request.use(
  (config) => {
    console.log('🔍 Inventory API Request interceptor:', {
      url: config.url,
      method: config.method,
      baseURL: config.baseURL
    });

    const userInfo = localStorage.getItem('userInfo');
    console.log('UserInfo from localStorage:', userInfo ? 'Found' : 'Not found');
    
    if (userInfo) {
      try {
        const parsed = JSON.parse(userInfo);
        const { accessToken } = parsed;
        
        console.log('AccessToken:', accessToken ? `${accessToken.substring(0, 20)}...` : 'No token');
        
        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`;
          console.log('✅ Authorization header set for inventory');
        } else {
          console.log('❌ No accessToken found in userInfo');
        }
      } catch (error) {
        console.error('❌ Error parsing userInfo:', error);
      }
    } else {
      console.log('❌ No userInfo in localStorage');
    }
    
    console.log('Final inventory headers:', config.headers);
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Interceptor để xử lý response errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Nếu lỗi 401 (Unauthorized) và chưa thử refresh token
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Đánh dấu đã thử refresh

      try {
        // Lấy refresh token từ localStorage
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        
        if (!userInfo || !userInfo.refreshToken) {
          console.log('❌ No refresh token available');
          localStorage.removeItem('userInfo');
          window.location.href = '/login';
          return Promise.reject(error);
        }

        console.log('🔄 Calling refresh token API...');
        // Gọi API refresh token
        const refreshResponse = await axios.post('/api/users/refresh-token', {
          refreshToken: userInfo.refreshToken,
        });
        
        if (refreshResponse.data && refreshResponse.data.accessToken) {
          const newAccessToken = refreshResponse.data.accessToken;
          console.log('✅ New access token received');
          
          // Cập nhật access token trong localStorage
          const updatedUserInfo = {
            ...userInfo,
            accessToken: newAccessToken,
          };
          localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));
          
          // Cập nhật header với token mới
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          
          console.log('🔄 Retrying original inventory request...');
          // Thực hiện lại request gốc
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error('❌ Refresh token failed:', refreshError);
        // Nếu refresh token thất bại, đăng xuất người dùng
        localStorage.removeItem('userInfo');
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }
    
    return Promise.reject(error);
  }
);

const inventoryService = {
  // Lấy danh sách giao dịch kho
  getTransactions: async (params = {}) => {
    try {
      const response = await api.get('/transactions', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Nhập kho
  stockIn: async (data) => {
    try {
      const response = await api.post('/stock-in', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Xuất kho
  stockOut: async (data) => {
    try {
      const response = await api.post('/stock-out', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Điều chỉnh kho
  adjustStock: async (data) => {
    try {
      const response = await api.post('/adjust', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Lấy lịch sử giao dịch của sản phẩm
  getProductHistory: async (productId, params = {}) => {
    try {
      const response = await api.get(`/product/${productId}/history`, { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Lấy thống kê kho hàng
  getStats: async () => {
    try {
      const response = await api.get('/stats');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default inventoryService; 