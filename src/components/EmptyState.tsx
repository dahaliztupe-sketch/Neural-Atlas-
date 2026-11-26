import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  note?: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  note,
  actionText,
  onAction,
}) => {
  return (
    <div className="na-mineral-card w-full max-w-xl mx-auto p-8 rounded-2xl text-center">
      <div className="w-12 h-12 mx-auto mb-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] flex items-center justify-center text-[var(--color-secondary)]">
        <Icon className="w-6 h-6" aria-hidden="true" />
      </div>

      <h3 className="text-lg font-semibold text-[var(--color-text)] mb-2">
        {title}
      </h3>

      <p className="text-sm text-[var(--color-text-muted)] leading-relaxed mb-4">
        {description}
      </p>

      {note && (
        <div className="p-3 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-surface-raised)] text-xs text-[var(--color-text-subtle)] font-mono text-start">
          {note}
        </div>
      )}

      {actionText && onAction && (
        <div className="mt-6">
          <button
            type="button"
            onClick={onAction}
            className="px-4 py-2 min-h-[40px] text-xs font-semibold rounded-lg bg-[var(--color-primary-solid)] text-white hover:bg-[var(--color-primary-hover)] transition-colors cursor-pointer"
          >
            {actionText}
          </button>
        </div>
      )}
    </div>
  );
};
