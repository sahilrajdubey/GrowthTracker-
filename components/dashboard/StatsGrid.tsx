'use client';

import { motion } from 'framer-motion';
import {
  Code2, Flame, Zap, Trophy, Target, TrendingUp, Star,
  CheckCircle2, Activity, BarChart2, Rocket, Award,
} from 'lucide-react';
import StatCard from './StatCard';
import { useStore } from '@/store/useStore';

export default function StatsGrid() {
  const { stats } = useStore();
  const { dsaAnalytics, devAnalytics, roadmapAnalytics, overallHealthScore, totalGrowthScore, recentActivityCount } = stats;

  const cards = [
    {
      label: 'Problems Solved',
      value: dsaAnalytics.total,
      icon: <Code2 size={15} />,
      color: '#6366f1',
      subtext: `${dsaAnalytics.easy}E · ${dsaAnalytics.medium}M · ${dsaAnalytics.hard}H`,
    },
    {
      label: 'Current Streak',
      value: dsaAnalytics.currentStreak,
      suffix: 'd',
      icon: <Flame size={15} />,
      color: '#f59e0b',
      subtext: `Best: ${dsaAnalytics.longestStreak} days`,
    },
    {
      label: 'Growth Score',
      value: totalGrowthScore,
      suffix: '%',
      icon: <TrendingUp size={15} />,
      color: '#8b5cf6',
      subtext: 'Composite score',
    },
    {
      label: 'Consistency',
      value: dsaAnalytics.consistencyScore,
      suffix: '%',
      icon: <Activity size={15} />,
      color: '#10b981',
      subtext: 'Last 30 days',
    },
    {
      label: 'Dev Achievements',
      value: devAnalytics.total,
      icon: <Rocket size={15} />,
      color: '#06b6d4',
      subtext: `${devAnalytics.recentActivity} this month`,
    },
    {
      label: 'Goals Completed',
      value: roadmapAnalytics.completed,
      icon: <CheckCircle2 size={15} />,
      color: '#10b981',
      subtext: `${roadmapAnalytics.total} total goals`,
    },
    {
      label: 'Active Goals',
      value: roadmapAnalytics.inProgress + roadmapAnalytics.pending,
      icon: <Target size={15} />,
      color: '#ec4899',
      subtext: `${roadmapAnalytics.inProgress} in progress`,
    },
    {
      label: 'Velocity',
      value: dsaAnalytics.velocity,
      suffix: '/d',
      icon: <Zap size={15} />,
      color: '#f97316',
      decimals: 1,
      subtext: 'Problems per day (7d)',
    },
    {
      label: 'Avg per Day',
      value: dsaAnalytics.averagePerDay,
      icon: <BarChart2 size={15} />,
      color: '#818cf8',
      decimals: 1,
      subtext: 'Since started',
    },
    {
      label: 'Health Score',
      value: overallHealthScore,
      suffix: '%',
      icon: <Star size={15} />,
      color: '#fbbf24',
      subtext: 'Overall progress',
    },
    {
      label: 'Recent Activity',
      value: recentActivityCount,
      icon: <Activity size={15} />,
      color: '#34d399',
      subtext: 'Last 30 days',
    },
    {
      label: 'Goal Progress',
      value: roadmapAnalytics.completionRate,
      suffix: '%',
      icon: <Award size={15} />,
      color: '#a78bfa',
      subtext: 'Completion rate',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
      {cards.map((card, i) => (
        <StatCard key={card.label} {...card} delay={i * 0.05} />
      ))}
    </div>
  );
}
