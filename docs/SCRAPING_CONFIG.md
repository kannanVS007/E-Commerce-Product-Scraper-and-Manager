# Scraping Configuration Guide

This document provides detailed information about configuring the web scraping functionality for different e-commerce websites.

## Table of Contents
1. [Configuration Structure](#configuration-structure)
2. [Supported Websites](#supported-websites)
3. [Selector Guide](#selector-guide)
4. [Rate Limiting](#rate-limiting)
5. [Data Validation](#data-validation)
6. [Troubleshooting](#troubleshooting)

## Configuration Structure

The scraping configuration is defined in `config/scraping.config.js` and consists of the following main sections:

```javascript
{
    defaultInterval: 3600000,  // Default scraping interval (1 hour)
    websites: [...],          // Website configurations
    options: {...},           // Scraping options
    validation: {...},        // Data validation rules
    categories: [...],        // Search categories
    rateLimit: {...}          // Rate limiting settings
}
```

## Supported Websites

### 1. Amazon
```javascript
{
    name: 'amazon',
    url: 'https://www.amazon.com',
    searchUrl: 'https://www.amazon.com/s?k=',
    selectors: {
        productList: '#search > div.s-desktop-width-max > div.sg-row > div.sg-col-4-of-12.sg-col-8-of-16.sg-col-16-of-24.sg-col-12-of-20.sg-col-24-of-32.sg-col.sg-col-12-of-16.sg-col-8-of-8.sg-col-12-of-20.sg-col-12-of-24',
        product: 'div[data-component-type="s-search-result"]',
        name: 'h2 a.a-link-normal',
        price: 'span.a-price > span.a-offscreen',
        description: 'div.a-section.a-spacing-none.a-padding-none > span.a-size-base-plus',
        rating: 'span[aria-label*="stars"]',
        image: 'img.s-image',
        link: 'h2 a.a-link-normal',
        category: 'span.a-color-secondary'
    }
}
```

### 2. Best Buy
```javascript
{
    name: 'bestbuy',
    url: 'https://www.bestbuy.com',
    searchUrl: 'https://www.bestbuy.com/site/searchpage.jsp?st=',
    selectors: {
        productList: '.sku-item-list',
        product: '.sku-item',
        name: '.sku-title a',
        price: '.priceView-customer-price span',
        description: '.sku-description',
        rating: '.ratings-score',
        image: '.product-image img',
        link: '.sku-title a',
        category: '.breadcrumb-item'
    }
}
```

### 3. Walmart
```javascript
{
    name: 'walmart',
    url: 'https://www.walmart.com',
    searchUrl: 'https://www.walmart.com/search?q=',
    selectors: {
        productList: '.product-grid',
        product: '.product-tile',
        name: '.product-title-link',
        price: '.price-main',
        description: '.product-description',
        rating: '.stars-rating',
        image: '.product-image img',
        link: '.product-title-link',
        category: '.breadcrumb-item'
    }
}
```

## Selector Guide

### Common Selector Types
1. **Product List**: Container for all products on the page
2. **Product**: Individual product container
3. **Name**: Product title/name
4. **Price**: Product price
5. **Description**: Product description
6. **Rating**: Product rating/reviews
7. **Image**: Product image URL
8. **Link**: Product detail page URL
9. **Category**: Product category

### Selector Best Practices
1. Use unique identifiers when possible (IDs, data attributes)
2. Avoid overly specific selectors that might break with minor site changes
3. Test selectors with browser developer tools
4. Include fallback selectors for important data
5. Consider mobile and desktop layouts

## Rate Limiting

To avoid being blocked by websites, configure rate limiting:

```javascript
rateLimit: {
    requestsPerMinute: 20,    // Maximum requests per minute
    delayBetweenRequests: 3000 // Delay between requests in milliseconds
}
```

## Data Validation

Configure validation rules to ensure data quality:

```javascript
validation: {
    minPrice: 0,              // Minimum acceptable price
    maxPrice: 1000000,        // Maximum acceptable price
    requiredFields: [          // Required fields for each product
        'name',
        'price',
        'description'
    ],
    maxProductsPerSearch: 100  // Maximum products to scrape per search
}
```

## Troubleshooting

### Common Issues and Solutions

1. **Selector Not Found**
   - Check if the website structure has changed
   - Verify the selector in browser developer tools
   - Try alternative selectors

2. **Rate Limiting**
   - Increase delay between requests
   - Reduce requests per minute
   - Use rotating proxies if necessary

3. **Missing Data**
   - Check if the field is present on the page
   - Verify selector accuracy
   - Consider adding fallback selectors

4. **Scraping Blocked**
   - Update User-Agent string
   - Implement proper delays
   - Consider using proxy servers
   - Check website's robots.txt

### Debugging Tips

1. Enable debug logging:
   ```javascript
   options: {
       debug: true,
       headless: false  // Set to false to see browser
   }
   ```

2. Test selectors manually:
   ```javascript
   // In browser console
   document.querySelector('your-selector')
   ```

3. Monitor network requests:
   - Use browser developer tools
   - Check for blocked requests
   - Verify response status codes

## Adding New Websites

To add a new website:

1. Analyze the website structure
2. Identify key selectors
3. Test selectors manually
4. Add configuration to `websites` array
5. Test scraping with new configuration
6. Adjust rate limiting if needed

Example:
```javascript
{
    name: 'newstore',
    url: 'https://www.newstore.com',
    searchUrl: 'https://www.newstore.com/search?q=',
    selectors: {
        // Add selectors here
    }
}
``` 