'use client';

import { motion } from 'framer-motion';
import { Code2, Rocket, Map, Plus } from 'lucide-react';
import { useStore } from '@/store/useStore';

export default function QuickActions() {
  const { setActiveModule, setDsaFormOpen, setDevFormOpen, setRoadmapFormOpen } = useStore();

  const actions = [
    {
      title: 'Log DSA Solve',
      desc: 'Add a solved LeetCode problem',
      icon: <Code2 size={16} />,
      color: '#06b6d4', // Cyan
      onClick: () => {
        setActiveModule('dsa');
        setDsaFormOpen(true);
      },
    },
    {
      title: 'Log Dev Win',
      desc: 'Record a project or technology milestone',
      icon: <Rocket size={16} />,
      color: '#10b981', // Emerald
      onClick: () => {
        setActiveModule('dev');
        setDevFormOpen(true);
      },
    },
    {
      title: 'Set Milestone',
      desc: 'Define a new roadmap goal',
      icon: <Map size={16} />,
      color: '#f59e0b', // Amber
      onClick: () => {
        setActiveModule('roadmap');
        setRoadmapFormOpen(true);
      },
    },
  ];

  return (
    <div className="glass-card p-4 space-y-3">
      <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
        Quick Command Center
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {actions.map((act, idx) => (
          <motion.button
            key={act.title}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={act.onClick}
            className="flex items-start gap-3 p-3 rounded-lg text-left transition-all duration-200"
            style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid var(--border)',
            }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: `${act.color}15`, color: act.color }}
            >
              {act.icon}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold flex items-center gap-1" style={{ color: 'var(--text-primary)' }}>
                {act.title}
                <Plus size={10} className="text-zinc-500" />
              </div>
              <div className="text-[10px] mt-0.5 leading-normal truncate" style={{ color: 'var(--text-muted)' }}>
                {act.desc}
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
