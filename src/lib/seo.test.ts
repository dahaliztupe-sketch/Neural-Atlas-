import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildStructuredDataJsonLd,
  generateRobotsTxt,
  generateSitemapXml,
  normalizeSiteUrl,
  resolveBaseSiteUrl,
  resolveRobotsMetaContent,
} from './seo';
import { ProfileSettingsRecord } from '../types';

const SAMPLE_PROFILE: ProfileSettingsRecord = {
  nameEn: 'Abdalrahman Mostafa',
  nameAr: 'عبد الرحمن مصطفى',
  titleEn: 'First-Year Intelligent Computing Student',
  titleAr: 'طالب بالسنة الأولى · قسم الحوسبة الذكية',
  facultyEn: 'Faculty of Science · Al-Azhar University',
  facultyAr: 'كلية العلوم · جامعة الأزهر',
  bioEn: 'Documenting computing foundations.',
  bioAr: 'توثيق أسس علوم الحاسب.',
  currentFocusEn: 'C++ & Problem Solving',
  currentFocusAr: 'لغة C++ وحل المشكلات',
  futureFocusEn: 'Python',
  futureFocusAr: 'بايثون',
  githubUrl: 'https://github.com/dahaliztupe-sketch',
  linkedinUrl: 'https://www.linkedin.com/in/abdalrahman-mostafa-/',
};

test('JSON-LD never leaks private contactEmail across any route', () => {
  const routes = ['home', 'academic', 'projects', 'project-detail', 'notes', 'note-detail', 'connect'] as const;
  const profileWithLegacyPii = {
    ...SAMPLE_PROFILE,
    contactEmail: 'abdalrahman32008@gmail.com',
  } as unknown as ProfileSettingsRecord;
  for (const routeName of routes) {
    const jsonLd = buildStructuredDataJsonLd({
      routeName,
      language: 'en',
      title: 'Test Title',
      description: 'Test Description',
      canonicalUrl: 'https://neuralatlas.example/',
      origin: 'https://neuralatlas.example',
      profile: profileWithLegacyPii,
      override: null,
    });
    const serialized = JSON.stringify(jsonLd);
    assert.equal(serialized.includes('abdalrahman32008@gmail.com'), false);
    assert.equal(serialized.includes('"email"'), false);
  }
});

test('home generates WebSite schema with Al-Azhar University affiliation and public sameAs links', () => {
  const jsonLd = buildStructuredDataJsonLd({
    routeName: 'home',
    language: 'en',
    title: 'Neural Atlas',
    description: 'Portfolio',
    canonicalUrl: 'https://neuralatlas.example/',
    origin: 'https://neuralatlas.example',
    profile: SAMPLE_PROFILE,
    override: null,
  });
  assert.equal(jsonLd['@type'], 'WebSite');
  const author = jsonLd.author as Record<string, unknown>;
  assert.equal(author['@type'], 'Person');
  assert.equal((author.affiliation as Record<string, unknown>)['@type'], 'CollegeOrUniversity');
  assert.deepEqual(author.sameAs, [SAMPLE_PROFILE.githubUrl, SAMPLE_PROFILE.linkedinUrl]);
});

test('academic generates CollectionPage with Course ItemList', () => {
  const jsonLd = buildStructuredDataJsonLd({
    routeName: 'academic',
    language: 'en',
    title: 'Academic Journey · Neural Atlas',
    description: 'Coursework',
    canonicalUrl: 'https://neuralatlas.example/academic',
    origin: 'https://neuralatlas.example',
    profile: SAMPLE_PROFILE,
    override: {
      courses: [
        { name: 'Introduction to Artificial Intelligence', providerName: 'Faculty of Science · Al-Azhar University' },
        { name: 'Computer Logic Design', providerName: 'Faculty of Science · Al-Azhar University' },
      ],
    },
  });
  assert.equal(jsonLd['@type'], 'CollectionPage');
  const mainEntity = jsonLd.mainEntity as Record<string, unknown>;
  assert.equal(mainEntity['@type'], 'ItemList');
  assert.equal(mainEntity.numberOfItems, 2);
});

test('project-detail and note-detail generate @graph with primary entity and BreadcrumbList', () => {
  const projJson = buildStructuredDataJsonLd({
    routeName: 'project-detail',
    language: 'en',
    title: 'C++ & Problem Solving',
    description: 'C++ algorithms',
    canonicalUrl: 'https://neuralatlas.example/projects/cpp-problem-solving',
    origin: 'https://neuralatlas.example',
    profile: SAMPLE_PROFILE,
    override: {
      itemName: 'C++ & Problem Solving',
      keywords: ['C++', 'Algorithms'],
      codeRepository: 'https://github.com/dahaliztupe-sketch',
    },
  });
  const projGraph = projJson['@graph'] as Array<Record<string, unknown>>;
  assert.equal(projGraph.length, 2);
  assert.equal(projGraph[0]['@type'], 'SoftwareSourceCode');
  assert.equal(projGraph[1]['@type'], 'BreadcrumbList');

  const noteJson = buildStructuredDataJsonLd({
    routeName: 'note-detail',
    language: 'ar',
    title: 'مذكرة تعلّم',
    description: 'وصف',
    canonicalUrl: 'https://neuralatlas.example/notes/test-note',
    origin: 'https://neuralatlas.example',
    profile: SAMPLE_PROFILE,
    override: { itemName: 'مذكرة تعلّم' },
  });
  const noteGraph = noteJson['@graph'] as Array<Record<string, unknown>>;
  assert.equal(noteGraph[0]['@type'], 'TechArticle');
  assert.equal(noteGraph[1]['@type'], 'BreadcrumbList');
});

test('connect generates ContactPage schema', () => {
  const jsonLd = buildStructuredDataJsonLd({
    routeName: 'connect',
    language: 'en',
    title: 'Connect · Neural Atlas',
    description: 'Connect',
    canonicalUrl: 'https://neuralatlas.example/connect',
    origin: 'https://neuralatlas.example',
    profile: SAMPLE_PROFILE,
    override: null,
  });
  assert.equal(jsonLd['@type'], 'ContactPage');
});

test('resolveBaseSiteUrl and sitemap/robots generators operate safely with and without VITE_SITE_URL', () => {
  assert.equal(normalizeSiteUrl('https://neuralatlas.dev/sub/path'), 'https://neuralatlas.dev');
  assert.equal(normalizeSiteUrl('javascript:alert(1)'), '');
  assert.equal(resolveBaseSiteUrl('https://prod.example.com/', 'http://localhost:3000'), 'https://prod.example.com');
  assert.equal(resolveBaseSiteUrl('', 'http://localhost:3000'), 'http://localhost:3000');

  const xmlWithHost = generateSitemapXml('https://prod.example.com');
  assert.ok(xmlWithHost.includes('<loc>https://prod.example.com/projects</loc>'));
  assert.ok(!xmlWithHost.includes('/admin'));

  const xmlRelative = generateSitemapXml('');
  assert.ok(xmlRelative.includes('<loc>/projects</loc>'));

  const robots = generateRobotsTxt('https://prod.example.com');
  assert.ok(robots.includes('Disallow: /admin'));
  assert.ok(robots.includes('Sitemap: https://prod.example.com/sitemap.xml'));
});

test('resolveRobotsMetaContent marks admin, not-found, and draft previews as noindex, nofollow', () => {
  assert.equal(resolveRobotsMetaContent('admin'), 'noindex, nofollow');
  assert.equal(resolveRobotsMetaContent('not-found'), 'noindex, nofollow');
  assert.equal(resolveRobotsMetaContent('project-detail', { noIndex: true }), 'noindex, nofollow');
  assert.equal(resolveRobotsMetaContent('projects'), 'index, follow');
});

