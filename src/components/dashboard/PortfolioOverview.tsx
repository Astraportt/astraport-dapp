'use client';

import React, { useEffect } from 'react';
import { useWalletStore, useDashboardStore } from '@/store';
import { usePortfolioData, useRiskScore } from '@/hooks/usePortfolio';
import { StellarService } from '@/services/stellar';

export const PortfolioOverview: React.FC = () => {
  const { account, portfolio: storePortfolio } = useWalletStore();
  const { riskScore: storeRiskScore, setRiskScore } = useDashboardStore();

  const publicKey = account?.publicKey ?? null;

  const {
    portfolio,
    loading: portfolioLoading,
    error: portfolioError,
    fetchPortfolio,
  } = usePortfolioData(publicKey);

  const {
    riskScore,
    loading: riskLoading,
    error: riskError,
    fetchRiskScore,
  } = useRiskScore(publicKey);

  // Fetch portfolio and risk score when account changes
  useEffect(() => {
    if (publicKey) {
      fetchPortfolio();
      fetchRiskScore();
    }
  }, [publicKey, fetchPortfolio, fetchRiskScore]);

  // Sync risk score to dashboard store
  useEffect(() => {
    if (riskScore) {
      setRiskScore(riskScore);
    }
  }, [riskScore, setRiskScore]);

  // Use store portfolio as fallback, then fetched portfolio
  const activePortfolio = storePortfolio ?? portfolio;
  const activeRiskScore = storeRiskScore ?? riskScore;

  // Calculate total value from portfolio or Stellar balances
  const totalValue = activePortfolio
    ? parseFloat(activePortfolio.totalBalance)
    : 0;

  // Calculate 24h change (placeholder - would come from historical data)
  const change24h = activePortfolio ? 0 : 0;

  // Count assets
  const assetCount = activePortfolio?.assets?.length ?? 0;

  // Format currency
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  // Format percentage
  const formatPercent = (value: number): string => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  const isLoading = portfolioLoading || riskLoading;
  const hasError = portfolioError || riskError;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-gray-600 font-semibold mb-2">Total Value</h3>
        {isLoading ? (
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-24"></div>
          </div>
        ) : (
          <p className="text-3xl font-bold">
            {hasError ? '—' : formatCurrency(totalValue)}
          </p>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-gray-600 font-semibold mb-2">24h Change</h3>
        {isLoading ? (
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-20"></div>
          </div>
        ) : (
          <p className={`text-2xl font-bold ${change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {hasError ? '—' : formatPercent(change24h)}
          </p>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-gray-600 font-semibold mb-2">Risk Score</h3>
        {isLoading ? (
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-16"></div>
          </div>
        ) : (
          <p className="text-3xl font-bold text-yellow-600">
            {activeRiskScore?.overall ?? '—'}
          </p>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-gray-600 font-semibold mb-2">Assets</h3>
        {isLoading ? (
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-12"></div>
          </div>
        ) : (
          <p className="text-3xl font-bold">
            {hasError ? '—' : assetCount}
          </p>
        )}
      </div>
    </div>
  );
};

export default PortfolioOverview;
