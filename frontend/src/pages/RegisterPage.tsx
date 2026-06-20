import { Box, Center, Separator, Stack, Text } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { GoogleLoginButton } from '../components/auth/GoogleLoginButton';
import { RegisterForm } from '../components/auth/RegisterForm';
import { MeshBackground } from '../components/layout/MeshBackground';
import { PageWrapper } from '../components/layout/PageWrapper';
import { GlassCard } from '../components/ui/GlassCard';
import { RoosterMascot } from '../components/ui/RoosterMascot';
import { TextReveal } from '../components/ui/TextReveal';

export default function RegisterPage() {
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
              Join the henhouse
            </TextReveal>
            <Text color="fg.muted" textAlign="center">
              Sign up and let our rooster judge your code with brutal, loving honesty.
            </Text>
            <RegisterForm />
            <Separator />
            <GoogleLoginButton />
            <Text fontSize="sm" textAlign="center">
              Already have an account? <RouterLink to="/login">Log in</RouterLink>
            </Text>
          </Stack>
        </GlassCard>
      </Center>
    </PageWrapper>
  );
}
