import {
  MistakeRecord,
  QuizAttemptRecord,
  ResourceItem,
  SpellingWord,
  StudySessionLog,
  SubjectItem,
  SubjectStudyPack,
  TaskItem,
  TimetableSlot,
  TopicItem,
  TutorHistoryEntry,
  TutorScenario,
} from '../types/platform';

export const INITIAL_SUBJECTS: SubjectItem[] = [
  {
    id: 'bio',
    name: 'Biology',
    code: 'BIO-102',
    teacher: 'Ms. K. Patel',
    accentHex: '#0891B2',
    currentFocus: 'Cellular Energy & Enzyme Kinetics',
  },
  {
    id: 'math',
    name: 'Mathematics',
    code: 'MTH-104',
    teacher: 'Mr. D. Okafor',
    accentHex: '#0284C7',
    currentFocus: 'Quadratic Functions & Discriminants',
  },
  {
    id: 'hist',
    name: 'Modern History',
    code: 'HIS-101',
    teacher: 'Dr. E. Vance',
    accentHex: '#0E7490',
    currentFocus: 'Interwar Europe & Weimar Instability',
  },
  {
    id: 'eng',
    name: 'English Literature',
    code: 'ENG-103',
    teacher: 'Ms. R. Alvarez',
    accentHex: '#0369A1',
    currentFocus: 'Macbeth: Moral Ambition & Rhetoric',
  },
  {
    id: 'chem',
    name: 'Chemistry',
    code: 'CHM-102',
    teacher: 'Mr. H. Takahashi',
    accentHex: '#155E75',
    currentFocus: 'Stoichiometry & Limiting Reagents',
  },
];

function isoOffset(daysOffset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().slice(0, 10);
}

const ZERO_EVIDENCE = {
  quizCorrect: 0,
  quizTotal: 0,
  quizAttemptsCount: 0,
  independentRecallChecks: 0,
  explanationChecksPassed: 0,
};

export const INITIAL_TOPICS: TopicItem[] = [
  {
    id: 'bio-respiration',
    subjectId: 'bio',
    title: 'Aerobic vs. Anaerobic Respiration',
    unit: 'Unit 4: Cellular Energetics',
    difficulty: 'challenging',
    status: 'developing',
    studentConfidence: 'moderate',
    evidence: { ...ZERO_EVIDENCE },
    studentNote: '',
    lastReviewed: '',
  },
  {
    id: 'bio-enzymes',
    subjectId: 'bio',
    title: 'Enzyme Denaturation & Active Site Fit',
    unit: 'Unit 3: Biochemistry',
    difficulty: 'standard',
    status: 'developing',
    studentConfidence: 'moderate',
    evidence: { ...ZERO_EVIDENCE },
    studentNote: '',
    lastReviewed: '',
  },
  {
    id: 'bio-photosynthesis',
    subjectId: 'bio',
    title: 'Light-Dependent Reactions & Calvin Cycle',
    unit: 'Unit 4: Cellular Energetics',
    difficulty: 'challenging',
    status: 'developing',
    studentConfidence: 'moderate',
    evidence: { ...ZERO_EVIDENCE },
    studentNote: '',
    lastReviewed: '',
  },
  {
    id: 'math-discriminant',
    subjectId: 'math',
    title: 'Quadratic Discriminant & Root Nature',
    unit: 'Unit 2: Polynomials',
    difficulty: 'standard',
    status: 'developing',
    studentConfidence: 'moderate',
    evidence: { ...ZERO_EVIDENCE },
    studentNote: '',
    lastReviewed: '',
  },
  {
    id: 'math-completing-square',
    subjectId: 'math',
    title: 'Completing the Square & Vertex Form',
    unit: 'Unit 2: Polynomials',
    difficulty: 'standard',
    status: 'developing',
    studentConfidence: 'moderate',
    evidence: { ...ZERO_EVIDENCE },
    studentNote: '',
    lastReviewed: '',
  },
  {
    id: 'math-probability',
    subjectId: 'math',
    title: 'Conditional Probability Trees',
    unit: 'Unit 3: Probability',
    difficulty: 'standard',
    status: 'developing',
    studentConfidence: 'moderate',
    evidence: { ...ZERO_EVIDENCE },
    studentNote: '',
    lastReviewed: '',
  },
  {
    id: 'hist-weimar',
    subjectId: 'hist',
    title: 'Weimar Constitution & Article 48',
    unit: 'Unit 2: Interwar Crisis',
    difficulty: 'challenging',
    status: 'developing',
    studentConfidence: 'moderate',
    evidence: { ...ZERO_EVIDENCE },
    studentNote: '',
    lastReviewed: '',
  },
  {
    id: 'hist-versailles',
    subjectId: 'hist',
    title: 'Economic Impact of Reparations (1923)',
    unit: 'Unit 2: Interwar Crisis',
    difficulty: 'foundational',
    status: 'developing',
    studentConfidence: 'moderate',
    evidence: { ...ZERO_EVIDENCE },
    studentNote: '',
    lastReviewed: '',
  },
  {
    id: 'eng-macbeth-soliloquy',
    subjectId: 'eng',
    title: 'Act 1 Scene 7 Soliloquy Analysis',
    unit: 'Drama: Macbeth',
    difficulty: 'standard',
    status: 'developing',
    studentConfidence: 'moderate',
    evidence: { ...ZERO_EVIDENCE },
    studentNote: '',
    lastReviewed: '',
  },
  {
    id: 'eng-rhetoric',
    subjectId: 'eng',
    title: 'Ethos, Pathos & Structural Contrast',
    unit: 'Persuasive Writing',
    difficulty: 'standard',
    status: 'developing',
    studentConfidence: 'moderate',
    evidence: { ...ZERO_EVIDENCE },
    studentNote: '',
    lastReviewed: '',
  },
  {
    id: 'chem-limiting',
    subjectId: 'chem',
    title: 'Limiting Reagents & Molar Ratios',
    unit: 'Unit 3: Quantitative Chemistry',
    difficulty: 'challenging',
    status: 'developing',
    studentConfidence: 'moderate',
    evidence: { ...ZERO_EVIDENCE },
    studentNote: '',
    lastReviewed: '',
  },
  {
    id: 'chem-periodic',
    subjectId: 'chem',
    title: 'Ionisation Energy & Atomic Radius Trends',
    unit: 'Unit 2: Periodicity',
    difficulty: 'foundational',
    status: 'developing',
    studentConfidence: 'moderate',
    evidence: { ...ZERO_EVIDENCE },
    studentNote: '',
    lastReviewed: '',
  },
];

export const INITIAL_TIMETABLE: TimetableSlot[] = [
  { id: 'tt1', day: 'Mon', time: '09:00', subjectId: 'math', room: 'Room 204' },
  { id: 'tt2', day: 'Mon', time: '11:15', subjectId: 'bio', room: 'Lab B2' },
  { id: 'tt3', day: 'Tue', time: '09:00', subjectId: 'eng', room: 'Room 112' },
  { id: 'tt4', day: 'Tue', time: '13:30', subjectId: 'chem', room: 'Lab C1' },
  { id: 'tt5', day: 'Wed', time: '09:00', subjectId: 'bio', room: 'Lab B2' },
  { id: 'tt6', day: 'Wed', time: '10:30', subjectId: 'math', room: 'Room 204' },
  { id: 'tt7', day: 'Wed', time: '14:00', subjectId: 'hist', room: 'Room 308' },
  { id: 'tt8', day: 'Thu', time: '09:00', subjectId: 'bio', room: 'Lab B2' },
  { id: 'tt9', day: 'Thu', time: '11:15', subjectId: 'chem', room: 'Lab C1' },
  { id: 'tt10', day: 'Fri', time: '10:30', subjectId: 'hist', room: 'Room 308' },
  { id: 'tt11', day: 'Fri', time: '13:30', subjectId: 'eng', room: 'Room 112' },
];

export const INITIAL_TASKS: TaskItem[] = [
  {
    id: 't1',
    subjectId: 'bio',
    topicId: 'bio-respiration',
    title: 'Annotate cellular respiration pathway before lab',
    kind: 'revision',
    urgency: 'high',
    dueDate: isoOffset(2),
    estimatedMinutes: 25,
    completed: false,
    isTodayFocus: true,
  },
  {
    id: 't2',
    subjectId: 'math',
    topicId: 'math-discriminant',
    title: 'Quadratic Discriminant Problem Set (Questions 4–10)',
    kind: 'assignment',
    urgency: 'critical',
    dueDate: isoOffset(1),
    estimatedMinutes: 30,
    completed: false,
    isTodayFocus: true,
  },
  {
    id: 't3',
    subjectId: 'chem',
    topicId: 'chem-limiting',
    title: 'Stoichiometry Practical Pre-Lab Calculations',
    kind: 'assignment',
    urgency: 'high',
    dueDate: isoOffset(3),
    estimatedMinutes: 25,
    completed: false,
    isTodayFocus: false,
  },
  {
    id: 't4',
    subjectId: 'bio',
    topicId: 'bio-respiration',
    title: 'Biology Unit 4 Cellular Energetics Quiz',
    kind: 'assessment',
    urgency: 'high',
    dueDate: isoOffset(4),
    estimatedMinutes: 40,
    completed: false,
    isTodayFocus: false,
  },
  {
    id: 't5',
    subjectId: 'hist',
    topicId: 'hist-weimar',
    title: 'Weimar Fragility Source Essay Outline',
    kind: 'assignment',
    urgency: 'medium',
    dueDate: isoOffset(7),
    estimatedMinutes: 35,
    completed: false,
    isTodayFocus: false,
  },
  {
    id: 't6',
    subjectId: 'eng',
    topicId: 'eng-macbeth-soliloquy',
    title: 'Close reading paragraph: Lady Macbeth persuasive shift',
    kind: 'assignment',
    urgency: 'critical',
    dueDate: isoOffset(1),
    estimatedMinutes: 20,
    completed: false,
    isTodayFocus: true,
  },
  {
    id: 't7',
    subjectId: 'math',
    topicId: 'math-completing-square',
    title: 'Polynomials Mid-Term Assessment',
    kind: 'assessment',
    urgency: 'low',
    dueDate: isoOffset(9),
    estimatedMinutes: 45,
    completed: false,
    isTodayFocus: false,
  },
];

export const INITIAL_RESOURCES: ResourceItem[] = [
  {
    id: 'res-bio-pdf',
    subjectId: 'bio',
    title: 'Bio_Ch4_Cellular_Respiration_Handout.pdf',
    type: 'pdf',
    accessStatus: 'accessible',
    processingStatus: 'extracted',
    identifiedTopics: ['bio-respiration', 'Glycolysis', 'Krebs Cycle', 'ATP Yield'],
    accessMode: 'Local file',
    sourceReference: 'Local upload · 6 pages · Section 4.1–4.3',
    ownerOrPublisher: 'Ms. K. Patel (Class Handout)',
    addedAt: '2026-11-12',
    summaryPreview:
      'Covers glycolysis in the cytosol, pyruvate oxidation, the mitochondrial Krebs cycle, and oxidative phosphorylation yields.',
    verifiedExcerpts: [
      {
        location: 'Page 2, Paragraph 1',
        text: 'Glycolysis occurs in the cytoplasm of the cell and does not require oxygen, producing a net yield of 2 ATP and 2 NADH per glucose molecule.',
      },
      {
        location: 'Page 4, Table 4.2',
        text: 'The Krebs cycle and electron transport chain take place inside the mitochondrion, generating approximately 30 to 32 additional ATP molecules when oxygen acts as the final electron acceptor.',
      },
    ],
  },
  {
    id: 'res-bio-slides',
    subjectId: 'bio',
    title: 'Unit 4 Lecture Deck — Enzymes & ATP Pathways',
    type: 'google-slides',
    accessStatus: 'auth-required',
    processingStatus: 'auth-required',
    identifiedTopics: ['bio-enzymes', 'bio-respiration'],
    accessMode: 'Read-only link',
    sourceReference: 'docs.google.com/presentation/d/1x9k... (School Workspace)',
    ownerOrPublisher: 'Science Dept Drive',
    addedAt: '2026-11-14',
    summaryPreview:
      'Teacher slide deck on metabolic pathways. Not analysed because school workspace sign-in is required.',
    accessNotice:
      'This Google Slides deck is private to your school workspace and has not been analysed. Export the slides as a PDF or paste key points into a Typed Note to make it readable here.',
    verifiedExcerpts: [],
  },
  {
    id: 'res-bio-yt',
    subjectId: 'bio',
    title: 'ATP Synthase & Proton Gradients Explained (11m 40s)',
    type: 'youtube',
    accessStatus: 'accessible',
    processingStatus: 'extracted',
    identifiedTopics: ['bio-respiration', 'Chemiosmosis'],
    accessMode: 'Read-only link',
    sourceReference: 'youtube.com/watch?v=demo-atp-synthase',
    ownerOrPublisher: 'Amoeba / Crash Science (Public Transcript)',
    addedAt: '2026-11-13',
    summaryPreview:
      'Visual walkthrough of chemiosmosis across the inner mitochondrial membrane extracted from public captions.',
    verifiedExcerpts: [
      {
        location: 'Transcript 06:18–07:05',
        text: 'Hydrogen ions flow down their electrochemical gradient through ATP synthase, driving the phosphorylation of ADP into ATP.',
      },
    ],
  },
  {
    id: 'res-bio-yt-notranscript',
    subjectId: 'bio',
    title: 'Photosynthesis Calvin Cycle Animation (No Captions)',
    type: 'youtube',
    accessStatus: 'accessible',
    processingStatus: 'transcript-unavailable',
    identifiedTopics: ['bio-photosynthesis'],
    accessMode: 'Read-only link',
    sourceReference: 'youtube.com/watch?v=demo-calvin-no-cc',
    ownerOrPublisher: 'External Video Channel',
    addedAt: '2026-11-16',
    summaryPreview:
      'Video link saved to your Biology library, but no transcript is available.',
    accessNotice:
      'Transcript unavailable: captions are disabled on this YouTube video, so the platform has NOT analysed its contents or used it to generate study material.',
    verifiedExcerpts: [],
  },
  {
    id: 'res-math-doc',
    subjectId: 'math',
    title: 'Quadratics & Discriminant Worked Examples',
    type: 'google-doc',
    accessStatus: 'accessible',
    processingStatus: 'extracted',
    identifiedTopics: ['math-discriminant', 'math-completing-square'],
    accessMode: 'Read-only link',
    sourceReference: 'docs.google.com/document/d/4a8m... (Read-only view)',
    ownerOrPublisher: 'Mr. D. Okafor',
    addedAt: '2026-11-10',
    summaryPreview:
      'Step-by-step derivations of the quadratic formula and geometric interpretation of Δ = b² - 4ac.',
    verifiedExcerpts: [
      {
        location: 'Section 2: The Discriminant',
        text: 'When b² - 4ac > 0, the parabola intersects the x-axis at two distinct points. When b² - 4ac = 0, the vertex rests tangent to the x-axis, yielding one repeated real root.',
      },
      {
        location: 'Section 3: Complex Cases',
        text: 'When b² - 4ac < 0, the parabola lies entirely above or below the x-axis, meaning there are zero real roots.',
      },
    ],
  },
  {
    id: 'res-chem-sheet',
    subjectId: 'chem',
    title: 'Stoichiometry Lab Mass & Mole Calculations',
    type: 'google-sheet',
    accessStatus: 'accessible',
    processingStatus: 'extracted',
    identifiedTopics: ['chem-limiting', 'Molar Ratios'],
    accessMode: 'Read-only link',
    sourceReference: 'docs.google.com/spreadsheets/d/8c2p... (Tab: Exp_03)',
    ownerOrPublisher: 'Student Lab Sheet',
    addedAt: '2026-11-15',
    summaryPreview:
      'Experimental reactant masses (Mg and HCl), molar masses, and theoretical vs. actual yield rows.',
    verifiedExcerpts: [
      {
        location: 'Sheet Exp_03, Rows 4–8',
        text: 'Step 1: Divide sample mass (g) by molar mass (g/mol) to obtain moles before dividing by the balanced equation coefficient.',
      },
    ],
  },
  {
    id: 'res-hist-drive',
    subjectId: 'hist',
    title: 'Weimar Primary Sources Archive Folder',
    type: 'google-drive',
    accessStatus: 'restricted',
    processingStatus: 'restricted',
    identifiedTopics: ['hist-weimar'],
    accessMode: 'Read-only link',
    sourceReference: 'drive.google.com/drive/folders/9f4t...',
    ownerOrPublisher: 'Year 10 History Shared Folder',
    addedAt: '2026-11-11',
    summaryPreview:
      'Folder containing 1919 constitution excerpts and election tables. Not analysed due to restricted permissions.',
    accessNotice:
      'Folder permissions currently block external read-only previews ("Access Denied by Domain Policy"). This folder has not been analysed.',
    verifiedExcerpts: [],
  },
  {
    id: 'res-hist-article',
    subjectId: 'hist',
    title: 'Article 48 and Presidential Emergency Decrees (1929–1933)',
    type: 'article',
    accessStatus: 'accessible',
    processingStatus: 'extracted',
    identifiedTopics: ['hist-weimar', 'Article 48'],
    accessMode: 'Read-only link',
    sourceReference: 'encyclopedia-history.edu/weimar-article-48',
    ownerOrPublisher: 'Historical Inquiry Archive',
    addedAt: '2026-11-14',
    summaryPreview:
      'Examines how Article 48 shifted governance from parliamentary coalitions to presidential rule after 1930.',
    verifiedExcerpts: [
      {
        location: 'Paragraph 4',
        text: 'Between 1930 and 1932, Chancellor Brüning relied repeatedly on Article 48 emergency decrees as proportional representation fragmented the Reichstag.',
      },
    ],
  },
  {
    id: 'res-chem-image',
    subjectId: 'chem',
    title: 'Whiteboard Photo — Limiting Reagent Mole Bridge',
    type: 'image',
    accessStatus: 'accessible',
    processingStatus: 'extracted',
    identifiedTopics: ['chem-limiting'],
    accessMode: 'Local file',
    sourceReference: 'IMG_20261115_ChemBoard.png · Classroom whiteboard capture',
    ownerOrPublisher: 'Student Upload',
    addedAt: '2026-11-15',
    summaryPreview:
      'Diagram showing Mass (g) → Moles (n = m/M) → Mole Ratio Bridge → Product Mass.',
    verifiedExcerpts: [
      {
        location: 'Diagram Annotation (Top)',
        text: 'Never compare raw gram masses directly; the balanced equation compares moles, not grams.',
      },
    ],
  },
  {
    id: 'res-eng-note',
    subjectId: 'eng',
    title: 'My Notes: Macbeth Act 1 Scene 7 Turning Points',
    type: 'typed-note',
    accessStatus: 'accessible',
    processingStatus: 'extracted',
    identifiedTopics: ['eng-macbeth-soliloquy', 'eng-rhetoric'],
    accessMode: 'User note',
    sourceReference: 'Typed Note · 420 words · Last edited Nov 16',
    ownerOrPublisher: 'Student Notes',
    addedAt: '2026-11-16',
    summaryPreview:
      'Personal quote bank comparing Macbeth’s "vaulting ambition" image with Lady Macbeth’s rhetorical challenges.',
    verifiedExcerpts: [
      {
        location: 'Note Section 1',
        text: 'Macbeth acknowledges Duncan’s double trust ("kinsman and his subject") before admitting only "vaulting ambition" spurs him on.',
      },
    ],
  },
];

export const INITIAL_TUTOR_HISTORY: TutorHistoryEntry[] = [];

export const INITIAL_TUTOR_SCENARIOS: TutorScenario[] = [
  {
    id: 'scen-bio',
    subjectId: 'bio',
    topicId: 'bio-respiration',
    topicTitle: 'Aerobic vs. Anaerobic Respiration',
    linkedResourceId: 'res-bio-pdf',
    openingPrompt:
      'Before we look at the full ATP numbers, suppose a muscle cell suddenly runs out of oxygen during a sprint. Which stage of respiration can still keep running, and where inside the cell does it happen?',
    sourceGroundingNote:
      'Grounded in Bio_Ch4_Cellular_Respiration_Handout.pdf (Pages 2 & 4). Source quotes are separated from supplemental tutor explanations.',
    choices: [
      {
        id: 'bio-c1',
        label: 'Test common misconception: Krebs cycle continues without oxygen',
        studentResponse:
          'I think the Krebs cycle keeps running in the mitochondria to make most of the ATP, even without oxygen.',
        isMisconception: true,
        misconceptionLabel: 'Misconception identified: Oxygen dependency of mitochondrial stages',
        tutorFeedback:
          'Good instinct to think about where most ATP comes from, but let’s check what stops when oxygen disappears.',
        sourceCitation: {
          resourceTitle: 'Bio_Ch4_Cellular_Respiration_Handout.pdf',
          location: 'Page 2, Paragraph 1',
          quote:
            'Glycolysis occurs in the cytoplasm of the cell and does not require oxygen, producing a net yield of 2 ATP and 2 NADH per glucose molecule.',
        },
        tutorExplanation:
          'Although the Krebs cycle does not use oxygen directly as a reactant, it relies on NAD⁺ and FAD recycled by the electron transport chain. Without oxygen as the final electron acceptor, the chain backs up and the Krebs cycle halts too—leaving only glycolysis active in the cytoplasm.',
        analogyExplanation:
          'Think of a factory assembly line (Krebs cycle) loading crates onto delivery trucks (NADH) heading to a port (oxygen). If the port closes (no oxygen), trucks back up into the factory and the assembly line itself has to stop—only the small workshop outside the gate (glycolysis in the cytoplasm) can keep running.',
        hints: [
          'Hint 1 (Location): Look at Page 2 of your handout. Which single stage takes place outside the mitochondrion in the cytoplasm?',
          'Hint 2 (Purpose of Fermentation): Glycolysis needs NAD⁺ to keep splitting glucose. Anaerobic fermentation regenerates NAD⁺ so those 2 ATP per glucose can still be made.',
        ],
        followUpQuestion:
          'So if only glycolysis keeps running, why does the cell convert pyruvate into lactate in human muscle cells?',
        followUpAnswerGuide:
          'To oxidise NADH back into NAD⁺ so glycolysis does not stall for lack of electron carriers.',
      },
      {
        id: 'bio-c2',
        label: 'Reason accurately: Glycolysis continues in the cytoplasm',
        studentResponse:
          'Glycolysis can still happen in the cytoplasm because it does not require oxygen, producing 2 net ATP.',
        isMisconception: false,
        tutorFeedback:
          'Spot on. You separated location and oxygen requirement clearly.',
        sourceCitation: {
          resourceTitle: 'Bio_Ch4_Cellular_Respiration_Handout.pdf',
          location: 'Page 4, Table 4.2',
          quote:
            'The Krebs cycle and electron transport chain take place inside the mitochondrion, generating approximately 30 to 32 additional ATP molecules when oxygen acts as the final electron acceptor.',
        },
        tutorExplanation:
          'Because glycolysis occurs in the cytosol and requires no oxygen, it acts as the emergency pathway. Now let’s test the next link: what prevents glycolysis from grinding to a halt once all available NAD⁺ is turned into NADH?',
        analogyExplanation:
          'Imagine glycolysis as a bucket brigade passing electrons into empty NAD⁺ buckets. If no one empties the full NADH buckets at the mitochondrial chain, every bucket fills up and the brigade stops—fermentation dumps the electrons onto pyruvate to free the buckets again.',
        hints: [
          'Hint 1: Every round of glycolysis reduces NAD⁺ to NADH. If NADH never drops off its electrons, NAD⁺ runs out.',
          'Hint 2: In human cells, pyruvate accepts those electrons from NADH to form lactic acid (lactate), freeing NAD⁺ again.',
        ],
        followUpQuestion:
          'What happens to the net ATP yield per glucose molecule compared with full aerobic respiration?',
        followUpAnswerGuide:
          'It drops sharply from roughly 32–34 ATP (aerobic) down to just 2 net ATP (anaerobic glycolysis).',
      },
    ],
  },
  {
    id: 'scen-math',
    subjectId: 'math',
    topicId: 'math-discriminant',
    topicTitle: 'Quadratic Discriminant & Root Nature',
    linkedResourceId: 'res-math-doc',
    openingPrompt:
      'Consider the quadratic equation 2x² - 8x + 8 = 0. Without solving for x first, what does the discriminant tell us about how its parabola meets the x-axis?',
    sourceGroundingNote:
      'Grounded in Quadratics & Discriminant Worked Examples (Google Doc, Sections 2–3).',
    choices: [
      {
        id: 'math-c1',
        label: 'Test common misconception: Δ = 0 means no real solutions',
        studentResponse:
          'When I calculate (-8)² - 4(2)(8), I get 64 - 64 = 0. Since the discriminant is zero, does that mean there are zero roots?',
        isMisconception: true,
        misconceptionLabel: 'Misconception identified: Confusing Δ = 0 with "zero roots"',
        tutorFeedback:
          'Your arithmetic (64 - 64 = 0) is completely accurate—it’s the interpretation of "zero" that tricks many students.',
        sourceCitation: {
          resourceTitle: 'Quadratics & Discriminant Worked Examples',
          location: 'Section 2: The Discriminant',
          quote:
            'When b² - 4ac = 0, the vertex rests tangent to the x-axis, yielding one repeated real root.',
        },
        tutorExplanation:
          'Think about the quadratic formula: x = (-b ± √Δ) / 2a. When Δ = 0, you are adding and subtracting √0 = 0. You still get a valid number (-b / 2a), not "no solution"! Both ± branches collapse onto the same single x-intercept.',
        analogyExplanation:
          'Picture lowering a U-shaped bowl toward a tabletop (the x-axis). When Δ > 0, the bowl dips below the table leaving two intersection marks. When Δ = 0, the bottom of the bowl rests lightly on the table at exactly one point.',
        hints: [
          'Hint 1 (Formula check): Substitute Δ = 0 into (-b ± √Δ) / (2a). What happens to the ± sign?',
          'Hint 2 (Graph check): Divide 2x² - 8x + 8 = 0 by 2 to get x² - 4x + 4 = (x - 2)² = 0. Where is its vertex?',
        ],
        followUpQuestion:
          'If Δ were negative instead (say -12), what would happen inside √Δ in the real number system?',
        followUpAnswerGuide:
          'We would be taking the square root of a negative number, so there are zero real x-intercepts.',
      },
      {
        id: 'math-c2',
        label: 'Reason accurately: Δ = 0 gives one repeated real root',
        studentResponse:
          'b² - 4ac = 64 - 64 = 0, so the ±√0 disappears and the parabola just touches the x-axis at one vertex point.',
        isMisconception: false,
        tutorFeedback:
          'Precise reasoning—connecting the algebraic ±√0 collapse directly to the tangent vertex on the graph.',
        sourceCitation: {
          resourceTitle: 'Quadratics & Discriminant Worked Examples',
          location: 'Section 2: The Discriminant',
          quote:
            'When b² - 4ac = 0, the vertex rests tangent to the x-axis, yielding one repeated real root.',
        },
        tutorExplanation:
          'Now try extending this idea to a parameter problem: if x² + kx + 9 = 0 must touch the x-axis at only one point, you set k² - 36 = 0 rather than solving for x.',
        analogyExplanation:
          'You can think of k as sliding the parabola left and right while keeping its tip glued to y = 0: both +6 and -6 place the vertex flush on the axis at symmetrical spots.',
        hints: [
          'Hint 1: Identify a = 1, b = k, c = 9 and substitute into b² - 4ac = 0.',
          'Hint 2: Remember k² = 36 has two valid values for k (+6 and -6).',
        ],
        followUpQuestion:
          'Why are there two values of k (+6 and -6) that each produce a single repeated root?',
        followUpAnswerGuide:
          'One shifts the tangent vertex to x = -3 and the other shifts it symmetrically to x = +3.',
      },
    ],
  },
  {
    id: 'scen-chem',
    subjectId: 'chem',
    topicId: 'chem-limiting',
    topicTitle: 'Limiting Reagents & Molar Ratios',
    linkedResourceId: 'res-chem-image',
    openingPrompt:
      'In the reaction 2Mg + O₂ → 2MgO, you react 12 g of magnesium (M = 24 g/mol) with 12 g of oxygen gas (M = 32 g/mol). Since both masses are 12 g, are the reactants present in equal amounts?',
    sourceGroundingNote:
      'Grounded in Whiteboard Photo — Limiting Reagent Mole Bridge & Lab Sheet Exp_03.',
    choices: [
      {
        id: 'chem-c1',
        label: 'Test common misconception: Equal grams means neither is limiting',
        studentResponse:
          'They are both 12 g, and the ratio is 2:1, so oxygen must be in excess since 12 g matches 12 g? Wait—maybe Mg runs out first because it needs 2?',
        isMisconception: true,
        misconceptionLabel: 'Misconception identified: Comparing raw masses before converting to moles',
        tutorFeedback:
          'You noticed the 2:1 ratio matters, which is great—but comparing 12 g to 12 g directly skips the most important conversion step.',
        sourceCitation: {
          resourceTitle: 'Whiteboard Photo — Limiting Reagent Mole Bridge',
          location: 'Diagram Annotation (Top)',
          quote:
            'Never compare raw gram masses directly; the balanced equation compares moles, not grams.',
        },
        tutorExplanation:
          'Chemical equations count particles (moles), not mass. Because an O₂ molecule (32 g/mol) is heavier than a Mg atom (24 g/mol), 12 g of each contains a different number of moles.',
        analogyExplanation:
          'Suppose a bike needs 2 wheels and 1 frame. Having 10 kg of wheels and 10 kg of frames does not mean they match—frames are heavier, so 10 kg gives far fewer frames than wheels. Convert weight into counts (moles) first.',
        hints: [
          'Hint 1: Calculate n(Mg) = 12 / 24 and n(O₂) = 12 / 32.',
          'Hint 2: You have 0.50 mol Mg and 0.375 mol O₂. For 0.50 mol Mg, the 2:1 equation only needs 0.25 mol O₂!',
        ],
        followUpQuestion:
          'Once you see 0.50 mol Mg only needs 0.25 mol O₂ (and you have 0.375 mol O₂), which reactant runs out first?',
        followUpAnswerGuide:
          'Magnesium is the limiting reagent; 0.125 mol of O₂ remains unreacted in excess.',
      },
      {
        id: 'chem-c2',
        label: 'Convert to moles first: 0.50 mol Mg vs 0.375 mol O₂',
        studentResponse:
          'No—12 g Mg is 0.50 mol, while 12 g O₂ is 0.375 mol. Since 2 mol Mg needs 1 mol O₂, 0.50 mol Mg only needs 0.25 mol O₂, so Mg is limiting.',
        isMisconception: false,
        tutorFeedback:
          'Clean stoichiometric logic—you converted grams to moles and then checked the 2:1 consumption ratio.',
        sourceCitation: {
          resourceTitle: 'Stoichiometry Lab Mass & Mole Calculations',
          location: 'Sheet Exp_03, Rows 4–8',
          quote:
            'Step 1: Divide sample mass (g) by molar mass (g/mol) to obtain moles before dividing by the balanced equation coefficient.',
        },
        tutorExplanation:
          'And notice the bonus check: your theoretical yield of MgO must always be calculated from the limiting reagent (0.50 mol Mg → 0.50 mol MgO), never from the excess O₂.',
        analogyExplanation:
          'Once the limiting ingredient runs out, the remaining excess ingredients sit idle in the bowl—they cannot create extra product.',
        hints: [
          'Hint 1: Molar mass of MgO is 24 + 16 = 40 g/mol.',
        ],
        followUpQuestion:
          'How many grams of MgO can theoretically form from 0.50 mol of limiting Mg?',
        followUpAnswerGuide: '0.50 mol × 40 g/mol = 20 g of MgO.',
      },
    ],
  },
];

export const INITIAL_STUDY_PACKS: Record<string, SubjectStudyPack> = {
  bio: {
    subjectId: 'bio',
    summary: {
      title: 'Cellular Respiration & ATP Pathways',
      coreIdea:
        'Cells extract chemical energy from glucose in staged reactions so energy can be captured efficiently as ATP rather than lost all at once as heat.',
      verifiedSourcePoints: [
        'Glycolysis takes place in the cytoplasm, requires no oxygen, and nets 2 ATP + 2 NADH per glucose (Bio_Ch4_Cellular_Respiration_Handout.pdf, p. 2).',
        'Mitochondrial Krebs cycle + electron transport chain yield ~30–32 ATP when oxygen acts as the final electron acceptor (p. 4).',
        'Proton flow through ATP synthase drives ADP phosphorylation via chemiosmosis (Video Transcript 06:18).',
      ],
      synthesisNotes: [
        'Think of NADH and FADH₂ as rechargeable electron shuttles linking early carbon breakdown to the inner mitochondrial membrane.',
        'Anaerobic fermentation does not make extra ATP directly; its purpose is to recycle NADH back into NAD⁺ so glycolysis does not stall.',
      ],
      commonPitfalls: [
        'Assuming the Krebs cycle operates without oxygen (it stalls when the electron transport chain backs up).',
        'Confusing cytoplasm (glycolysis) with mitochondrial matrix (Krebs cycle) and cristae (electron transport).',
      ],
      sourceRef: 'Bio_Ch4_Cellular_Respiration_Handout.pdf + ATP Synthase Video',
    },
    quiz: [
      {
        id: 'bq1',
        topicId: 'bio-respiration',
        prompt: 'Where inside a eukaryotic cell does glycolysis occur?',
        options: [
          'Mitochondrial matrix',
          'Cytoplasm (cytosol)',
          'Inner mitochondrial membrane',
          'Chloroplast stroma',
        ],
        correctIndex: 1,
        explanation:
          'Glycolysis enzymes are dissolved in the cytoplasm, which is why even cells without mitochondria (like red blood cells and prokaryotes) can run glycolysis.',
        misconceptionNote:
          'Confusing glycolysis location with the Krebs cycle (mitochondrial matrix).',
      },
      {
        id: 'bq2',
        topicId: 'bio-respiration',
        prompt: 'What is the direct role of oxygen in aerobic cellular respiration?',
        options: [
          'It breaks glucose into two pyruvate molecules',
          'It acts as the final electron acceptor at the end of the electron transport chain',
          'It directly phosphorylates ADP inside the cytoplasm',
          'It converts lactic acid back into glucose inside muscle cells',
        ],
        correctIndex: 1,
        explanation:
          'Oxygen accepts low-energy electrons and protons at Complex IV to form water, keeping the electron transport chain flowing.',
        misconceptionNote:
          'Believing oxygen reacts directly with glucose during glycolysis.',
      },
      {
        id: 'bq3',
        topicId: 'bio-respiration',
        prompt: 'Why do muscle cells produce lactate during intense sprinting?',
        options: [
          'To generate 32 extra ATP without mitochondria',
          'To oxidise NADH back into NAD⁺ so glycolysis can continue',
          'To permanently store oxygen inside muscle fibres',
          'To raise cellular pH and speed up enzyme action',
        ],
        correctIndex: 1,
        explanation:
          'Fermentation regenerates NAD⁺ from NADH, allowing glycolysis to keep yielding 2 net ATP per glucose when oxygen is scarce.',
        misconceptionNote:
          'Thinking fermentation itself generates large amounts of ATP.',
      },
      {
        id: 'bq4',
        topicId: 'bio-enzymes',
        prompt: 'What causes an enzyme to lose catalytic activity above its optimum temperature?',
        options: [
          'Its peptide bonds are immediately digested into amino acids',
          'Increased kinetic vibration breaks weak hydrogen bonds, distorting the active site',
          'Substrate molecules freeze and stop colliding with the enzyme',
          'The enzyme turns into ATP to protect the cell',
        ],
        correctIndex: 1,
        explanation:
          'Excess thermal energy disrupts hydrogen and ionic bonds holding the 3D tertiary shape, altering the active site (denaturation).',
        misconceptionNote:
          'Confusing denaturation (3D unfolding) with breaking primary peptide bonds.',
      },
    ],
    flashcards: [
      {
        id: 'bf1',
        topicId: 'bio-respiration',
        front: 'Net ATP and NADH produced by glycolysis per molecule of glucose',
        back: '2 net ATP (4 made, 2 invested) and 2 NADH, occurring in the cytoplasm.',
        sourceRef: 'Bio_Ch4_Handout.pdf · p. 2',
      },
      {
        id: 'bf2',
        topicId: 'bio-respiration',
        front: 'Why does the Krebs cycle stop if oxygen is absent?',
        back: 'Without O₂ as the final electron acceptor, the electron transport chain stalls, NADH cannot be recycled back to NAD⁺, and Krebs cycle dehydrogenases run out of NAD⁺.',
        sourceRef: 'Bio_Ch4_Handout.pdf · p. 4',
      },
      {
        id: 'bf3',
        topicId: 'bio-photosynthesis',
        front: 'Role of ATP and NADPH in the Calvin Cycle',
        back: 'Produced in the light-dependent reactions on thylakoid membranes, they supply energy and reducing power to fix CO₂ into G3P sugars in the stroma.',
        sourceRef: 'Unit 4 Syllabus Guide',
      },
      {
        id: 'bf4',
        topicId: 'bio-enzymes',
        front: 'Why is enzyme denaturation usually irreversible?',
        back: 'The disrupted tertiary 3D folding often exposes hydrophobic regions that tangle together, preventing the active site from refolding into its original shape.',
        sourceRef: 'Unit 3 Lab Notes',
      },
    ],
    slides: [
      {
        id: 'bs1',
        slideNumber: 1,
        title: 'Stage 1: Glycolysis (Cytoplasm)',
        coreIdea: 'Split 6-carbon glucose into two 3-carbon pyruvate molecules without needing oxygen.',
        keyPoints: [
          'Occurs in the cytosol in every living cell type.',
          'Invests 2 ATP early, harvests 4 ATP later → 2 net ATP.',
          'Loads high-energy electrons onto 2 NAD⁺ → 2 NADH.',
        ],
        checkQuestion: 'Why does a cell spend 2 ATP at the start of glycolysis?',
        checkAnswer: 'Phosphorylating glucose destabilises the ring so it can split symmetrically.',
      },
      {
        id: 'bs2',
        slideNumber: 2,
        title: 'Stage 2: Krebs Cycle (Mitochondrial Matrix)',
        coreIdea: 'Strip remaining high-energy electrons from pyruvate carbons and release CO₂.',
        keyPoints: [
          'Pyruvate first loses 1 CO₂ to form 2-carbon Acetyl-CoA.',
          'Each glucose produces 2 turns of the cycle.',
          'Main output is electron carriers (NADH & FADH₂), plus only 2 ATP.',
        ],
        checkQuestion: 'Where do the carbon atoms of exhaled CO₂ come from?',
        checkAnswer: 'From the breakdown of glucose carbons during pyruvate oxidation and the Krebs cycle.',
      },
      {
        id: 'bs3',
        slideNumber: 3,
        title: 'Stage 3: Chemiosmosis & Oxygen’s Role',
        coreIdea: 'Convert electron carrier energy into a proton gradient that spins ATP synthase.',
        keyPoints: [
          'Electrons from NADH/FADH₂ pump H⁺ into the intermembrane space.',
          'H⁺ flows back through ATP synthase to phosphorylate ~28–30 ATP.',
          'Oxygen catches spent electrons + H⁺ to form harmless H₂O.',
        ],
        checkQuestion: 'What happens to H⁺ pumping if cyanide blocks the final electron transfer to O₂?',
        checkAnswer: 'Electron flow stops immediately, the proton gradient collapses, and ATP synthase halts.',
      },
    ],
    mindMap: [
      {
        id: 'mm-glucose',
        label: 'Glucose (C₆)',
        x: 110,
        y: 165,
        category: 'core',
        definition: 'Primary 6-carbon fuel molecule split during glycolysis.',
        sourceRef: 'Bio_Ch4_Handout.pdf, p. 1',
        connections: ['mm-glycolysis'],
      },
      {
        id: 'mm-glycolysis',
        label: 'Glycolysis (Cytoplasm)',
        x: 280,
        y: 165,
        category: 'mechanism',
        definition: 'Oxygen-independent pathway yielding 2 pyruvate, 2 net ATP, and 2 NADH.',
        sourceRef: 'Bio_Ch4_Handout.pdf, p. 2',
        connections: ['mm-krebs', 'mm-fermentation'],
      },
      {
        id: 'mm-fermentation',
        label: 'Lactate Fermentation',
        x: 280,
        y: 295,
        category: 'outcome',
        definition: 'Anaerobic backup that recycles NADH → NAD⁺ so glycolysis continues.',
        sourceRef: 'Bio_Ch4_Handout.pdf, p. 3',
        connections: [],
      },
      {
        id: 'mm-krebs',
        label: 'Krebs Cycle (Matrix)',
        x: 470,
        y: 105,
        category: 'mechanism',
        definition: 'Releases CO₂ and loads NADH + FADH₂ inside the mitochondrial matrix.',
        sourceRef: 'Bio_Ch4_Handout.pdf, p. 4',
        connections: ['mm-etc'],
      },
      {
        id: 'mm-etc',
        label: 'Electron Transport + O₂',
        x: 660,
        y: 165,
        category: 'outcome',
        definition: 'Uses proton gradient & oxygen as final electron acceptor to make ~30 ATP.',
        sourceRef: 'Video Transcript 06:18',
        connections: [],
      },
    ],
    audioOverview: {
      title: 'Aerobic Respiration: Following the Electrons',
      totalDuration: '02:15',
      chapters: [
        {
          id: 'ac1',
          title: '1. Why cells break glucose in steps',
          durationLabel: '00:40',
          script:
            'If a cell burned glucose in a single chemical explosion, nearly all the energy would escape as heat. Instead, cellular respiration lowers glucose energy in controlled steps, passing electrons to carrier molecules like NADH before making ATP.',
        },
        {
          id: 'ac2',
          title: '2. Cytoplasm vs. Mitochondria',
          durationLabel: '00:50',
          script:
            'Step one, glycolysis, happens in the cytoplasm and needs no oxygen. It yields just two net ATP. Only when oxygen is available can the mitochondria run the Krebs cycle and electron transport chain to harvest around thirty more ATP.',
        },
        {
          id: 'ac3',
          title: '3. Why oxygen keeps everything moving',
          durationLabel: '00:45',
          script:
            'Remember that oxygen does not touch glucose directly. Oxygen sits at the very end of the mitochondrial chain catching spent electrons. Remove oxygen, and the traffic jam backs all the way up into the Krebs cycle.',
        },
      ],
    },
    practiceQuestions: [
      {
        id: 'bp1',
        topicId: 'bio-respiration',
        question:
          'A yeast culture is sealed in an airtight flask with glucose solution. Explain why its rate of glucose consumption increases even though it produces far less ATP per glucose molecule.',
        marks: 4,
        hint: 'Compare the ATP yield of aerobic respiration (~32 ATP) with anaerobic fermentation (2 ATP) and think about how the yeast meets its survival ATP demand.',
        markScheme: [
          '1 mark: Identifies anaerobic respiration / ethanol fermentation occurs without oxygen.',
          '1 mark: States anaerobic glycolysis yields only 2 net ATP per glucose (versus ~30–32 aerobically).',
          '1 mark: Explains yeast must metabolise many more glucose molecules per second to supply equivalent ATP.',
          '1 mark: Notes NAD⁺ is regenerated by fermentation so glycolysis can continue.',
        ],
        modelReasoning:
          'Without oxygen, the electron transport chain and Krebs cycle stop, leaving only glycolysis in the cytoplasm, which produces just 2 net ATP per glucose compared with roughly 32 ATP aerobically. To obtain enough ATP for cellular maintenance, the yeast accelerates glycolysis and consumes glucose faster, relying on fermentation to regenerate NAD⁺.',
      },
    ],
  },
  math: {
    subjectId: 'math',
    summary: {
      title: 'Quadratic Discriminants & Vertex Structure',
      coreIdea:
        'The discriminant Δ = b² - 4ac diagnoses how many real x-intercepts a parabola has before you spend time solving.',
      verifiedSourcePoints: [
        'Δ > 0 produces two distinct real roots where the parabola crosses the x-axis twice (Quadratics Google Doc, Sec 2).',
        'Δ = 0 means the vertex touches the x-axis tangentially (one repeated real root).',
        'Δ < 0 indicates zero real roots; the parabola sits entirely above or below the x-axis (Sec 3).',
      ],
      synthesisNotes: [
        'Always rearrange an equation into standard form ax² + bx + c = 0 before reading a, b, and c.',
        'Watch negative signs carefully: squaring a negative b always gives a positive b².',
      ],
      commonPitfalls: [
        'Reading Δ = 0 as "0 roots" instead of "1 repeated real root".',
        'Forgetting parentheses around negative b when calculating b² (e.g., writing -6² = -36 instead of (-6)² = 36).',
      ],
      sourceRef: 'Quadratics & Discriminant Worked Examples (Google Doc)',
    },
    quiz: [
      {
        id: 'mq1',
        topicId: 'math-discriminant',
        prompt: 'What is the discriminant of 3x² - 6x + 3 = 0, and what does it mean?',
        options: [
          'Δ = 0, meaning one repeated real root',
          'Δ = 0, meaning zero real roots',
          'Δ = 72, meaning two distinct real roots',
          'Δ = -72, meaning zero real roots',
        ],
        correctIndex: 0,
        explanation: '(-6)² - 4(3)(3) = 36 - 36 = 0, so the parabola is tangent to the x-axis at one point.',
        misconceptionNote: 'Misinterpreting Δ = 0 as "no roots" or dropping parentheses on (-6)².',
      },
      {
        id: 'mq2',
        topicId: 'math-discriminant',
        prompt: 'For which value of k does x² + kx + 16 = 0 have no real roots?',
        options: ['k = 8', 'k = -10', 'k = 6', 'k = 16'],
        correctIndex: 2,
        explanation: 'For no real roots, k² - 4(1)(16) < 0, so k² < 64, meaning -8 < k < 8. Only k = 6 fits.',
        misconceptionNote: 'Forgetting to test k² < 64 as a two-sided inequality.',
      },
      {
        id: 'mq3',
        topicId: 'math-completing-square',
        prompt: 'Rewrite x² - 10x + 21 in vertex form (x - h)² + k:',
        options: ['(x - 5)² - 4', '(x - 5)² + 4', '(x - 10)² - 79', '(x + 5)² - 4'],
        correctIndex: 0,
        explanation: 'Half of -10 is -5. (x - 5)² = x² - 10x + 25, so subtract 4 to return to +21.',
        misconceptionNote: 'Adding 25 instead of subtracting the excess to keep the expression equivalent.',
      },
    ],
    flashcards: [
      {
        id: 'mf1',
        topicId: 'math-discriminant',
        front: 'Geometric meaning of b² - 4ac = 0',
        back: 'The parabola’s vertex lies directly on the x-axis, giving one repeated real root at x = -b / (2a).',
        sourceRef: 'Quadratics Google Doc · Sec 2',
      },
      {
        id: 'mf2',
        topicId: 'math-completing-square',
        front: 'First step before completing the square on 2x² + 12x + 5',
        back: 'Factor 2 out of the x² and x terms: 2(x² + 6x) + 5, then complete the square inside the bracket.',
        sourceRef: 'Unit 2 Class Notes',
      },
    ],
    slides: [
      {
        id: 'ms1',
        slideNumber: 1,
        title: 'Reading the Discriminant Visually',
        coreIdea: 'Δ = b² - 4ac measures how far the parabola vertex sits from the x-axis.',
        keyPoints: [
          'Δ > 0: Two clean crossings on the x-axis.',
          'Δ = 0: Vertex grazes the x-axis at a single tangent point.',
          'Δ < 0: Vertex stays clear of the x-axis—no real roots.',
        ],
        checkQuestion: 'If a > 0 and Δ < 0, is the parabola entirely above or below the x-axis?',
        checkAnswer: 'Entirely above the x-axis because it opens upward and never touches y = 0.',
      },
      {
        id: 'ms2',
        slideNumber: 2,
        title: 'Avoiding Sign Errors in (-b)² - 4ac',
        coreIdea: 'Treat b and c with explicit brackets whenever substituting.',
        keyPoints: [
          'Example: 2x² - 5x - 3 = 0 → a = 2, b = -5, c = -3.',
          '(-5)² - 4(2)(-3) = 25 + 24 = 49.',
          'Two negatives in -4(a)(c) turn subtraction into addition.',
        ],
        checkQuestion: 'Why does c < 0 with a > 0 guarantee two real roots?',
        checkAnswer: 'Because -4ac becomes positive, making b² - 4ac strictly > 0.',
      },
    ],
    mindMap: [
      {
        id: 'mm-std',
        label: 'ax² + bx + c = 0',
        x: 130,
        y: 165,
        category: 'core',
        definition: 'Standard quadratic form required before reading coefficients a, b, c.',
        sourceRef: 'Quadratics Doc, Sec 1',
        connections: ['mm-delta'],
      },
      {
        id: 'mm-delta',
        label: 'Δ = b² - 4ac',
        x: 340,
        y: 165,
        category: 'mechanism',
        definition: 'Determines root count via the ±√Δ term in the quadratic formula.',
        sourceRef: 'Quadratics Doc, Sec 2',
        connections: ['mm-two', 'mm-one', 'mm-none'],
      },
      {
        id: 'mm-two',
        label: 'Δ > 0 (2 Real Roots)',
        x: 590,
        y: 75,
        category: 'outcome',
        definition: 'Two distinct x-intercepts.',
        sourceRef: 'Sec 2',
        connections: [],
      },
      {
        id: 'mm-one',
        label: 'Δ = 0 (1 Repeated Root)',
        x: 590,
        y: 165,
        category: 'outcome',
        definition: 'Vertex is tangent to the x-axis.',
        sourceRef: 'Sec 2',
        connections: [],
      },
      {
        id: 'mm-none',
        label: 'Δ < 0 (0 Real Roots)',
        x: 590,
        y: 255,
        category: 'outcome',
        definition: 'Parabola never crosses the x-axis.',
        sourceRef: 'Sec 3',
        connections: [],
      },
    ],
    audioOverview: {
      title: 'Why the Discriminant Predicts Parabola Intercepts',
      totalDuration: '01:30',
      chapters: [
        {
          id: 'mc1',
          title: '1. Inside the square root',
          durationLabel: '00:45',
          script:
            'Look at the quadratic formula: minus b, plus or minus the square root of b squared minus four a c, all over two a. That expression inside the square root controls everything about how many real answers exist.',
        },
        {
          id: 'mc2',
          title: '2. Zero means one tangent point, not zero answers',
          durationLabel: '00:45',
          script:
            'When the discriminant equals zero, plus zero and minus zero give the exact same value: minus b over two a. Visually, the vertex sits right on the horizontal axis.',
        },
      ],
    },
    practiceQuestions: [
      {
        id: 'mp1',
        topicId: 'math-discriminant',
        question:
          'Find the set of values of m for which the equation x² + (m - 1)x + m = 0 has two distinct real roots.',
        marks: 4,
        hint: 'Write Δ = (m - 1)² - 4(1)(m) > 0, expand, and factor the resulting quadratic inequality.',
        markScheme: [
          '1 mark: Sets Δ = (m - 1)² - 4m > 0.',
          '1 mark: Expands accurately to m² - 6m + 1 > 0.',
          '1 mark: Finds critical values m = 3 ± 2√2.',
          '1 mark: States correct outer intervals m < 3 - 2√2 or m > 3 + 2√2.',
        ],
        modelReasoning:
          'Setting b² - 4ac > 0 gives (m - 1)² - 4m > 0 → m² - 2m + 1 - 4m > 0 → m² - 6m + 1 > 0. Using the quadratic formula gives critical roots m = (6 ± √32)/2 = 3 ± 2√2. Because the m² coefficient is positive, the inequality holds outside the roots: m < 3 - 2√2 or m > 3 + 2√2.',
      },
    ],
  },
  chem: {
    subjectId: 'chem',
    summary: {
      title: 'Stoichiometry & Limiting Reagents',
      coreIdea:
        'Balanced chemical equations compare particle counts (moles), so raw gram masses must always pass through the molar-mass bridge first.',
      verifiedSourcePoints: [
        'Convert mass (g) to moles using n = m / M before applying stoichiometric ratios (Lab Sheet Exp_03).',
        'The limiting reagent is consumed completely first and dictates maximum theoretical product mass (Whiteboard Photo).',
      ],
      synthesisNotes: [
        'Divide each reactant’s moles by its equation coefficient; the smaller result identifies the limiting reagent cleanly.',
      ],
      commonPitfalls: [
        'Assuming the reactant with fewer grams is automatically the limiting reagent.',
        'Forgetting diatomic molar masses such as O₂ = 32.0 g/mol instead of 16.0 g/mol.',
      ],
      sourceRef: 'Lab Sheet Exp_03 + Whiteboard Mole Bridge Photo',
    },
    quiz: [
      {
        id: 'cq1',
        topicId: 'chem-limiting',
        prompt: 'In 2H₂ + O₂ → 2H₂O, you mix 4.0 mol H₂ with 3.0 mol O₂. Which reactant is limiting?',
        options: ['H₂', 'O₂', 'Both finish simultaneously', 'H₂O'],
        correctIndex: 0,
        explanation: '4.0 mol H₂ requires 2.0 mol O₂. Since 3.0 mol O₂ is available, O₂ is in excess and H₂ limits.',
        misconceptionNote: 'Picking O₂ just because 3.0 is smaller than 4.0 without dividing by coefficients.',
      },
      {
        id: 'cq2',
        topicId: 'chem-periodic',
        prompt: 'Why does first ionisation energy generally increase across Period 3 (Na → Ar)?',
        options: [
          'Inner electron shells increase rapidly across the period',
          'Nuclear charge increases while shielding stays similar, pulling valence electrons closer',
          'Atomic radius expands across the period',
          'Neutrons repel outer electrons',
        ],
        correctIndex: 1,
        explanation: 'Added protons increase effective nuclear attraction on the same outer shell (n = 3).',
        misconceptionNote: 'Thinking electrons added to the same shell create full extra shielding.',
      },
    ],
    flashcards: [
      {
        id: 'cf1',
        topicId: 'chem-limiting',
        front: 'Three-step Mole Bridge for mass-to-mass stoichiometry',
        back: 'Mass of A (g) ÷ M(A) → Moles of A × (coeff B / coeff A) → Moles of B × M(B) → Mass of B (g).',
        sourceRef: 'Whiteboard Photo · Nov 15',
      },
    ],
    slides: [
      {
        id: 'cs1',
        slideNumber: 1,
        title: 'Why Grams Cannot Be Compared Directly',
        coreIdea: 'Different atoms and molecules have different masses, so 10 g of H₂ holds 16× more molecules than 10 g of O₂.',
        keyPoints: [
          'Step 1: Convert every given mass to moles (n = m / M).',
          'Step 2: Divide moles by the balanced coefficient.',
          'Step 3: The smallest ratio is the limiting reagent.',
        ],
        checkQuestion: 'Can a reactant with the larger initial mass still be the limiting reagent?',
        checkAnswer: 'Yes, if it has a much higher molar mass or a larger stoichiometric coefficient.',
      },
    ],
    mindMap: [
      {
        id: 'cm-mass',
        label: 'Given Mass (g)',
        x: 130,
        y: 165,
        category: 'core',
        definition: 'Measured mass on lab balance.',
        sourceRef: 'Lab Sheet Exp_03',
        connections: ['cm-moles'],
      },
      {
        id: 'cm-moles',
        label: 'Moles (n = m / M)',
        x: 340,
        y: 165,
        category: 'mechanism',
        definition: 'Converts mass into particle count.',
        sourceRef: 'Whiteboard Photo',
        connections: ['cm-limit'],
      },
      {
        id: 'cm-limit',
        label: 'Limiting Reagent Check',
        x: 560,
        y: 165,
        category: 'outcome',
        definition: 'Compare n / coefficient to find which reactant runs out first.',
        sourceRef: 'Lab Sheet Exp_03',
        connections: [],
      },
    ],
    audioOverview: {
      title: 'Limiting Reagents Without Guesswork',
      totalDuration: '01:20',
      chapters: [
        {
          id: 'cc1',
          title: '1. The sandwich analogy vs. molar mass',
          durationLabel: '01:20',
          script:
            'Two slices of bread and one slice of cheese make one sandwich, but you never weigh a loaf of bread and a block of cheese in grams to count sandwiches. Chemistry works identically: convert grams to moles first, then compare ratios.',
        },
      ],
    },
    practiceQuestions: [
      {
        id: 'cp1',
        topicId: 'chem-limiting',
        question:
          'Calculate the theoretical mass of MgO produced when 4.8 g of Mg reacts with 4.8 g of O₂ (2Mg + O₂ → 2MgO). [M(Mg)=24, M(O₂)=32, M(MgO)=40 g/mol]',
        marks: 3,
        hint: 'Find n(Mg) and n(O₂) first, then check which runs out.',
        markScheme: [
          '1 mark: n(Mg) = 0.20 mol, n(O₂) = 0.15 mol.',
          '1 mark: Identifies Mg as limiting (0.20 mol Mg needs only 0.10 mol O₂).',
          '1 mark: n(MgO) = 0.20 mol → 8.0 g MgO.',
        ],
        modelReasoning:
          'n(Mg) = 4.8/24 = 0.20 mol and n(O₂) = 4.8/32 = 0.15 mol. Since 2 mol Mg react with 1 mol O₂, 0.20 mol Mg needs 0.10 mol O₂. With 0.15 mol O₂ present, O₂ is in excess and Mg is limiting, yielding 0.20 mol × 40 g/mol = 8.0 g MgO.',
      },
    ],
  },
  hist: {
    subjectId: 'hist',
    summary: {
      title: 'Weimar Fragility & Article 48 (1919–1933)',
      coreIdea:
        'Structural weaknesses in the Weimar Constitution—proportional representation and emergency powers—interacted with economic shocks to erode parliamentary democracy.',
      verifiedSourcePoints: [
        'Between 1930 and 1932, Chancellor Brüning governed repeatedly via Article 48 decrees as Reichstag coalitions collapsed (Historical Inquiry Archive).',
        '1923 Ruhr occupation and currency printing triggered severe hyperinflation (Unit 2 Class Notes).',
      ],
      synthesisNotes: [
        'Avoid blaming Weimar collapse on one single clause; constitutional rules became fatal only under the Great Depression after 1929.',
      ],
      commonPitfalls: [
        'Confusing the 1923 hyperinflation crisis with the 1929 Wall Street Crash deflation/unemployment crisis.',
      ],
      sourceRef: 'Article 48 & Presidential Emergency Decrees (Archive Article)',
    },
    quiz: [
      {
        id: 'hq1',
        topicId: 'hist-weimar',
        prompt: 'Why did proportional representation make Weimar governments unstable?',
        options: [
          'It banned smaller regional parties from standing',
          'Even tiny parties won Reichstag seats, forcing fragile multi-party coalitions',
          'It gave the Chancellor automatic control over the army',
          'It prevented elections from happening after 1923',
        ],
        correctIndex: 1,
        explanation: 'Without a high vote threshold, dozens of splinter parties entered the Reichstag, making majority coalitions hard to sustain.',
        misconceptionNote: 'Confusing proportional representation with single-party authoritarian rule.',
      },
      {
        id: 'hq2',
        topicId: 'hist-versailles',
        prompt: 'Which sequence best explains the 1923 Weimar hyperinflation?',
        options: [
          'Wall Street Crash → US loan recall → bank closures',
          'Ruhr occupation → passive resistance strikes → government printed banknotes without backing',
          'Article 48 decree → abolition of Reichstag → tariff barriers',
          'Golden twenties growth → tax cuts → deflation',
        ],
        correctIndex: 1,
        explanation: 'Printing money to pay striking workers in the French-occupied Ruhr destroyed the Mark’s value.',
        misconceptionNote: 'Mixing up the 1923 hyperinflation with the 1929 Depression.',
      },
    ],
    flashcards: [
      {
        id: 'hf1',
        topicId: 'hist-weimar',
        front: 'How did Article 48 undermine Weimar parliamentary democracy after 1930?',
        back: 'It allowed the President to pass laws by emergency decree without Reichstag approval, normalising rule without elected parliamentary consent.',
        sourceRef: 'Article 48 Archive Article · Para 4',
      },
    ],
    slides: [
      {
        id: 'hs1',
        slideNumber: 1,
        title: 'Two Distinct Economic Shocks: 1923 vs. 1929',
        coreIdea: 'Keep Weimar’s 1923 currency collapse separate from the 1929 mass unemployment crisis.',
        keyPoints: [
          '1923: Hyperinflation after Ruhr occupation (solved by Rentenmark & Dawes Plan).',
          '1924–1929: Relative stability, though dependent on short-term US loans.',
          '1929: Wall Street Crash caused loan recall, mass unemployment, and political radicalisation.',
        ],
        checkQuestion: 'Why did Stresemann warn that Germany was "dancing on a volcano" during the late 1920s?',
        checkAnswer: 'Economic recovery relied heavily on foreign US loans that could be recalled suddenly in a downturn.',
      },
    ],
    mindMap: [
      {
        id: 'hm-pr',
        label: 'Proportional Representation',
        x: 140,
        y: 120,
        category: 'core',
        definition: 'Low threshold created fragmented coalition governments.',
        sourceRef: 'Constitution Notes',
        connections: ['hm-gridlock'],
      },
      {
        id: 'hm-gridlock',
        label: 'Reichstag Gridlock (1930)',
        x: 370,
        y: 165,
        category: 'mechanism',
        definition: 'Parties could not agree on Depression budget cuts.',
        sourceRef: 'Archive Article',
        connections: ['hm-art48'],
      },
      {
        id: 'hm-art48',
        label: 'Article 48 Decrees',
        x: 610,
        y: 165,
        category: 'outcome',
        definition: 'Shifted power from elected parliament to presidential rule.',
        sourceRef: 'Archive Article, Para 4',
        connections: [],
      },
    ],
    audioOverview: {
      title: 'How Weimar’s Constitution Enabled Crisis Rule',
      totalDuration: '01:15',
      chapters: [
        {
          id: 'hc1',
          title: '1. From coalition deadlock to emergency decree',
          durationLabel: '01:15',
          script:
            'Article 48 was originally designed as an emergency safeguard for genuine rebellion. Once the Great Depression split the Reichstag in 1930, chancellors turned that emergency clause into routine governance.',
        },
      ],
    },
    practiceQuestions: [
      {
        id: 'hp1',
        topicId: 'hist-weimar',
        question:
          'Explain how the combination of proportional representation and Article 48 weakened democratic accountability in Germany between 1930 and 1932.',
        marks: 4,
        hint: 'Link coalition failure in the Reichstag directly to reliance on presidential decrees.',
        markScheme: [
          '1 mark: Explains proportional representation produced fragmented multi-party coalitions.',
          '1 mark: Connects 1929 Depression pressures to coalition collapse over economic policy.',
          '1 mark: Shows Article 48 allowed chancellors like Brüning to bypass parliamentary votes.',
          '1 mark: Evaluates loss of democratic legitimacy as voters turned toward extremist parties.',
        ],
        modelReasoning:
          'Because proportional representation enabled many small parties to gain seats, coalitions fractured rapidly when the Great Depression demanded painful spending cuts. Unable to secure Reichstag majorities, Chancellor Brüning relied on President Hindenburg invoking Article 48 decrees, teaching citizens that parliament was ineffective and normalising authoritarian rule.',
      },
    ],
  },
  eng: {
    subjectId: 'eng',
    summary: {
      title: 'Macbeth Act 1 Scene 7: Ambition & Persuasion',
      coreIdea:
        'Shakespeare contrasts Macbeth’s moral reasoning in soliloquy with Lady Macbeth’s sharp rhetorical questioning to show how ambition overrides conscience.',
      verifiedSourcePoints: [
        'Macbeth lists Duncan’s double trust ("kinsman and his subject") before admitting only "vaulting ambition" drives him (Typed Note Sec 1).',
      ],
      synthesisNotes: [
        'Track syntax shifts: Macbeth speaks in hesitant, conditional clauses until Lady Macbeth interrupts with imperatives and conditionals.',
      ],
      commonPitfalls: [
        'Listing literary devices ("metaphor", "rhetorical question") without explaining how they shift character decisions.',
      ],
      sourceRef: 'My Notes: Macbeth Act 1 Scene 7 Turning Points',
    },
    quiz: [
      {
        id: 'eq1',
        topicId: 'eng-macbeth-soliloquy',
        prompt: 'In Act 1 Scene 7, why does Macbeth call Duncan’s virtues "angels, trumpet-tongued"?',
        options: [
          'To celebrate Duncan’s military victory over Norway',
          'To emphasise that Duncan’s goodness will make the murder appear even more monstrous',
          'To argue that Duncan wants Macbeth to take the crown',
          'To show Macbeth has already lost all moral awareness',
        ],
        correctIndex: 1,
        explanation: 'Macbeth recognises that Duncan’s blameless leadership removes any moral excuse for treason.',
        misconceptionNote: 'Reading the line as praise detached from Macbeth’s guilt about assassination.',
      },
    ],
    flashcards: [
      {
        id: 'ef1',
        topicId: 'eng-macbeth-soliloquy',
        front: 'Significance of "vaulting ambition, which o’erleaps itself"',
        back: 'Personifies ambition as a reckless rider leaping too high and falling from the saddle—foreshadowing Macbeth’s own downfall.',
        sourceRef: 'Typed Note · Nov 16',
      },
    ],
    slides: [
      {
        id: 'es1',
        slideNumber: 1,
        title: 'From Moral Hesitation to Fatalism',
        coreIdea: 'Watch how Macbeth’s language shifts across Act 1 Scene 7.',
        keyPoints: [
          'Opening ("If it were done when ’tis done"): conditional syntax reveals dread of consequences.',
          'Middle: Lists roles as kinsman, subject, and host—three duties he would betray.',
          'Closing ("I am settled"): short declarative clause marks surrender to Lady Macbeth’s framing.',
        ],
        checkQuestion: 'Why does Shakespeare open the soliloquy with repeated "If" clauses?',
        checkAnswer: 'To show Macbeth wishes the deed had no ripple effects in moral or political life.',
      },
    ],
    mindMap: [
      {
        id: 'em-loyalty',
        label: 'Double Trust (Kinsman/Host)',
        x: 150,
        y: 120,
        category: 'core',
        definition: 'Ethical reasons Macbeth names against killing Duncan.',
        sourceRef: 'Act 1 Scene 7',
        connections: ['em-ambition'],
      },
      {
        id: 'em-ambition',
        label: 'Vaulting Ambition',
        x: 390,
        y: 165,
        category: 'mechanism',
        definition: 'Sole motive left once moral excuses collapse.',
        sourceRef: 'Typed Note Sec 1',
        connections: ['em-settled'],
      },
      {
        id: 'em-settled',
        label: 'Rhetorical Capitulation',
        x: 620,
        y: 165,
        category: 'outcome',
        definition: 'Lady Macbeth challenges his courage; Macbeth commits.',
        sourceRef: 'Act 1 Scene 7',
        connections: [],
      },
    ],
    audioOverview: {
      title: 'Reading Syntax in Macbeth’s Turning Point',
      totalDuration: '01:10',
      chapters: [
        {
          id: 'ec1',
          title: '1. Conscience vs. persuasion',
          durationLabel: '01:10',
          script:
            'When writing an essay on Act 1 Scene 7, notice that Macbeth talks himself out of the murder before Lady Macbeth enters. The turning point is not ignorance of right and wrong—it is how quickly shame replaces conscience when his manhood is challenged.',
        },
      ],
    },
    practiceQuestions: [
      {
        id: 'ep1',
        topicId: 'eng-rhetoric',
        question:
          'How does Shakespeare use imagery and sentence structure in "Vaulting ambition, which o’erleaps itself / And falls on th’other" to foreshadow Macbeth’s tragedy?',
        marks: 4,
        hint: 'Analyse the equestrian metaphor ("vaulting", "falls") together with the abrupt break as Lady Macbeth enters.',
        markScheme: [
          '1 mark: Identifies the horse-riding / vaulting metaphor for unchecked ambition.',
          '1 mark: Explains "o’erleaps itself" signals self-defeating excess.',
          '1 mark: Connects "falls" to structural tragedy and eventual ruin.',
          '1 mark: Notes the unfinished verse line interrupted by Lady Macbeth’s entrance.',
        ],
        modelReasoning:
          'Shakespeare compares Macbeth’s ambition to an overeager rider who vaults so forcefully that he tumbles off the opposite side of the horse. The kinetic verb "o’erleaps" implies ambition contains the seeds of its own collapse, and leaving the line metrically incomplete at Lady Macbeth’s entrance mirrors Macbeth’s unfinished moral resolve.',
      },
    ],
  },
};

export const INITIAL_SPELLING_WORDS: SpellingWord[] = [
  {
    id: 'sp1',
    word: 'phosphorylation',
    phonetic: '/ˌfɒs.fɒr.ɪˈleɪ.ʃən/',
    partOfSpeech: 'noun',
    definition: 'The biochemical addition of a phosphate group to a molecule, such as converting ADP into ATP.',
    exampleSentence: 'Oxidative phosphorylation produces the majority of ATP during aerobic respiration.',
    memoryNote: 'Starts with phos- (light/phosphorus) + -oryl- + -ation.',
    listType: 'ai-curriculum',
    subjectTag: 'Biology',
    attempts: 0,
    correctCount: 0,
    needsPractice: false,
  },
  {
    id: 'sp2',
    word: 'stoichiometry',
    phonetic: '/ˌstɔɪ.kiˈɒm.ɪ.tri/',
    partOfSpeech: 'noun',
    definition: 'The calculation of quantitative relationships between reactants and products in chemical reactions.',
    exampleSentence: 'Accurate stoichiometry prevents misidentifying the limiting reagent.',
    memoryNote: 'Greek stoicheion (element) + metron (measure): remember the silent "ch" after stoi-.',
    listType: 'ai-curriculum',
    subjectTag: 'Chemistry',
    attempts: 0,
    correctCount: 0,
    needsPractice: false,
  },
  {
    id: 'sp3',
    word: 'proportional',
    phonetic: '/prəˈpɔː.ʃən.əl/',
    partOfSpeech: 'adjective',
    definition: 'Corresponding in size, degree, or political share relative to a whole.',
    exampleSentence: 'Proportional representation enabled small parties to win Reichstag seats in Weimar Germany.',
    memoryNote: 'pro- + portion + -al (no double p after pro-).',
    listType: 'ai-curriculum',
    subjectTag: 'Modern History',
    attempts: 0,
    correctCount: 0,
    needsPractice: false,
  },
  {
    id: 'sp4',
    word: 'soliloquy',
    phonetic: '/səˈlɪl.ə.kwi/',
    partOfSpeech: 'noun',
    definition: 'An act of speaking one’s thoughts aloud when alone on stage, regardless of listeners.',
    exampleSentence: 'Macbeth’s Act 1 Scene 7 soliloquy exposes his conflict between loyalty and ambition.',
    memoryNote: 'solus (alone) + loqui (speak) — ends in -quy.',
    listType: 'ai-curriculum',
    subjectTag: 'English Literature',
    attempts: 0,
    correctCount: 0,
    needsPractice: false,
  },
  {
    id: 'sp5',
    word: 'mitochondrion',
    phonetic: '/ˌmaɪ.təˈkɒn.dri.ən/',
    partOfSpeech: 'noun',
    definition: 'An organelle found in eukaryotic cells where aerobic respiration and ATP synthesis occur.',
    exampleSentence: 'Each mitochondrion has a folded inner membrane called cristae.',
    memoryNote: 'Singular ends in -on; plural is mitochondria (-a).',
    listType: 'ai-curriculum',
    subjectTag: 'Biology',
    attempts: 0,
    correctCount: 0,
    needsPractice: false,
  },
  {
    id: 'sp6',
    word: 'discriminant',
    phonetic: '/dɪˈskrɪm.ɪ.nənt/',
    partOfSpeech: 'noun',
    definition: 'An algebraic expression (b² - 4ac) that distinguishes the number and type of roots of a quadratic.',
    exampleSentence: 'Evaluating the discriminant shows whether the parabola intersects the x-axis.',
    memoryNote: 'Ends in -ant (not -ent), like "distinguish / discriminate".',
    listType: 'ai-curriculum',
    subjectTag: 'Mathematics',
    attempts: 0,
    correctCount: 0,
    needsPractice: false,
  },
  {
    id: 'sp7',
    word: 'hyperinflation',
    phonetic: '/ˌhaɪ.pər.ɪnˈfleɪ.ʃən/',
    partOfSpeech: 'noun',
    definition: 'Monetary inflation occurring at an extraordinarily rapid and accelerating rate.',
    exampleSentence: 'The 1923 Ruhr crisis triggered hyperinflation that wiped out middle-class savings.',
    memoryNote: 'One closed compound word: hyper + inflation.',
    listType: 'custom',
    subjectTag: 'Modern History',
    attempts: 0,
    correctCount: 0,
    needsPractice: false,
  },
];

export const INITIAL_QUIZ_ATTEMPTS: QuizAttemptRecord[] = [];

export const INITIAL_MISTAKES: MistakeRecord[] = [];

export const INITIAL_STUDY_LOGS: StudySessionLog[] = [];

// Starts with 0 minutes for all 14 days; increments strictly from actual completed sessions
export const INITIAL_DAILY_MINUTES: { date: string; minutes: number }[] = Array.from(
  { length: 14 },
  (_, idx) => ({
    date: isoOffset(idx - 13),
    minutes: 0,
  })
);
