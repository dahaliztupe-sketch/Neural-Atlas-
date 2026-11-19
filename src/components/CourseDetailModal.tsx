import React, { useEffect, useRef } from 'react';
import { AcademicProgramInfo } from '../types';
import { CourseDisplayItem } from './CourseCard';
import { useApp } from '../context/AppContext';
import { X, ShieldAlert, Sparkles, ExternalLink, BookOpen } from 'lucide-react';

interface CourseDetailModalProps {
  course: CourseDisplayItem | null;
  program: AcademicProgramInfo;
  onClose: () => void;
}

export const CourseDetailModal: React.FC<CourseDetailModalProps> = ({
  course,
  program,
  onClose,
}) => {
  const { isRtl, t } = useApp();
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!course) return;

    previousFocusRef.current = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      previousFocusRef.current?.focus?.();
    };
  }, [course, onClose]);

  if (!course) return null;

  const nodeNumber = (course.latticeNodeIndex ?? 0) + 1;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#050811]/82 transition-opacity duration-200"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="course-detail-title"
        className="na-mineral-card relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[var(--color-surface-solid)] shadow-2xl p-6 sm:p-8 space-y-6 text-[var(--color-text)] transition-transform duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[var(--color-border-subtle)] pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono text-[var(--color-secondary)]">
              <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{t('latticeNodeLabel')} {String(nodeNumber).padStart(2, '0')}</span>
              <span aria-hidden="true">·</span>
              <span>{isRtl ? course.semesterAr : course.semesterEn}</span>
            </div>
            <h2
              id="course-detail-title"
              className="text-2xl font-bold tracking-tight text-[var(--color-text)]"
            >
              {isRtl ? course.nameAr : course.nameEn}
            </h2>
            <p className="text-sm font-mono text-[var(--color-text-muted)]" dir={isRtl ? 'ltr' : 'rtl'}>
              {isRtl ? course.nameEn : course.nameAr}
            </p>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] border border-transparent hover:border-[var(--color-border-subtle)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] cursor-pointer"
            aria-label={t('closeModal')}
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-surface-hover)]">
            <span className="block text-[var(--color-text-subtle)] font-mono mb-1">
              {t('academicStatusLabel')}
            </span>
            <span className="font-medium text-[var(--color-secondary)] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
              {t('academicStatusVerified')}
            </span>
          </div>

          <div className="p-3 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-surface-hover)]">
            <span className="block text-[var(--color-text-subtle)] font-mono mb-1">
              {t('termLabel')}
            </span>
            <span className="font-medium text-[var(--color-text)]">
              {isRtl ? course.yearAr : course.yearEn} · {isRtl ? course.semesterAr : course.semesterEn}
            </span>
          </div>

          <div className="p-3 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-surface-hover)]">
            <span className="block text-[var(--color-text-subtle)] font-mono mb-1">
              {t('courseCategoryLabel')}
            </span>
            <span className="font-medium text-[var(--color-text)] capitalize">
              {course.category === 'computational'
                ? t('filterComputational')
                : course.category === 'mathematical'
                ? t('filterMathematical')
                : t('filterHumanities')}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface-hover)] space-y-2">
          <h3 className="text-xs font-mono uppercase tracking-wider text-[var(--color-text-subtle)]">
            {t('academicCurriculumHeading')}
          </h3>
          <p className="text-base text-[var(--color-text)] font-semibold">
            {isRtl ? course.nameAr : course.nameEn}
          </p>
          <p className="text-xs text-[var(--color-text-muted)] font-mono" dir={isRtl ? 'ltr' : 'rtl'}>
            {isRtl ? course.nameEn : course.nameAr}
          </p>
          {(course.descriptionEn || course.descriptionAr) && (
            <p className="pt-2 border-t border-[var(--color-border-subtle)] text-xs sm:text-sm text-[var(--color-text-muted)] leading-relaxed">
              {isRtl
                ? course.descriptionAr || course.descriptionEn
                : course.descriptionEn || course.descriptionAr}
            </p>
          )}
        </div>

        <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-xs text-[var(--color-text-muted)] space-y-2">
          <div className="flex items-center gap-2 text-amber-400 font-semibold">
            <ShieldAlert className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>{t('academicTransparencyHeading')}</span>
          </div>
          <p className="leading-relaxed">{t('academicHonestDisclosure')}</p>
          <p className="text-[11px] text-[var(--color-text-subtle)] font-mono">
            {t('domainExploratoryNote')}
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-[var(--color-border-subtle)]">
          <div className="text-[11px] text-[var(--color-text-subtle)] font-mono">
            {t('academicTelegramBotNote')}
          </div>
          <a
            href={program.telegramBotUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-medium bg-[var(--color-primary)] text-white hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)] shrink-0"
          >
            <span>{t('academicTelegramBot')}</span>
            <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
          </a>
        </div>

        <div className="text-center text-[11px] font-mono text-[var(--color-text-subtle)]">
          {t('escToClose')}
        </div>
      </div>
    </div>
  );
};
