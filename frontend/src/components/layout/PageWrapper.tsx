import { Box, type BoxProps } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface PageWrapperProps extends BoxProps {
  children: ReactNode;
}

/**
 * Fade/slide-in wrapper that every page must use, per skills/FRONTEND.md
 * UI rules ("All pages -> PageWrapper").
 *
 * Animation and styling are split across a `motion.div` wrapper and an
 * inner Chakra `Box` because both libraries define an incompatible
 * `transition` prop.
 */
export function PageWrapper({ children, ...rest }: PageWrapperProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
    >
      <Box minH="100vh" {...rest}>
        {children}
      </Box>
    </motion.div>
  );
}
