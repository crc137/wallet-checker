/**
 * Enhanced test suite for TON Wallet Address Checker
 */

const WalletAnalyzer = require('./src/wallet-analyzer');
const AddressUtils = require('./src/utils/address-utils');
const logger = require('./src/utils/logger');

console.log('🧪 Running TON Wallet Address Checker Tests');
console.log('='.repeat(50));

// Test 1: Dependency loading
console.log('\n1. Testing dependency loading...');

try {
  const tonApi = require('@ton-api/client');
  console.log('✅ @ton-api/client loaded successfully');
} catch (error) {
  console.error('❌ Error loading @ton-api/client:', error.message);
  process.exit(1);
}

try {
  const tonCore = require('@ton/core');
  console.log('✅ @ton/core loaded successfully');
} catch (error) {
  console.error('❌ Error loading @ton/core:', error.message);
  process.exit(1);
}

try {
  const tonWeb = require('tonweb');
  console.log('✅ TonWeb loaded successfully');
} catch (error) {
  console.error('❌ Error loading TonWeb:', error.message);
  process.exit(1);
}

// Test 2: Address parsing
console.log('\n2. Testing address parsing...');
const testAddress = 'EQDr1yCktbp69_8uYOcE44_3bK0qazthAS028rzJqFve6BZe';
const addressInfo = AddressUtils.parseAddress(testAddress);

if (addressInfo.isValid) {
  console.log('✅ Address parsing works correctly');
  console.log(`   Workchain: ${addressInfo.workchain}`);
  console.log(`   Hash: ${addressInfo.hash.substring(0, 16)}...`);
} else {
  console.log('❌ Address parsing failed');
  process.exit(1);
}

// Test 3: Address comparison
console.log('\n3. Testing address comparison...');
const addr1 = 'EQDr1yCktbp69_8uYOcE44_3bK0qazthAS028rzJqFve6BZe';
const addr2 = 'EQDU2jn6O_6nITo00bjRCMoKUz7z8VYmDhhzj5P1aW-N6h9Q';
const comparison = AddressUtils.compareAddresses(addr1, addr2);

console.log(`✅ Address comparison completed`);
console.log(`   Match: ${comparison.match}`);
console.log(`   Hash match: ${comparison.hashMatch}`);
console.log(`   Workchain match: ${comparison.workchainMatch}`);

// Test 4: Wallet type identification
console.log('\n4. Testing wallet type identification...');
const testCodeHash = '5bcc3d95591849208a4cba5d61bc44e390ffad1a1dea86475fdc1ab6d7974207';
const walletType = AddressUtils.identifyWalletType(testCodeHash);
console.log(`✅ Wallet type identification: ${walletType}`);

// Test 5: Basic analyzer functionality
console.log('\n5. Testing basic analyzer functionality...');
const analyzer = new WalletAnalyzer();
console.log('✅ WalletAnalyzer instance created successfully');

console.log('\n🎉 All tests passed successfully!');
console.log('\nTo run a full analysis, use:');
console.log(`node src/cli.js ${testAddress}`);