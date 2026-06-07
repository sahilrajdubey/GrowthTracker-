'use client';

import {
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { useStore } from '@/store/useStore';
import { computeRollingAverage } from '@/lib/analytics';
import { CHART_COLORS } from '@/lib/constants';

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string; color: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-3 py-2 rounded-lg text-xs" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      <p className="font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span style={{ color: 'var(--text-muted)' }}>{p.name}:</span>
          <span className="font-mono font-bold" style={{ color: p.color }}>{typeof p.value === 'number' ? p.value.toFixed(2) : p.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function MomentumChart() {
  const { stats } = useStore();
  const { dailyCounts } = stats.dsaAnalytics;

  const rollingData = computeRollingAverage(dailyCounts.slice(-60), 7);

  const data = rollingData.map((d) => ({
    date: (() => {
      try { return format(parseISO(d.date), 'MMM d'); } catch { return d.date; }
    })(),
    daily: d.count,
    rolling7: d.rolling,
  }));

  const avgVelocity = stats.dsaAnalytics.velocity;

  if (data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No data yet</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
        <XAxis
          dataKey="date"
          tick={{ fill: CHART_COLORS.text, fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          interval={Math.max(1, Math.floor(data.length / 8))}
        />
        <YAxis
          tick={{ fill: CHART_COLORS.text, fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          width={25}
        />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine
          y={avgVelocity}
          stroke="#f59e0b"
          strokeDasharray="4 2"
          label={{ value: `Avg ${avgVelocity.toFixed(1)}/d`, fill: '#f59e0b', fontSize: 10 }}
        />
        <Bar
          dataKey="daily"
          name="Daily"
          fill={CHART_COLORS.primary}
          fillOpacity={0.3}
          radius={[2, 2, 0, 0]}
        />
        <Line
          type="monotone"
          dataKey="rolling7"
          name="7-day avg"
          stroke={CHART_COLORS.accent1}
          strokeWidth={2.5}
          dot={false}
          activeDot={{ r: 4 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
