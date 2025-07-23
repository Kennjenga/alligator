// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IYieldYak {
    /**
     * @notice Deposit tokens into the YieldYak strategy
     * @param amount The amount of tokens to deposit
     */
    function deposit(uint256 amount) external;

    /**
     * @notice Withdraw tokens from the YieldYak strategy
     * @param amount The amount of tokens to withdraw
     */
    function withdraw(uint256 amount) external;

    /**
     * @notice Get the current APY of the strategy
     * @return The APY in basis points (e.g., 1000 = 10%)
     */
    function getAPY() external view returns (uint256);

    /**
     * @notice Get the total value locked in the strategy
     * @return The total value locked
     */
    function totalDeposits() external view returns (uint256);

    /**
     * @notice Get the underlying token address
     * @return The address of the underlying token
     */
    function depositToken() external view returns (address);

    /**
     * @notice Get the receipt token address (YRT token)
     * @return The address of the receipt token
     */
    function receiptToken() external view returns (address);

    /**
     * @notice Calculate the amount of receipt tokens for a given deposit amount
     * @param amount The deposit amount
     * @return The amount of receipt tokens
     */
    function getSharesForDepositTokens(uint256 amount) external view returns (uint256);

    /**
     * @notice Calculate the amount of deposit tokens for a given receipt token amount
     * @param amount The receipt token amount
     * @return The amount of deposit tokens
     */
    function getDepositTokensForShares(uint256 amount) external view returns (uint256);

    /**
     * @notice Get the balance of receipt tokens for a user
     * @param user The user address
     * @return The balance of receipt tokens
     */
    function balanceOf(address user) external view returns (uint256);

    /**
     * @notice Get the estimated rewards for a user
     * @param user The user address
     * @return The estimated rewards
     */
    function estimateRewards(address user) external view returns (uint256);

    /**
     * @notice Claim rewards for a user
     */
    function getReward() external;

    /**
     * @notice Get the strategy name
     * @return The strategy name
     */
    function name() external view returns (string memory);

    /**
     * @notice Check if deposits are enabled
     * @return True if deposits are enabled
     */
    function depositsEnabled() external view returns (bool);

    /**
     * @notice Get the minimum deposit amount
     * @return The minimum deposit amount
     */
    function MIN_TOKENS_TO_DEPOSIT() external view returns (uint256);
}
