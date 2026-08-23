// =============================================================================
// Analysis Dashboard Component
// Master results view rendering engagement gauge, breakdown, suggestions, & platform tips.
// =============================================================================

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles, FileText, ChevronDown, ChevronUp, Share2 } from 'lucide-react';
import EngagementGauge from './EngagementGauge';
import ScoreBreakdown from './ScoreBreakdown';
import SentimentBadge from './SentimentBadge';
import AIProviderBadge from './AIProviderBadge';
import SuggestionsList from './SuggestionsList';
import PlatformTips from './PlatformTips';
import { ContentRewriter } from './ContentRewriter';
import { ComparisonView } from '../benchmark/ComparisonView';
import { PLATFORM_CONFIG } from '../../utils/constants';
import { useAnalysisStore } from '../../store/analysisStore';
import { useUIStore } from '../../store/uiStore';
import type { Analysis } from '../../types';

interface AnalysisDashboardProps {
  analysis: Analysis;
}

export default function AnalysisDashboard({ analysis }: AnalysisDashboardProps) {
  const [showFullText, setShowFullText] = useState(false);
  const { reset } = useAnalysisStore();
  const { addToast } = useUIStore();

  const platformConfig = PLATFORM_CONFIG[analysis.platform] || PLATFORM_CONFIG.instagram;

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    addToast({ type: 'success', title: 'Analysis link copied to clipboard!' });
  };

  return (
    <motion.div
      className="analysis-dashboard"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Original Content Snippet Card */}
      <div className="original-content-card">
        <div className="original-content-header" onClick={() => setShowFullText(!showFullText)}>
          <div className="original-content-meta">
            <FileText size={16} className="text-indigo-400" />
            <span className="original-content-platform flex items-center gap-1.5" style={{ color: platformConfig.color }}>
              {React.createElement(platformConfig.icon as React.ElementType, { size: 16 })} {platformConfig.name} Post Content
            </span>
            <span className="original-content-length">({analysis.originalText.length} characters)</span>
          </div>

          <button className="expand-toggle-btn" aria-label="Toggle content snippet">
            {showFullText ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>

        <div className={`original-content-body ${showFullText ? 'expanded' : 'collapsed'}`}>
          <p className="original-text">{analysis.originalText}</p>
        </div>
      </div>

      {/* Main Grid: Gauge + 5-Dimension Scorecard */}
      <div className="dashboard-main-grid">
        {/* Left Column: Gauge & Overall Insights */}
        <div className="dashboard-score-summary-card">
          <div className="summary-card-header">
            <h3 className="summary-card-title">Overall Viral & Engagement Potential</h3>
          </div>

          <EngagementGauge score={analysis.engagementScore} />

          <div className="summary-highlights">
            <div className="summary-highlight-item">
              <span className="highlight-label">Target Platform</span>
              <span className="highlight-value" style={{ color: platformConfig.color }}>
                {platformConfig.name}
              </span>
            </div>
            <div className="summary-highlight-item">
              <span className="highlight-label">Optimization Score</span>
              <span className="highlight-value">{analysis.engagementScore}/100</span>
            </div>
            <div className="summary-highlight-item">
              <span className="highlight-label">Algorithm Readiness</span>
              <span className="highlight-value text-indigo-400">
                {analysis.engagementScore >= 75 ? 'Ready to Publish' : 'Optimizations Suggested'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: 5 Breakdown Categories */}
        <div className="dashboard-breakdown-card">
          <div className="breakdown-card-header">
            <h3 className="breakdown-card-title">5-Dimension Algorithmic Breakdown</h3>
            <span className="breakdown-card-badge">Detailed Evaluation</span>
          </div>

          <ScoreBreakdown breakdown={analysis.breakdown} />
        </div>
      </div>

      {/* Secondary Grid: Suggestions & Platform Specific Advice */}
      <div className="dashboard-secondary-grid">
        <SuggestionsList suggestions={analysis.suggestions} />

        {/* Phase 3: Content Rewriter */}
        <ContentRewriter 
          originalText={analysis.originalText} 
          platform={analysis.platform} 
          analysisId={analysis.id} 
        />
        
        <PlatformTips platform={analysis.platform} tips={analysis.platformTips} />
      </div>

      {/* Phase 3: Competitor Benchmark */}
      <div className="mt-6">
        <ComparisonView 
          analysisId={analysis.id} 
          userText={analysis.originalText} 
          platform={analysis.platform} 
        />
      </div>
    </motion.div>
  );
}
