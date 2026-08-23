/**
 * Emergency unstake penalty model.
 *
 * The penalty starts at MAX_PENALTY_RATE the moment a position is created and
 * decays linearly to 0% as the position approaches its lock-up end. Withdrawing
 * after the lock-up has ended is a normal unstake and carries no penalty, so
 * the emergency flow is disabled there.
 */
export const MAX_PENALTY_RATE = 10; // percent of the withdrawn value

export interface PenaltyPoint {
  /** Days since the position was opened */
  day: number;
  /** Penalty percentage in effect on that day (0-100) */
  penaltyRate: number;
}

/** Current penalty rate (percent) for a position at time `now`. */
export function currentPenaltyRate(
  startDate: number,
  lockupDate: number,
  now: number = Date.now()
): number {
  const total = lockupDate - startDate;
  if (total <= 0) return 0;
  const elapsed = Math.min(Math.max(now - startDate, 0), total);
  return ((total - elapsed) / total) * MAX_PENALTY_RATE;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** Full penalty decay curve for charting, sampled once per `stepDays` days. */
export function penaltyDecayCurve(
  startDate: number,
  lockupDate: number,
  now: number = Date.now(),
  stepDays = 1
): PenaltyPoint[] {
  const totalMs = Math.max(lockupDate - startDate, 0);
  const stepMs = stepDays * DAY_MS;
  const points: PenaltyPoint[] = [];

  for (let t = 0; t <= totalMs; t += stepMs) {
    points.push({
      day: Math.round(t / DAY_MS),
      penaltyRate: currentPenaltyRate(startDate, lockupDate, startDate + t),
    });
  }
  // Always include the final point.
  if (
    points.length === 0 ||
    points[points.length - 1].day !== Math.round(totalMs / DAY_MS)
  ) {
    points.push({ day: Math.round(totalMs / DAY_MS), penaltyRate: 0 });
  }

  // Make sure "today" appears on the curve so the chart can mark it.
  const todayDay = Math.max(0, Math.round((now - startDate) / DAY_MS));
  if (!points.some((p) => p.day === todayDay)) {
    points.push({
      day: todayDay,
      penaltyRate: currentPenaltyRate(startDate, lockupDate, now),
    });
    points.sort((a, b) => a.day - b.day);
  }

  return points;
}

export interface PenaltyBreakdown {
  penaltyRate: number;
  grossValue: number;
  penaltyAmount: number;
  netProceeds: number;
  daysUntilUnlock: number;
}

/**
 * Real-time preview of what a withdrawal of `amount` (in asset units valued at
 * `unitPrice`) would cost right now versus waiting until the lock-up ends.
 */
export function calculatePenalty(params: {
  amount: number;
  unitPrice?: number;
  startDate: number;
  lockupDate: number;
  now?: number;
}): PenaltyBreakdown {
  const { amount, unitPrice = 1 } = params;
  const now = params.now ?? Date.now();

  const grossValue = amount * unitPrice;
  const rate = currentPenaltyRate(params.startDate, params.lockupDate, now);
  const penaltyAmount = (grossValue * rate) / 100;

  return {
    penaltyRate: rate,
    grossValue,
    penaltyAmount,
    netProceeds: grossValue - penaltyAmount,
    daysUntilUnlock: Math.max(0, Math.ceil((params.lockupDate - now) / DAY_MS)),
  };
}
