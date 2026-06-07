'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download,
  Upload,
  Search,
  Bell,
  Command,
  LayoutDashboard,
  Code2,
  BarChart3,
  Rocket,
  Map,
  X,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { exportData, importData } from '@/lib/storage';
import type { ActiveModule } from '@/lib/types';
import { formatDate } from '@/lib/utils';

const MODULE_LABELS: Record<ActiveModule, string> = {
  dashboard: 'Dashboard',
  dsa: 'DSA Problems',
  analytics: 'Analytics',
  dev: 'Dev Growth',
  roadmap: 'Roadmap',
};

const MODULE_ICONS: Record<ActiveModule, React.ReactNode> = {
  dashboard: <LayoutDashboard size={14} />,
  dsa: <Code2 size={14} />,
  analytics: <BarChart3 size={14} />,
  dev: <Rocket size={14} />,
  roadmap: <Map size={14} />,
};

export default function Header() {
  const { activeModule, exportableState, importState, dsaProblems, stats } = useStore();
  const [importing, setImporting] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function showNotif(msg: string) {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  }

  function handleExport() {
    exportData(exportableState());
    showNotif('Data exported successfully!');
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const data = await importData(file);
      importState(data);
      showNotif('Data imported successfully!');
    } catch {
      showNotif('Failed to import — invalid file format.');
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  const now = new Date();
  const dateStr = formatDate(now.toISOString(), 'EEE, MMM d yyyy');

  return (
    <header
      className="fixed top-0 right-0 z-20 flex items-center gap-3 px-4 border-b"
      style={{
        left: 'var(--sidebar-width, 240px)',
        height: 'var(--header-height)',
        background: 'rgba(5,5,7,0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderColor: 'var(--border)',
        transition: 'left 0.3s ease',
      }}
    >
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 flex-1">
        <div
          className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md"
          style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)' }}
        >
          {MODULE_ICONS[activeModule]}
          <span className="font-medium">{MODULE_LABELS[activeModule]}</span>
        </div>
        <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{dateStr}</span>
      </div>

      {/* Problem counter */}
      <div
        className="hidden sm:flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md font-mono"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
      >
        <Code2 size={12} style={{ color: '#06b6d4' }} />
        <span style={{ color: '#06b6d4' }} className="font-bold">{stats.dsaAnalytics.total}</span>
        <span>problems</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={handleExport}
          className="gt-btn gt-btn-ghost"
          style={{ padding: '6px 10px', gap: 5 }}
          title="Export data as JSON"
        >
          <Download size={13} />
          <span className="hidden sm:inline text-xs">Export</span>
        </button>

        <button
          onClick={() => fileRef.current?.click()}
          className="gt-btn gt-btn-ghost"
          style={{ padding: '6px 10px', gap: 5 }}
          title="Import JSON data"
        >
          {importing ? (
            <div className="w-3 h-3 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#6366f1', borderTopColor: 'transparent' }} />
          ) : (
            <Upload size={13} />
          )}
          <span className="hidden sm:inline text-xs">Import</span>
        </button>
        <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleImport} />

        <div
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: 'var(--text-muted)', cursor: 'default' }}
          title="Keyboard shortcuts: 1-5 for navigation"
        >
          <Command size={11} />
          <span className="hidden md:inline">K</span>
        </div>
      </div>

      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className="fixed top-16 left-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium"
            style={{
              background: 'rgba(16,185,129,0.15)',
              border: '1px solid rgba(16,185,129,0.3)',
              color: '#34d399',
              backdropFilter: 'blur(20px)',
            }}
          >
            <Bell size={13} />
            {notification}
            <button onClick={() => setNotification(null)} style={{ marginLeft: 4 }}>
              <X size={12} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
