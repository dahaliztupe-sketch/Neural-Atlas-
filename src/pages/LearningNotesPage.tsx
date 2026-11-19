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
import { filterNotesByQuery } from '../lib/validation';
import { computeReadingStats } from '../lib/markdown';
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
  const [topicFilter, setTopicFilter] = useState('all');
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

  const uniqueTopics = useMemo(() => {
    const seen = new Map<string, string>();
    for (const n of notes) {
      for (const topic of n.topicLabels || []) {
        const clean = topic.trim();
        if (clean && !seen.has(clean.toLowerCase())) {
          seen.set(clean.toLowerCase(), clean);
        }
      }
    }
    return Array.from(seen.values());
  }, [notes]);

  const filteredNotes = useMemo(
    () => filterNotesByQuery(notes, searchQuery, topicFilter),
    [notes, searchQuery, topicFilter]
  );

  const hasActiveFilters = topicFilter !== 'all' || searchQuery.trim().length > 0;

  const formattedNoteDate = formatLocalizedDate(activeNote?.publishedAt, language);
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
        <p className="text-base text-[var(--color-text-muted)]">
          {t('notesSubtitle')}
        </p>
      </div>

      {/* Search & Topic Filter Bar (List View Only) */}
      {!noteId && !loading && !errorCode && notes.length > 0 && (
        <div className="space-y-3">
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

            <div className="text-xs text-[var(--color-text-subtle)] font-mono tabular-nums">
              <span>{filteredNotes.length}</span>
              <span className="mx-1">/</span>
              <span>{notes.length}</span>
              <span className="ms-1">{t('projectsCountEntries')}</span>
            </div>
          </div>

          {uniqueTopics.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <button
                type="button"
                onClick={() => setTopicFilter('all')}
                className={`px-2.5 py-1 rounded-lg border font-mono transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] ${
                  topicFilter === 'all'
                    ? 'border-[var(--color-secondary)] bg-[var(--color-secondary-muted)] text-[var(--color-secondary)] font-semibold'
                    : 'border-[var(--color-border-subtle)] bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                }`}
              >
                {t('filterAllTopics')}
              </button>
              {uniqueTopics.map((topic) => {
                const active = topicFilter.toLowerCase() === topic.toLowerCase();
                return (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => setTopicFilter(active ? 'all' : topic)}
                    className={`px-2.5 py-1 rounded-lg border font-mono transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] ${
                      active
                        ? 'border-[var(--color-secondary)] bg-[var(--color-secondary-muted)] text-[var(--color-secondary)] font-semibold'
                        : 'border-[var(--color-border-subtle)] bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                    }`}
                  >
                    {topic}
                  </button>
                );
              })}
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
                    {isRtl ? <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" /> : <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />}
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

              <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-[var(--color-secondary)]">
                <span>{activeNote.slug}</span>
                {formattedNoteDate && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>{formattedNoteDate}</span>
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
                {activeNote.topicLabels && activeNote.topicLabels.length > 0 && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="text-[var(--color-text-subtle)]">
                      {activeNote.topicLabels.join(' · ')}
                    </span>
                  </>
                )}
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text)]">
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
                    {relatedNotes.map((rel) => (
                      <button
                        key={rel.id}
                        type="button"
                        onClick={() => navigate(`/notes/${rel.slug || rel.id}`)}
                        className="na-mineral-card na-mineral-card-interactive p-5 rounded-xl text-start space-y-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                      >
                        <div className="text-[11px] font-mono text-[var(--color-secondary)]">
                          {rel.topicLabels?.slice(0, 2).join(' · ') || rel.slug}
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
                    ))}
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
                {isRtl ? <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" /> : <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />}
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
              const noteDate = formatLocalizedDate(note.publishedAt, language);
              const noteBody = isRtl ? note.contentAr || note.contentEn : note.contentEn || note.contentAr;
              const stats = computeReadingStats(noteBody);
              return (
                <button
                  key={note.id}
                  type="button"
                  onClick={() => navigate(`/notes/${note.slug || note.id}`)}
                  className="na-mineral-card na-mineral-card-interactive w-full group p-5 rounded-xl cursor-pointer space-y-2 text-start focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--color-text-subtle)] font-mono">
                    <div className="flex flex-wrap items-center gap-2">
                      <span>{note.slug}</span>
                      {noteDate && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>{noteDate}</span>
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
                    <p className="text-xs text-[var(--color-text-muted)] line-clamp-2 leading-relaxed">
                      {isRtl ? note.summaryAr || note.summaryEn : note.summaryEn || note.summaryAr}
                    </p>
                  )}
                  {note.topicLabels && note.topicLabels.length > 0 && (
                    <p className="text-[11px] font-mono text-[var(--color-text-subtle)] pt-1">
                      {note.topicLabels.join(' · ')}
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="pt-4">
            {hasActiveFilters && notes.length > 0 ? (
              <EmptyState
                icon={Search}
                title={t('filterResultsEmptyTitle')}
                description={t('filterResultsEmptyDesc')}
                actionText={t('clearFiltersBtn')}
                onAction={() => {
                  setSearchQuery('');
                  setTopicFilter('all');
                }}
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
