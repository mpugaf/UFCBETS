const express = require('express');
const router = express.Router();
const leaderboardController = require('../controllers/leaderboardController');
const authMiddleware = require('../middleware/auth');

// All routes require authentication
router.use(authMiddleware);

// Get event leaderboard (only when betting is closed)
router.get('/event/:eventId', leaderboardController.getEventLeaderboard);

// Get yearly leaderboard
router.get('/year/:year', leaderboardController.getYearlyLeaderboard);

// Get available years
router.get('/years', leaderboardController.getAvailableYears);

// Get user stats (points and ranking for current year)
router.get('/user/stats', leaderboardController.getUserStats);

module.exports = router;
