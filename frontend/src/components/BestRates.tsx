'use client';

import React, { useState } from 'react';
import { useProtocolAPYs } from '../hooks/useProtocolData';
import { useSupplyTransaction } from '../hooks/useTransactions';

const BestRates: React.FC = () => {
  const [selectedToken, setSelectedToken] = useState<'USDC' | 'USDT' | 'WAVAX'>('USDC');
  const { rates, bestSupply, bestBorrow, isLoading, isError, refetch, isUsingMockData } = useProtocolAPYs(selectedToken);
  const { supply, isLoading: isSupplying } = useSupplyTransaction();

  const handleSupply = async (protocolIndex: number) => {
    try {
      await supply(selectedToken, '100', protocolIndex); // Example amount
    } catch (error) {
      console.error('Supply failed:', error);
    }
  };

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

            {/* Token Selector */}
            <div className="flex justify-center mt-6">
              <div className="inline-flex bg-gray-100 rounded-xl p-1">
                {(['USDC', 'USDT', 'WAVAX'] as const).map((token) => (
                  <button
                    key={token}
                    onClick={() => setSelectedToken(token)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      selectedToken === token
                        ? 'bg-white text-emerald-600 shadow-md'
                        : 'text-gray-600 hover:text-emerald-600'
                    }`}
                  >
                    {token}
                  </button>
                ))}
              </div>
            </div>
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
          <div className="flex justify-center items-center gap-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full">
              <div className={`w-2 h-2 rounded-full ${isUsingMockData ? 'bg-yellow-500' : 'bg-green-500'} ${!isUsingMockData ? 'animate-pulse' : ''}`}></div>
              <span className="text-xs text-gray-600">
                {isUsingMockData ? 'Demo Data' : 'Live Data'}
              </span>
            </div>

            {!isUsingMockData && (
              <button
                onClick={() => refetch()}
                disabled={isLoading}
                className="inline-flex items-center gap-1 px-3 py-1 text-xs text-emerald-600 hover:text-emerald-700 transition-colors disabled:opacity-50"
              >
                <svg className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            )}
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <h3 className="text-lg font-semibold mb-3">All Protocols - {selectedToken}</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Protocol</th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">Supply APY</th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">Borrow APY</th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">TVL</th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">Utilization</th>
                  <th className="px-4 py-2 text-center text-sm font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rates.map((rate, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="font-medium text-gray-900">{rate.name}</div>
                        {rate.protocol === bestSupply.protocol && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                            Best Supply
                          </span>
                        )}
                        {rate.protocol === bestBorrow.protocol && rate.borrowAPY > 0 && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Best Borrow
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-green-600 font-semibold">
                        {rate.supplyAPY.toFixed(2)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-semibold ${rate.borrowAPY > 0 ? 'text-blue-600' : 'text-gray-400'}`}>
                        {rate.borrowAPY > 0 ? `${rate.borrowAPY.toFixed(2)}%` : 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600">
                      {rate.tvl ? `$${(rate.tvl / 1000000).toFixed(1)}M` : 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600">
                      {rate.utilization ? `${rate.utilization.toFixed(0)}%` : 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex gap-1 justify-center">
                        <button
                          onClick={() => handleSupply(rate.protocol)}
                          disabled={isSupplying}
                          className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white px-3 py-1 rounded text-sm transition-colors"
                        >
                          Supply
                        </button>
                        {rate.borrowAPY > 0 && (
                          <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors">
                            Borrow
                          </button>
                        )}
                      </div>
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
