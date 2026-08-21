// =============================================================================
// App Shell
// Main application layout wrapper containing Header, Sidebar, and Toast container.
// =============================================================================

import { Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '../../store/uiStore';
import Header from './Header';
import Sidebar from './Sidebar';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

export default function AppShell() {
  const { toasts, removeToast } = useUIStore();

  return (
    <div className="app-shell">
      <Header />
      
      <div className="app-body">
        <Sidebar />
        
        <main className="app-main-content">
          <Outlet />
        </main>
      </div>

      {/* Toast Notification Container */}
      <div className="toast-container">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.9 }}
              className={`toast toast--${toast.type}`}
            >
              <div className="toast-icon">
                {toast.type === 'success' && <CheckCircle size={20} />}
                {toast.type === 'error' && <AlertCircle size={20} />}
                {toast.type === 'info' && <Info size={20} />}
                {toast.type === 'warning' && <AlertCircle size={20} />}
              </div>
              <div className="toast-content">
                <h4 className="toast-title">{toast.title}</h4>
                {toast.message && <p className="toast-message">{toast.message}</p>}
              </div>
              <button
                className="toast-close"
                onClick={() => removeToast(toast.id)}
                aria-label="Close notification"
              >
                <X size={16} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
