'use client';

import React, { useState } from 'react';
import { useReadContract } from 'wagmi';
import { CONTRACT_ADDRESSES, TOKEN_ADDRESSES, LENDING_APY_AGGREGATOR_ABI } from '../config/wagmi';

interface ProtocolData {
  name: string;
  supplyAPY: number;
  borrowAPY: number;
  protocol: number;
}

const BestRates: React.FC = () => {
  const [mockRates] = useState<ProtocolData[]>([
    { name: 'BENQI', supplyAPY: 12.5, borrowAPY: 8.2, protocol: 2 },
    { name: 'AAVE V3', supplyAPY: 11.8, borrowAPY: 9.1, protocol: 0 },
    { name: 'Vector Finance', supplyAPY: 10.3, borrowAPY: 7.8, protocol: 3 },
  ]);

  // Try to read from contract, fallback to mock data
  const { data: contractRates, isError } = useReadContract({
    address: CONTRACT_ADDRESSES.LendingAPYAggregator as `0x${string}`,
    abi: LENDING_APY_AGGREGATOR_ABI,
    functionName: 'getAllAPYs',
    args: [TOKEN_ADDRESSES.USDC],
  });

  const rates = isError || !contractRates ? mockRates :
    contractRates.map((rate) => ({
      name: ['AAVE V3', 'Morpho', 'BENQI', 'Vector Finance'][rate.protocol] || `Protocol ${rate.protocol}`,
      supplyAPY: Number(rate.supplyAPY) / 100, // Convert from basis points to percentage
      borrowAPY: Number(rate.borrowAPY) / 100, // Convert from basis points to percentage
      protocol: rate.protocol
    }));

  const bestSupply = rates.reduce((best, current) => 
    current.supplyAPY > best.supplyAPY ? current : best
  );

  const bestBorrow = rates.reduce((best, current) => {
    if (current.borrowAPY > 0 && (best.borrowAPY === 0 || current.borrowAPY < best.borrowAPY)) {
      return current;
    }
    return best;
  });

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 rounded-3xl blur-lg opacity-20"></div>
      <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-emerald-200">
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="text-4xl animate-bounce">🏆</div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Best Rates Right Now
              </h2>
            </div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Real-time comparison of the highest yields across all integrated DeFi protocols
            </p>
          </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Best Supply Rate Card */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-green-500 rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
            <div className="relative bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-200 rounded-2xl p-8 hover:border-emerald-300 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-100 transform hover:scale-105">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full mb-4 shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-emerald-800 mb-3">Best Supply Rate</h3>
                <div className="text-5xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-3 tracking-tight">
                  {bestSupply.supplyAPY.toFixed(2)}%
                </div>
                <p className="text-emerald-700 font-semibold text-lg mb-4">{bestSupply.name}</p>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 rounded-full text-sm font-bold shadow-md">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  🚀 Highest APY
                </div>
              </div>
            </div>
          </div>

          {/* Best Borrow Rate Card */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
            <div className="relative bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-8 hover:border-blue-300 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-100 transform hover:scale-105">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mb-4 shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-blue-800 mb-3">Best Borrow Rate</h3>
                {bestBorrow.borrowAPY > 0 ? (
                  <>
                    <div className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3 tracking-tight">
                      {bestBorrow.borrowAPY.toFixed(2)}%
                    </div>
                    <p className="text-blue-700 font-semibold text-lg mb-4">{bestBorrow.name}</p>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 rounded-full text-sm font-bold shadow-md">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      💎 Lowest APY
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-4xl font-bold text-gray-400 mb-3">N/A</div>
                    <p className="text-gray-500 mb-4">No borrowing available</p>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-100 to-slate-100 text-gray-600 rounded-full text-sm font-medium">
                      🔜 Coming Soon
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full">
            <div className={`w-2 h-2 rounded-full ${isError ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
            <span className="text-xs text-gray-600">
              {isError ? 'Demo Data' : 'Live Data'}
            </span>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <h3 className="text-lg font-semibold mb-3">All Protocols</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Protocol</th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">Supply APY</th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">Borrow APY</th>
                  <th className="px-4 py-2 text-center text-sm font-medium text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {rates.map((rate, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="px-4 py-3 font-medium text-gray-900">{rate.name}</td>
                    <td className="px-4 py-3 text-right text-green-600 font-semibold">
                      {rate.supplyAPY.toFixed(2)}%
                    </td>
                    <td className="px-4 py-3 text-right text-blue-600 font-semibold">
                      {rate.borrowAPY > 0 ? `${rate.borrowAPY.toFixed(2)}%` : 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded text-sm transition-colors">
                        Supply
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default BestRates;
