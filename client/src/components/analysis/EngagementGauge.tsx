// =============================================================================
// Engagement Gauge Component
// Circular animated SVG gauge displaying 0–100 overall score with tier badges.
// =============================================================================

import { motion } from 'framer-motion';
import { getScoreInfo } from '../../utils/constants';

interface EngagementGaugeProps {
  score: number;
}

export default function EngagementGauge({ score }: EngagementGaugeProps) {
  const scoreInfo = getScoreInfo(score);
  const radius = 78;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="engagement-gauge-container">
      <div className="gauge-svg-wrapper">
        <svg className="gauge-svg" width="190" height="190" viewBox="0 0 190 190">
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="50%" stopColor="#a855f7" />
              <stop offset="100%" stopColor={scoreInfo.color} />
            </linearGradient>
            <filter id="gaugeGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor={scoreInfo.color} floodOpacity="0.4" />
            </filter>
          </defs>

          {/* Background Track */}
          <circle
            cx="95"
            cy="95"
            r={radius}
            fill="none"
            stroke="currentColor"
            className="gauge-track"
            strokeWidth={strokeWidth}
          />

          {/* Animated Value Arc */}
          <motion.circle
            cx="95"
            cy="95"
            r={radius}
            fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
            strokeLinecap="round"
            style={{ filter: 'url(#gaugeGlow)' }}
            transform="rotate(-90 95 95)"
          />
        </svg>

        {/* Center Score Readout */}
        <div className="gauge-center-content">
          <motion.span
            className="gauge-score-number"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {score}
          </motion.span>
          <span className="gauge-score-max">/ 100</span>
        </div>
      </div>

      {/* Level Tag */}
      <motion.div
        className="gauge-tier-badge"
        style={{ backgroundColor: `${scoreInfo.color}15`, color: scoreInfo.color, borderColor: `${scoreInfo.color}40` }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <span className="gauge-tier-dot" style={{ backgroundColor: scoreInfo.color }} />
        <span>{scoreInfo.label} Engagement</span>
      </motion.div>
    </div>
  );
}
