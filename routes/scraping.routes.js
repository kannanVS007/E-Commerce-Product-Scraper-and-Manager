const express = require('express');
const router = express.Router();
const scraperService = require('../services/scraper.service');
const scrapingConfig = require('../config/scraping.config');
const logger = require('../utils/logger');

// Trigger scraping for all configured websites
router.post('/start', async (req, res) => {
    try {
        if (scraperService.isScraping) {
            logger.warn('Scraping already in progress');
            return res.status(400).json({ error: 'Scraping already in progress' });
        }

        logger.info('Starting scraping for all websites');
        const results = await scraperService.scrapeAllWebsites();
        logger.info('Scraping completed successfully');
        console.log('resssssssssssssssssssssssssssssssssssssssss', results);
        res.json({
            message: 'Scraping completed',
            results
        });
    } catch (error) {
        logger.error('Error during scraping:', error);
        res.status(500).json({ 
            error: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// Get scraping status
router.get('/status', (req, res) => {
    try {
        const status = {
            isScraping: scraperService.isScraping,
            lastScrapeTime: scraperService.lastScrapeTime,
            nextScheduledScrape: scraperService.nextScheduledScrape
        };
        logger.debug('Scraping status:', status);
        res.json(status);
    } catch (error) {
        logger.error('Error getting scraping status:', error);
        res.status(500).json({ error: error.message });
    }
});

// Trigger scraping for a specific website
router.post('/website/:website', async (req, res) => {
    try {
        const websiteName = req.params.website;
        logger.info(`Starting scraping for website: ${websiteName}`);

        const websiteConfig = scrapingConfig.websites?.find(
            w => w.name === websiteName
        );

        if (!websiteConfig) {
            logger.warn(`Website configuration not found for: ${websiteName}`);
            return res.status(404).json({ 
                error: 'Website configuration not found',
                availableWebsites: scrapingConfig.websites?.map(w => w.name)
            });
        }

        if (scraperService.isScraping) {
            logger.warn(`Scraping already in progress for website: ${websiteName}`);
            return res.status(400).json({ error: 'Scraping already in progress' });
        }

        const category = req.query.category;
        const products = await scraperService.scrapeWebsite(websiteConfig, category);
        
        logger.info(`Scraping completed for ${websiteName}, found ${products.length} products`);
        res.json({
            message: `Scraping completed for ${websiteConfig.name}`,
            productsCount: products.length,
            category: category || 'all'
        });
    } catch (error) {
        logger.error(`Error scraping website ${req.params.website}:`, error);
        res.status(500).json({ 
            error: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// Get scraping configuration
router.get('/config', (req, res) => {
    try {
        const config = {
            interval: scrapingConfig.defaultInterval,
            websites: scrapingConfig.websites.map(w => ({
                name: w.name,
                url: w.url,
                categories: scrapingConfig.categories
            }))
        };
        logger.debug('Scraping configuration:', config);
        res.json(config);
    } catch (error) {
        logger.error('Error getting scraping configuration:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router; 