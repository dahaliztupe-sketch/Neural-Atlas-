import React, { useState, useRef } from 'react';
import { X, Edit3, Eye } from 'lucide-react';
import { MilestoneRecord } from '../../types';
import { useApp } from '../../context/AppContext';
import { ADMIN_INPUT_CLASS, ADMIN_LABEL_CLASS } from './AdminShared';
import { useModalFocusTrap } from '../../hooks/useModalFocusTrap';

interface AdminMilestoneModalProps {
  milestone: Partial<MilestoneRecord>;
  onChange: (next: Partial<MilestoneRecord>) => void;
  onMarkDirty: () => void;
  onRequestClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const AdminMilestoneModal: React.FC<AdminMilestoneModalProps> = ({
  milestone,
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
        aria-labelledby="milestone-modal-title"
        onClick={(e) => e.stopPropagation()}
        className="na-mineral-card w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl p-6 space-y-5 text-[var(--color-text)] shadow-2xl focus:outline-none"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[var(--color-border-subtle)]">
          <h2 id="milestone-modal-title" className="text-lg font-bold">
            {milestone.id ? t('adminEditMilestoneTitle') : t('adminCreateMilestoneTitle')}
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
                {t('adminPreviewMilestoneHeading')}
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
              className="na-mineral-card p-5 rounded-xl space-y-2 text-start"
            >
              <div className="flex items-center justify-between text-xs font-mono text-[var(--color-secondary)]">
                <span>
                  {previewLang === 'ar'
                    ? milestone.dateAr || milestone.dateEn || '—'
                    : milestone.dateEn || milestone.dateAr || '—'}
                </span>
                <span className="uppercase text-[var(--color-text-subtle)]">
                  {milestone.category || 'academic'}
                </span>
              </div>
              <h3 className="text-base font-semibold text-[var(--color-text)]">
                {previewLang === 'ar'
                  ? milestone.titleAr || milestone.titleEn || t('adminCreateMilestoneTitle')
                  : milestone.titleEn || milestone.titleAr || t('adminCreateMilestoneTitle')}
              </h3>
              <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                {previewLang === 'ar'
                  ? milestone.descriptionAr || milestone.descriptionEn || t('adminEditorPreviewEmpty')
                  : milestone.descriptionEn || milestone.descriptionAr || t('adminEditorPreviewEmpty')}
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={onSubmit} onChange={onMarkDirty} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label htmlFor="mile-title-en" className={ADMIN_LABEL_CLASS}>Title (English) *</label>
                <input
                  id="mile-title-en"
                  type="text"
                  required
                  value={milestone.titleEn || ''}
                  onChange={(e) => onChange({ ...milestone, titleEn: e.target.value })}
                  className={ADMIN_INPUT_CLASS}
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="mile-title-ar" className={ADMIN_LABEL_CLASS}>العنوان (العربية) *</label>
                <input
                  id="mile-title-ar"
                  type="text"
                  required
                  dir="rtl"
                  value={milestone.titleAr || ''}
                  onChange={(e) => onChange({ ...milestone, titleAr: e.target.value })}
                  className={ADMIN_INPUT_CLASS}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label htmlFor="mile-desc-en" className={ADMIN_LABEL_CLASS}>Description (English)</label>
                <textarea
                  id="mile-desc-en"
                  rows={3}
                  value={milestone.descriptionEn || ''}
                  onChange={(e) => onChange({ ...milestone, descriptionEn: e.target.value })}
                  className={ADMIN_INPUT_CLASS}
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="mile-desc-ar" className={ADMIN_LABEL_CLASS}>الوصف (العربية)</label>
                <textarea
                  id="mile-desc-ar"
                  rows={3}
                  dir="rtl"
                  value={milestone.descriptionAr || ''}
                  onChange={(e) => onChange({ ...milestone, descriptionAr: e.target.value })}
                  className={ADMIN_INPUT_CLASS}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label htmlFor="mile-category" className={ADMIN_LABEL_CLASS}>Category</label>
                <select
                  id="mile-category"
                  value={milestone.category || 'academic'}
                  onChange={(e) => onChange({ ...milestone, category: e.target.value as MilestoneRecord['category'] })}
                  className={ADMIN_INPUT_CLASS}
                >
                  <option value="academic">Academic</option>
                  <option value="technical">Technical</option>
                </select>
              </div>
              <div className="space-y-1">
                <label htmlFor="mile-pub-status" className={ADMIN_LABEL_CLASS}>Publication Status</label>
                <select
                  id="mile-pub-status"
                  value={milestone.publicationStatus || 'draft'}
                  onChange={(e) => onChange({ ...milestone, publicationStatus: e.target.value as MilestoneRecord['publicationStatus'] })}
                  className={`${ADMIN_INPUT_CLASS} font-semibold`}
                >
                  <option value="draft">{t('adminStatusDraft')}</option>
                  <option value="published">{t('adminStatusPublished')}</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label htmlFor="mile-date-en" className={ADMIN_LABEL_CLASS}>Date (Optional English)</label>
                <input
                  id="mile-date-en"
                  type="text"
                  value={milestone.dateEn || ''}
                  onChange={(e) => onChange({ ...milestone, dateEn: e.target.value })}
                  placeholder="e.g. October 2026"
                  className={ADMIN_INPUT_CLASS}
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="mile-date-ar" className={ADMIN_LABEL_CLASS}>التاريخ (اختياري)</label>
                <input
                  id="mile-date-ar"
                  type="text"
                  dir="rtl"
                  value={milestone.dateAr || ''}
                  onChange={(e) => onChange({ ...milestone, dateAr: e.target.value })}
                  placeholder="مثال: أكتوبر 2026"
                  className={ADMIN_INPUT_CLASS}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="mile-ref-url" className={ADMIN_LABEL_CLASS}>External Reference URL (optional)</label>
              <input
                id="mile-ref-url"
                type="url"
                value={milestone.externalReference || ''}
                onChange={(e) => onChange({ ...milestone, externalReference: e.target.value })}
                placeholder="https://..."
                className={ADMIN_INPUT_CLASS}
              />
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

export default AdminMilestoneModal;

