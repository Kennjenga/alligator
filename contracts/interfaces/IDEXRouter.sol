// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IDEXRouter {
    /**
     * @notice Swap exact tokens for tokens
     * @param amountIn The amount of input tokens to send
     * @param amountOutMin The minimum amount of output tokens that must be received
     * @param path An array of token addresses representing the swap path
     * @param to Recipient of the output tokens
     * @param deadline Unix timestamp after which the transaction will revert
     * @return amounts The input token amount and all subsequent output token amounts
     */
    function swapExactTokensForTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external returns (uint256[] memory amounts);

    /**
     * @notice Swap tokens for exact tokens
     * @param amountOut The amount of output tokens to receive
     * @param amountInMax The maximum amount of input tokens that can be required
     * @param path An array of token addresses representing the swap path
     * @param to Recipient of the output tokens
     * @param deadline Unix timestamp after which the transaction will revert
     * @return amounts The input token amount and all subsequent output token amounts
     */
    function swapTokensForExactTokens(
        uint256 amountOut,
        uint256 amountInMax,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external returns (uint256[] memory amounts);

    /**
     * @notice Swap exact AVAX for tokens
     * @param amountOutMin The minimum amount of output tokens that must be received
     * @param path An array of token addresses representing the swap path
     * @param to Recipient of the output tokens
     * @param deadline Unix timestamp after which the transaction will revert
     * @return amounts The input token amount and all subsequent output token amounts
     */
    function swapExactAVAXForTokens(
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external payable returns (uint256[] memory amounts);

    /**
     * @notice Swap tokens for exact AVAX
     * @param amountOut The amount of AVAX to receive
     * @param amountInMax The maximum amount of input tokens that can be required
     * @param path An array of token addresses representing the swap path
     * @param to Recipient of the AVAX
     * @param deadline Unix timestamp after which the transaction will revert
     * @return amounts The input token amount and all subsequent output token amounts
     */
    function swapTokensForExactAVAX(
        uint256 amountOut,
        uint256 amountInMax,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external returns (uint256[] memory amounts);

    /**
     * @notice Get amounts out for a given input amount and path
     * @param amountIn The amount of input tokens
     * @param path An array of token addresses representing the swap path
     * @return amounts The input token amount and all subsequent output token amounts
     */
    function getAmountsOut(uint256 amountIn, address[] calldata path)
        external
        view
        returns (uint256[] memory amounts);

    /**
     * @notice Get amounts in for a given output amount and path
     * @param amountOut The amount of output tokens
     * @param path An array of token addresses representing the swap path
     * @return amounts The input token amount and all subsequent output token amounts
     */
    function getAmountsIn(uint256 amountOut, address[] calldata path)
        external
        view
        returns (uint256[] memory amounts);

    /**
     * @notice Get the factory address
     * @return The factory contract address
     */
    function factory() external pure returns (address);

    /**
     * @notice Get the WAVAX address
     * @return The WAVAX contract address
     */
    function WAVAX() external pure returns (address);
}
