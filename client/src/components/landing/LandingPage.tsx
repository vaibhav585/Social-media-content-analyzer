import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, BarChart2, Zap, Target, Layers, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export default function LandingPage() {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="landing-nav">
        <div className="landing-nav-container">
          <div className="landing-brand">
            <div className="landing-logo-icon">
              <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="32" height="32" rx="8" fill="var(--brand-primary)" fillOpacity="0.1" />
                <path d="M8 16L13 21L19 11L24 16" stroke="var(--brand-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="13" cy="21" r="2" fill="var(--brand-primary)" />
                <circle cx="19" cy="11" r="2" fill="var(--brand-primary)" />
              </svg>
            </div>
            <span className="landing-brand-text">ContentPulse</span>
          </div>
          <div className="landing-nav-links">
            <a href="#features">Features</a>
            <a href="#audience">Solutions</a>
            {isAuthenticated ? (
              <Link to="/analyze" className="btn btn-primary landing-cta-nav">Go to Dashboard</Link>
            ) : (
              <>
                <Link to="/login" className="landing-login-link">Log in</Link>
                <Link to="/signup" className="btn btn-primary landing-cta-nav">Get Started</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="landing-hero">
        <div className="landing-hero-bg">
          <div className="landing-hero-grid" />
          <div className="landing-hero-glow" />
        </div>
        <div className="landing-hero-content">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Social Media Analytics for the AI Era
          </motion.h1>
          <motion.p 
            className="landing-hero-sub"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Predict, analyze, and optimize your posts for maximum engagement before you publish. Stop guessing and let data drive your content strategy.
          </motion.p>
          <motion.div 
            className="landing-hero-ctas"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {isAuthenticated ? (
              <Link to="/analyze" className="btn btn-primary btn-large">Go to Dashboard</Link>
            ) : (
              <Link to="/login" className="btn btn-primary btn-large">Start Analyzing</Link>
            )}
          </motion.div>
        </div>

        {/* Hero Dashboard Mockup */}
        <motion.div 
          className="landing-mockup-container"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="landing-mockup">
            <div className="mockup-header">
              <div className="mockup-dots">
                <span/><span/><span/>
              </div>
            </div>
            <div className="mockup-body">
              <div className="mockup-sidebar"></div>
              <div className="mockup-main">
                <div className="mockup-card mockup-score">
                  <div className="mockup-score-circle">94</div>
                  <div className="mockup-score-text">Viral Potential</div>
                </div>
                <div className="mockup-card mockup-chart"></div>
                <div className="mockup-card mockup-text"></div>
              </div>
            </div>
          </div>
        </motion.div>
      </header>

      {/* Features Zig-Zag */}
      <section id="features" className="landing-section">
        <div className="landing-container">
          <div className="section-header">
            <h2>Engineering Viral Content</h2>
            <p>Advanced metrics and actionable insights to transform your digital presence.</p>
          </div>

          <div className="feature-zigzag">
            {/* Feature 1 */}
            <div className="feature-row">
              <div className="feature-content">
                <div className="feature-icon"><Activity size={24} /></div>
                <h3>Predictive Analytics Engine</h3>
                <p>Stop guessing what works. Our advanced language models analyze your drafts against top-performing industry benchmarks to predict engagement metrics instantly.</p>
              </div>
              <div className="feature-visual">
                <div className="visual-card">
                  <div className="visual-bar" style={{ width: '85%' }}>Tone Match</div>
                  <div className="visual-bar" style={{ width: '92%' }}>Readability</div>
                  <div className="visual-bar highlight" style={{ width: '96%' }}>Predicted Reach</div>
                </div>
              </div>
            </div>

            {/* Feature 2 (Reversed) */}
            <div className="feature-row reversed">
              <div className="feature-content">
                <div className="feature-icon"><BarChart2 size={24} /></div>
                <h3>Data-Driven Competitor Insights</h3>
                <p>Compare your tone, structure, and readability metrics against industry leaders to uncover exact gaps in your content strategy. Stay one step ahead of the algorithm.</p>
              </div>
              <div className="feature-visual">
                <div className="visual-card competitor-card">
                  <div className="competitor-line you">Your Draft: 94%</div>
                  <div className="competitor-line industry">Industry Avg: 72%</div>
                </div>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="feature-row">
              <div className="feature-content">
                <div className="feature-icon"><Zap size={24} /></div>
                <h3>Automated Content Optimization</h3>
                <p>Eliminate engagement drop-offs. ContentPulse provides one-click rewrites tailored to your specific brand voice and target audience, ensuring maximum impact.</p>
              </div>
              <div className="feature-visual">
                <div className="visual-card rewrite-card">
                  <div className="rewrite-old">"Our new product is launching tomorrow..."</div>
                  <div className="rewrite-arrow">↓</div>
                  <div className="rewrite-new">"The wait is over. Here is how our new launch will transform your workflow tomorrow."</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Audience Grid */}
      <section id="audience" className="landing-section bg-alt">
        <div className="landing-container">
          <div className="section-header">
            <h2>Built for Strategic Growth</h2>
            <p>Empowering teams to execute flawless content strategies at scale.</p>
          </div>
          <div className="audience-grid">
            <div className="audience-card">
              <Target size={32} className="audience-icon" />
              <h4>Marketing Agencies</h4>
              <p>Validate copy and secure client approvals faster with data-backed predictions. Prove the value of your content before it goes live.</p>
            </div>
            <div className="audience-card">
              <Layers size={32} className="audience-icon" />
              <h4>Content Strategists</h4>
              <p>Maintain rigorous brand consistency across multiple channels without manual oversight. Align every post with your core messaging.</p>
            </div>
            <div className="audience-card">
              <ShieldCheck size={32} className="audience-icon" />
              <h4>Enterprise Brands</h4>
              <p>Scale your social presence confidently. Standardize tone and readability metrics across global marketing teams.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="landing-cta-section">
        <div className="landing-container">
          <div className="cta-box">
            <h2>Secure your competitive advantage.</h2>
            <p>Join data-driven teams who are optimizing their content strategy today.</p>
            <div className="landing-hero-ctas">
              <Link to="/signup" className="btn btn-primary btn-large">Start Analyzing</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-container">
          <div className="footer-content">
            <div className="landing-brand">
              <span className="landing-brand-text">ContentPulse</span>
            </div>
            <div className="footer-links">
              <span>© {new Date().getFullYear()} ContentPulse Inc.</span>
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
