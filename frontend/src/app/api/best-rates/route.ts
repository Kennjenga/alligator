import { NextResponse } from 'next/server';

export async function GET() {
  // This endpoint is deprecated - best rates should be fetched directly from smart contracts
  // via the getBestSupplyAPY and getBestBorrowAPY functions in the LendingAPYAggregator contract

  return NextResponse.json({
    error: 'This endpoint is deprecated. Use smart contract integration instead.',
    message: 'Best rates should be fetched directly from the LendingAPYAggregator contract using getBestSupplyAPY and getBestBorrowAPY functions'
  }, { status: 410 });
}
