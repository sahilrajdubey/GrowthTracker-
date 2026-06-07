'use client';

import { motion } from 'framer-motion';
import { Code2, Flame, Zap, Target, TrendingUp, Calendar } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useAnimatedCounter } from '@/hooks/useAnimatedCounter';
import { formatDate, getDayName } from '@/lib/utils';

export default function DSAStats() {
  const { stats } = useStore();
  const { dsaAnalytics } = stats;

  const total = useAnimatedCounter(dsaAnalytics.total);
  const easy = useAnimatedCounter(dsaAnalytics.easy);
  const medium = useAnimatedCounter(dsaAnalytics.medium);
  const hard = useAnimatedCounter(dsaAnalytics.hard);
  const streak = useAnimatedCounter(dsaAnalytics.currentStreak);

  const statItems = [
    {
      label: 'Total',
      value: total,
      color: '#6366f1',
      icon: <Code2 size={12} />,
    },
    {
      label: 'Easy',
      value: easy,
      color: '#10b981',
      icon: <span className="text-[10px]">E</span>,
    },
    {
      label: 'Medium',
      value: medium,
      color: '#f59e0b',
      icon: <span className="text-[10px]">M</span>,
    },
    {
      label: 'Hard',
      value: hard,
      color: '#ef4444',
      icon: <span className="text-[10px]">H</span>,
    },
    {
      label: 'Streak',
      value: streak,
      suffix: 'd',
      color: '#f97316',
      icon: <Flame size={12} />,
    },
    {
      label: 'Velocity',
      value: dsaAnalytics.velocity,
      suffix: '/d',
      color: '#8b5cf6',
      icon: <Zap size={12} />,
      isDecimal: true,
    },
    {
      label: 'Consistency',
      value: dsaAnalytics.consistencyScore,
      suffix: '%',
      color: '#06b6d4',
      icon: <Target size={12} />,
    },
    {
      label: 'Avg/Day',
      value: dsaAnalytics.averagePerDay,
      color: '#ec4899',
      icon: <TrendingUp size={12} />,
      isDecimal: true,
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl"
      style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
    >
      {statItems.map((item, i) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.03 }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
          style={{ background: `${item.color}10`, border: `1px solid ${item.color}25` }}
        >
          <span style={{ color: item.color }}>{item.icon}</span>
          <div>
            <div className="text-xs font-bold font-mono leading-none" style={{ color: item.color }}>
              {item.isDecimal ? Number(item.value).toFixed(1) : item.value}
              {item.suffix || ''}
            </div>
            <div className="text-[9px] leading-none mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {item.label}
            </div>
          </div>
        </motion.div>
      ))}

      {dsaAnalytics.mostProductiveDay && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg ml-auto"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)' }}
        >
          <Calendar size={11} style={{ color: 'var(--text-muted)' }} />
          <div>
            <div className="text-[10px] font-mono" style={{ color: 'var(--text-secondary)' }}>
              {getDayName(dsaAnalytics.mostProductiveDay)}, {formatDate(dsaAnalytics.mostProductiveDay, 'MMM d')}
            </div>
            <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Most productive</div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
