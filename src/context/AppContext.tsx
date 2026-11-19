import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Language, Theme, ProfileSettingsRecord, SeoOverride } from '../types';
import { TRANSLATIONS } from '../data/translations';
import {
  OWNER_INFO,
  SOCIAL_LINKS,
  LEARNING_TRACKS,
  PRACTICAL_EXPERIENCE,
} from '../data/portfolioData';
import { matchRoute, RouteMatch, normalizePath } from '../router/router';
import { getPublicProfileSettingsResult, SingleDataQueryResult } from '../services/contentRepository';
import { clientCache, CACHE_KEYS } from '../services/cacheService';
import {
  buildStructuredDataJsonLd,
  resolveBaseSiteUrl,
  resolveRobotsMetaContent,
  upsertJsonLdScript,
} from '../lib/seo';

interface AppContextType {
  language: Language;
  theme: Theme;
  setLanguage: (lang: Language) => void;
  setTheme: (theme: Theme) => void;
  toggleLanguage: () => void;
  toggleTheme: () => void;
  currentPath: string;
  currentRoute: RouteMatch;
  navigate: (path: string) => void;
  t: (key: keyof typeof TRANSLATIONS['en']) => string;
  isRtl: boolean;
  publicProfile: ProfileSettingsRecord;
  refreshPublicProfile: () => Promise<void>;
  setSeoOverride: (override: SeoOverride | null) => void;
}

const DEFAULT_PUBLIC_PROFILE: ProfileSettingsRecord = {
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
};

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_LANG_KEY = 'neural_atlas_lang';
const STORAGE_THEME_KEY = 'neural_atlas_theme';

function updateMetaTag(selector: string, attributeName: string, content: string) {
  const el = document.querySelector(selector);
  if (el) {
    el.setAttribute(attributeName, content);
  }
}

function upsertRobotsMeta(content: string) {
  let meta = document.querySelector('meta[name="robots"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('name', 'robots');
    document.head.appendChild(meta);
  }
  meta.setAttribute('content', content);
}

function updateCanonicalLink(href: string) {
  let link = document.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', href);
}

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_LANG_KEY);
      if (saved === 'ar' || saved === 'en') return saved;
    } catch {
      // ignore storage errors
    }
    return 'en';
  });

  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_THEME_KEY);
      if (saved === 'light' || saved === 'dark') return saved;
    } catch {
      // ignore storage errors
    }
    return 'dark';
  });

  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname || '/';
    }
    return '/';
  });

  const [publicProfile, setPublicProfile] = useState<ProfileSettingsRecord>(() => {
    const cached = clientCache.get<SingleDataQueryResult<ProfileSettingsRecord>>(CACHE_KEYS.profile);
    return cached?.data?.item || DEFAULT_PUBLIC_PROFILE;
  });
  const [seoOverride, setSeoOverride] = useState<SeoOverride | null>(null);

  const isRtl = language === 'ar';

  const refreshPublicProfile = useCallback(async () => {
    const res = await clientCache.dedupe(CACHE_KEYS.profile, () => getPublicProfileSettingsResult());
    if (res.status !== 'error') {
      clientCache.set(CACHE_KEYS.profile, res);
    }
    if (res.item) {
      setPublicProfile(res.item);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const cached = clientCache.get<SingleDataQueryResult<ProfileSettingsRecord>>(CACHE_KEYS.profile);
    if (cached?.data?.item) {
      setPublicProfile(cached.data.item);
    }

    if (!cached || !cached.isFresh) {
      clientCache.dedupe(CACHE_KEYS.profile, () => getPublicProfileSettingsResult()).then((res) => {
        if (!active) return;
        if (res.status !== 'error') {
          clientCache.set(CACHE_KEYS.profile, res);
        }
        if (res.item) {
          setPublicProfile(res.item);
        }
      });
    }

    const unsubscribe = clientCache.subscribe((invalidatedKeyOrPrefix) => {
      if (
        invalidatedKeyOrPrefix === '*' ||
        invalidatedKeyOrPrefix === CACHE_KEYS.profile ||
        CACHE_KEYS.profile.startsWith(invalidatedKeyOrPrefix)
      ) {
        clientCache.dedupe(CACHE_KEYS.profile, () => getPublicProfileSettingsResult()).then((res) => {
          if (!active) return;
          if (res.status !== 'error') {
            clientCache.set(CACHE_KEYS.profile, res);
          }
          if (res.item) {
            setPublicProfile(res.item);
          }
        });
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.lang = language;
    root.dir = isRtl ? 'rtl' : 'ltr';

    if (theme === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
    } else {
      root.classList.add('dark');
      root.classList.remove('light');
    }
  }, [language, theme, isRtl]);

  useEffect(() => {
    const handlePopState = () => {
      setSeoOverride(null);
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const setLanguage = useCallback((newLang: Language) => {
    setLanguageState(newLang);
    try {
      localStorage.setItem(STORAGE_LANG_KEY, newLang);
    } catch {
      // silent catch
    }
  }, []);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(STORAGE_THEME_KEY, newTheme);
    } catch {
      // silent catch
    }
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  }, [language, setLanguage]);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  const navigate = useCallback((path: string) => {
    const normalized = normalizePath(path);
    setSeoOverride(null);
    if (typeof window !== 'undefined') {
      if (window.location.pathname !== normalized) {
        window.history.pushState({}, '', normalized);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setCurrentPath(normalized);
  }, []);

  const t = useCallback(
    (key: keyof typeof TRANSLATIONS['en']): string => {
      const dict = TRANSLATIONS[language] || TRANSLATIONS.en;
      return dict[key] || TRANSLATIONS.en[key] || String(key);
    },
    [language]
  );

  const currentRoute = matchRoute(currentPath);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const brand = 'Neural Atlas';
    const owner = isRtl ? publicProfile.nameAr : publicProfile.nameEn;
    let pageTitle = `${brand} - ${owner}`;
    let pageDesc = isRtl ? publicProfile.bioAr : publicProfile.bioEn;

    switch (currentRoute.routeName) {
      case 'about':
        pageTitle = `${t('navAbout')} · ${brand}`;
        pageDesc = t('aboutSubtitle');
        break;
      case 'academic':
        pageTitle = `${t('navAcademic')} · ${brand}`;
        pageDesc = t('academicSubtitle');
        break;
      case 'projects':
      case 'project-detail':
        pageTitle = `${t('navProjects')} · ${brand}`;
        pageDesc = t('projectsSubtitle');
        break;
      case 'notes':
      case 'note-detail':
        pageTitle = `${t('navNotes')} · ${brand}`;
        pageDesc = t('notesSubtitle');
        break;
      case 'milestones':
        pageTitle = `${t('navMilestones')} · ${brand}`;
        pageDesc = t('milestonesSubtitle');
        break;
      case 'connect':
        pageTitle = `${t('navConnect')} · ${brand}`;
        pageDesc = t('connectSubtitle');
        break;
      case 'admin':
        pageTitle = `${t('adminTitle')} · ${brand}`;
        pageDesc = t('adminSubtitle');
        break;
      case 'not-found':
        pageTitle = `${t('notFoundTitle')} · ${brand}`;
        pageDesc = t('notFoundDesc');
        break;
      default:
        break;
    }

    const finalTitle = seoOverride?.title?.trim() || pageTitle;
    const finalDesc = seoOverride?.description?.trim() || pageDesc;
    const origin = resolveBaseSiteUrl(
      import.meta.env.VITE_SITE_URL,
      typeof window !== 'undefined' ? window.location.origin : ''
    );
    const canonicalUrl = origin
      ? `${origin}${normalizePath(currentPath)}`
      : normalizePath(currentPath);

    document.title = finalTitle;
    upsertRobotsMeta(resolveRobotsMetaContent(currentRoute.routeName, seoOverride));
    updateMetaTag('meta[name="description"]', 'content', finalDesc);
    updateMetaTag('meta[property="og:title"]', 'content', finalTitle);
    updateMetaTag('meta[property="og:description"]', 'content', finalDesc);
    updateMetaTag('meta[property="og:type"]', 'content', seoOverride?.type || 'website');
    updateMetaTag('meta[property="og:url"]', 'content', canonicalUrl);
    updateMetaTag('meta[property="og:image"]', 'content', origin ? `${origin}/og-preview.png` : '/og-preview.png');
    updateMetaTag('meta[property="og:image:alt"]', 'content', `${finalTitle} — ${owner}`);
    updateMetaTag('meta[property="og:locale"]', 'content', isRtl ? 'ar_EG' : 'en_US');
    updateMetaTag('meta[property="og:locale:alternate"]', 'content', isRtl ? 'en_US' : 'ar_EG');
    updateMetaTag('meta[name="twitter:title"]', 'content', finalTitle);
    updateMetaTag('meta[name="twitter:description"]', 'content', finalDesc);
    updateMetaTag('meta[name="twitter:image"]', 'content', origin ? `${origin}/og-preview.png` : '/og-preview.png');
    updateMetaTag('meta[name="theme-color"]', 'content', theme === 'light' ? '#f4f6fb' : '#050811');
    updateCanonicalLink(canonicalUrl);

    const jsonLd = buildStructuredDataJsonLd({
      routeName: currentRoute.routeName,
      language,
      title: finalTitle,
      description: finalDesc,
      canonicalUrl,
      origin,
      profile: publicProfile,
      override: seoOverride,
    });
    upsertJsonLdScript(jsonLd);
  }, [currentRoute.routeName, currentPath, isRtl, language, theme, publicProfile, seoOverride, t]);

  return (
    <AppContext.Provider
      value={{
        language,
        theme,
        setLanguage,
        setTheme,
        toggleLanguage,
        toggleTheme,
        currentPath,
        currentRoute,
        navigate,
        t,
        isRtl,
        publicProfile,
        refreshPublicProfile,
        setSeoOverride,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
