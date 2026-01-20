const { pool } = require('../config/database');
const { validationResult } = require('express-validator');

class MaintainersController {
  // ==================== FIGHTERS ====================
  async getFighters(req, res) {
    try {
      const query = `
        SELECT f.*, c.country_name, c.country_code, s.stance_name
        FROM dim_fighters f
        LEFT JOIN dim_countries c ON f.country_id = c.country_id
        LEFT JOIN dim_stances s ON f.stance_id = s.stance_id
        ORDER BY f.fighter_name
      `;
      const [fighters] = await pool.execute(query);
      res.json({ success: true, data: fighters });
    } catch (error) {
      console.error('Get fighters error:', error);
      res.status(500).json({ success: false, message: 'Error fetching fighters', error: error.message });
    }
  }

  async createFighter(req, res) {
    try {
      const { fighter_name, nickname, country_id, date_of_birth, height_cm, reach_cm, stance_id } = req.body;

      const query = `
        INSERT INTO dim_fighters (fighter_name, nickname, country_id, date_of_birth, height_cm, reach_cm, stance_id)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      const [result] = await pool.execute(query, [fighter_name, nickname, country_id, date_of_birth, height_cm, reach_cm, stance_id]);

      res.status(201).json({ success: true, message: 'Fighter created successfully', data: { fighter_id: result.insertId } });
    } catch (error) {
      console.error('Create fighter error:', error);
      res.status(500).json({ success: false, message: 'Error creating fighter', error: error.message });
    }
  }

  async updateFighter(req, res) {
    try {
      const { fighter_id } = req.params;
      const { fighter_name, nickname, country_id, date_of_birth, height_cm, reach_cm, stance_id } = req.body;

      const query = `
        UPDATE dim_fighters
        SET fighter_name = ?, nickname = ?, country_id = ?, date_of_birth = ?, height_cm = ?, reach_cm = ?, stance_id = ?
        WHERE fighter_id = ?
      `;
      await pool.execute(query, [fighter_name, nickname, country_id, date_of_birth, height_cm, reach_cm, stance_id, fighter_id]);

      res.json({ success: true, message: 'Fighter updated successfully' });
    } catch (error) {
      console.error('Update fighter error:', error);
      res.status(500).json({ success: false, message: 'Error updating fighter', error: error.message });
    }
  }

  async deleteFighter(req, res) {
    try {
      const { fighter_id } = req.params;
      await pool.execute('DELETE FROM dim_fighters WHERE fighter_id = ?', [fighter_id]);
      res.json({ success: true, message: 'Fighter deleted successfully' });
    } catch (error) {
      console.error('Delete fighter error:', error);
      res.status(500).json({ success: false, message: 'Error deleting fighter', error: error.message });
    }
  }

  // ==================== EVENTS ====================
  async getEvents(req, res) {
    try {
      const query = `
        SELECT e.*, et.event_type_name, c.country_name, c.country_code
        FROM dim_events e
        LEFT JOIN dim_event_types et ON e.event_type_id = et.event_type_id
        LEFT JOIN dim_countries c ON e.country_id = c.country_id
        ORDER BY e.event_date DESC
      `;
      const [events] = await pool.execute(query);
      res.json({ success: true, data: events });
    } catch (error) {
      console.error('Get events error:', error);
      res.status(500).json({ success: false, message: 'Error fetching events', error: error.message });
    }
  }

  async getEventById(req, res) {
    try {
      const { event_id } = req.params;
      const query = `
        SELECT e.*, et.event_type_name, c.country_name, c.country_code
        FROM dim_events e
        LEFT JOIN dim_event_types et ON e.event_type_id = et.event_type_id
        LEFT JOIN dim_countries c ON e.country_id = c.country_id
        WHERE e.event_id = ?
      `;
      const [events] = await pool.execute(query, [event_id]);

      if (events.length === 0) {
        return res.status(404).json({ success: false, message: 'Event not found' });
      }

      res.json({ success: true, data: events[0] });
    } catch (error) {
      console.error('Get event by id error:', error);
      res.status(500).json({ success: false, message: 'Error fetching event', error: error.message });
    }
  }

  async createEvent(req, res) {
    try {
      const { event_name, event_date, event_type_id, venue, city, state, country_id } = req.body;

      const query = `
        INSERT INTO dim_events (event_name, event_date, event_type_id, venue, city, state, country_id)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      const [result] = await pool.execute(query, [event_name, event_date, event_type_id, venue, city, state, country_id]);

      res.status(201).json({ success: true, message: 'Event created successfully', data: { event_id: result.insertId } });
    } catch (error) {
      console.error('Create event error:', error);
      res.status(500).json({ success: false, message: 'Error creating event', error: error.message });
    }
  }

  async updateEvent(req, res) {
    try {
      const { event_id } = req.params;
      const { event_name, event_date, event_type_id, venue, city, state, country_id } = req.body;

      const query = `
        UPDATE dim_events
        SET event_name = ?, event_date = ?, event_type_id = ?, venue = ?, city = ?, state = ?, country_id = ?
        WHERE event_id = ?
      `;
      await pool.execute(query, [event_name, event_date, event_type_id, venue, city, state, country_id, event_id]);

      res.json({ success: true, message: 'Event updated successfully' });
    } catch (error) {
      console.error('Update event error:', error);
      res.status(500).json({ success: false, message: 'Error updating event', error: error.message });
    }
  }

  async deleteEvent(req, res) {
    try {
      const { event_id } = req.params;
      await pool.execute('DELETE FROM dim_events WHERE event_id = ?', [event_id]);
      res.json({ success: true, message: 'Event deleted successfully' });
    } catch (error) {
      console.error('Delete event error:', error);
      res.status(500).json({ success: false, message: 'Error deleting event', error: error.message });
    }
  }

  // ==================== FIGHTS ====================
  async getFights(req, res) {
    try {
      const { event_id } = req.query;

      let query = `
        SELECT
          ff.*,
          e.event_name, e.event_date,
          wc.class_name as weight_class_name,
          fr.fighter_name as red_fighter_name,
          fr.nickname as red_fighter_nickname,
          fr.height_cm as red_fighter_height,
          fr.reach_cm as red_fighter_reach,
          cr.country_name as red_fighter_country,
          sr.stance_name as red_fighter_stance,
          CONCAT(
            COALESCE((SELECT SUM(CASE WHEN winner_id = fr.fighter_id THEN 1 ELSE 0 END) FROM fact_fights WHERE fighter_red_id = fr.fighter_id OR fighter_blue_id = fr.fighter_id), 0),
            '-',
            COALESCE((SELECT SUM(CASE WHEN winner_id != fr.fighter_id AND winner_id IS NOT NULL THEN 1 ELSE 0 END) FROM fact_fights WHERE fighter_red_id = fr.fighter_id OR fighter_blue_id = fr.fighter_id), 0),
            '-',
            COALESCE((SELECT SUM(CASE WHEN result_type_code = 'draw' THEN 1 ELSE 0 END) FROM fact_fights WHERE fighter_red_id = fr.fighter_id OR fighter_blue_id = fr.fighter_id), 0)
          ) as red_fighter_record,
          fb.fighter_name as blue_fighter_name,
          fb.nickname as blue_fighter_nickname,
          fb.height_cm as blue_fighter_height,
          fb.reach_cm as blue_fighter_reach,
          cb.country_name as blue_fighter_country,
          sb.stance_name as blue_fighter_stance,
          CONCAT(
            COALESCE((SELECT SUM(CASE WHEN winner_id = fb.fighter_id THEN 1 ELSE 0 END) FROM fact_fights WHERE fighter_red_id = fb.fighter_id OR fighter_blue_id = fb.fighter_id), 0),
            '-',
            COALESCE((SELECT SUM(CASE WHEN winner_id != fb.fighter_id AND winner_id IS NOT NULL THEN 1 ELSE 0 END) FROM fact_fights WHERE fighter_red_id = fb.fighter_id OR fighter_blue_id = fb.fighter_id), 0),
            '-',
            COALESCE((SELECT SUM(CASE WHEN result_type_code = 'draw' THEN 1 ELSE 0 END) FROM fact_fights WHERE fighter_red_id = fb.fighter_id OR fighter_blue_id = fb.fighter_id), 0)
          ) as blue_fighter_record,
          w.fighter_name as winner_name,
          (SELECT decimal_odds FROM betting_odds WHERE fight_id = ff.fight_id AND fighter_id = ff.fighter_red_id LIMIT 1) as red_odds,
          (SELECT decimal_odds FROM betting_odds WHERE fight_id = ff.fight_id AND fighter_id = ff.fighter_blue_id LIMIT 1) as blue_odds,
          fc.category_name,
          fc.category_code
        FROM fact_fights ff
        LEFT JOIN dim_events e ON ff.event_id = e.event_id
        LEFT JOIN dim_weight_classes wc ON ff.weight_class_id = wc.weight_class_id
        LEFT JOIN dim_fighters fr ON ff.fighter_red_id = fr.fighter_id
        LEFT JOIN dim_countries cr ON fr.country_id = cr.country_id
        LEFT JOIN dim_stances sr ON fr.stance_id = sr.stance_id
        LEFT JOIN dim_fighters fb ON ff.fighter_blue_id = fb.fighter_id
        LEFT JOIN dim_countries cb ON fb.country_id = cb.country_id
        LEFT JOIN dim_stances sb ON fb.stance_id = sb.stance_id
        LEFT JOIN dim_fighters w ON ff.winner_id = w.fighter_id
        LEFT JOIN dim_fight_categories fc ON ff.fight_category_id = fc.category_id
      `;

      let params = [];
      if (event_id) {
        query += ' WHERE ff.event_id = ?';
        params.push(event_id);
      }

      query += ' ORDER BY e.event_date DESC, ff.display_order ASC, ff.fight_id DESC';

      const [fights] = await pool.execute(query, params);
      res.json({ success: true, data: fights });
    } catch (error) {
      console.error('Get fights error:', error);
      res.status(500).json({ success: false, message: 'Error fetching fights', error: error.message });
    }
  }

  async createFight(req, res) {
    try {
      const {
        event_id, weight_class_id, fighter_red_id, fighter_blue_id,
        scheduled_rounds, is_title_fight, is_main_event, is_co_main_event,
        red_odds, blue_odds, fight_category_id, display_order
      } = req.body;

      // Get time_id for event date
      const [eventRows] = await pool.execute('SELECT event_date FROM dim_events WHERE event_id = ?', [event_id]);
      if (eventRows.length === 0) {
        return res.status(404).json({ success: false, message: 'Event not found' });
      }

      const eventDate = eventRows[0].event_date;
      const [timeRows] = await pool.execute('SELECT time_id FROM dim_time WHERE full_date = ?', [eventDate]);
      let time_id;

      if (timeRows.length === 0) {
        // Create time record
        const date = new Date(eventDate);
        const [timeResult] = await pool.execute(`
          INSERT INTO dim_time (full_date, day_of_week, day_of_month, month, month_name, quarter, year, is_weekend)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          eventDate,
          ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][date.getDay()],
          date.getDate(),
          date.getMonth() + 1,
          ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][date.getMonth()],
          Math.floor(date.getMonth() / 3) + 1,
          date.getFullYear(),
          [0, 6].includes(date.getDay())
        ]);
        time_id = timeResult.insertId;
      } else {
        time_id = timeRows[0].time_id;
      }

      // Get default result and method IDs
      const [resultRows] = await pool.execute("SELECT fight_result_id FROM dim_fight_results WHERE result_name = 'Win' LIMIT 1");
      const [methodRows] = await pool.execute("SELECT method_id FROM dim_fight_methods WHERE method_name = 'TBD' OR method_name LIKE 'Decision%' LIMIT 1");

      const fight_result_id = resultRows[0]?.fight_result_id || 1;
      const method_id = methodRows[0]?.method_id || 1;

      // Create fight
      const query = `
        INSERT INTO fact_fights (
          event_id, time_id, weight_class_id, fight_category_id, fighter_red_id, fighter_blue_id,
          fight_result_id, method_id, scheduled_rounds, final_round, final_time_seconds, total_fight_time_seconds,
          is_title_fight, is_main_event, is_co_main_event, display_order
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 0, ?, ?, ?, ?)
      `;

      const [result] = await pool.execute(query, [
        event_id, time_id, weight_class_id, fight_category_id, fighter_red_id, fighter_blue_id,
        fight_result_id, method_id, scheduled_rounds, is_title_fight, is_main_event, is_co_main_event, display_order || 0
      ]);

      const fight_id = result.insertId;

      // Create odds
      if (red_odds) {
        await pool.execute('INSERT INTO betting_odds (fight_id, fighter_id, decimal_odds) VALUES (?, ?, ?)', [fight_id, fighter_red_id, red_odds]);
      }
      if (blue_odds) {
        await pool.execute('INSERT INTO betting_odds (fight_id, fighter_id, decimal_odds) VALUES (?, ?, ?)', [fight_id, fighter_blue_id, blue_odds]);
      }

      res.status(201).json({ success: true, message: 'Fight created successfully', data: { fight_id } });
    } catch (error) {
      console.error('Create fight error:', error);
      res.status(500).json({ success: false, message: 'Error creating fight', error: error.message });
    }
  }

  async updateFight(req, res) {
    try {
      const { fight_id } = req.params;
      const {
        event_id, weight_class_id, fighter_red_id, fighter_blue_id,
        scheduled_rounds, is_title_fight, is_main_event, is_co_main_event,
        red_odds, blue_odds, winner_id, fight_category_id, display_order
      } = req.body;

      const query = `
        UPDATE fact_fights
        SET event_id = ?, weight_class_id = ?, fighter_red_id = ?, fighter_blue_id = ?,
            scheduled_rounds = ?, is_title_fight = ?, is_main_event = ?, is_co_main_event = ?,
            winner_id = ?, fight_category_id = ?, display_order = ?
        WHERE fight_id = ?
      `;
      await pool.execute(query, [
        event_id, weight_class_id, fighter_red_id, fighter_blue_id,
        scheduled_rounds, is_title_fight, is_main_event, is_co_main_event, winner_id,
        fight_category_id, display_order,
        fight_id
      ]);

      // Update odds
      await pool.execute('DELETE FROM betting_odds WHERE fight_id = ?', [fight_id]);
      if (red_odds) {
        await pool.execute('INSERT INTO betting_odds (fight_id, fighter_id, decimal_odds) VALUES (?, ?, ?)', [fight_id, fighter_red_id, red_odds]);
      }
      if (blue_odds) {
        await pool.execute('INSERT INTO betting_odds (fight_id, fighter_id, decimal_odds) VALUES (?, ?, ?)', [fight_id, fighter_blue_id, blue_odds]);
      }

      res.json({ success: true, message: 'Fight updated successfully' });
    } catch (error) {
      console.error('Update fight error:', error);
      res.status(500).json({ success: false, message: 'Error updating fight', error: error.message });
    }
  }

  async deleteFight(req, res) {
    try {
      const { fight_id } = req.params;
      await pool.execute('DELETE FROM betting_odds WHERE fight_id = ?', [fight_id]);
      await pool.execute('DELETE FROM fact_fights WHERE fight_id = ?', [fight_id]);
      res.json({ success: true, message: 'Fight deleted successfully' });
    } catch (error) {
      console.error('Delete fight error:', error);
      res.status(500).json({ success: false, message: 'Error deleting fight', error: error.message });
    }
  }

  // ==================== CATALOGS ====================
  async getCatalogs(req, res) {
    try {
      const [countries] = await pool.execute('SELECT * FROM dim_countries ORDER BY country_name');
      const [stances] = await pool.execute('SELECT * FROM dim_stances ORDER BY stance_name');
      const [genders] = await pool.execute('SELECT * FROM dim_genders ORDER BY gender_name');
      const [eventTypes] = await pool.execute('SELECT * FROM dim_event_types ORDER BY event_type_name');
      const [weightClasses] = await pool.execute(`
        SELECT wc.*, g.gender_name
        FROM dim_weight_classes wc
        LEFT JOIN dim_genders g ON wc.gender_id = g.gender_id
        ORDER BY wc.display_order, wc.class_name
      `);
      const [fightResults] = await pool.execute('SELECT * FROM dim_fight_results ORDER BY result_name');
      const [fightMethods] = await pool.execute('SELECT * FROM dim_fight_methods ORDER BY method_name');

      res.json({
        success: true,
        data: {
          countries,
          stances,
          genders,
          event_types: eventTypes,
          weight_classes: weightClasses,
          fight_results: fightResults,
          fight_methods: fightMethods
        }
      });
    } catch (error) {
      console.error('Get catalogs error:', error);
      res.status(500).json({ success: false, message: 'Error fetching catalogs', error: error.message });
    }
  }

  // ==================== USERS ====================
  async getUsers(req, res) {
    try {
      const [users] = await pool.execute(`
        SELECT user_id, username, nickname, role, can_bet, created_at
        FROM users
        WHERE role = 'user'
        ORDER BY username
      `);
      res.json({ success: true, data: users });
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({ success: false, message: 'Error fetching users', error: error.message });
    }
  }

  // ==================== CLEAR USER BETS ====================
  async clearUserEventBets(req, res) {
    const connection = await pool.getConnection();
    try {
      const { userId, eventId } = req.body;

      if (!userId || !eventId) {
        return res.status(400).json({
          success: false,
          message: 'Se requieren userId y eventId'
        });
      }

      await connection.beginTransaction();

      // Check if clearing all users or specific user
      const clearAllUsers = userId === 'all';
      let countQuery, deletePointsQuery, deleteBetsQuery, countParams, deleteParams;

      if (clearAllUsers) {
        // Clear all users' bets for this event
        countQuery = `SELECT COUNT(*) as total
                      FROM user_bets ub
                      JOIN fact_fights ff ON ub.fight_id = ff.fight_id
                      WHERE ff.event_id = ?`;
        countParams = [eventId];

        deletePointsQuery = 'DELETE FROM user_points_history WHERE event_id = ?';
        deleteParams = [eventId];

        deleteBetsQuery = `DELETE ub FROM user_bets ub
                       JOIN fact_fights ff ON ub.fight_id = ff.fight_id
                       WHERE ff.event_id = ?`;
      } else {
        // Clear specific user's bets for this event
        countQuery = `SELECT COUNT(*) as total
                      FROM user_bets ub
                      JOIN fact_fights ff ON ub.fight_id = ff.fight_id
                      WHERE ub.user_id = ? AND ff.event_id = ?`;
        countParams = [userId, eventId];

        deletePointsQuery = 'DELETE FROM user_points_history WHERE user_id = ? AND event_id = ?';
        deleteParams = [userId, eventId];

        deleteBetsQuery = `DELETE ub FROM user_bets ub
                       JOIN fact_fights ff ON ub.fight_id = ff.fight_id
                       WHERE ub.user_id = ? AND ff.event_id = ?`;
      }

      // Get count of bets to be deleted
      const [countRows] = await connection.execute(countQuery, countParams);
      const totalBets = countRows[0].total;

      if (totalBets === 0) {
        await connection.rollback();
        return res.status(404).json({
          success: false,
          message: clearAllUsers
            ? 'No se encontraron apuestas en este evento'
            : 'No se encontraron apuestas para este usuario en este evento'
        });
      }

      // Delete points history first
      await connection.execute(deletePointsQuery, deleteParams);

      // Delete bets
      await connection.execute(deleteBetsQuery, deleteParams);

      await connection.commit();

      res.json({
        success: true,
        message: clearAllUsers
          ? `${totalBets} apuesta${totalBets > 1 ? 's' : ''} de todos los usuarios eliminada${totalBets > 1 ? 's' : ''} exitosamente`
          : `${totalBets} apuesta${totalBets > 1 ? 's' : ''} eliminada${totalBets > 1 ? 's' : ''} exitosamente`,
        data: { deleted_count: totalBets }
      });
    } catch (error) {
      await connection.rollback();
      console.error('Clear user event bets error:', error);
      res.status(500).json({
        success: false,
        message: 'Error al limpiar apuestas del usuario',
        error: error.message
      });
    } finally {
      connection.release();
    }
  }

  // Get user bets by event for admin view
  async getUserEventBets(req, res) {
    try {
      const { userId, eventId } = req.params;

      const [bets] = await pool.execute(
        `SELECT
          ub.bet_id,
          ub.bet_amount,
          ub.potential_return,
          ub.odds_value,
          ub.status,
          ub.created_at,
          ff.fight_id,
          fr.fighter_name as red_fighter_name,
          fb.fighter_name as blue_fighter_name,
          pw.fighter_name as predicted_winner_name,
          wc.class_name as weight_class_name
        FROM user_bets ub
        JOIN fact_fights ff ON ub.fight_id = ff.fight_id
        JOIN dim_fighters fr ON ff.fighter_red_id = fr.fighter_id
        JOIN dim_fighters fb ON ff.fighter_blue_id = fb.fighter_id
        LEFT JOIN dim_fighters pw ON ub.predicted_winner_id = pw.fighter_id
        LEFT JOIN dim_weight_classes wc ON ff.weight_class_id = wc.weight_class_id
        WHERE ub.user_id = ? AND ff.event_id = ?
        ORDER BY ff.display_order, ff.fight_id`,
        [userId, eventId]
      );

      res.json({
        success: true,
        data: bets
      });
    } catch (error) {
      console.error('Get user event bets error:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener apuestas del usuario',
        error: error.message
      });
    }
  }

  // ==================== DELETE ALL NON-ADMIN USERS ====================
  async deleteAllNonAdminUsers(req, res) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Get count of users to be deleted
      const [userCountRows] = await connection.execute(
        "SELECT COUNT(*) as total FROM users WHERE role != 'admin'"
      );
      const totalUsers = userCountRows[0].total;

      if (totalUsers === 0) {
        await connection.rollback();
        return res.json({
          success: true,
          message: 'No hay usuarios no-admin para eliminar',
          data: { deleted_users: 0, deleted_bets: 0 }
        });
      }

      // Get count of bets to be deleted
      const [betsCountRows] = await connection.execute(
        `SELECT COUNT(*) as total
         FROM user_bets ub
         JOIN users u ON ub.user_id = u.user_id
         WHERE u.role != 'admin'`
      );
      const totalBets = betsCountRows[0].total;

      // Delete all points history from non-admin users
      await connection.execute(
        `DELETE uph FROM user_points_history uph
         JOIN users u ON uph.user_id = u.user_id
         WHERE u.role != 'admin'`
      );

      // Delete all bets from non-admin users
      await connection.execute(
        `DELETE ub FROM user_bets ub
         JOIN users u ON ub.user_id = u.user_id
         WHERE u.role != 'admin'`
      );

      // Delete all non-admin users
      await connection.execute(
        "DELETE FROM users WHERE role != 'admin'"
      );

      await connection.commit();

      res.json({
        success: true,
        message: `${totalUsers} usuario${totalUsers !== 1 ? 's' : ''} y ${totalBets} apuesta${totalBets !== 1 ? 's' : ''} eliminado${totalUsers !== 1 ? 's' : ''} exitosamente`,
        data: { deleted_users: totalUsers, deleted_bets: totalBets }
      });
    } catch (error) {
      await connection.rollback();
      console.error('Delete all non-admin users error:', error);
      res.status(500).json({
        success: false,
        message: 'Error al eliminar usuarios',
        error: error.message
      });
    } finally {
      connection.release();
    }
  }

  // ==================== DELETE SINGLE USER ====================
  async deleteUser(req, res) {
    const connection = await pool.getConnection();
    try {
      const { user_id } = req.params;

      if (!user_id) {
        return res.status(400).json({
          success: false,
          message: 'Se requiere user_id'
        });
      }

      await connection.beginTransaction();

      // Check if user exists and is not admin
      const [userRows] = await connection.execute(
        'SELECT user_id, username, role FROM users WHERE user_id = ?',
        [user_id]
      );

      if (userRows.length === 0) {
        await connection.rollback();
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      if (userRows[0].role === 'admin') {
        await connection.rollback();
        return res.status(403).json({
          success: false,
          message: 'No se puede eliminar un usuario administrador'
        });
      }

      const username = userRows[0].username;

      // Get count of bets to be deleted
      const [betsCountRows] = await connection.execute(
        'SELECT COUNT(*) as total FROM user_bets WHERE user_id = ?',
        [user_id]
      );
      const totalBets = betsCountRows[0].total;

      // Delete all points history from this user (will cascade delete, but being explicit)
      await connection.execute(
        'DELETE FROM user_points_history WHERE user_id = ?',
        [user_id]
      );

      // Delete all bets from this user
      await connection.execute(
        'DELETE FROM user_bets WHERE user_id = ?',
        [user_id]
      );

      // Delete the user
      await connection.execute(
        'DELETE FROM users WHERE user_id = ?',
        [user_id]
      );

      await connection.commit();

      res.json({
        success: true,
        message: `Usuario "${username}" y ${totalBets} apuesta${totalBets !== 1 ? 's' : ''} eliminado${totalBets !== 1 ? 's' : ''} exitosamente`,
        data: { deleted_user: username, deleted_bets: totalBets }
      });
    } catch (error) {
      await connection.rollback();
      console.error('Delete user error:', error);
      res.status(500).json({
        success: false,
        message: 'Error al eliminar usuario',
        error: error.message
      });
    } finally {
      connection.release();
    }
  }
}

module.exports = new MaintainersController();
