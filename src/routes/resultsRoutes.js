const express = require('express');
const router = express.Router();
const resultsController = require('../controllers/resultsController');
const adminAuthMiddleware = require('../middleware/adminAuth');

// All routes require admin authentication
router.use(adminAuthMiddleware);

// Get fight results for an event
router.get('/event/:eventId', resultsController.getFightResults);

// Update fight result
router.post('/fight/:fightId', resultsController.updateFightResult);

module.exports = router;
