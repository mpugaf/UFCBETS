const express = require('express');
const betsController = require('../controllers/betsController');
const authMiddleware = require('../middleware/auth');
const adminAuthMiddleware = require('../middleware/adminAuth');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

router.get('/events', betsController.getAllEvents);
router.get('/available', betsController.getAvailableFights);
router.get('/predictions/:eventId', betsController.getAllEventPredictions);
router.post('/place', betsController.placeBet);
router.post('/submit-all', betsController.submitAllBets);
router.get('/my-bets', betsController.getUserBets);

// Admin only routes
router.delete('/event/:eventId/clear', adminAuthMiddleware, betsController.clearEventBets);

module.exports = router;
