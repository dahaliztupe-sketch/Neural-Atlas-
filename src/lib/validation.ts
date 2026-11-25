import {
  Language,
  ProjectRecord,
  ProjectItem,
  ProjectStatusType,
  ProjectVisibility,
  ProjectArchiveGroup,
  LearningNoteRecord,
  MilestoneRecord,
  CourseRecord,
  ContactMessageRecord,
  ContactMessageInput,
  ProfileSettingsRecord,
  LearningTrackItem,
  LearningTrackStatus,
  PracticalExperienceSection,
} from '../types';

export const ALLOWED_PROJECT_STATUS_TYPES: ProjectStatusType[] = [
  'practicing',
  'in_development',
  'completed',
  'experimental',
  'paused',
  'discontinued',
  'archived',
  'needs_confirmation',
];

export const ALLOWED_LEARNING_TRACK_STATUSES: LearningTrackStatus[] = [
  'active',
  'in_progress',
  'completed',
  'paused',
  'submitted',
  'needs_confirmation',
];

export function sanitizeSlug(input: string): string {
  return String(input || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\-_]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 100);
}

export function isValidFirestoreDocId(id: string): boolean {
  return typeof id === 'string' && /^[a-zA-Z0-9_\-]{1,128}$/.test(id);
}

export function sanitizeFirestoreDocId(input: string): string {
  const trimmed = String(input || '').trim();
  if (isValidFirestoreDocId(trimmed)) {
    return trimmed;
  }
  return trimmed
    .replace(/[^a-zA-Z0-9\-_]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 128);
}

export function resolveNormalizedDocId(rawId: unknown, fallbackId: string): string {
  const candidate =
    typeof rawId === 'string' && rawId.trim() ? rawId.trim() : String(fallbackId || '').trim();
  if (isValidFirestoreDocId(candidate)) {
    return candidate;
  }
  return sanitizeSlug(candidate) || sanitizeSlug(fallbackId) || fallbackId;
}

export function isValidUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function isValidOptionalUrl(url?: string): boolean {
  if (!url || !url.trim()) return true;
  return isValidUrl(url.trim());
}

export function sanitizeSafeUrl(url?: unknown): string | undefined {
  if (typeof url !== 'string') return undefined;
  const trimmed = url.trim();
  if (!trimmed) return undefined;
  return isValidUrl(trimmed) ? trimmed : undefined;
}

export function isValidOptionalEmail(email?: string): boolean {
  if (!email || !email.trim()) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function stripUndefined<T extends Record<string, unknown>>(
  record: T
): Record<string, unknown> {
  const cleaned: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(record)) {
    if (value !== undefined) {
      cleaned[key] = value;
    }
  }
  return cleaned;
}

export function sanitizeStringField(value: unknown, maxLen = 5000): string {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, maxLen);
}

export function sanitizeOptionalStringField(value: unknown, maxLen = 5000): string | undefined {
  const clean = sanitizeStringField(value, maxLen);
  return clean.length > 0 ? clean : undefined;
}

export function sanitizeStringArray(value: unknown, maxItems = 30, maxItemLen = 500): string[] {
  if (!Array.isArray(value)) return [];
  const result: string[] = [];
  for (const entry of value) {
    if (typeof entry === 'string') {
      const trimmed = entry.trim().slice(0, maxItemLen);
      if (trimmed.length > 0) {
        result.push(trimmed);
        if (result.length >= maxItems) break;
      }
    }
  }
  return result;
}

export function sanitizeIsoDate(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const ms = Date.parse(trimmed);
  if (Number.isNaN(ms)) return undefined;
  return new Date(ms).toISOString();
}

export function formatLocalizedDate(value: string | undefined, language: Language): string | null {
  if (!value) return null;
  const ms = Date.parse(value);
  if (Number.isNaN(ms)) return null;
  try {
    return new Intl.DateTimeFormat(language === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(ms));
  } catch {
    return null;
  }
}

export function normalizeProjectStatusType(rawStatus: unknown): ProjectStatusType {
  if (typeof rawStatus === 'string') {
    const candidate = rawStatus as ProjectStatusType;
    if (ALLOWED_PROJECT_STATUS_TYPES.includes(candidate)) {
      return candidate;
    }
  }
  return 'practicing';
}

export function normalizeProjectVisibility(rawVisibility: unknown): {
  visibility: ProjectVisibility;
  hasExplicitVisibility: boolean;
} {
  if (rawVisibility === 'public' || rawVisibility === 'internal_archive') {
    return { visibility: rawVisibility, hasExplicitVisibility: true };
  }
  // Fail-closed: legacy records lacking an explicit visibility field default to internal_archive
  return { visibility: 'internal_archive', hasExplicitVisibility: false };
}

export function normalizeProjectRecord(id: string, raw: unknown): ProjectRecord | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;

  const safeId = resolveNormalizedDocId(r.id, id);
  const slug =
    sanitizeSlug(typeof r.slug === 'string' && r.slug.trim() ? r.slug : safeId) ||
    sanitizeSlug(safeId) ||
    safeId;
  const titleEn = sanitizeStringField(r.titleEn, 200);
  const titleAr = sanitizeStringField(r.titleAr, 200);
  if (!titleEn && !titleAr) return null;

  const pubStatus = r.publicationStatus === 'published' ? 'published' : 'draft';
  const statusType = normalizeProjectStatusType(r.statusType);
  const { visibility, hasExplicitVisibility } = normalizeProjectVisibility(r.visibility);

  const archiveGroup: ProjectArchiveGroup | undefined =
    r.archiveGroup === 'showcase' || r.archiveGroup === 'experiments_discontinued'
      ? r.archiveGroup
      : undefined;

  const featuredOnHome =
    typeof r.featuredOnHome === 'boolean' ? r.featuredOnHome : undefined;

  const summaryEn = sanitizeOptionalStringField(r.summaryEn, 500);
  const summaryAr = sanitizeOptionalStringField(r.summaryAr, 500);
  const descriptionEn = sanitizeStringField(r.descriptionEn, 5000) || summaryEn || '';
  const descriptionAr = sanitizeStringField(r.descriptionAr, 5000) || summaryAr || '';

  return {
    id: safeId,
    slug,
    titleEn: titleEn || titleAr,
    titleAr: titleAr || titleEn,
    statusEn: sanitizeOptionalStringField(r.statusEn, 100),
    statusAr: sanitizeOptionalStringField(r.statusAr, 100),
    statusType,
    publicationStatus: pubStatus,
    visibility,
    archiveGroup,
    featuredOnHome,
    ...(hasExplicitVisibility ? {} : { legacyVisibilityMissing: true }),
    summaryEn,
    summaryAr,
    descriptionEn,
    descriptionAr,
    technologies: sanitizeStringArray(r.technologies, 30, 120),
    url: sanitizeSafeUrl(r.url),
    repoUrl: sanitizeSafeUrl(r.repoUrl),
    coverImageUrl: sanitizeSafeUrl(r.coverImageUrl),
    coverImageAltEn: sanitizeOptionalStringField(r.coverImageAltEn, 300),
    coverImageAltAr: sanitizeOptionalStringField(r.coverImageAltAr, 300),
    roleEn: sanitizeOptionalStringField(r.roleEn, 300),
    roleAr: sanitizeOptionalStringField(r.roleAr, 300),
    problemEn: sanitizeOptionalStringField(r.problemEn, 1500),
    problemAr: sanitizeOptionalStringField(r.problemAr, 1500),
    approachEn: sanitizeOptionalStringField(r.approachEn, 1500),
    approachAr: sanitizeOptionalStringField(r.approachAr, 1500),
    outcomeEn: sanitizeOptionalStringField(r.outcomeEn, 1500),
    outcomeAr: sanitizeOptionalStringField(r.outcomeAr, 1500),
    fullOverviewEn: sanitizeStringArray(r.fullOverviewEn, 30, 500),
    fullOverviewAr: sanitizeStringArray(r.fullOverviewAr, 30, 500),
    seoTitleEn: sanitizeOptionalStringField(r.seoTitleEn, 200),
    seoTitleAr: sanitizeOptionalStringField(r.seoTitleAr, 200),
    seoDescriptionEn: sanitizeOptionalStringField(r.seoDescriptionEn, 500),
    seoDescriptionAr: sanitizeOptionalStringField(r.seoDescriptionAr, 500),
    createdAt: sanitizeIsoDate(r.createdAt),
    updatedAt: sanitizeIsoDate(r.updatedAt),
    publishedAt: sanitizeIsoDate(r.publishedAt),
  };
}

export function normalizeNoteRecord(id: string, raw: unknown): LearningNoteRecord | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;

  const safeId = resolveNormalizedDocId(r.id, id);
  const slug =
    sanitizeSlug(typeof r.slug === 'string' && r.slug.trim() ? r.slug : safeId) ||
    sanitizeSlug(safeId) ||
    safeId;
  const titleEn = sanitizeStringField(r.titleEn, 200);
  const titleAr = sanitizeStringField(r.titleAr, 200);
  if (!titleEn && !titleAr) return null;

  return {
    id: safeId,
    slug,
    titleEn: titleEn || titleAr,
    titleAr: titleAr || titleEn,
    summaryEn: sanitizeOptionalStringField(r.summaryEn, 500),
    summaryAr: sanitizeOptionalStringField(r.summaryAr, 500),
    contentEn: sanitizeStringField(r.contentEn, 20000),
    contentAr: sanitizeStringField(r.contentAr, 20000),
    topicLabels: sanitizeStringArray(r.topicLabels, 20, 80),
    publicationStatus: r.publicationStatus === 'published' ? 'published' : 'draft',
    seoTitleEn: sanitizeOptionalStringField(r.seoTitleEn, 200),
    seoTitleAr: sanitizeOptionalStringField(r.seoTitleAr, 200),
    seoDescriptionEn: sanitizeOptionalStringField(r.seoDescriptionEn, 500),
    seoDescriptionAr: sanitizeOptionalStringField(r.seoDescriptionAr, 500),
    createdAt: sanitizeIsoDate(r.createdAt),
    updatedAt: sanitizeIsoDate(r.updatedAt),
    publishedAt: sanitizeIsoDate(r.publishedAt),
  };
}

export function normalizeMilestoneRecord(id: string, raw: unknown): MilestoneRecord | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;

  const safeId = resolveNormalizedDocId(r.id, id);
  const titleEn = sanitizeStringField(r.titleEn, 200);
  const titleAr = sanitizeStringField(r.titleAr, 200);
  if (!titleEn && !titleAr) return null;

  return {
    id: safeId,
    titleEn: titleEn || titleAr,
    titleAr: titleAr || titleEn,
    descriptionEn: sanitizeStringField(r.descriptionEn, 1000),
    descriptionAr: sanitizeStringField(r.descriptionAr, 1000),
    dateEn: sanitizeOptionalStringField(r.dateEn, 100),
    dateAr: sanitizeOptionalStringField(r.dateAr, 100),
    category: r.category === 'technical' ? 'technical' : 'academic',
    externalReference: sanitizeSafeUrl(r.externalReference),
    publicationStatus: r.publicationStatus === 'published' ? 'published' : 'draft',
    createdAt: sanitizeIsoDate(r.createdAt),
    updatedAt: sanitizeIsoDate(r.updatedAt),
    publishedAt: sanitizeIsoDate(r.publishedAt),
  };
}

export function normalizeCourseRecord(id: string, raw: unknown): CourseRecord | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;

  const safeId = resolveNormalizedDocId(r.id, id);
  const slug =
    sanitizeSlug(typeof r.slug === 'string' && r.slug.trim() ? r.slug : safeId) ||
    sanitizeSlug(safeId) ||
    safeId;
  const nameEn = sanitizeStringField(r.nameEn, 200);
  const nameAr = sanitizeStringField(r.nameAr, 200);
  if (!nameEn && !nameAr) return null;

  const category =
    r.category === 'computational' || r.category === 'mathematical' || r.category === 'humanities'
      ? r.category
      : 'computational';

  const rawIndex =
    typeof r.latticeNodeIndex === 'number' && Number.isFinite(r.latticeNodeIndex)
      ? Math.round(r.latticeNodeIndex)
      : 0;
  const latticeNodeIndex = Math.max(0, Math.min(100, rawIndex));

  const verificationStatus =
    r.verificationStatus === 'verified' ? 'verified' : 'unverified-syllabus';

  return {
    id: safeId,
    slug,
    nameEn: nameEn || nameAr,
    nameAr: nameAr || nameEn,
    semesterEn: sanitizeStringField(r.semesterEn, 100) || 'First Semester',
    semesterAr: sanitizeStringField(r.semesterAr, 100) || 'الفصل الدراسي الأول',
    yearEn: sanitizeStringField(r.yearEn, 100) || 'First Year',
    yearAr: sanitizeStringField(r.yearAr, 100) || 'السنة الأولى',
    category,
    latticeNodeIndex,
    termTag: sanitizeOptionalStringField(r.termTag, 64),
    verificationStatus,
    descriptionEn: sanitizeOptionalStringField(r.descriptionEn, 2000),
    descriptionAr: sanitizeOptionalStringField(r.descriptionAr, 2000),
    publicationStatus: r.publicationStatus === 'published' ? 'published' : 'draft',
    createdAt: sanitizeIsoDate(r.createdAt),
    updatedAt: sanitizeIsoDate(r.updatedAt),
    publishedAt: sanitizeIsoDate(r.publishedAt),
  };
}

export function normalizeContactMessageRecord(
  id: string,
  raw: unknown
): ContactMessageRecord | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;

  const safeId = resolveNormalizedDocId(r.id, id);
  const senderName = sanitizeStringField(r.senderName, 120);
  const subject = sanitizeStringField(r.subject, 160);
  const message = sanitizeStringField(r.message, 2500);
  if (!senderName || !subject || !message) return null;

  const status =
    r.status === 'read' || r.status === 'archived' || r.status === 'unread' ? r.status : 'unread';

  return {
    id: safeId,
    senderName,
    senderContact: sanitizeOptionalStringField(r.senderContact, 200),
    subject,
    message,
    language: r.language === 'ar' ? 'ar' : 'en',
    status,
    createdAt: sanitizeIsoDate(r.createdAt) || new Date(0).toISOString(),
    updatedAt: sanitizeIsoDate(r.updatedAt),
  };
}

export function normalizeLearningTracks(
  rawTracks: unknown,
  fallback?: LearningTrackItem[]
): LearningTrackItem[] | undefined {
  if (!Array.isArray(rawTracks)) return fallback;
  const result: LearningTrackItem[] = [];
  for (let i = 0; i < rawTracks.length && result.length < 10; i++) {
    const item = rawTracks[i];
    if (!item || typeof item !== 'object') continue;
    const obj = item as Record<string, unknown>;
    const titleEn = sanitizeStringField(obj.titleEn, 200);
    const titleAr = sanitizeStringField(obj.titleAr, 200);
    if (!titleEn || !titleAr) continue;

    const id = sanitizeFirestoreDocId(
      typeof obj.id === 'string' && obj.id.trim() ? obj.id : sanitizeSlug(titleEn) || `track-${i + 1}`
    );
    if (!id || !isValidFirestoreDocId(id)) continue;

    const rawStatus = typeof obj.status === 'string' ? (obj.status as LearningTrackStatus) : 'in_progress';
    const status = ALLOWED_LEARNING_TRACK_STATUSES.includes(rawStatus)
      ? rawStatus
      : 'in_progress';

    result.push({
      id,
      titleEn,
      titleAr,
      status,
      statusLabelEn: sanitizeStringField(obj.statusLabelEn, 120),
      statusLabelAr: sanitizeStringField(obj.statusLabelAr, 120),
      cadenceNoteEn: sanitizeStringField(obj.cadenceNoteEn, 300),
      cadenceNoteAr: sanitizeStringField(obj.cadenceNoteAr, 300),
      summaryEn: sanitizeStringField(obj.summaryEn, 1000),
      summaryAr: sanitizeStringField(obj.summaryAr, 1000),
      highlightsEn: sanitizeStringArray(obj.highlightsEn, 10, 500),
      highlightsAr: sanitizeStringArray(obj.highlightsAr, 10, 500),
      ...(typeof obj.showInActiveHighlights === 'boolean'
        ? { showInActiveHighlights: obj.showInActiveHighlights }
        : {}),
    });
  }
  return result.length > 0 ? result : fallback;
}

export function normalizePracticalExperience(
  rawExp: unknown,
  fallback?: PracticalExperienceSection
): PracticalExperienceSection | undefined {
  if (!rawExp || typeof rawExp !== 'object') return fallback;
  const obj = rawExp as Record<string, unknown>;
  const sectionTitleEn = sanitizeStringField(obj.sectionTitleEn, 200);
  const sectionTitleAr = sanitizeStringField(obj.sectionTitleAr, 200);
  if (!sectionTitleEn || !sectionTitleAr) return fallback;

  return {
    sectionTitleEn,
    sectionTitleAr,
    contextSummaryEn: sanitizeStringField(obj.contextSummaryEn, 1500),
    contextSummaryAr: sanitizeStringField(obj.contextSummaryAr, 1500),
    activitiesEn: sanitizeStringArray(obj.activitiesEn, 12, 500),
    activitiesAr: sanitizeStringArray(obj.activitiesAr, 12, 500),
  };
}

export function normalizeProfileRecord(
  raw: unknown,
  fallback: ProfileSettingsRecord
): ProfileSettingsRecord {
  if (!raw || typeof raw !== 'object') return fallback;
  const r = raw as Record<string, unknown>;

  const nameEn = sanitizeStringField(r.nameEn, 128) || fallback.nameEn;
  const nameAr = sanitizeStringField(r.nameAr, 128) || fallback.nameAr;

  const incomingTracks = normalizeLearningTracks(r.learningTracks);
  const learningTracks =
    fallback.learningTracks && fallback.learningTracks.length > 0
      ? (() => {
          const baselineIds = new Set(fallback.learningTracks.map((t) => t.id));
          const customTracks = (incomingTracks || []).filter((t) => !baselineIds.has(t.id));
          return [...fallback.learningTracks.map((t) => ({ ...t })), ...customTracks].slice(0, 10);
        })()
      : incomingTracks;

  const practicalExperience =
    fallback.practicalExperience || normalizePracticalExperience(r.practicalExperience);

  return stripUndefined({
    nameEn,
    nameAr,
    titleEn: sanitizeStringField(r.titleEn, 200) || fallback.titleEn,
    titleAr: sanitizeStringField(r.titleAr, 200) || fallback.titleAr,
    facultyEn: sanitizeStringField(r.facultyEn, 200) || fallback.facultyEn,
    facultyAr: sanitizeStringField(r.facultyAr, 200) || fallback.facultyAr,
    universityEn: sanitizeOptionalStringField(r.universityEn, 200) || fallback.universityEn,
    universityAr: sanitizeOptionalStringField(r.universityAr, 200) || fallback.universityAr,
    departmentEn: sanitizeOptionalStringField(r.departmentEn, 200) || fallback.departmentEn,
    departmentAr: sanitizeOptionalStringField(r.departmentAr, 200) || fallback.departmentAr,
    academicYearEn: sanitizeOptionalStringField(r.academicYearEn, 120) || fallback.academicYearEn,
    academicYearAr: sanitizeOptionalStringField(r.academicYearAr, 120) || fallback.academicYearAr,
    currentSemesterEn:
      sanitizeOptionalStringField(r.currentSemesterEn, 120) || fallback.currentSemesterEn,
    currentSemesterAr:
      sanitizeOptionalStringField(r.currentSemesterAr, 120) || fallback.currentSemesterAr,
    bioEn: sanitizeStringField(r.bioEn, 1500) || fallback.bioEn,
    bioAr: sanitizeStringField(r.bioAr, 1500) || fallback.bioAr,
    currentFocusEn: fallback.currentFocusEn || sanitizeStringField(r.currentFocusEn, 500),
    currentFocusAr: fallback.currentFocusAr || sanitizeStringField(r.currentFocusAr, 500),
    futureFocusEn: fallback.futureFocusEn || sanitizeStringField(r.futureFocusEn, 500),
    futureFocusAr: fallback.futureFocusAr || sanitizeStringField(r.futureFocusAr, 500),
    learningTracks,
    practicalExperience,
    githubUrl: sanitizeSafeUrl(r.githubUrl) || fallback.githubUrl,
    linkedinUrl: sanitizeSafeUrl(r.linkedinUrl) || fallback.linkedinUrl,
    updatedAt: sanitizeIsoDate(r.updatedAt) || fallback.updatedAt,
  }) as unknown as ProfileSettingsRecord;
}

export function formatFirestoreUserError(err: unknown, language: Language): string {
  const isAr = language === 'ar';
  const raw = err instanceof Error ? err.message : String(err || '');
  let extractedError = raw;
  let pathContext = '';
  let codeContext =
    err && typeof err === 'object' && 'code' in err && typeof (err as { code?: unknown }).code === 'string'
      ? String((err as { code?: unknown }).code).trim()
      : '';

  if (raw.trim().startsWith('{')) {
    try {
      const parsed = JSON.parse(raw) as {
        error?: unknown;
        code?: unknown;
        operationType?: unknown;
        path?: unknown;
      };
      if (parsed && typeof parsed === 'object' && typeof parsed.error === 'string') {
        extractedError = parsed.error;
        if (typeof parsed.code === 'string' && parsed.code.trim()) {
          codeContext = parsed.code.trim();
        }
        if (typeof parsed.path === 'string' && parsed.path) {
          pathContext = parsed.path;
        }
      }
    } catch {
      // Not structured JSON error info; continue using raw message
    }
  }

  const lower = `${codeContext} ${extractedError}`.toLowerCase();
  const codeSuffix = codeContext ? ` [${codeContext}]` : '';
  if (lower.includes('permission') || lower.includes('insufficient')) {
    return isAr
      ? `تم رفض العملية لعدم توافر الصلاحية أو لمخالفة قواعد البيانات${pathContext ? ` (${pathContext})` : ''}${codeSuffix}.`
      : `Permission denied by Firestore security rules${pathContext ? ` (${pathContext})` : ''}${codeSuffix}.`;
  }
  if (
    lower.includes('unavailable') ||
    lower.includes('offline') ||
    lower.includes('network') ||
    lower.includes('deadline-exceeded')
  ) {
    return isAr
      ? `تعذر الاتصال بخدمة قاعدة البيانات حالياً. يرجى التحقق من الشبكة والمحاولة مجدداً${codeSuffix}.`
      : `Database service is temporarily unavailable. Check your connection and retry${codeSuffix}.`;
  }
  if (lower.includes('quota')) {
    return isAr
      ? `تم تجاوز حصة الاستخدام اليومية لقاعدة البيانات مؤقتاً${codeSuffix}.`
      : `Daily Firestore usage quota exceeded temporarily${codeSuffix}.`;
  }
  if (lower.includes('not-found') || lower.includes('no document to update')) {
    return isAr
      ? `السجل المطلوب غير موجود أو تم حذفه مسبقاً${codeSuffix}.`
      : `The requested document could not be found${codeSuffix}.`;
  }
  if (lower.includes('unauthenticated')) {
    return isAr
      ? `انتهت جلسة المصادقة. يرجى إعادة تسجيل الدخول بحساب المالك${codeSuffix}.`
      : `Authentication session expired. Please sign in again as owner${codeSuffix}.`;
  }

  return (
    `${extractedError.trim()}${codeSuffix}`.trim() ||
    (isAr ? 'حدث خطأ غير متوقع أثناء تنفيذ العملية.' : 'An unexpected operation error occurred.')
  );
}

export function sortRecordsDeterministically<
  T extends { id: string; publishedAt?: string; updatedAt?: string; createdAt?: string }
>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const timeA = Date.parse(a.publishedAt || a.updatedAt || a.createdAt || '') || 0;
    const timeB = Date.parse(b.publishedAt || b.updatedAt || b.createdAt || '') || 0;
    if (timeB !== timeA) return timeB - timeA;
    return a.id.localeCompare(b.id);
  });
}

export interface ValidationOutcome {
  valid: boolean;
  error?: string;
}

export function validateProjectForSave(project: Omit<ProjectRecord, 'id'>): ValidationOutcome {
  if (!project.titleEn?.trim() || !project.titleAr?.trim()) {
    return { valid: false, error: 'Both English and Arabic project titles are required.' };
  }
  if (!sanitizeSlug(project.slug || project.titleEn)) {
    return { valid: false, error: 'Valid URL slug is required.' };
  }
  if (project.visibility !== 'public' && project.visibility !== 'internal_archive') {
    return { valid: false, error: 'Visibility must be either public or internal_archive.' };
  }
  if (!ALLOWED_PROJECT_STATUS_TYPES.includes(project.statusType)) {
    return { valid: false, error: 'Invalid project status classification.' };
  }
  if (!isValidOptionalUrl(project.url)) {
    return { valid: false, error: 'Live Demo URL must be a valid http:// or https:// link.' };
  }
  if (!isValidOptionalUrl(project.repoUrl)) {
    return { valid: false, error: 'Repository URL must be a valid http:// or https:// link.' };
  }
  if (!isValidOptionalUrl(project.coverImageUrl)) {
    return { valid: false, error: 'Cover Image URL must be a valid http:// or https:// link.' };
  }

  if (project.publicationStatus === 'published') {
    const descEn = (project.descriptionEn || project.summaryEn || '').trim();
    const descAr = (project.descriptionAr || project.summaryAr || '').trim();
    if (descEn.length < 12 || descAr.length < 12) {
      return {
        valid: false,
        error:
          'Published projects require meaningful English and Arabic descriptions (at least 12 characters each). Save as Draft while editing.',
      };
    }
    if (
      project.coverImageUrl?.trim() &&
      !project.coverImageAltEn?.trim() &&
      !project.coverImageAltAr?.trim()
    ) {
      return {
        valid: false,
        error:
          'When publishing a project with a cover image URL, please provide descriptive alternative text (EN or AR) for accessibility.',
      };
    }
  }

  return { valid: true };
}

export function validateNoteForSave(note: Omit<LearningNoteRecord, 'id'>): ValidationOutcome {
  if (!note.titleEn?.trim() || !note.titleAr?.trim()) {
    return { valid: false, error: 'Both English and Arabic note titles are required.' };
  }
  if (!sanitizeSlug(note.slug || note.titleEn)) {
    return { valid: false, error: 'Valid URL slug is required.' };
  }

  if (note.publicationStatus === 'published') {
    if ((note.contentEn || '').trim().length < 20 || (note.contentAr || '').trim().length < 20) {
      return {
        valid: false,
        error:
          'Published learning notes require full bilingual study content (at least 20 characters in both English and Arabic). Save as Draft while writing.',
      };
    }
  }

  return { valid: true };
}

export function validateMilestoneForSave(
  milestone: Omit<MilestoneRecord, 'id'>
): ValidationOutcome {
  if (!milestone.titleEn?.trim() || !milestone.titleAr?.trim()) {
    return { valid: false, error: 'Both English and Arabic milestone titles are required.' };
  }
  if (!isValidOptionalUrl(milestone.externalReference)) {
    return {
      valid: false,
      error: 'External Reference URL must be a valid http:// or https:// link.',
    };
  }

  if (milestone.publicationStatus === 'published') {
    if (
      (milestone.descriptionEn || '').trim().length < 12 ||
      (milestone.descriptionAr || '').trim().length < 12
    ) {
      return {
        valid: false,
        error:
          'Published milestones require grounded English and Arabic descriptions (at least 12 characters each). Save as Draft while preparing.',
      };
    }
  }

  return { valid: true };
}

export function validateCourseForSave(course: Omit<CourseRecord, 'id'>): ValidationOutcome {
  if (!course.nameEn?.trim() || !course.nameAr?.trim()) {
    return { valid: false, error: 'Both English and Arabic course names are required.' };
  }
  if (!sanitizeSlug(course.slug || course.nameEn)) {
    return { valid: false, error: 'Valid course slug is required.' };
  }
  if (!course.semesterEn?.trim() || !course.semesterAr?.trim()) {
    return { valid: false, error: 'Both English and Arabic semester labels are required.' };
  }
  if (!course.yearEn?.trim() || !course.yearAr?.trim()) {
    return { valid: false, error: 'Both English and Arabic academic year labels are required.' };
  }
  if (
    !Number.isInteger(course.latticeNodeIndex) ||
    course.latticeNodeIndex < 0 ||
    course.latticeNodeIndex > 100
  ) {
    return { valid: false, error: 'Course order index must be an integer between 0 and 100.' };
  }
  return { valid: true };
}

export interface ContactValidationOutcome {
  valid: boolean;
  errors: Partial<Record<'senderName' | 'senderContact' | 'subject' | 'message', string>>;
  error?: string;
}

export function validateContactMessageInput(
  input: ContactMessageInput
): ContactValidationOutcome {
  const errors: Partial<Record<'senderName' | 'senderContact' | 'subject' | 'message', string>> =
    {};
  const isAr = input.language === 'ar';

  if (input.honeypot && input.honeypot.trim().length > 0) {
    return {
      valid: false,
      errors: {},
      error: isAr ? 'تعذر إرسال الرسالة.' : 'Unable to submit message.',
    };
  }

  const name = (input.senderName || '').trim();
  if (name.length < 2 || name.length > 120) {
    errors.senderName = isAr
      ? 'الاسم مطلوب (من ٢ إلى ١٢٠ حرفاً).'
      : 'Name must be between 2 and 120 characters.';
  }

  const contact = (input.senderContact || '').trim();
  if (contact.length > 200) {
    errors.senderContact = isAr
      ? 'وسيلة التواصل يجب ألا تتجاوز ٢٠٠ حرف.'
      : 'Contact handle or email must be 200 characters or fewer.';
  } else if (contact.includes('@') && !isValidOptionalEmail(contact)) {
    errors.senderContact = isAr
      ? 'يرجى إدخال بريد إلكتروني صحيح أو معرف تواصل صالح.'
      : 'Please enter a valid email address or social handle.';
  }

  const subject = (input.subject || '').trim();
  if (subject.length < 2 || subject.length > 160) {
    errors.subject = isAr
      ? 'الموضوع مطلوب (من ٢ إلى ١٦٠ حرفاً).'
      : 'Subject must be between 2 and 160 characters.';
  }

  const message = (input.message || '').trim();
  if (message.length < 10 || message.length > 2500) {
    errors.message = isAr
      ? 'الرسالة مطلوبة (من ١٠ إلى ٢٥٠٠ حرف).'
      : 'Message must be between 10 and 2500 characters.';
  }

  const firstError = Object.values(errors)[0];
  return {
    valid: Object.keys(errors).length === 0,
    errors,
    error: firstError,
  };
}

export type ProjectListFilter =
  | 'all'
  | 'active_practice'
  | 'archive_group'
  | ProjectStatusType;

export function filterProjectsByQuery(
  projects: ProjectItem[],
  queryText: string,
  statusFilter: ProjectListFilter,
  techFilter: string
): ProjectItem[] {
  const q = queryText.trim().toLowerCase();
  const normalizedTech = techFilter.trim().toLowerCase();

  return projects.filter((p) => {
    const isArchiveStatus =
      p.archiveGroup === 'experiments_discontinued' ||
      (p.archiveGroup !== 'showcase' &&
        (p.statusType === 'experimental' ||
          p.statusType === 'discontinued' ||
          p.statusType === 'paused' ||
          p.statusType === 'archived' ||
          p.statusType === 'needs_confirmation'));

    if (statusFilter === 'active_practice') {
      if (isArchiveStatus) return false;
    } else if (statusFilter === 'archive_group') {
      if (!isArchiveStatus) return false;
    } else if (statusFilter !== 'all' && p.statusType !== statusFilter) {
      return false;
    }

    if (normalizedTech && normalizedTech !== 'all') {
      const hasTech = p.technologies.some((t) => t.toLowerCase() === normalizedTech);
      if (!hasTech) return false;
    }
    if (!q) return true;

    const haystack = [
      p.id,
      p.titleEn,
      p.titleAr,
      p.descriptionEn,
      p.descriptionAr,
      p.statusEn || '',
      p.statusAr || '',
      ...(p.technologies || []),
    ]
      .join(' ')
      .toLowerCase();

    return haystack.includes(q);
  });
}

export function filterNotesByQuery(
  notes: LearningNoteRecord[],
  queryText: string,
  topicFilter: string
): LearningNoteRecord[] {
  const q = queryText.trim().toLowerCase();
  const normalizedTopic = topicFilter.trim().toLowerCase();

  return notes.filter((note) => {
    if (normalizedTopic && normalizedTopic !== 'all') {
      const hasTopic = (note.topicLabels || []).some((t) => t.toLowerCase() === normalizedTopic);
      if (!hasTopic) return false;
    }
    if (!q) return true;

    const haystack = [
      note.slug,
      note.titleEn,
      note.titleAr,
      note.summaryEn || '',
      note.summaryAr || '',
      note.contentEn,
      note.contentAr,
      ...(note.topicLabels || []),
    ]
      .join(' ')
      .toLowerCase();

    return haystack.includes(q);
  });
}

export function resolveNoteCategoryAndTags(
  topicLabels: string[] | undefined,
  validCategoryKeys: string[]
): { categoryKey: string | null; tags: string[] } {
  const labels = Array.isArray(topicLabels) ? topicLabels : [];
  const canonicalByLower = new Map<string, string>();
  for (const key of validCategoryKeys) {
    const cleanKey = String(key || '').trim();
    if (cleanKey && !canonicalByLower.has(cleanKey.toLowerCase())) {
      canonicalByLower.set(cleanKey.toLowerCase(), cleanKey);
    }
  }

  let matchedCategory: string | null = null;
  let matchedIndex = -1;

  for (let i = 0; i < labels.length; i++) {
    const clean = String(labels[i] || '').trim();
    if (!clean) continue;
    const canonical = canonicalByLower.get(clean.toLowerCase());
    if (canonical) {
      matchedCategory = canonical;
      matchedIndex = i;
      break;
    }
  }

  const tags: string[] = [];
  const seenTagLower = new Set<string>();
  if (matchedCategory) {
    seenTagLower.add(matchedCategory.toLowerCase());
  }

  for (let i = 0; i < labels.length; i++) {
    if (i === matchedIndex) continue;
    const clean = String(labels[i] || '').trim();
    if (!clean) continue;
    const lower = clean.toLowerCase();
    if (seenTagLower.has(lower)) continue;
    seenTagLower.add(lower);
    tags.push(clean);
  }

  return { categoryKey: matchedCategory, tags };
}

export interface NotesCatalogFilterOptions {
  queryText: string;
  categoryFilter: string;
  tagFilter: string;
  validCategoryKeys: string[];
}

export function filterNotesCatalog(
  notes: LearningNoteRecord[],
  options: NotesCatalogFilterOptions
): LearningNoteRecord[] {
  const q = options.queryText.trim().toLowerCase();
  const normalizedCategory = options.categoryFilter.trim().toLowerCase();
  const normalizedTag = options.tagFilter.trim().toLowerCase();

  return notes.filter((note) => {
    const { categoryKey, tags } = resolveNoteCategoryAndTags(
      note.topicLabels,
      options.validCategoryKeys
    );

    if (normalizedCategory && normalizedCategory !== 'all') {
      if (!categoryKey || categoryKey.toLowerCase() !== normalizedCategory) {
        return false;
      }
    }

    if (normalizedTag && normalizedTag !== 'all') {
      const hasTag = tags.some((t) => t.toLowerCase() === normalizedTag);
      if (!hasTag) return false;
    }

    if (!q) return true;

    const haystack = [
      note.slug,
      note.titleEn,
      note.titleAr,
      note.summaryEn || '',
      note.summaryAr || '',
      note.contentEn,
      note.contentAr,
      ...(note.topicLabels || []),
    ]
      .join(' ')
      .toLowerCase();

    return haystack.includes(q);
  });
}

const AR_PROJECT_TECH_LABELS: Record<string, string> = {
  'local ai systems': 'أنظمة الذكاء الاصطناعي المحلية',
  'privacy-first concepts': 'مفاهيم الأولوية للخصوصية',
  'discontinued / archived': 'متوقف / مؤرشف',
  'system design': 'تصميم الأنظمة',
  'assistant workflows': 'مسارات المساعدات الذكية',
  planning: 'التخطيط المنهجي',
  'modular boundaries': 'الحدود المعيارية',
  'data structures': 'هياكل البيانات',
  algorithms: 'الخوارزميات',
  'problem solving': 'حل المشكلات',
  'digital exploration': 'استكشاف رقمي',
  'archived concept': 'فكرة مؤرشفة',
  'concept exploration': 'استكشاف مفاهيمي',
  'archived venture': 'مشروع أولي مؤرشف',
  'ai exploration': 'استكشاف الذكاء الاصطناعي',
  'ai-directed': 'توجيه بأدوات الذكاء الاصطناعي',
  'ai-directed experiment': 'تجربة موجّهة بالذكاء الاصطناعي',
  'needs confirmation': 'قيد المراجعة',
};

export function localizeProjectTech(tech: string, isRtl: boolean): string {
  const clean = String(tech || '').trim();
  if (!clean || !isRtl) return clean;
  return AR_PROJECT_TECH_LABELS[clean.toLowerCase()] || clean;
}


