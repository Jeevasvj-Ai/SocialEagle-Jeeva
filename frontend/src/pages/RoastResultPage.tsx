import { Box, Text, VStack } from '@chakra-ui/react';
import { useParams } from 'react-router-dom';
import { CategoryTags } from '../components/roasts/CategoryTags';
import { FeedbackPanel } from '../components/roasts/FeedbackPanel';
import { ScoreGauge } from '../components/roasts/ScoreGauge';
import { GlassCard } from '../components/ui/GlassCard';
import { GradientButton } from '../components/ui/GradientButton';
import { TextReveal } from '../components/ui/TextReveal';
import { PageWrapper } from '../components/layout/PageWrapper';
import { useRoastForAssignment } from '../hooks/useRoasts';

export default function RoastResultPage() {
  const { id } = useParams<{ id: string }>();
  const assignmentId = id ? Number(id) : undefined;

  const { roast, isLoading, error, isGenerating, generateError, generate } = useRoastForAssignment(assignmentId);

  return (
    <PageWrapper>
      <Box p={8}>
        <TextReveal size="2xl" mb={6}>
          Roast for Assignment #{id}
        </TextReveal>

        {isLoading && (
          <GlassCard>
            <Text>Loading roast...</Text>
          </GlassCard>
        )}

        {error && !isLoading && (
          <GlassCard>
            <Text color="roast.savage">{error}</Text>
          </GlassCard>
        )}

        {!isLoading && !error && !roast && (
          <GlassCard>
            <VStack align="flex-start" gap={4}>
              <Text>No roast has been generated for this assignment yet.</Text>
              <GradientButton onClick={() => void generate()} loading={isGenerating} disabled={isGenerating}>
                Generate Roast
              </GradientButton>
              {generateError && <Text color="roast.savage">{generateError}</Text>}
            </VStack>
          </GlassCard>
        )}

        {!isLoading && roast && (
          <VStack align="stretch" gap={6}>
            <GlassCard display="flex" flexDirection="column" alignItems="center">
              <ScoreGauge score={roast.score} />
              <CategoryTags categories={roast.categories} severity={roast.severity} />
            </GlassCard>
            <FeedbackPanel feedbackText={roast.feedbackText} />
          </VStack>
        )}
      </Box>
    </PageWrapper>
  );
}
