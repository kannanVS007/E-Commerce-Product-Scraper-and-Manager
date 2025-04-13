module.exports = {
    // API version
    version: 'v1',
    
    // Base path for all API routes
    basePath: '/api/v1',
    
    // CORS configuration
    cors: {
        origin: process.env.CORS_ORIGIN || '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        exposedHeaders: ['Content-Range', 'X-Content-Range'],
        credentials: true,
        maxAge: 86400
    },
    
    // Rate limiting
    rateLimit: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100 // limit each IP to 100 requests per windowMs
    },
    
    // Pagination defaults
    pagination: {
        defaultLimit: 10,
        maxLimit: 100
    },
    
    // Response timeout
    timeout: 1200000, // 30 seconds
    
    // Error messages
    errors: {
        notFound: 'Resource not found',
        badRequest: 'Bad request',
        unauthorized: 'Unauthorized',
        forbidden: 'Forbidden',
        serverError: 'Internal server error'
    },
    
    // Response formats
    responseFormats: ['json', 'xml'],
    
    // API documentation
    docs: {
        enabled: true,
        path: '/docs'
    },
    
    // Error handling
    errorHandling: {
        logErrors: true,
        showStack: process.env.NODE_ENV === 'development'
    }
}; 