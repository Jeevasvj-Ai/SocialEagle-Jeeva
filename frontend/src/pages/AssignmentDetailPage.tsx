import { Box, Spinner, Text } from '@chakra-ui/react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { StatusBadge } from '../components/assignments/StatusBadge';
import { AnimatedInput } from '../components/ui/AnimatedInput';
import { GlassCard } from '../components/ui/GlassCard';
import { GradientButton } from '../components/ui/GradientButton';
import { TextReveal } from '../components/ui/TextReveal';
import { PageWrapper } from '../components/layout/PageWrapper';
import { useAssignment, useAssignmentMutations } from '../hooks/useAssignments';

function formatDate(value: string | null): string {
  if (!value) {
    return 'Not set';
  }
  return new Date(value).toLocaleString();
}

export default function AssignmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const assignmentId = id ? Number(id) : undefined;
  const navigate = useNavigate();

  const { assignment, isLoading, error, refetch } = useAssignment(assignmentId);
  const { remove, submit, resubmit, isSubmitting, error: mutationError } = useAssignmentMutations();
  const [resubmitSource, setResubmitSource] = useState('');
  const [isResubmitting, setIsResubmitting] = useState(false);

  const handleDelete = async () => {
    if (assignmentId === undefined) {
      return;
    }
    await remove(assignmentId);
    navigate('/assignments');
  };

  const handleSubmit = async () => {
    if (assignmentId === undefined) {
      return;
    }
    await submit(assignmentId);
    refetch();
  };

  const handleResubmit = async () => {
    if (assignmentId === undefined || resubmitSource.trim().length === 0) {
      return;
    }
    await resubmit(assignmentId, resubmitSource.trim());
    setResubmitSource('');
    setIsResubmitting(false);
    refetch();
  };

  return (
    <PageWrapper>
      <Box p={8}>
        <TextReveal size="2xl" mb={6}>
          Assignment #{id}
        </TextReveal>

        {isLoading && <Spinner size="lg" color="brand.solid" />}
        {error && <Text color="roast.savage">{error}</Text>}

        {!isLoading && assignment && (
          <GlassCard>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={4}>
              <Text fontWeight="bold" fontSize="xl">
                {assignment.title}
              </Text>
              <StatusBadge status={assignment.status} />
            </Box>

            {assignment.description && <Text mb={4}>{assignment.description}</Text>}

            <Box display="flex" flexDirection="column" gap={2} mb={6}>
              <Text fontSize="sm" color="fg.muted" textTransform="capitalize">
                Language: {assignment.language}
              </Text>
              <Text fontSize="sm" color="fg.muted">
                Source ({assignment.sourceType === 'file' ? 'file' : 'repo link'}): {assignment.sourceUrlOrPath}
              </Text>
              <Text fontSize="sm" color="fg.muted">
                Due: {formatDate(assignment.dueDate)}
              </Text>
              <Text fontSize="sm" color="fg.muted">
                Created: {formatDate(assignment.createdAt)}
              </Text>
            </Box>

            {mutationError && (
              <Text color="roast.savage" mb={4}>
                {mutationError}
              </Text>
            )}

            <Box display="flex" gap={3} flexWrap="wrap">
              {assignment.status === 'draft' && (
                <>
                  <GradientButton type="button" onClick={() => navigate(`/assignments/${assignment.id}/edit`)}>
                    Edit
                  </GradientButton>
                  <GradientButton type="button" disabled={isSubmitting} onClick={() => void handleSubmit()}>
                    Submit
                  </GradientButton>
                </>
              )}

              {(assignment.status === 'submitted' || assignment.status === 'reviewed') && (
                <GradientButton type="button" onClick={() => setIsResubmitting((prev) => !prev)}>
                  Resubmit
                </GradientButton>
              )}

              {assignment.status === 'reviewed' && (
                <GradientButton type="button" onClick={() => navigate(`/assignments/${assignment.id}/roast`)}>
                  View Roast
                </GradientButton>
              )}

              <GradientButton
                type="button"
                disabled={isSubmitting}
                onClick={() => void handleDelete()}
                bgGradient="to-r"
                gradientFrom="roast.savage"
                gradientTo="roast.medium"
              >
                Delete
              </GradientButton>
            </Box>

            {isResubmitting && (
              <Box mt={6} display="flex" flexDirection="column" gap={3}>
                <AnimatedInput
                  label="New source URL or path"
                  value={resubmitSource}
                  onChange={(event) => setResubmitSource(event.target.value)}
                  placeholder="https://github.com/user/repo"
                />
                <GradientButton
                  type="button"
                  disabled={isSubmitting || resubmitSource.trim().length === 0}
                  onClick={() => void handleResubmit()}
                  alignSelf="flex-start"
                >
                  Confirm Resubmit
                </GradientButton>
              </Box>
            )}
          </GlassCard>
        )}
      </Box>
    </PageWrapper>
  );
}
