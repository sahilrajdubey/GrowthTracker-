'use client';

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Legend,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { useStore } from '@/store/useStore';
import { CHART_COLORS } from '@/lib/constants';
import type { ForecastPoint } from '@/lib/types';

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string; color: string; dataKey: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  const isProjected = payload[0]?.dataKey !== 'projected' || payload.some(p => p.dataKey === 'optimistic');
  return (
    <div className="px-3 py-2 rounded-lg text-xs" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      <p className="font-medium mb-1" style={{ color: isProjected ? '#f59e0b' : 'var(--text-secondary)' }}>
        {label}{isProjected ? ' (Projected)' : ''}
      </p>
      {payload.map((p) => (
        p.value !== undefined && (
          <div key={p.name} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            <span style={{ color: 'var(--text-muted)' }}>{p.name}:</span>
            <span className="font-mono font-bold" style={{ color: p.color }}>{Math.round(p.value)}</span>
          </div>
        )
      ))}
    </div>
  );
}

export default function TrajectoryForecast() {
  const { stats } = useStore();
  const { forecast } = stats.dsaAnalytics;

  const data = forecast.map((p: ForecastPoint) => ({
    date: (() => {
      try { return format(parseISO(p.date), 'MMM d'); } catch { return p.date; }
    })(),
    projected: p.projected,
    optimistic: p.isProjected ? p.optimistic : undefined,
    conservative: p.isProjected ? p.conservative : undefined,
    isProjected: p.isProjected,
  }));

  // Find the split point
  const splitIdx = data.findIndex((d) => d.isProjected);

  if (data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No data yet</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
        <defs>
          <linearGradient id="gradProjected" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gradOptimistic" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gradConservative" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.08} />
            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
        <XAxis
          dataKey="date"
          tick={{ fill: CHART_COLORS.text, fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          interval={Math.max(1, Math.floor(data.length / 10))}
        />
        <YAxis
          tick={{ fill: CHART_COLORS.text, fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          width={40}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: 10, color: CHART_COLORS.text }} iconType="circle" iconSize={7} />

        {splitIdx > 0 && (
          <ReferenceLine
            x={data[splitIdx]?.date}
            stroke="rgba(245,158,11,0.4)"
            strokeDasharray="4 2"
            label={{ value: 'Today', fill: '#f59e0b', fontSize: 10, position: 'insideTopRight' }}
          />
        )}

        <Area
          type="monotone"
          dataKey="conservative"
          name="Conservative"
          stroke="#f59e0b"
          strokeWidth={1}
          strokeDasharray="3 3"
          fill="url(#gradConservative)"
          dot={false}
          connectNulls
        />
        <Area
          type="monotone"
          dataKey="optimistic"
          name="Optimistic"
          stroke="#10b981"
          strokeWidth={1}
          strokeDasharray="3 3"
          fill="url(#gradOptimistic)"
          dot={false}
          connectNulls
        />
        <Area
          type="monotone"
          dataKey="projected"
          name="Projected"
          stroke="#6366f1"
          strokeWidth={2.5}
          fill="url(#gradProjected)"
          dot={false}
          activeDot={{ r: 4 }}
          connectNulls
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
