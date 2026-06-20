import { Center, Stack, Text } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { RoosterMascot } from '../components/ui/RoosterMascot';
import { TextReveal } from '../components/ui/TextReveal';
import { PageWrapper } from '../components/layout/PageWrapper';

export default function NotFoundPage() {
  return (
    <PageWrapper>
      <Center minH="100vh">
        <Stack gap={2} textAlign="center" align="center">
          <RoosterMascot size={96} animated />
          <TextReveal size="2xl">404 — Even the rooster can't find this one</TextReveal>
          <Text color="fg.muted">This page got roasted out of existence.</Text>
          <Text>
            <RouterLink to="/dashboard">Back to the coop</RouterLink>
          </Text>
        </Stack>
      </Center>
    </PageWrapper>
  );
}
