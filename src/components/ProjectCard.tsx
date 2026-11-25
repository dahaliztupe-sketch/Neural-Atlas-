import React from 'react';
import { ProjectItem } from '../types';
import { useApp } from '../context/AppContext';
import { isValidUrl } from '../services/contentRepository';
import { localizeProjectTech } from '../lib/validation';
import { OptimizedImage } from './OptimizedImage';
import { ArrowRight, ArrowLeft, Terminal, ExternalLink } from 'lucide-react';

interface ProjectCardProps {
  project: ProjectItem;
  onSelect?: (project: ProjectItem) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onSelect }) => {
  const { isRtl, t, navigate } = useApp();

  const handleCardClick = () => {
    if (onSelect) {
      onSelect(project);
    } else {
      navigate(`/projects/${project.id}`);
    }
  };

  const hasCoverImage = Boolean(project.coverImageUrl && isValidUrl(project.coverImageUrl));
  const coverAlt = isRtl
    ? project.coverImageAltAr || project.coverImageAltEn || ''
    : project.coverImageAltEn || project.coverImageAltAr || '';

  return (
    <article className="group relative na-mineral-card na-mineral-card-interactive p-6 rounded-2xl flex flex-col justify-between">
      <div>
        {hasCoverImage && (
          <div className="mb-4">
            <OptimizedImage
              src={project.coverImageUrl}
              alt={coverAlt}
              fallbackTitle={isRtl ? project.titleAr : project.titleEn}
              aspectRatio="16/9"
            />
          </div>
        )}

        <div className="flex items-center justify-between gap-2 text-xs text-[var(--color-text-subtle)] mb-3">
          <span className="font-medium text-[var(--color-secondary)]">
            {isRtl ? project.statusAr : project.statusEn}
          </span>
          <span className="text-[11px] font-mono shrink-0">
            {project.statusType === 'practicing'
              ? t('badgeFoundation')
              : project.statusType === 'completed'
              ? t('badgeCompleted')
              : project.statusType === 'experimental'
              ? t('badgeExperimental')
              : project.statusType === 'paused'
              ? t('badgePaused')
              : project.statusType === 'discontinued'
              ? t('badgeDiscontinued')
              : project.statusType === 'archived'
              ? t('badgeArchived')
              : project.statusType === 'needs_confirmation'
              ? t('badgeNeedsConfirmation')
              : t('badgePrototype')}
          </span>
        </div>

        <h3 className="text-lg font-semibold text-[var(--color-text)] mb-2 group-hover:text-[var(--color-primary)] transition-colors">
          {isRtl ? project.titleAr : project.titleEn}
        </h3>

        <p className="text-sm text-[var(--color-text-muted)] leading-relaxed mb-5">
          {isRtl ? project.descriptionAr : project.descriptionEn}
        </p>

        {project.technologies.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--color-text-subtle)] mb-6">
            <Terminal className="w-3.5 h-3.5 text-[var(--color-primary)] shrink-0" aria-hidden="true" />
            {project.technologies.map((tech, idx) => (
              <React.Fragment key={tech}>
                {idx > 0 && <span aria-hidden="true">·</span>}
                <span className="font-mono text-[var(--color-text-muted)]">
                  {localizeProjectTech(tech, isRtl)}
                </span>
              </React.Fragment>
            ))}
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-[var(--color-border-subtle)] flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={handleCardClick}
          className="inline-flex items-center gap-1.5 min-h-[44px] py-2 text-xs font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] rounded-sm"
        >
          <span>{t('btnViewDetails')}</span>
          {isRtl ? (
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
          ) : (
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          )}
        </button>

        {(() => {
          const externalHref =
            project.url && isValidUrl(project.url)
              ? project.url
              : project.repoUrl && isValidUrl(project.repoUrl)
              ? project.repoUrl
              : null;
          return externalHref ? (
            <a
              href={externalHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] gap-1 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] rounded-lg p-2"
              aria-label={externalHref}
            >
              <ExternalLink className="w-4 h-4" aria-hidden="true" />
            </a>
          ) : (
            <span className="text-[11px] text-[var(--color-text-subtle)] font-mono truncate">
              {t('noExternalUrl')}
            </span>
          );
        })()}
      </div>
    </article>
  );
};
