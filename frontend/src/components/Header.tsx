'use client';

import React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';

const Header: React.FC = () => {
  const { isConnected, address } = useAccount();

  return (
    <header className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center">
            <div className="text-3xl mr-3 animate-pulse">🐊</div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Alligator</h1>
            <div className="ml-4 hidden md:block">
              <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-white text-sm font-medium">
                DeFi Yield Optimizer
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {isConnected && (
              <div className="hidden sm:flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-white font-medium">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </span>
              </div>
            )}
            <div className="transform hover:scale-105 transition-transform duration-200 z-50">
              <ConnectButton
                showBalance={false}
                chainStatus="icon"
                accountStatus="avatar"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Decorative bottom border */}
      <div className="h-1 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400"></div>
    </header>
  );
};

export default Header;
