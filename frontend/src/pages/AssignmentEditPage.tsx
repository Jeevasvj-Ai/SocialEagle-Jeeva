import { Box, Spinner, Text } from '@chakra-ui/react';
import { useNavigate, useParams } from 'react-router-dom';
import { AssignmentForm } from '../components/assignments/AssignmentForm';
import { GlassCard } from '../components/ui/GlassCard';
import { TextReveal } from '../components/ui/TextReveal';
import { PageWrapper } from '../components/layout/PageWrapper';
import { useAssignment, useAssignmentMutations } from '../hooks/useAssignments';
import { assignmentToFormValues } from '../services/assignmentService';
import type { AssignmentCreatePayload } from '../types';

export default function AssignmentEditPage() {
  const { id } = useParams<{ id: string }>();
  const assignmentId = id ? Number(id) : undefined;
  const navigate = useNavigate();

  const { assignment, isLoading, error: loadError } = useAssignment(assignmentId);
  const { update, isSubmitting, error: saveError } = useAssignmentMutations();

  const handleSubmit = async (payload: AssignmentCreatePayload) => {
    if (assignmentId === undefined) {
      return;
    }
    await update(assignmentId, payload);
    navigate(`/assignments/${assignmentId}`);
  };

  return (
    <PageWrapper>
      <Box p={8} maxW="640px" mx="auto">
        <TextReveal size="2xl" mb={6}>
          Edit Assignment
        </TextReveal>

        {isLoading && <Spinner size="lg" color="brand.solid" />}
        {loadError && <Text color="roast.savage">{loadError}</Text>}

        {!isLoading && assignment && (
          <GlassCard>
            {saveError && (
              <Text color="roast.savage" mb={4}>
                {saveError}
              </Text>
            )}
            <AssignmentForm
              initialValues={assignmentToFormValues(assignment)}
              isSubmitting={isSubmitting}
              submitLabel="Save Changes"
              onSubmit={handleSubmit}
            />
          </GlassCard>
        )}
      </Box>
    </PageWrapper>
  );
}
