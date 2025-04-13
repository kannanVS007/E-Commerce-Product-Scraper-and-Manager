# E-commerce Scraper Quick Reference

## Real-time Flow

### 1. Application Startup
```
npm run dev
```
- Server starts on port 3001
- Database service initializes
- Scraper service initializes
- Scheduled jobs are set up

### 2. Check Scraping Status
```
GET http://localhost:3001/api/v1/scrape/status
```
Response:
```json
{
  "isScraping": false,
  "lastScrapeTime": null,
  "nextScheduledScrape": "2023-04-12T00:00:00.000Z"
}
```

### 3. Start Scraping
```
POST http://localhost:3001/api/v1/scrape/start
```
Response:
```json
{
  "message": "Scraping completed",
  "results": {
    "amazon": 45,
    "walmart": 32,
    "bestbuy": 28
  }
}
```

### 4. Monitor Progress
Console output:
```
Starting scraping process
Scraping category: electronics
Scraping page 1
Scraping page 2
Scraping category: clothing
Scraping page 1
Scraping process completed successfully
```

### 5. View Results
```
GET http://localhost:3001/api/v1/products?limit=5
```
Response:
```json
{
  "products": [
    {
      "id": "1",
      "name": "Wireless Headphones",
      "price": 129.99,
      "description": "High-quality wireless headphones with noise cancellation",
      "category": "electronics",
      "rating": 4.5,
      "imageUrl": "https://example.com/headphones.jpg",
      "productUrl": "https://amazon.com/headphones",
      "source": "amazon",
      "createdAt": "2023-04-11T15:30:00.000Z"
    },
    // More products...
  ],
  "total": 105,
  "page": 1,
  "pages": 21
}
```

### 6. Scrape Specific Website
```
POST http://localhost:3001/api/v1/scrape/website/amazon
```
Response:
```json
{
  "message": "Scraping completed for amazon",
  "productsCount": 45
}
```

### 7. Filter Products
```
GET http://localhost:3001/api/v1/products?category=electronics&minPrice=100&maxPrice=200&rating=4
```

### 8. View Scraping Logs
Check `data/scraping_logs.json`:
```json
[
  {
    "timestamp": "2023-04-11T15:30:00.000Z",
    "status": "success",
    "website": "amazon",
    "category": "electronics",
    "productsScraped": 45
  },
  {
    "timestamp": "2023-04-11T15:35:00.000Z",
    "status": "success",
    "website": "walmart",
    "category": "clothing",
    "productsScraped": 32
  }
]
```

## Common API Endpoints

### Products
- `GET /api/v1/products` - Get all products
- `GET /api/v1/products/:id` - Get product by ID
- `POST /api/v1/products` - Create product
- `PUT /api/v1/products/:id` - Update product
- `DELETE /api/v1/products/:id` - Delete product
- `GET /api/v1/products/website/:website` - Get products by website
- `GET /api/v1/products/price-range/:min/:max` - Get products by price range

### Scraping
- `POST /api/v1/scrape/start` - Start scraping all websites
- `GET /api/v1/scrape/status` - Get scraping status
- `POST /api/v1/scrape/website/:website` - Scrape specific website
- `GET /api/v1/scrape/config` - Get scraping configuration

## Troubleshooting Commands

### Check if Server is Running
```
GET http://localhost:3001/api/v1/scrape/status
```

### Restart Scraping if Stuck
```
POST http://localhost:3001/api/v1/scrape/start
```

### Clear Database (if needed)
Delete the following files:
- `data/products.json`
- `data/scraping_logs.json`

### Enable Debug Mode
Edit `config/scraping.config.js`:
```javascript
options: {
    debug: true,
    headless: false
}
```

## Scheduled Tasks
- Scraping runs every hour
- Logs are cleaned daily at midnight 