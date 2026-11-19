import React, { useState } from 'react';
import { Download, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  compact?: boolean;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ compact = false }) => {
  const { t } = useApp();
  const { isStandalone, canPromptInstall, isIosSafari, promptInstall } = usePWAInstall();
  const [showIosTip, setShowIosTip] = useState(false);

  if (isStandalone) return null;
  if (!canPromptInstall && !isIosSafari) return null;

  const handleClick = async () => {
    if (canPromptInstall) {
      await promptInstall();
    } else if (isIosSafari) {
      setShowIosTip((prev) => !prev);
    }
  };

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        onClick={handleClick}
        className={`inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:border-[var(--color-primary)] transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] ${
          compact ? 'px-3 py-2 text-xs min-h-[44px]' : 'px-3 py-1.5 text-xs font-medium'
        }`}
        title={t('pwaInstallTitle')}
        aria-label={t('pwaInstallTitle')}
      >
        <Download className="w-3.5 h-3.5 text-[var(--color-secondary)] shrink-0" aria-hidden="true" />
        <span>{t('pwaInstallBtn')}</span>
      </button>

      {showIosTip && isIosSafari && (
        <div
          role="dialog"
          aria-label={t('pwaIosGuideTitle')}
          className="absolute bottom-full mb-2 end-0 w-64 p-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-solid)] shadow-xl text-xs space-y-1.5 z-50"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="font-semibold text-[var(--color-text)]">{t('pwaIosGuideTitle')}</span>
            <button
              type="button"
              onClick={() => setShowIosTip(false)}
              className="p-1 text-[var(--color-text-subtle)] hover:text-[var(--color-text)] cursor-pointer"
              aria-label={t('closeModal')}
            >
              <X className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
          <p className="text-[var(--color-text-muted)] leading-relaxed">{t('pwaIosGuideStep')}</p>
        </div>
      )}
    </div>
  );
};
