import React, { useEffect, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Download,
  FileJson,
  ShieldAlert,
  Upload,
} from 'lucide-react';
import {
  AdminCollectionStatuses,
  CourseRecord,
  LearningNoteRecord,
  MilestoneRecord,
  ProfileSettingsRecord,
  ProjectRecord,
} from '../../types';
import { useApp } from '../../context/AppContext';
import { firebaseConfig } from '../../lib/firebase';
import { clientCache } from '../../services/cacheService';
import {
  saveCourse,
  saveMilestone,
  saveNote,
  saveProfileSettings,
  saveProject,
} from '../../services/contentRepository';
import { formatFirestoreUserError } from '../../lib/validation';
import {
  BackupConflictDiff,
  BackupValidationResult,
  RestoreConflictStrategy,
  RestoreExecutionResult,
  computeBackupDiff,
  createPortfolioBackupPayload,
  parseAndValidateBackupJson,
} from '../../services/backupService';

interface AdminDiagnosticsTabProps {
  projects: ProjectRecord[];
  courses: CourseRecord[];
  notes: LearningNoteRecord[];
  milestones: MilestoneRecord[];
  profileSettings: ProfileSettingsRecord | null;
  collectionStatuses: AdminCollectionStatuses;
  onRestoreComplete: () => Promise<void>;
}

export const AdminDiagnosticsTab: React.FC<AdminDiagnosticsTabProps> = ({
  projects,
  courses,
  notes,
  milestones,
  profileSettings,
  collectionStatuses,
  onRestoreComplete,
}) => {
  const { t, language } = useApp();
  const [swState, setSwState] = useState<'checking' | 'registered' | 'unregistered' | 'unsupported'>('checking');
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  const [selectedFileName, setSelectedFileName] = useState<string>('');
  const [validation, setValidation] = useState<BackupValidationResult | null>(null);
  const [conflictDiff, setConflictDiff] = useState<BackupConflictDiff | null>(null);
  const [strategy, setStrategy] = useState<RestoreConflictStrategy>('skip');
  const [includeProfileRestore, setIncludeProfileRestore] = useState<boolean>(false);
  const [restoreConfirmed, setRestoreConfirmed] = useState<boolean>(false);
  const [restoring, setRestoring] = useState<boolean>(false);
  const [restoreResult, setRestoreResult] = useState<RestoreExecutionResult | null>(null);

  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);

    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
      setSwState('unsupported');
    } else {
      navigator.serviceWorker
        .getRegistration()
        .then((reg) => setSwState(reg ? 'registered' : 'unregistered'))
        .catch(() => setSwState('unregistered'));
    }

    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  const handleExportJson = () => {
    const payload = createPortfolioBackupPayload({
      projects,
      courses,
      notes,
      milestones,
      profile: profileSettings,
    });
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStamp = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `neural-atlas-backup-${dateStamp}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setRestoreResult(null);
    setRestoreConfirmed(false);
    if (!file) {
      setSelectedFileName('');
      setValidation(null);
      setConflictDiff(null);
      return;
    }

    setSelectedFileName(file.name);
    const text = await file.text();
    const res = parseAndValidateBackupJson(text);
    setValidation(res);
    if (res.valid && res.payload) {
      const diff = computeBackupDiff(res.payload, { projects, courses, notes, milestones });
      setConflictDiff(diff);
      setIncludeProfileRestore(diff.hasProfileInBackup);
    } else {
      setConflictDiff(null);
    }
  };

  const handleApplyRestore = async () => {
    if (!validation?.valid || !validation.payload || !restoreConfirmed) return;
    setRestoring(true);
    const payload = validation.payload;
    const summary: RestoreExecutionResult = {
      written: 0,
      skipped: 0,
      failed: 0,
      details: [],
    };

    const existingProjectsMap = new Map(projects.map((p) => [p.id, p]));
    const existingCoursesMap = new Map(courses.map((c) => [c.id, c]));
    const existingNotesMap = new Map(notes.map((n) => [n.id, n]));
    const existingMilestonesMap = new Map(milestones.map((m) => [m.id, m]));

    for (const p of payload.collections.projects) {
      const existing = existingProjectsMap.get(p.id);
      if (strategy === 'skip' && existing) {
        summary.skipped++;
        summary.details.push(`Skipped existing project: ${p.id}`);
        continue;
      }
      try {
        await saveProject(
          { ...p, createdAt: existing?.createdAt || p.createdAt },
          p.id
        );
        summary.written++;
        summary.details.push(`Restored project: ${p.id}`);
      } catch (err) {
        summary.failed++;
        summary.details.push(`Failed project ${p.id}: ${formatFirestoreUserError(err, language)}`);
      }
    }

    for (const c of payload.collections.courses) {
      const existing = existingCoursesMap.get(c.id);
      if (strategy === 'skip' && existing) {
        summary.skipped++;
        summary.details.push(`Skipped existing course: ${c.id}`);
        continue;
      }
      try {
        await saveCourse(
          { ...c, createdAt: existing?.createdAt || c.createdAt },
          c.id
        );
        summary.written++;
        summary.details.push(`Restored course: ${c.id}`);
      } catch (err) {
        summary.failed++;
        summary.details.push(`Failed course ${c.id}: ${formatFirestoreUserError(err, language)}`);
      }
    }

    for (const n of payload.collections.notes) {
      const existing = existingNotesMap.get(n.id);
      if (strategy === 'skip' && existing) {
        summary.skipped++;
        summary.details.push(`Skipped existing note: ${n.id}`);
        continue;
      }
      try {
        await saveNote(
          { ...n, createdAt: existing?.createdAt || n.createdAt },
          n.id
        );
        summary.written++;
        summary.details.push(`Restored note: ${n.id}`);
      } catch (err) {
        summary.failed++;
        summary.details.push(`Failed note ${n.id}: ${formatFirestoreUserError(err, language)}`);
      }
    }

    for (const m of payload.collections.milestones) {
      const existing = existingMilestonesMap.get(m.id);
      if (strategy === 'skip' && existing) {
        summary.skipped++;
        summary.details.push(`Skipped existing milestone: ${m.id}`);
        continue;
      }
      try {
        await saveMilestone(
          { ...m, createdAt: existing?.createdAt || m.createdAt },
          m.id
        );
        summary.written++;
        summary.details.push(`Restored milestone: ${m.id}`);
      } catch (err) {
        summary.failed++;
        summary.details.push(`Failed milestone ${m.id}: ${formatFirestoreUserError(err, language)}`);
      }
    }

    if (includeProfileRestore && payload.profile) {
      try {
        await saveProfileSettings(payload.profile);
        summary.written++;
        summary.details.push('Restored public profile settings.');
      } catch (err) {
        summary.failed++;
        summary.details.push(`Failed profile restore: ${formatFirestoreUserError(err, language)}`);
      }
    }

    clientCache.invalidate('public:');
    setRestoreResult(summary);
    setRestoring(false);
    setRestoreConfirmed(false);
    await onRestoreComplete();
  };

  const collectionList = [
    { key: 'projects', label: t('adminMetricProjects'), status: collectionStatuses.projects, count: projects.length },
    { key: 'courses', label: t('adminMetricCourses'), status: collectionStatuses.courses, count: courses.length },
    { key: 'notes', label: t('adminMetricNotes'), status: collectionStatuses.notes, count: notes.length },
    { key: 'milestones', label: t('adminMetricMilestones'), status: collectionStatuses.milestones, count: milestones.length },
    { key: 'contactMessages', label: t('adminTabMessages'), status: collectionStatuses.contactMessages, count: undefined },
    { key: 'profile', label: t('adminDiagnosticsProfileLabel'), status: collectionStatuses.profile, count: profileSettings ? 1 : 0 },
  ] as const;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs font-mono text-[var(--color-secondary)]">
          <Activity className="w-4 h-4" aria-hidden="true" />
          <span>{t('adminDiagHeading')}</span>
        </div>
        <p className="text-xs text-[var(--color-text-muted)]">{t('adminDiagSubheading')}</p>
      </div>

      {/* Authoritative Rules Disclaimer */}
      <div className="p-4 rounded-xl border border-amber-500/35 bg-amber-500/10 flex items-start gap-3 text-xs">
        <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
        <p className="text-[var(--color-text-muted)] leading-relaxed">
          {t('adminDiagRulesDisclaimer')}
        </p>
      </div>

      {!import.meta.env.VITE_SITE_URL && (
        <div className="p-4 rounded-xl border border-amber-500/35 bg-amber-500/10 flex items-start gap-3 text-xs">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-[var(--color-text-muted)] leading-relaxed">
            VITE_SITE_URL is not configured in environment variables; canonical URLs and JSON-LD currently fall back to runtime origin.
          </p>
        </div>
      )}

      {projects.some((p) => p.legacyVisibilityMissing) && (
        <div className="p-4 rounded-xl border border-amber-500/35 bg-amber-500/10 flex items-start gap-3 text-xs">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="space-y-1 text-[var(--color-text-muted)] leading-relaxed">
            <p className="font-semibold text-amber-300">
              Legacy project records missing explicit visibility detected ({projects.filter((p) => p.legacyVisibilityMissing).length})
            </p>
            <p className="font-mono text-[11px]">
              {projects
                .filter((p) => p.legacyVisibilityMissing)
                .map((p) => p.id)
                .join(', ')}{' '}
              — treated as internal_archive until reviewed and saved with explicit public or internal_archive visibility.
            </p>
          </div>
        </div>
      )}

      {/* Firebase & Runtime Environment Cards */}
      <div className="na-mineral-card p-6 rounded-2xl space-y-5">
        <h2 className="text-sm font-bold text-[var(--color-text)]">{t('adminDiagEnvHeading')}</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs font-mono">
          <div className="p-3.5 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface-solid)] space-y-1">
            <span className="block text-[10px] text-[var(--color-text-subtle)]">{t('adminDiagProjectIdLabel')}</span>
            <span className="block text-[var(--color-text)] truncate">{firebaseConfig.projectId || '—'}</span>
          </div>
          <div className="p-3.5 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface-solid)] space-y-1">
            <span className="block text-[10px] text-[var(--color-text-subtle)]">{t('adminDiagDatabaseIdLabel')}</span>
            <span className="block text-[var(--color-text)] truncate" title={firebaseConfig.firestoreDatabaseId}>
              {firebaseConfig.firestoreDatabaseId || '(default)'}
            </span>
          </div>
          <div className="p-3.5 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface-solid)] space-y-1">
            <span className="block text-[10px] text-[var(--color-text-subtle)]">{t('adminDiagOwnerStatusLabel')}</span>
            <span className="block text-emerald-400 font-semibold">{t('adminMetricVerifiedOwner')}</span>
          </div>
          <div className="p-3.5 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface-solid)] space-y-1">
            <span className="block text-[10px] text-[var(--color-text-subtle)]">{t('adminDiagNetworkLabel')}</span>
            <span className={`block font-semibold ${isOnline ? 'text-emerald-400' : 'text-amber-400'}`}>
              {isOnline ? 'online' : 'offline'}
            </span>
          </div>
          <div className="p-3.5 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface-solid)] space-y-1">
            <span className="block text-[10px] text-[var(--color-text-subtle)]">{t('adminDiagSwLabel')}</span>
            <span className="block text-[var(--color-secondary)]">{swState}</span>
          </div>
        </div>

        {/* Per-collection Load Statuses */}
        <div className="space-y-2.5 pt-2 border-t border-[var(--color-border-subtle)]">
          <h3 className="text-xs font-mono text-[var(--color-text-subtle)]">
            {t('adminDiagCollectionsHeading')}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs font-mono">
            {collectionList.map((col) => (
              <div
                key={col.key}
                className="p-3 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface-solid)] space-y-1"
              >
                <span className="block text-[11px] text-[var(--color-text-muted)] truncate">{col.label}</span>
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-[11px] font-semibold uppercase ${
                      col.status === 'loaded'
                        ? 'text-emerald-400'
                        : col.status === 'error'
                        ? 'text-red-400'
                        : 'text-amber-400'
                    }`}
                  >
                    {col.status}
                  </span>
                  {typeof col.count === 'number' && (
                    <span className="text-[11px] text-[var(--color-text)] tabular-nums">{col.count}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* JSON Backup Export & Validated Restore */}
      <div className="na-mineral-card p-6 sm:p-7 rounded-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--color-border-subtle)]">
          <div className="space-y-1 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-mono text-[var(--color-primary)]">
              <FileJson className="w-4 h-4" aria-hidden="true" />
              <span>{t('adminBackupHeading')}</span>
            </div>
            <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
              {t('adminBackupDesc')}
            </p>
          </div>

          <button
            type="button"
            onClick={handleExportJson}
            className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[42px] rounded-xl bg-[var(--color-primary-solid)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-semibold cursor-pointer transition-colors shrink-0"
          >
            <Download className="w-4 h-4" aria-hidden="true" />
            <span>{t('adminBackupExportBtn')}</span>
          </button>
        </div>

        {/* Step 1: Select File */}
        <div className="space-y-2 text-xs">
          <label htmlFor="backup-restore-file" className="block font-mono font-semibold text-[var(--color-text)]">
            {t('adminRestoreStep1Title')}
          </label>
          <div className="flex flex-wrap items-center gap-3">
            <label
              htmlFor="backup-restore-file"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-solid)] hover:border-[var(--color-primary)] text-xs font-mono cursor-pointer transition-colors"
            >
              <Upload className="w-3.5 h-3.5 text-[var(--color-secondary)]" aria-hidden="true" />
              <span>{selectedFileName || 'Choose .json backup file'}</span>
            </label>
            <input
              id="backup-restore-file"
              type="file"
              accept=".json,application/json"
              onChange={handleFileChange}
              className="sr-only"
            />
          </div>
        </div>

        {/* Validation Errors */}
        {validation && !validation.valid && (
          <div className="p-4 rounded-xl border border-red-500/35 bg-red-500/10 text-xs text-red-400 space-y-1.5">
            <div className="flex items-center gap-2 font-semibold">
              <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{t('adminRestoreInvalidFile')}</span>
            </div>
            <ul className="list-disc ps-5 space-y-0.5 font-mono text-[11px]">
              {validation.errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Step 2 & 3: Conflict Diff Preview & Strategy + Confirmed Execute */}
        {validation?.valid && validation.payload && conflictDiff && (
          <div className="space-y-5 pt-3 border-t border-[var(--color-border-subtle)] text-xs">
            <div className="space-y-2">
              <h3 className="font-mono font-semibold text-[var(--color-text)]">
                {t('adminRestoreStep2Title')}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
                {([
                  { label: t('adminMetricProjects'), diff: conflictDiff.projects },
                  { label: t('adminMetricCourses'), diff: conflictDiff.courses },
                  { label: t('adminMetricNotes'), diff: conflictDiff.notes },
                  { label: t('adminMetricMilestones'), diff: conflictDiff.milestones },
                ] as const).map((entry) => (
                  <div
                    key={entry.label}
                    className="p-3 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface-solid)] space-y-1"
                  >
                    <span className="block text-[11px] text-[var(--color-text-muted)]">{entry.label}</span>
                    <span className="block text-[var(--color-text)] font-semibold tabular-nums">
                      {entry.diff.incoming} total · {entry.diff.newCount} new
                    </span>
                    <span
                      className={`block text-[11px] tabular-nums ${
                        entry.diff.conflictCount > 0 ? 'text-amber-400' : 'text-emerald-400'
                      }`}
                    >
                      {entry.diff.conflictCount} conflicts
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="restore-strategy"
                  checked={strategy === 'skip'}
                  onChange={() => setStrategy('skip')}
                />
                <span>{t('adminRestoreStrategySkip')}</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="restore-strategy"
                  checked={strategy === 'overwrite'}
                  onChange={() => setStrategy('overwrite')}
                />
                <span>{t('adminRestoreStrategyOverwrite')}</span>
              </label>
              {conflictDiff.hasProfileInBackup && (
                <label className="flex items-center gap-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={includeProfileRestore}
                    onChange={(e) => setIncludeProfileRestore(e.target.checked)}
                  />
                  <span>Restore public profile settings document</span>
                </label>
              )}
            </div>

            <div className="pt-3 border-t border-[var(--color-border-subtle)] space-y-3">
              <label className="flex items-center gap-2 font-mono text-[var(--color-text)] cursor-pointer">
                <input
                  type="checkbox"
                  checked={restoreConfirmed}
                  onChange={(e) => setRestoreConfirmed(e.target.checked)}
                />
                <span>{t('adminRestoreConfirmLabel')}</span>
              </label>

              <button
                type="button"
                disabled={!restoreConfirmed || restoring}
                onClick={handleApplyRestore}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--color-primary-solid)] hover:bg-[var(--color-primary-hover)] text-white font-semibold disabled:opacity-45 cursor-pointer transition-colors"
              >
                <Upload className="w-4 h-4" aria-hidden="true" />
                <span>{restoring ? t('adminRestoreRestoring') : t('adminRestoreBtn')}</span>
              </button>
            </div>
          </div>
        )}

        {/* Execution Report */}
        {restoreResult && (
          <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-xs space-y-2">
            <div className="flex items-center gap-2 font-semibold text-emerald-400">
              <CheckCircle className="w-4 h-4" aria-hidden="true" />
              <span>
                {restoreResult.written} written · {restoreResult.skipped} skipped · {restoreResult.failed} failed
              </span>
            </div>
            <ul className="space-y-1 font-mono text-[11px] text-[var(--color-text-muted)] max-h-36 overflow-y-auto">
              {restoreResult.details.map((detail, i) => (
                <li key={i}>• {detail}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDiagnosticsTab;
