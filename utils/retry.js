const logger = require('./logger');

/**
 * Retry a function with exponential backoff
 * @param {Function} fn - The function to retry
 * @param {Object} options - Retry options
 * @param {number} options.maxAttempts - Maximum number of retry attempts
 * @param {number} options.initialDelay - Initial delay in milliseconds
 * @param {number} options.maxDelay - Maximum delay in milliseconds
 * @param {Function} options.shouldRetry - Function to determine if retry should be attempted
 * @param {string} options.operation - Name of the operation for logging
 * @returns {Promise<any>} - Result of the function
 */
async function retry(fn, options = {}) {
    const {
        maxAttempts = 3,
        initialDelay = 1000,
        maxDelay = 10000,
        shouldRetry = () => true,
        operation = 'operation'
    } = options;

    let attempt = 1;
    let delay = initialDelay;

    while (attempt <= maxAttempts) {
        try {
            return await fn();
        } catch (error) {
            const isLastAttempt = attempt === maxAttempts;
            const shouldAttemptRetry = shouldRetry(error) && !isLastAttempt;

            logger.error(`Error in ${operation} (attempt ${attempt}/${maxAttempts}): ${error.message}`);
            if (error.stack) {
                logger.debug(`Stack trace: ${error.stack}`);
            }

            if (!shouldAttemptRetry) {
                throw error;
            }

            logger.info(`Retrying ${operation} in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));

            // Exponential backoff with jitter
            delay = Math.min(delay * 2 * (0.5 + Math.random()), maxDelay);
            attempt++;
        }
    }
}

module.exports = retry; 