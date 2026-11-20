import { Language, ProfileSettingsRecord, SeoOverride } from '../types/index.ts';
import { RouteName } from '../router/router.ts';

export interface StructuredSeoInput {
  routeName: RouteName;
  language: Language;
  title: string;
  description: string;
  canonicalUrl: string;
  origin: string;
  profile: ProfileSettingsRecord;
  override: SeoOverride | null;
}

function buildBreadcrumbList(params: {
  origin: string;
  canonicalUrl: string;
  language: Language;
  parentPath: string;
  parentNameEn: string;
  parentNameAr: string;
  currentName: string;
}): Record<string, unknown> {
  const { origin, canonicalUrl, language, parentPath, parentNameEn, parentNameAr, currentName } = params;
  const homeUrl = origin ? `${origin}/` : '/';
  const parentUrl = origin ? `${origin}${parentPath}` : parentPath;

  return {
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: language === 'ar' ? 'الرئيسية' : 'Neural Atlas',
        item: homeUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: language === 'ar' ? parentNameAr : parentNameEn,
        item: parentUrl,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: currentName,
        item: canonicalUrl,
      },
    ],
  };
}

export function buildStructuredDataJsonLd(input: StructuredSeoInput): Record<string, unknown> {
  const { routeName, language, title, description, canonicalUrl, origin, profile, override } = input;
  const authorName = language === 'ar' ? profile.nameAr : profile.nameEn;
  const authorUrl = origin || canonicalUrl;
  const sameAs = [profile.githubUrl, profile.linkedinUrl].filter(Boolean);
  const langCode = language === 'ar' ? 'ar' : 'en';

  // Strictly omit private contact email from public JSON-LD
  const personNode: Record<string, unknown> = {
    '@type': 'Person',
    name: authorName,
    url: authorUrl,
    jobTitle: language === 'ar' ? profile.titleAr : profile.titleEn,
    affiliation: {
      '@type': 'CollegeOrUniversity',
      name: language === 'ar' ? profile.facultyAr : profile.facultyEn,
    },
    knowsAbout:
      language === 'ar'
        ? [
            'علوم الحاسب',
            'الحوسبة الذكية',
            'الذكاء الاصطناعي',
            'أنظمة الذكاء الاصطناعي المحلية',
            'لغة C++',
            'لغة بايثون',
            'الخوارزميات وهياكل البيانات',
            'تطوير البرمجيات',
          ]
        : [
            'Computer Science',
            'Intelligent Computing',
            'Artificial Intelligence',
            'Local AI Systems',
            'C++',
            'Python',
            'Algorithms & Data Structures',
            'Software Development',
          ],
    ...(sameAs.length > 0 ? { sameAs } : {}),
  };

  if (routeName === 'note-detail') {
    const articleNode: Record<string, unknown> = {
      '@type': 'TechArticle',
      headline: override?.itemName || title,
      description,
      inLanguage: langCode,
      url: canonicalUrl,
      author: personNode,
      ...(override?.publishedAt ? { datePublished: override.publishedAt } : {}),
      ...(override?.updatedAt ? { dateModified: override.updatedAt } : {}),
      ...(override?.keywords && override.keywords.length > 0 ? { keywords: override.keywords.join(', ') } : {}),
    };

    const breadcrumbNode = buildBreadcrumbList({
      origin,
      canonicalUrl,
      language,
      parentPath: '/notes',
      parentNameEn: 'Learning Notes',
      parentNameAr: 'مذكرات التعلّم',
      currentName: override?.itemName || title,
    });

    return {
      '@context': 'https://schema.org',
      '@graph': [articleNode, breadcrumbNode],
    };
  }

  if (routeName === 'project-detail') {
    const softwareNode: Record<string, unknown> = {
      '@type': 'SoftwareSourceCode',
      name: override?.itemName || title,
      description,
      inLanguage: langCode,
      url: canonicalUrl,
      author: personNode,
      ...(override?.codeRepository ? { codeRepository: override.codeRepository } : {}),
      ...(override?.publishedAt ? { dateCreated: override.publishedAt } : {}),
      ...(override?.updatedAt ? { dateModified: override.updatedAt } : {}),
      ...(override?.keywords && override.keywords.length > 0 ? { programmingLanguage: override.keywords } : {}),
    };

    const breadcrumbNode = buildBreadcrumbList({
      origin,
      canonicalUrl,
      language,
      parentPath: '/projects',
      parentNameEn: 'Projects',
      parentNameAr: 'المشاريع',
      currentName: override?.itemName || title,
    });

    return {
      '@context': 'https://schema.org',
      '@graph': [softwareNode, breadcrumbNode],
    };
  }

  if (routeName === 'academic') {
    const courseItems = (override?.courses || []).map((course, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      item: {
        '@type': 'Course',
        name: course.name,
        ...(course.description ? { description: course.description } : {}),
        provider: {
          '@type': 'CollegeOrUniversity',
          name: course.providerName,
        },
      },
    }));

    return {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: title,
      description,
      inLanguage: langCode,
      url: canonicalUrl,
      author: personNode,
      ...(courseItems.length > 0
        ? {
            mainEntity: {
              '@type': 'ItemList',
              numberOfItems: courseItems.length,
              itemListElement: courseItems,
            },
          }
        : {}),
    };
  }

  if (routeName === 'connect') {
    return {
      '@context': 'https://schema.org',
      '@type': 'ContactPage',
      name: title,
      description,
      inLanguage: langCode,
      url: canonicalUrl,
      mainEntity: personNode,
    };
  }

  if (routeName === 'projects' || routeName === 'notes' || routeName === 'milestones') {
    return {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: title,
      description,
      inLanguage: langCode,
      url: canonicalUrl,
      author: personNode,
    };
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Neural Atlas',
    description,
    inLanguage: langCode,
    url: canonicalUrl,
    author: personNode,
  };
}

export function upsertJsonLdScript(data: Record<string, unknown>) {
  if (typeof document === 'undefined') return;
  const selector = 'script[data-na-jsonld="true"]';
  let script = document.querySelector(selector) as HTMLScriptElement | null;
  if (!script) {
    script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-na-jsonld', 'true');
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(data);
}

export function normalizeSiteUrl(raw?: string | null): string {
  const trimmed = String(raw || '').trim();
  if (!trimmed) return '';
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return '';
    return parsed.origin;
  } catch {
    return '';
  }
}

export function resolveBaseSiteUrl(envSiteUrl?: string | null, runtimeOrigin?: string | null): string {
  return normalizeSiteUrl(envSiteUrl) || normalizeSiteUrl(runtimeOrigin);
}

export function resolveRobotsMetaContent(routeName: RouteName, override?: SeoOverride | null): string {
  if (routeName === 'admin' || routeName === 'not-found' || override?.noIndex) {
    return 'noindex, nofollow';
  }
  return 'index, follow';
}

export const PUBLIC_STATIC_SITEMAP_ROUTES: ReadonlyArray<{
  path: string;
  changefreq: string;
  priority: string;
}> = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/about', changefreq: 'monthly', priority: '0.8' },
  { path: '/academic', changefreq: 'monthly', priority: '0.9' },
  { path: '/projects', changefreq: 'weekly', priority: '0.9' },
  { path: '/notes', changefreq: 'weekly', priority: '0.8' },
  { path: '/milestones', changefreq: 'monthly', priority: '0.7' },
  { path: '/connect', changefreq: 'monthly', priority: '0.7' },
];

export function generateSitemapXml(siteUrl?: string | null): string {
  const base = normalizeSiteUrl(siteUrl);
  const urlEntries = PUBLIC_STATIC_SITEMAP_ROUTES.map((route) => {
    const loc = base ? `${base}${route.path}` : route.path;
    return [
      '  <url>',
      `    <loc>${loc}</loc>`,
      `    <changefreq>${route.changefreq}</changefreq>`,
      `    <priority>${route.priority}</priority>`,
      '  </url>',
    ].join('\n');
  }).join('\n');

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urlEntries,
    '</urlset>',
    '',
  ].join('\n');
}

export function generateRobotsTxt(siteUrl?: string | null): string {
  const base = normalizeSiteUrl(siteUrl);
  const sitemapLine = base ? `Sitemap: ${base}/sitemap.xml` : 'Sitemap: /sitemap.xml';
  return [
    'User-agent: *',
    'Allow: /',
    'Disallow: /admin',
    sitemapLine,
    '',
  ].join('\n');
}
