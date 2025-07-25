const hre = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("🚀 Starting minimal deployment...");

  try {
    // Get the deployer account
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);
    
    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log("Account balance:", hre.ethers.formatEther(balance), "AVAX");

    // Get network info
    const network = await hre.ethers.provider.getNetwork();
    console.log("Network:", network.name);
    console.log("Chain ID:", network.chainId);

    // Protocol addresses for Fuji testnet
    const protocolAddresses = {
      aave: "0x1775ECC8362dB6CaB0c7A9C0957cF656A5276c29", // Aave V3 Pool on Fuji
      morpho: "0x0000000000000000000000000000000000000000", // Not available
      benqi: "0x486Af39519B4Dc9a7fCcd318217352830E8AD9b4", // Benqi comptroller
      yieldYak: "0x0000000000000000000000000000000000000000", // Not available
      traderJoe: "0x60aE616a2155Ee3d9A68541Ba4544862310933d4", // Trader Joe Router
      wavax: "0xd00ae08403B9bbb9124bB305C09058E32C39A48c"
    };

    console.log("\n📋 Using protocol addresses:");
    Object.entries(protocolAddresses).forEach(([name, addr]) => {
      console.log(`${name}: ${addr}`);
    });

    // Deploy DEX Integration first
    console.log("\n🔄 Deploying DEX Integration...");
    const DEXIntegration = await hre.ethers.getContractFactory("DEXIntegration");
    const dexIntegration = await DEXIntegration.deploy(
      protocolAddresses.traderJoe,
      protocolAddresses.wavax
    );
    await dexIntegration.waitForDeployment();
    const dexAddress = await dexIntegration.getAddress();
    console.log("✅ DEX Integration deployed to:", dexAddress);

    // Deploy LendingAPYAggregator
    console.log("\n📊 Deploying LendingAPYAggregator...");
    const LendingAPYAggregator = await hre.ethers.getContractFactory("LendingAPYAggregator");
    const lendingAggregator = await LendingAPYAggregator.deploy(
      protocolAddresses.aave,
      protocolAddresses.morpho,
      protocolAddresses.benqi,
      protocolAddresses.yieldYak,
      dexAddress
    );
    await lendingAggregator.waitForDeployment();
    const aggregatorAddress = await lendingAggregator.getAddress();
    console.log("✅ LendingAPYAggregator deployed to:", aggregatorAddress);

    // Configure supported assets
    console.log("\n🔧 Configuring supported assets...");
    const tokens = {
      WAVAX: "0xd00ae08403B9bbb9124bB305C09058E32C39A48c",
      USDC: "0x5425890298aed601595a70AB815c96711a31Bc65",
      USDT: "0x1f1E7c893855525b303f99bDF5c3c05BE09ca251",
      WETH: "0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB",
      WBTC: "0x50b7545627a5162F82A992c33b87aDc75187B218"
    };

    for (const [symbol, address] of Object.entries(tokens)) {
      try {
        console.log(`Adding supported asset: ${symbol} (${address})`);
        const tx = await lendingAggregator.setSupportedAsset(address, true);
        await tx.wait();
        console.log(`✅ Added ${symbol}`);
      } catch (error) {
        console.log(`⚠️  Failed to add ${symbol}:`, error.message);
      }
    }

    // Save deployment info
    const deploymentInfo = {
      network: network.name,
      chainId: Number(network.chainId),
      timestamp: new Date().toISOString(),
      deployer: deployer.address,
      contracts: {
        LendingAPYAggregator: aggregatorAddress,
        DEXIntegration: dexAddress,
        AavePool: protocolAddresses.aave,
        MorphoPool: protocolAddresses.morpho,
        BenqiComptroller: protocolAddresses.benqi,
        YieldYakStrategy: protocolAddresses.yieldYak,
        TraderJoeRouter: protocolAddresses.traderJoe
      },
      tokens: tokens,
      supportedAssets: Object.values(tokens)
    };

    const filename = `deployments-${network.name.toLowerCase()}.json`;
    fs.writeFileSync(filename, JSON.stringify(deploymentInfo, null, 2));
    console.log(`\n💾 Deployment info saved to ${filename}`);

    console.log("\n🎉 Deployment completed successfully!");
    console.log("📊 LendingAPYAggregator:", aggregatorAddress);
    console.log("🔄 DEX Integration:", dexAddress);

    // Test a simple contract call
    console.log("\n🧪 Testing contract...");
    try {
      const owner = await lendingAggregator.owner();
      console.log("Contract owner:", owner);
      console.log("✅ Contract is working!");
    } catch (error) {
      console.log("⚠️  Contract test failed:", error.message);
    }

    return {
      lendingAggregator: aggregatorAddress,
      dexIntegration: dexAddress,
      deploymentInfo
    };

  } catch (error) {
    console.error("❌ Deployment failed:", error);
    throw error;
  }
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
