module.exports = {
    defaultInterval: 3600000,
    categories: [
        'laptop',
        // 'smartphone',
        // 'headphones',
        // 'tablet',
        // 'smartwatch'
    ],
    websitesr: [
        {
            name: 'amazon',
            url: 'https://www.amazon.com',
            searchUrl: 'https://www.amazon.com/s?k=',
            selectors: {
                productList: '.s-search-results',
                product: '[data-asin]',
                name: '.a-text-normal',
                price: '.a-price .a-offscreen',
                description: '.a-text-normal',
                rating: '.a-icon-alt',
                image: '.s-image',
                link: '.a-link-normal',
                category: '.a-color-tertiary'
            },
            pagination: {
                enabled: true,
                selector: '.s-pagination-strip',
                nextButton: '.s-pagination-next',
                maxPages: 1
            },
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        }
    ],
    options: {
        headless: "new",
        timeout: 1200000,
        retryAttempts: 3,
        retryDelay: 60000,
        viewport: {
            width: 1920,
            height: 1080
        },
        debug: false,
        screenshotOnError: true,
        waitForSelector: {
            productList: 30000,
            pagination: 30000
        },
        maxConcurrency: 5,
        retries: 3,
        delayBetweenRequests: 1000
    },
    validation: {
        minPrice: 0,
        maxPrice: 1000000,
        requiredFields: ['name', 'price', 'description'],
        maxProductsPerSearch: 100,
        priceFormat: /^\$?\d+(\.\d{2})?$/,
        imageUrlFormat: /^https?:\/\/.+\.(jpg|jpeg|png|webp)$/i
    },
    rateLimit: {
        requestsPerMinute: 20,
        delayBetweenRequests: 3000,
        maxConcurrentScrapes: 2,
        respectRobotsTxt: true
    },
    proxy: {
        enabled: false,
        list: [],
        rotateInterval: 1000,
        retryOnFailure: true
    },
    errorHandling: {
        maxRetries: 3,
        retryDelay: 5000,
        logErrors: true,
        notifyOnFailure: false,
        errorNotificationEmail: ''
    },
    schedule: process.env.SCRAPING_SCHEDULE || '0 */6 * * *',
    websites: {
        amazon: {
            baseUrl: 'https://www.amazon.com',
            searchPath: '/s',
            selectors: {
                product: '.s-result-item',
                title: '.a-text-normal',
                price: '.a-price-whole',
                rating: '.a-icon-star-small',
                image: '.s-image',
                link: '.a-link-normal'
            }
        }
    },
    timeout: 300000,
    retry: {
        attempts: 3,
        delay: 5000,
        maxDelay: 1200000
    },
    browser: {
        headless: "new",
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        viewport: {
            width: 1920,
            height: 1080
        }
    },
    errors: {
        timeout: 'Scraping operation timed out',
        network: 'Network error occurred',
        parsing: 'Error parsing product data',
        blocked: 'Access blocked by the website',
        invalid: 'Invalid scraping configuration'
    }
};
