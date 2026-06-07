'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Database } from 'lucide-react';
import { useStore } from '@/store/useStore';
import DSAProblemRow from './DSAProblemRow';
import type { DSAProblem } from '@/lib/types';

const PAGE_SIZE = 15;

interface Props {
  onEdit: (problem: DSAProblem) => void;
}

export default function DSAProblemTable({ onEdit }: Props) {
  const { dsaProblems, dsaFilter } = useStore();
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let list = [...dsaProblems];

    // Search
    if (dsaFilter.search) {
      const q = dsaFilter.search.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.number.toString().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Difficulty
    if (dsaFilter.difficulty !== 'All') {
      list = list.filter((p) => p.difficulty === dsaFilter.difficulty);
    }

    // Tags
    if (dsaFilter.tags.length > 0) {
      list = list.filter((p) =>
        dsaFilter.tags.every((tag) => p.tags.includes(tag))
      );
    }

    // Date range
    if (dsaFilter.dateFrom) {
      list = list.filter((p) => p.completedAt >= dsaFilter.dateFrom!);
    }
    if (dsaFilter.dateTo) {
      list = list.filter((p) => p.completedAt <= dsaFilter.dateTo! + 'T23:59:59');
    }

    // Sort
    list.sort((a, b) => {
      let cmp = 0;
      if (dsaFilter.sortBy === 'date') cmp = a.completedAt.localeCompare(b.completedAt);
      if (dsaFilter.sortBy === 'number') cmp = a.number - b.number;
      if (dsaFilter.sortBy === 'title') cmp = a.title.localeCompare(b.title);
      if (dsaFilter.sortBy === 'difficulty') {
        const order = { Easy: 0, Medium: 1, Hard: 2 };
        cmp = order[a.difficulty] - order[b.difficulty];
      }
      return dsaFilter.sortOrder === 'asc' ? cmp : -cmp;
    });

    return list;
  }, [dsaProblems, dsaFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Reset to page 1 on filter change
  useMemo(() => setPage(1), [dsaFilter]);

  if (dsaProblems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}
        >
          <Database size={28} style={{ color: '#6366f1' }} />
        </div>
        <div className="text-center">
          <p className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
            No problems yet
          </p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Add your first LeetCode problem to get started
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Result count */}
      <div className="flex items-center justify-between">
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Showing{' '}
          <span style={{ color: 'var(--text-secondary)' }}>
            {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)}
          </span>{' '}
          of{' '}
          <span style={{ color: 'var(--text-secondary)' }}>{filtered.length}</span>{' '}
          {filtered.length !== dsaProblems.length && `(filtered from ${dsaProblems.length})`}
        </p>
      </div>

      {/* Problem list */}
      <div className="space-y-1.5">
        <AnimatePresence mode="popLayout">
          {paginated.map((problem, i) => (
            <DSAProblemRow
              key={problem.id}
              problem={problem}
              index={i}
              onEdit={onEdit}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="gt-btn gt-btn-ghost"
            style={{ padding: '6px 10px', opacity: page === 1 ? 0.4 : 1 }}
          >
            <ChevronLeft size={14} />
          </button>

          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const p = totalPages <= 5 ? i + 1 : Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
            return (
              <button
                key={p}
                onClick={() => setPage(p)}
                className="w-8 h-8 rounded-lg text-xs font-medium transition-all"
                style={{
                  background: p === page ? '#6366f1' : 'rgba(255,255,255,0.05)',
                  color: p === page ? 'white' : 'var(--text-secondary)',
                  border: `1px solid ${p === page ? '#6366f1' : 'var(--border)'}`,
                }}
              >
                {p}
              </button>
            );
          })}

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="gt-btn gt-btn-ghost"
            style={{ padding: '6px 10px', opacity: page === totalPages ? 0.4 : 1 }}
          >
            <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
