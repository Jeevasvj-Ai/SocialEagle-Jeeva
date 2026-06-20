import { Center, Spinner, Stack, Text } from '@chakra-ui/react';
import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContextBase';
import { RoosterMascot } from '../ui/RoosterMascot';
import { AppHeader } from './AppHeader';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Center minH="100vh">
        <Stack align="center" gap={3}>
          <RoosterMascot size={64} animated />
          <Text color="fg.muted">Warming up the coop...</Text>
          <Spinner size="lg" color="brand.solid" />
        </Stack>
      </Center>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <AppHeader />
      {children}
    </>
  );
}
