/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense, lazy } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import { AppErrorBoundary } from './components/AppErrorBoundary';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { OfflineIndicator } from './components/OfflineIndicator';
import { StaticAtmosphericBackdrop } from './components/world/StaticAtmosphericBackdrop';
import { HeroAmbientCanvasHost } from './components/world/ImmersiveWorldBackground';
import { WorldSceneProvider } from './components/world/WorldSceneContext';

import { HomePage } from './pages/HomePage';
const AboutPage = lazy(() =>
  import('./pages/AboutPage').then((m) => ({ default: m.AboutPage }))
);
const AcademicJourneyPage = lazy(() =>
  import('./pages/AcademicJourneyPage').then((m) => ({ default: m.AcademicJourneyPage }))
);
const ProjectsPage = lazy(() =>
  import('./pages/ProjectsPage').then((m) => ({ default: m.ProjectsPage }))
);
const ProjectDetailPage = lazy(() =>
  import('./pages/ProjectDetailPage').then((m) => ({ default: m.ProjectDetailPage }))
);
const LearningNotesPage = lazy(() =>
  import('./pages/LearningNotesPage').then((m) => ({ default: m.LearningNotesPage }))
);
const MilestonesPage = lazy(() =>
  import('./pages/MilestonesPage').then((m) => ({ default: m.MilestonesPage }))
);
const ConnectPage = lazy(() =>
  import('./pages/ConnectPage').then((m) => ({ default: m.ConnectPage }))
);
const AdminDashboard = lazy(() =>
  import('./pages/admin/AdminDashboard').then((m) => ({ default: m.AdminDashboard }))
);
const NotFoundPage = lazy(() =>
  import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage }))
);

const RouteLoadingFallback: React.FC = () => (
  <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 flex items-center justify-center">
    <div
      className="w-6 h-6 rounded-full border-2 border-[var(--color-primary)] border-t-transparent animate-spin"
      role="status"
      aria-label="Loading view"
    />
  </div>
);

const AppContent: React.FC = () => {
  const { currentRoute, currentPath, language, navigate, theme } = useApp();
  const isHomeRoute = currentRoute.routeName === 'home';

  const renderCurrentView = () => {
    switch (currentRoute.routeName) {
      case 'home':
        return <HomePage />;
      case 'about':
        return <AboutPage />;
      case 'academic':
        return <AcademicJourneyPage />;
      case 'projects':
        return <ProjectsPage />;
      case 'project-detail':
        return <ProjectDetailPage projectId={currentRoute.params.id || ''} />;
      case 'notes':
        return <LearningNotesPage />;
      case 'note-detail':
        return <LearningNotesPage noteId={currentRoute.params.id} />;
      case 'milestones':
        return <MilestonesPage />;
      case 'connect':
        return <ConnectPage />;
      case 'admin':
        return <AdminDashboard />;
      case 'not-found':
      default:
        return <NotFoundPage />;
    }
  };

  return (
    <div className="relative min-h-screen overflow-x-clip text-[var(--color-text)] selection:bg-[var(--color-primary-muted)] selection:text-[var(--color-primary)]">
      {/* Lightweight zero-WebGL route-specific atmospheric backdrop across all routes */}
      <StaticAtmosphericBackdrop theme={theme} routeName={currentRoute.routeName} />

      {/* Single persistent desktop WebGL host (interactive on Home, calm attenuated off-Home, unmounted on Admin/404) */}
      <HeroAmbientCanvasHost />

      {/* Layered Foreground HTML Interface */}
      <div
        className={`relative z-10 flex flex-col min-h-screen bg-transparent ${
          isHomeRoute ? 'pointer-events-none' : ''
        }`}
      >
        <div className="pointer-events-auto">
          <Header />
          <OfflineIndicator />
        </div>
        <main
          className={`flex-1 w-full ${isHomeRoute ? 'pointer-events-none' : ''}`}
          id="main-content"
          tabIndex={-1}
        >
          <AppErrorBoundary
            variant="route"
            resetKey={currentPath}
            language={language}
            onNavigateHome={() => navigate('/')}
          >
            <Suspense fallback={<RouteLoadingFallback />}>
              {renderCurrentView()}
            </Suspense>
          </AppErrorBoundary>
        </main>
        <div className="pointer-events-auto">
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppErrorBoundary variant="fullscreen">
      <AppProvider>
        <AuthProvider>
          <WorldSceneProvider>
            <AppContent />
          </WorldSceneProvider>
        </AuthProvider>
      </AppProvider>
    </AppErrorBoundary>
  );
}
