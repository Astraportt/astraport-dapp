'use client';

import React, { useState } from 'react';
import WalletConnect from '@/components/wallet/WalletConnect';
import ThemeToggle from '../components/ThemeToggle';
import PortfolioOverview from '@/components/dashboard/PortfolioOverview';
import PortfolioChart from '@/components/dashboard/PortfolioChart';
import RiskScoreDisplay from '@/components/risk/RiskScoreDisplay';
import InsightsList from '@/components/insights/InsightsList';
import {
  AIRecommendationsDashboard,
  AIAlertBell,
  RecommendationDetails,
} from '@/components/ai';
import { useAIActions } from '@/hooks';
import { useWalletStore } from '@/store';
import type { AIRecommendation } from '@/types';
import LandingPage from '@/components/landing/LandingPage';

export default function Home() {
  const { connected } = useWalletStore();
  const { execute, executingActionId, resultFor } = useAIActions();
  const [alertSelected, setAlertSelected] = useState<AIRecommendation | null>(
    null,
  );

  if (connected) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <a href="/" className="flex items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/AstraPort_logo.svg" alt="AstraPort Logo" className="w-56 h-14 object-contain" />
            </a>
            <div className="flex items-center gap-4">
              <a
                href="/drift-monitoring"
                className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Drift Monitor
              </a>
              <a
                href="/rebalance"
                className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand-navy dark:bg-brand-teal text-white dark:text-brand-navy text-sm font-semibold hover:bg-stellar-700 dark:hover:bg-stellar-400 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Rebalance
              </a>
              <AIAlertBell onOpenRecommendation={setAlertSelected} />
              <ThemeToggle />
              <WalletConnect />
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            {/* Portfolio Overview */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Portfolio Overview</h2>
              <PortfolioOverview />
            </section>

            {/* Charts and Risk */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <PortfolioChart />
              </div>
              <div>
                <RiskScoreDisplay />
              </div>
            </div>

            {/* Insights */}
            <section>
              <InsightsList />
            </section>

            {/* AI Analysis Results Dashboard */}
            <section>
              <AIRecommendationsDashboard />
            </section>
          </div>
        </div>

        {/* Details modal opened from the header alert bell */}
        <RecommendationDetails
          recommendation={alertSelected}
          open={alertSelected !== null}
          onClose={() => setAlertSelected(null)}
          onExecute={execute}
          executingActionId={
            alertSelected ? executingActionId(alertSelected.id) : null
          }
          result={alertSelected ? resultFor(alertSelected.id) : undefined}
        />
      </main>
    );
  }

  // Redesigned landing page for disconnected users
  return <LandingPage />;
}
