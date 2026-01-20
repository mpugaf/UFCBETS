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
