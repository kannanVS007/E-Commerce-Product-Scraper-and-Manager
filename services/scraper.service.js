const puppeteer = require('puppeteer');

const Product = require('../models/Product');
const db = require('./database.service');
const scrapingConfig = require('../config/scraping.config');
const logger = require('../utils/logger');
const retry = require('../utils/retry');

class ScraperService {
    constructor() {
        this.browser = null;
        this.isScraping = false;
        this.lastScrapeTime = null;
        this.nextScheduledScrape = null;
        this.currentCategory = null;
    }

    async initialize() {
        try {
            logger.info('Initializing scraper service...');
            this.browser = await puppeteer.launch({
                ...scrapingConfig.options,
                headless: false,
                // executablePath: 'C:\\Users\\User\\Downloads\\chrome-win\\chrome-win\\chrome.exe',
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
            logger.info('Scraper service initialized successfully');
        } catch (error) {
            logger.error('Failed to initialize scraper service:', error);
            throw error;
        }
    }

    async close() {
        if (this.browser) {
            await this.browser.close();
        }
    }

    async scrapeWebsite(websiteConfig, category = null) {
        if (this.isScraping) {
            throw new Error('Scraping already in progress');
        }

        this.isScraping = true;
        this.currentCategory = category;
        const page = await this.browser.newPage();

        try {
            // Set viewport and user agent
            await page.setViewport(scrapingConfig.options.viewport);
            await page.setExtraHTTPHeaders(websiteConfig.headers || {});

            // Navigate to search page if category is provided
            const url = category
                ? `${websiteConfig.searchUrl}${encodeURIComponent(category)}`
                : websiteConfig.url;

            logger.info(`Navigating to ${url}`);
            await retry(async () => {
                await page.goto(url, { waitUntil: 'domcontentloaded', timeout: scrapingConfig.options.timeout });
            }, {
                operation: 'pageNavigation',
                maxAttempts: scrapingConfig.options.retryAttempts
            });

            // Wait for product list to load with retry
            await retry(async () => {
                await page.waitForSelector(websiteConfig.selectors.productList, {
                    timeout: scrapingConfig.options.waitForSelector.productList
                });
                logger.info('Product list loaded successfully');
            }, {
                operation: 'waitForProductList',
                maxAttempts: scrapingConfig.options.retryAttempts,
                delay: scrapingConfig.options.retryDelay
            });

            const products = await this.extractProducts(page, websiteConfig);
            await this.saveProducts(products, websiteConfig.name);

            // Log the scraping activity
            await db.addScrapingLog({
                website: websiteConfig.name,
                category: category,
                productsCount: products.length,
                status: 'success'
            });

            return products;
        } catch (error) {
            logger.error(`Error scraping ${websiteConfig.name}:`, error);

            // Take screenshot if enabled
            if (scrapingConfig.options.screenshotOnError) {
                try {
                    await page.screenshot({
                        path: `error-${websiteConfig.name}-${Date.now()}.png`,
                        fullPage: true
                    });
                } catch (screenshotError) {
                    logger.error('Failed to take error screenshot:', screenshotError);
                }
            }

            // Log the error
            await db.addScrapingLog({
                website: websiteConfig.name,
                category: category,
                status: 'error',
                error: error.message
            });

            throw error;
        } finally {
            await page.close();
            this.isScraping = false;
            this.lastScrapeTime = new Date().toISOString();
            this.currentCategory = null;
        }
    }

    async extractProducts(page, websiteConfig) {
        const { selectors } = websiteConfig;
        const products = [];
        let currentPage = 1;

        do {
            // Wait for product elements to load with retry
            await retry(async () => {
                await page.waitForSelector(selectors.product, {
                    timeout: scrapingConfig.options.timeout
                });
                logger.info('Product elements loaded successfully');
            }, {
                operation: 'waitForProducts',
                maxAttempts: scrapingConfig.options.retryAttempts,
                delay: scrapingConfig.options.retryDelay
            });

            // Wait a bit for dynamic content to load
            await page.waitForTimeout(1000);

            const productElements = await page.$$(selectors.product);
            logger.debug(`Found ${productElements.length} products on page ${currentPage}`);

            for (const element of productElements) {
                try {
                    const product = await this.extractProductData(element, selectors);
                    if (this.validateProduct(product)) {
                        const productUrl = await this.getElementAttribute(element, selectors.link, 'href');
                        products.push({
                            ...product,
                            source: {
                                website: websiteConfig.name,
                                url: productUrl ? new URL(productUrl, websiteConfig.url).href : '',
                                category: this.currentCategory
                            }
                        });

                        logger.debug(`Successfully extracted product: ${product.name}`);
                    }

                    // Check if we've reached the maximum products limit
                    if (products.length >= scrapingConfig.validation.maxProductsPerSearch) {
                        logger.info(`Reached maximum products limit (${scrapingConfig.validation.maxProductsPerSearch})`);
                        return products;
                    }
                } catch (error) {
                    logger.error('Error extracting product:', error);
                }
            }

            // Handle pagination
            if (websiteConfig.pagination.enabled &&
                currentPage < websiteConfig.pagination.maxPages) {
                const hasNextPage = await this.goToNextPage(page, websiteConfig.pagination);
                if (!hasNextPage) {
                    logger.info('No more pages to scrape');
                    break;
                }
                currentPage++;
                logger.info(`Moving to page ${currentPage}`);

                // Wait for page load after navigation
                await page.waitForTimeout(2000);
            } else {
                break;
            }
        } while (true);

        return products;
    }

    async extractProductData(element, selectors) {
        const name = await this.getElementText(element, selectors.name);
        const priceText = await this.getElementText(element, selectors.price);
        const description = await this.getElementText(element, selectors.description);
        const ratingText = await this.getElementText(element, selectors.rating);
        const imageUrl = await this.getElementAttribute(element, selectors.image, 'src');

        return {
            name: name || '',
            price: this.parsePrice(priceText),
            description: description || name || '',
            rating: this.parseRating(ratingText),
            images: imageUrl ? [{ url: imageUrl, alt: name }] : []
        };
    }

    async getElementText(element, selector) {
        try {
            const text = await retry(async () => {
                const el = await element.$(selector);
                if (!el) return '';
                return el.evaluate(node => node.textContent.trim());
            }, {
                operation: 'getElementText',
                maxAttempts: scrapingConfig.options.retryAttempts,
                delay: scrapingConfig.options.retryDelay
            });
            return text;
        } catch (error) {
            logger.debug(`Element not found for selector ${selector}`);
            return '';
        }
    }

    async getElementAttribute(element, selector, attribute) {
        try {
            const value = await retry(async () => {
                const el = await element.$(selector);
                if (!el) return '';
                return el.evaluate((node, attr) => node.getAttribute(attr), attribute);
            }, {
                operation: 'getElementAttribute',
                maxAttempts: scrapingConfig.options.retryAttempts,
                delay: scrapingConfig.options.retryDelay
            });
            return value || '';
        } catch (error) {
            logger.debug(`Attribute ${attribute} not found for selector ${selector}`);
            return '';
        }
    }

    parsePrice(priceText) {
        if (!priceText) return 0;
        const match = priceText.match(/[\d,.]+/);
        return match ? parseFloat(match[0].replace(/,/g, '')) : 0;
    }

    parseRating(ratingText) {
        if (!ratingText) return 0;
        const match = ratingText.match(/(\d+(\.\d+)?)/);
        return match ? parseFloat(match[1]) : 0;
    }

    async goToNextPage(page, pagination) {
        try {
            const nextButton = await page.$(pagination.nextButton);
            if (nextButton) {
                await nextButton.click();
                await page.waitForNavigation({ waitUntil: 'networkidle0' });
                return true;
            }
            return false;
        } catch (error) {
            logger.error('Error navigating to next page:', error);
            return false;
        }
    }

    validateProduct(product) {
        const { validation } = scrapingConfig;

        if (!product.name || !product.price || !product.description) {
            return false;
        }

        if (product.price < validation.minPrice || product.price > validation.maxPrice) {
            return false;
        }

        return true;
    }

    async saveProducts(products, website) {
        for (const product of products) {
            try {
                const existingProducts = await Product.find({
                    'source.website': website,
                    'source.url': product.source.url
                });

                if (existingProducts.length > 0) {
                    const existingProduct = new Product(existingProducts[0]);
                    await existingProduct.updateFromScrape(product);
                } else {
                    const newProduct = new Product(product);
                    await newProduct.save();
                }

                // Add delay between saves to respect rate limiting
                await new Promise(resolve =>
                    setTimeout(resolve, scrapingConfig.rateLimit.delayBetweenRequests)
                );
            } catch (error) {
                logger.error('Error saving product:', error);
            }
        }
    }

    async scrapeAllWebsites() {
        const results = [];
        console.log('hhhhhhhhhhhhhhhhhhhhhh', scrapingConfig?.websites);
        for (const website of scrapingConfig?.websitesr) {
            for (const category of scrapingConfig.categories) {
                try {
                    const products = await this.scrapeWebsite(website, category);
                    results.push({
                        website: website.name,
                        category: category,
                        success: true,
                        productsCount: products.length
                    });
                } catch (error) {
                    results.push({
                        website: website.name,
                        category: category,
                        success: false,
                        error: error.message
                    });
                }
            }
        }
        return results;
    }
}

module.exports = new ScraperService(); 