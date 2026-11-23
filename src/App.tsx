import React from 'react';
import { AppShell } from './components/layout/AppShell';
import { AiStudioView } from './components/views/AiStudioView';
import { DashboardView } from './components/views/DashboardView';
import { ProgressView } from './components/views/ProgressView';
import { ResourcesView } from './components/views/ResourcesView';
import { SpellingView } from './components/views/SpellingView';
import { StudyToolsView } from './components/views/StudyToolsView';
import { SubjectsView } from './components/views/SubjectsView';
import { TutorView } from './components/views/TutorView';
import { PlatformProvider, usePlatform } from './context/PlatformContext';

function ActiveSectionContent() {
  const { activeSection } = usePlatform();

  switch (activeSection) {
    case 'dashboard':
      return <DashboardView />;
    case 'subjects':
      return <SubjectsView />;
    case 'tutor':
      return <TutorView />;
    case 'ai-studio':
      return <AiStudioView />;
    case 'resources':
      return <ResourcesView />;
    case 'study-tools':
      return <StudyToolsView />;
    case 'spelling':
      return <SpellingView />;
    case 'progress':
      return <ProgressView />;
  }
}

export default function App() {
  return (
    <PlatformProvider>
      <AppShell>
        <ActiveSectionContent />
      </AppShell>
    </PlatformProvider>
  );
}
