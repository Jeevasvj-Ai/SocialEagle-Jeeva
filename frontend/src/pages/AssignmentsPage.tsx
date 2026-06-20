import { Box, HStack, Text } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { AssignmentCard } from '../components/assignments/AssignmentCard';
import { AnimatedList } from '../components/ui/AnimatedList';
import { GlassCard } from '../components/ui/GlassCard';
import { GradientButton } from '../components/ui/GradientButton';
import { RoosterMascot } from '../components/ui/RoosterMascot';
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
            Feed the Rooster
          </GradientButton>
        </Box>

        {isLoading && <Text>Loading assignments...</Text>}
        {error && <Text color="roast.savage">{error}</Text>}
        {!isLoading && !error && assignments.length === 0 && (
          <GlassCard>
            <HStack gap={4}>
              <RoosterMascot size={56} animated />
              <Text>Nothing here yet. The rooster is bored and that's never good for your code.</Text>
            </HStack>
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
