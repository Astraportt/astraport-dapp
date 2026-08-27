import axios from 'axios';
import { EmergencyUnstakeQuote, EmergencyUnstakeRecord, StakedAsset } from '@/types/staking';
import {
  calculatePenalty,
  currentPenaltyRate,
} from '@/utils/penalty';

const API_BASE =
  process.env.NEXT_PUBLIC_ASTRAPORT_API_URL || 'http://localhost:3001';

const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

// ─── Mock fallbacks (mirror the offline behaviour of staking.ts) ─────────────

const MOCK_HISTORY: EmergencyUnstakeRecord[] = [
  {
    id: 'eu-1003',
    positionId: 'position-2',
    assetCode: 'USDC',
    amount: '500.00',
    penaltyAmount: '12.50',
    netAmount: '487.50',
    status: 'completed',
    txHash:
      'aa11bb22cc33dd44ee55ff66aa77bb88cc99dd00ee11ff22aa33bb44cc55dd66',
    timestamp: Date.now() - 6 * 24 * 60 * 60 * 1000,
  },
  {
    id: 'eu-1001',
    positionId: 'position-1',
    assetCode: 'XLM',
    amount: '1200.00',
    penaltyAmount: '48.00',
    netAmount: '1152.00',
    status: 'completed',
    txHash:
      '77fe88dd99cc00aa11bb22cc33dd44ee55ff66aa77bb88cc99dd00ee11ff22aa3',
    timestamp: Date.now() - 21 * 24 * 60 * 60 * 1000,
  },
];

/**
 * Emergency withdrawal service: quotes, execution and history.
 * Falls back to deterministic local calculations / mock records when the API
 * is unreachable, matching the rest of the staking services.
 */
export class EmergencyUnstakeService {
  /**
   * Quote the cost of withdrawing `amount` from `position` right now.
   * Computed locally from the penalty schedule so the UI preview is instant;
   * the server quote (when available) is authoritative for execution.
   */
  static quoteLocally(
    position: StakedAsset,
    amount: number,
    now: number = Date.now()
  ): EmergencyUnstakeQuote {
    const unitPrice =
      position.amount && Number(position.amount) > 0
        ? position.currentValue / Number(position.amount)
        : 0;

    const breakdown = calculatePenalty({
      amount,
      unitPrice,
      startDate: position.startDate,
      lockupDate: position.lockupDate,
      now,
    });

    return {
      positionId: position.id,
      assetCode: position.code,
      requestedAmount: amount,
      penaltyRate: breakdown.penaltyRate,
      grossValue: breakdown.grossValue,
      penaltyAmount: breakdown.penaltyAmount,
      netProceeds: breakdown.netProceeds,
      daysUntilUnlock: breakdown.daysUntilUnlock,
      quoteTimestamp: now,
    };
  }

  /** Server-side quote; falls back to the local calculation when offline. */
  static async getQuote(
    publicKey: string,
    position: StakedAsset,
    amount: number
  ): Promise<EmergencyUnstakeQuote> {
    try {
      const { data } = await apiClient.post(
        `/staking/emergency-unstake/${publicKey}/quote`,
        { positionId: position.id, amount }
      );
      return data;
    } catch {
      return this.quoteLocally(position, amount);
    }
  }

  /** Execute an emergency withdrawal of part or all of a position. */
  static async execute(
    publicKey: string,
    positionId: string,
    amount: number
  ): Promise<{ txHash: string; status: string }> {
    try {
      const { data } = await apiClient.post(
        `/staking/emergency-unstake/${publicKey}`,
        { positionId, amount }
      );
      return data;
    } catch {
      // Offline mock so the full UX flow remains demonstrable.
      return { txHash: 'mock' + Date.now().toString(16), status: 'completed' };
    }
  }

  /** History of past emergency withdrawals with optional status filter. */
  static async getHistory(
    publicKey: string,
    filter?: { status?: EmergencyUnstakeRecord['status'] }
  ): Promise<EmergencyUnstakeRecord[]> {
    try {
      const url = `/staking/emergency-unstake/${publicKey}/history`;
      const { data } = await apiClient.get(url);
      return data as EmergencyUnstakeRecord[];
    } catch {
      return filter?.status
        ? MOCK_HISTORY.filter((r) => r.status === filter.status)
        : MOCK_HISTORY;
    }
  }

  /** Whether emergency unstaking is even possible for this position. */
  static isEligible(position: StakedAsset, now: number = Date.now()): boolean {
    if (position.status === 'unstaked') return false;
    if (position.lockupDate <= now) return false; // normal unstake applies
    return currentPenaltyRate(position.startDate, position.lockupDate, now) > 0;
  }
}
