const express = require('express');
const { body } = require('express-validator');
const adminController = require('../controllers/adminController');
const adminAuthMiddleware = require('../middleware/adminAuth');

const router = express.Router();

// All routes require admin authentication
router.use(adminAuthMiddleware);

// Validation rules for creating user
const createUserValidation = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers and underscores'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role')
    .optional()
    .isIn(['user', 'admin'])
    .withMessage('Role must be either user or admin'),
  body('country_id')
    .optional()
    .isInt()
    .withMessage('Country ID must be a valid integer')
];

// Routes
router.post('/users', createUserValidation, adminController.createUser);
router.get('/users', adminController.getAllUsers);
router.delete('/users/:userId', adminController.deleteUser);

module.exports = router;
