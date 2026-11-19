import type { ErrorInfo } from 'react';
import { Language } from '../types';

export interface ErrorReportContext {
  boundary: 'route' | 'fullscreen' | string;
  route?: string;
  language: Language;
  timestamp: string;
  userAgent?: string;
}

export interface ErrorReport {
  name: string;
  message: string;
  stack?: string;
  componentStack?: string;
  context: ErrorReportContext;
}

export type ErrorReporterHook = (
  report: ErrorReport,
  rawError: Error,
  info?: ErrorInfo
) => void;

const registeredReporters = new Set<ErrorReporterHook>();

/**
 * Determines whether an active ErrorBoundary should automatically reset
 * when a route/context key (such as currentPath) transitions.
 */
export function shouldResetErrorBoundary(prevResetKey?: string, nextResetKey?: string): boolean {
  if (prevResetKey === undefined || nextResetKey === undefined) {
    return false;
  }
  return prevResetKey !== nextResetKey;
}

/**
 * Resolves display language safely for error boundaries rendered either
 * inside AppProvider (via explicit prop) or at the outer document root.
 */
export function resolveErrorBoundaryLang(preferredLanguage?: Language): Language {
  if (preferredLanguage === 'ar' || preferredLanguage === 'en') {
    return preferredLanguage;
  }
  try {
    if (typeof document !== 'undefined' && document.documentElement.lang === 'ar') {
      return 'ar';
    }
  } catch {
    // Ignore non-browser environments
  }
  return 'en';
}

/**
 * Builds a structured, debugging-friendly error payload from a caught runtime error.
 */
export function buildErrorReport(
  error: unknown,
  componentStack: string | undefined,
  context: Partial<ErrorReportContext> = {}
): ErrorReport {
  const errObj = error instanceof Error ? error : new Error(String(error));

  let resolvedRoute = context.route;
  if (!resolvedRoute && typeof window !== 'undefined' && window.location) {
    resolvedRoute = window.location.pathname;
  }

  let resolvedUserAgent = context.userAgent;
  if (!resolvedUserAgent && typeof navigator !== 'undefined') {
    resolvedUserAgent = navigator.userAgent;
  }

  const trimmedComponentStack = componentStack?.trim();

  return {
    name: errObj.name || 'Error',
    message: errObj.message || 'Unknown application error',
    ...(errObj.stack ? { stack: errObj.stack } : {}),
    ...(trimmedComponentStack ? { componentStack: trimmedComponentStack } : {}),
    context: {
      boundary: context.boundary || 'fullscreen',
      ...(resolvedRoute ? { route: resolvedRoute } : {}),
      language: resolveErrorBoundaryLang(context.language),
      timestamp: context.timestamp || new Date().toISOString(),
      ...(resolvedUserAgent ? { userAgent: resolvedUserAgent } : {}),
    },
  };
}

/**
 * Registers an external error reporting hook (returns an unsubscribe cleanup function).
 */
export function registerErrorReporter(reporter: ErrorReporterHook): () => void {
  registeredReporters.add(reporter);
  return () => {
    registeredReporters.delete(reporter);
  };
}

/**
 * Logs structured error details to console and notifies any registered reporting hooks.
 * Never throws if a downstream logger or hook fails.
 */
export function reportBoundaryError(
  error: Error,
  info?: ErrorInfo,
  options: {
    boundary?: string;
    route?: string;
    language?: Language;
    onError?: ErrorReporterHook;
    logger?: (...args: unknown[]) => void;
  } = {}
): ErrorReport {
  const report = buildErrorReport(error, info?.componentStack ?? undefined, {
    boundary: options.boundary,
    route: options.route,
    language: options.language,
  });

  const logFn = options.logger ?? console.error;
  try {
    logFn('[NeuralAtlas:ErrorBoundary]', {
      boundary: report.context.boundary,
      route: report.context.route,
      language: report.context.language,
      timestamp: report.context.timestamp,
      name: report.name,
      message: report.message,
      componentStack: report.componentStack,
    }, error);
  } catch {
    // Prevent logging failures from cascading
  }

  if (options.onError) {
    try {
      options.onError(report, error, info);
    } catch {
      // Prevent custom hook errors from breaking fallback render
    }
  }

  for (const reporter of registeredReporters) {
    try {
      reporter(report, error, info);
    } catch {
      // Isolate individual reporter failures
    }
  }

  return report;
}
