import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BACKUP_SCHEMA_VERSION,
  computeBackupDiff,
  createPortfolioBackupPayload,
  parseAndValidateBackupJson,
} from './backupService';
import { CourseRecord, MilestoneRecord, ProfileSettingsRecord, ProjectRecord } from '../types';

const SAMPLE_PROJECT: ProjectRecord = {
  id: 'cpp-problem-solving',
  slug: 'cpp-problem-solving',
  titleEn: 'C++ & Problem Solving',
  titleAr: 'لغة C++ وحل المشكلات',
  statusEn: 'Active Practice',
  statusAr: 'ممارسة نشطة',
  statusType: 'practicing',
  publicationStatus: 'published',
  visibility: 'public',
  summaryEn: 'Structured C++ practice.',
  summaryAr: 'تدريب منظم بلغة C++.',
  descriptionEn: 'Structured C++ practice.',
  descriptionAr: 'تدريب منظم بلغة C++.',
  technologies: ['C++'],
  url: 'https://github.com/dahaliztupe-sketch',
  createdAt: '2026-10-01T00:00:00.000Z',
  updatedAt: '2026-10-01T00:00:00.000Z',
  publishedAt: '2026-10-01T00:00:00.000Z',
};

const SAMPLE_COURSE: CourseRecord = {
  id: 'intro-to-ai',
  slug: 'intro-to-ai',
  nameEn: 'Introduction to Artificial Intelligence',
  nameAr: 'مقدمة في الذكاء الاصطناعي',
  semesterEn: 'Semester 1',
  semesterAr: 'الفصل الأول',
  yearEn: 'Year 1',
  yearAr: 'السنة الأولى',
  category: 'computational',
  latticeNodeIndex: 0,
  publicationStatus: 'published',
  createdAt: '2026-10-01T00:00:00.000Z',
  updatedAt: '2026-10-01T00:00:00.000Z',
};

const SAMPLE_MILESTONE: MilestoneRecord = {
  id: 'ms-1',
  titleEn: 'First Milestone',
  titleAr: 'أول معلم',
  dateEn: 'Oct 2026',
  dateAr: 'أكتوبر 2026',
  category: 'academic',
  descriptionEn: 'Started intelligent computing.',
  descriptionAr: 'بدأت الحوسبة الذكية.',
  publicationStatus: 'draft',
  createdAt: '2026-10-01T00:00:00.000Z',
  updatedAt: '2026-10-01T00:00:00.000Z',
};

const SAMPLE_PROFILE: ProfileSettingsRecord = {
  nameEn: 'Abdalrahman Mostafa',
  nameAr: 'عبد الرحمن مصطفى',
  titleEn: 'Student',
  titleAr: 'طالب',
  facultyEn: 'Faculty of Science',
  facultyAr: 'كلية العلوم',
  bioEn: 'Bio EN',
  bioAr: 'نبذة',
  currentFocusEn: 'C++',
  currentFocusAr: 'C++',
  futureFocusEn: 'Python',
  futureFocusAr: 'بايثون',
  githubUrl: 'https://github.com/dahaliztupe-sketch',
  linkedinUrl: 'https://www.linkedin.com/in/abdalrahman-mostafa-/',
};

test('createPortfolioBackupPayload exports schema v1 without private contactEmail or contactMessages', () => {
  const legacyProfileWithPii = {
    ...SAMPLE_PROFILE,
    contactEmail: 'abdalrahman32008@gmail.com',
  } as unknown as ProfileSettingsRecord;

  const payload = createPortfolioBackupPayload({
    projects: [SAMPLE_PROJECT],
    courses: [SAMPLE_COURSE],
    notes: [],
    milestones: [SAMPLE_MILESTONE],
    profile: legacyProfileWithPii,
    exportedAt: '2026-11-16T00:00:00.000Z',
  });

  assert.equal(payload.schemaVersion, BACKUP_SCHEMA_VERSION);
  assert.equal(payload.app, 'neural-atlas');
  assert.equal('contactMessages' in payload, false);
  assert.equal(payload.profile ? 'contactEmail' in payload.profile : false, false);
  assert.equal(JSON.stringify(payload).includes('abdalrahman32008@gmail.com'), false);
  assert.equal(payload.collections.projects.length, 1);
  assert.equal(payload.collections.courses.length, 1);
  assert.equal(payload.collections.milestones.length, 1);
});

test('parseAndValidateBackupJson rejects invalid JSON, wrong schemaVersion, wrong app, and unsafe URLs', () => {
  assert.equal(parseAndValidateBackupJson('').valid, false);
  assert.equal(parseAndValidateBackupJson('{not json').valid, false);

  const wrongSchema = parseAndValidateBackupJson(
    JSON.stringify({ schemaVersion: 99, app: 'neural-atlas', collections: {} })
  );
  assert.equal(wrongSchema.valid, false);

  const wrongApp = parseAndValidateBackupJson(
    JSON.stringify({ schemaVersion: 1, app: 'other-app', collections: {} })
  );
  assert.equal(wrongApp.valid, false);

  const unsafeProjectUrl = parseAndValidateBackupJson(
    JSON.stringify({
      schemaVersion: 1,
      app: 'neural-atlas',
      collections: {
        projects: [{ ...SAMPLE_PROJECT, url: 'javascript:alert(1)' }],
        courses: [],
        notes: [],
        milestones: [],
      },
    })
  );
  assert.equal(unsafeProjectUrl.valid, false);
  assert.ok(unsafeProjectUrl.errors.some((e) => e.includes('projects[0]')));
});

test('parseAndValidateBackupJson + computeBackupDiff accurately detect conflicts and new records', () => {
  const payload = createPortfolioBackupPayload({
    projects: [SAMPLE_PROJECT, { ...SAMPLE_PROJECT, id: 'new-project', slug: 'new-project' }],
    courses: [SAMPLE_COURSE],
    notes: [],
    milestones: [SAMPLE_MILESTONE],
    profile: SAMPLE_PROFILE,
  });

  const parsed = parseAndValidateBackupJson(JSON.stringify(payload));
  assert.equal(parsed.valid, true);
  assert.ok(parsed.payload);

  const diff = computeBackupDiff(parsed.payload, {
    projects: [SAMPLE_PROJECT],
    courses: [],
    notes: [],
    milestones: [SAMPLE_MILESTONE],
  });

  assert.equal(diff.projects.incoming, 2);
  assert.equal(diff.projects.newCount, 1);
  assert.equal(diff.projects.conflictCount, 1);
  assert.deepEqual(diff.projects.conflictingIds, ['cpp-problem-solving']);

  assert.equal(diff.courses.newCount, 1);
  assert.equal(diff.courses.conflictCount, 0);

  assert.equal(diff.milestones.newCount, 0);
  assert.equal(diff.milestones.conflictCount, 1);

  assert.equal(diff.totalIncomingRecords, 4);
  assert.equal(diff.totalConflicts, 2);
  assert.equal(diff.hasProfileInBackup, true);
});
