import { NextResponse } from 'next/server';

export async function GET() {
  // In a real implementation, this would call the smart contract
  // to get the actual best rates from all protocols
  
  const apyData = {
    aave: {
      supply: 5.2,
      borrow: 7.8,
      name: 'Aave V3',
      description: 'Leading DeFi lending protocol',
    },
    morpho: {
      supply: 6.1,
      borrow: 7.5,
      name: 'Morpho',
      description: 'Optimized lending protocol',
    },
    benqi: {
      supply: 5.8,
      borrow: 8.2,
      name: 'Benqi',
      description: 'Native Avalanche lending protocol',
    },
    yieldyak: {
      supply: 9.2,
      borrow: 0, // YieldYak doesn't support borrowing
      name: 'Yield Yak',
      description: 'Yield farming aggregator',
    },
  };

  // Find best supply rate
  let bestSupply = { protocol: '', rate: 0, name: '' };
  for (const [key, data] of Object.entries(apyData)) {
    if (data.supply > bestSupply.rate) {
      bestSupply = { protocol: key, rate: data.supply, name: data.name };
    }
  }

  // Find best borrow rate (lowest)
  let bestBorrow = { protocol: '', rate: Infinity, name: '' };
  for (const [key, data] of Object.entries(apyData)) {
    if (data.borrow > 0 && data.borrow < bestBorrow.rate) {
      bestBorrow = { protocol: key, rate: data.borrow, name: data.name };
    }
  }

  return NextResponse.json({
    bestSupply,
    bestBorrow: bestBorrow.rate === Infinity ? null : bestBorrow,
    timestamp: new Date().toISOString(),
  });
}
