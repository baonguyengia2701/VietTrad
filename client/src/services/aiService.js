import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class AIService {
  // Chat với Local AI Assistant (Free version)
  async chatWithAssistant(message, conversationHistory = []) {
    try {
      const response = await axios.post(`${API_URL}/ai/chat`, {
        message,
        conversationHistory
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Có lỗi xảy ra khi chat với trợ lý AI';
    }
  }

  // Chat với OpenAI Assistant (backup)
  async chatWithOpenAI(message, conversationHistory = []) {
    try {
      const response = await axios.post(`${API_URL}/ai/chat-openai`, {
        message,
        conversationHistory
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Có lỗi xảy ra khi chat với OpenAI';
    }
  }

  // Tìm kiếm thông minh
  async smartSearch(query) {
    try {
      const response = await axios.post(`${API_URL}/ai/smart-search`, {
        query
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Có lỗi xảy ra khi tìm kiếm';
    }
  }

  // Lấy sản phẩm tương tự
  async getSimilarProducts(productId) {
    try {
      const response = await axios.post(`${API_URL}/ai/similar-products`, {
        productId
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Có lỗi xảy ra khi lấy sản phẩm tương tự';
    }
  }
}

export default new AIService(); 