import React, { useCallback, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { MilestoneRecord } from '../types';
import { CACHE_KEYS } from '../services/cacheService';
import { useCachedResource } from '../hooks/useCachedResource';
import { DataQueryResult, getPublishedMilestonesResult, isValidUrl } from '../services/contentRepository';
import { EmptyState } from '../components/EmptyState';
import { Flag, RefreshCw, AlertTriangle, ExternalLink } from 'lucide-react';

export const MilestonesPage: React.FC = () => {
  const { t, isRtl, navigate } = useApp();

  const fetchMilestones = useCallback(() => getPublishedMilestonesResult(), []);
  const {
    data: queryResult,
    loading,
    refresh: loadMilestones,
  } = useCachedResource<DataQueryResult<MilestoneRecord[]>>(
    CACHE_KEYS.milestonesList,
    fetchMilestones,
    {
      shouldPersist: (res) => res.status !== 'error',
      isErrorResult: (res) => res.status === 'error',
    }
  );

  const errorCode = queryResult?.status === 'error' ? queryResult.errorCode || 'query_error' : null;
  const milestones = useMemo<MilestoneRecord[]>(
    () => (queryResult?.status === 'error' ? [] : queryResult?.items || []),
    [queryResult]
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-10">
      <div>
        <div className="flex items-center gap-2 text-xs font-mono text-[var(--color-primary)] mb-2">
          <Flag className="w-4 h-4" aria-hidden="true" />
          <span>{t('milestonesKicker')}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-[var(--color-text)] tracking-tight text-balance mb-3">
          {t('milestonesTitle')}
        </h1>
        <p className="text-base text-[var(--color-text-muted)]">
          {t('milestonesSubtitle')}
        </p>
      </div>

      <div aria-live="polite">
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-2 text-xs font-mono text-[var(--color-text-muted)]" role="status">
            <RefreshCw className="w-5 h-5 text-[var(--color-primary)] animate-spin" aria-hidden="true" />
            <span>{t('milestonesLoading')}</span>
          </div>
        ) : errorCode ? (
          <div className="p-6 rounded-2xl border border-red-500/30 bg-red-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-red-400 font-semibold text-sm">
                <AlertTriangle className="w-5 h-5 shrink-0" aria-hidden="true" />
                <span>{t('milestonesLoadErrorTitle')}</span>
              </div>
              <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                {t('milestonesLoadErrorDesc')}
              </p>
            </div>
            <button
              type="button"
              onClick={loadMilestones}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-red-400/40 bg-red-500/10 text-xs font-medium text-[var(--color-text)] hover:bg-red-500/20 transition-colors cursor-pointer shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{t('retryAction')}</span>
            </button>
          </div>
        ) : milestones.length > 0 ? (
          <div className="relative border-s border-[var(--color-border)] ms-3 space-y-8">
            {milestones.map((item) => (
              <div key={item.id} className="relative ps-6">
                <div className="absolute -start-2 top-1.5 w-4 h-4 rounded-full border-2 border-[var(--color-primary)] bg-[var(--color-bg)] flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)]" />
                </div>
                <div className="na-mineral-card p-5 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono text-[var(--color-secondary)]">
                    <span>{isRtl ? item.dateAr || item.dateEn : item.dateEn}</span>
                    <span className="text-[var(--color-text-subtle)]">
                      {item.category === 'academic'
                        ? t('milestonesCategoryAcademic')
                        : t('milestonesCategoryTechnical')}
                    </span>
                  </div>
                  <h2 className="text-base font-semibold text-[var(--color-text)]">
                    {isRtl ? item.titleAr : item.titleEn}
                  </h2>
                  <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                    {isRtl ? item.descriptionAr : item.descriptionEn}
                  </p>
                  {item.externalReference && isValidUrl(item.externalReference) && (
                    <div className="pt-1">
                      <a
                        href={item.externalReference}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-mono text-[var(--color-primary)] hover:underline"
                      >
                        <span>{t('externalReference')}</span>
                        <ExternalLink className="w-3 h-3" aria-hidden="true" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="pt-4 space-y-6">
            <EmptyState
              icon={Flag}
              title={t('milestonesEmptyTitle')}
              description={t('milestonesEmptyDesc')}
              note={t('milestonesReadyNote')}
              actionText={t('btnExploreCourses')}
              onAction={() => navigate('/academic')}
            />
          </div>
        )}
      </div>
    </div>
  );
};
