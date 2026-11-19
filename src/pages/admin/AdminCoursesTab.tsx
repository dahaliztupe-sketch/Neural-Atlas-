import React, { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { CourseRecord } from '../../types';
import { useApp } from '../../context/AppContext';
import { ACADEMIC_PROGRAM } from '../../data/portfolioData';
import { CourseDetailModal } from '../../components/CourseDetailModal';
import { PublicationBadge, RecordActions } from './AdminShared';

interface AdminCoursesTabProps {
  courses: CourseRecord[];
  onCreate: () => void;
  onEdit: (course: CourseRecord) => void;
  onTogglePublish: (course: CourseRecord) => void;
  onDelete: (course: CourseRecord) => void;
}

export const AdminCoursesTab: React.FC<AdminCoursesTabProps> = ({
  courses,
  onCreate,
  onEdit,
  onTogglePublish,
  onDelete,
}) => {
  const { t, isRtl } = useApp();
  const [search, setSearch] = useState('');
  const [previewCourse, setPreviewCourse] = useState<CourseRecord | null>(null);

  const filteredCourses = courses.filter((c) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      c.nameEn.toLowerCase().includes(q) ||
      c.nameAr.includes(q) ||
      c.slug.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search
            className="w-4 h-4 absolute start-3 top-2.5 text-[var(--color-text-subtle)]"
            aria-hidden="true"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('adminSearchCourses')}
            aria-label={t('adminSearchCourses')}
            className="w-full ps-9 pe-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-solid)] text-xs text-[var(--color-text)] placeholder:text-[var(--color-text-subtle)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]"
          />
        </div>

        <button
          type="button"
          onClick={onCreate}
          className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[40px] rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-semibold cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
        >
          <Plus className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{t('adminActionCreate')}</span>
        </button>
      </div>

      <div className="space-y-3">
        {filteredCourses.length === 0 ? (
          <div className="na-mineral-card p-8 text-center rounded-xl text-xs text-[var(--color-text-muted)] font-mono">
            {t('adminEmptyCourses')}
          </div>
        ) : (
          filteredCourses.map((course) => (
            <div
              key={course.id}
              className="na-mineral-card na-mineral-card-interactive p-4 sm:p-5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                  <PublicationBadge status={course.publicationStatus} />
                  <span className="text-[var(--color-secondary)] tabular-nums">
                    #{String(course.latticeNodeIndex + 1).padStart(2, '0')}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="text-[var(--color-text-subtle)] uppercase">{course.category}</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-[var(--color-text-subtle)]">
                    {isRtl ? course.semesterAr : course.semesterEn}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-[var(--color-text)]">
                  {isRtl ? course.nameAr : course.nameEn}
                </h3>
                <p
                  className="text-xs text-[var(--color-text-muted)] font-mono"
                  dir={isRtl ? 'ltr' : 'rtl'}
                >
                  {isRtl ? course.nameEn : course.nameAr}
                </p>
              </div>

              <RecordActions
                publicationStatus={course.publicationStatus}
                publishLabel={t('adminActionPublish')}
                unpublishLabel={t('adminActionUnpublish')}
                editLabel={t('adminActionEdit')}
                deleteLabel={t('adminActionDelete')}
                previewLabel={t('adminActionPreview')}
                onPreview={() => setPreviewCourse(course)}
                onTogglePublish={() => onTogglePublish(course)}
                onEdit={() => onEdit(course)}
                onDelete={() => onDelete(course)}
              />
            </div>
          ))
        )}
      </div>

      <CourseDetailModal
        course={previewCourse}
        program={ACADEMIC_PROGRAM}
        onClose={() => setPreviewCourse(null)}
      />
    </div>
  );
};

