'use client';

import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { EmergencyUnstakeRecord } from '@/types/staking';

interface UnstakeHistoryProps {
  records: EmergencyUnstakeRecord[];
  pageSize?: number;
}

const STATUS_STYLES: Record<EmergencyUnstakeRecord['status'], string> = {
  completed:
    'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
  pending: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  failed: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
};

/**
 * Paginated, filterable table of past emergency unstakes with per-record
 * status badges and (truncated) transaction hashes.
 */
export const UnstakeHistory: React.FC<UnstakeHistoryProps> = ({
  records,
  pageSize = 5,
}) => {
  const [statusFilter, setStatusFilter] = useState<'all' | EmergencyUnstakeRecord['status']>('all');
  const [page, setPage] = useState(0);

  const filtered = useMemo(
    () =>
      statusFilter === 'all'
        ? records
        : records.filter((r) => r.status === statusFilter),
    [records, statusFilter]
  );

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, pageCount - 1);
  const visible = filtered.slice(safePage * pageSize, (safePage + 1) * pageSize);

  return (
    <div data-testid="unstake-history">
      {/* Filter */}
      <div className="mb-3 flex items-center gap-2">
        <label htmlFor="eu-status-filter" className="text-sm text-gray-500 dark:text-gray-400">
          Status:
        </label>
        <select
          id="eu-status-filter"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as typeof statusFilter);
            setPage(0);
          }}
          className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm px-2 py-1"
        >
          <option value="all">All</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {visible.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
          No emergency unstakes found.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800 text-left">
              <tr>
                <Th>Date</Th>
                <Th>Asset</Th>
                <Th>Amount</Th>
                <Th>Penalty</Th>
                <Th>Net</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {visible.map((r) => (
                <tr key={r.id}>
                  <Td>{new Date(r.timestamp).toLocaleDateString()}</Td>
                  <Td>{r.assetCode}</Td>
                  <Td>{Number(r.amount).toLocaleString()}</Td>
                  <Td className="text-red-600 dark:text-red-400">
                    −{Number(r.penaltyAmount).toLocaleString()}
                  </Td>
                  <Td className="font-medium">
                    {Number(r.netAmount).toLocaleString()}
                  </Td>
                  <Td>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[r.status]}`}
                    >
                      {r.status}
                    </span>
                    {r.txHash && (
                      <span
                        className="ml-2 hidden md:inline text-xs text-gray-400"
                        title={r.txHash}
                      >
                        {r.txHash.slice(0, 8)}…
                      </span>
                    )}
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {pageCount > 1 && (
        <div className="mt-3 flex items-center justify-end gap-2">
          <button
            aria-label="Previous page"
            disabled={safePage === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            className="p-1.5 rounded border border-gray-300 dark:border-gray-600 disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Page {safePage + 1} of {pageCount}
          </span>
          <button
            aria-label="Next page"
            disabled={safePage >= pageCount - 1}
            onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
            className="p-1.5 rounded border border-gray-300 dark:border-gray-600 disabled:opacity-40"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

const Th: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <th className="px-3 py-2 font-medium text-gray-500 dark:text-gray-400">
    {children}
  </th>
);

const Td: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => <td className={`px-3 py-2 ${className}`}>{children}</td>;
