import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { ACADEMIC_PROGRAM } from '../data/portfolioData';
import { CourseRecord } from '../types';
import { CACHE_KEYS } from '../services/cacheService';
import { useCachedResource } from '../hooks/useCachedResource';
import { DataQueryResult, getPublishedCoursesResult } from '../services/contentRepository';
import { CourseCard, CourseDisplayItem } from '../components/CourseCard';
import { CourseDetailModal } from '../components/CourseDetailModal';
import {
  BookOpen,
  ShieldCheck,
  ExternalLink,
  Code2,
  Cpu,
  GraduationCap,
  Sparkles,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';

export const AcademicJourneyPage: React.FC = () => {
  const { t, isRtl, setSeoOverride, publicProfile } = useApp();
  const [selectedCourse, setSelectedCourse] = useState<CourseDisplayItem | null>(null);
  const [activeTab, setActiveTab] = useState<'current' | 'future'>('current');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const institutionName = isRtl
    ? publicProfile.universityAr || ACADEMIC_PROGRAM.institutionAr
    : publicProfile.universityEn || ACADEMIC_PROGRAM.institutionEn;
  const facultyName = isRtl
    ? publicProfile.facultyAr || ACADEMIC_PROGRAM.facultyAr
    : publicProfile.facultyEn || ACADEMIC_PROGRAM.facultyEn;
  const departmentName = isRtl
    ? publicProfile.departmentAr || ACADEMIC_PROGRAM.departmentAr
    : publicProfile.departmentEn || ACADEMIC_PROGRAM.departmentEn;
  const academicYearLabel = isRtl
    ? publicProfile.academicYearAr || ACADEMIC_PROGRAM.currentYearAr
    : publicProfile.academicYearEn || ACADEMIC_PROGRAM.currentYearEn;
  const currentSemesterLabel = isRtl
    ? publicProfile.currentSemesterAr || ACADEMIC_PROGRAM.currentSemesterAr
    : publicProfile.currentSemesterEn || ACADEMIC_PROGRAM.currentSemesterEn;

  const fetchCourses = useCallback(() => getPublishedCoursesResult(), []);
  const {
    data: queryResult,
    loading,
    refresh: loadCourses,
  } = useCachedResource<DataQueryResult<CourseRecord[]>>(
    CACHE_KEYS.coursesList,
    fetchCourses,
    {
      shouldPersist: (res) => res.status !== 'error',
      isErrorResult: (res) => res.status === 'error',
    }
  );

  const errorCode = queryResult?.status === 'error' ? queryResult.errorCode || 'query_error' : null;
  const courses = useMemo<CourseDisplayItem[]>(
    () => (queryResult?.status === 'error' ? [] : queryResult?.items || []),
    [queryResult]
  );

  useEffect(() => {
    const providerName = `${facultyName} · ${institutionName}`;
    setSeoOverride({
      courses: courses.map((course) => ({
        name: isRtl ? course.nameAr : course.nameEn,
        description: isRtl
          ? `${course.yearAr} · ${course.semesterAr}`
          : `${course.yearEn} · ${course.semesterEn}`,
        providerName,
      })),
    });
    return () => setSeoOverride(null);
  }, [courses, facultyName, institutionName, isRtl, setSeoOverride]);

  const filteredCourses = courses.filter((course) => {
    if (selectedCategory === 'all') return true;
    return course.category === selectedCategory;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-12">
      {/* 1. Academic Header & Institution Affiliation (Zero pill clutter) */}
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs font-mono">
          <span className="inline-flex items-center gap-1.5 text-[var(--color-secondary)] font-semibold">
            <GraduationCap className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>{departmentName}</span>
          </span>
          <span className="text-[var(--color-text-subtle)]" aria-hidden="true">·</span>
          <span className="text-[var(--color-text-subtle)]">{facultyName}</span>
          {!facultyName.includes(isRtl ? 'الأزهر' : 'Al-Azhar') && (
            <>
              <span className="text-[var(--color-text-subtle)]" aria-hidden="true">·</span>
              <span className="text-[var(--color-text-subtle)]">{institutionName}</span>
            </>
          )}
          <span className="text-[var(--color-text-subtle)]" aria-hidden="true">·</span>
          <span className="text-[var(--color-text-subtle)]">{t('aboutLocationBadge')}</span>
          <span className="text-[var(--color-text-subtle)]" aria-hidden="true">·</span>
          <span className="text-[var(--color-text-muted)]">
            {academicYearLabel} · {currentSemesterLabel}
          </span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="max-w-3xl space-y-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--color-text)] tracking-tight text-balance">
              {t('academicTitle')}
            </h1>
            <p className="text-base sm:text-lg text-[var(--color-text-muted)] leading-relaxed">
              {t('academicIntro')}
            </p>
          </div>

          <div className="shrink-0 flex flex-col items-start lg:items-end gap-1.5">
            <a
              href={ACADEMIC_PROGRAM.telegramBotUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl border border-[var(--color-secondary)]/40 bg-[var(--color-secondary)]/10 hover:bg-[var(--color-secondary)]/20 text-[var(--color-secondary)] text-xs font-medium transition-all focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]"
            >
              <span>{t('academicTelegramBot')}</span>
              <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
            </a>
            <span className="text-[11px] text-[var(--color-text-subtle)] font-mono max-w-xs text-start lg:text-end">
              {t('academicTelegramBotNote')}
            </span>
          </div>
        </div>

        {/* Concise Source & Term Bar */}
        <div className="pt-4 border-t border-[var(--color-border-subtle)] flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-[var(--color-text-subtle)]">
          <span className="flex items-center gap-1.5 text-[var(--color-text-muted)]">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" aria-hidden="true" />
            <span>{t('academicConciseNote')}</span>
          </span>
          <span>
            {isRtl
              ? ACADEMIC_PROGRAM.semester1ArchiveLabelAr
              : ACADEMIC_PROGRAM.semester1ArchiveLabelEn}
          </span>
        </div>
      </div>

      {/* 2. Semester Switcher Tabs */}
      <div className="border-b border-[var(--color-border-subtle)] flex items-center gap-2 sm:gap-4 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('current')}
          className={`pb-3 pt-2 min-h-[44px] px-1 text-sm font-medium transition-colors border-b-2 whitespace-nowrap cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] rounded-t-sm ${
            activeTab === 'current'
              ? 'border-[var(--color-primary)] text-[var(--color-text)]'
              : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
          }`}
        >
          {t('semesterTabCurrent')}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('future')}
          className={`pb-3 pt-2 min-h-[44px] px-1 text-sm font-medium transition-colors border-b-2 whitespace-nowrap cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] rounded-t-sm ${
            activeTab === 'future'
              ? 'border-[var(--color-primary)] text-[var(--color-text)]'
              : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
          }`}
        >
          {t('semesterTabFuture')}
        </button>
      </div>

      {/* 3. Tab Content */}
      {activeTab === 'current' ? (
        <div className="space-y-8">
          {courses.length > 0 && (
            <>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setSelectedCategory('all')}
                  className={`px-3 py-2 min-h-[44px] rounded-lg border font-mono transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] ${
                    selectedCategory === 'all'
                      ? 'border-[#7c3aed] bg-[#7c3aed] text-white'
                      : 'border-[var(--color-border)] bg-[var(--color-surface-solid)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                  }`}
                >
                  {t('filterAllCategories')} ({courses.length})
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCategory('computational')}
                  className={`px-3 py-2 min-h-[44px] rounded-lg border font-mono transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] ${
                    selectedCategory === 'computational'
                      ? 'border-[#7c3aed] bg-[#7c3aed] text-white'
                      : 'border-[var(--color-border)] bg-[var(--color-surface-solid)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                  }`}
                >
                  {t('filterComputational')}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCategory('mathematical')}
                  className={`px-3 py-2 min-h-[44px] rounded-lg border font-mono transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] ${
                    selectedCategory === 'mathematical'
                      ? 'border-[#7c3aed] bg-[#7c3aed] text-white'
                      : 'border-[var(--color-border)] bg-[var(--color-surface-solid)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                  }`}
                >
                  {t('filterMathematical')}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCategory('humanities')}
                  className={`px-3 py-2 min-h-[44px] rounded-lg border font-mono transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] ${
                    selectedCategory === 'humanities'
                      ? 'border-[#7c3aed] bg-[#7c3aed] text-white'
                      : 'border-[var(--color-border)] bg-[var(--color-surface-solid)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                  }`}
                >
                  {t('filterHumanities')}
                </button>
              </div>

              <p className="text-[11px] text-[var(--color-text-subtle)] font-mono">
                {t('domainExploratoryNote')}
              </p>
            </>
          )}

          <div aria-live="polite">
            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-2 text-xs font-mono text-[var(--color-text-muted)]" role="status">
                <RefreshCw className="w-5 h-5 text-[var(--color-primary)] animate-spin" aria-hidden="true" />
                <span>{t('coursesLoading')}</span>
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
                  onClick={loadCourses}
                  className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[44px] rounded-lg border border-red-400/40 bg-red-500/10 text-xs font-medium text-[var(--color-text)] hover:bg-red-500/20 transition-colors cursor-pointer shrink-0"
                >
                  <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{t('retryAction')}</span>
                </button>
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="p-8 rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] text-center space-y-3">
                <p className="text-sm text-[var(--color-text-muted)]">{t('coursesEmptyNotice')}</p>
                {selectedCategory !== 'all' && (
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('all')}
                    className="px-4 py-2 min-h-[44px] rounded-lg border border-[var(--color-border)] text-xs font-medium text-[var(--color-primary)] hover:border-[var(--color-primary)] cursor-pointer"
                  >
                    {t('clearFiltersBtn')}
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map((course, idx) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    index={idx}
                    onSelect={(c) => setSelectedCourse(c)}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="na-mineral-card p-4 rounded-xl flex items-start gap-3 text-xs text-[var(--color-text-muted)]">
            <ShieldCheck className="w-4 h-4 text-[var(--color-secondary)] shrink-0 mt-0.5" aria-hidden="true" />
            <span>{t('noGradesNote')}</span>
          </div>
        </div>
      ) : (
        <div className="na-mineral-card p-8 sm:p-12 rounded-2xl text-center space-y-4 max-w-2xl mx-auto">
          <div className="w-12 h-12 mx-auto rounded-xl bg-[var(--color-surface-hover)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-secondary)]">
            <Sparkles className="w-6 h-6" aria-hidden="true" />
          </div>
          <h2 className="text-xl font-semibold text-[var(--color-text)]">
            {t('futureSemestersTitle')}
          </h2>
          <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
            {t('semesterFutureNotice')}
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setActiveTab('current')}
              className="inline-flex items-center min-h-[44px] px-3 py-2 text-xs font-mono text-[var(--color-primary)] hover:underline cursor-pointer"
            >
              ← {t('academicReturnSem1')}
            </button>
          </div>
        </div>
      )}

      {/* 4. Unboxed Editorial Distinction: Coursework vs. Self-Study vs. Experiments */}
      <section className="pt-10 border-t border-[var(--color-border)] space-y-8">
        <div className="max-w-3xl space-y-2">
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--color-text)]">
            {t('academicBoundaryTitle')}
          </h2>
          <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
            {t('academicBoundaryDesc')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-2.5 border-t border-[var(--color-border-subtle)] pt-4">
            <div className="flex items-center gap-2 text-[var(--color-secondary)] font-mono text-xs font-semibold">
              <BookOpen className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{t('academicBoundaryCourseworkTitle')}</span>
            </div>
            <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
              {t('academicBoundaryCourseworkDesc')}
            </p>
          </div>

          <div className="space-y-2.5 border-t border-[var(--color-border-subtle)] pt-4">
            <div className="flex items-center gap-2 text-[var(--color-primary)] font-mono text-xs font-semibold">
              <Code2 className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{t('academicBoundarySelfStudyTitle')}</span>
            </div>
            <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
              {t('academicBoundarySelfStudyDesc')}
            </p>
          </div>

          <div className="space-y-2.5 border-t border-[var(--color-border-subtle)] pt-4">
            <div className="flex items-center gap-2 text-[var(--color-secondary)] font-mono text-xs font-semibold">
              <Cpu className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{t('academicBoundaryExperimentsTitle')}</span>
            </div>
            <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
              {t('academicBoundaryExperimentsDesc')}
            </p>
          </div>
        </div>
      </section>

      <CourseDetailModal
        course={selectedCourse}
        program={ACADEMIC_PROGRAM}
        onClose={() => setSelectedCourse(null)}
      />
    </div>
  );
};
