// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IBenqi {
    /**
     * @notice Supply assets to Benqi
     * @param qiToken The address of the qiToken to mint
     * @param mintAmount The amount of underlying asset to supply
     * @return 0 on success, otherwise an error code
     */
    function mint(address qiToken, uint256 mintAmount) external returns (uint256);

    /**
     * @notice Redeem qiTokens for underlying assets
     * @param qiToken The address of the qiToken to redeem
     * @param redeemTokens The number of qiTokens to redeem
     * @return 0 on success, otherwise an error code
     */
    function redeem(address qiToken, uint256 redeemTokens) external returns (uint256);

    /**
     * @notice Redeem underlying assets by specifying the amount
     * @param qiToken The address of the qiToken to redeem
     * @param redeemAmount The amount of underlying asset to redeem
     * @return 0 on success, otherwise an error code
     */
    function redeemUnderlying(address qiToken, uint256 redeemAmount) external returns (uint256);

    /**
     * @notice Borrow assets from Benqi
     * @param qiToken The address of the qiToken to borrow
     * @param borrowAmount The amount to borrow
     * @return 0 on success, otherwise an error code
     */
    function borrow(address qiToken, uint256 borrowAmount) external returns (uint256);

    /**
     * @notice Repay borrowed assets
     * @param qiToken The address of the qiToken to repay
     * @param repayAmount The amount to repay
     * @return 0 on success, otherwise an error code
     */
    function repayBorrow(address qiToken, uint256 repayAmount) external returns (uint256);

    /**
     * @notice Enter markets to use as collateral
     * @param qiTokens The list of qiToken addresses to enter
     * @return For each market, returns an error code indicating whether or not it was entered.
     */
    function enterMarkets(address[] calldata qiTokens) external returns (uint256[] memory);

    /**
     * @notice Exit a market
     * @param qiToken The address of the qiToken to exit
     * @return 0 on success, otherwise an error code
     */
    function exitMarket(address qiToken) external returns (uint256);

    /**
     * @notice Returns the current supply APY for a given qiToken
     * @param qiToken The address of the qiToken
     * @return The supply APY in ray (1e27)
     */
    function getSupplyAPY(address qiToken) external view returns (uint256);

    /**
     * @notice Returns the current borrow APY for a given qiToken
     * @param qiToken The address of the qiToken
     * @return The borrow APY in ray (1e27)
     */
    function getBorrowAPY(address qiToken) external view returns (uint256);

    /**
     * @notice Get the underlying asset address for a qiToken
     * @param qiToken The address of the qiToken
     * @return The address of the underlying asset
     */
    function getUnderlyingAddress(address qiToken) external view returns (address);

    /**
     * @notice Get account liquidity information
     * @param account The account to check
     * @return error code, liquidity, and shortfall
     */
    function getAccountLiquidity(address account) external view returns (uint256, uint256, uint256);

    /**
     * @notice Get the current supply rate per block for a qiToken
     * @param qiToken The address of the qiToken
     * @return The supply rate per block
     */
    function supplyRatePerBlock(address qiToken) external view returns (uint256);

    /**
     * @notice Get the current borrow rate per block for a qiToken
     * @param qiToken The address of the qiToken
     * @return The borrow rate per block
     */
    function borrowRatePerBlock(address qiToken) external view returns (uint256);
}
