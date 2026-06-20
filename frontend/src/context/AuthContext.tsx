import { useEffect, useState, type ReactNode } from 'react';
import * as authService from '../services/authService';
import { setOnAuthFailure, tokenStorage } from '../services/api';
import type { LoginPayload, RegisterPayload, UpdateUserPayload, User } from '../types';
import { AuthContext } from './AuthContextBase';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  // Only block on a session check if there's actually a token to verify.
  const [isLoading, setIsLoading] = useState(() => tokenStorage.getAccessToken() !== null);

  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
    }
  };

  useEffect(() => {
    setOnAuthFailure(() => setUser(null));

    const token = tokenStorage.getAccessToken();
    if (!token) {
      return;
    }

    authService
      .getMe()
      .then((me) => setUser(me))
      .catch(() => {
        tokenStorage.clear();
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (payload: LoginPayload): Promise<void> => {
    const tokens = await authService.login(payload);
    tokenStorage.setTokens(tokens);
    const me = await authService.getMe();
    setUser(me);
  };

  const register = async (payload: RegisterPayload): Promise<void> => {
    await authService.register(payload);
    await login({ email: payload.email, password: payload.password });
  };

  const refresh = async (): Promise<void> => {
    const refreshToken = tokenStorage.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    const tokens = await authService.refresh(refreshToken);
    tokenStorage.setTokens(tokens);
  };

  const updateProfile = async (payload: UpdateUserPayload): Promise<void> => {
    const updated = await authService.updateMe(payload);
    setUser(updated);
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, isAuthenticated: user !== null, login, register, logout, refresh, updateProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}
