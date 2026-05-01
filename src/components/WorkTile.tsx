import { useState } from 'preact/hooks';
import './WorkTile.css';

export interface WorkTileProps {
  slug: string;
  title: string;
  director: string;
  client?: string;
  artist?: string;
  category: 'commercial' | 'music-video';
  poster: string;
  preview_clip: string;
}

export function WorkTile(props: WorkTileProps) {
  const [hovered, setHovered] = useState(false);
  const subject = props.category === 'commercial' ? props.client : props.artist;

  return (
    <a
      href={`/work/${props.slug}`}
      class="work-tile"
      data-category={props.category}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div class="work-tile-media">
        <img src={props.poster} alt={props.title} loading="lazy" />
        {hovered && (
          <video
            src={props.preview_clip}
            class="work-tile-preview"
            autoPlay
            muted
            loop
            playsInline
          />
        )}
      </div>
      <div class="work-tile-overlay mono">
        <span class="work-tile-title">{props.title}</span>
        <span class="work-tile-meta">
          {props.director}{subject ? ` · ${subject}` : ''}
        </span>
      </div>
    </a>
  );
}
