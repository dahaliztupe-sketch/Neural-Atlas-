import React, { useEffect, useCallback, useMemo, useState, lazy, Suspense } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { ProjectRecord } from '../types';
import { CACHE_KEYS } from '../services/cacheService';
import { useCachedResource } from '../hooks/useCachedResource';
import { OptimizedImage } from '../components/OptimizedImage';
import {
  DataQueryResult,
  SingleDataQueryResult,
  getProjectBySlugResult,
  getPublishedProjectsResult,
  isValidUrl,
  formatLocalizedDate,
} from '../services/contentRepository';
import { localizeProjectTech } from '../lib/validation';
import {
  ArrowLeft,
  ArrowRight,
  Terminal,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Calendar,
  Share2,
  Check,
  EyeOff,
} from 'lucide-react';

const LazyMarkdownRenderer = lazy(() =>
  import('../components/MarkdownRenderer').then((m) => ({ default: m.MarkdownRenderer }))
);

interface ProjectDetailPageProps {
  projectId: string;
}

export const ProjectDetailPage: React.FC<ProjectDetailPageProps> = ({ projectId }) => {
  const { t, isRtl, language, navigate, setSeoOverride } = useApp();
  const { isOwner, loading: authLoading } = useAuth();
  const [linkCopied, setLinkCopied] = useState(false);

  const fetchProject = useCallback(
    () => getProjectBySlugResult(projectId, isOwner),
    [projectId, isOwner]
  );
  const fetchProjectsList = useCallback(() => getPublishedProjectsResult(), []);

  const {
    data: queryResult,
    loading,
    refresh: loadProject,
  } = useCachedResource<SingleDataQueryResult<ProjectRecord>>(
    CACHE_KEYS.projectBySlug(projectId),
    fetchProject,
    {
      enabled: Boolean(projectId) && !authLoading,
      bypassCache: isOwner,
      shouldPersist: (res) => res.status !== 'error',
      isErrorResult: (res) => res.status === 'error',
    }
  );

  const projectsListState = useCachedResource<DataQueryResult<ProjectRecord[]>>(
    CACHE_KEYS.projectsList,
    fetchProjectsList,
    {
      shouldPersist: (res) => res.status !== 'error',
      isErrorResult: (res) => res.status === 'error',
    }
  );

  const errorCode = queryResult?.status === 'error' ? queryResult.errorCode || 'query_error' : null;
  const project = queryResult?.status === 'error' ? null : queryResult?.item ?? null;

  const relatedProjects = useMemo(() => {
    if (!project || !projectsListState.data || projectsListState.data.status === 'error') return [];
    const techSet = new Set((project.technologies || []).map((tech) => tech.toLowerCase()));
    return projectsListState.data.items
      .filter((candidate) => candidate.id !== project.id && candidate.slug !== project.slug)
      .map((candidate) => {
        const overlap = (candidate.technologies || []).filter((tech) =>
          techSet.has(tech.toLowerCase())
        ).length;
        return { candidate, overlap };
      })
      .sort((a, b) => b.overlap - a.overlap)
      .slice(0, 2)
      .map((entry) => entry.candidate);
  }, [project, projectsListState.data]);

  const handleCopyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setLinkCopied(true);
      window.setTimeout(() => setLinkCopied(false), 2200);
    } catch {
      // Clipboard API unavailable in restricted contexts
    }
  };

  useEffect(() => {
    if (!project) {
      setSeoOverride(null);
      return;
    }
    const title = isRtl
      ? project.seoTitleAr || `${project.titleAr} · ${t('siteName')}`
      : project.seoTitleEn || `${project.titleEn} · Neural Atlas`;
    const description = isRtl
      ? project.seoDescriptionAr || project.summaryAr || project.descriptionAr
      : project.seoDescriptionEn || project.summaryEn || project.descriptionEn;
    setSeoOverride({
      title,
      description,
      itemName: isRtl ? project.titleAr : project.titleEn,
      codeRepository: project.repoUrl && isValidUrl(project.repoUrl) ? project.repoUrl : undefined,
      publishedAt: project.publishedAt,
      updatedAt: project.updatedAt,
      keywords: project.technologies,
      noIndex: project.publicationStatus !== 'published',
    });
    return () => setSeoOverride(null);
  }, [project, isRtl, setSeoOverride, t]);

  if (loading || authLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 flex flex-col items-center justify-center space-y-3 text-xs font-mono text-[var(--color-text-muted)]" role="status">
        <RefreshCw className="w-6 h-6 text-[var(--color-primary)] animate-spin" aria-hidden="true" />
        <span>{t('projectDetailLoading')}</span>
      </div>
    );
  }

  if (errorCode) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 space-y-4">
        <div className="p-6 rounded-2xl border border-red-500/30 bg-red-500/10 text-start space-y-3">
          <div className="flex items-center gap-2 text-red-400 font-semibold text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" aria-hidden="true" />
            <span>{t('publicLoadErrorTitle')}</span>
          </div>
          <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
            {t('publicLoadErrorDesc')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={loadProject}
            className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[44px] text-xs font-semibold rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-solid)] text-[var(--color-text)] hover:border-[var(--color-primary)] cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{t('retryAction')}</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/projects')}
            className="px-4 py-2 min-h-[44px] text-xs font-semibold rounded-lg bg-[var(--color-primary)] text-white hover:opacity-90 transition-opacity cursor-pointer"
          >
            {t('backToProjects')}
          </button>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <AlertCircle className="w-12 h-12 mx-auto text-amber-500" aria-hidden="true" />
        <h1 className="text-2xl font-bold text-[var(--color-text)]">
          {t('projectDetailNotFoundTitle')}
        </h1>
        <p className="text-sm text-[var(--color-text-muted)]">
          {t('projectDetailNotFoundDesc')}
        </p>
        <button
          type="button"
          onClick={() => navigate('/projects')}
          className="mt-4 px-4 py-2 min-h-[44px] text-xs font-semibold rounded-lg bg-[var(--color-primary)] text-white hover:opacity-90 transition-opacity cursor-pointer"
        >
          {t('backToProjects')}
        </button>
      </div>
    );
  }

  const hasCoverImage = Boolean(project.coverImageUrl && isValidUrl(project.coverImageUrl));
  const coverAlt = isRtl
    ? project.coverImageAltAr || project.coverImageAltEn || ''
    : project.coverImageAltEn || project.coverImageAltAr || '';

  const roleText = isRtl ? project.roleAr || project.roleEn : project.roleEn || project.roleAr;
  const problemText = isRtl ? project.problemAr || project.problemEn : project.problemEn || project.problemAr;
  const approachText = isRtl ? project.approachAr || project.approachEn : project.approachEn || project.approachAr;
  const outcomeText = isRtl ? project.outcomeAr || project.outcomeEn : project.outcomeEn || project.outcomeAr;
  const hasExploredSection = Boolean(roleText || problemText || approachText);

  const overviewList = (isRtl ? project.fullOverviewAr : project.fullOverviewEn) || [];
  const publishedDate = formatLocalizedDate(project.publishedAt, language);
  const updatedDate = formatLocalizedDate(project.updatedAt, language);

  const hasRepoLink = Boolean(project.repoUrl && isValidUrl(project.repoUrl));
  const hasLiveLink = Boolean(project.url && isValidUrl(project.url));

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-10">
      {isOwner && project.publicationStatus !== 'published' && (
        <div
          role="status"
          className="na-mineral-card p-4 rounded-2xl border border-amber-500/40 bg-amber-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-amber-400 font-semibold font-mono">
              <EyeOff className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{t('draftPreviewBannerTitle')}</span>
            </div>
            <p className="text-[var(--color-text-muted)]">{t('draftPreviewBannerDesc')}</p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/admin')}
            className="px-3.5 py-2 min-h-[44px] rounded-xl border border-amber-500/40 bg-[var(--color-surface-solid)] hover:border-[var(--color-primary)] text-xs font-mono font-semibold cursor-pointer shrink-0"
          >
            {t('draftPreviewBackAdmin')}
          </button>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate('/projects')}
          className="inline-flex items-center gap-1.5 min-h-[44px] py-2 text-xs font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] rounded-sm"
          aria-label={t('backToProjects')}
        >
          {isRtl ? (
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          ) : (
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
          )}
          <span>{t('backToProjects')}</span>
        </button>

        <button
          type="button"
          onClick={handleCopyShareLink}
          className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[44px] rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-solid)] hover:border-[var(--color-primary)] text-xs font-mono text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors cursor-pointer"
        >
          {linkCopied ? (
            <Check className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
          ) : (
            <Share2 className="w-3.5 h-3.5" aria-hidden="true" />
          )}
          <span>{linkCopied ? t('shareLinkCopied') : t('shareLinkBtn')}</span>
        </button>
      </div>

      {/* Unboxed Editorial Case-Study Document (zero nested card-within-card framing) */}
      <article className="space-y-10">
        <header className="space-y-4 pb-8 border-b border-[var(--color-border)]">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[var(--color-text-subtle)]">
            <span className="font-semibold text-[var(--color-secondary)]">
              {isRtl ? project.statusAr || t('statusFallbackActive') : project.statusEn || t('statusFallbackActive')}
            </span>

            <div className="flex flex-wrap items-center gap-3 font-mono text-[11px]">
              <span>
                {project.statusType === 'practicing'
                  ? t('badgeFoundation')
                  : project.statusType === 'completed'
                  ? t('badgeCompleted')
                  : project.statusType === 'experimental'
                  ? t('badgeExperimental')
                  : project.statusType === 'paused'
                  ? t('badgePaused')
                  : project.statusType === 'discontinued'
                  ? t('badgeDiscontinued')
                  : project.statusType === 'archived'
                  ? t('badgeArchived')
                  : project.statusType === 'needs_confirmation'
                  ? t('badgeNeedsConfirmation')
                  : t('badgePrototype')}
              </span>
              {publishedDate && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{t('projectPublishedDateLabel')}: {publishedDate}</span>
                  </span>
                </>
              )}
              {updatedDate && updatedDate !== publishedDate && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{t('projectUpdatedDateLabel')}: {updatedDate}</span>
                </>
              )}
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--color-text)] tracking-tight text-balance">
            {isRtl ? project.titleAr : project.titleEn}
          </h1>

          {hasCoverImage && (
            <div className="pt-2">
              <OptimizedImage
                src={project.coverImageUrl}
                alt={coverAlt}
                fallbackTitle={isRtl ? project.titleAr : project.titleEn}
                aspectRatio="16/9"
                enableLightbox
                priority
              />
            </div>
          )}
        </header>

        {/* 1. Overview */}
        <section className="space-y-4">
          <h2 className="text-xs font-mono uppercase tracking-wider text-[var(--color-secondary)]">
            {t('projectOverviewHeading')}
          </h2>
          <div className="max-w-3xl">
            <Suspense
              fallback={
                <p className="text-base sm:text-lg text-[var(--color-text-muted)] leading-relaxed">
                  {isRtl ? project.descriptionAr : project.descriptionEn}
                </p>
              }
            >
              <LazyMarkdownRenderer
                content={isRtl ? project.descriptionAr : project.descriptionEn}
                copyLabel={t('copyCodeBtn')}
                copiedLabel={t('copiedCodeBtn')}
              />
            </Suspense>
          </div>

          {overviewList.length > 0 && (
            <ul className="space-y-2.5 pt-2 text-sm text-[var(--color-text-muted)] max-w-3xl">
              {overviewList.map((point, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[var(--color-secondary)] shrink-0 mt-0.5" aria-hidden="true" />
                  <span className="leading-relaxed">{point}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* 2. What I Explored */}
        {hasExploredSection && (
          <section className="pt-8 border-t border-[var(--color-border-subtle)] space-y-6">
            <h2 className="text-xs font-mono uppercase tracking-wider text-[var(--color-primary)]">
              {t('projectExploredHeading')}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
              {problemText && (
                <div className="space-y-1.5">
                  <h3 className="font-mono text-xs text-[var(--color-text)] font-semibold">
                    {t('projectProblemLabel')}
                  </h3>
                  <p className="text-[var(--color-text-muted)] leading-relaxed">{problemText}</p>
                </div>
              )}

              {approachText && (
                <div className="space-y-1.5">
                  <h3 className="font-mono text-xs text-[var(--color-text)] font-semibold">
                    {t('projectApproachLabel')}
                  </h3>
                  <p className="text-[var(--color-text-muted)] leading-relaxed">{approachText}</p>
                </div>
              )}
            </div>

            {roleText && (
              <div className="space-y-1 text-sm">
                <h3 className="font-mono text-xs text-[var(--color-text-subtle)]">
                  {t('projectRoleLabel')}
                </h3>
                <p className="text-[var(--color-text-muted)] leading-relaxed">{roleText}</p>
              </div>
            )}
          </section>
        )}

        {/* 3. Technologies */}
        {project.technologies.length > 0 && (
          <section className="pt-8 border-t border-[var(--color-border-subtle)] space-y-3">
            <h2 className="text-xs font-mono uppercase tracking-wider text-[var(--color-text-subtle)]">
              {t('technologiesUsed')}
            </h2>
            <div className="flex flex-wrap items-center gap-2 text-sm font-mono text-[var(--color-text)]">
              <Terminal className="w-4 h-4 text-[var(--color-primary)] shrink-0" aria-hidden="true" />
              {project.technologies.map((tech, idx) => (
                <React.Fragment key={tech}>
                  {idx > 0 && <span className="text-[var(--color-text-subtle)]" aria-hidden="true">·</span>}
                  <span>{localizeProjectTech(tech, isRtl)}</span>
                </React.Fragment>
              ))}
            </div>
          </section>
        )}

        {/* 4. Learning Outcomes */}
        {outcomeText && (
          <section className="pt-8 border-t border-[var(--color-border-subtle)] space-y-3">
            <h2 className="text-xs font-mono uppercase tracking-wider text-[var(--color-secondary)]">
              {t('projectLearningOutcomesHeading')}
            </h2>
            <p className="text-sm sm:text-base text-[var(--color-text-muted)] leading-relaxed max-w-3xl">
              {outcomeText}
            </p>
          </section>
        )}

        {/* 5. Links & Availability */}
        <footer className="pt-8 border-t border-[var(--color-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono text-[var(--color-text-subtle)]">
          <span>{t('projectLinksHeading')}</span>
          <div className="flex flex-wrap items-center gap-4">
            {hasRepoLink && (
              <a
                href={project.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 min-h-[44px] py-2 text-[var(--color-secondary)] hover:underline"
              >
                <span>{t('projectRepoLabel')}</span>
                <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
              </a>
            )}
            {hasLiveLink ? (
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 min-h-[44px] py-2 text-[var(--color-primary)] hover:underline"
              >
                <span>{project.url}</span>
                <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
              </a>
            ) : (
              !hasRepoLink && <span>{t('noExternalUrl')}</span>
            )}
          </div>
        </footer>
      </article>

      {relatedProjects.length > 0 && (
        <section className="pt-8 border-t border-[var(--color-border)] space-y-4">
          <h2 className="text-xs font-mono uppercase tracking-wider text-[var(--color-secondary)]">
            {t('relatedProjectsHeading')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {relatedProjects.map((rel) => (
              <button
                key={rel.id}
                type="button"
                onClick={() => navigate(`/projects/${rel.slug || rel.id}`)}
                className="na-mineral-card na-mineral-card-interactive p-5 rounded-xl text-start space-y-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              >
                <div className="text-[11px] font-mono text-[var(--color-secondary)]">
                  {isRtl ? rel.statusAr || t('statusFallbackActive') : rel.statusEn || t('statusFallbackActive')}
                </div>
                <h3 className="text-base font-semibold text-[var(--color-text)]">
                  {isRtl ? rel.titleAr : rel.titleEn}
                </h3>
                <p className="text-xs text-[var(--color-text-muted)] line-clamp-2 leading-relaxed">
                  {isRtl ? rel.summaryAr || rel.descriptionAr : rel.summaryEn || rel.descriptionEn}
                </p>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
