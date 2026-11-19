import React, { useEffect, useRef, useState } from 'react';
import { Maximize2, X, Layers } from 'lucide-react';
import { isValidUrl } from '../services/contentRepository';
import { useApp } from '../context/AppContext';

export type ImageAspectRatio = '16/9' | '4/3' | '1/1' | '21/9';

const ASPECT_CLASSES: Record<ImageAspectRatio, string> = {
  '16/9': 'aspect-[16/9]',
  '4/3': 'aspect-[4/3]',
  '1/1': 'aspect-square',
  '21/9': 'aspect-[21/9]',
};

interface OptimizedImageProps {
  src?: string;
  alt: string;
  fallbackTitle?: string;
  aspectRatio?: ImageAspectRatio;
  enableLightbox?: boolean;
  priority?: boolean;
  className?: string;
  imgClassName?: string;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  fallbackTitle,
  aspectRatio = '16/9',
  enableLightbox = false,
  priority = false,
  className = '',
  imgClassName = '',
}) => {
  const { t } = useApp();
  const validSrc = Boolean(src && isValidUrl(src));
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>(
    validSrc ? 'loading' : 'error'
  );
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const triggerBtnRef = useRef<HTMLButtonElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const wasOpenRef = useRef(false);

  useEffect(() => {
    setStatus(validSrc ? 'loading' : 'error');
    setLightboxOpen(false);
  }, [src, validSrc]);

  useEffect(() => {
    if (!lightboxOpen) {
      if (wasOpenRef.current) {
        wasOpenRef.current = false;
        triggerBtnRef.current?.focus();
      }
      return;
    }

    wasOpenRef.current = true;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const rafId = window.requestAnimationFrame(() => {
      closeBtnRef.current?.focus();
    });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setLightboxOpen(false);
      } else if (event.key === 'Tab') {
        // Lightbox only contains one interactive control (Close button); trap Tab cleanly
        event.preventDefault();
        closeBtnRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.cancelAnimationFrame(rafId);
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [lightboxOpen]);

  const aspectClass = ASPECT_CLASSES[aspectRatio] || 'aspect-[16/9]';
  const canZoom = enableLightbox && status === 'loaded' && validSrc;

  return (
    <>
      <div
        className={`relative overflow-hidden rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface-solid)] ${aspectClass} ${className}`}
      >
        {/* Mineral Glass Shimmer Skeleton while image downloads */}
        {status === 'loading' && (
          <div
            aria-hidden="true"
            className="na-shimmer absolute inset-0 bg-[var(--color-surface-hover)]"
          />
        )}

        {/* Geometric Obsidian Fallback on missing/broken URL or offline fail */}
        {status === 'error' ? (
          <div
            role="img"
            aria-label={alt || fallbackTitle || t('imageUnavailableCaption')}
            className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-[var(--color-surface-solid)] via-[var(--color-surface-hover)] to-[var(--color-primary-muted)]"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 120 80"
              className="w-20 h-14 text-[var(--color-primary)] opacity-45 mb-2"
              fill="none"
            >
              <circle cx="60" cy="40" r="28" stroke="currentColor" strokeWidth="1.2" strokeDasharray="3 3" />
              <circle cx="60" cy="40" r="16" stroke="var(--color-secondary)" strokeWidth="1.2" opacity="0.7" />
              <polygon points="60,26 71,40 60,54 49,40" stroke="currentColor" strokeWidth="1.4" />
            </svg>
            <div className="flex items-center gap-1.5 text-xs font-medium text-[var(--color-text-muted)] max-w-xs truncate">
              <Layers className="w-3.5 h-3.5 text-[var(--color-secondary)] shrink-0" aria-hidden="true" />
              <span className="truncate">{fallbackTitle || alt || t('imageUnavailableCaption')}</span>
            </div>
          </div>
        ) : (
          <img
            src={src}
            alt={alt}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            referrerPolicy="no-referrer"
            onLoad={() => setStatus('loaded')}
            onError={() => setStatus('error')}
            className={`w-full h-full object-cover transition-opacity duration-200 ${
              status === 'loaded' ? 'opacity-100' : 'opacity-0'
            } ${imgClassName}`}
          />
        )}

        {canZoom && (
          <button
            ref={triggerBtnRef}
            type="button"
            onClick={() => setLightboxOpen(true)}
            className="absolute bottom-3 end-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--glass-bg)] text-xs font-mono text-[var(--color-text)] hover:border-[var(--color-primary)] transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            aria-label={t('imageZoomHint')}
          >
            <Maximize2 className="w-3.5 h-3.5 text-[var(--color-secondary)]" aria-hidden="true" />
            <span>{t('imageZoomHint')}</span>
          </button>
        )}
      </div>

      {/* High-contrast detail Lightbox modal */}
      {lightboxOpen && validSrc && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={alt || fallbackTitle || t('imageZoomHint')}
          onClick={() => setLightboxOpen(false)}
          className="fixed inset-0 z-50 bg-black/85 p-4 sm:p-8 flex items-center justify-center"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center gap-3"
          >
            <button
              ref={closeBtnRef}
              type="button"
              onClick={() => setLightboxOpen(false)}
              aria-label={t('imageLightboxClose')}
              className="self-end inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/20 bg-slate-900/90 text-xs font-mono text-white hover:border-[var(--color-primary)] cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            >
              <X className="w-4 h-4" aria-hidden="true" />
              <span>{t('closeModal')}</span>
            </button>

            <div className="w-full overflow-hidden rounded-2xl border border-white/15 bg-slate-950 flex items-center justify-center">
              <img
                src={src}
                alt={alt}
                referrerPolicy="no-referrer"
                className="max-h-[78vh] w-auto max-w-full object-contain"
              />
            </div>

            {(alt || fallbackTitle) && (
              <p className="text-xs text-slate-300 text-center max-w-2xl">
                {alt || fallbackTitle}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
};
