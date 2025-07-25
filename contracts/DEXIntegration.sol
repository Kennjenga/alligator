// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IDEXRouter.sol";

contract DEXIntegration is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    // DEX Router (Trader Joe, Pangolin, etc.)
    IDEXRouter public dexRouter;
    
    // WAVAX address for routing
    address public immutable WAVAX;
    
    // Maximum slippage tolerance (in basis points, e.g., 300 = 3%)
    uint256 public maxSlippage = 300;
    
    // Minimum swap amount to prevent dust attacks
    uint256 public constant MIN_SWAP_AMOUNT = 1e6; // 1 USDC equivalent
    
    // Events
    event AssetPurchased(
        address indexed user,
        address indexed tokenIn,
        address indexed tokenOut,
        uint256 amountIn,
        uint256 amountOut
    );
    
    event AssetSold(
        address indexed user,
        address indexed tokenIn,
        address indexed tokenOut,
        uint256 amountIn,
        uint256 amountOut
    );
    
    event SlippageUpdated(uint256 oldSlippage, uint256 newSlippage);
    event RouterUpdated(address oldRouter, address newRouter);

    constructor(address _dexRouter, address _wavax) Ownable(msg.sender) {
        require(_dexRouter != address(0), "Invalid router address");
        require(_wavax != address(0), "Invalid WAVAX address");
        
        dexRouter = IDEXRouter(_dexRouter);
        WAVAX = _wavax;
    }

    /**
     * @notice Buy tokens using AVAX
     * @param tokenOut The token to purchase
     * @param amountOutMin Minimum amount of tokens to receive
     * @param deadline Transaction deadline
     * @return amountOut Amount of tokens received
     */
    function buyTokenWithAVAX(
        address tokenOut,
        uint256 amountOutMin,
        uint256 deadline
    ) external payable nonReentrant returns (uint256 amountOut) {
        require(msg.value >= MIN_SWAP_AMOUNT, "Amount too small");
        require(tokenOut != address(0), "Invalid token address");
        require(deadline >= block.timestamp, "Transaction expired");

        address[] memory path = new address[](2);
        path[0] = WAVAX;
        path[1] = tokenOut;

        uint256[] memory amounts = dexRouter.swapExactAVAXForTokens{value: msg.value}(
            amountOutMin,
            path,
            msg.sender,
            deadline
        );

        amountOut = amounts[1];
        
        emit AssetPurchased(msg.sender, WAVAX, tokenOut, msg.value, amountOut);
    }

    /**
     * @notice Buy tokens using another token
     * @param tokenIn The token to sell
     * @param tokenOut The token to purchase
     * @param amountIn Amount of input tokens
     * @param amountOutMin Minimum amount of output tokens to receive
     * @param deadline Transaction deadline
     * @return amountOut Amount of tokens received
     */
    function buyTokenWithToken(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 amountOutMin,
        uint256 deadline
    ) external nonReentrant returns (uint256 amountOut) {
        require(amountIn >= MIN_SWAP_AMOUNT, "Amount too small");
        require(tokenIn != address(0) && tokenOut != address(0), "Invalid token address");
        require(tokenIn != tokenOut, "Same token");
        require(deadline >= block.timestamp, "Transaction expired");

        // Transfer tokens from user
        IERC20(tokenIn).safeTransferFrom(msg.sender, address(this), amountIn);
        
        // Approve router to spend tokens
        IERC20(tokenIn).forceApprove(address(dexRouter), amountIn);

        address[] memory path;
        
        // Direct swap if possible, otherwise route through WAVAX
        if (_hasDirectPair(tokenIn, tokenOut)) {
            path = new address[](2);
            path[0] = tokenIn;
            path[1] = tokenOut;
        } else {
            path = new address[](3);
            path[0] = tokenIn;
            path[1] = WAVAX;
            path[2] = tokenOut;
        }

        uint256[] memory amounts = dexRouter.swapExactTokensForTokens(
            amountIn,
            amountOutMin,
            path,
            msg.sender,
            deadline
        );

        amountOut = amounts[amounts.length - 1];
        
        emit AssetPurchased(msg.sender, tokenIn, tokenOut, amountIn, amountOut);
    }

    /**
     * @notice Sell tokens for AVAX
     * @param tokenIn The token to sell
     * @param amountIn Amount of input tokens
     * @param amountOutMin Minimum amount of AVAX to receive
     * @param deadline Transaction deadline
     * @return amountOut Amount of AVAX received
     */
    function sellTokenForAVAX(
        address tokenIn,
        uint256 amountIn,
        uint256 amountOutMin,
        uint256 deadline
    ) external nonReentrant returns (uint256 amountOut) {
        require(amountIn >= MIN_SWAP_AMOUNT, "Amount too small");
        require(tokenIn != address(0), "Invalid token address");
        require(deadline >= block.timestamp, "Transaction expired");

        // Transfer tokens from user
        IERC20(tokenIn).safeTransferFrom(msg.sender, address(this), amountIn);
        
        // Approve router to spend tokens
        IERC20(tokenIn).forceApprove(address(dexRouter), amountIn);

        address[] memory path = new address[](2);
        path[0] = tokenIn;
        path[1] = WAVAX;

        uint256[] memory amounts = dexRouter.swapTokensForExactAVAX(
            amountOutMin,
            amountIn,
            path,
            msg.sender,
            deadline
        );

        amountOut = amounts[1];
        
        emit AssetSold(msg.sender, tokenIn, WAVAX, amountIn, amountOut);
    }

    /**
     * @notice Get quote for buying tokens with AVAX
     * @param tokenOut The token to purchase
     * @param amountIn Amount of AVAX to spend
     * @return amountOut Expected amount of tokens to receive
     */
    function getQuoteBuyWithAVAX(address tokenOut, uint256 amountIn)
        external
        view
        returns (uint256 amountOut)
    {
        address[] memory path = new address[](2);
        path[0] = WAVAX;
        path[1] = tokenOut;

        uint256[] memory amounts = dexRouter.getAmountsOut(amountIn, path);
        amountOut = amounts[1];
    }

    /**
     * @notice Get quote for buying tokens with another token
     * @param tokenIn The token to sell
     * @param tokenOut The token to purchase
     * @param amountIn Amount of input tokens
     * @return amountOut Expected amount of output tokens to receive
     */
    function getQuoteBuyWithToken(
        address tokenIn,
        address tokenOut,
        uint256 amountIn
    ) external view returns (uint256 amountOut) {
        address[] memory path;
        
        if (_hasDirectPair(tokenIn, tokenOut)) {
            path = new address[](2);
            path[0] = tokenIn;
            path[1] = tokenOut;
        } else {
            path = new address[](3);
            path[0] = tokenIn;
            path[1] = WAVAX;
            path[2] = tokenOut;
        }

        uint256[] memory amounts = dexRouter.getAmountsOut(amountIn, path);
        amountOut = amounts[amounts.length - 1];
    }

    /**
     * @notice Calculate minimum amount out with slippage protection
     * @param amountOut Expected amount out
     * @return minAmountOut Minimum amount out considering slippage
     */
    function calculateMinAmountOut(uint256 amountOut) external view returns (uint256 minAmountOut) {
        minAmountOut = (amountOut * (10000 - maxSlippage)) / 10000;
    }

    /**
     * @notice Check if direct trading pair exists (simplified check)
     * @param tokenA First token
     * @param tokenB Second token
     * @return exists Whether direct pair exists
     */
    function _hasDirectPair(address tokenA, address tokenB) internal pure returns (bool exists) {
        // Simplified logic - in practice, you'd check the factory for pair existence
        // For now, assume all major tokens have direct pairs with WAVAX
        return tokenA == address(0) || tokenB == address(0); // Placeholder logic
    }

    // Admin functions
    function updateSlippage(uint256 _maxSlippage) external onlyOwner {
        require(_maxSlippage <= 1000, "Slippage too high"); // Max 10%
        uint256 oldSlippage = maxSlippage;
        maxSlippage = _maxSlippage;
        emit SlippageUpdated(oldSlippage, _maxSlippage);
    }

    function updateRouter(address _newRouter) external onlyOwner {
        require(_newRouter != address(0), "Invalid router address");
        address oldRouter = address(dexRouter);
        dexRouter = IDEXRouter(_newRouter);
        emit RouterUpdated(oldRouter, _newRouter);
    }

    // Emergency function to recover stuck tokens
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        if (token == address(0)) {
            payable(owner()).transfer(amount);
        } else {
            IERC20(token).safeTransfer(owner(), amount);
        }
    }

    receive() external payable {}
}
