const express = require('express');
const router = express.Router();

// Import Local AI Controller (Free version)
const {
  chatWithLocalAI,
} = require('../controllers/aiAssistantController-local');

// Import Original AI Controller (có thể dùng sau)
const {
  chatWithAssistant,
  smartProductSearch,
  getSimilarProducts,
} = require('../controllers/aiAssistantController');

// Route để chat với Local AI Assistant (Free)
router.post('/chat', chatWithLocalAI);

// Route để chat với OpenAI Assistant (backup)
router.post('/chat-openai', chatWithAssistant);

// Route để tìm kiếm thông minh
router.post('/smart-search', smartProductSearch);

// Route để lấy sản phẩm tương tự
router.post('/similar-products', getSimilarProducts);

module.exports = router; 