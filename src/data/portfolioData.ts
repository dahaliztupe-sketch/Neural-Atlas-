import {
  CourseItem,
  ProjectItem,
  SocialLink,
  MilestoneItem,
  AcademicProgramInfo,
  LearningTrackItem,
  PracticalExperienceSection,
} from '../types';

export const OWNER_INFO = {
  nameEn: 'Abdalrahman Mostafa',
  nameAr: 'عبد الرحمن مصطفى',
  titleEn: 'First-Year Intelligent Computing Student',
  titleAr: 'طالب بالسنة الأولى · قسم الحوسبة الذكية',
  universityEn: 'Al-Azhar University',
  universityAr: 'جامعة الأزهر',
  facultyEn: 'Faculty of Science, Al-Azhar University',
  facultyAr: 'كلية العلوم، جامعة الأزهر',
  departmentEn: 'Intelligent Computing Department',
  departmentAr: 'قسم الحوسبة الذكية',
  academicYearEn: 'First Year',
  academicYearAr: 'السنة الأولى',
  currentSemesterEn: 'Active Academic Term',
  currentSemesterAr: 'الفصل الدراسي الحالي',
  semesterEn: 'First Year · Faculty of Science, Al-Azhar University',
  semesterAr: 'السنة الأولى · كلية العلوم، جامعة الأزهر',
  bioEn:
    'Documenting my verified academic journey in Intelligent Computing at the Faculty of Science, Al-Azhar University. Focused on strengthening C++ programming, algorithmic thinking, and core mathematics while transparently recording experimental software explorations.',
  bioAr:
    'توثيق صادق لمسيرتي الأكاديمية في قسم الحوسبة الذكية بكلية العلوم، جامعة الأزهر. أركّز على ترسيخ أساسيات البرمجة بلغة C++ والتفكير الخوارزمي والرياضيات التأسيسية، مع توثيق تجاربي البرمجية الاستكشافية بشفافية تامة.',
  currentFocusEn:
    'C++ problem-solving practice, Al-Azhar Intelligent Computing coursework, and reviewing foundational CS50x computer science concepts',
  currentFocusAr:
    'ممارسة حل المشكلات بلغة C++، ودراسة مقررات الحوسبة الذكية بجامعة الأزهر، ومراجعة الأساسيات التمهيدية لعلوم الحاسب في مساق CS50x',
  futureFocusEn:
    'Deepening algorithms and data structures, resuming foundational CS50x study steadily, and expanding into Python and intelligent computing systems',
  futureFocusAr:
    'التعمّق في الخوارزميات وهياكل البيانات، واستئناف دراسة مساق CS50x بوتيرة ثابتة، ثم التوسّع نحو لغة بايثون وتطبيقات الحوسبة الذكية',
};

export const ACADEMIC_PROGRAM: AcademicProgramInfo = {
  institutionEn: 'Al-Azhar University',
  institutionAr: 'جامعة الأزهر',
  facultyEn: 'Faculty of Science',
  facultyAr: 'كلية العلوم',
  departmentEn: 'Intelligent Computing Department',
  departmentAr: 'قسم الحوسبة الذكية',
  currentYearEn: 'First Year',
  currentYearAr: 'السنة الأولى',
  currentSemesterEn: 'Active Academic Term',
  currentSemesterAr: 'الفصل الدراسي الحالي',
  semester1ArchiveLabelEn: 'Semester 1 Academic Archive (7 Core Subjects)',
  semester1ArchiveLabelAr: 'أرشيف الفصل الدراسي الأول (٧ مقررات تأسيسية)',
  telegramBotUrl: 'https://t.me/IntelligentComputingAzharBot',
  telegramBotLabelEn: 'Open the department information bot',
  telegramBotLabelAr: 'افتح بوت معلومات القسم',
  verificationDisclaimerEn:
    'Course titles and academic context are owner-provided. Official syllabus specifications, credit distribution, course codes, and instructor assignments have not been verified in this project.',
  verificationDisclaimerAr:
    'عناوين المقررات والسياق الدراسي مُدخلة من قِبل صاحب الموقع. لم يتم التحقق من مفردات المنهج الرسمية أو توزيع الساعات أو رموز المقررات أو هيئة التدريس في هذا المشروع.',
};

export const COURSES: CourseItem[] = [
  {
    id: 'algorithmic-thinking',
    nameEn: 'Algorithmic Thinking',
    nameAr: 'التفكير الخوارزمي',
    category: 'computational',
    semesterEn: 'First Semester',
    semesterAr: 'الفصل الدراسي الأول',
    yearEn: 'First Year',
    yearAr: 'السنة الأولى',
    termTag: 'semester-1-archive',
    latticeNodeIndex: 0,
    source: 'owner-provided',
    verificationStatus: 'unverified-syllabus',
  },
  {
    id: 'artificial-intelligence',
    nameEn: 'Artificial Intelligence',
    nameAr: 'الذكاء الاصطناعي',
    category: 'computational',
    semesterEn: 'First Semester',
    semesterAr: 'الفصل الدراسي الأول',
    yearEn: 'First Year',
    yearAr: 'السنة الأولى',
    termTag: 'semester-1-archive',
    latticeNodeIndex: 1,
    source: 'owner-provided',
    verificationStatus: 'unverified-syllabus',
  },
  {
    id: 'computer-architecture',
    nameEn: 'Computer Architecture',
    nameAr: 'معمارية الحاسب',
    category: 'computational',
    semesterEn: 'First Semester',
    semesterAr: 'الفصل الدراسي الأول',
    yearEn: 'First Year',
    yearAr: 'السنة الأولى',
    termTag: 'semester-1-archive',
    latticeNodeIndex: 2,
    source: 'owner-provided',
    verificationStatus: 'unverified-syllabus',
  },
  {
    id: 'information-systems',
    nameEn: 'Information Systems',
    nameAr: 'نظم المعلومات',
    category: 'computational',
    semesterEn: 'First Semester',
    semesterAr: 'الفصل الدراسي الأول',
    yearEn: 'First Year',
    yearAr: 'السنة الأولى',
    termTag: 'semester-1-archive',
    latticeNodeIndex: 3,
    source: 'owner-provided',
    verificationStatus: 'unverified-syllabus',
  },
  {
    id: 'islamic-theology',
    nameEn: 'Islamic Theology',
    nameAr: 'العقيدة الإسلامية',
    category: 'humanities',
    semesterEn: 'First Semester',
    semesterAr: 'الفصل الدراسي الأول',
    yearEn: 'First Year',
    yearAr: 'السنة الأولى',
    termTag: 'semester-1-archive',
    latticeNodeIndex: 4,
    source: 'owner-provided',
    verificationStatus: 'unverified-syllabus',
  },
  {
    id: 'mathematics',
    nameEn: 'Mathematics',
    nameAr: 'الرياضيات',
    category: 'mathematical',
    semesterEn: 'First Semester',
    semesterAr: 'الفصل الدراسي الأول',
    yearEn: 'First Year',
    yearAr: 'السنة الأولى',
    termTag: 'semester-1-archive',
    latticeNodeIndex: 5,
    source: 'owner-provided',
    verificationStatus: 'unverified-syllabus',
  },
  {
    id: 'probability-and-statistics',
    nameEn: 'Probability & Statistics',
    nameAr: 'الاحتمالات والإحصاء',
    category: 'mathematical',
    semesterEn: 'First Semester',
    semesterAr: 'الفصل الدراسي الأول',
    yearEn: 'First Year',
    yearAr: 'السنة الأولى',
    termTag: 'semester-1-archive',
    latticeNodeIndex: 6,
    source: 'owner-provided',
    verificationStatus: 'unverified-syllabus',
  },
];

export const LEARNING_TRACKS: LearningTrackItem[] = [
  {
    id: 'harvard-cs50x',
    titleEn: 'Harvard CS50x — Independent Study / In Progress (Foundational Computer Science).',
    titleAr: 'Harvard CS50x — دراسة مستقلة / قيد التقدم (أساسيات علوم الحاسب).',
    status: 'paused',
    statusLabelEn: 'Paused / Needs Review',
    statusLabelAr: 'متوقف مؤقتاً / يحتاج مراجعة',
    cadenceNoteEn: 'Requires concept review to regain steady pace — not completed or certified',
    cadenceNoteAr: 'يحتاج إلى مراجعة واستعادة بعض المفاهيم — غير مكتمل ولا يمثّل شهادة',
    summaryEn:
      'Completed Week 0 (Scratch problem set and quizzes) and began Week 1 C programming topics. Subsequent problem sets remain incomplete and paused while rebuilding steady pacing and reviewing earlier concepts.',
    summaryAr:
      'تم إكمال Week 0 (Scratch وحل مجموعة المسائل واجتياز الاختبارات) والبدء في موضوعات لغة C ضمن Week 1. لا تزال المهام اللاحقة غير مكتملة مع توقف مؤقت للمراجعة واستعادة الوتيرة.',
    highlightsEn: [
      'Week 0: Scratch project, problem set, and quizzes completed',
      'Week 1: Initial C programming concepts started',
      'Subsequent stages: Incomplete and pending review',
    ],
    highlightsAr: [
      'Week 0: إتمام مشروع ومسائل واختبارات Scratch',
      'Week 1: بدء دراسة أساسيات البرمجة بلغة C',
      'المراحل اللاحقة: غير مكتملة وقيد المراجعة',
    ],
    showInActiveHighlights: true,
  },
  {
    id: 'elzero-cpp',
    titleEn: 'Elzero Web School — C++ Programming Fundamentals',
    titleAr: 'أكاديمية الزيرو — تأسيس البرمجة بلغة C++',
    status: 'completed',
    statusLabelEn: 'Completed Track (Self-Paced)',
    statusLabelAr: 'مسار تعلّم مكتمل (دراسة ذاتية)',
    cadenceNoteEn: 'Completed self-paced learning track · Not an institutional certificate',
    cadenceNoteAr: 'اكتمل كمسار تعلّم ذاتي · لا يُعد شهادة أكاديمية معتمدة',
    summaryEn:
      'Completed the self-paced C++ programming fundamentals learning track covering core language syntax, flow control, functions, arrays, and introductory problem solving.',
    summaryAr:
      'إتمام المسار التعليمي الذاتي لأساسيات لغة C++ بما يشمل قواعد اللغة، والتحكم المنطقي، والدوال، والمصفوفات، وتمارين التأسيس البرمجي.',
    highlightsEn: [
      'Completed self-paced C++ syntax and structured programming curriculum',
      'Built practical comfort ahead of university algorithmic coursework',
    ],
    highlightsAr: [
      'استكمال المسار الذاتي الكامل لأساسيات لغة C++',
      'تكوين أساس عملي يدعم دراسة التفكير الخوارزمي وحل المشكلات',
    ],
    showInActiveHighlights: true,
  },
  {
    id: 'gks-u-2027',
    titleEn: 'Global Korea Scholarship — Undergraduate (GKS-U 2027)',
    titleAr: 'منحة الحكومة الكورية للدراسة الجامعية (GKS-U 2027)',
    status: 'submitted',
    statusLabelEn: 'Application Submitted',
    statusLabelAr: 'تم تقديم الطلب',
    cadenceNoteEn: 'Application submitted for 2027 intake — no selection or award claimed',
    cadenceNoteAr: 'تقتصر الحالة على تقديم الطلب — دون أي ادعاء بالقبول أو الفوز',
    summaryEn:
      'Prepared and submitted the GKS-U 2027 undergraduate scholarship application. Recorded strictly as Application Submitted.',
    summaryAr:
      'تم تجهيز وتقديم طلب الترشّح لمنحة GKS-U 2027 للدراسة الجامعية؛ الحالة الحالية موثّقة بدقة كـ «تم تقديم الطلب».',
    highlightsEn: ['Status: Application Submitted (2027 cycle)'],
    highlightsAr: ['الحالة الموثقة: تم تقديم الطلب (دورة ٢٠٢٧)'],
    showInActiveHighlights: true,
  },
  {
    id: 'korean-language-paused',
    titleEn: 'Korean Language Study',
    titleAr: 'دراسة اللغة الكورية',
    status: 'paused',
    statusLabelEn: 'Paused',
    statusLabelAr: 'متوقف مؤقتاً',
    cadenceNoteEn: 'Explicitly paused — excluded from active learning highlights',
    cadenceNoteAr: 'متوقف مؤقتاً — مستبعد من المسارات النشطة حالياً',
    summaryEn:
      'Introductory self-study of Korean language basics currently placed on hold while focusing on university coursework and computing fundamentals.',
    summaryAr:
      'بداية تعلّم ذاتي لأساسيات اللغة الكورية متوقفة مؤقتاً للتركيز على الدراسة الجامعية وأساسيات البرمجة.',
    highlightsEn: ['Paused — not an active learning focus'],
    highlightsAr: ['متوقف مؤقتاً — خارج نطاق التركيز النشط حالياً'],
    showInActiveHighlights: false,
  },
];

export const PRACTICAL_EXPERIENCE: PracticalExperienceSection = {
  sectionTitleEn: 'Administrative & Operational Data Experience',
  sectionTitleAr: 'الخبرة الإدارية والبيانات التشغيلية',
  contextSummaryEn:
    'Practical day-to-day operational record-keeping and spreadsheet coordination using Microsoft Excel across workforce logistics, daily wages, expenses, and weekly payouts — presented transparently without fabricated employer names, formal titles, dates, or KPI claims.',
  contextSummaryAr:
    'ممارسة عملية في تنظيم البيانات التشغيلية والعمل الإداري باستخدام Microsoft Excel لمتابعة شؤون العمالة والأجور والمصروفات والانتقالات والتسويات الأسبوعية — موثقة بصدق دون اختلاق أسماء شركات أو مسميات وظيفية رسمية أو مؤشرات رقمية غير مثبتة.',
  activitiesEn: [
    'Organizing workforce rosters and operational personnel data in Microsoft Excel.',
    'Preparing daily wage sheets and tracking overtime hours systematically.',
    'Logging transportation and recurring operational expenses across clean templates.',
    'Consolidating and cross-checking multi-source operational records into unified tables.',
    'Following up on weekly account settlements and payout readiness.',
    'Tracking paid versus unpaid statuses across recurring workforce schedules.',
  ],
  activitiesAr: [
    'تنظيم سجلات العمالة والبيانات التشغيلية في جداول Microsoft Excel.',
    'إعداد جداول الأجور اليومية ومتابعة ساعات العمل الإضافي بشكل منظم.',
    'تسجيل وحصر مصروفات الانتقالات والتكاليف التشغيلية المرتبطة بالعمل.',
    'تجميع وتوحيد البيانات القادمة من مصادر وسجلات متعددة في جداول مركزية.',
    'متابعة الحسابات الأسبوعية وجداول المستحقات الدورية.',
    'رصد وتحديث حالة الصرف (مدفوع / غير مدفوع) بدقة وانتظام.',
  ],
};

export const PROJECTS: ProjectItem[] = [
  {
    id: 'cpp-problem-solving',
    titleEn: 'C++ Learning & Problem-Solving Practice',
    titleAr: 'تعلّم C++ وممارسة حل المشكلات البرمجية',
    statusEn: 'Learning & Practicing',
    statusAr: 'تعلّم وممارسة مستمرة',
    statusType: 'practicing',
    visibility: 'public',
    archiveGroup: 'showcase',
    featuredOnHome: true,
    descriptionEn:
      'Hands-on practice building on foundational C++ syntax toward core data structures, algorithmic decomposition, and clean memory mental models.',
    descriptionAr:
      'ممارسة عملية تنطلق من أساسيات لغة C++ نحو هياكل البيانات الأساسية، والتحليل الخوارزمي، وبناء تصور واضح لإدارة الذاكرة وتدفق التنفيذ.',
    roleEn: 'Independent foundational practice complementing Elzero C++ & faculty coursework',
    roleAr: 'ممارسة تأسيسية مستقلة مكملة لمسار C++ والدراسة الجامعية',
    problemEn:
      'Developing fluency in pointers, references, complexity reasoning, and problem decomposition from first principles.',
    problemAr:
      'تنمية الطلاقة البرمجية في المؤشرات والمراجع وتحليل التعقيد وتفكيك المسائل الخوارزمية من المبادئ الأولى.',
    approachEn:
      'Translating algorithmic problems into structured modern C++ implementations with standard containers and explicit control flow.',
    approachAr:
      'تحويل المسائل الخوارزمية إلى حلول منظمة بلغة C++ الحديثة باستخدام حاويات المكتبة القياسية والتحكم المنطقي الواضح.',
    outcomeEn: 'Ongoing active learning & practice track supporting Semester coursework.',
    outcomeAr: 'مسار تعلّم وتطبيق مستمر يدعم مقررات علوم الحاسب والخوارزميات.',
    technologies: ['C++', 'Data Structures', 'Algorithms', 'Problem Solving'],
    fullOverviewEn: [
      'Built on completed self-paced C++ fundamentals (Elzero Web School).',
      'Focusing on pointers, references, array/string manipulation, and standard library algorithms.',
      'Structured problem-solving exercises reinforcing mathematical logic and time complexity analysis.',
    ],
    fullOverviewAr: [
      'يستند إلى إتمام مسار تأسيس لغة C++ (أكاديمية الزيرو).',
      'يركز على المؤشرات والمراجع والتعامل مع المصفوفات والسلاسل وخوارزميات المكتبة القياسية.',
      'تمارين منظمة لحل المشكلات لدعم المنطق الرياضي وتحليل كفاءة الخوارزميات.',
    ],
  },
  {
    id: 'kalmeron-two',
    titleEn: 'Kalmeron-Two (Experimental Architecture Prototype)',
    titleAr: 'Kalmeron-Two (نموذج معماري تجريبي)',
    statusEn: 'Experimental · Stopped Pre-Production',
    statusAr: 'تجريبي · متوقف قبل التشغيل الإنتاجي',
    statusType: 'experimental',
    visibility: 'public',
    archiveGroup: 'experiments_discontinued',
    featuredOnHome: false,
    repoUrl: 'https://github.com/dahaliztupe-sketch/Kalmeron-Two',
    descriptionEn:
      'AI-assisted experimental startup-operations platform prototype exploring a Next.js workspace UI, LangGraph orchestration, FastAPI sidecars, and a local DuckDB/dbt analytical pipeline. Paused pre-production with zero live SaaS deployment, billing, or active users.',
    descriptionAr:
      'نموذج تجريبي مُطوَّر بمساعدة أدوات الذكاء الاصطناعي لاستكشاف منصة تشغيلية تضم واجهة Next.js، ومنسق LangGraph، وخدمات FastAPI، ومخزن بيانات محلي بـ DuckDB وdbt. المشروع متوقف قبل الإطلاق الإنتاجي دون مستخدمين فعليين أو تشغيل تجاري.',
    roleEn: 'AI-assisted exploratory prototype architect (paused pre-launch experiment)',
    roleAr: 'تجربة تصميم وبناء أولي بمساعدة الذكاء الاصطناعي (متوقفة قبل الإطلاق)',
    problemEn:
      'Exploring how multi-step agent orchestration, telemetry pipelines, and approval workflows could coordinate inside a single modular monorepo.',
    problemAr:
      'استكشاف كيفية تنسيق مسارات الوكلاء متعددة الخطوات وخطوط البيانات وسير الموافقات ضمن بنية مستودع أحادي.',
    approachEn:
      'Assembled an exploratory multi-service repository combining Next.js 16 / React 19 UI primitives, Python FastAPI / LangGraph sidecar stubs, and local DuckDB/dbt transforms.',
    approachAr:
      'تجميع بنية تجريبية متعددة الخدمات تشمل واجهات Next.js 16 وReact 19، وخدمات Python FastAPI وLangGraph تجريبية، وتحويلات DuckDB/dbt محلية.',
    outcomeEn:
      'Preserved openly on GitHub strictly as an archived technical experiment; commercial billing, production infrastructure, and external deployments remain unlaunched.',
    outcomeAr:
      'محفوظ كمستودع مفتوح لتجربة تقنية غير مطروحة تجارياً، مع بقاء الإطلاق السحابي والفوترة والتشغيل الفعلي غير مفعّلة.',
    technologies: ['Next.js', 'React', 'TypeScript', 'Python', 'FastAPI', 'LangGraph', 'DuckDB'],
    fullOverviewEn: [
      'Contains an exploratory Next.js 16 / React 19 workspace layout paired with Python FastAPI and LangGraph orchestration modules.',
      'Includes local analytical pipeline experimentation with DuckDB and dbt without live external production data.',
      'Explicitly paused prior to commercial readiness—presented here strictly as an experimental engineering exploration rather than a live SaaS product.',
    ],
    fullOverviewAr: [
      'يضم واجهة تجريبية مبنية على Next.js 16 وReact 19 مرتبطة بوحدات تجريبية عبر Python FastAPI وLangGraph.',
      'يتضمن تجربة لمسار بيانات محلي باستخدام DuckDB وdbt دون الاعتماد على بيانات عملاء حقيقية.',
      'متوقف قبل الجاهزية الإنتاجية، ويُعرض هنا بشفافية بوصفه تجربة استكشافية لا منتجاً تجارياً قائماً.',
    ],
  },
  {
    id: 'sanad',
    titleEn: 'Sanad (Archived Experiment)',
    titleAr: 'سند — Sanad (تجربة سابقة متوقفة)',
    statusEn: 'Discontinued',
    statusAr: 'تجربة متوقفة',
    statusType: 'discontinued',
    visibility: 'public',
    archiveGroup: 'experiments_discontinued',
    featuredOnHome: false,
    descriptionEn:
      'Early exploratory digital initiative (Sanad) archived under discontinued experiments. Maintained transparently in the archive without claims of active deployment or production outcomes.',
    descriptionAr:
      'مبادرة وتجربة رقمية سابقة (سند) مدرجة ضمن أرشيف التجارب المتوقفة، تُوثّق بشفافية كمحاولة استكشافية سابقة دون ادعاء استمرارها أو إطلاقها.',
    roleEn: 'Early exploratory ideation & prototyping (Discontinued)',
    roleAr: 'استكشاف وفكرة أولية سابقة (متوقفة)',
    outcomeEn: 'Discontinued; preserved strictly as part of chronological exploration history.',
    outcomeAr: 'توقّف العمل عليها، ومحفوظة فقط ضمن السجل التاريخي للتجارب.',
    technologies: ['Digital Exploration', 'Archived Concept'],
    fullOverviewEn: [
      'Archived exploratory venture idea preserved to keep the portfolio chronologically honest.',
      'No active codebase deployment or operational service is claimed.',
    ],
    fullOverviewAr: [
      'تجربة استكشافية سابقة محفوظة في الأرشيف لضمان المصداقية التاريخية لمحفظة الأعمال.',
      'لا توجد أي خدمة تشغيلية قائمة أو ادعاءات إنتاجية مرتبطة بها حالياً.',
    ],
  },
  {
    id: 'ruwadverse',
    titleEn: 'Ruwadverse (Archived Experiment)',
    titleAr: 'Ruwadverse (تجربة سابقة متوقفة)',
    statusEn: 'Discontinued',
    statusAr: 'تجربة متوقفة',
    statusType: 'discontinued',
    visibility: 'public',
    archiveGroup: 'experiments_discontinued',
    featuredOnHome: false,
    descriptionEn:
      'Past exploratory venture concept (Ruwadverse) that has been discontinued and separated into the experiments archive without invented scope or traction claims.',
    descriptionAr:
      'تصور وتجربة رقمية سابقة (Ruwadverse) متوقفة حالياً ومفصولة ضمن أرشيف التجارب دون اختلاق تفاصيل تقنية أو نتائج تشغيلية.',
    roleEn: 'Early experimental concept exploration (Discontinued)',
    roleAr: 'استكشاف مبكر لفكرة مشروع رقمي (متوقف)',
    outcomeEn: 'Discontinued prior to sustained engineering development.',
    outcomeAr: 'توقفت التجربة قبل الانتقال إلى مرحلة بناء مستدامة.',
    technologies: ['Concept Exploration', 'Archived Venture'],
    fullOverviewEn: [
      'Previous exploratory project concept recorded transparently as discontinued.',
      'Separated cleanly from active academic and software study work.',
    ],
    fullOverviewAr: [
      'تصور سابق لمشروع تجريبي موثّق بشفافية تحت بند التجارب المتوقفة.',
      'مفصول بوضوح عن المسار الأكاديمي والتدريب البرمجي الحالي.',
    ],
  },
  {
    id: 'smartlifeai',
    titleEn: 'SmartLifeAI (Archived Experiment)',
    titleAr: 'SmartLifeAI (تجربة سابقة متوقفة)',
    statusEn: 'Discontinued',
    statusAr: 'تجربة متوقفة',
    statusType: 'discontinued',
    visibility: 'public',
    archiveGroup: 'experiments_discontinued',
    featuredOnHome: false,
    descriptionEn:
      'Early AI-themed experimental concept exploration (SmartLifeAI), archived under discontinued trials to separate exploratory curiosity from active work.',
    descriptionAr:
      'تجربة استكشافية مبكرة مرتبطة بفكرة تطبيق ذكاء اصطناعي (SmartLifeAI)، محفوظة في أرشيف التجارب المتوقفة لتمييز المحاولات الأولية عن الأعمال الحالية.',
    roleEn: 'Initial concept exploration (Discontinued)',
    roleAr: 'تجربة فكرة أولية (متوقفة)',
    outcomeEn: 'Discontinued exploratory concept; no active product or repository.',
    outcomeAr: 'محاولة استكشافية متوقفة دون منتج فعلي أو مستودع مستمر.',
    technologies: ['AI Exploration', 'Archived Concept'],
    fullOverviewEn: [
      'Archived AI concept trial documented plainly without overstated capabilities.',
    ],
    fullOverviewAr: [
      'تجربة استكشافية سابقة موثقة ببساطة ودون أي تضخيم تقني.',
    ],
  },
  {
    id: 'wanasbrand',
    titleEn: 'WANASBRAND (Experimental Project — Needs Confirmation)',
    titleAr: 'WANASBRAND (مشروع تجريبي — بانتظار التحقق والتوثيق)',
    statusEn: 'Needs Confirmation',
    statusAr: 'قيد المراجعة والتحقق',
    statusType: 'needs_confirmation',
    visibility: 'public',
    archiveGroup: 'experiments_discontinued',
    featuredOnHome: false,
    descriptionEn:
      'An earlier experimental project worked on with AI tools. Kept outside main home highlights while exact technical scope, role details, and status remain Pending Confirmation.',
    descriptionAr:
      'مشروع تجريبي سابق جرى العمل عليه بمساعدة أدوات الذكاء الاصطناعي. يُحفظ في الأرشيف بعيداً عن المشاريع الرئيسية وتُترك تفاصيل طبيعته ودوره التقني في حالة «قيد المراجعة والتحقق» لحين مراجعة مصادره.',
    roleEn: 'Experimental collaboration with AI assistance — exact role and scope: Needs Confirmation',
    roleAr: 'تجربة عمل بمساعدة أدوات الذكاء الاصطناعي — تفاصيل الدور والمساهمة: قيد التحقق',
    outcomeEn: 'Needs Confirmation — zero unverified product, commercial, or technical claims made.',
    outcomeAr: 'بانتظار التأكيد — دون تقديم أي ادعاءات حول منتج تجاري مكتمل أو تقنيات غير مراجعة.',
    technologies: ['Archived Experiment', 'Needs Confirmation'],
    fullOverviewEn: [
      'Earlier experimental project prepared with AI-assisted tooling.',
      'Status and exact scope of personal technical contribution are marked Needs Confirmation until original source files are audited.',
      'Not presented as an active startup, commercial product, or featured showcase item.',
    ],
    fullOverviewAr: [
      'مشروع تجريبي سابق أُعد بمساعدة أدوات الذكاء الاصطناعي.',
      'حالة المشروع وتفاصيل المساهمة التقنية الدقيقة مُعلّمة كـ «قيد المراجعة والتحقق» لحين مراجعة مصادره الأصلية.',
      'لا يُقدّم كشركة قائمة أو منتج تجاري مكتمل ولا يُعرض في الواجهة الرئيسية.',
    ],
  },
  {
    id: 'local-ai-agent',
    titleEn: 'Local AI Agent (Internal Owner Archive)',
    titleAr: 'وكيل ذكاء اصطناعي محلي (أرشيف داخلي خاص)',
    statusEn: 'Discontinued · Internal Archive',
    statusAr: 'متوقف · أرشيف داخلي',
    statusType: 'discontinued',
    visibility: 'internal_archive',
    archiveGroup: 'experiments_discontinued',
    featuredOnHome: false,
    descriptionEn:
      'Earlier local reasoning-loop trial moved to private internal archive so public pages strictly present confirmed, active, and verified portfolio history.',
    descriptionAr:
      'تجربة أولية سابقة نُقلت إلى الأرشيف الداخلي الخاص بالمالك لتقتصر الصفحات العامة على السجل المؤكد والواضح.',
    technologies: ['Internal Archive'],
    fullOverviewEn: [
      'Retained solely in owner internal_archive storage (invisible to public visitors and queries).',
    ],
    fullOverviewAr: [
      'محفوظ في الأرشيف الداخلي الخاص بالمالك فقط ولا يظهر للزوار العامين.',
    ],
  },
];

export const SOCIAL_LINKS: SocialLink[] = [
  {
    platform: 'GitHub',
    url: 'https://github.com/dahaliztupe-sketch',
    labelEn: 'GitHub Profile',
    labelAr: 'حساب غيت هَب',
    isAvailable: true,
  },
  {
    platform: 'LinkedIn',
    url: 'https://www.linkedin.com/in/abdalrahman-mostafa-/',
    labelEn: 'LinkedIn Profile',
    labelAr: 'الملف الشخصي على لينكد إن',
    isAvailable: true,
  },
];

export const INITIAL_MILESTONES: MilestoneItem[] = [
  {
    id: 'early-self-learning-age-12',
    titleEn: 'Early Self-Learning Curiosity (~Since Age 12)',
    titleAr: 'بداية رحلة التعلّم الذاتي والتجريب التقني (~منذ سن ١٢ عاماً)',
    dateEn: 'Foundational Background (~Age 12)',
    dateAr: 'خلفية مبكرة (~منذ سن ١٢)',
    category: 'technical',
    descriptionEn:
      'Developed an early habit of self-directed technical curiosity, reading, and experimenting with digital tools independently prior to university admission.',
    descriptionAr:
      'بداية الاعتماد على التعلّم الذاتي والاستكشاف الرقمي وتجربة الأدوات التقنية قبل الالتحاق بالدراسة الجامعية.',
    publicationStatus: 'published',
  },
  {
    id: 'elzero-cpp-fundamentals-track',
    titleEn: 'Elzero Web School — C++ Programming Fundamentals Track Completed',
    titleAr: 'أكاديمية الزيرو — إتمام مسار تأسيس البرمجة بلغة C++',
    dateEn: 'Completed Learning Track',
    dateAr: 'مسار تعلّم مكتمل',
    category: 'technical',
    descriptionEn:
      'Completed the self-paced C++ programming fundamentals curriculum covering language syntax, control flow, functions, and arrays (documented as a completed learning track, not a formal certificate).',
    descriptionAr:
      'استكمال المسار التعليمي الذاتي لأساسيات لغة C++ بما يشمل القواعد والتحكم المنطقي والدوال والمصفوفات (كمسار تعلّم ذاتي مكتمل وليس شهادة رسمية).',
    publicationStatus: 'published',
  },
  {
    id: 'al-azhar-intelligent-computing-entry',
    titleEn: 'Enrolled in Intelligent Computing — Faculty of Science, Al-Azhar University',
    titleAr: 'الالتحاق بقسم الحوسبة الذكية — كلية العلوم، جامعة الأزهر',
    dateEn: 'First Year',
    dateAr: 'السنة الأولى',
    category: 'academic',
    descriptionEn:
      'Began first-year university studies in Intelligent Computing, completing the 7 foundational Semester 1 subjects and continuing active academic study.',
    descriptionAr:
      'بدء الدراسة الجامعية في الفرقة الأولى بقسم الحوسبة الذكية، مع توثيق مقررات الفصل الدراسي الأول السبعة ومواصلة التدرّج الأكاديمي.',
    publicationStatus: 'published',
  },
  {
    id: 'gks-u-2027-application-submitted',
    titleEn: 'Global Korea Scholarship (GKS-U 2027) — Application Submitted',
    titleAr: 'منحة الحكومة الكورية (GKS-U 2027) — تم تقديم الطلب',
    dateEn: '2027 Intake Cycle',
    dateAr: 'دورة ٢٠٢٧',
    category: 'academic',
    descriptionEn:
      'Submitted an undergraduate scholarship application for the GKS-U 2027 cycle (strictly documented as Application Submitted).',
    descriptionAr:
      'تقديم طلب الترشح للدراسة الجامعية ضمن منحة GKS-U 2027 (الحالة الموثقة: تم تقديم الطلب فقط).',
    publicationStatus: 'published',
  },
];
