const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
// const { protect, admin } = require('../middleware/auth');

// Routes công khai
router.get('/', productController.getProducts);
router.get('/featured', productController.getFeaturedProducts);
router.get('/slug/:slug', productController.getProductBySlug);
router.get('/:id', productController.getProductById);

// Routes yêu cầu quyền Admin
// router.post('/', protect, admin, productController.createProduct);
// router.put('/:id', protect, admin, productController.updateProduct);
// router.delete('/:id', protect, admin, productController.deleteProduct);
// router.put('/:id/cultural-story', protect, admin, productController.addCulturalStory);

// Tạm thời bỏ middleware xác thực cho phát triển
router.post('/', productController.createProduct);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);
router.put('/:id/cultural-story', productController.addCulturalStory);

module.exports = router; 