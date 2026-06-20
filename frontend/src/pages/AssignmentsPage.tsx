import { Box, Text } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { AssignmentCard } from '../components/assignments/AssignmentCard';
import { AnimatedList } from '../components/ui/AnimatedList';
import { GlassCard } from '../components/ui/GlassCard';
import { GradientButton } from '../components/ui/GradientButton';
import { TextReveal } from '../components/ui/TextReveal';
import { PageWrapper } from '../components/layout/PageWrapper';
import { useAssignments } from '../hooks/useAssignments';

export default function AssignmentsPage() {
  const { assignments, isLoading, error } = useAssignments();
  const navigate = useNavigate();

  return (
    <PageWrapper>
      <Box p={8}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={6}>
          <TextReveal size="2xl">Assignments</TextReveal>
          <GradientButton type="button" onClick={() => navigate('/assignments/new')}>
            New Assignment
          </GradientButton>
        </Box>

        {isLoading && <Text>Loading assignments...</Text>}
        {error && <Text color="roast.savage">{error}</Text>}
        {!isLoading && !error && assignments.length === 0 && (
          <GlassCard>
            <Text>No assignments submitted yet.</Text>
          </GlassCard>
        )}
        {!isLoading && assignments.length > 0 && (
          <AnimatedList>
            {assignments.map((assignment) => (
              <AssignmentCard key={assignment.id} assignment={assignment} />
            ))}
          </AnimatedList>
        )}
      </Box>
    </PageWrapper>
  );
}
