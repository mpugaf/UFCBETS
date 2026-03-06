const { pool } = require('../config/database');

class UsersController {
  // Get all users with their betting status
  async getAllUsers(req, res) {
    try {
      const query = `
        SELECT
          u.user_id,
          u.username,
          u.nickname,
          u.email,
          u.role,
          u.can_bet,
          u.is_active,
          u.created_at,
          c.country_name,
          COUNT(DISTINCT ub.bet_id) as total_bets,
          COUNT(DISTINCT CASE WHEN ub.status = 'won' THEN ub.bet_id END) as correct_bets,
          COALESCE((SELECT SUM(points_earned) FROM user_points_history WHERE user_id = u.user_id), 0) as total_points
        FROM users u
        LEFT JOIN dim_countries c ON u.country_id = c.country_id
        LEFT JOIN user_bets ub ON u.user_id = ub.user_id
        GROUP BY u.user_id, u.username, u.nickname, u.email, u.role, u.can_bet, u.created_at, c.country_name
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
        message: 'Error al obtener usuarios',
        error: error.message
      });
    }
  }

  // Toggle user betting permission
  async toggleUserBetting(req, res) {
    try {
      const { userId } = req.params;
      const { can_bet } = req.body;

      if (typeof can_bet !== 'boolean') {
        return res.status(400).json({
          success: false,
          message: 'El campo can_bet debe ser un booleano'
        });
      }

      await pool.execute(
        'UPDATE users SET can_bet = ? WHERE user_id = ?',
        [can_bet, userId]
      );

      res.json({
        success: true,
        message: `Permisos de apuestas ${can_bet ? 'habilitados' : 'deshabilitados'} para el usuario`,
        data: { user_id: userId, can_bet }
      });
    } catch (error) {
      console.error('Toggle user betting error:', error);
      res.status(500).json({
        success: false,
        message: 'Error al modificar permisos de apuestas',
        error: error.message
      });
    }
  }

  // Toggle user active status (enable/disable account)
  async toggleUserStatus(req, res) {
    try {
      const { userId } = req.params;
      const { is_active } = req.body;

      if (typeof is_active !== 'boolean') {
        return res.status(400).json({
          success: false,
          message: 'El campo is_active debe ser un booleano'
        });
      }

      await pool.execute(
        'UPDATE users SET is_active = ? WHERE user_id = ?',
        [is_active, userId]
      );

      res.json({
        success: true,
        message: `Cuenta ${is_active ? 'habilitada' : 'deshabilitada'} correctamente`,
        data: { user_id: userId, is_active }
      });
    } catch (error) {
      console.error('Toggle user status error:', error);
      res.status(500).json({
        success: false,
        message: 'Error al modificar estado del usuario',
        error: error.message
      });
    }
  }

  // Get users for invite manager, ordered by total_points DESC (admin only)
  async getUsersForInviteManager(req, res) {
    try {
      const [users] = await pool.execute(`
        SELECT
          u.user_id,
          u.username,
          u.nickname,
          u.can_share_invite,
          u.invite_token_id,
          rt.token as invite_token,
          rt.expires_at as invite_expires_at,
          COALESCE((SELECT SUM(points_earned) FROM user_points_history WHERE user_id = u.user_id), 0) as total_points,
          COUNT(DISTINCT CASE WHEN ub.status = 'won' THEN ub.bet_id END) as correct_bets,
          COUNT(DISTINCT ub.bet_id) as total_bets
        FROM users u
        LEFT JOIN registration_tokens rt ON u.invite_token_id = rt.token_id
        LEFT JOIN user_bets ub ON u.user_id = ub.user_id
        WHERE u.role = 'user' AND u.is_active = TRUE
        GROUP BY u.user_id, u.username, u.nickname, u.can_share_invite, u.invite_token_id, rt.token, rt.expires_at
        ORDER BY total_points DESC
      `);

      res.json({ success: true, data: users });
    } catch (error) {
      console.error('Get users for invite manager error:', error);
      res.status(500).json({ success: false, message: 'Error al obtener usuarios', error: error.message });
    }
  }

  // Toggle invite token visibility for a user (admin only)
  // If no token assigned yet, creates one. Toggling only changes can_share_invite.
  async toggleUserInvite(req, res) {
    const conn = await pool.getConnection();
    try {
      const { userId } = req.params;
      const adminId = req.user.userId;

      const [[user]] = await conn.execute(
        'SELECT invite_token_id, can_share_invite FROM users WHERE user_id = ? AND role = "user"',
        [userId]
      );
      if (!user) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });

      const newValue = !user.can_share_invite;

      if (newValue && !user.invite_token_id) {
        // Crear token nuevo y asignarlo
        const crypto = require('crypto');
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date();
        expiresAt.setFullYear(expiresAt.getFullYear() + 1); // expira en 1 año

        const [result] = await conn.execute(
          'INSERT INTO registration_tokens (token, created_by, expires_at) VALUES (?, ?, ?)',
          [token, adminId, expiresAt]
        );
        await conn.execute(
          'UPDATE users SET invite_token_id = ?, can_share_invite = TRUE WHERE user_id = ?',
          [result.insertId, userId]
        );

        conn.release();
        return res.json({ success: true, data: { can_share_invite: true, invite_token: token } });
      }

      await conn.execute(
        'UPDATE users SET can_share_invite = ? WHERE user_id = ?',
        [newValue, userId]
      );

      conn.release();
      res.json({ success: true, data: { can_share_invite: newValue } });
    } catch (error) {
      conn.release();
      console.error('Toggle user invite error:', error);
      res.status(500).json({ success: false, message: 'Error al modificar token de invitación', error: error.message });
    }
  }

  // Reset betting for all users (admin only)
  async resetAllUsersBetting(req, res) {
    try {
      await pool.execute('UPDATE users SET can_bet = TRUE WHERE role = "user"');

      res.json({
        success: true,
        message: 'Permisos de apuestas restablecidos para todos los usuarios'
      });
    } catch (error) {
      console.error('Reset all users betting error:', error);
      res.status(500).json({
        success: false,
        message: 'Error al restablecer permisos',
        error: error.message
      });
    }
  }
}

module.exports = new UsersController();
