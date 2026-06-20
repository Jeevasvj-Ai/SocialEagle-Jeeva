import { useCallback, useEffect, useState } from 'react';
import { getRoastForAssignment, listRoasts, triggerRoast } from '../services/roastService';
import type { Roast } from '../types';

interface UseRoastForAssignmentResult {
  roast: Roast | null;
  isLoading: boolean;
  error: string | null;
  isGenerating: boolean;
  generateError: string | null;
  generate: () => Promise<void>;
  refetch: () => void;
}

type RoastStatus =
  | { kind: 'loading' }
  | { kind: 'success'; roast: Roast | null }
  | { kind: 'error'; message: string };

/**
 * Fetches the latest roast for a given assignment, with a `generate` action
 * to trigger roast creation when none exists yet.
 *
 * Follows the request-id race-condition-safe pattern from useAssignments:
 * the fetch is keyed by `requestId` (assignmentId + refetch attempt) so each
 * new request maps to exactly one effect run, and "loading" is derived by
 * comparing the in-flight request id to the last *resolved* one.
 */
export function useRoastForAssignment(assignmentId: number | undefined): UseRoastForAssignmentResult {
  const [attempt, setAttempt] = useState(0);
  const requestId = `${assignmentId ?? 'none'}:${attempt}`;

  const [resolved, setResolved] = useState<{ requestId: string; status: RoastStatus }>({
    requestId: '',
    status: { kind: 'loading' },
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  const refetch = useCallback(() => setAttempt((prev) => prev + 1), []);

  useEffect(() => {
    if (assignmentId === undefined) {
      return;
    }

    let isMounted = true;

    getRoastForAssignment(assignmentId)
      .then((roast) => {
        if (isMounted) {
          setResolved({ requestId, status: { kind: 'success', roast } });
        }
      })
      .catch(() => {
        if (isMounted) {
          setResolved({ requestId, status: { kind: 'error', message: 'Failed to load roast.' } });
        }
      });

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- requestId already encodes assignmentId+attempt
  }, [requestId, assignmentId]);

  const status: RoastStatus =
    assignmentId === undefined
      ? { kind: 'success', roast: null }
      : resolved.requestId === requestId
        ? resolved.status
        : { kind: 'loading' };

  const generate = useCallback(async () => {
    if (assignmentId === undefined) {
      return;
    }
    setIsGenerating(true);
    setGenerateError(null);
    try {
      await triggerRoast(assignmentId);
      refetch();
    } catch {
      setGenerateError('Failed to generate roast. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  }, [assignmentId, refetch]);

  return {
    roast: status.kind === 'success' ? status.roast : null,
    isLoading: status.kind === 'loading',
    error: status.kind === 'error' ? status.message : null,
    isGenerating,
    generateError,
    generate,
    refetch,
  };
}

interface UseRoastHistoryResult {
  roasts: Roast[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

type RoastHistoryStatus =
  | { kind: 'loading' }
  | { kind: 'success'; roasts: Roast[] }
  | { kind: 'error'; message: string };

/** Fetches the current user's full roast history. */
export function useRoastHistory(): UseRoastHistoryResult {
  const [attempt, setAttempt] = useState(0);
  const requestId = `${attempt}`;

  const [resolved, setResolved] = useState<{ requestId: string; status: RoastHistoryStatus }>({
    requestId: '',
    status: { kind: 'loading' },
  });

  const refetch = useCallback(() => setAttempt((prev) => prev + 1), []);

  useEffect(() => {
    let isMounted = true;

    listRoasts()
      .then((roasts) => {
        if (isMounted) {
          setResolved({ requestId, status: { kind: 'success', roasts } });
        }
      })
      .catch(() => {
        if (isMounted) {
          setResolved({ requestId, status: { kind: 'error', message: 'Failed to load roast history.' } });
        }
      });

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- requestId already encodes attempt
  }, [requestId]);

  const status: RoastHistoryStatus = resolved.requestId === requestId ? resolved.status : { kind: 'loading' };

  return {
    roasts: status.kind === 'success' ? status.roasts : [],
    isLoading: status.kind === 'loading',
    error: status.kind === 'error' ? status.message : null,
    refetch,
  };
}
