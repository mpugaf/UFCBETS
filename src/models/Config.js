const { pool } = require('../config/database');

class Config {
  static async get(key) {
    const query = 'SELECT * FROM app_config WHERE config_key = ?';
    const [rows] = await pool.execute(query, [key]);
    return rows[0] || null;
  }

  static async getAll() {
    const query = 'SELECT * FROM app_config ORDER BY config_key';
    const [rows] = await pool.execute(query);
    return rows;
  }

  static async set(key, value) {
    const query = `
      INSERT INTO app_config (config_key, config_value)
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE config_value = ?, updated_at = CURRENT_TIMESTAMP
    `;
    await pool.execute(query, [key, value, value]);
    return this.get(key);
  }

  static async isBettingEnabled() {
    const config = await this.get('betting_enabled');
    return config && config.config_value === 'true';
  }

  static async getCurrentEventId() {
    const config = await this.get('current_event_id');
    return config ? parseInt(config.config_value) : null;
  }
}

module.exports = Config;
