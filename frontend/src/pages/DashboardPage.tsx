import { Box, HStack, SimpleGrid, Stack, Text } from '@chakra-ui/react';
import { GlassCard } from '../components/ui/GlassCard';
import { GradientButton } from '../components/ui/GradientButton';
import { RoosterMascot } from '../components/ui/RoosterMascot';
import { TextReveal } from '../components/ui/TextReveal';
import { PageWrapper } from '../components/layout/PageWrapper';
import { SubmissionStatusWidget } from '../components/dashboard/SubmissionStatusWidget';
import { ScoreTrendChart } from '../components/dashboard/ScoreTrendChart';
import { RecentRoastsList } from '../components/dashboard/RecentRoastsList';
import { useDashboard } from '../hooks/useDashboard';

function formatAverageScore(averageScore: number | null): string {
  return averageScore === null ? '—' : averageScore.toFixed(1);
}

function roastMeter(averageScore: number | null): string {
  if (averageScore === null) return 'No roasts yet — the rooster is sharpening its beak.';
  if (averageScore >= 80) return 'The rooster approves. Suspiciously.';
  if (averageScore >= 50) return 'Mid. The rooster has seen better, has seen worse.';
  return 'The rooster is composing a strongly worded clucking.';
}

export default function DashboardPage() {
  const { summary, isLoading, error, refetch } = useDashboard();

  return (
    <PageWrapper>
      <Box p={8}>
        <HStack mb={2} gap={3}>
          <RoosterMascot size={48} />
          <TextReveal size="2xl">Dashboard</TextReveal>
        </HStack>
        <Text color="fg.muted" mb={6}>
          {roastMeter(summary?.averageScore ?? null)}
        </Text>

        {isLoading && <Text>Loading dashboard...</Text>}

        {error && (
          <GlassCard mb={6}>
            <Text color="red.500" mb={3}>
              {error}
            </Text>
            <GradientButton type="button" onClick={refetch}>
              Retry
            </GradientButton>
          </GlassCard>
        )}

        {!isLoading && !error && summary && (
          <Stack gap={6}>
            <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
              <GlassCard>
                <Text fontWeight="semibold">Total Assignments</Text>
                <Text fontSize="3xl">{summary.totalAssignments}</Text>
              </GlassCard>
              <GlassCard>
                <Text fontWeight="semibold">Average Score</Text>
                <Text fontSize="3xl">{formatAverageScore(summary.averageScore)}</Text>
              </GlassCard>
              <GlassCard>
                <Text fontWeight="semibold">Roasts Received</Text>
                <Text fontSize="3xl">{summary.recentRoasts.length}</Text>
              </GlassCard>
            </SimpleGrid>

            {summary.totalAssignments === 0 ? (
              <GlassCard>
                <HStack gap={4}>
                  <RoosterMascot size={64} animated />
                  <Box>
                    <Text mb={2} fontWeight="semibold">
                      It's awfully quiet in here
                    </Text>
                    <Text color="fg.muted">
                      Submit your first assignment and let the rooster have at it.
                    </Text>
                  </Box>
                </HStack>
              </GlassCard>
            ) : (
              <>
                <SubmissionStatusWidget byStatus={summary.byStatus} />
                <ScoreTrendChart scoreTrend={summary.scoreTrend} />
                <RecentRoastsList recentRoasts={summary.recentRoasts} />
              </>
            )}
          </Stack>
        )}
      </Box>
    </PageWrapper>
  );
}
