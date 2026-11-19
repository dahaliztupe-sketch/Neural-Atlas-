import React, { useState, useRef } from 'react';
import { X, Edit3, Eye, AlertTriangle } from 'lucide-react';
import { CourseRecord } from '../../types';
import { useApp } from '../../context/AppContext';
import { sanitizeSlug } from '../../services/contentRepository';
import { ADMIN_INPUT_CLASS, ADMIN_LABEL_CLASS } from './AdminShared';
import { useModalFocusTrap } from '../../hooks/useModalFocusTrap';

interface AdminCourseModalProps {
  course: Partial<CourseRecord>;
  existingSlugs?: string[];
  onChange: (next: Partial<CourseRecord>) => void;
  onMarkDirty: () => void;
  onRequestClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const AdminCourseModal: React.FC<AdminCourseModalProps> = ({
  course,
  existingSlugs = [],
  onChange,
  onMarkDirty,
  onRequestClose,
  onSubmit,
}) => {
  const { t, isRtl } = useApp();
  const [modalView, setModalView] = useState<'edit' | 'preview'>('edit');
  const [previewLang, setPreviewLang] = useState<'en' | 'ar'>(isRtl ? 'ar' : 'en');
  const dialogRef = useRef<HTMLDivElement>(null);

  useModalFocusTrap(dialogRef, true);

  const resolvedSlug = sanitizeSlug(course.slug || course.nameEn || '');
  const hasSlugCollision = Boolean(!course.id && resolvedSlug && existingSlugs.includes(resolvedSlug));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75"
      onClick={onRequestClose}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="course-modal-title"
        onClick={(e) => e.stopPropagation()}
        className="na-mineral-card w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl p-6 space-y-5 text-[var(--color-text)] shadow-2xl focus:outline-none"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[var(--color-border-subtle)]">
          <h2 id="course-modal-title" className="text-lg font-bold">
            {course.id ? t('adminEditCourseTitle') : t('adminCreateCourseTitle')}
          </h2>

          <div className="flex items-center gap-2">
            <div className="inline-flex items-center rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-solid)] p-0.5 text-[11px] font-mono">
              <button
                type="button"
                onClick={() => setModalView('edit')}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg cursor-pointer ${
                  modalView === 'edit' ? 'bg-[var(--color-primary)] text-white font-semibold' : 'text-[var(--color-text-muted)]'
                }`}
              >
                <Edit3 className="w-3 h-3" aria-hidden="true" />
                <span>{t('adminActionEdit')}</span>
              </button>
              <button
                type="button"
                onClick={() => setModalView('preview')}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg cursor-pointer ${
                  modalView === 'preview' ? 'bg-[var(--color-primary)] text-white font-semibold' : 'text-[var(--color-text-muted)]'
                }`}
              >
                <Eye className="w-3 h-3" aria-hidden="true" />
                <span>{t('adminEditorLiveCardTab')}</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onRequestClose}
              className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text)] cursor-pointer"
              aria-label={t('closeModal')}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {modalView === 'preview' ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-[var(--color-text-subtle)]">
                {t('adminPreviewCourseHeading')}
              </span>
              <div className="inline-flex items-center rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-solid)] p-0.5 text-[11px] font-mono">
                <button
                  type="button"
                  onClick={() => setPreviewLang('en')}
                  className={`px-2.5 py-1 rounded-lg cursor-pointer ${
                    previewLang === 'en' ? 'bg-[var(--color-primary)] text-white font-semibold' : 'text-[var(--color-text-muted)]'
                  }`}
                >
                  EN
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewLang('ar')}
                  className={`px-2.5 py-1 rounded-lg cursor-pointer ${
                    previewLang === 'ar' ? 'bg-[var(--color-primary)] text-white font-semibold' : 'text-[var(--color-text-muted)]'
                  }`}
                >
                  AR
                </button>
              </div>
            </div>

            <div
              dir={previewLang === 'ar' ? 'rtl' : 'ltr'}
              className="na-mineral-card p-6 rounded-2xl space-y-3 text-start"
            >
              <div className="flex items-center justify-between text-xs font-mono text-[var(--color-secondary)]">
                <span>
                  #{String((course.latticeNodeIndex ?? 0) + 1).padStart(2, '0')} ·{' '}
                  {previewLang === 'ar' ? course.semesterAr || 'الفصل الأول' : course.semesterEn || 'First Semester'}
                </span>
                <span className="uppercase text-[var(--color-text-subtle)]">{course.category || 'computational'}</span>
              </div>
              <h3 className="text-xl font-bold text-[var(--color-text)]">
                {previewLang === 'ar'
                  ? course.nameAr || course.nameEn || t('adminCreateCourseTitle')
                  : course.nameEn || course.nameAr || t('adminCreateCourseTitle')}
              </h3>
              <p className="text-xs font-mono text-[var(--color-text-subtle)]">
                {previewLang === 'ar' ? course.yearAr : course.yearEn}
              </p>
              {(course.descriptionEn || course.descriptionAr) && (
                <p className="pt-2 border-t border-[var(--color-border-subtle)] text-xs text-[var(--color-text-muted)] leading-relaxed">
                  {previewLang === 'ar'
                    ? course.descriptionAr || course.descriptionEn
                    : course.descriptionEn || course.descriptionAr}
                </p>
              )}
            </div>
          </div>
        ) : (
          <form onSubmit={onSubmit} onChange={onMarkDirty} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label htmlFor="course-name-en" className={ADMIN_LABEL_CLASS}>Course Name (English) *</label>
                <input
                  id="course-name-en"
                  type="text"
                  required
                  value={course.nameEn || ''}
                  onChange={(e) => onChange({ ...course, nameEn: e.target.value })}
                  className={ADMIN_INPUT_CLASS}
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="course-name-ar" className={ADMIN_LABEL_CLASS}>اسم المقرر (العربية) *</label>
                <input
                  id="course-name-ar"
                  type="text"
                  required
                  dir="rtl"
                  value={course.nameAr || ''}
                  onChange={(e) => onChange({ ...course, nameAr: e.target.value })}
                  className={ADMIN_INPUT_CLASS}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label htmlFor="course-slug" className={ADMIN_LABEL_CLASS}>Slug ID</label>
                <input
                  id="course-slug"
                  type="text"
                  readOnly={Boolean(course.id)}
                  value={course.slug || ''}
                  onChange={(e) => onChange({ ...course, slug: e.target.value })}
                  placeholder="e.g. sem1-intro-ai"
                  className={`${ADMIN_INPUT_CLASS} ${course.id ? 'opacity-60 cursor-not-allowed' : ''}`}
                />
                {hasSlugCollision && (
                  <p className="flex items-start gap-1 text-[11px] text-amber-400 pt-0.5">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" aria-hidden="true" />
                    <span>{t('adminSlugCollisionWarning')}</span>
                  </p>
                )}
              </div>
              <div className="space-y-1">
                <label htmlFor="course-category" className={ADMIN_LABEL_CLASS}>Category</label>
                <select
                  id="course-category"
                  value={course.category || 'computational'}
                  onChange={(e) => onChange({ ...course, category: e.target.value as CourseRecord['category'] })}
                  className={ADMIN_INPUT_CLASS}
                >
                  <option value="computational">{t('filterComputational')}</option>
                  <option value="mathematical">{t('filterMathematical')}</option>
                  <option value="humanities">{t('filterHumanities')}</option>
                </select>
              </div>
              <div className="space-y-1">
                <label htmlFor="course-node-index" className={ADMIN_LABEL_CLASS}>Order Index</label>
                <input
                  id="course-node-index"
                  type="number"
                  min={0}
                  max={100}
                  value={course.latticeNodeIndex ?? 0}
                  onChange={(e) => onChange({ ...course, latticeNodeIndex: Number(e.target.value) })}
                  className={`${ADMIN_INPUT_CLASS} tabular-nums`}
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="course-pub-status" className={ADMIN_LABEL_CLASS}>Publication</label>
                <select
                  id="course-pub-status"
                  value={course.publicationStatus || 'draft'}
                  onChange={(e) => onChange({ ...course, publicationStatus: e.target.value as CourseRecord['publicationStatus'] })}
                  className={`${ADMIN_INPUT_CLASS} font-semibold`}
                >
                  <option value="draft">{t('adminStatusDraft')}</option>
                  <option value="published">{t('adminStatusPublished')}</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label htmlFor="course-semester-en" className={ADMIN_LABEL_CLASS}>Semester (English) *</label>
                <input
                  id="course-semester-en"
                  type="text"
                  required
                  value={course.semesterEn || ''}
                  onChange={(e) => onChange({ ...course, semesterEn: e.target.value })}
                  className={ADMIN_INPUT_CLASS}
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="course-semester-ar" className={ADMIN_LABEL_CLASS}>الفصل الدراسي (العربية) *</label>
                <input
                  id="course-semester-ar"
                  type="text"
                  required
                  dir="rtl"
                  value={course.semesterAr || ''}
                  onChange={(e) => onChange({ ...course, semesterAr: e.target.value })}
                  className={ADMIN_INPUT_CLASS}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label htmlFor="course-year-en" className={ADMIN_LABEL_CLASS}>Academic Year (English) *</label>
                <input
                  id="course-year-en"
                  type="text"
                  required
                  value={course.yearEn || ''}
                  onChange={(e) => onChange({ ...course, yearEn: e.target.value })}
                  className={ADMIN_INPUT_CLASS}
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="course-year-ar" className={ADMIN_LABEL_CLASS}>السنة الدراسية (العربية) *</label>
                <input
                  id="course-year-ar"
                  type="text"
                  required
                  dir="rtl"
                  value={course.yearAr || ''}
                  onChange={(e) => onChange({ ...course, yearAr: e.target.value })}
                  className={ADMIN_INPUT_CLASS}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label htmlFor="course-term-tag" className={ADMIN_LABEL_CLASS}>Term Archive Tag</label>
                <input
                  id="course-term-tag"
                  type="text"
                  value={course.termTag || ''}
                  onChange={(e) => onChange({ ...course, termTag: e.target.value })}
                  placeholder="semester-1-archive"
                  className={ADMIN_INPUT_CLASS}
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="course-verification" className={ADMIN_LABEL_CLASS}>Syllabus Verification Status</label>
                <select
                  id="course-verification"
                  value={course.verificationStatus || 'unverified-syllabus'}
                  onChange={(e) =>
                    onChange({
                      ...course,
                      verificationStatus: e.target.value as CourseRecord['verificationStatus'],
                    })
                  }
                  className={ADMIN_INPUT_CLASS}
                >
                  <option value="unverified-syllabus">unverified-syllabus</option>
                  <option value="verified">verified</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label htmlFor="course-desc-en" className={ADMIN_LABEL_CLASS}>Syllabus Notes (Optional EN)</label>
                <textarea
                  id="course-desc-en"
                  rows={3}
                  value={course.descriptionEn || ''}
                  onChange={(e) => onChange({ ...course, descriptionEn: e.target.value })}
                  className={ADMIN_INPUT_CLASS}
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="course-desc-ar" className={ADMIN_LABEL_CLASS}>ملاحظات المقرر (اختياري AR)</label>
                <textarea
                  id="course-desc-ar"
                  rows={3}
                  dir="rtl"
                  value={course.descriptionAr || ''}
                  onChange={(e) => onChange({ ...course, descriptionAr: e.target.value })}
                  className={ADMIN_INPUT_CLASS}
                />
              </div>
            </div>

            <div className="pt-4 border-t border-[var(--color-border-subtle)] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onRequestClose}
                className="px-4 py-2 rounded-xl border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] cursor-pointer"
              >
                {t('adminActionCancel')}
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-semibold cursor-pointer"
              >
                {t('adminActionSave')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AdminCourseModal;

