'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { useStore } from '@/store/useStore';
import { CHART_COLORS } from '@/lib/constants';

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string; color: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  const total = payload.reduce((s, p) => s + (p.value || 0), 0);
  return (
    <div className="px-3 py-2 rounded-lg text-xs" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      <p className="font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span style={{ color: 'var(--text-muted)' }}>{p.name}:</span>
          <span className="font-mono font-bold" style={{ color: p.color }}>{p.value}</span>
        </div>
      ))}
      <div className="mt-1 pt-1 border-t" style={{ borderColor: 'var(--border)' }}>
        <span style={{ color: 'var(--text-muted)' }}>Total: </span>
        <span className="font-mono font-bold" style={{ color: 'var(--text-primary)' }}>{total}</span>
      </div>
    </div>
  );
}

export default function DifficultyChart() {
  const { stats } = useStore();
  const { weeklyCounts } = stats.dsaAnalytics;

  const data = weeklyCounts.slice(-16).map((w) => ({
    week: (() => {
      try { return format(parseISO(w.week), 'MMM d'); } catch { return w.week; }
    })(),
    Easy: w.easy,
    Medium: w.medium,
    Hard: w.hard,
  }));

  if (data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No data yet</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: -10 }} barGap={2}>
        <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
        <XAxis dataKey="week" tick={{ fill: CHART_COLORS.text, fontSize: 10 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: CHART_COLORS.text, fontSize: 10 }} axisLine={false} tickLine={false} width={30} />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: 11, color: CHART_COLORS.text }}
          iconType="circle"
          iconSize={8}
        />
        <Bar dataKey="Easy" stackId="a" fill={CHART_COLORS.easy} radius={[0, 0, 0, 0]} />
        <Bar dataKey="Medium" stackId="a" fill={CHART_COLORS.medium} />
        <Bar dataKey="Hard" stackId="a" fill={CHART_COLORS.hard} radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
