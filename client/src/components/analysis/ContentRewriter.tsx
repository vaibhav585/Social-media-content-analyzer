import React, { useState, useEffect } from 'react';
import { Sparkles, Check, Copy, RefreshCw, Zap, MessageSquareText } from 'lucide-react';
import { api } from '../../services/api';
import { useUIStore } from '../../store/uiStore';
import type { Platform } from '../../../../shared/types';

interface Persona {
  id: string;
  name: string;
  embeddingCount: number;
}

interface ContentRewriterProps {
  originalText: string;
  platform: Platform;
  analysisId: string;
}

export function ContentRewriter({ originalText, platform, analysisId }: ContentRewriterProps) {
  const [rewrittenText, setRewrittenText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [selectedPersonaId, setSelectedPersonaId] = useState<string>('');
  const { addToast } = useUIStore();

  // Fetch available personas on mount
  useEffect(() => {
    api.get('/personas').then((res) => {
      if (res.data?.personas) {
        setPersonas(res.data.personas);
      }
    }).catch(() => { /* silently fail if personas not available */ });
  }, []);

  const handleRewrite = async () => {
    setIsLoading(true);
    setRewrittenText('');

    try {
      const response = await api.post('/rewrite', {
        analysisId,
        text: originalText,
        platform,
        goal: 'max_engagement',
        personaId: selectedPersonaId || undefined, // RAG tone-matching
      });

      if (response.data.variants && response.data.variants.length > 0) {
        setRewrittenText(response.data.variants[0].rewrittenText);
        addToast({
          type: 'success',
          title: 'Rewrite Complete',
          message: selectedPersonaId
            ? 'Content optimized with your brand voice.'
            : 'Content has been optimized using AI.',
        });
      }
    } catch (error) {
      console.error(error);
      addToast({
        type: 'error',
        title: 'Rewrite Failed',
        message: 'Could not rewrite content at this time.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (rewrittenText) {
      navigator.clipboard.writeText(rewrittenText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      addToast({
        type: 'success',
        title: 'Copied!',
        message: 'Rewritten text copied to clipboard.',
      });
    }
  };

  return (
    <div style={{ padding: '24px', background: 'var(--bg-secondary)', borderRadius: '16px', boxShadow: 'var(--shadow-md)', marginTop: '24px', border: '1px solid var(--border-color)' }}>
      {!rewrittenText && !isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Persona Selector */}
          {personas.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <MessageSquareText size={16} color="var(--brand-primary)" />
              <select
                value={selectedPersonaId}
                onChange={(e) => setSelectedPersonaId(e.target.value)}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value="">Default AI Voice</option>
                {personas.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.embeddingCount} samples)
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={handleRewrite}
            disabled={isLoading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '16px', fontSize: '18px' }}
          >
            <Sparkles size={20} />
            {selectedPersonaId ? 'Rewrite in My Voice' : 'AI Content Rewriter'}
          </button>

          {selectedPersonaId && (
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'center', margin: 0 }}>
              The AI will match your trained brand voice using RAG tone-matching
            </p>
          )}
        </div>
      ) : (
        <div style={{ background: 'var(--bg-primary)', borderRadius: '12px', border: '1px solid var(--border-color)', padding: '20px', maxHeight: '400px', overflowY: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)', position: 'sticky', top: '-20px', background: 'var(--bg-primary)', zIndex: 10, paddingTop: '20px', marginTop: '-20px' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', margin: 0 }}>
              <Sparkles size={16} color="var(--brand-primary)" /> 
              AI Optimized Content
            </h3>
            <button
              onClick={handleRewrite}
              disabled={isLoading}
              className="btn btn-outline"
              style={{ padding: '6px 12px', fontSize: '13px' }}
            >
              <RefreshCw size={14} className={isLoading ? 'spin-anim' : ''} />
              {isLoading ? 'Rewriting...' : 'Rewrite Again'}
            </button>
          </div>
          
          {isLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 0', gap: '12px' }}>
              <RefreshCw size={24} color="var(--brand-primary)" className="spin-anim" />
              <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Rewriting with AI Orchestrator...</span>
            </div>
          ) : (
            <div style={{ position: 'relative', paddingBottom: '40px' }}>
              <p style={{ color: 'var(--text-primary)', fontSize: '14px', lineHeight: '1.6', whiteSpace: 'pre-wrap', margin: 0 }}>{rewrittenText}</p>
              <button
                onClick={copyToClipboard}
                className="btn btn-dark"
                style={{ position: 'absolute', bottom: 0, right: 0, padding: '6px 12px', fontSize: '12px' }}
                title="Copy to clipboard"
              >
                {copied ? <Check size={14} color="#4ade80" /> : <Copy size={14} />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
