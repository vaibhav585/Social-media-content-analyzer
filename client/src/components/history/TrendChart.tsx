import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { useUIStore } from '../../store/uiStore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingUp, Loader2 } from 'lucide-react';

export function TrendChart() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useUIStore();

  useEffect(() => {
    async function fetchHistory() {
      try {
        const response = await api.get('/analyses');
        if (response.data?.analyses) {
          // Format data for Recharts (reverse to get chronological order)
          const chartData = response.data.analyses
            .slice(0, 10)
            .reverse()
            .map((item: any, index: number) => ({
              name: `Post ${index + 1}`,
              score: item.engagementScore,
              platform: item.platform,
              date: new Date(item.createdAt).toLocaleDateString(),
            }));
          setData(chartData);
        }
      } catch (error) {
        console.error(error);
        addToast({
          type: 'error',
          title: 'Trends Load Failed',
          message: 'Could not fetch trend data.'
        });
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();
  }, [addToast]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px', height: '256px', background: 'var(--bg-secondary)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
        <Loader2 size={32} color="var(--brand-primary)" className="spin-anim mb-4" />
      </div>
    );
  }

  if (data.length < 2) {
    return (
      <div style={{ background: 'var(--bg-secondary)', borderRadius: '16px', border: '1px solid var(--border-color)', padding: '32px', textAlign: 'center', height: '256px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <TrendingUp size={40} color="var(--text-secondary)" style={{ marginBottom: '12px' }} />
        <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>Not Enough Data</h3>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', maxWidth: '320px' }}>
          Analyze at least 2 posts to see your engagement score trends over time.
        </p>
      </div>
    );
  }

  const averageScore = Math.round(data.reduce((acc, curr) => acc + curr.score, 0) / data.length);

  return (
    <div style={{ background: 'var(--bg-secondary)', borderRadius: '16px', border: '1px solid var(--border-color)', padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'var(--brand-primary)', opacity: 0.1, borderRadius: '8px' }}></div>
            <TrendingUp size={20} color="var(--brand-primary)" />
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--text-primary)', margin: 0 }}>Engagement Trend</h2>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Average Score</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--brand-primary)' }}>{averageScore}</div>
        </div>
      </div>

      <div style={{ height: '256px', width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
            <XAxis dataKey="name" stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} axisLine={false} tickLine={false} domain={[0, 100]} />
            <Tooltip
              contentStyle={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)', borderRadius: '12px', color: 'var(--text-primary)' }}
              itemStyle={{ color: 'var(--brand-primary)' }}
              labelStyle={{ color: 'var(--text-secondary)', marginBottom: '4px' }}
            />
            <ReferenceLine y={averageScore} stroke="var(--text-secondary)" strokeDasharray="3 3" label={{ position: 'top', value: 'Avg', fill: 'var(--text-secondary)', fontSize: 10 }} />
            <Line
              type="monotone"
              dataKey="score"
              stroke="#818cf8"
              strokeWidth={3}
              dot={{ r: 4, fill: '#818cf8', strokeWidth: 0 }}
              activeDot={{ r: 6, fill: '#6366f1', strokeWidth: 0 }}
              animationDuration={1500}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
