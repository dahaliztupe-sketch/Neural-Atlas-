import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { AppErrorBoundary } from '../components/AppErrorBoundary';
import {
  normalizeProjectRecord,
  normalizeNoteRecord,
  normalizeMilestoneRecord,
  normalizeProfileRecord,
  sortRecordsDeterministically,
  formatLocalizedDate,
  validateProjectForSave,
  validateNoteForSave,
  validateMilestoneForSave,
  normalizeCourseRecord,
  validateCourseForSave,
  normalizeContactMessageRecord,
  validateContactMessageInput,
  filterProjectsByQuery,
  filterNotesByQuery,
  isValidFirestoreDocId,
  sanitizeFirestoreDocId,
  formatFirestoreUserError,
} from './validation';
import {
  shouldEnableHero3D,
  resolveFrameloopMode,
  computeHeroCanvasOpacity,
  DESKTOP_3D_MIN_WIDTH,
} from '../components/world/worldCapability';
import {
  shouldResetErrorBoundary,
  resolveErrorBoundaryLang,
  buildErrorReport,
  registerErrorReporter,
  reportBoundaryError,
} from './errorBoundary';
import { ProfileSettingsRecord } from '../types';

const FALLBACK_PROFILE: ProfileSettingsRecord = {
  nameEn: 'Abdalrahman Mostafa',
  nameAr: 'عبدالرحمن مصطفى',
  titleEn: 'First-Year Intelligent Computing Student',
  titleAr: 'طالب بالسنة الأولى — الحوسبة الذكية',
  facultyEn: 'Faculty of Science, Al-Azhar University',
  facultyAr: 'كلية العلوم، جامعة الأزهر',
  bioEn: 'Exploring C++ and algorithms.',
  bioAr: 'أتعلم البرمجة والخوارزميات.',
  currentFocusEn: 'C++ & Semester 1',
  currentFocusAr: 'C++ ومواد الفصل الأول',
  futureFocusEn: 'Python & AI',
  futureFocusAr: 'بايثون والذكاء الاصطناعي',
  githubUrl: 'https://github.com/dahaliztupe-sketch',
  linkedinUrl: 'https://www.linkedin.com/in/abdalrahman-mostafa-/',
};

test('normalizeProjectRecord coerces malformed Firestore payloads safely without crashing', () => {
  assert.equal(normalizeProjectRecord('bad', null), null);
  assert.equal(normalizeProjectRecord('bad', { titleEn: '', titleAr: '' }), null);

  const normalized = normalizeProjectRecord('  My Cool Slug! ', {
    titleEn: '  Algorithm Visualizer  ',
    titleAr: '  عارض الخوارزميات  ',
    technologies: ['C++', 42, null, '   ', 'Algorithms'],
    url: 'javascript:alert(1)',
    repoUrl: 'https://github.com/dahaliztupe-sketch/visualizer',
    coverImageUrl: 'https://example.com/cover.png',
    coverImageAltEn: 'Screenshot of tree traversal',
    publicationStatus: 'invalid-status',
    statusType: 'unknown-type',
    createdAt: 'not-a-date',
    updatedAt: '2026-05-01T10:00:00Z',
  });

  assert.ok(normalized);
  assert.equal(normalized.id, 'my-cool-slug');
  assert.equal(normalized.slug, 'my-cool-slug');
  assert.deepEqual(normalized.technologies, ['C++', 'Algorithms']);
  assert.equal(normalized.url, undefined, 'Unsafe javascript: URL must be dropped at boundary');
  assert.equal(normalized.repoUrl, 'https://github.com/dahaliztupe-sketch/visualizer');
  assert.equal(normalized.coverImageUrl, 'https://example.com/cover.png');
  assert.equal(normalized.publicationStatus, 'draft', 'Invalid status must default safely to draft');
  assert.equal(normalized.statusType, 'practicing');
  assert.equal(normalized.visibility, 'internal_archive', 'Legacy missing visibility must fail closed to internal_archive');
  assert.equal(normalized.legacyVisibilityMissing, true);
  assert.equal(normalized.createdAt, undefined);
  assert.equal(normalized.updatedAt, '2026-05-01T10:00:00.000Z');
});

test('normalizeNoteRecord and normalizeMilestoneRecord handle missing arrays and unsafe links', () => {
  const note = normalizeNoteRecord('note-1', {
    titleEn: 'Pointers in C++',
    titleAr: 'المؤشرات في سي++',
    topicLabels: 'not-an-array',
    publicationStatus: 'published',
  });
  assert.ok(note);
  assert.deepEqual(note.topicLabels, []);
  assert.equal(note.publicationStatus, 'published');

  const milestone = normalizeMilestoneRecord('ms-1', {
    titleEn: 'Completed First Term',
    titleAr: 'إتمام الفصل الأول',
    externalReference: 'ftp://invalid.example.com/doc',
    category: 'other',
  });
  assert.ok(milestone);
  assert.equal(milestone.externalReference, undefined);
  assert.equal(milestone.category, 'academic');
});

test('normalizeProfileRecord preserves safe defaults and strips legacy contactEmail PII', () => {
  const safe = normalizeProfileRecord(
    {
      nameEn: 'Abdalrahman Mostafa',
      githubUrl: 'javascript:alert(1)',
      linkedinUrl: 'https://www.linkedin.com/in/abdalrahman-mostafa-/',
      contactEmail: 'private@example.com',
    },
    FALLBACK_PROFILE
  );
  assert.equal(safe.githubUrl, FALLBACK_PROFILE.githubUrl);
  assert.equal(safe.linkedinUrl, 'https://www.linkedin.com/in/abdalrahman-mostafa-/');
  assert.equal('contactEmail' in safe, false);
});

test('isValidFirestoreDocId & sanitizeFirestoreDocId preserve mixed-case Firestore IDs and formatFirestoreUserError decodes JSON errors', () => {
  assert.equal(isValidFirestoreDocId('msg-1763-AbCdEf'), true);
  assert.equal(sanitizeFirestoreDocId('msg-1763-AbCdEf'), 'msg-1763-AbCdEf');
  assert.equal(isValidFirestoreDocId('bad/id'), false);
  assert.equal(sanitizeFirestoreDocId('  bad id! '), 'bad-id');

  const mixedCaseProject = normalizeProjectRecord('proj-AbC_12', {
    titleEn: 'Mixed Case ID Project',
    titleAr: 'مشروع بمعرف مختلط',
    slug: 'clean-url-slug',
  });
  assert.ok(mixedCaseProject);
  assert.equal(mixedCaseProject.id, 'proj-AbC_12');
  assert.equal(mixedCaseProject.slug, 'clean-url-slug');

  const permJsonErr = new Error(
    JSON.stringify({
      error: 'Missing or insufficient permissions.',
      operationType: 'write',
      path: 'projects/test',
    })
  );
  assert.match(formatFirestoreUserError(permJsonErr, 'en'), /projects\/test/);
  assert.match(formatFirestoreUserError(permJsonErr, 'ar'), /رفض العملية/);
});

test('sortRecordsDeterministically orders newest timestamps first and breaks ties cleanly by id', () => {
  const sorted = sortRecordsDeterministically([
    { id: 'b-item', publishedAt: '2026-05-10T10:00:00Z' },
    { id: 'a-item', publishedAt: '2026-05-10T10:00:00Z' },
    { id: 'newer-item', updatedAt: '2026-06-01T00:00:00Z' },
    { id: 'undated-item' },
  ]);
  assert.deepEqual(
    sorted.map((x) => x.id),
    ['newer-item', 'a-item', 'b-item', 'undated-item']
  );
});

test('formatLocalizedDate formats ISO dates for EN and AR without throwing on invalid strings', () => {
  const en = formatLocalizedDate('2026-05-15T12:00:00Z', 'en');
  const ar = formatLocalizedDate('2026-05-15T12:00:00Z', 'ar');
  assert.ok(en && en.includes('2026'));
  assert.ok(ar && ar.length > 0);
  assert.equal(formatLocalizedDate('invalid-date', 'en'), null);
  assert.equal(formatLocalizedDate(undefined, 'ar'), null);
});

test('validateProjectForSave allows incomplete draft but enforces description, visibility, and image alt text when published', () => {
  const incompleteDraft = validateProjectForSave({
    slug: 'cpp-draft',
    titleEn: 'C++ Draft',
    titleAr: 'مسودة',
    statusType: 'practicing',
    publicationStatus: 'draft',
    visibility: 'public',
    descriptionEn: 'WIP',
    descriptionAr: 'جاري',
    technologies: [],
    fullOverviewEn: [],
    fullOverviewAr: [],
  });
  assert.equal(incompleteDraft.valid, true, 'Drafts should remain flexible for incremental saving');

  const shortPublished = validateProjectForSave({
    slug: 'cpp-pub',
    titleEn: 'C++ Pub',
    titleAr: 'منشور',
    statusType: 'practicing',
    publicationStatus: 'published',
    visibility: 'public',
    descriptionEn: 'Too short',
    descriptionAr: 'قصير',
    technologies: ['C++'],
    fullOverviewEn: [],
    fullOverviewAr: [],
  });
  assert.equal(shortPublished.valid, false, 'Published project must enforce bilingual description quality');

  const missingAlt = validateProjectForSave({
    slug: 'cpp-pub',
    titleEn: 'C++ Published Project',
    titleAr: 'مشروع سي++ منشور',
    statusType: 'practicing',
    publicationStatus: 'published',
    visibility: 'public',
    descriptionEn: 'Detailed description of the C++ problem solving practice.',
    descriptionAr: 'وصف تفصيلي لتطبيقات وممارسة حل المشكلات بلغة سي++.',
    coverImageUrl: 'https://example.com/diagram.png',
    technologies: ['C++'],
    fullOverviewEn: [],
    fullOverviewAr: [],
  });
  assert.equal(missingAlt.valid, false, 'Published project with cover image URL must require alt text');

  const completePublished = validateProjectForSave({
    slug: 'cpp-pub',
    titleEn: 'C++ Published Project',
    titleAr: 'مشروع سي++ منشور',
    statusType: 'practicing',
    publicationStatus: 'published',
    visibility: 'public',
    descriptionEn: 'Detailed description of the C++ problem solving practice.',
    descriptionAr: 'وصف تفصيلي لتطبيقات وممارسة حل المشكلات بلغة سي++.',
    coverImageUrl: 'https://example.com/diagram.png',
    coverImageAltEn: 'Algorithm complexity graph',
    technologies: ['C++'],
    fullOverviewEn: [],
    fullOverviewAr: [],
  });
  assert.equal(completePublished.valid, true);
});

test('validateNoteForSave and validateMilestoneForSave enforce publication quality invariants', () => {
  assert.equal(
    validateNoteForSave({
      slug: 'my-note',
      titleEn: 'Draft Note',
      titleAr: 'ملاحظة',
      contentEn: 'Drafting...',
      contentAr: 'مسودة',
      topicLabels: [],
      publicationStatus: 'draft',
    }).valid,
    true
  );

  assert.equal(
    validateNoteForSave({
      slug: 'my-note',
      titleEn: 'Published Note',
      titleAr: 'ملاحظة منشورة',
      contentEn: 'Too brief',
      contentAr: 'قصير جدا',
      topicLabels: [],
      publicationStatus: 'published',
    }).valid,
    false
  );

  assert.equal(
    validateMilestoneForSave({
      titleEn: 'Milestone 1',
      titleAr: 'إنجاز ١',
      descriptionEn: 'Short',
      descriptionAr: 'قصير',
      category: 'academic',
      publicationStatus: 'published',
    }).valid,
    false
  );
});

test('shouldEnableHero3D restricts WebGL strictly to desktop home route with motion & GL support', () => {
  assert.equal(
    shouldEnableHero3D({
      routeName: 'home',
      viewportWidth: DESKTOP_3D_MIN_WIDTH,
      prefersReducedMotion: false,
      webglSupported: true,
    }),
    true
  );
  assert.equal(
    shouldEnableHero3D({
      routeName: 'projects',
      viewportWidth: 1440,
      prefersReducedMotion: false,
      webglSupported: true,
    }),
    false
  );
  assert.equal(
    shouldEnableHero3D({
      routeName: 'home',
      viewportWidth: DESKTOP_3D_MIN_WIDTH - 1,
      prefersReducedMotion: false,
      webglSupported: true,
    }),
    false
  );
  assert.equal(
    shouldEnableHero3D({
      routeName: 'home',
      viewportWidth: 1440,
      prefersReducedMotion: true,
      webglSupported: true,
    }),
    false
  );
  assert.equal(
    shouldEnableHero3D({
      routeName: 'home',
      viewportWidth: 1440,
      prefersReducedMotion: false,
      webglSupported: false,
    }),
    false
  );
});

test('resolveFrameloopMode pauses hidden tabs and avoids idle GPU churn under software GL', () => {
  assert.equal(resolveFrameloopMode({ isDocumentHidden: true, isSoftwareGl: false }), 'never');
  assert.equal(resolveFrameloopMode({ isDocumentHidden: false, isSoftwareGl: true }), 'demand');
  assert.equal(resolveFrameloopMode({ isDocumentHidden: false, isSoftwareGl: false }), 'always');
});

test('computeHeroCanvasOpacity smoothly attenuates 3D backdrop as user scrolls past the hero', () => {
  const darkTop = computeHeroCanvasOpacity({ scrollY: 0, viewportHeight: 900, theme: 'dark' });
  const darkMid = computeHeroCanvasOpacity({ scrollY: 337, viewportHeight: 900, theme: 'dark' });
  const darkBottom = computeHeroCanvasOpacity({ scrollY: 1200, viewportHeight: 900, theme: 'dark' });
  assert.equal(darkTop, 0.92);
  assert.ok(darkMid < darkTop && darkMid > darkBottom);
  assert.equal(darkBottom, 0.08);

  const lightTop = computeHeroCanvasOpacity({ scrollY: 0, viewportHeight: 900, theme: 'light' });
  const lightBottom = computeHeroCanvasOpacity({ scrollY: 1000, viewportHeight: 900, theme: 'light' });
  assert.equal(lightTop, 0.52);
  assert.equal(lightBottom, 0.04);
});

test('AppErrorBoundary helpers reset only on route change and resolve safe language', () => {
  assert.equal(shouldResetErrorBoundary('/projects', '/'), true);
  assert.equal(shouldResetErrorBoundary('/projects', '/projects'), false);
  assert.equal(shouldResetErrorBoundary(undefined, '/'), false);
  assert.equal(shouldResetErrorBoundary('/projects', undefined), false);

  assert.equal(resolveErrorBoundaryLang('ar'), 'ar');
  assert.equal(resolveErrorBoundaryLang('en'), 'en');
  assert.equal(resolveErrorBoundaryLang(undefined), 'en');
});

test('reportBoundaryError builds structured reports and safely invokes console and custom hooks', () => {
  const err = new TypeError('Simulated render boom');
  const loggedCalls: unknown[][] = [];
  const hookReports: string[] = [];
  const registeredReports: string[] = [];

  const direct = buildErrorReport(err, '  in ProjectsPage\n  in App  ', {
    boundary: 'route',
    route: '/projects',
    language: 'ar',
    timestamp: '2026-11-14T12:00:00.000Z',
  });
  assert.equal(direct.name, 'TypeError');
  assert.equal(direct.message, 'Simulated render boom');
  assert.equal(direct.componentStack, 'in ProjectsPage\n  in App');
  assert.equal(direct.context.boundary, 'route');
  assert.equal(direct.context.route, '/projects');
  assert.equal(direct.context.language, 'ar');

  const unsubscribeFaulty = registerErrorReporter(() => {
    throw new Error('Reporter failure should not cascade');
  });
  const unsubscribeHealthy = registerErrorReporter((report) => {
    registeredReports.push(`${report.context.boundary}:${report.message}`);
  });

  const emitted = reportBoundaryError(
    err,
    { componentStack: 'in ProjectsPage' },
    {
      boundary: 'route',
      route: '/projects',
      language: 'en',
      logger: (...args) => {
        loggedCalls.push(args);
      },
      onError: (report) => {
        hookReports.push(report.context.route || '');
      },
    }
  );

  assert.equal(emitted.message, 'Simulated render boom');
  assert.equal(loggedCalls.length, 1);
  assert.equal(loggedCalls[0][0], '[NeuralAtlas:ErrorBoundary]');
  assert.deepEqual(hookReports, ['/projects']);
  assert.deepEqual(registeredReports, ['route:Simulated render boom']);

  unsubscribeFaulty();
  unsubscribeHealthy();

  reportBoundaryError(err, undefined, {
    boundary: 'fullscreen',
    logger: () => {},
  });
  assert.equal(registeredReports.length, 1, 'Unsubscribed reporter should not receive later reports');
});

test('AppErrorBoundary renders branded Calm Computational Atlas fallback UI in EN and AR', () => {
  const enBoundary = new AppErrorBoundary({
    children: null,
    variant: 'route',
    language: 'en',
  });
  enBoundary.state = { hasError: true };
  const htmlEn = renderToStaticMarkup(enBoundary.render() as React.ReactElement);

  assert.equal(htmlEn.includes('role="alert"'), true);
  assert.equal(htmlEn.includes('dir="ltr"'), true);
  assert.equal(htmlEn.includes('VIEW RECOVERY'), true);
  assert.equal(htmlEn.includes('Neural Atlas'), true);
  assert.equal(htmlEn.includes('Return to Home'), true);
  assert.equal(htmlEn.includes('Retry'), true);

  const arBoundary = new AppErrorBoundary({
    children: null,
    variant: 'fullscreen',
    language: 'ar',
  });
  arBoundary.state = { hasError: true };
  const htmlAr = renderToStaticMarkup(arBoundary.render() as React.ReactElement);

  assert.equal(htmlAr.includes('dir="rtl"'), true);
  assert.equal(htmlAr.includes('استعادة المسار'), true);
  assert.equal(htmlAr.includes('أطلس الشبكات العصبية'), true);
  assert.equal(htmlAr.includes('العودة إلى الرئيسية'), true);
  assert.equal(htmlAr.includes('إعادة تحميل التطبيق'), true);
});

test('normalizeCourseRecord and validateCourseForSave enforce academic taxonomy and bounds', () => {
  assert.equal(normalizeCourseRecord('bad', {}), null);

  const normalized = normalizeCourseRecord('sem1-cs', {
    nameEn: '  Introduction to Intelligent Computing  ',
    nameAr: '  مقدمة في الحوسبة الذكية  ',
    category: 'unknown-category',
    latticeNodeIndex: 999,
    publicationStatus: 'published',
  });
  assert.ok(normalized);
  assert.equal(normalized.category, 'computational');
  assert.equal(normalized.latticeNodeIndex, 100);
  assert.equal(normalized.publicationStatus, 'published');

  assert.equal(
    validateCourseForSave({
      slug: 'sem1-cs',
      nameEn: 'Intro',
      nameAr: 'مقدمة',
      semesterEn: 'First Semester',
      semesterAr: 'الفصل الأول',
      yearEn: 'First Year',
      yearAr: 'السنة الأولى',
      category: 'computational',
      latticeNodeIndex: 0,
      publicationStatus: 'published',
    }).valid,
    true
  );

  assert.equal(
    validateCourseForSave({
      slug: 'sem1-cs',
      nameEn: 'Intro',
      nameAr: 'مقدمة',
      semesterEn: 'First Semester',
      semesterAr: 'الفصل الأول',
      yearEn: 'First Year',
      yearAr: 'السنة الأولى',
      category: 'computational',
      latticeNodeIndex: -1,
      publicationStatus: 'draft',
    }).valid,
    false
  );
});

test('normalizeContactMessageRecord and validateContactMessageInput enforce honeypot, bounds, and contact rules', () => {
  assert.equal(normalizeContactMessageRecord('m1', { senderName: 'A', subject: '', message: 'Hi' }), null);

  const normalized = normalizeContactMessageRecord('msg-1', {
    senderName: 'Omar Hassan',
    senderContact: '@omar',
    subject: 'Study Group',
    message: 'Hello Abdalrahman, great work on the C++ foundations.',
    language: 'ar',
    status: 'invalid',
  });
  assert.ok(normalized);
  assert.equal(normalized.status, 'unread');
  assert.equal(normalized.language, 'ar');

  assert.equal(
    validateContactMessageInput({
      senderName: 'Omar',
      senderContact: '@omar',
      subject: 'Question',
      message: 'This is a valid message with enough detail.',
      language: 'en',
      honeypot: 'bot-filled',
    }).valid,
    false,
    'Filled honeypot must be rejected'
  );

  const badEmail = validateContactMessageInput({
    senderName: 'Omar',
    senderContact: 'invalid@bad',
    subject: 'Question',
    message: 'This is a valid message with enough detail.',
    language: 'en',
  });
  assert.equal(badEmail.valid, false);
  assert.ok(badEmail.errors.senderContact);

  const validHandle = validateContactMessageInput({
    senderName: 'Omar Hassan',
    senderContact: 'github.com/omar',
    subject: 'C++ Practice',
    message: 'Wanted to share a problem-solving resource with you.',
    language: 'en',
  });
  assert.equal(validHandle.valid, true);
});

test('filterProjectsByQuery and filterNotesByQuery filter by search text, status/archive group, technology, and topic', () => {
  const sampleProjects = [
    {
      id: 'cpp-practice',
      titleEn: 'C++ & Problem Solving',
      titleAr: 'C++ وحل المشكلات',
      statusEn: 'Practicing',
      statusAr: 'ممارسة',
      statusType: 'practicing' as const,
      archiveGroup: 'showcase' as const,
      descriptionEn: 'Algorithms and memory experiments',
      descriptionAr: 'تجارب الخوارزميات والذاكرة',
      technologies: ['C++', 'Algorithms'],
      fullOverviewEn: [],
      fullOverviewAr: [],
    },
    {
      id: 'kalmeron-two',
      titleEn: 'Kalmeron-Two',
      titleAr: 'Kalmeron-Two (تجربة معمارية)',
      statusEn: 'Experimental',
      statusAr: 'تجريبي',
      statusType: 'experimental' as const,
      archiveGroup: 'experiments_discontinued' as const,
      descriptionEn: 'Pre-production multi-agent prototype',
      descriptionAr: 'نموذج أولي متوقف قبل الإنتاج',
      technologies: ['DuckDB', 'FastAPI'],
      fullOverviewEn: [],
      fullOverviewAr: [],
    },
  ];

  assert.equal(filterProjectsByQuery(sampleProjects, '', 'all', 'all').length, 2);
  assert.equal(filterProjectsByQuery(sampleProjects, 'نموذج', 'all', 'all')[0].id, 'kalmeron-two');
  assert.equal(filterProjectsByQuery(sampleProjects, '', 'active_practice', 'C++').length, 1);
  assert.equal(filterProjectsByQuery(sampleProjects, '', 'archive_group', 'all')[0].id, 'kalmeron-two');
  assert.equal(filterProjectsByQuery(sampleProjects, 'missing', 'all', 'all').length, 0);

  const sampleNotes = [
    {
      id: 'note-1',
      slug: 'pointers',
      titleEn: 'Understanding Pointers',
      titleAr: 'فهم المؤشرات',
      contentEn: 'Stack vs heap allocation',
      contentAr: 'المكدس مقابل الكومة',
      topicLabels: ['C++', 'Memory'],
      publicationStatus: 'published' as const,
    },
  ];
  assert.equal(filterNotesByQuery(sampleNotes, 'المؤشرات', 'all').length, 1);
  assert.equal(filterNotesByQuery(sampleNotes, '', 'Memory').length, 1);
  assert.equal(filterNotesByQuery(sampleNotes, '', 'Python').length, 0);
});

