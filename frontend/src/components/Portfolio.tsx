'use client';

import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { useUserPortfolio, useUserPosition } from '../hooks/useProtocolData';
import { useTokenBalance } from '../hooks/useTransactions';
import { TOKEN_ADDRESSES } from '../config/wagmi';

const Portfolio: React.FC = () => {
  const { isConnected, address } = useAccount();
  const { portfolio, isLoading, refetch } = useUserPortfolio();
  const [selectedAsset, setSelectedAsset] = useState<keyof typeof TOKEN_ADDRESSES>('USDC');
  
  // Get individual position for selected asset
  const { position } = useUserPosition(selectedAsset);
  const { balance } = useTokenBalance(selectedAsset);

  const assets = Object.keys(TOKEN_ADDRESSES) as Array<keyof typeof TOKEN_ADDRESSES>;

  if (!isConnected) {
    return (
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 rounded-3xl blur-lg opacity-20"></div>
        <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-purple-200">
          <div className="p-8 text-center">
            <div className="text-6xl mb-4">👛</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Connect Your Wallet</h2>
            <p className="text-lg text-gray-600 mb-6">
              Connect your wallet to view your DeFi portfolio and track your positions across all protocols.
            </p>
            <div className="flex justify-center gap-4 text-sm">
              <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full">Real-time Tracking</span>
              <span className="bg-pink-100 text-pink-800 px-3 py-1 rounded-full">Yield Analytics</span>
              <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full">Risk Assessment</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Portfolio Overview */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 rounded-3xl blur-lg opacity-20"></div>
        <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-purple-200">
          <div className="p-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Your Portfolio
                </h2>
                <p className="text-gray-600 mt-1">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </p>
              </div>
              <button
                onClick={() => refetch()}
                disabled={isLoading}
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                <svg className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>

            {/* Portfolio Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-br from-green-50 to-emerald-100 border border-green-200 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-600 text-sm font-medium">Total Supplied</p>
                    <p className="text-2xl font-bold text-green-800">
                      ${portfolio.totalSupplied.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-3xl">💰</div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-cyan-100 border border-blue-200 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-600 text-sm font-medium">Total Borrowed</p>
                    <p className="text-2xl font-bold text-blue-800">
                      ${portfolio.totalBorrowed.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-3xl">📊</div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-100 border border-purple-200 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-600 text-sm font-medium">Net APY</p>
                    <p className={`text-2xl font-bold ${portfolio.netAPY >= 0 ? 'text-green-800' : 'text-red-800'}`}>
                      {portfolio.netAPY >= 0 ? '+' : ''}{portfolio.netAPY.toFixed(2)}%
                    </p>
                  </div>
                  <div className="text-3xl">📈</div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-yellow-50 to-orange-100 border border-yellow-200 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-600 text-sm font-medium">Health Factor</p>
                    <p className={`text-2xl font-bold ${
                      portfolio.healthFactor > 2 ? 'text-green-800' : 
                      portfolio.healthFactor > 1.5 ? 'text-yellow-800' : 'text-red-800'
                    }`}>
                      {portfolio.healthFactor > 999 ? '∞' : portfolio.healthFactor.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-3xl">🛡️</div>
                </div>
              </div>
            </div>

            {/* Asset Selector */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Asset Positions</h3>
              <div className="flex flex-wrap gap-2">
                {assets.map((asset) => (
                  <button
                    key={asset}
                    onClick={() => setSelectedAsset(asset)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      selectedAsset === asset
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {asset}
                  </button>
                ))}
              </div>
            </div>

            {/* Position Details */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h4 className="text-lg font-semibold mb-4">{selectedAsset} Position</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg p-4 border">
                  <div className="text-sm text-gray-600 mb-1">Wallet Balance</div>
                  <div className="text-xl font-bold text-gray-900">
                    {parseFloat(balance).toFixed(4)} {selectedAsset}
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 border">
                  <div className="text-sm text-gray-600 mb-1">Supplied</div>
                  <div className="text-xl font-bold text-green-600">
                    {position ? (Number(position.supplied) / 1e6).toFixed(4) : '0.0000'} {selectedAsset}
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 border">
                  <div className="text-sm text-gray-600 mb-1">Borrowed</div>
                  <div className="text-xl font-bold text-blue-600">
                    {position ? (Number(position.borrowed) / 1e6).toFixed(4) : '0.0000'} {selectedAsset}
                  </div>
                </div>
              </div>

              {position && Number(position.supplied) > 0 && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-blue-800">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>
                      Active position in {['AAVE V3', 'Morpho', 'BENQI', 'Yield Yak'][position.protocol]} 
                      since {new Date(Number(position.timestamp) * 1000).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-3xl blur-lg opacity-20"></div>
        <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-emerald-200">
          <div className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button className="flex flex-col items-center gap-2 p-4 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors">
                <div className="text-2xl">💰</div>
                <span className="text-sm font-medium text-emerald-800">Supply More</span>
              </button>
              <button className="flex flex-col items-center gap-2 p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors">
                <div className="text-2xl">🏦</div>
                <span className="text-sm font-medium text-blue-800">Borrow</span>
              </button>
              <button className="flex flex-col items-center gap-2 p-4 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors">
                <div className="text-2xl">🔄</div>
                <span className="text-sm font-medium text-purple-800">Rebalance</span>
              </button>
              <button className="flex flex-col items-center gap-2 p-4 bg-red-50 hover:bg-red-100 rounded-xl transition-colors">
                <div className="text-2xl">💸</div>
                <span className="text-sm font-medium text-red-800">Withdraw</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Portfolio;
