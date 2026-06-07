'use client';

import { motion } from 'framer-motion';
import StatsGrid from './StatsGrid';
import HealthScore from './HealthScore';
import QuickActions from './QuickActions';
import ActivityFeed from './ActivityFeed';
import ContributionHeatmap from '../charts/ContributionHeatmap';

export default function DashboardModule() {
  return (
    <div className="space-y-6">
      {/* Welcome & Intro */}
      <div>
        <h1 className="text-xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
          Growth Command Center
        </h1>
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
          Real-time metrics, consistency tracking, and developmental velocity overview
        </p>
      </div>

      {/* Stats Cards Grid */}
      <StatsGrid />

      {/* Middle Layout (Split Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Health Score + Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          <HealthScore />
          <QuickActions />
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              Activity Pulse (Last 365 Days)
            </h3>
            <ContributionHeatmap />
          </div>
        </div>

        {/* Right Column: Activity Feed */}
        <div className="lg:col-span-1">
          <ActivityFeed />
        </div>
      </div>
    </div>
  );
}
