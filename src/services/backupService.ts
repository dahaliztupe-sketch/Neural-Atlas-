import {
  CourseRecord,
  LearningNoteRecord,
  MilestoneRecord,
  ProfileSettingsRecord,
  ProjectRecord,
} from '../types';
import {
  normalizeCourseRecord,
  normalizeMilestoneRecord,
  normalizeNoteRecord,
  normalizeProfileRecord,
  normalizeProjectRecord,
  validateCourseForSave,
  validateMilestoneForSave,
  validateNoteForSave,
  validateProjectForSave,
  isValidOptionalUrl,
} from '../lib/validation';
import {
  OWNER_INFO,
  SOCIAL_LINKS,
  LEARNING_TRACKS,
  PRACTICAL_EXPERIENCE,
} from '../data/portfolioData';

export const BACKUP_SCHEMA_VERSION = 1 as const;

export interface NeuralAtlasBackupPayload {
  schemaVersion: typeof BACKUP_SCHEMA_VERSION;
  exportedAt: string;
  app: 'neural-atlas';
  collections: {
    projects: ProjectRecord[];
    courses: CourseRecord[];
    notes: LearningNoteRecord[];
    milestones: MilestoneRecord[];
  };
  profile: ProfileSettingsRecord | null;
}

export interface BackupValidationResult {
  valid: boolean;
  payload?: NeuralAtlasBackupPayload;
  errors: string[];
  warnings: string[];
}

export interface CollectionConflictSummary {
  incoming: number;
  newCount: number;
  conflictCount: number;
  conflictingIds: string[];
}

export interface BackupConflictDiff {
  projects: CollectionConflictSummary;
  courses: CollectionConflictSummary;
  notes: CollectionConflictSummary;
  milestones: CollectionConflictSummary;
  hasProfileInBackup: boolean;
  totalIncomingRecords: number;
  totalConflicts: number;
}

export type RestoreConflictStrategy = 'skip' | 'overwrite';

export interface RestoreExecutionResult {
  written: number;
  skipped: number;
  failed: number;
  details: string[];
}

const DEFAULT_FALLBACK_PROFILE: ProfileSettingsRecord = {
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
  updatedAt: '2026-10-01T00:00:00.000Z',
};

export function createPortfolioBackupPayload(input: {
  projects: ProjectRecord[];
  courses: CourseRecord[];
  notes: LearningNoteRecord[];
  milestones: MilestoneRecord[];
  profile: ProfileSettingsRecord | null;
  exportedAt?: string;
}): NeuralAtlasBackupPayload {
  // Never export private contact messages, auth credentials, or contactEmail PII
  const safeProfile: ProfileSettingsRecord | null = input.profile
    ? normalizeProfileRecord(input.profile, DEFAULT_FALLBACK_PROFILE)
    : null;

  return {
    schemaVersion: BACKUP_SCHEMA_VERSION,
    exportedAt: input.exportedAt || new Date().toISOString(),
    app: 'neural-atlas',
    collections: {
      projects: input.projects.map(({ legacyVisibilityMissing: _ignored, ...rest }) => ({ ...rest })),
      courses: input.courses.map((c) => ({ ...c })),
      notes: input.notes.map((n) => ({ ...n })),
      milestones: input.milestones.map((m) => ({ ...m })),
    },
    profile: safeProfile,
  };
}

export function parseAndValidateBackupJson(rawText: string): BackupValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!rawText || typeof rawText !== 'string' || !rawText.trim()) {
    return { valid: false, errors: ['Backup file is empty.'], warnings };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    return { valid: false, errors: ['File is not valid JSON.'], warnings };
  }

  if (!parsed || typeof parsed !== 'object') {
    return { valid: false, errors: ['Root JSON value must be an object.'], warnings };
  }

  const root = parsed as Record<string, unknown>;
  if (root.schemaVersion !== BACKUP_SCHEMA_VERSION) {
    errors.push(`Unsupported schemaVersion: ${String(root.schemaVersion)}. Expected ${BACKUP_SCHEMA_VERSION}.`);
  }
  if (root.app !== 'neural-atlas') {
    errors.push('Invalid backup identifier (expected app: "neural-atlas").');
  }
  if (!root.collections || typeof root.collections !== 'object') {
    errors.push('Missing "collections" object.');
  }

  if (errors.length > 0) {
    return { valid: false, errors, warnings };
  }

  const cols = root.collections as Record<string, unknown>;
  const rawProjects = Array.isArray(cols.projects) ? cols.projects : [];
  const rawCourses = Array.isArray(cols.courses) ? cols.courses : [];
  const rawNotes = Array.isArray(cols.notes) ? cols.notes : [];
  const rawMilestones = Array.isArray(cols.milestones) ? cols.milestones : [];

  if (!Array.isArray(cols.projects)) warnings.push('Missing projects array — defaulting to empty.');
  if (!Array.isArray(cols.courses)) warnings.push('Missing courses array — defaulting to empty.');
  if (!Array.isArray(cols.notes)) warnings.push('Missing notes array — defaulting to empty.');
  if (!Array.isArray(cols.milestones)) warnings.push('Missing milestones array — defaulting to empty.');

  const projects: ProjectRecord[] = [];
  rawProjects.forEach((item, idx) => {
    const rawObj = (item && typeof item === 'object' ? item : {}) as Record<string, unknown>;
    for (const urlField of ['url', 'repoUrl', 'coverImageUrl'] as const) {
      const rawVal = rawObj[urlField];
      if (typeof rawVal === 'string' && rawVal.trim() && !isValidOptionalUrl(rawVal)) {
        errors.push(`projects[${idx}].${urlField} uses a disallowed or invalid URL.`);
      }
    }
    const rawId = typeof rawObj.id === 'string'
      ? rawObj.id
      : `project-${idx + 1}`;
    const normalized = normalizeProjectRecord(rawId, item);
    if (!normalized) {
      errors.push(`projects[${idx}] is invalid or missing required bilingual titles.`);
      return;
    }
    const outcome = validateProjectForSave(normalized);
    if (!outcome.valid) {
      errors.push(`projects[${idx}] (${normalized.id}): ${outcome.error}`);
      return;
    }
    projects.push(normalized);
  });

  const courses: CourseRecord[] = [];
  rawCourses.forEach((item, idx) => {
    const rawId = typeof (item as Record<string, unknown>)?.id === 'string'
      ? ((item as Record<string, unknown>).id as string)
      : `course-${idx + 1}`;
    const normalized = normalizeCourseRecord(rawId, item);
    if (!normalized) {
      errors.push(`courses[${idx}] is invalid or missing required course names.`);
      return;
    }
    const outcome = validateCourseForSave(normalized);
    if (!outcome.valid) {
      errors.push(`courses[${idx}] (${normalized.id}): ${outcome.error}`);
      return;
    }
    courses.push(normalized);
  });

  const notes: LearningNoteRecord[] = [];
  rawNotes.forEach((item, idx) => {
    const rawId = typeof (item as Record<string, unknown>)?.id === 'string'
      ? ((item as Record<string, unknown>).id as string)
      : `note-${idx + 1}`;
    const normalized = normalizeNoteRecord(rawId, item);
    if (!normalized) {
      errors.push(`notes[${idx}] is invalid or missing required note titles.`);
      return;
    }
    const outcome = validateNoteForSave(normalized);
    if (!outcome.valid) {
      errors.push(`notes[${idx}] (${normalized.id}): ${outcome.error}`);
      return;
    }
    notes.push(normalized);
  });

  const milestones: MilestoneRecord[] = [];
  rawMilestones.forEach((item, idx) => {
    const rawObj = (item && typeof item === 'object' ? item : {}) as Record<string, unknown>;
    if (typeof rawObj.externalReference === 'string' && rawObj.externalReference.trim() && !isValidOptionalUrl(rawObj.externalReference)) {
      errors.push(`milestones[${idx}].externalReference uses a disallowed or invalid URL.`);
    }
    const rawId = typeof rawObj.id === 'string'
      ? rawObj.id
      : `milestone-${idx + 1}`;
    const normalized = normalizeMilestoneRecord(rawId, item);
    if (!normalized) {
      errors.push(`milestones[${idx}] is invalid or missing required milestone titles.`);
      return;
    }
    const outcome = validateMilestoneForSave(normalized);
    if (!outcome.valid) {
      errors.push(`milestones[${idx}] (${normalized.id}): ${outcome.error}`);
      return;
    }
    milestones.push(normalized);
  });

  let profile: ProfileSettingsRecord | null = null;
  if (root.profile && typeof root.profile === 'object') {
    const rawProfile = root.profile as Record<string, unknown>;
    for (const urlField of ['githubUrl', 'linkedinUrl'] as const) {
      const rawVal = rawProfile[urlField];
      if (typeof rawVal === 'string' && rawVal.trim() && !isValidOptionalUrl(rawVal)) {
        errors.push(`profile.${urlField} uses a disallowed or invalid URL.`);
      }
    }
    profile = normalizeProfileRecord(root.profile, DEFAULT_FALLBACK_PROFILE);
  }

  if (errors.length > 0) {
    return { valid: false, errors, warnings };
  }

  return {
    valid: true,
    payload: {
      schemaVersion: BACKUP_SCHEMA_VERSION,
      exportedAt: typeof root.exportedAt === 'string' ? root.exportedAt : new Date().toISOString(),
      app: 'neural-atlas',
      collections: {
        projects,
        courses,
        notes,
        milestones,
      },
      profile,
    },
    errors,
    warnings,
  };
}

function diffIds(incomingIds: string[], existingIds: Set<string>): CollectionConflictSummary {
  const conflictingIds: string[] = [];
  let newCount = 0;
  for (const id of incomingIds) {
    if (existingIds.has(id)) conflictingIds.push(id);
    else newCount++;
  }
  return {
    incoming: incomingIds.length,
    newCount,
    conflictCount: conflictingIds.length,
    conflictingIds,
  };
}

export function computeBackupDiff(
  payload: NeuralAtlasBackupPayload,
  existing: {
    projects: ProjectRecord[];
    courses: CourseRecord[];
    notes: LearningNoteRecord[];
    milestones: MilestoneRecord[];
  }
): BackupConflictDiff {
  const projDiff = diffIds(
    payload.collections.projects.map((p) => p.id),
    new Set(existing.projects.map((p) => p.id))
  );
  const courseDiff = diffIds(
    payload.collections.courses.map((c) => c.id),
    new Set(existing.courses.map((c) => c.id))
  );
  const noteDiff = diffIds(
    payload.collections.notes.map((n) => n.id),
    new Set(existing.notes.map((n) => n.id))
  );
  const milestoneDiff = diffIds(
    payload.collections.milestones.map((m) => m.id),
    new Set(existing.milestones.map((m) => m.id))
  );

  const totalIncomingRecords =
    projDiff.incoming + courseDiff.incoming + noteDiff.incoming + milestoneDiff.incoming;
  const totalConflicts =
    projDiff.conflictCount + courseDiff.conflictCount + noteDiff.conflictCount + milestoneDiff.conflictCount;

  return {
    projects: projDiff,
    courses: courseDiff,
    notes: noteDiff,
    milestones: milestoneDiff,
    hasProfileInBackup: Boolean(payload.profile),
    totalIncomingRecords,
    totalConflicts,
  };
}
