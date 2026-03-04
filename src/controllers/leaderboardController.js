const { pool } = require('../config/database');

const leaderboardController = {
  async getEventLeaderboard(req, res) {
    const { eventId } = req.params;

    try {
      const eId = parseInt(eventId);

      // Check if event exists
      const [eventRows] = await pool.execute(
        'SELECT event_id, event_name FROM dim_events WHERE event_id = ?',
        [eId]
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
        GROUP BY u.user_id, u.username, u.nickname, u.created_at
        ORDER BY total_points DESC, u.created_at ASC`,
        [eId]
      );

      // Check if all fights in this event have a result
      const [pendingRows] = await pool.execute(
        `SELECT COUNT(*) as pending_fights
         FROM fact_fights
         WHERE event_id = ? AND result_type_code IS NULL`,
        [eId]
      );
      const eventResolved = parseInt(pendingRows[0].pending_fights) === 0;

      // Winner message — resilient: columns may not exist yet if migration pending
      let winnerMessage = null;
      try {
        const [msgRows] = await pool.execute(
          `SELECT e.winner_user_id AS user_id, e.winner_message AS message,
                  u.username, u.nickname
           FROM dim_events e
           LEFT JOIN users u ON e.winner_user_id = u.user_id
           WHERE e.event_id = ? AND e.winner_message IS NOT NULL`,
          [eId]
        );
        if (msgRows.length > 0) winnerMessage = msgRows[0];
      } catch (_) { /* columns don't exist yet — migration pending */ }

      res.json({
        success: true,
        data: rows,
        event_resolved: eventResolved,
        winner_message: winnerMessage
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
        GROUP BY u.user_id, u.username, u.nickname, u.created_at
        ORDER BY total_points DESC, u.created_at ASC`
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
              u.created_at ASC
            ) as ranking
          FROM users u
          LEFT JOIN user_bets ub ON u.user_id = ub.user_id AND ub.status IN ('won', 'lost')
          LEFT JOIN fact_fights ff ON ub.fight_id = ff.fight_id
          LEFT JOIN dim_events e ON ff.event_id = e.event_id AND (${dateCondition})
          LEFT JOIN user_points_history uph ON ub.bet_id = uph.bet_id
          WHERE u.role = 'user'
          GROUP BY u.user_id, u.username, u.created_at
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
  },

  async getAllWinnerMessages(req, res) {
    try {
      const [rows] = await pool.execute(
        `SELECT e.event_id, e.event_name, e.event_date,
                e.winner_user_id AS user_id, e.winner_message AS message,
                u.username, u.nickname
         FROM dim_events e
         LEFT JOIN users u ON e.winner_user_id = u.user_id
         WHERE e.winner_message IS NOT NULL
         ORDER BY e.event_date DESC`
      );
      res.json({ success: true, data: rows });
    } catch (error) {
      console.error('Error getting all winner messages:', error);
      res.json({ success: true, data: [] });
    }
  },

  async saveWinnerMessage(req, res) {
    const { eventId } = req.params;
    const { message } = req.body;
    const userId = req.user.userId;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'El mensaje no puede estar vacío' });
    }
    if (message.trim().length > 500) {
      return res.status(400).json({ success: false, message: 'El mensaje no puede superar los 500 caracteres' });
    }

    try {
      const eId = parseInt(eventId);

      // Check event exists
      const [eventRows] = await pool.execute(
        'SELECT event_id FROM dim_events WHERE event_id = ?',
        [eId]
      );
      if (eventRows.length === 0) {
        return res.status(404).json({ success: false, message: 'Evento no encontrado' });
      }

      // Get the winner (1st place) for this event
      const [leaderRows] = await pool.execute(
        `SELECT u.user_id
         FROM users u
         LEFT JOIN user_bets ub ON u.user_id = ub.user_id AND ub.event_id = ?
         LEFT JOIN user_points_history uph ON ub.bet_id = uph.bet_id
         WHERE u.role = 'user'
         GROUP BY u.user_id, u.created_at
         ORDER BY
           COALESCE(SUM(uph.points_earned), 0) -
           COALESCE(SUM(CASE WHEN ub.status = 'lost' THEN ub.bet_amount ELSE 0 END), 0) DESC,
           u.created_at ASC
         LIMIT 1`,
        [eId]
      );

      if (leaderRows.length === 0) {
        return res.status(403).json({ success: false, message: 'No hay datos para este evento' });
      }

      if (parseInt(leaderRows[0].user_id) !== parseInt(userId)) {
        return res.status(403).json({ success: false, message: 'Solo el ganador del evento puede publicar un mensaje' });
      }

      // Validate all fights have a result
      const [pendingRows] = await pool.execute(
        `SELECT COUNT(*) as pending_fights
         FROM fact_fights
         WHERE event_id = ? AND result_type_code IS NULL`,
        [eId]
      );
      if (parseInt(pendingRows[0].pending_fights) > 0) {
        return res.status(403).json({
          success: false,
          message: 'No se puede publicar el mensaje hasta que todas las peleas tengan resultado'
        });
      }

      const uId = parseInt(userId);

      // Single UPDATE on dim_events — requires migration 2026-02-23-add-winner-message-to-events.sql
      try {
        await pool.execute(
          'UPDATE dim_events SET winner_message = ?, winner_user_id = ? WHERE event_id = ?',
          [message.trim(), uId, eId]
        );
      } catch (dbErr) {
        if (dbErr.code === 'ER_BAD_FIELD_ERROR') {
          return res.status(503).json({
            success: false,
            message: 'Migración pendiente: ejecuta 2026-02-23-add-winner-message-to-events.sql en la BD'
          });
        }
        throw dbErr;
      }

      const [saved] = await pool.execute(
        `SELECT e.winner_user_id AS user_id, e.winner_message AS message,
                u.username, u.nickname
         FROM dim_events e
         LEFT JOIN users u ON e.winner_user_id = u.user_id
         WHERE e.event_id = ?`,
        [eId]
      );

      res.json({ success: true, data: saved[0] });
    } catch (error) {
      console.error('Error saving winner message:', error);
      res.status(500).json({ success: false, message: 'Error al guardar el mensaje', error: error.message });
    }
  }
};

module.exports = leaderboardController;
