import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { EmptyState } from '../components/EmptyState';
import { LearningNoteRecord } from '../types';
import { CACHE_KEYS } from '../services/cacheService';
import { useCachedResource } from '../hooks/useCachedResource';
import {
  DataQueryResult,
  SingleDataQueryResult,
  getPublishedNotesResult,
  getNoteBySlugResult,
  formatLocalizedDate,
} from '../services/contentRepository';
import { filterNotesCatalog, resolveNoteCategoryAndTags } from '../lib/validation';
import { computeReadingStats } from '../lib/markdown';
import { KNOWLEDGE_CATEGORIES } from '../data/portfolioData';
import {
  FileText,
  ArrowRight,
  ArrowLeft,
  Calendar,
  ChevronRight,
  RefreshCw,
  AlertTriangle,
  Search,
  X,
  Clock,
  Share2,
  Check,
  EyeOff,
  Layers,
} from 'lucide-react';

const LazyMarkdownRenderer = lazy(() =>
  import('../components/MarkdownRenderer').then((m) => ({ default: m.MarkdownRenderer }))
);

interface LearningNotesPageProps {
  noteId?: string;
}

export const LearningNotesPage: React.FC<LearningNotesPageProps> = ({ noteId }) => {
  const { t, isRtl, language, navigate, setSeoOverride } = useApp();
  const { isOwner, loading: authLoading } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [tagFilter, setTagFilter] = useState('all');
  const [showAllTags, setShowAllTags] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const fetchNotesList = useCallback(() => getPublishedNotesResult(), []);
  const fetchNoteDetail = useCallback(
    () => getNoteBySlugResult(noteId || '', isOwner),
    [noteId, isOwner]
  );

  const listState = useCachedResource<DataQueryResult<LearningNoteRecord[]>>(
    CACHE_KEYS.notesList,
    fetchNotesList,
    {
      enabled: true,
      shouldPersist: (res) => res.status !== 'error',
      isErrorResult: (res) => res.status === 'error',
    }
  );

  const detailState = useCachedResource<SingleDataQueryResult<LearningNoteRecord>>(
    CACHE_KEYS.noteBySlug(noteId || ''),
    fetchNoteDetail,
    {
      enabled: Boolean(noteId) && !authLoading,
      bypassCache: isOwner,
      shouldPersist: (res) => res.status !== 'error',
      isErrorResult: (res) => res.status === 'error',
    }
  );

  const loading = noteId ? detailState.loading || authLoading : listState.loading;
  const errorCode = noteId
    ? detailState.data?.status === 'error'
      ? detailState.data.errorCode || 'query_error'
      : null
    : listState.data?.status === 'error'
    ? listState.data.errorCode || 'query_error'
    : null;

  const notes = useMemo(
    () => (listState.data && listState.data.status !== 'error' ? listState.data.items : []),
    [listState.data]
  );
  const activeNote =
    detailState.data && detailState.data.status !== 'error' ? detailState.data.item : null;

  const validCategoryKeys = useMemo(
    () => KNOWLEDGE_CATEGORIES.map((c) => c.topicMatchKey),
    []
  );

  const categoryByKey = useMemo(
    () => new Map(KNOWLEDGE_CATEGORIES.map((c) => [c.topicMatchKey.toLowerCase(), c])),
    []
  );

  const getLocalizedCategoryTitle = useCallback(
    (categoryKey: string | null) => {
      if (!categoryKey) return null;
      const match = categoryByKey.get(categoryKey.toLowerCase());
      if (!match) return categoryKey;
      return isRtl ? match.titleAr : match.titleEn;
    },
    [categoryByKey, isRtl]
  );

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const key of validCategoryKeys) {
      counts.set(key.toLowerCase(), 0);
    }
    for (const note of notes) {
      const { categoryKey } = resolveNoteCategoryAndTags(note.topicLabels, validCategoryKeys);
      if (categoryKey) {
        const k = categoryKey.toLowerCase();
        counts.set(k, (counts.get(k) || 0) + 1);
      }
    }
    return counts;
  }, [notes, validCategoryKeys]);

  const uniqueTags = useMemo(() => {
    const seen = new Map<string, string>();
    const sourceNotes =
      categoryFilter !== 'all'
        ? notes.filter((n) => {
            const { categoryKey } = resolveNoteCategoryAndTags(n.topicLabels, validCategoryKeys);
            return categoryKey?.toLowerCase() === categoryFilter.toLowerCase();
          })
        : notes;
    for (const note of sourceNotes) {
      const { tags } = resolveNoteCategoryAndTags(note.topicLabels, validCategoryKeys);
      for (const tag of tags) {
        const clean = tag.trim();
        if (clean && !seen.has(clean.toLowerCase())) {
          seen.set(clean.toLowerCase(), clean);
        }
      }
    }
    if (tagFilter !== 'all' && !seen.has(tagFilter.toLowerCase())) {
      seen.set(tagFilter.toLowerCase(), tagFilter);
    }
    return Array.from(seen.values());
  }, [notes, validCategoryKeys, categoryFilter, tagFilter]);

  const DEFAULT_VISIBLE_TAGS = 6;
  const visibleTags = useMemo(() => {
    if (showAllTags || categoryFilter !== 'all' || uniqueTags.length <= DEFAULT_VISIBLE_TAGS) {
      return uniqueTags;
    }
    const base = uniqueTags.slice(0, DEFAULT_VISIBLE_TAGS);
    if (
      tagFilter !== 'all' &&
      !base.some((tItem) => tItem.toLowerCase() === tagFilter.toLowerCase())
    ) {
      return [...base, tagFilter];
    }
    return base;
  }, [uniqueTags, showAllTags, categoryFilter, tagFilter]);
  const hiddenTagsCount = Math.max(0, uniqueTags.length - visibleTags.length);

  const filteredNotes = useMemo(
    () =>
      filterNotesCatalog(notes, {
        queryText: searchQuery,
        categoryFilter,
        tagFilter,
        validCategoryKeys,
      }),
    [notes, searchQuery, categoryFilter, tagFilter, validCategoryKeys]
  );

  const hasActiveFilters =
    categoryFilter !== 'all' || tagFilter !== 'all' || searchQuery.trim().length > 0;

  const isCategoryOnlyEmpty =
    filteredNotes.length === 0 &&
    categoryFilter !== 'all' &&
    tagFilter === 'all' &&
    searchQuery.trim().length === 0;

  const relatedNotes = useMemo(() => {
    if (!activeNote || notes.length === 0) return [];
    const topicSet = new Set((activeNote.topicLabels || []).map((topic) => topic.toLowerCase()));
    return notes
      .filter((candidate) => candidate.id !== activeNote.id && candidate.slug !== activeNote.slug)
      .map((candidate) => {
        const overlap = (candidate.topicLabels || []).filter((topic) =>
          topicSet.has(topic.toLowerCase())
        ).length;
        return { candidate, overlap };
      })
      .sort((a, b) => b.overlap - a.overlap)
      .slice(0, 2)
      .map((entry) => entry.candidate);
  }, [activeNote, notes]);

  const handleCopyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setLinkCopied(true);
      window.setTimeout(() => setLinkCopied(false), 2200);
    } catch {
      // Clipboard API unavailable in restricted contexts
    }
  };

  const resetFilters = () => {
    setSearchQuery('');
    setCategoryFilter('all');
    setTagFilter('all');
  };

  const loadData = noteId ? detailState.refresh : listState.refresh;

  useEffect(() => {
    if (!noteId || !activeNote) {
      setSeoOverride(null);
      return;
    }
    const title = isRtl
      ? activeNote.seoTitleAr || `${activeNote.titleAr} · ${t('siteName')}`
      : activeNote.seoTitleEn || `${activeNote.titleEn} · Neural Atlas`;
    const description = isRtl
      ? activeNote.seoDescriptionAr || activeNote.summaryAr || t('notesSubtitle')
      : activeNote.seoDescriptionEn || activeNote.summaryEn || t('notesSubtitle');
    setSeoOverride({
      title,
      description,
      itemName: isRtl ? activeNote.titleAr : activeNote.titleEn,
      type: 'article',
      publishedAt: activeNote.publishedAt,
      updatedAt: activeNote.updatedAt,
      keywords: activeNote.topicLabels,
      noIndex: activeNote.publicationStatus !== 'published',
    });
    return () => setSeoOverride(null);
  }, [noteId, activeNote, isRtl, setSeoOverride, t]);

  const activeNoteMeta = useMemo(() => {
    if (!activeNote) return { categoryKey: null, categoryTitle: null, tags: [] as string[] };
    const { categoryKey, tags } = resolveNoteCategoryAndTags(
      activeNote.topicLabels,
      validCategoryKeys
    );
    return {
      categoryKey,
      categoryTitle: getLocalizedCategoryTitle(categoryKey),
      tags,
    };
  }, [activeNote, validCategoryKeys, getLocalizedCategoryTitle]);

  const activePublishedDate = formatLocalizedDate(activeNote?.publishedAt, language);
  const activeCreatedDate = formatLocalizedDate(activeNote?.createdAt, language);
  const activeUpdatedDate = formatLocalizedDate(activeNote?.updatedAt, language);
  const primaryDateLabel = activePublishedDate || activeCreatedDate;
  const showSeparateUpdatedDate =
    Boolean(activeUpdatedDate) && activeUpdatedDate !== primaryDateLabel;
  const showSeparateCreatedDate =
    Boolean(activeCreatedDate) &&
    Boolean(activePublishedDate) &&
    activeCreatedDate !== activePublishedDate;

  const activeContent = activeNote
    ? isRtl
      ? activeNote.contentAr || activeNote.contentEn
      : activeNote.contentEn || activeNote.contentAr
    : '';
  const activeStats = useMemo(() => computeReadingStats(activeContent), [activeContent]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-10">
      <div>
        <div className="flex items-center gap-2 text-xs font-mono text-[var(--color-secondary)] mb-2">
          <FileText className="w-4 h-4" aria-hidden="true" />
          <span>{t('notesKicker')}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-[var(--color-text)] tracking-tight text-balance mb-3">
          {t('notesTitle')}
        </h1>
        <p className="text-base text-[var(--color-text-muted)] leading-relaxed">
          {t('notesSubtitle')}
        </p>
      </div>

      {/* 9 Public Knowledge Categories Directory (List View Only) */}
      {!noteId && (
        <section className="space-y-4" aria-labelledby="knowledge-categories-heading">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2
                id="knowledge-categories-heading"
                className="text-base font-semibold text-[var(--color-text)] flex items-center gap-2"
              >
                <Layers className="w-4 h-4 text-[var(--color-primary)] shrink-0" aria-hidden="true" />
                <span>{t('notesCategoriesHeading')}</span>
              </h2>
              <div className="flex items-center gap-3 text-xs font-mono">
                {categoryFilter !== 'all' && (
                  <button
                    type="button"
                    onClick={() => setCategoryFilter('all')}
                    className="text-[var(--color-primary)] hover:underline cursor-pointer"
                  >
                    {t('notesAllCategoriesBtn')}
                  </button>
                )}
                <span className="text-[var(--color-secondary)] tabular-nums">
                  {String(KNOWLEDGE_CATEGORIES.length).padStart(2, '0')}
                </span>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-[var(--color-text-muted)] leading-relaxed">
              {t('notesCategoriesSubtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {KNOWLEDGE_CATEGORIES.map((category, idx) => {
              const count = categoryCounts.get(category.topicMatchKey.toLowerCase()) || 0;
              const isSelected =
                categoryFilter.toLowerCase() === category.topicMatchKey.toLowerCase();
              const countLabel = isRtl
                ? count === 0
                  ? 'قريباً'
                  : count === 1
                  ? 'مذكرة واحدة'
                  : `${count} مذكرات`
                : count === 0
                ? '0 notes'
                : count === 1
                ? '1 note'
                : `${count} notes`;

              return (
                <button
                  key={category.id}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() =>
                    setCategoryFilter(isSelected ? 'all' : category.topicMatchKey)
                  }
                  className={`na-mineral-card na-mineral-card-interactive p-3.5 rounded-xl space-y-1.5 text-start transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] ${
                    isSelected
                      ? 'border-[var(--color-primary)] bg-[var(--color-surface-hover)]'
                      : ''
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="tabular-nums text-[var(--color-secondary)]">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <span
                      className={`tabular-nums ${
                        isSelected
                          ? 'text-[var(--color-primary)] font-semibold'
                          : count > 0
                          ? 'text-[var(--color-text-muted)]'
                          : 'text-[var(--color-text-subtle)]'
                      }`}
                    >
                      {countLabel}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-[var(--color-text)] leading-snug">
                    {isRtl ? category.titleAr : category.titleEn}
                  </h3>
                  <p className="text-xs text-[var(--color-text-muted)] leading-relaxed line-clamp-2">
                    {isRtl ? category.descriptionAr : category.descriptionEn}
                  </p>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Search & Complementary Tag Filter Bar (List View Only) */}
      {!noteId && !loading && !errorCode && notes.length > 0 && (
        <div className="space-y-3 pt-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 sm:max-w-sm">
              <Search
                className="w-4 h-4 text-[var(--color-text-subtle)] absolute top-1/2 -translate-y-1/2 start-3 pointer-events-none"
                aria-hidden="true"
              />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('searchNotesPlaceholder')}
                aria-label={t('searchNotesPlaceholder')}
                className="w-full ps-9 pe-8 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-xs text-[var(--color-text)] placeholder:text-[var(--color-text-subtle)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="p-1 text-[var(--color-text-subtle)] hover:text-[var(--color-text)] absolute top-1/2 -translate-y-1/2 end-2 cursor-pointer"
                  aria-label={t('clearFiltersBtn')}
                >
                  <X className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 text-xs text-[var(--color-text-subtle)] font-mono tabular-nums">
              <span>
                {filteredNotes.length} / {notes.length} {t('projectsCountEntries')}
              </span>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-[var(--color-primary)] hover:underline cursor-pointer"
                >
                  {t('clearFiltersBtn')}
                </button>
              )}
            </div>
          </div>

          {uniqueTags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-[11px] font-mono text-[var(--color-text-subtle)] me-1">
                {t('notesAvailableTagsHeading')}:
              </span>
              <button
                type="button"
                onClick={() => setTagFilter('all')}
                className={`px-2.5 py-1 rounded-lg border font-mono transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] ${
                  tagFilter === 'all'
                    ? 'border-[var(--color-secondary)] bg-[var(--color-secondary-muted)] text-[var(--color-secondary)] font-semibold'
                    : 'border-[var(--color-border-subtle)] bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                }`}
              >
                {t('notesAllTagsBtn')}
              </button>
              {visibleTags.map((tag) => {
                const active = tagFilter.toLowerCase() === tag.toLowerCase();
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setTagFilter(active ? 'all' : tag)}
                    className={`px-2.5 py-1 rounded-lg border font-mono transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] ${
                      active
                        ? 'border-[var(--color-secondary)] bg-[var(--color-secondary-muted)] text-[var(--color-secondary)] font-semibold'
                        : 'border-[var(--color-border-subtle)] bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
              {categoryFilter === 'all' && uniqueTags.length > DEFAULT_VISIBLE_TAGS && (
                <button
                  type="button"
                  onClick={() => setShowAllTags((prev) => !prev)}
                  className="px-2 py-1 text-[11px] font-mono text-[var(--color-primary)] hover:underline cursor-pointer"
                >
                  {showAllTags
                    ? isRtl
                      ? 'أقل'
                      : 'Less'
                    : isRtl
                    ? `+${hiddenTagsCount} وسوم`
                    : `+${hiddenTagsCount} more`}
                </button>
              )}
            </div>
          )}
        </div>
      )}

      <div aria-live="polite">
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-2 text-xs font-mono text-[var(--color-text-muted)]" role="status">
            <RefreshCw className="w-5 h-5 text-[var(--color-primary)] animate-spin" aria-hidden="true" />
            <span>{t('notesLoading')}</span>
          </div>
        ) : errorCode ? (
          <div className="p-6 rounded-2xl border border-red-500/30 bg-red-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-red-400 font-semibold text-sm">
                <AlertTriangle className="w-5 h-5 shrink-0" aria-hidden="true" />
                <span>{t('notesLoadErrorTitle')}</span>
              </div>
              <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                {t('notesLoadErrorDesc')}
              </p>
            </div>
            <button
              type="button"
              onClick={loadData}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-red-400/40 bg-red-500/10 text-xs font-medium text-[var(--color-text)] hover:bg-red-500/20 transition-colors cursor-pointer shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{t('retryAction')}</span>
            </button>
          </div>
        ) : noteId ? (
          activeNote ? (
            <div className="space-y-6">
              {isOwner && activeNote.publicationStatus !== 'published' && (
                <div
                  role="status"
                  className="na-mineral-card p-4 rounded-2xl border border-amber-500/40 bg-amber-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-amber-400 font-semibold font-mono">
                      <EyeOff className="w-4 h-4 shrink-0" aria-hidden="true" />
                      <span>{t('draftPreviewBannerTitle')}</span>
                    </div>
                    <p className="text-[var(--color-text-muted)]">{t('draftPreviewBannerDesc')}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('/admin')}
                    className="px-3.5 py-2 rounded-xl border border-amber-500/40 bg-[var(--color-surface-solid)] hover:border-[var(--color-primary)] text-xs font-mono font-semibold cursor-pointer shrink-0"
                  >
                    {t('draftPreviewBackAdmin')}
                  </button>
                </div>
              )}

              <article className="na-mineral-card p-6 sm:p-8 rounded-2xl space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                  <button
                    type="button"
                    onClick={() => navigate('/notes')}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors cursor-pointer"
                  >
                    {isRtl ? (
                      <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                    ) : (
                      <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
                    )}
                    <span>{t('notesBackToNotes')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyShareLink}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-solid)] hover:border-[var(--color-primary)] text-xs font-mono text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors cursor-pointer"
                  >
                    {linkCopied ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
                    ) : (
                      <Share2 className="w-3.5 h-3.5" aria-hidden="true" />
                    )}
                    <span>{linkCopied ? t('shareLinkCopied') : t('shareLinkBtn')}</span>
                  </button>
                </div>

                {/* Structured Note Metadata Header (Unboxed, Zero Pills) */}
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[var(--color-secondary)]">
                    {activeNoteMeta.categoryTitle && (
                      <span className="font-semibold text-[var(--color-primary)]">
                        {t('notesCategoryLabel')}: {activeNoteMeta.categoryTitle}
                      </span>
                    )}
                    {primaryDateLabel && (
                      <>
                        {activeNoteMeta.categoryTitle && <span aria-hidden="true">·</span>}
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>
                            {activePublishedDate ? t('notesPublishedDateLabel') : t('notesCreatedDateLabel')}: {primaryDateLabel}
                          </span>
                        </span>
                      </>
                    )}
                    {showSeparateCreatedDate && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="text-[var(--color-text-subtle)]">
                          {t('notesCreatedDateLabel')}: {activeCreatedDate}
                        </span>
                      </>
                    )}
                    {showSeparateUpdatedDate && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="text-[var(--color-text-subtle)]">
                          {t('notesUpdatedDateLabel')}: {activeUpdatedDate}
                        </span>
                      </>
                    )}
                    {activeStats.readingMinutes > 0 && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="inline-flex items-center gap-1 text-[var(--color-text-muted)] tabular-nums">
                          <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>
                            {activeStats.readingMinutes} {t('readingTimeSuffix')} · {activeStats.wordCount} {t('wordsCountLabel')}
                          </span>
                        </span>
                      </>
                    )}
                  </div>

                  {activeNoteMeta.tags.length > 0 && (
                    <div className="text-[11px] text-[var(--color-text-subtle)]">
                      <span>{t('notesTagsLabel')}: </span>
                      <span>{activeNoteMeta.tags.join(' · ')}</span>
                    </div>
                  )}
                </div>

                <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text)] leading-tight text-balance">
                  {isRtl ? activeNote.titleAr : activeNote.titleEn}
                </h2>

                {(activeNote.summaryEn || activeNote.summaryAr) && (
                  <p className="text-base text-[var(--color-text-muted)] leading-relaxed max-w-3xl">
                    {isRtl ? activeNote.summaryAr || activeNote.summaryEn : activeNote.summaryEn || activeNote.summaryAr}
                  </p>
                )}

                <div className="pt-6 border-t border-[var(--color-border-subtle)] max-w-3xl">
                  <Suspense
                    fallback={
                      <div className="text-sm sm:text-base text-[var(--color-text)] leading-relaxed whitespace-pre-wrap font-sans">
                        {activeContent}
                      </div>
                    }
                  >
                    <LazyMarkdownRenderer
                      content={activeContent}
                      showToc={true}
                      tocTitle={t('tocHeading')}
                      copyLabel={t('copyCodeBtn')}
                      copiedLabel={t('copiedCodeBtn')}
                    />
                  </Suspense>
                </div>
              </article>

              {relatedNotes.length > 0 && (
                <section className="pt-4 space-y-3">
                  <h2 className="text-xs font-mono uppercase tracking-wider text-[var(--color-secondary)]">
                    {t('relatedNotesHeading')}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {relatedNotes.map((rel) => {
                      const relMeta = resolveNoteCategoryAndTags(
                        rel.topicLabels,
                        validCategoryKeys
                      );
                      const relCategoryTitle = getLocalizedCategoryTitle(relMeta.categoryKey);
                      const relDate = formatLocalizedDate(
                        rel.publishedAt || rel.createdAt,
                        language
                      );
                      return (
                        <button
                          key={rel.id}
                          type="button"
                          onClick={() => navigate(`/notes/${rel.slug || rel.id}`)}
                          className="na-mineral-card na-mineral-card-interactive p-5 rounded-xl text-start space-y-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                        >
                          <div className="text-[11px] font-mono text-[var(--color-secondary)]">
                            {[relCategoryTitle, relDate].filter(Boolean).join(' · ') || rel.slug}
                          </div>
                          <h3 className="text-base font-semibold text-[var(--color-text)]">
                            {isRtl ? rel.titleAr : rel.titleEn}
                          </h3>
                          {(rel.summaryEn || rel.summaryAr) && (
                            <p className="text-xs text-[var(--color-text-muted)] line-clamp-2 leading-relaxed">
                              {isRtl ? rel.summaryAr || rel.summaryEn : rel.summaryEn || rel.summaryAr}
                            </p>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </section>
              )}
            </div>
          ) : (
            <div className="p-8 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] space-y-4">
              <button
                type="button"
                onClick={() => navigate('/notes')}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors cursor-pointer mb-2"
              >
                {isRtl ? (
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                ) : (
                  <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
                )}
                <span>{t('notesBackToNotes')}</span>
              </button>
              <h2 className="text-xl font-bold text-[var(--color-text)]">
                {t('notesNotFoundTitle')}
              </h2>
              <p className="text-sm text-[var(--color-text-muted)]">
                {t('notesEmptyDesc')}
              </p>
            </div>
          )
        ) : filteredNotes.length > 0 ? (
          <div className="space-y-4">
            {filteredNotes.map((note) => {
              const { categoryKey, tags } = resolveNoteCategoryAndTags(
                note.topicLabels,
                validCategoryKeys
              );
              const categoryTitle = getLocalizedCategoryTitle(categoryKey);
              const notePublished = formatLocalizedDate(note.publishedAt, language);
              const noteCreated = formatLocalizedDate(note.createdAt, language);
              const noteUpdated = formatLocalizedDate(note.updatedAt, language);
              const displayDate = notePublished || noteCreated;
              const showUpdated = Boolean(noteUpdated) && noteUpdated !== displayDate;
              const noteBody = isRtl ? note.contentAr || note.contentEn : note.contentEn || note.contentAr;
              const stats = computeReadingStats(noteBody);

              return (
                <button
                  key={note.id}
                  type="button"
                  onClick={() => navigate(`/notes/${note.slug || note.id}`)}
                  className="na-mineral-card na-mineral-card-interactive w-full group p-5 rounded-xl cursor-pointer space-y-2.5 text-start focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--color-text-subtle)] font-mono">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      {categoryTitle && (
                        <span className="text-[var(--color-secondary)] font-semibold">
                          {categoryTitle}
                        </span>
                      )}
                      {displayDate && (
                        <>
                          {categoryTitle && <span aria-hidden="true">·</span>}
                          <span>
                            {notePublished ? t('notesPublishedDateLabel') : t('notesCreatedDateLabel')}: {displayDate}
                          </span>
                        </>
                      )}
                      {showUpdated && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>
                            {t('notesUpdatedDateLabel')}: {noteUpdated}
                          </span>
                        </>
                      )}
                      {stats.readingMinutes > 0 && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="tabular-nums">
                            {stats.readingMinutes} {t('readingTimeSuffix')}
                          </span>
                        </>
                      )}
                    </div>
                    <span className="flex items-center gap-1 text-[var(--color-primary)] group-hover:underline">
                      <span>{t('readNote')}</span>
                      <ChevronRight className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} aria-hidden="true" />
                    </span>
                  </div>

                  <h2 className="text-lg font-semibold text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors">
                    {isRtl ? note.titleAr : note.titleEn}
                  </h2>

                  {(note.summaryEn || note.summaryAr) && (
                    <p className="text-xs sm:text-sm text-[var(--color-text-muted)] line-clamp-2 leading-relaxed">
                      {isRtl ? note.summaryAr || note.summaryEn : note.summaryEn || note.summaryAr}
                    </p>
                  )}

                  {tags.length > 0 && (
                    <p className="text-[11px] font-mono text-[var(--color-text-subtle)] pt-0.5">
                      {t('notesTagsLabel')}: {tags.join(' · ')}
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="pt-4">
            {isCategoryOnlyEmpty ? (
              <EmptyState
                icon={Layers}
                title={t('notesCategoryEmptyTitle')}
                description={t('notesCategoryEmptyDesc')}
                actionText={t('notesAllCategoriesBtn')}
                onAction={() => setCategoryFilter('all')}
              />
            ) : hasActiveFilters && notes.length > 0 ? (
              <EmptyState
                icon={Search}
                title={t('filterResultsEmptyTitle')}
                description={t('filterResultsEmptyDesc')}
                actionText={t('clearFiltersBtn')}
                onAction={resetFilters}
              />
            ) : (
              <EmptyState
                icon={FileText}
                title={t('notesEmptyTitle')}
                description={t('notesEmptyDesc')}
                actionText={t('btnBackHome')}
                onAction={() => navigate('/')}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};
