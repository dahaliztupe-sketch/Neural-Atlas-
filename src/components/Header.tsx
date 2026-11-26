import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Sun, Moon, Globe, Menu, X } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { BrandLogo } from './BrandLogo';

export const Header: React.FC = () => {
  const { language, theme, toggleLanguage, toggleTheme, currentPath, navigate, t, isRtl, publicProfile } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const wasOpenRef = useRef(false);

  // Close mobile drawer when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [currentPath]);

  // Manage desktop resize cleanup
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Accessible mobile drawer focus management (focus trap + Escape + restore focus)
  useEffect(() => {
    if (mobileMenuOpen) {
      wasOpenRef.current = true;
      const focusFirstLink = () => {
        const firstFocusable = drawerRef.current?.querySelector<HTMLElement>(
          'a[href], button:not([disabled])'
        );
        firstFocusable?.focus();
      };
      const rafId = window.requestAnimationFrame(focusFirstLink);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          setMobileMenuOpen(false);
          return;
        }
        if (e.key === 'Tab' && drawerRef.current) {
          const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
          );
          if (focusable.length === 0) return;
          const first = focusable[0];
          const last = focusable[focusable.length - 1];
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.cancelAnimationFrame(rafId);
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else if (wasOpenRef.current) {
      wasOpenRef.current = false;
      menuButtonRef.current?.focus();
    }
  }, [mobileMenuOpen]);

  const navItems = [
    { path: '/', label: t('navHome') },
    { path: '/about', label: t('navAbout') },
    { path: '/academic', label: t('navAcademic') },
    { path: '/projects', label: t('navProjects') },
    { path: '/notes', label: t('navNotes') },
    { path: '/milestones', label: t('navMilestones') },
    { path: '/connect', label: t('navConnect') },
  ];

  const isActive = (path: string) => {
    if (path === '/') return currentPath === '/';
    return currentPath.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[var(--color-border)] bg-[var(--glass-bg)] transition-colors duration-200">
      {/* Visible-on-focus Skip to Content link for keyboard accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:start-4 focus:z-50 focus:px-4 focus:py-2 focus:rounded-lg focus:bg-[var(--color-primary-solid)] focus:text-white focus:text-xs focus:font-semibold focus:shadow-lg focus:outline-none"
      >
        {t('skipToContent')}
      </a>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4 sm:gap-8">
        {/* Zone 1: Geometric Brand Emblem + Wordmark */}
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            navigate('/');
          }}
          className="inline-flex items-center min-h-[44px] text-base sm:text-lg font-bold tracking-tight text-[var(--color-text)] hover:text-[var(--color-primary)] transition-colors whitespace-nowrap shrink-0 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] rounded-lg px-1"
          aria-label="Neural Atlas"
        >
          <BrandLogo size="sm" showWordmark />
        </a>

        {/* Primary Navigation Links */}
        <nav
          className="hidden lg:flex items-center gap-4 xl:gap-5 text-sm font-medium text-[var(--color-text-muted)]"
          aria-label={t('mainNavAria')}
        >
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <a
                key={item.path}
                href={item.path}
                onClick={(e) => {
                  e.preventDefault();
                  navigate(item.path);
                }}
                className={`inline-flex items-center justify-center min-h-[44px] min-w-[44px] px-1 transition-colors whitespace-nowrap shrink-0 relative focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] rounded-sm ${
                  active
                    ? 'text-[var(--color-text)] font-semibold after:absolute after:bottom-1.5 after:left-0 after:right-0 after:h-0.5 after:bg-[var(--color-primary)]'
                    : 'hover:text-[var(--color-text)]'
                }`}
                aria-current={active ? 'page' : undefined}
              >
                {item.label}
              </a>
            );
          })}
        </nav>

        {/* Global Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-3 py-2 min-h-[44px] text-xs font-semibold rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-all cursor-pointer whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            aria-label={t('langToggle')}
            title={t('langToggle')}
          >
            <Globe className="w-3.5 h-3.5 text-[var(--color-secondary)]" aria-hidden="true" />
            <span className="font-sans font-medium">{language === 'en' ? 'العربية' : 'EN'}</span>
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] p-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            aria-label={theme === 'dark' ? t('themeToggleDark') : t('themeToggleLight')}
            title={theme === 'dark' ? t('themeToggleDark') : t('themeToggleLight')}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" aria-hidden="true" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-500" aria-hidden="true" />
            )}
          </button>

          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="lg:hidden inline-flex items-center justify-center min-h-[44px] min-w-[44px] p-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] hover:border-[var(--color-primary)] transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-nav-drawer"
            aria-label={t('toggleMenuAria')}
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" aria-hidden="true" />
            ) : (
              <Menu className="w-5 h-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div
          id="mobile-nav-drawer"
          ref={drawerRef}
          className="lg:hidden border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-4 space-y-3 shadow-lg"
          role="dialog"
          aria-modal="true"
          aria-label={t('mobileNavAria')}
        >
          <div className="flex items-center justify-between pb-2 border-b border-[var(--color-border-subtle)]">
            <span className="text-xs font-mono text-[var(--color-text-subtle)]">{t('mobileNavAria')}</span>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] p-2 rounded-lg border border-[var(--color-border-subtle)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] cursor-pointer"
              aria-label={t('closeModal')}
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>

          <div className="flex flex-col space-y-1">
            {navItems.map((item) => {
              const active = isActive(item.path);
              return (
                <a
                  key={item.path}
                  href={item.path}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(item.path);
                    setMobileMenuOpen(false);
                  }}
                  className={`inline-flex items-center min-h-[44px] px-3 py-2.5 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] ${
                    active
                      ? 'bg-[var(--color-primary-muted)] text-[var(--color-primary)] font-semibold'
                      : 'text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]'
                  }`}
                  aria-current={active ? 'page' : undefined}
                >
                  {item.label}
                </a>
              );
            })}
          </div>

          <div className="pt-3 border-t border-[var(--color-border-subtle)] flex flex-wrap items-center justify-between gap-3 text-xs text-[var(--color-text-subtle)]">
            <div className="flex flex-col gap-0.5">
              <span>Neural Atlas · {isRtl ? publicProfile.nameAr : publicProfile.nameEn}</span>
              <span className="font-mono text-[11px]">{language.toUpperCase()} · {theme.toUpperCase()}</span>
            </div>
            <PWAInstallButton compact />
          </div>
        </div>
      )}
    </header>
  );
};
