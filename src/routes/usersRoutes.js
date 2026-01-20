const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const adminAuthMiddleware = require('../middleware/adminAuth');

// All routes require authentication and admin role
router.use(adminAuthMiddleware);

// Get all users
router.get('/', usersController.getAllUsers);

// Toggle betting permission for a specific user
router.patch('/:userId/toggle-betting', usersController.toggleUserBetting);

// Reset betting for all users
router.post('/reset-all-betting', usersController.resetAllUsersBetting);

module.exports = router;
