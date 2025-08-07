/**
 * Enhanced wallet analyzer with comprehensive checks
 */

const AddressUtils = require('./utils/address-utils');
const apiClient = require('./utils/api-client');
const logger = require('./utils/logger');

class WalletAnalyzer {
    constructor() {
        this.results = {};
    }
    
    async analyzeWallet(walletAddress) {
        logger.info(`Starting comprehensive wallet analysis for: ${walletAddress}`);
        
        try {
            // Step 1: Parse and validate address
            const addressInfo = AddressUtils.parseAddress(walletAddress);
            if (!addressInfo.isValid) {
                logger.failure('Invalid wallet address format');
                return { success: false, error: addressInfo.error };
            }
            
            this.results.addressInfo = addressInfo;
            logger.success(`Address parsed successfully (workchain: ${addressInfo.workchain})`);
            
            // Step 2: Get account information
            await this.getAccountInfo(addressInfo.address);
            
            // Step 3: Analyze wallet type
            await this.analyzeWalletType();
            
            // Step 4: Calculate address from StateInit
            await this.calculateAddressFromStateInit();
            
            // Step 5: Get additional wallet data
            await this.getAdditionalWalletData(addressInfo.address);
            
            // Step 6: Generate comprehensive report
            this.generateReport();
            
            return { success: true, results: this.results };
            
        } catch (error) {
            logger.error(`Analysis failed: ${error.message}`);
            return { success: false, error: error.message };
        }
    }
    
    async getAccountInfo(address) {
        try {
            logger.info('Fetching account information...');
            const accountInfo = await apiClient.getAccountInfo(address);
            
            this.results.accountInfo = {
                status: accountInfo.status,
                balance: accountInfo.balance.toString(),
                code: accountInfo.code,
                data: accountInfo.data,
                lastTransactionLt: accountInfo.last_transaction_lt,
                lastTransactionHash: accountInfo.last_transaction_hash
            };
            
            logger.success(`Account info retrieved (status: ${accountInfo.status}, balance: ${accountInfo.balance})`);
        } catch (error) {
            logger.error(`Failed to get account info: ${error.message}`);
            this.results.accountInfo = { error: error.message };
        }
    }
    
    async analyzeWalletType() {
        try {
            logger.info('Analyzing wallet type...');
            
            if (!this.results.accountInfo?.code) {
                logger.warning('No code available for wallet type analysis');
                return;
            }
            
            const codeHash = AddressUtils.calculateCodeHash(this.results.accountInfo.code);
            if (codeHash) {
                const walletType = AddressUtils.identifyWalletType(codeHash);
                
                this.results.walletType = {
                    type: walletType,
                    codeHash: codeHash,
                    isKnownType: walletType !== 'unknown'
                };
                
                if (walletType !== 'unknown') {
                    logger.success(`Wallet type identified: ${walletType}`);
                } else {
                    logger.warning('Unknown wallet type detected');
                }
            }
        } catch (error) {
            logger.error(`Wallet type analysis failed: ${error.message}`);
            this.results.walletType = { error: error.message };
        }
    }
    
    async calculateAddressFromStateInit() {
        try {
            logger.info('Calculating address from StateInit...');
            
            if (!this.results.accountInfo?.code || !this.results.accountInfo?.data) {
                logger.warning('Insufficient data for StateInit calculation');
                return;
            }
            
            const result = AddressUtils.calculateAddressFromStateInit(
                this.results.accountInfo.code,
                this.results.accountInfo.data,
                this.results.addressInfo.workchain
            );
            
            if (result.success) {
                const comparison = AddressUtils.compareAddresses(
                    this.results.addressInfo.address.toString(),
                    result.address.toString()
                );
                
                this.results.stateInitCalculation = {
                    calculatedAddress: result.address.toString(),
                    originalAddress: this.results.addressInfo.address.toString(),
                    match: comparison.match,
                    hashMatch: comparison.hashMatch,
                    workchainMatch: comparison.workchainMatch,
                    details: comparison.details
                };
                
                if (comparison.match) {
                    logger.success('StateInit calculation matches original address');
                } else {
                    logger.warning('StateInit calculation does not match original address');
                    this.analyzeAddressMismatch(comparison);
                }
            } else {
                this.results.stateInitCalculation = { error: result.error };
            }
        } catch (error) {
            logger.error(`StateInit calculation failed: ${error.message}`);
            this.results.stateInitCalculation = { error: error.message };
        }
    }
    
    analyzeAddressMismatch(comparison) {
        const reasons = [];
        
        if (!comparison.hashMatch) {
            reasons.push('Hash mismatch - contract state may have changed after deployment');
        }
        
        if (!comparison.workchainMatch) {
            reasons.push('Workchain mismatch - incorrect workchain ID used in calculation');
        }
        
        reasons.push('Contract may use non-standard StateInit format');
        reasons.push('Contract may have been deployed using special deployment method');
        
        this.results.mismatchAnalysis = {
            reasons,
            recommendation: 'Try obtaining original StateInit used during deployment'
        };
        
        logger.warning('Address mismatch analysis completed');
    }
    
    async getAdditionalWalletData(address) {
        try {
            logger.info('Fetching additional wallet data...');
            
            // Get balance
            const balance = await apiClient.getBalance(address);
            
            // Get recent transactions
            const transactions = await apiClient.getTransactions(address, 5);
            
            // Try to get wallet methods
            const methods = await this.checkWalletMethods(address);
            
            this.results.additionalData = {
                balance: balance.toString(),
                transactionCount: transactions.length,
                recentTransactions: transactions.map(tx => ({
                    hash: tx.transaction_id?.hash,
                    lt: tx.transaction_id?.lt,
                    value: tx.in_msg?.value || '0',
                    timestamp: tx.utime
                })),
                methods
            };
            
            logger.success('Additional wallet data retrieved');
        } catch (error) {
            logger.error(`Failed to get additional data: ${error.message}`);
            this.results.additionalData = { error: error.message };
        }
    }
    
    async checkWalletMethods(address) {
        const methods = {};
        
        // Check common wallet methods
        const methodsToCheck = ['seqno', 'get_public_key', 'get_subwallet_id'];
        
        for (const method of methodsToCheck) {
            try {
                const result = await apiClient.execGetMethod(address, method);
                methods[method] = {
                    available: true,
                    result: result
                };
                logger.debug(`Method ${method} is available`);
            } catch (error) {
                methods[method] = {
                    available: false,
                    error: error.message
                };
                logger.debug(`Method ${method} is not available: ${error.message}`);
            }
        }
        
        return methods;
    }
    
    generateReport() {
        logger.info('\n' + '='.repeat(60));
        logger.info('COMPREHENSIVE WALLET ANALYSIS REPORT');
        logger.info('='.repeat(60));
        
        // Address Information
        logger.info('\n📍 ADDRESS INFORMATION:');
        logger.info(`   Address: ${this.results.addressInfo.address.toString()}`);
        logger.info(`   Workchain: ${this.results.addressInfo.workchain}`);
        logger.info(`   Hash: ${this.results.addressInfo.hash}`);
        
        // Account Status
        if (this.results.accountInfo) {
            logger.info('\n💰 ACCOUNT STATUS:');
            logger.info(`   Status: ${this.results.accountInfo.status}`);
            logger.info(`   Balance: ${this.results.accountInfo.balance} nanoTON`);
        }
        
        // Wallet Type
        if (this.results.walletType) {
            logger.info('\n🔍 WALLET TYPE:');
            logger.info(`   Type: ${this.results.walletType.type}`);
            logger.info(`   Code Hash: ${this.results.walletType.codeHash}`);
        }
        
        // StateInit Calculation
        if (this.results.stateInitCalculation) {
            logger.info('\n🧮 STATEINIT CALCULATION:');
            logger.info(`   Original: ${this.results.stateInitCalculation.originalAddress}`);
            logger.info(`   Calculated: ${this.results.stateInitCalculation.calculatedAddress}`);
            
            if (this.results.stateInitCalculation.match) {
                logger.success('   ✅ Addresses match perfectly');
            } else {
                logger.warning('   ⚠️  Addresses do not match');
                logger.info(`   Hash Match: ${this.results.stateInitCalculation.hashMatch}`);
                logger.info(`   Workchain Match: ${this.results.stateInitCalculation.workchainMatch}`);
            }
        }
        
        // Mismatch Analysis
        if (this.results.mismatchAnalysis) {
            logger.info('\n🔧 MISMATCH ANALYSIS:');
            this.results.mismatchAnalysis.reasons.forEach((reason, index) => {
                logger.info(`   ${index + 1}. ${reason}`);
            });
            logger.info(`\n   💡 Recommendation: ${this.results.mismatchAnalysis.recommendation}`);
        }
        
        // Additional Data
        if (this.results.additionalData) {
            logger.info('\n📊 ADDITIONAL DATA:');
            logger.info(`   Recent Transactions: ${this.results.additionalData.transactionCount}`);
            
            if (this.results.additionalData.methods) {
                const availableMethods = Object.entries(this.results.additionalData.methods)
                    .filter(([_, data]) => data.available)
                    .map(([method, _]) => method);
                
                logger.info(`   Available Methods: ${availableMethods.join(', ') || 'None'}`);
            }
        }
        
        logger.info('\n' + '='.repeat(60));
    }
}

module.exports = WalletAnalyzer;