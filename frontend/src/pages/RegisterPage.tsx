import { Center, Separator, Stack, Text } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { GoogleLoginButton } from '../components/auth/GoogleLoginButton';
import { RegisterForm } from '../components/auth/RegisterForm';
import { MeshBackground } from '../components/layout/MeshBackground';
import { PageWrapper } from '../components/layout/PageWrapper';
import { GlassCard } from '../components/ui/GlassCard';
import { TextReveal } from '../components/ui/TextReveal';

export default function RegisterPage() {
  return (
    <PageWrapper>
      <MeshBackground />
      <Center minH="100vh" p={4}>
        <GlassCard maxW="md" w="full">
          <Stack gap={4}>
            <TextReveal size="xl">Create your account</TextReveal>
            <Text color="fg.muted">Start getting roasted feedback on your assignments.</Text>
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
