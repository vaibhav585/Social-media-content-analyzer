import React, { useState } from 'react';
import { api } from '../../services/api';
import { useUIStore } from '../../store/uiStore';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Swords, RefreshCw, Trophy, AlertTriangle, ArrowRight } from 'lucide-react';
import type { Platform, BenchmarkComparison } from '../../../../shared/types';
import { PLATFORM_CONFIG } from '../../utils/constants';

interface ComparisonViewProps {
  analysisId: string;
  userText: string;
  platform: Platform;
}

export function ComparisonView({ analysisId, userText, platform }: ComparisonViewProps) {
  const [competitorText, setCompetitorText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<BenchmarkComparison | null>(null);
  const { addToast } = useUIStore();

  const handleBenchmark = async () => {
    if (!competitorText.trim()) {
      addToast({ type: 'error', title: 'Input Required', message: 'Please paste a competitor post.' });
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post('/benchmark', {
        analysisId,
        competitorText,
        platform,
      });

      if (response.data?.benchmark?.comparison) {
        setResult(response.data.benchmark.comparison);
      }
    } catch (error) {
      console.error(error);
      addToast({ type: 'error', title: 'Benchmark Failed', message: 'Could not compare posts.' });
    } finally {
      setIsLoading(false);
    }
  };

  const chartData = result ? [
    {
      subject: 'Hook',
      You: result.userBreakdown.hookStrength.score,
      Competitor: result.competitorBreakdown.hookStrength.score,
    },
    {
      subject: 'Emotion',
      You: result.userBreakdown.emotionalResonance.score,
      Competitor: result.competitorBreakdown.emotionalResonance.score,
    },
    {
      subject: 'CTA',
      You: result.userBreakdown.ctaClarity.score,
      Competitor: result.competitorBreakdown.ctaClarity.score,
    },
    {
      subject: 'Readability',
      You: result.userBreakdown.readability.score,
      Competitor: result.competitorBreakdown.readability.score,
    },
    {
      subject: 'Hashtags',
      You: result.userBreakdown.hashtagEffectiveness.score,
      Competitor: result.competitorBreakdown.hashtagEffectiveness.score,
    },
  ] : [];

  return (
    <div style={{ background: 'var(--bg-secondary)', borderRadius: '16px', border: '1px solid var(--border-color)', padding: '24px', marginTop: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <div style={{ padding: '8px', background: 'rgba(244, 63, 94, 0.1)', borderRadius: '8px' }}>
          <Swords size={20} color="#f43f5e" />
        </div>
        <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--text-primary)', margin: 0 }}>Competitor Benchmark</h3>
      </div>

      {!result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>
            Curious how your post stacks up against a competitor? Paste their post below to run a head-to-head algorithmic analysis.
          </p>
          <textarea
            value={competitorText}
            onChange={(e) => setCompetitorText(e.target.value)}
            placeholder="Paste competitor's post here..."
            className="custom-scrollbar"
            style={{ width: '100%', height: '128px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px', color: 'var(--text-primary)', outline: 'none', resize: 'vertical' }}
          />
          <button
            onClick={handleBenchmark}
            disabled={isLoading || !competitorText.trim()}
            className="btn btn-dark"
            style={{ width: '100%', padding: '14px' }}
          >
            {isLoading ? <RefreshCw size={20} className="spin-anim" /> : <Swords size={20} />}
            {isLoading ? 'Running Benchmark...' : 'Compare Posts'}
          </button>
        </div>
      )}

      {result && (
        <div className="fade-in">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '32px', marginBottom: '32px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, textAlign: 'center', background: 'var(--bg-primary)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(99, 102, 241, 0.3)', position: 'relative' }}>
              <h4 style={{ color: 'var(--text-secondary)', fontWeight: 500, marginBottom: '8px' }}>Your Score</h4>
              <div style={{ fontSize: '48px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{result.userScore}</div>
              {result.userScore > result.competitorScore && (
                <Trophy size={24} color="#eab308" style={{ position: 'absolute', top: '16px', right: '16px' }} />
              )}
            </div>

            <div style={{ flexShrink: 0, padding: '12px', background: 'var(--bg-primary)', borderRadius: '50%', border: '1px solid var(--border-color)' }}>
              <span style={{ color: 'var(--text-secondary)', fontWeight: 'bold', fontStyle: 'italic' }}>VS</span>
            </div>

            <div style={{ flex: 1, textAlign: 'center', background: 'var(--bg-primary)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(225, 29, 72, 0.3)', position: 'relative' }}>
              <h4 style={{ color: 'var(--text-secondary)', fontWeight: 500, marginBottom: '8px' }}>Competitor</h4>
              <div style={{ fontSize: '48px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{result.competitorScore}</div>
              {result.competitorScore > result.userScore && (
                <Trophy size={24} color="#eab308" style={{ position: 'absolute', top: '16px', right: '16px' }} />
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
            <div style={{ height: '256px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
                  <PolarGrid stroke="var(--border-color)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
                  <Radar name="You" dataKey="You" stroke="var(--brand-primary)" fill="var(--brand-primary)" fillOpacity={0.4} />
                  <Radar name="Competitor" dataKey="Competitor" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.4} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f43f5e', fontWeight: 500, margin: '0 0 12px 0' }}>
                  <AlertTriangle size={16} /> Where They Beat You
                </h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {result.whatTheyDidBetter.map((item, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                      <ArrowRight size={16} color="var(--text-secondary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--brand-primary)', fontWeight: 500, margin: '0 0 12px 0' }}>
                  <Trophy size={16} /> Your Strengths
                </h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {result.yourStrengths.map((item, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                      <Check size={16} color="var(--brand-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <button 
            onClick={() => setResult(null)}
            className="btn btn-outline"
            style={{ width: '100%', marginTop: '24px' }}
          >
            Compare Another Post
          </button>
        </div>
      )}
    </div>
  );
}

// Needed to make it compile due to missing Check icon above:
import { Check } from 'lucide-react';
