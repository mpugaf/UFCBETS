const Config = require('../models/Config');

class ConfigController {
  async getConfig(req, res) {
    try {
      const configs = await Config.getAll();
      res.json({
        success: true,
        data: configs
      });
    } catch (error) {
      console.error('Get config error:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting configuration',
        error: error.message
      });
    }
  }

  async updateConfig(req, res) {
    try {
      const { key, value } = req.body;

      if (!key || value === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Key and value are required'
        });
      }

      const config = await Config.set(key, value);

      res.json({
        success: true,
        message: 'Configuration updated successfully',
        data: config
      });
    } catch (error) {
      console.error('Update config error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating configuration',
        error: error.message
      });
    }
  }

  async getBettingStatus(req, res) {
    try {
      const bettingEnabled = await Config.isBettingEnabled();
      const currentEventId = await Config.getCurrentEventId();

      res.json({
        success: true,
        data: {
          betting_enabled: bettingEnabled,
          current_event_id: currentEventId
        }
      });
    } catch (error) {
      console.error('Get betting status error:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting betting status',
        error: error.message
      });
    }
  }
}

module.exports = new ConfigController();
