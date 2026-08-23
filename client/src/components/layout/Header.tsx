// =============================================================================
// Header
// Top navigation bar with logo and user menu.
// =============================================================================

import { Menu } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import UserMenu from '../auth/UserMenu';

export default function Header() {
  const { toggleSidebar } = useUIStore();

  return (
    <header className="app-header">
      <div className="header-left">
        <button
          className="sidebar-toggle-btn"
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
        >
          <Menu size={24} />
        </button>
        <div className="header-brand" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="32" height="32" rx="8" fill="var(--brand-primary)" fillOpacity="0.1" />
              <path d="M8 16L13 21L19 11L24 16" stroke="var(--brand-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="13" cy="21" r="2" fill="var(--brand-primary)" />
              <circle cx="19" cy="11" r="2" fill="var(--brand-primary)" />
            </svg>
          </div>
          <span className="header-title" style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '-0.5px' }}>ContentPulse</span>
        </div>
      </div>
      
      <div className="header-right">
        <UserMenu />
      </div>
    </header>
  );
}
