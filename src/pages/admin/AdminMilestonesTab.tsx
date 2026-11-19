import React, { useState } from 'react';
import { Plus, X, ExternalLink } from 'lucide-react';
import { MilestoneRecord } from '../../types';
import { useApp } from '../../context/AppContext';
import { isValidUrl } from '../../services/contentRepository';
import { PublicationBadge, RecordActions } from './AdminShared';

interface AdminMilestonesTabProps {
  milestones: MilestoneRecord[];
  onCreate: () => void;
  onEdit: (milestone: MilestoneRecord) => void;
  onTogglePublish: (milestone: MilestoneRecord) => void;
  onDelete: (milestone: MilestoneRecord) => void;
}

export const AdminMilestonesTab: React.FC<AdminMilestonesTabProps> = ({
  milestones,
  onCreate,
  onEdit,
  onTogglePublish,
  onDelete,
}) => {
  const { t, isRtl } = useApp();
  const [previewMilestone, setPreviewMilestone] = useState<MilestoneRecord | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-sm font-semibold font-mono text-[var(--color-text)]">
          {t('adminMilestonesHeading')}
        </h2>
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
        {milestones.length === 0 ? (
          <div className="na-mineral-card p-8 text-center rounded-xl text-xs text-[var(--color-text-muted)] font-mono">
            {t('adminEmptyMilestones')}
          </div>
        ) : (
          milestones.map((m) => (
            <div
              key={m.id}
              className="na-mineral-card na-mineral-card-interactive p-4 sm:p-5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-mono">
                  <PublicationBadge status={m.publicationStatus} />
                  <span className="text-[var(--color-secondary)] uppercase">{m.category}</span>
                  {m.dateEn && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="text-[var(--color-text-subtle)]">
                        {isRtl ? m.dateAr || m.dateEn : m.dateEn}
                      </span>
                    </>
                  )}
                </div>
                <h3 className="text-base font-semibold text-[var(--color-text)]">
                  {isRtl ? m.titleAr : m.titleEn}
                </h3>
              </div>

              <RecordActions
                publicationStatus={m.publicationStatus}
                publishLabel={t('adminActionPublish')}
                unpublishLabel={t('adminActionUnpublish')}
                editLabel={t('adminActionEdit')}
                deleteLabel={t('adminActionDelete')}
                previewLabel={t('adminActionPreview')}
                onPreview={() => setPreviewMilestone(m)}
                onTogglePublish={() => onTogglePublish(m)}
                onEdit={() => onEdit(m)}
                onDelete={() => onDelete(m)}
              />
            </div>
          ))
        )}
      </div>

      {previewMilestone && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75"
          onClick={() => setPreviewMilestone(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="milestone-preview-title"
            onClick={(e) => e.stopPropagation()}
            className="na-mineral-card w-full max-w-lg rounded-2xl p-6 space-y-4 text-[var(--color-text)] shadow-2xl"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border-subtle)]">
              <div className="flex items-center gap-2 text-xs font-mono text-[var(--color-secondary)]">
                <span>{t('adminPreviewMilestoneHeading')}</span>
                <PublicationBadge status={previewMilestone.publicationStatus} />
              </div>
              <button
                type="button"
                onClick={() => setPreviewMilestone(null)}
                className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text)] cursor-pointer"
                aria-label={t('closeModal')}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-[var(--color-secondary)]">
                <span>{isRtl ? previewMilestone.dateAr || previewMilestone.dateEn : previewMilestone.dateEn}</span>
                <span className="uppercase text-[var(--color-text-subtle)]">{previewMilestone.category}</span>
              </div>
              <h3 id="milestone-preview-title" className="text-lg font-bold text-[var(--color-text)]">
                {isRtl ? previewMilestone.titleAr : previewMilestone.titleEn}
              </h3>
              <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                {isRtl ? previewMilestone.descriptionAr : previewMilestone.descriptionEn}
              </p>
              {previewMilestone.externalReference && isValidUrl(previewMilestone.externalReference) && (
                <a
                  href={previewMilestone.externalReference}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-mono text-[var(--color-primary)] hover:underline pt-1"
                >
                  <span>{t('externalReference')}</span>
                  <ExternalLink className="w-3 h-3" aria-hidden="true" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMilestonesTab;

