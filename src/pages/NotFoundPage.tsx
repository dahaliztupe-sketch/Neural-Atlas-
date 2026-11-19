import React from 'react';
import { useApp } from '../context/AppContext';
import { Compass, Home, BookOpen, Code2 } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const { t, navigate } = useApp();

  return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-6">
      <div className="na-mineral-card w-16 h-16 mx-auto rounded-2xl flex items-center justify-center text-[var(--color-secondary)]">
        <Compass className="w-8 h-8" aria-hidden="true" />
      </div>

      <div className="space-y-2">
        <span className="font-mono text-xs text-[var(--color-primary)]">ERROR 404</span>
        <h1 className="text-3xl font-bold text-[var(--color-text)] tracking-tight text-balance">
          {t('notFoundTitle')}
        </h1>
        <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
          {t('notFoundDesc')}
        </p>
      </div>

      {/* Internal Navigation Shortcuts */}
      <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="px-4 py-2 min-h-[44px] rounded-xl bg-[var(--color-primary)] text-white text-xs font-semibold hover:bg-[var(--color-primary-hover)] transition-colors inline-flex items-center gap-2 cursor-pointer"
        >
          <Home className="w-4 h-4" aria-hidden="true" />
          <span>{t('btnBackHome')}</span>
        </button>

        <button
          type="button"
          onClick={() => navigate('/academic')}
          className="na-mineral-card na-mineral-card-interactive px-4 py-2 min-h-[44px] rounded-xl text-[var(--color-text)] text-xs font-medium inline-flex items-center gap-2 cursor-pointer"
        >
          <BookOpen className="w-4 h-4 text-[var(--color-secondary)]" aria-hidden="true" />
          <span>{t('navAcademic')}</span>
        </button>

        <button
          type="button"
          onClick={() => navigate('/projects')}
          className="na-mineral-card na-mineral-card-interactive px-4 py-2 min-h-[44px] rounded-xl text-[var(--color-text)] text-xs font-medium inline-flex items-center gap-2 cursor-pointer"
        >
          <Code2 className="w-4 h-4 text-[var(--color-primary)]" aria-hidden="true" />
          <span>{t('navProjects')}</span>
        </button>
      </div>
    </div>
  );
};
