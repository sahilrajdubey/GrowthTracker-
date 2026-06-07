'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pencil, Trash2, ChevronDown, ChevronUp, Tag } from 'lucide-react';
import { useStore } from '@/store/useStore';
import type { DSAProblem } from '@/lib/types';
import { formatDate, DIFFICULTY_COLORS } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface Props {
  problem: DSAProblem;
  index: number;
  onEdit: (problem: DSAProblem) => void;
}

const DIFF_BADGE: Record<DSAProblem['difficulty'], string> = {
  Easy: 'tag-easy',
  Medium: 'tag-medium',
  Hard: 'tag-hard',
};

export default function DSAProblemRow({ problem, index, onEdit }: Props) {
  const { deleteDSAProblem } = useStore();
  const [expanded, setExpanded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const color = DIFFICULTY_COLORS[problem.difficulty];

  function handleDelete() {
    if (confirmDelete) {
      deleteDSAProblem(problem.id);
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 2500);
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ delay: index * 0.02, duration: 0.25 }}
      className="group"
    >
      <div
        className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 hover:border-[var(--border-hover)]"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
        }}
      >
        {/* Problem # */}
        <div
          className="flex-shrink-0 w-10 text-center font-mono text-xs font-bold"
          style={{ color: 'var(--text-muted)' }}
        >
          #{problem.number}
        </div>

        {/* Difficulty */}
        <div className="flex-shrink-0">
          <span className={cn('tag', DIFF_BADGE[problem.difficulty])}>
            {problem.difficulty}
          </span>
        </div>

        {/* Title */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
            {problem.title}
          </p>
          {problem.tags.length > 0 && (
            <div className="flex items-center gap-1 mt-0.5 flex-wrap">
              {problem.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="tag" style={{ fontSize: 9, padding: '1px 5px' }}>
                  {tag}
                </span>
              ))}
              {problem.tags.length > 3 && (
                <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
                  +{problem.tags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Date */}
        <div className="hidden sm:block flex-shrink-0 text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
          {formatDate(problem.completedAt)}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="p-1.5 rounded-md transition-all"
            style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}
            title="Expand notes"
          >
            {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
          <button
            onClick={() => onEdit(problem)}
            className="p-1.5 rounded-md transition-all"
            style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8' }}
            title="Edit"
          >
            <Pencil size={12} />
          </button>
          <button
            onClick={handleDelete}
            className="p-1.5 rounded-md transition-all"
            style={{
              background: confirmDelete ? 'rgba(239,68,68,0.25)' : 'rgba(239,68,68,0.08)',
              color: '#f87171',
              border: confirmDelete ? '1px solid rgba(239,68,68,0.4)' : '1px solid transparent',
            }}
            title={confirmDelete ? 'Click again to confirm delete' : 'Delete'}
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {/* Expanded notes */}
      <AnimatePresence>
        {expanded && problem.notes && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div
              className="mx-1 px-4 py-3 rounded-b-lg text-xs leading-relaxed"
              style={{
                background: 'var(--bg-surface)',
                borderLeft: `2px solid ${color}`,
                color: 'var(--text-secondary)',
              }}
            >
              {problem.notes}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
