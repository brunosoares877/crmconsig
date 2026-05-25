require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// Import Routes
const instanceRoutes = require('./routes/instanceRoutes');
const messageRoutes = require('./routes/messageRoutes'); // Add Import
const webhookController = require('./controllers/webhookController');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());

// Debug Logging Middleware (Moved to top)
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Routes
app.use('/instance', instanceRoutes);
app.use('/message', messageRoutes); // Add Route
app.post('/webhook/whatsapp', webhookController.handleWebhook);

// Health Check
app.get('/', (req, res) => {
    res.send('CRM WhatsApp Integration Server is running');
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
