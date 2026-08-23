import {
  MAX_PENALTY_RATE,
  calculatePenalty,
  currentPenaltyRate,
  penaltyDecayCurve,
} from '@/utils/penalty';

const DAY = 24 * 60 * 60 * 1000;
const START = 1_700_000_000_000;
const LOCKUP_90D = START + 90 * DAY;

describe('penalty model', () => {
  describe('currentPenaltyRate', () => {
    it('is maximal at position open', () => {
      expect(currentPenaltyRate(START, LOCKUP_90D, START)).toBeCloseTo(
        MAX_PENALTY_RATE
      );
    });

    it('decays linearly to zero at lock-up end', () => {
      const halfway = currentPenaltyRate(START, LOCKUP_90D, START + 45 * DAY);
      expect(halfway).toBeCloseTo(MAX_PENALTY_RATE / 2);

      expect(currentPenaltyRate(START, LOCKUP_90D, LOCKUP_90D)).toBe(0);
    });

    it('clamps before start and after lock-up end', () => {
      expect(currentPenaltyRate(START, LOCKUP_90D, START - 5 * DAY)).toBe(
        MAX_PENALTY_RATE
      );
      expect(currentPenaltyRate(START, LOCKUP_90D, LOCKUP_90D + 30 * DAY)).toBe(
        0
      );
    });
  });

  describe('calculatePenalty', () => {
    it('produces a consistent real-time breakdown', () => {
      const b = calculatePenalty({
        amount: 1000,
        unitPrice: 2,
        startDate: START,
        lockupDate: LOCKUP_90D,
        now: START + 45 * DAY,
      });
      expect(b.penaltyRate).toBeCloseTo(5);
      expect(b.grossValue).toBe(2000);
      expect(b.penaltyAmount).toBeCloseTo(100);
      expect(b.netProceeds).toBeCloseTo(1900);
      expect(b.daysUntilUnlock).toBe(45);
    });

    it('reports zero cost once unlocked', () => {
      const b = calculatePenalty({
        amount: 100,
        startDate: START,
        lockupDate: LOCKUP_90D,
        now: LOCKUP_90D + DAY,
      });
      expect(b.penaltyAmount).toBe(0);
      expect(b.netProceeds).toBe(100);
      expect(b.daysUntilUnlock).toBe(0);
    });
  });

  describe('penaltyDecayCurve', () => {
    it('spans from max to exactly zero and includes today', () => {
      const now = START + 10 * DAY;
      const curve = penaltyDecayCurve(START, LOCKUP_90D, now, 5);

      expect(curve[0]).toEqual({ day: 0, penaltyRate: MAX_PENALTY_RATE });
      expect(curve[curve.length - 1].penaltyRate).toBe(0);

      const today = curve.find((p) => p.day === 10);
      expect(today).toBeDefined();
      expect(today!.penaltyRate).toBeCloseTo(MAX_PENALTY_RATE * (80 / 90));
    });

    it('is monotonically non-increasing', () => {
      const curve = penaltyDecayCurve(START, LOCKUP_90D, START + 3 * DAY, 1);
      for (let i = 1; i < curve.length; i++) {
        expect(curve[i].penaltyRate).toBeLessThanOrEqual(
          curve[i - 1].penaltyRate
        );
      }
    });
  });
});
