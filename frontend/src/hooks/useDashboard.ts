import { useCallback, useEffect, useState } from 'react';
import { getDashboardSummary } from '../services/dashboardService';
import type { DashboardSummary } from '../types';

interface UseDashboardResult {
  summary: DashboardSummary | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

type DashboardStatus =
  | { kind: 'loading' }
  | { kind: 'success'; summary: DashboardSummary }
  | { kind: 'error'; message: string };

/**
 * Fetches the current user's dashboard summary. Follows the same
 * request-id race-safe pattern as `useAssignments` — each fetch attempt is
 * keyed by a `requestId` so a slow, stale request can never clobber the
 * result of a newer one.
 */
export function useDashboard(): UseDashboardResult {
  const [attempt, setAttempt] = useState(0);
  const requestId = `${attempt}`;

  const [resolved, setResolved] = useState<{ requestId: string; status: DashboardStatus }>({
    requestId: '',
    status: { kind: 'loading' },
  });

  const refetch = useCallback(() => setAttempt((prev) => prev + 1), []);

  useEffect(() => {
    let isMounted = true;

    getDashboardSummary()
      .then((summary) => {
        if (isMounted) {
          setResolved({ requestId, status: { kind: 'success', summary } });
        }
      })
      .catch(() => {
        if (isMounted) {
          setResolved({ requestId, status: { kind: 'error', message: 'Failed to load dashboard summary.' } });
        }
      });

    return () => {
      isMounted = false;
    };
  }, [requestId]);

  const status: DashboardStatus = resolved.requestId === requestId ? resolved.status : { kind: 'loading' };

  return {
    summary: status.kind === 'success' ? status.summary : null,
    isLoading: status.kind === 'loading',
    error: status.kind === 'error' ? status.message : null,
    refetch,
  };
}
