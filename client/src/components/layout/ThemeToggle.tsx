// =============================================================================
// Theme Toggle
// Switch between light and dark modes.
// =============================================================================

import { Moon, Sun } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useUIStore();

  return (
    <button
      className="theme-toggle-btn"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}
