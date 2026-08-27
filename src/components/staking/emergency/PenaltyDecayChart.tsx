'use client';

import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { StakedAsset } from '@/types/staking';
import {
  currentPenaltyRate,
  penaltyDecayCurve,
} from '@/utils/penalty';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler
);

interface PenaltyDecayChartProps {
  position: StakedAsset;
  /** Height class for the container (tailwind) */
  className?: string;
}

/**
 * Visualises how the emergency-withdrawal penalty decays from its maximum at
 * position open to zero at lock-up end. Marks "today" and the projected exit
 * point so users can see exactly what waiting N more days saves them.
 */
export const PenaltyDecayChart: React.FC<PenaltyDecayChartProps> = ({
  position,
  className = '',
}) => {
  const DAY_MS = 24 * 60 * 60 * 1000;
  const totalDays = Math.max(
    1,
    Math.round((position.lockupDate - position.startDate) / DAY_MS)
  );
  const todayDay = Math.max(
    0,
    Math.round((Date.now() - position.startDate) / DAY_MS)
  );
  const currentRate = currentPenaltyRate(
    position.startDate,
    position.lockupDate
  );

  // Sample the curve coarsely for long lockups to keep the DOM light.
  const stepDays = Math.max(1, Math.ceil(totalDays / 120));

  const { labels, data } = useMemo(() => {
    const points = penaltyDecayCurve(
      position.startDate,
      position.lockupDate,
      Date.now(),
      stepDays
    );
    return {
      labels: points.map((p) => String(p.day)),
      data: points.map((p) => Number(p.penaltyRate.toFixed(2))),
    };
  }, [position.startDate, position.lockupDate, stepDays]);

  const chartData = useMemo(
    () => ({
      labels,
      datasets: [
        {
          label: 'Penalty %',
          data,
          borderColor: '#f59e0b',
          backgroundColor: 'rgba(245, 158, 11, 0.15)',
          fill: true,
          tension: 0.3,
          pointRadius: 0,
          borderWidth: 2,
        },
      ],
    }),
    [labels, data]
  );

  const options = useMemo(
    () =>
      ({
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index' as const, intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              title: (items: Array<{ label: string }>) =>
                items.length ? `Day ${items[0].label}` : '',
              label: (item: { parsed: { y: number | null } }) =>
                `${(item.parsed.y ?? 0).toFixed(2)}% penalty`,
            },
          },
        },
        scales: {
          x: {
            title: { display: true, text: 'Days since staking' },
            ticks: { maxTicksLimit: 8 },
            grid: { display: false },
          },
          y: {
            beginAtZero: true,
            suggestedMax: 12,
            title: { display: true, text: 'Penalty %' },
          },
        },
      }) as const,
    []
  );

  return (
    <div className={className} data-testid="penalty-decay-chart">
      <Line data={chartData} options={options} aria-label="Penalty decay over time" />
      <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
        <span>
          Today: day {todayDay} of {totalDays}
        </span>
        <span className="font-medium text-amber-600 dark:text-amber-400">
          Current penalty: {currentRate.toFixed(2)}%
        </span>
        <span>Penalty reaches 0% at lock-up end</span>
      </div>
    </div>
  );
};
