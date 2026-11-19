import React from 'react';
import { Eye, EyeOff, Edit3, Trash2, ExternalLink } from 'lucide-react';
import { PublicationStatus } from '../../types';

export type AdminTab =
  | 'overview'
  | 'projects'
  | 'courses'
  | 'notes'
  | 'milestones'
  | 'messages'
  | 'profile'
  | 'account'
  | 'diagnostics';

export const ADMIN_INPUT_CLASS =
  'w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-solid)] text-xs text-[var(--color-text)] placeholder:text-[var(--color-text-subtle)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-colors';

export const ADMIN_LABEL_CLASS = 'block font-mono text-[11px] text-[var(--color-text-subtle)]';

interface PublicationBadgeProps {
  status: PublicationStatus;
}

export const PublicationBadge: React.FC<PublicationBadgeProps> = ({ status }) => (
  <span
    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
      status === 'published'
        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
    }`}
  >
    {status === 'published' ? (
      <Eye className="w-3 h-3" aria-hidden="true" />
    ) : (
      <EyeOff className="w-3 h-3" aria-hidden="true" />
    )}
    <span>{status}</span>
  </span>
);

interface RecordActionsProps {
  publicationStatus: PublicationStatus;
  publishLabel: string;
  unpublishLabel: string;
  editLabel: string;
  deleteLabel: string;
  previewLabel?: string;
  onTogglePublish: () => void;
  onPreview?: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const RecordActions: React.FC<RecordActionsProps> = ({
  publicationStatus,
  publishLabel,
  unpublishLabel,
  editLabel,
  deleteLabel,
  previewLabel,
  onTogglePublish,
  onPreview,
  onEdit,
  onDelete,
}) => (
  <div className="flex items-center gap-2 shrink-0">
    {onPreview && (
      <button
        type="button"
        onClick={onPreview}
        className="p-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-solid)] hover:border-[var(--color-secondary)] hover:text-[var(--color-secondary)] text-xs cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]"
        title={previewLabel || 'Preview'}
        aria-label={previewLabel || 'Preview'}
      >
        <ExternalLink className="w-4 h-4" aria-hidden="true" />
      </button>
    )}
    <button
      type="button"
      onClick={onTogglePublish}
      className="p-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-solid)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] text-xs cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
      title={publicationStatus === 'published' ? unpublishLabel : publishLabel}
      aria-label={publicationStatus === 'published' ? unpublishLabel : publishLabel}
    >
      {publicationStatus === 'published' ? (
        <EyeOff className="w-4 h-4" aria-hidden="true" />
      ) : (
        <Eye className="w-4 h-4" aria-hidden="true" />
      )}
    </button>
    <button
      type="button"
      onClick={onEdit}
      className="p-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-solid)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] text-xs cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
      title={editLabel}
      aria-label={editLabel}
    >
      <Edit3 className="w-4 h-4" aria-hidden="true" />
    </button>
    <button
      type="button"
      onClick={onDelete}
      className="p-2 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
      title={deleteLabel}
      aria-label={deleteLabel}
    >
      <Trash2 className="w-4 h-4" aria-hidden="true" />
    </button>
  </div>
);

