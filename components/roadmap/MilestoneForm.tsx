'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, ChevronDown, CheckCircle2, Clock } from 'lucide-react';
import { useStore } from '@/store/useStore';
import type { RoadmapMilestone, MilestoneDifficulty, MilestoneStatus } from '@/lib/types';
import { MILESTONE_DIFFICULTIES } from '@/lib/constants';
import { todayISO } from '@/lib/utils';

interface Props {
  editMilestone?: RoadmapMilestone | null;
  onClose: () => void;
  isOpen: boolean;
}

const DEFAULT_FORM = {
  title: '',
  description: '',
  category: '',
  deadline: '',
  difficulty: 'Medium' as MilestoneDifficulty,
  status: 'pending' as MilestoneStatus,
};

const DIFF_COLORS = {
  Easy: '#10b981',
  Medium: '#f59e0b',
  Hard: '#ef4444',
  Epic: '#ec4899',
};

export default function MilestoneForm({ editMilestone, onClose, isOpen }: Props) {
  const { addMilestone, updateMilestone, roadmapMilestones } = useStore();
  const [form, setForm] = useState(DEFAULT_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof typeof DEFAULT_FORM, string>>>({});

  const isEdit = !!editMilestone;

  useEffect(() => {
    if (editMilestone) {
      setForm({
        title: editMilestone.title,
        description: editMilestone.description,
        category: editMilestone.category || '',
        deadline: editMilestone.deadline ? editMilestone.deadline.slice(0, 10) : '',
        difficulty: editMilestone.difficulty,
        status: editMilestone.status,
      });
    } else {
      setForm(DEFAULT_FORM);
    }
    setErrors({});
  }, [editMilestone, isOpen]);

  function validate(): boolean {
    const e: typeof errors = {};
    if (!form.title.trim()) e.title = 'Title required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const data = {
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category.trim(),
      deadline: form.deadline ? form.deadline : null,
      difficulty: form.difficulty,
      status: form.status,
      completedAt: form.status === 'completed' ? (editMilestone?.completedAt || new Date().toISOString()) : null,
      priority: isEdit && editMilestone ? editMilestone.priority : roadmapMilestones.length,
    };

    if (isEdit && editMilestone) {
      updateMilestone(editMilestone.id, data);
    } else {
      addMilestone(data);
    }
    onClose();
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
          />

          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md overflow-y-auto"
            style={{
              background: 'var(--bg-surface)',
              borderLeft: '1px solid var(--border)',
              boxShadow: '-20px 0 60px rgba(0,0,0,0.5)',
            }}
          >
            {/* Header */}
            <div
              className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 border-b"
              style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}
            >
              <div>
                <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {isEdit ? 'Edit Milestone' : 'Add Milestone'}
                </h2>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {isEdit ? 'Update roadmap goal details' : 'Set a new career roadmap target'}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg"
                style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  Title
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  className="gt-input"
                  placeholder="Master system design patterns"
                />
                {errors.title && <p className="text-[10px] mt-1" style={{ color: '#ef4444' }}>{errors.title}</p>}
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className="gt-input resize-none"
                  rows={3}
                  placeholder="Read Designing Data-Intensive Applications, write blog summaries, practice diagramming..."
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  Category
                </label>
                <input
                  type="text"
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  className="gt-input"
                  placeholder="System Design / Web Dev / DSA"
                />
              </div>

              {/* Difficulty */}
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  Difficulty / Scope
                </label>
                <div className="flex gap-1.5">
                  {MILESTONE_DIFFICULTIES.map((d) => {
                    const color = DIFF_COLORS[d];
                    const active = form.difficulty === d;
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, difficulty: d }))}
                        className="flex-1 py-2 rounded-lg text-xs font-medium transition-all"
                        style={{
                          background: active ? `${color}20` : 'rgba(255,255,255,0.04)',
                          color: active ? color : 'var(--text-muted)',
                          border: `1px solid ${active ? color + '50' : 'var(--border)'}`,
                        }}
                      >
                        {d}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  Status
                </label>
                <div className="flex gap-2">
                  {(['pending', 'in-progress', 'completed'] as MilestoneStatus[]).map((s) => {
                    const active = form.status === s;
                    let style = { background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)', border: '1px solid var(--border)' };
                    if (active) {
                      if (s === 'completed') {
                        style = { background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.4)' };
                      } else if (s === 'in-progress') {
                        style = { background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.4)' };
                      } else {
                        style = { background: 'rgba(99,102,241,0.15)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.4)' };
                      }
                    }
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, status: s }))}
                        className="flex-1 py-2 rounded-lg text-xs font-medium transition-all capitalize"
                        style={style}
                      >
                        {s === 'in-progress' ? 'In Progress' : s}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Deadline */}
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  Target Deadline
                </label>
                <div className="relative">
                  <Calendar size={12} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                  <input
                    type="date"
                    value={form.deadline}
                    onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))}
                    className="gt-input pl-8"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={onClose} className="gt-btn gt-btn-ghost flex-1">
                  Cancel
                </button>
                <button type="submit" className="gt-btn gt-btn-primary flex-1">
                  {isEdit ? 'Update' : 'Add Milestone'}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
