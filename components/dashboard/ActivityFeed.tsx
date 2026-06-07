'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Code2, Rocket, Map, PlusCircle, Pencil, Trash2, CheckCircle2, Clock
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { formatRelativeTime } from '@/lib/utils';
import type { ActivityItem } from '@/lib/types';

const ACTIVITY_ICONS: Record<ActivityItem['type'], React.ReactNode> = {
  dsa_added: <Code2 size={12} />,
  dsa_edited: <Pencil size={12} />,
  dsa_deleted: <Trash2 size={12} />,
  dev_added: <Rocket size={12} />,
  dev_edited: <Pencil size={12} />,
  dev_deleted: <Trash2 size={12} />,
  milestone_added: <Map size={12} />,
  milestone_completed: <CheckCircle2 size={12} />,
  milestone_deleted: <Trash2 size={12} />,
};

const ACTIVITY_COLORS: Record<ActivityItem['type'], string> = {
  dsa_added: '#6366f1',
  dsa_edited: '#8b5cf6',
  dsa_deleted: '#ef4444',
  dev_added: '#06b6d4',
  dev_edited: '#0ea5e9',
  dev_deleted: '#ef4444',
  milestone_added: '#f59e0b',
  milestone_completed: '#10b981',
  milestone_deleted: '#ef4444',
};

export default function ActivityFeed() {
  const { activityFeed } = useStore();
  const recent = activityFeed.slice(0, 12);

  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
          Recent Activity
        </h3>
        <div
          className="text-[10px] px-2 py-1 rounded-full"
          style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)' }}
        >
          {recent.length} events
        </div>
      </div>

      {recent.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 gap-2">
          <Clock size={28} style={{ color: 'var(--text-muted)' }} />
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No activity yet. Start tracking!</p>
        </div>
      ) : (
        <div className="space-y-0">
          <AnimatePresence>
            {recent.map((item, i) => {
              const color = ACTIVITY_COLORS[item.type];
              const icon = ACTIVITY_ICONS[item.type];
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-start gap-3 py-2.5 border-b last:border-0 group"
                  style={{ borderColor: 'var(--border)' }}
                >
                  {/* Timeline dot */}
                  <div className="relative flex-shrink-0 mt-0.5">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center"
                      style={{ background: `${color}18`, border: `1px solid ${color}30` }}
                    >
                      <span style={{ color }}>{icon}</span>
                    </div>
                    {i < recent.length - 1 && (
                      <div
                        className="absolute top-6 left-1/2 w-px h-full -translate-x-1/2"
                        style={{ background: 'var(--border)' }}
                      />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                      {item.title}
                    </p>
                    {item.subtitle && (
                      <p className="text-[10px] truncate" style={{ color: 'var(--text-muted)' }}>
                        {item.subtitle}
                      </p>
                    )}
                  </div>

                  {/* Time */}
                  <span className="text-[10px] flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
                    {formatRelativeTime(item.timestamp)}
                  </span>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
