const express = require('express');
const router = express.Router();
const invitationsController = require('../controllers/invitationsController');
const authMiddleware = require('../middleware/auth');

// Rutas públicas - no requieren autenticación
router.get('/validate/:token', invitationsController.validateToken);
router.get('/public-list', invitationsController.listPublicTokens);

// Rutas protegidas - solo para admins autenticados
router.use(authMiddleware);

// Generar nuevo token de invitación
router.post('/generate', invitationsController.generateToken);

// Listar invitaciones (con filtros opcionales)
router.get('/list', invitationsController.listInvitations);

// Obtener estadísticas
router.get('/stats', invitationsController.getStats);

// Revocar token
router.post('/:tokenId/revoke', invitationsController.revokeToken);

module.exports = router;
