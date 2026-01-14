const { pool } = require('../config/database');

class User {
  static async create({ username, email, password_hash, nickname = null, country_id = null, role = 'user' }) {
    const query = `
      INSERT INTO users (username, nickname, email, role, password_hash, country_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const [result] = await pool.execute(query, [username, nickname, email, role, password_hash, country_id]);
    return result.insertId;
  }

  static async findByEmail(email) {
    const query = `
      SELECT u.*, c.country_name, c.country_code
      FROM users u
      LEFT JOIN dim_countries c ON u.country_id = c.country_id
      WHERE u.email = ?
    `;
    const [rows] = await pool.execute(query, [email]);
    return rows[0] || null;
  }

  static async findByUsername(username) {
    const query = `
      SELECT u.*, c.country_name, c.country_code
      FROM users u
      LEFT JOIN dim_countries c ON u.country_id = c.country_id
      WHERE u.username = ?
    `;
    const [rows] = await pool.execute(query, [username]);
    return rows[0] || null;
  }

  static async findById(userId) {
    const query = `
      SELECT u.user_id, u.username, u.nickname, u.email, u.role, u.country_id, u.total_points,
             u.created_at, c.country_name, c.country_code
      FROM users u
      LEFT JOIN dim_countries c ON u.country_id = c.country_id
      WHERE u.user_id = ?
    `;
    const [rows] = await pool.execute(query, [userId]);
    return rows[0] || null;
  }

  static async updatePoints(userId, points) {
    const query = `
      UPDATE users
      SET total_points = total_points + ?
      WHERE user_id = ?
    `;
    await pool.execute(query, [points, userId]);
  }

  static async getLeaderboard(limit = 10) {
    const query = `
      SELECT u.user_id, u.username, u.nickname, u.total_points, c.country_name, c.country_code
      FROM users u
      LEFT JOIN dim_countries c ON u.country_id = c.country_id
      ORDER BY u.total_points DESC
      LIMIT ?
    `;
    const [rows] = await pool.execute(query, [limit]);
    return rows;
  }

  static async findByNickname(nickname) {
    const query = `
      SELECT u.*, c.country_name, c.country_code
      FROM users u
      LEFT JOIN dim_countries c ON u.country_id = c.country_id
      WHERE u.nickname = ?
    `;
    const [rows] = await pool.execute(query, [nickname]);
    return rows[0] || null;
  }

  static async updateNickname(userId, nickname) {
    const query = `
      UPDATE users
      SET nickname = ?
      WHERE user_id = ?
    `;
    await pool.execute(query, [nickname, userId]);
  }
}

module.exports = User;
