import React from 'react';
import { LogOut, UserCheck } from 'lucide-react';
import { User } from 'firebase/auth';
import { useApp } from '../../context/AppContext';

interface AdminAccountTabProps {
  user: User;
  configuredOwnerEmail: string;
  onSignOut: () => void;
}

export const AdminAccountTab: React.FC<AdminAccountTabProps> = ({
  user,
  configuredOwnerEmail,
  onSignOut,
}) => {
  const { t } = useApp();

  return (
    <div className="na-mineral-card max-w-2xl p-6 sm:p-8 rounded-2xl space-y-6">
      <div className="flex items-center gap-3">
        <UserCheck className="w-6 h-6 text-emerald-400" aria-hidden="true" />
        <div>
          <h2 className="text-base font-bold text-[var(--color-text)]">
            {t('adminAccountHeading')}
          </h2>
          <p className="text-xs text-[var(--color-text-muted)] font-mono">
            Google: {user.email} ({user.emailVerified ? 'Verified' : 'Unverified'})
          </p>
        </div>
      </div>

      <div className="p-4 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface-solid)] space-y-2 text-xs">
        <span className="block font-mono text-[var(--color-text-subtle)]">{t('adminAllowlistLabel')}</span>
        <code className="block p-2.5 rounded-lg bg-black/40 font-mono text-[11px] text-[var(--color-secondary)]">
          {configuredOwnerEmail}
        </code>
        <p className="text-[11px] text-[var(--color-text-subtle)] leading-relaxed">
          {t('adminAllowlistNote')}
        </p>
      </div>

      <div className="pt-4 border-t border-[var(--color-border-subtle)] flex items-center justify-between">
        <span className="text-xs text-[var(--color-text-subtle)] font-mono">{t('adminSessionActive')}</span>
        <button
          type="button"
          onClick={onSignOut}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-solid)] hover:border-[var(--color-primary)] text-xs font-mono cursor-pointer transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{t('adminSignOut')}</span>
        </button>
      </div>
    </div>
  );
};

export default AdminAccountTab;
