'use client';

import { motion } from 'framer-motion';
import { getScoreColor, getScoreLabel } from '@/lib/utils';
import { useStore } from '@/store/useStore';
import { useAnimatedCounter } from '@/hooks/useAnimatedCounter';

export default function HealthScore() {
  const { stats } = useStore();
  const { overallHealthScore, dsaAnalytics, devAnalytics, roadmapAnalytics } = stats;

  const animatedScore = useAnimatedCounter(overallHealthScore, 1200);
  const color = getScoreColor(overallHealthScore);
  const label = getScoreLabel(overallHealthScore);

  // SVG circle math
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (overallHealthScore / 100) * circumference;

  const subMetrics = [
    { label: 'Consistency', value: dsaAnalytics.consistencyScore, color: '#10b981' },
    { label: 'DSA Growth', value: dsaAnalytics.growthScore, color: '#6366f1' },
    { label: 'Goal Progress', value: roadmapAnalytics.completionRate, color: '#f59e0b' },
    { label: 'Dev Activity', value: Math.min(100, devAnalytics.total * 5), color: '#06b6d4' },
  ];

  return (
    <div className="glass-card p-5">
      <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
        Overall Health Score
      </h3>

      <div className="flex items-center gap-6">
        {/* Radial gauge */}
        <div className="relative flex-shrink-0">
          <svg width="132" height="132" className="-rotate-90">
            {/* Track */}
            <circle
              cx="66" cy="66" r={radius}
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="10"
            />
            {/* Progress */}
            <motion.circle
              cx="66" cy="66" r={radius}
              fill="none"
              stroke={color}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: dashOffset }}
              transition={{ duration: 1.4, ease: 'easeOut', delay: 0.2 }}
              style={{ filter: `drop-shadow(0 0 8px ${color})` }}
            />
          </svg>
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold font-mono" style={{ color }}>
              {animatedScore}
            </span>
            <span className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>
              {label}
            </span>
          </div>
        </div>

        {/* Sub metrics */}
        <div className="flex-1 space-y-2.5">
          {subMetrics.map((metric) => (
            <div key={metric.label}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                  {metric.label}
                </span>
                <span className="text-[11px] font-mono font-semibold" style={{ color: metric.color }}>
                  {metric.value}%
                </span>
              </div>
              <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${metric.value}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut', delay: 0.4 }}
                  className="h-full rounded-full"
                  style={{ background: metric.color, boxShadow: `0 0 6px ${metric.color}60` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
