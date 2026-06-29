import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Home from '@/app/page';

describe('Kalkulačka page', () => {
  it('vyrenderuje formulář i výsledky', () => {
    render(<Home />);
    expect(screen.getByLabelText(/roční obrat/i)).toBeInTheDocument();
    expect(screen.getAllByText(/čistý zbytek/i).length).toBeGreaterThan(0);
  });
});
