import { ChakraProvider } from '@chakra-ui/react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from './App';
import { theme } from './theme';

describe('App', () => {
  it('redirects to the login page when unauthenticated', async () => {
    render(
      <ChakraProvider value={theme}>
        <App />
      </ChakraProvider>,
    );

    expect(await screen.findByText(/welcome back/i)).toBeInTheDocument();
  });
});
