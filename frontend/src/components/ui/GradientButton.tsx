import { Button, type ButtonProps } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import type { ReactNode, MouseEventHandler } from 'react';

interface GradientButtonProps extends Omit<ButtonProps, 'onClick'> {
  children: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
}

/**
 * Primary call-to-action button with a brand gradient and hover/tap
 * animation, per skills/FRONTEND.md UI rules ("Primary buttons -> GradientButton").
 *
 * Animation and styling are split across a `motion.button` wrapper and an
 * inner Chakra `Button` because both libraries define an incompatible
 * `transition` prop.
 */
export function GradientButton({ children, onClick, type = 'button', ...rest }: GradientButtonProps) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      style={{ display: 'inline-block', border: 'none', background: 'none', padding: 0 }}
    >
      <Button
        as="span"
        bgGradient="to-r"
        gradientFrom="purple.500"
        gradientTo="pink.500"
        color="white"
        fontWeight="semibold"
        borderRadius="full"
        px={6}
        py={3}
        _hover={{ boxShadow: 'lg' }}
        {...rest}
      >
        {children}
      </Button>
    </motion.button>
  );
}
