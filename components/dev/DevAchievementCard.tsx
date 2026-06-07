'use client';

import { motion } from 'framer-motion';
import { Pencil, Trash2, CheckCircle2, Clock } from 'lucide-react';
import type { DevAchievement } from '@/lib/types';
import { CATEGORY_COLORS, PRIORITY_COLORS, formatDate, truncate } from '@/lib/utils';

interface Props {
  achievement: DevAchievement;
  index: number;
  onEdit: (a: DevAchievement) => void;
  onDelete: (id: string) => void;
}

export default function DevAchievementCard({ achievement, index, onEdit, onDelete }: Props) {
  const catColor = CATEGORY_COLORS[achievement.category];
  const priColor = PRIORITY_COLORS[achievement.priority];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      whileHover={{ y: -3 }}
      className="glass-card p-4 relative overflow-hidden group cursor-default"
    >
      {/* Left accent bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l"
        style={{ background: catColor }}
      />

      {/* Top row */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
            style={{ background: `${catColor}15`, color: catColor, border: `1px solid ${catColor}30` }}
          >
            {achievement.category}
          </span>
          <span
            className="text-[10px] font-bold px-1.5 py-0.5 rounded"
            style={{ background: `${priColor}15`, color: priColor }}
          >
            {achievement.priority}
          </span>
          <span
            className="text-[10px] flex items-center gap-1"
            style={{ color: achievement.status === 'completed' ? '#10b981' : '#f59e0b' }}
          >
            {achievement.status === 'completed' ? <CheckCircle2 size={10} /> : <Clock size={10} />}
            {achievement.status === 'completed' ? 'Done' : 'In Progress'}
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button
            onClick={() => onEdit(achievement)}
            className="p-1.5 rounded-md"
            style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8' }}
          >
            <Pencil size={11} />
          </button>
          <button
            onClick={() => onDelete(achievement.id)}
            className="p-1.5 rounded-md"
            style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171' }}
          >
            <Trash2 size={11} />
          </button>
        </div>
      </div>

      {/* Title */}
      <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
        {achievement.title}
      </h3>

      {/* Description */}
      {achievement.description && (
        <p className="text-xs leading-relaxed mb-2" style={{ color: 'var(--text-secondary)' }}>
          {truncate(achievement.description, 100)}
        </p>
      )}

      {/* Tags */}
      {achievement.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {achievement.tags.slice(0, 4).map((tag) => (
            <span key={tag} className="tag" style={{ fontSize: 10 }}>{tag}</span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
          {formatDate(achievement.completedAt)}
        </span>
        <span
          className="text-[10px] px-1.5 py-0.5 rounded"
          style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}
        >
          {achievement.effort}
        </span>
      </div>
    </motion.div>
  );
}
