'use client';

import React, { useState } from 'react';
import Header from '../components/Header';
import BestRates from '../components/BestRates';
import LendingForm from '../components/LendingForm';
import ContractInfo from '../components/ContractInfo';
import Portfolio from '../components/Portfolio';
import { BarChart3, TrendingUp, Wallet, PieChart } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'markets' | 'portfolio'>('dashboard');
  const [tradingModal, setTradingModal] = useState<{
    isOpen: boolean;
    asset: string;
    action: 'supply' | 'borrow' | 'withdraw' | 'repay';
  }>({
    isOpen: false,
    asset: '',
    action: 'supply',
  });

  const handleAssetSelect = (asset: string) => {
    setTradingModal({
      isOpen: true,
      asset,
      action: 'supply',
    });
  };

  const handlePortfolioAction = (asset: string, action: 'supply' | 'borrow' | 'withdraw' | 'repay') => {
    setTradingModal({
      isOpen: true,
      asset,
      action,
    });
  };

  const closeTradingModal = () => {
    setTradingModal(prev => ({ ...prev, isOpen: false }));
  };

  const scrollToContent = () => {
    const element = document.getElementById('main-content');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 text-white">
        <div className="absolute inset-0 bg-black/10"></div>

        {/* Animated background shapes */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-300/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="mb-6">
              <span className="inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm font-medium mb-4">
                🚀 Avalanche's Premier DeFi Aggregator
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Find the Best{' '}
              <span className="bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
                APY Rates
              </span>
            </h1>
            <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
              Compare lending rates across Aave and Morpho protocols. Optimize your DeFi strategy with real-time APY data.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm mb-8">
              {[
                { icon: '⚡', text: 'Real-time APY' },
                { icon: '🎯', text: 'Smart Routing' },
                { icon: '🌉', text: 'Cross-chain Bridge' },
                { icon: '🔓', text: 'Open Source' }
              ].map((feature) => (
                <span
                  key={feature.text}
                  className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30 text-white font-medium hover:bg-white/30 transition-all duration-300"
                >
                  <span className="mr-2">{feature.icon}</span>
                  {feature.text}
                </span>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => {
                  setActiveTab('dashboard');
                  scrollToContent();
                }}
                className="bg-white text-emerald-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-emerald-50 transition-all duration-300 shadow-lg"
              >
                🚀 Start Earning
              </button>
              <button
                onClick={() => {
                  setActiveTab('markets');
                  scrollToContent();
                }}
                className="bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-bold text-lg border border-white/30 hover:bg-white/30 transition-all duration-300"
              >
                📊 View Markets
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Tab Navigation */}
      <div className="bg-white shadow-lg border-b-2 border-emerald-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex flex-wrap space-x-1" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center space-x-2 py-4 px-3 sm:px-6 font-semibold text-sm transition-all duration-300 ${
                activeTab === 'dashboard'
                  ? 'bg-emerald-500 text-white border-b-2 border-emerald-600'
                  : 'text-gray-600 hover:text-emerald-600 hover:bg-emerald-50'
              }`}
            >
              <BarChart3 size={20} />
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => setActiveTab('markets')}
              className={`flex items-center space-x-2 py-4 px-3 sm:px-6 font-semibold text-sm transition-all duration-300 ${
                activeTab === 'markets'
                  ? 'bg-blue-500 text-white border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              <TrendingUp size={20} />
              <span>Markets</span>
            </button>
            <button
              onClick={() => setActiveTab('portfolio')}
              className={`flex items-center space-x-2 py-4 px-3 sm:px-6 font-semibold text-sm transition-all duration-300 ${
                activeTab === 'portfolio'
                  ? 'bg-purple-500 text-white border-b-2 border-purple-600'
                  : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
              }`}
            >
              <Wallet size={20} />
              <span>Portfolio</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Getting Started Notice */}
        <div className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                Welcome to Alligator!
                <span className="text-xl">🎉</span>
              </h3>
              <p className="text-gray-700 mb-4">
                Compare DeFi lending rates across protocols on Avalanche Fuji testnet. Connect your wallet to start earning the best yields available.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  🔍 Real-time Rates
                </span>
                <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                  ⚡ Instant Swaps
                </span>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  🛡️ Secure & Audited
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-emerald-50 to-green-100 border border-emerald-200 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-600 text-sm font-medium">Best Supply APY</p>
                    <p className="text-2xl font-bold text-emerald-800">12.5%</p>
                    <p className="text-xs text-emerald-600 mt-1">BENQI Protocol</p>
                  </div>
                  <div className="text-3xl">📈</div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-600 text-sm font-medium">Total Protocols</p>
                    <p className="text-2xl font-bold text-blue-800">4</p>
                    <p className="text-xs text-blue-600 mt-1">Active & Monitored</p>
                  </div>
                  <div className="text-3xl">🔗</div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-100 border border-purple-200 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-600 text-sm font-medium">Network</p>
                    <p className="text-2xl font-bold text-purple-800">Fuji</p>
                    <p className="text-xs text-purple-600 mt-1">Avalanche Testnet</p>
                  </div>
                  <div className="text-3xl">🔺</div>
                </div>
              </div>
            </div>

            {/* Dashboard Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <BestRates />
              </div>
              <div>
                <LendingForm />
              </div>
            </div>

            {/* Contract Information */}
            <div>
              <ContractInfo />
            </div>
          </div>
        )}

        {activeTab === 'markets' && (
          <div className="space-y-8">
            {/* Market Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                <div className="text-2xl mb-2">🏦</div>
                <p className="text-sm text-gray-600">AAVE V3</p>
                <p className="text-lg font-bold text-gray-900">11.8%</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                <div className="text-2xl mb-2">🔷</div>
                <p className="text-sm text-gray-600">Morpho</p>
                <p className="text-lg font-bold text-gray-900">10.2%</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                <div className="text-2xl mb-2">⚡</div>
                <p className="text-sm text-gray-600">BENQI</p>
                <p className="text-lg font-bold text-gray-900">12.5%</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                <div className="text-2xl mb-2">📊</div>
                <p className="text-sm text-gray-600">Vector</p>
                <p className="text-lg font-bold text-gray-900">10.3%</p>
              </div>
            </div>

            {/* Markets Overview */}
            <div>
              <BestRates />
            </div>

            {/* Lending Form */}
            <div>
              <LendingForm />
            </div>
          </div>
        )}

        {activeTab === 'portfolio' && (
          <div className="space-y-8">
            <Portfolio />
          </div>
        )}
        </main>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-300/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-300/20 rounded-full blur-3xl"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Why Choose <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Alligator?</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The most comprehensive DeFi APY aggregator
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-green-500 rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
              <div className="relative bg-white/80 backdrop-blur-sm p-8 rounded-2xl border border-emerald-200 hover:border-emerald-300 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-100 transform hover:scale-105">
                <div className="text-center">
                  <div className="bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <BarChart3 className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Real-time Comparison</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Compare rates across multiple protocols in real-time to maximize your yields with live market data.
                  </p>
                  <div className="mt-4 flex justify-center">
                    <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-medium">
                      ⚡ Live Data
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
              <div className="relative bg-white/80 backdrop-blur-sm p-8 rounded-2xl border border-blue-200 hover:border-blue-300 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-100 transform hover:scale-105">
                <div className="text-center">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <PieChart className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Smart Automation</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Automatically route funds to the best rates using advanced smart contracts and AI-powered optimization.
                  </p>
                  <div className="mt-4 flex justify-center">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      🤖 AI Powered
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-500 rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
              <div className="relative bg-white/80 backdrop-blur-sm p-8 rounded-2xl border border-purple-200 hover:border-purple-300 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-100 transform hover:scale-105">
                <div className="text-center">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <Wallet className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Portfolio Tracking</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Track and optimize your DeFi positions across all protocols with comprehensive analytics and insights.
                  </p>
                  <div className="mt-4 flex justify-center">
                    <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                      📊 Analytics
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-slate-800 to-gray-900"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>

        {/* Animated background elements */}
        <div className="absolute top-0 left-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl animate-float"></div>
        <div className="absolute bottom-0 right-0 w-60 h-60 bg-blue-500/10 rounded-full blur-2xl animate-float" style={{ animationDelay: '3s' }}></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="text-4xl animate-pulse">🐊</div>
              <h3 className="text-3xl font-bold text-white">Alligator</h3>
            </div>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Your premier DeFi yield optimization companion on Avalanche
            </p>

            {/* Feature highlights */}
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              {[
                { icon: '🔺', text: 'Avalanche Native' },
                { icon: '⚡', text: 'Lightning Fast' },
                { icon: '🛡️', text: 'Secure & Audited' },
                { icon: '🔓', text: 'Open Source' }
              ].map((item) => (
                <span
                  key={item.text}
                  className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm font-medium border border-white/20 hover:bg-white/20 transition-all duration-300"
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.text}
                </span>
              ))}
            </div>

            {/* Links */}
            <div className="flex justify-center space-x-8 text-gray-400 mb-6">
              <a href="#" className="hover:text-emerald-400 transition-colors duration-300 font-medium">About</a>
              <a href="#" className="hover:text-emerald-400 transition-colors duration-300 font-medium">Docs</a>
              <a href="#" className="hover:text-emerald-400 transition-colors duration-300 font-medium">GitHub</a>
              <a href="#" className="hover:text-emerald-400 transition-colors duration-300 font-medium">Discord</a>
            </div>

            {/* Bottom info */}
            <div className="border-t border-gray-700 pt-6">
              <p className="text-gray-500 text-sm">
                Built with ❤️ for the DeFi community • Fuji Testnet • © 2024 Alligator
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
