const express = require('express');
const router = express.Router();
const scraperService = require('../../services/scraper.service');

// Get scraping status
router.get('/status', async (req, res) => {
    try {
        const status = await scraperService.getStatus();
        res.json(status);
    } catch (error) {
        console.error('Error getting scraping status:', error);
        res.status(500).json({ error: 'Failed to get scraping status' });
    }
});

// Start scraping
router.post('/start', async (req, res) => {
    try {
        const results = await scraperService.scrapeAllWebsites();
        res.json({
            message: 'Scraping completed',
            results
        });
    } catch (error) {
        console.error('Error starting scraping:', error);
        res.status(500).json({ error: 'Failed to start scraping' });
    }
});

module.exports = router; 