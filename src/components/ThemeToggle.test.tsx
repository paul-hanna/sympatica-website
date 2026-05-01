import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/preact';
import { ThemeToggle } from './ThemeToggle';

describe('ThemeToggle', () => {
  beforeEach(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
  });

  it('starts in dark mode', () => {
    render(<ThemeToggle />);
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('toggles to light when clicked', () => {
    const { getByRole } = render(<ThemeToggle />);
    fireEvent.click(getByRole('button'));
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('toggles back to dark when clicked again', () => {
    const { getByRole } = render(<ThemeToggle />);
    fireEvent.click(getByRole('button'));
    fireEvent.click(getByRole('button'));
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('does not persist across page loads (no localStorage write)', () => {
    const setSpy = vi.spyOn(Storage.prototype, 'setItem');
    const { getByRole } = render(<ThemeToggle />);
    fireEvent.click(getByRole('button'));
    expect(setSpy).not.toHaveBeenCalled();
    setSpy.mockRestore();
  });
});
