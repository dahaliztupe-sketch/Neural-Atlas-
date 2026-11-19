import React, { useState, useRef, lazy, Suspense } from 'react';
import { Clock, Edit3, Eye, X, AlertTriangle, ExternalLink } from 'lucide-react';
import { LearningNoteRecord } from '../../types';
import { useApp } from '../../context/AppContext';
import { computeReadingStats } from '../../lib/markdown';
import { sanitizeSlug } from '../../services/contentRepository';
import { ADMIN_INPUT_CLASS, ADMIN_LABEL_CLASS } from './AdminShared';
import { MarkdownEditorField } from './MarkdownEditorField';
import { useModalFocusTrap } from '../../hooks/useModalFocusTrap';

const LazyMarkdownRenderer = lazy(() =>
  import('../../components/MarkdownRenderer').then((m) => ({ default: m.MarkdownRenderer }))
);

interface AdminNoteModalProps {
  note: Partial<LearningNoteRecord>;
  existingSlugs?: string[];
  onChange: (next: Partial<LearningNoteRecord>) => void;
  onMarkDirty: () => void;
  onRequestClose: () => void;
  onOpenPublicPreview?: (slug: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const AdminNoteModal: React.FC<AdminNoteModalProps> = ({
  note,
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

  const resolvedSlug = sanitizeSlug(note.slug || note.titleEn || '');
  const hasSlugCollision = Boolean(!note.id && resolvedSlug && existingSlugs.includes(resolvedSlug));

  const seoPreviewTitle =
    previewLang === 'ar'
      ? note.seoTitleAr || `${note.titleAr || note.titleEn || 'Note'} · ${t('siteName')}`
      : note.seoTitleEn || `${note.titleEn || note.titleAr || 'Note'} · Neural Atlas`;
  const seoPreviewDescription =
    previewLang === 'ar'
      ? note.seoDescriptionAr || note.summaryAr || t('notesSubtitle')
      : note.seoDescriptionEn || note.summaryEn || t('notesSubtitle');

  const previewTitle =
    previewLang === 'ar'
      ? note.titleAr || note.titleEn || t('adminCreateNoteTitle')
      : note.titleEn || note.titleAr || t('adminCreateNoteTitle');
  const previewSummary =
    previewLang === 'ar'
      ? note.summaryAr || note.summaryEn || ''
      : note.summaryEn || note.summaryAr || '';
  const previewBody =
    previewLang === 'ar'
      ? note.contentAr || note.contentEn || ''
      : note.contentEn || note.contentAr || '';
  const stats = computeReadingStats(previewBody);

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
        aria-labelledby="note-modal-title"
        onClick={(e) => e.stopPropagation()}
        className="na-mineral-card w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl p-6 space-y-5 text-[var(--color-text)] shadow-2xl focus:outline-none"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[var(--color-border-subtle)]">
          <h2 id="note-modal-title" className="text-lg font-bold">
            {note.id ? t('adminEditNoteTitle') : t('adminCreateNoteTitle')}
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

            <article
              dir={previewLang === 'ar' ? 'rtl' : 'ltr'}
              className="na-mineral-card p-6 rounded-2xl space-y-4 text-start"
            >
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-[var(--color-secondary)]">
                <span>{note.slug || 'draft-slug'}</span>
                {stats.readingMinutes > 0 && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="inline-flex items-center gap-1 text-[var(--color-text-muted)] tabular-nums">
                      <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>
                        {stats.readingMinutes} {t('readingTimeSuffix')} · {stats.wordCount} {t('wordsCountLabel')}
                      </span>
                    </span>
                  </>
                )}
              </div>

              <h3 className="text-2xl font-bold text-[var(--color-text)]">{previewTitle}</h3>
              {previewSummary && (
                <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">{previewSummary}</p>
              )}

              <div className="pt-4 border-t border-[var(--color-border-subtle)]">
                {previewBody.trim() ? (
                  <Suspense fallback={<div className="text-xs text-[var(--color-text-muted)] whitespace-pre-wrap">{previewBody}</div>}>
                    <LazyMarkdownRenderer
                      content={previewBody}
                      showToc={true}
                      tocTitle={t('tocHeading')}
                      copyLabel={t('copyCodeBtn')}
                      copiedLabel={t('copiedCodeBtn')}
                    />
                  </Suspense>
                ) : (
                  <p className="text-xs text-[var(--color-text-subtle)] italic">{t('adminEditorPreviewEmpty')}</p>
                )}
              </div>
            </article>
          </div>
        ) : (
          <form onSubmit={onSubmit} onChange={onMarkDirty} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label htmlFor="note-title-en" className={ADMIN_LABEL_CLASS}>Title (English) *</label>
                <input
                  id="note-title-en"
                  type="text"
                  required
                  value={note.titleEn || ''}
                  onChange={(e) => onChange({ ...note, titleEn: e.target.value })}
                  className={ADMIN_INPUT_CLASS}
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="note-title-ar" className={ADMIN_LABEL_CLASS}>العنوان (العربية) *</label>
                <input
                  id="note-title-ar"
                  type="text"
                  required
                  dir="rtl"
                  value={note.titleAr || ''}
                  onChange={(e) => onChange({ ...note, titleAr: e.target.value })}
                  className={ADMIN_INPUT_CLASS}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label htmlFor="note-slug" className={ADMIN_LABEL_CLASS}>URL Slug</label>
                <input
                  id="note-slug"
                  type="text"
                  readOnly={Boolean(note.id)}
                  value={note.slug || ''}
                  onChange={(e) => onChange({ ...note, slug: e.target.value })}
                  placeholder="e.g. memory-management-in-cpp"
                  className={`${ADMIN_INPUT_CLASS} ${note.id ? 'opacity-60 cursor-not-allowed' : ''}`}
                />
                {hasSlugCollision && (
                  <p className="flex items-start gap-1 text-[11px] text-amber-400 pt-0.5">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" aria-hidden="true" />
                    <span>{t('adminSlugCollisionWarning')}</span>
                  </p>
                )}
              </div>
              <div className="space-y-1">
                <label htmlFor="note-topics" className={ADMIN_LABEL_CLASS}>Topic Labels (comma-separated)</label>
                <input
                  id="note-topics"
                  type="text"
                  value={note.topicLabels?.join(', ') || ''}
                  onChange={(e) =>
                    onChange({
                      ...note,
                      topicLabels: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                    })
                  }
                  placeholder="C++, Algorithms"
                  className={ADMIN_INPUT_CLASS}
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="note-pub-status" className={ADMIN_LABEL_CLASS}>Publication Status</label>
                <select
                  id="note-pub-status"
                  value={note.publicationStatus || 'draft'}
                  onChange={(e) => onChange({ ...note, publicationStatus: e.target.value as LearningNoteRecord['publicationStatus'] })}
                  className={`${ADMIN_INPUT_CLASS} font-semibold`}
                >
                  <option value="draft">{t('adminStatusDraft')}</option>
                  <option value="published">{t('adminStatusPublished')}</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label htmlFor="note-summary-en" className={ADMIN_LABEL_CLASS}>Summary (English)</label>
                <textarea
                  id="note-summary-en"
                  rows={2}
                  value={note.summaryEn || ''}
                  onChange={(e) => onChange({ ...note, summaryEn: e.target.value })}
                  className={ADMIN_INPUT_CLASS}
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="note-summary-ar" className={ADMIN_LABEL_CLASS}>الملخص (العربية)</label>
                <textarea
                  id="note-summary-ar"
                  rows={2}
                  dir="rtl"
                  value={note.summaryAr || ''}
                  onChange={(e) => onChange({ ...note, summaryAr: e.target.value })}
                  className={ADMIN_INPUT_CLASS}
                />
              </div>
            </div>

            <div className="space-y-4">
              <MarkdownEditorField
                id="note-content-en"
                label="Study Content (English · Markdown + Code)"
                dir="ltr"
                rows={8}
                value={note.contentEn || ''}
                onChange={(val) => {
                  onMarkDirty();
                  onChange({ ...note, contentEn: val });
                }}
                placeholder="Write study logs, ## headings, and ```cpp code blocks..."
              />
              <MarkdownEditorField
                id="note-content-ar"
                label="محتوى المذكرة (العربية · ماركداون + كود)"
                dir="rtl"
                rows={8}
                value={note.contentAr || ''}
                onChange={(val) => {
                  onMarkDirty();
                  onChange({ ...note, contentAr: val });
                }}
                placeholder="اكتب ملاحظاتك الدراسية مع عناوين ## ومقاطع الكود..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label htmlFor="note-seo-title-en" className={ADMIN_LABEL_CLASS}>SEO Title Override (EN)</label>
                <input
                  id="note-seo-title-en"
                  type="text"
                  value={note.seoTitleEn || ''}
                  onChange={(e) => onChange({ ...note, seoTitleEn: e.target.value })}
                  className={ADMIN_INPUT_CLASS}
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="note-seo-title-ar" className={ADMIN_LABEL_CLASS}>عنوان SEO (AR)</label>
                <input
                  id="note-seo-title-ar"
                  type="text"
                  dir="rtl"
                  value={note.seoTitleAr || ''}
                  onChange={(e) => onChange({ ...note, seoTitleAr: e.target.value })}
                  className={ADMIN_INPUT_CLASS}
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="note-seo-desc-en" className={ADMIN_LABEL_CLASS}>SEO Description (EN)</label>
                <input
                  id="note-seo-desc-en"
                  type="text"
                  value={note.seoDescriptionEn || ''}
                  onChange={(e) => onChange({ ...note, seoDescriptionEn: e.target.value })}
                  className={ADMIN_INPUT_CLASS}
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="note-seo-desc-ar" className={ADMIN_LABEL_CLASS}>وصف SEO (AR)</label>
                <input
                  id="note-seo-desc-ar"
                  type="text"
                  dir="rtl"
                  value={note.seoDescriptionAr || ''}
                  onChange={(e) => onChange({ ...note, seoDescriptionAr: e.target.value })}
                  className={ADMIN_INPUT_CLASS}
                />
              </div>
            </div>

            {/* Live Search Snippet Preview */}
            <div className="p-4 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface-solid)] space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-mono text-[var(--color-text-subtle)]">
                <span>{t('adminSeoSnippetLabel')} ({previewLang.toUpperCase()})</span>
                <span>/notes/{resolvedSlug || 'note-slug'}</span>
              </div>
              <p className="text-sm font-semibold text-[var(--color-primary)] truncate">
                {seoPreviewTitle}
              </p>
              <p className="text-xs text-[var(--color-text-muted)] line-clamp-2 leading-relaxed">
                {seoPreviewDescription}
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
                    disabled={!note.id}
                    onClick={() => note.id && onOpenPublicPreview(note.slug || note.id)}
                    title={!note.id ? t('adminOpenPublicPreviewHint') : t('adminOpenPublicPreview')}
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

export default AdminNoteModal;
