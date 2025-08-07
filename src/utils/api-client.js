/**
 * Enhanced API client with retry logic and error handling
 */

const { TonApiClient } = require("@ton-api/client");
const TonWeb = require('tonweb');
const config = require('../config');
const logger = require('./logger');

class EnhancedApiClient {
    constructor() {
        this.tonApiClient = new TonApiClient({
            baseUrl: config.tonapi.baseUrl,
            timeout: config.tonapi.timeout
        });
        
        this.tonWebClient = new TonWeb(new TonWeb.HttpProvider(config.toncenter.baseUrl, {
            apiKey: process.env.TONCENTER_API_KEY || ''
        }));
    }
    
    async withRetry(operation, maxRetries = config.tonapi.retries) {
        let lastError;
        
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                logger.debug(`Attempt ${attempt}/${maxRetries} for API operation`);
                return await operation();
            } catch (error) {
                lastError = error;
                logger.warn(`Attempt ${attempt} failed: ${error.message}`);
                
                if (attempt < maxRetries) {
                    const delay = config.tonapi.retryDelay * attempt;
                    logger.debug(`Waiting ${delay}ms before retry...`);
                    await this.sleep(delay);
                }
            }
        }
        
        throw lastError;
    }
    
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    async getAccountInfo(address) {
        return this.withRetry(async () => {
            logger.debug(`Getting account info for ${address}`);
            return await this.tonApiClient.blockchain.getBlockchainRawAccount(address);
        });
    }
    
    async getAccountInfoWithTonWeb(address) {
        return this.withRetry(async () => {
            logger.debug(`Getting account info with TonWeb for ${address}`);
            return await this.tonWebClient.provider.getAddressInfo(address.toString());
        });
    }
    
    async getBalance(address) {
        return this.withRetry(async () => {
            logger.debug(`Getting balance for ${address}`);
            return await this.tonWebClient.provider.getBalance(address.toString());
        });
    }
    
    async getTransactions(address, limit = 10) {
        return this.withRetry(async () => {
            logger.debug(`Getting ${limit} transactions for ${address}`);
            return await this.tonWebClient.provider.getTransactions(address.toString(), limit);
        });
    }
    
    async execGetMethod(address, method, stack = []) {
        return this.withRetry(async () => {
            logger.debug(`Executing get method ${method} for ${address}`);
            return await this.tonApiClient.blockchain.execGetMethodForBlockchainAccount(address, {
                method,
                stack
            });
        });
    }
}

module.exports = new EnhancedApiClient();