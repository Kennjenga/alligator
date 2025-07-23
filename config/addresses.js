// Real protocol addresses on Avalanche networks

const addresses = {
  // Avalanche Mainnet (Chain ID: 43114)
  avalanche: {
    chainId: 43114,
    aave: {
      pool: "0x794a61358D6845594F94dc1DB02A252b5b4814aD", // Aave V3 Pool
      poolAddressesProvider: "0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb",
      oracle: "0xEBd36016B3eD09D4693Ed4251c67Bd858c3c7C9C",
    },
    benqi: {
      comptroller: "0x486Af39519B4Dc9a7fCcd318217352830E8AD9b4",
      qiAVAX: "0x5C0401e81Bc07Ca70fAD469b451682c0d747Ef1c",
      qiUSDC: "0xBEb5d47A3f720Ec0a390d04b4d41ED7d9688bC7F",
      qiUSDT: "0xc9e5999b8e75C3fEB117F6f73E664b9f3C8ca65C",
      qiBTC: "0xe194c4c5aC32a3C9ffDb358d9Bfd523a0B6d1568",
      qiETH: "0x334AD834Cd4481BB02d09615E7c11a00579A7909",
    },
    tokens: {
      WAVAX: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
      USDC: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
      USDT: "0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7",
      WBTC: "0x50b7545627a5162F82A992c33b87aDc75187B218",
      WETH: "0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB",
    },
    // Placeholder for other protocols - would need actual addresses
    morpho: {
      // Morpho might not be deployed on Avalanche yet
      pool: "0x0000000000000000000000000000000000000000",
    },
    yieldYak: {
      // YieldYak strategy addresses would go here
      // These are strategy-specific and would need to be looked up
      strategies: {},
    },
  },
  
  // Avalanche Fuji Testnet (Chain ID: 43113)
  fuji: {
    chainId: 43113,
    aave: {
      // Aave V3 testnet addresses for Fuji
      pool: "0x1775ECC8362dB6CaB0c7A9C0957cF656A5276c29", // Aave V3 Pool on Fuji
      poolAddressesProvider: "0x1775ECC8362dB6CaB0c7A9C0957cF656A5276c29",
      oracle: "0x0000000000000000000000000000000000000000",
    },
    benqi: {
      // Benqi testnet addresses - using mainnet for now as testnet may not be available
      comptroller: "0x486Af39519B4Dc9a7fCcd318217352830E8AD9b4",
    },
    tokens: {
      // Fuji testnet token addresses
      WAVAX: "0xd00ae08403B9bbb9124bB305C09058E32C39A48c",
      USDC: "0x5425890298aed601595a70AB815c96711a31Bc65",
      USDT: "0x1f1E7c893855525b303f99bDF5c3c05BE09ca251",
      WETH: "0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB",
      WBTC: "0x50b7545627a5162F82A992c33b87aDc75187B218",
    },
    morpho: {
      // Morpho might not be deployed on Fuji, using zero address
      pool: "0x0000000000000000000000000000000000000000",
    },
    yieldYak: {
      // YieldYak strategies - using zero address for now
      strategies: {},
    },
  },
};

module.exports = addresses;
