# 🐊 Alligator - DeFi Lending Rate Aggregator

Alligator is a smart DeFi lending rate aggregator built on Avalanche that helps users find the best lending and borrowing rates across multiple protocols including Aave V3, Benqi, and more.

## 🌟 Features

- **Real-time APY Comparison**: Compare lending and borrowing rates across multiple DeFi protocols
- **Smart Protocol Selection**: Automatically routes transactions to the protocol with the best rates
- **Web3 Integration**: Full wallet connectivity with RainbowKit and Wagmi
- **Avalanche Native**: Built specifically for the Avalanche ecosystem
- **User-Friendly Interface**: Clean, modern UI with real-time data updates

## 🏗️ Architecture

### Smart Contracts
- **LendingAPYAggregator**: Main contract that aggregates rates and handles protocol interactions
- **Protocol Interfaces**: Standardized interfaces for Aave, Benqi, Morpho, and YieldYak
- **Deployed on Fuji Testnet**: `0x742d35Cc6634C0532925a3b8D4C9db96C4b5Da5e`

### Frontend
- **Next.js 14**: Modern React framework with App Router
- **RainbowKit**: Wallet connection with support for Core Wallet, MetaMask, and more
- **Wagmi**: React hooks for Ethereum interactions
- **Tailwind CSS**: Utility-first CSS framework for styling

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- MetaMask or Core Wallet
- Avalanche Fuji testnet AVAX (for testing)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd alligator
```

2. **Install dependencies**
```bash
# Install smart contract dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
```

3. **Environment Setup**
```bash
# Copy environment template
cp .env.example .env

# Add your private key and other configuration
# PRIVATE_KEY=your_private_key_here
# NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
```

### Running the Application

1. **Start the frontend**
```bash
cd frontend
npm run dev
```

2. **Open your browser**
Navigate to `http://localhost:3000`

3. **Connect your wallet**
- Switch to Avalanche Fuji Testnet (Chain ID: 43113)
- Connect using MetaMask, Core Wallet, or other supported wallets

## 📱 Usage

### Viewing Rates
- The main dashboard shows real-time APY rates from all supported protocols
- Rates are updated automatically and show the best options highlighted

### Lending/Supplying
1. Connect your wallet to Avalanche Fuji testnet
2. Select the token you want to supply (USDC, USDT, WAVAX)
3. Enter the amount
4. Click "Supply" - the smart contract will automatically route to the best rate

### Protocol Integration
The platform currently integrates with:
- **Aave V3**: Leading lending protocol with competitive rates
- **Benqi**: Avalanche-native lending platform
- **Morpho**: Advanced lending optimizer (integration ready)
- **YieldYak**: Yield farming aggregator (integration ready)

## 🔧 Smart Contract Development

### Compilation
```bash
npx hardhat compile
```

### Testing
```bash
npx hardhat test
```

### Deployment
```bash
# Deploy to Fuji testnet
npx hardhat run scripts/deploy.js --network fuji
```

### Contract Verification
```bash
npx hardhat verify --network fuji <contract-address>
```

## 🌐 Network Configuration

### Avalanche Fuji Testnet
- **Chain ID**: 43113
- **RPC URL**: https://api.avax-test.network/ext/bc/C/rpc
- **Block Explorer**: https://testnet.snowtrace.io/

### Supported Tokens
- **WAVAX**: `0xd00ae08403B9bbb9124bB305C09058E32C39A48c`
- **USDC**: `0x5425890298aed601595a70AB815c96711a31Bc65`
- **USDT**: `0x1f1E7c893855525b303f99bDF5c3c05BE09ca251`

## 🛠️ Technical Stack

### Smart Contracts
- **Solidity 0.8.24**
- **Hardhat**: Development environment
- **OpenZeppelin**: Security-audited contract libraries
- **Chainlink**: Price feeds and CCIP (future integration)

### Frontend
- **Next.js 14**: React framework
- **TypeScript**: Type-safe development
- **RainbowKit**: Wallet connection
- **Wagmi**: Ethereum React hooks
- **Viem**: TypeScript Ethereum library
- **Tailwind CSS**: Styling

## 🔒 Security

- All smart contracts use OpenZeppelin's audited libraries
- ReentrancyGuard protection on all state-changing functions
- Pausable functionality for emergency stops
- Owner-only administrative functions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Avalanche team for the robust blockchain infrastructure
- Aave and Benqi for their lending protocols
- RainbowKit and Wagmi teams for excellent Web3 tooling
- OpenZeppelin for security-first smart contract libraries

## 📞 Support

For support, please open an issue on GitHub or reach out to the development team.

---

**Built with ❤️ for the Avalanche ecosystem**
