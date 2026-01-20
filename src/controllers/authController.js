const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const RegistrationToken = require('../models/RegistrationToken');
const { generateToken } = require('../utils/jwt');

class AuthController {
  async register(req, res) {
    try {
      // Validate input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const { username, email, password, nickname, country_id, token: registrationToken } = req.body;

      // Validate registration token
      if (!registrationToken) {
        return res.status(400).json({
          success: false,
          message: 'Se requiere un token de registro'
        });
      }

      const isTokenValid = await RegistrationToken.isTokenValid(registrationToken);
      if (!isTokenValid) {
        const tokenData = await RegistrationToken.findByToken(registrationToken);
        let message = 'Token de registro inválido';

        if (tokenData) {
          if (tokenData.is_used) {
            message = 'Este token ya ha sido utilizado';
          } else if (new Date(tokenData.expires_at) < new Date()) {
            message = 'Este token ha expirado';
          }
        }

        return res.status(400).json({
          success: false,
          message
        });
      }

      // Check if user already exists
      const existingUserByEmail = await User.findByEmail(email);
      if (existingUserByEmail) {
        return res.status(400).json({
          success: false,
          message: 'Email already registered'
        });
      }

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

      // Create user
      const userId = await User.create({
        username,
        email,
        password_hash,
        nickname: nickname || null,
        country_id: country_id || null
      });

      // Mark token as used
      await RegistrationToken.markAsUsed(registrationToken, userId);

      // Get created user
      const newUser = await User.findById(userId);

      // Generate JWT token
      const token = generateToken({
        userId: newUser.user_id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role
      });

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: {
            user_id: newUser.user_id,
            username: newUser.username,
            nickname: newUser.nickname,
            email: newUser.email,
            role: newUser.role,
            country_id: newUser.country_id,
            country_name: newUser.country_name,
            country_code: newUser.country_code,
            created_at: newUser.created_at
          },
          token
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Error registering user',
        error: error.message
      });
    }
  }

  async login(req, res) {
    try {
      // Validate input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const { username, password } = req.body;

      // Find user
      const user = await User.findByUsername(username);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Generate JWT token
      const token = generateToken({
        userId: user.user_id,
        username: user.username,
        email: user.email,
        role: user.role
      });

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            user_id: user.user_id,
            username: user.username,
            nickname: user.nickname,
            email: user.email,
            role: user.role,
            country_id: user.country_id,
            country_name: user.country_name,
            country_code: user.country_code,
            created_at: user.created_at
          },
          token
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Error during login',
        error: error.message
      });
    }
  }

  async getProfile(req, res) {
    try {
      const user = await User.findById(req.user.userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        data: {
          user_id: user.user_id,
          username: user.username,
          nickname: user.nickname,
          email: user.email,
          role: user.role,
          country_id: user.country_id,
          country_name: user.country_name,
          country_code: user.country_code,
          created_at: user.created_at
        }
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting profile',
        error: error.message
      });
    }
  }

  async changePassword(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const { currentPassword, newPassword } = req.body;
      const userId = req.user.userId;

      // Get user with password
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Verify current password
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const newPasswordHash = await bcrypt.hash(newPassword, salt);

      // Update password
      const { pool } = require('../config/database');
      const query = 'UPDATE users SET password_hash = ? WHERE user_id = ?';
      await pool.execute(query, [newPasswordHash, userId]);

      res.json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({
        success: false,
        message: 'Error changing password',
        error: error.message
      });
    }
  }
}

module.exports = new AuthController();
