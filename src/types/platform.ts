export type NavigationSection =
  | 'dashboard'
  | 'subjects'
  | 'tutor'
  | 'ai-studio'
  | 'resources'
  | 'study-tools'
  | 'spelling'
  | 'progress';

export type UnderstandingStatus = 'understood' | 'developing' | 'needs-review';
export type ConfidenceLevel = 'low' | 'moderate' | 'high';

export type ResourceType =
  | 'google-doc'
  | 'google-slides'
  | 'google-sheet'
  | 'google-drive'
  | 'youtube'
  | 'article'
  | 'pdf'
  | 'image'
  | 'typed-note';

export type ResourceAccessStatus =
  | 'accessible'
  | 'auth-required'
  | 'restricted';

export type ResourceProcessingStatus =
  | 'extracted'
  | 'transcript-unavailable'
  | 'auth-required'
  | 'restricted'
  | 'metadata-only';

export type ExplanationStyle =
  | 'step-by-step'
  | 'analogy'
  | 'source-comparison';

export type MaterialOrigin =
  | 'student-resource'
  | 'weakness-targeted'
  | 'general-curriculum';

export interface TopicEvidence {
  quizCorrect: number;
  quizTotal: number;
  quizAttemptsCount: number;
  independentRecallChecks: number;
  explanationChecksPassed: number;
}

export interface TopicItem {
  id: string;
  subjectId: string;
  title: string;
  unit: string;
  difficulty: 'foundational' | 'standard' | 'challenging';
  status: UnderstandingStatus;
  studentConfidence: ConfidenceLevel;
  evidence: TopicEvidence;
  studentNote: string;
  lastReviewed: string;
}

export interface TimetableSlot {
  id: string;
  day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri';
  time: string;
  subjectId: string;
  room: string;
}

export type TaskUrgency = 'critical' | 'high' | 'medium' | 'low';

export interface TaskItem {
  id: string;
  subjectId: string;
  topicId?: string;
  title: string;
  kind: 'assignment' | 'assessment' | 'revision';
  urgency?: TaskUrgency;
  dueDate: string;
  estimatedMinutes: number;
  completed: boolean;
  isTodayFocus: boolean;
}

export interface SubjectItem {
  id: string;
  name: string;
  code: string;
  teacher: string;
  accentHex: string;
  currentFocus: string;
}

export interface ResourceItem {
  id: string;
  subjectId: string;
  title: string;
  type: ResourceType;
  accessStatus: ResourceAccessStatus;
  processingStatus: ResourceProcessingStatus;
  identifiedTopics: string[]; // topic IDs or descriptive tags
  accessMode: 'Read-only link' | 'Local file' | 'User note';
  sourceReference: string;
  ownerOrPublisher: string;
  addedAt: string;
  summaryPreview: string;
  accessNotice?: string;
  verifiedExcerpts: {
    location: string;
    text: string;
  }[];
}

export interface TutorHistoryEntry {
  id: string;
  date: string;
  subjectId: string;
  topicId: string;
  topicTitle: string;
  styleUsed: ExplanationStyle;
  helpful: boolean | null;
  note: string;
}

export interface TutorStageChoice {
  id: string;
  label: string;
  studentResponse: string;
  isMisconception: boolean;
  misconceptionLabel?: string;
  tutorFeedback: string;
  sourceCitation?: {
    resourceTitle: string;
    location: string;
    quote: string;
  };
  tutorExplanation: string;
  analogyExplanation: string;
  hints: string[];
  followUpQuestion: string;
  followUpAnswerGuide: string;
}

export interface TutorScenario {
  id: string;
  subjectId: string;
  topicId: string;
  topicTitle: string;
  linkedResourceId: string;
  openingPrompt: string;
  sourceGroundingNote: string;
  choices: TutorStageChoice[];
}

export type StudyToolTab =
  | 'summaries'
  | 'quiz'
  | 'flashcards'
  | 'slides'
  | 'mind-map'
  | 'audio'
  | 'practice';

export interface QuizQuestion {
  id: string;
  topicId: string;
  origin?: MaterialOrigin;
  sourceRef?: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  misconceptionNote: string;
}

export interface FlashcardItem {
  id: string;
  topicId: string;
  origin?: MaterialOrigin;
  front: string;
  back: string;
  sourceRef: string;
}

export interface RevisionSlide {
  id: string;
  topicId?: string;
  origin?: MaterialOrigin;
  slideNumber: number;
  title: string;
  coreIdea: string;
  keyPoints: string[];
  checkQuestion: string;
  checkAnswer: string;
  sourceRef?: string;
}

export interface MindMapNode {
  id: string;
  topicId?: string;
  label: string;
  x: number;
  y: number;
  category: 'core' | 'mechanism' | 'outcome';
  definition: string;
  sourceRef: string;
  connections: string[];
}

export interface AudioChapter {
  id: string;
  title: string;
  durationLabel: string;
  script: string;
}

export interface PracticePrompt {
  id: string;
  topicId: string;
  origin?: MaterialOrigin;
  sourceRef?: string;
  question: string;
  marks: number;
  hint: string;
  markScheme: string[];
  modelReasoning: string;
}

export interface SubjectStudyPack {
  subjectId: string;
  summary: {
    title: string;
    origin?: MaterialOrigin;
    coreIdea: string;
    verifiedSourcePoints: string[];
    synthesisNotes: string[];
    commonPitfalls: string[];
    sourceRef: string;
  };
  quiz: QuizQuestion[];
  flashcards: FlashcardItem[];
  slides: RevisionSlide[];
  mindMap: MindMapNode[];
  audioOverview: {
    title: string;
    origin?: MaterialOrigin;
    totalDuration: string;
    chapters: AudioChapter[];
  };
  practiceQuestions: PracticePrompt[];
}

export interface SpellingWord {
  id: string;
  word: string;
  phonetic: string;
  partOfSpeech: string;
  definition: string;
  exampleSentence: string;
  memoryNote: string;
  listType: 'ai-curriculum' | 'custom' | 'mistake-review';
  subjectTag: string;
  attempts: number;
  correctCount: number;
  needsPractice: boolean;
}

export interface QuizAttemptRecord {
  id: string;
  date: string;
  subjectId: string;
  topicId?: string;
  topicTitle: string;
  score: number;
  total: number;
  missedConcept?: string;
}

export interface MistakeRecord {
  id: string;
  subjectId: string;
  topicId?: string;
  concept: string;
  detail: string;
  occurrences: number;
  lastSeen: string;
  resolved: boolean;
}

export interface StudySessionLog {
  id: string;
  date: string;
  subjectId: string;
  activity: string;
  durationMinutes: number;
  outcomeNote: string;
}

export type RecommendationDecisionStatus = 'pending' | 'accepted' | 'rejected' | 'modified';

export interface RecommendationOverride {
  status: RecommendationDecisionStatus;
  customMinutes?: number;
  customActivity?: 'tutor' | 'quiz' | 'flashcards' | 'practice' | 'summaries';
  rejectReason?: string;
}

export interface StudyRecommendation {
  id: string;
  subjectId: string;
  topicId: string;
  topicTitle: string;
  linkedTaskId?: string;
  linkedTaskTitle?: string;
  daysUntilDeadline?: number;
  suggestedResourceId?: string;
  suggestedResourceTitle?: string;
  suggestedActivity: 'tutor' | 'quiz' | 'flashcards' | 'practice' | 'summaries';
  estimatedMinutes: number;
  priorityScore: number;
  evidenceSummary: string;
  rationale: string;
  fitsTimeBudget: boolean;
}

export interface TopicUnderstandingProfile {
  topic: TopicItem;
  subjectName: string;
  assessmentState: 'not-yet-assessed' | 'early-evidence' | 'needs-attention' | 'developing' | 'solid';
  label: string;
  quizSummary: string;
  recallSummary: string;
  explanationSummary: string;
  confidenceLabel: string;
  activeMisconceptionsCount: number;
  whyExplanation: string;
}
