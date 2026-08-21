// =============================================================================
// AI Provider Badge Component
// Shows which AI model was utilized (Gemini Flash / Groq / Local Heuristics) & latency.
// =============================================================================

import { formatProviderName } from '../../utils/formatters';
import { Sparkles, Zap, ShieldCheck } from 'lucide-react';

interface AIProviderBadgeProps {
  provider: string;
  latencyMs?: number;
}

export default function AIProviderBadge({ provider, latencyMs }: AIProviderBadgeProps) {
  const isLocal = provider === 'local-heuristic';
  const isGroq = provider.startsWith('groq');
  const isGemini = provider.startsWith('gemini');

  return (
    <div className="ai-provider-badge" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>
      <span className="ai-provider-icon" style={{ display: 'flex', alignItems: 'center' }}>
        {isGemini ? <Sparkles size={16} color="var(--brand-primary)" /> : isGroq ? <Zap size={16} color="#3b82f6" /> : <ShieldCheck size={16} color="#10b981" />}
      </span>
      <span className="ai-provider-name">
        {isLocal ? 'Local Heuristic Engine' : `Powered by ${formatProviderName(provider)}`}
      </span>
      {typeof latencyMs === 'number' && latencyMs > 0 && (
        <span className="ai-provider-latency">
          {latencyMs < 1000 ? `${latencyMs}ms` : `${(latencyMs / 1000).toFixed(1)}s`}
        </span>
      )}
    </div>
  );
}
