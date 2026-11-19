import test from 'node:test';
import assert from 'node:assert/strict';
import {
  COURSES,
  PROJECTS,
  OWNER_INFO,
  SOCIAL_LINKS,
  INITIAL_MILESTONES,
  ACADEMIC_PROGRAM,
  LEARNING_TRACKS,
  PRACTICAL_EXPERIENCE,
} from './portfolioData';
import { TRANSLATIONS } from './translations';

test('academic courses match the owner-provided 7 first-semester items without fabricated codes or syllabus descriptions', () => {
  assert.equal(COURSES.length, 7, 'Must have exactly 7 first-semester courses');

  const expectedCourses = [
    { en: 'Algorithmic Thinking', ar: 'التفكير الخوارزمي' },
    { en: 'Artificial Intelligence', ar: 'الذكاء الاصطناعي' },
    { en: 'Computer Architecture', ar: 'معمارية الحاسب' },
    { en: 'Information Systems', ar: 'نظم المعلومات' },
    { en: 'Islamic Theology', ar: 'العقيدة الإسلامية' },
    { en: 'Mathematics', ar: 'الرياضيات' },
    { en: 'Probability & Statistics', ar: 'الاحتمالات والإحصاء' },
  ];

  for (const expected of expectedCourses) {
    const found = COURSES.find((c) => c.nameEn === expected.en);
    assert.ok(found, `Expected course "${expected.en}" was not found`);
    assert.equal(
      found.nameAr,
      expected.ar,
      `Expected Arabic title "${expected.ar}" for course "${expected.en}"`
    );
    assert.equal(found.semesterEn, 'First Semester');
    assert.equal(found.yearEn, 'First Year');
    assert.equal(found.termTag, 'semester-1-archive');
    assert.equal(found.source, 'owner-provided', 'Course must be explicitly marked as owner-provided');
    assert.equal(found.verificationStatus, 'unverified-syllabus', 'Syllabus must be flagged as unverified');
    assert.ok(typeof found.latticeNodeIndex === 'number', 'Must specify lattice node index');

    // Rigorously assert that NO fabricated catalog codes, syllabus descriptions, instructors, grades, or credits exist
    const rawCourse = found as unknown as Record<string, unknown>;
    assert.equal(rawCourse.code, undefined, `Must not contain fabricated course catalog code for ${expected.en}`);
    assert.equal(rawCourse.descriptionEn, undefined, `Must not contain unsourced syllabus descriptionEn for ${expected.en}`);
    assert.equal(rawCourse.descriptionAr, undefined, `Must not contain unsourced syllabus descriptionAr for ${expected.en}`);
    assert.equal(rawCourse.instructor, undefined, 'Must not fabricate course instructor');
    assert.equal(rawCourse.grade, undefined, 'Must not fabricate course grades');
    assert.equal(rawCourse.credits, undefined, 'Must not fabricate course credit hours');
    assert.equal(rawCourse.prerequisites, undefined, 'Must not fabricate prerequisites');

    const serialized = JSON.stringify(found);
    assert.ok(!serialized.includes('IC-'), 'Must not contain invented IC- codes');
    assert.ok(!serialized.includes('MATH-101'), 'Must not contain invented MATH codes');
    assert.ok(!serialized.includes('STAT-101'), 'Must not contain invented STAT codes');
  }
});

test('academic program contains owner-provided Al-Azhar context and Semester 1 archive disclosure', () => {
  assert.equal(ACADEMIC_PROGRAM.institutionEn, 'Al-Azhar University');
  assert.equal(ACADEMIC_PROGRAM.institutionAr, 'جامعة الأزهر');
  assert.equal(ACADEMIC_PROGRAM.facultyEn, 'Faculty of Science');
  assert.equal(ACADEMIC_PROGRAM.facultyAr, 'كلية العلوم');
  assert.equal(ACADEMIC_PROGRAM.departmentEn, 'Intelligent Computing Department');
  assert.equal(ACADEMIC_PROGRAM.departmentAr, 'قسم الحوسبة الذكية');
  assert.equal(ACADEMIC_PROGRAM.currentYearEn, 'First Year');
  assert.equal(ACADEMIC_PROGRAM.currentSemesterEn, 'Active Academic Term');
  assert.equal(ACADEMIC_PROGRAM.telegramBotUrl, 'https://t.me/IntelligentComputingAzharBot');
  assert.ok(ACADEMIC_PROGRAM.verificationDisclaimerEn.includes('owner-provided'));
  assert.ok(ACADEMIC_PROGRAM.verificationDisclaimerAr.includes('مُدخلة من قِبل صاحب الموقع'));
});

test('projects strictly enforce visibility split between public showcase, public archive, and internal_archive', () => {
  assert.equal(PROJECTS.length, 7, 'Must have 6 public entries + 1 internal_archive entry');

  const publicProjects = PROJECTS.filter((p) => p.visibility === 'public');
  const internalProjects = PROJECTS.filter((p) => p.visibility === 'internal_archive');
  assert.equal(publicProjects.length, 6);
  assert.equal(internalProjects.length, 1);
  assert.equal(internalProjects[0].id, 'local-ai-agent');
  assert.equal(internalProjects[0].featuredOnHome, false);

  const cppProject = PROJECTS.find((p) => p.id === 'cpp-problem-solving');
  assert.ok(cppProject, 'C++ project must exist');
  assert.equal(cppProject.visibility, 'public');
  assert.equal(cppProject.archiveGroup, 'showcase');
  assert.equal(cppProject.featuredOnHome, true);
  assert.equal(cppProject.statusType, 'practicing');
  assert.equal(cppProject.url, undefined, 'Must not invent demo URLs');
  assert.equal(cppProject.repoUrl, undefined, 'Must not invent repo URLs');

  const kalmeron = PROJECTS.find((p) => p.id === 'kalmeron-two');
  assert.ok(kalmeron, 'Kalmeron-Two archive entry must exist');
  assert.equal(kalmeron.visibility, 'public');
  assert.equal(kalmeron.archiveGroup, 'experiments_discontinued');
  assert.equal(kalmeron.featuredOnHome, false);
  assert.equal(kalmeron.statusType, 'experimental');
  assert.equal(kalmeron.repoUrl, 'https://github.com/dahaliztupe-sketch/Kalmeron-Two');

  const wanasbrand = PROJECTS.find((p) => p.id === 'wanasbrand');
  assert.ok(wanasbrand, 'WANASBRAND entry must exist');
  assert.equal(wanasbrand.visibility, 'public');
  assert.equal(wanasbrand.archiveGroup, 'experiments_discontinued');
  assert.equal(wanasbrand.featuredOnHome, false);
  assert.equal(wanasbrand.statusType, 'needs_confirmation');

  for (const slug of ['sanad', 'ruwadverse', 'smartlifeai']) {
    const entry = PROJECTS.find((p) => p.id === slug);
    assert.ok(entry, `${slug} archive entry must exist`);
    assert.equal(entry.visibility, 'public');
    assert.equal(entry.archiveGroup, 'experiments_discontinued');
    assert.equal(entry.featuredOnHome, false);
    assert.equal(entry.statusType, 'discontinued');
    assert.equal(entry.url, undefined);
    assert.equal(entry.repoUrl, undefined);
  }
});

test('milestones list contains the 4 factual timeline records without fabricated awards or certificates', () => {
  assert.equal(INITIAL_MILESTONES.length, 4);
  const gks = INITIAL_MILESTONES.find((m) => m.id === 'gks-u-2027-application-submitted');
  assert.ok(gks);
  assert.ok(gks.titleEn.includes('Application Submitted'));
  assert.ok(!gks.descriptionEn.toLowerCase().includes('awarded'));
  assert.ok(!gks.descriptionEn.toLowerCase().includes('selected'));
});

test('learning tracks and practical experience obey factual constraints without exaggerations', () => {
  const cs50x = LEARNING_TRACKS.find((t) => t.id === 'harvard-cs50x');
  assert.ok(cs50x);
  assert.equal(
    cs50x.titleEn,
    'Harvard CS50x — Independent Study / In Progress (Foundational Computer Science).'
  );
  assert.equal(cs50x.status, 'paused');
  assert.equal(cs50x.showInActiveHighlights, true);

  const korean = LEARNING_TRACKS.find((t) => t.id === 'korean-language-paused');
  assert.ok(korean);
  assert.equal(korean.status, 'paused');
  assert.equal(korean.showInActiveHighlights, false, 'Paused Korean track must be excluded from active highlights');

  assert.equal(PRACTICAL_EXPERIENCE.sectionTitleEn, 'Administrative & Operational Data Experience');
  assert.equal(PRACTICAL_EXPERIENCE.sectionTitleAr, 'الخبرة الإدارية والبيانات التشغيلية');
  assert.ok(PRACTICAL_EXPERIENCE.activitiesEn.length >= 6);
  assert.ok(PRACTICAL_EXPERIENCE.activitiesAr.length >= 6);
});

test('public data and translations contain zero banned claims or exposed owner email', () => {
  const publicDataBlob = JSON.stringify({
    OWNER_INFO,
    ACADEMIC_PROGRAM,
    COURSES,
    LEARNING_TRACKS,
    PRACTICAL_EXPERIENCE,
    INITIAL_MILESTONES,
    publicProjects: PROJECTS.filter((p) => p.visibility === 'public'),
    TRANSLATIONS,
  });

  const bannedPhrases = [
    'Build with AI',
    'NASA Space Apps',
    'ICDL',
    'Week 3',
    'abdalrahman32008@gmail.com',
    'Local AI Agent',
    'وكيل ذكاء اصطناعي محلي',
  ];

  for (const phrase of bannedPhrases) {
    assert.equal(
      publicDataBlob.includes(phrase),
      false,
      `Public data & translations must NOT contain banned phrase: ${phrase}`
    );
  }
});

test('social links contain verified GitHub and LinkedIn with no fabricated email', () => {
  const github = SOCIAL_LINKS.find((s) => s.platform === 'GitHub');
  assert.ok(github);
  assert.equal(github.url, 'https://github.com/dahaliztupe-sketch');

  const linkedin = SOCIAL_LINKS.find((s) => s.platform === 'LinkedIn');
  assert.ok(linkedin);
  assert.equal(linkedin.url, 'https://www.linkedin.com/in/abdalrahman-mostafa-/');

  const email = SOCIAL_LINKS.find((s) => s.platform.toLowerCase().includes('email'));
  assert.equal(email, undefined, 'Must not invent an email address');
});

test('translations dictionary maintains full EN/AR key parity with non-empty values', () => {
  const enKeys = Object.keys(TRANSLATIONS.en).sort();
  const arKeys = Object.keys(TRANSLATIONS.ar).sort();
  assert.deepEqual(enKeys, arKeys, 'English and Arabic dictionaries must contain identical keys');

  for (const key of enKeys) {
    const enVal = TRANSLATIONS.en[key as keyof typeof TRANSLATIONS.en];
    const arVal = TRANSLATIONS.ar[key as keyof typeof TRANSLATIONS.ar];
    assert.ok(typeof enVal === 'string' && enVal.trim().length > 0, `Missing/empty EN value for ${key}`);
    assert.ok(typeof arVal === 'string' && arVal.trim().length > 0, `Missing/empty AR value for ${key}`);
  }
});
