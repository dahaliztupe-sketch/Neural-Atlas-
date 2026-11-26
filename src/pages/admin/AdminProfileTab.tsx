import React, { useState } from 'react';
import { GraduationCap, Plus, Trash2 } from 'lucide-react';
import { LearningTrackItem, LearningTrackStatus, PracticalExperienceSection, ProfileSettingsRecord } from '../../types';
import { useApp } from '../../context/AppContext';
import { ADMIN_INPUT_CLASS, ADMIN_LABEL_CLASS } from './AdminShared';
import { PRACTICAL_EXPERIENCE } from '../../data/portfolioData';
import { getClientContactEmail, setClientContactEmail } from '../../lib/contactConfig';
import { isValidOptionalEmail } from '../../lib/validation';

interface AdminProfileTabProps {
  profileSettings: ProfileSettingsRecord;
  onChange: (next: ProfileSettingsRecord) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const AdminProfileTab: React.FC<AdminProfileTabProps> = ({
  profileSettings,
  onChange,
  onSubmit,
}) => {
  const { t, isRtl } = useApp();
  const [previewLang, setPreviewLang] = useState<'en' | 'ar'>(isRtl ? 'ar' : 'en');
  const [contactEmailInput, setContactEmailInput] = useState<string>(() => getClientContactEmail());
  const [contactEmailError, setContactEmailError] = useState<string | null>(null);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = contactEmailInput.trim();
    if (!isValidOptionalEmail(trimmedEmail)) {
      setContactEmailError(
        isRtl
          ? 'يرجى إدخال بريد إلكتروني صحيح أو ترك الحقل فارغاً لاستخدام الافتراضي.'
          : 'Please enter a valid email address or leave blank to use the default.'
      );
      return;
    }
    setContactEmailError(null);
    const saved = setClientContactEmail(trimmedEmail);
    setContactEmailInput(saved);
    onSubmit(e);
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleFormSubmit} className="space-y-6">
        <div className="na-mineral-card p-6 sm:p-8 rounded-2xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[var(--color-border-subtle)]">
            <h2 className="text-base font-bold text-[var(--color-text)]">
              {t('adminTabProfile')}
            </h2>
            <div className="inline-flex items-center rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-solid)] p-0.5 text-[11px] font-mono">
              <button
                type="button"
                onClick={() => setPreviewLang('en')}
                className={`px-2.5 py-1 rounded-lg cursor-pointer ${
                  previewLang === 'en' ? 'bg-[var(--color-primary-solid)] text-white font-semibold' : 'text-[var(--color-text-muted)]'
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setPreviewLang('ar')}
                className={`px-2.5 py-1 rounded-lg cursor-pointer ${
                  previewLang === 'ar' ? 'bg-[var(--color-primary-solid)] text-white font-semibold' : 'text-[var(--color-text-muted)]'
                }`}
              >
                AR
              </button>
            </div>
          </div>

          {/* Live Hero Identity Preview */}
          <div
            dir={previewLang === 'ar' ? 'rtl' : 'ltr'}
            className="p-4 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface-solid)] space-y-1.5 text-start"
          >
            <div className="flex items-center gap-2 text-[11px] font-mono text-[var(--color-secondary)]">
              <GraduationCap className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>{previewLang === 'ar' ? profileSettings.titleAr : profileSettings.titleEn}</span>
              <span aria-hidden="true">·</span>
              <span className="text-[var(--color-text-subtle)]">
                {previewLang === 'ar' ? profileSettings.facultyAr : profileSettings.facultyEn}
              </span>
            </div>
            <div className="text-sm font-bold text-[var(--color-text)]">
              {previewLang === 'ar' ? profileSettings.nameAr : profileSettings.nameEn}
            </div>
            <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
              {previewLang === 'ar' ? profileSettings.bioAr : profileSettings.bioEn}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="profile-name-en" className={ADMIN_LABEL_CLASS}>Name (English)</label>
              <input
                id="profile-name-en"
                type="text"
                required
                value={profileSettings.nameEn}
                onChange={(e) => onChange({ ...profileSettings, nameEn: e.target.value })}
                className={ADMIN_INPUT_CLASS}
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="profile-name-ar" className={ADMIN_LABEL_CLASS}>الاسم (العربية)</label>
              <input
                id="profile-name-ar"
                type="text"
                required
                dir="rtl"
                value={profileSettings.nameAr}
                onChange={(e) => onChange({ ...profileSettings, nameAr: e.target.value })}
                className={ADMIN_INPUT_CLASS}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="profile-title-en" className={ADMIN_LABEL_CLASS}>Academic Role (English)</label>
              <input
                id="profile-title-en"
                type="text"
                value={profileSettings.titleEn}
                onChange={(e) => onChange({ ...profileSettings, titleEn: e.target.value })}
                className={ADMIN_INPUT_CLASS}
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="profile-title-ar" className={ADMIN_LABEL_CLASS}>الصفة الأكاديمية (العربية)</label>
              <input
                id="profile-title-ar"
                type="text"
                dir="rtl"
                value={profileSettings.titleAr}
                onChange={(e) => onChange({ ...profileSettings, titleAr: e.target.value })}
                className={ADMIN_INPUT_CLASS}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="profile-faculty-en" className={ADMIN_LABEL_CLASS}>Faculty / University (English)</label>
              <input
                id="profile-faculty-en"
                type="text"
                value={profileSettings.facultyEn}
                onChange={(e) => onChange({ ...profileSettings, facultyEn: e.target.value })}
                className={ADMIN_INPUT_CLASS}
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="profile-faculty-ar" className={ADMIN_LABEL_CLASS}>الكلية / الجامعة (العربية)</label>
              <input
                id="profile-faculty-ar"
                type="text"
                dir="rtl"
                value={profileSettings.facultyAr}
                onChange={(e) => onChange({ ...profileSettings, facultyAr: e.target.value })}
                className={ADMIN_INPUT_CLASS}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="profile-university-en" className={ADMIN_LABEL_CLASS}>University (English)</label>
              <input
                id="profile-university-en"
                type="text"
                value={profileSettings.universityEn || ''}
                onChange={(e) => onChange({ ...profileSettings, universityEn: e.target.value })}
                className={ADMIN_INPUT_CLASS}
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="profile-university-ar" className={ADMIN_LABEL_CLASS}>الجامعة (العربية)</label>
              <input
                id="profile-university-ar"
                type="text"
                dir="rtl"
                value={profileSettings.universityAr || ''}
                onChange={(e) => onChange({ ...profileSettings, universityAr: e.target.value })}
                className={ADMIN_INPUT_CLASS}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="profile-dept-en" className={ADMIN_LABEL_CLASS}>Department (English)</label>
              <input
                id="profile-dept-en"
                type="text"
                value={profileSettings.departmentEn || ''}
                onChange={(e) => onChange({ ...profileSettings, departmentEn: e.target.value })}
                className={ADMIN_INPUT_CLASS}
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="profile-dept-ar" className={ADMIN_LABEL_CLASS}>القسم العلمي (العربية)</label>
              <input
                id="profile-dept-ar"
                type="text"
                dir="rtl"
                value={profileSettings.departmentAr || ''}
                onChange={(e) => onChange({ ...profileSettings, departmentAr: e.target.value })}
                className={ADMIN_INPUT_CLASS}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="profile-year-en" className={ADMIN_LABEL_CLASS}>Academic Year (English)</label>
              <input
                id="profile-year-en"
                type="text"
                value={profileSettings.academicYearEn || ''}
                onChange={(e) => onChange({ ...profileSettings, academicYearEn: e.target.value })}
                className={ADMIN_INPUT_CLASS}
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="profile-year-ar" className={ADMIN_LABEL_CLASS}>الفرقة / السنة الدراسية (العربية)</label>
              <input
                id="profile-year-ar"
                type="text"
                dir="rtl"
                value={profileSettings.academicYearAr || ''}
                onChange={(e) => onChange({ ...profileSettings, academicYearAr: e.target.value })}
                className={ADMIN_INPUT_CLASS}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="profile-semester-en" className={ADMIN_LABEL_CLASS}>Current Academic Term (English)</label>
              <input
                id="profile-semester-en"
                type="text"
                value={profileSettings.currentSemesterEn || ''}
                onChange={(e) => onChange({ ...profileSettings, currentSemesterEn: e.target.value })}
                className={ADMIN_INPUT_CLASS}
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="profile-semester-ar" className={ADMIN_LABEL_CLASS}>الفصل الدراسي الحالي (العربية)</label>
              <input
                id="profile-semester-ar"
                type="text"
                dir="rtl"
                value={profileSettings.currentSemesterAr || ''}
                onChange={(e) => onChange({ ...profileSettings, currentSemesterAr: e.target.value })}
                className={ADMIN_INPUT_CLASS}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="profile-bio-en" className={ADMIN_LABEL_CLASS}>Bio (English)</label>
              <textarea
                id="profile-bio-en"
                rows={3}
                value={profileSettings.bioEn}
                onChange={(e) => onChange({ ...profileSettings, bioEn: e.target.value })}
                className={ADMIN_INPUT_CLASS}
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="profile-bio-ar" className={ADMIN_LABEL_CLASS}>النبذة التعريفية (العربية)</label>
              <textarea
                id="profile-bio-ar"
                rows={3}
                dir="rtl"
                value={profileSettings.bioAr}
                onChange={(e) => onChange({ ...profileSettings, bioAr: e.target.value })}
                className={ADMIN_INPUT_CLASS}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="profile-focus-en" className={ADMIN_LABEL_CLASS}>Current Focus (English)</label>
              <input
                id="profile-focus-en"
                type="text"
                value={profileSettings.currentFocusEn}
                onChange={(e) => onChange({ ...profileSettings, currentFocusEn: e.target.value })}
                className={ADMIN_INPUT_CLASS}
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="profile-focus-ar" className={ADMIN_LABEL_CLASS}>التركيز الحالي (العربية)</label>
              <input
                id="profile-focus-ar"
                type="text"
                dir="rtl"
                value={profileSettings.currentFocusAr}
                onChange={(e) => onChange({ ...profileSettings, currentFocusAr: e.target.value })}
                className={ADMIN_INPUT_CLASS}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="profile-future-en" className={ADMIN_LABEL_CLASS}>Future Step (English)</label>
              <input
                id="profile-future-en"
                type="text"
                value={profileSettings.futureFocusEn}
                onChange={(e) => onChange({ ...profileSettings, futureFocusEn: e.target.value })}
                className={ADMIN_INPUT_CLASS}
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="profile-future-ar" className={ADMIN_LABEL_CLASS}>الخطوة القادمة (العربية)</label>
              <input
                id="profile-future-ar"
                type="text"
                dir="rtl"
                value={profileSettings.futureFocusAr}
                onChange={(e) => onChange({ ...profileSettings, futureFocusAr: e.target.value })}
                className={ADMIN_INPUT_CLASS}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="profile-github" className={ADMIN_LABEL_CLASS}>GitHub URL</label>
              <input
                id="profile-github"
                type="url"
                value={profileSettings.githubUrl}
                onChange={(e) => onChange({ ...profileSettings, githubUrl: e.target.value })}
                className={ADMIN_INPUT_CLASS}
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="profile-linkedin" className={ADMIN_LABEL_CLASS}>LinkedIn URL</label>
              <input
                id="profile-linkedin"
                type="url"
                value={profileSettings.linkedinUrl}
                onChange={(e) => onChange({ ...profileSettings, linkedinUrl: e.target.value })}
                className={ADMIN_INPUT_CLASS}
              />
            </div>
          </div>

          {/* Client-Only Optional Contact Email Field (Defaults to CONTACT_EMAIL; never written to Firestore) */}
          <div className="space-y-1">
            <label htmlFor="profile-contact-email" className={ADMIN_LABEL_CLASS}>
              {t('adminContactEmailLabel')}
            </label>
            <input
              id="profile-contact-email"
              type="email"
              dir="ltr"
              value={contactEmailInput}
              onChange={(e) => {
                setContactEmailInput(e.target.value);
                if (contactEmailError) setContactEmailError(null);
              }}
              placeholder="abdalrahman32008@gmail.com"
              className={ADMIN_INPUT_CLASS}
            />
            {contactEmailError && (
              <p className="text-xs text-red-400" role="alert">
                {contactEmailError}
              </p>
            )}
          </div>

          {/* Learning Tracks Structured Editor */}
          <div className="p-4 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface-solid)] space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-xs font-mono font-bold text-[var(--color-text)]">
                  Public Learning Tracks ({(profileSettings.learningTracks || []).length}/10)
                </h3>
                <p className="text-[11px] text-[var(--color-text-muted)]">
                  Structured study & application tracks rendered on About and Home highlights.
                </p>
              </div>
              {(profileSettings.learningTracks || []).length < 10 && (
                <button
                  type="button"
                  onClick={() => {
                    const existing = profileSettings.learningTracks || [];
                    const nextTrack: LearningTrackItem = {
                      id: `track-${Date.now()}`,
                      titleEn: 'New Learning Track',
                      titleAr: 'مسار تعلّم جديد',
                      status: 'in_progress',
                      statusLabelEn: 'In Progress',
                      statusLabelAr: 'قيد التقدم',
                      cadenceNoteEn: '',
                      cadenceNoteAr: '',
                      summaryEn: '',
                      summaryAr: '',
                      highlightsEn: [],
                      highlightsAr: [],
                      showInActiveHighlights: true,
                    };
                    onChange({ ...profileSettings, learningTracks: [...existing, nextTrack] });
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[var(--color-border)] hover:border-[var(--color-primary)] text-xs font-mono cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Add Track</span>
                </button>
              )}
            </div>

            <div className="space-y-3">
              {(profileSettings.learningTracks || []).map((track, idx) => {
                const updateTrack = (patch: Partial<LearningTrackItem>) => {
                  const next = [...(profileSettings.learningTracks || [])];
                  next[idx] = { ...track, ...patch };
                  onChange({ ...profileSettings, learningTracks: next });
                };
                return (
                  <div
                    key={track.id}
                    className="p-3.5 rounded-xl border border-[var(--color-border)] space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[11px] font-mono text-[var(--color-secondary)]">
                        #{idx + 1} · {track.id}
                      </span>
                      <div className="flex items-center gap-3">
                        <label className="inline-flex items-center gap-1.5 text-[11px] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={track.showInActiveHighlights !== false}
                            onChange={(e) =>
                              updateTrack({ showInActiveHighlights: e.target.checked })
                            }
                          />
                          <span>Show in Home Highlights</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            const next = (profileSettings.learningTracks || []).filter(
                              (_, i) => i !== idx
                            );
                            onChange({ ...profileSettings, learningTracks: next });
                          }}
                          className="p-1 text-red-400 hover:bg-red-500/15 rounded cursor-pointer"
                          aria-label={`Remove ${track.titleEn}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className={ADMIN_LABEL_CLASS}>Track ID</label>
                        <input
                          type="text"
                          value={track.id}
                          onChange={(e) => updateTrack({ id: e.target.value })}
                          className={ADMIN_INPUT_CLASS}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className={ADMIN_LABEL_CLASS}>Status</label>
                        <select
                          value={track.status}
                          onChange={(e) =>
                            updateTrack({ status: e.target.value as LearningTrackStatus })
                          }
                          className={ADMIN_INPUT_CLASS}
                        >
                          <option value="active">active</option>
                          <option value="in_progress">in_progress</option>
                          <option value="completed">completed</option>
                          <option value="paused">paused</option>
                          <option value="submitted">submitted</option>
                          <option value="needs_confirmation">needs_confirmation</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className={ADMIN_LABEL_CLASS}>Status Label (EN)</label>
                        <input
                          type="text"
                          value={track.statusLabelEn}
                          onChange={(e) => updateTrack({ statusLabelEn: e.target.value })}
                          className={ADMIN_INPUT_CLASS}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className={ADMIN_LABEL_CLASS}>Title (EN)</label>
                        <input
                          type="text"
                          value={track.titleEn}
                          onChange={(e) => updateTrack({ titleEn: e.target.value })}
                          className={ADMIN_INPUT_CLASS}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className={ADMIN_LABEL_CLASS}>العنوان (AR)</label>
                        <input
                          type="text"
                          dir="rtl"
                          value={track.titleAr}
                          onChange={(e) => updateTrack({ titleAr: e.target.value })}
                          className={ADMIN_INPUT_CLASS}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className={ADMIN_LABEL_CLASS}>Status Label (AR)</label>
                        <input
                          type="text"
                          dir="rtl"
                          value={track.statusLabelAr}
                          onChange={(e) => updateTrack({ statusLabelAr: e.target.value })}
                          className={ADMIN_INPUT_CLASS}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className={ADMIN_LABEL_CLASS}>Cadence Note (EN)</label>
                        <input
                          type="text"
                          value={track.cadenceNoteEn}
                          onChange={(e) => updateTrack({ cadenceNoteEn: e.target.value })}
                          className={ADMIN_INPUT_CLASS}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className={ADMIN_LABEL_CLASS}>Summary (EN)</label>
                        <textarea
                          rows={2}
                          value={track.summaryEn}
                          onChange={(e) => updateTrack({ summaryEn: e.target.value })}
                          className={ADMIN_INPUT_CLASS}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className={ADMIN_LABEL_CLASS}>الملخص (AR)</label>
                        <textarea
                          rows={2}
                          dir="rtl"
                          value={track.summaryAr}
                          onChange={(e) => updateTrack({ summaryAr: e.target.value })}
                          className={ADMIN_INPUT_CLASS}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className={ADMIN_LABEL_CLASS}>Highlights (EN, one per line)</label>
                        <textarea
                          rows={2}
                          value={track.highlightsEn.join('\n')}
                          onChange={(e) =>
                            updateTrack({
                              highlightsEn: e.target.value
                                .split('\n')
                                .map((s) => s.trim())
                                .filter(Boolean),
                            })
                          }
                          className={ADMIN_INPUT_CLASS}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className={ADMIN_LABEL_CLASS}>النقاط المميزة (AR، سطر لكل نقطة)</label>
                        <textarea
                          rows={2}
                          dir="rtl"
                          value={track.highlightsAr.join('\n')}
                          onChange={(e) =>
                            updateTrack({
                              highlightsAr: e.target.value
                                .split('\n')
                                .map((s) => s.trim())
                                .filter(Boolean),
                            })
                          }
                          className={ADMIN_INPUT_CLASS}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Neutral Excel Skill Line Editor (no job/wage details or bullet list) */}
          {(() => {
            const exp: PracticalExperienceSection =
              profileSettings.practicalExperience || PRACTICAL_EXPERIENCE;
            const updateExp = (patch: Partial<PracticalExperienceSection>) =>
              onChange({
                ...profileSettings,
                practicalExperience: {
                  ...exp,
                  ...patch,
                  sectionTitleEn: 'Microsoft Excel',
                  sectionTitleAr: 'Microsoft Excel',
                  activitiesEn: [],
                  activitiesAr: [],
                },
              });
            return (
              <div className="p-4 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface-solid)] space-y-4">
                <h3 className="text-xs font-mono font-bold text-[var(--color-text)]">
                  {t('aboutKickerExperience')}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label htmlFor="exp-summary-en" className={ADMIN_LABEL_CLASS}>Neutral Skill Summary (EN)</label>
                    <textarea
                      id="exp-summary-en"
                      rows={2}
                      value={exp.contextSummaryEn}
                      onChange={(e) => updateExp({ contextSummaryEn: e.target.value })}
                      className={ADMIN_INPUT_CLASS}
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="exp-summary-ar" className={ADMIN_LABEL_CLASS}>ملخص المهارة المحايد (AR)</label>
                    <textarea
                      id="exp-summary-ar"
                      rows={2}
                      dir="rtl"
                      value={exp.contextSummaryAr}
                      onChange={(e) => updateExp({ contextSummaryAr: e.target.value })}
                      className={ADMIN_INPUT_CLASS}
                    />
                  </div>
                </div>
              </div>
            );
          })()}

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 min-h-[44px] rounded-xl bg-[var(--color-primary-solid)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-semibold transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            >
              {t('adminActionSave')}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AdminProfileTab;
