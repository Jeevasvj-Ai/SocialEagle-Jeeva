import { Badge, Box, HStack, Text } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { AnimatedList } from '../ui/AnimatedList';
import { GlassCard } from '../ui/GlassCard';
import type { Roast, RoastSeverity } from '../../types';

interface RoastHistoryListProps {
  roasts: Roast[];
  assignmentTitlesById?: Record<number, string>;
}

const COLOR_PALETTE_BY_SEVERITY: Record<RoastSeverity, string> = {
  low: 'green',
  medium: 'orange',
  high: 'red',
};

function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

/** Stagger-animated list of past roasts, each linking to its detail page. */
export function RoastHistoryList({ roasts, assignmentTitlesById }: RoastHistoryListProps) {
  return (
    <AnimatedList>
      {roasts.map((roast) => (
        <RouterLink key={roast.id} to={`/assignments/${roast.assignmentId}/roast`}>
          <GlassCard cursor="pointer">
            <HStack justify="space-between" align="flex-start">
              <Box>
                <Text fontWeight="semibold">
                  {assignmentTitlesById?.[roast.assignmentId] ?? `Assignment #${roast.assignmentId}`}
                </Text>
                <Text fontSize="sm" color="fg.muted">
                  {formatDate(roast.generatedAt)}
                </Text>
              </Box>
              <HStack>
                <Badge colorPalette={COLOR_PALETTE_BY_SEVERITY[roast.severity]} borderRadius="full" px={3} py={1}>
                  {roast.severity}
                </Badge>
                <Text fontWeight="bold" fontSize="lg">
                  {roast.score}
                </Text>
              </HStack>
            </HStack>
          </GlassCard>
        </RouterLink>
      ))}
    </AnimatedList>
  );
}
