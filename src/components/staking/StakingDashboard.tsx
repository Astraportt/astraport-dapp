'use client';

import React, { useEffect, useState } from 'react';
import { useStakingStore } from '@/store';
import { StakingService } from '@/services/staking';
import { AssetCard } from './AssetCard';
import { PortfolioSummary } from './PortfolioSummary';
import { OptimizationRecommendations } from './OptimizationRecommendations';
import { YieldProjectionCalculator } from './YieldProjection';
import { MultiAssetStakingForm } from './MultiAssetStakingForm';
import { ComparisonTools } from './ComparisonTools';
import { AssetDetailPage } from './AssetDetailPage';
import { EmergencyUnstakeModal } from './emergency';
import { RefreshCw, Plus, BarChart3, AlertTriangle } from 'lucide-react';

interface StakingDashboardProps {
  publicKey?: string;
}

export const StakingDashboard: React.FC<StakingDashboardProps> = ({ publicKey }) => {
  const {
    stakingPortfolio,
    availableAssets,
    recommendations,
    comparisonData,
    selectedAssetId,
    loading,
    errors,
    setStakingPortfolio,
    setAvailableAssets,
    setRecommendations,
    setComparisonData,
    setSelectedAssetId,
    setLoading,
    setError,
  } = useStakingStore();

  const [showStakingForm, setShowStakingForm] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showEmergencyUnstake, setShowEmergencyUnstake] = useState(false);

  const fetchStakingData = async (refresh = false) => {
    if (!publicKey) return;
    
    if (refresh) setIsRefreshing(true);
    setLoading('portfolio', true);
    setLoading('recommendations', true);
    setError('portfolio', null);
    setError('recommendations', null);

    try {
      const [portfolio, assets, recs, comparison] = await Promise.all([
        StakingService.getStakingPortfolio(publicKey),
        StakingService.getAvailableAssets(publicKey),
        StakingService.getRecommendations(publicKey),
        StakingService.getComparisonData(publicKey),
      ]);

      setStakingPortfolio(portfolio);
      setAvailableAssets(assets);
      setRecommendations(recs);
      setComparisonData(comparison);
    } catch (err) {
      setError('portfolio', err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading('portfolio', false);
      setLoading('recommendations', false);
      if (refresh) setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStakingData();
  }, [publicKey]);

  const handleStakingSubmit = async (transaction: any) => {
    if (!publicKey) return;
    setLoading('transaction', true);
    setError('transaction', null);

    try {
      await StakingService.submitStakingTransaction(publicKey, transaction);
      setShowStakingForm(false);
      await fetchStakingData(true);
    } catch (err) {
      setError('transaction', err instanceof Error ? err.message : 'Transaction failed');
      throw err;
    } finally {
      setLoading('transaction', false);
    }
  };

  const handleApplyRecommendation = async (recommendationId: string) => {
    if (!publicKey) return;
    setLoading('transaction', true);
    try {
      await StakingService.applyRecommendation(publicKey, recommendationId);
      await fetchStakingData(true);
    } finally {
      setLoading('transaction', false);
    }
  };

  const handleDismissRecommendation = (id: string) => {
    const filtered = recommendations.filter((r) => r.id !== id);
    setRecommendations(filtered);
  };

  const handleUnstake = async (assetId: string) => {
    if (!publicKey) return;
    setLoading('transaction', true);
    try {
      await StakingService.unstake(publicKey, assetId);
      await fetchStakingData(true);
      setSelectedAssetId(null);
    } finally {
      setLoading('transaction', false);
    }
  };

  const selectedAsset = stakingPortfolio?.positions.find((p) => p.id === selectedAssetId);

  if (selectedAsset) {
    return (
      <div className="container mx-auto px-4 py-8">
        <AssetDetailPage
          asset={selectedAsset}
          onBack={() => setSelectedAssetId(null)}
          onUnstake={handleUnstake}
          onCompound={async (id) => console.log('Compound', id)}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Staking Dashboard
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Manage your multi-asset staking portfolio
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => fetchStakingData(true)}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => setShowEmergencyUnstake(true)}
            data-testid="open-emergency-unstake"
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
          >
            <AlertTriangle className="w-4 h-4" />
            Emergency Unstake
          </button>
          <button
            onClick={() => setShowStakingForm(!showStakingForm)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Stake Assets
          </button>
        </div>
      </div>

      <EmergencyUnstakeModal
        open={showEmergencyUnstake}
        onClose={() => setShowEmergencyUnstake(false)}
        publicKey={publicKey}
      />

      {errors.portfolio && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
          {errors.portfolio}
        </div>
      )}

      {stakingPortfolio && (
        <div className="mb-8">
          <PortfolioSummary portfolio={stakingPortfolio} isLoading={loading.portfolio} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 space-y-6">
          {showStakingForm && availableAssets.length > 0 && (
            <MultiAssetStakingForm
              availableAssets={availableAssets}
              onSubmit={handleStakingSubmit}
              isSubmitting={loading.transaction}
            />
          )}

          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Staking Positions
            </h2>
            {stakingPortfolio && stakingPortfolio.positions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {stakingPortfolio.positions.map((asset) => (
                  <AssetCard
                    key={asset.id}
                    asset={asset}
                    onClick={() => setSelectedAssetId(asset.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  No staking positions yet
                </p>
                <button
                  onClick={() => setShowStakingForm(true)}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Start Staking
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <OptimizationRecommendations
            recommendations={recommendations}
            onApply={handleApplyRecommendation}
            onDismiss={handleDismissRecommendation}
            isLoading={loading.recommendations}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <YieldProjectionCalculator availableAssets={availableAssets} />
        {comparisonData && (
          <ComparisonTools comparisonData={comparisonData} isLoading={loading.portfolio} />
        )}
      </div>
    </div>
  );
};

export default StakingDashboard;
