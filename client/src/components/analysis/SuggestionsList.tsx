// =============================================================================
// Suggestions List Component
// Actionable AI-driven improvement recommendations with quick-copy support.
// =============================================================================

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Copy, Sparkles } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';

interface SuggestionsListProps {
  suggestions: string[];
}

export default function SuggestionsList({ suggestions }: SuggestionsListProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const { addToast } = useUIStore();

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    addToast({ type: 'success', title: 'Copied suggestion to clipboard!' });
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div className="suggestions-container">
      <div className="suggestions-header">
        <div className="suggestions-title-group">
          <Sparkles size={18} className="suggestions-icon" />
          <h3 className="suggestions-title">High-Impact Optimization Recommendations</h3>
        </div>
        <span className="suggestions-count">{suggestions.length} Tips</span>
      </div>

      <div className="suggestions-list">
        {suggestions.map((suggestion, index) => (
          <motion.div
            key={index}
            className="suggestion-item"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index, duration: 0.3 }}
          >
            <div className="suggestion-number">{index + 1}</div>
            <p className="suggestion-text">{suggestion}</p>
            <button
              className="suggestion-copy-btn"
              onClick={() => handleCopy(suggestion, index)}
              title="Copy suggestion"
              aria-label="Copy suggestion"
            >
              {copiedIndex === index ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
