import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { SOCIAL_LINKS } from '../data/portfolioData';
import {
  isValidUrl,
  submitContactMessage,
  validateContactMessageInput,
} from '../services/contentRepository';
import { formatFirestoreUserError } from '../lib/validation';
import {
  Github,
  Linkedin,
  ExternalLink,
  Mail,
  MessageSquare,
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';

const COOLDOWN_MS = 30000;

export const ConnectPage: React.FC = () => {
  const { t, language, publicProfile } = useApp();

  const [senderName, setSenderName] = useState('');
  const [senderContact, setSenderContact] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<'senderName' | 'senderContact' | 'subject' | 'message', string>>
  >({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const cooldownUntilRef = useRef<number>(0);

  const channels = SOCIAL_LINKS.map((link) => {
    const candidate =
      link.platform === 'GitHub'
        ? publicProfile.githubUrl
        : link.platform === 'LinkedIn'
        ? publicProfile.linkedinUrl
        : link.url;
    return {
      ...link,
      url: isValidUrl(candidate) ? candidate : link.url,
    };
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (Date.now() < cooldownUntilRef.current) {
      setSubmitError(t('contactCooldownError'));
      return;
    }

    const validation = validateContactMessageInput({
      senderName,
      senderContact,
      subject,
      message,
      language,
      honeypot,
    });

    if (!validation.valid) {
      setFieldErrors(validation.errors);
      if (validation.error && Object.keys(validation.errors).length === 0) {
        setSubmitError(validation.error);
      }
      return;
    }

    setFieldErrors({});
    setSubmitting(true);

    try {
      await submitContactMessage({
        senderName,
        senderContact,
        subject,
        message,
        language,
        honeypot,
      });
      cooldownUntilRef.current = Date.now() + COOLDOWN_MS;
      setSubmitted(true);
      setSenderName('');
      setSenderContact('');
      setSubject('');
      setMessage('');
      setHoneypot('');
    } catch (err) {
      setSubmitError(formatFirestoreUserError(err, language) || t('contactSubmitError'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-10">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-mono text-[var(--color-secondary)] mb-2">
          <MessageSquare className="w-4 h-4" aria-hidden="true" />
          <span>{t('connectKicker')}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-[var(--color-text)] tracking-tight text-balance mb-3">
          {t('connectTitle')}
        </h1>
        <p className="text-base text-[var(--color-text-muted)] leading-relaxed">
          {t('connectIntro')}
        </p>
      </div>

      {/* Verified Public Channels Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {channels.map((link) => (
          <a
            key={link.platform}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="na-mineral-card na-mineral-card-interactive group p-6 rounded-2xl flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] text-[var(--color-primary)] group-hover:text-[var(--color-secondary)] transition-colors">
                  {link.platform === 'GitHub' ? (
                    <Github className="w-5 h-5" aria-hidden="true" />
                  ) : (
                    <Linkedin className="w-5 h-5" aria-hidden="true" />
                  )}
                </div>
                <ExternalLink className="w-4 h-4 text-[var(--color-text-subtle)] group-hover:text-[var(--color-primary)] transition-colors" aria-hidden="true" />
              </div>

              <h2 className="text-base font-semibold text-[var(--color-text)] mb-1">
                {link.platform}
              </h2>

              <p className="text-xs text-[var(--color-text-muted)] leading-relaxed mb-4">
                {link.platform === 'GitHub'
                  ? t('connectGithubDesc')
                  : t('connectLinkedinDesc')}
              </p>
            </div>

            <div className="pt-3 border-t border-[var(--color-border-subtle)] flex items-center justify-between text-xs font-mono text-[var(--color-text-subtle)]">
              <span className="truncate max-w-[200px]" dir="ltr">
                {link.url.replace(/^https?:\/\//, '')}
              </span>
              <span className="text-[var(--color-primary)] group-hover:underline">
                {t('openLink')}
              </span>
            </div>
          </a>
        ))}
      </div>

      {/* Direct Visitor Message Form (Writes to Firestore contactMessages) */}
      <section className="na-mineral-card p-6 sm:p-8 rounded-2xl space-y-6">
        <div className="space-y-1.5">
          <div className="text-xs font-mono text-[var(--color-secondary)]">
            {t('contactFormKicker')}
          </div>
          <h2 className="text-xl font-bold text-[var(--color-text)]">
            {t('contactFormTitle')}
          </h2>
          <p className="text-xs sm:text-sm text-[var(--color-text-muted)] leading-relaxed">
            {t('contactFormDesc')}
          </p>
        </div>

        {submitted ? (
          <div className="p-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 space-y-3" role="status">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
              <CheckCircle2 className="w-5 h-5 shrink-0" aria-hidden="true" />
              <span>{t('contactSuccessTitle')}</span>
            </div>
            <p className="text-xs sm:text-sm text-[var(--color-text-muted)] leading-relaxed">
              {t('contactSuccessDesc')}
            </p>
            <button
              type="button"
              onClick={() => setSubmitted(false)}
              className="px-4 py-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 text-xs font-medium text-[var(--color-text)] hover:bg-emerald-500/20 transition-colors cursor-pointer"
            >
              {t('contactSendAnotherBtn')}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Hidden spam honeypot field */}
            <div className="sr-only" aria-hidden="true">
              <label htmlFor="na-contact-website">Website</label>
              <input
                id="na-contact-website"
                name="website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
              />
            </div>

            {submitError && (
              <div
                role="alert"
                className="p-3.5 rounded-xl border border-red-500/30 bg-red-500/10 text-xs text-red-400 flex items-start gap-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                <span>{submitError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="na-contact-name"
                  className="block text-xs font-mono text-[var(--color-text-muted)]"
                >
                  {t('contactNameLabel')} *
                </label>
                <input
                  id="na-contact-name"
                  type="text"
                  required
                  maxLength={120}
                  value={senderName}
                  onChange={(e) => {
                    setSenderName(e.target.value);
                    if (fieldErrors.senderName) {
                      setFieldErrors((prev) => ({ ...prev, senderName: undefined }));
                    }
                  }}
                  placeholder={t('contactNamePlaceholder')}
                  aria-invalid={Boolean(fieldErrors.senderName)}
                  aria-describedby={fieldErrors.senderName ? 'na-contact-name-err' : undefined}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-solid)] text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-subtle)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]"
                />
                {fieldErrors.senderName && (
                  <p id="na-contact-name-err" className="text-xs text-red-400">
                    {fieldErrors.senderName}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="na-contact-handle"
                  className="block text-xs font-mono text-[var(--color-text-muted)]"
                >
                  {t('contactHandleLabel')}
                </label>
                <input
                  id="na-contact-handle"
                  type="text"
                  maxLength={200}
                  value={senderContact}
                  onChange={(e) => {
                    setSenderContact(e.target.value);
                    if (fieldErrors.senderContact) {
                      setFieldErrors((prev) => ({ ...prev, senderContact: undefined }));
                    }
                  }}
                  placeholder={t('contactHandlePlaceholder')}
                  dir="ltr"
                  aria-invalid={Boolean(fieldErrors.senderContact)}
                  aria-describedby={fieldErrors.senderContact ? 'na-contact-handle-err' : undefined}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-solid)] text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-subtle)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]"
                />
                {fieldErrors.senderContact && (
                  <p id="na-contact-handle-err" className="text-xs text-red-400">
                    {fieldErrors.senderContact}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="na-contact-subject"
                className="block text-xs font-mono text-[var(--color-text-muted)]"
              >
                {t('contactSubjectLabel')} *
              </label>
              <input
                id="na-contact-subject"
                type="text"
                required
                maxLength={160}
                value={subject}
                onChange={(e) => {
                  setSubject(e.target.value);
                  if (fieldErrors.subject) {
                    setFieldErrors((prev) => ({ ...prev, subject: undefined }));
                  }
                }}
                placeholder={t('contactSubjectPlaceholder')}
                aria-invalid={Boolean(fieldErrors.subject)}
                aria-describedby={fieldErrors.subject ? 'na-contact-subject-err' : undefined}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-solid)] text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-subtle)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]"
              />
              {fieldErrors.subject && (
                <p id="na-contact-subject-err" className="text-xs text-red-400">
                  {fieldErrors.subject}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <label
                  htmlFor="na-contact-message"
                  className="block text-xs font-mono text-[var(--color-text-muted)]"
                >
                  {t('contactMessageLabel')} *
                </label>
                <span className="text-[11px] font-mono text-[var(--color-text-subtle)] tabular-nums">
                  {message.length} / 2500
                </span>
              </div>
              <textarea
                id="na-contact-message"
                rows={4}
                required
                maxLength={2500}
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  if (fieldErrors.message) {
                    setFieldErrors((prev) => ({ ...prev, message: undefined }));
                  }
                }}
                placeholder={t('contactMessagePlaceholder')}
                aria-invalid={Boolean(fieldErrors.message)}
                aria-describedby={fieldErrors.message ? 'na-contact-message-err' : undefined}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-solid)] text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-subtle)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]"
              />
              {fieldErrors.message && (
                <p id="na-contact-message-err" className="text-xs text-red-400">
                  {fieldErrors.message}
                </p>
              )}
            </div>

            <div className="pt-1 flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 min-h-[44px] rounded-xl bg-[var(--color-primary)] text-white text-xs sm:text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                    <span>{t('contactSendingBtn')}</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" aria-hidden="true" />
                    <span>{t('contactSendBtn')}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </section>

      {/* Privacy-Preserving Direct Contact Notice */}
      <div className="p-6 rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] space-y-2">
        <div className="flex items-center gap-2 text-xs font-mono text-[var(--color-text-subtle)]">
          <Mail className="w-4 h-4 text-[var(--color-text-subtle)]" aria-hidden="true" />
          <span>{t('emailNoticeTitle')}</span>
        </div>
        <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
          {t('emailNoticeDesc')}
        </p>
      </div>
    </div>
  );
};
