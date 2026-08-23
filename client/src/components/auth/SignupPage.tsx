// =============================================================================
// Signup Page
// Email/password signup with name field and Google OAuth.
// =============================================================================

import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';

export default function SignupPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { signUpWithEmail, signInWithGoogle } = useAuthStore();
  const { addToast } = useUIStore();
  const navigate = useNavigate();

  const handleEmailSignup = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await signUpWithEmail(email, password, fullName);
      addToast({ type: 'success', title: 'Account created successfully!' });
      navigate('/analyze');
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
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
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Join to optimize your social media strategy</p>
        </div>



        <form className="auth-form" onSubmit={handleEmailSignup}>
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
            <label htmlFor="signup-name">Full Name</label>
            <input
              id="signup-name"
              type="text"
              placeholder="Jane Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              autoComplete="name"
            />
          </div>

          <div className="auth-field">
            <label htmlFor="signup-email">Email</label>
            <input
              id="signup-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="auth-field">
            <label htmlFor="signup-password">Password</label>
            <input
              id="signup-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              minLength={6}
            />
            <span className="auth-hint">Must be at least 6 characters</span>
          </div>

          <button
            className="auth-submit-btn"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="auth-spinner" />
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?{' '}
          <Link to="/login" className="auth-link">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
