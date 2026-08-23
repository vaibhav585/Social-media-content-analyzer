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
      className="bento-dashboard-wrapper"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Top Navigation Bar */}
      <div className="dashboard-top-nav">
        <button className="back-btn" onClick={reset}>
          <ArrowLeft size={18} />
          <span>Analyze Another Post</span>
        </button>

        <div className="dashboard-badges">
          <SentimentBadge sentiment={analysis.sentiment} />
          <AIProviderBadge provider={analysis.aiProvider} latencyMs={analysis.processingTimeMs} />
          <button className="share-btn" onClick={handleShare} title="Share analysis">
            <Share2 size={16} />
          </button>
        </div>
      </div>

      {/* Row 1: Top KPI Cards */}
      <div className="bento-kpi-row">
        <div className="bento-kpi-card">
          <div className="bento-kpi-header">
            <span>Viral Potential</span>
            <Sparkles size={16} className="text-indigo-400" />
          </div>
          <div className="bento-kpi-value">
            {analysis.engagementScore}
            <span style={{ fontSize: '16px', color: 'var(--text-secondary)' }}>/100</span>
          </div>
          <div className={`bento-kpi-trend ${analysis.engagementScore >= 80 ? 'positive' : 'warning'}`}>
            {analysis.engagementScore >= 80 ? '↗ Ready to go viral' : '↘ Needs optimization'}
          </div>
        </div>

        <div className="bento-kpi-card">
          <div className="bento-kpi-header">
            <span>Hook Strength</span>
            <span style={{ fontSize: '16px' }}>🪝</span>
          </div>
          <div className="bento-kpi-value">
            {analysis.breakdown.hookStrength.score}/10
          </div>
          <div className="bento-kpi-subtext">Scroll-stopping power</div>
        </div>

        <div className="bento-kpi-card">
          <div className="bento-kpi-header">
            <span>Readability</span>
            <FileText size={16} color="var(--text-secondary)" />
          </div>
          <div className="bento-kpi-value">
            {analysis.breakdown.readability.score}/10
          </div>
          <div className="bento-kpi-subtext">Cognitive load score</div>
        </div>

        <div className="bento-kpi-card">
          <div className="bento-kpi-header">
            <span>Platform Target</span>
            {React.createElement(platformConfig.icon as React.ElementType, { size: 16, color: platformConfig.color })}
          </div>
          <div className="bento-kpi-value" style={{ fontSize: '24px', paddingTop: '4px' }}>
            {platformConfig.name}
          </div>
          <div className="bento-kpi-subtext">Optimized for algorithm</div>
        </div>
      </div>

      {/* Row 2: Visuals (Breakdown vs Competitor) */}
      <div className="bento-visual-row">
        <div className="bento-card">
          <h3 className="bento-card-title">Algorithmic Dimension Breakdown</h3>
          <ScoreBreakdown breakdown={analysis.breakdown} />
        </div>
        
        <div className="bento-card" style={{ padding: 0, overflow: 'hidden' }}>
          <ComparisonView 
            analysisId={analysis.id} 
            userText={analysis.originalText} 
            platform={analysis.platform} 
          />
        </div>
      </div>

      {/* Row 3: Scrollable Text (Rewrites & Suggestions/Tips) */}
      <div className="bento-text-row">
        <div className="bento-scroll-card">
          <div className="bento-scroll-header">
            <Sparkles size={18} color="var(--brand-primary)" />
            AI Content Rewriter
          </div>
          <div className="bento-scroll-content">
            <ContentRewriter 
              originalText={analysis.originalText} 
              platform={analysis.platform} 
              analysisId={analysis.id} 
            />
          </div>
        </div>

        <div className="bento-scroll-card">
          <div className="bento-scroll-header">
            <span style={{ fontSize: '18px' }}>💡</span>
            Actionable Suggestions
          </div>
          <div className="bento-scroll-content">
            <SuggestionsList suggestions={analysis.suggestions} />
            <div style={{ marginTop: '24px' }}>
              <PlatformTips platform={analysis.platform} tips={analysis.platformTips} />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
