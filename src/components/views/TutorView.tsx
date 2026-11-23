import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  BookOpenCheck,
  CheckCircle2,
  ExternalLink,
  FileText,
  Globe,
  HelpCircle,
  History,
  Info,
  Lightbulb,
  Loader2,
  MessageSquareText,
  Mic,
  Send,
  Sparkles,
  ThumbsUp,
  Trash2,
} from 'lucide-react';
import { APP_CONFIG } from '../../config/appConfig';
import { usePlatform } from '../../context/PlatformContext';
import { INITIAL_TUTOR_SCENARIOS } from '../../data/demoData';
import { ExplanationStyle, TutorStageChoice } from '../../types/platform';
import { resolveCurriculumTier } from '../../utils/curriculumProfile';
import { LiveVoicePanel } from '../ai/LiveVoicePanel';
import {
  ProcessingStatusIndicator,
  formatResourceTypeLabel,
} from '../common/StatusLabels';

type RailTab = 'sources' | 'history';
type TutorMode = 'gemini-chat' | 'live-voice' | 'demo-walkthrough';
type ChatModelId =
  | 'gemini-4-hydrogen'
  | 'gemini-3.1-flash-lite'
  | 'gemini-4-neon'
  | 'gemini-4-carbon';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  modelLabel?: string;
  sources?: { uri: string; title: string }[];
}

const CHAT_MODEL_OPTIONS: {
  id: ChatModelId;
  label: string;
  hint: string;
}[] = [
  {
    id: 'gemini-4-hydrogen',
    label: 'Gemini 4 Hydrogen (General)',
    hint: 'Balanced everyday tutoring & syllabus guidance',
  },
  {
    id: 'gemini-3.1-flash-lite',
    label: 'Gemini 3.1 Flash Lite (Fast)',
    hint: 'Low-latency quick checks & rapid definitions',
  },
  {
    id: 'gemini-4-neon',
    label: 'Gemini 4 Neon (Interactive STEM)',
    hint: 'Complex multi-step math, science & coding (Billing key)',
  },
  {
    id: 'gemini-4-carbon',
    label: 'Gemini 4 Carbon (Deep Reasoning)',
    hint: 'Deep proofs, root-cause diagnostics & essays (Billing key)',
  },
];

const ROLE_PRESETS = [
  {
    id: 'socratic',
    label: 'Socratic Coach',
    instruction:
      'Guide the student step-by-step using questions and staged hints instead of immediately revealing final answers.',
  },
  {
    id: 'explainer',
    label: 'Concept Explainer',
    instruction:
      'Explain difficult ideas clearly using concrete analogies, then ask one brief check-for-understanding question.',
  },
  {
    id: 'examiner',
    label: 'Mark-Scheme Reviewer',
    instruction:
      'Critique the student’s draft explanation against exam mark-scheme criteria and highlight missing reasoning steps.',
  },
] as const;

export const TutorView: React.FC = () => {
  const {
    currentUser,
    subjects,
    resources,
    mistakes,
    topicProfiles,
    tutorHistory,
    preferredExplanationStyle,
    setPreferredExplanationStyle,
    recordTutorFeedback,
    recordExplanationCheck,
    tutorTargetSubjectId,
    setTutorTargetSubjectId,
    tutorTargetResourceId,
    setTutorTargetResourceId,
    recordStudySession,
    setActiveSection,
  } = usePlatform();

  const curriculumProfile = useMemo(
    () =>
      resolveCurriculumTier(
        currentUser?.country ?? APP_CONFIG.defaultCountry,
        currentUser?.gradeLevel ?? APP_CONFIG.defaultYearLevel,
        currentUser?.age ?? APP_CONFIG.defaultAge
      ),
    [currentUser]
  );

  const activeScenario = useMemo(
    () =>
      INITIAL_TUTOR_SCENARIOS.find((s) => s.subjectId === tutorTargetSubjectId) ??
      INITIAL_TUTOR_SCENARIOS[0],
    [tutorTargetSubjectId]
  );

  const subjectResources = useMemo(
    () => resources.filter((r) => r.subjectId === activeScenario.subjectId),
    [resources, activeScenario.subjectId]
  );

  const attachedResource = useMemo(
    () =>
      subjectResources.find((r) => r.id === tutorTargetResourceId) ??
      subjectResources.find((r) => r.id === activeScenario.linkedResourceId) ??
      subjectResources[0],
    [subjectResources, tutorTargetResourceId, activeScenario.linkedResourceId]
  );

  const subjectMistakes = useMemo(
    () =>
      mistakes.filter(
        (m) => !m.resolved && m.subjectId === activeScenario.subjectId
      ),
    [mistakes, activeScenario.subjectId]
  );

  const topicProfile = useMemo(
    () => topicProfiles.find((p) => p.topic.id === activeScenario.topicId),
    [topicProfiles, activeScenario.topicId]
  );

  const subjectTutorHistory = useMemo(
    () => tutorHistory.filter((h) => h.subjectId === activeScenario.subjectId),
    [tutorHistory, activeScenario.subjectId]
  );

  const activeSubject = subjects.find((s) => s.id === activeScenario.subjectId);

  const [tutorMode, setTutorMode] = useState<TutorMode>('gemini-chat');
  const [railTab, setRailTab] = useState<RailTab>('sources');

  // Gemini multi-turn chat state
  const [chatModel, setChatModel] = useState<ChatModelId>('gemini-4-hydrogen');
  const [rolePresetId, setRolePresetId] = useState<string>('socratic');
  const [useWebSearch, setUseWebSearch] = useState(false);
  const [customRolePrompt, setCustomRolePrompt] = useState<string>(
    ROLE_PRESETS[0].instruction
  );
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [loggedChatCheck, setLoggedChatCheck] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Socratic walkthrough demo state
  const [selectedChoice, setSelectedChoice] = useState<TutorStageChoice | null>(null);
  const [revealedHintCount, setRevealedHintCount] = useState(0);
  const [showFollowUpAnswer, setShowFollowUpAnswer] = useState(false);
  const [customDraft, setCustomDraft] = useState('');
  const [customReflections, setCustomReflections] = useState<
    { id: string; studentText: string; tutorPrompt: string }[]
  >([]);
  const [feedbackGiven, setFeedbackGiven] = useState<string | null>(null);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages, chatLoading]);

  const builtSystemInstruction = useMemo(() => {
    const studentName = currentUser?.name || 'the student';
    const grade = currentUser?.gradeLevel || APP_CONFIG.defaultYearLevel;
    const country = currentUser?.country || APP_CONFIG.defaultCountry;
    const age = currentUser?.age || APP_CONFIG.defaultAge;

    const excerptsText =
      attachedResource &&
      attachedResource.processingStatus === 'extracted' &&
      attachedResource.verifiedExcerpts.length > 0
        ? attachedResource.verifiedExcerpts
            .map((e) => `[${attachedResource.title} - ${e.location}]: ${e.text}`)
            .join(' | ')
        : 'No verified extracted excerpt currently attached.';

    const mistakesText =
      subjectMistakes.length > 0
        ? subjectMistakes.map((m) => `${m.concept} (${m.occurrences}x)`).join('; ')
        : 'None currently flagged.';

    return `${customRolePrompt} Student profile: ${studentName}, ${grade}, ${country} (${curriculumProfile.systemName}), age ${age}, calibration tier: ${curriculumProfile.tierLabel}. Subject: ${activeSubject?.name ?? 'General'} (${activeScenario.topicTitle}). Preferred explanation style: ${preferredExplanationStyle}. Tracked repeated mistakes: ${mistakesText}. Verified source excerpts: ${excerptsText}. Clearly distinguish facts from the student's uploaded excerpts vs your own broader explanation.`;
  }, [
    customRolePrompt,
    currentUser,
    curriculumProfile,
    activeSubject,
    activeScenario.topicTitle,
    preferredExplanationStyle,
    subjectMistakes,
    attachedResource,
  ]);

  const handleSelectScenario = (subjectId: string) => {
    setTutorTargetSubjectId(subjectId);
    const scen = INITIAL_TUTOR_SCENARIOS.find((s) => s.subjectId === subjectId);
    if (scen) setTutorTargetResourceId(scen.linkedResourceId);
    setSelectedChoice(null);
    setRevealedHintCount(0);
    setShowFollowUpAnswer(false);
    setCustomReflections([]);
    setFeedbackGiven(null);
  };

  const handleRolePresetChange = (id: string) => {
    setRolePresetId(id);
    const preset = ROLE_PRESETS.find((r) => r.id === id);
    if (preset) setCustomRolePrompt(preset.instruction);
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;
    const userText = chatInput.trim();
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      text: userText,
    };
    const nextHistory = [...chatMessages, userMsg];
    setChatMessages(nextHistory);
    setChatInput('');
    setChatError(null);
    setLoggedChatCheck(false);
    setChatLoading(true);

    try {
      if (useWebSearch) {
        const res = await fetch('/api/gemini/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: `${userText} (Context: ${activeSubject?.name ?? 'Secondary'} - ${activeScenario.topicTitle})`,
            systemInstruction: builtSystemInstruction,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Search grounding request failed.');
        setChatMessages((prev) => [
          ...prev,
          {
            id: `msg-${Date.now()}-model`,
            role: 'model',
            text: data.text || '',
            modelLabel: 'gemini-4-hydrogen + Google Search',
            sources: data.sources || [],
          },
        ]);
      } else {
        const res = await fetch('/api/gemini/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: chatModel,
            systemInstruction: builtSystemInstruction,
            messages: nextHistory.map((m) => ({ role: m.role, text: m.text })),
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Chat request failed.');
        setChatMessages((prev) => [
          ...prev,
          {
            id: `msg-${Date.now()}-model`,
            role: 'model',
            text: data.reply || '',
            modelLabel: data.model || chatModel,
          },
        ]);
      }
    } catch (err) {
      setChatError(err instanceof Error ? err.message : 'Failed to reach Gemini tutor.');
    } finally {
      setChatLoading(false);
    }
  };

  const handleLogChatProgress = () => {
    recordExplanationCheck(activeScenario.topicId, true);
    recordStudySession({
      subjectId: activeScenario.subjectId,
      activity: `Gemini Tutor Session (${useWebSearch ? 'Search Grounded' : chatModel}): ${activeScenario.topicTitle}`,
      durationMinutes: 15,
      outcomeNote: 'Completed interactive multi-turn explanation check with Gemini Tutor.',
    });
    setLoggedChatCheck(true);
  };

  const handlePickChoice = (choice: TutorStageChoice) => {
    setSelectedChoice(choice);
    setRevealedHintCount(0);
    setShowFollowUpAnswer(false);
    setFeedbackGiven(null);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customDraft.trim()) return;
    const mistakeReminder =
      subjectMistakes.length > 0
        ? `Watch out for your logged pitfall (${subjectMistakes[0].concept}). `
        : '';
    const excerptHint =
      attachedResource &&
      attachedResource.processingStatus === 'extracted' &&
      attachedResource.verifiedExcerpts.length > 0
        ? `${mistakeReminder}Compare your sentence with "${attachedResource.verifiedExcerpts[0].location}" in ${attachedResource.title} and identify one specific mechanism.`
        : `${mistakeReminder}Switch to the Live Gemini Chat tab above for dynamic multi-turn guidance.`;
    setCustomReflections((prev) => [
      ...prev,
      {
        id: `ref-${Date.now()}`,
        studentText: customDraft.trim(),
        tutorPrompt: excerptHint,
      },
    ]);
    setCustomDraft('');
  };

  const handleStyleFeedback = (helpful: boolean, nextStyle?: ExplanationStyle) => {
    const usedStyle = nextStyle ?? preferredExplanationStyle;
    if (nextStyle) setPreferredExplanationStyle(nextStyle);
    recordTutorFeedback({
      subjectId: activeScenario.subjectId,
      topicId: activeScenario.topicId,
      topicTitle: activeScenario.topicTitle,
      styleUsed: usedStyle,
      helpful,
      note: helpful
        ? `Student confirmed ${usedStyle} explanation clarified ${activeScenario.topicTitle}.`
        : `Requested ${usedStyle} alternative explanation.`,
    });
    if (helpful) {
      recordExplanationCheck(activeScenario.topicId, true);
      recordStudySession({
        subjectId: activeScenario.subjectId,
        activity: `AI Tutor Explanation Check: ${activeScenario.topicTitle}`,
        durationMinutes: 15,
        outcomeNote: `Verified understanding via ${usedStyle} explanation.`,
      });
    }
    setFeedbackGiven(
      helpful
        ? 'Saved to Learning History and updated your explanation profile.'
        : `Switched explanation style to ${usedStyle}.`
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Mode & Context Bar */}
      <div className="bg-[#0F1B33] border border-cyan-500/30 rounded-xl p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="text-sm font-semibold text-white">
              Connected Gemini Tutor — {curriculumProfile.tierLabel}
            </p>
            <p className="text-xs text-slate-300 leading-relaxed">
              Context-aware tutoring using your {activeSubject?.name} profile, tracked misconceptions, extracted sources, multi-turn Gemini chat, Live Voice, and Google Search grounding.
            </p>
          </div>
        </div>

        <div className="inline-flex flex-wrap items-center p-1 bg-[#0B1528] border border-slate-800 rounded-lg self-start lg:self-auto">
          <button
            type="button"
            onClick={() => setTutorMode('gemini-chat')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap ${
              tutorMode === 'gemini-chat' ? 'bg-[#162647] text-cyan-300' : 'text-slate-400 hover:text-white'
            }`}
          >
            <MessageSquareText className="w-3.5 h-3.5" />
            Gemini Chat
          </button>
          <button
            type="button"
            onClick={() => setTutorMode('live-voice')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap ${
              tutorMode === 'live-voice' ? 'bg-[#162647] text-cyan-300' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            Live Voice
          </button>
          <button
            type="button"
            onClick={() => setTutorMode('demo-walkthrough')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap ${
              tutorMode === 'demo-walkthrough' ? 'bg-[#162647] text-cyan-300' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            Socratic Demo
          </button>
        </div>
      </div>

      {/* Subject Focus Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-slate-400 mr-1">Subject focus:</span>
          {INITIAL_TUTOR_SCENARIOS.map((scen) => {
            const subj = subjects.find((s) => s.id === scen.subjectId);
            const isActive = scen.id === activeScenario.id;
            return (
              <button
                key={scen.id}
                type="button"
                onClick={() => handleSelectScenario(scen.subjectId)}
                className={`px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-cyan-400 text-slate-950 font-semibold'
                    : 'bg-[#0F1B33] text-slate-300 border border-slate-800 hover:text-white hover:border-slate-700'
                }`}
              >
                {subj?.name}: {scen.topicTitle}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => setActiveSection('resources')}
          className="px-3 py-1.5 text-xs font-medium text-cyan-300 border border-cyan-400/30 hover:bg-cyan-500/10 rounded-lg whitespace-nowrap"
        >
          Manage source files
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Rail: Tabbed Sources | History & Mistakes */}
        <aside className="lg:col-span-4 bg-[#0F1B33] border border-slate-800 rounded-xl p-5 space-y-4">
          <div
            role="tablist"
            aria-label="Tutor context tabs"
            className="grid grid-cols-2 p-1 bg-[#0B1528] border border-slate-800 rounded-lg"
          >
            <button
              type="button"
              role="tab"
              aria-selected={railTab === 'sources'}
              onClick={() => setRailTab('sources')}
              className={`inline-flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
                railTab === 'sources'
                  ? 'bg-[#162647] text-cyan-300'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Sources ({subjectResources.length})
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={railTab === 'history'}
              onClick={() => setRailTab('history')}
              className={`inline-flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
                railTab === 'history'
                  ? 'bg-[#162647] text-cyan-300'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              History ({subjectMistakes.length})
            </button>
          </div>

          {railTab === 'sources' ? (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">
                Only processed {activeSubject?.name} sources are passed as verified context.
              </p>

              <div className="space-y-2">
                {subjectResources.map((res) => {
                  const selected = attachedResource?.id === res.id;
                  return (
                    <button
                      key={res.id}
                      type="button"
                      onClick={() => setTutorTargetResourceId(res.id)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors space-y-1 ${
                        selected
                          ? 'bg-[#142444] border-cyan-400/60'
                          : 'bg-[#0B1528] border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <p className="text-xs font-semibold text-white truncate">{res.title}</p>
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                        <span>{formatResourceTypeLabel(res.type)}</span>
                        <ProcessingStatusIndicator status={res.processingStatus} />
                      </div>
                    </button>
                  );
                })}
              </div>

              {attachedResource && (
                <div className="pt-3 border-t border-slate-800 space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                    <FileText className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Verified excerpts</span>
                  </div>

                  {attachedResource.processingStatus !== 'extracted' ? (
                    <div className="p-3 bg-amber-500/10 border border-amber-400/30 rounded-lg text-xs text-amber-200 leading-relaxed">
                      {attachedResource.accessNotice ||
                        'This resource has not been analysed and cannot be used as tutor context.'}
                    </div>
                  ) : (
                    attachedResource.verifiedExcerpts.map((ex, i) => (
                      <div
                        key={i}
                        className="p-3 bg-[#0B1528] border border-slate-800 rounded-lg space-y-1"
                      >
                        <p className="text-[11px] font-mono text-cyan-400">{ex.location}</p>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          &ldquo;{ex.text}&rdquo;
                        </p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-[#0B1528] border border-slate-800 rounded-lg space-y-1">
                <p className="font-semibold text-slate-200">Current evidence state</p>
                <p className="text-slate-400">
                  {topicProfile
                    ? `${topicProfile.label} · ${topicProfile.quizSummary} · ${topicProfile.explanationSummary}`
                    : 'No prior evidence recorded'}
                </p>
              </div>

              <div className="p-3 bg-[#0B1528] border border-slate-800 rounded-lg space-y-1">
                <p className="font-semibold text-slate-200">Repeated mistakes tracked</p>
                {subjectMistakes.length === 0 ? (
                  <p className="text-slate-400">No unresolved mistakes in {activeSubject?.name}.</p>
                ) : (
                  <ul className="space-y-1 text-amber-300 list-disc pl-4">
                    {subjectMistakes.map((m) => (
                      <li key={m.id}>
                        {m.concept} ({m.occurrences}x)
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="p-3 bg-[#0B1528] border border-slate-800 rounded-lg space-y-1">
                <p className="font-semibold text-slate-200">Explanations that helped before</p>
                {subjectTutorHistory.length === 0 ? (
                  <p className="text-slate-400">
                    Preferred style:{' '}
                    <span className="font-mono text-cyan-300">{preferredExplanationStyle}</span>
                  </p>
                ) : (
                  <ul className="space-y-1.5 text-slate-300">
                    {subjectTutorHistory.slice(0, 3).map((h) => (
                      <li key={h.id}>
                        <span className="font-medium text-cyan-300">{h.styleUsed}:</span> {h.note}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </aside>

        {/* Right Main Column */}
        <div className="lg:col-span-8 space-y-6">
          {/* MODE 1: LIVE GEMINI MULTI-TURN CHATBOT */}
          {tutorMode === 'gemini-chat' && (
            <section className="bg-[#0F1B33] border border-slate-800 rounded-xl p-5 sm:p-6 space-y-4">
              <div className="pb-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="text-xs text-cyan-400 font-medium">
                    {activeSubject?.name} · Multi-Turn Gemini Tutor
                    {currentUser
                      ? ` · ${currentUser.name} (${currentUser.gradeLevel}, ${currentUser.country}, Age ${currentUser.age})`
                      : ''}
                  </p>
                  <h3 className="font-display text-xl font-semibold text-white">
                    {activeScenario.topicTitle}
                  </h3>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setUseWebSearch((v) => !v)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                      useWebSearch
                        ? 'bg-cyan-400 text-slate-950 border-cyan-300 font-semibold'
                        : 'bg-[#0B1528] text-slate-300 border-slate-700 hover:text-white'
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5" />
                    {useWebSearch ? 'Google Search On' : 'Google Search Off'}
                  </button>

                  {chatMessages.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setChatMessages([]);
                        setChatError(null);
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-400 hover:text-white bg-[#0B1528] border border-slate-800 rounded-lg"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Model + Role System Instruction Controls */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Reasoning model
                  </label>
                  <select
                    disabled={useWebSearch}
                    value={useWebSearch ? 'gemini-4-hydrogen' : chatModel}
                    onChange={(e) => setChatModel(e.target.value as ChatModelId)}
                    className="w-full px-3 py-2 text-xs bg-[#0B1528] border border-slate-700 text-slate-100 rounded-lg disabled:opacity-60"
                  >
                    {CHAT_MODEL_OPTIONS.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {useWebSearch
                      ? 'Search Grounding uses gemini-4-hydrogen with live Google Search citations.'
                      : CHAT_MODEL_OPTIONS.find((m) => m.id === chatModel)?.hint}
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-slate-400">
                      Tutor role &amp; system instruction
                    </label>
                    <div className="flex gap-1">
                      {ROLE_PRESETS.map((preset) => (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => handleRolePresetChange(preset.id)}
                          className={`px-2 py-0.5 text-[10px] rounded border ${
                            rolePresetId === preset.id
                              ? 'bg-[#162647] border-cyan-400/50 text-cyan-300'
                              : 'bg-[#0B1528] border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <input
                    type="text"
                    value={customRolePrompt}
                    onChange={(e) => setCustomRolePrompt(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#0B1528] border border-slate-700 text-slate-100 rounded-lg"
                  />
                </div>
              </div>

              {/* Scrollable Multi-Turn Conversation Thread */}
              <div
                ref={chatScrollRef}
                className="bg-[#0B1528] border border-slate-800 rounded-xl p-4 h-[360px] overflow-y-auto space-y-3"
              >
                {chatMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-2.5">
                    <p className="text-sm font-medium text-white">
                      Ask a question or test your own explanation of {activeScenario.topicTitle}
                    </p>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Your full conversation history stays active across turns, calibrated for {curriculumProfile.tierLabel}.
                    </p>
                    <button
                      type="button"
                      onClick={() => setChatInput(activeScenario.openingPrompt)}
                      className="px-3 py-1.5 text-xs font-medium text-cyan-300 bg-cyan-500/10 border border-cyan-400/30 rounded-lg"
                    >
                      Try starter question
                    </button>
                  </div>
                ) : (
                  chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-3.5 rounded-xl space-y-1.5 text-sm ${
                        msg.role === 'user'
                          ? 'bg-[#142444] border border-cyan-500/30 text-white ml-8'
                          : 'bg-[#0F1B33] border border-slate-800 text-slate-200 mr-8'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 text-[11px]">
                        <span className="font-semibold text-cyan-400">
                          {msg.role === 'user' ? currentUser?.name || 'You' : 'Gemini Tutor'}
                        </span>
                        {msg.modelLabel && (
                          <span className="font-mono text-slate-400">{msg.modelLabel}</span>
                        )}
                      </div>
                      <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                      {msg.sources && msg.sources.length > 0 && (
                        <div className="pt-2 border-t border-slate-800/80 space-y-1">
                          <p className="text-[11px] font-semibold text-cyan-400">
                            Google Search sources
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {msg.sources.map((src, i) => (
                              <a
                                key={i}
                                href={src.uri}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 px-2 py-1 text-[11px] bg-[#0B1528] border border-slate-700 hover:border-cyan-400/40 rounded text-cyan-300"
                              >
                                <span className="truncate max-w-[180px]">{src.title}</span>
                                <ExternalLink className="w-3 h-3 shrink-0" />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}

                {chatLoading && (
                  <div className="inline-flex items-center gap-2 px-3 py-2 bg-[#0F1B33] border border-slate-800 rounded-lg text-xs text-cyan-300">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Thinking with {useWebSearch ? 'gemini-4-hydrogen (Search)' : chatModel}...</span>
                  </div>
                )}
              </div>

              {chatError && (
                <p className="p-3 bg-rose-500/10 border border-rose-400/30 rounded-xl text-xs text-rose-200">
                  {chatError}
                </p>
              )}

              <form onSubmit={handleSendChat} className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask your tutor or explain your reasoning..."
                  className="flex-1 px-3.5 py-2.5 text-sm bg-[#0B1528] border border-slate-700 text-slate-100 placeholder:text-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
                <button
                  type="submit"
                  disabled={chatLoading || !chatInput.trim()}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 rounded-lg whitespace-nowrap shrink-0"
                >
                  <Send className="w-4 h-4" />
                  Send
                </button>
              </form>

              {chatMessages.some((m) => m.role === 'model') && (
                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                  <span className="text-slate-400">
                    Clarified a concept? Record this session in Academic Progress.
                  </span>
                  <button
                    type="button"
                    onClick={handleLogChatProgress}
                    disabled={loggedChatCheck}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 font-medium text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 rounded-lg disabled:opacity-60"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    {loggedChatCheck ? 'Recorded in Progress' : 'Record understanding check'}
                  </button>
                </div>
              )}
            </section>
          )}

          {/* MODE 2: REAL-TIME VOICE CONVERSATION */}
          {tutorMode === 'live-voice' && (
            <LiveVoicePanel
              defaultSystemInstruction={builtSystemInstruction}
              contextLabel={`${activeSubject?.name}: ${activeScenario.topicTitle}`}
            />
          )}

          {/* MODE 3: SOCRATIC DEMO WALKTHROUGH */}
          {tutorMode === 'demo-walkthrough' && (
            <section className="bg-[#0F1B33] border border-slate-800 rounded-xl p-5 sm:p-6 space-y-6">
              <div className="pb-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="text-xs text-cyan-400 font-medium">
                    {activeSubject?.name} · Socratic Walkthrough (Demo)
                    {currentUser
                      ? ` · ${currentUser.name} (${currentUser.gradeLevel}, ${currentUser.country}, Age ${currentUser.age})`
                      : ''}
                  </p>
                  <h3 className="font-display text-xl font-semibold text-white">
                    {activeScenario.topicTitle}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Calibrated for {curriculumProfile.tierLabel} ({curriculumProfile.systemName})
                  </p>
                </div>

                <div className="inline-flex items-center p-1 bg-[#0B1528] rounded-lg border border-slate-800 self-start">
                  {(
                    [
                      { id: 'step-by-step', label: 'Step-by-step' },
                      { id: 'analogy', label: 'Analogy' },
                      { id: 'source-comparison', label: 'Source-led' },
                    ] as { id: ExplanationStyle; label: string }[]
                  ).map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setPreferredExplanationStyle(st.id)}
                      className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                        preferredExplanationStyle === st.id
                          ? 'bg-[#162647] text-cyan-300'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-[#0B1528] border border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-cyan-300">
                    <HelpCircle className="w-4 h-4 text-cyan-400" />
                    <span>Step 1 · Tutor checks your reasoning before explaining</span>
                  </div>
                  <p className="text-sm sm:text-base text-white leading-relaxed">
                    {curriculumProfile.tier === 'foundation'
                      ? `In everyday terms for ${currentUser?.gradeLevel ?? 'your year level'}: ${activeScenario.openingPrompt}`
                      : curriculumProfile.tier === 'advanced'
                      ? `Senior exam precision (${currentUser?.gradeLevel ?? 'Senior'} · ${curriculumProfile.systemName}): ${activeScenario.openingPrompt}`
                      : activeScenario.openingPrompt}
                  </p>
                  {subjectMistakes.length > 0 && (
                    <p className="text-xs text-amber-300">
                      History note: You previously encountered &ldquo;{subjectMistakes[0].concept}&rdquo; — let&apos;s verify that boundary carefully.
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-medium text-slate-400">
                    Choose a reasoning response to see how the tutor adapts:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {activeScenario.choices.map((choice) => {
                      const isSelected = selectedChoice?.id === choice.id;
                      return (
                        <button
                          key={choice.id}
                          type="button"
                          onClick={() => handlePickChoice(choice)}
                          className={`p-4 rounded-xl border text-left transition-colors space-y-1.5 ${
                            isSelected
                              ? 'border-cyan-400/70 bg-[#142444]'
                              : 'border-slate-800 hover:border-slate-700 bg-[#0B1528]'
                          }`}
                        >
                          <p className="text-xs font-semibold text-cyan-400">{choice.label}</p>
                          <p className="text-sm text-slate-200 leading-snug">
                            &ldquo;{choice.studentResponse}&rdquo;
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {selectedChoice && (
                <div className="space-y-5 pt-4 border-t border-slate-800">
                  <div
                    className={`p-4 rounded-xl border space-y-1.5 ${
                      selectedChoice.isMisconception
                        ? 'bg-amber-500/10 border-amber-400/30'
                        : 'bg-emerald-500/10 border-emerald-400/30'
                    }`}
                  >
                    <div className="flex items-center gap-2 text-xs font-semibold">
                      {selectedChoice.isMisconception ? (
                        <>
                          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                          <span className="text-amber-300">
                            {selectedChoice.misconceptionLabel || 'Misconception detected'}
                          </span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span className="text-emerald-300">Reasoning verified</span>
                        </>
                      )}
                    </div>
                    <p className="text-sm text-slate-200 leading-relaxed">
                      {selectedChoice.tutorFeedback}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedChoice.sourceCitation && (
                      <div className="p-4 bg-[#0B1528] border border-slate-800 rounded-xl space-y-2">
                        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                          <BookOpenCheck className="w-4 h-4 shrink-0" />
                          <span>From your resource (Verified)</span>
                        </div>
                        <p className="text-xs font-mono text-slate-400">
                          {selectedChoice.sourceCitation.resourceTitle} ·{' '}
                          {selectedChoice.sourceCitation.location}
                        </p>
                        <p className="text-sm text-slate-200 leading-relaxed">
                          &ldquo;{selectedChoice.sourceCitation.quote}&rdquo;
                        </p>
                      </div>
                    )}

                    <div className="p-4 bg-[#0B1528] border border-slate-800 rounded-xl space-y-2">
                      <div className="flex items-center gap-2 text-xs font-semibold text-cyan-300">
                        <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
                        <span>
                          Tutor explanation (
                          {preferredExplanationStyle === 'analogy'
                            ? 'Analogy mode'
                            : preferredExplanationStyle === 'source-comparison'
                            ? 'Source-led mode'
                            : 'Step-by-step mode'}
                          )
                        </span>
                      </div>
                      <p className="text-sm text-slate-200 leading-relaxed">
                        {preferredExplanationStyle === 'analogy'
                          ? selectedChoice.analogyExplanation
                          : selectedChoice.tutorExplanation}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-[#0B1528] border border-slate-800 rounded-xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleStyleFeedback(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        This explanation helped
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleStyleFeedback(
                            false,
                            preferredExplanationStyle === 'analogy' ? 'step-by-step' : 'analogy'
                          )
                        }
                        className="px-3 py-1.5 text-xs font-medium text-slate-300 bg-[#13223D] border border-slate-700 hover:text-white rounded-lg"
                      >
                        {preferredExplanationStyle === 'analogy'
                          ? 'Switch to step-by-step'
                          : 'Still unclear — explain with an analogy'}
                      </button>
                    </div>
                    {feedbackGiven && (
                      <span className="text-xs text-cyan-300 font-medium">{feedbackGiven}</span>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-slate-300 tabular-nums">
                        Staged hints ({revealedHintCount} of {selectedChoice.hints.length} revealed)
                      </span>
                      {revealedHintCount < selectedChoice.hints.length && (
                        <button
                          type="button"
                          onClick={() => setRevealedHintCount((c) => c + 1)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400/30 rounded-lg"
                        >
                          <Lightbulb className="w-3.5 h-3.5" />
                          Reveal Hint {revealedHintCount + 1}
                        </button>
                      )}
                    </div>

                    {revealedHintCount > 0 && (
                      <div className="space-y-2">
                        {selectedChoice.hints.slice(0, revealedHintCount).map((hint, idx) => (
                          <div
                            key={idx}
                            className="p-3 bg-cyan-500/10 border border-cyan-400/30 rounded-lg text-sm text-slate-200"
                          >
                            {hint}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="p-4 bg-[#0B1528] border border-cyan-500/30 rounded-xl space-y-3">
                    <p className="text-xs font-semibold text-cyan-400">Check your understanding</p>
                    <p className="text-sm sm:text-base text-white leading-relaxed">
                      {selectedChoice.followUpQuestion}
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowFollowUpAnswer((v) => !v)}
                      className="px-3 py-1.5 text-xs font-medium bg-[#13223D] hover:bg-[#192D50] text-cyan-300 border border-slate-700 rounded-lg transition-colors"
                    >
                      {showFollowUpAnswer
                        ? 'Hide expected reasoning'
                        : 'Compare with expected reasoning'}
                    </button>
                    {showFollowUpAnswer && (
                      <p className="text-xs sm:text-sm text-slate-300 pt-2 border-t border-slate-800 leading-relaxed">
                        {selectedChoice.followUpAnswerGuide}
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-slate-800 space-y-3">
                <form onSubmit={handleCustomSubmit} className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={customDraft}
                    onChange={(e) => setCustomDraft(e.target.value)}
                    placeholder="Write your own explanation or question..."
                    className="flex-1 px-3.5 py-2.5 text-sm bg-[#0B1528] border border-slate-700 text-slate-100 placeholder:text-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  />
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg whitespace-nowrap shrink-0"
                  >
                    <Send className="w-4 h-4" />
                    Submit thought
                  </button>
                </form>

                {customReflections.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 bg-[#0B1528] border border-slate-800 rounded-lg space-y-1.5 text-xs"
                  >
                    <p className="font-medium text-white">Your note: &ldquo;{item.studentText}&rdquo;</p>
                    <p className="text-slate-300">Tutor check: {item.tutorPrompt}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

