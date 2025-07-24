'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useAccount, useBalance } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { avalancheFuji } from 'wagmi/chains';
import { CONTRACT_ADDRESSES, TOKEN_ADDRESSES, LENDING_APY_AGGREGATOR_ABI } from '../config/wagmi';

export interface TransactionState {
  isLoading: boolean;
  isConfirming: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: string | null;
  hash: string | null;
}

export function useSupplyTransaction() {
  const { address } = useAccount();
  const { writeContract, data: hash, error: writeError } = useWriteContract();
  const [transactionState, setTransactionState] = useState<TransactionState>({
    isLoading: false,
    isConfirming: false,
    isSuccess: false,
    isError: false,
    error: null,
    hash: null
  });

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
    query: {
      enabled: !!hash,
    }
  });

  // Handle success/error states with useEffect
  React.useEffect(() => {
    if (isConfirmed) {
      setTransactionState(prev => ({
        ...prev,
        isConfirming: false,
        isSuccess: true,
        isLoading: false
      }));
    }
  }, [isConfirmed]);

  const supply = useCallback(async (
    token: keyof typeof TOKEN_ADDRESSES,
    amount: string,
    protocol?: number
  ) => {
    if (!address) {
      setTransactionState(prev => ({
        ...prev,
        isError: true,
        error: 'Wallet not connected'
      }));
      return;
    }

    try {
      setTransactionState({
        isLoading: true,
        isConfirming: false,
        isSuccess: false,
        isError: false,
        error: null,
        hash: null
      });

      const tokenAddress = TOKEN_ADDRESSES[token];
      const decimals = token === 'USDC' || token === 'USDT' ? 6 : 18;
      const amountWei = parseUnits(amount, decimals);

      if (protocol !== undefined) {
        // Supply to specific protocol
        writeContract({
          address: CONTRACT_ADDRESSES.LendingAPYAggregator as `0x${string}`,
          abi: LENDING_APY_AGGREGATOR_ABI,
          functionName: 'supply',
          args: [tokenAddress, amountWei, protocol],
          chain: avalancheFuji,
          account: address,
        });
      } else {
        // Supply to best rate automatically
        writeContract({
          address: CONTRACT_ADDRESSES.LendingAPYAggregator as `0x${string}`,
          abi: LENDING_APY_AGGREGATOR_ABI,
          functionName: 'supplyToBestRate',
          args: [tokenAddress, amountWei, BigInt(0)], // 0 minimum APY
          chain: avalancheFuji,
          account: address,
        });
      }

      setTransactionState(prev => ({
        ...prev,
        isLoading: false,
        isConfirming: true,
        hash: hash || null
      }));

    } catch (error: any) {
      setTransactionState({
        isLoading: false,
        isConfirming: false,
        isSuccess: false,
        isError: true,
        error: error.message || 'Transaction failed',
        hash: null
      });
    }
  }, [address, writeContract, hash]);

  return {
    supply,
    ...transactionState,
    isConfirming,
    isConfirmed,
    writeError
  };
}

export function useBorrowTransaction() {
  const { address } = useAccount();
  const { writeContract, data: hash, error: writeError } = useWriteContract();
  const [transactionState, setTransactionState] = useState<TransactionState>({
    isLoading: false,
    isConfirming: false,
    isSuccess: false,
    isError: false,
    error: null,
    hash: null
  });

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
    query: {
      enabled: !!hash,
    }
  });

  // Handle success/error states with useEffect
  useEffect(() => {
    if (isConfirmed) {
      setTransactionState(prev => ({
        ...prev,
        isConfirming: false,
        isSuccess: true,
        isLoading: false
      }));
    }
  }, [isConfirmed]);

  const borrow = useCallback(async (
    token: keyof typeof TOKEN_ADDRESSES,
    amount: string,
    protocol?: number
  ) => {
    if (!address) {
      setTransactionState(prev => ({
        ...prev,
        isError: true,
        error: 'Wallet not connected'
      }));
      return;
    }

    try {
      setTransactionState({
        isLoading: true,
        isConfirming: false,
        isSuccess: false,
        isError: false,
        error: null,
        hash: null
      });

      const tokenAddress = TOKEN_ADDRESSES[token];
      const decimals = token === 'USDC' || token === 'USDT' ? 6 : 18;
      const amountWei = parseUnits(amount, decimals);

      if (protocol !== undefined) {
        // Borrow from specific protocol
        writeContract({
          address: CONTRACT_ADDRESSES.LendingAPYAggregator as `0x${string}`,
          abi: LENDING_APY_AGGREGATOR_ABI,
          functionName: 'borrow',
          args: [tokenAddress, amountWei, protocol],
          chain: avalancheFuji,
          account: address,
        });
      } else {
        // Borrow from best rate automatically
        writeContract({
          address: CONTRACT_ADDRESSES.LendingAPYAggregator as `0x${string}`,
          abi: LENDING_APY_AGGREGATOR_ABI,
          functionName: 'borrowFromBestRate',
          args: [tokenAddress, amountWei, BigInt(999999)], // High max APY
          chain: avalancheFuji,
          account: address,
        });
      }

      setTransactionState(prev => ({
        ...prev,
        isLoading: false,
        isConfirming: true,
        hash: hash || null
      }));

    } catch (error: any) {
      setTransactionState({
        isLoading: false,
        isConfirming: false,
        isSuccess: false,
        isError: true,
        error: error.message || 'Transaction failed',
        hash: null
      });
    }
  }, [address, writeContract, hash]);

  return {
    borrow,
    ...transactionState,
    isConfirming,
    isConfirmed,
    writeError
  };
}

export function useTokenBalance(token: keyof typeof TOKEN_ADDRESSES) {
  const { address } = useAccount();
  const tokenAddress = TOKEN_ADDRESSES[token];
  
  const { data: balance, isError, isLoading, refetch } = useBalance({
    address,
    token: tokenAddress as `0x${string}`,
    query: {
      enabled: !!address,
      refetchInterval: 10000,
    }
  });

  const decimals = token === 'USDC' || token === 'USDT' ? 6 : 18;
  const formattedBalance = balance ? formatUnits(balance.value, decimals) : '0';

  return {
    balance: formattedBalance,
    balanceWei: balance?.value || BigInt(0),
    symbol: balance?.symbol || token,
    decimals,
    isLoading,
    isError,
    refetch
  };
}
