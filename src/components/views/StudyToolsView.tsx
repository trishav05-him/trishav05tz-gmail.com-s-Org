import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileText,
  HelpCircle,
  Layers,
  ListChecks,
  Network,
  Pause,
  Play,
  RotateCw,
  Square,
  Volume2,
  XCircle,
} from 'lucide-react';
import { usePlatform } from '../../context/PlatformContext';
import { INITIAL_STUDY_PACKS } from '../../data/demoData';
import { MaterialOrigin, StudyToolTab } from '../../types/platform';
import {
  getCalibratedPractice,
  getCalibratedQuiz,
} from '../../utils/curriculumProfile';
import { MaterialOriginNotice } from '../common/StatusLabels';

const TOOL_TABS: {
  id: StudyToolTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: 'summaries', label: 'AI Summaries', icon: FileText },
  { id: 'quiz', label: 'Quiz Generator', icon: ListChecks },
  { id: 'flashcards', label: 'Flashcards', icon: Layers },
  { id: 'slides', label: 'Revision Slides', icon: BookOpen },
  { id: 'mind-map', label: 'Mind Map', icon: Network },
  { id: 'audio', label: 'Audio Overview', icon: Volume2 },
  { id: 'practice', label: 'Practice Questions', icon: HelpCircle },
];

export const StudyToolsView: React.FC = () => {
  const {
    currentUser,
    curriculumProfile,
    subjects,
    topics,
    resources,
    topicProfiles,
    studyToolSubjectId,
    setStudyToolSubjectId,
    studyToolTopicId,
    setStudyToolTopicId,
    studyToolResourceId,
    setStudyToolResourceId,
    studyToolTab,
    setStudyToolTab,
    recordQuizAttempt,
    recordRecallCheck,
    recordExplanationCheck,
    recordStudySession,
    openInTutor,
  } = usePlatform();

  const availablePacks = Object.keys(INITIAL_STUDY_PACKS);
  const pack =
    INITIAL_STUDY_PACKS[studyToolSubjectId] ?? INITIAL_STUDY_PACKS[availablePacks[0]];
  const activeSubject = subjects.find((s) => s.id === pack.subjectId);

  const subjectTopics = useMemo(
    () => topics.filter((t) => t.subjectId === pack.subjectId),
    [topics, pack.subjectId]
  );

  const subjectResources = useMemo(
    () => resources.filter((r) => r.subjectId === pack.subjectId),
    [resources, pack.subjectId]
  );

  const selectedResource = useMemo(
    () =>
      studyToolResourceId === 'all'
        ? null
        : subjectResources.find((r) => r.id === studyToolResourceId) ?? null,
    [subjectResources, studyToolResourceId]
  );

  const resourceBlocked =
    selectedResource !== null && selectedResource.processingStatus !== 'extracted';

  const resolveOrigin = (topicId?: string, sourceRef?: string): MaterialOrigin => {
    if (selectedResource && selectedResource.processingStatus === 'extracted') {
      return 'student-resource';
    }
    if (topicId) {
      const profile = topicProfiles.find((p) => p.topic.id === topicId);
      if (profile?.assessmentState === 'needs-attention') {
        return 'weakness-targeted';
      }
    }
    if (
      sourceRef &&
      subjectResources.some(
        (r) =>
          r.processingStatus === 'extracted' &&
          (sourceRef.toLowerCase().includes(r.title.slice(0, 10).toLowerCase()) ||
            sourceRef.toLowerCase().includes('doc') ||
            sourceRef.toLowerCase().includes('pdf') ||
            sourceRef.toLowerCase().includes('sheet') ||
            sourceRef.toLowerCase().includes('note') ||
            sourceRef.toLowerCase().includes('photo'))
      )
    ) {
      return 'student-resource';
    }
    return 'general-curriculum';
  };

  const calibratedQuiz = useMemo(
    () => getCalibratedQuiz(pack.subjectId, pack.quiz, curriculumProfile.tier),
    [pack.subjectId, pack.quiz, curriculumProfile.tier]
  );

  const visibleQuiz = useMemo(() => {
    if (studyToolTopicId === 'all') return calibratedQuiz;
    const filtered = calibratedQuiz.filter((q) => q.topicId === studyToolTopicId);
    return filtered.length > 0 ? filtered : calibratedQuiz;
  }, [calibratedQuiz, studyToolTopicId]);

  const visibleFlashcards = useMemo(() => {
    if (studyToolTopicId === 'all') return pack.flashcards;
    const filtered = pack.flashcards.filter((f) => f.topicId === studyToolTopicId);
    return filtered.length > 0 ? filtered : pack.flashcards;
  }, [pack.flashcards, studyToolTopicId]);

  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const [cardIndex, setCardIndex] = useState(0);
  const [cardFlipped, setCardFlipped] = useState(false);
  const [cardFeedback, setCardFeedback] = useState<string | null>(null);

  const [slideIndex, setSlideIndex] = useState(0);
  const [showSlideAnswer, setShowSlideAnswer] = useState(false);

  const [selectedNodeId, setSelectedNodeId] = useState<string>(
    pack.mindMap[0]?.id ?? ''
  );

  const [activeChapterId, setActiveChapterId] = useState<string>(
    pack.audioOverview.chapters[0]?.id ?? ''
  );
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechNotice, setSpeechNotice] = useState<string | null>(null);

  const [practiceDraft, setPracticeDraft] = useState('');
  const [showPracticeHint, setShowPracticeHint] = useState(false);
  const [showPracticeModel, setShowPracticeModel] = useState(false);

  useEffect(() => {
    setQuizAnswers({});
    setQuizSubmitted(false);
    setCardIndex(0);
    setCardFlipped(false);
    setCardFeedback(null);
    setSlideIndex(0);
    setShowSlideAnswer(false);
    setSelectedNodeId(pack.mindMap[0]?.id ?? '');
    setActiveChapterId(pack.audioOverview.chapters[0]?.id ?? '');
    setPracticeDraft('');
    setShowPracticeHint(false);
    setShowPracticeModel(false);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, [pack.subjectId, studyToolTopicId, pack.mindMap, pack.audioOverview.chapters]);

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const quizScore = useMemo(() => {
    return visibleQuiz.reduce(
      (acc, q) => (quizAnswers[q.id] === q.correctIndex ? acc + 1 : acc),
      0
    );
  }, [visibleQuiz, quizAnswers]);

  const handleSubmitQuiz = () => {
    setQuizSubmitted(true);
    const firstMissed = visibleQuiz.find((q) => quizAnswers[q.id] !== q.correctIndex);

    const perTopicMap: Record<string, { correct: number; total: number }> = {};
    for (const q of visibleQuiz) {
      if (!perTopicMap[q.topicId]) perTopicMap[q.topicId] = { correct: 0, total: 0 };
      perTopicMap[q.topicId].total += 1;
      if (quizAnswers[q.id] === q.correctIndex) {
        perTopicMap[q.topicId].correct += 1;
      }
    }
    const perTopicResults = Object.entries(perTopicMap).map(([topicId, counts]) => ({
      topicId,
      ...counts,
    }));

    recordQuizAttempt(
      {
        subjectId: pack.subjectId,
        topicTitle: pack.summary.title,
        score: quizScore,
        total: visibleQuiz.length,
        missedConcept: firstMissed?.misconceptionNote,
      },
      firstMissed
        ? {
            subjectId: pack.subjectId,
            topicId: firstMissed.topicId,
            concept: firstMissed.misconceptionNote,
            detail: `Missed in Study Tools quiz: "${firstMissed.prompt}"`,
          }
        : undefined,
      perTopicResults
    );
  };

  const activeCard =
    visibleFlashcards[cardIndex % Math.max(1, visibleFlashcards.length)] ??
    visibleFlashcards[0];
  const activeSlide = pack.slides[slideIndex] ?? pack.slides[0];
  const selectedNode =
    pack.mindMap.find((n) => n.id === selectedNodeId) ?? pack.mindMap[0];
  const activeChapter =
    pack.audioOverview.chapters.find((c) => c.id === activeChapterId) ??
    pack.audioOverview.chapters[0];
  const activePractice = useMemo(
    () =>
      getCalibratedPractice(
        pack.subjectId,
        pack.practiceQuestions[0],
        curriculumProfile.tier
      ),
    [pack.subjectId, pack.practiceQuestions, curriculumProfile.tier]
  );

  const handleSpeakChapter = () => {
    if (!activeChapter) return;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setSpeechNotice(
        'Browser speech synthesis is unavailable in this environment—use the full written transcript below.'
      );
      return;
    }
    setSpeechNotice(null);
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(activeChapter.script);
    utterance.rate = 0.98;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => {
      setIsSpeaking(false);
      setSpeechNotice('Audio playback could not start here; follow along with the transcript.');
    };
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleStopAudio = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  const summaryOrigin = resolveOrigin(
    studyToolTopicId === 'all' ? subjectTopics[0]?.id : studyToolTopicId,
    selectedResource?.title ?? pack.summary.sourceRef
  );

  return (
    <div className="space-y-6">
      {/* Workbench Header: Subject, Topic/Resource Scopes, and 7 Tool Tabs */}
      <section className="bg-[#0F1B33] border border-slate-800 rounded-xl p-5 sm:p-6 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-semibold text-white">
              Connected Study Tools
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              {currentUser ? (
                <>
                  Questions tailored for{' '}
                  <span className="text-cyan-300 font-medium">
                    {currentUser.gradeLevel} · {currentUser.country} · Age {currentUser.age}
                  </span>{' '}
                  ({curriculumProfile.tierLabel}).
                </>
              ) : (
                'Upper Secondary default · Sign in top-right to tailor questions to your country, grade & age.'
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {availablePacks.map((subjId) => {
              const subj = subjects.find((s) => s.id === subjId);
              const active = pack.subjectId === subjId;
              return (
                <button
                  key={subjId}
                  type="button"
                  onClick={() => {
                    setStudyToolSubjectId(subjId);
                    setStudyToolTopicId('all');
                    setStudyToolResourceId('all');
                  }}
                  className={`px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                    active
                      ? 'bg-cyan-400 text-slate-950 font-semibold'
                      : 'bg-[#0B1528] text-slate-300 border border-slate-800 hover:text-white hover:border-slate-700'
                  }`}
                >
                  {subj?.name ?? subjId}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-800">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Focus topic
            </label>
            <select
              value={studyToolTopicId}
              onChange={(e) => setStudyToolTopicId(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-700 rounded-lg bg-[#0B1528] text-slate-100"
            >
              <option value="all">All {activeSubject?.name} topics</option>
              {subjectTopics.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Source resource context
            </label>
            <select
              value={studyToolResourceId}
              onChange={(e) => setStudyToolResourceId(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-700 rounded-lg bg-[#0B1528] text-slate-100"
            >
              <option value="all">All processed {activeSubject?.name} sources</option>
              {subjectResources.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.title} ({r.processingStatus === 'extracted' ? 'Processed' : 'Not analysed'})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 pt-3 border-t border-slate-800">
          {TOOL_TABS.map((tab) => {
            const Icon = tab.icon;
            const active = studyToolTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStudyToolTab(tab.id)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                  active
                    ? 'bg-[#162647] text-cyan-300 border border-cyan-400/40'
                    : 'bg-[#0B1528] text-slate-300 border border-slate-800 hover:text-white'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 shrink-0 ${active ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Honest Guardrail */}
      {resourceBlocked && selectedResource && (
        <section className="bg-amber-500/10 border border-amber-400/30 rounded-xl p-6 space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-amber-300">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Cannot generate study material from &ldquo;{selectedResource.title}&rdquo;</span>
          </div>
          <p className="text-sm text-amber-100/90 leading-relaxed">
            {selectedResource.accessNotice ||
              'This resource has not been analysed because its text or transcript is unavailable. The platform never invents summary points from unread sources.'}
          </p>
          <button
            type="button"
            onClick={() => setStudyToolResourceId('all')}
            className="px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg"
          >
            Switch back to processed {activeSubject?.name} sources
          </button>
        </section>
      )}

      {/* 1. AI SUMMARIES */}
      {!resourceBlocked && studyToolTab === 'summaries' && (
        <section className="bg-[#0F1B33] border border-slate-800 rounded-xl p-5 sm:p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
            <div className="space-y-1">
              <MaterialOriginNotice
                origin={summaryOrigin}
                sourceRef={selectedResource?.title ?? pack.summary.sourceRef}
              />
              <h3 className="font-display text-xl font-semibold text-white">
                {pack.summary.title}
              </h3>
            </div>
            <button
              type="button"
              onClick={() => openInTutor(pack.subjectId, selectedResource?.id)}
              className="px-3.5 py-2 text-xs font-medium text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400/30 rounded-lg whitespace-nowrap self-start"
            >
              Discuss in AI Tutor
            </button>
          </div>

          <div className="p-4 bg-[#0B1528] border border-cyan-500/30 rounded-xl space-y-1">
            <p className="text-xs font-semibold text-cyan-400">Core principle</p>
            <p className="text-sm sm:text-base text-white leading-relaxed">
              {pack.summary.coreIdea}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2.5">
              <h4 className="text-sm font-semibold text-white">
                Verified points from your sources
              </h4>
              <ul className="space-y-2 text-sm text-slate-300 list-disc pl-5">
                {selectedResource && selectedResource.verifiedExcerpts.length > 0
                  ? selectedResource.verifiedExcerpts.map((ex, i) => (
                      <li key={i} className="leading-relaxed">
                        <span className="font-mono text-xs text-cyan-400">[{ex.location}] </span>
                        {ex.text}
                      </li>
                    ))
                  : pack.summary.verifiedSourcePoints.map((pt, i) => (
                      <li key={i} className="leading-relaxed">
                        {pt}
                      </li>
                    ))}
              </ul>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-white">
                  Conceptual connections (Demonstration synthesis)
                </h4>
                <ul className="space-y-2 text-sm text-slate-300 list-disc pl-5">
                  {pack.summary.synthesisNotes.map((pt, i) => (
                    <li key={i} className="leading-relaxed">
                      {pt}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 bg-amber-500/10 border border-amber-400/30 rounded-xl space-y-1.5">
                <h4 className="text-xs font-semibold text-amber-300">
                  Common exam misconceptions to watch
                </h4>
                <ul className="space-y-1 text-xs text-amber-100/90 list-disc pl-4">
                  {pack.summary.commonPitfalls.map((pit, i) => (
                    <li key={i}>{pit}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 2. QUIZ GENERATION */}
      {!resourceBlocked && studyToolTab === 'quiz' && (
        <section className="bg-[#0F1B33] border border-slate-800 rounded-xl p-5 sm:p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
            <div>
              <h3 className="font-display text-lg font-semibold text-white">
                {activeSubject?.name} Conceptual Quiz ({visibleQuiz.length} questions)
              </h3>
              <p className="text-xs text-slate-400">
                Updates your topic quiz evidence and missed misconceptions in Academic Progress.
              </p>
            </div>
            {quizSubmitted && (
              <button
                type="button"
                onClick={() => {
                  setQuizAnswers({});
                  setQuizSubmitted(false);
                }}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-200 bg-[#13223D] hover:bg-[#192D50] border border-slate-700 rounded-lg whitespace-nowrap self-start"
              >
                Retake quiz
              </button>
            )}
          </div>

          <div className="space-y-6">
            {visibleQuiz.map((q, idx) => {
              const chosen = quizAnswers[q.id];
              const isCorrect = chosen === q.correctIndex;
              const qOrigin = resolveOrigin(q.topicId, q.sourceRef);
              return (
                <div key={q.id} className="space-y-3 pb-5 border-b border-slate-800 last:border-0">
                  <div className="space-y-1">
                    <MaterialOriginNotice origin={qOrigin} sourceRef={q.sourceRef} />
                    <p className="text-sm sm:text-base font-medium text-white">
                      {idx + 1}. {q.prompt}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {q.options.map((opt, optIdx) => {
                      const isPicked = chosen === optIdx;
                      let style =
                        'border-slate-800 bg-[#0B1528] text-slate-200 hover:border-slate-700';
                      if (quizSubmitted) {
                        if (optIdx === q.correctIndex) {
                          style = 'border-emerald-400/70 bg-emerald-500/15 text-emerald-200 font-medium';
                        } else if (isPicked) {
                          style = 'border-rose-400/70 bg-rose-500/15 text-rose-200';
                        }
                      } else if (isPicked) {
                        style = 'border-cyan-400 bg-cyan-500/15 text-white font-medium';
                      }
                      return (
                        <button
                          key={optIdx}
                          type="button"
                          disabled={quizSubmitted}
                          onClick={() =>
                            setQuizAnswers((prev) => ({ ...prev, [q.id]: optIdx }))
                          }
                          className={`p-3 text-left text-sm rounded-lg border transition-colors ${style}`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>

                  {quizSubmitted && (
                    <div
                      className={`p-3.5 rounded-lg border text-xs space-y-1 ${
                        isCorrect
                          ? 'bg-emerald-500/10 border-emerald-400/30 text-emerald-200'
                          : 'bg-amber-500/10 border-amber-400/30 text-amber-200'
                      }`}
                    >
                      <p className="font-semibold flex items-center gap-1.5">
                        {isCorrect ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            Correct reasoning
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5 text-rose-400" />
                            Concept to revisit: {q.misconceptionNote}
                          </>
                        )}
                      </p>
                      <p className="leading-relaxed text-slate-200">{q.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {!quizSubmitted ? (
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-400 tabular-nums">
                {Object.keys(quizAnswers).length} of {visibleQuiz.length} answered
              </span>
              <button
                type="button"
                disabled={Object.keys(quizAnswers).length < visibleQuiz.length}
                onClick={handleSubmitQuiz}
                className="px-5 py-2.5 text-sm font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-40 rounded-lg transition-colors"
              >
                Check answers &amp; update evidence
              </button>
            </div>
          ) : (
            <div className="p-4 bg-[#0B1528] border border-cyan-500/30 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-white tabular-nums">
                  Recorded score: {quizScore} / {visibleQuiz.length}
                </p>
                <p className="text-xs text-slate-400">
                  Saved to Quiz Performance and multi-dimensional topic evidence.
                </p>
              </div>
              <button
                type="button"
                onClick={() => openInTutor(pack.subjectId)}
                className="px-3.5 py-2 text-xs font-medium text-cyan-300 border border-cyan-400/40 rounded-lg hover:bg-cyan-500/10 whitespace-nowrap"
              >
                Review missed ideas in Tutor
              </button>
            </div>
          )}
        </section>
      )}

      {/* 3. FLASHCARDS */}
      {!resourceBlocked && studyToolTab === 'flashcards' && activeCard && (
        <section className="bg-[#0F1B33] border border-slate-800 rounded-xl p-5 sm:p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <MaterialOriginNotice
                origin={resolveOrigin(activeCard.topicId, activeCard.sourceRef)}
                sourceRef={activeCard.sourceRef}
              />
              <h3 className="font-display text-lg font-semibold text-white">
                Independent Recall Flashcards
              </h3>
              <p className="text-xs text-slate-400 tabular-nums">
                Card {(cardIndex % visibleFlashcards.length) + 1} of {visibleFlashcards.length}
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setCardFlipped(false);
                  setCardFeedback(null);
                  setCardIndex(
                    (i) => (i - 1 + visibleFlashcards.length) % visibleFlashcards.length
                  );
                }}
                className="p-2 border border-slate-700 bg-[#0B1528] text-slate-300 hover:text-white rounded-lg"
                aria-label="Previous card"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setCardFlipped(false);
                  setCardFeedback(null);
                  setCardIndex((i) => (i + 1) % visibleFlashcards.length);
                }}
                className="p-2 border border-slate-700 bg-[#0B1528] text-slate-300 hover:text-white rounded-lg"
                aria-label="Next card"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setCardFlipped((f) => !f)}
            className="w-full min-h-[220px] p-6 sm:p-8 rounded-xl border border-slate-700 bg-[#0B1528] hover:border-cyan-400/60 transition-colors flex flex-col items-center justify-center text-center space-y-3"
          >
            <span className="text-xs font-medium text-cyan-400">
              {cardFlipped
                ? 'Source-grounded answer'
                : 'Prompt — recall independently before flipping'}
            </span>
            <p className="font-display text-lg sm:text-xl font-semibold text-white max-w-xl leading-relaxed">
              {cardFlipped ? activeCard.back : activeCard.front}
            </p>
            <span className="inline-flex items-center gap-1.5 text-xs text-slate-400 pt-2">
              <RotateCw className="w-3.5 h-3.5" />
              Click card to flip
            </span>
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  recordRecallCheck(activeCard.topicId, false);
                  setCardFeedback(
                    'Logged recall attempt — topic flagged for further review.'
                  );
                }}
                className="px-3.5 py-2 text-xs font-medium text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-400/30 rounded-lg"
              >
                Could not recall — flag for review
              </button>
              <button
                type="button"
                onClick={() => {
                  recordRecallCheck(activeCard.topicId, true);
                  setCardFeedback(
                    'Logged independent recall check in Academic Progress.'
                  );
                }}
                className="px-3.5 py-2 text-xs font-medium text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg"
              >
                Recalled accurately
              </button>
            </div>
            {cardFeedback && <span className="text-xs text-cyan-300">{cardFeedback}</span>}
          </div>
        </section>
      )}

      {/* 4. AI REVISION SLIDES */}
      {!resourceBlocked && studyToolTab === 'slides' && activeSlide && (
        <section className="bg-[#0F1B33] border border-slate-800 rounded-xl p-5 sm:p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <MaterialOriginNotice
                origin={resolveOrigin(
                  activeSlide.topicId,
                  activeSlide.sourceRef ?? pack.summary.sourceRef
                )}
                sourceRef={activeSlide.sourceRef ?? pack.summary.sourceRef}
              />
              <h3 className="font-display text-lg font-semibold text-white">
                Focused Revision Slides
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-400 tabular-nums">
              Slide {activeSlide.slideNumber} / {pack.slides.length}
            </span>
          </div>

          <div className="p-6 sm:p-8 bg-[#0B1528] border border-cyan-500/30 rounded-xl space-y-5">
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-cyan-400">{activeSubject?.name} Revision</p>
              <h4 className="font-display text-xl sm:text-2xl font-semibold text-white">
                {activeSlide.title}
              </h4>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                {activeSlide.coreIdea}
              </p>
            </div>

            <ul className="space-y-2 text-sm text-slate-200 list-disc pl-5">
              {activeSlide.keyPoints.map((kp, i) => (
                <li key={i}>{kp}</li>
              ))}
            </ul>

            <div className="pt-4 border-t border-slate-800 space-y-2">
              <p className="text-xs font-medium text-cyan-400">Understanding check</p>
              <p className="text-sm text-white">{activeSlide.checkQuestion}</p>
              <button
                type="button"
                onClick={() => setShowSlideAnswer((v) => !v)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#13223D] hover:bg-[#192D50] text-cyan-300 border border-slate-700 rounded-lg"
              >
                <Eye className="w-3.5 h-3.5" />
                {showSlideAnswer ? 'Hide explanation' : 'Reveal explanation'}
              </button>
              {showSlideAnswer && (
                <p className="text-xs sm:text-sm text-slate-300 pt-1">{activeSlide.checkAnswer}</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              disabled={slideIndex === 0}
              onClick={() => {
                setShowSlideAnswer(false);
                setSlideIndex((i) => Math.max(0, i - 1));
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium border border-slate-700 bg-[#0B1528] text-slate-200 rounded-lg disabled:opacity-40 hover:text-white"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous slide
            </button>
            <button
              type="button"
              disabled={slideIndex >= pack.slides.length - 1}
              onClick={() => {
                setShowSlideAnswer(false);
                setSlideIndex((i) => Math.min(pack.slides.length - 1, i + 1));
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium border border-slate-700 bg-[#0B1528] text-slate-200 rounded-lg disabled:opacity-40 hover:text-white"
            >
              Next slide
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      )}

      {/* 5. MIND MAP */}
      {!resourceBlocked && studyToolTab === 'mind-map' && (
        <section className="bg-[#0F1B33] border border-slate-800 rounded-xl p-5 sm:p-6 space-y-5">
          <div className="space-y-0.5">
            <MaterialOriginNotice
              origin={summaryOrigin}
              sourceRef={selectedNode?.sourceRef ?? pack.summary.sourceRef}
            />
            <h3 className="font-display text-lg font-semibold text-white">
              Interactive Concept Mind Map
            </h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            <div className="lg:col-span-8 border border-slate-800 rounded-xl bg-[#0B1528] overflow-x-auto">
              <svg
                viewBox="0 0 780 340"
                className="w-full min-w-[560px] h-auto"
                role="img"
                aria-label={`${activeSubject?.name} concept map`}
              >
                {pack.mindMap.map((node) =>
                  node.connections.map((targetId) => {
                    const target = pack.mindMap.find((n) => n.id === targetId);
                    if (!target) return null;
                    const highlighted =
                      selectedNode?.id === node.id || selectedNode?.id === target.id;
                    return (
                      <line
                        key={`${node.id}-${target.id}`}
                        x1={node.x}
                        y1={node.y}
                        x2={target.x}
                        y2={target.y}
                        stroke={highlighted ? '#22D3EE' : '#334155'}
                        strokeWidth={highlighted ? 2.5 : 1.5}
                      />
                    );
                  })
                )}

                {pack.mindMap.map((node) => {
                  const isSelected = selectedNode?.id === node.id;
                  const fill = isSelected
                    ? '#162647'
                    : node.category === 'core'
                    ? '#0E7490'
                    : '#0F1B33';
                  const stroke = isSelected
                    ? '#22D3EE'
                    : node.category === 'core'
                    ? '#22D3EE'
                    : '#475569';
                  return (
                    <g
                      key={node.id}
                      onClick={() => setSelectedNodeId(node.id)}
                      className="cursor-pointer"
                    >
                      <rect
                        x={node.x - 86}
                        y={node.y - 24}
                        width={172}
                        height={48}
                        rx={10}
                        fill={fill}
                        stroke={stroke}
                        strokeWidth={isSelected ? 2 : 1.2}
                      />
                      <text
                        x={node.x}
                        y={node.y + 4}
                        textAnchor="middle"
                        fill="#F8FAFC"
                        fontSize="12"
                        fontWeight="600"
                      >
                        {node.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            <div className="lg:col-span-4 border border-slate-800 rounded-xl p-5 bg-[#0B1528] space-y-3">
              {selectedNode && (
                <>
                  <p className="text-xs font-mono text-cyan-400">{selectedNode.sourceRef}</p>
                  <h4 className="font-display text-lg font-semibold text-white">
                    {selectedNode.label}
                  </h4>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {selectedNode.definition}
                  </p>
                </>
              )}
            </div>
          </div>
        </section>
      )}

      {/* 6. AUDIO STUDY OVERVIEW */}
      {!resourceBlocked && studyToolTab === 'audio' && (
        <section className="bg-[#0F1B33] border border-slate-800 rounded-xl p-5 sm:p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div className="space-y-0.5">
              <MaterialOriginNotice
                origin={summaryOrigin}
                sourceRef={selectedResource?.title ?? pack.summary.sourceRef}
              />
              <h3 className="font-display text-lg font-semibold text-white">
                {pack.audioOverview.title}
              </h3>
              <p className="text-xs text-slate-400 tabular-nums">
                {pack.audioOverview.totalDuration} · Spoken walkthrough with readable transcript
              </p>
            </div>

            <div className="flex items-center gap-2">
              {!isSpeaking ? (
                <button
                  type="button"
                  onClick={handleSpeakChapter}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg whitespace-nowrap"
                >
                  <Play className="w-3.5 h-3.5" />
                  Listen to chapter
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleStopAudio}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-[#13223D] border border-cyan-400/50 rounded-lg whitespace-nowrap"
                >
                  <Pause className="w-3.5 h-3.5" />
                  Stop audio
                </button>
              )}
              {isSpeaking && (
                <button
                  type="button"
                  onClick={handleStopAudio}
                  className="p-2 border border-slate-700 bg-[#0B1528] rounded-lg text-slate-300 hover:text-white"
                  aria-label="Stop playback"
                >
                  <Square className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {speechNotice && (
            <p className="text-xs text-amber-200 bg-amber-500/10 border border-amber-400/30 rounded-lg p-3">
              {speechNotice}
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            <div className="md:col-span-4 space-y-2">
              {pack.audioOverview.chapters.map((ch) => {
                const active = activeChapter?.id === ch.id;
                return (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => {
                      handleStopAudio();
                      setActiveChapterId(ch.id);
                    }}
                    className={`w-full text-left p-3 rounded-lg border transition-colors flex items-center justify-between gap-2 ${
                      active
                        ? 'bg-[#142444] border-cyan-400/60 text-white'
                        : 'bg-[#0B1528] border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-xs font-medium">{ch.title}</span>
                    <span className="text-xs font-mono text-slate-400 tabular-nums shrink-0">
                      {ch.durationLabel}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="md:col-span-8 p-5 bg-[#0B1528] border border-slate-800 rounded-xl space-y-2">
              <p className="text-xs font-semibold text-cyan-400">{activeChapter?.title}</p>
              <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
                {activeChapter?.script}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* 7. PRACTICE QUESTIONS */}
      {!resourceBlocked && studyToolTab === 'practice' && activePractice && (
        <section className="bg-[#0F1B33] border border-slate-800 rounded-xl p-5 sm:p-6 space-y-5">
          <div className="pb-3 border-b border-slate-800 space-y-0.5">
            <MaterialOriginNotice
              origin={resolveOrigin(activePractice.topicId, activePractice.sourceRef)}
              sourceRef={activePractice.sourceRef ?? pack.summary.sourceRef}
            />
            <h3 className="font-display text-lg font-semibold text-white">
              Structured Explanation Practice
            </h3>
            <p className="text-xs text-slate-400 tabular-nums">
              {activeSubject?.name} · {activePractice.marks} marks · Write your full explanation to log an explanation check.
            </p>
          </div>

          <p className="text-base font-medium text-white leading-relaxed">
            {activePractice.question}
          </p>

          <textarea
            rows={4}
            value={practiceDraft}
            onChange={(e) => setPracticeDraft(e.target.value)}
            placeholder="Write your full step-by-step explanation here..."
            className="w-full p-3.5 text-sm bg-[#0B1528] border border-slate-700 text-slate-100 placeholder:text-slate-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400"
          />

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setShowPracticeHint((v) => !v)}
              className="px-3.5 py-2 text-xs font-medium text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400/30 rounded-lg"
            >
              {showPracticeHint ? 'Hide hint' : 'Show hint'}
            </button>
            <button
              type="button"
              onClick={() => {
                const nextState = !showPracticeModel;
                setShowPracticeModel(nextState);
                if (nextState && practiceDraft.trim().length >= 15) {
                  recordExplanationCheck(activePractice.topicId, true);
                  recordStudySession({
                    subjectId: pack.subjectId,
                    activity: `Explanation Practice (${activePractice.marks} marks)`,
                    durationMinutes: 12,
                    outcomeNote: 'Drafted written explanation and verified against mark scheme.',
                  });
                }
              }}
              className="px-3.5 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg"
            >
              {showPracticeModel
                ? 'Hide mark scheme & model reasoning'
                : 'Check mark scheme & record explanation'}
            </button>
          </div>

          {showPracticeHint && (
            <div className="p-4 bg-cyan-500/10 border border-cyan-400/30 rounded-xl text-sm text-slate-200">
              <span className="font-semibold text-cyan-300">Hint: </span>
              {activePractice.hint}
            </div>
          )}

          {showPracticeModel && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-[#0B1528] border border-slate-800 rounded-xl space-y-2">
                <h4 className="text-xs font-semibold text-cyan-400">Mark scheme criteria</h4>
                <ul className="space-y-1.5 text-xs text-slate-300 list-disc pl-4">
                  {activePractice.markScheme.map((m, i) => (
                    <li key={i}>{m}</li>
                  ))}
                </ul>
              </div>
              <div className="p-4 bg-[#0B1528] border border-slate-800 rounded-xl space-y-2">
                <h4 className="text-xs font-semibold text-emerald-400">Model reasoning</h4>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  {activePractice.modelReasoning}
                </p>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
};
