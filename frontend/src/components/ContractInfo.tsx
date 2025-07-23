'use client';

import React from 'react';
import { useAccount, useChainId } from 'wagmi';
import { CONTRACT_ADDRESSES, TOKEN_ADDRESSES } from '../config/wagmi';
import { avalancheFuji } from 'wagmi/chains';

const ContractInfo: React.FC = () => {
  const { isConnected } = useAccount();
  const chainId = useChainId();

  const isCorrectNetwork = chainId === avalancheFuji.id;

  const contractData = {
    LendingAPYAggregator: CONTRACT_ADDRESSES.LendingAPYAggregator,
    AavePool: CONTRACT_ADDRESSES.AavePool,
    BenqiComptroller: CONTRACT_ADDRESSES.BenqiComptroller,
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Address copied to clipboard!');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">📋 Contract Information</h2>

        {!isCorrectNetwork && isConnected && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800 text-center">
              ⚠️ Please switch to Avalanche Fuji Testnet (Chain ID: {avalancheFuji.id})
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">Smart Contracts</h3>
            <div className="space-y-3">
              {Object.entries(contractData).map(([name, address]) => (
                <div key={name} className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{name}</h4>
                      <p className="text-sm text-gray-600 font-mono break-all mt-1">
                        {address}
                      </p>
                      {(address as string) === '0x0000000000000000000000000000000000000000' ? (
                        <span className="inline-block mt-2 px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                          Not Deployed
                        </span>
                      ) : (
                        <span className="inline-block mt-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                          Deployed
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => copyToClipboard(address)}
                      className="ml-2 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                      title="Copy address"
                    >
                      📋
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Token Addresses</h3>
            <div className="space-y-3">
              {Object.entries(TOKEN_ADDRESSES).map(([symbol, address]) => (
                <div key={symbol} className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{symbol}</h4>
                      <p className="text-sm text-gray-600 font-mono break-all mt-1">{address}</p>
                      <span className="inline-block mt-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                        ERC-20 Token
                      </span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(address)}
                      className="ml-2 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                      title="Copy address"
                    >
                      📋
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-3">Network Details</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="mb-1"><strong>Network:</strong> Avalanche Fuji Testnet</p>
              <p><strong>Chain ID:</strong> {avalancheFuji.id}</p>
            </div>
            <div>
              <p className="mb-1">
                <strong>Status:</strong> {isConnected ? (isCorrectNetwork ? '✅ Connected' : '❌ Wrong Network') : '⚪ Not Connected'}
              </p>
              <p className="break-all">
                <strong>RPC:</strong> {avalancheFuji.rpcUrls.default.http[0]}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractInfo;