'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import { GripVertical, Calendar, CheckCircle2, Clock, Play, Trash2, Pencil } from 'lucide-react';
import type { RoadmapMilestone } from '@/lib/types';
import { formatDate, cn } from '@/lib/utils';

interface Props {
  milestone: RoadmapMilestone;
  onEdit: (m: RoadmapMilestone) => void;
  onDelete: (id: string) => void;
  onComplete: (id: string) => void;
  onStart: (id: string) => void; // updates status to 'in-progress'
}

const DIFF_COLORS = {
  Easy: '#10b981',
  Medium: '#f59e0b',
  Hard: '#ef4444',
  Epic: '#ec4899',
};

export default function MilestoneCard({ milestone, onEdit, onDelete, onComplete, onStart }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: milestone.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : 'auto',
  };

  const diffColor = DIFF_COLORS[milestone.difficulty];

  // Calculate days remaining if deadline is set
  const getDaysRemaining = (deadlineStr: string) => {
    const deadline = new Date(deadlineStr);
    const today = new Date();
    today.setHours(0,0,0,0);
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    return `${diffDays} days left`;
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'glass-card p-4 flex gap-3 items-start relative group transition-all duration-200',
        milestone.status === 'completed' && 'opacity-60 hover:opacity-100'
      )}
    >
      {/* Drag Grip Handle */}
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1 hover:bg-[rgba(255,255,255,0.04)] rounded text-zinc-500 hover:text-white"
        title="Drag to reorder"
      >
        <GripVertical size={16} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
            style={{
              background: `${diffColor}15`,
              color: diffColor,
              border: `1px solid ${diffColor}30`,
            }}
          >
            {milestone.difficulty}
          </span>
          {milestone.category && (
            <span
              className="text-[10px] px-1.5 py-0.5 rounded"
              style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}
            >
              {milestone.category}
            </span>
          )}
          <span
            className="text-[10px] flex items-center gap-1 font-medium"
            style={{
              color:
                milestone.status === 'completed'
                  ? '#10b981'
                  : milestone.status === 'in-progress'
                  ? '#f59e0b'
                  : 'var(--text-muted)',
            }}
          >
            {milestone.status === 'completed' ? (
              <>
                <CheckCircle2 size={10} /> Completed
              </>
            ) : milestone.status === 'in-progress' ? (
              <>
                <Clock size={10} className="animate-spin-slow" /> In Progress
              </>
            ) : (
              'Pending'
            )}
          </span>
        </div>

        <h3
          className={cn(
            'text-sm font-semibold leading-snug truncate',
            milestone.status === 'completed' && 'line-through text-zinc-500'
          )}
          style={{ color: milestone.status !== 'completed' ? 'var(--text-primary)' : undefined }}
        >
          {milestone.title}
        </h3>

        {milestone.description && (
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            {milestone.description}
          </p>
        )}

        {/* Footer Info */}
        <div className="flex items-center justify-between pt-1 text-[10px] text-zinc-500">
          <div className="flex items-center gap-3">
            {milestone.deadline && (
              <div className="flex items-center gap-1" title={`Deadline: ${formatDate(milestone.deadline)}`}>
                <Calendar size={10} />
                <span className={cn(
                  getDaysRemaining(milestone.deadline) === 'Overdue' && 'text-red-400 font-semibold'
                )}>
                  {getDaysRemaining(milestone.deadline)}
                </span>
              </div>
            )}
            {milestone.completedAt && (
              <span>Done: {formatDate(milestone.completedAt)}</span>
            )}
          </div>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-1">
        {/* Status transition button */}
        {milestone.status === 'pending' && (
          <button
            onClick={() => onStart(milestone.id)}
            className="p-1.5 rounded-lg hover:bg-[rgba(245,158,11,0.15)] text-zinc-400 hover:text-amber-400 transition-colors"
            title="Start milestone"
          >
            <Play size={12} fill="currentColor" className="ml-0.5" />
          </button>
        )}
        {milestone.status !== 'completed' && (
          <button
            onClick={() => onComplete(milestone.id)}
            className="p-1.5 rounded-lg hover:bg-[rgba(16,185,129,0.15)] text-zinc-400 hover:text-emerald-400 transition-colors"
            title="Complete milestone"
          >
            <CheckCircle2 size={12} />
          </button>
        )}

        {/* Edit and Delete */}
        <button
          onClick={() => onEdit(milestone)}
          className="p-1.5 rounded-lg hover:bg-[rgba(99,102,241,0.1)] text-zinc-400 hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-all"
          title="Edit milestone"
        >
          <Pencil size={12} />
        </button>
        <button
          onClick={() => onDelete(milestone.id)}
          className="p-1.5 rounded-lg hover:bg-[rgba(239,68,68,0.1)] text-zinc-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
          title="Delete milestone"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
}
