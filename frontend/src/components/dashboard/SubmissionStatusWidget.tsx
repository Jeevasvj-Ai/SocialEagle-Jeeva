import { Box, SimpleGrid, Text } from '@chakra-ui/react';
import { GlassCard } from '../ui/GlassCard';
import { TextReveal } from '../ui/TextReveal';
import type { AssignmentStatus } from '../../types';

interface SubmissionStatusWidgetProps {
  byStatus: Record<string, number>;
}

const STATUS_LABELS: Record<AssignmentStatus, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  reviewed: 'Reviewed',
};

const STATUS_ORDER: AssignmentStatus[] = ['draft', 'submitted', 'reviewed'];

function statusLabel(status: string): string {
  return STATUS_LABELS[status as AssignmentStatus] ?? status;
}

/**
 * Breakdown of assignment counts by status, rendered as a row of stat
 * boxes with a lightweight proportional bar beneath each one.
 */
export function SubmissionStatusWidget({ byStatus }: SubmissionStatusWidgetProps) {
  const total = Object.values(byStatus).reduce((sum, count) => sum + count, 0);
  const knownStatuses = STATUS_ORDER.filter((status) => status in byStatus);
  const extraStatuses = Object.keys(byStatus).filter((status) => !STATUS_ORDER.includes(status as AssignmentStatus));
  const statuses = [...knownStatuses, ...extraStatuses];

  return (
    <GlassCard>
      <TextReveal size="lg" mb={4}>
        Submission Status
      </TextReveal>

      {statuses.length === 0 ? (
        <Text color="fg.muted">No assignments yet.</Text>
      ) : (
        <SimpleGrid columns={{ base: 1, sm: statuses.length }} gap={4}>
          {statuses.map((status) => {
            const count = byStatus[status] ?? 0;
            const percent = total > 0 ? Math.round((count / total) * 100) : 0;

            return (
              <Box key={status}>
                <Text fontSize="sm" color="fg.muted">
                  {statusLabel(status)}
                </Text>
                <Text fontSize="2xl" fontWeight="bold">
                  {count}
                </Text>
                <Box mt={2} h="6px" borderRadius="full" bg="bg.muted" overflow="hidden">
                  <Box h="full" borderRadius="full" bgGradient="to-r" gradientFrom="purple.500" gradientTo="pink.500" width={`${percent}%`} />
                </Box>
              </Box>
            );
          })}
        </SimpleGrid>
      )}
    </GlassCard>
  );
}
