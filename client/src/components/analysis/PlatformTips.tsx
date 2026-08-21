// =============================================================================
// Platform Tips Component
// Platform-specific metrics: Optimal length gauge, recommended hashtags, & posting times.
// =============================================================================

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Hash, LayoutTemplate, Layers, Check } from 'lucide-react';
import { PLATFORM_CONFIG } from '../../utils/constants';
import { useUIStore } from '../../store/uiStore';
import type { Platform, PlatformSpecific } from '../../types';

interface PlatformTipsProps {
  platform: Platform;
  tips: PlatformSpecific;
}

export default function PlatformTips({ platform, tips }: PlatformTipsProps) {
  const [copiedTag, setCopiedTag] = useState<string | null>(null);
  const { addToast } = useUIStore();
  const config = PLATFORM_CONFIG[platform] || PLATFORM_CONFIG.instagram;

  const currentLength = tips.currentLength || 0;
  const optimalLength = tips.optimalLength || 150;
  const lengthPercentage = Math.min(100, Math.round((currentLength / optimalLength) * 100));

  const verdictLabel =
    tips.lengthVerdict === 'optimal'
      ? 'Optimal Length'
      : tips.lengthVerdict === 'too_short'
      ? 'Under Recommended Length'
      : 'Exceeds Recommended Length';

  const verdictColor =
    tips.lengthVerdict === 'optimal' ? '#10b981' : tips.lengthVerdict === 'too_short' ? '#f59e0b' : '#ef4444';

  const handleCopyTag = (tag: string) => {
    navigator.clipboard.writeText(tag);
    setCopiedTag(tag);
    addToast({ type: 'success', title: `Copied ${tag} to clipboard!` });
    setTimeout(() => setCopiedTag(null), 1500);
  };

  return (
    <div className="platform-tips-container">
      <div className="platform-tips-header">
        <div className="platform-tips-brand flex items-center gap-2">
          <span className="platform-tips-icon flex items-center" style={{ color: config.color }}>
            {React.createElement(config.icon as React.ElementType, { size: 20 })}
          </span>
          <h3 className="platform-tips-title">{config.name} Optimization Strategy</h3>
        </div>
      </div>

      <div className="platform-tips-grid">
        {/* 1. Length Evaluation Card */}
        <div className="platform-card">
          <div className="platform-card-header">
            <Layers size={16} className="text-indigo-400" />
            <span className="platform-card-label">Character Length Analysis</span>
          </div>

          <div className="length-stats-row">
            <span className="length-count">{currentLength} chars</span>
            <span className="length-target">Target: ~{optimalLength} chars</span>
          </div>

          <div className="length-bar-track">
            <motion.div
              className="length-bar-fill"
              style={{
                width: `${lengthPercentage}%`,
                background: verdictColor,
              }}
              initial={{ width: 0 }}
              animate={{ width: `${lengthPercentage}%` }}
              transition={{ duration: 0.8 }}
            />
          </div>

          <span className="length-verdict" style={{ color: verdictColor }}>
            ● {verdictLabel}
          </span>
        </div>

        {/* 2. Format Suggestion Card */}
        {tips.contentFormatSuggestion && (
          <div className="platform-card">
            <div className="platform-card-header">
              <LayoutTemplate size={16} className="text-purple-400" />
              <span className="platform-card-label">Format Recommendation</span>
            </div>
            <p className="format-suggestion-text">{tips.contentFormatSuggestion}</p>
          </div>
        )}

        {/* 3. Best Posting Times */}
        {tips.bestPostingTimes && tips.bestPostingTimes.length > 0 && (
          <div className="platform-card">
            <div className="platform-card-header">
              <Clock size={16} className="text-blue-400" />
              <span className="platform-card-label">Peak Algorithm Posting Times</span>
            </div>
            <div className="posting-times-list">
              {tips.bestPostingTimes.map((time, idx) => (
                <span key={idx} className="posting-time-pill">
                  🕒 {time}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 4. Hashtag Recommendations */}
        {tips.hashtagRecommendations && tips.hashtagRecommendations.length > 0 && (
          <div className="platform-card">
            <div className="platform-card-header">
              <Hash size={16} className="text-emerald-400" />
              <span className="platform-card-label">Recommended High-Growth Tags</span>
            </div>
            <div className="hashtags-cloud">
              {tips.hashtagRecommendations.map((tag, idx) => (
                <button
                  key={idx}
                  className="hashtag-pill"
                  onClick={() => handleCopyTag(tag)}
                  title="Click to copy hashtag"
                >
                  <span>{tag}</span>
                  {copiedTag === tag ? <Check size={12} className="text-emerald-400" /> : null}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
