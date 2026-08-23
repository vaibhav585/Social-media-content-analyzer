// =============================================================================
// Sidebar
// Navigation menu for switching between Analyze, History, and Settings.
// =============================================================================

import { BarChart2, Clock, Settings, UploadCloud } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Sidebar() {
  const { sidebarOpen } = useUIStore();
  const navigate = useNavigate();
  const location = useLocation();

  if (!sidebarOpen) return null;

  const navItems = [
    { id: 'analyze', path: '/analyze', label: 'Analyze', icon: <UploadCloud size={20} /> },
    { id: 'history', path: '/history', label: 'History', icon: <Clock size={20} /> },
    { id: 'settings', path: '/settings', label: 'Settings', icon: <Settings size={20} /> },
  ];

  return (
    <aside className="app-sidebar">
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <button
              key={item.id}
              className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              {item.icon}
              <span>{item.label}</span>
              {isActive && <div className="sidebar-active-indicator" />}
            </button>
          );
        })}
      </nav>

    </aside>
  );
}
