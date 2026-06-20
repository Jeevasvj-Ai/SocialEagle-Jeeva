import { Badge, Box, chakra, Text } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { GlassCard } from '../ui/GlassCard';
import { AnimatedList } from '../ui/AnimatedList';
import { TextReveal } from '../ui/TextReveal';
import type { RecentRoastSummary, RoastSeverity } from '../../types';

const RoastLink = chakra(RouterLink);

interface RecentRoastsListProps {
  recentRoasts: RecentRoastSummary[];
}

const SEVERITY_COLOR_PALETTE: Record<RoastSeverity, string> = {
  low: 'green',
  medium: 'orange',
  high: 'red',
};

const SEVERITY_LABEL: Record<RoastSeverity, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

function formatDateTime(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    return isoDate;
  }
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

/**
 * Recent roasts feed: assignment title, score, a severity badge, and a
 * link through to the roast detail page, per skills/FRONTEND.md
 * ("Lists of items -> AnimatedList").
 */
export function RecentRoastsList({ recentRoasts }: RecentRoastsListProps) {
  return (
    <GlassCard>
      <TextReveal size="lg" mb={4}>
        Recent Roasts
      </TextReveal>

      {recentRoasts.length === 0 ? (
        <Text color="fg.muted">No roasts generated yet.</Text>
      ) : (
        <AnimatedList>
          {recentRoasts.map((roast) => (
            <RoastLink
              key={roast.id}
              to={`/assignments/${roast.assignmentId}/roast`}
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              p={3}
              borderRadius="lg"
              _hover={{ bg: 'bg.muted' }}
            >
              <Box>
                <Text fontWeight="semibold">{roast.assignmentTitle}</Text>
                <Text fontSize="xs" color="fg.muted">
                  {formatDateTime(roast.generatedAt)}
                </Text>
              </Box>
              <Box display="flex" alignItems="center" gap={3}>
                <Text fontWeight="bold" fontSize="lg">
                  {roast.score}
                </Text>
                <Badge colorPalette={SEVERITY_COLOR_PALETTE[roast.severity]} borderRadius="full" px={3} py={1}>
                  {SEVERITY_LABEL[roast.severity]}
                </Badge>
              </Box>
            </RoastLink>
          ))}
        </AnimatedList>
      )}
    </GlassCard>
  );
}
