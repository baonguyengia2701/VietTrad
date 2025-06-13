// API Configuration
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://viettrad-1.onrender.com'
  : 'http://localhost:5000';

export const API_ENDPOINTS = {
  AUTH: '/api/auth',
  USERS: '/api/users',
  PRODUCTS: '/api/products',
  ORDERS: '/api/orders',
  CART: '/api/cart',
  REVIEWS: '/api/reviews',
  CATEGORIES: '/api/categories'
};

export default API_BASE_URL;

// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NODE_ENV === 'production' 
    ? 'https://viettrad-1.onrender.com/api'
    : 'http://localhost:5000/api',
  TIMEOUT: parseInt(process.env.REACT_APP_API_TIMEOUT) || 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet.',
  SERVER_ERROR: 'Lỗi server. Vui lòng thử lại sau.',
  NOT_FOUND: 'Không tìm thấy dữ liệu.',
  UNAUTHORIZED: 'Bạn cần đăng nhập để tiếp tục.',
  FORBIDDEN: 'Bạn không có quyền truy cập.',
  TIMEOUT: 'Yêu cầu bị timeout. Vui lòng thử lại.',
  UNKNOWN: 'Đã xảy ra lỗi không xác định.',
};

// Helper function to build full URL
export const buildApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Helper function to get error message
export const getErrorMessage = (error) => {
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return ERROR_MESSAGES.NETWORK_ERROR;
  }
  
  if (error.status) {
    switch (error.status) {
      case HTTP_STATUS.BAD_REQUEST:
        return error.message || ERROR_MESSAGES.BAD_REQUEST;
      case HTTP_STATUS.UNAUTHORIZED:
        return ERROR_MESSAGES.UNAUTHORIZED;
      case HTTP_STATUS.FORBIDDEN:
        return ERROR_MESSAGES.FORBIDDEN;
      case HTTP_STATUS.NOT_FOUND:
        return ERROR_MESSAGES.NOT_FOUND;
      case HTTP_STATUS.INTERNAL_SERVER_ERROR:
        return ERROR_MESSAGES.SERVER_ERROR;
      default:
        return error.message || ERROR_MESSAGES.UNKNOWN;
    }
  }
  
  return error.message || ERROR_MESSAGES.UNKNOWN;
};

// Handle API errors
export const handleApiError = (error) => {
  if (error.name === 'AbortError') {
    throw new Error(ERROR_MESSAGES.TIMEOUT);
  }
  
  if (!error.response) {
    throw new Error(ERROR_MESSAGES.NETWORK_ERROR);
  }

  const status = error.response.status;
  let message = ERROR_MESSAGES.UNKNOWN;

  switch (status) {
    case HTTP_STATUS.BAD_REQUEST:
      message = error.response.data?.message || ERROR_MESSAGES.BAD_REQUEST;
      break;
    case HTTP_STATUS.UNAUTHORIZED:
      message = ERROR_MESSAGES.UNAUTHORIZED;
      break;
    case HTTP_STATUS.FORBIDDEN:
      message = ERROR_MESSAGES.FORBIDDEN;
      break;
    case HTTP_STATUS.NOT_FOUND:
      message = ERROR_MESSAGES.NOT_FOUND;
      break;
    case HTTP_STATUS.INTERNAL_SERVER_ERROR:
      message = ERROR_MESSAGES.SERVER_ERROR;
      break;
    default:
      message = error.response.data?.message || ERROR_MESSAGES.UNKNOWN;
  }

  throw new Error(message);
};

// Retry request with exponential backoff
export const retryRequest = async (requestFn, maxRetries = API_CONFIG.RETRY_ATTEMPTS) => {
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await requestFn();
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(errorData.message || `HTTP ${response.status}`);
        error.response = { status: response.status, data: errorData };
        throw error;
      }
      
      return await response.json();
    } catch (error) {
      lastError = error;
      
      // Don't retry on certain errors
      if (error.response?.status === HTTP_STATUS.UNAUTHORIZED || 
          error.response?.status === HTTP_STATUS.FORBIDDEN ||
          error.response?.status === HTTP_STATUS.NOT_FOUND) {
        handleApiError(error);
      }
      
      if (attempt === maxRetries) {
        handleApiError(error);
      }
      
      // Wait before retrying with exponential backoff
      const delay = API_CONFIG.RETRY_DELAY * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  handleApiError(lastError);
};

// Helper function for retry logic (backward compatibility)
export const retryApiCall = async (apiCall, maxRetries = API_CONFIG.RETRY_ATTEMPTS) => {
  let lastError;
  
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await apiCall();
    } catch (error) {
      lastError = error;
      
      if (i === maxRetries) {
        throw error;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, API_CONFIG.RETRY_DELAY * (i + 1)));
    }
  }
  
  throw lastError;
}; 