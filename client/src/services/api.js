import axios from 'axios';

// Base URL cho API backend
const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://viettrad-1.onrender.com/api'
  : 'http://localhost:5000/api';

// Debug logs
console.log('🔍 API Configuration:', {
  NODE_ENV: process.env.NODE_ENV,
  API_URL: API_URL,
  REACT_APP_API_URL: process.env.REACT_APP_API_URL
});

// Tạo instance axios với base URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor thêm token vào header khi đã đăng nhập
api.interceptors.request.use(
  (config) => {
    const userInfo = localStorage.getItem('userInfo');
    
    if (userInfo) {
      try {
        const parsed = JSON.parse(userInfo);
        const { accessToken } = parsed;
        
        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
      } catch (error) {
        // Silently handle parsing errors
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor để xử lý token hết hạn
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
        // Gọi API refresh token trực tiếp (không qua userService để tránh circular dependency)
        const refreshResponse = await axios.post(`${API_URL}/users/refresh-token`, {
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
          
          console.log('🔄 Retrying original request...');
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
    
    // Log additional error details
    if (error.response?.data) {
      console.log('Error response data:', error.response.data);
    }
    
    return Promise.reject(error);
  }
);

export default api; 