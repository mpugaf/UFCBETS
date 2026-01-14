const express = require('express');
const betsController = require('../controllers/betsController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

router.get('/available', betsController.getAvailableFights);
router.post('/place', betsController.placeBet);
router.post('/submit-all', betsController.submitAllBets);
router.get('/my-bets', betsController.getUserBets);

module.exports = router;
