import { useEffect, useRef, useState } from 'preact/hooks';
import './HeroCycler.css';

export interface HeroItem {
  slug: string;
  title: string;
  director: string;
  subject?: string;
  preview_clip: string;
}

interface Props {
  items: HeroItem[];
  interval?: number;
}

export function HeroCycler({ items, interval = 9000 }: Props) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    videoRefs.current.forEach((v, i) => {
      if (!v) return;
      if (i === active) {
        const p = v.play();
        if (p && typeof p.catch === 'function') p.catch(() => {});
      } else {
        v.pause();
      }
    });
  }, [active]);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || paused) return;
    const id = setInterval(() => setActive((i) => (i + 1) % items.length), interval);
    return () => clearInterval(id);
  }, [paused, items.length, interval]);

  const jump = (i: number) => {
    setPaused(true);
    setActive(i);
  };

  const item = items[active];
  const counter = `${String(active + 1).padStart(2, '0')} / ${String(items.length).padStart(2, '0')}`;

  return (
    <section class="hero-cycler">
      <a
        href={`/work/${item.slug}`}
        class="hero-cycler-stage"
        aria-label={`View project: ${item.title}${item.director ? ` by ${item.director}` : ''}`}
      >
        {items.map((it, i) => (
          <video
            key={it.slug}
            ref={(el) => { videoRefs.current[i] = el; }}
            src={it.preview_clip}
            class={`hero-cycler-video ${i === active ? 'is-active' : ''}`}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
          />
        ))}
      </a>

      <div class="hero-cycler-overlay mono">
        <div class="hero-cycler-counter">{counter}</div>
        <div class="hero-cycler-title">{item.title}</div>
        <div class="hero-cycler-meta">
          {item.director}{item.subject ? ` · ${item.subject}` : ''}
        </div>
      </div>

      <div class="hero-cycler-tickbar">
        {items.map((it, i) => (
          <button
            type="button"
            aria-current={i === active ? 'true' : undefined}
            aria-label={`Show slide ${i + 1}: ${it.title}`}
            class={`hero-cycler-tick ${i === active ? 'is-active' : ''}`}
            onClick={() => jump(i)}
          />
        ))}
      </div>
    </section>
  );
}
