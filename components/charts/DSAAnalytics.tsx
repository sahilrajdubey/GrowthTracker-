'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, Grid3X3, Zap, BarChart3, Target, Map, Star,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { cn } from '@/lib/utils';

// Lazy load charts for performance
const CumulativeGrowthChart = dynamic(() => import('./CumulativeGrowthChart'), { ssr: false });
const DifficultyChart = dynamic(() => import('./DifficultyChart'), { ssr: false });
const ContributionHeatmap = dynamic(() => import('./ContributionHeatmap'), { ssr: false });
const MomentumChart = dynamic(() => import('./MomentumChart'), { ssr: false });
const TrajectoryForecast = dynamic(() => import('./TrajectoryForecast'), { ssr: false });
const RadarSkillChart = dynamic(() => import('./RadarSkillChart'), { ssr: false });
const WeeklyTrendChart = dynamic(() => import('./WeeklyTrendChart'), { ssr: false });

interface ChartCard {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  component: React.ComponentType;
  height: number;
  colSpan?: number;
}

const CHARTS: ChartCard[] = [
  {
    id: 'cumulative',
    title: 'Cumulative Growth',
    subtitle: 'Total solved & weighted score over time',
    icon: <TrendingUp size={14} />,
    component: CumulativeGrowthChart,
    height: 220,
    colSpan: 2,
  },
  {
    id: 'difficulty',
    title: 'Difficulty Breakdown',
    subtitle: 'Weekly Easy / Medium / Hard distribution',
    icon: <BarChart3 size={14} />,
    component: DifficultyChart,
    height: 220,
  },
  {
    id: 'weekly',
    title: 'Weekly Trend',
    subtitle: 'Problems solved per week',
    icon: <Target size={14} />,
    component: WeeklyTrendChart,
    height: 220,
  },
  {
    id: 'momentum',
    title: 'Momentum & Velocity',
    subtitle: '7-day rolling average vs daily solves',
    icon: <Zap size={14} />,
    component: MomentumChart,
    height: 220,
  },
  {
    id: 'heatmap',
    title: 'Contribution Heatmap',
    subtitle: '365-day activity grid',
    icon: <Grid3X3 size={14} />,
    component: ContributionHeatmap,
    height: 140,
    colSpan: 2,
  },
  {
    id: 'trajectory',
    title: 'AI Trajectory Forecast',
    subtitle: '60-day projected growth at current pace',
    icon: <Map size={14} />,
    component: TrajectoryForecast,
    height: 240,
    colSpan: 2,
  },
  {
    id: 'radar',
    title: 'Skill Radar',
    subtitle: 'Multi-dimensional growth scores',
    icon: <Star size={14} />,
    component: RadarSkillChart,
    height: 280,
  },
];

function ChartContainer({ chart, delay }: { chart: ChartCard; delay: number }) {
  const { component: Chart } = chart;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className={cn('glass-card p-4', chart.colSpan === 2 ? 'col-span-2' : '')}
      style={{ gridColumn: chart.colSpan === 2 ? 'span 2' : undefined }}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span style={{ color: '#6366f1' }}>{chart.icon}</span>
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              {chart.title}
            </h3>
          </div>
          <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
            {chart.subtitle}
          </p>
        </div>
      </div>
      <div style={{ height: chart.height }}>
        <Chart />
      </div>
    </motion.div>
  );
}

export default function DSAAnalytics() {
  return (
    <div className="grid grid-cols-2 gap-4">
      {CHARTS.map((chart, i) => (
        <ChartContainer key={chart.id} chart={chart} delay={i * 0.06} />
      ))}
    </div>
  );
}
