import { Field, Input, type InputProps } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { forwardRef, useState } from 'react';

interface AnimatedInputProps extends InputProps {
  label?: string;
  error?: string;
}

/**
 * Form input with focus animation and inline error state, per
 * skills/FRONTEND.md UI rules ("Form inputs -> AnimatedInput").
 *
 * The focus scale animation is driven by a `motion.div` wrapper (toggled via
 * local focus state) because framer-motion's `transition` prop type
 * conflicts with Chakra's CSS `transition` style prop on the same element.
 */
export const AnimatedInput = forwardRef<HTMLInputElement, AnimatedInputProps>(
  ({ label, error, onFocus, onBlur, ...rest }, ref) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
      <Field.Root invalid={Boolean(error)}>
        {label && <Field.Label>{label}</Field.Label>}
        <motion.div animate={{ scale: isFocused ? 1.01 : 1 }}>
          <Input
            ref={ref}
            borderWidth="2px"
            borderColor={error ? 'border.error' : 'border.muted'}
            borderRadius="xl"
            px={4}
            py={3}
            _focus={{ borderColor: 'brand.solid' }}
            onFocus={(event) => {
              setIsFocused(true);
              onFocus?.(event);
            }}
            onBlur={(event) => {
              setIsFocused(false);
              onBlur?.(event);
            }}
            {...rest}
          />
        </motion.div>
        {error && <Field.ErrorText>{error}</Field.ErrorText>}
      </Field.Root>
    );
  },
);

AnimatedInput.displayName = 'AnimatedInput';
