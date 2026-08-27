'use client';

import React from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { PenaltyBreakdown } from '@/utils/penalty';

interface PenaltyComparisonProps {
  /** Breakdown for the emergency (early) withdrawal */
  emergency: PenaltyBreakdown | null;
  /** Zero-penalty breakdown if the user waits until lock-up end */
  normal: {
    netProceeds: number;
    daysUntilUnlock: number;
  };
  assetCode: string;
}

const fmt = (v: number) =>
  v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/**
 * Side-by-side cost comparison between a normal unstake (after lock-up) and
 * the emergency withdrawal being considered.
 */
export const PenaltyComparison: React.FC<PenaltyComparisonProps> = ({
  emergency,
  normal,
  assetCode,
}) => {
  if (!emergency) return null;

  const difference = normal.netProceeds - emergency.netProceeds;

  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 gap-3"
      data-testid="penalty-comparison"
    >
      {/* Normal path */}
      <div className="rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/30 p-4">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle2 className="w-4 h-4 text-green-600" aria-hidden />
          <h4 className="text-sm font-semibold text-green-700 dark:text-green-400">
            Normal Unstake
          </h4>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
          Wait {normal.daysUntilUnlock} more day
          {normal.daysUntilUnlock === 1 ? '' : 's'} until lock-up ends
        </p>
        <div className="space-y-1.5 text-sm">
          <Row label="Penalty" value="0%" tone="good" />
          <Row label={`You receive`} value={`${fmt(normal.netProceeds)} ${assetCode}`} tone="good" strong />
        </div>
      </div>

      {/* Emergency path */}
      <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 p-4">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="w-4 h-4 text-amber-600" aria-hidden />
          <h4 className="text-sm font-semibold text-amber-700 dark:text-amber-400">
            Emergency Unstake
          </h4>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
          Withdraw immediately with early-exit penalty
        </p>
        <div className="space-y-1.5 text-sm">
          <Row
            label="Penalty"
            value={`${emergency.penaltyRate.toFixed(2)}% (${fmt(emergency.penaltyAmount)} ${assetCode})`}
            tone="warn"
          />
          <Row
            label={`You receive`}
            value={`${fmt(emergency.netProceeds)} ${assetCode}`}
            tone="warn"
            strong
          />
        </div>
      </div>

      {/* Delta callout */}
      {difference > 0 && (
        <p className="sm:col-span-2 text-center text-sm text-gray-600 dark:text-gray-300">
          Waiting until lock-up end gets you{' '}
          <span className="font-semibold text-green-600 dark:text-green-400">
            {fmt(difference)} {assetCode} more
          </span>
          .
        </p>
      )}
    </div>
  );
};

function Row({
  label,
  value,
  tone,
  strong,
}: {
  label: string;
  value: string;
  tone: 'good' | 'warn';
  strong?: boolean;
}) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-gray-500 dark:text-gray-400">{label}</span>
      <span
        className={[
          strong ? 'font-bold' : 'font-medium',
          tone === 'good'
            ? 'text-green-700 dark:text-green-400'
            : 'text-amber-700 dark:text-amber-400',
        ].join(' ')}
      >
        {value}
      </span>
    </div>
  );
}
