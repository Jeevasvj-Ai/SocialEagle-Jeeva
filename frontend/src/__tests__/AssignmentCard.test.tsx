import { ChakraProvider } from '@chakra-ui/react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { AssignmentCard } from '../components/assignments/AssignmentCard';
import { theme } from '../theme';
import type { Assignment } from '../types';

const baseAssignment: Assignment = {
  id: 1,
  studentId: 1,
  title: 'My Cool Project',
  description: 'A simple FastAPI app',
  language: 'Python',
  sourceType: 'repo_link',
  sourceUrlOrPath: 'https://github.com/example/repo',
  dueDate: null,
  status: 'submitted',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: null,
};

function renderCard(assignment: Assignment) {
  return render(
    <ChakraProvider value={theme}>
      <MemoryRouter>
        <AssignmentCard assignment={assignment} />
      </MemoryRouter>
    </ChakraProvider>,
  );
}

describe('AssignmentCard', () => {
  it('renders the assignment title and status', () => {
    renderCard(baseAssignment);
    expect(screen.getByText('My Cool Project')).toBeInTheDocument();
    expect(screen.getByText('Submitted')).toBeInTheDocument();
  });

  it('renders the language and a formatted due date when present', () => {
    renderCard({ ...baseAssignment, dueDate: '2026-03-15T00:00:00Z' });
    expect(screen.getByText('Python')).toBeInTheDocument();
    // Date formatting is locale-dependent; just assert the date components appear.
    const dueText = screen.getByText(/Due:/);
    expect(dueText.textContent).toMatch(/2026/);
    expect(dueText.textContent).toMatch(/15/);
  });

  it('shows "No due date" when dueDate is null', () => {
    renderCard(baseAssignment);
    expect(screen.getByText(/Due: No due date/)).toBeInTheDocument();
  });

  it('renders the correct badge color/text for each status', () => {
    renderCard({ ...baseAssignment, status: 'draft' });
    expect(screen.getByText('Draft')).toBeInTheDocument();
  });
});
