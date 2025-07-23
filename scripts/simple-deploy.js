const hre = require("hardhat");

async function main() {
  console.log("Starting simple deployment...");

  // Get the deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  
  const balance = await deployer.getBalance();
  console.log("Account balance:", hre.ethers.utils.formatEther(balance), "AVAX");

  // Get network configuration
  const network = hre.network.name;
  const chainId = (await hre.ethers.provider.getNetwork()).chainId;
  console.log("Network:", network);
  console.log("Chain ID:", chainId);

  // Deploy the main LendingAPYAggregator contract
  console.log("\nDeploying LendingAPYAggregator...");
  const LendingAPYAggregator = await hre.ethers.getContractFactory("LendingAPYAggregator");

  // Use real protocol addresses for Fuji
  const aaveAddress = "0x1775ECC8362dB6CaB0c7A9C0957cF656A5276c29"; // Aave V3 Pool on Fuji
  const morphoAddress = hre.ethers.constants.AddressZero; // Not available on Fuji
  const benqiAddress = "0x486Af39519B4Dc9a7fCcd318217352830E8AD9b4"; // Benqi comptroller
  const yieldYakAddress = hre.ethers.constants.AddressZero; // Not available

  console.log("Using protocol addresses:");
  console.log("Aave Pool:", aaveAddress);
  console.log("Morpho Pool:", morphoAddress);
  console.log("Benqi Comptroller:", benqiAddress);
  console.log("YieldYak Strategy:", yieldYakAddress);

  const lendingAPYAggregator = await LendingAPYAggregator.deploy(
    aaveAddress,
    morphoAddress,
    benqiAddress,
    yieldYakAddress
  );
  await lendingAPYAggregator.deployed();
  console.log("LendingAPYAggregator deployed to:", lendingAPYAggregator.address);

  // Configure the aggregator
  console.log("\nConfiguring LendingAPYAggregator...");

  // Add supported assets (Fuji testnet tokens)
  const tokens = {
    WAVAX: "0xd00ae08403B9bbb9124bB305C09058E32C39A48c",
    USDC: "0x5425890298aed601595a70AB815c96711a31Bc65",
    USDT: "0x1f1E7c893855525b303f99bDF5c3c05BE09ca251",
  };

  for (const [symbol, address] of Object.entries(tokens)) {
    console.log(`Adding supported asset: ${symbol} (${address})`);
    await lendingAPYAggregator.setSupportedAsset(address, true);
  }

  // Set protocol fee to 0.5%
  await lendingAPYAggregator.setProtocolFee(50);
  console.log("Protocol fee set to 0.5%");

  console.log("\nDeployment completed!");
  console.log("\nContract addresses:");
  console.log("===================");
  console.log("LendingAPYAggregator:", lendingAPYAggregator.address);
  console.log("Aave Pool:", aaveAddress);
  console.log("Morpho Pool:", morphoAddress);
  console.log("Benqi Comptroller:", benqiAddress);
  console.log("YieldYak Strategy:", yieldYakAddress);

  console.log("\nConfiguration:");
  console.log("==============");
  console.log("Protocol Fee:", await lendingAPYAggregator.protocolFee(), "basis points");
  console.log("Fee Recipient:", await lendingAPYAggregator.feeRecipient());
  console.log("Contract Owner:", await lendingAPYAggregator.owner());

  // Save deployment info to a file
  const deploymentInfo = {
    network: hre.network.name,
    chainId: chainId,
    contracts: {
      LendingAPYAggregator: lendingAPYAggregator.address,
      AavePool: aaveAddress,
      MorphoPool: morphoAddress,
      BenqiComptroller: benqiAddress,
      YieldYakStrategy: yieldYakAddress,
    },
    tokens: tokens,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
  };

  const fs = require("fs");
  fs.writeFileSync(
    `deployments-${hre.network.name}.json`,
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log(`\nDeployment info saved to deployments-${hre.network.name}.json`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
