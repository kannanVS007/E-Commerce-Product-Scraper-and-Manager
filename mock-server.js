const express = require('express');
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mock data
const mockProducts = [
  {
    id: '1',
    name: 'Wireless Headphones',
    price: 129.99,
    description: 'High-quality wireless headphones with noise cancellation',
    category: 'electronics',
    rating: 4.5,
    imageUrl: 'https://example.com/headphones.jpg',
    productUrl: 'https://amazon.com/headphones',
    source: 'amazon',
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Smartphone',
    price: 699.99,
    description: 'Latest smartphone with advanced features',
    category: 'electronics',
    rating: 4.8,
    imageUrl: 'https://example.com/smartphone.jpg',
    productUrl: 'https://walmart.com/smartphone',
    source: 'walmart',
    createdAt: new Date().toISOString()
  }
];

// Routes
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

app.get('/api/v1/products', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  
  const paginatedProducts = mockProducts.slice(startIndex, endIndex);
  
  res.json({
    products: paginatedProducts,
    total: mockProducts.length,
    page: page,
    pages: Math.ceil(mockProducts.length / limit)
  });
});

app.get('/api/v1/products/:id', (req, res) => {
  const product = mockProducts.find(p => p.id === req.params.id);
  
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  
  res.json(product);
});

// Start server
const PORT = 3003;
app.listen(PORT, () => {
  console.log(`Mock server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api/v1/scrape/status`);
}); 