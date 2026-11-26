import {
  CourseItem,
  ProjectItem,
  SocialLink,
  MilestoneItem,
  AcademicProgramInfo,
  LearningTrackItem,
  PracticalExperienceSection,
  SkillItem,
  KnowledgeCategoryItem,
  LearningNoteRecord,
} from '../types';

export const OWNER_INFO = {
  nameEn: 'Abdalrahman Mostafa',
  nameAr: 'عبد الرحمن مصطفى',
  titleEn: 'First-Year Intelligent Computing Student',
  titleAr: 'طالب بالسنة الأولى · قسم الحوسبة الذكية',
  locationEn: 'Cairo, Egypt',
  locationAr: 'القاهرة، مصر',
  universityEn: 'Al-Azhar University, Cairo',
  universityAr: 'جامعة الأزهر، القاهرة',
  facultyEn: 'Faculty of Science, Al-Azhar University',
  facultyAr: 'كلية العلوم، جامعة الأزهر',
  departmentEn: 'Intelligent Computing / Computer Science',
  departmentAr: 'قسم الحوسبة الذكية / علوم الحاسب',
  academicYearEn: 'First Year',
  academicYearAr: 'السنة الأولى',
  currentSemesterEn: 'Current Academic Studies',
  currentSemesterAr: 'الدراسة الجامعية الحالية',
  semesterEn: 'First Year · Faculty of Science, Al-Azhar University, Cairo',
  semesterAr: 'السنة الأولى · كلية العلوم، جامعة الأزهر، القاهرة',
  bioEn:
    'First-year Intelligent Computing / Computer Science student at Al-Azhar University in Cairo, Egypt. Self-learning programming since around age 12 through experimentation, independent research, and practical projects while building a rigorous technical foundation before specializing deeply.',
  bioAr:
    'طالب بالسنة الأولى في مسار الحوسبة الذكية وعلوم الحاسب بجامعة الأزهر في القاهرة، مصر. بدأت رحلة التعلّم الذاتي في البرمجة منذ نحو الثانية عشرة من عمري عبر التجريب والبحث المستقل وبناء مشاريع عملية، مع التركيز على ترسيخ أساس تقني متين قبل التخصص الدقيق.',
  backgroundEn:
    'My path into computing began around age 12 with independent self-study—exploring how software works by reading, testing ideas directly, and building small experiments. Today, alongside first-year university studies at Al-Azhar University, I prioritize understanding fundamentals first: problem solving in C++, algorithmic reasoning, systems architecture, and early explorations in artificial intelligence and local AI systems.',
  backgroundAr:
    'بدأت علاقتي بالبرمجة وعلوم الحاسب منذ قرابة سن الثانية عشرة عبر التعلّم الذاتي والاستكشاف العملي، انطلاقاً من قناعة بأن الفهم الحقيقي يُبنى بالتجربة والبحث المستقل والتطبيق. واليوم، إلى جانب سنتي الأولى في جامعة الأزهر، أضع أولوية واضحة لبناء أساس علمي وهندسي رصين قبل التخصص الدقيق.',
  currentFocusEn:
    'First-year Al-Azhar Intelligent Computing studies, C++ problem solving, CS50x: Week 3, learning Python now, and building Neural Atlas',
  currentFocusAr:
    'الدراسة الجامعية في السنة الأولى بقسم الحوسبة الذكية، وممارسة حل المشكلات بلغة C++، ومتابعة CS50x: Week 3، وتعلّم Python حالياً، وتطوير Neural Atlas',
  futureFocusEn:
    'Strengthening algorithms, mathematics, C++, and Python toward artificial intelligence and systems engineering',
  futureFocusAr:
    'ترسيخ الخوارزميات والرياضيات والتعمق في C++ وبايثون نحو أنظمة الذكاء الاصطناعي',
};

export const SKILLS_CATALOG: SkillItem[] = [
  {
    id: 'skill-cpp',
    nameEn: 'C++',
    nameAr: 'لغة C++',
    domain: 'programming',
    tier: 'practiced',
    contextEn: 'Completed the Elzero Web School C++ track and practicing structured problem solving.',
    contextAr: 'إتمام مسار التأسيس الذاتي ومواصلة الممارسة العملية في التفكير الخوارزمي وحل المشكلات.',
  },
  {
    id: 'skill-programming-fundamentals',
    nameEn: 'Programming Fundamentals',
    nameAr: 'أساسيات البرمجة',
    domain: 'programming',
    tier: 'practiced',
    contextEn: 'Control flow, functions, arrays, modularity, and introductory memory mental models.',
    contextAr: 'التحكم المنطقي، والدوال، والمصفوفات، وبناء البرامج المنظمة وفهم الذاكرة.',
  },
  {
    id: 'skill-python',
    nameEn: 'Python — Learning Now',
    nameAr: 'لغة Python — قيد التعلّم حالياً',
    domain: 'programming',
    tier: 'learning',
    contextEn: 'Currently learning Python alongside first-year university coursework to build scripting and AI foundations — without claiming mastery yet.',
    contextAr: 'أتعلّم لغة Python حالياً بالتوازي مع السنة الأولى الجامعية لبناء أساس السكربتات والذكاء الاصطناعي — دون ادعاء الاحتراف بعد.',
  },
  {
    id: 'skill-algorithms-ps',
    nameEn: 'Algorithms and Problem Solving — Developing',
    nameAr: 'الخوارزميات وحل المشكلات — قيد التطوير',
    domain: 'programming',
    tier: 'learning',
    contextEn: 'Building problem decomposition and complexity reasoning skills alongside university coursework and CS50x.',
    contextAr: 'تنمية مهارات تفكيك المشكلات وتحليل التعقيد الخوارزمي بالتوازي مع الدراسة الأكاديمية وCS50x.',
  },
  {
    id: 'interest-software-dev',
    nameEn: 'Software Development',
    nameAr: 'تطوير البرمجيات',
    domain: 'technical_interest',
    tier: 'practiced',
    contextEn: 'Designing, directing, and maintaining structured bilingual web architectures like Neural Atlas.',
    contextAr: 'تصميم وتوجيه وبناء تطبيقات ومواقع منظمة ثنائية اللغة مثل منصة Neural Atlas.',
  },
  {
    id: 'interest-ai',
    nameEn: 'Artificial Intelligence',
    nameAr: 'الذكاء الاصطناعي',
    domain: 'technical_interest',
    tier: 'learning',
    contextEn: 'Studying introductory AI foundations academically and practicing disciplined collaboration with AI tools.',
    contextAr: 'دراسة أسس الذكاء الاصطناعي أكاديمياً بالتوازي مع إتقان التوجيه الواعي لأدوات الذكاء الاصطناعي.',
  },
  {
    id: 'interest-intelligent-computing',
    nameEn: 'Intelligent Computing',
    nameAr: 'الحوسبة الذكية',
    domain: 'technical_interest',
    tier: 'learning',
    contextEn: 'Core Al-Azhar University academic track combining mathematics, systems, and intelligence.',
    contextAr: 'التخصص الجامعي الأساسي الذي يجمع بين الرياضيات وعلوم الحاسب وأنظمة الذكاء.',
  },
  {
    id: 'interest-computer-science',
    nameEn: 'Computer Science',
    nameAr: 'علوم الحاسب',
    domain: 'technical_interest',
    tier: 'learning',
    contextEn: 'Building broad foundations across computer architecture, information systems, and computation before specializing.',
    contextAr: 'ترسيخ الفهم العام في معمارية الحاسب ونظم المعلومات وعلوم الحساب قبل التخصص الدقيق.',
  },
  {
    id: 'interest-local-ai',
    nameEn: 'Local AI Systems',
    nameAr: 'أنظمة الذكاء الاصطناعي المحلية',
    domain: 'technical_interest',
    tier: 'exploring',
    contextEn: 'Conceptually interested in local-first workflows and offline constraints following earlier discontinued experiments.',
    contextAr: 'اهتمام مفهومي بفهم حدود التشغيل المحلي والخصوصية انطلاقاً من دروس تجارب سابقة متوقفة.',
  },
];

export const KNOWLEDGE_CATEGORIES: KnowledgeCategoryItem[] = [
  {
    id: 'cat-programming',
    titleEn: 'Programming',
    titleAr: 'البرمجة',
    descriptionEn: 'Notes on C++ syntax vs. actual coding, building mental habits, and learning new languages deliberately.',
    descriptionAr: 'مذكرات حول تعلّم لغات البرمجة مثل C++، والفرق بين معرفة القواعد والقدرة على البناء الفعلي.',
    topicMatchKey: 'Programming',
  },
  {
    id: 'cat-computer-science',
    titleEn: 'Computer Science',
    titleAr: 'علوم الحاسب',
    descriptionEn: 'Why broad foundations in architecture, logic, and systems matter more than chasing shortcuts early.',
    descriptionAr: 'تأملات حول أساسيات علوم الحاسب، ولماذا يسبق الفهم الشامل مرحلة التخصص الدقيق.',
    topicMatchKey: 'Computer Science',
  },
  {
    id: 'cat-artificial-intelligence',
    titleEn: 'Artificial Intelligence',
    titleAr: 'الذكاء الاصطناعي',
    descriptionEn: 'Practical reflections on collaborating with AI tools, thinking in clear requirements, and verifying outputs.',
    descriptionAr: 'ملاحظات عملية حول العمل مع أدوات الذكاء الاصطناعي، وضبط التوجيه، ومراجعة المخرجات.',
    topicMatchKey: 'Artificial Intelligence',
  },
  {
    id: 'cat-problem-solving',
    titleEn: 'Problem Solving',
    titleAr: 'حل المشكلات',
    descriptionEn: 'Breaking down problems on paper first, spotting edge cases, and resisting the urge to rush to code.',
    descriptionAr: 'تفكيك المسائل قبل كتابة الكود، وتتبع الحالات الحدية، وبناء التفكير المنطقي المنظم.',
    topicMatchKey: 'Problem Solving',
  },
  {
    id: 'cat-university-studies',
    titleEn: 'University Studies',
    titleAr: 'الدراسة الجامعية',
    descriptionEn: 'Dedicated space for verified reflections and study takeaways from Al-Azhar Intelligent Computing courses as they are written.',
    descriptionAr: 'مساحة مخصصة للملاحظات والتأملات الموثقة من مقررات الحوسبة الذكية بجامعة الأزهر عند كتابتها.',
    topicMatchKey: 'University Studies',
  },
  {
    id: 'cat-learning-journey',
    titleEn: 'Learning Journey',
    titleAr: 'رحلة التعلّم',
    descriptionEn: 'Honest checkpoints from independent self-study since ~age 12, CS50x pacing, and adjusting expectations.',
    descriptionAr: 'محطات صادقة من رحلة التعلّم الذاتي منذ نحو سن ١٢، ومتابعة CS50x دون تسرّع.',
    topicMatchKey: 'Learning Journey',
  },
  {
    id: 'cat-business-technology',
    titleEn: 'Business & Technology',
    titleAr: 'الأعمال والتقنية',
    descriptionEn: 'Exploring how code connects with real operations, business thinking, marketing, and human usefulness.',
    descriptionAr: 'استكشاف العلاقة بين التقنية والتشغيل الفعلي وإدارة الأعمال والتسويق وخلق قيمة حقيقية.',
    topicMatchKey: 'Business & Technology',
  },
  {
    id: 'cat-personal-insights',
    titleEn: 'Personal Insights',
    titleAr: 'رؤى وتأملات شخصية',
    descriptionEn: 'Lessons on why writing helps thinking, organizing ideas cleanly, and staying honest about gaps.',
    descriptionAr: 'تأملات شخصية حول أهمية التدوين والتوثيق في كشف الفهم الحقيقي وتنظيم الأفكار.',
    topicMatchKey: 'Personal Insights',
  },
  {
    id: 'cat-experiments',
    titleEn: 'Experiments',
    titleAr: 'التجارب البرمجية',
    descriptionEn: 'What breaks, what gets discontinued, and the gap between making something work once and truly understanding it.',
    descriptionAr: 'قراءة صريحة لما تعلّمته من التجارب المتوقفة، والفارق بين تشغيل الفكرة وفهمها من الداخل.',
    topicMatchKey: 'Experiments',
  },
];

export const INITIAL_LEARNING_NOTES: LearningNoteRecord[] = [
  {
    id: 'finishing-cpp-course-doesnt-mean-you-know-everything',
    slug: 'finishing-cpp-course-doesnt-mean-you-know-everything',
    titleEn: "Finishing a C++ Course Doesn't Mean You Know Everything",
    titleAr: 'إتمام مسار C++ لا يعني أنك أصبحت تعرف كل شيء',
    summaryEn:
      'What happened right after I finished the Elzero C++ fundamentals track, felt overly confident for about ten minutes, and got humbled by my first blank problem.',
    summaryAr:
      'ما حدث مباشرةً بعد إنهائي مسار تأسيس C++ في أكاديمية الزيرو؛ شعرت لوهلة أنني قطعت الشوط كله، ثم أعادتني أول مسألة فارغة إلى أرض الواقع.',
    contentEn: `I finished learning C++ through the Elzero track, and for a brief moment I caught myself thinking: *Well, I guess I know C++ now.*

Then I opened a blank problem-solving exercise without a video guiding my hands, and sat there staring at the blinking cursor for twenty minutes.

Funny how programming has a built-in ego check.

## Knowing the Grammar vs. Speaking the Language

Understanding \`for\` loops, \`if\` conditions, arrays, and functions feels huge when you first learn them—and honestly, it *is* a real step. Compared to looking at C++ syntax like alien symbols, being able to read code cleanly is liberating.

The catch is that syntax is only the alphabet. Knowing what a semicolon and a \`while\` loop do does not tell you *what* to put inside the loop when nobody wrote the plan for you.

Think about learning chess. Memorizing how the knight jumps and how the bishop slides takes an afternoon. Knowing what move actually saves your position twenty turns later is a completely different game.

\`\`\`cpp
// Easy to read after a syntax course:
for (int i = 0; i < n; i++) {
    // Harder part: deciding *what* invariant must stay true on every step
}
\`\`\`

## Where I Actually Got Stuck

When watching lessons, every example fits together because someone already carved the problem into neat five-minute pieces:

1. They define the problem clearly.
2. They pick the exact variables needed.
3. They walk straight to the clean solution without dead ends.

Real problems don't show up pre-sliced like that. I found myself writing loops before I even knew what the loop was supposed to guarantee when it finished. Halfway through, I'd add another counter, patch an edge case with an awkward \`if (i == 0)\`, and wonder why everything looked messy.

## What Changed My Perspective

Nothing magical fixed this overnight. What helped was admitting that finishing a fundamentals track is the *starting line*, not the finish line:

- Treating C++ syntax as a tool I already unpacked, not proof that I'm an expert.
- Spending time solving small problems where no instructor tells me which data structure to reach for.
- Accepting that feeling stuck on a "simple" loop is completely normal—and usually points to a gap in how I understood the question, not the language.

Right now, I'd rather solve twenty modest problems slowly and understand every step than collect another playlist certificate in my head. C++ gave me a solid floor to stand on; problem solving is what teaches me how to move across it.`,
    contentAr: `أنهيت مسار تأسيس C++ مع أكاديمية الزيرو، ولحظة انتهاء آخر درس تسلّل إليّ إحساس لطيف ومغرور قليلاً: *«جميل، أظن أنني أصبحت أعرف C++ الآن.»*

ثم فتحت مسألة برمجية فارغة دون فيديو يشرح لي الخطوة التالية، وجلست أحدّق في مؤشر الكتابة قرابة عشرين دقيقة دون أن أكتب سطراً واحداً مقنعاً.

لطيف كيف تمتلك البرمجة طريقتها السريعة في إرجاعك إلى حجمك الطبيعي.

## حفظ القواعد غير امتلاك القدرة على التعبير

فهم الـ \`for\` loop والشروط والدوال والمصفوفات خطوة حقيقية ومهمة، ولا أقلل منها أبداً؛ الانتقال من رؤية الكود كرموز غريبة إلى قراءته وفهمه شعور رائع.

لكن الفخ أن القواعد مجرد «أبجدية». معرفتك بكيفية كتابة حلقة تكرار لا تخبرك تلقائياً *ما الذي يجب أن تتكرر عليه* عندما تكون أمام مشكلة حقيقية لم يرتّبها أحد لك مسبقاً.

الأمر يشبه الشطرنج إلى حد كبير: يمكنك تعلم حركة الحصان والفيل والقلعة في جلسة واحدة، لكن عندما تبدأ مباراة حقيقية تكتشف أن معرفة الحركة القانونية شيء، واختيار النقلة التي تنقذ وضعك بعد عشر خطوات شيء آخر تماماً.

\`\`\`cpp
// كتابة الحلقة سهلة بعد دراسة الأساسيات:
for (int i = 0; i < n; i++) {
    // الجزء الأصعب: ما الحقيقة التي يجب أن تبقى صحيحة في كل خطوة؟
}
\`\`\`

## أين كنت أتوقف فعلاً؟

أثناء متابعة الشروحات، تبدو كل فكرة سلسة لأن المعلّم قد فكّك المشكلة مسبقاً:

1. حدّد المطلوب بدقة.
2. اختار المتغيرات المناسبة من البداية.
3. سار في طريق مستقيم نحو الحل دون التيه في طرق مسدودة.

أما في الواقع، فالمسائل لا تأتي مقطّعة وجاهزة. كنت أبدأ بكتابة الحلقات قبل أن أستوعب أصلاً ما الذي أريد إثباته أو حسابه، ثم أضطر في منتصف الطريق لإضافة عدّاد جديد وشرط ترقيعي \`if (i == 0)\` لأغطي حالة لم أنتبه لها.

## ما الذي تغيّر في نظرتي؟

لم يحدث تحوّل سحري في ليلة واحدة، لكن الاعتراف البسيط بأن إتمام مسار الأساسيات هو **نقطة البداية** لا النهاية غيّر طريقتي في التعلّم:

- صرت أنظر لقواعد C++ على أنها الأدوات التي أخرجتها من الصندوق، لا الدليل على الخبرة.
- أعطيت أولوية لحل مسائل صغيرة بنفسي دون أن يلمّح لي أحد بالحل مسبقاً.
- تقبّلت أن التوقف والتفكير أمام مسألة تبدو «بسيطة» أمر طبيعي، وغالباً ما يكشف ثغرة في فهمي للمسألة نفسها لا في اللغة.

في هذه المرحلة، أفضل أن أحل عشرين مسألة متواضعة ببطء وأفهم تفاصيلها كاملة، على أن أراكم أسماء مسارات جديدة فقط. لغة C++ أعطتني أرضية صلبة؛ وحل المشكلات هو ما يعلّمني كيف أتحرك فوقها.`,
    topicLabels: ['Programming', 'C++', 'Elzero Track', 'Foundations'],
    publicationStatus: 'published',
    seoTitleEn: "Finishing a C++ Course Doesn't Mean You Know Everything · Neural Atlas",
    seoTitleAr: 'إتمام مسار C++ لا يعني أنك أصبحت تعرف كل شيء · أطلس الشبكات العصبية',
    seoDescriptionEn:
      'Personal reflection on the gap between learning C++ syntax and actually solving problems independently.',
    seoDescriptionAr:
      'تأمل شخصي في الفارق بين حفظ قواعد لغة C++ والقدرة الفعلية على تفكيك المشكلات وحلها.',
    createdAt: '2026-10-08T14:20:00.000Z',
    updatedAt: '2026-11-02T10:15:00.000Z',
    publishedAt: '2026-10-08T16:00:00.000Z',
  },
  {
    id: 'understanding-the-problem-before-writing-code',
    slug: 'understanding-the-problem-before-writing-code',
    titleEn: 'Understanding the Problem Before Writing Code',
    titleAr: 'فهم المشكلة قبل كتابة أول سطر كود',
    summaryEn:
      'Why jumping straight to the keyboard creates three new bugs for every line I fix—and the small paper habit that actually slows me down in a good way.',
    summaryAr:
      'لماذا يؤدي التسرع إلى لوحة المفاتيح إلى ولادة ثلاثة أخطاء مقابل كل سطر أصلحه، وما العادة البسيطة على الورق التي توفر وقتي فعلاً.',
    contentEn: `My worst coding habit is also the fastest one: reading two sentences of a problem and reaching for the keyboard within ten seconds.

It feels productive because fingers are moving and characters are appearing on screen. Twenty minutes later, I have forty lines of C++, three nested conditions I barely trust, and a failing test case that exposes I solved a slightly different problem than the one actually asked.

## The Messy Desk Analogy

Trying to code before understanding the problem is like trying to organize a cluttered desk by immediately shoving items into drawers before checking what actually needs to stay out. You create movement, not order—and five minutes later you have to pull everything back out to find your notebook.

Code behaves the same way. If the mental picture of the problem is fuzzy, the code becomes a physical copy of that fuzziness.

## What Actually Causes Most of My Early Bugs

When I trace back why a small solution broke, it is rarely a weird compiler quirk. Almost always, it is one of three things:

- I assumed the input was strictly positive or sorted without checking.
- I mixed up \`0\`-based indexing with \`1\`-based counting halfway through.
- I solved the "happy path" in my head and ignored the smallest case (empty input, single element, tie values).

\`\`\`cpp
// Jumping in fast often looks neat until n == 0 or all values are negative:
int best = 0; // Silent bug if all elements in the array are < 0
for (int x : values) {
    if (x > best) best = x;
}
\`\`\`

Initializing \`best\` to \`0\` feels harmless until you actually ask: *Wait, can the numbers be negative?* Two seconds of thinking before typing saves ten minutes of squinting at wrong output later.

## My Four-Question Pause Before Coding

Lately, I force myself to answer four quick questions on paper or in a scratch comment before writing real code:

1. **What exact input can arrive, and what are its weirdest valid values?**
2. **What should happen on the smallest possible case?**
3. **Can I trace one tiny example by hand from start to finish?**
4. **If I had to explain the rule to a friend in two plain sentences, what would I say?**

If I can't do step 4 without waving my hands around, I am not ready to write C++ yet.

Slowing down for three minutes at the beginning still feels slightly unnatural when I'm excited to build. Yet every time I skip it, I end up paying those three minutes back with interest during debugging.`,
    contentAr: `أسرع عادة سيئة أقع فيها أثناء البرمجة هي قراءة سطرين فقط من وصف المشكلة ثم الاندفاع نحو لوحة المفاتيح خلال عشر ثوانٍ.

في البداية يبدو الأمر منتجاً؛ الأصابع تتحرك والأسطر تزيد على الشاشة. لكن بعد عشرين دقيقة أجد نفسي أمام أربعين سطراً من كود C++، وثلاثة شروط متداخلة لا أثق بها، واختبار فاشل يكشف أنني كنت أحل مسألة مختلفة قليلاً عن المطلوبة فعلاً.

## تشبيه المكتب المزدحم

البدء بكتابة الكود قبل فهم المشكلة يشبه محاولة ترتيب مكتب مزدحم بوضع الأغراض عشوائياً في الأدراج قبل أن تقرر أصلاً ما الذي تستخدمه يومياً وما الذي يجب التخلص منه. هناك حركة كثيرة، لكن الفوضى تبقى نفسها — وبعد دقائق ستضطر لإفراغ الأدراج من جديد.

الكود مرآة للتفكير: إذا كانت الصورة في ذهنك ضبابية، فالكود لن يوضحها، بل سيجسّد الضبابية على هيئة شروط متشابكة.

## ما سبب أغلب أخطائي في التمارين؟

عندما أراجع لماذا تعثّر حلٌّ صغير كتبته، نادراً ما يكون السبب تعقيداً في اللغة نفسها. في أغلب الأحيان يكون السبب واحداً من ثلاثة أمور بسيطة:

- افترضت أن المدخلات موجبة دائماً أو مرتّبة دون أن أتأكد من النص.
- خلطت في منتصف الحل بين الترقيم من \`0\` والترقيم من \`1\`.
- فكّرت في الحالة المثالية المتوقعة وتجاهلت أصغر الحالات (قائمة بعنصر واحد، قيم متساوية، أرقام سالبة).

\`\`\`cpp
// هذا السطر يبدو بريئاً حتى تدخل مصفوفة كل أرقامها سالبة:
int best = 0;
for (int x : values) {
    if (x > best) best = x;
}
\`\`\`

اختيار \`0\` كقيمة ابتدائية خطأ صامت لا يظهر إلا إذا سألت نفسك قبل الكتابة: *هل يمكن أن تكون القيم سالبة؟* ثانيتان من التوقف توفران عشر دقائق من التحديق في مخرجات خاطئة.

## أربع أسئلة سريعة قبل أن ألمس الكود

أحاول الآن إلزام نفسي بالإجابة على أربع نقاط على ورقة جانبية قبل كتابة أي سطر فعلي:

1. **ما شكل المدخلات بالضبط، وما أغرب قيم مسموحة قد تصلني؟**
2. **ماذا يجب أن يحدث في أصغر حالة ممكنة؟**
3. **هل أستطيع تتبّع مثال صغير بيدي خطوة خطوة من البداية للنهاية؟**
4. **لو شرحت قاعدة الحل لصديق في جملتين واضحتين، ماذا سأقول؟**

إذا تعثرت في السؤال الرابع واضطررت للالتفاف بالكلام، فهذه إشارة واضحة أنني لست مستعداً لكتابة الكود بعد.

التهدئة لثلاث دقائق في البداية ما زالت تحتاج مني مقاومة لعجلة البداية، لكنها في كل مرة تقريباً تختصر وقت التصحيح أضعافاً.`,
    topicLabels: ['Problem Solving', 'Algorithms', 'Debugging', 'Mental Models'],
    publicationStatus: 'published',
    seoTitleEn: 'Understanding the Problem Before Writing Code · Neural Atlas',
    seoTitleAr: 'فهم المشكلة قبل كتابة أول سطر كود · أطلس الشبكات العصبية',
    seoDescriptionEn:
      'Why rushing into code multiplies bugs, and a practical four-question pause on paper before typing.',
    seoDescriptionAr:
      'لماذا يضاعف التسرع في كتابة الكود الأخطاء، وكيف تساعد أربع أسئلة بسيطة على الورق قبل التنفيذ.',
    createdAt: '2026-10-14T11:30:00.000Z',
    updatedAt: '2026-10-14T11:30:00.000Z',
    publishedAt: '2026-10-14T12:00:00.000Z',
  },
  {
    id: 'my-journey-through-cs50x',
    slug: 'my-journey-through-cs50x',
    titleEn: 'My Journey Through CS50x (And Why Stopping to Absorb Matters)',
    titleAr: 'رحلتي مع CS50x: لماذا وصلت إلى Week 3 دون سباق مع الزمن',
    summaryEn:
      'Notes from reaching Week 3 in Harvard CS50x as an ongoing journey—why I refuse to treat foundational computer science as a race for a badge.',
    summaryAr:
      'ملاحظاتي بعد الوصول إلى Week 3 في مساق Harvard CS50x كرحلة مستمرة، ولماذا أفضّل استيعاب المفاهيم على استعجال الشهادات.',
    contentEn: `If you spend enough time around programming communities online, it is easy to start measuring learning by speed: *Finish CS50x in two weeks! Complete ten courses in a month!*

Meanwhile, my actual progress in Harvard CS50x stands at **Week 3**—and it is still an ongoing journey, not something I have completed or hold a certificate for. And honestly, I'm completely fine with taking my time here.

## Starting With Scratch Wasn't "Too Simple"

Before opening CS50x, having explored programming since around age 12 and studied C++, I wondered briefly if Week 0 in Scratch would feel pointless.

It wasn't. Watching ideas like loops, events, and state live inside visual blocks strips away syntax distractions. You can't hide behind clever punctuation—either your logic holds together cleanly or your little character walks straight off the screen.

## Moving Into C Made Everything Feel Physical

Then came Weeks 1 and 2 in C, and suddenly the guardrails came off.

Dealing with types, strings as arrays of characters, and explicit compilation made computing feel much less like magic. Even coming from C++, seeing CS50x build concepts directly from C—why overflow happens, how characters sit next to each other in memory, how a command-line argument even enters \`main\`—connected pieces I had previously accepted at face value.

\`\`\`c
// In C, a string stops feeling abstract when you remember it's literally bytes ending with '\\0'
char word[] = "CS50"; // 'C', 'S', '5', '0', '\\0'
\`\`\`

## Why Week 3 Made Me Slow Down Intentionally

Reaching **Week 3**—where the focus shifts into algorithms, searching, sorting, and thinking about efficiency—hit the exact nerve I want to strengthen alongside my first-year university coursework at Al-Azhar.

I could skim the lectures and chase the fastest path to the next week. Instead, slowing down lets me compare what I'm seeing in CS50x with *Algorithmic Thinking* in university and my C++ practice:

- Tracing *why* binary search needs sorted order instead of just memorizing \`mid = (low + high) / 2\`.
- Thinking about steps growing with input size rather than assuming my laptop will brute-force everything fast enough.
- Letting ideas sink in until I can reconstruct them without peeking at hints.

CS50x is still in progress for me at Week 3. Treating it as a careful companion to my foundational year—rather than a race for a trophy—makes every week I *do* work through actually stick.`,
    contentAr: `إذا قضيت وقتاً في المجتمعات البرمجية على الإنترنت، فمن السهل أن تنجرّ لقياس التعلّم بالسرعة وحدها: *«انهِ المساق في أسبوعين!»* أو سباق جمع أكبر عدد من الشهادات في أقصر وقت.

أما واقعي الفعلي مع **Harvard CS50x** فهو أنني وصلت إلى **Week 3** — وهي رحلة تعلّم مستمرة وليست مساقاً منتهياً أو شهادة في يدي. وبصراحة، هذا الإيقاع الهادئ مقصود ومريح بالنسبة لي.

## البداية بـ Scratch لم تكن مضيعة وقت

لأنني بدأت التعلّم الذاتي منذ قرابة سن ١٢ وتعلمت مبادئ C++، خطر ببالي للحظة أن الأسبوع التمهيدي بـ Scratch قد يبدو بدائياً أكثر من اللازم.

لكنه لم يكن كذلك. تجريد المنطق البرمجي من الأقواس والفواصل المنقوطة يكشف فوراً هل فكرتك متماسكة أم لا؛ إما أن تسير خطواتك بترتيب سليم أو يخرج الكائن عن المسار تماماً.

## الانتقال إلى لغة C جعل المفاهيم ملموسة

بعدها جاء الانتقال إلى لغة C، وهنا يختفي كثير من السحر الخفي.

التعامل المباشر مع أنواع البيانات، وفكرة أن النصوص مجرد مصفوفة أحرف في الذاكرة، والترجمة اليدوية للكود — كل ذلك ربط في ذهني تفاصيل كنت أتعامل معها سابقاً كمسلّمات جاهزة.

\`\`\`c
// في لغة C تدرك فوراً أن النص ليس سحراً، بل بايتات متجاورة تنتهي بعلامة النهاية
char word[] = "CS50"; // 'C', 'S', '5', '0', '\\0'
\`\`\`

## لماذا فضّلت التمهّل عند Week 3؟

مع الوصول إلى **Week 3** والتركيز على الخوارزميات والبحث والترتيب والتفكير في كفاءة الحل، شعرت أن هذا الجزء يلامس تماماً ما أحتاج تقويته بالتوازي مع سنتي الأولى في جامعة الأزهر.

كان بإمكاني مشاهدة المحاضرات بسرعة لمجرد القفز إلى الأسبوع التالي، لكن التمهّل سمح لي بالربط بين المساق ومادة *التفكير الخوارزمي* وتدريباتي في C++:

- فهم *لماذا* يشترط البحث الثنائي أن تكون البيانات مرتّبة بدل حفظ المعادلة \`mid = (low + high) / 2\` عن ظهر قلب.
- ملاحظة كيف يتغيّر عدد الخطوات كلما كبر حجم المدخلات بدل الاتكال على سرعة الجهاز.
- ترك المفهوم يهدأ في ذهني حتى أتمكن من إعادة بنائه دون النظر إلى التلميحات.

مسار CS50x لا يزال مفتوحاً وقيد التقدم عند Week 3. التعامل معه كرفيق لبناء الأساس لا كسباق لالتقاط شهادة يجعل ما أدرسه فيه يبقى فعلاً.`,
    topicLabels: ['Learning Journey', 'CS50x', 'Week 3', 'Computer Science'],
    publicationStatus: 'published',
    seoTitleEn: 'My Journey Through CS50x (Week 3) · Neural Atlas',
    seoTitleAr: 'رحلتي مع CS50x والوصول إلى Week 3 · أطلس الشبكات العصبية',
    seoDescriptionEn:
      'An honest progress note on reaching Week 3 of Harvard CS50x and choosing understanding over rushing.',
    seoDescriptionAr:
      'تدوينة صادقة حول الوصول إلى الأسبوع الثالث من CS50x وأهمية الاستيعاب العميق بدل الاستعجال.',
    createdAt: '2026-10-21T09:45:00.000Z',
    updatedAt: '2026-11-10T15:20:00.000Z',
    publishedAt: '2026-10-21T10:30:00.000Z',
  },
  {
    id: 'why-i-dont-want-to-specialize-too-early',
    slug: 'why-i-dont-want-to-specialize-too-early',
    titleEn: "Why I Don't Want to Specialize Too Early",
    titleAr: 'لماذا لا أتعجل التخصص الدقيق في هذه المرحلة؟',
    summaryEn:
      'Why staying curious across computer science fundamentals—rather than locking myself into one tiny niche during first year—feels like the smarter long-term bet.',
    summaryAr:
      'لماذا أختار تثبيت الأساسيات العريضة في علوم الحاسب خلال سنتي الأولى بدلاً من حبس نفسي مبكراً في مسار ضيق واحد.',
    contentEn: `There is a lot of pressure online for students to pick one hyper-specific label immediately and glue it to every bio: *AI Specialist*, *Backend Architect*, *Framework Guru*.

Being a first-year Intelligent Computing student at Al-Azhar University, I genuinely feel the opposite pull right now. Instead of narrowing down to a tiny corner as fast as possible, I want a wide, sturdy floor underneath me first.

## Decorating the Fifth Floor Before Pouring Concrete

Specializing early can look impressive from a distance—you learn one trendy tool quickly and sound fluent using its vocabulary. The problem starts the moment that tool shifts or a harder question pushes one layer deeper than the API surface.

It reminds me of picking curtain colors for the fifth floor of a building when you haven't checked whether the concrete foundation is level.

When I look at my first-year subjects—*Algorithmic Thinking*, *Computer Architecture*, *Information Systems*, *Mathematics*, *Probability & Statistics*, *Artificial Intelligence*—they aren't random obstacles delaying "real work." Together, they explain *why* software behaves the way it does:

- **Architecture** shows how memory and instructions actually execute below my code.
- **Math and Probability** explain the language behind algorithms and AI uncertainty.
- **Information Systems** reveal how data flows cleanly through real organizations.

## Even My Language Roadmap Follows the Same Rule

I finished the C++ track and want to strengthen problem solving and core CS concepts before jumping deep into everything else. That is also why I am **learning Python thoughtfully now** alongside my C++ and algorithmic habits rather than claiming to have mastered ten stacks at once.

Learning five tools superficially in one year feels busy. Getting solid with fundamentals first—and building Python fluency step by step as my algorithmic habits mature—means every future tool takes a fraction of the effort to truly understand.

## Curiosity Doesn't Have to Mean Confusion

Staying broad at nineteen doesn't mean wandering aimlessly. It means keeping enough intellectual room to connect ideas across software, AI, systems, and even how technology interacts with business and people—knowing that deep specialization works best *after* you've seen the map.`,
    contentAr: `يوجد ضغط غير معلن على طلاب الجامعة بأن يختاروا لقباً تخصصياً ضيقاً منذ اليوم الأول ويضعوه في كل مكان: *متخصص كذا* أو *خبير أداة كذا*.

بصفتي طالباً في السنة الأولى بقسم الحوسبة الذكية في جامعة الأزهر، أشعر برغبة معاكسة تماماً في هذه المرحلة: بدل التضييق السريع نحو زاوية واحدة، أحتاج أولاً إلى أرضية عريضة ومتماسكة أقف عليها.

## اختيار الديكور قبل صبّ الأساس

التخصص المبكر قد يبدو لامعاً من بعيد؛ تتعلم أداة رائجة بسرعة وتجيد ترديد مصطلحاتها. لكن الإشكال يبدأ فور تغيّر الأداة أو ظهور مشكلة تتطلب منك النزول طبقة واحدة أعمق من السطح.

يشبه الأمر الانشغال باختيار لون الستائر في الطابق الخامس قبل التأكد أصلاً من سلامة الأعمدة والأساس.

عندما أنظر إلى مقررات سنتي الأولى — *التفكير الخوارزمي*، *معمارية الحاسب*، *نظم المعلومات*، *الرياضيات*، *الاحتمالات والإحصاء*، و*الذكاء الاصطناعي* — لا أراها موادَّ تعطلني عن «العمل الحقيقي»، بل أراها القطع التي تشرح لماذا يعمل السوفتوير أصلاً:

- **المعمارية** تكشف ما يحدث للذاكرة والتعليمات تحت السطور البرمجية.
- **الرياضيات والاحتمالات** تعطي اللغة التي تُبنى بها الخوارزميات ونماذج الذكاء.
- **نظم المعلومات** توضح كيف تتدفق البيانات المنظمة لخدمة قرارات حقيقية.

## حتى خطتي في اللغات تتبع نفس المنطق

بعد إنهاء تأسيس C++، أركّز على تقوية التفكير الخوارزمي قبل التشتت في عشرات الأدوات. ولهذا السبب تحديداً أتعامل مع **تعلّم لغة بايثون حالياً** كامتداد تدريجي بعد ترسيخ الأساس الأول، لا كمهارة أدّعي إتقانها من اليوم الأول.

جمع خمس لغات بشكل سطحي يمنح وهماً بالحركة، بينما إتقان الأساسيات أولاً يجعل التعمق في أي لغة أو مجال لاحقاً أسرع وأكثر ثباتاً.

## الاتساع في البداية ليس تشتتاً

أن تحتفظ بفضولك المفتوح في بداية الطريق لا يعني غياب الاتجاه؛ بل يعني أن تمنح نفسك مساحة لترى الخريطة كاملة — من الكود والأنظمة إلى الذكاء الاصطناعي وعلاقة التقنية بالأعمال — قبل أن تختار النقطة التي ستتعمق فيها لسنوات.`,
    topicLabels: ['Computer Science', 'Foundations', 'Al-Azhar', 'Learning Strategy'],
    publicationStatus: 'published',
    seoTitleEn: "Why I Don't Want to Specialize Too Early · Neural Atlas",
    seoTitleAr: 'لماذا لا أتعجل التخصص الدقيق في هذه المرحلة؟ · أطلس الشبكات العصبية',
    seoDescriptionEn:
      'Reflections as a first-year Intelligent Computing student on building durable foundations before specializing.',
    seoDescriptionAr:
      'تأمل طالب بالسنة الأولى في الحوسبة الذكية حول أولوية ترسيخ الأساسيات قبل التخصص الدقيق.',
    createdAt: '2026-10-27T13:00:00.000Z',
    updatedAt: '2026-10-27T13:00:00.000Z',
    publishedAt: '2026-10-27T13:30:00.000Z',
  },
  {
    id: 'working-with-ai-is-a-skill-too',
    slug: 'working-with-ai-is-a-skill-too',
    titleEn: 'Working With AI Is a Skill, Too',
    titleAr: 'العمل مع أدوات الذكاء الاصطناعي مهارة مستقلة بحد ذاتها',
    summaryEn:
      'What directing AI-assisted projects taught me about clarity, skeptical verification, setting system boundaries, and why prompting well requires real engineering thinking.',
    summaryAr:
      'ماذا علّمتني التجارب الموجَّهة بأدوات الذكاء الاصطناعي عن وضوح المتطلبات، والمراجعة النقدية للمخرجات، وتحديد الحدود البرمجية.',
    contentEn: `There is a popular misconception that working with AI tools means pressing a button and watching a finished system magically assemble itself while you sip tea.

Anyone who has tried to direct an AI tool through more than two files knows how quickly that illusion collapses.

In earlier projects I explored and directed with AI assistance—like *Kalmeron-Two* and *WANASBRAND*, as well as high-level planning around personal assistant ideas like *J.A.R.V.I.S.*—the biggest surprise wasn't what AI could generate. It was how ruthlessly it exposes unclear thinking on *my* side.

## Garbage Direction In, Confident Chaos Out

AI models are remarkably polite even when they are quietly heading down the wrong road. Give a vague request, and you will receive a very confident, well-formatted answer that misses three crucial constraints you forgot to mention.

Directing AI effectively turned out to involve skills that look a lot like real software engineering:

- **Defining boundaries clearly**: What should this piece do—and just as importantly, what must it *not* touch?
- **Breaking big wishes into small, checkable steps**: Asking for one coherent unit at a time instead of an entire universe in one prompt.
- **Reading critically instead of nodding along**: Checking edge cases, state transitions, and assumptions before trusting generated code.

## Keeping Ownership Honest

One thing I care a lot about is being straightforward about my actual role. When I direct an experiment using AI tools, I am not pretending I wrote every line manually from scratch without assistance. At the same time, directing the architecture, catching inconsistencies, deciding what fits the goal, and knowing when to stop an experiment are human responsibilities.

## Why Fundamentals Still Decide Everything

Here is the funny twist: the better I understand fundamental programming logic and system design, the *better* I get at working with AI—not less dependent on understanding.

If you don't understand state, validation, or problem decomposition, you can't tell whether an AI suggestion solved your bug cleanly or simply hid it under a rug. Working with AI is genuinely a skill, and ironically, its strongest multiplier is still a curious human who understands the basics.`,
    contentAr: `يشيع تصور غير دقيق بأن العمل مع أدوات الذكاء الاصطناعي يعني ضغطة زر واحدة ليخرج نظام متكامل جاهز بينما تكتفي بالمشاهدة.

أي شخص جرّب توجيه أدوات الذكاء الاصطناعي في مشروع يتجاوز ملفاً واحداً يعرف أن هذا الوهم ينهار بسرعة.

في المشاريع والتجارب التي عملت على توجيهها باستخدام أدوات الذكاء الاصطناعي مثل *Kalmeron-Two* و*WANASBRAND* — وكذلك عند التفكير العام في تنظيم وحدات وحدود أي نظام مساعد مثل *J.A.R.V.I.S.* — لم تكن المفاجأة في سرعة توليد النصوص أو الأكواد، بل في مدى قسوة هذه الأدوات في كشف أي غموض في تفكيري أنا.

## طلب غامض يعني فوضى مرتّبة الشكل

النماذج الذكية مؤدبة للغاية حتى وهي تسير بثقة في الاتجاه الخاطئ. إذا أعطيتها طلباً مبهماً، ستقدّم لك إجابة منسقة ومقنعة المظهر لكنها تتجاهل ثلاثة قيود أساسية نسيتَ أن تذكرها.

مع التجربة، اكتشفت أن التوجيه الجيد للذكاء الاصطناعي يعتمد على مهارات هندسية حقيقية:

- **تحديد الحدود بوضوح**: ما الذي يجب أن يفعله هذا الجزء، وما الذي يُمنع أن يتدخل فيه؟
- **تفكيك الهدف الكبير إلى خطوات قابلة للفحص**: طلب وحدة متماسكة واحدة في كل مرة بدل طلب بناء منظومة كاملة دفعة واحدة.
- **القراءة الناقدة لا التسليم الأعمى**: مراجعة الحالات الحدية وتدفّق البيانات قبل الوثوق في أي مخرج.

## الأمانة في توصيف الدور

أحرص دائماً على الصدق بشأن دوري الفعلي؛ عندما أوجّه بناء نموذج أو تجربة بمساعدة أدوات الذكاء الاصطناعي، لا أدّعي كتابة كل سطر يدوياً من الصفر. لكن في المقابل، رسم التصور العام، واكتشاف التناقضات، والتحقق من المنطق، واتخاذ قرار التوقف أو التعديل تبقى مسؤولية بشرية خالصة.

## الأساسيات هي ما يصنع الفارق حتى مع AI

المفارقة الطريفة أنني كلما فهمت مبادئ البرمجة وتصميم الأنظمة بشكل أعمق، تحسّنت قدرتي على العمل *مع* الذكاء الاصطناعي وليس العكس.

إذا لم تكن تفهم كيف تتدفق البيانات أو أين تكمن نقاط الضعف، فلن تستطيع التمييز بين حل نظيف كتبه النموذج وحل آخر يخفي المشكلة تحت السجادة. العمل مع الذكاء الاصطناعي مهارة حقيقية، وأقوى وقود لها يظل عقلاً يفهم الأساسيات.`,
    topicLabels: ['Artificial Intelligence', 'AI Tools', 'Direction', 'Verification'],
    publicationStatus: 'published',
    seoTitleEn: 'Working With AI Is a Skill, Too · Neural Atlas',
    seoTitleAr: 'العمل مع أدوات الذكاء الاصطناعي مهارة مستقلة · أطلس الشبكات العصبية',
    seoDescriptionEn:
      'Honest lessons from directing AI-assisted projects: clear requirements, critical verification, and engineering discipline.',
    seoDescriptionAr:
      'دروس عملية من توجيه المشاريع بأدوات الذكاء الاصطناعي: وضوح المتطلبات والمراجعة الناقدة والحدود الهندسية.',
    createdAt: '2026-11-01T10:00:00.000Z',
    updatedAt: '2026-11-12T18:10:00.000Z',
    publishedAt: '2026-11-01T11:15:00.000Z',
  },
  {
    id: 'i-want-to-learn-more-than-just-programming',
    slug: 'i-want-to-learn-more-than-just-programming',
    titleEn: 'I Want to Learn More Than Just Programming',
    titleAr: 'أريد أن أتعلّم ما هو أبعد من كتابة الكود وحدها',
    summaryEn:
      'Why staying curious about business, marketing, and structured Microsoft Excel records alongside computer science changes how I look at building useful software.',
    summaryAr:
      'لماذا أرى أن فهم الأعمال والتسويق وتنظيم البيانات باستخدام Microsoft Excel إلى جانب البرمجة يغيّر نظرتي لبناء أي تقنية نافعة.',
    contentEn: `If you ask some developers what matters most, the answer sounds like code lives in an isolated glass box: write clean functions, pick a neat data structure, and the rest is somebody else's department.

I've never quite bought into that split. Studying computer science is my core direction, yet I enjoy exploring business, marketing, and structured problem domains rather than locking myself inside code alone.

## What Structured Spreadsheets Taught Me

Practical experience organizing operational records and data in Microsoft Excel taught me something simple that textbook exercises rarely highlight: clean data structure matters long before anyone writes an application.

At first glance, Excel sheets look completely ordinary next to C++ or AI. In practice, they sharpen habits that translate directly into software engineering:

- **Consistency beats improvisation**: Real records arrive from different places and need consistent columns and validation rules to stay trustworthy.
- **Clarity beats cleverness**: A well-organized table anyone can inspect calmly at the end of a week matters far more than a flashy formula nobody understands.
- **Context determines usefulness**: Before building or automating anything, you have to understand *who* relies on the output and *what decision* depends on it.

## Why Business and Marketing Curiosity Fits Naturally

Reading about how products work, why people choose one solution over another, and how teams communicate value feels like the other half of building technology.

Technology for its own sake is fun as a puzzle—and I love puzzles—but meaningful technology solves something real for real people. Exploring business constraints and marketing perspective encourages healthy questions early: *Who actually benefits from this? What friction are we removing? Is this solving a genuine problem or just adding complexity?*

## Staying Multi-Dimensional Without Losing Focus

Wanting to learn beyond pure coding doesn't mean abandoning deep technical study. My priority as a student remains building strong computer science foundations. Still, paying attention to clear record-keeping, business logic, and human communication keeps my perspective grounded—reminding me that good software always meets real needs halfway.`,
    contentAr: `أحياناً يبدو حديث بعض المبرمجين كما لو أن الكود يعيش داخل صندوق زجاجي معزول: اكتب دوالاً نظيفة واختر بنية بيانات أنيقة، وبقية العالم شأن شخص آخر.

لم أقتنع يوماً بهذا الانفصال الكامل. صحيح أن علوم الحاسب والبرمجة هما مساري الأساسي، لكنني أستمتع أيضاً باستكشاف مجالات الأعمال والتسويق والتفكير المنظم بدلاً من حصر ذهني في زاوية الكود وحدها.

## ماذا علّمني تنظيم البيانات في Excel؟

تعلّمت من الممارسة العملية في تنظيم السجلات والبيانات باستخدام **Microsoft Excel** درساً بسيطاً قد لا تنتبه له في التمارين النظرية: جودة هيكلة البيانات تسبق كتابة أي تطبيق.

قد تبدو جداول Excel أمراً عادياً مقارنة بلغة C++ أو أفكار الذكاء الاصطناعي، لكنها في الواقع ترسّخ عادات هندسية مهمة:

- **الاتساق أهم من الارتجال**: السجلات الواقعية تحتاج إلى أعمدة واضحة وقواعد تحقق ثابتة لتبقى موثوقة.
- **الوضوح يهزم التعقيد**: جدول منظم يسهل مراجعته بثقة أنفع بكثير من معادلة معقدة يصعب تتبعها.
- **السياق يحدد الجدوى**: قبل أن تبني أو تؤتمت أي خطوة، لا بد أن تفهم *مَن* يستخدم النتيجة وما القرار المبني عليها.

## لماذا أهتم بالأعمال والتسويق؟

القراءة في كيفية تفكير المشاريع، ولماذا يختار الناس حلاً دون غيره، وكيف تُشرح القيمة بوضوح ليست تشتتاً عن التقنية؛ بل هي النصف الآخر الذي يكملها.

كتابة الكود للتحدي الذهني ممتعة جداً — وأنا أحب ذلك — لكن التقنية المؤثرة حقاً هي التي تخدم حاجة حقيقية بوضوح. النظر بعين الأعمال والتسويق يجعلك تسأل مبكراً: *هل هذا يحل مشكلة فعلية أم يضيف تعقيداً جديداً فقط؟*

## اتساع الأفق دون فقدان البوصلة

رغبتي في التعلم خارج حدود الكود لا تعني التفريط في الأساس العلمي؛ فالدراسة الجامعية والأساس التقني يبقيان في المقدمة. لكن إبقاء نافذة مفتوحة على تنظيم البيانات والأعمال والتواصل الإنساني يحفظ توازن النظرة، ويذكّرني دائماً بأن البرمجيات الجيدة تُبنى للناس لا للآلات وحدها.`,
    topicLabels: ['Business & Technology', 'Excel', 'Marketing', 'Product Thinking'],
    publicationStatus: 'published',
    seoTitleEn: 'I Want to Learn More Than Just Programming · Neural Atlas',
    seoTitleAr: 'أريد أن أتعلّم ما هو أبعد من كتابة الكود وحدها · أطلس الشبكات العصبية',
    seoDescriptionEn:
      'Why pairing computer science with business thinking, marketing curiosity, and structured Excel record-keeping builds grounded engineering judgment.',
    seoDescriptionAr:
      'لماذا يمنح الجمع بين علوم الحاسب وفهم الأعمال والتسويق وتنظيم البيانات في Excel رؤية تقنية أكثر نضجاً.',
    createdAt: '2026-11-05T14:00:00.000Z',
    updatedAt: '2026-11-05T14:00:00.000Z',
    publishedAt: '2026-11-05T14:30:00.000Z',
  },
  {
    id: 'documenting-what-i-learn',
    slug: 'documenting-what-i-learn',
    titleEn: 'Documenting What I Learn (Before It Quietly Evaporates)',
    titleAr: 'لماذا أوثّق ما أتعلّمه بدلاً من تركه يتبخر؟',
    summaryEn:
      'Why relying on memory alone fails after six months, how writing exposes fuzzy understanding faster than watching another lecture, and the honest idea behind these notes.',
    summaryAr:
      'لماذا تخوننا الذاكرة بعد بضعة أشهر، وكيف يكشف التدوين البسيط ما لم نفهمه حقاً أسرع من مشاهدة محاضرة جديدة.',
    contentEn: `Back when I started experimenting with programming around age 12, I trusted my memory completely. If I spent an afternoon figuring out why something broke and finally got it working, I thought: *Awesome, I'll definitely remember this forever.*

Six months later, I would hit the exact same bug, stare at it like a stranger, and spend another afternoon rediscovering what past-me had already solved.

## Writing Is a Honesty Test

The bigger reason I document things now isn't even memory—it's how brutally writing exposes whether I actually understand a concept.

In your own head, ideas feel smooth and connected because your brain quietly skips over the missing bridges. The second you try to write those thoughts down in plain sentences—especially without hiding behind impressive jargon—every fuzzy spot stands up and waves at you.

If I find myself writing three vague sentences in a row, it almost always means I recognized a term in class without genuinely grasping how it works.

## Why Neural Atlas Needs a Notebook, Not Just a Trophy Shelf

A lot of portfolios look like finished brochures: shiny project cards, confident headlines, and zero trace of the messy thinking in between.

There is nothing wrong with polishing how you present your work, yet as a student still building foundations, pretending everything arrived effortlessly feels fake. I wanted **Neural Atlas** to hold two things side by side:

- Structured projects and honest academic records.
- A personal knowledge library where notes read like a real learner thinking out loud—sharing what clicked, what confused me, and how my perspective shifted over time.

## Keeping the Bar Realistic

Good documentation doesn't mean turning every small realization into a ten-page academic paper. Sometimes a short, honest reflection written clearly in my own voice saves both future-me and anyone else passing by from repeating the same circle twice.`,
    contentAr: `عندما بدأت استكشاف البرمجة في سن الثانية عشرة تقريباً، كنت أثق بذاكرتي ثقة كاملة. إذا قضيت فترة ما بعد الظهر أحل مشكلة عنيدة ثم نجحت أخيراً في تشغيلها، كنت أظن ببساطة: *«رائع، لن أنسى هذه الفكرة أبداً.»*

بعد ستة أشهر، كنت أقع في نفس المشكلة بالضبط، وأتأملها كأنها كائن غريب، ثم أضيع وقتاً جديداً في إعادة اكتشاف ما سبق أن حللته.

## الكتابة اختبار صدق للفهم

السبب الأكبر لتوثيقي ما أتعلمه اليوم ليس النسيان وحده، بل لأن الكتابة تكشف بوضوح هل فهمت الفكرة حقاً أم لا.

داخل الرأس تبدو الأفكار مترابطة وواضحة لأن العقل يقفز بهدوء فوق الفراغات دون أن ينبهك. لكن في اللحظة التي تحاول فيها صياغة الفكرة بجمل واضحة — دون الاحتماء بمصطلحات رنانة — تظهر كل نقطة غامضة فوراً.

إذا وجدت نفسي أكتب ثلاث جمل عامة لا تقول شيئاً محدداً، فهذا يعني غالباً أنني حفظت شكل المصطلح فقط ولم أستوعب آلية عمله بعد.

## لماذا احتاج Neural Atlas إلى دفتر ملاحظات لا واجهة عرض فقط؟

كثير من المواقع الشخصية تشبه كتيّبات الدعاية: عناوين واثقة وبطاقات مصقولة، دون أي أثر للتفكير والتجريب الذي سبقها.

لا عيب في تنظيم العرض، لكن كطالب لا يزال يبني أساسه، يبدو تجميل الصورة وكأن كل شيء جاء بسهولة أمراً غير مريح وغير صادق. أردت لمنصة **Neural Atlas** أن تجمع أمرين معاً:

- مشاريع منظمة وسجل دراسة واقعي دون تزييف.
- مكتبة تعلّم شخصية تبدو كصاحبها؛ توثّق ما استوعبته، وما حيّرني، وكيف تغيّرت نظرتي مع الوقت.

## توثيق واقعي دون تكلّف

التوثيق الجيد لا يعني تحويل كل ملاحظة إلى بحث طويل متكلّف. أحياناً تكفي صفحة واضحة مكتوبة بصوتك الحقيقي لتوفّر على نفسك — وعلى أي قارئ يمر من هنا — الدوران في نفس الحلقة مرتين.`,
    topicLabels: ['Personal Insights', 'Documentation', 'Neural Atlas', 'Self-Learning'],
    publicationStatus: 'published',
    seoTitleEn: 'Documenting What I Learn · Neural Atlas',
    seoTitleAr: 'لماذا أوثّق ما أتعلّمه؟ · أطلس الشبكات العصبية',
    seoDescriptionEn:
      'Why writing down what I learn exposes shallow understanding faster than passive reading and anchors Neural Atlas.',
    seoDescriptionAr:
      'لماذا تكشف الكتابة نقاط الضعف في الفهم أسرع من القراءة السريعة، وكيف تشكّل جوهر مكتبة المذكرات.',
    createdAt: '2026-11-09T16:10:00.000Z',
    updatedAt: '2026-11-16T09:40:00.000Z',
    publishedAt: '2026-11-09T16:45:00.000Z',
  },
  {
    id: 'difference-between-building-and-understanding',
    slug: 'difference-between-building-and-understanding',
    titleEn: 'The Difference Between Building Something and Understanding It',
    titleAr: 'الفارق بين أن يشتغل المشروع أمامك وأن تفهم كيف يعمل فعلاً',
    summaryEn:
      'Reflections on why "it runs on my screen" is only half the story, and what discontinued explorations and paused prototypes taught me.',
    summaryAr:
      'تأملات حول الفجوة بين تشغيل الفكرة على الشاشة وفهمها من الداخل، والدروس المستخلصة من إيقاف بعض التجارب.',
    contentEn: `There is a sneaky moment in software experiments where everything *works* once—the screen updates, no red error shows up—and you feel tempted to close the laptop and call it a victory.

Until one small assumption changes, everything breaks silently, and you realize you built something without deeply understanding why it worked in the first place.

## Running Code Is Not Always Understanding Code

Especially today, between tutorials, libraries, and AI assistants, assembling something visible has gotten faster than ever. That speed is genuinely exciting, yet it hides a trap: it is now remarkably easy to stitch together pieces whose inner rules you can't explain.

Building something proves the pieces connected under *one* lucky path. Understanding it means knowing:

- What breaks when an input arrives out of order or missing?
- Which parts depend on each other, and which ones only look clean on the surface?
- If the whole piece disappeared tomorrow, could I rebuild its core logic calmly from scratch?

## Lessons From Stopping Experiments Honestly

Looking back at my own archive—from paused prototypes like *Kalmeron-Two* to discontinued earlier explorations—closing a chapter used to feel a little uncomfortable. Nobody loves putting a "Discontinued" label next to an idea they were excited about.

Yet discontinuing an experiment is often the clearest proof that you actually learned something from it:

- You discover where ambition outpaced your current foundations.
- You notice which parts were fragile hacks rather than real systems.
- You realize when stepping back to study architecture, algorithms, and fundamentals gives far higher return than forcing a shaky prototype forward.

## Carrying Understanding Forward

I don't mind having discontinued experiments in my archive. What I care about now is closing the gap between *getting something on screen* and *understanding every piece underneath it*. Because once you truly understand how a system works, even the experiments you retire become solid bricks for whatever you build next.`,
    contentAr: `هناك لحظة خادعة في التجارب البرمجية؛ عندما يعمل كل شيء أمامك لمرة واحدة — تظهر النتيجة على الشاشة دون أخطاء حمراء — فتشعر برغبة في إغلاق الجهاز وإعلان النجاح.

ثم يتغيّر تفصيل صغير واحد، فينهار كل شيء بصمت، وتكتشف أنك ركّبت الأجزاء فوق بعضها دون أن تفهم حقاً لماذا اشتغلت أصلاً.

## أن يعمل المشروع لا يعني أنك تفهمه

اليوم تحديداً، بين الشروحات والمكتبات الجاهزة وأدوات الذكاء الاصطناعي، أصبح بناء نموذج مرئي أسرع من أي وقت مضى. هذه السرعة رائعة ومحمّسة، لكنها تخفي فخاً بسيطاً: صار من السهل جداً تجميع قطع لا تستطيع شرح قواعدها الداخلية.

تشغيل الفكرة يثبت فقط أنها عبرت مساراً واحداً سعيد الحظ. أما فهمها فيعني أن تعرف:

- ماذا ينكسر لو وصلت البيانات ناقصة أو بترتيب مختلف؟
- ما الأجزاء المترابطة فعلاً وما الأجزاء المتماسكة بالمظهر فقط؟
- لو اختفى الكود غداً، هل أستطيع إعادة بناء المنطق الأساسي من الصفر بهدوء؟

## دروس الصدق مع التجارب المتوقفة

عندما أنظر إلى أرشيف تجاربي السابقة — من نماذج متوقفة مثل *Kalmeron-Two* إلى محاولات سابقة انتهى العمل عليها — كان وضع كلمة «متوقف» يبدو ثقيلاً في البداية؛ فلا أحد يتحمس لإعلان نهاية فكرة تحمّس لها يوماً.

لكن التوقف بوعي غالباً ما يكون الدليل الأوضح على أنك خرجت بدرس حقيقي:

- تكتشف أين سبق الطموحُ أساسَك المعرفي الحالي.
- ترى الفارق بين حلول سريعة هشة وبين بنية هندسية متينة.
- تدرك أن الرجوع خطوة للتركيز على الخوارزميات ومعمارية الحاسب والأساسيات أجدى بكثير من ترقيع نموذج غير مكتمل الفهم.

## ما يبقى بعد انتهاء التجربة

لا أجد حرجاً في توثيق التجارب المتوقفة ضمن الأرشيف. ما يهمني اليوم هو تضييق الفجوة بين *تشغيل الفكرة* و*فهم ما تحتها فعلاً*؛ لأنك حين تفهم النظام من الداخل، حتى التجارب التي تتوقف تصبح رصيداً حقيقياً لما تبنيه بعدها.`,
    topicLabels: ['Experiments', 'Systems', 'Discontinued Experiments', 'Engineering'],
    publicationStatus: 'published',
    seoTitleEn: 'The Difference Between Building Something and Understanding It · Neural Atlas',
    seoTitleAr: 'الفارق بين أن يشتغل المشروع أمامك وأن تفهمه · أطلس الشبكات العصبية',
    seoDescriptionEn:
      'Reflections on moving beyond "it runs" toward genuine system understanding and honest lessons from discontinued experiments.',
    seoDescriptionAr:
      'تأملات في تجاوز مرحلة «الكود يعمل» نحو الفهم الحقيقي للأنظمة، والدروس المستخلصة من إيقاف بعض التجارب.',
    createdAt: '2026-11-14T12:15:00.000Z',
    updatedAt: '2026-11-19T09:30:00.000Z',
    publishedAt: '2026-11-14T13:00:00.000Z',
  },
];

export const INITIAL_NOTE_DRAFTS = INITIAL_LEARNING_NOTES;

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
    titleEn: 'Harvard CS50x — Independent Study (CS50x: Week 3)',
    titleAr: 'Harvard CS50x — دراسة مستقلة (CS50x: الأسبوع 3)',
    status: 'in_progress',
    statusLabelEn: 'CS50x: Week 3 · In Progress',
    statusLabelAr: 'CS50x: Week 3 · مستمر',
    cadenceNoteEn: 'CS50x: Week 3 · Ongoing learning journey — not completed or certified',
    cadenceNoteAr: 'CS50x: Week 3 · مسار تعلّم مستمر — غير مكتمل ولا يمثّل شهادة',
    summaryEn:
      'Currently an ongoing independent study journey in foundational computer science (CS50x: Week 3). Taking deliberate time to absorb memory models, algorithms, and problem decomposition thoroughly rather than rushing for completion.',
    summaryAr:
      'رحلة تعلّم مستقلة ومستمرة في أساسيات علوم الحاسب (CS50x: Week 3). أتمهّل لاستيعاب مفاهيم الذاكرة والخوارزميات وتفكيك المشكلات بعمق بدلاً من الاستعجال، ولا يمثّل المساق شهادة مكتملة.',
    highlightsEn: [
      'Current status: CS50x: Week 3 (Independent Study)',
      'Focusing on algorithmic thinking and memory mental models rather than rushing',
      'Ongoing learning journey — not completed or certified',
    ],
    highlightsAr: [
      'الحالة الحالية: CS50x: Week 3 (دراسة مستقلة)',
      'التركيز على الفهم العميق للذاكرة والخوارزميات بدلاً من التسابق مع الأسابيع',
      'مسار تعلّم مستمر — غير مكتمل ولا يمثّل شهادة',
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
    status: 'paused',
    statusLabelEn: 'Not Accepted',
    statusLabelAr: 'لم يتم القبول',
    cadenceNoteEn: 'GKS-U 2027 undergraduate application outcome',
    cadenceNoteAr: 'نتيجة التقديم لدورة GKS-U 2027',
    summaryEn:
      'Applied for the GKS-U 2027 undergraduate scholarship cycle; the application was not accepted.',
    summaryAr:
      'تم التقديم لمنحة GKS-U 2027 للدراسة الجامعية، ولم يتم القبول في هذه الدورة.',
    highlightsEn: ['Status: Not Accepted (2027 cycle)'],
    highlightsAr: ['الحالة الموثقة: لم يتم القبول (دورة ٢٠٢٧)'],
    showInActiveHighlights: false,
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
  sectionTitleEn: 'Microsoft Excel',
  sectionTitleAr: 'Microsoft Excel',
  contextSummaryEn:
    'Practical experience organizing operational records and data in Microsoft Excel.',
  contextSummaryAr:
    'خبرة عملية في تنظيم السجلات والبيانات التشغيلية باستخدام Microsoft Excel.',
  activitiesEn: [],
  activitiesAr: [],
};

export const PROJECTS: ProjectItem[] = [
  {
    id: 'neural-atlas',
    titleEn: 'Neural Atlas',
    titleAr: 'أطلس الشبكات العصبية — Neural Atlas',
    statusEn: 'Active Platform',
    statusAr: 'منصة نشطة قيد التطوير المستمر',
    statusType: 'in_development',
    visibility: 'public',
    archiveGroup: 'showcase',
    featuredOnHome: true,
    repoUrl: 'https://github.com/dahaliztupe-sketch/Neural-Atlas-',
    descriptionEn:
      'Neural Atlas is my personal archive and digital gallery. I collect my path, my projects and what I am still learning in it. I built it with the help of AI tools, and I decide and review the content.',
    descriptionAr:
      'أطلس الشبكات العصبية هو أرشيفي الشخصي ومعرضي الرقمي، أجمع فيه مساري ومشاريعي وما زلت أتعلمه. بنيته بمساعدة أدوات الذكاء الاصطناعي، وأنا من يحدد المحتوى ويراجعه.',
    roleEn: 'Creator & System Architect · Personal Digital Identity & Portfolio',
    roleAr: 'المصمم والمطوّر · هوية رقمية ومحفظة معرفية شخصية',
    problemEn:
      'Representing an early-stage computer science student’s growth transparently—balancing real academic work, independent experiments, and evolving knowledge without résumé inflation or clutter.',
    problemAr:
      'تمثيل مسيرة طالب علوم حاسب بشفافية ووضوح — مع الفصل بين الدراسة الجامعية والتجارب المستقلة وتطور المهارات دون تضخيم أو تشتت.',
    approachEn:
      'Engineered a bilingual React + TypeScript architecture backed by Firestore CMS, structured fallback data baselines, Markdown/KaTeX note rendering, and a clean obsidian astrolabe visual system.',
    approachAr:
      'بناء واجهة ثنائية اللغة (عربي/إنجليزي) بـ React وTypeScript مدعومة بنظام إدارة محتوى عبر Firestore، مع بيانات تأسيسية موثوقة، ودعم Markdown وKaTeX، وتصميم بصري متوازن.',
    outcomeEn:
      'Serves as my primary personal platform connecting academic foundations, structured skills, project documentation, and curated technical writing.',
    outcomeAr:
      'تمثّل المنصة الرئيسية التي تجمع مساري الجامعي، وخريطة المهارات الواقعية، وتوثيق المشاريع، وبنية المذكرات المعرفية.',
    technologies: ['TypeScript', 'React', 'Tailwind CSS', 'Firebase', 'Three.js'],
    fullOverviewEn: [
      'Provides full English (LTR) and Arabic (RTL) parity with dark and light architectural themes.',
      'Separates current showcase work cleanly from experimental and discontinued archive entries.',
      'Includes an owner-authenticated Admin Studio for drafting, editing, and publishing notes, projects, and milestones.',
      'Combines an interactive 3D orbital astrolabe hero stage with reliable static-baseline fallback when database collections are unseeded.',
    ],
    fullOverviewAr: [
      'يوفر تجربة ثنائية اللغة كاملة (العربية RTL والإنجليزية LTR) مع مظهرين داكن وفاتح متباينين بوضوح.',
      'يفصل بوضوح بين المشاريع النشطة والأساسية وأرشيف التجارب المتوقفة.',
      'يتضمن أستوديو إدارة محمي بصلاحيات المالك لتحرير المسودات ونشر المشاريع والمحطات.',
      'يدمج مشهد الإسطرلاب التفاعلي ثلاثي الأبعاد مع طبقة موثوقية محلية تضمن اكتمال العرض في كل الظروف.',
    ],
  },
  {
    id: 'jarvis-ai-assistant',
    titleEn: 'J.A.R.V.I.S.',
    titleAr: 'مشروع J.A.R.V.I.S. (استكشاف مساعد ذكاء اصطناعي)',
    statusEn: 'Concept Exploration',
    statusAr: 'استكشاف مفاهيمي لمشروع مساعد ذكي',
    statusType: 'experimental',
    visibility: 'public',
    archiveGroup: 'showcase',
    featuredOnHome: true,
    descriptionEn:
      'An independent intelligent personal assistant concept focused on planning, structured interaction, and modular boundaries—documented strictly at a high level.',
    descriptionAr:
      'مشروع مستقل لاستكشاف فكرة مساعد ذكي شخصي يركّز على التخطيط المنهجي، وتنظيم التفاعل، وتحديد حدود الوحدات بوضوح — موثّق على المستوى المفاهيمي العام فقط.',
    roleEn: 'Independent Concept & System Thinking Exploration',
    roleAr: 'استكشاف مستقل لتصميم وتخطيط المساعدات الذكية',
    problemEn:
      'Thinking through how an assistant system organizes clear boundaries, structured requests, and reliable human-in-the-loop discipline.',
    problemAr:
      'التفكير في كيفية تنظيم نظام مساعد ذكي بحدود واضحة ومسارات طلبات مفهومة دون تعقيد عشوائي.',
    approachEn:
      'Explored at a high level through planning, boundary design, and incremental structural thinking while keeping private details out of public documentation.',
    approachAr:
      'استكشاف مفاهيمي وهيكلي يركز على التخطيط وتقسيم المسؤوليات والانضباط الهندسي مع إبقاء أي تفاصيل خاصة خارج النشر العام.',
    outcomeEn:
      'Maintained strictly at a general conceptual level.',
    outcomeAr:
      'موثّق بصفة عامة على مستوى التخطيط والتصميم.',
    technologies: ['System Design', 'Assistant Workflows', 'Planning', 'Modular Boundaries'],
    fullOverviewEn: [
      'Independent personal assistant exploration centered on planning, clear boundaries, and engineering discipline.',
      'Kept intentionally high-level publicly without exposing private architecture or implementation specifics.',
    ],
    fullOverviewAr: [
      'استكشاف مستقل لتصور مساعد شخصي يركّز على التخطيط وتحديد الحدود والانضباط الهندسي.',
      'تقتصر التغطية العامة على المبادئ والأفكار دون كشف أي تفاصيل داخلية خاصة.',
    ],
  },
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
      'Structured hands-on practice building from foundational C++ syntax toward core data structures, algorithmic decomposition, and clear mental models of memory and complexity.',
    descriptionAr:
      'ممارسة عملية منظمة تنطلق من أساسيات لغة C++ نحو هياكل البيانات الأساسية، والتحليل الخوارزمي، وبناء تصور دقيق للذاكرة وكفاءة التنفيذ.',
    roleEn: 'Independent Foundational Practice · Complementing University Coursework',
    roleAr: 'ممارسة تأسيسية مستقلة · مكملة للدراسة الجامعية',
    problemEn:
      'Developing fluency in pointers, references, complexity reasoning, and step-by-step problem decomposition from first principles.',
    problemAr:
      'تنمية الطلاقة البرمجية في المؤشرات والمراجع وتحليل التعقيد وتفكيك المسائل الخوارزمية من المبادئ الأولى.',
    approachEn:
      'Translating algorithmic problems into structured modern C++ implementations with standard containers and explicit control flow.',
    approachAr:
      'تحويل المسائل الخوارزمية إلى حلول منظمة بلغة C++ الحديثة باستخدام حاويات المكتبة القياسية والتحكم المنطقي الواضح.',
    outcomeEn: 'Ongoing active learning & practice track reinforcing first-year Algorithmic Thinking and CS foundations.',
    outcomeAr: 'مسار تعلّم وتطبيق مستمر يدعم دراسة التفكير الخوارزمي وأساسيات علوم الحاسب.',
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
      'Kalmeron is an experimental platform for Arabic-speaking company founders, built with the help of AI. Chat and sign-in work. Payments and other parts are not enabled yet. I am learning from it how a platform of this size is built.',
    descriptionAr:
      'كالمرون مشروع تجريبي لمنصة عربية لمؤسسي الشركات، بنيته بمساعدة الذكاء الاصطناعي. المحادثة وتسجيل الدخول تعمل، أما الدفع وأجزاء أخرى فلم تُفعّل بعد. أتعلم منه كيف تُبنى منصة بهذا الحجم.',
    roleEn: 'Directed prototype development using AI tools (paused pre-launch experiment)',
    roleAr: 'توجيه التطوير باستخدام أدوات الذكاء الاصطناعي (تجربة متوقفة قبل الإطلاق)',
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
    id: 'wanasbrand',
    titleEn: 'WANASBRAND',
    titleAr: 'WANASBRAND — متجر إلكتروني',
    statusEn: 'Live',
    statusAr: 'منشور',
    statusType: 'completed',
    visibility: 'public',
    archiveGroup: 'showcase',
    featuredOnHome: true,
    url: 'https://wanasbrand.vercel.app',
    descriptionEn:
      'WANASBRAND is my attempt at building an online store in Arabic and English: collections, a cart and cash on delivery. The code started with Google AI Studio, then I fixed and improved it. I learned how a full store works and how to review code I did not write myself. It has no real products and is a template for practice.',
    descriptionAr:
      'واناس براند تجربتي في بناء متجر إلكتروني بالعربية والإنجليزية: مجموعات وسلة ودفع عند الاستلام. بدأ الكود بمساعدة Google AI Studio ثم أصلحته وحسنته. تعلمت منه كيف يعمل متجر كامل وكيف أراجع كودًا لم أكتبه بنفسي. لا يحتوي منتجات حقيقية، وهو قالب للتجربة.',
    roleEn: 'AI-Directed Storefront Builder & Product Owner',
    roleAr: 'توجيه البناء بأدوات الذكاء الاصطناعي وإدارة المتجر',
    problemEn:
      'Building a clean online storefront for handcrafted fashion items with clear product browsing and live deployment.',
    problemAr:
      'تصميم وإطلاق متجر إلكتروني واضح لعرض الأزياء المصنوعة يدوياً بتجربة تصفح سهلة.',
    approachEn:
      'Directed AI development tools using Next.js, Firebase, and Vercel deployment workflows.',
    approachAr:
      'بُني بتوجيه أدوات الذكاء الاصطناعي عبر Next.js وFirebase والنشر على Vercel.',
    outcomeEn: 'Live online storefront at https://wanasbrand.vercel.app.',
    outcomeAr: 'متجر إلكتروني منشور ومتاح حالياً عبر الرابط العام.',
    technologies: ['Next.js', 'Firebase', 'Vercel', 'AI-Directed'],
    fullOverviewEn: [
      'WANASBRAND: an online storefront for handcrafted fashion, built by directing AI tools (Next.js, Firebase, Vercel).',
      'The store is live at https://wanasbrand.vercel.app.',
    ],
    fullOverviewAr: [
      'متجر إلكتروني للأزياء المصنوعة يدوياً بُني بتوجيه أدوات الذكاء الاصطناعي (Next.js وFirebase وVercel).',
      'المتجر منشور حالياً ومتاح عبر الرابط العام.',
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
    titleEn: 'Self-Learning Programming Begins (~Around Age 12)',
    titleAr: 'بداية رحلة التعلّم الذاتي في البرمجة (~منذ قرابة سن ١٢)',
    dateEn: 'Early Background (~Age 12 · Egypt)',
    dateAr: 'خلفية مبكرة (~سن ١٢ · مصر)',
    category: 'technical',
    descriptionEn:
      'Began exploring programming and computing independently around age 12 through hands-on experimentation, independent reading, and curiosity-driven digital building.',
    descriptionAr:
      'انطلاقة الاهتمام بعلوم الحاسب والبرمجة منذ نحو الثانية عشرة عبر التعلّم الذاتي والتجريب العملي والبحث المستقل قبل المرحلة الجامعية.',
    publicationStatus: 'published',
  },
  {
    id: 'elzero-cpp-fundamentals-track',
    titleEn: 'Elzero Web School — C++ Programming Fundamentals Track Completed',
    titleAr: 'أكاديمية الزيرو — إتمام مسار تأسيس البرمجة بلغة C++',
    dateEn: 'Completed Self-Paced Track',
    dateAr: 'مسار تعلّم ذاتي مكتمل',
    category: 'technical',
    descriptionEn:
      'Completed the self-paced C++ programming fundamentals curriculum covering language syntax, control flow, functions, and arrays (documented honestly as a completed learning track, not a formal certificate).',
    descriptionAr:
      'استكمال المسار التعليمي الذاتي لأساسيات لغة C++ بما يشمل القواعد والتحكم المنطقي والدوال والمصفوفات (كمسار تعلّم ذاتي مكتمل وليس شهادة رسمية).',
    publicationStatus: 'published',
  },
  {
    id: 'al-azhar-intelligent-computing-entry',
    titleEn: 'First-Year Intelligent Computing Studies — Al-Azhar University, Cairo',
    titleAr: 'الدراسة الجامعية في السنة الأولى · الحوسبة الذكية — جامعة الأزهر، القاهرة',
    dateEn: 'First Year · Current Studies',
    dateAr: 'السنة الأولى · دراسة حالية',
    category: 'academic',
    descriptionEn:
      'Joined first-year Intelligent Computing / Computer Science studies at the Faculty of Science, Al-Azhar University in Cairo, engaging with Algorithmic Thinking, Artificial Intelligence, Computer Architecture, Information Systems, Mathematics, Probability & Statistics, and Islamic Theology.',
    descriptionAr:
      'الالتحاق بالسنة الأولى في تخصص الحوسبة الذكية بكلية العلوم، جامعة الأزهر بالقاهرة، ودراسة المقررات التأسيسية في التفكير الخوارزمي، والذكاء الاصطناعي، ومعمارية الحاسب، ونظم المعلومات، والرياضيات، والاحتمالات والإحصاء، والعقيدة الإسلامية.',
    publicationStatus: 'published',
  },
  {
    id: 'independent-ai-explorations',
    titleEn: 'Independent AI Exploration — J.A.R.V.I.S.',
    titleAr: 'استكشاف مستقل في الذكاء الاصطناعي — J.A.R.V.I.S.',
    dateEn: 'Independent Project Track',
    dateAr: 'مسار مشروع مستقل',
    category: 'technical',
    descriptionEn:
      'Explored general planning and boundary concepts around J.A.R.V.I.S., kept at a conceptual level.',
    descriptionAr:
      'استكشاف التخطيط المفاهيمي وحدود الوحدات في مشروع J.A.R.V.I.S. على المستوى العام فقط.',
    publicationStatus: 'published',
  },
  {
    id: 'neural-atlas-digital-identity',
    titleEn: 'Launched Neural Atlas — Personal Digital Identity & Knowledge Platform',
    titleAr: 'بناء منصة Neural Atlas — الهوية الرقمية والأطلس المعرفي الشخصي',
    dateEn: 'Ongoing Digital Platform',
    dateAr: 'منصة رقمية نشطة',
    category: 'technical',
    descriptionEn:
      'Designed and built Neural Atlas as a transparent bilingual space uniting first-year university coursework, structured skill tiers, independent project documentation, and curated study notes.',
    descriptionAr:
      'تصميم وبناء منصة أطلس الشبكات العصبية كمساحة ثنائية اللغة تجمع المسار الجامعي والمشاريع المستقلة ومستويات المهارات الواقعية ومذكرات التعلّم.',
    publicationStatus: 'published',
  },
  {
    id: 'gks-u-2027-application-submitted',
    titleEn: 'Global Korea Scholarship (GKS-U 2027) — Not Accepted',
    titleAr: 'منحة الحكومة الكورية (GKS-U 2027) — لم يتم القبول',
    dateEn: '2027 Intake Cycle',
    dateAr: 'دورة ٢٠٢٧',
    category: 'academic',
    descriptionEn:
      'Applied for the GKS-U 2027 undergraduate scholarship cycle; the application was not accepted.',
    descriptionAr:
      'التقديم لدورة منحة GKS-U 2027 للدراسة الجامعية، ولم يتم القبول في هذه الدورة.',
    publicationStatus: 'published',
  },
];
