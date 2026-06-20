import { Box, Text, VStack } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface ScoreGaugeProps {
  score: number;
  size?: number;
}

const RADIUS = 70;
const STROKE_WIDTH = 12;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function colorForScore(score: number): string {
  if (score < 40) return '#e53e3e';
  if (score <= 70) return '#ed8936';
  return '#48bb78';
}

/**
 * Circular radial gauge showing a 0-100 roast score, color-coded
 * red (<40) / yellow (40-70) / green (>70), with an animated fill.
 */
export function ScoreGauge({ score, size = 180 }: ScoreGaugeProps) {
  const clamped = Math.max(0, Math.min(100, score));
  const color = colorForScore(clamped);

  const [displayScore, setDisplayScore] = useState(0);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setDisplayScore(clamped));
    return () => cancelAnimationFrame(frame);
  }, [clamped]);

  const offset = CIRCUMFERENCE - (clamped / 100) * CIRCUMFERENCE;

  return (
    <VStack gap={2}>
      <Box position="relative" width={`${size}px`} height={`${size}px`}>
        <svg width={size} height={size} viewBox="0 0 180 180">
          <circle
            cx="90"
            cy="90"
            r={RADIUS}
            fill="none"
            stroke="rgba(255,255,255,0.15)"
            strokeWidth={STROKE_WIDTH}
          />
          <motion.circle
            cx="90"
            cy="90"
            r={RADIUS}
            fill="none"
            stroke={color}
            strokeWidth={STROKE_WIDTH}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            initial={{ strokeDashoffset: CIRCUMFERENCE }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: 'easeOut' }}
            transform="rotate(-90 90 90)"
          />
        </svg>
        <Box
          position="absolute"
          top="0"
          left="0"
          width="100%"
          height="100%"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Text fontSize="3xl" fontWeight="bold" color={color}>
            {displayScore}
          </Text>
        </Box>
      </Box>
      <Text fontSize="sm" color="fg.muted">
        Score out of 100
      </Text>
    </VStack>
  );
}
