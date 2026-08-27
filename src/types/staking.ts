/**
 * Staking-related TypeScript types and interfaces
 */

/** Individual staked asset position */
export interface StakedAsset {
  id: string;
  /** Asset code (e.g., 'XLM', 'USDC') */
  code: string;
  /** Asset issuer address */
  issuer: string;
  /** Amount staked */
  amount: string;
  /** Annual Percentage Yield */
  apy: number;
  /** Yield rate per day/period */
  yieldRate: number;
  /** Lock-up period end date (timestamp) */
  lockupDate: number;
  /** Date when staking started (timestamp) */
  startDate: number;
  /** Current value in base currency */
  currentValue: number;
  /** Rewards earned so far */
  rewardsEarned: string;
  /** Status of the staking position */
  status: 'active' | 'unlocking' | 'unstaked';
  /** Historical performance data */
  performance?: PerformanceDataPoint[];
}

/** Historical performance data point */
export interface PerformanceDataPoint {
  date: string;
  value: number;
  apy: number;
  rewards: number;
}

/** Portfolio-level staking summary */
export interface StakingPortfolio {
  /** Total value of all staked assets */
  totalValue: number;
  /** Base currency for display */
  baseCurrency: string;
  /** Weighted average APY across all positions */
  averageApy: number;
  /** Total rewards earned across all positions */
  totalRewards: number;
  /** Aggregate daily/annual yield */
  aggregateYield: number;
  /** Individual staked positions */
  positions: StakedAsset[];
  /** Last updated timestamp */
  lastUpdated: number;
  /** 24h change in percentage */
  change24h: number;
  /** 7d change in percentage */
  change7d: number;
}

/** Multi-asset staking form input */
export interface StakingFormInput {
  /** Asset to stake */
  assetCode: string;
  /** Amount to stake */
  amount: string;
  /** Lock-up period in days */
  lockupPeriod: number;
}

/** Multi-asset staking transaction */
export interface MultiAssetStakingTransaction {
  /** Assets to stake in a single transaction */
  stakes: StakingFormInput[];
  /** Expected total APY */
  expectedApy: number;
  /** Transaction fee estimate */
  estimatedFee: string;
  /** Slippage tolerance in basis points */
  slippageBps: number;
}

/** Portfolio optimization recommendation */
export interface OptimizationRecommendation {
  id: string;
  /** Title of the recommendation */
  title: string;
  /** Detailed description */
  description: string;
  /** Severity/priority level */
  priority: 'low' | 'medium' | 'high';
  /** Expected impact on portfolio */
  impact: {
    /** Expected APY increase */
    apyIncrease: number;
    /** Risk change */
    riskChange: number;
    /** Potential additional yield */
    additionalYield: number;
  };
  /** Actions to take */
  actions: OptimizationAction[];
  /** Strategy type */
  strategyType: 'diversify' | 'concentrate' | 'rebalance' | 'extend_lockup' | 'compound';
  /** Timestamp of recommendation */
  timestamp: number;
}

/** Individual optimization action */
export interface OptimizationAction {
  /** Action type */
  type: 'stake' | 'unstake' | 'restake' | 'compound';
  /** Asset code */
  assetCode: string;
  /** Amount to move */
  amount: string;
  /** Target asset (for rebalancing) */
  targetAsset?: string;
  /** New lockup period (for extending) */
  newLockupPeriod?: number;
}

/** Yield projection scenario */
export interface YieldProjection {
  /** Scenario name */
  scenario: string;
  /** Initial investment amount */
  initialAmount: number;
  /** Projection period in days */
  projectionDays: number;
  /** Expected APY */
  apy: number;
  /** Compounding frequency */
  compoundingFrequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  /** Projected values over time */
  projectionData: ProjectionDataPoint[];
  /** Final projected value */
  finalValue: number;
  /** Total rewards earned */
  totalRewards: number;
}

/** Projection data point */
export interface ProjectionDataPoint {
  day: number;
  value: number;
  rewards: number;
  apy: number;
}

/** Asset allocation for comparison */
export interface AssetAllocation {
  /** Asset code */
  code: string;
  /** Percentage of total portfolio */
  percentage: number;
  /** Absolute value */
  value: number;
  /** APY for this asset */
  apy: number;
  /** Risk score */
  riskScore: number;
}

/** Comparison view data */
export interface ComparisonData {
  /** Current allocation */
  current: AssetAllocation[];
  /** Recommended allocation */
  recommended: AssetAllocation[];
  /** Difference metrics */
  metrics: {
    apyDifference: number;
    riskDifference: number;
    diversificationScore: number;
  };
}

/** Staking asset metadata */
export interface StakingAssetInfo {
  code: string;
  issuer: string;
  name: string;
  /** Minimum staking amount */
  minStake: string;
  /** Maximum staking amount */
  maxStake: string;
  /** Available APY tiers based on lockup */
  apyTiers: ApyTier[];
  /** Total staked by all users */
  totalStaked: string;
  /** Available for staking */
  availableBalance: string;
  /** Asset icon/logo URL */
  icon?: string;
}

/** APY tier based on lockup period */
export interface ApyTier {
  /** Lockup period in days */
  lockupDays: number;
  /** APY for this tier */
  apy: number;
  /** Minimum stake for this tier */
  minStake?: string;
}

/** Staking statistics */
export interface StakingStats {
  /** Total value locked */
  totalValueLocked: number;
  /** Number of active stakers */
  activeStakers: number;
  /** Average APY across all assets */
  averageApy: number;
  /** Top performing asset */
  topPerformer: {
    code: string;
    apy: number;
  };
  /** Total rewards distributed */
  totalRewardsDistributed: number;
}

/** ─── Emergency unstaking (issue #10) ──────────────────────────────────────── */

/** Result of evaluating an emergency withdrawal against the penalty schedule */
export interface EmergencyUnstakeQuote {
  positionId: string;
  assetCode: string;
  /** Amount the user wants out, in asset units */
  requestedAmount: number;
  /** Current penalty percentage (0–100) applied to the withdrawn amount */
  penaltyRate: number;
  /** Value forfeited, in base currency */
  penaltyAmount: number;
  /** requestedAmount value minus penalty, in base currency */
  netProceeds: number;
  /** Value of the requested amount at current price, in base currency */
  grossValue: number;
  /** Days remaining until the lock-up ends and penalties disappear */
  daysUntilUnlock: number;
  quoteTimestamp: number;
}

/** A completed or in-flight emergency unstake, for history display */
export interface EmergencyUnstakeRecord {
  id: string;
  positionId: string;
  assetCode: string;
  amount: string;
  penaltyAmount: string;
  netAmount: string;
  status: 'pending' | 'completed' | 'failed';
  txHash?: string;
  timestamp: number;
}
