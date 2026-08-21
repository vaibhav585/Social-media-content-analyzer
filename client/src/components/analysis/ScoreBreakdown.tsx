// =============================================================================
// Score Breakdown Component
// 5-dimension scorecard with animated progress bars & AI reasoning.
// =============================================================================

import React from 'react';
import { motion } from 'framer-motion';
import { BREAKDOWN_CATEGORIES, getScoreInfo } from '../../utils/constants';
import type { AnalysisBreakdown } from '../../types';

interface ScoreBreakdownProps {
  breakdown: AnalysisBreakdown;
}

export default function ScoreBreakdown({ breakdown }: ScoreBreakdownProps) {
  return (
    <div className="score-breakdown-list">
      {BREAKDOWN_CATEGORIES.map((cat, index) => {
        const item = breakdown[cat.key as keyof AnalysisBreakdown];
        if (!item) return null;

        const score = item.score;
        const scoreInfo = getScoreInfo(score);

        return (
          <motion.div
            key={cat.key}
            className="breakdown-card"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * (index + 1), duration: 0.4 }}
          >
            <div className="breakdown-header">
              <div className="breakdown-title-group">
                <span className="breakdown-icon" style={{ display: 'flex', alignItems: 'center', color: 'var(--text-secondary)' }}>
                  {React.createElement(cat.icon as React.ElementType, { size: 18 })}
                </span>
                <div>
                  <h4 className="breakdown-label">{cat.label}</h4>
                  <p className="breakdown-desc">{cat.description}</p>
                </div>
              </div>

              <div
                className="breakdown-score-badge"
                style={{
                  backgroundColor: `${scoreInfo.color}15`,
                  color: scoreInfo.color,
                  borderColor: `${scoreInfo.color}35`,
                }}
              >
                {score}/100
              </div>
            </div>

            {/* Progress Track */}
            <div className="breakdown-track">
              <motion.div
                className="breakdown-fill"
                style={{
                  background: `linear-gradient(90deg, #6366f1, ${scoreInfo.color})`,
                }}
                initial={{ width: 0 }}
                animate={{ width: `${score}%` }}
                transition={{ duration: 1.0, delay: 0.2 + index * 0.1, ease: 'easeOut' }}
              />
            </div>

            {/* AI Reasoning */}
            <p className="breakdown-reasoning">{item.reasoning}</p>
          </motion.div>
        );
      })}
    </div>
  );
}
