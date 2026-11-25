import React from 'react';
import { useApp } from '../context/AppContext';
import { SOCIAL_LINKS } from '../data/portfolioData';
import { isValidUrl } from '../services/contentRepository';
import { Github, Linkedin } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { BrandLogo } from './BrandLogo';

export const Footer: React.FC = () => {
  const { t, isRtl, navigate, publicProfile } = useApp();

  const socialChannels = SOCIAL_LINKS.map((link) => {
    const dynamicUrl =
      link.platform === 'GitHub'
        ? publicProfile.githubUrl
        : link.platform === 'LinkedIn'
        ? publicProfile.linkedinUrl
        : link.url;
    return {
      ...link,
      url: isValidUrl(dynamicUrl) ? dynamicUrl : link.url,
    };
  });

  return (
    <footer className="w-full border-t border-[var(--color-border)] bg-[var(--glass-bg)] py-12 px-4 sm:px-6 transition-colors duration-200">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Brand & Affiliation */}
        <div className="flex flex-col items-center md:items-start gap-2 text-center md:text-start">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 text-sm font-semibold text-[var(--color-text)]">
            <BrandLogo size="sm" showWordmark={false} />
            <span>{t('siteName')}</span>
            <span className="text-[var(--color-text-subtle)]" aria-hidden="true">·</span>
            <span className="text-xs font-normal text-[var(--color-text-muted)]">{t('footerAffiliation')}</span>
          </div>
          <p className="text-xs text-[var(--color-text-subtle)]">
            {t('footerRights')}
          </p>
        </div>

        {/* Quick Internal Nav */}
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-[var(--color-text-muted)]">
          <a
            href="/academic"
            onClick={(e) => {
              e.preventDefault();
              navigate('/academic');
            }}
            className="inline-flex items-center min-h-[44px] px-1 hover:text-[var(--color-text)] transition-colors"
          >
            {t('navAcademic')}
          </a>
          <span aria-hidden="true">·</span>
          <a
            href="/projects"
            onClick={(e) => {
              e.preventDefault();
              navigate('/projects');
            }}
            className="inline-flex items-center min-h-[44px] px-1 hover:text-[var(--color-text)] transition-colors"
          >
            {t('navProjects')}
          </a>
          <span aria-hidden="true">·</span>
          <a
            href="/notes"
            onClick={(e) => {
              e.preventDefault();
              navigate('/notes');
            }}
            className="inline-flex items-center min-h-[44px] px-1 hover:text-[var(--color-text)] transition-colors"
          >
            {t('navNotes')}
          </a>
          <span aria-hidden="true">·</span>
          <a
            href="/connect"
            onClick={(e) => {
              e.preventDefault();
              navigate('/connect');
            }}
            className="inline-flex items-center min-h-[44px] px-1 hover:text-[var(--color-text)] transition-colors"
          >
            {t('navConnect')}
          </a>
          <span aria-hidden="true">·</span>
          <a
            href="/admin"
            onClick={(e) => {
              e.preventDefault();
              navigate('/admin');
            }}
            className="inline-flex items-center min-h-[44px] px-1 hover:text-[var(--color-text)] transition-colors opacity-60 hover:opacity-100"
            title={t('navAdmin')}
          >
            {t('navAdmin')}
          </a>
        </div>

        {/* Verified Social Channels & App Install */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <PWAInstallButton />
          {socialChannels.map((link) => (
            <a
              key={link.platform}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] p-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:border-[var(--color-primary)] transition-all"
              aria-label={isRtl ? link.labelAr : link.labelEn}
              title={isRtl ? link.labelAr : link.labelEn}
            >
              {link.platform === 'GitHub' ? (
                <Github className="w-4 h-4" aria-hidden="true" />
              ) : (
                <Linkedin className="w-4 h-4" aria-hidden="true" />
              )}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
};
