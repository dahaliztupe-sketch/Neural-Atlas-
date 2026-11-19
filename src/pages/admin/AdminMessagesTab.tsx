import React, { useState, useMemo } from 'react';
import { Inbox, MailOpen, Archive, Trash2, Mail } from 'lucide-react';
import { ContactMessageRecord, ContactMessageStatus } from '../../types';
import { useApp } from '../../context/AppContext';
import { formatLocalizedDate } from '../../services/contentRepository';

interface AdminMessagesTabProps {
  messages: ContactMessageRecord[];
  onUpdateStatus: (id: string, status: ContactMessageStatus) => Promise<void>;
  onDelete: (msg: ContactMessageRecord) => void;
}

export const AdminMessagesTab: React.FC<AdminMessagesTabProps> = ({
  messages,
  onUpdateStatus,
  onDelete,
}) => {
  const { t, language } = useApp();
  const [filter, setFilter] = useState<'all' | ContactMessageStatus>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const filteredMessages = useMemo(() => {
    if (filter === 'all') return messages;
    return messages.filter((m) => m.status === filter);
  }, [messages, filter]);

  const activeMessage = useMemo(() => {
    if (filteredMessages.length === 0) return null;
    return filteredMessages.find((m) => m.id === selectedId) || filteredMessages[0];
  }, [filteredMessages, selectedId]);

  const handleStatusChange = async (msg: ContactMessageRecord, next: ContactMessageStatus) => {
    setBusyId(msg.id);
    try {
      await onUpdateStatus(msg.id, next);
    } finally {
      setBusyId(null);
    }
  };

  const statusBadgeClass = (status: ContactMessageStatus) => {
    if (status === 'unread') {
      return 'bg-[var(--color-secondary-muted)] text-[var(--color-secondary)] border border-[var(--color-secondary)]/30';
    }
    if (status === 'archived') {
      return 'bg-slate-500/20 text-slate-300 border border-slate-500/30';
    }
    return 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30';
  };

  return (
    <div className="space-y-6">
      {/* Status Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="na-mineral-card inline-flex flex-wrap items-center gap-1 p-1 rounded-xl text-xs font-mono">
          {(['all', 'unread', 'read', 'archived'] as const).map((key) => {
            const count =
              key === 'all' ? messages.length : messages.filter((m) => m.status === key).length;
            const label =
              key === 'all'
                ? t('adminMessagesFilterAll')
                : key === 'unread'
                ? t('adminMessagesFilterUnread')
                : key === 'read'
                ? t('adminMessagesFilterRead')
                : t('adminMessagesFilterArchived');
            return (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer tabular-nums focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] ${
                  filter === key
                    ? 'bg-[var(--color-primary)] text-white font-semibold'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                }`}
              >
                {label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {filteredMessages.length === 0 ? (
        <div className="na-mineral-card p-10 text-center rounded-xl text-xs text-[var(--color-text-muted)] font-mono space-y-2">
          <Inbox className="w-6 h-6 mx-auto text-[var(--color-text-subtle)]" aria-hidden="true" />
          <p>{t('adminEmptyMessages')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Inbox List */}
          <div className="lg:col-span-5 space-y-2.5 max-h-[540px] overflow-y-auto pe-1">
            {filteredMessages.map((msg) => {
              const isSelected = activeMessage?.id === msg.id;
              const dateLabel = formatLocalizedDate(msg.createdAt, language);
              return (
                <button
                  key={msg.id}
                  type="button"
                  onClick={() => setSelectedId(msg.id)}
                  className={`na-mineral-card w-full text-start p-4 rounded-xl transition-all cursor-pointer space-y-1.5 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] ${
                    isSelected
                      ? 'border-[var(--color-border-strong)] bg-[var(--color-surface-hover)]'
                      : 'hover:border-[var(--color-border-strong)]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 text-[11px] font-mono">
                    <span className={`px-2 py-0.5 rounded uppercase ${statusBadgeClass(msg.status)}`}>
                      {msg.status}
                    </span>
                    <span className="text-[var(--color-text-subtle)] tabular-nums">
                      {dateLabel || msg.createdAt.slice(0, 10)}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-[var(--color-text)] truncate">
                    {msg.subject}
                  </h3>
                  <p className="text-xs text-[var(--color-text-muted)] truncate">
                    {msg.senderName}
                    {msg.senderContact ? ` · ${msg.senderContact}` : ''}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Detail Reader */}
          {activeMessage && (
            <div className="na-mineral-card lg:col-span-7 p-6 rounded-2xl space-y-5">
              <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-[var(--color-border-subtle)]">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                    <span className={`px-2 py-0.5 rounded uppercase ${statusBadgeClass(activeMessage.status)}`}>
                      {activeMessage.status}
                    </span>
                    <span className="text-[var(--color-text-subtle)] uppercase">
                      {activeMessage.language}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="text-[var(--color-text-subtle)]">
                      {t('adminMessageReceivedLabel')}:{' '}
                      {formatLocalizedDate(activeMessage.createdAt, language) || activeMessage.createdAt}
                    </span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-[var(--color-text)]">
                    {activeMessage.subject}
                  </h2>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {activeMessage.status !== 'read' ? (
                    <button
                      type="button"
                      disabled={busyId === activeMessage.id}
                      onClick={() => handleStatusChange(activeMessage, 'read')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-medium hover:bg-emerald-500/20 cursor-pointer disabled:opacity-50"
                    >
                      <MailOpen className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>{t('adminMessageMarkRead')}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={busyId === activeMessage.id}
                      onClick={() => handleStatusChange(activeMessage, 'unread')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-solid)] text-[var(--color-text-muted)] text-xs font-medium hover:text-[var(--color-text)] cursor-pointer disabled:opacity-50"
                    >
                      <Mail className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>{t('adminMessageMarkUnread')}</span>
                    </button>
                  )}

                  {activeMessage.status !== 'archived' && (
                    <button
                      type="button"
                      disabled={busyId === activeMessage.id}
                      onClick={() => handleStatusChange(activeMessage, 'archived')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-solid)] text-[var(--color-text-muted)] text-xs font-medium hover:text-[var(--color-text)] cursor-pointer disabled:opacity-50"
                    >
                      <Archive className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>{t('adminMessageArchive')}</span>
                    </button>
                  )}

                  <button
                    type="button"
                    disabled={busyId === activeMessage.id}
                    onClick={() => onDelete(activeMessage)}
                    className="p-2 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 cursor-pointer disabled:opacity-50"
                    title={t('adminActionDelete')}
                    aria-label={t('adminActionDelete')}
                  >
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface-solid)]">
                  <span className="block font-mono text-[var(--color-text-subtle)] mb-0.5">
                    {t('adminMessageSenderLabel')}
                  </span>
                  <span className="font-medium text-[var(--color-text)]">
                    {activeMessage.senderName}
                  </span>
                </div>
                <div className="p-3 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface-solid)]">
                  <span className="block font-mono text-[var(--color-text-subtle)] mb-0.5">
                    {t('adminMessageContactLabel')}
                  </span>
                  <span className="font-mono text-[var(--color-text)]" dir="ltr">
                    {activeMessage.senderContact || t('adminMessageNoContact')}
                  </span>
                </div>
              </div>

              <div
                dir={activeMessage.language === 'ar' ? 'rtl' : 'ltr'}
                className="p-4 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface-solid)] text-sm text-[var(--color-text)] leading-relaxed whitespace-pre-wrap"
              >
                {activeMessage.message}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
