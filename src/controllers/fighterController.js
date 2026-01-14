const { pool } = require('../config/database');
const path = require('path');
const fs = require('fs').promises;

class FighterController {
  async getFighters(req, res) {
    try {
      const { search } = req.query;

      let query = `
        SELECT f.fighter_id, f.fighter_name, f.nickname, f.image_path,
               f.date_of_birth, f.height_cm, f.reach_cm,
               f.total_wins, f.total_losses, f.total_draws,
               c.country_name, c.country_code
        FROM dim_fighters f
        LEFT JOIN dim_countries c ON f.country_id = c.country_id
      `;

      const params = [];

      if (search) {
        query += ` WHERE f.fighter_name LIKE ? OR f.nickname LIKE ?`;
        params.push(`%${search}%`, `%${search}%`);
      }

      query += ` ORDER BY f.fighter_name ASC`;

      const [rows] = await pool.execute(query, params);

      res.json({
        success: true,
        data: rows
      });
    } catch (error) {
      console.error('Error fetching fighters:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener peleadores',
        error: error.message
      });
    }
  }

  async getFighterById(req, res) {
    try {
      const { fighterId } = req.params;

      const query = `
        SELECT f.fighter_id, f.fighter_name, f.nickname, f.image_path,
               f.date_of_birth, f.height_cm, f.reach_cm,
               f.total_wins, f.total_losses, f.total_draws, f.total_nc,
               c.country_name, c.country_code,
               s.stance_name
        FROM dim_fighters f
        LEFT JOIN dim_countries c ON f.country_id = c.country_id
        LEFT JOIN dim_stances s ON f.stance_id = s.stance_id
        WHERE f.fighter_id = ?
      `;

      const [rows] = await pool.execute(query, [fighterId]);

      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Peleador no encontrado'
        });
      }

      res.json({
        success: true,
        data: rows[0]
      });
    } catch (error) {
      console.error('Error fetching fighter:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener peleador',
        error: error.message
      });
    }
  }

  async uploadFighterImage(req, res) {
    try {
      const { fighterId } = req.params;

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No se proporcion\u00f3 ning\u00fan archivo'
        });
      }

      const checkQuery = 'SELECT fighter_id FROM dim_fighters WHERE fighter_id = ?';
      const [fighters] = await pool.execute(checkQuery, [fighterId]);

      if (fighters.length === 0) {
        await fs.unlink(req.file.path);
        return res.status(404).json({
          success: false,
          message: 'Peleador no encontrado'
        });
      }

      const imagePath = req.file.filename;

      const updateQuery = 'UPDATE dim_fighters SET image_path = ? WHERE fighter_id = ?';
      await pool.execute(updateQuery, [imagePath, fighterId]);

      res.json({
        success: true,
        message: 'Imagen subida exitosamente',
        data: {
          fighter_id: fighterId,
          image_path: imagePath,
          image_url: `/uploads/fighters/${imagePath}`
        }
      });
    } catch (error) {
      if (req.file) {
        try {
          await fs.unlink(req.file.path);
        } catch (unlinkError) {
          console.error('Error deleting file after error:', unlinkError);
        }
      }

      console.error('Error uploading fighter image:', error);
      res.status(500).json({
        success: false,
        message: 'Error al subir imagen',
        error: error.message
      });
    }
  }

  async deleteFighterImage(req, res) {
    try {
      const { fighterId } = req.params;

      const query = 'SELECT image_path FROM dim_fighters WHERE fighter_id = ?';
      const [rows] = await pool.execute(query, [fighterId]);

      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Peleador no encontrado'
        });
      }

      const imagePath = rows[0].image_path;

      if (imagePath) {
        const fullPath = path.join(__dirname, '../../uploads/fighters', imagePath);
        try {
          await fs.unlink(fullPath);
        } catch (error) {
          console.error('Error deleting file:', error);
        }
      }

      const updateQuery = 'UPDATE dim_fighters SET image_path = NULL WHERE fighter_id = ?';
      await pool.execute(updateQuery, [fighterId]);

      res.json({
        success: true,
        message: 'Imagen eliminada exitosamente'
      });
    } catch (error) {
      console.error('Error deleting fighter image:', error);
      res.status(500).json({
        success: false,
        message: 'Error al eliminar imagen',
        error: error.message
      });
    }
  }
}

module.exports = new FighterController();
