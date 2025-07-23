const { ethers } = require("hardhat");
const addresses = require("../config/addresses");

async function main() {
  console.log("Starting deployment...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Get network configuration
  const network = hre.network.name;
  const chainId = (await ethers.provider.getNetwork()).chainId;
  console.log("Network:", network);
  console.log("Chain ID:", chainId);

  // Get addresses for the current network
  let networkAddresses;
  if (chainId === 43114) {
    networkAddresses = addresses.avalanche;
    console.log("Using Avalanche mainnet addresses");
  } else if (chainId === 43113) {
    networkAddresses = addresses.fuji;
    console.log("Using Avalanche Fuji testnet addresses");
  } else {
    console.log("Unsupported network, using placeholder addresses");
    networkAddresses = {
      aave: { pool: ethers.constants.AddressZero },
      benqi: { comptroller: ethers.constants.AddressZero },
      morpho: { pool: ethers.constants.AddressZero },
      yieldYak: { strategies: {} },
    };
  }

  // Deploy the main LendingAPYAggregator contract
  console.log("\nDeploying LendingAPYAggregator...");
  const LendingAPYAggregator = await ethers.getContractFactory("LendingAPYAggregator");

  // Use real protocol addresses or zero addresses if not available
  const aaveAddress = networkAddresses.aave?.pool || ethers.constants.AddressZero;
  const morphoAddress = networkAddresses.morpho?.pool || ethers.constants.AddressZero;
  const benqiAddress = networkAddresses.benqi?.comptroller || ethers.constants.AddressZero;
  const yieldYakAddress = ethers.constants.AddressZero; // Will be set later when we have a specific strategy

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

  // Add supported assets
  if (networkAddresses.tokens) {
    for (const [symbol, address] of Object.entries(networkAddresses.tokens)) {
      console.log(`Adding supported asset: ${symbol} (${address})`);
      await lendingAPYAggregator.setSupportedAsset(address, true);
    }
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
    protocolAddresses: networkAddresses,
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
