const express = require('express');
const router = express.Router();
const villageController = require('../controllers/villageController');
// const { protect, admin } = require('../middleware/auth');

// Routes công khai
router.get('/', villageController.getVillages);
router.get('/provinces', villageController.getProvinces);
router.get('/craft-types', villageController.getCraftTypes);
router.get('/slug/:slug', villageController.getVillageBySlug);
router.get('/:id', villageController.getVillageById);

// Routes yêu cầu quyền Admin
// router.post('/', protect, admin, villageController.createVillage);
// router.put('/:id', protect, admin, villageController.updateVillage);
// router.delete('/:id', protect, admin, villageController.deleteVillage);
// router.put('/:id/artisans', protect, admin, villageController.addFeaturedArtisan);
// router.delete('/:id/artisans/:artisanId', protect, admin, villageController.removeFeaturedArtisan);

// Tạm thời bỏ middleware xác thực cho phát triển
router.post('/', villageController.createVillage);
router.put('/:id', villageController.updateVillage);
router.delete('/:id', villageController.deleteVillage);
router.put('/:id/artisans', villageController.addFeaturedArtisan);
router.delete('/:id/artisans/:artisanId', villageController.removeFeaturedArtisan);

module.exports = router; 