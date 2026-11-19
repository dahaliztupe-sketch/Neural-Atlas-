import React, { useState, useRef, lazy, Suspense } from 'react';
import { Eye, Edit3, X, AlertTriangle, ExternalLink } from 'lucide-react';
import { ProjectRecord } from '../../types';
import { useApp } from '../../context/AppContext';
import { isValidUrl, sanitizeSlug } from '../../services/contentRepository';
import { OptimizedImage } from '../../components/OptimizedImage';
import { ADMIN_INPUT_CLASS, ADMIN_LABEL_CLASS } from './AdminShared';
import { MarkdownEditorField } from './MarkdownEditorField';
import { useModalFocusTrap } from '../../hooks/useModalFocusTrap';

const LazyMarkdownRenderer = lazy(() =>
  import('../../components/MarkdownRenderer').then((m) => ({ default: m.MarkdownRenderer }))
);

interface AdminProjectModalProps {
  project: Partial<ProjectRecord>;
  existingSlugs?: string[];
  onChange: (next: Partial<ProjectRecord>) => void;
  onMarkDirty: () => void;
  onRequestClose: () => void;
  onOpenPublicPreview?: (slug: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const AdminProjectModal: React.FC<AdminProjectModalProps> = ({
  project,
  existingSlugs = [],
  onChange,
  onMarkDirty,
  onRequestClose,
  onOpenPublicPreview,
  onSubmit,
}) => {
  const { t, isRtl } = useApp();
  const [modalView, setModalView] = useState<'edit' | 'preview'>('edit');
  const [previewLang, setPreviewLang] = useState<'en' | 'ar'>(isRtl ? 'ar' : 'en');
  const dialogRef = useRef<HTMLDivElement>(null);

  useModalFocusTrap(dialogRef, true);

  const resolvedSlug = sanitizeSlug(project.slug || project.titleEn || '');
  const hasSlugCollision = Boolean(!project.id && resolvedSlug && existingSlugs.includes(resolvedSlug));

  const seoPreviewTitle =
    previewLang === 'ar'
      ? project.seoTitleAr || `${project.titleAr || project.titleEn || 'Project'} · ${t('siteName')}`
      : project.seoTitleEn || `${project.titleEn || project.titleAr || 'Project'} · Neural Atlas`;
  const seoPreviewDescription =
    previewLang === 'ar'
      ? project.seoDescriptionAr || project.summaryAr || project.descriptionAr || ''
      : project.seoDescriptionEn || project.summaryEn || project.descriptionEn || '';

  const previewTitle =
    previewLang === 'ar'
      ? project.titleAr || project.titleEn || t('adminCreateProjectTitle')
      : project.titleEn || project.titleAr || t('adminCreateProjectTitle');
  const previewDesc =
    previewLang === 'ar'
      ? project.descriptionAr || project.descriptionEn || ''
      : project.descriptionEn || project.descriptionAr || '';
  const previewStatus =
    previewLang === 'ar'
      ? project.statusAr || t('statusFallbackActive')
      : project.statusEn || t('statusFallbackActive');

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
        aria-labelledby="project-modal-title"
        onClick={(e) => e.stopPropagation()}
        className="na-mineral-card w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl p-6 space-y-5 text-[var(--color-text)] shadow-2xl focus:outline-none"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[var(--color-border-subtle)]">
          <h2 id="project-modal-title" className="text-lg font-bold">
            {project.id ? t('adminEditProjectTitle') : t('adminCreateProjectTitle')}
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
                {t('adminEditorLiveCardTab')}
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
              className="na-mineral-card rounded-2xl p-6 space-y-4 text-start"
            >
              {project.coverImageUrl && isValidUrl(project.coverImageUrl) && (
                <OptimizedImage
                  src={project.coverImageUrl}
                  alt={
                    previewLang === 'ar'
                      ? project.coverImageAltAr || project.coverImageAltEn || previewTitle
                      : project.coverImageAltEn || project.coverImageAltAr || previewTitle
                  }
                  fallbackTitle={previewTitle}
                  aspectRatio="16/9"
                />
              )}
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[var(--color-secondary)] font-semibold">{previewStatus}</span>
                <span className="text-[var(--color-text-subtle)] uppercase">{project.statusType || 'practicing'}</span>
              </div>
              <h3 className="text-xl font-bold text-[var(--color-text)]">{previewTitle}</h3>
              {previewDesc.trim() ? (
                <Suspense fallback={<p className="text-xs text-[var(--color-text-muted)]">{previewDesc}</p>}>
                  <LazyMarkdownRenderer
                    content={previewDesc}
                    showToc={false}
                    copyLabel={t('copyCodeBtn')}
                    copiedLabel={t('copiedCodeBtn')}
                  />
                </Suspense>
              ) : (
                <p className="text-xs text-[var(--color-text-subtle)] italic">{t('adminEditorPreviewEmpty')}</p>
              )}
              {project.technologies && project.technologies.length > 0 && (
                <div className="pt-3 border-t border-[var(--color-border-subtle)] flex flex-wrap gap-2 text-xs font-mono text-[var(--color-text-muted)]">
                  {project.technologies.join(' · ')}
                </div>
              )}
            </div>
          </div>
        ) : (
          <form
            onSubmit={onSubmit}
            onChange={onMarkDirty}
            className="space-y-4 text-xs"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label htmlFor="proj-title-en" className={ADMIN_LABEL_CLASS}>Title (English) *</label>
                <input
                  id="proj-title-en"
                  type="text"
                  required
                  value={project.titleEn || ''}
                  onChange={(e) => onChange({ ...project, titleEn: e.target.value })}
                  className={ADMIN_INPUT_CLASS}
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="proj-title-ar" className={ADMIN_LABEL_CLASS}>العنوان (العربية) *</label>
                <input
                  id="proj-title-ar"
                  type="text"
                  required
                  dir="rtl"
                  value={project.titleAr || ''}
                  onChange={(e) => onChange({ ...project, titleAr: e.target.value })}
                  className={ADMIN_INPUT_CLASS}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label htmlFor="proj-slug" className={ADMIN_LABEL_CLASS}>URL Slug</label>
                <input
                  id="proj-slug"
                  type="text"
                  readOnly={Boolean(project.id)}
                  value={project.slug || ''}
                  onChange={(e) => onChange({ ...project, slug: e.target.value })}
                  placeholder="e.g. cpp-problem-solving"
                  className={`${ADMIN_INPUT_CLASS} ${project.id ? 'opacity-60 cursor-not-allowed' : ''}`}
                />
                {hasSlugCollision && (
                  <p className="flex items-start gap-1 text-[11px] text-amber-400 pt-0.5">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" aria-hidden="true" />
                    <span>{t('adminSlugCollisionWarning')}</span>
                  </p>
                )}
              </div>
              <div className="space-y-1">
                <label htmlFor="proj-status-type" className={ADMIN_LABEL_CLASS}>Status Type</label>
                <select
                  id="proj-status-type"
                  value={project.statusType || 'practicing'}
                  onChange={(e) => onChange({ ...project, statusType: e.target.value as ProjectRecord['statusType'] })}
                  className={ADMIN_INPUT_CLASS}
                >
                  <option value="practicing">{t('statusPracticing')}</option>
                  <option value="in_development">{t('statusInDevelopment')}</option>
                  <option value="completed">{t('statusCompleted')}</option>
                  <option value="experimental">Experimental</option>
                  <option value="paused">Paused</option>
                  <option value="discontinued">Discontinued</option>
                  <option value="archived">Archived</option>
                  <option value="needs_confirmation">Needs Confirmation</option>
                </select>
              </div>
              <div className="space-y-1">
                <label htmlFor="proj-pub-status" className={ADMIN_LABEL_CLASS}>Publication Status</label>
                <select
                  id="proj-pub-status"
                  value={project.publicationStatus || 'draft'}
                  onChange={(e) => onChange({ ...project, publicationStatus: e.target.value as ProjectRecord['publicationStatus'] })}
                  className={`${ADMIN_INPUT_CLASS} font-semibold`}
                >
                  <option value="draft">{t('adminStatusDraft')}</option>
                  <option value="published">{t('adminStatusPublished')}</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-3.5 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface-solid)]">
              <div className="space-y-1">
                <label htmlFor="proj-visibility" className={ADMIN_LABEL_CLASS}>Visibility (Security Boundary)</label>
                <select
                  id="proj-visibility"
                  value={project.visibility || 'internal_archive'}
                  onChange={(e) =>
                    onChange({ ...project, visibility: e.target.value as ProjectRecord['visibility'] })
                  }
                  className={ADMIN_INPUT_CLASS}
                >
                  <option value="public">public (Visible when published)</option>
                  <option value="internal_archive">internal_archive (Owner-only)</option>
                </select>
              </div>
              <div className="space-y-1">
                <label htmlFor="proj-archive-group" className={ADMIN_LABEL_CLASS}>Portfolio Section Group</label>
                <select
                  id="proj-archive-group"
                  value={project.archiveGroup || 'showcase'}
                  onChange={(e) =>
                    onChange({ ...project, archiveGroup: e.target.value as ProjectRecord['archiveGroup'] })
                  }
                  className={ADMIN_INPUT_CLASS}
                >
                  <option value="showcase">Showcase / Active Practice</option>
                  <option value="experiments_discontinued">Experiments & Discontinued Archive</option>
                </select>
              </div>
              <div className="flex items-end pb-2">
                <label className="inline-flex items-center gap-2 cursor-pointer text-xs text-[var(--color-text)]">
                  <input
                    id="proj-featured-home"
                    type="checkbox"
                    checked={Boolean(project.featuredOnHome)}
                    onChange={(e) => onChange({ ...project, featuredOnHome: e.target.checked })}
                  />
                  <span>Feature on Home Page</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label htmlFor="proj-status-en" className={ADMIN_LABEL_CLASS}>Status Label (English)</label>
                <input
                  id="proj-status-en"
                  type="text"
                  value={project.statusEn || ''}
                  onChange={(e) => onChange({ ...project, statusEn: e.target.value })}
                  className={ADMIN_INPUT_CLASS}
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="proj-status-ar" className={ADMIN_LABEL_CLASS}>تسمية الحالة (العربية)</label>
                <input
                  id="proj-status-ar"
                  type="text"
                  dir="rtl"
                  value={project.statusAr || ''}
                  onChange={(e) => onChange({ ...project, statusAr: e.target.value })}
                  className={ADMIN_INPUT_CLASS}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label htmlFor="proj-summary-en" className={ADMIN_LABEL_CLASS}>Card Summary (English)</label>
                <textarea
                  id="proj-summary-en"
                  rows={2}
                  value={project.summaryEn || ''}
                  onChange={(e) => onChange({ ...project, summaryEn: e.target.value })}
                  className={ADMIN_INPUT_CLASS}
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="proj-summary-ar" className={ADMIN_LABEL_CLASS}>ملخص البطاقة (العربية)</label>
                <textarea
                  id="proj-summary-ar"
                  rows={2}
                  dir="rtl"
                  value={project.summaryAr || ''}
                  onChange={(e) => onChange({ ...project, summaryAr: e.target.value })}
                  className={ADMIN_INPUT_CLASS}
                />
              </div>
            </div>

            <div className="space-y-4">
              <MarkdownEditorField
                id="proj-desc-en"
                label="Description (English · Markdown supported)"
                dir="ltr"
                rows={4}
                value={project.descriptionEn || ''}
                onChange={(val) => {
                  onMarkDirty();
                  onChange({ ...project, descriptionEn: val });
                }}
              />
              <MarkdownEditorField
                id="proj-desc-ar"
                label="الوصف (العربية · يدعم ماركداون)"
                dir="rtl"
                rows={4}
                value={project.descriptionAr || ''}
                onChange={(val) => {
                  onMarkDirty();
                  onChange({ ...project, descriptionAr: val });
                }}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label htmlFor="proj-overview-en" className={ADMIN_LABEL_CLASS}>Key Points (English, one per line)</label>
                <textarea
                  id="proj-overview-en"
                  rows={3}
                  value={project.fullOverviewEn?.join('\n') || ''}
                  onChange={(e) =>
                    onChange({
                      ...project,
                      fullOverviewEn: e.target.value.split('\n').map((s) => s.trim()).filter(Boolean),
                    })
                  }
                  className={ADMIN_INPUT_CLASS}
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="proj-overview-ar" className={ADMIN_LABEL_CLASS}>النقاط التفصيلية (العربية، سطر لكل نقطة)</label>
                <textarea
                  id="proj-overview-ar"
                  rows={3}
                  dir="rtl"
                  value={project.fullOverviewAr?.join('\n') || ''}
                  onChange={(e) =>
                    onChange({
                      ...project,
                      fullOverviewAr: e.target.value.split('\n').map((s) => s.trim()).filter(Boolean),
                    })
                  }
                  className={ADMIN_INPUT_CLASS}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="proj-tech" className={ADMIN_LABEL_CLASS}>Technologies (comma-separated)</label>
              <input
                id="proj-tech"
                type="text"
                value={project.technologies?.join(', ') || ''}
                onChange={(e) =>
                  onChange({
                    ...project,
                    technologies: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                  })
                }
                placeholder="C++, Data Structures, Algorithms"
                className={ADMIN_INPUT_CLASS}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label htmlFor="proj-repo-url" className={ADMIN_LABEL_CLASS}>Repository URL (optional)</label>
                <input
                  id="proj-repo-url"
                  type="url"
                  value={project.repoUrl || ''}
                  onChange={(e) => onChange({ ...project, repoUrl: e.target.value })}
                  className={ADMIN_INPUT_CLASS}
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="proj-demo-url" className={ADMIN_LABEL_CLASS}>Live Demo URL (optional)</label>
                <input
                  id="proj-demo-url"
                  type="url"
                  value={project.url || ''}
                  onChange={(e) => onChange({ ...project, url: e.target.value })}
                  className={ADMIN_INPUT_CLASS}
                />
              </div>
            </div>

            {/* Cover Image & Alt Text */}
            <div className="p-4 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface-solid)] space-y-3">
              <p className="text-[11px] font-mono text-[var(--color-text-subtle)]">
                {t('adminCoverImageNote')}
              </p>
              <div className="space-y-1">
                <label htmlFor="proj-cover-url" className={ADMIN_LABEL_CLASS}>Cover Image URL (optional)</label>
                <input
                  id="proj-cover-url"
                  type="url"
                  placeholder="https://..."
                  value={project.coverImageUrl || ''}
                  onChange={(e) => onChange({ ...project, coverImageUrl: e.target.value })}
                  className={ADMIN_INPUT_CLASS}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label htmlFor="proj-cover-alt-en" className={ADMIN_LABEL_CLASS}>Cover Alt Text (English)</label>
                  <input
                    id="proj-cover-alt-en"
                    type="text"
                    value={project.coverImageAltEn || ''}
                    onChange={(e) => onChange({ ...project, coverImageAltEn: e.target.value })}
                    className={ADMIN_INPUT_CLASS}
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="proj-cover-alt-ar" className={ADMIN_LABEL_CLASS}>النص البديل للصورة (العربية)</label>
                  <input
                    id="proj-cover-alt-ar"
                    type="text"
                    dir="rtl"
                    value={project.coverImageAltAr || ''}
                    onChange={(e) => onChange({ ...project, coverImageAltAr: e.target.value })}
                    className={ADMIN_INPUT_CLASS}
                  />
                </div>
              </div>
            </div>

            {/* Structured Case-Study Evidence */}
            <div className="p-4 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface-solid)] space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label htmlFor="proj-role-en" className={ADMIN_LABEL_CLASS}>Role & Scope (EN)</label>
                  <input
                    id="proj-role-en"
                    type="text"
                    value={project.roleEn || ''}
                    onChange={(e) => onChange({ ...project, roleEn: e.target.value })}
                    className={ADMIN_INPUT_CLASS}
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="proj-role-ar" className={ADMIN_LABEL_CLASS}>الدور والنطاق (AR)</label>
                  <input
                    id="proj-role-ar"
                    type="text"
                    dir="rtl"
                    value={project.roleAr || ''}
                    onChange={(e) => onChange({ ...project, roleAr: e.target.value })}
                    className={ADMIN_INPUT_CLASS}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label htmlFor="proj-problem-en" className={ADMIN_LABEL_CLASS}>Problem / Question (EN)</label>
                  <textarea
                    id="proj-problem-en"
                    rows={2}
                    value={project.problemEn || ''}
                    onChange={(e) => onChange({ ...project, problemEn: e.target.value })}
                    className={ADMIN_INPUT_CLASS}
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="proj-problem-ar" className={ADMIN_LABEL_CLASS}>الإشكالية (AR)</label>
                  <textarea
                    id="proj-problem-ar"
                    rows={2}
                    dir="rtl"
                    value={project.problemAr || ''}
                    onChange={(e) => onChange({ ...project, problemAr: e.target.value })}
                    className={ADMIN_INPUT_CLASS}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label htmlFor="proj-approach-en" className={ADMIN_LABEL_CLASS}>Approach (EN)</label>
                  <textarea
                    id="proj-approach-en"
                    rows={2}
                    value={project.approachEn || ''}
                    onChange={(e) => onChange({ ...project, approachEn: e.target.value })}
                    className={ADMIN_INPUT_CLASS}
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="proj-approach-ar" className={ADMIN_LABEL_CLASS}>النهج (AR)</label>
                  <textarea
                    id="proj-approach-ar"
                    rows={2}
                    dir="rtl"
                    value={project.approachAr || ''}
                    onChange={(e) => onChange({ ...project, approachAr: e.target.value })}
                    className={ADMIN_INPUT_CLASS}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label htmlFor="proj-outcome-en" className={ADMIN_LABEL_CLASS}>Outcome / Status (EN)</label>
                  <textarea
                    id="proj-outcome-en"
                    rows={2}
                    value={project.outcomeEn || ''}
                    onChange={(e) => onChange({ ...project, outcomeEn: e.target.value })}
                    className={ADMIN_INPUT_CLASS}
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="proj-outcome-ar" className={ADMIN_LABEL_CLASS}>النتيجة / الوضع (AR)</label>
                  <textarea
                    id="proj-outcome-ar"
                    rows={2}
                    dir="rtl"
                    value={project.outcomeAr || ''}
                    onChange={(e) => onChange({ ...project, outcomeAr: e.target.value })}
                    className={ADMIN_INPUT_CLASS}
                  />
                </div>
              </div>
            </div>

            {/* SEO Metadata Overrides */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label htmlFor="proj-seo-title-en" className={ADMIN_LABEL_CLASS}>SEO Title Override (EN)</label>
                <input
                  id="proj-seo-title-en"
                  type="text"
                  value={project.seoTitleEn || ''}
                  onChange={(e) => onChange({ ...project, seoTitleEn: e.target.value })}
                  className={ADMIN_INPUT_CLASS}
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="proj-seo-title-ar" className={ADMIN_LABEL_CLASS}>عنوان SEO (AR)</label>
                <input
                  id="proj-seo-title-ar"
                  type="text"
                  dir="rtl"
                  value={project.seoTitleAr || ''}
                  onChange={(e) => onChange({ ...project, seoTitleAr: e.target.value })}
                  className={ADMIN_INPUT_CLASS}
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="proj-seo-desc-en" className={ADMIN_LABEL_CLASS}>SEO Description (EN)</label>
                <input
                  id="proj-seo-desc-en"
                  type="text"
                  value={project.seoDescriptionEn || ''}
                  onChange={(e) => onChange({ ...project, seoDescriptionEn: e.target.value })}
                  className={ADMIN_INPUT_CLASS}
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="proj-seo-desc-ar" className={ADMIN_LABEL_CLASS}>وصف SEO (AR)</label>
                <input
                  id="proj-seo-desc-ar"
                  type="text"
                  dir="rtl"
                  value={project.seoDescriptionAr || ''}
                  onChange={(e) => onChange({ ...project, seoDescriptionAr: e.target.value })}
                  className={ADMIN_INPUT_CLASS}
                />
              </div>
            </div>

            {/* Live Search Snippet Preview */}
            <div className="p-4 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface-solid)] space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-mono text-[var(--color-text-subtle)]">
                <span>{t('adminSeoSnippetLabel')} ({previewLang.toUpperCase()})</span>
                <span>/projects/{resolvedSlug || 'project-slug'}</span>
              </div>
              <p className="text-sm font-semibold text-[var(--color-primary)] truncate">
                {seoPreviewTitle}
              </p>
              <p className="text-xs text-[var(--color-text-muted)] line-clamp-2 leading-relaxed">
                {seoPreviewDescription || t('adminEditorPreviewEmpty')}
              </p>
            </div>

            <p className="text-[11px] font-mono text-[var(--color-text-subtle)]">
              {t('adminPublishRequirementNote')}
            </p>

            <div className="pt-4 border-t border-[var(--color-border-subtle)] flex flex-wrap items-center justify-between gap-3">
              <div>
                {onOpenPublicPreview && (
                  <button
                    type="button"
                    disabled={!project.id}
                    onClick={() => project.id && onOpenPublicPreview(project.slug || project.id)}
                    title={!project.id ? t('adminOpenPublicPreviewHint') : t('adminOpenPublicPreview')}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-solid)] hover:border-[var(--color-secondary)] text-xs font-mono disabled:opacity-45 cursor-pointer disabled:cursor-not-allowed"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-[var(--color-secondary)]" aria-hidden="true" />
                    <span>{t('adminOpenPublicPreview')}</span>
                  </button>
                )}
              </div>
              <div className="flex items-center gap-3">
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
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AdminProjectModal;
