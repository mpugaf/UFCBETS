const express = require('express');
const maintainersController = require('../controllers/maintainersController');
const adminAuthMiddleware = require('../middleware/adminAuth');

const router = express.Router();

// All routes require admin authentication
router.use(adminAuthMiddleware);

// Fighters
router.get('/fighters', maintainersController.getFighters);
router.post('/fighters', maintainersController.createFighter);
router.put('/fighters/:fighter_id', maintainersController.updateFighter);
router.delete('/fighters/:fighter_id', maintainersController.deleteFighter);

// Events
router.get('/events', maintainersController.getEvents);
router.get('/events/:event_id', maintainersController.getEventById);
router.post('/events', maintainersController.createEvent);
router.put('/events/:event_id', maintainersController.updateEvent);
router.delete('/events/:event_id', maintainersController.deleteEvent);

// Fights
router.get('/fights', maintainersController.getFights);
router.post('/fights', maintainersController.createFight);
router.put('/fights/:fight_id', maintainersController.updateFight);
router.delete('/fights/:fight_id', maintainersController.deleteFight);

// Catalogs
router.get('/catalogs', maintainersController.getCatalogs);

// Users
router.get('/users', maintainersController.getUsers);
router.delete('/users/:user_id', maintainersController.deleteUser);

// Clear user bets
router.post('/clear-user-bets', maintainersController.clearUserEventBets);
router.get('/user-bets/:userId/:eventId', maintainersController.getUserEventBets);

// Delete all non-admin users
router.delete('/delete-all-users', maintainersController.deleteAllNonAdminUsers);

module.exports = router;
