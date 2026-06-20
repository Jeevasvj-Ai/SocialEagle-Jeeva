// Assignments API wrapper functions. Centralizes the snake_case (backend) <->
// camelCase (frontend) mapping so the rest of the app only ever deals with
// the camelCase `Assignment` shape from `types/index.ts` (mirrors the
// pattern established in `authService.ts`).
import api from './api';
import type {
  Assignment,
  AssignmentCreatePayload,
  AssignmentFormValues,
  AssignmentSourceType,
  AssignmentStatus,
  AssignmentUpdatePayload,
} from '../types';

interface BackendAssignment {
  id: number;
  student_id: number;
  title: string;
  description: string | null;
  language: string;
  source_type: AssignmentSourceType;
  source_url_or_path: string;
  due_date: string | null;
  status: AssignmentStatus;
  created_at: string;
  updated_at: string | null;
}

interface BackendAssignmentListResponse {
  total: number;
  items: BackendAssignment[];
}

function toAssignment(backendAssignment: BackendAssignment): Assignment {
  return {
    id: backendAssignment.id,
    studentId: backendAssignment.student_id,
    title: backendAssignment.title,
    description: backendAssignment.description,
    language: backendAssignment.language,
    sourceType: backendAssignment.source_type,
    sourceUrlOrPath: backendAssignment.source_url_or_path,
    dueDate: backendAssignment.due_date,
    status: backendAssignment.status,
    createdAt: backendAssignment.created_at,
    updatedAt: backendAssignment.updated_at,
  };
}

export async function listAssignments(): Promise<Assignment[]> {
  const { data } = await api.get<BackendAssignmentListResponse>('/assignments');
  return data.items.map(toAssignment);
}

export async function getAssignment(id: number): Promise<Assignment> {
  const { data } = await api.get<BackendAssignment>(`/assignments/${id}`);
  return toAssignment(data);
}

export async function createAssignment(payload: AssignmentCreatePayload): Promise<Assignment> {
  const { data } = await api.post<BackendAssignment>('/assignments', {
    title: payload.title,
    description: payload.description ?? null,
    language: payload.language,
    source_type: payload.sourceType,
    source_url_or_path: payload.sourceUrlOrPath,
    due_date: payload.dueDate ?? null,
  });
  return toAssignment(data);
}

export async function updateAssignment(id: number, payload: AssignmentUpdatePayload): Promise<Assignment> {
  const { data } = await api.put<BackendAssignment>(`/assignments/${id}`, {
    title: payload.title,
    description: payload.description,
    language: payload.language,
    source_type: payload.sourceType,
    source_url_or_path: payload.sourceUrlOrPath,
    due_date: payload.dueDate,
  });
  return toAssignment(data);
}

export async function deleteAssignment(id: number): Promise<void> {
  await api.delete(`/assignments/${id}`);
}

export async function submitAssignment(id: number): Promise<Assignment> {
  const { data } = await api.post<BackendAssignment>(`/assignments/${id}/submit`);
  return toAssignment(data);
}

export async function resubmitAssignment(id: number, sourceUrlOrPath: string): Promise<Assignment> {
  const { data } = await api.post<BackendAssignment>(`/assignments/${id}/resubmit`, {
    source_url_or_path: sourceUrlOrPath,
  });
  return toAssignment(data);
}

/** Maps an `Assignment` to the editable field shape used by `AssignmentForm`. */
export function assignmentToFormValues(assignment: Assignment): AssignmentFormValues {
  return {
    title: assignment.title,
    description: assignment.description ?? '',
    language: assignment.language,
    sourceType: assignment.sourceType,
    sourceUrlOrPath: assignment.sourceUrlOrPath,
    dueDate: assignment.dueDate ?? '',
  };
}
