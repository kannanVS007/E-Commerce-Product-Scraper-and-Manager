# E-commerce Product Scraper

A Node.js application that scrapes product details from e-commerce websites, stores them in a file-based database, and provides a RESTful API for data access.

## Features

- Automated product scraping using Puppeteer
- Periodic data updates (configurable intervals)
- File-based data storage (JSON)
- RESTful API for CRUD operations
- Configurable scraping parameters
- Error handling and logging
- Scalable architecture

## Project Structure

```
ecommerce-scraper/
├── config/             # Configuration files
├── data/              # JSON data storage
├── models/            # Data models
├── routes/            # API routes
├── services/          # Business logic
├── utils/             # Utility functions
└── src/              # Application source code
```

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ecommerce-scraper
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```
PORT=3000
SCRAPE_INTERVAL=3600000  # Scraping interval in milliseconds
DATA_DIR=./data  # Directory for storing JSON files
```

## Configuration

The application can be configured through the following files:

- `config/scraping.config.js`: Configure scraping parameters
- `config/api.config.js`: API configuration

## API Endpoints

### Products

- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get a specific product
- `POST /api/products` - Create a new product
- `PUT /api/products/:id` - Update a product
- `DELETE /api/products/:id` - Delete a product

### Scraping

- `POST /api/scrape/start` - Trigger manual scraping
- `GET /api/scrape/status` - Get scraping status
- `POST /api/scrape/website/:website` - Scrape specific website
- `GET /api/scrape/config` - Get scraping configuration

## Usage

1. Start the server:
```bash
npm start
```

2. For development:
```bash
npm run dev
```

## Dependencies

- express: Web framework
- puppeteer: Web scraping
- node-cron: Task scheduling
- dotenv: Environment variables
- cors: Cross-origin resource sharing
- helmet: Security headers
- morgan: HTTP request logging

## Data Storage

The application uses a file-based storage system with JSON files:
- `data/products.json`: Stores product data
- `data/scraping_logs.json`: Stores scraping activity logs

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License. 