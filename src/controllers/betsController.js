const { pool } = require('../config/database');
const Config = require('../models/Config');

class BetsController {
  async getAvailableFights(req, res) {
    try {
      const bettingEnabled = await Config.isBettingEnabled();
      const currentEventId = await Config.getCurrentEventId();

      if (!bettingEnabled || !currentEventId) {
        return res.json({
          success: true,
          data: {
            betting_enabled: false,
            fights: []
          }
        });
      }

      const query = `
        SELECT
          ff.fight_id, ff.is_title_fight, ff.is_main_event,
          e.event_name, e.event_date,
          wc.class_name as weight_class_name,
          fr.fighter_id as red_fighter_id, fr.fighter_name as red_fighter_name, fr.image_path as red_fighter_image,
          fb.fighter_id as blue_fighter_id, fb.fighter_name as blue_fighter_name, fb.image_path as blue_fighter_image,
          (SELECT decimal_odds FROM betting_odds WHERE fight_id = ff.fight_id AND fighter_id = ff.fighter_red_id AND outcome_type = 'fighter' LIMIT 1) as red_odds,
          (SELECT decimal_odds FROM betting_odds WHERE fight_id = ff.fight_id AND fighter_id = ff.fighter_blue_id AND outcome_type = 'fighter' LIMIT 1) as blue_odds,
          (SELECT decimal_odds FROM betting_odds WHERE fight_id = ff.fight_id AND outcome_type = 'draw' LIMIT 1) as draw_odds
        FROM fact_fights ff
        JOIN dim_events e ON ff.event_id = e.event_id
        LEFT JOIN dim_weight_classes wc ON ff.weight_class_id = wc.weight_class_id
        JOIN dim_fighters fr ON ff.fighter_red_id = fr.fighter_id
        JOIN dim_fighters fb ON ff.fighter_blue_id = fb.fighter_id
        WHERE ff.event_id = ? AND ff.winner_id IS NULL
        ORDER BY ff.is_main_event DESC, ff.is_co_main_event DESC, ff.fight_id
      `;

      const [fights] = await pool.execute(query, [currentEventId]);

      res.json({
        success: true,
        data: {
          betting_enabled: true,
          current_event_id: currentEventId,
          fights
        }
      });
    } catch (error) {
      console.error('Get available fights error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching available fights',
        error: error.message
      });
    }
  }

  async placeBet(req, res) {
    try {
      const userId = req.user.userId;
      const { fight_id, predicted_winner_id, bet_amount } = req.body;

      // Check if betting is enabled
      const bettingEnabled = await Config.isBettingEnabled();
      if (!bettingEnabled) {
        return res.status(403).json({
          success: false,
          message: 'Betting is currently closed'
        });
      }

      // Get fight and odds info
      const [fightRows] = await pool.execute(`
        SELECT ff.*, bo.decimal_odds
        FROM fact_fights ff
        LEFT JOIN betting_odds bo ON ff.fight_id = bo.fight_id AND bo.fighter_id = ?
        WHERE ff.fight_id = ? AND ff.winner_id IS NULL
      `, [predicted_winner_id, fight_id]);

      if (fightRows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Fight not found or betting is closed for this fight'
        });
      }

      const fight = fightRows[0];
      const odds = fight.decimal_odds || 1.5;
      const potential_return = (bet_amount * odds).toFixed(2);

      // Check if user already has a bet for this fight
      const [existingBets] = await pool.execute(
        'SELECT bet_id FROM user_bets WHERE user_id = ? AND fight_id = ?',
        [userId, fight_id]
      );

      if (existingBets.length > 0) {
        // Update existing bet
        await pool.execute(`
          UPDATE user_bets
          SET predicted_winner_id = ?, bet_amount = ?, potential_return = ?, odds_value = ?
          WHERE user_id = ? AND fight_id = ?
        `, [predicted_winner_id, bet_amount, potential_return, odds, userId, fight_id]);
      } else {
        // Create new bet
        await pool.execute(`
          INSERT INTO user_bets (user_id, fight_id, predicted_winner_id, bet_amount, potential_return, odds_value)
          VALUES (?, ?, ?, ?, ?, ?)
        `, [userId, fight_id, predicted_winner_id, bet_amount, potential_return, odds]);
      }

      res.json({
        success: true,
        message: 'Bet placed successfully',
        data: {
          fight_id,
          predicted_winner_id,
          bet_amount,
          odds_value: odds,
          potential_return
        }
      });
    } catch (error) {
      console.error('Place bet error:', error);
      res.status(500).json({
        success: false,
        message: 'Error placing bet',
        error: error.message
      });
    }
  }

  async getUserBets(req, res) {
    try {
      const userId = req.user.userId;

      const query = `
        SELECT
          ub.*,
          ff.fight_id, ff.is_title_fight,
          e.event_name, e.event_date,
          wc.class_name as weight_class_name,
          fr.fighter_id as red_fighter_id, fr.fighter_name as red_fighter_name,
          fb.fighter_id as blue_fighter_id, fb.fighter_name as blue_fighter_name,
          pw.fighter_name as predicted_winner_name,
          w.fighter_name as actual_winner_name
        FROM user_bets ub
        JOIN fact_fights ff ON ub.fight_id = ff.fight_id
        JOIN dim_events e ON ff.event_id = e.event_id
        LEFT JOIN dim_weight_classes wc ON ff.weight_class_id = wc.weight_class_id
        JOIN dim_fighters fr ON ff.fighter_red_id = fr.fighter_id
        JOIN dim_fighters fb ON ff.fighter_blue_id = fb.fighter_id
        JOIN dim_fighters pw ON ub.predicted_winner_id = pw.fighter_id
        LEFT JOIN dim_fighters w ON ff.winner_id = w.fighter_id
        WHERE ub.user_id = ?
        ORDER BY e.event_date DESC, ub.created_at DESC
      `;

      const [bets] = await pool.execute(query, [userId]);

      res.json({
        success: true,
        data: bets
      });
    } catch (error) {
      console.error('Get user bets error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching user bets',
        error: error.message
      });
    }
  }

  async submitAllBets(req, res) {
    const connection = await pool.getConnection();
    try {
      const userId = req.user.userId;
      const { bets } = req.body;

      if (!Array.isArray(bets) || bets.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Se requiere un array de apuestas'
        });
      }

      const bettingEnabled = await Config.isBettingEnabled();
      if (!bettingEnabled) {
        return res.status(403).json({
          success: false,
          message: 'Las apuestas est\u00e1n cerradas actualmente'
        });
      }

      await connection.beginTransaction();

      const results = [];

      for (const bet of bets) {
        const { fight_id, bet_type, predicted_winner_id, odds_value } = bet;

        if (!fight_id || !bet_type || !odds_value) {
          throw new Error(`Datos de apuesta incompletos para fight_id ${fight_id}`);
        }

        if (bet_type === 'fighter_win' && !predicted_winner_id) {
          throw new Error(`predicted_winner_id requerido para apuesta de tipo fighter_win`);
        }

        const [fightRows] = await connection.execute(
          'SELECT fight_id FROM fact_fights WHERE fight_id = ? AND winner_id IS NULL',
          [fight_id]
        );

        if (fightRows.length === 0) {
          throw new Error(`Pelea ${fight_id} no encontrada o las apuestas est\u00e1n cerradas`);
        }

        const bet_amount = 100;
        const potential_return = (bet_amount * odds_value).toFixed(2);

        const [existingBets] = await connection.execute(
          'SELECT bet_id FROM user_bets WHERE user_id = ? AND fight_id = ?',
          [userId, fight_id]
        );

        if (existingBets.length > 0) {
          await connection.execute(`
            UPDATE user_bets
            SET bet_type = ?, predicted_winner_id = ?, bet_amount = ?, potential_return = ?, odds_value = ?
            WHERE user_id = ? AND fight_id = ?
          `, [bet_type, predicted_winner_id, bet_amount, potential_return, odds_value, userId, fight_id]);
          results.push({ fight_id, action: 'updated' });
        } else {
          await connection.execute(`
            INSERT INTO user_bets (user_id, fight_id, bet_type, predicted_winner_id, bet_amount, potential_return, odds_value)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `, [userId, fight_id, bet_type, predicted_winner_id, bet_amount, potential_return, odds_value]);
          results.push({ fight_id, action: 'created' });
        }
      }

      await connection.commit();

      res.json({
        success: true,
        message: `${results.length} apuestas procesadas exitosamente`,
        data: results
      });
    } catch (error) {
      await connection.rollback();
      console.error('Submit all bets error:', error);
      res.status(500).json({
        success: false,
        message: 'Error al procesar apuestas',
        error: error.message
      });
    } finally {
      connection.release();
    }
  }
}

module.exports = new BetsController();
