const express = require('express');
const registrationTokenController = require('../controllers/registrationTokenController');
const authMiddleware = require('../middleware/auth');
const adminAuthMiddleware = require('../middleware/adminAuth');

const router = express.Router();

router.get('/public-list', registrationTokenController.getPublicList);
router.post('/create', authMiddleware, adminAuthMiddleware, registrationTokenController.createToken);
router.get('/my-tokens', authMiddleware, adminAuthMiddleware, registrationTokenController.getMyTokens);
router.get('/all', authMiddleware, adminAuthMiddleware, registrationTokenController.getAllTokens);
router.get('/validate/:token', registrationTokenController.validateToken);
router.post('/revoke/:token', authMiddleware, adminAuthMiddleware, registrationTokenController.revokeToken);
router.delete('/:token_id', authMiddleware, adminAuthMiddleware, registrationTokenController.deleteToken);

module.exports = router;
