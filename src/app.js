const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const { testConnection } = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const configRoutes = require('./routes/configRoutes');
const maintainersRoutes = require('./routes/maintainersRoutes');
const betsRoutes = require('./routes/betsRoutes');
const registrationTokenRoutes = require('./routes/registrationTokenRoutes');
const fighterRoutes = require('./routes/fighterRoutes');
const usersRoutes = require('./routes/usersRoutes');
const resultsRoutes = require('./routes/resultsRoutes');
const leaderboardRoutes = require('./routes/leaderboardRoutes');

const app = express();
const PORT = process.env.PORT || 21;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads/fighters');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Created uploads/fighters directory');
}

// Serve static files (fighter images)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'UFC Predictions API',
    version: '1.0.0',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        profile: 'GET /api/auth/profile (requires token)'
      },
      admin: {
        createUser: 'POST /api/admin/users (requires admin token)',
        getAllUsers: 'GET /api/admin/users (requires admin token)',
        deleteUser: 'DELETE /api/admin/users/:userId (requires admin token)'
      }
    }
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/config', configRoutes);
app.use('/api/maintainers', maintainersRoutes);
app.use('/api/bets', betsRoutes);
app.use('/api/registration-tokens', registrationTokenRoutes);
app.use('/api/fighters', fighterRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/results', resultsRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Start server
const startServer = async () => {
  try {
    // Test database connection
    await testConnection();

    app.listen(PORT, () => {
      console.log('=================================');
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 API URL: http://localhost:${PORT}`);
      console.log('=================================');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
