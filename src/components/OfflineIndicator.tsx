import React, { useEffect, useState } from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const { t } = useApp();
  const isOnline = useOnlineStatus();
  const [swUpdateWaiting, setSwUpdateWaiting] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
    let active = true;

    const inspectRegistration = async () => {
      try {
        const reg = await navigator.serviceWorker.getRegistration();
        if (!active || !reg) return;
        if (reg.waiting) {
          setSwUpdateWaiting(reg.waiting);
        }
        reg.addEventListener('updatefound', () => {
          const installing = reg.installing;
          if (!installing) return;
          installing.addEventListener('statechange', () => {
            if (active && installing.state === 'installed' && navigator.serviceWorker.controller) {
              setSwUpdateWaiting(reg.waiting || installing);
            }
          });
        });
      } catch {
        // Ignore service worker inspection errors in unsupported contexts
      }
    };

    inspectRegistration();
    return () => {
      active = false;
    };
  }, []);

  const handleApplyUpdate = () => {
    if (swUpdateWaiting) {
      swUpdateWaiting.postMessage({ type: 'SKIP_WAITING' });
    }
    window.location.reload();
  };

  if (isOnline && !swUpdateWaiting) return null;

  return (
    <>
      {!isOnline && (
        <div
          role="status"
          aria-live="polite"
          className="w-full bg-amber-500/15 border-b border-amber-500/35 px-4 py-2 text-xs text-[var(--color-text)] flex items-center justify-center gap-2"
        >
          <WifiOff className="w-3.5 h-3.5 text-amber-500 shrink-0" aria-hidden="true" />
          <span>{t('offlineBannerText')}</span>
        </div>
      )}
      {isOnline && swUpdateWaiting && (
        <div
          role="status"
          aria-live="polite"
          className="w-full bg-[var(--color-primary-muted)] border-b border-[var(--color-primary)]/30 px-4 py-2 text-xs text-[var(--color-text)] flex items-center justify-center gap-3"
        >
          <span>{t('pwaUpdateAvailable')}</span>
          <button
            type="button"
            onClick={handleApplyUpdate}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#7c3aed] text-white text-[11px] font-semibold cursor-pointer hover:bg-[#6d28d9] transition-colors"
          >
            <RefreshCw className="w-3 h-3" aria-hidden="true" />
            <span>{t('pwaUpdateReloadBtn')}</span>
          </button>
        </div>
      )}
    </>
  );
};

