import { NextResponse } from 'next/server';

export async function GET() {
  // This endpoint is deprecated - APY data should be fetched directly from smart contracts
  // via the useProtocolAPYs hook in the frontend
  return NextResponse.json({
    error: 'This endpoint is deprecated. Use smart contract integration instead.',
    message: 'APY data should be fetched directly from the LendingAPYAggregator contract'
  }, { status: 410 });
}
