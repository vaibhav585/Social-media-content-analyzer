// =============================================================================
// Header
// Top navigation bar with logo and user menu.
// =============================================================================

import { Menu, Activity } from 'lucide-react';
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '10px', background: 'var(--brand-primary)', color: 'white', boxShadow: '0 4px 12px rgba(249, 115, 22, 0.3)' }}>
            <Activity size={20} strokeWidth={2.5} />
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
