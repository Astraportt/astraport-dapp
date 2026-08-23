'use client';

import React from 'react';
import { Info } from 'lucide-react';
import { StakedAsset } from '@/types/staking';
import { PenaltyBreakdown } from '@/utils/penalty';
import { PenaltyDecayChart } from './PenaltyDecayChart';
import { PenaltyComparison } from './PenaltyComparison';

const fmt = (v: number) =>
  v.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

interface PreviewTabProps {
  position: StakedAsset;
  amountInput: string;
  setAmountInput: (v: string) => void;
  preview: PenaltyBreakdown | null;
  invalid: boolean;
  tooltip: string;
}

/**
 * Amount entry + live penalty breakdown + side-by-side comparison.
 * The breakdown recalculates on every keystroke via usePenaltyCalculator.
 */
export const PreviewTab: React.FC<PreviewTabProps> = ({
  position,
  amountInput,
  setAmountInput,
  preview,
  invalid,
  tooltip,
}) => {
  const maxAmount = Number(position.amount);
  const amount = Number(amountInput) || 0;

  return (
    <div className="space-y-4" data-testid="penalty-preview-tab">
      {/* Amount input */}
      <Field
        label={`Withdrawal amount (${position.code})`}
        tooltip={tooltip}
      >
        <div className="flex gap-2">
          <input
            type="text"
            inputMode="decimal"
            value={amountInput}
            onChange={(e) => setAmountInput(e.target.value)}
            placeholder="0.00"
            aria-label="Withdrawal amount"
            data-testid="withdrawal-amount"
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
          />
          <button
            onClick={() => setAmountInput(String(maxAmount))}
            data-testid="max-button"
            className="shrink-0 rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-xs font-medium hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            MAX
          </button>
        </div>
        {amount > maxAmount && (
          <p className="mt-1 text-xs text-red-600 dark:text-red-400" role="alert">
            Amount exceeds your staked balance of {fmt(maxAmount)}{' '}
            {position.code}.
          </p>
        )}
        {amountInput !== '' && !/^\d*\.?\d*$/.test(amountInput) && (
          <p className="mt-1 text-xs text-red-600 dark:text-red-400" role="alert">
            Enter a valid number.
          </p>
        )}
      </Field>

      {/* Live breakdown */}
      {preview && amount > 0 && !invalid && (
        <>
          <div className="grid grid-cols-3 gap-3 rounded-lg bg-gray-50 dark:bg-gray-800 p-3 text-center">
            <Metric
              label="Gross value"
              value={`${fmt(preview.grossValue)} ${position.code}`}
            />
            <Metric
              label={`Penalty (${preview.penaltyRate.toFixed(2)}%)`}
              value={`-${fmt(preview.penaltyAmount)} ${position.code}`}
              tone="bad"
            />
            <Metric
              label="You receive"
              value={`${fmt(preview.netProceeds)} ${position.code}`}
              tone="good"
            />
          </div>

          <PenaltyComparison
            emergency={preview}
            normal={{
              netProceeds: preview.grossValue,
              daysUntilUnlock: preview.daysUntilUnlock,
            }}
            assetCode={position.code}
          />

          <PenaltyDecayChart position={position} className="h-48" />
        </>
      )}
    </div>
  );
};

/** Explicit final review before the transaction is signed. */
export const ConfirmationPanel: React.FC<{
  assetCode: string;
  amount: number;
  preview: PenaltyBreakdown;
  daysUntilUnlock: number;
  isLoading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}> = ({
  assetCode,
  amount,
  preview,
  daysUntilUnlock,
  isLoading,
  onCancel,
  onConfirm,
}) => (
  <div
    className="space-y-3 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 p-4"
    data-testid="confirmation-panel"
  >
    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
      Confirm emergency withdrawal
    </h3>
    <dl className="space-y-1.5 text-sm">
      <InfoRow label="Withdrawal amount" value={`${fmt(amount)} ${assetCode}`} />
      <InfoRow
        label={`Penalty (${preview.penaltyRate.toFixed(2)}%)`}
        value={`-${fmt(preview.penaltyAmount)} ${assetCode}`}
      />
      <InfoRow
        label="You will receive"
        value={`${fmt(preview.netProceeds)} ${assetCode}`}
      />
      <InfoRow
        label="Forgone by not waiting"
        value={`${fmt(daysUntilUnlock)} day(s) of lock-up remaining`}
      />
    </dl>
    <p className="text-xs text-gray-500 dark:text-gray-400">
      This action is immediate and cannot be undone. The penalty is forfeited
      at execution time.
    </p>
    <div className="flex justify-end gap-2 pt-1">
      <button
        onClick={onCancel}
        disabled={isLoading}
        className="rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40"
      >
        Back
      </button>
      <button
        onClick={onConfirm}
        disabled={isLoading}
        data-testid="confirm-emergency-unstake"
        className="rounded-md bg-red-600 hover:bg-red-700 disabled:opacity-40 px-4 py-2 text-sm font-semibold text-white"
      >
        {isLoading ? 'Submitting…' : 'Confirm & withdraw'}
      </button>
    </div>
  </div>
);

// ─── Small shared pieces ─────────────────────────────────────────────────────

export const Field: React.FC<{
  label: string;
  tooltip?: string;
  children: React.ReactNode;
}> = ({ label, tooltip, children }) => (
  <div>
    <div className="mb-1.5 flex items-center gap-1.5">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </span>
      {tooltip && (
        <span title={tooltip} className="cursor-help text-gray-400">
          <Info className="w-3.5 h-3.5" aria-hidden />
          <span className="sr-only">{tooltip}</span>
        </span>
      )}
    </div>
    {children}
  </div>
);

export const Metric: React.FC<{
  label: string;
  value: string;
  tone?: 'default' | 'good' | 'bad';
}> = ({ label, value, tone = 'default' }) => (
  <div>
    <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
    <p
      className={[
        'mt-0.5 text-sm font-semibold',
        tone === 'good'
          ? 'text-green-600 dark:text-green-400'
          : tone === 'bad'
            ? 'text-red-600 dark:text-red-400'
            : 'text-gray-900 dark:text-white',
      ].join(' ')}
      data-testid={
        label.startsWith('You receive') ? 'net-proceeds' : undefined
      }
    >
      {value}
    </p>
  </div>
);

export const InfoRow: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => (
  <div className="flex items-center justify-between gap-2">
    <dt className="text-gray-500 dark:text-gray-400">{label}</dt>
    <dd className="font-medium text-gray-900 dark:text-white">{value}</dd>
  </div>
);

export const TooltipNote: React.FC<{
  text: string;
  inline?: boolean;
}> = ({ text, inline }) => (
  <p
    className={[
      'flex items-start gap-1.5 text-xs text-gray-500 dark:text-gray-400',
      inline ? '' : '',
    ].join(' ')}
  >
    <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" aria-hidden />
    <span>{text}</span>
  </p>
);

/** Lock-up progress timeline with elapsed vs remaining segments. */
export const TimelineBar: React.FC<{ position: StakedAsset }> = ({
  position,
}) => {
  const DAY_MS = 24 * 60 * 60 * 1000;
  const totalMs = Math.max(position.lockupDate - position.startDate, 1);
  const elapsedPct = Math.min(
    100,
    Math.max(0, ((Date.now() - position.startDate) / totalMs) * 100)
  );

  return (
    <div data-testid="lockup-timeline">
      <div className="mb-1 flex justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>Staked</span>
        <span>{elapsedPct.toFixed(0)}% of lock-up elapsed</span>
        <span>Unlocked</span>
      </div>
      <div
        className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden"
        role="progressbar"
        aria-valuenow={Math.round(elapsedPct)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Lock-up progress"
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-amber-400 to-green-400 transition-all"
          style={{ width: `${elapsedPct}%` }}
        />
      </div>
      <p className="mt-1 text-right text-xs text-gray-400">
        {Math.max(0, Math.ceil((position.lockupDate - Date.now()) / DAY_MS))}{' '}
        days remaining
      </p>
    </div>
  );
};
