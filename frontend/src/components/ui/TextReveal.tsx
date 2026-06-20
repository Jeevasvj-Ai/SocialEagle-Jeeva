import { Heading, type HeadingProps } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface TextRevealProps extends HeadingProps {
  children: ReactNode;
}

/**
 * Headline with a reveal-on-mount animation, per skills/FRONTEND.md UI
 * rules ("Headlines -> TextReveal").
 *
 * Animation and styling are split across a `motion.div` wrapper and an
 * inner Chakra `Heading` because both libraries define an incompatible
 * `transition` prop.
 */
export function TextReveal({ children, ...rest }: TextRevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <Heading {...rest}>{children}</Heading>
    </motion.div>
  );
}
