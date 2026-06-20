import { Box, Text } from '@chakra-ui/react';
import { RoastHistoryList } from '../components/roasts/RoastHistoryList';
import { GlassCard } from '../components/ui/GlassCard';
import { TextReveal } from '../components/ui/TextReveal';
import { PageWrapper } from '../components/layout/PageWrapper';
import { useRoastHistory } from '../hooks/useRoasts';

export default function RoastsPage() {
  const { roasts, isLoading, error } = useRoastHistory();

  return (
    <PageWrapper>
      <Box p={8}>
        <TextReveal size="2xl" mb={6}>
          All Roasts
        </TextReveal>

        {isLoading && (
          <GlassCard>
            <Text>Loading roasts...</Text>
          </GlassCard>
        )}

        {error && !isLoading && (
          <GlassCard>
            <Text color="roast.savage">{error}</Text>
          </GlassCard>
        )}

        {!isLoading && !error && roasts.length === 0 && (
          <GlassCard>
            <Text>No roasts yet.</Text>
          </GlassCard>
        )}

        {!isLoading && !error && roasts.length > 0 && <RoastHistoryList roasts={roasts} />}
      </Box>
    </PageWrapper>
  );
}
