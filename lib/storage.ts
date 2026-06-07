import type { AppState } from './types';

const STORAGE_KEY = 'growthtracker_v1';
const ACTIVITY_KEY = 'growthtracker_activity_v1';
const VERSION = '1.0.0';

export function loadAppState(): AppState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AppState;
    return parsed;
  } catch {
    return null;
  }
}

export function saveAppState(state: AppState): void {
  if (typeof window === 'undefined') return;
  try {
    const toSave: AppState = {
      ...state,
      lastUpdated: new Date().toISOString(),
      version: VERSION,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch (err) {
    console.error('[storage] Failed to save state:', err);
  }
}

export function clearAppState(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(ACTIVITY_KEY);
}

export function exportData(state: AppState): void {
  const blob = new Blob([JSON.stringify(state, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `growthtracker-export-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importData(file: File): Promise<AppState> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string) as AppState;
        // Basic validation
        if (!parsed.dsaProblems || !parsed.devAchievements || !parsed.roadmapMilestones) {
          reject(new Error('Invalid data format'));
          return;
        }
        resolve(parsed);
      } catch {
        reject(new Error('Failed to parse JSON'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

export function getDefaultAppState(): AppState {
  return {
    dsaProblems: [],
    devAchievements: [],
    roadmapMilestones: [],
    activityFeed: [],
    lastUpdated: new Date().toISOString(),
    version: VERSION,
  };
}
