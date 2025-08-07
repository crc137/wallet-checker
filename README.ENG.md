# TON Wallet Address Checker

## Address Mismatch Issue

When calculating an address from StateInit, there is a mismatch between the original and calculated addresses:

- Original address: `EQDr1yCktbp69_8uYOcE44_3bK0qazthAS028rzJqFve6BZe`
- Calculated address: `EQDU2jn6O_6nITo00bjRCMoKUz7z8VYmDhhzj5P1aW-N6h9Q`

## Reasons for the Mismatch

After analyzing the addresses, the following observations were made:

1. Both addresses are valid and belong to workchain 0.
2. The address hashes are completely different:
   - Hash of the original address: `ebd720a4b5ba7af7ff2e60e704e38ff76cad2a6b3b61012d36f2bcc9a85bdee8`
   - Hash of the calculated address: `d4da39fa3bfea7213a34d1b8d108ca0a533ef3f156260e18738f93f5696f8dea`

## Possible Causes of the Mismatch

1. **Contract Data Changes After Deployment**
   - The contract may have been updated after deployment, resulting in a modified StateInit.
   - The contract address remains the same, but its current state differs from the original.

2. **Non-standard StateInit Format During Deployment**
   - A non-standard StateInit format may have been used during contract deployment.
   - Some contracts use special parameters during initialization.

3. **Issues with Parsing Data from the API**
   - The data format returned by the API may not match the expected format for creating a Cell.
   - Data in the `x{...}` format requires special handling before use.

4. **Contract Deployed Using a Special Method**
   - Some contracts are deployed using special methods that can affect the final address.

## Solution

To correctly calculate the address from StateInit, you need to:

1. Obtain the original StateInit used during contract deployment.
2. Properly convert data from the API format into Cell objects.
3. Account for any special parameters used during deployment.

If the contract was updated after deployment, it may be impossible to calculate the original address from its current state.

## Tools for Verification

The repository includes the following tools:

- `wallet-checker.js` - Main script for checking the wallet and calculating the address from StateInit.
- `tonweb-checker.js` - Script for address verification using TonWeb.
- `ton-core-checker.js` - Script for address calculation using `@ton/core`.
- `address-checker.js` - Script for comparing address formats.

## Usage

```bash
# Check wallet
node wallet-checker.js EQDr1yCktbp69_8uYOcE44_3bK0qazthAS028rzJqFve6BZe

# Check address using TonWeb
node tonweb-checker.js EQDr1yCktbp69_8uYOcE44_3bK0qazthAS028rzJqFve6BZe

# Calculate address using @ton/core
node ton-core-checker.js EQDr1yCktbp69_8uYOcE44_3bK0qazthAS028rzJqFve6BZe

# Compare addresses
node address-checker.js EQDr1yCktbp69_8uYOcE44_3bK0qazthAS028rzJqFve6BZe EQDU2jn6O_6nITo00bjRCMoKUz7z8VYmDhhzj5P1aW-N6h9Q
```
