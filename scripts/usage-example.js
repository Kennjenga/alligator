const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 LendingAPYAggregator Usage Examples");
  console.log("=====================================\n");

  // Get signers
  const [deployer, user1, user2] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);
  console.log("User1:", user1.address);
  console.log("User2:", user2.address);

  // Load deployed contracts (you would load from deployment file in real scenario)
  const deploymentData = require(`../deployments-${hre.network.name}.json`);
  
  const LendingAPYAggregator = await ethers.getContractFactory("LendingAPYAggregator");
  const aggregator = LendingAPYAggregator.attach(deploymentData.contracts.LendingAPYAggregator);
  
  const MockERC20 = await ethers.getContractFactory("MockERC20");
  const token = await MockERC20.deploy("Test USDC", "TUSDC");
  await token.deployed();
  
  console.log("\n📊 Setting up test environment...");
  
  // Setup supported asset
  await aggregator.setSupportedAsset(token.address, true);
  
  // Mint tokens for users
  await token.mint(user1.address, ethers.utils.parseEther("10000"));
  await token.mint(user2.address, ethers.utils.parseEther("10000"));
  
  console.log("✅ Test tokens minted to users");

  // Example 1: Basic Supply
  console.log("\n🔹 Example 1: Basic Supply to Specific Protocol");
  const supplyAmount = ethers.utils.parseEther("1000");
  await token.connect(user1).approve(aggregator.address, supplyAmount);
  
  const tx1 = await aggregator.connect(user1).supply(token.address, supplyAmount, 0); // AAVE
  console.log("✅ Supplied 1000 tokens to Aave");
  console.log("Transaction hash:", tx1.hash);
  
  // Check position
  const position1 = await aggregator.getUserPosition(user1.address, token.address);
  console.log("User position - Supplied:", ethers.utils.formatEther(position1.supplied));
  console.log("User position - Protocol:", position1.protocol);

  // Example 2: Supply to Best Rate
  console.log("\n🔹 Example 2: Automatic Best Rate Supply");
  await token.connect(user2).approve(aggregator.address, supplyAmount);
  
  const tx2 = await aggregator.connect(user2).supplyToBestRate(token.address, supplyAmount, 0);
  console.log("✅ Supplied 1000 tokens to best rate protocol");
  console.log("Transaction hash:", tx2.hash);

  // Example 3: Get APY Comparison
  console.log("\n🔹 Example 3: APY Comparison Across Protocols");
  const apyData = await aggregator.getAllAPYs(token.address);
  
  console.log("APY Comparison:");
  const protocolNames = ["Aave", "Morpho", "Benqi", "YieldYak"];
  for (let i = 0; i < apyData.length; i++) {
    const supplyAPY = ethers.utils.formatUnits(apyData[i].supplyAPY, 25); // Convert from ray to percentage
    const borrowAPY = apyData[i].borrowAPY > 0 ? ethers.utils.formatUnits(apyData[i].borrowAPY, 25) : "N/A";
    console.log(`  ${protocolNames[i]}: Supply ${supplyAPY}%, Borrow ${borrowAPY}%`);
  }

  // Example 4: Find Best Rates
  console.log("\n🔹 Example 4: Best Rate Discovery");
  const [bestSupplyProtocol, bestSupplyAPY] = await aggregator.getBestSupplyAPY(token.address);
  const [bestBorrowProtocol, bestBorrowAPY] = await aggregator.getBestBorrowAPY(token.address);
  
  console.log("Best Supply Rate:");
  console.log(`  Protocol: ${protocolNames[bestSupplyProtocol]}`);
  console.log(`  APY: ${ethers.utils.formatUnits(bestSupplyAPY, 25)}%`);
  
  console.log("Best Borrow Rate:");
  console.log(`  Protocol: ${protocolNames[bestBorrowProtocol]}`);
  console.log(`  APY: ${ethers.utils.formatUnits(bestBorrowAPY, 25)}%`);

  // Example 5: Portfolio Overview
  console.log("\n🔹 Example 5: User Portfolio Overview");
  const [totalSupplied, totalBorrowed] = await aggregator.getUserPortfolio(user1.address, [token.address]);
  console.log(`User1 Portfolio:`);
  console.log(`  Total Supplied: ${ethers.utils.formatEther(totalSupplied)} tokens`);
  console.log(`  Total Borrowed: ${ethers.utils.formatEther(totalBorrowed)} tokens`);

  // Example 6: Fee Information
  console.log("\n🔹 Example 6: Fee Information");
  const protocolFee = await aggregator.protocolFee();
  const collectedFees = await aggregator.getCollectedFees(token.address);
  const feeForAmount = await aggregator.calculateFee(ethers.utils.parseEther("1000"));
  
  console.log(`Protocol Fee: ${protocolFee} basis points (${protocolFee/100}%)`);
  console.log(`Collected Fees: ${ethers.utils.formatEther(collectedFees)} tokens`);
  console.log(`Fee for 1000 tokens: ${ethers.utils.formatEther(feeForAmount)} tokens`);

  // Example 7: Rebalancing Check
  console.log("\n🔹 Example 7: Rebalancing Opportunity Check");
  const [canRebalance, bestProtocol, improvement] = await aggregator.checkRebalanceOpportunity(user1.address, token.address);
  
  if (canRebalance) {
    console.log("✅ Rebalancing opportunity found!");
    console.log(`  Best Protocol: ${protocolNames[bestProtocol]}`);
    console.log(`  APY Improvement: ${ethers.utils.formatUnits(improvement, 25)}%`);
  } else {
    console.log("ℹ️  No significant rebalancing opportunity at this time");
  }

  // Example 8: Withdraw
  console.log("\n🔹 Example 8: Withdraw from Position");
  const withdrawAmount = ethers.utils.parseEther("500");
  const tx8 = await aggregator.connect(user1).withdraw(token.address, withdrawAmount, 0);
  console.log("✅ Withdrew 500 tokens from position");
  console.log("Transaction hash:", tx8.hash);
  
  // Check updated position
  const updatedPosition = await aggregator.getUserPosition(user1.address, token.address);
  console.log("Updated position - Supplied:", ethers.utils.formatEther(updatedPosition.supplied));

  console.log("\n🎉 All examples completed successfully!");
  console.log("\n📋 Summary of Features Demonstrated:");
  console.log("  ✅ Basic supply to specific protocol");
  console.log("  ✅ Automatic best rate selection");
  console.log("  ✅ APY comparison across protocols");
  console.log("  ✅ Best rate discovery");
  console.log("  ✅ Portfolio management");
  console.log("  ✅ Fee calculation and tracking");
  console.log("  ✅ Rebalancing opportunity detection");
  console.log("  ✅ Position withdrawal");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
