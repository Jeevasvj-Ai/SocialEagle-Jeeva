import { useState } from 'react';
import { Box, Stack, Switch, Text } from '@chakra-ui/react';
import { GlassCard } from '../components/ui/GlassCard';
import { GradientButton } from '../components/ui/GradientButton';
import { TextReveal } from '../components/ui/TextReveal';
import { PageWrapper } from '../components/layout/PageWrapper';
import { useAuth } from '../hooks/useAuth';

interface SettingsToggles {
  darkTheme: boolean;
  emailNotifications: boolean;
  roastReadyAlerts: boolean;
}

const DEFAULT_TOGGLES: SettingsToggles = {
  darkTheme: false,
  emailNotifications: true,
  roastReadyAlerts: true,
};

/**
 * UI-only settings placeholders (theme/notification toggles). No backend
 * endpoint exists for these yet, so state is local-only and not persisted.
 */
export default function SettingsPage() {
  const { logout } = useAuth();
  const [toggles, setToggles] = useState<SettingsToggles>(DEFAULT_TOGGLES);

  const setToggle = (key: keyof SettingsToggles) => (checked: boolean) => {
    setToggles((prev) => ({ ...prev, [key]: checked }));
  };

  return (
    <PageWrapper>
      <Box p={8}>
        <TextReveal size="2xl" mb={6}>
          Settings
        </TextReveal>

        <Stack gap={6}>
          <GlassCard>
            <Text fontWeight="semibold" mb={4}>
              Appearance
            </Text>
            <Switch.Root
              checked={toggles.darkTheme}
              onCheckedChange={(details) => setToggle('darkTheme')(details.checked)}
            >
              <Switch.HiddenInput />
              <Switch.Control>
                <Switch.Thumb />
              </Switch.Control>
              <Switch.Label>Dark theme</Switch.Label>
            </Switch.Root>
          </GlassCard>

          <GlassCard>
            <Text fontWeight="semibold" mb={4}>
              Notifications
            </Text>
            <Stack gap={4}>
              <Switch.Root
                checked={toggles.emailNotifications}
                onCheckedChange={(details) => setToggle('emailNotifications')(details.checked)}
              >
                <Switch.HiddenInput />
                <Switch.Control>
                  <Switch.Thumb />
                </Switch.Control>
                <Switch.Label>Email notifications</Switch.Label>
              </Switch.Root>

              <Switch.Root
                checked={toggles.roastReadyAlerts}
                onCheckedChange={(details) => setToggle('roastReadyAlerts')(details.checked)}
              >
                <Switch.HiddenInput />
                <Switch.Control>
                  <Switch.Thumb />
                </Switch.Control>
                <Switch.Label>Notify me when a roast is ready</Switch.Label>
              </Switch.Root>
            </Stack>
          </GlassCard>

          <GlassCard>
            <Text mb={4}>Account settings placeholder.</Text>
            <GradientButton type="button" onClick={logout}>
              Log Out
            </GradientButton>
          </GlassCard>
        </Stack>
      </Box>
    </PageWrapper>
  );
}
