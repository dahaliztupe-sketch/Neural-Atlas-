import React, { useState, useRef } from 'react';
import { CheckCircle, UploadCloud, Database, AlertTriangle, X } from 'lucide-react';
import {
  AdminCollectionStatuses,
  ProjectRecord,
  CourseRecord,
  LearningNoteRecord,
  MilestoneRecord,
  ContactMessageRecord,
  ProfileSettingsRecord,
  ImportResult,
} from '../../types';
import { formatLocalizedDate, getImportPreview } from '../../services/contentRepository';
import { useApp } from '../../context/AppContext';
import { useModalFocusTrap } from '../../hooks/useModalFocusTrap';

interface AdminOverviewTabProps {
  projects: ProjectRecord[];
  courses: CourseRecord[];
  notes: LearningNoteRecord[];
  milestones: MilestoneRecord[];
  messages: ContactMessageRecord[];
  profileSettings: ProfileSettingsRecord | null;
  collectionStatuses: AdminCollectionStatuses;
  importing: boolean;
  importResult: ImportResult | null;
  onImport: () => void;
}

export const AdminOverviewTab: React.FC<AdminOverviewTabProps> = ({
  projects,
  courses,
  notes,
  milestones,
  messages,
  profileSettings,
  collectionStatuses,
  importing,
  importResult,
  onImport,
}) => {
  const { t, language } = useApp();
  const [seedConfirmOpen, setSeedConfirmOpen] = useState(false);
  const seedDialogRef = useRef<HTMLDivElement>(null);
  useModalFocusTrap(seedDialogRef, seedConfirmOpen);
  const preview = getImportPreview();
  const unreadMessages = messages.filter((m) => m.status === 'unread').length;

  const diagnosticRows = [
    {
      label: t('adminMetricProjects'),
      collection: 'projects',
      published: projects.filter((p) => p.publicationStatus === 'published').length,
      draft: projects.filter((p) => p.publicationStatus !== 'published').length,
      total: projects.length,
    },
    {
      label: t('adminMetricCourses'),
      collection: 'courses',
      published: courses.filter((c) => c.publicationStatus === 'published').length,
      draft: courses.filter((c) => c.publicationStatus !== 'published').length,
      total: courses.length,
    },
    {
      label: t('adminMetricNotes'),
      collection: 'notes',
      published: notes.filter((n) => n.publicationStatus === 'published').length,
      draft: notes.filter((n) => n.publicationStatus !== 'published').length,
      total: notes.length,
    },
    {
      label: t('adminMetricMilestones'),
      collection: 'milestones',
      published: milestones.filter((m) => m.publicationStatus === 'published').length,
      draft: milestones.filter((m) => m.publicationStatus !== 'published').length,
      total: milestones.length,
    },
  ];

  const profileUpdatedLabel = formatLocalizedDate(profileSettings?.updatedAt, language);
  const noCollectionErrored =
    collectionStatuses.projects === 'loaded' &&
    collectionStatuses.courses === 'loaded';
  const needsBaselineSeed =
    noCollectionErrored && (projects.length === 0 || courses.length === 0);

  const handleConfirmSeed = () => {
    setSeedConfirmOpen(false);
    onImport();
  };

  return (
    <div className="space-y-8">
      {/* Actionable Quick-Seed Alert ONLY when collections are confirmed loaded and empty */}
      {needsBaselineSeed && !importResult && (
        <div className="na-mineral-card p-5 rounded-2xl border border-amber-500/35 bg-amber-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-mono font-semibold text-amber-400">
              <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{t('adminQuickSeedTitle')}</span>
            </div>
            <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
              {t('adminQuickSeedDesc')}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setSeedConfirmOpen(true)}
            disabled={importing}
            className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[40px] rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50 shrink-0 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          >
            <UploadCloud className={`w-4 h-4 ${importing ? 'animate-bounce' : ''}`} aria-hidden="true" />
            <span>{importing ? t('adminImporting') : t('adminQuickSeedBtn')}</span>
          </button>
        </div>
      )}

      {/* Quick-Seed Confirmation Dialog */}
      {seedConfirmOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75"
          onClick={() => setSeedConfirmOpen(false)}
        >
          <div
            ref={seedDialogRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby="quick-seed-confirm-title"
            onClick={(e) => e.stopPropagation()}
            className="na-mineral-card w-full max-w-md rounded-2xl border-amber-500/40 p-6 space-y-4 text-[var(--color-text)] shadow-2xl focus:outline-none"
          >
            <div className="flex items-center justify-between gap-2 pb-2 border-b border-[var(--color-border-subtle)]">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <UploadCloud className="w-5 h-5 shrink-0" aria-hidden="true" />
                <h3 id="quick-seed-confirm-title">{t('adminQuickSeedConfirmTitle')}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSeedConfirmOpen(false)}
                className="p-1 text-[var(--color-text-muted)] hover:text-[var(--color-text)] cursor-pointer"
                aria-label={t('closeModal')}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
              {t('adminQuickSeedConfirmDesc')}
            </p>
            <div className="grid grid-cols-3 gap-2 text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-[var(--color-surface-solid)] border border-[var(--color-border-subtle)]">
                <span className="block text-[10px] text-[var(--color-text-subtle)]">{t('adminPreviewProjects')}</span>
                <span className="font-semibold text-[var(--color-text)]">{preview.projectsCount}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[var(--color-surface-solid)] border border-[var(--color-border-subtle)]">
                <span className="block text-[10px] text-[var(--color-text-subtle)]">{t('adminPreviewCourses')}</span>
                <span className="font-semibold text-[var(--color-text)]">{preview.coursesCount}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[var(--color-surface-solid)] border border-[var(--color-border-subtle)]">
                <span className="block text-[10px] text-[var(--color-text-subtle)]">{t('adminPreviewProfile')}</span>
                <span className="font-semibold text-emerald-400">1</span>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSeedConfirmOpen(false)}
                className="px-4 py-2 rounded-xl border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] text-xs cursor-pointer"
              >
                {t('adminActionCancel')}
              </button>
              <button
                type="button"
                onClick={handleConfirmSeed}
                className="px-4 py-2 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-semibold cursor-pointer"
              >
                {t('adminQuickSeedConfirmBtn')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="na-mineral-card p-4 rounded-xl space-y-1">
          <span className="text-[11px] font-mono text-[var(--color-text-subtle)]">{t('adminMetricProjects')}</span>
          <p className="text-2xl font-bold text-[var(--color-text)] tabular-nums">
            {projects.filter((p) => p.publicationStatus === 'published').length}
            <span className="text-xs font-normal text-[var(--color-text-muted)] ms-1.5">
              / {projects.length} {t('adminMetricTotal')}
            </span>
          </p>
        </div>

        <div className="na-mineral-card p-4 rounded-xl space-y-1">
          <span className="text-[11px] font-mono text-[var(--color-text-subtle)]">{t('adminMetricCourses')}</span>
          <p className="text-2xl font-bold text-[var(--color-text)] tabular-nums">
            {courses.filter((c) => c.publicationStatus === 'published').length}
            <span className="text-xs font-normal text-[var(--color-text-muted)] ms-1.5">
              / {courses.length} {t('adminMetricTotal')}
            </span>
          </p>
        </div>

        <div className="na-mineral-card p-4 rounded-xl space-y-1">
          <span className="text-[11px] font-mono text-[var(--color-text-subtle)]">{t('adminMetricNotes')}</span>
          <p className="text-2xl font-bold text-[var(--color-text)] tabular-nums">
            {notes.filter((n) => n.publicationStatus === 'published').length}
            <span className="text-xs font-normal text-[var(--color-text-muted)] ms-1.5">
              / {notes.length} {t('adminMetricTotal')}
            </span>
          </p>
        </div>

        <div className="na-mineral-card p-4 rounded-xl space-y-1">
          <span className="text-[11px] font-mono text-[var(--color-text-subtle)]">{t('adminMetricMilestones')}</span>
          <p className="text-2xl font-bold text-[var(--color-text)] tabular-nums">
            {milestones.filter((m) => m.publicationStatus === 'published').length}
            <span className="text-xs font-normal text-[var(--color-text-muted)] ms-1.5">
              / {milestones.length} {t('adminMetricTotal')}
            </span>
          </p>
        </div>

        <div className="na-mineral-card p-4 rounded-xl space-y-1">
          <span className="text-[11px] font-mono text-[var(--color-text-subtle)]">{t('adminMetricUnreadMessages')}</span>
          <p className="text-2xl font-bold text-[var(--color-secondary)] tabular-nums">
            {unreadMessages}
            <span className="text-xs font-normal text-[var(--color-text-muted)] ms-1.5">
              / {messages.length} {t('adminMetricTotal')}
            </span>
          </p>
        </div>

        <div className="na-mineral-card p-4 rounded-xl space-y-1">
          <span className="text-[11px] font-mono text-[var(--color-text-subtle)]">{t('adminMetricAuth')}</span>
          <p className="text-sm font-semibold text-emerald-400 flex items-center gap-1.5 pt-1">
            <CheckCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>{t('adminMetricVerifiedOwner')}</span>
          </p>
        </div>
      </div>

      {/* Live Firestore Collection Sync Diagnostics */}
      <div className="na-mineral-card p-6 sm:p-7 rounded-2xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[var(--color-border-subtle)]">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono text-[var(--color-secondary)]">
              <Database className="w-4 h-4" aria-hidden="true" />
              <span>{t('adminDiagnosticsTitle')}</span>
            </div>
            <p className="text-xs text-[var(--color-text-muted)]">{t('adminDiagnosticsDesc')}</p>
          </div>
          {profileSettings && (
            <div className="text-[11px] font-mono text-[var(--color-text-subtle)] flex items-center gap-2">
              <span className="px-2 py-0.5 rounded border border-emerald-500/30 bg-emerald-500/15 text-emerald-400">
                {t('adminDiagnosticsProfileLabel')}: {t('adminDiagnosticsSyncedLabel')}
              </span>
              {profileUpdatedLabel && (
                <span>
                  {t('adminDiagnosticsLastUpdated')}: {profileUpdatedLabel}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
          {diagnosticRows.map((row) => (
            <div
              key={row.collection}
              className="p-3.5 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface-solid)] space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-[var(--color-text)] font-semibold">{row.label}</span>
                <span className="text-[10px] text-[var(--color-text-subtle)]">{row.collection}</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-[var(--color-text-muted)] tabular-nums">
                <span className="text-emerald-400">
                  {t('adminDiagnosticsPublishedLabel')}: {row.published}
                </span>
                <span className="text-amber-400">
                  {t('adminDiagnosticsDraftLabel')}: {row.draft}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* One-Time Content Migration Tool */}
      <div className="na-mineral-card p-6 sm:p-8 rounded-2xl space-y-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="space-y-1 max-w-xl">
            <div className="flex items-center gap-2 text-xs font-mono text-[var(--color-secondary)]">
              <UploadCloud className="w-4 h-4" aria-hidden="true" />
              <span>{t('adminImportTitle')}</span>
            </div>
            <h2 className="text-lg font-bold text-[var(--color-text)]">
              {t('adminMigrateHeading')}
            </h2>
            <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
              {t('adminImportDesc')}
            </p>
          </div>

          <button
            type="button"
            onClick={onImport}
            disabled={importing}
            className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[42px] rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          >
            <UploadCloud className={`w-4 h-4 ${importing ? 'animate-bounce' : ''}`} aria-hidden="true" />
            <span>{importing ? t('adminImporting') : t('adminImportBtn')}</span>
          </button>
        </div>

        {/* Import Preview Information */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-3 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface-solid)]">
            <span className="block text-[var(--color-text-subtle)] mb-1">{t('adminPreviewProjects')}</span>
            <span className="font-semibold text-[var(--color-text)] tabular-nums">
              {preview.projectsCount} {t('adminEntriesLabel')}
            </span>
          </div>
          <div className="p-3 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface-solid)]">
            <span className="block text-[var(--color-text-subtle)] mb-1">{t('adminPreviewCourses')}</span>
            <span className="font-semibold text-[var(--color-text)] tabular-nums">
              {preview.coursesCount} {t('adminEntriesLabel')}
            </span>
          </div>
          <div className="p-3 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface-solid)]">
            <span className="block text-[var(--color-text-subtle)] mb-1">{t('adminPreviewMilestones')}</span>
            <span className="font-semibold text-[var(--color-text)] tabular-nums">
              {preview.milestonesCount} {t('adminEntriesLabel')}
            </span>
          </div>
          <div className="p-3 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface-solid)]">
            <span className="block text-[var(--color-text-subtle)] mb-1">{t('adminPreviewProfile')}</span>
            <span className="font-semibold text-emerald-400">{t('adminReadyToSeed')}</span>
          </div>
        </div>

        {importResult && (
          <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-xs space-y-2">
            <div className="flex items-center gap-2 font-semibold text-emerald-400">
              <CheckCircle className="w-4 h-4" aria-hidden="true" />
              <span>
                {importResult.added} added · {importResult.skipped} skipped · {importResult.failed} failed
              </span>
            </div>
            <ul className="space-y-1 font-mono text-[11px] text-[var(--color-text-muted)] max-h-36 overflow-y-auto">
              {importResult.details.map((detail, idx) => (
                <li key={idx}>• {detail}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
