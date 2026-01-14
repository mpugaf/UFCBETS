const { pool } = require('../config/database');
const crypto = require('crypto');

class RegistrationToken {
  static async create(createdBy, expiresInDays = 7) {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    const query = `
      INSERT INTO registration_tokens (token, created_by, expires_at)
      VALUES (?, ?, ?)
    `;
    const [result] = await pool.execute(query, [token, createdBy, expiresAt]);
    return {
      token_id: result.insertId,
      token,
      expires_at: expiresAt
    };
  }

  static async findByToken(token) {
    const query = `
      SELECT rt.*, u.username as creator_username
      FROM registration_tokens rt
      JOIN users u ON rt.created_by = u.user_id
      WHERE rt.token = ?
    `;
    const [rows] = await pool.execute(query, [token]);
    return rows[0] || null;
  }

  static async markAsUsed(token, userId) {
    const query = `
      UPDATE registration_tokens
      SET is_used = TRUE, used_by = ?, used_at = CURRENT_TIMESTAMP
      WHERE token = ?
    `;
    await pool.execute(query, [userId, token]);
  }

  static async getAllByCreator(createdBy) {
    const query = `
      SELECT rt.*,
             creator.username as creator_username,
             user.username as used_by_username,
             user.nickname as used_by_nickname
      FROM registration_tokens rt
      JOIN users creator ON rt.created_by = creator.user_id
      LEFT JOIN users user ON rt.used_by = user.user_id
      WHERE rt.created_by = ?
      ORDER BY rt.created_at DESC
    `;
    const [rows] = await pool.execute(query, [createdBy]);
    return rows;
  }

  static async getAll() {
    const query = `
      SELECT rt.*,
             creator.username as creator_username,
             user.username as used_by_username,
             user.nickname as used_by_nickname
      FROM registration_tokens rt
      JOIN users creator ON rt.created_by = creator.user_id
      LEFT JOIN users user ON rt.used_by = user.user_id
      ORDER BY rt.created_at DESC
    `;
    const [rows] = await pool.execute(query);
    return rows;
  }

  static async isTokenValid(token) {
    const tokenData = await this.findByToken(token);
    if (!tokenData) return false;
    if (tokenData.is_used) return false;
    if (new Date(tokenData.expires_at) < new Date()) return false;
    return true;
  }

  static async revoke(token) {
    const query = `
      UPDATE registration_tokens
      SET is_used = TRUE
      WHERE token = ?
    `;
    await pool.execute(query, [token]);
  }
}

module.exports = RegistrationToken;
