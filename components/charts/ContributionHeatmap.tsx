'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { format, subDays, eachDayOfInterval, parseISO } from 'date-fns';
import { useStore } from '@/store/useStore';
import { getHeatmapColor } from '@/lib/constants';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAYS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

function tooltip(date: string, count: number) {
  try {
    const d = parseISO(date);
    return `${format(d, 'MMM d, yyyy')}: ${count} problem${count !== 1 ? 's' : ''}`;
  } catch {
    return `${date}: ${count}`;
  }
}

export default function ContributionHeatmap() {
  const { stats } = useStore();
  const { heatmapData } = stats.dsaAnalytics;

  // Build 365-day grid
  const today = new Date();
  const startDate = subDays(today, 364);

  const weeks = useMemo(() => {
    const allDays = eachDayOfInterval({ start: startDate, end: today });
    const dayMap: { date: string; count: number; month: number; dayOfWeek: number }[] = allDays.map((d) => {
      const key = format(d, 'yyyy-MM-dd');
      return {
        date: key,
        count: heatmapData[key] || 0,
        month: d.getMonth(),
        dayOfWeek: d.getDay(),
      };
    });

    // Group into weeks (Sunday first)
    const ws: typeof dayMap[] = [];
    let week: typeof dayMap = [];

    // Pad start
    const firstDow = allDays[0].getDay();
    for (let i = 0; i < firstDow; i++) {
      week.push({ date: '', count: 0, month: -1, dayOfWeek: i });
    }

    for (const day of dayMap) {
      week.push(day);
      if (week.length === 7) {
        ws.push(week);
        week = [];
      }
    }
    if (week.length > 0) ws.push(week);

    return ws;
  }, [heatmapData]);

  // Month labels
  const monthLabels = useMemo(() => {
    const labels: { month: string; col: number }[] = [];
    let lastMonth = -1;
    weeks.forEach((week, col) => {
      const firstReal = week.find((d) => d.date);
      if (firstReal && firstReal.month !== lastMonth) {
        labels.push({ month: MONTHS[firstReal.month], col });
        lastMonth = firstReal.month;
      }
    });
    return labels;
  }, [weeks]);

  const totalSolved = Object.values(heatmapData).reduce((s, v) => s + v, 0);

  return (
    <div className="w-full overflow-x-auto">
      {/* Month labels */}
      <div className="flex ml-7 mb-1" style={{ gap: 3 }}>
        {monthLabels.map(({ month, col }) => (
          <div
            key={`${month}-${col}`}
            className="text-[9px]"
            style={{
              color: 'var(--text-muted)',
              marginLeft: col === 0 ? 0 : `${col * 13}px`,
              position: 'absolute',
              left: `${7 + col * 13}px`,
            }}
          >
            {month}
          </div>
        ))}
      </div>

      <div className="flex" style={{ gap: 0 }}>
        {/* Day labels */}
        <div className="flex flex-col mr-1" style={{ gap: 3, paddingTop: 12 }}>
          {DAYS.map((d, i) => (
            <div key={i} className="h-[10px] flex items-center" style={{ width: 20 }}>
              <span className="text-[8px]" style={{ color: 'var(--text-muted)' }}>{d}</span>
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="flex" style={{ gap: 3, paddingTop: 12 }}>
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col" style={{ gap: 3 }}>
              {week.map((day, di) => (
                <motion.div
                  key={`${wi}-${di}`}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: Math.random() * 0.3, duration: 0.2 }}
                  className="rounded-sm cursor-default relative group"
                  style={{
                    width: 10,
                    height: 10,
                    background: day.date ? getHeatmapColor(day.count) : 'transparent',
                    border: day.date && day.count > 0 ? '1px solid rgba(99,102,241,0.2)' : 'none',
                  }}
                  title={day.date ? tooltip(day.date, day.count) : ''}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between mt-3">
        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
          {totalSolved} problems in the last year
        </span>
        <div className="flex items-center gap-1.5">
          <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Less</span>
          {[0, 1, 2, 4, 7].map((v) => (
            <div
              key={v}
              className="rounded-sm"
              style={{
                width: 10,
                height: 10,
                background: getHeatmapColor(v),
                border: v > 0 ? '1px solid rgba(99,102,241,0.2)' : 'none',
              }}
            />
          ))}
          <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>More</span>
        </div>
      </div>
    </div>
  );
}
