const { pool } = require('../config/database');
const crypto = require('crypto');

class InvitationsController {
  /**
   * Genera un token único de invitación
   * Solo admins pueden generar tokens
   */
  async generateToken(req, res) {
    try {
      const adminId = req.user.userId;
      const { email, notes, expirationDays = 7 } = req.body;

      // Verificar que el usuario sea admin
      const [userRows] = await pool.execute(
        'SELECT role FROM users WHERE user_id = ?',
        [adminId]
      );

      if (userRows.length === 0 || userRows[0].role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Solo administradores pueden generar invitaciones'
        });
      }

      // Email siempre será null para links de uso único sin vinculación

      // Generar token único
      const token = crypto.randomBytes(32).toString('hex');

      // Calcular fecha de expiración
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expirationDays);

      // Insertar token en BD
      const [result] = await pool.execute(
        `INSERT INTO invitation_tokens (token, email, created_by, expires_at, notes)
         VALUES (?, ?, ?, ?, ?)`,
        [token, email || null, adminId, expiresAt, notes || null]
      );

      // Construir URL de invitación
      const invitationUrl = `${process.env.FRONTEND_URL || 'http://192.168.100.16:5173'}/register/${token}`;

      res.json({
        success: true,
        message: 'Token de invitación generado exitosamente',
        data: {
          token_id: result.insertId,
          token,
          invitation_url: invitationUrl,
          email,
          expires_at: expiresAt,
          notes
        }
      });
    } catch (error) {
      console.error('Generate token error:', error);
      res.status(500).json({
        success: false,
        message: 'Error al generar token de invitación',
        error: error.message
      });
    }
  }

  /**
   * Valida un token de invitación
   * Público - no requiere autenticación
   */
  async validateToken(req, res) {
    try {
      const { token } = req.params;

      const [rows] = await pool.execute(
        `SELECT
          it.token_id,
          it.token,
          it.email,
          it.expires_at,
          it.used_at,
          it.revoked_at,
          u.username as created_by_username
         FROM invitation_tokens it
         JOIN users u ON it.created_by = u.user_id
         WHERE it.token = ?`,
        [token]
      );

      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Token de invitación no válido',
          reason: 'not_found'
        });
      }

      const tokenData = rows[0];

      // Verificar si ya fue usado
      if (tokenData.used_at) {
        return res.status(400).json({
          success: false,
          message: 'Este token de invitación ya fue utilizado',
          reason: 'already_used'
        });
      }

      // Verificar si fue revocado
      if (tokenData.revoked_at) {
        return res.status(400).json({
          success: false,
          message: 'Este token de invitación fue revocado',
          reason: 'revoked'
        });
      }

      // Verificar si expiró
      const now = new Date();
      const expiresAt = new Date(tokenData.expires_at);
      if (now > expiresAt) {
        return res.status(400).json({
          success: false,
          message: 'Este token de invitación ha expirado',
          reason: 'expired',
          expired_at: tokenData.expires_at
        });
      }

      // Token válido
      res.json({
        success: true,
        message: 'Token válido',
        data: {
          email: tokenData.email,
          expires_at: tokenData.expires_at
        }
      });
    } catch (error) {
      console.error('Validate token error:', error);
      res.status(500).json({
        success: false,
        message: 'Error al validar token',
        error: error.message
      });
    }
  }

  /**
   * Lista todas las invitaciones
   * Solo para admins
   */
  async listInvitations(req, res) {
    try {
      const adminId = req.user.userId;
      const { status = 'all' } = req.query; // all, pending, used, expired, revoked

      // Verificar que el usuario sea admin
      const [userRows] = await pool.execute(
        'SELECT role FROM users WHERE user_id = ?',
        [adminId]
      );

      if (userRows.length === 0 || userRows[0].role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Solo administradores pueden ver invitaciones'
        });
      }

      let whereClause = '1=1';
      if (status === 'pending') {
        whereClause = 'it.used_at IS NULL AND it.revoked_at IS NULL AND it.expires_at > NOW()';
      } else if (status === 'used') {
        whereClause = 'it.used_at IS NOT NULL';
      } else if (status === 'expired') {
        whereClause = 'it.used_at IS NULL AND it.revoked_at IS NULL AND it.expires_at <= NOW()';
      } else if (status === 'revoked') {
        whereClause = 'it.revoked_at IS NOT NULL';
      }

      const [rows] = await pool.execute(
        `SELECT
          it.token_id,
          it.token,
          it.email,
          it.created_at,
          it.expires_at,
          it.used_at,
          it.revoked_at,
          it.notes,
          creator.username as created_by_username,
          creator.nickname as created_by_nickname,
          CASE
            WHEN it.revoked_at IS NOT NULL THEN 'revoked'
            WHEN it.used_at IS NOT NULL THEN 'used'
            WHEN it.expires_at <= NOW() THEN 'expired'
            ELSE 'pending'
          END as status,
          used_user.username as used_by_username,
          used_user.nickname as used_by_nickname
         FROM invitation_tokens it
         JOIN users creator ON it.created_by = creator.user_id
         LEFT JOIN users used_user ON it.used_by = used_user.user_id
         WHERE ${whereClause}
         ORDER BY it.created_at DESC`
      );

      res.json({
        success: true,
        data: rows
      });
    } catch (error) {
      console.error('List invitations error:', error);
      res.status(500).json({
        success: false,
        message: 'Error al listar invitaciones',
        error: error.message
      });
    }
  }

  /**
   * Revoca un token de invitación
   * Solo para admins
   */
  async revokeToken(req, res) {
    try {
      const adminId = req.user.userId;
      const { tokenId } = req.params;

      // Verificar que el usuario sea admin
      const [userRows] = await pool.execute(
        'SELECT role FROM users WHERE user_id = ?',
        [adminId]
      );

      if (userRows.length === 0 || userRows[0].role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Solo administradores pueden revocar invitaciones'
        });
      }

      // Verificar que el token existe y no ha sido usado
      const [tokenRows] = await pool.execute(
        'SELECT token_id, used_at, revoked_at FROM invitation_tokens WHERE token_id = ?',
        [tokenId]
      );

      if (tokenRows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Token no encontrado'
        });
      }

      const token = tokenRows[0];

      if (token.used_at) {
        return res.status(400).json({
          success: false,
          message: 'No se puede revocar un token que ya fue usado'
        });
      }

      if (token.revoked_at) {
        return res.status(400).json({
          success: false,
          message: 'Este token ya fue revocado previamente'
        });
      }

      // Revocar token
      await pool.execute(
        'UPDATE invitation_tokens SET revoked_at = NOW(), revoked_by = ? WHERE token_id = ?',
        [adminId, tokenId]
      );

      res.json({
        success: true,
        message: 'Token revocado exitosamente'
      });
    } catch (error) {
      console.error('Revoke token error:', error);
      res.status(500).json({
        success: false,
        message: 'Error al revocar token',
        error: error.message
      });
    }
  }

  /**
   * Obtiene estadísticas de invitaciones
   * Solo para admins
   */
  async getStats(req, res) {
    try {
      const adminId = req.user.userId;

      // Verificar que el usuario sea admin
      const [userRows] = await pool.execute(
        'SELECT role FROM users WHERE user_id = ?',
        [adminId]
      );

      if (userRows.length === 0 || userRows[0].role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Solo administradores pueden ver estadísticas'
        });
      }

      const [stats] = await pool.execute(`
        SELECT
          COUNT(*) as total,
          SUM(CASE WHEN used_at IS NOT NULL THEN 1 ELSE 0 END) as used,
          SUM(CASE WHEN used_at IS NULL AND revoked_at IS NULL AND expires_at > NOW() THEN 1 ELSE 0 END) as pending,
          SUM(CASE WHEN used_at IS NULL AND revoked_at IS NULL AND expires_at <= NOW() THEN 1 ELSE 0 END) as expired,
          SUM(CASE WHEN revoked_at IS NOT NULL THEN 1 ELSE 0 END) as revoked
        FROM invitation_tokens
      `);

      res.json({
        success: true,
        data: stats[0]
      });
    } catch (error) {
      console.error('Get stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener estadísticas',
        error: error.message
      });
    }
  }
}

module.exports = new InvitationsController();
