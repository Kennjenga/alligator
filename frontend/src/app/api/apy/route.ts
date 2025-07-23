import { NextResponse } from 'next/server';

export async function GET() {
  // In a real implementation, these would be fetched from the smart contracts
  // or from the protocol APIs
  return NextResponse.json({
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
  });
}
