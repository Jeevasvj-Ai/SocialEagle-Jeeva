import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';

// Assignment Roaster brand theme (Chakra UI v3 token-based system).
// Purple/pink gradient palette to match the "roast" branding used across
// the modern UI components (GradientButton, MeshBackground, etc).
const config = defineConfig({
  theme: {
    tokens: {
      colors: {
        brand: {
          50: { value: '#faf5ff' },
          100: { value: '#e9d8fd' },
          200: { value: '#d6bcfa' },
          300: { value: '#b794f4' },
          400: { value: '#9f7aea' },
          500: { value: '#805ad5' },
          600: { value: '#6b46c1' },
          700: { value: '#553c9a' },
          800: { value: '#44337a' },
          900: { value: '#322659' },
        },
        roast: {
          mild: { value: '#48bb78' },
          medium: { value: '#ed8936' },
          savage: { value: '#e53e3e' },
        },
      },
      fonts: {
        heading: { value: "'Inter', sans-serif" },
        body: { value: "'Inter', sans-serif" },
      },
    },
    semanticTokens: {
      colors: {
        'brand.solid': { value: '{colors.brand.600}' },
        'brand.contrast': { value: '{colors.white}' },
        'brand.fg': { value: '{colors.brand.700}' },
        'brand.muted': { value: '{colors.brand.100}' },
      },
    },
  },
});

export const theme = createSystem(defaultConfig, config);
