import { describe, it, expect, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/preact';
import { WorkFilter } from './WorkFilter';

describe('WorkFilter', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/work');
    document.body.innerHTML = '';
  });

  it('renders all three filter pills', () => {
    const { getByRole } = render(<WorkFilter />);
    expect(getByRole('button', { name: /all/i })).toBeInTheDocument();
    expect(getByRole('button', { name: /commercials/i })).toBeInTheDocument();
    expect(getByRole('button', { name: /music videos/i })).toBeInTheDocument();
  });

  it('marks "All" as active by default', () => {
    const { getByRole } = render(<WorkFilter />);
    expect(getByRole('button', { name: /all/i })).toHaveAttribute('aria-pressed', 'true');
  });

  it('updates the URL when a filter is selected', () => {
    const { getByRole } = render(<WorkFilter />);
    fireEvent.click(getByRole('button', { name: /commercials/i }));
    expect(window.location.search).toBe('?cat=commercial');
  });

  it('removes the query param when "All" is selected', () => {
    window.history.replaceState({}, '', '/work?cat=commercial');
    const { getByRole } = render(<WorkFilter />);
    fireEvent.click(getByRole('button', { name: /all/i }));
    expect(window.location.search).toBe('');
  });

  it('shows/hides tiles via data attributes on the grid', () => {
    document.body.innerHTML = '<div class="work-grid"><a data-category="commercial">c</a><a data-category="music-video">m</a></div>';
    const { getByRole } = render(<WorkFilter />);
    fireEvent.click(getByRole('button', { name: /commercials/i }));
    const commercialEl = document.querySelector('[data-category="commercial"]') as HTMLElement;
    const mvEl = document.querySelector('[data-category="music-video"]') as HTMLElement;
    expect(commercialEl.style.display).not.toBe('none');
    expect(mvEl.style.display).toBe('none');
  });

  it('reads initial state from URL', () => {
    window.history.replaceState({}, '', '/work?cat=music-video');
    const { getByRole } = render(<WorkFilter />);
    expect(getByRole('button', { name: /music videos/i })).toHaveAttribute('aria-pressed', 'true');
  });
});
