// Shared TypeScript interfaces for Assignment Roaster frontend.
// NOTE: `any` is forbidden by project rules — use `unknown` + narrowing instead.

export type UserRole = 'student' | 'admin';

export interface User {
  id: number;
  email: string;
  fullName: string | null;
  role: UserRole;
  avatarUrl: string | null;
  createdAt: string;
}

export type AssignmentStatus = 'draft' | 'submitted' | 'reviewed';
export type AssignmentSourceType = 'file' | 'repo_link';

export interface Assignment {
  id: number;
  studentId: number;
  title: string;
  description: string | null;
  language: string;
  sourceType: AssignmentSourceType;
  sourceUrlOrPath: string;
  dueDate: string | null;
  status: AssignmentStatus;
  createdAt: string;
  updatedAt: string | null;
}

export interface AssignmentCreatePayload {
  title: string;
  description?: string | null;
  language: string;
  sourceType: AssignmentSourceType;
  sourceUrlOrPath: string;
  dueDate?: string | null;
}

export type AssignmentUpdatePayload = Partial<AssignmentCreatePayload>;

export interface AssignmentFormValues {
  title: string;
  description: string;
  language: string;
  sourceType: AssignmentSourceType;
  sourceUrlOrPath: string;
  dueDate: string;
}

export type RoastSeverity = 'low' | 'medium' | 'high';

export interface Roast {
  id: number;
  assignmentId: number;
  score: number;
  feedbackText: string;
  severity: RoastSeverity;
  categories: string[];
  generatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  fullName: string;
}

export interface UpdateUserPayload {
  fullName?: string;
  email?: string;
}

export interface ApiErrorResponse {
  detail: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface RecentRoastSummary {
  id: number;
  assignmentId: number;
  assignmentTitle: string;
  score: number;
  severity: RoastSeverity;
  generatedAt: string;
}

export interface ScoreTrendPoint {
  generatedAt: string;
  score: number;
}

export interface DashboardSummary {
  totalAssignments: number;
  byStatus: Record<string, number>;
  averageScore: number | null;
  recentRoasts: RecentRoastSummary[];
  scoreTrend: ScoreTrendPoint[];
}
