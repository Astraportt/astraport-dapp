'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { StakedAsset } from '@/types/staking';
import { PenaltyBreakdown } from '@/utils/penalty';
import {
  useEmergencyUnstake,
  usePenaltyCalculator,
} from '@/hooks/useEmergencyUnstake';
import {
  ConfirmationPanel,
  Field,
  InfoRow,
  PreviewTab,
  TimelineBar,
  TooltipNote,
} from './modal-parts';
import { PenaltyDecayChart } from './PenaltyDecayChart';
import { UnstakeHistory } from './UnstakeHistory';

type Tab = 'position' | 'preview' | 'history';
type Step = 'form' | 'confirming' | 'success';

interface EmergencyUnstakeModalProps {
  open: boolean;
  onClose: () => void;
  publicKey?: string;
}

const TOOLTIPS = {
  penalty:
    'Early withdrawals forfeit a percentage of the withdrawn value. The penalty shrinks every day and disappears entirely once your lock-up ends.',
  net: 'What actually lands in your wallet: the withdrawn amount minus the emergency penalty.',
  decay:
    'The line shows how your exit penalty falls over time. The closer you are to lock-up end, the cheaper an early exit becomes.',
};

const fmt = (v: number) =>
  v.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

/**
 * Emergency unstaking interface (issue #10): position overview + lock-up
 * timeline, real-time penalty preview with decay chart, side-by-side cost
 * comparison against a normal unstake, history of past emergency exits, and
 * an explicit confirmation step before anything is signed.
 */
export const EmergencyUnstakeModal: React.FC<EmergencyUnstakeModalProps> = ({
  open,
  onClose,
  publicKey,
}) => {
  const { eligiblePositions, history, fetchHistory, execute, error, isLoading } =
    useEmergencyUnstake(publicKey);

  const [tab, setTab] = useState<Tab>('preview');
  const [step, setStep] = useState<Step>('form');
  const [positionId, setPositionId] = useState<string>('');
  const [amountInput, setAmountInput] = useState<string>('');

  const position: StakedAsset | undefined = useMemo(
    () =>
      eligiblePositions.find((p) => p.id === positionId) ??
      eligiblePositions[0],
    [eligiblePositions, positionId]
  );

  // Real-time local calculation — updates on every keystroke.
  const calcFor = usePenaltyCalculator(position);
  const preview: PenaltyBreakdown | null = useMemo(
    () => (position ? calcFor(Number(amountInput) || 0) : null),
    [calcFor, amountInput, position]
  );

  useEffect(() => {
    if (open) {
      setStep('form');
      setTab('preview');
      setAmountInput('');
      fetchHistory();
    }
  }, [open, fetchHistory]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  const maxAmount = position ? Number(position.amount) : 0;
  const amount = Number(amountInput) || 0;
  const isNumber = /^\d*\.?\d*$/.test(amountInput);
  const invalid = !position || !isNumber || amount <= 0 || amount > maxAmount;

  const handleConfirm = async () => {
    if (!position) return;
    try {
      await execute(position, amount);
      setStep('success');
    } catch {
      setStep('form');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-label="Emergency unstake"
      data-testid="emergency-unstake-modal"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-white dark:bg-gray-900 shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-5 py-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" aria-hidden />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Emergency Unstake
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            data-testid="close-modal"
            className="rounded p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {eligiblePositions.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-400">
            None of your positions are eligible for emergency withdrawal. Once
            a lock-up ends, use normal unstaking instead — it has no penalty.
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div
              className="flex gap-1 px-5 pt-4"
              role="tablist"
              aria-label="Emergency unstake sections"
            >
              {(
                [
                  ['position', 'Position'],
                  ['preview', 'Penalty Preview'],
                  ['history', 'History'],
                ] as Array<[Tab, string]>
              ).map(([key, label]) => (
                <button
                  key={key}
                  role="tab"
                  aria-selected={tab === key}
                  onClick={() => setTab(key)}
                  className={[
                    'px-3 py-1.5 text-sm font-medium rounded-t-md transition-colors',
                    tab === key
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                      : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200',
                  ].join(' ')}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="px-5 py-4">
              {/* ─── Position & timeline ──────────────────────────────── */}
              {tab === 'position' && (
                <div className="space-y-4" data-testid="position-tab">
                  <Field label="Position">
                    <select
                      value={position?.id ?? ''}
                      onChange={(e) => {
                        setPositionId(e.target.value);
                        setAmountInput('');
                      }}
                      aria-label="Select staked position"
                      data-testid="position-select"
                      className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                    >
                      {eligiblePositions.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.code} — {fmt(Number(p.amount))} staked
                        </option>
                      ))}
                    </select>
                  </Field>

                  {position && (
                    <>
                      <dl className="grid grid-cols-2 gap-3 text-sm">
                        <InfoRow
                          label="Amount staked"
                          value={`${fmt(Number(position.amount))} ${position.code}`}
                        />
                        <InfoRow
                          label="Current APY"
                          value={`${position.apy.toFixed(2)}%`}
                        />
                        <InfoRow
                          label="Staked since"
                          value={new Date(position.startDate).toLocaleDateString()}
                        />
                        <InfoRow
                          label="Lock-up ends"
                          value={new Date(position.lockupDate).toLocaleDateString()}
                        />
                      </dl>

                      <TimelineBar position={position} />

                      <PenaltyDecayChart position={position} className="h-56" />
                      <TooltipNote text={TOOLTIPS.decay} />
                    </>
                  )}
                </div>
              )}

              {/* ─── Real-time penalty preview ───────────────────────── */}
              {tab === 'preview' && position && (
                <PreviewTab
                  position={position}
                  amountInput={amountInput}
                  setAmountInput={setAmountInput}
                  preview={preview}
                  invalid={invalid}
                  tooltip={TOOLTIPS.penalty}
                />
              )}

              {/* ─── History ─────────────────────────────────────────── */}
              {tab === 'history' && (
                <div data-testid="history-tab">
                  <UnstakeHistory records={history} />
                </div>
              )}
            </div>

            {/* ─── Footer actions / confirmation flow ─────────────────── */}
            <div className="border-t border-gray-200 dark:border-gray-700 px-5 py-4">
              {step === 'form' && (
                <div className="space-y-3">
                  {error && (
                    <p
                      role="alert"
                      className="rounded-md bg-red-50 dark:bg-red-950/40 px-3 py-2 text-xs text-red-600 dark:text-red-400"
                    >
                      {error}
                    </p>
                  )}
                  <div className="flex items-center justify-between gap-3">
                    <TooltipNote inline text={TOOLTIPS.net} />
                    <div className="flex gap-2">
                      <button
                        onClick={onClose}
                        className="rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        Cancel
                      </button>
                      <button
                        disabled={invalid || isLoading}
                        onClick={() => setStep('confirming')}
                        data-testid="review-emergency-unstake"
                        className="rounded-md bg-amber-600 hover:bg-amber-700 disabled:opacity-40 disabled:hover:bg-amber-600 px-4 py-2 text-sm font-semibold text-white"
                      >
                        Review withdrawal
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {step === 'confirming' && position && preview && (
                <ConfirmationPanel
                  assetCode={position.code}
                  amount={amount}
                  preview={preview}
                  daysUntilUnlock={
                    Math.max(
                      0,
                      Math.ceil((position.lockupDate - Date.now()) / 86400000)
                    ) as number
                  }
                  isLoading={isLoading}
                  onCancel={() => setStep('form')}
                  onConfirm={handleConfirm}
                />
              )}

              {step === 'success' && (
                <div
                  className="py-4 text-center space-y-2"
                  data-testid="success-panel"
                >
                  <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                    Emergency unstake submitted successfully.
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Check your wallet and transaction history for confirmation.
                  </p>
                  <button
                    onClick={onClose}
                    className="mt-2 rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
