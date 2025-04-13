module.exports = {
    // MongoDB connection options
    options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
    },
    
    // Database name
    name: process.env.DB_NAME || 'price_tracker',
    
    // Collections
    collections: {
        products: 'products',
        scrapingHistory: 'scraping_history',
        priceHistory: 'price_history'
    },
    
    // Indexes
    indexes: {
        products: [
            { key: { name: 1 } },
            { key: { category: 1 } },
            { key: { source: 1 } },
            { key: { createdAt: -1 } }
        ],
        scrapingHistory: [
            { key: { timestamp: -1 } },
            { key: { source: 1 } }
        ],
        priceHistory: [
            { key: { productId: 1, timestamp: -1 } },
            { key: { price: 1 } }
        ]
    },
    
    // Data retention settings
    retention: {
        scrapingLogs: '30d', // Keep scraping logs for 30 days
        oldProducts: '90d'   // Archive products older than 90 days
    }
}; 