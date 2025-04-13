const fs = require('fs').promises;
const path = require('path');
const logger = require('../utils/logger');
const retry = require('../utils/retry');

/**
 * Service for handling file-based database operations
 * Provides CRUD operations for products and scraping logs
 */
class DatabaseService {
    constructor() {
        this.dbPath = path.join(__dirname, '../data');
        this.productsPath = path.join(this.dbPath, 'products.json');
        this.logsPath = path.join(this.dbPath, 'scraping_logs.json');
        this.initialized = false;
    }

    /**
     * Initialize the database service
     * Creates necessary directories and files if they don't exist
     */
    async initialize() {
        try {
            logger.info('Initializing database service...');
            await fs.mkdir(this.dbPath, { recursive: true });
            
            // Initialize products file if it doesn't exist
            try {
                await fs.access(this.productsPath);
                logger.debug('Products file exists');
            } catch {
                logger.info('Creating products file');
                await fs.writeFile(this.productsPath, JSON.stringify([]));
            }

            // Initialize logs file if it doesn't exist
            try {
                await fs.access(this.logsPath);
                logger.debug('Logs file exists');
            } catch {
                logger.info('Creating logs file');
                await fs.writeFile(this.logsPath, JSON.stringify([]));
            }

            this.initialized = true;
            logger.info('Database service initialized successfully');
        } catch (error) {
            logger.error('Database initialization error:', error);
            throw error;
        }
    }

    /**
     * Read all products from the database
     * @returns {Promise<Array>} Array of products
     */
    async readProducts() {
        return await retry(async () => {
            try {
                const data = await fs.readFile(this.productsPath, 'utf8');
                return JSON.parse(data);
            } catch (error) {
                logger.error('Error reading products:', error);
                return [];
            }
        }, {
            operation: 'readProducts',
            maxAttempts: 3
        });
    }

    /**
     * Write products to the database
     * @param {Array} products - Array of products to write
     */
    async writeProducts(products) {
        await retry(async () => {
            try {
                await fs.writeFile(this.productsPath, JSON.stringify(products, null, 2));
                logger.debug(`Successfully wrote ${products.length} products to database`);
            } catch (error) {
                logger.error('Error writing products:', error);
                throw error;
            }
        }, {
            operation: 'writeProducts',
            maxAttempts: 3
        });
    }

    /**
     * Find products based on query criteria
     * @param {Object} query - Query criteria
     * @returns {Promise<Array>} Array of matching products
     */
    async findProducts(query = {}) {
        const products = await this.readProducts();
        console.log('HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH', products);
        logger.debug(`Finding products with query: ${JSON.stringify(query)}`);
        
        return products.filter(product => {
            return Object.entries(query).every(([key, value]) => {
                if (typeof value === 'object' && value !== null) {
                    if (value.$gte !== undefined) {
                        return product[key] >= value.$gte;
                    }
                    if (value.$lte !== undefined) {
                        return product[key] <= value.$lte;
                    }
                }
                return product[key] === value;
            });
        });
    }

    /**
     * Find a product by ID
     * @param {string} id - Product ID
     * @returns {Promise<Object|null>} Product or null if not found
     */
    async findProductById(id) {
        const products = await this.readProducts();
        const product = products.find(p => p._id === id);
        
        if (product) {
            logger.debug(`Found product with ID: ${id}`);
        } else {
            logger.debug(`No product found with ID: ${id}`);
        }
        
        return product;
    }

    /**
     * Create a new product
     * @param {Object} product - Product data
     * @returns {Promise<Object>} Created product
     */
    async createProduct(product) {
        const products = await this.readProducts();
        console.log('llllllllllllllllllllllllll111111111111111111111111111111111111',products );
        const newProduct = {
            _id: Date.now().toString(),
            ...product,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        console.log('lllllllllllllllllllllllll',newProduct );
        
        products.push(newProduct);
        await this.writeProducts(products);
        
        logger.info(`Created new product with ID: ${products}`);
        return newProduct;
    }

    /**
     * Update an existing product
     * @param {string} id - Product ID
     * @param {Object} updates - Product updates
     * @returns {Promise<Object|null>} Updated product or null if not found
     */
    async updateProduct(id, updates) {
        const products = await this.readProducts();
        const index = products.findIndex(p => p._id === id);
        
        if (index === -1) {
            logger.warn(`No product found with ID: ${id} for update`);
            return null;
        }

        products[index] = {
            ...products[index],
            ...updates,
            updatedAt: new Date().toISOString()
        };

        await this.writeProducts(products);
        logger.info(`Updated product with ID: ${id}`);
        
        return products[index];
    }

    /**
     * Delete a product
     * @param {string} id - Product ID
     * @returns {Promise<boolean>} True if deleted, false if not found
     */
    async deleteProduct(id) {
        const products = await this.readProducts();
        const initialLength = products.length;
        
        const filteredProducts = products.filter(p => p._id !== id);
        
        if (filteredProducts.length === initialLength) {
            logger.warn(`No product found with ID: ${id} for deletion`);
            return false;
        }

        await this.writeProducts(filteredProducts);
        logger.info(`Deleted product with ID: ${id}`);
        
        return true;
    }

    /**
     * Add a scraping log entry
     * @param {Object} log - Log entry data
     */
    async addScrapingLog(log) {
        await retry(async () => {
            try {
                const logs = await this.readLogs();
                logs.push({
                    ...log,
                    timestamp: new Date().toISOString()
                });
                await fs.writeFile(this.logsPath, JSON.stringify(logs, null, 2));
                logger.debug('Added scraping log entry');
            } catch (error) {
                logger.error('Error adding scraping log:', error);
                throw error;
            }
        }, {
            operation: 'addScrapingLog',
            maxAttempts: 3
        });
    }

    /**
     * Read all scraping logs
     * @returns {Promise<Array>} Array of log entries
     */
    async readLogs() {
        return await retry(async () => {
            try {
                const data = await fs.readFile(this.logsPath, 'utf8');
                return JSON.parse(data);
            } catch (error) {
                logger.error('Error reading logs:', error);
                return [];
            }
        }, {
            operation: 'readLogs',
            maxAttempts: 3
        });
    }

    /**
     * Clean old log entries
     * @param {number} days - Number of days to keep logs for
     */
    async cleanOldLogs(days) {
        await retry(async () => {
            try {
                const logs = await this.readLogs();
                const cutoffDate = new Date();
                cutoffDate.setDate(cutoffDate.getDate() - days);
                
                const initialCount = logs.length;
                const filteredLogs = logs.filter(log => 
                    new Date(log.timestamp) > cutoffDate
                );
                
                await fs.writeFile(this.logsPath, JSON.stringify(filteredLogs, null, 2));
                logger.info(`Cleaned ${initialCount - filteredLogs.length} old log entries`);
            } catch (error) {
                logger.error('Error cleaning old logs:', error);
                throw error;
            }
        }, {
            operation: 'cleanOldLogs',
            maxAttempts: 3
        });
    }
}

module.exports = new DatabaseService(); 