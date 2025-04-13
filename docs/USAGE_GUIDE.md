# E-commerce Scraper Usage Guide

This guide provides step-by-step instructions for using the e-commerce scraper application, including setup, configuration, and real-time usage.

## Table of Contents
1. [Installation](#installation)
2. [Configuration](#configuration)
3. [Starting the Application](#starting-the-application)
4. [Using the API](#using-the-api)
5. [Monitoring Scraping](#monitoring-scraping)
6. [Troubleshooting](#troubleshooting)
7. [Advanced Usage](#advanced-usage)

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm (Node Package Manager)

### Setup Steps
1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/ecommerce-scraper.git
   cd ecommerce-scraper
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory:
   ```
   PORT=3001
   NODE_ENV=development
   LOG_LEVEL=debug
   API_BASE_PATH=/api/v1
   SHOW_STACK_TRACE=true
   DB_PATH=./data
   PRODUCTS_FILE=products.json
   LOGS_FILE=scraping_logs.json
   MAX_CONCURRENT_SCRAPES=2
   SCRAPE_INTERVAL=3600
   RETRY_ATTEMPTS=3
   RETRY_DELAY=1000
   ```

## Configuration

### Website Configuration
1. Open `config/scraping.config.js`
2. Review the existing website configurations (Amazon, Best Buy, Walmart, etc.)
3. To add a new website:
   - Analyze the website structure using browser developer tools
   - Identify the CSS selectors for product elements
   - Add a new entry to the `websites` array following the existing format

### Scraping Options
1. Adjust scraping options in `config/scraping.config.js`:
   - `headless`: Set to `false` to see the browser during scraping
   - `timeout`: Increase if scraping is timing out
   - `retryAttempts`: Number of retries for failed operations
   - `viewport`: Browser window size

### Rate Limiting
1. Configure rate limiting to avoid being blocked:
   - `requestsPerMinute`: Maximum requests per minute
   - `delayBetweenRequests`: Delay between requests in milliseconds
   - `maxConcurrentScrapes`: Maximum number of concurrent scraping operations

## Starting the Application

### Development Mode
```bash
npm run dev
```
This starts the application with nodemon, which automatically restarts when files change.

### Production Mode
```bash
npm start
```
This starts the application in production mode.

### Verifying the Application is Running
1. Check the console output for:
   - "Server is running on port 3001"
   - "Database service initialized successfully"
   - "Scraper service initialized successfully"
   - "Services initialized successfully"

2. The application is ready when you see these messages.

## Using the API

### Product Endpoints

#### 1. Get All Products
```
GET http://localhost:3001/api/v1/products
```
Query parameters:
- `page`: Page number (default: 1)
- `limit`: Products per page (default: 10)
- `sort`: Sort field (default: -createdAt)
- `minPrice`: Minimum price filter
- `maxPrice`: Maximum price filter
- `category`: Category filter
- `rating`: Minimum rating filter

Example:
```
GET http://localhost:3001/api/v1/products?page=1&limit=20&category=electronics&minPrice=100&maxPrice=500&rating=4
```

#### 2. Get Product by ID
```
GET http://localhost:3001/api/v1/products/:id
```
Replace `:id` with the actual product ID.

#### 3. Create Product
```
POST http://localhost:3001/api/v1/products
```
Request body:
```json
{
  "name": "Sample Product",
  "price": 99.99,
  "description": "Product description",
  "category": "electronics",
  "rating": 4.5,
  "imageUrl": "https://example.com/image.jpg",
  "productUrl": "https://example.com/product",
  "source": "example-store"
}
```

#### 4. Update Product
```
PUT http://localhost:3001/api/v1/products/:id
```
Request body:
```json
{
  "price": 89.99,
  "description": "Updated description"
}
```

#### 5. Delete Product
```
DELETE http://localhost:3001/api/v1/products/:id
```

#### 6. Get Products by Website
```
GET http://localhost:3001/api/v1/products/website/:website
```
Replace `:website` with the website name (e.g., amazon, walmart).

#### 7. Get Products by Price Range
```
GET http://localhost:3001/api/v1/products/price-range/:min/:max
```
Replace `:min` and `:max` with the price range.

### Scraping Endpoints

#### 1. Start Scraping
```
POST http://localhost:3001/api/v1/scrape/start
```
This triggers scraping for all configured websites.

#### 2. Get Scraping Status
```
GET http://localhost:3001/api/v1/scrape/status
```
Returns the current scraping status, including:
- `isScraping`: Whether scraping is in progress
- `lastScrapeTime`: When the last scrape was performed
- `nextScheduledScrape`: When the next scheduled scrape will occur

#### 3. Scrape Specific Website
```
POST http://localhost:3001/api/v1/scrape/website/:website
```
Replace `:website` with the website name (e.g., amazon, walmart).

#### 4. Get Scraping Configuration
```
GET http://localhost:3001/api/v1/scrape/config
```
Returns the current scraping configuration.

## Monitoring Scraping

### Real-time Monitoring
1. Start the application
2. Use the scraping status endpoint to check if scraping is in progress:
   ```
   GET http://localhost:3001/api/v1/scrape/status
   ```

3. Trigger a scraping operation:
   ```
   POST http://localhost:3001/api/v1/scrape/start
   ```

4. Monitor the console output for:
   - "Starting scraping process"
   - "Scraping category: [category]"
   - "Scraping page [number]"
   - "Scraping process completed successfully"

5. Check the database for scraped products:
   ```
   GET http://localhost:3001/api/v1/products
   ```

### Scheduled Scraping
The application automatically runs scraping jobs:
- Every hour (configurable in `app.js`)
- Logs are cleaned daily at midnight

## Troubleshooting

### Common Issues

#### 1. Application Won't Start
- Check if port 3001 is already in use
- Verify all dependencies are installed
- Check for syntax errors in configuration files

#### 2. Scraping Fails
- Check if the website structure has changed
- Verify selectors in `scraping.config.js`
- Increase timeout values if scraping is timing out
- Check rate limiting settings

#### 3. Missing Data
- Verify selectors in browser developer tools
- Check if the website requires authentication
- Consider adding fallback selectors

### Debugging Steps

1. Enable debug mode:
   - Set `debug: true` in `scraping.config.js`
   - Set `headless: false` to see the browser

2. Check logs:
   - Application logs are in the console
   - Scraping logs are stored in `data/scraping_logs.json`

3. Test selectors manually:
   - Open the website in a browser
   - Use developer tools to test selectors
   - Update selectors in `scraping.config.js` if needed

## Advanced Usage

### Customizing Scraping Behavior

#### 1. Adding Custom Headers
Edit the `headers` section in `scraping.config.js`:
```javascript
headers: {
    'User-Agent': 'Custom User Agent',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
}
```

#### 2. Using Proxies
Enable proxy support in `scraping.config.js`:
```javascript
proxy: {
    enabled: true,
    list: [
        'http://proxy1.example.com:8080',
        'http://proxy2.example.com:8080'
    ],
    rotateInterval: 1000,
    retryOnFailure: true
}
```

#### 3. Adding Custom Validation Rules
Edit the `validation` section in `scraping.config.js`:
```javascript
validation: {
    minPrice: 10,
    maxPrice: 5000,
    requiredFields: ['name', 'price', 'description', 'imageUrl'],
    maxProductsPerSearch: 200,
    priceFormat: /^\$?\d+(\.\d{2})?$/,
    imageUrlFormat: /^https?:\/\/.+\.(jpg|jpeg|png|webp)$/i
}
```

### Extending the Application

#### 1. Adding a New Website
1. Analyze the website structure
2. Identify selectors using browser developer tools
3. Add a new entry to the `websites` array in `scraping.config.js`
4. Test the scraping with the new configuration

#### 2. Adding Custom Data Processing
1. Edit the `extractProducts` method in `services/scraper.service.js`
2. Add custom data processing logic
3. Test the changes

#### 3. Implementing Custom Scheduling
1. Edit the cron schedules in `app.js`
2. Add custom scheduling logic
3. Test the changes

## Real-time Flow Example

Here's a step-by-step example of the real-time flow:

1. **Start the Application**
   ```bash
   npm run dev
   ```
   - Server starts on port 3001
   - Database service initializes
   - Scraper service initializes
   - Scheduled jobs are set up

2. **Check Initial Status**
   ```
   GET http://localhost:3001/api/v1/scrape/status
   ```
   - Verify `isScraping` is false
   - Note the `lastScrapeTime` (null if first run)

3. **Start a Scraping Operation**
   ```
   POST http://localhost:3001/api/v1/scrape/start
   ```
   - Scraper service begins scraping
   - Console shows "Starting scraping process"
   - Database is updated with new products

4. **Monitor Progress**
   ```
   GET http://localhost:3001/api/v1/scrape/status
   ```
   - `isScraping` should be true
   - Console shows progress for each category

5. **Check Results**
   ```
   GET http://localhost:3001/api/v1/products
   ```
   - View scraped products
   - Filter by category, price, etc.

6. **Scrape a Specific Website**
   ```
   POST http://localhost:3001/api/v1/scrape/website/amazon
   ```
   - Scraper focuses on Amazon only
   - Console shows Amazon-specific progress

7. **View Scraping Logs**
   - Check `data/scraping_logs.json` for detailed logs
   - Review success/failure information

8. **Wait for Scheduled Scraping**
   - Application automatically runs scraping every hour
   - Logs are cleaned daily at midnight

This completes the real-time flow of using the e-commerce scraper application. 