'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { cn, getScoreColor } from '@/lib/utils';
import { useAnimatedCounter } from '@/hooks/useAnimatedCounter';

interface StatCardProps {
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
  icon: React.ReactNode;
  color?: string;
  subtext?: string;
  trend?: number; // positive = up, negative = down
  isPercent?: boolean;
  decimals?: number;
  delay?: number;
  size?: 'sm' | 'md' | 'lg';
}

export default function StatCard({
  label,
  value,
  suffix = '',
  prefix = '',
  icon,
  color = '#6366f1',
  subtext,
  trend,
  isPercent,
  decimals = 0,
  delay = 0,
  size = 'md',
}: StatCardProps) {
  const animated = useAnimatedCounter(Math.round(value), 1000);

  const displayValue =
    decimals > 0
      ? value.toFixed(decimals)
      : animated.toString();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: 'easeOut' }}
      whileHover={{ scale: 1.02, y: -2 }}
      className="glass-card glass-card-glow p-4 relative overflow-hidden group cursor-default"
      style={{ '--card-color': color } as React.CSSProperties}
    >
      {/* Subtle background glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-[inherit]"
        style={{
          background: `radial-gradient(ellipse at top left, ${color}10, transparent 70%)`,
        }}
      />

      {/* Top row */}
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: `${color}18`, border: `1px solid ${color}30` }}
        >
          <span style={{ color }}>{icon}</span>
        </div>

        {trend !== undefined && (
          <div
            className="text-[10px] font-medium px-1.5 py-0.5 rounded-full flex items-center gap-0.5"
            style={{
              background: trend >= 0 ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
              color: trend >= 0 ? '#10b981' : '#ef4444',
              border: `1px solid ${trend >= 0 ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`,
            }}
          >
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </div>
        )}
      </div>

      {/* Value */}
      <div className={cn('font-bold font-mono leading-none mb-1', size === 'lg' ? 'text-3xl' : size === 'sm' ? 'text-xl' : 'text-2xl')} style={{ color }}>
        {prefix}{displayValue}{suffix}
      </div>

      {/* Label */}
      <div className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
        {label}
      </div>

      {/* Subtext */}
      {subtext && (
        <div className="text-[10px] mt-1.5" style={{ color: 'var(--text-muted)' }}>
          {subtext}
        </div>
      )}

      {/* Bottom accent line */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.6, delay: delay + 0.2 }}
        className="absolute bottom-0 left-0 right-0 h-[2px] origin-left"
        style={{ background: `linear-gradient(90deg, ${color}, transparent)` }}
      />
    </motion.div>
  );
}
