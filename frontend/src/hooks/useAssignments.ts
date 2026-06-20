import { useCallback, useEffect, useState } from 'react';
import * as assignmentService from '../services/assignmentService';
import type { Assignment, AssignmentCreatePayload, AssignmentUpdatePayload } from '../types';

interface UseAssignmentsResult {
  assignments: Assignment[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

type AssignmentsStatus =
  | { kind: 'loading' }
  | { kind: 'success'; assignments: Assignment[] }
  | { kind: 'error'; message: string };

/**
 * Fetches the current user's assignments.
 *
 * The fetch is keyed by `requestId` (refetch attempt) so each new request
 * maps to exactly one effect run; the "loading" status is derived directly
 * from comparing the in-flight request id to the last *resolved* one,
 * rather than being set imperatively inside the effect.
 */
export function useAssignments(): UseAssignmentsResult {
  const [attempt, setAttempt] = useState(0);
  const requestId = `${attempt}`;

  const [resolved, setResolved] = useState<{ requestId: string; status: AssignmentsStatus }>({
    requestId: '',
    status: { kind: 'loading' },
  });

  const refetch = useCallback(() => setAttempt((prev) => prev + 1), []);

  useEffect(() => {
    let isMounted = true;

    assignmentService
      .listAssignments()
      .then((assignments) => {
        if (isMounted) {
          setResolved({ requestId, status: { kind: 'success', assignments } });
        }
      })
      .catch(() => {
        if (isMounted) {
          setResolved({ requestId, status: { kind: 'error', message: 'Failed to load assignments.' } });
        }
      });

    return () => {
      isMounted = false;
    };
  }, [requestId]);

  const status: AssignmentsStatus = resolved.requestId === requestId ? resolved.status : { kind: 'loading' };

  return {
    assignments: status.kind === 'success' ? status.assignments : [],
    isLoading: status.kind === 'loading',
    error: status.kind === 'error' ? status.message : null,
    refetch,
  };
}

interface UseAssignmentResult {
  assignment: Assignment | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

type AssignmentDetailStatus =
  | { kind: 'loading' }
  | { kind: 'success'; assignment: Assignment }
  | { kind: 'error'; message: string };

/**
 * Fetches a single assignment by id. Mirrors the request-id pattern from
 * `useAssignments` so stale responses (e.g. after navigating between
 * detail pages quickly) never clobber a newer one.
 */
export function useAssignment(id: number | undefined): UseAssignmentResult {
  const [attempt, setAttempt] = useState(0);
  const requestId = `${id ?? 'none'}:${attempt}`;

  const [resolved, setResolved] = useState<{ requestId: string; status: AssignmentDetailStatus }>({
    requestId: '',
    status: { kind: 'loading' },
  });

  const refetch = useCallback(() => setAttempt((prev) => prev + 1), []);

  useEffect(() => {
    if (id === undefined) {
      return;
    }

    let isMounted = true;

    assignmentService
      .getAssignment(id)
      .then((assignment) => {
        if (isMounted) {
          setResolved({ requestId, status: { kind: 'success', assignment } });
        }
      })
      .catch(() => {
        if (isMounted) {
          setResolved({ requestId, status: { kind: 'error', message: 'Failed to load assignment.' } });
        }
      });

    return () => {
      isMounted = false;
    };
  }, [requestId, id]);

  const status: AssignmentDetailStatus = resolved.requestId === requestId ? resolved.status : { kind: 'loading' };

  return {
    assignment: status.kind === 'success' ? status.assignment : null,
    isLoading: status.kind === 'loading',
    error: status.kind === 'error' ? status.message : null,
    refetch,
  };
}

interface UseAssignmentMutationsResult {
  isSubmitting: boolean;
  error: string | null;
  create: (payload: AssignmentCreatePayload) => Promise<Assignment>;
  update: (id: number, payload: AssignmentUpdatePayload) => Promise<Assignment>;
  remove: (id: number) => Promise<void>;
  submit: (id: number) => Promise<Assignment>;
  resubmit: (id: number, sourceUrlOrPath: string) => Promise<Assignment>;
}

/**
 * Write-side operations for assignments (create/update/delete/submit/resubmit).
 * Kept separate from the read hooks above so list/detail views don't need to
 * re-render on every mutation's in-flight state.
 */
export function useAssignmentMutations(): UseAssignmentMutationsResult {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async <T>(operation: () => Promise<T>, errorMessage: string): Promise<T> => {
    setIsSubmitting(true);
    setError(null);
    try {
      return await operation();
    } catch (caughtError) {
      setError(errorMessage);
      throw caughtError;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const create = useCallback(
    (payload: AssignmentCreatePayload) =>
      run(() => assignmentService.createAssignment(payload), 'Failed to create assignment.'),
    [run],
  );

  const update = useCallback(
    (id: number, payload: AssignmentUpdatePayload) =>
      run(() => assignmentService.updateAssignment(id, payload), 'Failed to update assignment.'),
    [run],
  );

  const remove = useCallback(
    (id: number) => run(() => assignmentService.deleteAssignment(id), 'Failed to delete assignment.'),
    [run],
  );

  const submit = useCallback(
    (id: number) => run(() => assignmentService.submitAssignment(id), 'Failed to submit assignment.'),
    [run],
  );

  const resubmit = useCallback(
    (id: number, sourceUrlOrPath: string) =>
      run(() => assignmentService.resubmitAssignment(id, sourceUrlOrPath), 'Failed to resubmit assignment.'),
    [run],
  );

  return { isSubmitting, error, create, update, remove, submit, resubmit };
}
