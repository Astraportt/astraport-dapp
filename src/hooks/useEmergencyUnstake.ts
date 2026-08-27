'use client';

import { useCallback, useMemo, useState } from 'react';
import { useStakingStore } from '@/store';
import { StakedAsset } from '@/types/staking';
import { EmergencyUnstakeService } from '@/services/emergencyUnstake';
import {
  calculatePenalty,
  currentPenaltyRate,
  penaltyDecayCurve,
  PenaltyPoint,
} from '@/utils/penalty';

/**
 * Real-time penalty preview: recalculates synchronously as the withdrawal
 * amount changes, so there is no perceptible latency in the modal.
 */
export const usePenaltyCalculator = (position?: StakedAsset) => {
  return useCallback(
    (amount: number) => {
      if (!position) return null;
      return calculatePenalty({
        amount,
        unitPrice:
          Number(position.amount) > 0
            ? position.currentValue / Number(position.amount)
            : 0,
        startDate: position.startDate,
        lockupDate: position.lockupDate,
      });
    },
    [position]
  );
};

/**
 * Full emergency unstake workflow: quote, execute and history management.
 * All API interaction goes through EmergencyUnstakeService which degrades to
 * local mocks when the backend is unavailable.
 */
export const useEmergencyUnstake = (publicKey?: string) => {
  const { stakingPortfolio, loading, setLoading } = useStakingStore();

  const [quote, setQuote] = useState<ReturnType<
    typeof EmergencyUnstakeService.quoteLocally
  > | null>(null);
  const [history, setHistory] = useState<
    Awaited<ReturnType<typeof EmergencyUnstakeService.getHistory>>
  >([]);
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<{
    txHash: string;
    status: string;
  } | null>(null);

  /** Positions eligible for emergency withdrawal. */
  const eligiblePositions = useMemo(() => {
    const positions = stakingPortfolio?.positions ?? [];
    return positions.filter((p) =>
      EmergencyUnstakeService.isEligible(p)
    );
  }, [stakingPortfolio]);

  const refreshQuote = useCallback(
    async (position: StakedAsset, amount: number) => {
      if (!publicKey || amount <= 0) {
        setQuote(null);
        return;
      }
      try {
        const q = await EmergencyUnstakeService.getQuote(
          publicKey,
          position,
          amount
        );
        setQuote(q);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to get quote');
      }
    },
    [publicKey]
  );

  const fetchHistory = useCallback(async () => {
    if (!publicKey) return;
    setLoading('portfolio', true);
    try {
      const records = await EmergencyUnstakeService.getHistory(publicKey);
      setHistory(records);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load history'
      );
    } finally {
      setLoading('portfolio', false);
    }
  }, [publicKey, setLoading]);

  const execute = useCallback(
    async (position: StakedAsset, amount: number) => {
      if (!publicKey) throw new Error('Wallet not connected');
      setLoading('transaction', true);
      setError(null);
      try {
        const result = await EmergencyUnstakeService.execute(
          publicKey,
          position.id,
          amount
        );
        setLastResult(result);
        await fetchHistory();
        return result;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Emergency unstake failed';
        setError(message);
        throw new Error(message);
      } finally {
        setLoading('transaction', false);
      }
    },
    [publicKey, fetchHistory, setLoading]
  );

  /** Chart data for the position's penalty decay with a "today" marker. */
  const decayCurve = useCallback(
    (position: StakedAsset): PenaltyPoint[] =>
      penaltyDecayCurve(position.startDate, position.lockupDate),
    []
  );

  return {
    eligiblePositions,
    quote,
    refreshQuote,
    history,
    fetchHistory,
    execute,
    lastResult,
    error,
    isLoading: loading.transaction,
    decayCurve,
    // Re-exported helpers for components that need direct math.
    helpers: { currentPenaltyRate, calculatePenalty },
  };
};
