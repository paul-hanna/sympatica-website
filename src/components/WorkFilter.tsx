import { useEffect, useState } from 'preact/hooks';
import './WorkFilter.css';

type Category = 'all' | 'commercial' | 'music-video';

const LABELS: Record<Category, string> = {
  'all': 'All',
  'commercial': 'Commercials',
  'music-video': 'Music Videos',
};

export function WorkFilter() {
  const [active, setActive] = useState<Category>('all');

  useEffect(() => {
    const param = new URLSearchParams(window.location.search).get('cat');
    if (param === 'commercial' || param === 'music-video') {
      setActive(param);
    }
  }, []);

  useEffect(() => {
    applyFilter(active);
  }, [active]);

  const select = (cat: Category) => {
    setActive(cat);
    const url = new URL(window.location.href);
    if (cat === 'all') url.searchParams.delete('cat');
    else url.searchParams.set('cat', cat);
    window.history.replaceState({}, '', url.toString());
  };

  return (
    <div class="work-filter mono">
      {(Object.keys(LABELS) as Category[]).map((cat) => (
        <button
          type="button"
          aria-pressed={active === cat}
          class={`work-filter-pill ${active === cat ? 'is-active' : ''}`}
          onClick={() => select(cat)}
        >
          {LABELS[cat]}
        </button>
      ))}
    </div>
  );
}

function applyFilter(active: Category) {
  const tiles = document.querySelectorAll<HTMLElement>('.work-grid [data-category]');
  tiles.forEach((tile) => {
    const cat = tile.dataset.category;
    tile.style.display = active === 'all' || cat === active ? '' : 'none';
  });
}
