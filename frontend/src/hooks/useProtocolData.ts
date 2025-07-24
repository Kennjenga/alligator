'use client';

import { useReadContract, useAccount } from 'wagmi';
import { CONTRACT_ADDRESSES, TOKEN_ADDRESSES, LENDING_APY_AGGREGATOR_ABI } from '../config/wagmi';
import { useMemo } from 'react';

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
  const tokenAddress = TOKEN_ADDRESSES[asset];
  
  const { data: contractRates, isError, isLoading, refetch } = useReadContract({
    address: CONTRACT_ADDRESSES.LendingAPYAggregator as `0x${string}`,
    abi: LENDING_APY_AGGREGATOR_ABI,
    functionName: 'getAllAPYs',
    args: [tokenAddress],
    query: {
      refetchInterval: 30000, // Refetch every 30 seconds
      staleTime: 15000, // Consider data stale after 15 seconds
    }
  });

  const protocolNames = ['AAVE V3', 'Morpho', 'BENQI', 'Yield Yak'];

  const rates = useMemo(() => {
    if (isError || !contractRates) {
      // Fallback mock data with realistic values
      return [
        { name: 'AAVE V3', supplyAPY: 5.2, borrowAPY: 7.8, protocol: 0, tvl: 1200000, utilization: 75 },
        { name: 'Morpho', supplyAPY: 6.1, borrowAPY: 7.5, protocol: 1, tvl: 800000, utilization: 68 },
        { name: 'BENQI', supplyAPY: 5.8, borrowAPY: 8.2, protocol: 2, tvl: 950000, utilization: 72 },
        { name: 'Yield Yak', supplyAPY: 9.2, borrowAPY: 0, protocol: 3, tvl: 450000, utilization: 85 },
      ];
    }

    return contractRates.map((rate: any, index: number) => ({
      name: protocolNames[rate.protocol] || `Protocol ${rate.protocol}`,
      supplyAPY: Number(rate.supplyAPY) / 1e25, // Convert from ray to percentage
      borrowAPY: Number(rate.borrowAPY) / 1e25, // Convert from ray to percentage
      protocol: Number(rate.protocol),
      tvl: Math.random() * 2000000 + 500000, // Mock TVL data
      utilization: Math.random() * 30 + 60, // Mock utilization data
    }));
  }, [contractRates, isError]);

  const bestSupply = useMemo(() => 
    rates.reduce((best, current) => 
      current.supplyAPY > best.supplyAPY ? current : best
    ), [rates]);

  const bestBorrow = useMemo(() => 
    rates.reduce((best, current) => {
      if (current.borrowAPY > 0 && (best.borrowAPY === 0 || current.borrowAPY < best.borrowAPY)) {
        return current;
      }
      return best;
    }), [rates]);

  return {
    rates,
    bestSupply,
    bestBorrow,
    isLoading,
    isError,
    refetch,
    isUsingMockData: isError || !contractRates
  };
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
