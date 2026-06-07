'use client';

import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip, Legend,
} from 'recharts';
import { useStore } from '@/store/useStore';
import { CHART_COLORS } from '@/lib/constants';

function CustomTooltip({ active, payload }: { active?: boolean; payload?: { value: number; name: string }[] }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-3 py-2 rounded-lg text-xs" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <span style={{ color: 'var(--text-muted)' }}>{p.name}:</span>
          <span className="font-mono font-bold" style={{ color: '#6366f1' }}>{Math.round(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

export default function RadarSkillChart() {
  const { stats } = useStore();
  const { dsaAnalytics, devAnalytics, roadmapAnalytics } = stats;

  const data = [
    { subject: 'DSA Streak', value: Math.min(100, dsaAnalytics.currentStreak * 5), fullMark: 100 },
    { subject: 'Consistency', value: dsaAnalytics.consistencyScore, fullMark: 100 },
    { subject: 'Hard Problems', value: Math.min(100, dsaAnalytics.hard * 4), fullMark: 100 },
    { subject: 'Projects', value: Math.min(100, (devAnalytics.byCategory?.Project || 0) * 10), fullMark: 100 },
    { subject: 'Deployments', value: Math.min(100, (devAnalytics.byCategory?.Deployment || 0) * 20), fullMark: 100 },
    { subject: 'Goal Rate', value: roadmapAnalytics.completionRate, fullMark: 100 },
    { subject: 'Velocity', value: Math.min(100, dsaAnalytics.velocity * 20), fullMark: 100 },
    { subject: 'Dev Growth', value: devAnalytics.growthScore, fullMark: 100 },
  ];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart data={data} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
        <PolarGrid stroke="rgba(255,255,255,0.08)" />
        <PolarAngleAxis
          dataKey="subject"
          tick={{ fill: CHART_COLORS.text, fontSize: 10 }}
        />
        <PolarRadiusAxis
          angle={90}
          domain={[0, 100]}
          tick={{ fill: CHART_COLORS.text, fontSize: 8 }}
          tickCount={4}
          axisLine={false}
        />
        <Radar
          name="Skill Score"
          dataKey="value"
          stroke="#6366f1"
          fill="#6366f1"
          fillOpacity={0.2}
          strokeWidth={2}
          dot={{ fill: '#6366f1', r: 3 }}
          activeDot={{ r: 5, fill: '#818cf8' }}
        />
        <Tooltip content={<CustomTooltip />} />
      </RadarChart>
    </ResponsiveContainer>
  );
}
