const express = require('express');
const configController = require('../controllers/configController');
const adminAuthMiddleware = require('../middleware/adminAuth');

const router = express.Router();

// Public route - anyone can check betting status
router.get('/betting-status', configController.getBettingStatus);

// Admin routes
router.get('/', adminAuthMiddleware, configController.getConfig);
router.post('/', adminAuthMiddleware, configController.updateConfig);

module.exports = router;
