const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cron = require('node-cron');
require('dotenv').config();

const apiConfig = require('../config/api.config');
const scrapingConfig = require('../config/scraping.config');
const scraperService = require('../services/scraper.service');
const db = require('../services/database.service');

const productRoutes = require('../routes/product.routes');
const scrapingRoutes = require('../routes/scraping.routes');

const app = express();

// Middleware
app.use(helmet());
app.use(cors(apiConfig.cors));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const basePath = process.env.API_BASE_PATH || apiConfig.basePath;
app.use(`${basePath}/products`, productRoutes);
app.use(`${basePath}/scrape`, scrapingRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: apiConfig.errorHandling.showStack ? err.message : 'Internal Server Error'
    });
});

// Initialize services
async function initializeServices() {
    try {
        await db.initialize();
        await scraperService.initialize();
        console.log('Services initialized successfully');
    } catch (error) {
        console.error('Service initialization error:', error);
        process.exit(1);
    }
}

// Schedule periodic scraping
cron.schedule('0 * * * *', async () => {
    try {
        console.log('Starting scheduled scraping...');
        await scraperService.scrapeAllWebsites();
        console.log('Scheduled scraping completed');
    } catch (error) {
        console.error('Scheduled scraping error:', error);
    }
});

// Schedule log cleanup
cron.schedule('0 0 * * *', async () => {
    try {
        await db.cleanOldLogs(30); // Clean logs older than 30 days
        console.log('Old logs cleaned successfully');
    } catch (error) {
        console.error('Log cleanup error:', error);
    }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received. Closing services...');
    await scraperService.close();
    process.exit(0);
});

// Initialize services before starting the server
initializeServices();

module.exports = app; 