/**
 * Configuration file for TON Wallet Address Checker
 */

module.exports = {
    // API Configuration
    tonapi: {
        baseUrl: 'https://tonapi.io',
        timeout: 30000,
        retries: 3,
        retryDelay: 1000
    },
    
    toncenter: {
        baseUrl: 'https://toncenter.com/api/v2/jsonRPC',
        timeout: 30000,
        retries: 3,
        retryDelay: 1000
    },
    
    // Known wallet code hashes for identification
    walletCodeHashes: {
        'v3R1': '84dafa449f98a6987789ba232358072bc0f76dc4524002a5d0918b9a75d2d599',
        'v3R2': '73d0e0dd6f4c3f1f8f16587f2ff2bfc1e5c03d8cca32e000c927d6e7559db7e7',
        'v4R1': '207dc560c5956de1a2c1479356f8f3ee70a59767db2bf4788b1d61ad42cdad82',
        'v4R2': '5bcc3d95591849208a4cba5d61bc44e390ffad1a1dea86475fdc1ab6d7974207',
        'highload-v2': '9494d1cc8edf12f05671a1a9ba09921096eb50811e1924ec65c3c91913fc5d7f',
        'jetton-wallet': '0f5d299764f73ab68ae096db0f32b7a6a606d0ef6d27933b37ae32b9de5f0a2e'
    },
    
    // Logging configuration
    logging: {
        level: 'info', // debug, info, warn, error
        colors: true,
        timestamp: true
    }
};