# Deployment Guide: Fresh Contract Deployment

## 🚨 Current Status

The smart contracts have been successfully implemented and compile without errors. However, there are environment compatibility issues preventing immediate deployment.

## ⚠️ Known Issues

### 1. Node.js Version Compatibility
- **Current**: Node.js v18.20.8
- **Required**: Node.js v20+ for optimal Hardhat compatibility
- **Error**: ESM import issues with micro-eth-signer package

### 2. Dependency Conflicts
- **Issue**: Hardhat ethers plugin compatibility
- **Error**: `(0 , ethers_1.getAddress) is not a function`

## 🔧 Quick Fix Solutions

### Option 1: Update Environment (Recommended)
```bash
# Update Node.js to v20+
nvm install 20
nvm use 20

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Try deployment
npx hardhat run scripts/deploy-with-dex.js --network fuji
```

### Option 2: Use Alternative Deployment Method
```bash
# Use Foundry instead of Hardhat
forge build
forge script scripts/Deploy.s.sol --rpc-url $FUJI_RPC_URL --private-key $PRIVATE_KEY --broadcast
```

### Option 3: Manual Contract Deployment
Use Remix IDE or other deployment tools with the compiled bytecode.

## 📋 Pre-Deployment Checklist

### ✅ Completed
- [x] Smart contracts implemented and tested
- [x] DEX integration contract created
- [x] Frontend hooks and components updated
- [x] Protocol addresses configured
- [x] Compilation successful with optimization

### ⏳ Pending
- [ ] Environment compatibility resolved
- [ ] Testnet deployment completed
- [ ] Contract verification on Snowtrace
- [ ] Frontend configuration updated with new addresses
- [ ] Mainnet deployment

## 🚀 Deployment Sequence

### 1. Deploy DEX Integration Contract
```solidity
// Constructor parameters:
// _dexRouter: 0x60aE616a2155Ee3d9A68541Ba4544862310933d4 (Trader Joe)
// _wavax: 0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7 (WAVAX)
```

### 2. Deploy LendingAPYAggregator Contract
```solidity
// Constructor parameters:
// _aave: 0x794a61358D6845594F94dc1DB02A252b5b4814aD
// _morpho: 0x0000000000000000000000000000000000000000 (not deployed on Avalanche)
// _benqi: 0x486Af39519B4Dc9a7fCcd318217352830E8AD9b4
// _yieldYak: 0x0000000000000000000000000000000000000000 (strategy address needed)
// _dexIntegration: <DEX_INTEGRATION_ADDRESS>
```

### 3. Configure Supported Assets
```solidity
// Add supported assets:
// USDC: 0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E
// USDT: 0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7
// WAVAX: 0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7
// WETH: 0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB
// WBTC: 0x50b7545627a5162F82A992c33b87aDc75187B218
```

## 🔍 Testing Strategy

### 1. Local Testing
```bash
# Start local hardhat node
npx hardhat node

# Deploy to local network
npx hardhat run scripts/deploy-with-dex.js --network localhost

# Run tests
npx hardhat test
```

### 2. Testnet Testing (Fuji)
- Deploy contracts to Fuji testnet
- Test with testnet tokens
- Verify all functions work correctly
- Test DEX integration with small amounts

### 3. Mainnet Deployment
- Deploy to Avalanche mainnet
- Start with limited functionality
- Gradually enable all features
- Monitor for any issues

## 📊 Gas Estimates

Based on contract complexity:
- **DEXIntegration**: ~2.5M gas
- **LendingAPYAggregator**: ~4.5M gas
- **Total deployment cost**: ~7M gas (~$50-100 depending on gas price)

## 🔐 Security Considerations

### Pre-Deployment
- [ ] Contract audit (recommended for mainnet)
- [ ] Slippage protection testing
- [ ] Access control verification
- [ ] Emergency function testing

### Post-Deployment
- [ ] Ownership transfer to multisig
- [ ] Protocol fee configuration
- [ ] Monitoring setup
- [ ] Emergency pause capability

## 📱 Frontend Updates Required

After successful deployment:

1. **Update contract addresses** in `frontend/src/config/wagmi.ts`
2. **Update deployment info** in `deployments-fuji.json` and `deployments-avalanche.json`
3. **Test frontend integration** with deployed contracts
4. **Deploy frontend** to production

## 🎯 Success Criteria

### Deployment Success
- [x] Contracts compile without errors
- [ ] Contracts deploy successfully
- [ ] All functions callable
- [ ] Events emitted correctly

### Integration Success
- [ ] Frontend connects to contracts
- [ ] APY data fetched from real protocols
- [ ] DEX integration works for asset purchases
- [ ] User can supply with auto-purchase

### Production Ready
- [ ] Comprehensive testing completed
- [ ] Security audit passed
- [ ] Monitoring in place
- [ ] Documentation updated

## 🆘 Troubleshooting

### Common Issues
1. **Gas estimation failures**: Increase gas limit in hardhat config
2. **Network connection issues**: Check RPC URL and network configuration
3. **Private key issues**: Verify .env file configuration
4. **Contract verification failures**: Check constructor parameters

### Support Resources
- Hardhat documentation: https://hardhat.org/docs
- Avalanche documentation: https://docs.avax.network/
- OpenZeppelin contracts: https://docs.openzeppelin.com/

## 📞 Next Steps

1. **Resolve environment issues** (Node.js update recommended)
2. **Test deployment** on local network first
3. **Deploy to Fuji testnet** for integration testing
4. **Conduct thorough testing** with real protocols
5. **Deploy to mainnet** after successful testing
