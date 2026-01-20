const { pool } = require('../config/database');
const Config = require('../models/Config');
const FightCategory = require('../models/FightCategory');

class BetsController {
  async getAllEvents(req, res) {
    try {
      const userId = req.user.userId;

      // Get all events with fights
      // Special rule: Event from Dec 6, 2025 is considered valid until Jan 23, 2026
      const query = `
        SELECT DISTINCT
          e.event_id,
          e.event_name,
          e.event_date,
          e.venue,
          e.city,
          e.state,
          COUNT(DISTINCT ff.fight_id) as total_fights,
          COUNT(DISTINCT CASE WHEN ff.winner_id IS NULL AND (ff.result_type_code IS NULL OR ff.result_type_code = '') THEN ff.fight_id END) as pending_fights,
          COUNT(DISTINCT ub.bet_id) as user_bets,
          CASE
            WHEN e.event_date = '2025-12-06' AND CURDATE() <= '2026-01-23' THEN 'upcoming'
            WHEN e.event_date > CURDATE() THEN 'upcoming'
            WHEN e.event_date = CURDATE() THEN 'today'
            ELSE 'past'
          END as event_status
        FROM dim_events e
        LEFT JOIN fact_fights ff ON e.event_id = ff.event_id
        LEFT JOIN user_bets ub ON ff.fight_id = ub.fight_id AND ub.user_id = ?
        GROUP BY e.event_id, e.event_name, e.event_date, e.venue, e.city, e.state
        HAVING total_fights > 0
        ORDER BY e.event_date DESC
      `;

      const [events] = await pool.execute(query, [userId]);

      res.json({
        success: true,
        data: events
      });
    } catch (error) {
      console.error('Get all events error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching events',
        error: error.message
      });
    }
  }

  async getAvailableFights(req, res) {
    try {
      console.log('=== getAvailableFights called ===');
      console.log('Query params:', req.query);

      const userId = req.user.userId;
      const bettingEnabled = await Config.isBettingEnabled();
      const currentEventId = await Config.getCurrentEventId();
      console.log('Betting enabled:', bettingEnabled);
      console.log('Current event ID:', currentEventId);

      // Allow event_id from query params, otherwise use current event
      const requestedEventId = req.query.event_id ? parseInt(req.query.event_id) : currentEventId;
      console.log('Requested event ID:', requestedEventId);

      if (!requestedEventId) {
        console.log('No event ID, returning empty');
        return res.json({
          success: true,
          data: {
            betting_enabled: false,
            event: null,
            categories: [],
            existing_bets: []
          }
        });
      }

      // Get event info
      console.log('Fetching event info...');
      const [eventRows] = await pool.execute(
        'SELECT event_id, event_name, event_date, venue, city, state FROM dim_events WHERE event_id = ?',
        [requestedEventId]
      );
      console.log('Event rows:', eventRows.length);

      if (eventRows.length === 0) {
        console.log('Event not found');
        return res.status(404).json({
          success: false,
          message: 'Evento no encontrado'
        });
      }

      const event = eventRows[0];
      const eventDate = new Date(event.event_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Special rule: Event from Dec 6, 2025 is considered valid until Jan 23, 2026
      const specialEventDate = new Date('2025-12-06');
      const specialDeadline = new Date('2026-01-23');
      const isSpecialEvent = event.event_date === '2025-12-06' && today <= specialDeadline;

      // Check if event is in the future or today, or if it's the special event
      const canBet = bettingEnabled && (eventDate >= today || isSpecialEvent);
      console.log('Can bet:', canBet, 'Event date:', eventDate, 'Today:', today, 'Is special event:', isSpecialEvent);

      // Get fights organized by category
      console.log('Fetching fights by category...');
      const categories = await FightCategory.getFightsByCategory(requestedEventId);
      console.log('Categories found:', categories.length);
      console.log('Total fights:', categories.reduce((sum, cat) => sum + cat.fights.length, 0));

      // Get user's existing bets for this event
      const [existingBets] = await pool.execute(
        `SELECT ub.bet_id, ub.fight_id, ub.predicted_winner_id, ub.bet_type,
                ub.bet_amount, ub.odds_value, ub.potential_return, ub.created_at
         FROM user_bets ub
         JOIN fact_fights ff ON ub.fight_id = ff.fight_id
         WHERE ub.user_id = ? AND ff.event_id = ?`,
        [userId, requestedEventId]
      );
      console.log('Existing bets found:', existingBets.length);

      res.json({
        success: true,
        data: {
          betting_enabled: canBet,
          event: event,
          categories,
          existing_bets: existingBets
        }
      });
      console.log('Response sent');
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

  async getAllEventPredictions(req, res) {
    try {
      const { eventId } = req.params;

      // Check if betting is closed globally
      // Predictions are ONLY visible when betting is closed
      const bettingEnabled = await Config.isBettingEnabled();
      if (bettingEnabled) {
        return res.status(403).json({
          success: false,
          message: 'Los pronósticos solo son visibles cuando las apuestas están cerradas'
        });
      }

      const query = `
        SELECT
          ff.fight_id,
          ff.is_title_fight,
          ff.is_main_event,
          ff.winner_id,
          ff.result_type_code,
          fc.category_name,
          fc.category_code,
          fc.display_order,
          wc.class_name as weight_class_name,
          fr.fighter_id as red_fighter_id,
          fr.fighter_name as red_fighter_name,
          fr.nickname as red_fighter_nickname,
          fr.image_path as red_fighter_image,
          fb.fighter_id as blue_fighter_id,
          fb.fighter_name as blue_fighter_name,
          fb.nickname as blue_fighter_nickname,
          fb.image_path as blue_fighter_image,
          fw.fighter_name as winner_name,
          u.user_id,
          u.username,
          u.nickname as user_nickname,
          ub.bet_type,
          ub.predicted_winner_id,
          ub.odds_value,
          ub.bet_amount,
          ub.potential_return,
          ub.status,
          pw.fighter_name as predicted_winner_name
        FROM fact_fights ff
        LEFT JOIN dim_fight_categories fc ON ff.fight_category_id = fc.category_id
        LEFT JOIN dim_weight_classes wc ON ff.weight_class_id = wc.weight_class_id
        JOIN dim_fighters fr ON ff.fighter_red_id = fr.fighter_id
        JOIN dim_fighters fb ON ff.fighter_blue_id = fb.fighter_id
        LEFT JOIN dim_fighters fw ON ff.winner_id = fw.fighter_id
        LEFT JOIN user_bets ub ON ff.fight_id = ub.fight_id
        LEFT JOIN users u ON ub.user_id = u.user_id
        LEFT JOIN dim_fighters pw ON ub.predicted_winner_id = pw.fighter_id
        WHERE ff.event_id = ?
        ORDER BY fc.display_order DESC, ff.display_order ASC, u.username
      `;

      const [rows] = await pool.execute(query, [eventId]);

      // Group by fight
      const fightsMap = {};
      rows.forEach(row => {
        if (!fightsMap[row.fight_id]) {
          fightsMap[row.fight_id] = {
            fight_id: row.fight_id,
            is_title_fight: row.is_title_fight,
            is_main_event: row.is_main_event,
            winner_id: row.winner_id,
            result_type_code: row.result_type_code,
            is_draw: row.result_type_code === 'draw',
            winner_name: row.winner_name,
            category_name: row.category_name,
            category_code: row.category_code,
            display_order: row.display_order,
            weight_class_name: row.weight_class_name,
            red_fighter: {
              fighter_id: row.red_fighter_id,
              fighter_name: row.red_fighter_name,
              nickname: row.red_fighter_nickname,
              image_path: row.red_fighter_image
            },
            blue_fighter: {
              fighter_id: row.blue_fighter_id,
              fighter_name: row.blue_fighter_name,
              nickname: row.blue_fighter_nickname,
              image_path: row.blue_fighter_image
            },
            predictions: []
          };
        }

        // Add user prediction if exists
        if (row.user_id) {
          fightsMap[row.fight_id].predictions.push({
            user_id: row.user_id,
            username: row.username,
            user_nickname: row.user_nickname,
            bet_type: row.bet_type,
            predicted_winner_id: row.predicted_winner_id,
            predicted_winner_name: row.predicted_winner_name,
            odds_value: row.odds_value,
            bet_amount: row.bet_amount,
            potential_return: row.potential_return,
            status: row.status
          });
        }
      });

      // Group by category
      const categoriesMap = {};
      Object.values(fightsMap).forEach(fight => {
        const categoryCode = fight.category_code || 'uncategorized';
        if (!categoriesMap[categoryCode]) {
          categoriesMap[categoryCode] = {
            category_name: fight.category_name || 'Sin Categoría',
            category_code: categoryCode,
            display_order: fight.display_order || 0,
            fights: []
          };
        }
        categoriesMap[categoryCode].fights.push(fight);
      });

      const categories = Object.values(categoriesMap).sort((a, b) => b.display_order - a.display_order);

      res.json({
        success: true,
        data: {
          event_id: eventId,
          categories
        }
      });
    } catch (error) {
      console.error('Get all event predictions error:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener pronósticos del evento',
        error: error.message
      });
    }
  }

  async getUserBets(req, res) {
    try {
      const userId = req.user.userId;
      const { event_id } = req.query;

      let query = `
        SELECT
          ub.*,
          ff.fight_id,
          ff.is_title_fight,
          ff.event_id,
          fc.category_name,
          fc.category_code,
          e.event_name,
          e.event_date,
          wc.class_name as weight_class_name,
          fr.fighter_id as red_fighter_id,
          fr.fighter_name as red_fighter_name,
          fr.nickname as red_fighter_nickname,
          fr.image_path as red_fighter_image,
          fb.fighter_id as blue_fighter_id,
          fb.fighter_name as blue_fighter_name,
          fb.nickname as blue_fighter_nickname,
          fb.image_path as blue_fighter_image,
          pw.fighter_name as predicted_winner_name,
          w.fighter_name as actual_winner_name,
          w.fighter_id as actual_winner_id
        FROM user_bets ub
        JOIN fact_fights ff ON ub.fight_id = ff.fight_id
        JOIN dim_events e ON ff.event_id = e.event_id
        LEFT JOIN dim_fight_categories fc ON ff.fight_category_id = fc.category_id
        LEFT JOIN dim_weight_classes wc ON ff.weight_class_id = wc.weight_class_id
        JOIN dim_fighters fr ON ff.fighter_red_id = fr.fighter_id
        JOIN dim_fighters fb ON ff.fighter_blue_id = fb.fighter_id
        LEFT JOIN dim_fighters pw ON ub.predicted_winner_id = pw.fighter_id
        LEFT JOIN dim_fighters w ON ff.winner_id = w.fighter_id
        WHERE ub.user_id = ?
      `;

      const params = [userId];

      if (event_id) {
        query += ' AND ff.event_id = ?';
        params.push(event_id);
      }

      query += ' ORDER BY e.event_date DESC, fc.display_order DESC, ub.created_at DESC';

      const [bets] = await pool.execute(query, params);

      // Group by event
      const eventMap = {};
      bets.forEach(bet => {
        if (!eventMap[bet.event_id]) {
          eventMap[bet.event_id] = {
            event_id: bet.event_id,
            event_name: bet.event_name,
            event_date: bet.event_date,
            bets: []
          };
        }
        eventMap[bet.event_id].bets.push(bet);
      });

      const groupedBets = Object.values(eventMap);

      res.json({
        success: true,
        data: {
          total_bets: bets.length,
          events: groupedBets
        }
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

      // Check if user can bet
      const [userRows] = await connection.execute(
        'SELECT can_bet FROM users WHERE user_id = ?',
        [userId]
      );

      if (userRows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      if (!userRows[0].can_bet) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permiso para realizar apuestas. Contacta al administrador.'
        });
      }

      await connection.beginTransaction();

      const results = [];

      for (const bet of bets) {
        const { fight_id, bet_type, predicted_winner_id, odds_value } = bet;

        if (!fight_id || !bet_type || !odds_value) {
          throw new Error(`Datos de apuesta incompletos para fight_id ${fight_id}`);
        }

        // Validate bet_type
        const validBetTypes = ['fighter_win', 'draw', 'no_contest'];
        if (!validBetTypes.includes(bet_type)) {
          throw new Error(`Tipo de apuesta inválido: ${bet_type}. Tipos válidos: ${validBetTypes.join(', ')}`);
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
          // No permitir modificar apuestas ya existentes
          throw new Error(`Ya tienes una apuesta registrada para la pelea ${fight_id}. No puedes modificarla.`);
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
        message: `${results.length} apuesta${results.length > 1 ? 's' : ''} registrada${results.length > 1 ? 's' : ''} exitosamente. No podrás modificarlas.`,
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

  async clearEventBets(req, res) {
    const { eventId } = req.params;
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // Verify event exists
      const [eventRows] = await connection.execute(
        'SELECT event_id, event_name FROM dim_events WHERE event_id = ?',
        [eventId]
      );

      if (eventRows.length === 0) {
        await connection.rollback();
        return res.status(404).json({
          success: false,
          message: 'Evento no encontrado'
        });
      }

      // Count fights with results
      const [fightsRows] = await connection.execute(
        'SELECT COUNT(*) as total FROM fact_fights WHERE event_id = ? AND (winner_id IS NOT NULL OR result_type_code IS NOT NULL)',
        [eventId]
      );
      const fightsWithResults = fightsRows[0].total;

      // Count bets to be deleted
      const [betsRows] = await connection.execute(
        `SELECT COUNT(*) as total
         FROM user_bets ub
         JOIN fact_fights ff ON ub.fight_id = ff.fight_id
         WHERE ff.event_id = ?`,
        [eventId]
      );
      const totalBets = betsRows[0].total;

      // Delete all points history for this event (must be done before deleting bets)
      await connection.execute(
        'DELETE FROM user_points_history WHERE event_id = ?',
        [eventId]
      );

      // ALWAYS reset fight results for the event
      await connection.execute(
        'UPDATE fact_fights SET winner_id = NULL, result_type_code = NULL WHERE event_id = ?',
        [eventId]
      );

      // Delete all bets for the event (if any)
      if (totalBets > 0) {
        await connection.execute(
          `DELETE ub FROM user_bets ub
           JOIN fact_fights ff ON ub.fight_id = ff.fight_id
           WHERE ff.event_id = ?`,
          [eventId]
        );
      }

      // Re-enable betting for all users
      await connection.execute(
        'UPDATE users SET can_bet = TRUE WHERE role = \'user\''
      );

      await connection.commit();

      res.json({
        success: true,
        message: `Resultados limpiados: ${fightsWithResults} peleas reiniciadas, ${totalBets} apuestas eliminadas`,
        data: {
          fights_cleared: fightsWithResults,
          bets_deleted: totalBets
        }
      });
    } catch (error) {
      await connection.rollback();
      console.error('Clear event bets error:', error);
      res.status(500).json({
        success: false,
        message: 'Error al limpiar resultados del evento',
        error: error.message
      });
    } finally {
      connection.release();
    }
  }
}

module.exports = new BetsController();
