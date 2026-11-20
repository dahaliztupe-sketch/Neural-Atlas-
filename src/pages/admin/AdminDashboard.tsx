import React, { useState, useEffect, useCallback, useRef, lazy, Suspense } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import {
  AdminCollectionStatuses,
  ProjectRecord,
  LearningNoteRecord,
  MilestoneRecord,
  CourseRecord,
  ContactMessageRecord,
  ContactMessageStatus,
  ProfileSettingsRecord,
  ImportResult,
} from '../../types';
import {
  getAllProjectsForAdmin,
  saveProject,
  deleteProject,
  getAllCoursesForAdmin,
  saveCourse,
  deleteCourse,
  getAllNotesForAdmin,
  saveNote,
  deleteNote,
  getAllMilestonesForAdmin,
  saveMilestone,
  deleteMilestone,
  getAllContactMessagesForAdmin,
  updateContactMessageStatus,
  deleteContactMessage,
  getPublicProfileSettings,
  saveProfileSettings,
  importExistingSiteContent,
  syncVerifiedBaselineToFirestore,
  isValidOptionalUrl,
  validateProjectForSave,
  validateCourseForSave,
  validateNoteForSave,
  validateMilestoneForSave,
} from '../../services/contentRepository';
import { formatFirestoreUserError } from '../../lib/validation';
import {
  Lock,
  ShieldAlert,
  LogIn,
  LogOut,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  X,
  Compass,
} from 'lucide-react';
import { AdminTab } from './AdminShared';
import { AdminOverviewTab } from './AdminOverviewTab';
import { useModalFocusTrap } from '../../hooks/useModalFocusTrap';

const VALID_ADMIN_TABS: readonly AdminTab[] = [
  'overview',
  'projects',
  'courses',
  'notes',
  'milestones',
  'messages',
  'profile',
  'diagnostics',
  'account',
];

function resolveAdminTabFromSubpath(subpath?: string): AdminTab {
  const normalized = String(subpath || '').trim().toLowerCase() as AdminTab;
  return VALID_ADMIN_TABS.includes(normalized) ? normalized : 'overview';
}

const LazyAdminProjectsTab = lazy(() => import('./AdminProjectsTab'));
const LazyAdminCoursesTab = lazy(() =>
  import('./AdminCoursesTab').then((m) => ({ default: m.AdminCoursesTab }))
);
const LazyAdminNotesTab = lazy(() => import('./AdminNotesTab'));
const LazyAdminMilestonesTab = lazy(() => import('./AdminMilestonesTab'));
const LazyAdminMessagesTab = lazy(() =>
  import('./AdminMessagesTab').then((m) => ({ default: m.AdminMessagesTab }))
);
const LazyAdminProfileTab = lazy(() => import('./AdminProfileTab'));
const LazyAdminAccountTab = lazy(() => import('./AdminAccountTab'));
const LazyAdminDiagnosticsTab = lazy(() => import('./AdminDiagnosticsTab'));

const LazyAdminProjectModal = lazy(() => import('./AdminProjectModal'));
const LazyAdminNoteModal = lazy(() => import('./AdminNoteModal'));
const LazyAdminCourseModal = lazy(() => import('./AdminCourseModal'));
const LazyAdminMilestoneModal = lazy(() => import('./AdminMilestoneModal'));

const AdminTabLoader: React.FC = () => (
  <div className="py-12 flex items-center justify-center">
    <RefreshCw className="w-5 h-5 text-[var(--color-primary)] animate-spin" aria-hidden="true" />
  </div>
);

export const AdminDashboard: React.FC = () => {
  const { user, loading: authLoading, isOwner, isPlaceholderConfigured, configuredOwnerEmail, signInWithGoogle, signOut } = useAuth();
  const { t, isRtl, language, navigate, currentRoute, refreshPublicProfile } = useApp();

  const [activeTab, setActiveTab] = useState<AdminTab>(() =>
    resolveAdminTabFromSubpath(currentRoute.params.subpath)
  );

  useEffect(() => {
    const nextTab = resolveAdminTabFromSubpath(currentRoute.params.subpath);
    setActiveTab((prev) => (prev === nextTab ? prev : nextTab));
  }, [currentRoute.params.subpath]);

  const handleSelectTab = useCallback(
    (tab: AdminTab) => {
      setActiveTab(tab);
      navigate(tab === 'overview' ? '/admin' : `/admin/${tab}`);
    },
    [navigate]
  );

  const discardDialogRef = useRef<HTMLDivElement>(null);
  const deleteDialogRef = useRef<HTMLDivElement>(null);

  // Content state
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [courses, setCourses] = useState<CourseRecord[]>([]);
  const [notes, setNotes] = useState<LearningNoteRecord[]>([]);
  const [milestones, setMilestones] = useState<MilestoneRecord[]>([]);
  const [messages, setMessages] = useState<ContactMessageRecord[]>([]);
  const [profileSettings, setProfileSettings] = useState<ProfileSettingsRecord | null>(null);

  // Status flags
  const [dataLoading, setDataLoading] = useState(false);
  const [collectionStatuses, setCollectionStatuses] = useState<AdminCollectionStatuses>({
    projects: 'idle',
    courses: 'idle',
    notes: 'idle',
    milestones: 'idle',
    contactMessages: 'idle',
    profile: 'idle',
  });
  const [loadWarning, setLoadWarning] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const messageTimerRef = useRef<number | null>(null);

  // Import & Sync state
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [syncingBaseline, setSyncingBaseline] = useState(false);
  const [syncResult, setSyncResult] = useState<ImportResult | null>(null);

  // Modals state
  const [editingProject, setEditingProject] = useState<Partial<ProjectRecord> | null>(null);
  const [editingCourse, setEditingCourse] = useState<Partial<CourseRecord> | null>(null);
  const [editingNote, setEditingNote] = useState<Partial<LearningNoteRecord> | null>(null);
  const [editingMilestone, setEditingMilestone] = useState<Partial<MilestoneRecord> | null>(null);
  const [isModalDirty, setIsModalDirty] = useState(false);
  const [discardConfirmOpen, setDiscardConfirmOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    type: 'project' | 'course' | 'note' | 'milestone' | 'message';
    id: string;
    title: string;
  } | null>(null);

  const openProjectModal = useCallback((project: Partial<ProjectRecord>) => {
    setIsModalDirty(false);
    setDiscardConfirmOpen(false);
    setEditingProject(project);
  }, []);

  const openCourseModal = useCallback((course: Partial<CourseRecord>) => {
    setIsModalDirty(false);
    setDiscardConfirmOpen(false);
    setEditingCourse(course);
  }, []);

  const openNoteModal = useCallback((note: Partial<LearningNoteRecord>) => {
    setIsModalDirty(false);
    setDiscardConfirmOpen(false);
    setEditingNote(note);
  }, []);

  const openMilestoneModal = useCallback((milestone: Partial<MilestoneRecord>) => {
    setIsModalDirty(false);
    setDiscardConfirmOpen(false);
    setEditingMilestone(milestone);
  }, []);

  const forceCloseEditModals = useCallback(() => {
    setEditingProject(null);
    setEditingCourse(null);
    setEditingNote(null);
    setEditingMilestone(null);
    setIsModalDirty(false);
    setDiscardConfirmOpen(false);
  }, []);

  const requestCloseEditModal = useCallback(() => {
    if (isModalDirty) {
      setDiscardConfirmOpen(true);
      return;
    }
    forceCloseEditModals();
  }, [isModalDirty, forceCloseEditModals]);

  const markDirty = useCallback(() => {
    setIsModalDirty(true);
  }, []);

  const showMessage = useCallback((type: 'success' | 'error', text: string) => {
    if (messageTimerRef.current !== null) {
      window.clearTimeout(messageTimerRef.current);
    }
    setActionMessage({ type, text });
    messageTimerRef.current = window.setTimeout(() => {
      setActionMessage(null);
      messageTimerRef.current = null;
    }, 6000);
  }, []);

  useEffect(() => {
    return () => {
      if (messageTimerRef.current !== null) {
        window.clearTimeout(messageTimerRef.current);
      }
    };
  }, []);

  useModalFocusTrap(discardDialogRef, discardConfirmOpen);
  useModalFocusTrap(deleteDialogRef, Boolean(deleteConfirmation));

  useEffect(() => {
    if (!editingProject && !editingCourse && !editingNote && !editingMilestone && !deleteConfirmation) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (deleteConfirmation) setDeleteConfirmation(null);
        else if (discardConfirmOpen) setDiscardConfirmOpen(false);
        else if (editingProject || editingCourse || editingNote || editingMilestone) requestCloseEditModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editingProject, editingCourse, editingNote, editingMilestone, deleteConfirmation, discardConfirmOpen, requestCloseEditModal]);

  const loadAdminData = useCallback(async () => {
    if (!isOwner) return;
    setDataLoading(true);
    setLoadWarning(null);
    setCollectionStatuses({
      projects: 'loading',
      courses: 'loading',
      notes: 'loading',
      milestones: 'loading',
      contactMessages: 'loading',
      profile: 'loading',
    });
    try {
      const [projRes, courseRes, noteRes, mileRes, msgRes, profileRes] = await Promise.allSettled([
        getAllProjectsForAdmin(),
        getAllCoursesForAdmin(),
        getAllNotesForAdmin(),
        getAllMilestonesForAdmin(),
        getAllContactMessagesForAdmin(),
        getPublicProfileSettings(),
      ]);

      let hasPartialError = false;
      const nextStatuses: AdminCollectionStatuses = {
        projects: 'loaded',
        courses: 'loaded',
        notes: 'loaded',
        milestones: 'loaded',
        contactMessages: 'loaded',
        profile: 'loaded',
      };

      if (projRes.status === 'fulfilled') setProjects(projRes.value || []);
      else {
        hasPartialError = true;
        nextStatuses.projects = 'error';
        console.error('Failed to load admin projects:', projRes.reason);
      }

      if (courseRes.status === 'fulfilled') setCourses(courseRes.value || []);
      else {
        hasPartialError = true;
        nextStatuses.courses = 'error';
        console.error('Failed to load admin courses:', courseRes.reason);
      }

      if (noteRes.status === 'fulfilled') setNotes(noteRes.value || []);
      else {
        hasPartialError = true;
        nextStatuses.notes = 'error';
        console.error('Failed to load admin notes:', noteRes.reason);
      }

      if (mileRes.status === 'fulfilled') setMilestones(mileRes.value || []);
      else {
        hasPartialError = true;
        nextStatuses.milestones = 'error';
        console.error('Failed to load admin milestones:', mileRes.reason);
      }

      if (msgRes.status === 'fulfilled') setMessages(msgRes.value || []);
      else {
        hasPartialError = true;
        nextStatuses.contactMessages = 'error';
        console.error('Failed to load admin messages:', msgRes.reason);
      }

      if (profileRes.status === 'fulfilled' && profileRes.value) {
        setProfileSettings(profileRes.value);
      } else if (profileRes.status === 'rejected') {
        hasPartialError = true;
        nextStatuses.profile = 'error';
        console.error('Failed to load profile settings:', profileRes.reason);
      }

      setCollectionStatuses(nextStatuses);

      if (hasPartialError) {
        setLoadWarning(t('adminLoadError'));
      }
    } finally {
      setDataLoading(false);
    }
  }, [isOwner, t]);

  useEffect(() => {
    if (isOwner) {
      loadAdminData();
    }
  }, [isOwner, loadAdminData]);

  // 1. Loading State
  if (authLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4 px-4">
        <RefreshCw className="w-8 h-8 text-[var(--color-primary)] animate-spin" aria-hidden="true" />
        <p className="text-sm font-mono text-[var(--color-text-muted)]">
          {t('adminLoadingAuth')}
        </p>
      </div>
    );
  }

  // 2. Signed-Out State (Fail-closed, never exposes owner email in DOM)
  if (!user) {
    return (
      <div className="na-mineral-card max-w-md mx-auto my-16 p-8 rounded-2xl text-center space-y-6">
        <div className="w-12 h-12 mx-auto rounded-xl bg-[var(--color-surface-solid)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-secondary)]">
          <Lock className="w-6 h-6" aria-hidden="true" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text)]">
            {t('adminTitle')}
          </h1>
          <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
            {t('adminSignedOutNotice')}
          </p>
        </div>

        <button
          type="button"
          onClick={signInWithGoogle}
          className="w-full flex items-center justify-center gap-2 px-5 py-3 min-h-[44px] rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-semibold text-xs transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
        >
          <LogIn className="w-4 h-4" aria-hidden="true" />
          <span>{t('adminSignInWithGoogle')}</span>
        </button>

        <div className="pt-2 border-t border-[var(--color-border-subtle)]">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="text-xs font-mono text-[var(--color-text-subtle)] hover:text-[var(--color-text)] transition-colors cursor-pointer"
          >
            ← {t('btnBackHome')}
          </button>
        </div>
      </div>
    );
  }

  // 3. Signed-In But Unauthorized (Not the allowlisted owner email)
  if (!isOwner) {
    return (
      <div className="na-mineral-card max-w-lg mx-auto my-16 p-8 rounded-2xl border-red-500/30 space-y-6">
        <div className="flex items-center gap-3 text-red-400">
          <ShieldAlert className="w-8 h-8 shrink-0" aria-hidden="true" />
          <div>
            <h1 className="text-xl font-bold text-[var(--color-text)]">
              {t('adminUnauthorizedTitle')}
            </h1>
            <p className="text-xs font-mono text-[var(--color-text-subtle)]">
              {t('adminSignedInAs')} {user.email || 'Anonymous'}
            </p>
          </div>
        </div>

        <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
          {t('adminUnauthorizedDesc')}
        </p>

        {isPlaceholderConfigured ? (
          <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-xs text-[var(--color-text-muted)] space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-semibold">
              <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{t('adminConfigNotice')}</span>
            </div>
            <p className="leading-relaxed">
              {t('adminConfigInstructions')}
            </p>
            <div className="p-2.5 rounded-lg bg-black/30 font-mono text-[11px] text-amber-200 break-all select-all">
              {t('adminConfiguredLabel')} {configuredOwnerEmail}
            </div>
          </div>
        ) : (
          <p className="text-xs text-[var(--color-text-subtle)] font-mono">
            {t('adminUnauthorizedDetail')}
          </p>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-[var(--color-border-subtle)]">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="text-xs font-mono text-[var(--color-text-subtle)] hover:text-[var(--color-text)] cursor-pointer"
          >
            ← {t('btnBackHome')}
          </button>
          <button
            type="button"
            onClick={signOut}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] text-xs font-medium cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{t('adminSignOut')}</span>
          </button>
        </div>
      </div>
    );
  }

  // 4. Authorized Owner Dashboard Handlers
  const handleImport = async () => {
    setImporting(true);
    try {
      const res = await importExistingSiteContent();
      setImportResult(res);
      showMessage('success', `${t('adminImportSuccess')} (+${res.added}, ${res.skipped} skipped)`);
      await loadAdminData();
      await refreshPublicProfile();
    } catch (err: unknown) {
      showMessage('error', formatFirestoreUserError(err, language));
    } finally {
      setImporting(false);
    }
  };

  const handleSyncBaseline = async () => {
    setSyncingBaseline(true);
    try {
      const res = await syncVerifiedBaselineToFirestore();
      setSyncResult(res);
      showMessage(
        'success',
        `${t('adminSyncBaselineSuccess')} (+${res.added} added, ${res.updated || 0} updated)`
      );
      await loadAdminData();
      await refreshPublicProfile();
    } catch (err: unknown) {
      showMessage('error', formatFirestoreUserError(err, language));
    } finally {
      setSyncingBaseline(false);
    }
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;

    const record: Omit<ProjectRecord, 'id'> = {
      slug: editingProject.slug || editingProject.titleEn || '',
      titleEn: editingProject.titleEn?.trim() || '',
      titleAr: editingProject.titleAr?.trim() || '',
      statusEn: editingProject.statusEn?.trim() || t('statusFallbackActive'),
      statusAr: editingProject.statusAr?.trim() || t('statusFallbackActive'),
      statusType: editingProject.statusType || 'practicing',
      publicationStatus: editingProject.publicationStatus || 'draft',
      visibility: editingProject.visibility === 'public' ? 'public' : 'internal_archive',
      archiveGroup: editingProject.archiveGroup || 'showcase',
      featuredOnHome: Boolean(editingProject.featuredOnHome),
      summaryEn: editingProject.summaryEn?.trim() || '',
      summaryAr: editingProject.summaryAr?.trim() || '',
      descriptionEn: editingProject.descriptionEn?.trim() || '',
      descriptionAr: editingProject.descriptionAr?.trim() || '',
      technologies: editingProject.technologies || [],
      url: editingProject.url?.trim() || '',
      repoUrl: editingProject.repoUrl?.trim() || '',
      coverImageUrl: editingProject.coverImageUrl?.trim() || '',
      coverImageAltEn: editingProject.coverImageAltEn?.trim() || '',
      coverImageAltAr: editingProject.coverImageAltAr?.trim() || '',
      roleEn: editingProject.roleEn?.trim() || '',
      roleAr: editingProject.roleAr?.trim() || '',
      problemEn: editingProject.problemEn?.trim() || '',
      problemAr: editingProject.problemAr?.trim() || '',
      approachEn: editingProject.approachEn?.trim() || '',
      approachAr: editingProject.approachAr?.trim() || '',
      outcomeEn: editingProject.outcomeEn?.trim() || '',
      outcomeAr: editingProject.outcomeAr?.trim() || '',
      fullOverviewEn: editingProject.fullOverviewEn || [],
      fullOverviewAr: editingProject.fullOverviewAr || [],
      seoTitleEn: editingProject.seoTitleEn?.trim() || '',
      seoTitleAr: editingProject.seoTitleAr?.trim() || '',
      seoDescriptionEn: editingProject.seoDescriptionEn?.trim() || '',
      seoDescriptionAr: editingProject.seoDescriptionAr?.trim() || '',
      createdAt: editingProject.createdAt,
      publishedAt: editingProject.publishedAt,
    };

    const validation = validateProjectForSave(record);
    if (!validation.valid) {
      showMessage('error', validation.error || t('adminInvalidUrlsError'));
      return;
    }

    try {
      await saveProject(record, editingProject.id);
      showMessage('success', t('adminSaveProjectSuccess'));
      forceCloseEditModals();
      await loadAdminData();
    } catch (err: unknown) {
      showMessage('error', formatFirestoreUserError(err, language));
    }
  };

  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNote) return;

    const record: Omit<LearningNoteRecord, 'id'> = {
      slug: editingNote.slug || editingNote.titleEn || '',
      titleEn: editingNote.titleEn?.trim() || '',
      titleAr: editingNote.titleAr?.trim() || '',
      summaryEn: editingNote.summaryEn?.trim() || '',
      summaryAr: editingNote.summaryAr?.trim() || '',
      contentEn: editingNote.contentEn || '',
      contentAr: editingNote.contentAr || '',
      topicLabels: editingNote.topicLabels || [],
      publicationStatus: editingNote.publicationStatus || 'draft',
      seoTitleEn: editingNote.seoTitleEn?.trim() || '',
      seoTitleAr: editingNote.seoTitleAr?.trim() || '',
      seoDescriptionEn: editingNote.seoDescriptionEn?.trim() || '',
      seoDescriptionAr: editingNote.seoDescriptionAr?.trim() || '',
      createdAt: editingNote.createdAt,
      publishedAt: editingNote.publishedAt,
    };

    const validation = validateNoteForSave(record);
    if (!validation.valid) {
      showMessage('error', validation.error || t('adminRequiredTitlesError'));
      return;
    }

    try {
      await saveNote(record, editingNote.id);
      showMessage('success', t('adminSaveNoteSuccess'));
      forceCloseEditModals();
      await loadAdminData();
    } catch (err: unknown) {
      showMessage('error', formatFirestoreUserError(err, language));
    }
  };

  const handleSaveMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMilestone) return;

    const record: Omit<MilestoneRecord, 'id'> = {
      titleEn: editingMilestone.titleEn?.trim() || '',
      titleAr: editingMilestone.titleAr?.trim() || '',
      descriptionEn: editingMilestone.descriptionEn?.trim() || '',
      descriptionAr: editingMilestone.descriptionAr?.trim() || '',
      dateEn: editingMilestone.dateEn?.trim() || '',
      dateAr: editingMilestone.dateAr?.trim() || '',
      category: editingMilestone.category || 'academic',
      externalReference: editingMilestone.externalReference?.trim() || '',
      publicationStatus: editingMilestone.publicationStatus || 'draft',
      createdAt: editingMilestone.createdAt,
      publishedAt: editingMilestone.publishedAt,
    };

    const validation = validateMilestoneForSave(record);
    if (!validation.valid) {
      showMessage('error', validation.error || t('adminInvalidUrlsError'));
      return;
    }

    try {
      await saveMilestone(record, editingMilestone.id);
      showMessage('success', t('adminSaveMilestoneSuccess'));
      forceCloseEditModals();
      await loadAdminData();
    } catch (err: unknown) {
      showMessage('error', formatFirestoreUserError(err, language));
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileSettings) return;
    if (!isValidOptionalUrl(profileSettings.githubUrl) || !isValidOptionalUrl(profileSettings.linkedinUrl)) {
      showMessage('error', isRtl ? 'يجب أن تبدأ روابط GitHub و LinkedIn بـ http:// أو https://' : 'GitHub and LinkedIn URLs must start with http:// or https://');
      return;
    }
    try {
      await saveProfileSettings(profileSettings);
      await refreshPublicProfile();
      showMessage('success', t('adminSaveProfileSuccess'));
    } catch (err: unknown) {
      showMessage('error', formatFirestoreUserError(err, language));
    }
  };

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse) return;

    const record: Omit<CourseRecord, 'id'> = {
      slug: editingCourse.slug || editingCourse.nameEn || '',
      nameEn: editingCourse.nameEn?.trim() || '',
      nameAr: editingCourse.nameAr?.trim() || '',
      semesterEn: editingCourse.semesterEn?.trim() || 'First Semester',
      semesterAr: editingCourse.semesterAr?.trim() || 'الفصل الدراسي الأول',
      yearEn: editingCourse.yearEn?.trim() || 'First Year',
      yearAr: editingCourse.yearAr?.trim() || 'السنة الأولى',
      category: editingCourse.category || 'computational',
      latticeNodeIndex: Number.isFinite(editingCourse.latticeNodeIndex)
        ? Math.max(0, Math.min(100, Math.round(Number(editingCourse.latticeNodeIndex))))
        : courses.length,
      termTag: editingCourse.termTag?.trim() || undefined,
      verificationStatus:
        editingCourse.verificationStatus === 'verified' ? 'verified' : 'unverified-syllabus',
      descriptionEn: editingCourse.descriptionEn?.trim() || '',
      descriptionAr: editingCourse.descriptionAr?.trim() || '',
      publicationStatus: editingCourse.publicationStatus || 'draft',
      createdAt: editingCourse.createdAt,
      publishedAt: editingCourse.publishedAt,
    };

    const validation = validateCourseForSave(record);
    if (!validation.valid) {
      showMessage('error', validation.error || t('adminRequiredTitlesError'));
      return;
    }

    try {
      await saveCourse(record, editingCourse.id);
      showMessage('success', t('adminSaveCourseSuccess'));
      forceCloseEditModals();
      await loadAdminData();
    } catch (err: unknown) {
      showMessage('error', formatFirestoreUserError(err, language));
    }
  };

  const handleUpdateMessageStatus = async (id: string, status: ContactMessageStatus) => {
    try {
      await updateContactMessageStatus(id, status);
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, status, updatedAt: new Date().toISOString() } : m))
      );
      showMessage('success', t('adminActionSave'));
    } catch (err: unknown) {
      showMessage('error', formatFirestoreUserError(err, language));
    }
  };

  const confirmDeleteAction = async () => {
    if (!deleteConfirmation) return;
    try {
      if (deleteConfirmation.type === 'project') {
        await deleteProject(deleteConfirmation.id);
      } else if (deleteConfirmation.type === 'course') {
        await deleteCourse(deleteConfirmation.id);
      } else if (deleteConfirmation.type === 'note') {
        await deleteNote(deleteConfirmation.id);
      } else if (deleteConfirmation.type === 'milestone') {
        await deleteMilestone(deleteConfirmation.id);
      } else if (deleteConfirmation.type === 'message') {
        await deleteContactMessage(deleteConfirmation.id);
      }
      showMessage('success', t('adminDeleteSuccess'));
      setDeleteConfirmation(null);
      await loadAdminData();
    } catch (err: unknown) {
      showMessage('error', formatFirestoreUserError(err, language));
    }
  };

  const togglePublication = async (
    item: ProjectRecord | CourseRecord | LearningNoteRecord | MilestoneRecord,
    type: 'project' | 'course' | 'note' | 'milestone'
  ) => {
    const newStatus = item.publicationStatus === 'published' ? 'draft' : 'published';
    try {
      if (type === 'project') {
        await saveProject({ ...(item as ProjectRecord), publicationStatus: newStatus }, item.id);
      } else if (type === 'course') {
        await saveCourse({ ...(item as CourseRecord), publicationStatus: newStatus }, item.id);
      } else if (type === 'note') {
        await saveNote({ ...(item as LearningNoteRecord), publicationStatus: newStatus }, item.id);
      } else if (type === 'milestone') {
        await saveMilestone({ ...(item as MilestoneRecord), publicationStatus: newStatus }, item.id);
      }
      showMessage('success', `${t('adminActionSave')} (${newStatus === 'published' ? t('adminStatusPublished') : t('adminStatusDraft')})`);
      await loadAdminData();
    } catch (err: unknown) {
      showMessage('error', formatFirestoreUserError(err, language));
    }
  };

  const unreadMessagesCount = messages.filter((m) => m.status === 'unread').length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* 1. Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--color-border)]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[var(--color-primary)] mb-1">
            <Compass className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{t('adminTitle')}</span>
            <span aria-hidden="true">·</span>
            <span className="text-[var(--color-secondary)]">{t('adminOwnerBadge')}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--color-text)]">
            {t('adminSubtitle')}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={loadAdminData}
            disabled={dataLoading}
            className="p-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-solid)] hover:border-[var(--color-primary)] text-[var(--color-text-muted)] cursor-pointer transition-colors"
            title={t('adminRefreshTooltip')}
            aria-label={t('adminRefreshTooltip')}
          >
            <RefreshCw className={`w-4 h-4 ${dataLoading ? 'animate-spin' : ''}`} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={signOut}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-solid)] hover:border-[var(--color-primary)] text-xs font-mono cursor-pointer transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{t('adminSignOut')}</span>
          </button>
        </div>
      </div>

      {/* Partial Load Warning Banner */}
      {loadWarning && (
        <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>{loadWarning}</span>
          </div>
          <button
            type="button"
            onClick={() => setLoadWarning(null)}
            className="p-1 hover:opacity-70"
            aria-label={t('closeModal')}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Action Feedback Banner */}
      <div aria-live="polite">
        {actionMessage && (
          <div
            role="status"
            className={`p-4 rounded-xl border flex items-center justify-between gap-3 text-xs transition-all ${
              actionMessage.type === 'success'
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                : 'border-red-500/30 bg-red-500/10 text-red-400'
            }`}
          >
            <div className="flex items-center gap-2">
              {actionMessage.type === 'success' ? (
                <CheckCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
              ) : (
                <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
              )}
              <span>{actionMessage.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setActionMessage(null)}
              className="p-1 hover:opacity-70"
              aria-label={t('closeModal')}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* 2. Admin Tabs */}
      <div className="border-b border-[var(--color-border-subtle)] flex items-center gap-2 sm:gap-5 overflow-x-auto text-xs font-mono">
        {([
          { id: 'overview', label: t('adminTabOverview') },
          { id: 'projects', label: `${t('adminTabProjects')} (${projects.length})` },
          { id: 'courses', label: `${t('adminTabCourses')} (${courses.length})` },
          { id: 'notes', label: `${t('adminTabNotes')} (${notes.length})` },
          { id: 'milestones', label: `${t('adminTabMilestones')} (${milestones.length})` },
          { id: 'messages', label: `${t('adminTabMessages')} (${messages.length})`, badge: unreadMessagesCount },
          { id: 'profile', label: t('adminTabProfile') },
          { id: 'diagnostics', label: t('adminTabDiagnostics') },
          { id: 'account', label: t('adminTabAccount') },
        ] as const).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => handleSelectTab(tab.id)}
            className={`pb-3 px-1 border-b-2 transition-colors cursor-pointer whitespace-nowrap inline-flex items-center gap-1.5 tabular-nums ${
              activeTab === tab.id
                ? 'border-[var(--color-primary)] text-[var(--color-text)] font-semibold'
                : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            <span>{tab.label}</span>
            {'badge' in tab && tab.badge ? (
              <span className="px-1.5 py-0.5 rounded-full bg-[var(--color-secondary-muted)] text-[var(--color-secondary)] text-[10px] font-semibold">
                {tab.badge}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {/* 3. Tab Contents (Lazily split chunks) */}
      {activeTab === 'overview' && (
        <AdminOverviewTab
          projects={projects}
          courses={courses}
          notes={notes}
          milestones={milestones}
          messages={messages}
          profileSettings={profileSettings}
          collectionStatuses={collectionStatuses}
          importing={importing}
          importResult={importResult}
          onImport={handleImport}
          syncingBaseline={syncingBaseline}
          syncResult={syncResult}
          onSyncBaseline={handleSyncBaseline}
        />
      )}

      <Suspense fallback={<AdminTabLoader />}>
        {activeTab === 'projects' && (
          <LazyAdminProjectsTab
            projects={projects}
            onCreate={() =>
              openProjectModal({
                titleEn: '',
                titleAr: '',
                slug: '',
                statusEn: 'Learning and practicing',
                statusAr: 'تعلّم وممارسة مستمرة',
                statusType: 'practicing',
                publicationStatus: 'draft',
                visibility: 'public',
                archiveGroup: 'showcase',
                featuredOnHome: false,
                summaryEn: '',
                summaryAr: '',
                descriptionEn: '',
                descriptionAr: '',
                technologies: ['C++'],
                fullOverviewEn: [],
                fullOverviewAr: [],
              })
            }
            onPreview={(p) => navigate(`/projects/${p.slug || p.id}`)}
            onEdit={(p) => openProjectModal(p)}
            onTogglePublish={(p) => togglePublication(p, 'project')}
            onDelete={(p) => setDeleteConfirmation({ type: 'project', id: p.id, title: p.titleEn })}
          />
        )}

        {activeTab === 'courses' && (
          <LazyAdminCoursesTab
            courses={courses}
            onCreate={() =>
              openCourseModal({
                nameEn: '',
                nameAr: '',
                slug: '',
                semesterEn: 'First Semester',
                semesterAr: 'الفصل الدراسي الأول',
                yearEn: 'First Year',
                yearAr: 'السنة الأولى',
                category: 'computational',
                latticeNodeIndex: courses.length,
                termTag: 'semester-1-archive',
                verificationStatus: 'unverified-syllabus',
                descriptionEn: '',
                descriptionAr: '',
                publicationStatus: 'draft',
              })
            }
            onEdit={(course) => openCourseModal(course)}
            onTogglePublish={(course) => togglePublication(course, 'course')}
            onDelete={(course) =>
              setDeleteConfirmation({ type: 'course', id: course.id, title: course.nameEn })
            }
          />
        )}

        {activeTab === 'notes' && (
          <LazyAdminNotesTab
            notes={notes}
            onCreate={() =>
              openNoteModal({
                titleEn: '',
                titleAr: '',
                slug: '',
                publicationStatus: 'draft',
                summaryEn: '',
                summaryAr: '',
                contentEn: '',
                contentAr: '',
                topicLabels: [],
              })
            }
            onPreview={(n) => navigate(`/notes/${n.slug || n.id}`)}
            onEdit={(n) => openNoteModal(n)}
            onTogglePublish={(n) => togglePublication(n, 'note')}
            onDelete={(n) => setDeleteConfirmation({ type: 'note', id: n.id, title: n.titleEn })}
          />
        )}

        {activeTab === 'milestones' && (
          <LazyAdminMilestonesTab
            milestones={milestones}
            onCreate={() =>
              openMilestoneModal({
                titleEn: '',
                titleAr: '',
                descriptionEn: '',
                descriptionAr: '',
                dateEn: '',
                dateAr: '',
                externalReference: '',
                category: 'academic',
                publicationStatus: 'draft',
              })
            }
            onEdit={(m) => openMilestoneModal(m)}
            onTogglePublish={(m) => togglePublication(m, 'milestone')}
            onDelete={(m) =>
              setDeleteConfirmation({ type: 'milestone', id: m.id, title: m.titleEn })
            }
          />
        )}

        {activeTab === 'messages' && (
          <LazyAdminMessagesTab
            messages={messages}
            onUpdateStatus={handleUpdateMessageStatus}
            onDelete={(msg) =>
              setDeleteConfirmation({ type: 'message', id: msg.id, title: msg.subject })
            }
          />
        )}

        {activeTab === 'profile' && profileSettings && (
          <LazyAdminProfileTab
            profileSettings={profileSettings}
            onChange={setProfileSettings}
            onSubmit={handleSaveProfile}
          />
        )}

        {activeTab === 'diagnostics' && (
          <LazyAdminDiagnosticsTab
            projects={projects}
            courses={courses}
            notes={notes}
            milestones={milestones}
            profileSettings={profileSettings}
            collectionStatuses={collectionStatuses}
            onRestoreComplete={async () => {
              await loadAdminData();
              await refreshPublicProfile();
            }}
          />
        )}

        {activeTab === 'account' && (
          <LazyAdminAccountTab
            user={user}
            configuredOwnerEmail={configuredOwnerEmail}
            onSignOut={signOut}
          />
        )}
      </Suspense>

      {/* --- LAZY EDIT MODALS --- */}
      <Suspense fallback={null}>
        {editingProject && (
          <LazyAdminProjectModal
            project={editingProject}
            existingSlugs={projects.map((p) => p.slug || p.id)}
            onChange={setEditingProject}
            onMarkDirty={markDirty}
            onRequestClose={requestCloseEditModal}
            onOpenPublicPreview={(slug) => {
              forceCloseEditModals();
              navigate(`/projects/${slug}`);
            }}
            onSubmit={handleSaveProject}
          />
        )}

        {editingNote && (
          <LazyAdminNoteModal
            note={editingNote}
            existingSlugs={notes.map((n) => n.slug || n.id)}
            onChange={setEditingNote}
            onMarkDirty={markDirty}
            onRequestClose={requestCloseEditModal}
            onOpenPublicPreview={(slug) => {
              forceCloseEditModals();
              navigate(`/notes/${slug}`);
            }}
            onSubmit={handleSaveNote}
          />
        )}

        {editingCourse && (
          <LazyAdminCourseModal
            course={editingCourse}
            existingSlugs={courses.map((c) => c.slug || c.id)}
            onChange={setEditingCourse}
            onMarkDirty={markDirty}
            onRequestClose={requestCloseEditModal}
            onSubmit={handleSaveCourse}
          />
        )}

        {editingMilestone && (
          <LazyAdminMilestoneModal
            milestone={editingMilestone}
            onChange={setEditingMilestone}
            onMarkDirty={markDirty}
            onRequestClose={requestCloseEditModal}
            onSubmit={handleSaveMilestone}
          />
        )}
      </Suspense>

      {/* --- UNSAVED CHANGES GUARD MODAL --- */}
      {discardConfirmOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/75"
          onClick={() => setDiscardConfirmOpen(false)}
        >
          <div
            ref={discardDialogRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby="discard-modal-title"
            onClick={(e) => e.stopPropagation()}
            className="na-mineral-card w-full max-w-md rounded-2xl border-amber-500/40 p-6 space-y-4 text-[var(--color-text)] shadow-2xl focus:outline-none"
          >
            <div className="flex items-center gap-3 text-amber-400">
              <AlertTriangle className="w-5 h-5 shrink-0" aria-hidden="true" />
              <h3 id="discard-modal-title" className="text-sm font-bold">
                {t('adminDiscardChanges')}
              </h3>
            </div>
            <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
              {t('adminUnsavedPrompt')}
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDiscardConfirmOpen(false)}
                className="px-4 py-2 rounded-xl border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] text-xs cursor-pointer"
              >
                {t('adminKeepEditing')}
              </button>
              <button
                type="button"
                onClick={forceCloseEditModals}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold cursor-pointer"
              >
                {t('adminDiscardChanges')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- CONFIRM DELETE MODAL --- */}
      {deleteConfirmation && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75"
          onClick={() => setDeleteConfirmation(null)}
        >
          <div
            ref={deleteDialogRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-modal-title"
            onClick={(e) => e.stopPropagation()}
            className="na-mineral-card w-full max-w-md rounded-2xl border-red-500/40 p-6 space-y-4 text-[var(--color-text)] shadow-2xl focus:outline-none"
          >
            <div className="flex items-center gap-3 text-red-400">
              <AlertTriangle className="w-6 h-6 shrink-0" aria-hidden="true" />
              <h3 id="delete-modal-title" className="text-base font-bold">{t('adminConfirmDeleteTitle')}</h3>
            </div>
            <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
              {t('adminConfirmDelete')}
            </p>
            <div className="p-3 rounded-xl bg-black/30 font-mono text-xs text-[var(--color-text)]">
              {deleteConfirmation.title} ({deleteConfirmation.id})
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmation(null)}
                className="px-4 py-2 rounded-xl border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] text-xs cursor-pointer"
              >
                {t('adminActionCancel')}
              </button>
              <button
                type="button"
                onClick={confirmDeleteAction}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold cursor-pointer"
              >
                {t('adminActionDelete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
