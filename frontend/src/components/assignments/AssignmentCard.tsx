import { Box, Text } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from '../ui/GlassCard';
import { StatusBadge } from './StatusBadge';
import type { Assignment } from '../../types';

interface AssignmentCardProps {
  assignment: Assignment;
}

function formatDueDate(dueDate: string | null): string {
  if (!dueDate) {
    return 'No due date';
  }
  return new Date(dueDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

/**
 * Summary card for a single assignment, used in the assignments list view.
 * Clicking navigates to the assignment's detail page.
 */
export function AssignmentCard({ assignment }: AssignmentCardProps) {
  const navigate = useNavigate();

  return (
    <GlassCard
      cursor="pointer"
      onClick={() => navigate(`/assignments/${assignment.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          navigate(`/assignments/${assignment.id}`);
        }
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
        <Text fontWeight="semibold" fontSize="lg">
          {assignment.title}
        </Text>
        <StatusBadge status={assignment.status} />
      </Box>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Text color="fg.muted" fontSize="sm" textTransform="capitalize">
          {assignment.language}
        </Text>
        <Text color="fg.muted" fontSize="sm">
          Due: {formatDueDate(assignment.dueDate)}
        </Text>
      </Box>
    </GlassCard>
  );
}
