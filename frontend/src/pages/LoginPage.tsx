import { Box, Center, Separator, Stack, Text } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { GoogleLoginButton } from '../components/auth/GoogleLoginButton';
import { LoginForm } from '../components/auth/LoginForm';
import { MeshBackground } from '../components/layout/MeshBackground';
import { PageWrapper } from '../components/layout/PageWrapper';
import { GlassCard } from '../components/ui/GlassCard';
import { RoosterMascot } from '../components/ui/RoosterMascot';
import { TextReveal } from '../components/ui/TextReveal';

export default function LoginPage() {
  return (
    <PageWrapper>
      <MeshBackground />
      <Center minH="100vh" p={4}>
        <GlassCard maxW="md" w="full">
          <Stack gap={4}>
            <Box mx="auto">
              <RoosterMascot size={80} animated />
            </Box>
            <TextReveal size="xl" textAlign="center">
              Welcome back, code chef
            </TextReveal>
            <Text color="fg.muted" textAlign="center">
              Log in to see what the rooster has to say about your latest submission.
            </Text>
            <LoginForm />
            <Separator />
            <GoogleLoginButton />
            <Text fontSize="sm" textAlign="center">
              No account? <RouterLink to="/register">Register here</RouterLink>
            </Text>
            <Text fontSize="sm" textAlign="center">
              <RouterLink to="/forgot-password">Forgot password?</RouterLink>
            </Text>
          </Stack>
        </GlassCard>
      </Center>
    </PageWrapper>
  );
}
