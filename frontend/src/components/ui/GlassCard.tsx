import { Box, type HTMLChakraProps } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface GlassCardProps extends HTMLChakraProps<'div'> {
  children: ReactNode;
}

/**
 * Frosted-glass card with entrance fade-in and hover elevation, per
 * skills/FRONTEND.md UI rules ("Card containers -> GlassCard").
 *
 * The animation (framer-motion) and styling (Chakra) props are kept on
 * separate elements because both libraries define a conflicting
 * `transition` prop with incompatible types.
 */
export function GlassCard({ children, ...rest }: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -5 }}
      transition={{ duration: 0.25 }}
    >
      <Box
        bg="bg.panel/70"
        backdropFilter="blur(16px)"
        border="1px solid"
        borderColor="border.emphasized"
        borderRadius="2xl"
        boxShadow="xl"
        p={6}
        {...rest}
      >
        {children}
      </Box>
    </motion.div>
  );
}
