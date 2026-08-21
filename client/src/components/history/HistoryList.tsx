import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { useUIStore } from '../../store/uiStore';
import { Clock, ExternalLink, Activity, CalendarDays, Loader2 } from 'lucide-react';
import type { Analysis } from '../../../../shared/types';
import { PLATFORM_CONFIG } from '../../utils/constants';

export function HistoryList() {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useUIStore();

  useEffect(() => {
    async function fetchHistory() {
      try {
        const response = await api.get('/analyses');
        if (response.data?.analyses) {
          setAnalyses(response.data.analyses);
        }
      } catch (error) {
        console.error(error);
        addToast({
          type: 'error',
          title: 'History Load Failed',
          message: 'Could not fetch your previous analyses.'
        });
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();
  }, [addToast]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <Loader2 className="w-8 h-8 text-purple-400 animate-spin mb-4" />
        <p className="text-slate-400">Loading your history...</p>
      </div>
    );
  }

  if (analyses.length === 0) {
    return (
      <div style={{ padding: '32px', textAlign: 'center', background: 'var(--bg-secondary)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
        <Clock className="mx-auto mb-4" size={48} color="var(--text-secondary)" />
        <h3 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>No History Yet</h3>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto' }}>
          You haven't analyzed any posts yet. When you do, they will appear here so you can track your engagement trends over time.
        </p>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--bg-secondary)', borderRadius: '16px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
      <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'var(--brand-primary)', opacity: 0.1, borderRadius: '8px' }}></div>
          <Activity size={20} color="var(--brand-primary)" />
        </div>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--text-primary)', margin: 0 }}>Recent Analyses</h2>
      </div>
      <div style={{ maxHeight: '400px', overflowY: 'auto' }} className="custom-scrollbar">
        {analyses.map((item) => {
          const config = PLATFORM_CONFIG[item.platform];
          const Icon = config.icon;
          
          return (
            <div key={item.id} style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '18px', backgroundColor: `${config.color}20`, color: config.color }}>
                  {item.engagementScore}
                </div>
                
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <Icon size={16} color={config.color} />
                    <span style={{ color: 'var(--text-primary)', fontWeight: 500, textTransform: 'capitalize' }}>{item.platform}</span>
                  </div>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '400px', margin: 0 }}>
                    {item.originalText}
                  </p>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '4px', justifyContent: 'flex-end' }}>
                    <CalendarDays size={14} />
                    {new Date(item.createdAt).toLocaleDateString()}
                  </div>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{item.aiProvider}</span>
                </div>
                
                <button className="btn btn-outline" style={{ padding: '8px' }}>
                  <ExternalLink size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
