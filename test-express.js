const express = require('express');
const app = express();

// Define routes
app.get('/api/v1/scrape/status', (req, res) => {
  res.json({
    isScraping: false,
    lastScrapeTime: null,
    nextScheduledScrape: new Date(Date.now() + 3600000).toISOString()
  });
});

app.post('/api/v1/scrape/start', (req, res) => {
  res.json({
    message: 'Scraping completed',
    results: {
      amazon: 45,
      walmart: 32,
      bestbuy: 28
    }
  });
});

// Start server
const PORT = 3002;
app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api/v1/scrape/status`);
}); 