'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Code2, BarChart3, ChevronRight } from 'lucide-react';
import DSAStats from './DSAStats';
import DSAFilters from './DSAFilters';
import DSAProblemTable from './DSAProblemTable';
import DSAAddForm from './DSAAddForm';
import { useStore } from '@/store/useStore';
import type { DSAProblem } from '@/lib/types';
import { cn } from '@/lib/utils';

type Tab = 'problems' | 'filters';

export default function DSAModule() {
  const { dsaFormOpen, setDsaFormOpen } = useStore();
  const [editProblem, setEditProblem] = useState<DSAProblem | null>(null);

  function openAdd() {
    setEditProblem(null);
    setDsaFormOpen(true);
  }

  function openEdit(problem: DSAProblem) {
    setEditProblem(problem);
    setDsaFormOpen(true);
  }

  function closeForm() {
    setDsaFormOpen(false);
    setEditProblem(null);
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.25)' }}
          >
            <Code2 size={18} style={{ color: '#06b6d4' }} />
          </div>
          <div>
            <h1 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
              DSA Problems
            </h1>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Track your LeetCode journey
            </p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={openAdd}
          className="gt-btn gt-btn-primary"
        >
          <Plus size={14} />
          Add Problem
        </motion.button>
      </div>

      {/* Stats Bar */}
      <DSAStats />

      {/* Filters */}
      <div className="glass-card p-4">
        <DSAFilters />
      </div>

      {/* Table */}
      <div className="glass-card p-4">
        <DSAProblemTable onEdit={openEdit} />
      </div>

      {/* Add/Edit Form Drawer */}
      <DSAAddForm
        isOpen={dsaFormOpen}
        editProblem={editProblem}
        onClose={closeForm}
      />
    </div>
  );
}
