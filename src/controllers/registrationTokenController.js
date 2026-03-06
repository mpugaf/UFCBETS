const RegistrationToken = require('../models/RegistrationToken');

class RegistrationTokenController {
  async getPublicList(req, res) {
    try {
      const [rows] = await require('../config/database').pool.execute(
        `SELECT token_id, token, expires_at, created_at
         FROM registration_tokens
         WHERE is_used = FALSE
           AND expires_at > NOW()
         ORDER BY created_at ASC`
      );
      res.json({ success: true, data: rows });
    } catch (error) {
      console.error('Error fetching public token list:', error);
      res.status(500).json({ success: false, message: 'Error al obtener tokens disponibles' });
    }
  }

  async createToken(req, res) {
    try {
      const { expires_in_days = 7 } = req.body;
      const createdBy = req.user.userId;

      const tokenData = await RegistrationToken.create(createdBy, expires_in_days);

      const registrationUrl = `${req.protocol}://${req.get('host')}/register?token=${tokenData.token}`;

      res.status(201).json({
        success: true,
        message: 'Token de registro creado exitosamente',
        data: {
          token_id: tokenData.token_id,
          token: tokenData.token,
          registration_url: registrationUrl,
          expires_at: tokenData.expires_at
        }
      });
    } catch (error) {
      console.error('Error creating registration token:', error);
      res.status(500).json({
        success: false,
        message: 'Error al crear token de registro',
        error: error.message
      });
    }
  }

  async getMyTokens(req, res) {
    try {
      const createdBy = req.user.userId;
      const tokens = await RegistrationToken.getAllByCreator(createdBy);

      const tokensWithStatus = tokens.map(token => ({
        ...token,
        is_expired: new Date(token.expires_at) < new Date(),
        status: token.is_used ? 'usado' : (new Date(token.expires_at) < new Date() ? 'expirado' : 'disponible')
      }));

      res.json({
        success: true,
        data: tokensWithStatus
      });
    } catch (error) {
      console.error('Error fetching tokens:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener tokens',
        error: error.message
      });
    }
  }

  async getAllTokens(req, res) {
    try {
      const tokens = await RegistrationToken.getAll();

      const tokensWithStatus = tokens.map(token => ({
        ...token,
        is_expired: new Date(token.expires_at) < new Date(),
        status: token.is_used ? 'usado' : (new Date(token.expires_at) < new Date() ? 'expirado' : 'disponible')
      }));

      res.json({
        success: true,
        data: tokensWithStatus
      });
    } catch (error) {
      console.error('Error fetching all tokens:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener tokens',
        error: error.message
      });
    }
  }

  async validateToken(req, res) {
    try {
      const { token } = req.params;

      const isValid = await RegistrationToken.isTokenValid(token);

      if (!isValid) {
        const tokenData = await RegistrationToken.findByToken(token);
        let reason = 'Token no encontrado';

        if (tokenData) {
          if (tokenData.is_used) {
            reason = 'Token ya ha sido utilizado';
          } else if (new Date(tokenData.expires_at) < new Date()) {
            reason = 'Token ha expirado';
          }
        }

        return res.status(400).json({
          success: false,
          message: reason,
          valid: false
        });
      }

      res.json({
        success: true,
        message: 'Token válido',
        valid: true
      });
    } catch (error) {
      console.error('Error validating token:', error);
      res.status(500).json({
        success: false,
        message: 'Error al validar token',
        error: error.message
      });
    }
  }

  async deleteToken(req, res) {
    try {
      const { token_id } = req.params;
      const deleted = await RegistrationToken.deleteById(token_id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Token no encontrado' });
      }
      res.json({ success: true, message: 'Token eliminado exitosamente' });
    } catch (error) {
      console.error('Error deleting token:', error);
      res.status(500).json({ success: false, message: 'Error al eliminar token' });
    }
  }

  async revokeToken(req, res) {
    try {
      const { token } = req.params;

      const tokenData = await RegistrationToken.findByToken(token);
      if (!tokenData) {
        return res.status(404).json({
          success: false,
          message: 'Token no encontrado'
        });
      }

      await RegistrationToken.revoke(token);

      res.json({
        success: true,
        message: 'Token revocado exitosamente'
      });
    } catch (error) {
      console.error('Error revoking token:', error);
      res.status(500).json({
        success: false,
        message: 'Error al revocar token',
        error: error.message
      });
    }
  }
}

module.exports = new RegistrationTokenController();
