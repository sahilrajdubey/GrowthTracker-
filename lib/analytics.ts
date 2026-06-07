import {
  parseISO,
  differenceInDays,
  format,
  eachDayOfInterval,
  subDays,
  addDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  isValid,
} from 'date-fns';
import type {
  DSAProblem,
  DevAchievement,
  RoadmapMilestone,
  DSAAnalytics,
  DevAnalytics,
  RoadmapAnalytics,
  UnifiedStats,
  DailyCount,
  WeeklyCount,
  MonthlyCount,
  CumulativePoint,
  ForecastPoint,
  DevCategory,
} from './types';
import { DIFFICULTY_WEIGHT } from './utils';

// ─── Date Utilities ────────────────────────────────────────────────────────────

function parseDate(dateStr: string): Date | null {
  try {
    const d = parseISO(dateStr);
    return isValid(d) ? d : null;
  } catch {
    return null;
  }
}

function toKey(d: Date): string {
  return format(d, 'yyyy-MM-dd');
}

// ─── Streak Calculation ────────────────────────────────────────────────────────

export function computeStreaks(dateCounts: Record<string, number>): {
  currentStreak: number;
  longestStreak: number;
} {
  const dates = Object.keys(dateCounts)
    .filter((d) => dateCounts[d] > 0)
    .sort();

  if (dates.length === 0) return { currentStreak: 0, longestStreak: 0 };

  let longestStreak = 1;
  let currentRun = 1;

  for (let i = 1; i < dates.length; i++) {
    const prev = parseDate(dates[i - 1]);
    const curr = parseDate(dates[i]);
    if (!prev || !curr) continue;
    const diff = differenceInDays(curr, prev);
    if (diff === 1) {
      currentRun++;
      longestStreak = Math.max(longestStreak, currentRun);
    } else {
      currentRun = 1;
    }
  }

  // Compute current streak from today backwards
  const today = toKey(new Date());
  const yesterday = toKey(subDays(new Date(), 1));
  let currentStreak = 0;

  if (dateCounts[today] > 0 || dateCounts[yesterday] > 0) {
    let checkDate = dateCounts[today] > 0 ? new Date() : subDays(new Date(), 1);
    while (true) {
      const key = toKey(checkDate);
      if (dateCounts[key] > 0) {
        currentStreak++;
        checkDate = subDays(checkDate, 1);
      } else {
        break;
      }
    }
  }

  return { currentStreak, longestStreak: Math.max(longestStreak, currentStreak) };
}

// ─── DSA Analytics ────────────────────────────────────────────────────────────

export function computeDSAAnalytics(problems: DSAProblem[]): DSAAnalytics {
  if (problems.length === 0) {
    return emptyDSAAnalytics();
  }

  // Count by difficulty
  const easy = problems.filter((p) => p.difficulty === 'Easy').length;
  const medium = problems.filter((p) => p.difficulty === 'Medium').length;
  const hard = problems.filter((p) => p.difficulty === 'Hard').length;
  const total = problems.length;

  // Build date → counts map
  const heatmapData: Record<string, number> = {};
  const dailyMap: Record<string, DailyCount> = {};

  for (const p of problems) {
    const date = p.completedAt.slice(0, 10);
    heatmapData[date] = (heatmapData[date] || 0) + 1;

    if (!dailyMap[date]) {
      dailyMap[date] = { date, count: 0, easy: 0, medium: 0, hard: 0 };
    }
    dailyMap[date].count++;
    if (p.difficulty === 'Easy') dailyMap[date].easy++;
    if (p.difficulty === 'Medium') dailyMap[date].medium++;
    if (p.difficulty === 'Hard') dailyMap[date].hard++;
  }

  const dailyCounts = Object.values(dailyMap).sort((a, b) =>
    a.date.localeCompare(b.date)
  );

  // Streaks
  const { currentStreak, longestStreak } = computeStreaks(heatmapData);

  // Most productive day
  const mostProductiveDay =
    dailyCounts.length > 0
      ? dailyCounts.reduce((best, d) => (d.count > best.count ? d : best)).date
      : '';

  // Average per day (over span)
  let averagePerDay = 0;
  if (dailyCounts.length > 0) {
    const firstDate = parseDate(dailyCounts[0].date);
    const lastDate = parseDate(dailyCounts[dailyCounts.length - 1].date);
    if (firstDate && lastDate) {
      const span = Math.max(1, differenceInDays(lastDate, firstDate) + 1);
      averagePerDay = total / span;
    }
  }

  // Velocity: avg per day over last 7 days
  const last7 = subDays(new Date(), 7);
  const recentProblems = problems.filter((p) => {
    const d = parseDate(p.completedAt);
    return d && d >= last7;
  });
  const velocity = recentProblems.length / 7;

  // Consistency score: % of days with at least 1 solve over last 30 days
  let consistencyScore = 0;
  {
    const last30Days = eachDayOfInterval({
      start: subDays(new Date(), 29),
      end: new Date(),
    });
    const activeDays = last30Days.filter((d) => (heatmapData[toKey(d)] || 0) > 0).length;
    consistencyScore = Math.round((activeDays / 30) * 100);
  }

  // Growth score: weighted composite
  const weightedTotal = easy * 1 + medium * 2 + hard * 3;
  const growthScore = Math.min(
    100,
    Math.round(
      consistencyScore * 0.3 +
        Math.min(50, (velocity * 10) * 10) * 0.3 +
        Math.min(20, (weightedTotal / 10)) * 0.4 * 5
    )
  );

  // Weekly counts
  const weeklyMap: Record<string, WeeklyCount> = {};
  for (const d of dailyCounts) {
    const date = parseDate(d.date);
    if (!date) continue;
    const weekStart = startOfWeek(date, { weekStartsOn: 1 });
    const weekKey = format(weekStart, 'yyyy-MM-dd');
    if (!weeklyMap[weekKey]) {
      weeklyMap[weekKey] = { week: weekKey, count: 0, easy: 0, medium: 0, hard: 0 };
    }
    weeklyMap[weekKey].count += d.count;
    weeklyMap[weekKey].easy += d.easy;
    weeklyMap[weekKey].medium += d.medium;
    weeklyMap[weekKey].hard += d.hard;
  }
  const weeklyCounts = Object.values(weeklyMap).sort((a, b) =>
    a.week.localeCompare(b.week)
  );

  // Monthly counts
  const monthlyMap: Record<string, MonthlyCount> = {};
  for (const d of dailyCounts) {
    const monthKey = d.date.slice(0, 7);
    if (!monthlyMap[monthKey]) {
      monthlyMap[monthKey] = { month: monthKey, count: 0, easy: 0, medium: 0, hard: 0 };
    }
    monthlyMap[monthKey].count += d.count;
    monthlyMap[monthKey].easy += d.easy;
    monthlyMap[monthKey].medium += d.medium;
    monthlyMap[monthKey].hard += d.hard;
  }
  const monthlyCounts = Object.values(monthlyMap).sort((a, b) =>
    a.month.localeCompare(b.month)
  );

  // Cumulative points
  let runTotal = 0, runEasy = 0, runMedium = 0, runHard = 0;
  const cumulativePoints: CumulativePoint[] = dailyCounts.map((d) => {
    runTotal += d.count;
    runEasy += d.easy;
    runMedium += d.medium;
    runHard += d.hard;
    return {
      date: d.date,
      total: runTotal,
      easy: runEasy,
      medium: runMedium,
      hard: runHard,
      weighted: runEasy * 1 + runMedium * 2 + runHard * 3,
    };
  });

  // Forecast (next 30 days using linear extrapolation)
  const forecast = generateForecast(cumulativePoints, velocity);

  return {
    total,
    easy,
    medium,
    hard,
    currentStreak,
    longestStreak,
    averagePerDay: parseFloat(averagePerDay.toFixed(2)),
    consistencyScore,
    growthScore,
    mostProductiveDay,
    velocity: parseFloat(velocity.toFixed(2)),
    dailyCounts,
    weeklyCounts,
    monthlyCounts,
    cumulativePoints,
    heatmapData,
    forecast,
  };
}

function emptyDSAAnalytics(): DSAAnalytics {
  return {
    total: 0,
    easy: 0,
    medium: 0,
    hard: 0,
    currentStreak: 0,
    longestStreak: 0,
    averagePerDay: 0,
    consistencyScore: 0,
    growthScore: 0,
    mostProductiveDay: '',
    velocity: 0,
    dailyCounts: [],
    weeklyCounts: [],
    monthlyCounts: [],
    cumulativePoints: [],
    heatmapData: {},
    forecast: [],
  };
}

// ─── Trajectory Forecast ──────────────────────────────────────────────────────

export function generateForecast(
  cumulativePoints: CumulativePoint[],
  velocity: number
): ForecastPoint[] {
  if (cumulativePoints.length === 0) return [];

  const last = cumulativePoints[cumulativePoints.length - 1];
  const lastDate = parseDate(last.date);
  if (!lastDate) return [];

  // Historical for the chart (last 90 days)
  const histPoints: ForecastPoint[] = cumulativePoints.slice(-90).map((p) => ({
    date: p.date,
    projected: p.total,
    optimistic: p.total,
    conservative: p.total,
    isProjected: false,
  }));

  // 60-day forecast
  const forecastPoints: ForecastPoint[] = [];
  for (let i = 1; i <= 60; i++) {
    const d = addDays(lastDate, i);
    forecastPoints.push({
      date: toKey(d),
      projected: Math.round(last.total + velocity * i),
      optimistic: Math.round(last.total + velocity * 1.5 * i),
      conservative: Math.round(last.total + velocity * 0.5 * i),
      isProjected: true,
    });
  }

  return [...histPoints, ...forecastPoints];
}

// ─── Rolling Average ──────────────────────────────────────────────────────────

export function computeRollingAverage(
  dailyCounts: { date: string; count: number }[],
  window = 7
): { date: string; rolling: number; count: number }[] {
  return dailyCounts.map((d, i) => {
    const start = Math.max(0, i - window + 1);
    const slice = dailyCounts.slice(start, i + 1);
    const sum = slice.reduce((acc, s) => acc + s.count, 0);
    return {
      date: d.date,
      count: d.count,
      rolling: parseFloat((sum / slice.length).toFixed(2)),
    };
  });
}

// ─── Dev Analytics ────────────────────────────────────────────────────────────

export function computeDevAnalytics(achievements: DevAchievement[]): DevAnalytics {
  const total = achievements.length;
  const byCategory: Partial<Record<DevCategory, number>> = {};

  const cats: DevCategory[] = [
    'Project', 'Feature', 'Technology', 'Certification', 'Milestone', 'Concept', 'Deployment',
  ];
  for (const cat of cats) byCategory[cat] = 0;

  for (const a of achievements) {
    byCategory[a.category] = (byCategory[a.category] || 0) + 1;
  }

  const thirtyDaysAgo = subDays(new Date(), 30);
  const recentActivity = achievements.filter((a) => {
    const d = parseDate(a.completedAt);
    return d && d >= thirtyDaysAgo;
  }).length;

  // Growth score: weighted by category prestige
  const weights: Record<DevCategory, number> = {
    Project: 10,
    Feature: 6,
    Technology: 5,
    Certification: 8,
    Milestone: 7,
    Concept: 4,
    Deployment: 9,
  };
  const rawScore = achievements.reduce((acc, a) => acc + (weights[a.category] || 5), 0);
  const growthScore = Math.min(100, Math.round(rawScore / Math.max(1, total) * 3));

  return {
    total,
    byCategory: byCategory as Record<DevCategory, number>,
    growthScore,
    recentActivity,
  };
}

// ─── Roadmap Analytics ────────────────────────────────────────────────────────

export function computeRoadmapAnalytics(milestones: RoadmapMilestone[]): RoadmapAnalytics {
  const total = milestones.length;
  const completed = milestones.filter((m) => m.status === 'completed').length;
  const inProgress = milestones.filter((m) => m.status === 'in-progress').length;
  const pending = milestones.filter((m) => m.status === 'pending').length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  return { total, completed, inProgress, pending, completionRate };
}

// ─── Unified Stats ─────────────────────────────────────────────────────────────

export function computeUnifiedStats(
  problems: DSAProblem[],
  achievements: DevAchievement[],
  milestones: RoadmapMilestone[]
): UnifiedStats {
  const dsaAnalytics = computeDSAAnalytics(problems);
  const devAnalytics = computeDevAnalytics(achievements);
  const roadmapAnalytics = computeRoadmapAnalytics(milestones);

  const overallHealthScore = Math.round(
    dsaAnalytics.consistencyScore * 0.35 +
      dsaAnalytics.growthScore * 0.25 +
      roadmapAnalytics.completionRate * 0.2 +
      Math.min(100, devAnalytics.total * 5) * 0.2
  );

  const totalGrowthScore = Math.round(
    (dsaAnalytics.growthScore + devAnalytics.growthScore) / 2
  );

  const thirtyDaysAgo = subDays(new Date(), 30);
  const recentActivityCount =
    problems.filter((p) => {
      const d = parseDate(p.completedAt);
      return d && d >= thirtyDaysAgo;
    }).length +
    achievements.filter((a) => {
      const d = parseDate(a.completedAt);
      return d && d >= thirtyDaysAgo;
    }).length;

  return {
    dsaAnalytics,
    devAnalytics,
    roadmapAnalytics,
    overallHealthScore,
    totalGrowthScore,
    recentActivityCount,
  };
}
