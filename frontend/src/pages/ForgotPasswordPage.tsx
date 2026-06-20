import { Center, Stack, Text } from '@chakra-ui/react';
import { type FormEvent, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { MeshBackground } from '../components/layout/MeshBackground';
import { PageWrapper } from '../components/layout/PageWrapper';
import { AnimatedInput } from '../components/ui/AnimatedInput';
import { GlassCard } from '../components/ui/GlassCard';
import { GradientButton } from '../components/ui/GradientButton';
import { TextReveal } from '../components/ui/TextReveal';

/**
 * UI scaffold only — there is no backend "forgot password" endpoint yet.
 * Submitting shows a generic confirmation message without calling the API.
 */
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <PageWrapper>
      <MeshBackground />
      <Center minH="100vh" p={4}>
        <GlassCard maxW="md" w="full">
          <Stack gap={4}>
            <TextReveal size="xl">Reset your password</TextReveal>
            {submitted ? (
              <Text color="fg.muted">
                If an account exists for that email, a reset link is on its way.
              </Text>
            ) : (
              <>
                <Text color="fg.muted">
                  Enter your account email and we&apos;ll send you a link to reset your password.
                </Text>
                <form onSubmit={handleSubmit} noValidate>
                  <Stack gap={4}>
                    <AnimatedInput
                      type="email"
                      label="Email"
                      placeholder="you@example.com"
                      autoComplete="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                    />
                    <GradientButton type="submit" w="full">
                      Send reset link
                    </GradientButton>
                  </Stack>
                </form>
              </>
            )}
            <Text fontSize="sm" textAlign="center">
              <RouterLink to="/login">Back to log in</RouterLink>
            </Text>
          </Stack>
        </GlassCard>
      </Center>
    </PageWrapper>
  );
}
