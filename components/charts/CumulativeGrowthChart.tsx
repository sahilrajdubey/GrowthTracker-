'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { useStore } from '@/store/useStore';
import { CHART_COLORS } from '@/lib/constants';
import type { CumulativePoint } from '@/lib/types';

interface CustomTooltipProps {
  active?: boolean;
  payload?: { value: number; name: string; color: string }[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length || !label) return null;
  return (
    <div
      className="px-3 py-2 rounded-lg text-xs shadow-xl"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        backdropFilter: 'blur(20px)',
      }}
    >
      <p className="font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
        {label}
      </p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span style={{ color: 'var(--text-muted)' }}>{p.name}:</span>
          <span className="font-mono font-bold" style={{ color: p.color }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function CumulativeGrowthChart() {
  const { stats } = useStore();
  const { cumulativePoints } = stats.dsaAnalytics;

  const data = cumulativePoints.slice(-180).map((p: CumulativePoint) => ({
    date: (() => {
      try { return format(parseISO(p.date), 'MMM d'); } catch { return p.date; }
    })(),
    total: p.total,
    weighted: p.weighted,
    easy: p.easy,
    medium: p.medium,
    hard: p.hard,
  }));

  if (data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          No data yet — start solving problems!
        </p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
        <defs>
          <linearGradient id="gradTotal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.3} />
            <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gradWeighted" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={CHART_COLORS.secondary} stopOpacity={0.2} />
            <stop offset="95%" stopColor={CHART_COLORS.secondary} stopOpacity={0} />
          </linearGradient>
        </defs>
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
          width={35}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="weighted"
          name="Weighted"
          stroke={CHART_COLORS.secondary}
          strokeWidth={1.5}
          fill="url(#gradWeighted)"
          strokeDasharray="4 2"
          dot={false}
          activeDot={{ r: 4, fill: CHART_COLORS.secondary }}
        />
        <Area
          type="monotone"
          dataKey="total"
          name="Total"
          stroke={CHART_COLORS.primary}
          strokeWidth={2}
          fill="url(#gradTotal)"
          dot={false}
          activeDot={{ r: 4, fill: CHART_COLORS.primary }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
