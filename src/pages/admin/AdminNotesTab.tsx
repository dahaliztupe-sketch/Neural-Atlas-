import React, { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { LearningNoteRecord } from '../../types';
import { useApp } from '../../context/AppContext';
import { PublicationBadge, RecordActions } from './AdminShared';

interface AdminNotesTabProps {
  notes: LearningNoteRecord[];
  onCreate: () => void;
  onPreview: (note: LearningNoteRecord) => void;
  onEdit: (note: LearningNoteRecord) => void;
  onTogglePublish: (note: LearningNoteRecord) => void;
  onDelete: (note: LearningNoteRecord) => void;
}

export const AdminNotesTab: React.FC<AdminNotesTabProps> = ({
  notes,
  onCreate,
  onPreview,
  onEdit,
  onTogglePublish,
  onDelete,
}) => {
  const { t, isRtl } = useApp();
  const [search, setSearch] = useState('');

  const filteredNotes = notes.filter((n) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      n.titleEn.toLowerCase().includes(q) ||
      n.titleAr.includes(q) ||
      n.slug.toLowerCase().includes(q)
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
            placeholder={t('adminSearchNotes')}
            aria-label={t('adminSearchNotes')}
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
        {filteredNotes.length === 0 ? (
          <div className="na-mineral-card p-8 text-center rounded-xl text-xs text-[var(--color-text-muted)] font-mono">
            {t('adminEmptyNotes')}
          </div>
        ) : (
          filteredNotes.map((n) => (
            <div
              key={n.id}
              className="na-mineral-card na-mineral-card-interactive p-4 sm:p-5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-mono">
                  <PublicationBadge status={n.publicationStatus} />
                  <span className="text-[var(--color-text-subtle)]">slug: {n.slug}</span>
                </div>
                <h3 className="text-base font-semibold text-[var(--color-text)]">
                  {isRtl ? n.titleAr : n.titleEn}
                </h3>
                <p
                  className="text-xs text-[var(--color-text-muted)] font-mono"
                  dir={isRtl ? 'ltr' : 'rtl'}
                >
                  {isRtl ? n.titleEn : n.titleAr}
                </p>
              </div>

              <RecordActions
                publicationStatus={n.publicationStatus}
                publishLabel={t('adminActionPublish')}
                unpublishLabel={t('adminActionUnpublish')}
                editLabel={t('adminActionEdit')}
                deleteLabel={t('adminActionDelete')}
                previewLabel={t('adminActionPreview')}
                onPreview={() => onPreview(n)}
                onTogglePublish={() => onTogglePublish(n)}
                onEdit={() => onEdit(n)}
                onDelete={() => onDelete(n)}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminNotesTab;
