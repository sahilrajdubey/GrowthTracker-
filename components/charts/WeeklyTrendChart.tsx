'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, ReferenceLine,
} from 'recharts';
import { useStore } from '@/store/useStore';
import { CHART_COLORS } from '@/lib/constants';

export default function WeeklyTrendChart() {
  const { stats } = useStore();
  const { weeklyCounts } = stats.dsaAnalytics;

  const data = weeklyCounts.slice(-12).map((w) => ({
    week: w.week.slice(5), // MM-DD
    count: w.count,
  }));

  const avg = data.length > 0 ? data.reduce((s, d) => s + d.count, 0) / data.length : 0;
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  if (data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No data yet</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} vertical={false} />
        <XAxis
          dataKey="week"
          tick={{ fill: CHART_COLORS.text, fontSize: 10 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: CHART_COLORS.text, fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          width={25}
        />
        <Tooltip
          formatter={(value: any) => [value, 'Problems']}
          contentStyle={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            fontSize: 12,
          }}
          labelStyle={{ color: 'var(--text-secondary)' }}
          itemStyle={{ color: '#6366f1' }}
        />
        <ReferenceLine
          y={avg}
          stroke="#f59e0b"
          strokeDasharray="4 2"
          label={{ value: `Avg ${avg.toFixed(1)}`, fill: '#f59e0b', fontSize: 10 }}
        />
        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={
                entry.count === maxCount
                  ? '#6366f1'
                  : entry.count >= avg
                  ? 'rgba(99,102,241,0.5)'
                  : 'rgba(99,102,241,0.25)'
              }
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
