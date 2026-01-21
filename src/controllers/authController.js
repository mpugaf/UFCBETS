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

  async registerWithInvitation(req, res) {
    try {
      // Validate input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const { username, password, nickname, invitationToken } = req.body;
      const { pool } = require('../config/database');

      // Validar token de invitación
      if (!invitationToken) {
        return res.status(400).json({
          success: false,
          message: 'Se requiere un token de invitación'
        });
      }

      // Verificar token de invitación
      const [tokenRows] = await pool.execute(
        `SELECT token_id, email, used_at, revoked_at, expires_at
         FROM invitation_tokens
         WHERE token = ?`,
        [invitationToken]
      );

      if (tokenRows.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Token de invitación no válido'
        });
      }

      const token = tokenRows[0];

      // Verificar si ya fue usado
      if (token.used_at) {
        return res.status(400).json({
          success: false,
          message: 'Este token de invitación ya fue utilizado'
        });
      }

      // Verificar si fue revocado
      if (token.revoked_at) {
        return res.status(400).json({
          success: false,
          message: 'Este token de invitación fue revocado'
        });
      }

      // Verificar si expiró
      const now = new Date();
      const expiresAt = new Date(token.expires_at);
      if (now > expiresAt) {
        return res.status(400).json({
          success: false,
          message: 'Este token de invitación ha expirado'
        });
      }

      // Los tokens de invitación no requieren email (siempre null)

      // Verificar que el username no esté tomado
      const existingUserByUsername = await User.findByUsername(username);
      if (existingUserByUsername) {
        return res.status(400).json({
          success: false,
          message: 'Este nombre de usuario ya está en uso'
        });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password, salt);

      // Crear usuario (sin email, solo con invitación)
      const userId = await User.create({
        username,
        email: null,
        password_hash,
        nickname: nickname || null,
        country_id: null
      });

      // Marcar token como usado
      await pool.execute(
        'UPDATE invitation_tokens SET used_at = NOW(), used_by = ? WHERE token_id = ?',
        [userId, token.token_id]
      );

      // Obtener usuario creado
      const newUser = await User.findById(userId);

      res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente. Ya puedes iniciar sesión.',
        data: {
          user: {
            user_id: newUser.user_id,
            username: newUser.username,
            nickname: newUser.nickname,
            email: newUser.email,
            role: newUser.role
          }
        }
      });
    } catch (error) {
      console.error('Register with invitation error:', error);
      res.status(500).json({
        success: false,
        message: 'Error al registrar usuario',
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
