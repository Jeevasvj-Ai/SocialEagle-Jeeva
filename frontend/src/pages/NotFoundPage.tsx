import { Center, Stack, Text } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { TextReveal } from '../components/ui/TextReveal';
import { PageWrapper } from '../components/layout/PageWrapper';

export default function NotFoundPage() {
  return (
    <PageWrapper>
      <Center minH="100vh">
        <Stack gap={2} textAlign="center">
          <TextReveal size="2xl">404 — Page Not Found</TextReveal>
          <Text>
            <RouterLink to="/dashboard">Back to dashboard</RouterLink>
          </Text>
        </Stack>
      </Center>
    </PageWrapper>
  );
}
