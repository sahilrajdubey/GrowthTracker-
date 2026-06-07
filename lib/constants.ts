import type { Difficulty, DevCategory, Priority, Effort, MilestoneDifficulty } from './types';

// ─── DSA Tags ──────────────────────────────────────────────────────────────────

export const DSA_TAGS = [
  'Array', 'String', 'Hash Map', 'Two Pointers', 'Sliding Window',
  'Binary Search', 'Stack', 'Queue', 'Linked List', 'Tree', 'BST',
  'Graph', 'BFS', 'DFS', 'Dynamic Programming', 'Greedy', 'Backtracking',
  'Recursion', 'Divide & Conquer', 'Sorting', 'Heap', 'Trie',
  'Union Find', 'Bit Manipulation', 'Math', 'Matrix', 'Monotonic Stack',
];

// ─── Difficulties ─────────────────────────────────────────────────────────────

export const DIFFICULTIES: Difficulty[] = ['Easy', 'Medium', 'Hard'];

// ─── Dev Categories ───────────────────────────────────────────────────────────

export const DEV_CATEGORIES: DevCategory[] = [
  'Project', 'Feature', 'Technology', 'Certification', 'Milestone', 'Concept', 'Deployment',
];

// ─── Priority ──────────────────────────────────────────────────────────────────

export const PRIORITIES: Priority[] = ['P0', 'P1', 'P2', 'P3'];

export const PRIORITY_LABELS: Record<Priority, string> = {
  P0: 'Critical',
  P1: 'High',
  P2: 'Medium',
  P3: 'Low',
};

// ─── Effort ───────────────────────────────────────────────────────────────────

export const EFFORTS: Effort[] = ['Low', 'Medium', 'High', 'Epic'];

// ─── Milestone Difficulties ───────────────────────────────────────────────────

export const MILESTONE_DIFFICULTIES: MilestoneDifficulty[] = ['Easy', 'Medium', 'Hard', 'Epic'];

// ─── Chart Colors ─────────────────────────────────────────────────────────────

export const CHART_COLORS = {
  primary: '#6366f1',
  primaryLight: '#818cf8',
  secondary: '#8b5cf6',
  easy: '#10b981',
  medium: '#f59e0b',
  hard: '#ef4444',
  grid: 'rgba(255,255,255,0.06)',
  text: '#94a3b8',
  tooltip: '#0d0d14',
  accent1: '#06b6d4',
  accent2: '#ec4899',
  accent3: '#f97316',
};

// ─── Heatmap Colors ───────────────────────────────────────────────────────────

export const HEATMAP_LEVELS = [
  { min: 0, color: 'rgba(255,255,255,0.04)', label: 'None' },
  { min: 1, color: 'rgba(99,102,241,0.3)', label: '1' },
  { min: 2, color: 'rgba(99,102,241,0.5)', label: '2-3' },
  { min: 4, color: 'rgba(99,102,241,0.7)', label: '4-6' },
  { min: 7, color: 'rgba(99,102,241,0.9)', label: '7+' },
];

export function getHeatmapColor(count: number): string {
  if (count === 0) return HEATMAP_LEVELS[0].color;
  if (count >= 7) return HEATMAP_LEVELS[4].color;
  if (count >= 4) return HEATMAP_LEVELS[3].color;
  if (count >= 2) return HEATMAP_LEVELS[2].color;
  return HEATMAP_LEVELS[1].color;
}

// ─── Navigation ───────────────────────────────────────────────────────────────

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard', shortcut: '1' },
  { id: 'dsa', label: 'DSA Problems', icon: 'Code2', shortcut: '2' },
  { id: 'analytics', label: 'Analytics', icon: 'BarChart3', shortcut: '3' },
  { id: 'dev', label: 'Dev Growth', icon: 'Rocket', shortcut: '4' },
  { id: 'roadmap', label: 'Roadmap', icon: 'Map', shortcut: '5' },
] as const;

// ─── Motivational Messages ────────────────────────────────────────────────────

export const STREAK_MESSAGES = [
  'Keep the momentum going!',
  'Consistency is your superpower.',
  "Every problem solved is a step forward.",
  "You're building something great.",
  'The grind is paying off.',
];
