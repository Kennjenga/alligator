'use client';

import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { useSupplyTransaction, useBorrowTransaction, useTokenBalance } from '../hooks/useTransactions';
import { useProtocolAPYs } from '../hooks/useProtocolData';
import { TOKEN_ADDRESSES } from '../config/wagmi';

const LendingForm: React.FC = () => {
  const [selectedToken, setSelectedToken] = useState<keyof typeof TOKEN_ADDRESSES>('USDC');
  const [amount, setAmount] = useState('');
  const [action, setAction] = useState<'supply' | 'borrow'>('supply');

  const { isConnected } = useAccount();
  const { supply, isLoading: isSupplying, isConfirming: isSupplyConfirming, isSuccess: isSupplySuccess, error: supplyError } = useSupplyTransaction();
  const { borrow, isLoading: isBorrowing, isConfirming: isBorrowConfirming, isSuccess: isBorrowSuccess, error: borrowError } = useBorrowTransaction();
  const { balance, refetch: refetchBalance } = useTokenBalance(selectedToken);
  const { bestSupply, bestBorrow } = useProtocolAPYs(selectedToken);

  const isLoading = isSupplying || isBorrowing;
  const isConfirming = isSupplyConfirming || isBorrowConfirming;
  const isSuccess = isSupplySuccess || isBorrowSuccess;
  const error = supplyError || borrowError;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    // Check if user has enough balance for supply
    if (action === 'supply' && parseFloat(amount) > parseFloat(balance)) {
      alert('Insufficient balance');
      return;
    }

    try {
      if (action === 'supply') {
        await supply(selectedToken, amount); // Uses best rate automatically
      } else {
        await borrow(selectedToken, amount); // Uses best rate automatically
      }

      // Refresh balance after successful transaction
      setTimeout(() => {
        refetchBalance();
      }, 2000);

    } catch (error) {
      console.error('Transaction failed:', error);
    }
  };

  const handleMaxClick = () => {
    if (action === 'supply') {
      setAmount(balance);
    }
  };

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 rounded-3xl blur-lg opacity-20"></div>
      <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-blue-200">
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="text-4xl animate-bounce">🚀</div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Smart Lending
              </h2>
            </div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Automatically route your funds to the protocol with the best rates using advanced algorithms
            </p>
          </div>

        {!isConnected && (
          <div className="mb-8 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl blur-lg opacity-20"></div>
            <div className="relative bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-6">
              <div className="flex items-center gap-4">
                <div className="text-3xl">⚠️</div>
                <div>
                  <h3 className="font-bold text-amber-800 text-lg">Wallet Required</h3>
                  <p className="text-amber-700">
                    Connect your wallet to start earning the best DeFi yields available on Avalanche
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="action" className="block text-sm font-bold text-gray-700">
              Action
            </label>
            <div className="relative">
              <select
                id="action"
                value={action}
                onChange={(e) => setAction(e.target.value as 'supply' | 'borrow')}
                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 appearance-none cursor-pointer hover:border-gray-300 text-lg font-medium"
              >
                <option value="supply">💰 Supply (Earn Interest)</option>
                <option value="borrow">🏦 Borrow (Pay Interest)</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="token" className="block text-sm font-bold text-gray-700">
              Token
            </label>
            <div className="relative">
              <select
                id="token"
                value={selectedToken}
                onChange={(e) => setSelectedToken(e.target.value as keyof typeof TOKEN_ADDRESSES)}
                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 appearance-none cursor-pointer hover:border-gray-300 text-lg font-medium"
              >
                <option value="USDC">💵 USDC</option>
                <option value="USDT">💰 USDT</option>
                <option value="WAVAX">🔺 WAVAX</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="amount" className="block text-sm font-bold text-gray-700">
            Amount
          </label>
          <div className="relative">
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              step="0.000001"
              min="0"
              className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-300 text-lg font-medium"
            />
            <div className="absolute inset-y-0 right-0 flex items-center px-4">
              <span className="text-gray-500 font-bold">{selectedToken}</span>
            </div>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>Balance: {parseFloat(balance).toFixed(4)} {selectedToken}</span>
            <button
              type="button"
              onClick={handleMaxClick}
              className="text-blue-600 hover:text-blue-700 font-bold transition-colors"
            >
              Max
            </button>
          </div>
        </div>
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-2xl blur-lg opacity-20"></div>
          <div className="relative bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="text-3xl">✨</div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-blue-800 mb-3">
                  Smart Protocol Selection
                </h3>
                <p className="text-blue-700 leading-relaxed mb-4">
                  Our smart contract automatically finds the best {action === 'supply' ? 'lending' : 'borrowing'} rate
                  across all supported protocols and executes your transaction there for maximum efficiency.
                </p>

                {action === 'supply' && bestSupply && (
                  <div className="bg-white/50 rounded-lg p-3 border border-blue-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-blue-800">Best Supply Rate:</span>
                      <div className="text-right">
                        <div className="font-bold text-green-600">{bestSupply.supplyAPY.toFixed(2)}%</div>
                        <div className="text-xs text-blue-600">{bestSupply.name}</div>
                      </div>
                    </div>
                  </div>
                )}

                {action === 'borrow' && bestBorrow && bestBorrow.borrowAPY > 0 && (
                  <div className="bg-white/50 rounded-lg p-3 border border-blue-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-blue-800">Best Borrow Rate:</span>
                      <div className="text-right">
                        <div className="font-bold text-blue-600">{bestBorrow.borrowAPY.toFixed(2)}%</div>
                        <div className="text-xs text-blue-600">{bestBorrow.name}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={!isConnected || isLoading || isConfirming}
          className={`group relative w-full py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg ${
            !isConnected || isLoading || isConfirming
              ? 'bg-gray-400 cursor-not-allowed text-white'
              : action === 'supply'
              ? 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-emerald-200 hover:shadow-xl hover:shadow-emerald-300'
              : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-blue-200 hover:shadow-xl hover:shadow-blue-300'
          }`}
        >
          <div className="flex items-center justify-center gap-3">
            {isLoading || isConfirming ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <div className="text-2xl">
                {action === 'supply' ? '💰' : '🏦'}
              </div>
            )}
            <span>
              {!isConnected
                ? 'Connect Wallet First'
                : isLoading
                ? 'Preparing Transaction...'
                : isConfirming
                ? 'Confirming Transaction...'
                : `${action === 'supply' ? 'Supply' : 'Borrow'} ${selectedToken}`}
            </span>
          </div>

          {/* Hover effect overlay */}
          {isConnected && !isLoading && !isConfirming && (
            <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          )}
        </button>

        {isSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="text-2xl">🎉</div>
              <div className="flex-1">
                <h3 className="font-semibold text-green-800">Transaction Successful!</h3>
                <p className="text-green-700 text-sm mb-2">
                  Your {action} of {amount} {selectedToken} has been confirmed and routed to the best protocol.
                </p>
                <div className="text-xs text-green-600">
                  Protocol: {action === 'supply' ? bestSupply?.name : bestBorrow?.name} •
                  Rate: {action === 'supply' ? bestSupply?.supplyAPY.toFixed(2) : bestBorrow?.borrowAPY.toFixed(2)}%
                </div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="text-2xl">❌</div>
              <div>
                <h3 className="font-semibold text-red-800">Transaction Failed</h3>
                <p className="text-red-700 text-sm">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}
      </form>
        </div>
      </div>
    </div>
  );
};

export default LendingForm;