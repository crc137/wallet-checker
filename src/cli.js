#!/usr/bin/env node

/**
 * Enhanced CLI interface for TON Wallet Address Checker
 */

const WalletAnalyzer = require('./wallet-analyzer');
const logger = require('./utils/logger');
const config = require('./config');

class CLI {
    constructor() {
        this.analyzer = new WalletAnalyzer();
    }
    
    showHelp() {
        console.log(`
TON Wallet Address Checker v2.0
================================

Usage:
  node src/cli.js <wallet-address> [options]

Options:
  --help, -h          Show this help message
  --verbose, -v       Enable verbose logging
  --quiet, -q         Suppress non-essential output
  --format <format>   Output format (text|json) [default: text]
  --compare <addr>    Compare with another address

Examples:
  node src/cli.js EQDr1yCktbp69_8uYOcE44_3bK0qazthAS028rzJqFve6BZe
  node src/cli.js EQDr1yCktbp69_8uYOcE44_3bK0qazthAS028rzJqFve6BZe --verbose
  node src/cli.js EQDr1yCktbp69_8uYOcE44_3bK0qazthAS028rzJqFve6BZe --compare EQDU2jn6O_6nITo00bjRCMoKUz7z8VYmDhhzj5P1aW-N6h9Q

Environment Variables:
  TONCENTER_API_KEY   API key for TonCenter (optional)
  LOG_LEVEL          Logging level (debug|info|warn|error)
        `);
    }
    
    parseArgs(args) {
        const options = {
            address: null,
            verbose: false,
            quiet: false,
            format: 'text',
            compare: null,
            help: false
        };
        
        for (let i = 0; i < args.length; i++) {
            const arg = args[i];
            
            switch (arg) {
                case '--help':
                case '-h':
                    options.help = true;
                    break;
                case '--verbose':
                case '-v':
                    options.verbose = true;
                    break;
                case '--quiet':
                case '-q':
                    options.quiet = true;
                    break;
                case '--format':
                    options.format = args[++i] || 'text';
                    break;
                case '--compare':
                    options.compare = args[++i];
                    break;
                default:
                    if (!arg.startsWith('--') && !options.address) {
                        options.address = arg;
                    }
                    break;
            }
        }
        
        return options;
    }
    
    async run() {
        const args = process.argv.slice(2);
        const options = this.parseArgs(args);
        
        if (options.help || args.length === 0) {
            this.showHelp();
            return;
        }
        
        if (!options.address) {
            logger.error('Please provide a wallet address to analyze');
            logger.info('Use --help for usage information');
            process.exit(1);
        }
        
        // Configure logging based on options
        if (options.verbose) {
            config.logging.level = 'debug';
        } else if (options.quiet) {
            config.logging.level = 'error';
        }
        
        // Set log level from environment variable
        if (process.env.LOG_LEVEL) {
            config.logging.level = process.env.LOG_LEVEL;
        }
        
        try {
            logger.info('🚀 Starting TON Wallet Address Checker v2.0');
            
            // Analyze the wallet
            const result = await this.analyzer.analyzeWallet(options.address);
            
            if (!result.success) {
                logger.failure(`Analysis failed: ${result.error}`);
                process.exit(1);
            }
            
            // Compare with another address if requested
            if (options.compare) {
                logger.info(`\n🔄 Comparing with: ${options.compare}`);
                const AddressUtils = require('./utils/address-utils');
                const comparison = AddressUtils.compareAddresses(options.address, options.compare);
                
                if (comparison.match) {
                    logger.success('Addresses match perfectly');
                } else {
                    logger.warning('Addresses do not match');
                    logger.info(`Hash match: ${comparison.hashMatch}`);
                    logger.info(`Workchain match: ${comparison.workchainMatch}`);
                }
            }
            
            // Output results in requested format
            if (options.format === 'json') {
                console.log(JSON.stringify(result.results, null, 2));
            }
            
            logger.success('Analysis completed successfully');
            
        } catch (error) {
            logger.failure(`Unexpected error: ${error.message}`);
            if (options.verbose) {
                console.error(error.stack);
            }
            process.exit(1);
        }
    }
}

// Run CLI if this file is executed directly
if (require.main === module) {
    const cli = new CLI();
    cli.run().catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
}

module.exports = CLI;