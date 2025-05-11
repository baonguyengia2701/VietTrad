const express = require('express');
const router = express.Router();
const storyController = require('../controllers/storyController');
// const { protect, admin } = require('../middleware/auth');

// Routes công khai
router.get('/', storyController.getStories);
router.get('/featured', storyController.getFeaturedStories);
router.get('/tags', storyController.getTags);
router.get('/slug/:slug', storyController.getStoryBySlug);
router.get('/:id', storyController.getStoryById);

// Routes yêu cầu quyền Admin
// router.post('/', protect, admin, storyController.createStory);
// router.put('/:id', protect, admin, storyController.updateStory);
// router.delete('/:id', protect, admin, storyController.deleteStory);
// router.put('/:id/related/:relatedId', protect, admin, storyController.addRelatedStory);
// router.delete('/:id/related/:relatedId', protect, admin, storyController.removeRelatedStory);

// Tạm thời bỏ middleware xác thực cho phát triển
router.post('/', storyController.createStory);
router.put('/:id', storyController.updateStory);
router.delete('/:id', storyController.deleteStory);
router.put('/:id/related/:relatedId', storyController.addRelatedStory);
router.delete('/:id/related/:relatedId', storyController.removeRelatedStory);

module.exports = router; 