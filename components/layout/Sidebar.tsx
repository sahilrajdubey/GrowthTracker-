'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Code2,
  BarChart3,
  Rocket,
  Map,
  ChevronLeft,
  ChevronRight,
  Flame,
  Zap,
  TrendingUp,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import type { ActiveModule } from '@/lib/types';
import { cn } from '@/lib/utils';

const NAV_ITEMS: {
  id: ActiveModule;
  label: string;
  Icon: React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>;
  shortcut: string;
  color: string;
}[] = [
  { id: 'dashboard', label: 'Dashboard', Icon: LayoutDashboard, shortcut: '1', color: '#6366f1' },
  { id: 'dsa', label: 'DSA Problems', Icon: Code2, shortcut: '2', color: '#06b6d4' },
  { id: 'analytics', label: 'Analytics', Icon: BarChart3, shortcut: '3', color: '#8b5cf6' },
  { id: 'dev', label: 'Dev Growth', Icon: Rocket, shortcut: '4', color: '#10b981' },
  { id: 'roadmap', label: 'Roadmap', Icon: Map, shortcut: '5', color: '#f59e0b' },
];

export default function Sidebar() {
  const { activeModule, setActiveModule, sidebarCollapsed, toggleSidebar, stats, isHydrated } =
    useStore();

  const { dsaAnalytics } = stats;

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarCollapsed ? 64 : 240 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 z-30 border-r"
      style={{
        background: 'var(--bg-surface)',
        borderColor: 'var(--border)',
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-4 border-b overflow-hidden"
        style={{ height: 'var(--header-height)', borderColor: 'var(--border)', minWidth: 0 }}
      >
        <div
          className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center animate-pulse-glow"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
        >
          <TrendingUp size={16} className="text-white" />
        </div>
        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden"
            >
              <div className="font-bold text-sm gradient-text whitespace-nowrap">
                GrowthTracker
              </div>
              <div className="text-[10px] whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>
                Personal Growth OS
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ id, label, Icon, shortcut, color }) => {
          const active = activeModule === id;
          return (
            <motion.button
              key={id}
              onClick={() => setActiveModule(id)}
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.97 }}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 relative group overflow-hidden',
                active ? 'text-white' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              )}
              style={
                active
                  ? {
                      background: `linear-gradient(135deg, ${color}22, ${color}11)`,
                      border: `1px solid ${color}40`,
                      boxShadow: `0 0 16px ${color}20`,
                    }
                  : { background: 'transparent', border: '1px solid transparent' }
              }
              title={sidebarCollapsed ? label : undefined}
            >
              {active && (
                <motion.div
                  layoutId="nav-active"
                  className="absolute left-0 top-0 bottom-0 w-0.5 rounded-r"
                  style={{ background: color }}
                />
              )}
              <Icon
                size={16}
                className="flex-shrink-0"
                style={{ color: active ? color : undefined }}
              />
              <AnimatePresence>
                {!sidebarCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1 text-left whitespace-nowrap"
                  >
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>
              <AnimatePresence>
                {!sidebarCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-[10px] px-1.5 py-0.5 rounded font-mono"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      color: 'var(--text-muted)',
                    }}
                  >
                    {shortcut}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </nav>

      {/* Stats Summary */}
      <AnimatePresence>
        {!sidebarCollapsed && isHydrated && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mx-2 mb-2 p-3 rounded-lg"
            style={{
              background: 'rgba(99,102,241,0.08)',
              border: '1px solid rgba(99,102,241,0.2)',
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Flame size={12} style={{ color: '#f59e0b' }} />
              <span className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>
                Quick Stats
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="text-lg font-bold font-mono" style={{ color: 'var(--accent-primary)' }}>
                  {dsaAnalytics.total}
                </div>
                <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  Problems
                </div>
              </div>
              <div>
                <div className="text-lg font-bold font-mono" style={{ color: '#f59e0b' }}>
                  {dsaAnalytics.currentStreak}
                </div>
                <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  Day Streak
                </div>
              </div>
            </div>
            <div className="mt-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  Consistency
                </span>
                <span className="text-[10px] font-mono" style={{ color: '#10b981' }}>
                  {dsaAnalytics.consistencyScore}%
                </span>
              </div>
              <div className="h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${dsaAnalytics.consistencyScore}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg, #10b981, #6366f1)' }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collapse Toggle */}
      <button
        onClick={toggleSidebar}
        className="m-2 p-2 rounded-lg flex items-center justify-center transition-all"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid var(--border)',
          color: 'var(--text-muted)',
        }}
      >
        {sidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>
    </motion.aside>
  );
}
