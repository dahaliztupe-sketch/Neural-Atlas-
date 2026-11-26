import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, ArrowLeft, ArrowRight, Home, RotateCcw } from 'lucide-react';
import { TRANSLATIONS } from '../data/translations';
import { Language } from '../types';
import { BrandLogo } from './BrandLogo';
import {
  ErrorReporterHook,
  reportBoundaryError,
  resolveErrorBoundaryLang,
  shouldResetErrorBoundary,
} from '../lib/errorBoundary';

export interface AppErrorBoundaryProps {
  children: ReactNode;
  resetKey?: string;
  language?: Language;
  variant?: 'route' | 'fullscreen';
  onNavigateHome?: () => void;
  onError?: ErrorReporterHook;
}

interface AppErrorBoundaryState {
  hasError: boolean;
}

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  constructor(props: AppErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    reportBoundaryError(error, info, {
      boundary: this.props.variant || 'fullscreen',
      route: this.props.resetKey,
      language: resolveErrorBoundaryLang(this.props.language),
      onError: this.props.onError,
    });
  }

  componentDidUpdate(prevProps: AppErrorBoundaryProps) {
    if (this.state.hasError && shouldResetErrorBoundary(prevProps.resetKey, this.props.resetKey)) {
      this.setState({ hasError: false });
    }
  }

  handleReturnHome = () => {
    this.setState({ hasError: false }, () => {
      if (this.props.onNavigateHome) {
        this.props.onNavigateHome();
      } else {
        window.location.assign('/');
      }
    });
  };

  handleRecoverView = () => {
    if (this.props.variant === 'route') {
      this.setState({ hasError: false });
    } else {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      const lang = resolveErrorBoundaryLang(this.props.language);
      const isRtl = lang === 'ar';
      const dict = TRANSLATIONS[lang];
      const isRouteVariant = this.props.variant === 'route';
      const DirectionalArrow = isRtl ? ArrowLeft : ArrowRight;

      const wrapperClass = isRouteVariant
        ? 'max-w-3xl mx-auto px-4 sm:px-6 py-14 md:py-24 flex items-center justify-center'
        : 'relative min-h-screen flex items-center justify-center px-4 sm:px-6 py-16 bg-[var(--color-bg,#050811)] text-[var(--color-text,#f8fafc)] overflow-hidden';

      return (
        <div className={wrapperClass} dir={isRtl ? 'rtl' : 'ltr'}>
          {!isRouteVariant && (
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'radial-gradient(ellipse 68% 58% at 50% 34%, rgba(139, 92, 246, 0.12) 0%, rgba(34, 211, 238, 0.05) 45%, transparent 75%)',
              }}
              aria-hidden="true"
            />
          )}

          <section
            role="alert"
            aria-live="assertive"
            aria-labelledby="app-error-boundary-title"
            aria-describedby="app-error-boundary-desc"
            className="relative z-10 w-full max-w-xl rounded-2xl border border-[var(--color-border,rgba(148,163,184,0.18))] bg-[var(--color-surface-solid,#0b1120)] overflow-hidden shadow-lg text-start"
          >
            {/* Subtle Dual-Accent Top Hairline matching Neural Atlas palette */}
            <div
              className="h-0.5 w-full bg-gradient-to-r from-[var(--color-primary,#8b5cf6)]/75 via-[var(--color-secondary,#22d3ee)]/60 to-transparent"
              aria-hidden="true"
            />

            {/* Ledger-Style Editorial Card Header */}
            <div className="px-6 sm:px-9 py-4 border-b border-[var(--color-border-subtle,rgba(148,163,184,0.1))] flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2.5 text-sm font-bold tracking-tight text-[var(--color-text,#f8fafc)]">
                <BrandLogo size="sm" showWordmark={false} />
                <span>{dict.siteName}</span>
              </div>
              <span className="text-xs text-[var(--color-text-subtle,#8596ae)] font-medium">
                {dict.siteTagline}
              </span>
            </div>

            {/* Editorial Content Area with Quiet Orbital Constellation Accent */}
            <div className="relative px-6 sm:px-9 py-8 sm:py-9 space-y-6">
              <svg
                className={`pointer-events-none absolute top-5 ${
                  isRtl ? 'left-5' : 'right-5'
                } w-32 h-32 text-[var(--color-border,rgba(34,51,84,0.75))] opacity-40`}
                viewBox="0 0 128 128"
                fill="none"
                aria-hidden="true"
              >
                <circle cx="64" cy="64" r="50" stroke="currentColor" strokeWidth="1" strokeDasharray="3 5" />
                <circle cx="64" cy="64" r="30" stroke="currentColor" strokeWidth="1" />
                <polygon
                  points="64,22 106,64 64,106 22,64"
                  stroke="currentColor"
                  strokeWidth="0.9"
                />
                <circle cx="99" cy="29" r="2.75" fill="var(--color-secondary,#06b6d4)" />
                <circle cx="30" cy="96" r="2.25" fill="var(--color-primary,#8b5cf6)" />
              </svg>

              {/* Single Clean Editorial Reading Axis */}
              <div className="relative space-y-4">
                <div className="inline-flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl border border-[var(--color-border,rgba(34,51,84,0.75))] bg-[var(--color-primary-muted,rgba(139,92,246,0.14))] flex items-center justify-center text-[var(--color-primary,#8b5cf6)] shrink-0">
                    <AlertTriangle className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <span
                    className={`text-xs text-[var(--color-secondary,#06b6d4)] ${
                      isRtl ? 'font-semibold' : 'font-mono uppercase tracking-[0.14em]'
                    }`}
                  >
                    {dict.errorBoundaryEyebrow}
                  </span>
                </div>

                <h1
                  id="app-error-boundary-title"
                  className="text-2xl sm:text-[1.75rem] font-bold tracking-tight text-[var(--color-text,#f8fafc)] leading-[1.24] text-balance"
                >
                  {dict.errorBoundaryTitle}
                </h1>

                <p
                  id="app-error-boundary-desc"
                  className="text-sm sm:text-[15px] text-[var(--color-text-muted,#9aa9be)] leading-[1.7] max-w-[48ch]"
                >
                  {dict.errorBoundaryDesc}
                </p>
              </div>

              {/* Action Bar aligned with editorial reading axis */}
              <div className="pt-6 border-t border-[var(--color-border-subtle,rgba(25,38,66,0.55))] flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={this.handleReturnHome}
                  aria-label={dict.btnBackHome}
                  className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[var(--color-primary-solid,#7c3aed)] text-white text-sm font-medium hover:bg-[var(--color-primary-hover,#a78bfa)] transition-colors inline-flex items-center gap-2 shadow-sm cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-surface-solid,#0c1222)] focus-visible:ring-[var(--color-primary,#8b5cf6)]"
                >
                  <Home className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>{dict.btnBackHome}</span>
                  <DirectionalArrow className="w-4 h-4 shrink-0 opacity-90" aria-hidden="true" />
                </button>

                <button
                  type="button"
                  onClick={this.handleRecoverView}
                  className="min-h-[44px] px-4 py-2.5 rounded-xl border border-[var(--color-border,rgba(34,51,84,0.75))] bg-[var(--color-surface,rgba(14,21,38,0.72))] text-[var(--color-text,#f8fafc)] text-sm font-medium hover:border-[var(--color-primary,#8b5cf6)] transition-colors inline-flex items-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary,#8b5cf6)]"
                >
                  <RotateCcw className="w-4 h-4 text-[var(--color-secondary,#06b6d4)] shrink-0" aria-hidden="true" />
                  <span>{isRouteVariant ? dict.retryAction : dict.errorBoundaryReload}</span>
                </button>
              </div>
            </div>
          </section>
        </div>
      );
    }

    return this.props.children;
  }
}
