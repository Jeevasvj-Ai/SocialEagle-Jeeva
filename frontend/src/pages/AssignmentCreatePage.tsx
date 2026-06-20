import { Box, Text } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { AssignmentForm } from '../components/assignments/AssignmentForm';
import { GlassCard } from '../components/ui/GlassCard';
import { TextReveal } from '../components/ui/TextReveal';
import { PageWrapper } from '../components/layout/PageWrapper';
import { useAssignmentMutations } from '../hooks/useAssignments';
import type { AssignmentCreatePayload } from '../types';

export default function AssignmentCreatePage() {
  const navigate = useNavigate();
  const { create, isSubmitting, error } = useAssignmentMutations();

  const handleSubmit = async (payload: AssignmentCreatePayload) => {
    const created = await create(payload);
    navigate(`/assignments/${created.id}`);
  };

  return (
    <PageWrapper>
      <Box p={8} maxW="640px" mx="auto">
        <TextReveal size="2xl" mb={6}>
          New Assignment
        </TextReveal>
        <GlassCard>
          {error && (
            <Text color="roast.savage" mb={4}>
              {error}
            </Text>
          )}
          <AssignmentForm isSubmitting={isSubmitting} submitLabel="Create Assignment" onSubmit={handleSubmit} />
        </GlassCard>
      </Box>
    </PageWrapper>
  );
}
