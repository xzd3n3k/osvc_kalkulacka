import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { InputForm } from '@/components/InputForm';
import type { CalcInput } from '@/lib/calc/types';

const base: CalcInput = { rok: 2026, prijmy: 800000, typCinnosti: 'zivnost' };

describe('InputForm', () => {
  it('zobrazí pole obratu s hodnotou', () => {
    render(<InputForm value={base} onChange={() => {}} />);
    expect(screen.getByLabelText(/roční obrat/i)).toHaveValue(800000);
  });
  it('volá onChange při změně obratu', () => {
    const onChange = vi.fn();
    render(<InputForm value={base} onChange={onChange} />);
    fireEvent.change(screen.getByLabelText(/roční obrat/i), { target: { value: '900000' } });
    expect(onChange).toHaveBeenCalled();
    const last = onChange.mock.calls.at(-1)![0] as CalcInput;
    expect(last.prijmy).toBe(900000);
  });
});
