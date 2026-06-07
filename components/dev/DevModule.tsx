'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Folder, Calendar } from 'lucide-react';
import { useStore } from '@/store/useStore';
import type { DevAchievement, DevCategory } from '@/lib/types';
import { DEV_CATEGORIES } from '@/lib/constants';
import DevStats from './DevStats';
import DevAchievementCard from './DevAchievementCard';
import DevAddForm from './DevAddForm';
import { cn } from '@/lib/utils';

export default function DevModule() {
  const { devAchievements, deleteDevAchievement, devFormOpen, setDevFormOpen } = useStore();
  const [activeCategory, setActiveCategory] = useState<DevCategory | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [editAchievement, setEditAchievement] = useState<DevAchievement | null>(null);

  const filteredAchievements = useMemo(() => {
    return devAchievements
      .filter((a) => {
        const matchesCategory = activeCategory === 'All' || a.category === activeCategory;
        const matchesSearch =
          a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => b.completedAt.localeCompare(a.completedAt));
  }, [devAchievements, activeCategory, searchQuery]);

  function handleEdit(a: DevAchievement) {
    setEditAchievement(a);
    setDevFormOpen(true);
  }

  // Update handleAddNew to clear editAchievement and open drawer
  function handleAddNew() {
    setEditAchievement(null);
    setDevFormOpen(true);
  }

  return (
    <div className="space-y-6">
      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Development Growth
          </h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            Log projects, technologies mastered, deployments, and certifications
          </p>
        </div>
        <button
          onClick={handleAddNew}
          className="gt-btn gt-btn-primary self-start sm:self-auto"
        >
          <Plus size={14} />
          Add Achievement
        </button>
      </div>

      {/* Stats Bar */}
      <DevStats />

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)' }}>
          <button
            onClick={() => setActiveCategory('All')}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
              activeCategory === 'All'
                ? 'bg-[rgba(255,255,255,0.06)] text-white border border-transparent shadow'
                : 'text-zinc-400 hover:text-white border border-transparent'
            )}
          >
            All
          </button>
          {DEV_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                activeCategory === cat
                  ? 'bg-[rgba(255,255,255,0.06)] text-white border border-transparent shadow'
                  : 'text-zinc-400 hover:text-white border border-transparent'
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search achievements..."
            className="gt-input pl-9"
          />
        </div>
      </div>

      {/* Grid of Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredAchievements.map((achievement, idx) => (
            <DevAchievementCard
              key={achievement.id}
              achievement={achievement}
              index={idx}
              onEdit={handleEdit}
              onDelete={deleteDevAchievement}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredAchievements.length === 0 && (
        <div
          className="flex flex-col items-center justify-center py-16 px-4 rounded-xl border border-dashed text-center"
          style={{ borderColor: 'var(--border)' }}
        >
          <Folder className="w-12 h-12 mb-3 text-zinc-600 animate-pulse" />
          <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
            No achievements found
          </h3>
          <p className="text-xs max-w-xs" style={{ color: 'var(--text-muted)' }}>
            {searchQuery || activeCategory !== 'All'
              ? 'Try modifying your search or filter categories.'
              : 'Log your first development milestone, deployment, or learning to boost your Growth Score.'}
          </p>
        </div>
      )}

      {/* Form Drawer */}
      <DevAddForm
        editAchievement={editAchievement}
        isOpen={devFormOpen}
        onClose={() => {
          setDevFormOpen(false);
          setEditAchievement(null);
        }}
      />
    </div>
  );
}
