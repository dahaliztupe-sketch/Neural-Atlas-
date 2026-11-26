import React, { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { ProjectRecord } from '../../types';
import { useApp } from '../../context/AppContext';
import { PublicationBadge, RecordActions } from './AdminShared';

interface AdminProjectsTabProps {
  projects: ProjectRecord[];
  onCreate: () => void;
  onPreview: (project: ProjectRecord) => void;
  onEdit: (project: ProjectRecord) => void;
  onTogglePublish: (project: ProjectRecord) => void;
  onDelete: (project: ProjectRecord) => void;
}

export const AdminProjectsTab: React.FC<AdminProjectsTabProps> = ({
  projects,
  onCreate,
  onPreview,
  onEdit,
  onTogglePublish,
  onDelete,
}) => {
  const { t, isRtl } = useApp();
  const [search, setSearch] = useState('');

  const filteredProjects = projects.filter((p) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      p.titleEn.toLowerCase().includes(q) ||
      p.titleAr.includes(q) ||
      p.slug.toLowerCase().includes(q)
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
            placeholder={t('adminSearchProjects')}
            aria-label={t('adminSearchProjects')}
            className="w-full ps-9 pe-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-solid)] text-xs text-[var(--color-text)] placeholder:text-[var(--color-text-subtle)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]"
          />
        </div>

        <button
          type="button"
          onClick={onCreate}
          className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[40px] rounded-xl bg-[var(--color-primary-solid)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-semibold cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
        >
          <Plus className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{t('adminActionCreate')}</span>
        </button>
      </div>

      <div className="space-y-3">
        {filteredProjects.length === 0 ? (
          <div className="na-mineral-card p-8 text-center rounded-xl text-xs text-[var(--color-text-muted)] font-mono">
            {t('adminEmptyProjects')}
          </div>
        ) : (
          filteredProjects.map((p) => (
            <div
              key={p.id}
              className="na-mineral-card na-mineral-card-interactive p-4 sm:p-5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                  <PublicationBadge status={p.publicationStatus} />
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase border ${
                      p.visibility === 'internal_archive'
                        ? 'bg-slate-500/20 text-slate-300 border-slate-500/30'
                        : 'bg-sky-500/15 text-sky-300 border-sky-500/30'
                    }`}
                  >
                    {p.visibility}
                  </span>
                  {p.featuredOnHome && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase border border-emerald-500/30 bg-emerald-500/15 text-emerald-300">
                      home
                    </span>
                  )}
                  {p.legacyVisibilityMissing && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold border border-amber-500/40 bg-amber-500/15 text-amber-300">
                      legacy visibility missing — save to classify
                    </span>
                  )}
                  <span className="text-[var(--color-text-subtle)]">slug: {p.slug}</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-[var(--color-secondary)] uppercase">{p.statusType}</span>
                </div>
                <h3 className="text-base font-semibold text-[var(--color-text)]">
                  {isRtl ? p.titleAr : p.titleEn}
                </h3>
                <p
                  className="text-xs text-[var(--color-text-muted)] font-mono"
                  dir={isRtl ? 'ltr' : 'rtl'}
                >
                  {isRtl ? p.titleEn : p.titleAr}
                </p>
              </div>

              <RecordActions
                publicationStatus={p.publicationStatus}
                publishLabel={t('adminActionPublish')}
                unpublishLabel={t('adminActionUnpublish')}
                editLabel={t('adminActionEdit')}
                deleteLabel={t('adminActionDelete')}
                previewLabel={t('adminActionPreview')}
                onPreview={() => onPreview(p)}
                onTogglePublish={() => onTogglePublish(p)}
                onEdit={() => onEdit(p)}
                onDelete={() => onDelete(p)}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminProjectsTab;
