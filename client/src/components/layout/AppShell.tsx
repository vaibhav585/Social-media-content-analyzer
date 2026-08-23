// =============================================================================
// App Shell
// Main application layout wrapper containing Header, Sidebar, and Toast container.
// =============================================================================

import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import { Toaster } from 'react-hot-toast';

export default function AppShell() {
  return (
    <div className="app-shell">
      <Header />
      
      <div className="app-body">
        <Sidebar />
        
        <main className="app-main-content">
          <Outlet />
        </main>
      </div>

      <Toaster 
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-color)',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
            borderRadius: '12px',
          },
        }}
      />
    </div>
  );
}
