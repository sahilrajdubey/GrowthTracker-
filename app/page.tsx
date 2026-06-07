'use client';

import { useEffect } from 'react';
import { useStore } from '@/store/useStore';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import PageContainer from '@/components/layout/PageContainer';
import DashboardModule from '@/components/dashboard/DashboardModule';
import DSAModule from '@/components/dsa/DSAModule';
import DSAAnalytics from '@/components/charts/DSAAnalytics';
import DevModule from '@/components/dev/DevModule';
import RoadmapModule from '@/components/roadmap/RoadmapModule';
import { cn } from '@/lib/utils';

export default function Home() {
  const { activeModule, setActiveModule, isHydrated, hydrate, sidebarCollapsed } = useStore();

  // Hydrate store from localStorage on mount
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // Keyboard navigation shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const active = document.activeElement;
      if (
        active &&
        (active.tagName === 'INPUT' ||
          active.tagName === 'TEXTAREA' ||
          active.tagName === 'SELECT' ||
          active.getAttribute('contenteditable') === 'true')
      ) {
        return;
      }

      const keyToModuleMap: Record<string, typeof activeModule> = {
        '1': 'dashboard',
        '2': 'dsa',
        '3': 'analytics',
        '4': 'dev',
        '5': 'roadmap',
      };

      if (keyToModuleMap[e.key]) {
        setActiveModule(keyToModuleMap[e.key]);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setActiveModule]);

  if (!isHydrated) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#050507] text-[#818cf8]">
        <div className="w-12 h-12 border-2 border-t-transparent rounded-full animate-spin mb-4" style={{ borderColor: '#6366f1', borderTopColor: 'transparent' }} />
        <span className="text-xs font-mono tracking-widest animate-pulse uppercase">Initializing OS...</span>
      </div>
    );
  }

  // Render the current active module
  const renderActiveModule = () => {
    switch (activeModule) {
      case 'dashboard':
        return <DashboardModule />;
      case 'dsa':
        return <DSAModule />;
      case 'analytics':
        return <DSAAnalytics />;
      case 'dev':
        return <DevModule />;
      case 'roadmap':
        return <RoadmapModule />;
      default:
        return <DashboardModule />;
    }
  };

  return (
    <div className="min-h-screen bg-[#050507] flex text-slate-100 font-sans antialiased">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Panel */}
      <div
        className={cn(
          "flex-1 flex flex-col min-w-0 transition-all duration-300",
          sidebarCollapsed ? "ml-0 md:ml-16" : "ml-0 md:ml-60"
        )}
        style={{
          paddingTop: 'var(--header-height)',
        }}
      >
        {/* Top Control Bar */}
        <Header />

        {/* Tab Module Wrapper */}
        <PageContainer>
          {renderActiveModule()}
        </PageContainer>
      </div>
    </div>
  );
}
