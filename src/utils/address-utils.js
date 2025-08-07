/**
 * Address utilities for TON blockchain
 */

const { Address, Cell, contractAddress } = require("@ton/core");
const TonWeb = require('tonweb');
const crypto = require('crypto');
const config = require('../config');
const logger = require('./logger');

class AddressUtils {
    /**
     * Parse and validate TON address
     */
    static parseAddress(addressString) {
        try {
            const address = Address.parse(addressString);
            logger.debug(`Parsed address: ${address.toString()}`);
            return {
                address,
                workchain: address.workChain,
                hash: address.hash.toString('hex'),
                isValid: true
            };
        } catch (error) {
            logger.error(`Invalid address format: ${error.message}`);
            return {
                address: null,
                workchain: null,
                hash: null,
                isValid: false,
                error: error.message
            };
        }
    }
    
    /**
     * Convert hex string to Cell with multiple format support
     */
    static hexToCell(hexStr) {
        if (!hexStr) {
            logger.debug('Empty hex string, returning empty Cell');
            return new Cell();
        }
        
        try {
            // Remove x{} wrapper if present
            let cleanHex = hexStr;
            if (cleanHex.startsWith('x{') && cleanHex.endsWith('}')) {
                cleanHex = cleanHex.slice(2, -1);
            }
            
            // Clean up the hex string
            cleanHex = cleanHex.replace(/[\s_]/g, '');
            
            // Validate hex format
            if (!/^[0-9A-Fa-f]*$/.test(cleanHex)) {
                throw new Error('Invalid hex format');
            }
            
            // Try to create Cell from BOC
            const buffer = Buffer.from(cleanHex, 'hex');
            return Cell.fromBoc(buffer)[0];
        } catch (error) {
            logger.warn(`Failed to convert hex to Cell: ${error.message}`);
            
            // Try base64 format as fallback
            try {
                const buffer = Buffer.from(hexStr, 'base64');
                return Cell.fromBoc(buffer)[0];
            } catch (base64Error) {
                logger.warn(`Base64 fallback also failed: ${base64Error.message}`);
                return new Cell();
            }
        }
    }
    
    /**
     * Calculate address from StateInit
     */
    static calculateAddressFromStateInit(code, data, workchain = 0) {
        try {
            const codeCell = this.hexToCell(code);
            const dataCell = this.hexToCell(data);
            
            const stateInit = {
                code: codeCell,
                data: dataCell
            };
            
            const calculatedAddress = contractAddress(workchain, stateInit);
            logger.debug(`Calculated address: ${calculatedAddress.toString()}`);
            
            return {
                address: calculatedAddress,
                success: true
            };
        } catch (error) {
            logger.error(`Failed to calculate address from StateInit: ${error.message}`);
            return {
                address: null,
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * Compare two addresses
     */
    static compareAddresses(addr1, addr2) {
        try {
            const parsed1 = this.parseAddress(addr1);
            const parsed2 = this.parseAddress(addr2);
            
            if (!parsed1.isValid || !parsed2.isValid) {
                return {
                    match: false,
                    reason: 'Invalid address format',
                    details: {
                        addr1Valid: parsed1.isValid,
                        addr2Valid: parsed2.isValid
                    }
                };
            }
            
            const hashMatch = parsed1.hash === parsed2.hash;
            const workchainMatch = parsed1.workchain === parsed2.workchain;
            const fullMatch = hashMatch && workchainMatch;
            
            return {
                match: fullMatch,
                hashMatch,
                workchainMatch,
                details: {
                    addr1: {
                        workchain: parsed1.workchain,
                        hash: parsed1.hash
                    },
                    addr2: {
                        workchain: parsed2.workchain,
                        hash: parsed2.hash
                    }
                }
            };
        } catch (error) {
            logger.error(`Error comparing addresses: ${error.message}`);
            return {
                match: false,
                reason: 'Comparison error',
                error: error.message
            };
        }
    }
    
    /**
     * Identify wallet type by code hash
     */
    static identifyWalletType(codeHash) {
        const normalizedHash = codeHash.toLowerCase();
        
        for (const [type, hash] of Object.entries(config.walletCodeHashes)) {
            if (normalizedHash === hash.toLowerCase()) {
                return type;
            }
        }
        
        return 'unknown';
    }
    
    /**
     * Calculate code hash from hex code
     */
    static calculateCodeHash(codeHex) {
        try {
            const cleanHex = codeHex.replace(/^x\{|\}$/g, '').replace(/[\s_]/g, '');
            const buffer = Buffer.from(cleanHex, 'hex');
            return crypto.createHash('sha256').update(buffer).digest('hex');
        } catch (error) {
            logger.error(`Failed to calculate code hash: ${error.message}`);
            return null;
        }
    }
}

module.exports = AddressUtils;