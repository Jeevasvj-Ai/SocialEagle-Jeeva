import { Box, Text } from '@chakra-ui/react';
import { GlassCard } from '../ui/GlassCard';
import { TextReveal } from '../ui/TextReveal';
import type { ScoreTrendPoint } from '../../types';

interface ScoreTrendChartProps {
  scoreTrend: ScoreTrendPoint[];
}

const VIEW_WIDTH = 600;
const VIEW_HEIGHT = 200;
const PADDING = 24;
const MIN_SCORE = 0;
const MAX_SCORE = 100;

function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    return isoDate;
  }
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function buildPoints(scoreTrend: ScoreTrendPoint[]): Array<{ x: number; y: number; score: number; date: string }> {
  const plotWidth = VIEW_WIDTH - PADDING * 2;
  const plotHeight = VIEW_HEIGHT - PADDING * 2;
  const count = scoreTrend.length;

  return scoreTrend.map((point, index) => {
    const x = count === 1 ? PADDING + plotWidth / 2 : PADDING + (plotWidth * index) / (count - 1);
    const clampedScore = Math.min(MAX_SCORE, Math.max(MIN_SCORE, point.score));
    const y = PADDING + plotHeight - (plotHeight * (clampedScore - MIN_SCORE)) / (MAX_SCORE - MIN_SCORE);
    return { x, y, score: point.score, date: formatDate(point.generatedAt) };
  });
}

/**
 * Minimal custom SVG line/area chart for the score trend over time.
 * No charting library is installed in package.json, so this implements a
 * lightweight, dependency-free chart rather than pulling in a new package.
 */
export function ScoreTrendChart({ scoreTrend }: ScoreTrendChartProps) {
  if (scoreTrend.length === 0) {
    return (
      <GlassCard>
        <TextReveal size="lg" mb={4}>
          Score Trend
        </TextReveal>
        <Text color="fg.muted">No roast scores yet — submit an assignment to see your trend.</Text>
      </GlassCard>
    );
  }

  const points = buildPoints(scoreTrend);
  const linePath = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${VIEW_HEIGHT - PADDING} L ${points[0].x} ${VIEW_HEIGHT - PADDING} Z`;

  return (
    <GlassCard>
      <TextReveal size="lg" mb={4}>
        Score Trend
      </TextReveal>
      <Box w="full" overflowX="auto">
        <svg
          viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
          width="100%"
          height={VIEW_HEIGHT}
          role="img"
          aria-label="Roast score trend over time"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id="score-trend-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#805ad5" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#805ad5" stopOpacity={0} />
            </linearGradient>
          </defs>

          <line
            x1={PADDING}
            y1={VIEW_HEIGHT - PADDING}
            x2={VIEW_WIDTH - PADDING}
            y2={VIEW_HEIGHT - PADDING}
            stroke="#e2e8f0"
            strokeWidth={1}
          />

          <path d={areaPath} fill="url(#score-trend-fill)" stroke="none" />
          <path d={linePath} fill="none" stroke="#805ad5" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />

          {points.map((point) => (
            <circle key={`${point.date}-${point.x}`} cx={point.x} cy={point.y} r={4} fill="#805ad5">
              <title>{`${point.date}: ${point.score}`}</title>
            </circle>
          ))}
        </svg>
      </Box>
      <Box display="flex" justifyContent="space-between" mt={2}>
        <Text fontSize="xs" color="fg.muted">
          {points[0].date}
        </Text>
        <Text fontSize="xs" color="fg.muted">
          {points[points.length - 1].date}
        </Text>
      </Box>
    </GlassCard>
  );
}
