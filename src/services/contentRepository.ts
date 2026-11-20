import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  limit,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { clientCache, CACHE_KEYS } from './cacheService';
import firebaseConfig from '../../firebase-applet-config.json';
import {
  ProjectRecord,
  ProjectItem,
  LearningTrackItem,
  LearningNoteRecord,
  MilestoneRecord,
  CourseRecord,
  ContactMessageRecord,
  ContactMessageInput,
  ContactMessageStatus,
  ProfileSettingsRecord,
  ImportPreview,
  ImportResult,
  PublicQueryErrorCode,
} from '../types';
import {
  PROJECTS,
  COURSES,
  OWNER_INFO,
  SOCIAL_LINKS,
  INITIAL_MILESTONES,
  INITIAL_LEARNING_NOTES,
  LEARNING_TRACKS,
  PRACTICAL_EXPERIENCE,
} from '../data/portfolioData';
import {
  sanitizeSlug,
  isValidFirestoreDocId,
  sanitizeFirestoreDocId,
  isValidUrl,
  isValidOptionalUrl,
  sanitizeSafeUrl,
  isValidOptionalEmail,
  stripUndefined,
  sanitizeStringField,
  sanitizeOptionalStringField,
  sanitizeStringArray,
  formatLocalizedDate,
  formatFirestoreUserError,
  normalizeProjectRecord,
  normalizeNoteRecord,
  normalizeMilestoneRecord,
  normalizeCourseRecord,
  normalizeContactMessageRecord,
  normalizeProfileRecord,
  normalizeLearningTracks,
  normalizePracticalExperience,
  sortRecordsDeterministically,
  validateProjectForSave,
  validateNoteForSave,
  validateMilestoneForSave,
  validateCourseForSave,
  validateContactMessageInput,
} from '../lib/validation';

export {
  sanitizeSlug,
  isValidFirestoreDocId,
  sanitizeFirestoreDocId,
  isValidUrl,
  isValidOptionalUrl,
  sanitizeSafeUrl,
  isValidOptionalEmail,
  stripUndefined,
  formatLocalizedDate,
  formatFirestoreUserError,
  normalizeProjectRecord,
  normalizeNoteRecord,
  normalizeMilestoneRecord,
  normalizeCourseRecord,
  normalizeContactMessageRecord,
  normalizeProfileRecord,
  sortRecordsDeterministically,
  validateProjectForSave,
  validateNoteForSave,
  validateMilestoneForSave,
  validateCourseForSave,
  validateContactMessageInput,
};

// Data query abstraction interfaces
export interface DataQueryResult<T> {
  items: T;
  source: 'firestore' | 'local';
  status: 'success' | 'empty' | 'error' | 'unconfigured';
  errorCode?: PublicQueryErrorCode;
}

export interface SingleDataQueryResult<T> {
  item: T | null;
  source: 'firestore' | 'local';
  status: 'success' | 'not_found' | 'error' | 'unconfigured';
  errorCode?: PublicQueryErrorCode;
}

export function classifyPublicError(err: unknown): PublicQueryErrorCode {
  const msg = err instanceof Error ? err.message.toLowerCase() : String(err).toLowerCase();
  if (msg.includes('permission') || msg.includes('insufficient')) {
    return 'permission_denied';
  }
  if (
    msg.includes('unavailable') ||
    msg.includes('offline') ||
    msg.includes('network') ||
    msg.includes("backend didn't respond") ||
    msg.includes('could not reach cloud firestore') ||
    msg.includes('deadline-exceeded')
  ) {
    return 'firestore_unavailable';
  }
  return 'query_error';
}

// Check if Firebase database is genuinely configured
export function isFirebaseConfigured(): boolean {
  if (!db || typeof db !== 'object' || !('type' in db)) return false;
  const proj = firebaseConfig?.projectId;
  if (!proj || proj === 'remixed-project-id' || proj.includes('placeholder')) {
    return false;
  }
  return true;
}

// Convert local legacy ProjectItem to modern ProjectRecord
function mapLocalProjectToRecord(p: typeof PROJECTS[0]): ProjectRecord {
  return {
    id: p.id,
    slug: p.id,
    titleEn: p.titleEn,
    titleAr: p.titleAr,
    statusEn: p.statusEn,
    statusAr: p.statusAr,
    statusType: p.statusType === 'planned' ? 'in_development' : p.statusType,
    publicationStatus: 'published',
    visibility: p.visibility || 'public',
    archiveGroup: p.archiveGroup,
    featuredOnHome: p.featuredOnHome,
    summaryEn: p.descriptionEn,
    summaryAr: p.descriptionAr,
    descriptionEn: p.descriptionEn,
    descriptionAr: p.descriptionAr,
    technologies: p.technologies || [],
    url: p.url,
    repoUrl: p.repoUrl,
    coverImageUrl: p.coverImageUrl,
    coverImageAltEn: p.coverImageAltEn,
    coverImageAltAr: p.coverImageAltAr,
    roleEn: p.roleEn,
    roleAr: p.roleAr,
    problemEn: p.problemEn,
    problemAr: p.problemAr,
    approachEn: p.approachEn,
    approachAr: p.approachAr,
    outcomeEn: p.outcomeEn,
    outcomeAr: p.outcomeAr,
    fullOverviewEn: p.fullOverviewEn || [],
    fullOverviewAr: p.fullOverviewAr || [],
    seoTitleEn: `${p.titleEn} · Neural Atlas`,
    seoTitleAr: `${p.titleAr} · أطلس الشبكات العصبية`,
    seoDescriptionEn: p.descriptionEn,
    seoDescriptionAr: p.descriptionAr,
    createdAt: '2026-10-01T00:00:00.000Z',
    updatedAt: '2026-10-01T00:00:00.000Z',
    publishedAt: '2026-10-01T00:00:00.000Z',
  };
}

function mapLocalCourseToRecord(c: typeof COURSES[0]): CourseRecord {
  return {
    id: c.id,
    slug: c.id,
    nameEn: c.nameEn,
    nameAr: c.nameAr,
    semesterEn: c.semesterEn,
    semesterAr: c.semesterAr,
    yearEn: c.yearEn,
    yearAr: c.yearAr,
    category: c.category,
    latticeNodeIndex: c.latticeNodeIndex,
    termTag: c.termTag,
    verificationStatus: c.verificationStatus,
    publicationStatus: 'published',
    createdAt: '2026-10-01T00:00:00.000Z',
    updatedAt: '2026-10-01T00:00:00.000Z',
    publishedAt: '2026-10-01T00:00:00.000Z',
  };
}

function mapLocalMilestoneToRecord(m: typeof INITIAL_MILESTONES[0]): MilestoneRecord {
  return {
    ...m,
    publicationStatus: m.publicationStatus === 'published' ? 'published' : 'draft',
    createdAt: m.createdAt || '2026-10-01T00:00:00.000Z',
    updatedAt: m.updatedAt || '2026-10-01T00:00:00.000Z',
    publishedAt: m.publicationStatus === 'published' ? m.publishedAt || '2026-10-01T00:00:00.000Z' : undefined,
  };
}

export function getLocalPublicProjectsBaseline(): ProjectRecord[] {
  return PROJECTS.filter((p) => p.visibility !== 'internal_archive').map(mapLocalProjectToRecord);
}

export function getLocalPublicCoursesBaseline(): CourseRecord[] {
  return sortCoursesDeterministically(COURSES.map(mapLocalCourseToRecord));
}

export function getLocalPublicMilestonesBaseline(): MilestoneRecord[] {
  return INITIAL_MILESTONES.filter((m) => m.publicationStatus === 'published').map(
    mapLocalMilestoneToRecord
  );
}

export function getLocalPublicNotesBaseline(): LearningNoteRecord[] {
  return sortRecordsDeterministically(
    INITIAL_LEARNING_NOTES.filter((n) => n.publicationStatus === 'published').map((n) => ({
      ...n,
      topicLabels: [...(n.topicLabels || [])],
      publicationStatus: 'published' as const,
      createdAt: n.createdAt || '2026-10-01T00:00:00.000Z',
      updatedAt: n.updatedAt || n.createdAt || '2026-10-01T00:00:00.000Z',
      publishedAt: n.publishedAt || n.createdAt || '2026-10-01T00:00:00.000Z',
    }))
  );
}

function sortCoursesDeterministically(items: CourseRecord[]): CourseRecord[] {
  return [...items].sort((a, b) => {
    if (a.latticeNodeIndex !== b.latticeNodeIndex) {
      return a.latticeNodeIndex - b.latticeNodeIndex;
    }
    return a.id.localeCompare(b.id);
  });
}

/* =====================================================================
 * CENTRALIZED PUBLIC ACCESS API (Authoritative Firestore / Baseline Fallback)
 * ===================================================================== */

export async function getPublishedProjectsResult(): Promise<DataQueryResult<ProjectRecord[]>> {
  if (!isFirebaseConfigured()) {
    return {
      items: getLocalPublicProjectsBaseline(),
      source: 'local',
      status: 'unconfigured',
    };
  }

  try {
    const q = query(
      collection(db, 'projects'),
      where('publicationStatus', '==', 'published'),
      where('visibility', '==', 'public')
    );
    const snap = await getDocs(q);
    const items = sortRecordsDeterministically(
      snap.docs
        .map((d) => normalizeProjectRecord(d.id, d.data()))
        .filter(
          (item): item is ProjectRecord =>
            item !== null && item.publicationStatus === 'published' && item.visibility === 'public'
        )
    );
    if (items.length === 0) {
      return {
        items: getLocalPublicProjectsBaseline(),
        source: 'local',
        status: 'success',
      };
    }
    return {
      items,
      source: 'firestore',
      status: 'success',
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn('Firestore getPublishedProjects error:', msg);
    return {
      items: [],
      source: 'firestore',
      status: 'error',
      errorCode: classifyPublicError(err),
    };
  }
}

export async function getPublishedProjects(): Promise<ProjectRecord[]> {
  const res = await getPublishedProjectsResult();
  return res.items;
}

export async function getProjectBySlugResult(
  slug: string,
  isOwner = false
): Promise<SingleDataQueryResult<ProjectRecord>> {
  const trimmed = String(slug || '').trim();
  const normalized = sanitizeSlug(trimmed);
  if (!normalized && !isValidFirestoreDocId(trimmed)) {
    return {
      item: null,
      source: isFirebaseConfigured() ? 'firestore' : 'local',
      status: 'not_found',
    };
  }

  if (!isFirebaseConfigured()) {
    const local = PROJECTS.find(
      (p) =>
        (p.id === normalized || p.id === trimmed) &&
        (isOwner || p.visibility !== 'internal_archive')
    );
    return {
      item: local ? mapLocalProjectToRecord(local) : null,
      source: 'local',
      status: local ? 'success' : 'not_found',
    };
  }

  try {
    if (!isOwner) {
      const slugsToTry = trimmed && trimmed !== normalized ? [normalized, trimmed] : [normalized];
      for (const candidateSlug of slugsToTry) {
        if (!candidateSlug) continue;
        const q = query(
          collection(db, 'projects'),
          where('publicationStatus', '==', 'published'),
          where('visibility', '==', 'public'),
          where('slug', '==', candidateSlug)
        );
        const snap = await getDocs(q);
        for (const d of snap.docs) {
          const data = normalizeProjectRecord(d.id, d.data());
          if (
            data &&
            data.publicationStatus === 'published' &&
            data.visibility === 'public' &&
            (data.id === trimmed || data.id === normalized || data.slug === candidateSlug)
          ) {
            return { item: data, source: 'firestore', status: 'success' };
          }
        }
      }
      // If public projects collection in Firestore has 0 documents, fall back to verified local public baseline
      const localMatch = PROJECTS.find(
        (p) =>
          (p.id === normalized || p.id === trimmed) && p.visibility !== 'internal_archive'
      );
      if (localMatch) {
        const anyPublicSnap = await getDocs(
          query(
            collection(db, 'projects'),
            where('publicationStatus', '==', 'published'),
            where('visibility', '==', 'public'),
            limit(1)
          )
        );
        if (anyPublicSnap.empty) {
          return {
            item: mapLocalProjectToRecord(localMatch),
            source: 'local',
            status: 'success',
          };
        }
      }
      return { item: null, source: 'firestore', status: 'not_found' };
    }

    const directId = isValidFirestoreDocId(trimmed) ? trimmed : normalized;
    const docRef = doc(db, 'projects', directId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = normalizeProjectRecord(snap.id, snap.data());
      if (data && (data.publicationStatus === 'published' || isOwner)) {
        return { item: data, source: 'firestore', status: 'success' };
      }
      return { item: null, source: 'firestore', status: 'not_found' };
    }

    // Owner lookup fallback when document ID differs from stored slug
    const allSnap = await getDocs(collection(db, 'projects'));
    for (const d of allSnap.docs) {
      const data = normalizeProjectRecord(d.id, d.data());
      if (data && (data.id === trimmed || data.id === normalized || data.slug === normalized)) {
        return { item: data, source: 'firestore', status: 'success' };
      }
    }
    return { item: null, source: 'firestore', status: 'not_found' };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn('Firestore getProjectBySlug error:', msg);
    return {
      item: null,
      source: 'firestore',
      status: 'error',
      errorCode: classifyPublicError(err),
    };
  }
}

export async function getProjectBySlug(slug: string, isOwner = false): Promise<ProjectRecord | null> {
  const res = await getProjectBySlugResult(slug, isOwner);
  return res.item;
}

export async function getPublishedNotesResult(): Promise<DataQueryResult<LearningNoteRecord[]>> {
  if (!isFirebaseConfigured()) {
    return {
      items: getLocalPublicNotesBaseline(),
      source: 'local',
      status: 'unconfigured',
    };
  }

  try {
    const q = query(
      collection(db, 'notes'),
      where('publicationStatus', '==', 'published')
    );
    const snap = await getDocs(q);
    const items = sortRecordsDeterministically(
      snap.docs
        .map((d) => normalizeNoteRecord(d.id, d.data()))
        .filter((item): item is LearningNoteRecord => item !== null && item.publicationStatus === 'published')
    );
    if (items.length === 0) {
      return {
        items: getLocalPublicNotesBaseline(),
        source: 'local',
        status: 'success',
      };
    }
    return {
      items,
      source: 'firestore',
      status: 'success',
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn('Firestore getPublishedNotes error:', msg);
    return {
      items: [],
      source: 'firestore',
      status: 'error',
      errorCode: classifyPublicError(err),
    };
  }
}

export async function getPublishedNotes(): Promise<LearningNoteRecord[]> {
  const res = await getPublishedNotesResult();
  return res.items;
}

export async function getNoteBySlugResult(
  slug: string,
  isOwner = false
): Promise<SingleDataQueryResult<LearningNoteRecord>> {
  const trimmed = String(slug || '').trim();
  const normalized = sanitizeSlug(trimmed);
  if (!normalized && !isValidFirestoreDocId(trimmed)) {
    return {
      item: null,
      source: isFirebaseConfigured() ? 'firestore' : 'local',
      status: 'not_found',
    };
  }

  if (!isFirebaseConfigured()) {
    const local = INITIAL_LEARNING_NOTES.find(
      (n) =>
        (n.id === trimmed || n.id === normalized || n.slug === normalized || n.slug === trimmed) &&
        (isOwner || n.publicationStatus === 'published')
    );
    return {
      item: local ? { ...local, topicLabels: [...(local.topicLabels || [])] } : null,
      source: 'local',
      status: local ? 'success' : 'not_found',
    };
  }

  try {
    if (!isOwner) {
      const slugsToTry = trimmed && trimmed !== normalized ? [normalized, trimmed] : [normalized];
      for (const candidateSlug of slugsToTry) {
        if (!candidateSlug) continue;
        const q = query(
          collection(db, 'notes'),
          where('publicationStatus', '==', 'published'),
          where('slug', '==', candidateSlug)
        );
        const snap = await getDocs(q);
        for (const d of snap.docs) {
          const data = normalizeNoteRecord(d.id, d.data());
          if (
            data &&
            data.publicationStatus === 'published' &&
            (data.id === trimmed || data.id === normalized || data.slug === candidateSlug)
          ) {
            return { item: data, source: 'firestore', status: 'success' };
          }
        }
      }
      // If public notes collection in Firestore has 0 documents, fall back to verified local baseline notes
      const localMatch = getLocalPublicNotesBaseline().find(
        (n) => n.id === trimmed || n.id === normalized || n.slug === normalized || n.slug === trimmed
      );
      if (localMatch) {
        const anyPublicSnap = await getDocs(
          query(
            collection(db, 'notes'),
            where('publicationStatus', '==', 'published'),
            limit(1)
          )
        );
        if (anyPublicSnap.empty) {
          return {
            item: localMatch,
            source: 'local',
            status: 'success',
          };
        }
      }
      return { item: null, source: 'firestore', status: 'not_found' };
    }

    const directId = isValidFirestoreDocId(trimmed) ? trimmed : normalized;
    const docRef = doc(db, 'notes', directId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = normalizeNoteRecord(snap.id, snap.data());
      if (data && (data.publicationStatus === 'published' || isOwner)) {
        return { item: data, source: 'firestore', status: 'success' };
      }
      return { item: null, source: 'firestore', status: 'not_found' };
    }

    // Owner lookup fallback when document ID differs from stored slug
    const allSnap = await getDocs(collection(db, 'notes'));
    for (const d of allSnap.docs) {
      const data = normalizeNoteRecord(d.id, d.data());
      if (data && (data.id === trimmed || data.id === normalized || data.slug === normalized)) {
        return { item: data, source: 'firestore', status: 'success' };
      }
    }
    if (allSnap.empty) {
      const localOwnerMatch = getLocalPublicNotesBaseline().find(
        (n) => n.id === trimmed || n.id === normalized || n.slug === normalized || n.slug === trimmed
      );
      if (localOwnerMatch) {
        return { item: localOwnerMatch, source: 'local', status: 'success' };
      }
    }
    return { item: null, source: 'firestore', status: 'not_found' };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn('Firestore getNoteBySlug error:', msg);
    return {
      item: null,
      source: 'firestore',
      status: 'error',
      errorCode: classifyPublicError(err),
    };
  }
}

export async function getNoteBySlug(slug: string, isOwner = false): Promise<LearningNoteRecord | null> {
  const res = await getNoteBySlugResult(slug, isOwner);
  return res.item;
}

export async function getPublishedMilestonesResult(): Promise<DataQueryResult<MilestoneRecord[]>> {
  if (!isFirebaseConfigured()) {
    return {
      items: getLocalPublicMilestonesBaseline(),
      source: 'local',
      status: 'unconfigured',
    };
  }

  try {
    const q = query(
      collection(db, 'milestones'),
      where('publicationStatus', '==', 'published')
    );
    const snap = await getDocs(q);
    const items = sortRecordsDeterministically(
      snap.docs
        .map((d) => normalizeMilestoneRecord(d.id, d.data()))
        .filter((item): item is MilestoneRecord => item !== null && item.publicationStatus === 'published')
    );
    if (items.length === 0) {
      return {
        items: getLocalPublicMilestonesBaseline(),
        source: 'local',
        status: 'success',
      };
    }
    return {
      items,
      source: 'firestore',
      status: 'success',
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn('Firestore getPublishedMilestones error:', msg);
    return {
      items: [],
      source: 'firestore',
      status: 'error',
      errorCode: classifyPublicError(err),
    };
  }
}

export async function getPublishedMilestones(): Promise<MilestoneRecord[]> {
  const res = await getPublishedMilestonesResult();
  return res.items;
}

export function resolvePublicCoursesCatchResult(err: unknown): DataQueryResult<CourseRecord[]> {
  const code = classifyPublicError(err);
  return {
    items: [],
    source: 'firestore',
    status: 'error',
    errorCode: code,
  };
}

export async function getPublishedCoursesResult(): Promise<DataQueryResult<CourseRecord[]>> {
  if (!isFirebaseConfigured()) {
    return {
      items: getLocalPublicCoursesBaseline(),
      source: 'local',
      status: 'unconfigured',
    };
  }

  try {
    const q = query(
      collection(db, 'courses'),
      where('publicationStatus', '==', 'published')
    );
    const snap = await getDocs(q);
    const items = sortCoursesDeterministically(
      snap.docs
        .map((d) => normalizeCourseRecord(d.id, d.data()))
        .filter((item): item is CourseRecord => item !== null && item.publicationStatus === 'published')
    );
    if (items.length === 0) {
      return {
        items: getLocalPublicCoursesBaseline(),
        source: 'local',
        status: 'success',
      };
    }
    return {
      items,
      source: 'firestore',
      status: 'success',
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn('Firestore getPublishedCourses error:', msg);
    return resolvePublicCoursesCatchResult(err);
  }
}

export async function getPublishedCourses(): Promise<CourseRecord[]> {
  const res = await getPublishedCoursesResult();
  return res.items;
}

export async function submitContactMessage(input: ContactMessageInput): Promise<string> {
  const validation = validateContactMessageInput(input);
  if (!validation.valid) {
    throw new Error(validation.error || 'Invalid contact message.');
  }
  if (!isFirebaseConfigured()) {
    throw new Error(
      input.language === 'ar'
        ? 'قاعدة بيانات رسائل التواصل غير مُعدّة حالياً.'
        : 'Contact database is not configured at the moment.'
    );
  }

  const docId = `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const now = new Date().toISOString();
  const payload = stripUndefined({
    id: docId,
    senderName: sanitizeStringField(input.senderName, 120),
    senderContact: sanitizeOptionalStringField(input.senderContact, 200),
    subject: sanitizeStringField(input.subject, 160),
    message: sanitizeStringField(input.message, 2500),
    language: input.language === 'ar' ? 'ar' : 'en',
    status: 'unread' as ContactMessageStatus,
    createdAt: now,
  });

  try {
    await setDoc(doc(db, 'contactMessages', docId), payload);
    return docId;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `contactMessages/${docId}`);
  }
}

export function buildDefaultProfileSettings(
  updatedAt = '2026-10-01T00:00:00.000Z'
): ProfileSettingsRecord {
  return {
    nameEn: OWNER_INFO.nameEn,
    nameAr: OWNER_INFO.nameAr,
    titleEn: OWNER_INFO.titleEn,
    titleAr: OWNER_INFO.titleAr,
    facultyEn: OWNER_INFO.facultyEn,
    facultyAr: OWNER_INFO.facultyAr,
    universityEn: OWNER_INFO.universityEn,
    universityAr: OWNER_INFO.universityAr,
    departmentEn: OWNER_INFO.departmentEn,
    departmentAr: OWNER_INFO.departmentAr,
    academicYearEn: OWNER_INFO.academicYearEn,
    academicYearAr: OWNER_INFO.academicYearAr,
    currentSemesterEn: OWNER_INFO.currentSemesterEn,
    currentSemesterAr: OWNER_INFO.currentSemesterAr,
    bioEn: OWNER_INFO.bioEn,
    bioAr: OWNER_INFO.bioAr,
    currentFocusEn: OWNER_INFO.currentFocusEn,
    currentFocusAr: OWNER_INFO.currentFocusAr,
    futureFocusEn: OWNER_INFO.futureFocusEn,
    futureFocusAr: OWNER_INFO.futureFocusAr,
    learningTracks: LEARNING_TRACKS,
    practicalExperience: PRACTICAL_EXPERIENCE,
    githubUrl: SOCIAL_LINKS.find((s) => s.platform === 'GitHub')?.url || 'https://github.com/dahaliztupe-sketch',
    linkedinUrl: SOCIAL_LINKS.find((s) => s.platform === 'LinkedIn')?.url || 'https://www.linkedin.com/in/abdalrahman-mostafa-/',
    updatedAt,
  };
}

export async function getPublicProfileSettingsResult(): Promise<SingleDataQueryResult<ProfileSettingsRecord>> {
  const defaultSettings = buildDefaultProfileSettings();

  if (!isFirebaseConfigured()) {
    return { item: defaultSettings, source: 'local', status: 'unconfigured' };
  }

  try {
    const snap = await getDoc(doc(db, 'settings', 'profile'));
    if (snap.exists()) {
      return {
        item: normalizeProfileRecord(snap.data(), defaultSettings),
        source: 'firestore',
        status: 'success',
      };
    }
    return { item: defaultSettings, source: 'firestore', status: 'not_found' };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn('Firestore getPublicProfileSettings error:', msg);
    return {
      item: defaultSettings,
      source: 'firestore',
      status: 'error',
      errorCode: classifyPublicError(err),
    };
  }
}

export async function getPublicProfileSettings(): Promise<ProfileSettingsRecord> {
  const res = await getPublicProfileSettingsResult();
  return res.item!;
}

/* =====================================================================
 * OWNER ADMIN API (Requires authenticated authorized owner)
 * ===================================================================== */

export async function getAllProjectsForAdmin(): Promise<ProjectRecord[]> {
  try {
    const snap = await getDocs(collection(db, 'projects'));
    return sortRecordsDeterministically(
      snap.docs
        .map((d) => normalizeProjectRecord(d.id, d.data()))
        .filter((item): item is ProjectRecord => item !== null)
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'projects');
  }
}

export async function saveProject(
  project: Omit<ProjectRecord, 'id'>,
  customId?: string
): Promise<string> {
  const validation = validateProjectForSave(project);
  if (!validation.valid) {
    throw new Error(validation.error || 'Invalid project record.');
  }

  const slug = sanitizeSlug(project.slug || project.titleEn);
  const docId = customId ? sanitizeFirestoreDocId(customId) : slug;
  if (!docId || !isValidFirestoreDocId(docId)) {
    throw new Error('Valid document identifier is required.');
  }

  const now = new Date().toISOString();
  const payload = stripUndefined({
    id: docId,
    slug: slug || sanitizeSlug(docId) || docId,
    titleEn: sanitizeStringField(project.titleEn, 200),
    titleAr: sanitizeStringField(project.titleAr, 200),
    statusEn: sanitizeOptionalStringField(project.statusEn, 100),
    statusAr: sanitizeOptionalStringField(project.statusAr, 100),
    statusType: project.statusType || 'practicing',
    publicationStatus: project.publicationStatus || 'draft',
    visibility: project.visibility === 'public' ? 'public' : 'internal_archive',
    archiveGroup:
      project.archiveGroup === 'showcase' || project.archiveGroup === 'experiments_discontinued'
        ? project.archiveGroup
        : undefined,
    featuredOnHome: typeof project.featuredOnHome === 'boolean' ? project.featuredOnHome : undefined,
    summaryEn: sanitizeOptionalStringField(project.summaryEn, 500),
    summaryAr: sanitizeOptionalStringField(project.summaryAr, 500),
    descriptionEn: sanitizeStringField(project.descriptionEn, 5000),
    descriptionAr: sanitizeStringField(project.descriptionAr, 5000),
    technologies: sanitizeStringArray(project.technologies, 30, 120),
    url: project.url?.trim() || '',
    repoUrl: project.repoUrl?.trim() || '',
    coverImageUrl: project.coverImageUrl?.trim() || '',
    coverImageAltEn: sanitizeOptionalStringField(project.coverImageAltEn, 300),
    coverImageAltAr: sanitizeOptionalStringField(project.coverImageAltAr, 300),
    roleEn: sanitizeOptionalStringField(project.roleEn, 300),
    roleAr: sanitizeOptionalStringField(project.roleAr, 300),
    problemEn: sanitizeOptionalStringField(project.problemEn, 1500),
    problemAr: sanitizeOptionalStringField(project.problemAr, 1500),
    approachEn: sanitizeOptionalStringField(project.approachEn, 1500),
    approachAr: sanitizeOptionalStringField(project.approachAr, 1500),
    outcomeEn: sanitizeOptionalStringField(project.outcomeEn, 1500),
    outcomeAr: sanitizeOptionalStringField(project.outcomeAr, 1500),
    fullOverviewEn: sanitizeStringArray(project.fullOverviewEn, 30, 500),
    fullOverviewAr: sanitizeStringArray(project.fullOverviewAr, 30, 500),
    seoTitleEn: sanitizeOptionalStringField(project.seoTitleEn, 200),
    seoTitleAr: sanitizeOptionalStringField(project.seoTitleAr, 200),
    seoDescriptionEn: sanitizeOptionalStringField(project.seoDescriptionEn, 500),
    seoDescriptionAr: sanitizeOptionalStringField(project.seoDescriptionAr, 500),
    updatedAt: now,
    createdAt: project.createdAt || now,
    publishedAt: project.publicationStatus === 'published' ? project.publishedAt || now : undefined,
  });

  try {
    await setDoc(doc(db, 'projects', docId), payload);
    clientCache.invalidate('public:projects:');
    return docId;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `projects/${docId}`);
  }
}

export async function deleteProject(id: string): Promise<void> {
  const docId = sanitizeFirestoreDocId(id);
  if (!docId || !isValidFirestoreDocId(docId)) {
    throw new Error('Valid document identifier is required.');
  }
  try {
    await deleteDoc(doc(db, 'projects', docId));
    clientCache.invalidate('public:projects:');
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `projects/${docId}`);
  }
}

export async function getAllNotesForAdmin(): Promise<LearningNoteRecord[]> {
  try {
    const snap = await getDocs(collection(db, 'notes'));
    return sortRecordsDeterministically(
      snap.docs
        .map((d) => normalizeNoteRecord(d.id, d.data()))
        .filter((item): item is LearningNoteRecord => item !== null)
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'notes');
  }
}

export async function saveNote(
  note: Omit<LearningNoteRecord, 'id'>,
  customId?: string
): Promise<string> {
  const validation = validateNoteForSave(note);
  if (!validation.valid) {
    throw new Error(validation.error || 'Invalid learning note record.');
  }

  const slug = sanitizeSlug(note.slug || note.titleEn);
  const docId = customId ? sanitizeFirestoreDocId(customId) : slug;
  if (!docId || !isValidFirestoreDocId(docId)) {
    throw new Error('Valid document identifier is required.');
  }

  const now = new Date().toISOString();
  const payload = stripUndefined({
    id: docId,
    slug: slug || sanitizeSlug(docId) || docId,
    titleEn: sanitizeStringField(note.titleEn, 200),
    titleAr: sanitizeStringField(note.titleAr, 200),
    summaryEn: sanitizeOptionalStringField(note.summaryEn, 500),
    summaryAr: sanitizeOptionalStringField(note.summaryAr, 500),
    contentEn: sanitizeStringField(note.contentEn, 20000),
    contentAr: sanitizeStringField(note.contentAr, 20000),
    topicLabels: sanitizeStringArray(note.topicLabels, 20, 80),
    publicationStatus: note.publicationStatus || 'draft',
    seoTitleEn: sanitizeOptionalStringField(note.seoTitleEn, 200),
    seoTitleAr: sanitizeOptionalStringField(note.seoTitleAr, 200),
    seoDescriptionEn: sanitizeOptionalStringField(note.seoDescriptionEn, 500),
    seoDescriptionAr: sanitizeOptionalStringField(note.seoDescriptionAr, 500),
    updatedAt: now,
    createdAt: note.createdAt || now,
    publishedAt: note.publicationStatus === 'published' ? note.publishedAt || now : undefined,
  });

  try {
    await setDoc(doc(db, 'notes', docId), payload);
    clientCache.invalidate('public:notes:');
    return docId;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `notes/${docId}`);
  }
}

export async function deleteNote(id: string): Promise<void> {
  const docId = sanitizeFirestoreDocId(id);
  if (!docId || !isValidFirestoreDocId(docId)) {
    throw new Error('Valid document identifier is required.');
  }
  try {
    await deleteDoc(doc(db, 'notes', docId));
    clientCache.invalidate('public:notes:');
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `notes/${docId}`);
  }
}

export async function getAllMilestonesForAdmin(): Promise<MilestoneRecord[]> {
  try {
    const snap = await getDocs(collection(db, 'milestones'));
    return sortRecordsDeterministically(
      snap.docs
        .map((d) => normalizeMilestoneRecord(d.id, d.data()))
        .filter((item): item is MilestoneRecord => item !== null)
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'milestones');
  }
}

export async function saveMilestone(
  milestone: Omit<MilestoneRecord, 'id'>,
  customId?: string
): Promise<string> {
  const validation = validateMilestoneForSave(milestone);
  if (!validation.valid) {
    throw new Error(validation.error || 'Invalid milestone record.');
  }

  const docId = customId ? sanitizeFirestoreDocId(customId) : `milestone-${Date.now()}`;
  if (!docId || !isValidFirestoreDocId(docId)) {
    throw new Error('Valid document identifier is required.');
  }

  const now = new Date().toISOString();
  const payload = stripUndefined({
    id: docId,
    titleEn: sanitizeStringField(milestone.titleEn, 200),
    titleAr: sanitizeStringField(milestone.titleAr, 200),
    descriptionEn: sanitizeStringField(milestone.descriptionEn, 1000),
    descriptionAr: sanitizeStringField(milestone.descriptionAr, 1000),
    dateEn: sanitizeOptionalStringField(milestone.dateEn, 100),
    dateAr: sanitizeOptionalStringField(milestone.dateAr, 100),
    category: milestone.category || 'academic',
    externalReference: milestone.externalReference?.trim() || '',
    publicationStatus: milestone.publicationStatus || 'draft',
    updatedAt: now,
    createdAt: milestone.createdAt || now,
    publishedAt: milestone.publicationStatus === 'published' ? milestone.publishedAt || now : undefined,
  });

  try {
    await setDoc(doc(db, 'milestones', docId), payload);
    clientCache.invalidate(CACHE_KEYS.milestonesList);
    return docId;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `milestones/${docId}`);
  }
}

export async function deleteMilestone(id: string): Promise<void> {
  const docId = sanitizeFirestoreDocId(id);
  if (!docId || !isValidFirestoreDocId(docId)) {
    throw new Error('Valid document identifier is required.');
  }
  try {
    await deleteDoc(doc(db, 'milestones', docId));
    clientCache.invalidate(CACHE_KEYS.milestonesList);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `milestones/${docId}`);
  }
}

export async function getAllCoursesForAdmin(): Promise<CourseRecord[]> {
  try {
    const snap = await getDocs(collection(db, 'courses'));
    return sortCoursesDeterministically(
      snap.docs
        .map((d) => normalizeCourseRecord(d.id, d.data()))
        .filter((item): item is CourseRecord => item !== null)
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'courses');
  }
}

export async function saveCourse(
  course: Omit<CourseRecord, 'id'>,
  customId?: string
): Promise<string> {
  const validation = validateCourseForSave(course);
  if (!validation.valid) {
    throw new Error(validation.error || 'Invalid course record.');
  }

  const slug = sanitizeSlug(course.slug || course.nameEn);
  const docId = customId ? sanitizeFirestoreDocId(customId) : slug;
  if (!docId || !isValidFirestoreDocId(docId)) {
    throw new Error('Valid document identifier is required.');
  }

  const now = new Date().toISOString();
  const payload = stripUndefined({
    id: docId,
    slug: slug || sanitizeSlug(docId) || docId,
    nameEn: sanitizeStringField(course.nameEn, 200),
    nameAr: sanitizeStringField(course.nameAr, 200),
    semesterEn: sanitizeStringField(course.semesterEn, 100),
    semesterAr: sanitizeStringField(course.semesterAr, 100),
    yearEn: sanitizeStringField(course.yearEn, 100),
    yearAr: sanitizeStringField(course.yearAr, 100),
    category: course.category || 'computational',
    latticeNodeIndex: Math.max(0, Math.min(100, Math.round(course.latticeNodeIndex))),
    termTag: sanitizeOptionalStringField(course.termTag, 64),
    verificationStatus: course.verificationStatus === 'verified' ? 'verified' : 'unverified-syllabus',
    descriptionEn: sanitizeOptionalStringField(course.descriptionEn, 2000),
    descriptionAr: sanitizeOptionalStringField(course.descriptionAr, 2000),
    publicationStatus: course.publicationStatus || 'draft',
    updatedAt: now,
    createdAt: course.createdAt || now,
    publishedAt: course.publicationStatus === 'published' ? course.publishedAt || now : undefined,
  });

  try {
    await setDoc(doc(db, 'courses', docId), payload);
    clientCache.invalidate(CACHE_KEYS.coursesList);
    return docId;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `courses/${docId}`);
  }
}

export async function deleteCourse(id: string): Promise<void> {
  const docId = sanitizeFirestoreDocId(id);
  if (!docId || !isValidFirestoreDocId(docId)) {
    throw new Error('Valid document identifier is required.');
  }
  try {
    await deleteDoc(doc(db, 'courses', docId));
    clientCache.invalidate(CACHE_KEYS.coursesList);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `courses/${docId}`);
  }
}

export async function getAllContactMessagesForAdmin(): Promise<ContactMessageRecord[]> {
  try {
    const snap = await getDocs(collection(db, 'contactMessages'));
    return sortRecordsDeterministically(
      snap.docs
        .map((d) => normalizeContactMessageRecord(d.id, d.data()))
        .filter((item): item is ContactMessageRecord => item !== null)
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'contactMessages');
  }
}

export async function updateContactMessageStatus(
  id: string,
  status: ContactMessageStatus
): Promise<void> {
  const docId = sanitizeFirestoreDocId(id);
  if (!docId || !isValidFirestoreDocId(docId)) {
    throw new Error('Valid message identifier is required.');
  }
  try {
    await updateDoc(doc(db, 'contactMessages', docId), {
      status,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `contactMessages/${docId}`);
  }
}

export async function deleteContactMessage(id: string): Promise<void> {
  const docId = sanitizeFirestoreDocId(id);
  if (!docId || !isValidFirestoreDocId(docId)) {
    throw new Error('Valid message identifier is required.');
  }
  try {
    await deleteDoc(doc(db, 'contactMessages', docId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `contactMessages/${docId}`);
  }
}

export async function saveProfileSettings(settings: ProfileSettingsRecord): Promise<void> {
  if (!settings.nameEn.trim() || !settings.nameAr.trim()) {
    throw new Error('Name in English and Arabic is required.');
  }
  if (!isValidOptionalUrl(settings.githubUrl)) {
    throw new Error('GitHub URL must be a valid http:// or https:// link.');
  }
  if (!isValidOptionalUrl(settings.linkedinUrl)) {
    throw new Error('LinkedIn URL must be a valid http:// or https:// link.');
  }

  const payload = stripUndefined({
    nameEn: sanitizeStringField(settings.nameEn, 128),
    nameAr: sanitizeStringField(settings.nameAr, 128),
    titleEn: sanitizeStringField(settings.titleEn, 200),
    titleAr: sanitizeStringField(settings.titleAr, 200),
    facultyEn: sanitizeStringField(settings.facultyEn, 200),
    facultyAr: sanitizeStringField(settings.facultyAr, 200),
    universityEn: sanitizeOptionalStringField(settings.universityEn, 200),
    universityAr: sanitizeOptionalStringField(settings.universityAr, 200),
    departmentEn: sanitizeOptionalStringField(settings.departmentEn, 200),
    departmentAr: sanitizeOptionalStringField(settings.departmentAr, 200),
    academicYearEn: sanitizeOptionalStringField(settings.academicYearEn, 120),
    academicYearAr: sanitizeOptionalStringField(settings.academicYearAr, 120),
    currentSemesterEn: sanitizeOptionalStringField(settings.currentSemesterEn, 120),
    currentSemesterAr: sanitizeOptionalStringField(settings.currentSemesterAr, 120),
    bioEn: sanitizeStringField(settings.bioEn, 1500),
    bioAr: sanitizeStringField(settings.bioAr, 1500),
    currentFocusEn: sanitizeStringField(settings.currentFocusEn, 500),
    currentFocusAr: sanitizeStringField(settings.currentFocusAr, 500),
    futureFocusEn: sanitizeStringField(settings.futureFocusEn, 500),
    futureFocusAr: sanitizeStringField(settings.futureFocusAr, 500),
    learningTracks: normalizeLearningTracks(settings.learningTracks),
    practicalExperience: normalizePracticalExperience(settings.practicalExperience),
    githubUrl: settings.githubUrl.trim(),
    linkedinUrl: settings.linkedinUrl.trim(),
    updatedAt: new Date().toISOString(),
  });

  try {
    await setDoc(doc(db, 'settings', 'profile'), payload);
    clientCache.invalidate(CACHE_KEYS.profile);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'settings/profile');
  }
}

/* =====================================================================
 * IDEMPOTENT ONE-TIME MIGRATION UTILITY (Owner-only)
 * ===================================================================== */

export function getImportPreview(): ImportPreview {
  return {
    projectsCount: PROJECTS.length,
    coursesCount: COURSES.length,
    notesCount: INITIAL_LEARNING_NOTES.length,
    milestonesCount: INITIAL_MILESTONES.length,
    hasProfileData: true,
  };
}

export async function importExistingSiteContent(): Promise<ImportResult> {
  const result: ImportResult = {
    added: 0,
    skipped: 0,
    failed: 0,
    details: [],
  };

  for (const localProject of PROJECTS) {
    const docId = localProject.id;
    try {
      const existingDoc = await getDoc(doc(db, 'projects', docId));
      if (existingDoc.exists()) {
        result.skipped++;
        result.details.push(`Project "${localProject.titleEn}" already exists in database (Skipped to prevent overwrite).`);
      } else {
        const record = stripUndefined(mapLocalProjectToRecord(localProject) as unknown as Record<string, unknown>);
        await setDoc(doc(db, 'projects', docId), record);
        result.added++;
        result.details.push(`Imported project: "${localProject.titleEn}" (${localProject.visibility || 'public'}).`);
      }
    } catch (err) {
      result.failed++;
      result.details.push(`Failed to import project "${localProject.titleEn}": ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  for (const localCourse of COURSES) {
    const docId = localCourse.id;
    try {
      const existingCourse = await getDoc(doc(db, 'courses', docId));
      if (existingCourse.exists()) {
        result.skipped++;
        result.details.push(`Course "${localCourse.nameEn}" already exists in database (Skipped to prevent overwrite).`);
      } else {
        const record = stripUndefined(mapLocalCourseToRecord(localCourse) as unknown as Record<string, unknown>);
        await setDoc(doc(db, 'courses', docId), record);
        result.added++;
        result.details.push(`Imported course: "${localCourse.nameEn}" as published.`);
      }
    } catch (err) {
      result.failed++;
      result.details.push(`Failed to import course "${localCourse.nameEn}": ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  for (const localNote of INITIAL_LEARNING_NOTES) {
    const docId = localNote.id;
    try {
      const existingNote = await getDoc(doc(db, 'notes', docId));
      if (existingNote.exists()) {
        result.skipped++;
        result.details.push(`Note "${localNote.titleEn}" already exists in database (Skipped to prevent overwrite).`);
      } else {
        const now = new Date().toISOString();
        const isPublished = localNote.publicationStatus === 'published';
        const record = stripUndefined({
          ...localNote,
          publicationStatus: isPublished ? 'published' : 'draft',
          createdAt: localNote.createdAt || now,
          updatedAt: localNote.updatedAt || now,
          publishedAt: isPublished ? localNote.publishedAt || localNote.createdAt || now : undefined,
        } as unknown as Record<string, unknown>);
        await setDoc(doc(db, 'notes', docId), record);
        result.added++;
        result.details.push(
          `Imported learning note: "${localNote.titleEn}" (${isPublished ? 'published' : 'draft'}).`
        );
      }
    } catch (err) {
      result.failed++;
      result.details.push(`Failed to import learning note "${localNote.titleEn}": ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  for (const localMilestone of INITIAL_MILESTONES) {
    const docId = localMilestone.id;
    try {
      const existingMilestone = await getDoc(doc(db, 'milestones', docId));
      if (existingMilestone.exists()) {
        result.skipped++;
        result.details.push(`Milestone "${localMilestone.titleEn}" already exists in database (Skipped to prevent overwrite).`);
      } else {
        const now = new Date().toISOString();
        const record = stripUndefined({
          ...localMilestone,
          createdAt: localMilestone.createdAt || now,
          updatedAt: now,
          publishedAt: localMilestone.publicationStatus === 'published' ? localMilestone.publishedAt || now : undefined,
        } as unknown as Record<string, unknown>);
        await setDoc(doc(db, 'milestones', docId), record);
        result.added++;
        result.details.push(`Imported milestone: "${localMilestone.titleEn}".`);
      }
    } catch (err) {
      result.failed++;
      result.details.push(`Failed to import milestone "${localMilestone.titleEn}": ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  try {
    const existingProfile = await getDoc(doc(db, 'settings', 'profile'));
    if (existingProfile.exists()) {
      result.skipped++;
      result.details.push('Profile settings already exist in database (Skipped to preserve owner edits).');
    } else {
      const defaultProfile = stripUndefined(
        buildDefaultProfileSettings(new Date().toISOString()) as unknown as Record<string, unknown>
      );
      await setDoc(doc(db, 'settings', 'profile'), defaultProfile);
      result.added++;
      result.details.push('Imported initial verified public profile settings.');
    }
  } catch (err) {
    result.failed++;
    result.details.push(`Failed to import profile settings: ${err instanceof Error ? err.message : String(err)}`);
  }

  clientCache.invalidate('public:');
  return result;
}

export function reconcileLearningTracks(
  existingTracks: LearningTrackItem[] | undefined,
  baselineTracks: LearningTrackItem[] = LEARNING_TRACKS
): LearningTrackItem[] {
  const baselineIds = new Set(baselineTracks.map((t) => t.id));
  const customTracks = (existingTracks || []).filter((t) => t && t.id && !baselineIds.has(t.id));
  return [...baselineTracks.map((t) => ({ ...t })), ...customTracks].slice(0, 10);
}

export function reconcileProfileForBaselineSync(
  existingProfile: ProfileSettingsRecord | null | undefined,
  nowIso = new Date().toISOString()
): ProfileSettingsRecord {
  const defaults = buildDefaultProfileSettings(nowIso);
  if (!existingProfile) {
    return defaults;
  }
  return {
    ...defaults,
    ...existingProfile,
    universityEn: defaults.universityEn,
    universityAr: defaults.universityAr,
    departmentEn: defaults.departmentEn,
    departmentAr: defaults.departmentAr,
    academicYearEn: defaults.academicYearEn,
    academicYearAr: defaults.academicYearAr,
    currentSemesterEn: defaults.currentSemesterEn,
    currentSemesterAr: defaults.currentSemesterAr,
    currentFocusEn: defaults.currentFocusEn,
    currentFocusAr: defaults.currentFocusAr,
    futureFocusEn: defaults.futureFocusEn,
    futureFocusAr: defaults.futureFocusAr,
    learningTracks: reconcileLearningTracks(existingProfile.learningTracks, LEARNING_TRACKS),
    practicalExperience: existingProfile.practicalExperience || PRACTICAL_EXPERIENCE,
    githubUrl: existingProfile.githubUrl?.trim() || defaults.githubUrl,
    linkedinUrl: existingProfile.linkedinUrl?.trim() || defaults.linkedinUrl,
    updatedAt: nowIso,
  };
}

export function buildBaselineProjectSyncPayload(
  localProject: ProjectItem,
  existing?: ProjectRecord | null,
  nowIso = new Date().toISOString()
): Omit<ProjectRecord, 'id'> {
  const base = mapLocalProjectToRecord(localProject);
  return {
    slug: base.slug,
    titleEn: base.titleEn,
    titleAr: base.titleAr,
    statusEn: base.statusEn,
    statusAr: base.statusAr,
    statusType: base.statusType,
    publicationStatus: base.publicationStatus,
    visibility: base.visibility,
    archiveGroup: base.archiveGroup,
    featuredOnHome: base.featuredOnHome,
    summaryEn: base.summaryEn,
    summaryAr: base.summaryAr,
    descriptionEn: base.descriptionEn,
    descriptionAr: base.descriptionAr,
    technologies: base.technologies,
    url: base.url || existing?.url || '',
    repoUrl: base.repoUrl || existing?.repoUrl || '',
    coverImageUrl: existing?.coverImageUrl || base.coverImageUrl || '',
    coverImageAltEn: existing?.coverImageAltEn || base.coverImageAltEn || '',
    coverImageAltAr: existing?.coverImageAltAr || base.coverImageAltAr || '',
    roleEn: base.roleEn,
    roleAr: base.roleAr,
    problemEn: base.problemEn,
    problemAr: base.problemAr,
    approachEn: base.approachEn,
    approachAr: base.approachAr,
    outcomeEn: base.outcomeEn,
    outcomeAr: base.outcomeAr,
    fullOverviewEn: base.fullOverviewEn,
    fullOverviewAr: base.fullOverviewAr,
    seoTitleEn: base.seoTitleEn,
    seoTitleAr: base.seoTitleAr,
    seoDescriptionEn: base.seoDescriptionEn,
    seoDescriptionAr: base.seoDescriptionAr,
    createdAt: existing?.createdAt || base.createdAt || nowIso,
    updatedAt: nowIso,
    publishedAt: existing?.publishedAt || base.publishedAt || nowIso,
  };
}

export async function syncVerifiedBaselineToFirestore(): Promise<ImportResult> {
  const result: ImportResult = {
    added: 0,
    updated: 0,
    skipped: 0,
    failed: 0,
    details: [],
  };
  const nowIso = new Date().toISOString();

  // 1. Reconcile baseline projects (preserving existing createdAt & owner media)
  for (const localProject of PROJECTS) {
    const docId = localProject.id;
    try {
      const existingSnap = await getDoc(doc(db, 'projects', docId));
      const existingRecord = existingSnap.exists()
        ? normalizeProjectRecord(docId, existingSnap.data())
        : null;
      const syncPayload = buildBaselineProjectSyncPayload(localProject, existingRecord, nowIso);
      await saveProject(syncPayload, docId);
      if (existingSnap.exists()) {
        result.updated = (result.updated || 0) + 1;
        result.details.push(
          `Synced project "${localProject.titleEn}" (${localProject.visibility || 'public'} · ${localProject.statusEn}).`
        );
      } else {
        result.added++;
        result.details.push(`Added missing baseline project "${localProject.titleEn}".`);
      }
    } catch (err) {
      result.failed++;
      result.details.push(
        `Failed to sync project "${localProject.titleEn}": ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  // 2. Add any missing baseline courses without clobbering existing edits
  for (const localCourse of COURSES) {
    const docId = localCourse.id;
    try {
      const existingCourse = await getDoc(doc(db, 'courses', docId));
      if (existingCourse.exists()) {
        result.skipped++;
      } else {
        const record = stripUndefined(mapLocalCourseToRecord(localCourse) as unknown as Record<string, unknown>);
        await setDoc(doc(db, 'courses', docId), record);
        result.added++;
        result.details.push(`Added missing baseline course "${localCourse.nameEn}".`);
      }
    } catch (err) {
      result.failed++;
      result.details.push(
        `Failed to sync course "${localCourse.nameEn}": ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  // 3. Add any missing baseline learning notes while preserving owner edits & draft/published state
  for (const localNote of INITIAL_LEARNING_NOTES) {
    const docId = localNote.id;
    try {
      const existingNote = await getDoc(doc(db, 'notes', docId));
      if (existingNote.exists()) {
        result.skipped++;
      } else {
        const isPublished = localNote.publicationStatus === 'published';
        const record = stripUndefined({
          ...localNote,
          publicationStatus: isPublished ? 'published' : 'draft',
          createdAt: localNote.createdAt || nowIso,
          updatedAt: localNote.updatedAt || nowIso,
          publishedAt: isPublished ? localNote.publishedAt || localNote.createdAt || nowIso : undefined,
        } as unknown as Record<string, unknown>);
        await setDoc(doc(db, 'notes', docId), record);
        result.added++;
        result.details.push(`Added missing baseline learning note "${localNote.titleEn}".`);
      }
    } catch (err) {
      result.failed++;
      result.details.push(
        `Failed to sync note "${localNote.titleEn}": ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  // 4. Add any missing baseline milestones while preserving existing records
  for (const localMilestone of INITIAL_MILESTONES) {
    const docId = localMilestone.id;
    try {
      const existingMilestone = await getDoc(doc(db, 'milestones', docId));
      if (existingMilestone.exists()) {
        result.skipped++;
      } else {
        const record = stripUndefined({
          ...localMilestone,
          createdAt: localMilestone.createdAt || nowIso,
          updatedAt: nowIso,
          publishedAt:
            localMilestone.publicationStatus === 'published'
              ? localMilestone.publishedAt || nowIso
              : undefined,
        } as unknown as Record<string, unknown>);
        await setDoc(doc(db, 'milestones', docId), record);
        result.added++;
        result.details.push(`Added missing baseline milestone "${localMilestone.titleEn}".`);
      }
    } catch (err) {
      result.failed++;
      result.details.push(
        `Failed to sync milestone "${localMilestone.titleEn}": ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  // 5. Reconcile settings/profile learningTracks (CS50x: Week 3) while keeping custom URLs & tracks
  try {
    const defaults = buildDefaultProfileSettings(nowIso);
    const existingProfileSnap = await getDoc(doc(db, 'settings', 'profile'));
    const existingProfile = existingProfileSnap.exists()
      ? normalizeProfileRecord(existingProfileSnap.data(), defaults)
      : null;
    const reconciled = reconcileProfileForBaselineSync(existingProfile, nowIso);
    await saveProfileSettings(reconciled);
    if (existingProfileSnap.exists()) {
      result.updated = (result.updated || 0) + 1;
      result.details.push('Synced settings/profile learning tracks (CS50x: Week 3) & focus metadata.');
    } else {
      result.added++;
      result.details.push('Created verified settings/profile document.');
    }
  } catch (err) {
    result.failed++;
    result.details.push(
      `Failed to sync profile settings: ${err instanceof Error ? err.message : String(err)}`
    );
  }

  clientCache.invalidate('public:');
  return result;
}
