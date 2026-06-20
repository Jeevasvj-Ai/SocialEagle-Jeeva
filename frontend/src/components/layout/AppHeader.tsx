import { Box, chakra, Flex, HStack, Text } from '@chakra-ui/react';
import { useState } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContextBase';
import { RoosterMascot } from '../ui/RoosterMascot';

const NavLink = chakra(RouterLink);

const TAGLINES = [
  "Where 'no comment' is the worst comment.",
  'Cock-a-doodle-DON’T submit that without testing it first.',
  'We peck at your code so your professor doesn’t have to.',
  'Fresh roasts, served at 6am sharp.',
  'Crowing about your bugs since this morning.',
  'Ruffling feathers, fixing bugs.',
];

const NAV_LINKS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/assignments', label: 'Assignments' },
  { to: '/roasts', label: 'Roasts' },
  { to: '/profile', label: 'Profile' },
];

/**
 * Persistent top bar shown on every authenticated page: rooster logo,
 * wordmark, a randomly-picked joke tagline (stable per page load), nav
 * links, and logout.
 */
export function AppHeader() {
  const { logout } = useAuth();
  const location = useLocation();
  // Lazy initializer: React explicitly permits one-time impure work here
  // (unlike a bare call during render), since it only runs on mount.
  const [tagline] = useState(() => TAGLINES[Math.floor(Math.random() * TAGLINES.length)]);

  return (
    <Box borderBottom="1px solid" borderColor="border.emphasized" bg="bg.panel/80" backdropFilter="blur(12px)">
      <Flex maxW="6xl" mx="auto" px={4} py={3} align="center" justify="space-between" wrap="wrap" gap={3}>
        <NavLink to="/dashboard" display="flex" alignItems="center" gap={2} _hover={{ opacity: 0.85 }}>
          <RoosterMascot size={36} />
          <Box>
            <Text fontWeight="bold" fontSize="lg" lineHeight="1">
              Assignment Roaster
            </Text>
            <Text fontSize="xs" color="fg.muted">
              {tagline}
            </Text>
          </Box>
        </NavLink>

        <HStack gap={4}>
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              fontWeight={location.pathname.startsWith(link.to) ? 'bold' : 'normal'}
              color={location.pathname.startsWith(link.to) ? 'brand.fg' : 'fg.default'}
              _hover={{ color: 'brand.fg' }}
            >
              {link.label}
            </NavLink>
          ))}
          <Text as="button" onClick={() => void logout()} color="fg.muted" _hover={{ color: 'roast.savage' }}>
            Fly the coop
          </Text>
        </HStack>
      </Flex>
    </Box>
  );
}
