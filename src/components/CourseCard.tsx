import React from 'react';
import { CourseItem, CourseRecord } from '../types';
import { useApp } from '../context/AppContext';
import { BookOpen, ChevronRight } from 'lucide-react';

export type CourseDisplayItem = (CourseItem | CourseRecord) & {
  descriptionEn?: string;
  descriptionAr?: string;
};

interface CourseCardProps {
  course: CourseDisplayItem;
  index: number;
  onSelect?: (course: CourseDisplayItem) => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course, index, onSelect }) => {
  const { isRtl, t } = useApp();
  const courseNumber = (course.latticeNodeIndex ?? index) + 1;

  const content = (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--color-text-subtle)] mb-3">
        <div className="flex items-center gap-1.5 font-mono text-[11px]">
          <span>{isRtl ? course.yearAr : course.yearEn}</span>
          <span aria-hidden="true">·</span>
          <span>{isRtl ? course.semesterAr : course.semesterEn}</span>
        </div>
        <span className="text-[var(--color-secondary)] font-mono text-[11px] tabular-nums shrink-0">
          {t('latticeNodeLabel')} {String(courseNumber).padStart(2, '0')}
        </span>
      </div>

      <h3 className="text-base font-semibold text-[var(--color-text)] mb-1 group-hover:text-[var(--color-primary)] transition-colors">
        {isRtl ? course.nameAr : course.nameEn}
      </h3>

      <p className="text-xs text-[var(--color-text-muted)] font-mono mb-3" dir={isRtl ? 'ltr' : 'rtl'}>
        {isRtl ? course.nameEn : course.nameAr}
      </p>

      <div className="text-[11px] font-mono text-[var(--color-text-subtle)] mb-4">
        {t('unverifiedNoticeShort')}
      </div>

      <div className="pt-3 border-t border-[var(--color-border-subtle)] flex items-center justify-between text-[11px] text-[var(--color-text-subtle)]">
        <span className="flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 text-[var(--color-secondary)]" aria-hidden="true" />
          <span>{t('ownerProvidedBadge')}</span>
        </span>
        <span className="inline-flex items-center gap-1 text-[var(--color-primary)] font-medium group-hover:underline shrink-0">
          <span>{t('academicInspectCourse')}</span>
          <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isRtl ? 'rotate-180' : ''}`} aria-hidden="true" />
        </span>
      </div>
    </>
  );

  if (onSelect) {
    return (
      <button
        type="button"
        onClick={() => onSelect(course)}
        className="w-full group relative na-mineral-card na-mineral-card-interactive p-5 rounded-xl text-start cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] flex flex-col justify-between"
        aria-label={`${isRtl ? course.nameAr : course.nameEn} - ${t('academicInspectCourse')}`}
      >
        {content}
      </button>
    );
  }

  return (
    <article className="relative na-mineral-card p-5 rounded-xl text-start flex flex-col justify-between">
      {content}
    </article>
  );
};
