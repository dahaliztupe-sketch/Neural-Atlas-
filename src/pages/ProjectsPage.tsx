import React, { useState, useCallback, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { ProjectItem, ProjectRecord } from '../types';
import { CACHE_KEYS } from '../services/cacheService';
import { useCachedResource } from '../hooks/useCachedResource';
import { DataQueryResult, getPublishedProjectsResult } from '../services/contentRepository';
import { filterProjectsByQuery, localizeProjectTech, ProjectListFilter } from '../lib/validation';
import { ProjectCard } from '../components/ProjectCard';
import { EmptyState } from '../components/EmptyState';
import { Code2, AlertTriangle, RefreshCw, Search, X } from 'lucide-react';

export const ProjectsPage: React.FC = () => {
  const { t, isRtl, navigate } = useApp();
  const [filter, setFilter] = useState<ProjectListFilter>('all');
  const [techFilter, setTechFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchProjects = useCallback(() => getPublishedProjectsResult(), []);
  const {
    data: queryResult,
    loading,
    refresh: loadProjects,
  } = useCachedResource<DataQueryResult<ProjectRecord[]>>(
    CACHE_KEYS.projectsList,
    fetchProjects,
    {
      shouldPersist: (res) => res.status !== 'error',
      isErrorResult: (res) => res.status === 'error',
    }
  );

  const errorCode = queryResult?.status === 'error' ? queryResult.errorCode || 'query_error' : null;
  const allProjects = useMemo<ProjectItem[]>(() => {
    if (!queryResult || queryResult.status === 'error') return [];
    return queryResult.items.map((p) => ({
      id: p.slug || p.id,
      titleEn: p.titleEn,
      titleAr: p.titleAr,
      statusEn: p.statusEn || t('statusFallbackActive'),
      statusAr: p.statusAr || t('statusFallbackActive'),
      statusType: p.statusType,
      visibility: p.visibility,
      archiveGroup: p.archiveGroup,
      featuredOnHome: p.featuredOnHome,
      descriptionEn: p.descriptionEn || p.summaryEn || '',
      descriptionAr: p.descriptionAr || p.summaryAr || '',
      technologies: p.technologies || [],
      url: p.url,
      repoUrl: p.repoUrl,
      coverImageUrl: p.coverImageUrl,
      coverImageAltEn: p.coverImageAltEn,
      coverImageAltAr: p.coverImageAltAr,
      roleEn: p.roleEn,
      roleAr: p.roleAr,
      problemEn: p.problemEn,
      problemAr: p.problemAr,
      approachEn: p.approachEn,
      approachAr: p.approachAr,
      outcomeEn: p.outcomeEn,
      outcomeAr: p.outcomeAr,
      fullOverviewEn: p.fullOverviewEn?.length ? p.fullOverviewEn : [p.descriptionEn].filter(Boolean),
      fullOverviewAr: p.fullOverviewAr?.length ? p.fullOverviewAr : [p.descriptionAr].filter(Boolean),
    }));
  }, [queryResult, t]);

  const uniqueTechnologies = useMemo(() => {
    const seen = new Map<string, string>();
    for (const p of allProjects) {
      for (const tech of p.technologies || []) {
        const clean = tech.trim();
        if (clean && !seen.has(clean.toLowerCase())) {
          seen.set(clean.toLowerCase(), clean);
        }
      }
    }
    return Array.from(seen.values());
  }, [allProjects]);

  const filteredProjects = useMemo(
    () => filterProjectsByQuery(allProjects, searchQuery, filter, techFilter),
    [allProjects, searchQuery, filter, techFilter]
  );

  const isArchiveEntry = (p: ProjectItem): boolean => {
    if (p.archiveGroup === 'experiments_discontinued') return true;
    if (p.archiveGroup === 'showcase') return false;
    return (
      p.statusType === 'experimental' ||
      p.statusType === 'discontinued' ||
      p.statusType === 'paused' ||
      p.statusType === 'archived' ||
      p.statusType === 'needs_confirmation'
    );
  };

  const showcaseProjects = useMemo(
    () => filteredProjects.filter((p) => !isArchiveEntry(p)),
    [filteredProjects]
  );

  const archivedProjects = useMemo(
    () => filteredProjects.filter((p) => isArchiveEntry(p)),
    [filteredProjects]
  );

  const hasActiveFilters =
    filter !== 'all' || techFilter !== 'all' || searchQuery.trim().length > 0;

  const resetAllFilters = () => {
    setFilter('all');
    setTechFilter('all');
    setSearchQuery('');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      <div className="max-w-3xl space-y-2">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-mono text-[var(--color-primary)]">
          <span className="inline-flex items-center gap-2">
            <Code2 className="w-4 h-4" aria-hidden="true" />
            <span>{t('projectsKicker')}</span>
          </span>
          <span aria-hidden="true" className="text-[var(--color-text-subtle)]">·</span>
          <span className="text-[var(--color-secondary)]">{t('projectsStudyContextBadge')}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-[var(--color-text)] tracking-tight text-balance mb-3">
          {t('projectsTitle')}
        </h1>
        <p className="text-base text-[var(--color-text-muted)] leading-relaxed">
          {t('projectsIntro')}
        </p>
      </div>

      {/* Search & Status / Technology Controls */}
      {!loading && !errorCode && allProjects.length > 0 && (
        <div className="space-y-4 pt-2">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Status Tabs */}
            <div className="na-mineral-card inline-flex flex-wrap items-center gap-1 p-1 rounded-xl max-w-full text-xs">
              <button
                type="button"
                onClick={() => setFilter('all')}
                className={`px-3 py-2 min-h-[44px] rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] ${
                  filter === 'all'
                    ? 'bg-[var(--color-primary)] text-white shadow-xs'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                }`}
              >
                {t('filterAll')}
              </button>
              <button
                type="button"
                onClick={() => setFilter('active_practice')}
                className={`px-3 py-2 min-h-[44px] rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] ${
                  filter === 'active_practice'
                    ? 'bg-[var(--color-primary)] text-white shadow-xs'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                }`}
              >
                {t('filterShowcasePractice')}
              </button>
              <button
                type="button"
                onClick={() => setFilter('archive_group')}
                className={`px-3 py-2 min-h-[44px] rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] ${
                  filter === 'archive_group'
                    ? 'bg-[var(--color-primary)] text-white shadow-xs'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                }`}
              >
                {t('filterArchiveExperiments')}
              </button>
            </div>

            {/* Search Input + Counter */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 sm:flex-none sm:w-80">
                <Search
                  className="w-4 h-4 text-[var(--color-text-subtle)] absolute top-1/2 -translate-y-1/2 start-3 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('searchProjectsPlaceholder')}
                  aria-label={t('searchProjectsPlaceholder')}
                  className="w-full ps-9 pe-8 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-xs text-[var(--color-text)] placeholder:text-[var(--color-text-subtle)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="p-1 text-[var(--color-text-subtle)] hover:text-[var(--color-text)] absolute top-1/2 -translate-y-1/2 end-2 cursor-pointer"
                    aria-label={t('clearFiltersBtn')}
                  >
                    <X className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                )}
              </div>

              <div className="text-xs text-[var(--color-text-subtle)] font-mono tabular-nums whitespace-nowrap">
                <span>{filteredProjects.length}</span>
                <span className="mx-1">/</span>
                <span>{allProjects.length}</span>
                <span className="ms-1">{t('projectsCountEntries')}</span>
              </div>
            </div>
          </div>

          {/* Dynamic Technology Filter Buttons */}
          {uniqueTechnologies.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <button
                type="button"
                onClick={() => setTechFilter('all')}
                className={`px-3 py-2 min-h-[44px] rounded-lg border font-mono transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] ${
                  techFilter === 'all'
                    ? 'border-[var(--color-secondary)] bg-[var(--color-secondary-muted)] text-[var(--color-secondary)] font-semibold'
                    : 'border-[var(--color-border-subtle)] bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                }`}
              >
                {t('filterAllTech')}
              </button>
              {uniqueTechnologies.map((tech) => {
                const active = techFilter.toLowerCase() === tech.toLowerCase();
                return (
                  <button
                    key={tech}
                    type="button"
                    onClick={() => setTechFilter(active ? 'all' : tech)}
                    className={`px-3 py-2 min-h-[44px] rounded-lg border font-mono transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] ${
                      active
                        ? 'border-[var(--color-secondary)] bg-[var(--color-secondary-muted)] text-[var(--color-secondary)] font-semibold'
                        : 'border-[var(--color-border-subtle)] bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                    }`}
                  >
                    {localizeProjectTech(tech, isRtl)}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      <div aria-live="polite">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3 text-xs font-mono text-[var(--color-text-muted)]" role="status">
            <RefreshCw className="w-6 h-6 text-[var(--color-primary)] animate-spin" aria-hidden="true" />
            <span>{t('projectsLoading')}</span>
          </div>
        ) : errorCode ? (
          <div className="p-6 rounded-2xl border border-red-500/30 bg-red-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-red-400 font-semibold text-sm">
                <AlertTriangle className="w-5 h-5 shrink-0" aria-hidden="true" />
                <span>{t('publicLoadErrorTitle')}</span>
              </div>
              <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                {t('publicLoadErrorDesc')}
              </p>
            </div>
            <button
              type="button"
              onClick={loadProjects}
              className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[44px] rounded-lg border border-red-400/40 bg-red-500/10 text-xs font-medium text-[var(--color-text)] hover:bg-red-500/20 transition-colors cursor-pointer shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{t('retryAction')}</span>
            </button>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="pt-4">
            {hasActiveFilters && allProjects.length > 0 ? (
              <EmptyState
                icon={Search}
                title={t('filterResultsEmptyTitle')}
                description={t('filterResultsEmptyDesc')}
                actionText={t('clearFiltersBtn')}
                onAction={resetAllFilters}
              />
            ) : (
              <EmptyState
                icon={Code2}
                title={t('projectsEmptyTitle')}
                description={t('projectsEmptyDesc')}
                actionText={t('btnBackHome')}
                onAction={() => navigate('/')}
              />
            )}
          </div>
        ) : filter === 'all' && showcaseProjects.length > 0 && archivedProjects.length > 0 ? (
          <div className="space-y-12">
            <section className="space-y-4">
              <div className="flex items-center justify-between gap-2 pb-2 border-b border-[var(--color-border-subtle)]">
                <h2 className="text-lg font-semibold text-[var(--color-text)]">
                  {t('projectsShowcaseHeading')}
                </h2>
                <span className="text-xs font-mono text-[var(--color-secondary)] tabular-nums">
                  {showcaseProjects.length}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {showcaseProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onSelect={(p: ProjectItem) => navigate(`/projects/${p.id}`)}
                  />
                ))}
              </div>
            </section>

            <section className="space-y-4 pt-4 border-t border-[var(--color-border)]">
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-lg font-semibold text-[var(--color-text)]">
                    {t('projectsArchiveHeading')}
                  </h2>
                  <span className="text-xs font-mono text-[var(--color-text-subtle)] tabular-nums">
                    {archivedProjects.length}
                  </span>
                </div>
                <p className="text-xs text-[var(--color-text-muted)] leading-relaxed max-w-3xl">
                  {t('projectsArchiveNote')}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {archivedProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onSelect={(p: ProjectItem) => navigate(`/projects/${p.id}`)}
                  />
                ))}
              </div>
            </section>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onSelect={(p: ProjectItem) => navigate(`/projects/${p.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
