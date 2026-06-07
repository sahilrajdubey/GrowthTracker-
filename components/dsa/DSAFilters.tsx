'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, X, ChevronDown, Tag } from 'lucide-react';
import { useStore } from '@/store/useStore';
import type { FilterState, Difficulty } from '@/lib/types';
import { cn } from '@/lib/utils';
import { DSA_TAGS } from '@/lib/constants';

const DIFFICULTIES: (Difficulty | 'All')[] = ['All', 'Easy', 'Medium', 'Hard'];

const DIFF_STYLES: Record<Difficulty | 'All', { bg: string; text: string; border: string }> = {
  All: { bg: 'rgba(255,255,255,0.06)', text: 'var(--text-secondary)', border: 'var(--border)' },
  Easy: { bg: 'rgba(16,185,129,0.12)', text: '#34d399', border: 'rgba(16,185,129,0.3)' },
  Medium: { bg: 'rgba(245,158,11,0.12)', text: '#fbbf24', border: 'rgba(245,158,11,0.3)' },
  Hard: { bg: 'rgba(239,68,68,0.12)', text: '#f87171', border: 'rgba(239,68,68,0.3)' },
};

const SORT_OPTIONS: { value: FilterState['sortBy']; label: string }[] = [
  { value: 'date', label: 'Date' },
  { value: 'number', label: 'Problem #' },
  { value: 'difficulty', label: 'Difficulty' },
  { value: 'title', label: 'Title' },
];

export default function DSAFilters() {
  const { dsaFilter, setDSAFilter, resetDSAFilter } = useStore();
  const [showTags, setShowTags] = useState(false);

  const hasActiveFilters =
    dsaFilter.search ||
    dsaFilter.difficulty !== 'All' ||
    dsaFilter.tags.length > 0 ||
    dsaFilter.dateFrom ||
    dsaFilter.dateTo;

  function toggleTag(tag: string) {
    const tags = dsaFilter.tags.includes(tag)
      ? dsaFilter.tags.filter((t) => t !== tag)
      : [...dsaFilter.tags, tag];
    setDSAFilter({ tags });
  }

  return (
    <div className="space-y-2">
      {/* Main filter row */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Search */}
        <div className="relative flex-1 min-w-[180px]">
          <Search
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: 'var(--text-muted)' }}
          />
          <input
            type="text"
            placeholder="Search problems..."
            value={dsaFilter.search}
            onChange={(e) => setDSAFilter({ search: e.target.value })}
            className="gt-input pl-8"
            style={{ height: 34 }}
          />
          {dsaFilter.search && (
            <button
              onClick={() => setDSAFilter({ search: '' })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--text-muted)' }}
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Difficulty pills */}
        <div className="flex items-center gap-1">
          {DIFFICULTIES.map((diff) => {
            const active = dsaFilter.difficulty === diff;
            const style = DIFF_STYLES[diff];
            return (
              <button
                key={diff}
                onClick={() => setDSAFilter({ difficulty: diff })}
                className={cn(
                  'px-3 py-1 rounded-lg text-xs font-medium transition-all',
                  active ? 'ring-1' : 'opacity-60 hover:opacity-100'
                )}
                style={{
                  background: active ? style.bg : 'rgba(255,255,255,0.04)',
                  color: active ? style.text : 'var(--text-muted)',
                  border: `1px solid ${active ? style.border : 'var(--border)'}`,
                  boxShadow: active ? `0 0 0 1px ${style.border}` : undefined,
                }}
              >
                {diff}
              </button>
            );
          })}
        </div>

        {/* Date range */}
        <div className="flex items-center gap-1">
          <input
            type="date"
            value={dsaFilter.dateFrom || ''}
            onChange={(e) => setDSAFilter({ dateFrom: e.target.value || null })}
            className="gt-input text-xs"
            style={{ height: 34, width: 130 }}
            placeholder="From"
          />
          <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>→</span>
          <input
            type="date"
            value={dsaFilter.dateTo || ''}
            onChange={(e) => setDSAFilter({ dateTo: e.target.value || null })}
            className="gt-input text-xs"
            style={{ height: 34, width: 130 }}
            placeholder="To"
          />
        </div>

        {/* Sort */}
        <div className="relative">
          <select
            value={`${dsaFilter.sortBy}_${dsaFilter.sortOrder}`}
            onChange={(e) => {
              const [by, order] = e.target.value.split('_') as [FilterState['sortBy'], 'asc' | 'desc'];
              setDSAFilter({ sortBy: by, sortOrder: order });
            }}
            className="gt-input appearance-none pr-7 text-xs"
            style={{ height: 34, minWidth: 130 }}
          >
            {SORT_OPTIONS.map((opt) => (
              <>
                <option key={`${opt.value}_desc`} value={`${opt.value}_desc`}>{opt.label} ↓</option>
                <option key={`${opt.value}_asc`} value={`${opt.value}_asc`}>{opt.label} ↑</option>
              </>
            ))}
          </select>
          <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
        </div>

        {/* Tags toggle */}
        <button
          onClick={() => setShowTags((v) => !v)}
          className="gt-btn gt-btn-ghost text-xs"
          style={{ height: 34, padding: '0 12px' }}
        >
          <Tag size={12} />
          Tags
          {dsaFilter.tags.length > 0 && (
            <span
              className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold"
              style={{ background: '#6366f1', color: 'white' }}
            >
              {dsaFilter.tags.length}
            </span>
          )}
        </button>

        {/* Reset */}
        {hasActiveFilters && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={resetDSAFilter}
            className="gt-btn gt-btn-ghost text-xs"
            style={{ height: 34, padding: '0 12px', color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)' }}
          >
            <X size={12} />
            Clear
          </motion.button>
        )}
      </div>

      {/* Tag selector */}
      <AnimatePresence>
        {showTags && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap gap-1.5 p-3 rounded-lg" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
              {DSA_TAGS.map((tag) => {
                const active = dsaFilter.tags.includes(tag);
                return (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={cn('tag transition-all', active ? 'ring-1 ring-indigo-500/50' : 'opacity-60 hover:opacity-100')}
                    style={active ? { background: 'rgba(99,102,241,0.25)', color: '#818cf8' } : {}}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
