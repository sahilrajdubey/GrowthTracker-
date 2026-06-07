'use client';

import { motion } from 'framer-motion';
import { Rocket, Target, Zap, Folder, CheckSquare, Settings, Award, Layers, ShieldCheck, HelpCircle } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useAnimatedCounter } from '@/hooks/useAnimatedCounter';
import type { DevCategory } from '@/lib/types';

const CAT_ICONS: Record<DevCategory, React.ReactNode> = {
  Project: <Folder size={12} />,
  Feature: <CheckSquare size={12} />,
  Technology: <Settings size={12} />,
  Certification: <Award size={12} />,
  Milestone: <Layers size={12} />,
  Concept: <HelpCircle size={12} />,
  Deployment: <ShieldCheck size={12} />,
};

const CAT_COLORS: Record<DevCategory, string> = {
  Project: '#6366f1',      // Indigo
  Feature: '#06b6d4',      // Cyan
  Technology: '#8b5cf6',   // Violet
  Certification: '#10b981', // Emerald
  Milestone: '#f59e0b',    // Amber
  Concept: '#ec4899',      // Pink
  Deployment: '#f97316',    // Orange
};

export default function DevStats() {
  const { stats } = useStore();
  const { devAnalytics } = stats;

  const total = useAnimatedCounter(devAnalytics.total);
  const growthScore = useAnimatedCounter(devAnalytics.growthScore);
  const recent = useAnimatedCounter(devAnalytics.recentActivity);

  const mainStats = [
    {
      label: 'Achievements',
      value: total,
      color: '#f1f5f9',
      icon: <Rocket size={14} style={{ color: '#818cf8' }} />,
    },
    {
      label: 'Growth Score',
      value: growthScore,
      suffix: '%',
      color: '#8b5cf6',
      icon: <Target size={14} />,
    },
    {
      label: 'Last 30 Days',
      value: recent,
      color: '#10b981',
      icon: <Zap size={14} />,
    },
  ];

  return (
    <div className="flex flex-col gap-3 p-4 rounded-xl"
      style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
    >
      {/* Top Main Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        {mainStats.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-3 p-3 rounded-lg"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)' }}
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: `${item.color}15`, color: item.color }}
            >
              {item.icon}
            </div>
            <div>
              <div className="text-xl font-bold font-mono leading-none" style={{ color: item.color === '#f1f5f9' ? 'var(--text-primary)' : item.color }}>
                {item.value}
                {item.suffix || ''}
              </div>
              <div className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
                {item.label}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Category Breakdown */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
        <span className="text-[10px] font-medium mr-2" style={{ color: 'var(--text-secondary)' }}>Categories:</span>
        {Object.entries(devAnalytics.byCategory).map(([cat, count], i) => {
          const color = CAT_COLORS[cat as DevCategory];
          if (count === 0) return null;
          return (
            <motion.div
              key={cat}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 + i * 0.02 }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
              style={{ background: `${color}10`, border: `1px solid ${color}25`, color }}
            >
              {CAT_ICONS[cat as DevCategory]}
              <span>{cat}</span>
              <span className="font-mono bg-[rgba(255,255,255,0.06)] px-1.5 py-0.2 rounded text-[10px]">{count}</span>
            </motion.div>
          );
        })}
        {devAnalytics.total === 0 && (
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>No development achievements logged yet.</span>
        )}
      </div>
    </div>
  );
}
