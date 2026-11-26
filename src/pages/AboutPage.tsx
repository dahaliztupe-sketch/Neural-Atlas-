import React from 'react';
import { useApp } from '../context/AppContext';
import {
  LEARNING_TRACKS,
  OWNER_INFO,
  PRACTICAL_EXPERIENCE,
  SKILLS_CATALOG,
} from '../data/portfolioData';
import { SkillTier } from '../types';
import {
  GraduationCap,
  Terminal,
  Brain,
  Compass,
  BookOpenCheck,
  Layers,
  Sparkles,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  const { t, isRtl, navigate, publicProfile } = useApp();

  const universityName = isRtl
    ? publicProfile.universityAr || t('universityShort')
    : publicProfile.universityEn || t('universityShort');
  const facultyName = isRtl ? publicProfile.facultyAr : publicProfile.facultyEn;
  const departmentName = isRtl
    ? publicProfile.departmentAr || t('aboutDepartment')
    : publicProfile.departmentEn || t('aboutDepartment');
  const yearLabel = isRtl
    ? publicProfile.academicYearAr || 'السنة الأولى'
    : publicProfile.academicYearEn || 'First Year';
  const semesterLabel = isRtl
    ? publicProfile.currentSemesterAr || 'الدراسة الجامعية الحالية'
    : publicProfile.currentSemesterEn || 'Current Academic Studies';

  const tracks = (
    publicProfile.learningTracks && publicProfile.learningTracks.length > 0
      ? publicProfile.learningTracks
      : LEARNING_TRACKS
  ).filter((track) => track.showInActiveHighlights !== false);

  const practicalExp = publicProfile.practicalExperience || PRACTICAL_EXPERIENCE;

  const programmingSkills = SKILLS_CATALOG.filter((s) => s.domain === 'programming');
  const interestSkills = SKILLS_CATALOG.filter((s) => s.domain === 'technical_interest');

  const getTierMeta = (tier: SkillTier) => {
    if (tier === 'practiced') {
      return {
        label: t('skillTierPracticed'),
        className: 'text-[var(--color-status-success)]',
      };
    }
    if (tier === 'learning') {
      return {
        label: t('skillTierLearning'),
        className: 'text-[var(--color-primary)]',
      };
    }
    return {
      label: t('skillTierExploring'),
      className: 'text-[var(--color-secondary)]',
    };
  };

  const getTrackStatusClass = (status: string) => {
    if (status === 'completed') return 'text-[var(--color-status-success)]';
    if (status === 'paused' || status === 'needs_confirmation') {
      return 'text-[var(--color-status-warning)]';
    }
    return 'text-[var(--color-secondary)]';
  };

  const showSeparateUniversity =
    universityName && !facultyName.includes(isRtl ? 'الأزهر' : 'Al-Azhar');

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-12">
      {/* Header */}
      <div>
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-[var(--color-primary)] mb-2">
          <GraduationCap className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>
            {yearLabel} · {semesterLabel} · {t('aboutLocationBadge')}
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-[var(--color-text)] tracking-tight text-balance mb-3">
          {t('aboutTitle')}
        </h1>
        <p className="text-base text-[var(--color-text-muted)]">{t('aboutSubtitle')}</p>
      </div>

      {/* Main Narrative & Academic Identity */}
      <div className="space-y-8 text-base text-[var(--color-text-muted)] leading-relaxed">
        <section className="na-mineral-card p-6 rounded-2xl space-y-4">
          <h2 className="text-lg font-semibold text-[var(--color-text)] flex items-center gap-2">
            <Compass className="w-4 h-4 text-[var(--color-secondary)] shrink-0" aria-hidden="true" />
            <span>{t('aboutKickerIdentity')}</span>
          </h2>
          <p>{t('aboutP1')}</p>
          <div className="pt-3 border-t border-[var(--color-border-subtle)] flex flex-wrap items-center gap-3 text-xs font-mono text-[var(--color-text-subtle)]">
            <span className="text-[var(--color-text)]">{facultyName}</span>
            {showSeparateUniversity && (
              <>
                <span aria-hidden="true">·</span>
                <span>{universityName}</span>
              </>
            )}
            <span aria-hidden="true">·</span>
            <span>{departmentName}</span>
            <span aria-hidden="true">·</span>
            <span>{t('aboutLocationBadge')}</span>
            <span aria-hidden="true">·</span>
            <span className="text-[var(--color-secondary)]">
              {yearLabel} · {semesterLabel}
            </span>
          </div>
        </section>

        {/* Early Self-Learning Background (~Age 12) */}
        <section
          className="na-mineral-card p-6 rounded-2xl space-y-3"
          aria-labelledby="about-background-heading"
        >
          <h2
            id="about-background-heading"
            className="text-lg font-semibold text-[var(--color-text)] flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-[var(--color-primary)] shrink-0" aria-hidden="true" />
            <span>{t('aboutBackgroundHeading')}</span>
          </h2>
          <p className="text-sm sm:text-base text-[var(--color-text-muted)] leading-relaxed">
            {isRtl ? OWNER_INFO.backgroundAr : OWNER_INFO.backgroundEn}
          </p>
        </section>

        {/* Structured Skills & Technical Interests (Qualitative Depth Tiers, Zero Percentages) */}
        <section className="space-y-5" aria-labelledby="about-skills-heading">
          <div className="space-y-1">
            <h2
              id="about-skills-heading"
              className="text-lg font-semibold text-[var(--color-text)] flex items-center gap-2"
            >
              <Layers className="w-4 h-4 text-[var(--color-secondary)] shrink-0" aria-hidden="true" />
              <span>{t('aboutSkillsHeading')}</span>
            </h2>
            <p className="text-sm text-[var(--color-text-muted)]">{t('aboutSkillsSubtitle')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Programming & Foundations */}
            <div className="na-mineral-card p-6 rounded-2xl space-y-4">
              <h3 className="text-xs font-mono uppercase tracking-wider text-[var(--color-primary)] font-semibold">
                {t('skillsDomainProgramming')}
              </h3>
              <ul className="space-y-4 divide-y divide-[var(--color-border-subtle)]">
                {programmingSkills.map((skill, idx) => {
                  const tierMeta = getTierMeta(skill.tier);
                  return (
                    <li key={skill.id} className={idx > 0 ? 'pt-3.5 space-y-1' : 'space-y-1'}>
                      <div className="flex items-start justify-between gap-3">
                        <span className="text-sm font-semibold text-[var(--color-text)] leading-snug">
                          {isRtl ? skill.nameAr : skill.nameEn}
                        </span>
                        <span
                          className={`text-[11px] font-mono font-semibold shrink-0 whitespace-nowrap pt-0.5 ${tierMeta.className}`}
                        >
                          {tierMeta.label}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                        {isRtl ? skill.contextAr : skill.contextEn}
                      </p>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Technical Interests */}
            <div className="na-mineral-card p-6 rounded-2xl space-y-4">
              <h3 className="text-xs font-mono uppercase tracking-wider text-[var(--color-secondary)] font-semibold">
                {t('skillsDomainInterests')}
              </h3>
              <ul className="space-y-4 divide-y divide-[var(--color-border-subtle)]">
                {interestSkills.map((skill, idx) => {
                  const tierMeta = getTierMeta(skill.tier);
                  return (
                    <li key={skill.id} className={idx > 0 ? 'pt-3.5 space-y-1' : 'space-y-1'}>
                      <div className="flex items-start justify-between gap-3">
                        <span className="text-sm font-semibold text-[var(--color-text)] leading-snug">
                          {isRtl ? skill.nameAr : skill.nameEn}
                        </span>
                        <span
                          className={`text-[11px] font-mono font-semibold shrink-0 whitespace-nowrap pt-0.5 ${tierMeta.className}`}
                        >
                          {tierMeta.label}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                        {isRtl ? skill.contextAr : skill.contextEn}
                      </p>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          <p className="text-sm text-[var(--color-text-muted)] leading-relaxed px-1">
            {isRtl ? practicalExp.contextSummaryAr : practicalExp.contextSummaryEn}
          </p>
        </section>

        {/* Verified Learning & Study Tracks */}
        <section className="space-y-4" aria-labelledby="about-learning-tracks-heading">
          <div className="space-y-1">
            <h2
              id="about-learning-tracks-heading"
              className="text-lg font-semibold text-[var(--color-text)] flex items-center gap-2"
            >
              <BookOpenCheck className="w-4 h-4 text-[var(--color-primary)] shrink-0" aria-hidden="true" />
              <span>{t('aboutKickerTracks')}</span>
            </h2>
            <p className="text-sm text-[var(--color-text-muted)]">{t('aboutTracksSubtitle')}</p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {tracks.map((track) => {
              const title = isRtl ? track.titleAr : track.titleEn;
              const statusLabel = isRtl ? track.statusLabelAr : track.statusLabelEn;
              const cadenceNote = isRtl ? track.cadenceNoteAr : track.cadenceNoteEn;
              const summary = isRtl ? track.summaryAr : track.summaryEn;
              const highlights = isRtl ? track.highlightsAr : track.highlightsEn;

              return (
                <article key={track.id} className="na-mineral-card p-6 rounded-2xl space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-base font-semibold text-[var(--color-text)]">{title}</h3>
                    <span
                      className={`text-xs font-mono font-semibold ${getTrackStatusClass(track.status)}`}
                    >
                      {statusLabel}
                    </span>
                  </div>

                  {summary && <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">{summary}</p>}

                  {highlights.length > 0 && (
                    <ul className="space-y-1.5 text-xs sm:text-sm text-[var(--color-text-muted)] list-disc list-inside">
                      {highlights.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  )}

                  {cadenceNote && (
                    <p className="pt-2 border-t border-[var(--color-border-subtle)] text-xs font-mono text-[var(--color-text-subtle)]">
                      {cadenceNote}
                    </p>
                  )}
                </article>
              );
            })}
          </div>
        </section>

        <section className="na-mineral-card p-6 rounded-2xl space-y-4">
          <h2 className="text-lg font-semibold text-[var(--color-text)] flex items-center gap-2">
            <Terminal className="w-4 h-4 text-[var(--color-primary)] shrink-0" aria-hidden="true" />
            <span>{t('aboutHeadingCpp')}</span>
          </h2>
          <p>{t('aboutP2')}</p>
        </section>

        <section className="na-mineral-card p-6 rounded-2xl space-y-4">
          <h2 className="text-lg font-semibold text-[var(--color-text)] flex items-center gap-2">
            <Brain className="w-4 h-4 text-[var(--color-secondary)] shrink-0" aria-hidden="true" />
            <span>{t('aboutHeadingExperiments')}</span>
          </h2>
          <p>{t('aboutP3')}</p>
          <p className="pt-3 border-t border-[var(--color-border-subtle)] text-sm">{t('aboutP4')}</p>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => navigate('/projects')}
              className="inline-flex items-center gap-1.5 min-h-[44px] py-2 text-xs font-semibold text-[var(--color-secondary)] hover:text-[var(--color-primary)] transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] rounded-sm"
            >
              <span>{t('aboutInspectLocalAiLink')}</span>
              {isRtl ? (
                <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
              ) : (
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              )}
            </button>
          </div>
        </section>
      </div>

      {/* Action buttons */}
      <div className="pt-4 flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={() => navigate('/academic')}
          className="px-5 py-2.5 min-h-[44px] rounded-xl bg-[var(--color-primary)] text-white text-sm font-medium hover:bg-[var(--color-primary-hover)] transition-colors inline-flex items-center gap-2 cursor-pointer"
        >
          <span>{t('btnExploreCourses')}</span>
          {isRtl ? (
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          ) : (
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          )}
        </button>

        <button
          type="button"
          onClick={() => navigate('/projects')}
          className="na-mineral-card na-mineral-card-interactive px-5 py-2.5 min-h-[44px] rounded-xl text-[var(--color-text)] text-sm font-medium inline-flex items-center gap-2 cursor-pointer"
        >
          <span>{t('btnExploreProjects')}</span>
        </button>

        <button
          type="button"
          onClick={() => navigate('/connect')}
          className="na-mineral-card na-mineral-card-interactive px-5 py-2.5 min-h-[44px] rounded-xl text-[var(--color-text)] text-sm font-medium inline-flex items-center gap-2 cursor-pointer"
        >
          <span>{t('navConnect')}</span>
        </button>
      </div>
    </div>
  );
};
