// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IMorpho {
    /**
     * @notice Supplies assets to Morpho
     * @param asset The address of the asset to supply
     * @param amount The amount to supply
     * @param onBehalfOf The address that will receive the supply position
     * @param maxIterations The maximum number of iterations for the matching engine
     */
    function supply(
        address asset,
        uint256 amount,
        address onBehalfOf,
        uint256 maxIterations
    ) external;

    /**
     * @notice Withdraws assets from Morpho
     * @param asset The address of the asset to withdraw
     * @param amount The amount to withdraw
     * @param to The address that will receive the withdrawn assets
     * @param maxIterations The maximum number of iterations for the matching engine
     */
    function withdraw(
        address asset,
        uint256 amount,
        address to,
        uint256 maxIterations
    ) external;

    /**
     * @notice Borrows assets from Morpho
     * @param asset The address of the asset to borrow
     * @param amount The amount to borrow
     * @param interestRateMode The interest rate mode (1 for stable, 2 for variable)
     * @param maxIterations The maximum number of iterations for the matching engine
     * @param onBehalfOf The address that will receive the borrowed assets
     */
    function borrow(
        address asset,
        uint256 amount,
        uint256 interestRateMode,
        uint256 maxIterations,
        address onBehalfOf
    ) external;

    /**
     * @notice Repays borrowed assets to Morpho
     * @param asset The address of the asset to repay
     * @param amount The amount to repay
     * @param interestRateMode The interest rate mode (1 for stable, 2 for variable)
     * @param onBehalfOf The address whose debt will be repaid
     */
    function repay(
        address asset,
        uint256 amount,
        uint256 interestRateMode,
        address onBehalfOf
    ) external;

    /**
     * @notice Returns the current supply APY for a given asset
     * @param asset The address of the asset
     * @return The supply APY in ray (1e27)
     */
    function getSupplyAPY(address asset) external view returns (uint256);

    /**
     * @notice Returns the current borrow APY for a given asset
     * @param asset The address of the asset
     * @return The borrow APY in ray (1e27)
     */
    function getBorrowAPY(address asset) external view returns (uint256);

    /**
     * @notice Returns the supply balance for a user and asset
     * @param user The address of the user
     * @param asset The address of the asset
     * @return The supply balance
     */
    function supplyBalanceOf(address user, address asset) external view returns (uint256);

    /**
     * @notice Returns the borrow balance for a user and asset
     * @param user The address of the user
     * @param asset The address of the asset
     * @return The borrow balance
     */
    function borrowBalanceOf(address user, address asset) external view returns (uint256);
}
