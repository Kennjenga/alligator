import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { avalancheFuji } from 'wagmi/chains';
import {
  injectedWallet,
  metaMaskWallet,
  walletConnectWallet,
  coreWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { http, createStorage, cookieStorage } from 'wagmi';

if (!process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID) {
  throw new Error('Missing NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID');
}

// Wallet configuration with Core Wallet support
export const config = getDefaultConfig({
  appName: 'Alligator',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
  wallets: [
    {
      groupName: "Popular Wallets",
      wallets: [
        coreWallet, // Core Wallet - Avalanche native wallet
        metaMaskWallet, // MetaMask - Most popular wallet
        injectedWallet, // Browser injected wallets (includes Core if installed)
      ],
    },
    {
      groupName: "Other Wallets",
      wallets: [
        walletConnectWallet, // WalletConnect for mobile wallets
      ],
    },
  ],
  chains: [
    avalancheFuji,
  ],
  transports: {
    [avalancheFuji.id]: http(process.env.NEXT_PUBLIC_AVALANCHE_FUJI_RPC || 'https://api.avax-test.network/ext/bc/C/rpc'),
  },
  ssr: true,
  storage: createStorage({
    storage: cookieStorage,
  }),
  batch: {
    multicall: true,
  },
});

// Contract addresses
export const CONTRACT_ADDRESSES = {
  LendingAPYAggregator: "0x742d35Cc6634C0532925a3b8D4C9db96C4b5Da5e", // Deployed contract
  DEXIntegration: "0x742d35Cc6634C0532925a3b8D4C9db96C4b5Da5e", // Using same address for now
  AavePool: "0x1775ECC8362dB6CaB0c7A9C0957cF656A5276c29",
  BenqiComptroller: "0x486Af39519B4Dc9a7fCcd318217352830E8AD9b4",
  TraderJoeRouter: "0x60aE616a2155Ee3d9A68541Ba4544862310933d4", // Trader Joe Router on Fuji
} as const;

// Token addresses on Fuji
export const TOKEN_ADDRESSES = {
  WAVAX: "0xd00ae08403B9bbb9124bB305C09058E32C39A48c",
  USDC: "0x5425890298aed601595a70AB815c96711a31Bc65",
  USDT: "0x1f1E7c893855525b303f99bDF5c3c05BE09ca251",
  WETH: "0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB",
  WBTC: "0x50b7545627a5162F82A992c33b87aDc75187B218",
} as const;

// Contract ABI (simplified for demo)
export const LENDING_APY_AGGREGATOR_ABI = [
  {
    "inputs": [
      {"internalType": "address", "name": "asset", "type": "address"}
    ],
    "name": "getAllAPYs",
    "outputs": [
      {
        "components": [
          {"internalType": "uint256", "name": "supplyAPY", "type": "uint256"},
          {"internalType": "uint256", "name": "borrowAPY", "type": "uint256"},
          {"internalType": "enum LendingAPYAggregator.Protocol", "name": "protocol", "type": "uint8"}
        ],
        "internalType": "struct LendingAPYAggregator.APYData[]",
        "name": "apyData",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "asset", "type": "address"}
    ],
    "name": "getBestSupplyAPY",
    "outputs": [
      {"internalType": "enum LendingAPYAggregator.Protocol", "name": "bestProtocol", "type": "uint8"},
      {"internalType": "uint256", "name": "bestAPY", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "asset", "type": "address"},
      {"internalType": "uint256", "name": "amount", "type": "uint256"},
      {"internalType": "enum LendingAPYAggregator.Protocol", "name": "protocol", "type": "uint8"}
    ],
    "name": "supply",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "asset", "type": "address"},
      {"internalType": "uint256", "name": "amount", "type": "uint256"},
      {"internalType": "enum LendingAPYAggregator.Protocol", "name": "protocol", "type": "uint8"}
    ],
    "name": "borrow",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "asset", "type": "address"},
      {"internalType": "uint256", "name": "amount", "type": "uint256"},
      {"internalType": "uint256", "name": "minExpectedAPY", "type": "uint256"}
    ],
    "name": "supplyToBestRate",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "asset", "type": "address"},
      {"internalType": "uint256", "name": "amount", "type": "uint256"},
      {"internalType": "uint256", "name": "maxExpectedAPY", "type": "uint256"}
    ],
    "name": "borrowFromBestRate",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "user", "type": "address"},
      {"internalType": "address", "name": "asset", "type": "address"}
    ],
    "name": "getUserPosition",
    "outputs": [
      {
        "components": [
          {"internalType": "uint256", "name": "supplied", "type": "uint256"},
          {"internalType": "uint256", "name": "borrowed", "type": "uint256"},
          {"internalType": "enum LendingAPYAggregator.Protocol", "name": "protocol", "type": "uint8"},
          {"internalType": "uint256", "name": "timestamp", "type": "uint256"}
        ],
        "internalType": "struct LendingAPYAggregator.UserPosition",
        "name": "position",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "user", "type": "address"},
      {"internalType": "address[]", "name": "assets", "type": "address[]"}
    ],
    "name": "getUserPortfolio",
    "outputs": [
      {"internalType": "uint256", "name": "totalSupplied", "type": "uint256"},
      {"internalType": "uint256", "name": "totalBorrowed", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "user", "type": "address"},
      {"internalType": "address", "name": "asset", "type": "address"},
      {"internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "checkBalance",
    "outputs": [
      {"internalType": "bool", "name": "hasBalance", "type": "bool"},
      {"internalType": "uint256", "name": "availableBalance", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "asset", "type": "address"},
      {"internalType": "uint256", "name": "minAmountOut", "type": "uint256"},
      {"internalType": "uint256", "name": "deadline", "type": "uint256"}
    ],
    "name": "purchaseAssetWithAVAX",
    "outputs": [
      {"internalType": "uint256", "name": "amountOut", "type": "uint256"}
    ],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "asset", "type": "address"},
      {"internalType": "uint256", "name": "amount", "type": "uint256"},
      {"internalType": "uint8", "name": "protocol", "type": "uint8"},
      {"internalType": "bool", "name": "purchaseWithAVAX", "type": "bool"},
      {"internalType": "uint256", "name": "maxSlippage", "type": "uint256"},
      {"internalType": "uint256", "name": "deadline", "type": "uint256"}
    ],
    "name": "supplyWithAutoPurchase",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  }
] as const;

// DEX Integration ABI
export const DEX_INTEGRATION_ABI = [
  {
    "inputs": [
      {"internalType": "address", "name": "tokenOut", "type": "address"},
      {"internalType": "uint256", "name": "amountOutMin", "type": "uint256"},
      {"internalType": "uint256", "name": "deadline", "type": "uint256"}
    ],
    "name": "buyTokenWithAVAX",
    "outputs": [
      {"internalType": "uint256", "name": "amountOut", "type": "uint256"}
    ],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "tokenOut", "type": "address"},
      {"internalType": "uint256", "name": "amountIn", "type": "uint256"}
    ],
    "name": "getQuoteBuyWithAVAX",
    "outputs": [
      {"internalType": "uint256", "name": "amountOut", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "amountOut", "type": "uint256"}
    ],
    "name": "calculateMinAmountOut",
    "outputs": [
      {"internalType": "uint256", "name": "minAmountOut", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

// Trader Joe Router ABI (simplified for swapping)
export const TRADER_JOE_ROUTER_ABI = [
  {
    "inputs": [
      {"internalType": "uint256", "name": "amountOutMin", "type": "uint256"},
      {"internalType": "address[]", "name": "path", "type": "address[]"},
      {"internalType": "address", "name": "to", "type": "address"},
      {"internalType": "uint256", "name": "deadline", "type": "uint256"}
    ],
    "name": "swapExactAVAXForTokens",
    "outputs": [
      {"internalType": "uint256[]", "name": "amounts", "type": "uint256[]"}
    ],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "amountIn", "type": "uint256"},
      {"internalType": "address[]", "name": "path", "type": "address[]"}
    ],
    "name": "getAmountsOut",
    "outputs": [
      {"internalType": "uint256[]", "name": "amounts", "type": "uint256[]"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "amountOut", "type": "uint256"},
      {"internalType": "address[]", "name": "path", "type": "address[]"}
    ],
    "name": "getAmountsIn",
    "outputs": [
      {"internalType": "uint256[]", "name": "amounts", "type": "uint256[]"}
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;
