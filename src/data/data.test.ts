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
  SKILLS_CATALOG,
  KNOWLEDGE_CATEGORIES,
  INITIAL_LEARNING_NOTES,
} from './portfolioData';
import { TRANSLATIONS } from './translations';
import { CONTACT_EMAIL } from '../lib/contactConfig';

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

test('projects expose 4 main showcase entries plus 5 archive entries with LOCAL AI AGENT discontinued and separated from J.A.R.V.I.S.', () => {
  assert.equal(PROJECTS.length, 9, 'Must have 4 main showcase entries + 5 archive entries');

  const publicProjects = PROJECTS.filter((p) => p.visibility === 'public');
  const showcaseProjects = PROJECTS.filter((p) => p.archiveGroup === 'showcase');
  const archiveProjects = PROJECTS.filter((p) => p.archiveGroup === 'experiments_discontinued');
  assert.equal(publicProjects.length, 9);
  assert.equal(showcaseProjects.length, 4);
  assert.equal(archiveProjects.length, 5);

  assert.deepEqual(
    showcaseProjects.map((p) => p.id),
    ['neural-atlas', 'jarvis-ai-assistant', 'cpp-problem-solving', 'wanasbrand']
  );

  const jarvis = PROJECTS.find((p) => p.id === 'jarvis-ai-assistant');
  const localAi = PROJECTS.find((p) => p.id === 'local-ai-agent');
  assert.ok(jarvis && localAi, 'Both J.A.R.V.I.S. and LOCAL AI AGENT must exist');
  assert.equal(jarvis.featuredOnHome, true);
  assert.equal(jarvis.technologies.includes('Python'), false, 'Python is a planned next step, not yet active stack');
  assert.equal(localAi.featuredOnHome, false);
  assert.equal(localAi.archiveGroup, 'experiments_discontinued');
  assert.equal(localAi.statusType, 'discontinued');
  assert.equal(localAi.statusEn, 'Discontinued / Archived');
  assert.equal(localAi.statusAr, 'متوقف / مؤرشف');
  assert.ok(localAi.titleEn.includes('Discontinued / Archived'));
  assert.ok(jarvis.descriptionEn.includes('LOCAL AI AGENT'));
  assert.ok(localAi.descriptionEn.includes('J.A.R.V.I.S.'));

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
  assert.equal(wanasbrand.archiveGroup, 'showcase');
  assert.equal(wanasbrand.featuredOnHome, true);
  assert.equal(wanasbrand.statusType, 'completed');
  assert.equal(wanasbrand.statusEn, 'Live');
  assert.equal(wanasbrand.statusAr, 'منشور');
  assert.equal(wanasbrand.url, 'https://wanasbrand.vercel.app');

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

test('milestones list contains the 6 factual timeline records without fabricated awards or certificates', () => {
  assert.equal(INITIAL_MILESTONES.length, 6);
  const gks = INITIAL_MILESTONES.find((m) => m.id === 'gks-u-2027-application-submitted');
  assert.ok(gks);
  assert.ok(gks.titleEn.includes('Not Accepted'));
  assert.ok(!gks.descriptionEn.toLowerCase().includes('awarded'));
  assert.ok(!gks.descriptionEn.toLowerCase().includes('selected'));

  const earlyRoots = INITIAL_MILESTONES.find((m) => m.id === 'early-self-learning-age-12');
  assert.ok(earlyRoots);
  assert.ok(earlyRoots.descriptionEn.includes('12'));
});

test('skills catalog, 9 knowledge categories, and 8 learning notes obey quality, schema bounds, and author honesty', () => {
  assert.equal(SKILLS_CATALOG.filter((s) => s.domain === 'programming').length, 4);
  assert.equal(SKILLS_CATALOG.filter((s) => s.domain === 'technical_interest').length, 5);
  assert.equal(
    SKILLS_CATALOG.some((s) => JSON.stringify(s).includes('%')),
    false,
    'Skills catalog must NEVER contain artificial percentage scores'
  );
  const pythonSkill = SKILLS_CATALOG.find((s) => s.id === 'skill-python');
  assert.ok(pythonSkill);
  assert.equal(pythonSkill.nameEn, 'Python — Learning Now');
  assert.equal(pythonSkill.tier, 'learning', 'Python must be represented honestly as currently learning');

  assert.deepEqual(
    KNOWLEDGE_CATEGORIES.map((c) => c.titleEn),
    [
      'Programming',
      'Computer Science',
      'Artificial Intelligence',
      'Problem Solving',
      'University Studies',
      'Learning Journey',
      'Business & Technology',
      'Personal Insights',
      'Experiments',
    ]
  );

  const validCategoryKeys = new Set(KNOWLEDGE_CATEGORIES.map((c) => c.topicMatchKey));
  assert.equal(INITIAL_LEARNING_NOTES.length, 8);
  const seenSlugs = new Set<string>();

  for (const note of INITIAL_LEARNING_NOTES) {
    assert.equal(note.publicationStatus, 'published', `Note "${note.id}" must be published`);
    assert.match(note.id, /^[a-zA-Z0-9_\-]{1,128}$/, 'ID must match firestore.rules isValidId');
    assert.match(note.slug, /^[a-zA-Z0-9_\-]{1,128}$/, 'Slug must match firestore.rules regex');
    assert.equal(seenSlugs.has(note.slug), false, `Duplicate slug found: ${note.slug}`);
    seenSlugs.add(note.slug);

    assert.ok(note.titleEn.length > 0 && note.titleEn.length <= 200);
    assert.ok(note.titleAr.length > 0 && note.titleAr.length <= 200);
    assert.ok((note.summaryEn || '').length > 0 && (note.summaryEn || '').length <= 500);
    assert.ok((note.summaryAr || '').length > 0 && (note.summaryAr || '').length <= 500);
    assert.ok(note.contentEn.length >= 800 && note.contentEn.length <= 20000);
    assert.ok(note.contentAr.length >= 800 && note.contentAr.length <= 20000);
    const topicLabels = note.topicLabels ?? [];
    assert.ok(topicLabels.length >= 2 && topicLabels.length <= 20);
    assert.ok(
      validCategoryKeys.has(topicLabels[0]),
      `Note "${note.id}" primary category topicLabels[0]="${topicLabels[0]}" must match KNOWLEDGE_CATEGORIES`
    );
    assert.ok(note.createdAt && !Number.isNaN(Date.parse(note.createdAt)));
    assert.ok(note.updatedAt && !Number.isNaN(Date.parse(note.updatedAt)));
    assert.ok(note.publishedAt && !Number.isNaN(Date.parse(note.publishedAt)));
  }

  assert.equal(
    INITIAL_LEARNING_NOTES.some((n) => (n.topicLabels ?? [])[0] === 'University Studies'),
    false,
    'University Studies must have 0 notes rather than fabricated lectures/dates/grades'
  );
});

test('learning tracks and practical experience obey factual constraints without exaggerations', () => {
  const cs50x = LEARNING_TRACKS.find((t) => t.id === 'harvard-cs50x');
  assert.ok(cs50x);
  assert.equal(cs50x.titleEn, 'Harvard CS50x — Independent Study (CS50x: Week 3)');
  assert.ok(cs50x.statusLabelEn.includes('CS50x: Week 3'));
  assert.equal(cs50x.status, 'in_progress');
  assert.equal(cs50x.showInActiveHighlights, true);

  const korean = LEARNING_TRACKS.find((t) => t.id === 'korean-language-paused');
  assert.ok(korean);
  assert.equal(korean.status, 'paused');
  assert.equal(korean.showInActiveHighlights, false, 'Paused Korean track must be excluded from active highlights');

  const gksTrack = LEARNING_TRACKS.find((t) => t.id === 'gks-u-2027');
  assert.ok(gksTrack);
  assert.equal(gksTrack.status, 'paused');
  assert.equal(gksTrack.statusLabelEn, 'Not Accepted');
  assert.equal(gksTrack.statusLabelAr, 'لم يتم القبول');
  assert.equal(gksTrack.showInActiveHighlights, false);

  assert.equal(PRACTICAL_EXPERIENCE.sectionTitleEn, 'Microsoft Excel');
  assert.equal(PRACTICAL_EXPERIENCE.sectionTitleAr, 'Microsoft Excel');
  assert.equal(
    PRACTICAL_EXPERIENCE.contextSummaryEn,
    'Practical experience organizing operational records and data in Microsoft Excel.'
  );
  assert.equal(
    PRACTICAL_EXPERIENCE.contextSummaryAr,
    'خبرة عملية في تنظيم السجلات والبيانات التشغيلية باستخدام Microsoft Excel.'
  );
  assert.equal(PRACTICAL_EXPERIENCE.activitiesEn.length, 0);
  assert.equal(PRACTICAL_EXPERIENCE.activitiesAr.length, 0);
});

test('public data and translations contain zero banned claims, removed job details, or duplicated contact email', () => {
  const publicDataBlob = JSON.stringify({
    OWNER_INFO,
    ACADEMIC_PROGRAM,
    COURSES,
    LEARNING_TRACKS,
    PRACTICAL_EXPERIENCE,
    INITIAL_MILESTONES,
    INITIAL_LEARNING_NOTES,
    publicProjects: PROJECTS.filter((p) => p.visibility === 'public'),
    TRANSLATIONS,
  });

  const bannedPhrases = [
    'Build with AI',
    'NASA Space Apps',
    'ICDL',
    'CS50x certificate',
    'completed CS50x',
    "In today's rapidly evolving world",
    'delve into',
    'abdalrahman32008@gmail.com',
    'workforce',
    'daily wage',
    'overtime',
    'weekly payout',
    'paid vs unpaid',
    'العمالة',
    'الأجور',
    'المستحقات',
    'ساعات العمل الإضافي',
    'Administrative & Operational Data Experience',
  ];

  for (const phrase of bannedPhrases) {
    assert.equal(
      publicDataBlob.toLowerCase().includes(phrase.toLowerCase()),
      false,
      `Public data & translations must NOT contain banned phrase: ${phrase}`
    );
  }
});

test('social links contain verified GitHub and LinkedIn and CONTACT_EMAIL matches owner constant', () => {
  const github = SOCIAL_LINKS.find((s) => s.platform === 'GitHub');
  assert.ok(github);
  assert.equal(github.url, 'https://github.com/dahaliztupe-sketch');

  const linkedin = SOCIAL_LINKS.find((s) => s.platform === 'LinkedIn');
  assert.ok(linkedin);
  assert.equal(linkedin.url, 'https://www.linkedin.com/in/abdalrahman-mostafa-/');

  const email = SOCIAL_LINKS.find((s) => s.platform.toLowerCase().includes('email'));
  assert.equal(email, undefined, 'Must not place email inside SOCIAL_LINKS');
  assert.equal(CONTACT_EMAIL, 'abdalrahman32008@gmail.com');
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
