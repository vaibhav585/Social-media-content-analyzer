// =============================================================================
// Login Page
// Email/password + Google OAuth sign-in with premium glassmorphism design.
// =============================================================================

import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { signInWithEmail, signInWithGoogle } = useAuthStore();
  const { addToast } = useUIStore();
  const navigate = useNavigate();

  const handleEmailLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await signInWithEmail(email, password);
      addToast({ type: 'success', title: 'Welcome back!' });
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };



  const handleGuestLogin = () => {
    useAuthStore.getState().signInAsGuest();
    addToast({ type: 'info', title: 'Entered Demo Mode', message: 'Explore the full dashboard & upload interface.' });
    navigate('/');
  };

  return (
    <div className="auth-page">
      {/* Modern Tech Grid & Radial Glow Background */}
      <div className="auth-bg">
        <div className="auth-grid-pattern" />
        <div className="auth-radial-glow" />
      </div>

      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {/* Logo & Title */}
        <div className="auth-header">
          <motion.div
            className="auth-logo"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            style={{ background: 'transparent', boxShadow: 'none' }}
          >
            <svg width="48" height="48" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="32" height="32" rx="8" fill="var(--brand-primary)" fillOpacity="0.1" />
              <path d="M8 16L13 21L19 11L24 16" stroke="var(--brand-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="13" cy="21" r="2" fill="var(--brand-primary)" />
              <circle cx="19" cy="11" r="2" fill="var(--brand-primary)" />
            </svg>
          </motion.div>
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Sign in to analyze your social media content</p>
        </div>

        {/* Demo Mode Quick Access Button */}
        <button
          className="demo-mode-btn"
          onClick={handleGuestLogin}
          type="button"
        >
          <span>⚡</span>
          <span>Explore Demo / Instant Preview</span>
          <span className="demo-mode-badge">No Sign-in</span>
        </button>



        {/* Email/Password Form */}
        <form className="auth-form" onSubmit={handleEmailLogin}>
          {error && (
            <motion.div
              className="auth-error"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
            >
              {error}
            </motion.div>
          )}

          <div className="auth-field">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="auth-field">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              minLength={6}
            />
          </div>

          <button
            className="auth-submit-btn"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="auth-spinner" />
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="auth-footer">
          Don't have an account?{' '}
          <Link to="/signup" className="auth-link">
            Create one
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
