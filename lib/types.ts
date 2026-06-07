// ─── DSA Module ───────────────────────────────────────────────────────────────

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface DSAProblem {
  id: string;
  number: number;
  title: string;
  difficulty: Difficulty;
  notes: string;
  tags: string[];
  completedAt: string; // ISO date string (user-controlled)
  createdAt: string;
  updatedAt: string;
}

// ─── Development Growth Module ─────────────────────────────────────────────────

export type DevCategory =
  | 'Project'
  | 'Feature'
  | 'Technology'
  | 'Certification'
  | 'Milestone'
  | 'Concept'
  | 'Deployment';

export type Priority = 'P0' | 'P1' | 'P2' | 'P3';
export type Effort = 'Low' | 'Medium' | 'High' | 'Epic';
export type DevStatus = 'completed' | 'in-progress';

export interface DevAchievement {
  id: string;
  title: string;
  description: string;
  category: DevCategory;
  tags: string[];
  completedAt: string;
  priority: Priority;
  effort: Effort;
  status: DevStatus;
  createdAt: string;
  updatedAt: string;
}

// ─── Roadmap Module ────────────────────────────────────────────────────────────

export type MilestoneDifficulty = 'Easy' | 'Medium' | 'Hard' | 'Epic';
export type MilestoneStatus = 'pending' | 'in-progress' | 'completed';

export interface RoadmapMilestone {
  id: string;
  title: string;
  description: string;
  category: string;
  deadline: string | null;
  difficulty: MilestoneDifficulty;
  priority: number; // sort order (0 = highest)
  status: MilestoneStatus;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export interface DailyCount {
  date: string; // YYYY-MM-DD
  count: number;
  easy: number;
  medium: number;
  hard: number;
}

export interface WeeklyCount {
  week: string; // e.g. "2024-W01"
  count: number;
  easy: number;
  medium: number;
  hard: number;
}

export interface MonthlyCount {
  month: string; // e.g. "2024-01"
  count: number;
  easy: number;
  medium: number;
  hard: number;
}

export interface CumulativePoint {
  date: string;
  total: number;
  easy: number;
  medium: number;
  hard: number;
  weighted: number; // easy*1 + medium*2 + hard*3
}

export interface DSAAnalytics {
  total: number;
  easy: number;
  medium: number;
  hard: number;
  currentStreak: number;
  longestStreak: number;
  averagePerDay: number;
  consistencyScore: number; // 0-100
  growthScore: number; // 0-100
  mostProductiveDay: string;
  velocity: number; // avg per day over last 7 days
  dailyCounts: DailyCount[];
  weeklyCounts: WeeklyCount[];
  monthlyCounts: MonthlyCount[];
  cumulativePoints: CumulativePoint[];
  heatmapData: Record<string, number>; // date string -> count
  forecast: ForecastPoint[];
}

export interface ForecastPoint {
  date: string;
  projected: number;
  optimistic: number;
  conservative: number;
  isProjected: boolean;
}

export interface DevAnalytics {
  total: number;
  byCategory: Record<DevCategory, number>;
  growthScore: number;
  recentActivity: number; // last 30 days
}

export interface RoadmapAnalytics {
  total: number;
  completed: number;
  inProgress: number;
  pending: number;
  completionRate: number;
}

export interface UnifiedStats {
  dsaAnalytics: DSAAnalytics;
  devAnalytics: DevAnalytics;
  roadmapAnalytics: RoadmapAnalytics;
  overallHealthScore: number; // 0-100
  totalGrowthScore: number;
  recentActivityCount: number;
}

// ─── Activity Feed ─────────────────────────────────────────────────────────────

export type ActivityType =
  | 'dsa_added'
  | 'dsa_edited'
  | 'dsa_deleted'
  | 'dev_added'
  | 'dev_edited'
  | 'dev_deleted'
  | 'milestone_added'
  | 'milestone_completed'
  | 'milestone_deleted';

export interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  subtitle?: string;
  timestamp: string;
  meta?: Record<string, string | number>;
}

// ─── App State ─────────────────────────────────────────────────────────────────

export interface AppState {
  dsaProblems: DSAProblem[];
  devAchievements: DevAchievement[];
  roadmapMilestones: RoadmapMilestone[];
  activityFeed: ActivityItem[];
  lastUpdated: string;
  version: string;
}

// ─── UI State ──────────────────────────────────────────────────────────────────

export type ActiveModule = 'dashboard' | 'dsa' | 'analytics' | 'dev' | 'roadmap';

export interface FilterState {
  search: string;
  difficulty: Difficulty | 'All';
  tags: string[];
  dateFrom: string | null;
  dateTo: string | null;
  sortBy: 'date' | 'number' | 'difficulty' | 'title';
  sortOrder: 'asc' | 'desc';
}
