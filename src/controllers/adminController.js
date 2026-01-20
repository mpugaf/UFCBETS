const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const User = require('../models/User');

class AdminController {
  async createUser(req, res) {
    try {
      // Validate input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const { username, password, country_id, role } = req.body;

      // Check if username already exists
      const existingUserByUsername = await User.findByUsername(username);
      if (existingUserByUsername) {
        return res.status(400).json({
          success: false,
          message: 'Username already taken'
        });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password, salt);

      // Create user with email set to null
      const userId = await User.create({
        username,
        email: null,
        password_hash,
        country_id: country_id || null,
        role: role || 'user'
      });

      // Get created user
      const newUser = await User.findById(userId);

      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: {
          user_id: newUser.user_id,
          username: newUser.username,
          email: newUser.email,
          role: newUser.role,
          country_id: newUser.country_id,
          country_name: newUser.country_name,
          country_code: newUser.country_code,
          created_at: newUser.created_at
        }
      });
    } catch (error) {
      console.error('Create user error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating user',
        error: error.message
      });
    }
  }

  async getAllUsers(req, res) {
    try {
      const { pool } = require('../config/database');
      const query = `
        SELECT u.user_id, u.username, u.email, u.role,
               u.created_at, c.country_name, c.country_code
        FROM users u
        LEFT JOIN dim_countries c ON u.country_id = c.country_id
        ORDER BY u.created_at DESC
      `;
      const [users] = await pool.execute(query);

      res.json({
        success: true,
        data: users
      });
    } catch (error) {
      console.error('Get all users error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching users',
        error: error.message
      });
    }
  }

  async deleteUser(req, res) {
    try {
      const { userId } = req.params;

      if (parseInt(userId) === req.user.userId) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete your own account'
        });
      }

      const { pool } = require('../config/database');
      const query = 'DELETE FROM users WHERE user_id = ?';
      const [result] = await pool.execute(query, [userId]);

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting user',
        error: error.message
      });
    }
  }
}

module.exports = new AdminController();
