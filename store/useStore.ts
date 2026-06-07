'use client';

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type {
  DSAProblem,
  DevAchievement,
  RoadmapMilestone,
  ActivityItem,
  ActiveModule,
  FilterState,
  UnifiedStats,
} from '@/lib/types';
import {
  loadAppState,
  saveAppState,
  getDefaultAppState,
} from '@/lib/storage';
import {
  computeUnifiedStats,
} from '@/lib/analytics';
import { generateId, nowISO } from '@/lib/utils';

// ─── State Shape ───────────────────────────────────────────────────────────────

interface StoreState {
  // Data
  dsaProblems: DSAProblem[];
  devAchievements: DevAchievement[];
  roadmapMilestones: RoadmapMilestone[];
  activityFeed: ActivityItem[];

  // Computed (derived from data)
  stats: UnifiedStats;

  // UI State
  activeModule: ActiveModule;
  dsaFilter: FilterState;
  isHydrated: boolean;
  sidebarCollapsed: boolean;
  dsaFormOpen: boolean;
  devFormOpen: boolean;
  roadmapFormOpen: boolean;

  // DSA CRUD
  addDSAProblem: (problem: Omit<DSAProblem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateDSAProblem: (id: string, updates: Partial<Omit<DSAProblem, 'id' | 'createdAt'>>) => void;
  deleteDSAProblem: (id: string) => void;

  // Dev CRUD
  addDevAchievement: (achievement: Omit<DevAchievement, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateDevAchievement: (id: string, updates: Partial<Omit<DevAchievement, 'id' | 'createdAt'>>) => void;
  deleteDevAchievement: (id: string) => void;

  // Roadmap CRUD
  addMilestone: (milestone: Omit<RoadmapMilestone, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateMilestone: (id: string, updates: Partial<Omit<RoadmapMilestone, 'id' | 'createdAt'>>) => void;
  deleteMilestone: (id: string) => void;
  completeMilestone: (id: string) => void;
  reorderMilestones: (orderedIds: string[]) => void;

  // UI Actions
  setActiveModule: (module: ActiveModule) => void;
  setDSAFilter: (filter: Partial<FilterState>) => void;
  resetDSAFilter: () => void;
  toggleSidebar: () => void;
  setDsaFormOpen: (open: boolean) => void;
  setDevFormOpen: (open: boolean) => void;
  setRoadmapFormOpen: (open: boolean) => void;

  // Persistence
  hydrate: () => void;
  importState: (state: Partial<typeof DEFAULT_APP_STATE>) => void;
  exportableState: () => ReturnType<typeof buildExportState>;
}

// ─── Defaults ──────────────────────────────────────────────────────────────────

const DEFAULT_APP_STATE = getDefaultAppState();

const DEFAULT_FILTER: FilterState = {
  search: '',
  difficulty: 'All',
  tags: [],
  dateFrom: null,
  dateTo: null,
  sortBy: 'date',
  sortOrder: 'desc',
};

function buildExportState(state: StoreState) {
  return {
    dsaProblems: state.dsaProblems,
    devAchievements: state.devAchievements,
    roadmapMilestones: state.roadmapMilestones,
    activityFeed: state.activityFeed,
    lastUpdated: nowISO(),
    version: '1.0.0',
  };
}

// ─── Activity Helper ──────────────────────────────────────────────────────────

function createActivity(
  type: ActivityItem['type'],
  title: string,
  subtitle?: string,
  meta?: Record<string, string | number>
): ActivityItem {
  return { id: generateId(), type, title, subtitle, timestamp: nowISO(), meta };
}

// ─── Recompute Stats ──────────────────────────────────────────────────────────

function recomputeStats(
  problems: DSAProblem[],
  achievements: DevAchievement[],
  milestones: RoadmapMilestone[]
): UnifiedStats {
  return computeUnifiedStats(problems, achievements, milestones);
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useStore = create<StoreState>()(
  subscribeWithSelector((set, get) => ({
    // Initial Data State
    dsaProblems: [],
    devAchievements: [],
    roadmapMilestones: [],
    activityFeed: [],
    stats: computeUnifiedStats([], [], []),

    // UI State
    activeModule: 'dashboard',
    dsaFilter: DEFAULT_FILTER,
    isHydrated: false,
    sidebarCollapsed: false,
    dsaFormOpen: false,
    devFormOpen: false,
    roadmapFormOpen: false,

    // ─── Hydration ──────────────────────────────────────────────────────

    hydrate: () => {
      const saved = loadAppState();
      if (saved) {
        const stats = recomputeStats(
          saved.dsaProblems,
          saved.devAchievements,
          saved.roadmapMilestones
        );
        set({
          dsaProblems: saved.dsaProblems || [],
          devAchievements: saved.devAchievements || [],
          roadmapMilestones: saved.roadmapMilestones || [],
          activityFeed: saved.activityFeed || [],
          stats,
          isHydrated: true,
        });
      } else {
        set({ isHydrated: true });
      }
    },

    importState: (newState) => {
      const problems = newState.dsaProblems || [];
      const achievements = newState.devAchievements || [];
      const milestones = newState.roadmapMilestones || [];
      const activity = newState.activityFeed || [];
      const stats = recomputeStats(problems, achievements, milestones);
      set({ dsaProblems: problems, devAchievements: achievements, roadmapMilestones: milestones, activityFeed: activity, stats });
      saveAppState({ dsaProblems: problems, devAchievements: achievements, roadmapMilestones: milestones, activityFeed: activity, lastUpdated: nowISO(), version: '1.0.0' });
    },

    exportableState: () => buildExportState(get()),

    // ─── DSA CRUD ────────────────────────────────────────────────────────

    addDSAProblem: (problem) => {
      const newProblem: DSAProblem = {
        ...problem,
        id: generateId(),
        createdAt: nowISO(),
        updatedAt: nowISO(),
      };
      const problems = [...get().dsaProblems, newProblem];
      const achievements = get().devAchievements;
      const milestones = get().roadmapMilestones;
      const stats = recomputeStats(problems, achievements, milestones);
      const activity = [
        createActivity('dsa_added', `Added: ${newProblem.title}`, `#${newProblem.number} · ${newProblem.difficulty}`, { difficulty: newProblem.difficulty }),
        ...get().activityFeed.slice(0, 49),
      ];
      set({ dsaProblems: problems, stats, activityFeed: activity });
      saveAppState({ dsaProblems: problems, devAchievements: achievements, roadmapMilestones: milestones, activityFeed: activity, lastUpdated: nowISO(), version: '1.0.0' });
    },

    updateDSAProblem: (id, updates) => {
      const problems = get().dsaProblems.map((p) =>
        p.id === id ? { ...p, ...updates, updatedAt: nowISO() } : p
      );
      const achievements = get().devAchievements;
      const milestones = get().roadmapMilestones;
      const stats = recomputeStats(problems, achievements, milestones);
      const updated = problems.find((p) => p.id === id);
      const activity = [
        createActivity('dsa_edited', `Updated: ${updated?.title || ''}`, `#${updated?.number} · ${updated?.difficulty}`),
        ...get().activityFeed.slice(0, 49),
      ];
      set({ dsaProblems: problems, stats, activityFeed: activity });
      saveAppState({ dsaProblems: problems, devAchievements: achievements, roadmapMilestones: milestones, activityFeed: activity, lastUpdated: nowISO(), version: '1.0.0' });
    },

    deleteDSAProblem: (id) => {
      const deleted = get().dsaProblems.find((p) => p.id === id);
      const problems = get().dsaProblems.filter((p) => p.id !== id);
      const achievements = get().devAchievements;
      const milestones = get().roadmapMilestones;
      const stats = recomputeStats(problems, achievements, milestones);
      const activity = [
        createActivity('dsa_deleted', `Deleted: ${deleted?.title || 'Problem'}`, `#${deleted?.number}`),
        ...get().activityFeed.slice(0, 49),
      ];
      set({ dsaProblems: problems, stats, activityFeed: activity });
      saveAppState({ dsaProblems: problems, devAchievements: achievements, roadmapMilestones: milestones, activityFeed: activity, lastUpdated: nowISO(), version: '1.0.0' });
    },

    // ─── Dev CRUD ────────────────────────────────────────────────────────

    addDevAchievement: (achievement) => {
      const newAchievement: DevAchievement = {
        ...achievement,
        id: generateId(),
        createdAt: nowISO(),
        updatedAt: nowISO(),
      };
      const problems = get().dsaProblems;
      const achievements = [...get().devAchievements, newAchievement];
      const milestones = get().roadmapMilestones;
      const stats = recomputeStats(problems, achievements, milestones);
      const activity = [
        createActivity('dev_added', `Achievement: ${newAchievement.title}`, newAchievement.category),
        ...get().activityFeed.slice(0, 49),
      ];
      set({ devAchievements: achievements, stats, activityFeed: activity });
      saveAppState({ dsaProblems: problems, devAchievements: achievements, roadmapMilestones: milestones, activityFeed: activity, lastUpdated: nowISO(), version: '1.0.0' });
    },

    updateDevAchievement: (id, updates) => {
      const problems = get().dsaProblems;
      const achievements = get().devAchievements.map((a) =>
        a.id === id ? { ...a, ...updates, updatedAt: nowISO() } : a
      );
      const milestones = get().roadmapMilestones;
      const stats = recomputeStats(problems, achievements, milestones);
      const updated = achievements.find((a) => a.id === id);
      const activity = [
        createActivity('dev_edited', `Updated: ${updated?.title || ''}`, updated?.category),
        ...get().activityFeed.slice(0, 49),
      ];
      set({ devAchievements: achievements, stats, activityFeed: activity });
      saveAppState({ dsaProblems: problems, devAchievements: achievements, roadmapMilestones: milestones, activityFeed: activity, lastUpdated: nowISO(), version: '1.0.0' });
    },

    deleteDevAchievement: (id) => {
      const deleted = get().devAchievements.find((a) => a.id === id);
      const problems = get().dsaProblems;
      const achievements = get().devAchievements.filter((a) => a.id !== id);
      const milestones = get().roadmapMilestones;
      const stats = recomputeStats(problems, achievements, milestones);
      const activity = [
        createActivity('dev_deleted', `Removed: ${deleted?.title || 'Achievement'}`),
        ...get().activityFeed.slice(0, 49),
      ];
      set({ devAchievements: achievements, stats, activityFeed: activity });
      saveAppState({ dsaProblems: problems, devAchievements: achievements, roadmapMilestones: milestones, activityFeed: activity, lastUpdated: nowISO(), version: '1.0.0' });
    },

    // ─── Roadmap CRUD ────────────────────────────────────────────────────

    addMilestone: (milestone) => {
      const newMilestone: RoadmapMilestone = {
        ...milestone,
        id: generateId(),
        createdAt: nowISO(),
        updatedAt: nowISO(),
      };
      const problems = get().dsaProblems;
      const achievements = get().devAchievements;
      const milestones = [...get().roadmapMilestones, newMilestone];
      const stats = recomputeStats(problems, achievements, milestones);
      const activity = [
        createActivity('milestone_added', `Goal: ${newMilestone.title}`, newMilestone.difficulty),
        ...get().activityFeed.slice(0, 49),
      ];
      set({ roadmapMilestones: milestones, stats, activityFeed: activity });
      saveAppState({ dsaProblems: problems, devAchievements: achievements, roadmapMilestones: milestones, activityFeed: activity, lastUpdated: nowISO(), version: '1.0.0' });
    },

    updateMilestone: (id, updates) => {
      const problems = get().dsaProblems;
      const achievements = get().devAchievements;
      const milestones = get().roadmapMilestones.map((m) =>
        m.id === id ? { ...m, ...updates, updatedAt: nowISO() } : m
      );
      const stats = recomputeStats(problems, achievements, milestones);
      set({ roadmapMilestones: milestones, stats });
      saveAppState({ dsaProblems: problems, devAchievements: achievements, roadmapMilestones: milestones, activityFeed: get().activityFeed, lastUpdated: nowISO(), version: '1.0.0' });
    },

    deleteMilestone: (id) => {
      const deleted = get().roadmapMilestones.find((m) => m.id === id);
      const problems = get().dsaProblems;
      const achievements = get().devAchievements;
      const milestones = get().roadmapMilestones.filter((m) => m.id !== id);
      const stats = recomputeStats(problems, achievements, milestones);
      const activity = [
        createActivity('milestone_deleted', `Removed goal: ${deleted?.title || ''}`),
        ...get().activityFeed.slice(0, 49),
      ];
      set({ roadmapMilestones: milestones, stats, activityFeed: activity });
      saveAppState({ dsaProblems: problems, devAchievements: achievements, roadmapMilestones: milestones, activityFeed: activity, lastUpdated: nowISO(), version: '1.0.0' });
    },

    completeMilestone: (id) => {
      const problems = get().dsaProblems;
      const achievements = get().devAchievements;
      const milestones = get().roadmapMilestones.map((m) =>
        m.id === id
          ? { ...m, status: 'completed' as const, completedAt: nowISO(), updatedAt: nowISO() }
          : m
      );
      const stats = recomputeStats(problems, achievements, milestones);
      const completed = milestones.find((m) => m.id === id);
      const activity = [
        createActivity('milestone_completed', `Completed: ${completed?.title || ''}`, '🎉 Goal achieved!'),
        ...get().activityFeed.slice(0, 49),
      ];
      set({ roadmapMilestones: milestones, stats, activityFeed: activity });
      saveAppState({ dsaProblems: problems, devAchievements: achievements, roadmapMilestones: milestones, activityFeed: activity, lastUpdated: nowISO(), version: '1.0.0' });
    },

    reorderMilestones: (orderedIds) => {
      const milestoneMap = Object.fromEntries(get().roadmapMilestones.map((m) => [m.id, m]));
      const milestones = orderedIds
        .map((id, idx) => milestoneMap[id] ? { ...milestoneMap[id], priority: idx } : null)
        .filter(Boolean) as RoadmapMilestone[];
      const problems = get().dsaProblems;
      const achievements = get().devAchievements;
      const stats = recomputeStats(problems, achievements, milestones);
      set({ roadmapMilestones: milestones, stats });
      saveAppState({ dsaProblems: problems, devAchievements: achievements, roadmapMilestones: milestones, activityFeed: get().activityFeed, lastUpdated: nowISO(), version: '1.0.0' });
    },

    // ─── UI Actions ──────────────────────────────────────────────────────

    setActiveModule: (module) => set({ activeModule: module }),
    setDSAFilter: (filter) =>
      set((state) => ({ dsaFilter: { ...state.dsaFilter, ...filter } })),
    resetDSAFilter: () => set({ dsaFilter: DEFAULT_FILTER }),
    toggleSidebar: () =>
      set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
    setDsaFormOpen: (open) => set({ dsaFormOpen: open }),
    setDevFormOpen: (open) => set({ devFormOpen: open }),
    setRoadmapFormOpen: (open) => set({ roadmapFormOpen: open }),
  }))
);
