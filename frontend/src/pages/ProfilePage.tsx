import { Box, Stack, Text } from '@chakra-ui/react';
import { type FormEvent, useState } from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { AnimatedInput } from '../components/ui/AnimatedInput';
import { GradientButton } from '../components/ui/GradientButton';
import { TextReveal } from '../components/ui/TextReveal';
import { PageWrapper } from '../components/layout/PageWrapper';
import { useAuth } from '../hooks/useAuth';

function extractErrorMessage(error: unknown): string {
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof (error as { response?: { data?: { detail?: unknown } } }).response?.data?.detail === 'string'
  ) {
    return (error as { response: { data: { detail: string } } }).response.data.detail;
  }
  return 'Unable to update profile. Please try again.';
}

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName ?? '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setError(null);
    setSuccess(false);
    setIsSubmitting(true);
    try {
      await updateProfile({ fullName });
      setSuccess(true);
    } catch (submitError) {
      setError(extractErrorMessage(submitError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageWrapper>
      <Box p={8}>
        <TextReveal size="2xl" mb={6}>
          Profile
        </TextReveal>
        <GlassCard maxW="md">
          <Stack gap={4}>
            <Text color="fg.muted">{user?.email ?? 'No email on file'}</Text>
            <form onSubmit={handleSubmit} noValidate>
              <Stack gap={4}>
                <AnimatedInput
                  label="Full name"
                  placeholder="Ada Lovelace"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                />
                {error && (
                  <Text color="fg.error" fontSize="sm">
                    {error}
                  </Text>
                )}
                {success && (
                  <Text color="fg.success" fontSize="sm">
                    Profile updated.
                  </Text>
                )}
                <GradientButton type="submit" loading={isSubmitting} disabled={isSubmitting}>
                  Save changes
                </GradientButton>
              </Stack>
            </form>
          </Stack>
        </GlassCard>
      </Box>
    </PageWrapper>
  );
}
