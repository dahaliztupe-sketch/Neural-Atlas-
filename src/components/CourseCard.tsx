import React from 'react';
import { CourseItem, CourseRecord } from '../types';
import { useApp } from '../context/AppContext';
import { ChevronRight } from 'lucide-react';

export type CourseDisplayItem = (CourseItem | CourseRecord) & {
  descriptionEn?: string;
  descriptionAr?: string;
};

interface CourseCardProps {
  course: CourseDisplayItem;
  index: number;
  onSelect?: (course: CourseDisplayItem) => void;
  /** Heading level for the course title. Use 'h2' where no h2 precedes the cards. */
  headingLevel?: 'h2' | 'h3';
}

export const CourseCard: React.FC<CourseCardProps> = ({ course, index, onSelect, headingLevel = 'h3' }) => {
  const Heading = headingLevel;
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

      <Heading className="text-base font-semibold text-[var(--color-text)] mb-1 group-hover:text-[var(--color-primary)] transition-colors">
        {isRtl ? course.nameAr : course.nameEn}
      </Heading>

      <p className="text-xs text-[var(--color-text-muted)] font-mono mb-4" dir={isRtl ? 'ltr' : 'rtl'}>
        {isRtl ? course.nameEn : course.nameAr}
      </p>

      <div className="pt-3 border-t border-[var(--color-border-subtle)] flex items-center justify-end text-[11px]">
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
        className="w-full min-h-[44px] group relative na-mineral-card na-mineral-card-interactive p-5 rounded-xl text-start cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] flex flex-col justify-between"
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
