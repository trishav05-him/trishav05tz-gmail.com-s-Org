import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { APP_CONFIG } from '../config/appConfig';
import {
  INITIAL_DAILY_MINUTES,
  INITIAL_MISTAKES,
  INITIAL_QUIZ_ATTEMPTS,
  INITIAL_RESOURCES,
  INITIAL_SPELLING_WORDS,
  INITIAL_STUDY_LOGS,
  INITIAL_SUBJECTS,
  INITIAL_TASKS,
  INITIAL_TIMETABLE,
  INITIAL_TOPICS,
  INITIAL_TUTOR_HISTORY,
} from '../data/demoData';
import {
  buildIntelligentRecommendations,
  CurriculumContextInput,
  evaluateTopicUnderstanding,
} from '../engine/academicIntelligence';
import { resolveCurriculumTier } from '../utils/curriculumProfile';
import {
  ConfidenceLevel,
  ExplanationStyle,
  MistakeRecord,
  NavigationSection,
  QuizAttemptRecord,
  RecommendationOverride,
  ResourceItem,
  SpellingWord,
  StudyRecommendation,
  StudySessionLog,
  StudyToolTab,
  SubjectItem,
  TaskItem,
  TimetableSlot,
  TopicItem,
  TopicUnderstandingProfile,
  TutorHistoryEntry,
  UnderstandingStatus,
} from '../types/platform';

const STORAGE_KEY = 'academic_workspace_clean_v2';

export interface UserAccount {
  name: string;
  email: string;
  country: string;
  gradeLevel: string;
  age: number;
}

export interface CurriculumProfileState extends CurriculumContextInput {
  isPersonalized: boolean;
}

interface PersistedState {
  currentUser: UserAccount | null;
  onboardingDismissed: boolean;
  subjects: SubjectItem[];
  topics: TopicItem[];
  timetable: TimetableSlot[];
  tasks: TaskItem[];
  resources: ResourceItem[];
  spellingWords: SpellingWord[];
  quizAttempts: QuizAttemptRecord[];
  mistakes: MistakeRecord[];
  studyLogs: StudySessionLog[];
  tutorHistory: TutorHistoryEntry[];
  preferredExplanationStyle: ExplanationStyle;
  recommendationOverrides: Record<string, RecommendationOverride>;
  dailyMinutes: { date: string; minutes: number }[];
  availableStudyMinutes: number;
}

interface PlatformContextValue extends PersistedState {
  curriculumProfile: CurriculumProfileState;
  onboardingOpen: boolean;
  onboardingInitialStep: 1 | 2 | 3;
  openOnboardingWizard: (step?: 1 | 2 | 3) => void;
  closeOnboardingWizard: (dismiss?: boolean) => void;
  completeOnboarding: (profile: UserAccount) => void;
  updateStudentProfile: (updates: Partial<UserAccount>) => void;
  signInUser: (user: UserAccount) => void;
  signOutUser: () => void;
  activeSection: NavigationSection;
  setActiveSection: (section: NavigationSection) => void;
  selectedSubjectId: string;
  setSelectedSubjectId: (id: string) => void;
  tutorTargetSubjectId: string;
  setTutorTargetSubjectId: (id: string) => void;
  tutorTargetResourceId: string | null;
  setTutorTargetResourceId: (id: string | null) => void;
  studyToolSubjectId: string;
  setStudyToolSubjectId: (id: string) => void;
  studyToolTopicId: string | 'all';
  setStudyToolTopicId: (id: string | 'all') => void;
  studyToolResourceId: string | 'all';
  setStudyToolResourceId: (id: string | 'all') => void;
  studyToolTab: StudyToolTab;
  setStudyToolTab: (tab: StudyToolTab) => void;
  topicProfiles: TopicUnderstandingProfile[];
  recommendations: StudyRecommendation[];
  setAvailableStudyMinutes: (mins: number) => void;
  toggleTaskCompleted: (taskId: string) => void;
  toggleTaskTodayFocus: (taskId: string) => void;
  addTask: (task: Omit<TaskItem, 'id' | 'completed'>) => void;
  updateTask: (taskId: string, updates: Partial<Omit<TaskItem, 'id'>>) => void;
  deleteTask: (taskId: string) => void;
  addSubject: (subject: Omit<SubjectItem, 'id'>) => void;
  addTopic: (topic: Omit<TopicItem, 'id' | 'lastReviewed' | 'evidence' | 'studentConfidence' | 'difficulty'> & Partial<Pick<TopicItem, 'difficulty' | 'studentConfidence'>>) => void;
  updateTopicStatus: (topicId: string, status: UnderstandingStatus, note?: string) => void;
  setTopicConfidence: (topicId: string, confidence: ConfidenceLevel) => void;
  recordRecallCheck: (topicId: string, understood: boolean) => void;
  recordExplanationCheck: (topicId: string, passed: boolean) => void;
  addTimetableSlot: (slot: Omit<TimetableSlot, 'id'>) => void;
  removeTimetableSlot: (slotId: string) => void;
  addResource: (resource: Omit<ResourceItem, 'id' | 'addedAt'>) => void;
  updateResourceTopics: (resourceId: string, identifiedTopics: string[]) => void;
  recordQuizAttempt: (
    attempt: Omit<QuizAttemptRecord, 'id' | 'date'>,
    newMistake?: Omit<MistakeRecord, 'id' | 'occurrences' | 'lastSeen' | 'resolved'>,
    perTopicResults?: { topicId: string; correct: number; total: number }[]
  ) => void;
  resolveMistake: (mistakeId: string) => void;
  recordStudySession: (log: Omit<StudySessionLog, 'id' | 'date'>) => void;
  recordTutorFeedback: (entry: Omit<TutorHistoryEntry, 'id' | 'date'>) => void;
  setPreferredExplanationStyle: (style: ExplanationStyle) => void;
  respondToRecommendation: (rec: StudyRecommendation, override: RecommendationOverride) => void;
  recordSpellingResult: (wordId: string, isCorrect: boolean) => void;
  addCustomSpellingWord: (
    word: Omit<SpellingWord, 'id' | 'attempts' | 'correctCount' | 'needsPractice' | 'listType'>
  ) => void;
  openInTutor: (subjectId: string, resourceId?: string) => void;
  openInStudyTools: (subjectId: string, tab?: StudyToolTab, topicId?: string, resourceId?: string) => void;
  openInSubject: (subjectId: string) => void;
  resetDemoData: () => void;
}

const defaultPersistedState = (): PersistedState => ({
  currentUser: null,
  onboardingDismissed: false,
  subjects: INITIAL_SUBJECTS,
  topics: INITIAL_TOPICS,
  timetable: INITIAL_TIMETABLE,
  tasks: INITIAL_TASKS,
  resources: INITIAL_RESOURCES,
  spellingWords: INITIAL_SPELLING_WORDS,
  quizAttempts: INITIAL_QUIZ_ATTEMPTS,
  mistakes: INITIAL_MISTAKES,
  studyLogs: INITIAL_STUDY_LOGS,
  tutorHistory: INITIAL_TUTOR_HISTORY,
  preferredExplanationStyle: 'step-by-step',
  recommendationOverrides: {},
  dailyMinutes: INITIAL_DAILY_MINUTES,
  availableStudyMinutes: APP_CONFIG.defaultDailyStudyMinutes,
});

function loadInitialState(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultPersistedState();
    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    return {
      ...defaultPersistedState(),
      ...parsed,
    };
  } catch {
    return defaultPersistedState();
  }
}

const PlatformContext = createContext<PlatformContextValue | null>(null);

export const PlatformProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<PersistedState>(loadInitialState);
  const [activeSection, setActiveSection] = useState<NavigationSection>('dashboard');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('bio');
  const [tutorTargetSubjectId, setTutorTargetSubjectId] = useState<string>('bio');
  const [tutorTargetResourceId, setTutorTargetResourceId] = useState<string | null>('res-bio-pdf');
  const [studyToolSubjectId, setStudyToolSubjectId] = useState<string>('bio');
  const [studyToolTopicId, setStudyToolTopicId] = useState<string | 'all'>('all');
  const [studyToolResourceId, setStudyToolResourceId] = useState<string | 'all'>('all');
  const [studyToolTab, setStudyToolTab] = useState<StudyToolTab>('summaries');
  const [onboardingOpen, setOnboardingOpen] = useState<boolean>(
    () => !state.currentUser && !state.onboardingDismissed
  );
  const [onboardingInitialStep, setOnboardingInitialStep] = useState<1 | 2 | 3>(1);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage quota errors gracefully
    }
  }, [state]);

  const todayISO = new Date().toISOString().slice(0, 10);

  const curriculumProfile = useMemo<CurriculumProfileState>(() => {
    const country = state.currentUser?.country ?? APP_CONFIG.defaultCountry;
    const gradeLevel = state.currentUser?.gradeLevel ?? APP_CONFIG.defaultYearLevel;
    const age = state.currentUser?.age ?? APP_CONFIG.defaultAge;
    const resolved = resolveCurriculumTier(country, gradeLevel, age);
    return {
      country,
      gradeLevel,
      age,
      tier: resolved.tier,
      tierLabel: resolved.tierLabel,
      systemName: resolved.systemName,
      isPersonalized: Boolean(state.currentUser),
    };
  }, [state.currentUser]);

  const topicProfiles = useMemo(
    () => evaluateTopicUnderstanding(state.topics, state.subjects, state.mistakes),
    [state.topics, state.subjects, state.mistakes]
  );

  const recommendations = useMemo(
    () =>
      buildIntelligentRecommendations({
        subjects: state.subjects,
        topics: state.topics,
        tasks: state.tasks,
        resources: state.resources,
        mistakes: state.mistakes,
        timetable: state.timetable,
        availableStudyMinutes: state.availableStudyMinutes,
        curriculumProfile: curriculumProfile.isPersonalized ? curriculumProfile : undefined,
      }),
    [
      state.subjects,
      state.topics,
      state.tasks,
      state.resources,
      state.mistakes,
      state.timetable,
      state.availableStudyMinutes,
      curriculumProfile,
    ]
  );

  const openOnboardingWizard = (step: 1 | 2 | 3 = 1) => {
    setOnboardingInitialStep(step);
    setOnboardingOpen(true);
  };

  const closeOnboardingWizard = (dismiss = true) => {
    setOnboardingOpen(false);
    if (dismiss) {
      setState((prev) => ({ ...prev, onboardingDismissed: true }));
    }
  };

  const completeOnboarding = (profile: UserAccount) => {
    setState((prev) => ({
      ...prev,
      currentUser: profile,
      onboardingDismissed: false,
    }));
    setOnboardingOpen(false);
  };

  const updateStudentProfile = (updates: Partial<UserAccount>) => {
    setState((prev) => {
      if (!prev.currentUser) return prev;
      return {
        ...prev,
        currentUser: { ...prev.currentUser, ...updates },
      };
    });
  };

  const signInUser = (user: UserAccount) => {
    setState((prev) => ({
      ...prev,
      currentUser: user,
      onboardingDismissed: false,
    }));
    setOnboardingOpen(false);
  };

  const signOutUser = () => {
    setState((prev) => ({
      ...prev,
      currentUser: null,
      onboardingDismissed: true,
    }));
  };

  const setAvailableStudyMinutes = (mins: number) => {
    setState((prev) => ({ ...prev, availableStudyMinutes: mins }));
  };

  const toggleTaskCompleted = (taskId: string) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t)),
    }));
  };

  const toggleTaskTodayFocus = (taskId: string) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (t.id === taskId ? { ...t, isTodayFocus: !t.isTodayFocus } : t)),
    }));
  };

  const addTask = (task: Omit<TaskItem, 'id' | 'completed'>) => {
    const newTask: TaskItem = {
      ...task,
      urgency: task.urgency ?? 'medium',
      id: `task-${Date.now()}`,
      completed: false,
    };
    setState((prev) => ({ ...prev, tasks: [newTask, ...prev.tasks] }));
  };

  const updateTask = (taskId: string, updates: Partial<Omit<TaskItem, 'id'>>) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (t.id === taskId ? { ...t, ...updates } : t)),
    }));
  };

  const deleteTask = (taskId: string) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => t.id !== taskId),
    }));
  };

  const addSubject = (subject: Omit<SubjectItem, 'id'>) => {
    const id = `subj-${Date.now()}`;
    setState((prev) => ({
      ...prev,
      subjects: [...prev.subjects, { ...subject, id }],
    }));
    setSelectedSubjectId(id);
  };

  const addTopic: PlatformContextValue['addTopic'] = (topic) => {
    const newTopic: TopicItem = {
      id: `topic-${Date.now()}`,
      subjectId: topic.subjectId,
      title: topic.title,
      unit: topic.unit,
      difficulty: topic.difficulty ?? 'standard',
      status: topic.status,
      studentConfidence: topic.studentConfidence ?? 'moderate',
      evidence: {
        quizCorrect: 0,
        quizTotal: 0,
        quizAttemptsCount: 0,
        independentRecallChecks: 0,
        explanationChecksPassed: 0,
      },
      studentNote: topic.studentNote,
      lastReviewed: todayISO,
    };
    setState((prev) => ({ ...prev, topics: [...prev.topics, newTopic] }));
  };

  const updateTopicStatus = (topicId: string, status: UnderstandingStatus, note?: string) => {
    setState((prev) => ({
      ...prev,
      topics: prev.topics.map((t) =>
        t.id === topicId
          ? {
              ...t,
              status,
              studentNote: note !== undefined ? note : t.studentNote,
              lastReviewed: todayISO,
            }
          : t
      ),
    }));
  };

  const setTopicConfidence = (topicId: string, confidence: ConfidenceLevel) => {
    setState((prev) => ({
      ...prev,
      topics: prev.topics.map((t) =>
        t.id === topicId ? { ...t, studentConfidence: confidence } : t
      ),
    }));
  };

  const recordRecallCheck = (topicId: string, understood: boolean) => {
    setState((prev) => ({
      ...prev,
      topics: prev.topics.map((t) =>
        t.id === topicId
          ? {
              ...t,
              status: understood ? 'understood' : 'needs-review',
              lastReviewed: todayISO,
              evidence: {
                ...t.evidence,
                independentRecallChecks: t.evidence.independentRecallChecks + 1,
              },
            }
          : t
      ),
    }));
  };

  const recordExplanationCheck = (topicId: string, passed: boolean) => {
    setState((prev) => ({
      ...prev,
      topics: prev.topics.map((t) =>
        t.id === topicId
          ? {
              ...t,
              lastReviewed: todayISO,
              evidence: {
                ...t.evidence,
                explanationChecksPassed:
                  t.evidence.explanationChecksPassed + (passed ? 1 : 0),
              },
            }
          : t
      ),
    }));
  };

  const addTimetableSlot = (slot: Omit<TimetableSlot, 'id'>) => {
    setState((prev) => ({
      ...prev,
      timetable: [...prev.timetable, { ...slot, id: `tt-${Date.now()}` }],
    }));
  };

  const removeTimetableSlot = (slotId: string) => {
    setState((prev) => ({
      ...prev,
      timetable: prev.timetable.filter((s) => s.id !== slotId),
    }));
  };

  const addResource = (resource: Omit<ResourceItem, 'id' | 'addedAt'>) => {
    const newRes: ResourceItem = {
      ...resource,
      id: `res-${Date.now()}`,
      addedAt: todayISO,
    };
    setState((prev) => ({ ...prev, resources: [newRes, ...prev.resources] }));
  };

  const updateResourceTopics = (resourceId: string, identifiedTopics: string[]) => {
    setState((prev) => ({
      ...prev,
      resources: prev.resources.map((r) =>
        r.id === resourceId ? { ...r, identifiedTopics } : r
      ),
    }));
  };

  const recordStudySession = (log: Omit<StudySessionLog, 'id' | 'date'>) => {
    const newLog: StudySessionLog = {
      ...log,
      id: `log-${Date.now()}`,
      date: todayISO,
    };
    setState((prev) => {
      const updatedDaily = prev.dailyMinutes.map((d) =>
        d.date === todayISO ? { ...d, minutes: d.minutes + log.durationMinutes } : d
      );
      return {
        ...prev,
        studyLogs: [newLog, ...prev.studyLogs],
        dailyMinutes: updatedDaily,
      };
    });
  };

  const recordQuizAttempt: PlatformContextValue['recordQuizAttempt'] = (
    attempt,
    newMistake,
    perTopicResults
  ) => {
    const newAttempt: QuizAttemptRecord = {
      ...attempt,
      id: `qa-${Date.now()}`,
      date: todayISO,
    };

    setState((prev) => {
      let updatedMistakes = prev.mistakes;
      if (newMistake) {
        const existing = prev.mistakes.find(
          (m) => m.subjectId === newMistake.subjectId && m.concept === newMistake.concept
        );
        if (existing) {
          updatedMistakes = prev.mistakes.map((m) =>
            m.id === existing.id
              ? { ...m, occurrences: m.occurrences + 1, lastSeen: todayISO, resolved: false }
              : m
          );
        } else {
          updatedMistakes = [
            {
              ...newMistake,
              id: `mk-${Date.now()}`,
              occurrences: 1,
              lastSeen: todayISO,
              resolved: false,
            },
            ...prev.mistakes,
          ];
        }
      }

      const updatedTopics = perTopicResults
        ? prev.topics.map((t) => {
            const match = perTopicResults.find((r) => r.topicId === t.id);
            if (!match) return t;
            return {
              ...t,
              lastReviewed: todayISO,
              evidence: {
                ...t.evidence,
                quizCorrect: t.evidence.quizCorrect + match.correct,
                quizTotal: t.evidence.quizTotal + match.total,
                quizAttemptsCount: t.evidence.quizAttemptsCount + 1,
              },
            };
          })
        : prev.topics;

      return {
        ...prev,
        topics: updatedTopics,
        quizAttempts: [newAttempt, ...prev.quizAttempts],
        mistakes: updatedMistakes,
      };
    });

    recordStudySession({
      subjectId: attempt.subjectId,
      activity: `Completed Study Quiz: ${attempt.topicTitle}`,
      durationMinutes: 10,
      outcomeNote: `Scored ${attempt.score}/${attempt.total}${
        attempt.missedConcept ? ` · Missed: ${attempt.missedConcept}` : ''
      }`,
    });
  };

  const resolveMistake = (mistakeId: string) => {
    setState((prev) => ({
      ...prev,
      mistakes: prev.mistakes.map((m) => (m.id === mistakeId ? { ...m, resolved: !m.resolved } : m)),
    }));
  };

  const recordTutorFeedback = (entry: Omit<TutorHistoryEntry, 'id' | 'date'>) => {
    setState((prev) => ({
      ...prev,
      preferredExplanationStyle: entry.helpful ? entry.styleUsed : prev.preferredExplanationStyle,
      tutorHistory: [
        { ...entry, id: `th-${Date.now()}`, date: todayISO },
        ...prev.tutorHistory,
      ],
    }));
  };

  const setPreferredExplanationStyle = (style: ExplanationStyle) => {
    setState((prev) => ({ ...prev, preferredExplanationStyle: style }));
  };

  const respondToRecommendation = (
    rec: StudyRecommendation,
    override: RecommendationOverride
  ) => {
    setState((prev) => {
      let nextTasks = prev.tasks;
      if (override.status === 'accepted' || override.status === 'modified') {
        const mins = override.customMinutes ?? rec.estimatedMinutes;
        const act = override.customActivity ?? rec.suggestedActivity;
        const alreadyExists = prev.tasks.some(
          (t) => t.id === `rec-task-${rec.topicId}` && !t.completed
        );
        if (!alreadyExists) {
          nextTasks = [
            {
              id: `rec-task-${rec.topicId}`,
              subjectId: rec.subjectId,
              topicId: rec.topicId,
              title: `Study: ${rec.topicTitle} (${act})`,
              kind: 'revision',
              dueDate: todayISO,
              estimatedMinutes: mins,
              completed: false,
              isTodayFocus: true,
            },
            ...prev.tasks,
          ];
        }
      }
      return {
        ...prev,
        tasks: nextTasks,
        recommendationOverrides: {
          ...prev.recommendationOverrides,
          [rec.id]: override,
        },
      };
    });
  };

  const recordSpellingResult = (wordId: string, isCorrect: boolean) => {
    setState((prev) => ({
      ...prev,
      spellingWords: prev.spellingWords.map((w) =>
        w.id === wordId
          ? {
              ...w,
              attempts: w.attempts + 1,
              correctCount: w.correctCount + (isCorrect ? 1 : 0),
              needsPractice: isCorrect ? w.correctCount + 1 < w.attempts : true,
            }
          : w
      ),
    }));
  };

  const addCustomSpellingWord = (
    word: Omit<SpellingWord, 'id' | 'attempts' | 'correctCount' | 'needsPractice' | 'listType'>
  ) => {
    const newWord: SpellingWord = {
      ...word,
      id: `sp-${Date.now()}`,
      listType: 'custom',
      attempts: 0,
      correctCount: 0,
      needsPractice: false,
    };
    setState((prev) => ({
      ...prev,
      spellingWords: [newWord, ...prev.spellingWords],
    }));
  };

  const openInTutor = (subjectId: string, resourceId?: string) => {
    setTutorTargetSubjectId(subjectId);
    if (resourceId) setTutorTargetResourceId(resourceId);
    setActiveSection('tutor');
  };

  const openInStudyTools = (
    subjectId: string,
    tab: StudyToolTab = 'summaries',
    topicId: string = 'all',
    resourceId: string = 'all'
  ) => {
    setStudyToolSubjectId(subjectId);
    setStudyToolTab(tab);
    setStudyToolTopicId(topicId);
    setStudyToolResourceId(resourceId);
    setActiveSection('study-tools');
  };

  const openInSubject = (subjectId: string) => {
    setSelectedSubjectId(subjectId);
    setActiveSection('subjects');
  };

  const resetDemoData = () => {
    const fresh = defaultPersistedState();
    setState(fresh);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
    setOnboardingInitialStep(1);
    setOnboardingOpen(true);
  };

  return (
    <PlatformContext.Provider
      value={{
        ...state,
        curriculumProfile,
        onboardingOpen,
        onboardingInitialStep,
        openOnboardingWizard,
        closeOnboardingWizard,
        completeOnboarding,
        updateStudentProfile,
        signInUser,
        signOutUser,
        activeSection,
        setActiveSection,
        selectedSubjectId,
        setSelectedSubjectId,
        tutorTargetSubjectId,
        setTutorTargetSubjectId,
        tutorTargetResourceId,
        setTutorTargetResourceId,
        studyToolSubjectId,
        setStudyToolSubjectId,
        studyToolTopicId,
        setStudyToolTopicId,
        studyToolResourceId,
        setStudyToolResourceId,
        studyToolTab,
        setStudyToolTab,
        topicProfiles,
        recommendations,
        setAvailableStudyMinutes,
        toggleTaskCompleted,
        toggleTaskTodayFocus,
        addTask,
        updateTask,
        deleteTask,
        addSubject,
        addTopic,
        updateTopicStatus,
        setTopicConfidence,
        recordRecallCheck,
        recordExplanationCheck,
        addTimetableSlot,
        removeTimetableSlot,
        addResource,
        updateResourceTopics,
        recordQuizAttempt,
        resolveMistake,
        recordStudySession,
        recordTutorFeedback,
        setPreferredExplanationStyle,
        respondToRecommendation,
        recordSpellingResult,
        addCustomSpellingWord,
        openInTutor,
        openInStudyTools,
        openInSubject,
        resetDemoData,
      }}
    >
      {children}
    </PlatformContext.Provider>
  );
};

export function usePlatform() {
  const ctx = useContext(PlatformContext);
  if (!ctx) {
    throw new Error('usePlatform must be used within a PlatformProvider');
  }
  return ctx;
}
