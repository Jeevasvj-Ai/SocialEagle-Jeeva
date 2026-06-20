// Auth API wrapper functions. Centralizes the snake_case (backend) <->
// camelCase (frontend) mapping so the rest of the app only ever deals with
// the camelCase `User`/`AuthTokens` shapes from `types/index.ts`.
import api, { tokenStorage } from './api';
import type { AuthTokens, LoginPayload, RegisterPayload, UpdateUserPayload, User, UserRole } from '../types';

interface BackendUser {
  id: number;
  email: string;
  full_name: string | null;
  is_active: boolean;
  is_verified: boolean;
  oauth_provider: string | null;
  role: UserRole;
  created_at?: string;
}

interface BackendTokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

function toUser(backendUser: BackendUser): User {
  return {
    id: backendUser.id,
    email: backendUser.email,
    fullName: backendUser.full_name,
    role: backendUser.role,
    avatarUrl: null,
    createdAt: backendUser.created_at ?? new Date().toISOString(),
  };
}

function toTokens(response: BackendTokenResponse): AuthTokens {
  return {
    accessToken: response.access_token,
    refreshToken: response.refresh_token,
  };
}

export async function register(payload: RegisterPayload): Promise<User> {
  const { data } = await api.post<BackendUser>('/auth/register', {
    email: payload.email,
    password: payload.password,
    full_name: payload.fullName,
  });
  return toUser(data);
}

export async function login(payload: LoginPayload): Promise<AuthTokens> {
  const { data } = await api.post<BackendTokenResponse>('/auth/login', {
    email: payload.email,
    password: payload.password,
  });
  return toTokens(data);
}

export async function refresh(refreshToken: string): Promise<AuthTokens> {
  const { data } = await api.post<BackendTokenResponse>('/auth/refresh', {
    refresh_token: refreshToken,
  });
  return toTokens(data);
}

export async function logout(): Promise<void> {
  try {
    const refreshToken = tokenStorage.getRefreshToken();
    if (refreshToken) {
      await api.post('/auth/logout', { refresh_token: refreshToken });
    }
  } finally {
    tokenStorage.clear();
  }
}

export async function getMe(): Promise<User> {
  const { data } = await api.get<BackendUser>('/auth/me');
  return toUser(data);
}

export async function updateMe(payload: UpdateUserPayload): Promise<User> {
  const { data } = await api.put<BackendUser>('/auth/me', {
    full_name: payload.fullName,
  });
  return toUser(data);
}

export function getGoogleLoginUrl(): string {
  return `${api.defaults.baseURL}/auth/google`;
}
