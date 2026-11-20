import React, { useCallback, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { CourseCard, CourseDisplayItem } from '../components/CourseCard';
import { ProjectCard } from '../components/ProjectCard';
import { EmptyState } from '../components/EmptyState';
import { useWorldScene } from '../components/world/WorldSceneContext';
import { KNOWLEDGE_CATEGORIES, LEARNING_TRACKS } from '../data/portfolioData';
import { resolveNoteCategoryAndTags } from '../lib/validation';
import {
  AstrolabeNodeId,
  resolveAstrolabeNode,
  resolveSafeAstrolabeTarget,
} from '../components/world/worldAnchors';
import {
  CourseRecord,
  LearningNoteRecord,
  MilestoneRecord,
  ProjectItem,
  ProjectRecord,
} from '../types';
import { CACHE_KEYS } from '../services/cacheService';
import { useCachedResource } from '../hooks/useCachedResource';
import {
  DataQueryResult,
  getPublishedCoursesResult,
  getPublishedProjectsResult,
  getPublishedNotesResult,
  getPublishedMilestonesResult,
  formatLocalizedDate,
} from '../services/contentRepository';
import {
  ArrowRight,
  ArrowLeft,
  BookOpen,
  Code2,
  GraduationCap,
  Layers,
  Flag,
  FileText,
  RefreshCw,
  AlertTriangle,
  Compass,
  MessageSquare,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { t, isRtl, language, navigate, publicProfile } = useApp();
  const { selectedNodeId, hoveredNodeId, setSelectedNodeId, setHoveredNodeId } = useWorldScene();

  const fetchCourses = useCallback(() => getPublishedCoursesResult(), []);
  const fetchProjects = useCallback(() => getPublishedProjectsResult(), []);
  const fetchNotes = useCallback(() => getPublishedNotesResult(), []);
  const fetchMilestones = useCallback(() => getPublishedMilestonesResult(), []);

  const coursesState = useCachedResource<DataQueryResult<CourseRecord[]>>(
    CACHE_KEYS.coursesList,
    fetchCourses,
    {
      shouldPersist: (res) => res.status !== 'error',
      isErrorResult: (res) => res.status === 'error',
    }
  );
  const projState = useCachedResource<DataQueryResult<ProjectRecord[]>>(
    CACHE_KEYS.projectsList,
    fetchProjects,
    {
      shouldPersist: (res) => res.status !== 'error',
      isErrorResult: (res) => res.status === 'error',
    }
  );
  const notesState = useCachedResource<DataQueryResult<LearningNoteRecord[]>>(
    CACHE_KEYS.notesList,
    fetchNotes,
    {
      shouldPersist: (res) => res.status !== 'error',
      isErrorResult: (res) => res.status === 'error',
    }
  );
  const milestonesState = useCachedResource<DataQueryResult<MilestoneRecord[]>>(
    CACHE_KEYS.milestonesList,
    fetchMilestones,
    {
      shouldPersist: (res) => res.status !== 'error',
      isErrorResult: (res) => res.status === 'error',
    }
  );

  const coursesLoading = coursesState.loading;
  const coursesError =
    coursesState.data?.status === 'error' ? coursesState.data.errorCode || 'query_error' : null;
  const courses = useMemo<CourseDisplayItem[]>(
    () => (coursesState.data && coursesState.data.status !== 'error' ? coursesState.data.items : []),
    [coursesState.data]
  );

  const projectsLoading = projState.loading;
  const projectsError =
    projState.data?.status === 'error' ? projState.data.errorCode || 'query_error' : null;
  const archiveLoading = notesState.loading || milestonesState.loading;

  const projects = useMemo<ProjectItem[]>(() => {
    if (!projState.data || projState.data.status === 'error') return [];
    return projState.data.items.map((p) => ({
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
  }, [projState.data, t]);

  const featuredProjects = useMemo(() => {
    return projects.filter((p) => {
      if (p.visibility === 'internal_archive') return false;
      if (p.archiveGroup === 'experiments_discontinued') return false;
      if (p.featuredOnHome === false) return false;
      if (p.archiveGroup === 'showcase') return true;
      if (
        p.statusType === 'experimental' ||
        p.statusType === 'discontinued' ||
        p.statusType === 'paused' ||
        p.statusType === 'archived' ||
        p.statusType === 'needs_confirmation'
      ) {
        return false;
      }
      return true;
    });
  }, [projects]);

  const highlightedTracks = useMemo(() => {
    const source =
      publicProfile.learningTracks && publicProfile.learningTracks.length > 0
        ? publicProfile.learningTracks
        : LEARNING_TRACKS;
    return source.filter((tr) => tr.showInActiveHighlights !== false).slice(0, 3);
  }, [publicProfile.learningTracks]);

  const yearLabel = isRtl
    ? publicProfile.academicYearAr || 'السنة الأولى'
    : publicProfile.academicYearEn || 'First Year';
  const semesterLabel = isRtl
    ? publicProfile.currentSemesterAr || 'الفصل الدراسي الحالي'
    : publicProfile.currentSemesterEn || 'Active Academic Term';
  const termDisplay = `${yearLabel} · ${semesterLabel}`;

  const notes = useMemo(
    () => (notesState.data?.status === 'success' ? notesState.data.items : []),
    [notesState.data]
  );
  const milestones = useMemo(
    () => (milestonesState.data?.status === 'success' ? milestonesState.data.items : []),
    [milestonesState.data]
  );

  const loadHomeData = useCallback(async () => {
    await Promise.all([
      coursesState.refresh(),
      projState.refresh(),
      notesState.refresh(),
      milestonesState.refresh(),
    ]);
  }, [coursesState, projState, notesState, milestonesState]);

  const publishedProjectSlugs = useMemo(
    () =>
      projState.data?.status === 'success'
        ? projState.data.items.map((p) => p.slug || p.id)
        : [],
    [projState.data]
  );

  const courseCountDisplay = coursesLoading
    ? '—'
    : coursesError
    ? '!'
    : String(courses.length).padStart(2, '0');
  const projectCountDisplay = projectsLoading
    ? '—'
    : projectsError
    ? '!'
    : String(projects.length).padStart(2, '0');

  const DirectionalArrow = isRtl ? ArrowLeft : ArrowRight;
  const activeNodeId: AstrolabeNodeId = hoveredNodeId ?? selectedNodeId;
  const activeNodeConfig = resolveAstrolabeNode(activeNodeId);
  const activeNodeTarget = resolveSafeAstrolabeTarget({
    nodeId: activeNodeId,
    publishedProjectSlugs,
  });

  const nodeDisplayMap: Record<
    AstrolabeNodeId,
    {
      shortLabel: string;
      eyebrow: string;
      title: string;
      summary: string;
      ctaLabel: string;
      accentClass: string;
    }
  > = {
    'cs-problem-solving': {
      shortLabel: t('heroNodeShortProblemSolving'),
      eyebrow: t('tagActivePractice'),
      title: t('activePracticingTitle'),
      summary: t('activePracticingDesc'),
      ctaLabel: t('heroNodeCtaInspect'),
      accentClass: 'text-[var(--color-secondary)]',
    },
    'experimental-systems': {
      shortLabel: t('heroNodeShortExperiments'),
      eyebrow: t('tagExperimentation'),
      title: t('activeDevelopmentTitle'),
      summary: t('activeDevelopmentDesc'),
      ctaLabel: t('btnExploreProjects'),
      accentClass: 'text-[var(--color-primary)]',
    },
    'intelligent-computing': {
      shortLabel: t('heroNodeShortIntelligent'),
      eyebrow: t('tagUpcomingRoadmap'),
      title: t('futureRoadmapTitle'),
      summary: t('futureRoadmapDesc'),
      ctaLabel: t('heroNodeCtaAcademic'),
      accentClass: 'text-[var(--color-text-muted)]',
    },
  };

  const activeNodeDisplay = nodeDisplayMap[activeNodeId];
  const resolvedAstrolabeCtaLabel =
    activeNodeId === 'intelligent-computing'
      ? activeNodeDisplay.ctaLabel
      : activeNodeTarget.hasDirectProject
      ? activeNodeDisplay.ctaLabel
      : t('btnExploreProjects');

  return (
    <div className="space-y-20 md:space-y-28 py-8 md:py-14">
      {/* 1. Asymmetric Split Hero Stage + Unobstructed Studio-Lit Interactive 3D Astrolabe */}
      <section className="relative max-w-6xl mx-auto px-4 sm:px-6 overflow-x-clip">
        {/* Subtle directional legibility veil behind leading hero copy (never uses backdrop-blur over WebGL) */}
        <div
          className="pointer-events-none absolute inset-x-0 sm:-inset-x-4 -inset-y-6 rounded-3xl z-0"
          style={{ background: 'var(--hero-veil)' }}
          aria-hidden="true"
        />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center lg:min-h-[540px] pointer-events-none">
          {/* Leading Identity & Narrative Column */}
          <div className="lg:col-span-6 space-y-6 text-start py-2 pointer-events-auto">
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-[var(--color-secondary)]">
              <GraduationCap className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{isRtl ? publicProfile.titleAr : publicProfile.titleEn}</span>
              <span aria-hidden="true" className="text-[var(--color-text-subtle)]">·</span>
              <span className="text-[var(--color-text-muted)]">
                {isRtl ? publicProfile.facultyAr : publicProfile.facultyEn}
              </span>
              <span aria-hidden="true" className="text-[var(--color-text-subtle)]">·</span>
              <span className="text-[var(--color-text-subtle)]">{t('aboutLocationBadge')}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[3.3rem] font-bold tracking-[-0.03em] text-[var(--color-text)] leading-[1.1] text-balance">
              {t('heroHeadlineLead')}
              <br />
              <span className="text-[var(--color-primary)]">{t('heroHeadlineAccent')}</span>
            </h1>

            <p className="text-base sm:text-lg text-[var(--color-text-muted)] leading-relaxed max-w-xl">
              {isRtl ? publicProfile.bioAr : publicProfile.bioEn}
            </p>

            <div className="flex flex-wrap items-center gap-3.5 pt-1">
              <button
                type="button"
                onClick={() => navigate('/projects')}
                className="px-5 py-2.5 min-h-[44px] rounded-xl bg-[var(--color-primary)] text-white font-semibold text-sm hover:bg-[var(--color-primary-hover)] transition-colors inline-flex items-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)]"
              >
                <span>{t('btnExploreProjects')}</span>
                <DirectionalArrow className="w-4 h-4" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={() => navigate('/academic')}
                className="na-mineral-card na-mineral-card-interactive px-5 py-2.5 min-h-[44px] rounded-xl text-[var(--color-text)] font-medium text-sm inline-flex items-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              >
                <BookOpen className="w-4 h-4 text-[var(--color-secondary)]" aria-hidden="true" />
                <span>{t('btnExploreCourses')}</span>
              </button>
            </div>

            {/* Compact Unboxed Proof Line */}
            <div className="pt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-mono text-[var(--color-text-subtle)]">
              <span>
                {coursesLoading
                  ? t('coursesLoading')
                  : isRtl
                  ? `${courses.length} مقررات أكاديمية منشورة`
                  : `${courses.length} Published Academic Courses`}
              </span>
              <span aria-hidden="true">·</span>
              <span>
                {projectsLoading
                  ? t('projectsLoading')
                  : isRtl
                  ? `${featuredProjects.length} مشاريع رئيسية · ${projects.length} إجمالي الإدخالات`
                  : `${featuredProjects.length} Active Showcase · ${projects.length} Total Entries`}
              </span>
              <span aria-hidden="true">·</span>
              <span>{termDisplay}</span>
            </div>
          </div>

          {/* Trailing Showcase Column: Open Upper Viewport for 3D Astrolabe + Compact Bottom HUD */}
          <div className="lg:col-span-6 flex flex-col justify-end lg:min-h-[540px] lg:pt-64 pointer-events-none">
            <div
              data-testid="astrolabe-inspector"
              data-active-node={activeNodeId}
              className="pointer-events-auto na-mineral-card rounded-2xl p-3.5 sm:p-4 space-y-2.5"
              aria-label={t('heroAstrolabeSelectAria')}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--color-text-subtle)]">
                  {t('heroAstrolabeHudEyebrow')}
                </span>

                <div
                  role="tablist"
                  aria-label={t('heroAstrolabeSelectAria')}
                  className="inline-flex items-center gap-1 p-1 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface-solid)]"
                >
                  {(['cs-problem-solving', 'experimental-systems', 'intelligent-computing'] as const).map(
                    (nodeId) => {
                    const isSelected = activeNodeId === nodeId;
                    return (
                      <button
                        key={nodeId}
                        type="button"
                        role="tab"
                        data-testid={`astrolabe-tab-${nodeId}`}
                        aria-selected={isSelected}
                        onClick={() => setSelectedNodeId(nodeId)}
                        onMouseEnter={() => setHoveredNodeId(nodeId)}
                        onMouseLeave={() => setHoveredNodeId(null)}
                        onFocus={() => setHoveredNodeId(nodeId)}
                        onBlur={() => setHoveredNodeId(null)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] ${
                          isSelected
                            ? 'bg-[var(--color-primary)] text-white font-semibold'
                            : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                        }`}
                      >
                        {nodeDisplayMap[nodeId].shortLabel}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-[var(--color-border-subtle)]">
                <div className="space-y-1 min-w-0">
                  <div className={`text-[11px] font-mono uppercase tracking-wider ${activeNodeDisplay.accentClass}`}>
                    {activeNodeDisplay.eyebrow}
                  </div>
                  <h2 className="text-sm font-semibold text-[var(--color-text)] truncate">
                    {activeNodeDisplay.title}
                  </h2>
                  <p className="text-xs text-[var(--color-text-muted)] line-clamp-2 leading-relaxed">
                    {activeNodeDisplay.summary}
                  </p>
                </div>

                {activeNodeConfig && (
                  <button
                    type="button"
                    onClick={() => navigate(activeNodeTarget.route)}
                    className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[40px] rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-hover)] hover:border-[var(--color-primary)] text-xs font-semibold text-[var(--color-text)] transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  >
                    <span>{resolvedAstrolabeCtaLabel}</span>
                    <DirectionalArrow className="w-3.5 h-3.5 text-[var(--color-secondary)]" aria-hidden="true" />
                  </button>
                )}
              </div>

              <p className="hidden lg:block text-[11px] font-mono text-[var(--color-text-subtle)]">
                {t('heroAstrolabeHint')}
              </p>
            </div>
          </div>
        </div>

        {/* 2. Obsidian Portfolio Evidence Strip (Cleanly positioned below Hero Split) */}
        <aside className="relative z-10 mt-10 pointer-events-auto" aria-label={t('heroPanelTitle')}>
          <div className="na-mineral-card rounded-2xl overflow-hidden">
            <div className="px-5 py-3 border-b border-[var(--color-border-subtle)] flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-[var(--color-secondary)] uppercase tracking-wider font-semibold">
                  {t('heroPanelEyebrow')}
                </span>
                <span aria-hidden="true" className="text-[var(--color-text-subtle)]">·</span>
                <h2 className="text-xs font-semibold text-[var(--color-text)]">
                  {t('heroPanelTitle')}
                </h2>
              </div>
              <span className="text-[11px] font-mono text-[var(--color-text-subtle)]">
                {termDisplay}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x rtl:md:divide-x-reverse divide-[var(--color-border-subtle)]">
              <button
                type="button"
                onClick={() => navigate('/academic')}
                className="px-5 py-4 text-start hover:bg-[var(--color-surface-hover)] transition-colors flex items-center justify-between gap-3 cursor-pointer focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[var(--color-primary)]"
              >
                <span className="flex items-center gap-2.5 text-xs font-medium text-[var(--color-text)]">
                  <Layers className="w-4 h-4 text-[var(--color-secondary)] shrink-0" aria-hidden="true" />
                  <span>{t('navAcademic')}</span>
                </span>
                <span className="font-mono text-sm font-semibold text-[var(--color-secondary)] tabular-nums shrink-0">
                  {courseCountDisplay}
                </span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/projects')}
                className="px-5 py-4 text-start hover:bg-[var(--color-surface-hover)] transition-colors flex items-center justify-between gap-3 cursor-pointer focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[var(--color-primary)]"
              >
                <span className="flex items-center gap-2.5 text-xs font-medium text-[var(--color-text)]">
                  <Code2 className="w-4 h-4 text-[var(--color-primary)] shrink-0" aria-hidden="true" />
                  <span>{t('navProjects')}</span>
                </span>
                <span className="font-mono text-sm font-semibold text-[var(--color-primary)] tabular-nums shrink-0">
                  {projectCountDisplay}
                </span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/milestones')}
                className="px-5 py-4 text-start hover:bg-[var(--color-surface-hover)] transition-colors flex flex-wrap items-center justify-between gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[var(--color-primary)]"
              >
                <span className="flex items-center gap-2.5 text-xs font-medium text-[var(--color-text-muted)]">
                  <Flag className="w-4 h-4 text-[var(--color-text-subtle)] shrink-0" aria-hidden="true" />
                  <span>{t('heroPanelNotesMilestones')}</span>
                </span>
                <span className="text-[11px] font-mono text-[var(--color-text-subtle)] tabular-nums shrink-0 text-end">
                  {notes.length + milestones.length > 0
                    ? `${String(notes.length + milestones.length).padStart(2, '0')}`
                    : t('heroPanelReadyEmpty')}
                </span>
              </button>
            </div>
          </div>
        </aside>

        {/* 3. Verified Learning & Study Tracks (strictly excluding paused tracks marked inactive) */}
        <div className="relative z-10 mt-6 grid grid-cols-1 md:grid-cols-3 gap-5 pointer-events-auto">
          {highlightedTracks.map((track) => {
            const statusClass =
              track.status === 'completed'
                ? 'text-[var(--color-status-success)]'
                : track.status === 'paused' || track.status === 'needs_confirmation'
                ? 'text-[var(--color-status-warning)]'
                : 'text-[var(--color-secondary)]';
            return (
              <div
                key={track.id}
                className="na-mineral-card na-mineral-card-interactive p-5 rounded-xl flex flex-col justify-between gap-2.5"
              >
                <div className="space-y-2">
                  <span className={`block text-[11px] font-mono uppercase tracking-wider ${statusClass}`}>
                    {isRtl ? track.statusLabelAr : track.statusLabelEn}
                  </span>
                  <h3 className="text-sm font-semibold text-[var(--color-text)] leading-snug">
                    {isRtl ? track.titleAr : track.titleEn}
                  </h3>
                  <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                    {isRtl ? track.summaryAr : track.summaryEn}
                  </p>
                </div>
                {(track.cadenceNoteEn || track.cadenceNoteAr) && (
                  <p className="pt-2 border-t border-[var(--color-border-subtle)] text-[11px] font-mono text-[var(--color-text-subtle)]">
                    {isRtl ? track.cadenceNoteAr : track.cadenceNoteEn}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Academic Curriculum Snapshot */}
      <section id="academic-section" className="max-w-6xl mx-auto px-4 sm:px-6 pointer-events-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-4 border-b border-[var(--color-border-subtle)]">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[var(--color-secondary)] mb-1">
              <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{termDisplay}</span>
            </div>
            <h2 className="text-2xl font-bold text-[var(--color-text)] tracking-tight">
              {t('academicTitle')}
            </h2>
          </div>

          <button
            type="button"
            onClick={() => navigate('/academic')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors cursor-pointer self-start md:self-auto focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] rounded-sm"
          >
            <span>{courses.length === 7 ? t('heroViewAllCourses') : t('btnExploreCourses')}</span>
            <DirectionalArrow className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>

        <div aria-live="polite">
          {coursesLoading ? (
            <div className="py-10 flex items-center justify-center gap-2 text-xs font-mono text-[var(--color-text-muted)]" role="status">
              <RefreshCw className="w-4 h-4 text-[var(--color-primary)] animate-spin" aria-hidden="true" />
              <span>{t('coursesLoading')}</span>
            </div>
          ) : coursesError ? (
            <div className="p-6 rounded-2xl border border-red-500/30 bg-red-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-red-400 font-semibold text-sm">
                  <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>{t('publicLoadErrorTitle')}</span>
                </div>
                <p className="text-xs text-[var(--color-text-muted)]">{t('publicLoadErrorDesc')}</p>
              </div>
              <button
                type="button"
                onClick={loadHomeData}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-red-400/40 bg-red-500/10 text-xs font-medium text-[var(--color-text)] hover:bg-red-500/20 transition-colors cursor-pointer shrink-0"
              >
                <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{t('retryAction')}</span>
              </button>
            </div>
          ) : courses.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title={t('academicTitle')}
              description={t('coursesEmptyNotice')}
              actionText={t('btnExploreCourses')}
              onAction={() => navigate('/academic')}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {courses.slice(0, 3).map((course, idx) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  index={idx}
                  onSelect={() => navigate('/academic')}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 5. Featured Real Projects & Practice */}
      <section id="projects-section" className="max-w-6xl mx-auto px-4 sm:px-6 pointer-events-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-4 border-b border-[var(--color-border-subtle)]">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[var(--color-primary)] mb-1">
              <Code2 className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{t('heroActiveInitiativesKicker')}</span>
            </div>
            <h2 className="text-2xl font-bold text-[var(--color-text)] tracking-tight">
              {t('projectsTitle')}
            </h2>
          </div>

          <button
            type="button"
            onClick={() => navigate('/projects')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors cursor-pointer self-start md:self-auto focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] rounded-sm"
          >
            <span>{t('btnExploreProjects')}</span>
            <DirectionalArrow className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>

        <div aria-live="polite">
          {projectsLoading ? (
            <div className="py-12 flex items-center justify-center gap-2 text-xs font-mono text-[var(--color-text-muted)]" role="status">
              <RefreshCw className="w-4 h-4 text-[var(--color-primary)] animate-spin" aria-hidden="true" />
              <span>{t('projectsLoading')}</span>
            </div>
          ) : projectsError ? (
            <div className="p-6 rounded-2xl border border-red-500/30 bg-red-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-red-400 font-semibold text-sm">
                  <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>{t('publicLoadErrorTitle')}</span>
                </div>
                <p className="text-xs text-[var(--color-text-muted)]">{t('publicLoadErrorDesc')}</p>
              </div>
              <button
                type="button"
                onClick={loadHomeData}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-red-400/40 bg-red-500/10 text-xs font-medium text-[var(--color-text)] hover:bg-red-500/20 transition-colors cursor-pointer shrink-0"
              >
                <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{t('retryAction')}</span>
              </button>
            </div>
          ) : featuredProjects.length === 0 ? (
            <EmptyState
              icon={Code2}
              title={t('projectsEmptyTitle')}
              description={t('projectsEmptyDesc')}
              actionText={t('btnExploreProjects')}
              onAction={() => navigate('/projects')}
            />
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {featuredProjects.slice(0, 4).map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>

              <div className="na-mineral-card px-5 py-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-[var(--color-border-subtle)]">
                <div className="space-y-1">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--color-text-subtle)]">
                    {t('homeArchiveContextEyebrow')}
                  </span>
                  <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                    {t('homeArchiveContextDesc')}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/projects/local-ai-agent')}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-secondary)] hover:text-[var(--color-primary)] transition-colors shrink-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] rounded-sm"
                >
                  <span>{t('homeArchiveContextAction')}</span>
                  <DirectionalArrow className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 6. Honest Notes & Milestones Preview */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pointer-events-auto">
        <div className="pt-10 border-t border-[var(--color-border)] space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="max-w-2xl space-y-1">
              <div className="flex items-center gap-2 text-xs font-mono text-[var(--color-secondary)]">
                <FileText className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{t('homeNotesMilestonesEyebrow')}</span>
              </div>
              <h2 className="text-2xl font-bold text-[var(--color-text)] tracking-tight">
                {t('homeNotesMilestonesTitle')}
              </h2>
              <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                {t('homeNotesMilestonesDesc')}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
              <button
                type="button"
                onClick={() => navigate('/notes')}
                className="inline-flex items-center gap-1.5 text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] rounded-sm"
              >
                <span>{t('homeViewNotes')}</span>
                <DirectionalArrow className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => navigate('/milestones')}
                className="inline-flex items-center gap-1.5 text-[var(--color-secondary)] hover:text-[var(--color-secondary-hover)] transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)] rounded-sm"
              >
                <span>{t('homeViewMilestones')}</span>
                <DirectionalArrow className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>

          {notes.length > 0 || milestones.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {notes.slice(0, 2).map((note) => {
                const date = formatLocalizedDate(note.publishedAt || note.createdAt, language);
                const validKeys = KNOWLEDGE_CATEGORIES.map((c) => c.topicMatchKey);
                const { categoryKey } = resolveNoteCategoryAndTags(note.topicLabels, validKeys);
                const catObj = categoryKey
                  ? KNOWLEDGE_CATEGORIES.find(
                      (c) => c.topicMatchKey.toLowerCase() === categoryKey.toLowerCase()
                    )
                  : undefined;
                const catTitle = catObj
                  ? isRtl
                    ? catObj.titleAr
                    : catObj.titleEn
                  : categoryKey;
                return (
                  <button
                    key={note.id}
                    type="button"
                    onClick={() => navigate(`/notes/${note.slug || note.id}`)}
                    className="na-mineral-card na-mineral-card-interactive p-5 rounded-xl text-start space-y-2 cursor-pointer"
                  >
                    <div className="text-xs font-mono text-[var(--color-secondary)]">
                      {[catTitle, date].filter(Boolean).join(' · ') || t('navNotes')}
                    </div>
                    <h3 className="text-base font-semibold text-[var(--color-text)]">
                      {isRtl ? note.titleAr : note.titleEn}
                    </h3>
                    {(note.summaryEn || note.summaryAr) && (
                      <p className="text-xs text-[var(--color-text-muted)] line-clamp-2">
                        {isRtl ? note.summaryAr || note.summaryEn : note.summaryEn || note.summaryAr}
                      </p>
                    )}
                  </button>
                );
              })}
              {milestones.slice(0, Math.max(0, 2 - notes.slice(0, 2).length)).map((item) => (
                <div
                  key={item.id}
                  className="na-mineral-card p-5 rounded-xl space-y-2"
                >
                  <div className="text-xs font-mono text-[var(--color-secondary)]">
                    {isRtl ? item.dateAr || item.dateEn || t('navMilestones') : item.dateEn || t('navMilestones')}
                  </div>
                  <h3 className="text-base font-semibold text-[var(--color-text)]">
                    {isRtl ? item.titleAr : item.titleEn}
                  </h3>
                  <p className="text-xs text-[var(--color-text-muted)] line-clamp-2">
                    {isRtl ? item.descriptionAr : item.descriptionEn}
                  </p>
                </div>
              ))}
            </div>
          ) : archiveLoading ? (
            <div className="py-8 flex items-center justify-center gap-2 text-xs font-mono text-[var(--color-text-muted)]" role="status">
              <RefreshCw className="w-4 h-4 text-[var(--color-primary)] animate-spin" aria-hidden="true" />
              <span>{t('notesLoading')}</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button
                type="button"
                onClick={() => navigate('/notes')}
                className="na-mineral-card na-mineral-card-interactive p-5 rounded-xl text-start space-y-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              >
                <div className="flex items-center justify-between text-xs font-mono text-[var(--color-secondary)]">
                  <span>{t('navNotes')}</span>
                  <span>{t('heroPanelReadyEmpty')}</span>
                </div>
                <h3 className="text-sm font-semibold text-[var(--color-text)]">
                  {t('notesEmptyTitle')}
                </h3>
                <p className="text-xs text-[var(--color-text-muted)] leading-relaxed line-clamp-2">
                  {t('notesEmptyDesc')}
                </p>
              </button>

              <button
                type="button"
                onClick={() => navigate('/milestones')}
                className="na-mineral-card na-mineral-card-interactive p-5 rounded-xl text-start space-y-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]"
              >
                <div className="flex items-center justify-between text-xs font-mono text-[var(--color-primary)]">
                  <span>{t('navMilestones')}</span>
                  <span>{t('heroPanelReadyEmpty')}</span>
                </div>
                <h3 className="text-sm font-semibold text-[var(--color-text)]">
                  {t('milestonesEmptyTitle')}
                </h3>
                <p className="text-xs text-[var(--color-text-muted)] leading-relaxed line-clamp-2">
                  {t('milestonesEmptyDesc')}
                </p>
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 7. About & Connect Invitation */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-4 pointer-events-auto">
        <div className="na-mineral-card p-6 sm:p-8 rounded-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <h2 className="text-xl font-bold text-[var(--color-text)] tracking-tight">
              {t('homeAboutConnectTitle')}
            </h2>
            <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
              {t('homeAboutConnectDesc')}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => navigate('/about')}
              className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-hover)] hover:border-[var(--color-primary)] text-xs font-semibold text-[var(--color-text)] transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            >
              <Compass className="w-3.5 h-3.5 text-[var(--color-secondary)]" aria-hidden="true" />
              <span>{t('homeAboutBtn')}</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/connect')}
              className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[44px] rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-semibold transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            >
              <MessageSquare className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{t('homeConnectBtn')}</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
