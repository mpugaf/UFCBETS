const { pool } = require('../config/database');

const leaderboardController = {
  async getEventLeaderboard(req, res) {
    const { eventId } = req.params;

    try {
      // Check if event exists
      const [eventRows] = await pool.execute(
        'SELECT event_id, event_name FROM dim_events WHERE event_id = ?',
        [eventId]
      );

      if (eventRows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Evento no encontrado'
        });
      }

      // Get leaderboard for this specific event only
      const [rows] = await pool.execute(
        `SELECT
          u.user_id,
          u.username,
          u.nickname,
          COUNT(ub.bet_id) as total_bets,
          SUM(CASE WHEN ub.status = 'won' THEN 1 ELSE 0 END) as correct_bets,
          SUM(CASE WHEN ub.status = 'lost' THEN 1 ELSE 0 END) as incorrect_bets,
          SUM(CASE WHEN ub.status = 'pending' THEN 1 ELSE 0 END) as pending_bets,
          COALESCE(SUM(uph.points_earned), 0) -
          COALESCE(SUM(CASE WHEN ub.status = 'lost' THEN ub.bet_amount ELSE 0 END), 0) as total_points,
          ROUND(
            SUM(CASE WHEN ub.status = 'won' THEN 1 ELSE 0 END) * 100.0 /
            NULLIF(SUM(CASE WHEN ub.status != 'pending' THEN 1 ELSE 0 END), 0),
            2
          ) as accuracy_percentage
        FROM users u
        LEFT JOIN user_bets ub ON u.user_id = ub.user_id AND ub.event_id = ?
        LEFT JOIN user_points_history uph ON ub.bet_id = uph.bet_id
        WHERE u.role = 'user'
        GROUP BY u.user_id, u.username, u.nickname
        ORDER BY total_points DESC, correct_bets DESC, accuracy_percentage DESC`,
        [eventId]
      );

      res.json({
        success: true,
        data: rows
      });
    } catch (error) {
      console.error('Error getting event leaderboard:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener clasificación del evento',
        error: error.message
      });
    }
  },

  async getYearlyLeaderboard(req, res) {
    const { year } = req.params;

    try {
      // Determine date range based on year
      let dateCondition;
      if (parseInt(year) === 2026) {
        // For 2026: from Dec 6, 2025 to Dec 31, 2026
        dateCondition = "e.event_date >= '2025-12-06' AND e.event_date <= '2026-12-31'";
      } else {
        // For other years: just use the year
        dateCondition = `YEAR(e.event_date) = ${parseInt(year)}`;
      }

      // Get leaderboard for the year using user_points_history
      const [rows] = await pool.execute(
        `SELECT
          u.user_id,
          u.username,
          u.nickname,
          COUNT(DISTINCT e.event_id) as events_participated,
          COUNT(ub.bet_id) as total_bets,
          SUM(CASE WHEN ub.status = 'won' THEN 1 ELSE 0 END) as correct_bets,
          SUM(CASE WHEN ub.status = 'lost' THEN 1 ELSE 0 END) as incorrect_bets,
          COALESCE(SUM(ub.bet_amount), 0) as total_invested,
          COALESCE(SUM(
            CASE
              WHEN ub.status = 'won' THEN ub.potential_return
              ELSE 0
            END
          ), 0) as total_return,
          COALESCE(SUM(uph.points_earned), 0) -
          COALESCE(SUM(CASE WHEN ub.status = 'lost' THEN ub.bet_amount ELSE 0 END), 0) as total_points,
          ROUND(
            SUM(CASE WHEN ub.status = 'won' THEN 1 ELSE 0 END) * 100.0 /
            NULLIF(COUNT(ub.bet_id), 0),
            2
          ) as accuracy_percentage
        FROM users u
        LEFT JOIN user_bets ub ON u.user_id = ub.user_id AND ub.status IN ('won', 'lost')
        LEFT JOIN fact_fights ff ON ub.fight_id = ff.fight_id
        LEFT JOIN dim_events e ON ff.event_id = e.event_id AND (${dateCondition})
        LEFT JOIN user_points_history uph ON ub.bet_id = uph.bet_id
        WHERE u.role = 'user'
        GROUP BY u.user_id, u.username, u.nickname
        ORDER BY total_points DESC, correct_bets DESC, accuracy_percentage DESC`
      );

      res.json({
        success: true,
        data: rows,
        year: parseInt(year)
      });
    } catch (error) {
      console.error('Error getting yearly leaderboard:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener clasificación anual',
        error: error.message
      });
    }
  },

  async getAvailableYears(req, res) {
    try {
      const [rows] = await pool.execute(
        `SELECT DISTINCT
           CASE
             WHEN e.event_date >= '2025-12-06' AND e.event_date <= '2026-12-31' THEN 2026
             ELSE YEAR(e.event_date)
           END as year
         FROM dim_events e
         INNER JOIN fact_fights ff ON e.event_id = ff.event_id
         INNER JOIN user_bets ub ON ff.fight_id = ub.fight_id
         ORDER BY year DESC`
      );

      res.json({
        success: true,
        data: rows.map(r => r.year)
      });
    } catch (error) {
      console.error('Error getting available years:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener años disponibles',
        error: error.message
      });
    }
  },

  async getUserStats(req, res) {
    const userId = req.user.userId;
    const currentYear = new Date().getFullYear();

    try {
      // Determine date condition based on year
      let dateCondition;
      if (currentYear === 2026) {
        // For 2026: from Dec 6, 2025 to Dec 31, 2026
        dateCondition = "e.event_date >= '2025-12-06' AND e.event_date <= '2026-12-31'";
      } else {
        // For other years: just use the year
        dateCondition = `YEAR(e.event_date) = ${currentYear}`;
      }

      // Get user points and ranking for current year (only among 'user' role)
      const [userStats] = await pool.execute(
        `SELECT
          user_id,
          username,
          total_points,
          ranking
        FROM (
          SELECT
            u.user_id,
            u.username,
            COALESCE(SUM(uph.points_earned), 0) -
            COALESCE(SUM(CASE WHEN ub.status = 'lost' THEN ub.bet_amount ELSE 0 END), 0) as total_points,
            ROW_NUMBER() OVER (ORDER BY
              COALESCE(SUM(uph.points_earned), 0) -
              COALESCE(SUM(CASE WHEN ub.status = 'lost' THEN ub.bet_amount ELSE 0 END), 0) DESC,
              SUM(CASE WHEN ub.status = 'won' THEN 1 ELSE 0 END) DESC
            ) as ranking
          FROM users u
          LEFT JOIN user_bets ub ON u.user_id = ub.user_id AND ub.status IN ('won', 'lost')
          LEFT JOIN fact_fights ff ON ub.fight_id = ff.fight_id
          LEFT JOIN dim_events e ON ff.event_id = e.event_id AND (${dateCondition})
          LEFT JOIN user_points_history uph ON ub.bet_id = uph.bet_id
          WHERE u.role = 'user'
          GROUP BY u.user_id, u.username
        ) as rankings
        WHERE user_id = ?`,
        [userId]
      );

      if (userStats.length === 0) {
        // User not found in ranking (could be admin or no bets)
        // Get user's total points separately
        const [pointsOnly] = await pool.execute(
          `SELECT
            COALESCE(SUM(uph.points_earned), 0) -
            COALESCE(SUM(CASE WHEN ub.status = 'lost' THEN ub.bet_amount ELSE 0 END), 0) as total_points
          FROM users u
          LEFT JOIN user_bets ub ON u.user_id = ub.user_id AND ub.status IN ('won', 'lost')
          LEFT JOIN fact_fights ff ON ub.fight_id = ff.fight_id
          LEFT JOIN dim_events e ON ff.event_id = e.event_id AND (${dateCondition})
          LEFT JOIN user_points_history uph ON ub.bet_id = uph.bet_id
          WHERE u.user_id = ?`,
          [userId]
        );

        return res.json({
          success: true,
          data: {
            total_points: parseFloat(pointsOnly[0]?.total_points) || 0,
            ranking: '-'
          }
        });
      }

      res.json({
        success: true,
        data: {
          total_points: parseFloat(userStats[0].total_points) || 0,
          ranking: userStats[0].ranking || '-'
        }
      });
    } catch (error) {
      console.error('Error getting user stats:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener estadísticas del usuario',
        error: error.message
      });
    }
  }
};

module.exports = leaderboardController;
