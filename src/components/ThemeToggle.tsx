import { useState } from 'preact/hooks';
import './ThemeToggle.css';

export function ThemeToggle() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      class="theme-toggle"
    >
      <span class="mono" aria-hidden="true">{theme === 'dark' ? '◐' : '◑'}</span>
    </button>
  );
}
