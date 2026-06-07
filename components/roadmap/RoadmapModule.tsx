'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  GitBranch,
  ListOrdered,
  Search,
  Flag,
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useStore } from '@/store/useStore';
import type { RoadmapMilestone } from '@/lib/types';
import MilestoneCard from './MilestoneCard';
import MilestoneForm from './MilestoneForm';
import RoadmapGraph from './RoadmapGraph';
import { cn } from '@/lib/utils';

export default function RoadmapModule() {
  const {
    roadmapMilestones,
    deleteMilestone,
    completeMilestone,
    updateMilestone,
    reorderMilestones,
    roadmapFormOpen,
    setRoadmapFormOpen,
  } = useStore();

  const [view, setView] = useState<'graph' | 'list'>('graph');
  const [searchQuery, setSearchQuery] = useState('');
  const [editMilestone, setEditMilestone] = useState<RoadmapMilestone | null>(null);

  // Set up dnd-kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // allows clicking edit/complete buttons without triggering drag
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const sortedMilestones = useMemo(() => {
    return [...roadmapMilestones].sort((a, b) => a.priority - b.priority);
  }, [roadmapMilestones]);

  const filteredMilestones = useMemo(() => {
    return sortedMilestones.filter((m) => {
      const matchesSearch =
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [sortedMilestones, searchQuery]);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sortedMilestones.findIndex((m) => m.id === active.id);
    const newIndex = sortedMilestones.findIndex((m) => m.id === over.id);

    const reordered = arrayMove(sortedMilestones, oldIndex, newIndex);
    reorderMilestones(reordered.map((m) => m.id));
  }

  function handleStart(id: string) {
    updateMilestone(id, { status: 'in-progress' });
  }

  function handleEdit(m: RoadmapMilestone) {
    setEditMilestone(m);
    setRoadmapFormOpen(true);
  }

  function handleAddNew() {
    setEditMilestone(null);
    setRoadmapFormOpen(true);
  }

  // Count completions
  const completionStats = useMemo(() => {
    const total = roadmapMilestones.length;
    const completed = roadmapMilestones.filter((m) => m.status === 'completed').length;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, pct };
  }, [roadmapMilestones]);

  return (
    <div className="space-y-6">
      {/* Header & Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Career Progression Roadmap
          </h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            Define, rank, and execute milestones to guide your long-term growth
          </p>
        </div>
        <button
          onClick={handleAddNew}
          className="gt-btn gt-btn-primary self-start sm:self-auto"
        >
          <Plus size={14} />
          New Milestone
        </button>
      </div>

      {/* Progress Summary bar */}
      <div
        className="flex items-center justify-between p-4 rounded-xl"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
      >
        <div className="flex-1 max-w-sm">
          <div className="flex justify-between items-center text-xs mb-1.5 font-medium">
            <span style={{ color: 'var(--text-secondary)' }}>Roadmap Progress</span>
            <span style={{ color: '#10b981' }}>{completionStats.pct}% Complete</span>
          </div>
          <div className="h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${completionStats.pct}%` }}
              transition={{ duration: 0.8 }}
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #6366f1, #10b981)' }}
            />
          </div>
        </div>
        <div className="flex items-center gap-6 text-right ml-4">
          <div>
            <div className="text-lg font-bold font-mono text-white">{completionStats.completed}</div>
            <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Completed</div>
          </div>
          <div className="border-r h-8" style={{ borderColor: 'var(--border)' }} />
          <div>
            <div className="text-lg font-bold font-mono text-zinc-400">
              {completionStats.total - completionStats.completed}
            </div>
            <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Remaining</div>
          </div>
        </div>
      </div>

      {/* Controls: View Toggles & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Toggle Graph vs List */}
        <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)' }}>
          <button
            onClick={() => setView('graph')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
              view === 'graph'
                ? 'bg-[rgba(255,255,255,0.06)] text-white border border-transparent shadow'
                : 'text-zinc-400 hover:text-white border border-transparent'
            )}
          >
            <GitBranch size={13} />
            Skill Tree Graph
          </button>
          <button
            onClick={() => setView('list')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
              view === 'list'
                ? 'bg-[rgba(255,255,255,0.06)] text-white border border-transparent shadow'
                : 'text-zinc-400 hover:text-white border border-transparent'
            )}
          >
            <ListOrdered size={13} />
            Milestone List
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search milestones..."
            className="gt-input pl-9"
          />
        </div>
      </div>

      {/* View Content */}
      <div className="min-h-[300px]">
        {view === 'graph' ? (
          <RoadmapGraph
            milestones={filteredMilestones}
            onComplete={completeMilestone}
            onStart={handleStart}
            onEdit={handleEdit}
          />
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={filteredMilestones.map((m) => m.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {filteredMilestones.map((m) => (
                  <MilestoneCard
                    key={m.id}
                    milestone={m}
                    onComplete={completeMilestone}
                    onStart={handleStart}
                    onDelete={deleteMilestone}
                    onEdit={handleEdit}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

        {/* Empty state */}
        {filteredMilestones.length === 0 && (
          <div
            className="flex flex-col items-center justify-center py-16 px-4 rounded-xl border border-dashed text-center"
            style={{ borderColor: 'var(--border)' }}
          >
            <Flag className="w-12 h-12 mb-3 text-zinc-600 animate-pulse" />
            <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
              No milestones found
            </h3>
            <p className="text-xs max-w-xs" style={{ color: 'var(--text-muted)' }}>
              {searchQuery
                ? 'Try modifying your search query.'
                : 'Create your first progression target to start visualizing your career roadmap.'}
            </p>
          </div>
        )}
      </div>

      {/* Form Drawer */}
      <MilestoneForm
        editMilestone={editMilestone}
        isOpen={roadmapFormOpen}
        onClose={() => {
          setRoadmapFormOpen(false);
          setEditMilestone(null);
        }}
      />
    </div>
  );
}
