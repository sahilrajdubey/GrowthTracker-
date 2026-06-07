'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Calendar, Tag, ChevronDown,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import type { DevAchievement, DevCategory, Priority, Effort, DevStatus } from '@/lib/types';
import { DEV_CATEGORIES, PRIORITIES, EFFORTS, PRIORITY_LABELS } from '@/lib/constants';
import { CATEGORY_COLORS, PRIORITY_COLORS } from '@/lib/utils';
import { todayISO } from '@/lib/utils';

interface Props {
  editAchievement?: DevAchievement | null;
  onClose: () => void;
  isOpen: boolean;
}

const DEFAULT_FORM = {
  title: '',
  description: '',
  category: 'Project' as DevCategory,
  tags: '',
  completedAt: todayISO(),
  priority: 'P1' as Priority,
  effort: 'Medium' as Effort,
  status: 'completed' as DevStatus,
};

export default function DevAddForm({ editAchievement, onClose, isOpen }: Props) {
  const { addDevAchievement, updateDevAchievement } = useStore();
  const [form, setForm] = useState(DEFAULT_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof typeof DEFAULT_FORM, string>>>({});

  const isEdit = !!editAchievement;

  // Sync form with edit data
  useState(() => {
    if (editAchievement) {
      setForm({
        title: editAchievement.title,
        description: editAchievement.description,
        category: editAchievement.category,
        tags: editAchievement.tags.join(', '),
        completedAt: editAchievement.completedAt.slice(0, 10),
        priority: editAchievement.priority,
        effort: editAchievement.effort,
        status: editAchievement.status,
      });
    } else {
      setForm({ ...DEFAULT_FORM, completedAt: todayISO() });
    }
  });

  function validate(): boolean {
    const e: typeof errors = {};
    if (!form.title.trim()) e.title = 'Title required';
    if (!form.completedAt) e.completedAt = 'Date required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    const tags = form.tags.split(',').map((t) => t.trim()).filter(Boolean);
    const data = {
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      tags,
      completedAt: form.completedAt,
      priority: form.priority,
      effort: form.effort,
      status: form.status,
    };
    if (isEdit && editAchievement) {
      updateDevAchievement(editAchievement.id, data);
    } else {
      addDevAchievement(data);
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
            style={{ background: 'var(--bg-surface)', borderLeft: '1px solid var(--border)', boxShadow: '-20px 0 60px rgba(0,0,0,0.5)' }}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 border-b" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
              <div>
                <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {isEdit ? 'Edit Achievement' : 'Add Achievement'}
                </h2>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  Log a development win
                </p>
              </div>
              <button onClick={onClose} className="p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {/* Category */}
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Category</label>
                <div className="flex flex-wrap gap-1.5">
                  {DEV_CATEGORIES.map((cat) => {
                    const color = CATEGORY_COLORS[cat];
                    const active = form.category === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, category: cat }))}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
                        style={{
                          background: active ? `${color}20` : 'rgba(255,255,255,0.04)',
                          color: active ? color : 'var(--text-muted)',
                          border: `1px solid ${active ? color + '50' : 'var(--border)'}`,
                        }}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  className="gt-input"
                  placeholder="Built authentication system..."
                />
                {errors.title && <p className="text-[10px] mt-1" style={{ color: '#ef4444' }}>{errors.title}</p>}
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className="gt-input resize-none"
                  rows={3}
                  placeholder="What did you accomplish? Key learnings..."
                />
              </div>

              {/* Priority + Effort row */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Priority</label>
                  <div className="flex gap-1">
                    {PRIORITIES.map((p) => {
                      const color = PRIORITY_COLORS[p];
                      const active = form.priority === p;
                      return (
                        <button key={p} type="button" onClick={() => setForm((f) => ({ ...f, priority: p }))}
                          className="flex-1 py-1.5 rounded-lg text-xs font-bold transition-all"
                          style={{
                            background: active ? `${color}20` : 'rgba(255,255,255,0.04)',
                            color: active ? color : 'var(--text-muted)',
                            border: `1px solid ${active ? color + '50' : 'var(--border)'}`,
                          }}
                        >
                          {p}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Effort</label>
                  <div className="relative">
                    <select
                      value={form.effort}
                      onChange={(e) => setForm((f) => ({ ...f, effort: e.target.value as Effort }))}
                      className="gt-input appearance-none pr-7"
                    >
                      {EFFORTS.map((e) => <option key={e} value={e}>{e}</option>)}
                    </select>
                    <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
                  </div>
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Status</label>
                <div className="flex gap-2">
                  {(['completed', 'in-progress'] as DevStatus[]).map((s) => (
                    <button key={s} type="button"
                      onClick={() => setForm((f) => ({ ...f, status: s }))}
                      className="flex-1 py-2 rounded-lg text-xs font-medium transition-all capitalize"
                      style={{
                        background: form.status === s ? (s === 'completed' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)') : 'rgba(255,255,255,0.04)',
                        color: form.status === s ? (s === 'completed' ? '#10b981' : '#f59e0b') : 'var(--text-muted)',
                        border: `1px solid ${form.status === s ? (s === 'completed' ? 'rgba(16,185,129,0.4)' : 'rgba(245,158,11,0.4)') : 'var(--border)'}`,
                      }}
                    >
                      {s === 'in-progress' ? 'In Progress' : 'Completed'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date */}
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Completion Date</label>
                <div className="relative">
                  <Calendar size={12} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                  <input
                    type="date"
                    value={form.completedAt}
                    max={todayISO()}
                    onChange={(e) => setForm((f) => ({ ...f, completedAt: e.target.value }))}
                    className="gt-input pl-8"
                  />
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  Tags <span className="font-normal" style={{ color: 'var(--text-muted)' }}>(comma-separated)</span>
                </label>
                <input
                  type="text"
                  value={form.tags}
                  onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
                  className="gt-input"
                  placeholder="React, TypeScript, Node.js"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={onClose} className="gt-btn gt-btn-ghost flex-1">Cancel</button>
                <button type="submit" className="gt-btn gt-btn-primary flex-1">
                  {isEdit ? 'Update' : 'Add Achievement'}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
