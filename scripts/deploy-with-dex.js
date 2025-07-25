const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Starting deployment with DEX integration...");
  
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  const network = await ethers.provider.getNetwork();
  console.log("Network:", network.name, "Chain ID:", network.chainId);

  // Load addresses configuration
  const addresses = require("../config/addresses.js");
  let config;
  
  if (network.chainId === 43114n) {
    config = addresses.avalanche;
    console.log("📍 Deploying to Avalanche Mainnet");
  } else if (network.chainId === 43113n) {
    config = addresses.fuji;
    console.log("📍 Deploying to Avalanche Fuji Testnet");
  } else {
    console.log("⚠️  Unknown network, using default configuration");
    config = {
      chainId: Number(network.chainId),
      aave: { pool: "0x0000000000000000000000000000000000000000" },
      benqi: { comptroller: "0x0000000000000000000000000000000000000000" },
      morpho: { pool: "0x0000000000000000000000000000000000000000" },
      yieldYak: { usdcStrategy: "0x0000000000000000000000000000000000000000" },
      dex: { traderJoe: "0x0000000000000000000000000000000000000000" },
      tokens: { WAVAX: "0x0000000000000000000000000000000000000000" }
    };
  }

  console.log("\n📋 Configuration:");
  console.log("Aave Pool:", config.aave.pool);
  console.log("Benqi Comptroller:", config.benqi.comptroller);
  console.log("Morpho Pool:", config.morpho.pool);
  console.log("YieldYak Strategy:", config.yieldYak.usdcStrategy);
  console.log("DEX Router:", config.dex?.traderJoe || "Not configured");
  console.log("WAVAX:", config.tokens.WAVAX);

  // Deploy DEX Integration first
  console.log("\n🔄 Deploying DEX Integration...");
  const DEXIntegration = await ethers.getContractFactory("DEXIntegration");
  const dexIntegration = await DEXIntegration.deploy(
    config.dex?.traderJoe || "0x0000000000000000000000000000000000000000",
    config.tokens.WAVAX
  );
  await dexIntegration.waitForDeployment();
  const dexAddress = await dexIntegration.getAddress();
  console.log("✅ DEX Integration deployed to:", dexAddress);

  // Deploy main LendingAPYAggregator
  console.log("\n📊 Deploying LendingAPYAggregator...");
  const LendingAPYAggregator = await ethers.getContractFactory("LendingAPYAggregator");
  const lendingAggregator = await LendingAPYAggregator.deploy(
    config.aave.pool,
    config.morpho.pool,
    config.benqi.comptroller,
    config.yieldYak.usdcStrategy || "0x0000000000000000000000000000000000000000",
    dexAddress
  );
  await lendingAggregator.waitForDeployment();
  const aggregatorAddress = await lendingAggregator.getAddress();
  console.log("✅ LendingAPYAggregator deployed to:", aggregatorAddress);

  // Add supported assets
  console.log("\n🔧 Configuring supported assets...");
  const supportedAssets = [
    config.tokens.USDC,
    config.tokens.USDT,
    config.tokens.WAVAX,
    config.tokens.WETH,
    config.tokens.WBTC
  ].filter(addr => addr && addr !== "0x0000000000000000000000000000000000000000");

  for (const asset of supportedAssets) {
    try {
      const tx = await lendingAggregator.setSupportedAsset(asset, true);
      await tx.wait();
      console.log(`✅ Added supported asset: ${asset}`);
    } catch (error) {
      console.log(`⚠️  Failed to add asset ${asset}:`, error.message);
    }
  }

  // Save deployment information
  const deploymentInfo = {
    network: network.name,
    chainId: Number(network.chainId),
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      LendingAPYAggregator: aggregatorAddress,
      DEXIntegration: dexAddress,
      AavePool: config.aave.pool,
      BenqiComptroller: config.benqi.comptroller,
      MorphoPool: config.morpho.pool,
      YieldYakStrategy: config.yieldYak.usdcStrategy || "0x0000000000000000000000000000000000000000"
    },
    tokens: config.tokens,
    dex: config.dex || {},
    supportedAssets: supportedAssets
  };

  const filename = `deployments-${network.name.toLowerCase()}.json`;
  fs.writeFileSync(filename, JSON.stringify(deploymentInfo, null, 2));
  console.log(`\n💾 Deployment info saved to ${filename}`);

  // Verify contracts if on testnet/mainnet
  if (network.chainId === 43113n || network.chainId === 43114n) {
    console.log("\n🔍 Contract verification info:");
    console.log("DEX Integration:", dexAddress);
    console.log("Constructor args:", [
      config.dex?.traderJoe || "0x0000000000000000000000000000000000000000",
      config.tokens.WAVAX
    ]);
    console.log("\nLending Aggregator:", aggregatorAddress);
    console.log("Constructor args:", [
      config.aave.pool,
      config.morpho.pool,
      config.benqi.comptroller,
      config.yieldYak.usdcStrategy || "0x0000000000000000000000000000000000000000",
      dexAddress
    ]);
  }

  console.log("\n🎉 Deployment completed successfully!");
  console.log("📊 LendingAPYAggregator:", aggregatorAddress);
  console.log("🔄 DEX Integration:", dexAddress);
  
  return {
    lendingAggregator: aggregatorAddress,
    dexIntegration: dexAddress,
    deploymentInfo
  };
}

// Handle both direct execution and module export
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("❌ Deployment failed:", error);
      process.exit(1);
    });
}

module.exports = main;
