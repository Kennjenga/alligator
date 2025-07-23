const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("LendingAPYAggregator - Enhanced", function () {
    let LendingAPYAggregator, lendingAPYAggregator;
    let MockAave, mockAave, MockMorpho, mockMorpho, MockBenqi, mockBenqi, MockYieldYak, mockYieldYak, MockRouter, mockRouter;
    let owner, addr1, addr2;
    let mockToken;

    beforeEach(async function () {
        [owner, addr1, addr2] = await ethers.getSigners();

        // Deploy mock token for testing
        const MockToken = await ethers.getContractFactory("MockERC20");
        mockToken = await MockToken.deploy("Mock Token", "MOCK");

        MockAave = await ethers.getContractFactory("MockAave");
        mockAave = await MockAave.deploy();

        MockMorpho = await ethers.getContractFactory("MockMorpho");
        mockMorpho = await MockMorpho.deploy();

        MockBenqi = await ethers.getContractFactory("MockBenqi");
        mockBenqi = await MockBenqi.deploy();

        MockYieldYak = await ethers.getContractFactory("MockYieldYak");
        mockYieldYak = await MockYieldYak.deploy(mockToken.address);

        MockRouter = await ethers.getContractFactory("MockRouter");
        mockRouter = await MockRouter.deploy();

        LendingAPYAggregator = await ethers.getContractFactory("LendingAPYAggregator");
        lendingAPYAggregator = await LendingAPYAggregator.deploy(
            mockAave.address,
            mockMorpho.address,
            mockBenqi.address,
            mockYieldYak.address,
            mockRouter.address
        );

        // Setup supported assets
        await lendingAPYAggregator.setSupportedAsset(mockToken.address, true);

        // Mint tokens for testing
        await mockToken.mint(addr1.address, ethers.utils.parseEther("10000"));
        await mockToken.mint(addr2.address, ethers.utils.parseEther("10000"));
    });

    describe("Basic Supply/Withdraw", function () {
        it("Should supply to Aave with fee collection", async function () {
            const amount = ethers.utils.parseEther("100");
            await mockToken.connect(addr1).approve(lendingAPYAggregator.address, amount);

            const tx = await lendingAPYAggregator.connect(addr1).supply(mockToken.address, amount, 0);

            // Check events
            await expect(tx).to.emit(lendingAPYAggregator, "SupplyExecuted");
            await expect(tx).to.emit(lendingAPYAggregator, "FeesCollected");

            // Check position
            const position = await lendingAPYAggregator.getUserPosition(addr1.address, mockToken.address);
            expect(position.supplied).to.be.gt(0);
            expect(position.protocol).to.equal(0); // AAVE
        });

        it("Should withdraw from position", async function () {
            const amount = ethers.utils.parseEther("100");
            await mockToken.connect(addr1).approve(lendingAPYAggregator.address, amount);
            await lendingAPYAggregator.connect(addr1).supply(mockToken.address, amount, 0);

            const position = await lendingAPYAggregator.getUserPosition(addr1.address, mockToken.address);
            const withdrawAmount = position.supplied;

            const tx = await lendingAPYAggregator.connect(addr1).withdraw(mockToken.address, withdrawAmount, 0);
            await expect(tx).to.emit(lendingAPYAggregator, "WithdrawExecuted");

            const newPosition = await lendingAPYAggregator.getUserPosition(addr1.address, mockToken.address);
            expect(newPosition.supplied).to.equal(0);
        });
    });

    describe("Automatic Best Rate Selection", function () {
        it("Should supply to best rate automatically", async function () {
            const amount = ethers.utils.parseEther("100");
            await mockToken.connect(addr1).approve(lendingAPYAggregator.address, amount);

            const tx = await lendingAPYAggregator.connect(addr1).supplyToBestRate(mockToken.address, amount, 0);
            await expect(tx).to.emit(lendingAPYAggregator, "SupplyExecuted");
        });

        it("Should revert if APY below minimum", async function () {
            const amount = ethers.utils.parseEther("100");
            await mockToken.connect(addr1).approve(lendingAPYAggregator.address, amount);

            const highMinAPY = ethers.utils.parseUnits("100", 27); // 100% APY
            await expect(
                lendingAPYAggregator.connect(addr1).supplyToBestRate(mockToken.address, amount, highMinAPY)
            ).to.be.revertedWith("APY below minimum expected");
        });
    });

    describe("Position Management", function () {
        it("Should track user positions correctly", async function () {
            const amount = ethers.utils.parseEther("100");
            await mockToken.connect(addr1).approve(lendingAPYAggregator.address, amount);
            await lendingAPYAggregator.connect(addr1).supply(mockToken.address, amount, 0);

            const position = await lendingAPYAggregator.getUserPosition(addr1.address, mockToken.address);
            expect(position.supplied).to.be.gt(0);
            expect(position.protocol).to.equal(0);
            expect(position.timestamp).to.be.gt(0);
        });

        it("Should get user portfolio", async function () {
            const amount = ethers.utils.parseEther("100");
            await mockToken.connect(addr1).approve(lendingAPYAggregator.address, amount);
            await lendingAPYAggregator.connect(addr1).supply(mockToken.address, amount, 0);

            const [totalSupplied, totalBorrowed] = await lendingAPYAggregator.getUserPortfolio(
                addr1.address,
                [mockToken.address]
            );
            expect(totalSupplied).to.be.gt(0);
            expect(totalBorrowed).to.equal(0);
        });
    });

    describe("Fee Management", function () {
        it("Should collect fees correctly", async function () {
            const amount = ethers.utils.parseEther("100");
            await mockToken.connect(addr1).approve(lendingAPYAggregator.address, amount);

            const feesBefore = await lendingAPYAggregator.getCollectedFees(mockToken.address);
            await lendingAPYAggregator.connect(addr1).supply(mockToken.address, amount, 0);
            const feesAfter = await lendingAPYAggregator.getCollectedFees(mockToken.address);

            expect(feesAfter).to.be.gt(feesBefore);
        });

        it("Should allow owner to update protocol fee", async function () {
            const newFee = 100; // 1%
            await lendingAPYAggregator.setProtocolFee(newFee);
            expect(await lendingAPYAggregator.protocolFee()).to.equal(newFee);
        });

        it("Should prevent setting fee too high", async function () {
            const highFee = 1500; // 15% (above 10% max)
            await expect(lendingAPYAggregator.setProtocolFee(highFee)).to.be.revertedWith("Fee too high");
        });
    });

    describe("Emergency Functions", function () {
        it("Should allow emergency pause", async function () {
            await lendingAPYAggregator.emergencyPause();
            expect(await lendingAPYAggregator.paused()).to.be.true;
        });

        it("Should prevent operations when paused", async function () {
            await lendingAPYAggregator.emergencyPause();
            const amount = ethers.utils.parseEther("100");
            await mockToken.connect(addr1).approve(lendingAPYAggregator.address, amount);

            await expect(
                lendingAPYAggregator.connect(addr1).supply(mockToken.address, amount, 0)
            ).to.be.revertedWith("Pausable: paused");
        });
    });

    describe("Validation", function () {
        it("Should reject unsupported assets", async function () {
            const amount = ethers.utils.parseEther("100");
            const unsupportedToken = ethers.constants.AddressZero;

            await expect(
                lendingAPYAggregator.connect(addr1).supply(unsupportedToken, amount, 0)
            ).to.be.revertedWith("Asset not supported");
        });

        it("Should reject amounts below minimum", async function () {
            const smallAmount = 100; // Very small amount
            await mockToken.connect(addr1).approve(lendingAPYAggregator.address, smallAmount);

            await expect(
                lendingAPYAggregator.connect(addr1).supply(mockToken.address, smallAmount, 0)
            ).to.be.revertedWith("Amount below minimum");
        });
    });
});
