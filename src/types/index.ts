export type Language = 'en' | 'ar';
export type Theme = 'dark' | 'light';

export interface NavItem {
  path: string;
  labelEn: string;
  labelAr: string;
}

export interface CourseItem {
  id: string;
  nameEn: string;
  nameAr: string;
  semesterEn: string;
  semesterAr: string;
  yearEn: string;
  yearAr: string;
  category: 'computational' | 'mathematical' | 'humanities';
  latticeNodeIndex: number;
  termTag?: string;
  source: 'owner-provided';
  verificationStatus: 'unverified-syllabus';
}

export interface AcademicProgramInfo {
  institutionEn: string;
  institutionAr: string;
  facultyEn: string;
  facultyAr: string;
  departmentEn: string;
  departmentAr: string;
  currentYearEn: string;
  currentYearAr: string;
  currentSemesterEn: string;
  currentSemesterAr: string;
  semester1ArchiveLabelEn: string;
  semester1ArchiveLabelAr: string;
  telegramBotUrl: string;
  telegramBotLabelEn: string;
  telegramBotLabelAr: string;
  verificationDisclaimerEn: string;
  verificationDisclaimerAr: string;
}

export type ProjectVisibility = 'public' | 'internal_archive';

export type ProjectArchiveGroup = 'showcase' | 'experiments_discontinued';

export type ProjectStatusType =
  | 'practicing'
  | 'in_development'
  | 'completed'
  | 'experimental'
  | 'paused'
  | 'discontinued'
  | 'archived'
  | 'needs_confirmation';

export interface ProjectItem {
  id: string;
  titleEn: string;
  titleAr: string;
  statusEn: string;
  statusAr: string;
  statusType: ProjectStatusType | 'planned';
  visibility?: ProjectVisibility;
  archiveGroup?: ProjectArchiveGroup;
  featuredOnHome?: boolean;
  descriptionEn: string;
  descriptionAr: string;
  technologies: string[];
  url?: string;
  repoUrl?: string;
  coverImageUrl?: string;
  coverImageAltEn?: string;
  coverImageAltAr?: string;
  roleEn?: string;
  roleAr?: string;
  problemEn?: string;
  problemAr?: string;
  approachEn?: string;
  approachAr?: string;
  outcomeEn?: string;
  outcomeAr?: string;
  fullOverviewEn: string[];
  fullOverviewAr: string[];
}

export interface SocialLink {
  platform: string;
  url: string;
  labelEn: string;
  labelAr: string;
  isAvailable: boolean;
}

export type PublicationStatus = 'draft' | 'published';

export type PublicQueryErrorCode =
  | 'firestore_unavailable'
  | 'permission_denied'
  | 'query_error';

export interface SeoCourseSchemaItem {
  name: string;
  description?: string;
  providerName: string;
}

export interface SeoOverride {
  title?: string;
  description?: string;
  type?: 'website' | 'article';
  publishedAt?: string;
  updatedAt?: string;
  keywords?: string[];
  codeRepository?: string;
  itemName?: string;
  courses?: SeoCourseSchemaItem[];
  noIndex?: boolean;
}

export type CollectionLoadStatus = 'idle' | 'loading' | 'loaded' | 'error';

export type AdminCollectionStatuses = {
  projects: CollectionLoadStatus;
  courses: CollectionLoadStatus;
  notes: CollectionLoadStatus;
  milestones: CollectionLoadStatus;
  contactMessages: CollectionLoadStatus;
  profile: CollectionLoadStatus;
};

export interface ProjectRecord {
  id: string;
  slug: string;
  titleEn: string;
  titleAr: string;
  statusEn?: string;
  statusAr?: string;
  statusType: ProjectStatusType;
  publicationStatus: PublicationStatus;
  visibility: ProjectVisibility;
  archiveGroup?: ProjectArchiveGroup;
  featuredOnHome?: boolean;
  legacyVisibilityMissing?: boolean;
  summaryEn?: string;
  summaryAr?: string;
  descriptionEn: string;
  descriptionAr: string;
  technologies: string[];
  url?: string;
  repoUrl?: string;
  coverImageUrl?: string;
  coverImageAltEn?: string;
  coverImageAltAr?: string;
  roleEn?: string;
  roleAr?: string;
  problemEn?: string;
  problemAr?: string;
  approachEn?: string;
  approachAr?: string;
  outcomeEn?: string;
  outcomeAr?: string;
  fullOverviewEn?: string[];
  fullOverviewAr?: string[];
  seoTitleEn?: string;
  seoTitleAr?: string;
  seoDescriptionEn?: string;
  seoDescriptionAr?: string;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
}

export interface LearningNoteRecord {
  id: string;
  slug: string;
  titleEn: string;
  titleAr: string;
  summaryEn?: string;
  summaryAr?: string;
  contentEn: string;
  contentAr: string;
  topicLabels?: string[];
  publicationStatus: PublicationStatus;
  seoTitleEn?: string;
  seoTitleAr?: string;
  seoDescriptionEn?: string;
  seoDescriptionAr?: string;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
}

export interface MilestoneRecord {
  id: string;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  dateEn?: string;
  dateAr?: string;
  category: 'academic' | 'technical';
  externalReference?: string;
  publicationStatus: PublicationStatus;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
}

export type MilestoneItem = MilestoneRecord;

export interface CourseRecord {
  id: string;
  slug: string;
  nameEn: string;
  nameAr: string;
  semesterEn: string;
  semesterAr: string;
  yearEn: string;
  yearAr: string;
  category: 'computational' | 'mathematical' | 'humanities';
  latticeNodeIndex: number;
  termTag?: string;
  verificationStatus?: 'unverified-syllabus' | 'verified';
  descriptionEn?: string;
  descriptionAr?: string;
  publicationStatus: PublicationStatus;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
}

export type ContactMessageStatus = 'unread' | 'read' | 'archived';

export interface ContactMessageRecord {
  id: string;
  senderName: string;
  senderContact?: string;
  subject: string;
  message: string;
  language: Language;
  status: ContactMessageStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface ContactMessageInput {
  senderName: string;
  senderContact?: string;
  subject: string;
  message: string;
  language: Language;
  honeypot?: string;
}

export type LearningTrackStatus =
  | 'active'
  | 'in_progress'
  | 'completed'
  | 'paused'
  | 'submitted'
  | 'needs_confirmation';

export interface LearningTrackItem {
  id: string;
  titleEn: string;
  titleAr: string;
  status: LearningTrackStatus;
  statusLabelEn: string;
  statusLabelAr: string;
  cadenceNoteEn: string;
  cadenceNoteAr: string;
  summaryEn: string;
  summaryAr: string;
  highlightsEn: string[];
  highlightsAr: string[];
  showInActiveHighlights?: boolean;
}

export interface PracticalExperienceSection {
  sectionTitleEn: string;
  sectionTitleAr: string;
  contextSummaryEn: string;
  contextSummaryAr: string;
  activitiesEn: string[];
  activitiesAr: string[];
}

export interface ProfileSettingsRecord {
  nameEn: string;
  nameAr: string;
  titleEn: string;
  titleAr: string;
  facultyEn: string;
  facultyAr: string;
  universityEn?: string;
  universityAr?: string;
  departmentEn?: string;
  departmentAr?: string;
  academicYearEn?: string;
  academicYearAr?: string;
  currentSemesterEn?: string;
  currentSemesterAr?: string;
  bioEn: string;
  bioAr: string;
  currentFocusEn: string;
  currentFocusAr: string;
  futureFocusEn: string;
  futureFocusAr: string;
  learningTracks?: LearningTrackItem[];
  practicalExperience?: PracticalExperienceSection;
  githubUrl: string;
  linkedinUrl: string;
  updatedAt?: string;
}

export interface ImportPreview {
  projectsCount: number;
  coursesCount: number;
  notesCount: number;
  milestonesCount: number;
  hasProfileData: boolean;
}

export interface ImportResult {
  added: number;
  skipped: number;
  failed: number;
  details: string[];
}
