import { Box, SimpleGrid, Stack, Text } from '@chakra-ui/react';
import { GlassCard } from '../components/ui/GlassCard';
import { GradientButton } from '../components/ui/GradientButton';
import { TextReveal } from '../components/ui/TextReveal';
import { PageWrapper } from '../components/layout/PageWrapper';
import { SubmissionStatusWidget } from '../components/dashboard/SubmissionStatusWidget';
import { ScoreTrendChart } from '../components/dashboard/ScoreTrendChart';
import { RecentRoastsList } from '../components/dashboard/RecentRoastsList';
import { useDashboard } from '../hooks/useDashboard';

function formatAverageScore(averageScore: number | null): string {
  return averageScore === null ? '—' : averageScore.toFixed(1);
}

export default function DashboardPage() {
  const { summary, isLoading, error, refetch } = useDashboard();

  return (
    <PageWrapper>
      <Box p={8}>
        <TextReveal size="2xl" mb={6}>
          Dashboard
        </TextReveal>

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
                <Text mb={2} fontWeight="semibold">
                  No assignments yet
                </Text>
                <Text color="fg.muted">Submit your first assignment to start getting roasted.</Text>
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
