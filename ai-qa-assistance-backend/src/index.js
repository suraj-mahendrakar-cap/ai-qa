const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./config');

const app = express();
const PORT = config.server.port;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes - Use explicit path prefixes for Express 5.x compatibility
app.use('/api/chatbot', require('./routes/chatbot'));
app.use('/api/upload-collection', require('./routes/upload-collection'));
app.use('/api/environment', require('./routes/environment'));
app.use('/api/collection-info', require('./routes/collection-info'));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use(require('./middleware/errorHandler'));

// 404 handler - Use explicit path for Express 5.x compatibility
app.use('/*', (req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;
