import api from './api';
import type { Roast } from '../types';

interface RoastApiResponse {
  id: number;
  assignment_id: number;
  score: number;
  feedback_text: string;
  severity: Roast['severity'];
  categories: string[];
  generated_at: string;
}

interface RoastListApiResponse {
  total: number;
  items: RoastApiResponse[];
}

function toRoast(payload: RoastApiResponse): Roast {
  return {
    id: payload.id,
    assignmentId: payload.assignment_id,
    score: payload.score,
    feedbackText: payload.feedback_text,
    severity: payload.severity,
    categories: payload.categories,
    generatedAt: payload.generated_at,
  };
}

/** Trigger roast generation for an assignment. */
export async function triggerRoast(assignmentId: number): Promise<Roast> {
  const { data } = await api.post<RoastApiResponse>(`/assignments/${assignmentId}/roast`);
  return toRoast(data);
}

/** Fetch the latest roast for a given assignment, or null if none exists yet. */
export async function getRoastForAssignment(assignmentId: number): Promise<Roast | null> {
  try {
    const { data } = await api.get<RoastApiResponse>(`/assignments/${assignmentId}/roast`);
    return toRoast(data);
  } catch (error) {
    if (isNotFound(error)) {
      return null;
    }
    throw error;
  }
}

/** List the current user's roast history. */
export async function listRoasts(): Promise<Roast[]> {
  const { data } = await api.get<RoastListApiResponse>('/roasts');
  return data.items.map(toRoast);
}

/** Fetch a single roast by id. */
export async function getRoast(id: number): Promise<Roast> {
  const { data } = await api.get<RoastApiResponse>(`/roasts/${id}`);
  return toRoast(data);
}

function isNotFound(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    (error as { response?: { status?: number } }).response?.status === 404
  );
}
