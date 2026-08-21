// =============================================================================
// Platform Selector
// Select the target platform for analysis.
// =============================================================================

import React from 'react';
import { useAnalysisStore } from '../../store/analysisStore';
import { PLATFORM_CONFIG } from '../../utils/constants';
import type { Platform } from '../../types';

export default function PlatformSelector() {
  const { selectedPlatform, setSelectedPlatform } = useAnalysisStore();

  const platforms = Object.entries(PLATFORM_CONFIG) as [Platform, typeof PLATFORM_CONFIG[Platform]][];

  return (
    <div className="platform-selector">
      <h4 className="platform-selector-title">Select Target Platform</h4>
      <div className="platform-grid">
        {platforms.map(([key, config]) => (
          <button
            key={key}
            className={`platform-btn ${selectedPlatform === key ? 'active' : ''}`}
            onClick={() => setSelectedPlatform(key)}
            style={{
              '--platform-color': config.color,
              '--platform-gradient': config.gradient,
            } as React.CSSProperties}
          >
            <span className="platform-icon">
              {React.createElement(config.icon as React.ElementType, { size: 24 })}
            </span>
            <span className="platform-name">{config.name}</span>
            {selectedPlatform === key && (
              <div className="platform-active-ring" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
