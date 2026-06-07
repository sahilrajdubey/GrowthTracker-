'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Hash, Calendar } from 'lucide-react';
import { useStore } from '@/store/useStore';
import type { DSAProblem, Difficulty } from '@/lib/types';
import { DSA_TAGS, DIFFICULTIES } from '@/lib/constants';
import { todayISO, cn } from '@/lib/utils';

interface Props {
  editProblem?: DSAProblem | null;
  onClose: () => void;
  isOpen: boolean;
}

const DIFF_STYLES: Record<Difficulty, string> = {
  Easy: 'rgba(16,185,129,0.2)',
  Medium: 'rgba(245,158,11,0.2)',
  Hard: 'rgba(239,68,68,0.2)',
};

const DIFF_TEXT: Record<Difficulty, string> = {
  Easy: '#34d399',
  Medium: '#fbbf24',
  Hard: '#f87171',
};

const DEFAULT_FORM = {
  number: '',
  title: '',
  difficulty: 'Medium' as Difficulty,
  notes: '',
  tags: [] as string[],
  completedAt: todayISO(),
};

export default function DSAAddForm({ editProblem, onClose, isOpen }: Props) {
  const { addDSAProblem, updateDSAProblem } = useStore();
  const [form, setForm] = useState(DEFAULT_FORM);
  const [errors, setErrors] = useState<Partial<typeof DEFAULT_FORM>>({});
  const [tagSearch, setTagSearch] = useState('');

  const isEdit = !!editProblem;

  useEffect(() => {
    if (editProblem) {
      setForm({
        number: String(editProblem.number),
        title: editProblem.title,
        difficulty: editProblem.difficulty,
        notes: editProblem.notes,
        tags: editProblem.tags,
        completedAt: editProblem.completedAt.slice(0, 10),
      });
    } else {
      setForm({ ...DEFAULT_FORM, completedAt: todayISO() });
    }
    setErrors({});
  }, [editProblem, isOpen]);

  function validate(): boolean {
    const e: Partial<typeof DEFAULT_FORM> = {};
    if (!form.number || isNaN(Number(form.number))) e.number = 'Valid number required';
    if (!form.title.trim()) e.title = 'Title required';
    if (!form.completedAt) e.completedAt = 'Date required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const data = {
      number: parseInt(form.number),
      title: form.title.trim(),
      difficulty: form.difficulty,
      notes: form.notes.trim(),
      tags: form.tags,
      completedAt: form.completedAt,
    };

    if (isEdit && editProblem) {
      updateDSAProblem(editProblem.id, data);
    } else {
      addDSAProblem(data);
    }
    onClose();
  }

  function toggleTag(tag: string) {
    setForm((f) => ({
      ...f,
      tags: f.tags.includes(tag) ? f.tags.filter((t) => t !== tag) : [...f.tags, tag],
    }));
  }

  const filteredTags = DSA_TAGS.filter((t) =>
    t.toLowerCase().includes(tagSearch.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
          />

          {/* Drawer */}
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
                  {isEdit ? 'Edit Problem' : 'Add DSA Problem'}
                </h2>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {isEdit ? 'Update problem details' : 'Log a LeetCode solution'}
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
              {/* Number + Difficulty row */}
              <div className="flex gap-3">
                <div className="w-28">
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                    Problem #
                  </label>
                  <div className="relative">
                    <Hash size={12} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                    <input
                      type="number"
                      min="1"
                      value={form.number}
                      onChange={(e) => setForm((f) => ({ ...f, number: e.target.value }))}
                      className="gt-input pl-8"
                      placeholder="1"
                    />
                  </div>
                  {errors.number && <p className="text-[10px] mt-1" style={{ color: '#ef4444' }}>{errors.number}</p>}
                </div>

                <div className="flex-1">
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                    Difficulty
                  </label>
                  <div className="flex gap-1.5">
                    {DIFFICULTIES.map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, difficulty: d }))}
                        className="flex-1 py-2 rounded-lg text-xs font-medium transition-all"
                        style={{
                          background: form.difficulty === d ? DIFF_STYLES[d] : 'rgba(255,255,255,0.04)',
                          color: form.difficulty === d ? DIFF_TEXT[d] : 'var(--text-muted)',
                          border: `1px solid ${form.difficulty === d ? DIFF_TEXT[d] + '50' : 'var(--border)'}`,
                        }}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  Problem Title
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  className="gt-input"
                  placeholder="Two Sum"
                />
                {errors.title && <p className="text-[10px] mt-1" style={{ color: '#ef4444' }}>{errors.title}</p>}
              </div>

              {/* Completion Date */}
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  Completion Date
                  <span className="ml-1 font-normal" style={{ color: 'var(--text-muted)' }}>
                    (can be any past date)
                  </span>
                </label>
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
                {errors.completedAt && <p className="text-[10px] mt-1" style={{ color: '#ef4444' }}>{errors.completedAt}</p>}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  Notes / Approach
                </label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  className="gt-input resize-none"
                  rows={4}
                  placeholder="Key insight, approach, time complexity..."
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  Tags
                  <span className="ml-1 font-normal" style={{ color: 'var(--text-muted)' }}>
                    ({form.tags.length} selected)
                  </span>
                </label>

                {/* Selected tags */}
                {form.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {form.tags.map((tag) => (
                      <span
                        key={tag}
                        className="tag flex items-center gap-1 cursor-pointer"
                        onClick={() => toggleTag(tag)}
                      >
                        {tag}
                        <X size={9} />
                      </span>
                    ))}
                  </div>
                )}

                <input
                  type="text"
                  value={tagSearch}
                  onChange={(e) => setTagSearch(e.target.value)}
                  placeholder="Search tags..."
                  className="gt-input mb-2"
                  style={{ height: 32 }}
                />
                <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
                  {filteredTags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={cn(
                        'tag transition-all text-[10px]',
                        form.tags.includes(tag) ? 'opacity-40' : 'hover:opacity-80'
                      )}
                    >
                      {form.tags.includes(tag) ? '✓ ' : ''}
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={onClose} className="gt-btn gt-btn-ghost flex-1">
                  Cancel
                </button>
                <button type="submit" className="gt-btn gt-btn-primary flex-1">
                  {isEdit ? 'Update Problem' : 'Add Problem'}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
