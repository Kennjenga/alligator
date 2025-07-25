'use client';

import { useReadContract, useAccount } from 'wagmi';
import { CONTRACT_ADDRESSES, TOKEN_ADDRESSES, LENDING_APY_AGGREGATOR_ABI } from '../config/wagmi';
import { useMemo } from 'react';
import { useRealProtocolAPYs } from './useRealProtocolData';

export interface ProtocolAPY {
  name: string;
  supplyAPY: number;
  borrowAPY: number;
  protocol: number;
  tvl?: number;
  utilization?: number;
}

export interface UserPosition {
  supplied: bigint;
  borrowed: bigint;
  protocol: number;
  timestamp: bigint;
}

export interface UserPortfolio {
  totalSupplied: number;
  totalBorrowed: number;
  netAPY: number;
  healthFactor: number;
  positions: Array<{
    asset: string;
    symbol: string;
    supplied: number;
    borrowed: number;
    protocol: string;
    supplyAPY: number;
    borrowAPY: number;
  }>;
}

export function useProtocolAPYs(asset: keyof typeof TOKEN_ADDRESSES = 'USDC') {
  // Use real protocol data instead of contract calls
  return useRealProtocolAPYs(asset);
}

export function useBestSupplyAPY(asset: keyof typeof TOKEN_ADDRESSES = 'USDC') {
  const tokenAddress = TOKEN_ADDRESSES[asset];
  
  const { data, isError, isLoading } = useReadContract({
    address: CONTRACT_ADDRESSES.LendingAPYAggregator as `0x${string}`,
    abi: LENDING_APY_AGGREGATOR_ABI,
    functionName: 'getBestSupplyAPY',
    args: [tokenAddress],
    query: {
      refetchInterval: 30000,
    }
  });

  return {
    bestProtocol: data ? Number(data[0]) : 0,
    bestAPY: data ? Number(data[1]) / 1e25 : 0,
    isLoading,
    isError
  };
}

export function useUserPosition(asset: keyof typeof TOKEN_ADDRESSES = 'USDC') {
  const { address } = useAccount();
  const tokenAddress = TOKEN_ADDRESSES[asset];
  
  const { data: position, isError, isLoading, refetch } = useReadContract({
    address: CONTRACT_ADDRESSES.LendingAPYAggregator as `0x${string}`,
    abi: LENDING_APY_AGGREGATOR_ABI,
    functionName: 'getUserPosition',
    args: [address!, tokenAddress],
    query: {
      enabled: !!address,
      refetchInterval: 15000,
    }
  });

  return {
    position: position as UserPosition | undefined,
    isLoading,
    isError,
    refetch
  };
}

export function useUserPortfolio() {
  const { address } = useAccount();
  const assets = Object.values(TOKEN_ADDRESSES);
  
  const { data: portfolioData, isError, isLoading, refetch } = useReadContract({
    address: CONTRACT_ADDRESSES.LendingAPYAggregator as `0x${string}`,
    abi: LENDING_APY_AGGREGATOR_ABI,
    functionName: 'getUserPortfolio',
    args: [address!, assets],
    query: {
      enabled: !!address,
      refetchInterval: 15000,
    }
  });

  const portfolio = useMemo((): UserPortfolio => {
    if (!portfolioData || isError) {
      return {
        totalSupplied: 0,
        totalBorrowed: 0,
        netAPY: 0,
        healthFactor: 0,
        positions: []
      };
    }

    const totalSupplied = Number(portfolioData[0]) / 1e6; // Convert from wei to token units
    const totalBorrowed = Number(portfolioData[1]) / 1e6;
    
    // Calculate net APY (simplified calculation)
    const netAPY = totalSupplied > 0 ? (totalSupplied * 0.06 - totalBorrowed * 0.08) / totalSupplied * 100 : 0;
    
    // Calculate health factor (simplified)
    const healthFactor = totalBorrowed > 0 ? (totalSupplied * 0.8) / totalBorrowed : 999;

    return {
      totalSupplied,
      totalBorrowed,
      netAPY,
      healthFactor,
      positions: [] // Will be populated by individual position queries
    };
  }, [portfolioData, isError]);

  return {
    portfolio,
    isLoading,
    isError,
    refetch,
    isConnected: !!address
  };
}
