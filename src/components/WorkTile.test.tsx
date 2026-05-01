import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/preact';
import { WorkTile } from './WorkTile';

const tile = {
  slug: 'sample-spot',
  title: 'Sample Spot',
  director: 'Sample Director',
  client: 'Sample Brand',
  category: 'commercial' as const,
  poster: '/work/sample-spot/poster.jpg',
  preview_clip: '/work/sample-spot/preview.mp4',
};

describe('WorkTile', () => {
  it('renders title, director, and client', () => {
    const { getByText } = render(<WorkTile {...tile} />);
    expect(getByText('Sample Spot')).toBeInTheDocument();
    expect(getByText(/Sample Director/)).toBeInTheDocument();
    expect(getByText(/Sample Brand/)).toBeInTheDocument();
  });

  it('renders artist instead of client for music videos', () => {
    const mv = { ...tile, category: 'music-video' as const, client: undefined, artist: 'Sample Artist' };
    const { getByText, queryByText } = render(<WorkTile {...mv} />);
    expect(getByText(/Sample Artist/)).toBeInTheDocument();
    expect(queryByText(/Sample Brand/)).toBeNull();
  });

  it('renders poster image as default state', () => {
    const { container } = render(<WorkTile {...tile} />);
    const img = container.querySelector('img');
    expect(img?.getAttribute('src')).toBe('/work/sample-spot/poster.jpg');
  });

  it('mounts the preview video lazily on hover', () => {
    const { container } = render(<WorkTile {...tile} />);
    const tileEl = container.querySelector('.work-tile') as HTMLElement;
    expect(container.querySelector('video')).toBeNull();
    fireEvent.mouseEnter(tileEl);
    expect(container.querySelector('video')).not.toBeNull();
    expect(container.querySelector('video')?.getAttribute('src')).toBe('/work/sample-spot/preview.mp4');
  });

  it('links to the project page', () => {
    const { container } = render(<WorkTile {...tile} />);
    const link = container.querySelector('a');
    expect(link?.getAttribute('href')).toBe('/work/sample-spot');
  });
});
