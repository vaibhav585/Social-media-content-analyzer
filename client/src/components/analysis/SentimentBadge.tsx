// =============================================================================
// Sentiment Badge Component
// Displays sentiment state (Positive / Negative / Neutral / Mixed) with icons.
// =============================================================================

import { SENTIMENT_CONFIG } from '../../utils/constants';
import type { Sentiment } from '../../types';

interface SentimentBadgeProps {
  sentiment: Sentiment;
}

export default function SentimentBadge({ sentiment }: SentimentBadgeProps) {
  const config = SENTIMENT_CONFIG[sentiment] || SENTIMENT_CONFIG.neutral;

  return (
    <span
      className="sentiment-badge"
      style={{
        backgroundColor: `${config.color}15`,
        color: config.color,
        borderColor: `${config.color}40`,
      }}
    >
      <span className="sentiment-icon">{config.icon}</span>
      <span className="sentiment-label">{config.label} Sentiment</span>
    </span>
  );
}
