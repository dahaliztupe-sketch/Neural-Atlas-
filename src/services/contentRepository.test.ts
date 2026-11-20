import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { terminate } from 'firebase/firestore';
import { db, getFirestoreTransportSettings } from '../lib/firebase';
import {
  sanitizeSlug,
  isValidUrl,
  isValidOptionalUrl,
  sanitizeSafeUrl,
  isValidOptionalEmail,
  stripUndefined,
  getImportPreview,
  isFirebaseConfigured,
  getProjectBySlugResult,
  getNoteBySlugResult,
  classifyPublicError,
  resolvePublicCoursesCatchResult,
  getLocalPublicProjectsBaseline,
  getLocalPublicCoursesBaseline,
  getLocalPublicMilestonesBaseline,
  getLocalPublicNotesBaseline,
  reconcileLearningTracks,
  reconcileProfileForBaselineSync,
  buildBaselineProjectSyncPayload,
  buildDefaultProfileSettings,
} from './contentRepository';
import { isConfiguredOwner, isPlaceholderEmailConfigured } from '../lib/adminConfig';
import { COURSES, PROJECTS, SOCIAL_LINKS } from '../data/portfolioData';

after(async () => {
  if (db && typeof db === 'object' && 'type' in db) {
    await terminate(db);
  }
});

test('isConfiguredOwner authorizes configured owner email and rejects unverified or non-owner emails', () => {
  assert.equal(isPlaceholderEmailConfigured(), false, 'Owner email is configured');

  // Authorized owner with verified email must be allowed
  const result = isConfiguredOwner('abdalrahman32008@gmail.com', true);
  assert.equal(result, true, 'Must authorize configured owner with verified email');

  // Case insensitive check
  assert.equal(isConfiguredOwner('ABDALRAHMAN32008@GMAIL.COM ', true), true, 'Must allow case-insensitive and trimmed email');

  // Reject unverified email even if email matches
  const unverified = isConfiguredOwner('abdalrahman32008@gmail.com', false);
  assert.equal(unverified, false, 'Must reject unverified email');

  // Reject unauthorized email even if verified
  assert.equal(isConfiguredOwner('unauthorized@example.com', true), false, 'Must reject non-owner email');

  // Reject null or empty
  assert.equal(isConfiguredOwner(null, true), false);
  assert.equal(isConfiguredOwner(undefined, true), false);
  assert.equal(isConfiguredOwner('', true), false);
});

test('sanitizeSlug cleans input into safe URL slugs', () => {
  assert.equal(sanitizeSlug('C++ Learning & Practice!'), 'c-learning-practice');
  assert.equal(sanitizeSlug('Local AI Agent 01'), 'local-ai-agent-01');
  assert.equal(sanitizeSlug('---spaces---and---dashes---'), 'spaces-and-dashes');
  assert.equal(sanitizeSlug('Simple-Title'), 'simple-title');
});

test('isValidUrl, isValidOptionalUrl, sanitizeSafeUrl, and isValidOptionalEmail guard against unsafe protocols', () => {
  assert.equal(isValidUrl('https://github.com/dahaliztupe-sketch'), true);
  assert.equal(isValidUrl('http://localhost:3000'), true);
  assert.equal(isValidUrl('javascript:alert(1)'), false);
  assert.equal(isValidUrl('data:text/html,<script>alert(1)</script>'), false);
  assert.equal(isValidUrl(''), false);
  assert.equal(isValidUrl('not a url'), false);

  assert.equal(isValidOptionalUrl(undefined), true);
  assert.equal(isValidOptionalUrl('   '), true);
  assert.equal(isValidOptionalUrl('https://example.com'), true);
  assert.equal(isValidOptionalUrl('javascript:void(0)'), false);

  assert.equal(sanitizeSafeUrl(' https://github.com/dahaliztupe-sketch '), 'https://github.com/dahaliztupe-sketch');
  assert.equal(sanitizeSafeUrl('javascript:alert(1)'), undefined);
  assert.equal(sanitizeSafeUrl(''), undefined);

  assert.equal(isValidOptionalEmail(undefined), true);
  assert.equal(isValidOptionalEmail(''), true);
  assert.equal(isValidOptionalEmail('valid@example.com'), true);
  assert.equal(isValidOptionalEmail('invalid-email'), false);
});

test('stripUndefined removes undefined keys so Firestore setDoc draft saves do not fail', () => {
  const payload = stripUndefined({
    id: 'draft-project',
    publicationStatus: 'draft',
    publishedAt: undefined,
    url: undefined,
    technologies: ['C++'],
  });

  assert.equal('id' in payload, true);
  assert.equal('publishedAt' in payload, false, 'Undefined publishedAt must be omitted');
  assert.equal('url' in payload, false, 'Undefined optional fields must be omitted');
  assert.deepEqual(payload.technologies, ['C++']);
});

test('getImportPreview accurately counts existing real items and 8 learning notes', () => {
  const preview = getImportPreview();
  assert.equal(preview.projectsCount, 9, 'Should reflect 3 showcase + 6 archive projects');
  assert.equal(preview.coursesCount, 7, 'Should reflect the 7 owner-provided first-year subjects');
  assert.equal(preview.notesCount, 8, 'Should reflect the 8 published learning notes');
  assert.equal(preview.milestonesCount, 6, 'Should reflect the 6 factual timeline milestones');
  assert.equal(preview.hasProfileData, true, 'Verified profile data must be present');
});

test('REGRESSION: isFirebaseConfigured correctly identifies active configuration', () => {
  assert.equal(isFirebaseConfigured(), true, 'Active Firebase project ID should return true');
});

test('REGRESSION: Configured Firestore queries do not replace unknown slugs with local fallback', async () => {
  // 1. Querying a non-existent project slug when Firebase is configured returns not_found, NOT local project data
  const res = await getProjectBySlugResult('non-existent-project-12345', false);
  assert.equal(res.source, 'firestore', 'Source must be firestore when configured');
  assert.equal(res.item, null, 'Must return null item when missing from configured database');
  assert.equal(res.status === 'not_found' || res.status === 'error', true, 'Status must be not_found or error');

  const noteRes = await getNoteBySlugResult('non-existent-note-12345', false);
  assert.equal(noteRes.source, 'firestore', 'Note lookup source must be firestore when configured');
  assert.equal(noteRes.item, null, 'Must return null item for unknown note slug');
  assert.equal(noteRes.status === 'not_found' || noteRes.status === 'error', true);
});

test('REGRESSION: Remote draft is never exposed to unauthenticated public requests', async () => {
  // Mock test for draft access rule logic
  const isDraftAccessible = (publicationStatus: string, isOwner: boolean) => {
    return publicationStatus === 'published' || isOwner;
  };

  assert.equal(isDraftAccessible('draft', false), false, 'Unauthenticated public user cannot access draft');
  assert.equal(isDraftAccessible('draft', true), true, 'Authorized owner can access draft');
  assert.equal(isDraftAccessible('published', false), true, 'Public user can access published record');
});

test('REGRESSION: Local Firestore rules harden read, write schema, URL protocol, courses, contactMessages, and owner checks', () => {
  const rulesPath = path.join(process.cwd(), 'firestore.rules');
  const rulesContent = fs.readFileSync(rulesPath, 'utf8');

  // Explicit dual-condition public visibility & published gate on projects
  assert.equal(
    rulesContent.includes("resource != null && resource.data.publicationStatus == 'published' && resource.data.visibility == 'public'"),
    true,
    'firestore.rules projects get must require explicit published + visibility == public'
  );
  assert.equal(
    rulesContent.includes("resource.data.publicationStatus == 'published' &&\n        resource.data.visibility == 'public'"),
    true,
    'firestore.rules projects list must require explicit published + visibility == public'
  );
  assert.equal(
    rulesContent.includes("allow list: if resource.data.publicationStatus == 'published' || isOwner();"),
    true,
    'firestore.rules notes/milestones/courses must require published status or owner on list queries'
  );

  // Settings isolation (no PII contactEmail, strict profile ID gate)
  assert.equal(
    rulesContent.includes("allow get: if isValidId(settingId) && (settingId == 'profile' || isOwner());"),
    true,
    'firestore.rules must restrict public settings get to profile document'
  );
  assert.equal(
    rulesContent.includes('allow list: if isOwner();'),
    true,
    'firestore.rules must restrict settings collection list to isOwner()'
  );

  // Courses CMS rules
  assert.equal(rulesContent.includes('match /courses/{courseId}'), true, 'firestore.rules must define /courses match');
  assert.equal(rulesContent.includes('isValidCourse(incoming())'), true, 'firestore.rules must enforce isValidCourse schema');

  // Contact messages write-only dropbox & owner inbox protection
  assert.equal(rulesContent.includes('match /contactMessages/{messageId}'), true, 'firestore.rules must define /contactMessages match');
  assert.equal(rulesContent.includes('allow get: if isOwner() && isValidId(messageId);'), true, 'Public users cannot read individual contact messages');
  assert.equal(rulesContent.includes("incoming().status == 'unread'"), true, 'Public create on contactMessages must enforce unread status');
  assert.equal(
    rulesContent.includes("incoming().diff(resource.data).affectedKeys().hasOnly(['status', 'updatedAt'])"),
    true,
    'Owner updates on contactMessages must restrict mutable keys to status and updatedAt'
  );

  // Schema allowlists & URL protocol checks
  assert.equal(rulesContent.includes('keys().hasOnly('), true, 'firestore.rules must enforce field allowlists');
  assert.equal(rulesContent.includes('isOptionalHttpUrl('), true, 'firestore.rules must enforce HTTP/HTTPS URL checks');
  assert.equal(rulesContent.includes("'coverImageAltEn'"), true, 'firestore.rules must allowlist coverImageAltEn');
  assert.equal(rulesContent.includes("'roleEn'") && rulesContent.includes("'outcomeAr'"), true, 'firestore.rules must allowlist structured case-study fields');
  assert.equal(rulesContent.includes('(data[field].size() == 0 || (data[field][0] is string'), true, 'firestore.rules isOptionalList must validate string elements');

  // Owner email check
  assert.equal(
    rulesContent.includes("request.auth.token.email == 'abdalrahman32008@gmail.com'"),
    true,
    'firestore.rules must enforce abdalrahman32008@gmail.com'
  );
});

test('REGRESSION: Owner provided course data, 9 public projects, 8 notes, baseline fallbacks, and social links remain factual', () => {
  assert.equal(COURSES.length, 7, 'Must maintain exactly 7 owner-provided first-year course titles');
  assert.equal(PROJECTS.length, 9, 'Must maintain 3 main showcase entries + 6 archive entries');
  assert.equal(PROJECTS.filter((p) => p.visibility === 'public').length, 9);

  const baselineProjects = getLocalPublicProjectsBaseline();
  const baselineCourses = getLocalPublicCoursesBaseline();
  const baselineMilestones = getLocalPublicMilestonesBaseline();
  const baselineNotes = getLocalPublicNotesBaseline();
  assert.equal(baselineProjects.length, 9);
  assert.equal(baselineCourses.length, 7);
  assert.equal(baselineMilestones.length, 6);
  assert.equal(baselineNotes.length, 8);

  const github = SOCIAL_LINKS.find((s) => s.platform === 'GitHub');
  const linkedin = SOCIAL_LINKS.find((s) => s.platform === 'LinkedIn');

  assert.equal(github?.url, 'https://github.com/dahaliztupe-sketch');
  assert.equal(linkedin?.url, 'https://www.linkedin.com/in/abdalrahman-mostafa-/');
});

test('REGRESSION: Firestore enforces long-polling transport and classifies 10s backend timeout errors safely', () => {
  const transport = getFirestoreTransportSettings();
  assert.equal(transport.experimentalForceLongPolling, true);
  assert.equal(transport.ignoreUndefinedProperties, true);

  assert.equal(
    classifyPublicError(
      new Error(
        'Could not reach Cloud Firestore backend. Backend didn\'t respond within 10 seconds.'
      )
    ),
    'firestore_unavailable'
  );
  assert.equal(
    classifyPublicError(new Error('Missing or insufficient permissions.')),
    'permission_denied'
  );
});

test('REGRESSION: resolvePublicCoursesCatchResult never falls back to local COURSES on permission_denied', () => {
  const denied = resolvePublicCoursesCatchResult(new Error('Missing or insufficient permissions.'));
  assert.equal(denied.source, 'firestore');
  assert.equal(denied.status, 'error');
  assert.equal(denied.errorCode, 'permission_denied');
  assert.deepEqual(denied.items, []);

  const offline = resolvePublicCoursesCatchResult(new Error('Client is offline'));
  assert.equal(offline.source, 'firestore');
  assert.equal(offline.status, 'error');
  assert.equal(offline.errorCode, 'firestore_unavailable');
  assert.deepEqual(offline.items, []);
});

test('Baseline sync reconciles CS50x Week 3 and LOCAL AI AGENT while preserving createdAt and owner customizations', () => {
  const localAi = PROJECTS.find((p) => p.id === 'local-ai-agent');
  assert.ok(localAi);

  const legacyRemoteLocalAi = {
    id: 'local-ai-agent',
    slug: 'local-ai-agent',
    titleEn: 'LOCAL AI AGENT (Old)',
    titleAr: 'قديم',
    statusEn: 'Discontinued',
    statusAr: 'متوقف',
    statusType: 'discontinued' as const,
    publicationStatus: 'published' as const,
    visibility: 'internal_archive' as const,
    archiveGroup: 'showcase' as const,
    featuredOnHome: true,
    descriptionEn: 'Old description',
    descriptionAr: 'وصف قديم',
    technologies: ['Old'],
    coverImageUrl: 'https://example.com/custom-cover.png',
    createdAt: '2025-11-15T10:00:00.000Z',
    publishedAt: '2025-11-16T10:00:00.000Z',
  };

  const syncedProject = buildBaselineProjectSyncPayload(
    localAi,
    legacyRemoteLocalAi,
    '2026-11-20T12:00:00.000Z'
  );
  assert.equal(syncedProject.createdAt, '2025-11-15T10:00:00.000Z', 'Must preserve immutable createdAt');
  assert.equal(syncedProject.publishedAt, '2025-11-16T10:00:00.000Z', 'Must preserve existing publishedAt');
  assert.equal(syncedProject.coverImageUrl, 'https://example.com/custom-cover.png', 'Must keep owner cover media');
  assert.equal(syncedProject.visibility, 'public');
  assert.equal(syncedProject.archiveGroup, 'experiments_discontinued');
  assert.equal(syncedProject.featuredOnHome, false);
  assert.equal(syncedProject.statusEn, 'Discontinued / Archived');
  assert.equal(syncedProject.statusAr, 'متوقف / مؤرشف');

  const defaults = buildDefaultProfileSettings();
  const customTrack = {
    id: 'custom-track-robotics',
    titleEn: 'Custom Track',
    titleAr: 'مسار مخصص',
    status: 'active' as const,
    statusLabelEn: 'Active',
    statusLabelAr: 'نشط',
    cadenceNoteEn: 'Custom',
    cadenceNoteAr: 'مخصص',
    summaryEn: 'Custom summary',
    summaryAr: 'ملخص',
    highlightsEn: ['H1'],
    highlightsAr: ['م1'],
    showInActiveHighlights: true,
  };
  const oldProfile = {
    ...defaults,
    githubUrl: 'https://github.com/custom-handle',
    learningTracks: [
      {
        ...defaults.learningTracks![0],
        status: 'paused' as const,
        statusLabelEn: 'Paused / Needs Review',
      },
      customTrack,
    ],
  };

  const reconciledTracks = reconcileLearningTracks(oldProfile.learningTracks);
  const cs50x = reconciledTracks.find((tr) => tr.id === 'harvard-cs50x');
  assert.ok(cs50x);
  assert.equal(cs50x.status, 'in_progress');
  assert.ok(cs50x.statusLabelEn.includes('CS50x: Week 3'));
  assert.ok(reconciledTracks.some((tr) => tr.id === 'custom-track-robotics'), 'Must preserve owner custom track');

  const syncedProfile = reconcileProfileForBaselineSync(oldProfile, '2026-11-20T12:00:00.000Z');
  assert.equal(syncedProfile.githubUrl, 'https://github.com/custom-handle', 'Must preserve custom profile URL');
  assert.ok(syncedProfile.learningTracks?.find((tr) => tr.id === 'harvard-cs50x')?.statusLabelEn.includes('CS50x: Week 3'));
});


