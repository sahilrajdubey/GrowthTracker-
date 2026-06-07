import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, parseISO } from 'date-fns';
import type { Difficulty, DevCategory, Priority, Effort, MilestoneDifficulty, MilestoneStatus } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function formatDate(dateStr: string, fmt = 'MMM d, yyyy'): string {
  try {
    return format(parseISO(dateStr), fmt);
  } catch {
    return dateStr;
  }
}

export function formatRelativeTime(dateStr: string): string {
  try {
    return formatDistanceToNow(parseISO(dateStr), { addSuffix: true });
  } catch {
    return dateStr;
  }
}

export function toISODateString(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function todayISO(): string {
  return toISODateString(new Date());
}

export function nowISO(): string {
  return new Date().toISOString();
}

// ─── Difficulty Colors ─────────────────────────────────────────────────────────

export const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  Easy: '#10b981',
  Medium: '#f59e0b',
  Hard: '#ef4444',
};

export const DIFFICULTY_BG: Record<Difficulty, string> = {
  Easy: 'rgba(16,185,129,0.12)',
  Medium: 'rgba(245,158,11,0.12)',
  Hard: 'rgba(239,68,68,0.12)',
};

export const DIFFICULTY_BORDER: Record<Difficulty, string> = {
  Easy: 'rgba(16,185,129,0.4)',
  Medium: 'rgba(245,158,11,0.4)',
  Hard: 'rgba(239,68,68,0.4)',
};

export const DIFFICULTY_WEIGHT: Record<Difficulty, number> = {
  Easy: 1,
  Medium: 2,
  Hard: 3,
};

// ─── Category Config ───────────────────────────────────────────────────────────

export const CATEGORY_COLORS: Record<DevCategory, string> = {
  Project: '#6366f1',
  Feature: '#8b5cf6',
  Technology: '#06b6d4',
  Certification: '#f59e0b',
  Milestone: '#10b981',
  Concept: '#ec4899',
  Deployment: '#f97316',
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  P0: '#ef4444',
  P1: '#f97316',
  P2: '#f59e0b',
  P3: '#6b7280',
};

export const EFFORT_LABELS: Record<Effort, string> = {
  Low: '~1 day',
  Medium: '~1 week',
  High: '~1 month',
  Epic: '3+ months',
};

// ─── Milestone Status ──────────────────────────────────────────────────────────

export const MILESTONE_STATUS_COLORS: Record<MilestoneStatus, string> = {
  pending: '#475569',
  'in-progress': '#f59e0b',
  completed: '#10b981',
};

export const MILESTONE_DIFF_COLORS: Record<MilestoneDifficulty, string> = {
  Easy: '#10b981',
  Medium: '#f59e0b',
  Hard: '#ef4444',
  Epic: '#8b5cf6',
};

// ─── Number Formatting ─────────────────────────────────────────────────────────

export function formatNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

export function formatPercent(n: number, decimals = 1): string {
  return `${n.toFixed(decimals)}%`;
}

// ─── Day of Week ───────────────────────────────────────────────────────────────

export const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function getDayName(dateStr: string): string {
  try {
    const d = parseISO(dateStr);
    return DAY_NAMES[d.getDay()];
  } catch {
    return '';
  }
}

// ─── Score Color ───────────────────────────────────────────────────────────────

export function getScoreColor(score: number): string {
  if (score >= 80) return '#10b981';
  if (score >= 60) return '#f59e0b';
  if (score >= 40) return '#f97316';
  return '#ef4444';
}

export function getScoreLabel(score: number): string {
  if (score >= 85) return 'Excellent';
  if (score >= 70) return 'Great';
  if (score >= 55) return 'Good';
  if (score >= 40) return 'Fair';
  return 'Needs Work';
}

// ─── Array utilities ───────────────────────────────────────────────────────────

export function groupBy<T>(arr: T[], key: (item: T) => string): Record<string, T[]> {
  return arr.reduce((acc, item) => {
    const k = key(item);
    if (!acc[k]) acc[k] = [];
    acc[k].push(item);
    return acc;
  }, {} as Record<string, T[]>);
}

export function sortBy<T>(arr: T[], key: (item: T) => string | number, order: 'asc' | 'desc' = 'asc'): T[] {
  return [...arr].sort((a, b) => {
    const ka = key(a);
    const kb = key(b);
    if (ka < kb) return order === 'asc' ? -1 : 1;
    if (ka > kb) return order === 'asc' ? 1 : -1;
    return 0;
  });
}

// ─── Truncate ──────────────────────────────────────────────────────────────────

export function truncate(str: string, len = 40): string {
  return str.length > len ? `${str.slice(0, len)}…` : str;
}
