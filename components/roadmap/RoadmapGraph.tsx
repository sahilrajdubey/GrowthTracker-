'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, Play } from 'lucide-react';
import type { RoadmapMilestone } from '@/lib/types';
import { cn } from '@/lib/utils';

interface Props {
  milestones: RoadmapMilestone[];
  onComplete: (id: string) => void;
  onStart: (id: string) => void;
  onEdit: (m: RoadmapMilestone) => void;
}

const DIFF_COLORS = {
  Easy: '#10b981',
  Medium: '#f59e0b',
  Hard: '#ef4444',
  Epic: '#ec4899',
};

export default function RoadmapGraph({ milestones, onComplete, onStart, onEdit }: Props) {
  // Sort milestones by priority index
  const sorted = useMemo(() => {
    return [...milestones].sort((a, b) => a.priority - b.priority);
  }, [milestones]);

  const rowHeight = 120;
  const graphWidth = 600;
  const graphHeight = Math.max(300, sorted.length * rowHeight + 100);

  // Generate coordinates for winding tree path
  const points = useMemo(() => {
    return sorted.map((m, idx) => {
      const y = 80 + idx * rowHeight;
      // Zigzag back and forth: left, middle, right, middle, left, etc.
      // Offset center using sine wave
      const offsetFactor = Math.sin(idx * (Math.PI / 2.5)); // smooth oscillation
      const x = graphWidth / 2 + offsetFactor * (graphWidth * 0.25);
      return { x, y, milestone: m };
    });
  }, [sorted]);

  // Generate SVG path string
  const pathD = useMemo(() => {
    if (points.length < 2) return '';
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const p = points[i - 1];
      const c = points[i];
      // Control points for smooth vertical bezier curve
      const cpY1 = p.y + rowHeight * 0.5;
      const cpY2 = c.y - rowHeight * 0.5;
      d += ` C ${p.x} ${cpY1}, ${c.x} ${cpY2}, ${c.x} ${c.y}`;
    }
    return d;
  }, [points]);

  if (sorted.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-sm text-zinc-500">No milestones yet. Create your first milestone to view the tree graph.</p>
      </div>
    );
  }

  return (
    <div className="relative overflow-x-auto overflow-y-hidden py-4 flex justify-center bg-[rgba(255,255,255,0.01)] rounded-xl border border-[rgba(255,255,255,0.03)]">
      <div className="relative flex-shrink-0" style={{ width: graphWidth, height: graphHeight }}>
        {/* Winding Connection Line */}
        <svg
          className="absolute inset-0 pointer-events-none"
          style={{ width: '100%', height: '100%' }}
        >
          <defs>
            <linearGradient id="roadmap-grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.8" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Underlay / Background path */}
          {points.length > 1 && (
            <path
              d={pathD}
              fill="none"
              stroke="rgba(255,255,255,0.04)"
              strokeWidth={6}
              strokeLinecap="round"
            />
          )}

          {/* Glowing Animated path */}
          {points.length > 1 && (
            <motion.path
              d={pathD}
              fill="none"
              stroke="url(#roadmap-grad)"
              strokeWidth={3}
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.5, ease: 'easeInOut' }}
            />
          )}
        </svg>

        {/* Nodes and Labels */}
        {points.map((pt, idx) => {
          const { x, y, milestone } = pt;
          const isCompleted = milestone.status === 'completed';
          const isInProgress = milestone.status === 'in-progress';
          const diffColor = DIFF_COLORS[milestone.difficulty];

          // Determine label position (alternate left/right based on x value relative to center)
          const isLeft = x > graphWidth / 2;

          return (
            <div
              key={milestone.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 flex items-center z-10"
              style={{ left: x, top: y }}
            >
              {/* Connector dot with custom states */}
              <div className="relative group cursor-pointer">
                {/* Glow ring */}
                {isInProgress && (
                  <div
                    className="absolute inset-0 rounded-full animate-ping opacity-60"
                    style={{ background: '#f59e0b', transform: 'scale(1.8)' }}
                  />
                )}
                {isCompleted && (
                  <div
                    className="absolute inset-0 rounded-full opacity-40 blur-sm"
                    style={{ background: '#10b981', transform: 'scale(2)' }}
                  />
                )}

                {/* Main Node */}
                <motion.div
                  whileHover={{ scale: 1.2 }}
                  onClick={() => onEdit(milestone)}
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-200',
                    isCompleted
                      ? 'bg-emerald-500 border-emerald-400 text-white'
                      : isInProgress
                      ? 'bg-amber-500 border-amber-400 text-black'
                      : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-zinc-500'
                  )}
                  style={{
                    boxShadow: isCompleted
                      ? '0 0 16px rgba(16,185,129,0.6)'
                      : isInProgress
                      ? '0 0 16px rgba(245,158,11,0.6)'
                      : 'none',
                  }}
                >
                  {isCompleted ? (
                    <CheckCircle2 size={14} />
                  ) : isInProgress ? (
                    <Clock size={14} className="animate-spin-slow" />
                  ) : (
                    <span className="text-xs font-mono">{idx + 1}</span>
                  )}
                </motion.div>

                {/* Quick actions popup on node hover */}
                <div
                  className="absolute hidden group-hover:flex items-center gap-1 bg-zinc-950 border border-zinc-800 p-1 rounded-md shadow-2xl -top-8 left-1/2 transform -translate-x-1/2"
                >
                  {milestone.status === 'pending' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onStart(milestone.id);
                      }}
                      className="p-1 rounded text-amber-400 hover:bg-zinc-900"
                      title="Start milestone"
                    >
                      <Play size={10} fill="currentColor" />
                    </button>
                  )}
                  {milestone.status !== 'completed' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onComplete(milestone.id);
                      }}
                      className="p-1 rounded text-emerald-400 hover:bg-zinc-900"
                      title="Complete milestone"
                    >
                      <CheckCircle2 size={10} />
                    </button>
                  )}
                </div>
              </div>

              {/* Side Floating Label */}
              <div
                className={cn(
                  'absolute whitespace-nowrap bg-zinc-900/90 border border-zinc-800/80 px-3 py-1.5 rounded-lg shadow-xl pointer-events-none transition-all duration-300 max-w-[200px]',
                  isLeft ? '-left-56' : 'left-12'
                )}
                style={{
                  borderLeft: isLeft ? undefined : `3px solid ${diffColor}`,
                  borderRight: isLeft ? `3px solid ${diffColor}` : undefined,
                }}
              >
                <div className="flex items-center gap-1.5 justify-between">
                  <span className="text-[9px] font-mono uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                    {milestone.category || 'Roadmap'}
                  </span>
                  <span className="text-[8px] px-1 rounded-sm" style={{ background: `${diffColor}20`, color: diffColor }}>
                    {milestone.difficulty}
                  </span>
                </div>
                <div className="text-xs font-semibold mt-0.5 truncate text-[var(--text-primary)]" style={{ textDecoration: isCompleted ? 'line-through' : 'none' }}>
                  {milestone.title}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
