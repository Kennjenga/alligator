// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface ICCIPSender {
    /**
     * @notice Send a supply message via CCIP
     * @param asset The address of the asset to supply
     * @param amount The amount to supply
     * @param onBehalfOf The address that will receive the supply position
     */
    function sendSupply(address asset, uint256 amount, address onBehalfOf) external;

    /**
     * @notice Send a borrow message via CCIP
     * @param asset The address of the asset to borrow
     * @param amount The amount to borrow
     * @param onBehalfOf The address that will receive the borrowed assets
     */
    function sendBorrow(address asset, uint256 amount, address onBehalfOf) external;

    /**
     * @notice Send a repay message via CCIP
     * @param asset The address of the asset to repay
     * @param amount The amount to repay
     * @param onBehalfOf The address whose debt will be repaid
     */
    function sendRepay(address asset, uint256 amount, address onBehalfOf) external;

    /**
     * @notice Send a withdraw message via CCIP
     * @param asset The address of the asset to withdraw
     * @param amount The amount to withdraw
     * @param to The address that will receive the withdrawn assets
     */
    function sendWithdraw(address asset, uint256 amount, address to) external;
}

interface ILinkToken {
    function balanceOf(address account) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}
