import { Stack, type StackProps } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

interface AnimatedListProps extends StackProps {
  children: ReactNode[];
}

/**
 * Stagger-animated list wrapper, per skills/FRONTEND.md UI rules
 * ("Lists of items -> AnimatedList").
 *
 * Animation lives on plain `motion.div` elements; Chakra styling (`Stack`,
 * gap) is applied to an inner element to avoid the `transition` prop type
 * conflict between framer-motion and Chakra.
 */
export function AnimatedList({ children, ...rest }: AnimatedListProps) {
  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants}>
      <Stack gap={4} {...rest}>
        {children.map((child, index) => (
          <motion.div key={index} variants={itemVariants}>
            {child}
          </motion.div>
        ))}
      </Stack>
    </motion.div>
  );
}
