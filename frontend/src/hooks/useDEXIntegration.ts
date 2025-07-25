import { useState, useMemo } from 'react';
import { useAccount, useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { avalancheFuji } from 'wagmi/chains';
import { CONTRACT_ADDRESSES, LENDING_APY_AGGREGATOR_ABI, DEX_INTEGRATION_ABI, TOKEN_ADDRESSES, TRADER_JOE_ROUTER_ABI } from '../config/wagmi';

export function useBalanceCheck(token: keyof typeof TOKEN_ADDRESSES, amount: string) {
  const { address } = useAccount();
  const tokenAddress = TOKEN_ADDRESSES[token];
  const decimals = token === 'USDC' || token === 'USDT' ? 6 : 18;
  const amountWei = amount ? parseUnits(amount, decimals) : BigInt(0);

  const { data: balanceData, isLoading, refetch } = useReadContract({
    address: CONTRACT_ADDRESSES.LendingAPYAggregator as `0x${string}`,
    abi: LENDING_APY_AGGREGATOR_ABI,
    functionName: 'checkBalance',
    args: [address!, tokenAddress, amountWei],
    query: {
      enabled: !!address && !!amount && parseFloat(amount) > 0,
    }
  });

  return {
    hasBalance: balanceData ? balanceData[0] : false,
    availableBalance: balanceData ? formatUnits(balanceData[1], decimals) : '0',
    isLoading,
    refetch
  };
}

export function usePurchaseQuote(tokenOut: keyof typeof TOKEN_ADDRESSES, amountOut: string) {
  const tokenAddress = TOKEN_ADDRESSES[tokenOut];
  const decimals = tokenOut === 'USDC' || tokenOut === 'USDT' ? 6 : 18;
  const amountOutWei = amountOut ? parseUnits(amountOut, decimals) : BigInt(0);

  // Try to get real quote from Trader Joe router
  const { data: quoteData, isLoading } = useReadContract({
    address: CONTRACT_ADDRESSES.TraderJoeRouter as `0x${string}`,
    abi: TRADER_JOE_ROUTER_ABI,
    functionName: 'getAmountsIn',
    args: [amountOutWei, [TOKEN_ADDRESSES.WAVAX, tokenAddress]],
    query: {
      enabled: !!amountOut && parseFloat(amountOut) > 0,
    }
  });

  // Fallback calculation if router call fails
  const fallbackQuote = useMemo(() => {
    if (!amountOut || parseFloat(amountOut) <= 0) return null;

    // Simulate exchange rates as fallback
    let rate = 1;
    switch (tokenOut) {
      case 'USDC':
      case 'USDT':
        rate = 25; // 1 AVAX = 25 USDC/USDT (approximate)
        break;
      case 'WETH':
        rate = 0.01; // 1 AVAX = 0.01 WETH (approximate)
        break;
      case 'WBTC':
        rate = 0.0005; // 1 AVAX = 0.0005 WBTC (approximate)
        break;
      default:
        rate = 1;
    }

    const avaxNeeded = parseFloat(amountOut) / rate;
    return parseUnits(avaxNeeded.toString(), 18);
  }, [amountOut, tokenOut]);

  const finalQuote = quoteData && quoteData.length > 0 ? quoteData[0] : fallbackQuote;

  return {
    avaxRequired: finalQuote ? formatUnits(finalQuote, 18) : '0',
    isLoading,
    isUsingFallback: !quoteData
  };
}

export function usePurchaseWithAVAX() {
  const [isConfirming, setIsConfirming] = useState(false);
  const { address } = useAccount();

  const {
    writeContract,
    data: hash,
    isPending: isLoading,
    error
  } = useWriteContract();

  const { isLoading: isWaitingForReceipt, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const purchaseWithAVAX = async (
    token: keyof typeof TOKEN_ADDRESSES, 
    amountOut: string,
    avaxAmount: string,
    slippageTolerance: number = 300 // 3% default
  ) => {
    try {
      setIsConfirming(true);
      
      const tokenAddress = TOKEN_ADDRESSES[token];
      const decimals = token === 'USDC' || token === 'USDT' ? 6 : 18;
      const amountOutWei = parseUnits(amountOut, decimals);
      const avaxAmountWei = parseUnits(avaxAmount, 18);
      
      // Calculate minimum amount out with slippage protection
      const minAmountOut = (amountOutWei * BigInt(10000 - slippageTolerance)) / BigInt(10000);
      
      // Set deadline to 20 minutes from now
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 1200);

      console.log('Purchasing token with AVAX:', {
        token: tokenAddress,
        amountOut: minAmountOut.toString(),
        avaxAmount: avaxAmountWei.toString(),
        deadline: deadline.toString()
      });

      // Use Trader Joe router for real token swapping
      writeContract({
        address: CONTRACT_ADDRESSES.TraderJoeRouter as `0x${string}`,
        abi: TRADER_JOE_ROUTER_ABI,
        functionName: 'swapExactAVAXForTokens',
        args: [minAmountOut, [TOKEN_ADDRESSES.WAVAX, tokenAddress], address, deadline],
        value: avaxAmountWei,
        account: address,
        chain: avalancheFuji,
      });
    } catch (err) {
      console.error('Purchase failed:', err);
      setIsConfirming(false);
    }
  };

  return {
    purchaseWithAVAX,
    isLoading,
    isConfirming: isConfirming || isWaitingForReceipt,
    isSuccess,
    error,
    hash
  };
}

export function useSupplyWithAutoPurchase() {
  const [isConfirming, setIsConfirming] = useState(false);
  const { address } = useAccount();

  const {
    writeContract,
    data: hash,
    isPending: isLoading,
    error
  } = useWriteContract();

  const { isLoading: isWaitingForReceipt, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const supplyWithAutoPurchase = async (
    token: keyof typeof TOKEN_ADDRESSES,
    amount: string,
    protocol: number,
    avaxForPurchase?: string,
    slippageTolerance: number = 300
  ) => {
    try {
      setIsConfirming(true);
      
      const tokenAddress = TOKEN_ADDRESSES[token];
      const decimals = token === 'USDC' || token === 'USDT' ? 6 : 18;
      const amountWei = parseUnits(amount, decimals);
      const avaxAmountWei = avaxForPurchase ? parseUnits(avaxForPurchase, 18) : BigInt(0);
      
      // Set deadline to 20 minutes from now
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 1200);

      writeContract({
        address: CONTRACT_ADDRESSES.LendingAPYAggregator as `0x${string}`,
        abi: LENDING_APY_AGGREGATOR_ABI,
        functionName: 'supplyWithAutoPurchase',
        args: [
          tokenAddress,
          amountWei,
          protocol,
          !!avaxForPurchase, // purchaseWithAVAX
          BigInt(slippageTolerance),
          deadline
        ],
        value: avaxAmountWei,
        account: address,
        chain: avalancheFuji,
      });
    } catch (err) {
      console.error('Supply with auto-purchase failed:', err);
      setIsConfirming(false);
    }
  };

  return {
    supplyWithAutoPurchase,
    isLoading,
    isConfirming: isConfirming || isWaitingForReceipt,
    isSuccess,
    error,
    hash
  };
}

export function useInsufficientBalanceHelper(
  token: keyof typeof TOKEN_ADDRESSES,
  requiredAmount: string
) {
  const { hasBalance, availableBalance } = useBalanceCheck(token, requiredAmount);
  const { avaxRequired } = usePurchaseQuote(token, requiredAmount);
  
  const shortfall = useMemo(() => {
    if (!requiredAmount || !availableBalance) return '0';
    const required = parseFloat(requiredAmount);
    const available = parseFloat(availableBalance);
    return required > available ? (required - available).toString() : '0';
  }, [requiredAmount, availableBalance]);

  const needsPurchase = useMemo(() => {
    return !hasBalance && parseFloat(shortfall) > 0;
  }, [hasBalance, shortfall]);

  return {
    hasBalance,
    availableBalance,
    shortfall,
    needsPurchase,
    avaxRequired,
    estimatedCost: avaxRequired
  };
}
