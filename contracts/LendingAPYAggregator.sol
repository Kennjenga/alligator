// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IAave.sol";
import "./interfaces/IMorpho.sol";
import "./interfaces/IBenqi.sol";
import "./interfaces/IYieldYak.sol";

contract LendingAPYAggregator is ReentrancyGuard, Pausable, Ownable {
    using SafeERC20 for IERC20;

    // Protocol interfaces
    IAave public aave;
    IMorpho public morpho;
    IBenqi public benqi;
    IYieldYak public yieldYak;

    // Constants
    uint256 public constant MAX_PROTOCOL_FEE = 1000; // 10% max fee
    uint256 public constant MIN_AMOUNT = 1e6; // Minimum transaction amount (1 USDC)
    uint256 public constant SLIPPAGE_TOLERANCE = 100; // 1% default slippage tolerance

    // State variables
    uint256 public protocolFee = 50; // 0.5% default fee
    address public feeRecipient;
    uint256 public totalFeesCollected;

    enum Protocol { AAVE, MORPHO, BENQI, YIELDYAK }

    struct APYData {
        uint256 supplyAPY;
        uint256 borrowAPY;
        Protocol protocol;
    }

    struct UserPosition {
        uint256 supplied;
        uint256 borrowed;
        Protocol protocol;
        uint256 timestamp;
        uint256 lastRebalance;
    }

    struct RebalanceParams {
        address asset;
        uint256 amount;
        Protocol fromProtocol;
        Protocol toProtocol;
        uint256 minExpectedAmount;
    }

    // Mappings
    mapping(address => mapping(address => UserPosition)) public userPositions; // user => asset => position
    mapping(address => uint256) public collectedFees; // asset => fees
    mapping(address => bool) public supportedAssets;
    mapping(address => uint256) public minAmounts; // asset => minimum amount

    // Events
    event SupplyExecuted(address indexed user, address indexed asset, uint256 amount, Protocol protocol);
    event BorrowExecuted(address indexed user, address indexed asset, uint256 amount, Protocol protocol);
    event WithdrawExecuted(address indexed user, address indexed asset, uint256 amount, Protocol protocol);
    event RepayExecuted(address indexed user, address indexed asset, uint256 amount, Protocol protocol);
    event Rebalanced(address indexed user, address indexed asset, uint256 amount, Protocol fromProtocol, Protocol toProtocol);
    event EmergencyWithdraw(address indexed user, address indexed asset, uint256 amount);
    event FeesCollected(address indexed asset, uint256 amount);
    event ProtocolFeeUpdated(uint256 oldFee, uint256 newFee);

    // Modifiers
    modifier validAmount(address asset, uint256 amount) {
        require(amount > 0, "Amount must be greater than 0");
        uint256 minAmount = minAmounts[asset] > 0 ? minAmounts[asset] : MIN_AMOUNT;
        require(amount >= minAmount, "Amount below minimum");
        _;
    }

    modifier supportedAsset(address asset) {
        require(supportedAssets[asset], "Asset not supported");
        _;
    }

    modifier validProtocol(Protocol protocol) {
        require(uint8(protocol) <= uint8(Protocol.YIELDYAK), "Invalid protocol");
        _;
    }

    constructor(
        address _aave,
        address _morpho,
        address _benqi,
        address _yieldYak
    ) Ownable(msg.sender) {
        aave = IAave(_aave);
        morpho = IMorpho(_morpho);
        benqi = IBenqi(_benqi);
        yieldYak = IYieldYak(_yieldYak);
        feeRecipient = msg.sender;

        // Initialize supported assets (can be updated later)
        supportedAssets[address(0)] = true; // Native token (AVAX)
    }

    function supply(address asset, uint256 amount, Protocol protocol)
        external
        nonReentrant
        whenNotPaused
        validAmount(asset, amount)
        supportedAsset(asset)
        validProtocol(protocol)
    {
        // Calculate fee
        uint256 fee = (amount * protocolFee) / 10000;
        uint256 netAmount = amount - fee;

        // Transfer tokens from user
        IERC20(asset).safeTransferFrom(msg.sender, address(this), amount);

        // Collect fee
        if (fee > 0) {
            collectedFees[asset] += fee;
            totalFeesCollected += fee;
            emit FeesCollected(asset, fee);
        }

        // Execute supply based on protocol
        _executeSupply(asset, netAmount, protocol, msg.sender);

        // Update user position
        _updateUserPosition(msg.sender, asset, netAmount, 0, protocol, true);

        emit SupplyExecuted(msg.sender, asset, netAmount, protocol);
    }

    function _executeSupply(address asset, uint256 amount, Protocol protocol, address user) internal {
        if (protocol == Protocol.AAVE) {
            IERC20(asset).forceApprove(address(aave), amount);
            aave.supply(asset, amount, user, 0);
        } else if (protocol == Protocol.MORPHO) {
            // Morpho integration would go here - for now skip
            revert("Morpho not implemented");
        } else if (protocol == Protocol.BENQI) {
            IERC20(asset).forceApprove(address(benqi), amount);
            benqi.mint(asset, amount);
        } else if (protocol == Protocol.YIELDYAK) {
            IERC20(asset).forceApprove(address(yieldYak), amount);
            yieldYak.deposit(amount);
        }
    }

    function borrow(address asset, uint256 amount, Protocol protocol)
        external
        nonReentrant
        whenNotPaused
        validAmount(asset, amount)
        supportedAsset(asset)
        validProtocol(protocol)
    {
        require(protocol != Protocol.YIELDYAK, "YieldYak doesn't support borrowing");

        // Execute borrow
        if (protocol == Protocol.AAVE) {
            aave.borrow(asset, amount, 2, 0, msg.sender);
        } else if (protocol == Protocol.MORPHO) {
            revert("Morpho not implemented");
        } else if (protocol == Protocol.BENQI) {
            benqi.borrow(asset, amount);
        }

        // Update user position
        _updateUserPosition(msg.sender, asset, 0, amount, protocol, false);

        emit BorrowExecuted(msg.sender, asset, amount, protocol);
    }

    function repay(address asset, uint256 amount, Protocol protocol)
        external
        nonReentrant
        whenNotPaused
        validAmount(asset, amount)
        supportedAsset(asset)
        validProtocol(protocol)
    {
        UserPosition storage position = userPositions[msg.sender][asset];
        require(position.borrowed >= amount, "Repay amount exceeds borrowed");

        IERC20(asset).safeTransferFrom(msg.sender, address(this), amount);

        if (protocol == Protocol.AAVE) {
            IERC20(asset).forceApprove(address(aave), amount);
            aave.repay(asset, amount, 2, msg.sender);
        } else if (protocol == Protocol.MORPHO) {
            revert("Morpho not implemented");
        } else if (protocol == Protocol.BENQI) {
            IERC20(asset).forceApprove(address(benqi), amount);
            benqi.repayBorrow(asset, amount);
        }

        // Update user position
        position.borrowed -= amount;

        emit RepayExecuted(msg.sender, asset, amount, protocol);
    }

    function withdraw(address asset, uint256 amount, Protocol protocol)
        external
        nonReentrant
        whenNotPaused
        validAmount(asset, amount)
        supportedAsset(asset)
        validProtocol(protocol)
    {
        UserPosition storage position = userPositions[msg.sender][asset];
        require(position.supplied >= amount, "Withdraw amount exceeds supplied");

        _executeWithdraw(asset, amount, protocol, msg.sender);

        // Update user position
        position.supplied -= amount;

        emit WithdrawExecuted(msg.sender, asset, amount, protocol);
    }

    /**
     * @notice Get APY data from all supported protocols for a given asset
     * @param asset The address of the asset
     * @return apyData Array of APY data from all protocols
     */
    function getAllAPYs(address asset) public view returns (APYData[] memory apyData) {
        apyData = new APYData[](4);

        // Aave APYs
        apyData[0] = APYData({
            supplyAPY: aave.getSupplyAPY(asset),
            borrowAPY: aave.getBorrowAPY(asset),
            protocol: Protocol.AAVE
        });

        // Morpho APYs (placeholder - would need actual implementation)
        apyData[1] = APYData({
            supplyAPY: morpho.getSupplyAPY(asset),
            borrowAPY: morpho.getBorrowAPY(asset),
            protocol: Protocol.MORPHO
        });

        // Benqi APYs
        apyData[2] = APYData({
            supplyAPY: benqi.getSupplyAPY(asset),
            borrowAPY: benqi.getBorrowAPY(asset),
            protocol: Protocol.BENQI
        });

        // YieldYak APYs (only supply, no borrowing)
        apyData[3] = APYData({
            supplyAPY: yieldYak.getAPY() * 1e23, // Convert from basis points to ray
            borrowAPY: 0,
            protocol: Protocol.YIELDYAK
        });
    }

    /**
     * @notice Find the best supply APY among all protocols
     * @param asset The address of the asset
     * @return bestProtocol The protocol with the highest supply APY
     * @return bestAPY The highest supply APY
     */
    function getBestSupplyAPY(address asset) public view returns (Protocol bestProtocol, uint256 bestAPY) {
        APYData[] memory apyData = getAllAPYs(asset);
        bestAPY = 0;
        bestProtocol = Protocol.AAVE;

        for (uint i = 0; i < apyData.length; i++) {
            if (apyData[i].supplyAPY > bestAPY) {
                bestAPY = apyData[i].supplyAPY;
                bestProtocol = apyData[i].protocol;
            }
        }
    }

    /**
     * @notice Find the best borrow APY among all protocols
     * @param asset The address of the asset
     * @return bestProtocol The protocol with the lowest borrow APY
     * @return bestAPY The lowest borrow APY
     */
    function getBestBorrowAPY(address asset) public view returns (Protocol bestProtocol, uint256 bestAPY) {
        APYData[] memory apyData = getAllAPYs(asset);
        bestAPY = type(uint256).max;
        bestProtocol = Protocol.AAVE;

        for (uint i = 0; i < apyData.length; i++) {
            if (apyData[i].borrowAPY > 0 && apyData[i].borrowAPY < bestAPY) {
                bestAPY = apyData[i].borrowAPY;
                bestProtocol = apyData[i].protocol;
            }
        }
    }

    /**
     * @notice Update protocol addresses (only owner)
     */
    function updateProtocols(
        address _aave,
        address _morpho,
        address _benqi,
        address _yieldYak
    ) external {
        require(msg.sender == owner(), "Only owner");
        aave = IAave(_aave);
        morpho = IMorpho(_morpho);
        benqi = IBenqi(_benqi);
        yieldYak = IYieldYak(_yieldYak);
    }

    // ============ AUTOMATIC BEST RATE FUNCTIONS ============

    /**
     * @notice Automatically supply to the protocol with the highest APY
     * @param asset The asset to supply
     * @param amount The amount to supply
     * @param minExpectedAPY Minimum APY to accept (slippage protection)
     */
    function supplyToBestRate(address asset, uint256 amount, uint256 minExpectedAPY)
        external
        nonReentrant
        whenNotPaused
        validAmount(asset, amount)
        supportedAsset(asset)
    {
        (Protocol bestProtocol, uint256 bestAPY) = getBestSupplyAPY(asset);
        require(bestAPY >= minExpectedAPY, "APY below minimum expected");

        this.supply(asset, amount, bestProtocol);
    }

    /**
     * @notice Automatically borrow from the protocol with the lowest APY
     * @param asset The asset to borrow
     * @param amount The amount to borrow
     * @param maxExpectedAPY Maximum APY to accept (slippage protection)
     */
    function borrowFromBestRate(address asset, uint256 amount, uint256 maxExpectedAPY)
        external
        nonReentrant
        whenNotPaused
        validAmount(asset, amount)
        supportedAsset(asset)
    {
        (Protocol bestProtocol, uint256 bestAPY) = getBestBorrowAPY(asset);
        require(bestAPY <= maxExpectedAPY, "APY above maximum expected");
        require(bestAPY > 0, "No borrowing available");

        this.borrow(asset, amount, bestProtocol);
    }

    // ============ REBALANCING FUNCTIONS ============

    /**
     * @notice Rebalance user's position to a protocol with better APY
     * @param params Rebalancing parameters
     */
    function rebalancePosition(RebalanceParams calldata params)
        external
        nonReentrant
        whenNotPaused
        supportedAsset(params.asset)
    {
        UserPosition storage position = userPositions[msg.sender][params.asset];
        require(position.supplied >= params.amount, "Insufficient supplied amount");
        require(position.protocol == params.fromProtocol, "Position not in specified protocol");

        // Check if rebalancing is beneficial
        APYData[] memory apyData = getAllAPYs(params.asset);
        uint256 fromAPY = _getProtocolAPY(apyData, params.fromProtocol);
        uint256 toAPY = _getProtocolAPY(apyData, params.toProtocol);
        require(toAPY > fromAPY, "Target protocol doesn't offer better APY");

        // Withdraw from current protocol
        _executeWithdraw(params.asset, params.amount, params.fromProtocol, msg.sender);

        // Supply to new protocol
        _executeSupply(params.asset, params.amount, params.toProtocol, msg.sender);

        // Update position
        position.supplied -= params.amount;
        _updateUserPosition(msg.sender, params.asset, params.amount, 0, params.toProtocol, true);
        position.lastRebalance = block.timestamp;

        emit Rebalanced(msg.sender, params.asset, params.amount, params.fromProtocol, params.toProtocol);
    }

    /**
     * @notice Automatically rebalance to the highest APY protocol
     * @param asset The asset to rebalance
     * @param amount The amount to rebalance
     */
    function autoRebalance(address asset, uint256 amount)
        external
        nonReentrant
        whenNotPaused
        supportedAsset(asset)
    {
        UserPosition storage position = userPositions[msg.sender][asset];
        require(position.supplied >= amount, "Insufficient supplied amount");
        require(block.timestamp >= position.lastRebalance + 1 hours, "Rebalancing too frequent");

        (Protocol bestProtocol, uint256 bestAPY) = getBestSupplyAPY(asset);

        // Only rebalance if the improvement is significant (>0.1% APY difference)
        APYData[] memory apyData = getAllAPYs(asset);
        uint256 currentAPY = _getProtocolAPY(apyData, position.protocol);
        require(bestAPY > currentAPY + 1e25, "Improvement not significant enough"); // 0.1% in ray

        RebalanceParams memory params = RebalanceParams({
            asset: asset,
            amount: amount,
            fromProtocol: position.protocol,
            toProtocol: bestProtocol,
            minExpectedAmount: amount
        });

        this.rebalancePosition(params);
    }

    // ============ EMERGENCY FUNCTIONS ============

    /**
     * @notice Emergency withdraw all user's positions from all protocols
     * @param asset The asset to withdraw
     */
    function emergencyWithdrawAll(address asset)
        external
        nonReentrant
        supportedAsset(asset)
    {
        UserPosition storage position = userPositions[msg.sender][asset];
        require(position.supplied > 0, "No position to withdraw");

        uint256 totalWithdrawn = 0;

        // Try to withdraw from the user's current protocol
        if (position.supplied > 0) {
            try this._executeWithdraw(asset, position.supplied, position.protocol, msg.sender) {
                totalWithdrawn += position.supplied;
                position.supplied = 0;
            } catch {
                // If withdrawal fails, mark for manual intervention
                emit EmergencyWithdraw(msg.sender, asset, 0);
            }
        }

        emit EmergencyWithdraw(msg.sender, asset, totalWithdrawn);
    }

    /**
     * @notice Emergency pause all operations (owner only)
     */
    function emergencyPause() external onlyOwner {
        _pause();
    }

    /**
     * @notice Unpause operations (owner only)
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    // ============ POSITION MANAGEMENT ============

    /**
     * @notice Get user's position for a specific asset
     * @param user The user address
     * @param asset The asset address
     * @return position The user's position data
     */
    function getUserPosition(address user, address asset)
        external
        view
        returns (UserPosition memory position)
    {
        return userPositions[user][asset];
    }

    /**
     * @notice Get user's total portfolio value across all assets
     * @param user The user address
     * @param assets Array of asset addresses to check
     * @return totalSupplied Total supplied across all assets
     * @return totalBorrowed Total borrowed across all assets
     */
    function getUserPortfolio(address user, address[] calldata assets)
        external
        view
        returns (uint256 totalSupplied, uint256 totalBorrowed)
    {
        for (uint256 i = 0; i < assets.length; i++) {
            UserPosition memory position = userPositions[user][assets[i]];
            totalSupplied += position.supplied;
            totalBorrowed += position.borrowed;
        }
    }

    /**
     * @notice Check if user's position can be rebalanced
     * @param user The user address
     * @param asset The asset address
     * @return canRebalance Whether rebalancing is available
     * @return bestProtocol The best protocol to rebalance to
     * @return improvement APY improvement percentage
     */
    function checkRebalanceOpportunity(address user, address asset)
        external
        view
        returns (bool canRebalance, Protocol bestProtocol, uint256 improvement)
    {
        UserPosition memory position = userPositions[user][asset];
        if (position.supplied == 0) return (false, Protocol.AAVE, 0);

        (Protocol best, uint256 bestAPY) = getBestSupplyAPY(asset);
        APYData[] memory apyData = getAllAPYs(asset);
        uint256 currentAPY = _getProtocolAPY(apyData, position.protocol);

        if (bestAPY > currentAPY + 1e25) { // 0.1% improvement threshold
            return (true, best, bestAPY - currentAPY);
        }

        return (false, Protocol.AAVE, 0);
    }

    // ============ INTERNAL HELPER FUNCTIONS ============

    function _updateUserPosition(
        address user,
        address asset,
        uint256 suppliedAmount,
        uint256 borrowedAmount,
        Protocol protocol,
        bool isSupply
    ) internal {
        UserPosition storage position = userPositions[user][asset];

        if (isSupply) {
            position.supplied += suppliedAmount;
        } else {
            position.borrowed += borrowedAmount;
        }

        position.protocol = protocol;
        position.timestamp = block.timestamp;
    }

    function _executeWithdraw(address asset, uint256 amount, Protocol protocol, address user) public {
        if (protocol == Protocol.AAVE) {
            aave.withdraw(asset, amount, user);
        } else if (protocol == Protocol.MORPHO) {
            revert("Morpho not implemented");
        } else if (protocol == Protocol.BENQI) {
            benqi.redeemUnderlying(asset, amount);
        } else if (protocol == Protocol.YIELDYAK) {
            yieldYak.withdraw(amount);
        }
    }

    function _getProtocolAPY(APYData[] memory apyData, Protocol protocol) internal pure returns (uint256) {
        for (uint256 i = 0; i < apyData.length; i++) {
            if (apyData[i].protocol == protocol) {
                return apyData[i].supplyAPY;
            }
        }
        return 0;
    }

    // ============ ADMIN FUNCTIONS ============

    /**
     * @notice Update protocol fee (owner only)
     * @param newFee New fee in basis points (max 10%)
     */
    function setProtocolFee(uint256 newFee) external onlyOwner {
        require(newFee <= MAX_PROTOCOL_FEE, "Fee too high");
        uint256 oldFee = protocolFee;
        protocolFee = newFee;
        emit ProtocolFeeUpdated(oldFee, newFee);
    }

    /**
     * @notice Update fee recipient (owner only)
     * @param newRecipient New fee recipient address
     */
    function setFeeRecipient(address newRecipient) external onlyOwner {
        require(newRecipient != address(0), "Invalid recipient");
        feeRecipient = newRecipient;
    }

    /**
     * @notice Add or remove supported asset (owner only)
     * @param asset Asset address
     * @param supported Whether the asset is supported
     */
    function setSupportedAsset(address asset, bool supported) external onlyOwner {
        supportedAssets[asset] = supported;
    }

    /**
     * @notice Withdraw collected fees (owner only)
     * @param asset Asset to withdraw fees for
     * @param amount Amount to withdraw (0 for all)
     */
    function withdrawFees(address asset, uint256 amount) external onlyOwner {
        uint256 availableFees = collectedFees[asset];
        require(availableFees > 0, "No fees to withdraw");

        uint256 withdrawAmount = amount == 0 ? availableFees : amount;
        require(withdrawAmount <= availableFees, "Insufficient fees");

        collectedFees[asset] -= withdrawAmount;
        IERC20(asset).safeTransfer(feeRecipient, withdrawAmount);
    }

    /**
     * @notice Get total fees collected for an asset
     */
    function getCollectedFees(address asset) external view returns (uint256) {
        return collectedFees[asset];
    }

    /**
     * @notice Check if an asset is supported
     */
    function isAssetSupported(address asset) external view returns (bool) {
        return supportedAssets[asset];
    }

    /**
     * @notice Calculate fee for a given amount
     */
    function calculateFee(uint256 amount) external view returns (uint256) {
        return (amount * protocolFee) / 10000;
    }

    /**
     * @notice Emergency token recovery (owner only)
     */
    function emergencyTokenRecovery(address token, uint256 amount) external onlyOwner {
        if (token == address(0)) {
            payable(owner()).transfer(amount);
        } else {
            IERC20(token).safeTransfer(owner(), amount);
        }
    }

    /**
     * @notice Receive function to accept native tokens
     */
    receive() external payable {}
}
