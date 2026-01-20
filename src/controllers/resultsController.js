const { pool } = require('../config/database');

const resultsController = {
  async updateFightResult(req, res) {
    const { fightId } = req.params;
    const { winner_id, result_type } = req.body;

    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // Validate result_type
      if (!['fighter_win', 'draw', 'no_contest'].includes(result_type)) {
        return res.status(400).json({
          success: false,
          message: 'result_type debe ser "fighter_win", "draw" o "no_contest"'
        });
      }

      // Validate fighter if result_type is fighter_win
      if (result_type === 'fighter_win' && !winner_id) {
        return res.status(400).json({
          success: false,
          message: 'winner_id es requerido cuando result_type es "fighter_win"'
        });
      }

      // Get fight details
      const [fightRows] = await connection.execute(
        `SELECT fighter_red_id, fighter_blue_id FROM fact_fights WHERE fight_id = ?`,
        [fightId]
      );

      if (fightRows.length === 0) {
        await connection.rollback();
        return res.status(404).json({
          success: false,
          message: 'Pelea no encontrada'
        });
      }

      const fight = fightRows[0];

      // Validate winner is one of the fighters
      if (result_type === 'fighter_win' &&
          winner_id !== fight.fighter_red_id &&
          winner_id !== fight.fighter_blue_id) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: 'El ganador debe ser uno de los peleadores de la pelea'
        });
      }

      // Update fight result
      const finalWinnerId = (result_type === 'draw' || result_type === 'no_contest') ? null : winner_id;
      const finalResultType = result_type; // 'fighter_win', 'draw', 'no_contest'

      await connection.execute(
        `UPDATE fact_fights
         SET winner_id = ?, result_type_code = ?
         WHERE fight_id = ?`,
        [finalWinnerId, finalResultType, fightId]
      );

      // Get event_id for this fight
      const [eventRows] = await connection.execute(
        'SELECT event_id FROM fact_fights WHERE fight_id = ?',
        [fightId]
      );
      const event_id = eventRows[0].event_id;

      // Update user bets status based on result
      if (result_type === 'fighter_win') {
        // Mark correct fighter predictions as won
        await connection.execute(
          `UPDATE user_bets
           SET status = 'won'
           WHERE fight_id = ?
           AND bet_type = 'fighter_win'
           AND predicted_winner_id = ?`,
          [fightId, winner_id]
        );

        // Get winning bets to record points
        const [winningBets] = await connection.execute(
          `SELECT bet_id, user_id, bet_amount, odds_value,
                  (bet_amount * odds_value) as points_earned
           FROM user_bets
           WHERE fight_id = ?
           AND bet_type = 'fighter_win'
           AND predicted_winner_id = ?
           AND status = 'won'`,
          [fightId, winner_id]
        );

        // Insert points history records (using INSERT IGNORE to avoid duplicates)
        for (const bet of winningBets) {
          await connection.execute(
            `INSERT IGNORE INTO user_points_history
             (user_id, bet_id, fight_id, event_id, points_earned)
             VALUES (?, ?, ?, ?, ?)`,
            [bet.user_id, bet.bet_id, fightId, event_id, bet.points_earned]
          );
        }

        // Mark incorrect fighter predictions and draw predictions as lost
        await connection.execute(
          `UPDATE user_bets
           SET status = 'lost'
           WHERE fight_id = ?
           AND (
             (bet_type = 'fighter_win' AND predicted_winner_id != ?)
             OR bet_type = 'draw' OR bet_type = 'no_contest'
           )`,
          [fightId, winner_id]
        );
      } else if (result_type === 'draw') {
        // Draw result
        // Mark draw predictions as won
        await connection.execute(
          `UPDATE user_bets
           SET status = 'won'
           WHERE fight_id = ?
           AND bet_type = 'draw'`,
          [fightId]
        );

        // Get winning draw bets to record points
        const [drawBets] = await connection.execute(
          `SELECT bet_id, user_id, bet_amount, odds_value,
                  (bet_amount * odds_value) as points_earned
           FROM user_bets
           WHERE fight_id = ?
           AND bet_type = 'draw'
           AND status = 'won'`,
          [fightId]
        );

        // Insert points history records (using INSERT IGNORE to avoid duplicates)
        for (const bet of drawBets) {
          await connection.execute(
            `INSERT IGNORE INTO user_points_history
             (user_id, bet_id, fight_id, event_id, points_earned)
             VALUES (?, ?, ?, ?, ?)`,
            [bet.user_id, bet.bet_id, fightId, event_id, bet.points_earned]
          );
        }

        // Mark fighter predictions as lost
        await connection.execute(
          `UPDATE user_bets
           SET status = 'lost'
           WHERE fight_id = ?
           AND (bet_type = 'fighter_win' OR bet_type = 'no_contest')`,
          [fightId]
        );
      } else if (result_type === 'no_contest') {
        // No Contest - All bets are returned (set to pending/void)
        await connection.execute(
          `UPDATE user_bets
           SET status = 'pending'
           WHERE fight_id = ?`,
          [fightId]
        );

        // Remove any points previously awarded for this fight
        await connection.execute(
          'DELETE FROM user_points_history WHERE fight_id = ?',
          [fightId]
        );
        // No points awarded or deducted for no contest
      }

      await connection.commit();

      res.json({
        success: true,
        message: 'Resultado actualizado exitosamente'
      });
    } catch (error) {
      await connection.rollback();
      console.error('Error updating fight result:', error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar resultado'
      });
    } finally {
      connection.release();
    }
  },

  async getFightResults(req, res) {
    const { eventId } = req.params;

    try {
      const [rows] = await pool.execute(
        `SELECT
          ff.fight_id,
          ff.winner_id,
          ff.result_type_code as result_type,
          fc.category_name,
          fc.category_code,
          wc.class_name as weight_class_name,
          ff.is_title_fight,
          fr.fighter_name as red_fighter_name,
          fr.fighter_id as red_fighter_id,
          fb.fighter_name as blue_fighter_name,
          fb.fighter_id as blue_fighter_id,
          fw.fighter_name as winner_name
        FROM fact_fights ff
        JOIN dim_weight_classes wc ON ff.weight_class_id = wc.weight_class_id
        LEFT JOIN dim_fight_categories fc ON ff.fight_category_id = fc.category_id
        JOIN dim_fighters fr ON ff.fighter_red_id = fr.fighter_id
        JOIN dim_fighters fb ON ff.fighter_blue_id = fb.fighter_id
        LEFT JOIN dim_fighters fw ON ff.winner_id = fw.fighter_id
        WHERE ff.event_id = ?
        ORDER BY fc.display_order, ff.display_order ASC, ff.fight_id`,
        [eventId]
      );

      res.json({
        success: true,
        data: rows
      });
    } catch (error) {
      console.error('Error getting fight results:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener resultados'
      });
    }
  }
};

module.exports = resultsController;
