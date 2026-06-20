// Dashboard API wrapper. Centralizes the snake_case (backend) <->
// camelCase (frontend) mapping so the rest of the app only ever deals with
// the camelCase `DashboardSummary` shape from `types/index.ts`.
import api from './api';
import type { DashboardSummary, RoastSeverity } from '../types';

interface BackendRecentRoast {
  id: number;
  assignment_id: number;
  assignment_title: string;
  score: number;
  severity: RoastSeverity;
  generated_at: string;
}

interface BackendScoreTrendPoint {
  generated_at: string;
  score: number;
}

interface BackendDashboardSummary {
  total_assignments: number;
  by_status: Record<string, number>;
  average_score: number | null;
  recent_roasts: BackendRecentRoast[];
  score_trend: BackendScoreTrendPoint[];
}

function toDashboardSummary(backend: BackendDashboardSummary): DashboardSummary {
  return {
    totalAssignments: backend.total_assignments,
    byStatus: backend.by_status,
    averageScore: backend.average_score,
    recentRoasts: backend.recent_roasts.map((roast) => ({
      id: roast.id,
      assignmentId: roast.assignment_id,
      assignmentTitle: roast.assignment_title,
      score: roast.score,
      severity: roast.severity,
      generatedAt: roast.generated_at,
    })),
    scoreTrend: backend.score_trend.map((point) => ({
      generatedAt: point.generated_at,
      score: point.score,
    })),
  };
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const { data } = await api.get<BackendDashboardSummary>('/dashboard/summary');
  return toDashboardSummary(data);
}
