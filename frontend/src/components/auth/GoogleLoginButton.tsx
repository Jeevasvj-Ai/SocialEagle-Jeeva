import { Button, HStack, Text, type ButtonProps } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { getGoogleLoginUrl } from '../../services/authService';

type GoogleLoginButtonProps = Omit<ButtonProps, 'onClick'>;

/**
 * Redirects the browser to the backend's Google OAuth authorization
 * endpoint (`GET /auth/google`), which in turn redirects to Google's
 * consent screen and eventually back to `/auth/google/callback`.
 */
export function GoogleLoginButton({ ...rest }: GoogleLoginButtonProps) {
  const handleClick = (): void => {
    window.location.href = getGoogleLoginUrl();
  };

  return (
    <motion.div whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}>
      <Button
        type="button"
        onClick={handleClick}
        variant="outline"
        borderRadius="full"
        w="full"
        {...rest}
      >
        <HStack justify="center" gap={2}>
          <Text>Continue with Google</Text>
        </HStack>
      </Button>
    </motion.div>
  );
}
