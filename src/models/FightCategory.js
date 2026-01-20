const { pool } = require('../config/database');

class FightCategory {
  static async getAll() {
    const query = `
      SELECT * FROM dim_fight_categories
      ORDER BY display_order
    `;
    const [rows] = await pool.execute(query);
    return rows;
  }

  static async getById(categoryId) {
    const query = 'SELECT * FROM dim_fight_categories WHERE category_id = ?';
    const [rows] = await pool.execute(query, [categoryId]);
    return rows[0] || null;
  }

  static async getByCode(categoryCode) {
    const query = 'SELECT * FROM dim_fight_categories WHERE category_code = ?';
    const [rows] = await pool.execute(query, [categoryCode]);
    return rows[0] || null;
  }

  static async getFightsByCategory(eventId) {
    const query = `
      SELECT
        fc.category_id,
        fc.category_name,
        fc.category_code,
        fc.display_order,
        ff.fight_id,
        ff.is_title_fight,
        ff.is_main_event,
        ff.is_co_main_event,
        ff.card_position,
        wc.class_name as weight_class_name,
        fr.fighter_id as red_fighter_id,
        fr.fighter_name as red_fighter_name,
        fr.nickname as red_fighter_nickname,
        fr.image_path as red_fighter_image,
        fb.fighter_id as blue_fighter_id,
        fb.fighter_name as blue_fighter_name,
        fb.nickname as blue_fighter_nickname,
        fb.image_path as blue_fighter_image,
        (SELECT decimal_odds FROM betting_odds WHERE fight_id = ff.fight_id AND fighter_id = ff.fighter_red_id AND outcome_type = 'fighter' LIMIT 1) as red_odds,
        (SELECT decimal_odds FROM betting_odds WHERE fight_id = ff.fight_id AND fighter_id = ff.fighter_blue_id AND outcome_type = 'fighter' LIMIT 1) as blue_odds,
        (SELECT decimal_odds FROM betting_odds WHERE fight_id = ff.fight_id AND outcome_type = 'draw' LIMIT 1) as draw_odds,
        (SELECT decimal_odds FROM betting_odds WHERE fight_id = ff.fight_id AND outcome_type = 'no_contest' LIMIT 1) as no_contest_odds,
        ff.display_order
      FROM fact_fights ff
      LEFT JOIN dim_fight_categories fc ON ff.fight_category_id = fc.category_id
      LEFT JOIN dim_weight_classes wc ON ff.weight_class_id = wc.weight_class_id
      JOIN dim_fighters fr ON ff.fighter_red_id = fr.fighter_id
      JOIN dim_fighters fb ON ff.fighter_blue_id = fb.fighter_id
      WHERE ff.event_id = ?
      ORDER BY fc.display_order ASC, ff.display_order ASC, ff.fight_id
    `;
    const [rows] = await pool.execute(query, [eventId]);

    // Group fights by category
    const categories = {};
    rows.forEach(row => {
      const categoryName = row.category_name || 'Sin Categoría';
      const categoryCode = row.category_code || 'uncategorized';

      if (!categories[categoryCode]) {
        categories[categoryCode] = {
          category_id: row.category_id,
          category_name: categoryName,
          category_code: categoryCode,
          display_order: row.display_order || 0,
          fights: []
        };
      }

      categories[categoryCode].fights.push({
        fight_id: row.fight_id,
        is_title_fight: row.is_title_fight,
        is_main_event: row.is_main_event,
        is_co_main_event: row.is_co_main_event,
        card_position: row.card_position,
        display_order: row.display_order,
        weight_class_name: row.weight_class_name,
        red_fighter: {
          fighter_id: row.red_fighter_id,
          fighter_name: row.red_fighter_name,
          nickname: row.red_fighter_nickname,
          image_path: row.red_fighter_image,
          odds: row.red_odds
        },
        blue_fighter: {
          fighter_id: row.blue_fighter_id,
          fighter_name: row.blue_fighter_name,
          nickname: row.blue_fighter_nickname,
          image_path: row.blue_fighter_image,
          odds: row.blue_odds
        },
        draw_odds: row.draw_odds,
        no_contest_odds: row.no_contest_odds
      });
    });

    // Convert to array and sort by display_order (ASC: preliminary -> main_card -> title_fight)
    return Object.values(categories).sort((a, b) => a.display_order - b.display_order);
  }
}

module.exports = FightCategory;
