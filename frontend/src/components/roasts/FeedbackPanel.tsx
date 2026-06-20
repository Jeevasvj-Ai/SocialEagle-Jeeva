import { Text } from '@chakra-ui/react';
import { GlassCard } from '../ui/GlassCard';
import { TextReveal } from '../ui/TextReveal';

interface FeedbackPanelProps {
  feedbackText: string;
}

/** Displays the roast's freeform feedback text inside a GlassCard with a reveal animation. */
export function FeedbackPanel({ feedbackText }: FeedbackPanelProps) {
  return (
    <GlassCard>
      <TextReveal size="md" mb={3}>
        The Roast
      </TextReveal>
      <Text whiteSpace="pre-wrap" lineHeight="tall">
        {feedbackText}
      </Text>
    </GlassCard>
  );
}
