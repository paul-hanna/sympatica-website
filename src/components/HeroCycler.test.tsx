import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, act } from '@testing-library/preact';
import { HeroCycler } from './HeroCycler';

const items = [
  { slug: 'a', title: 'A', director: 'Dir A', subject: 'Client A', preview_clip: '/a.mp4' },
  { slug: 'b', title: 'B', director: 'Dir B', subject: 'Client B', preview_clip: '/b.mp4' },
  { slug: 'c', title: 'C', director: 'Dir C', subject: 'Client C', preview_clip: '/c.mp4' },
];

describe('HeroCycler', () => {
  it('renders the first item by default', () => {
    const { getByText } = render(<HeroCycler items={items} interval={1000} />);
    expect(getByText('A')).toBeInTheDocument();
    expect(getByText(/01 \/ 03/)).toBeInTheDocument();
  });

  it('advances to next item on timer', async () => {
    vi.useFakeTimers();
    const { getByText } = render(<HeroCycler items={items} interval={1000} />);
    expect(getByText('A')).toBeInTheDocument();
    await act(async () => { vi.advanceTimersByTime(1001); });
    expect(getByText('B')).toBeInTheDocument();
    expect(getByText(/02 \/ 03/)).toBeInTheDocument();
    vi.useRealTimers();
  });

  it('wraps from last to first', async () => {
    vi.useFakeTimers();
    const { getByText } = render(<HeroCycler items={items} interval={1000} />);
    await act(async () => { vi.advanceTimersByTime(3003); });
    expect(getByText('A')).toBeInTheDocument();
    vi.useRealTimers();
  });

  it('jumps to clicked tickbar segment', () => {
    const { getAllByRole, getByText } = render(<HeroCycler items={items} interval={9999} />);
    const segments = getAllByRole('button');
    fireEvent.click(segments[2]);
    expect(getByText('C')).toBeInTheDocument();
  });

  it('stops auto-advance after user interacts', async () => {
    vi.useFakeTimers();
    const { getByText, getAllByRole } = render(<HeroCycler items={items} interval={1000} />);
    fireEvent.click(getAllByRole('button')[1]);
    await act(async () => { vi.advanceTimersByTime(2002); });
    expect(getByText('B')).toBeInTheDocument(); // still B, no advance
    vi.useRealTimers();
  });

  it('honors prefers-reduced-motion: no auto-advance', async () => {
    const matchSpy = vi.spyOn(window, 'matchMedia').mockReturnValue({
      matches: true, media: '', onchange: null,
      addEventListener: vi.fn(), removeEventListener: vi.fn(),
      addListener: vi.fn(), removeListener: vi.fn(), dispatchEvent: vi.fn(),
    } as MediaQueryList);
    vi.useFakeTimers();
    const { getByText } = render(<HeroCycler items={items} interval={1000} />);
    await act(async () => { vi.advanceTimersByTime(2002); });
    expect(getByText('A')).toBeInTheDocument(); // never advanced
    matchSpy.mockRestore();
    vi.useRealTimers();
  });
});
