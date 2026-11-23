import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  TrendingUp,
} from 'lucide-react';
import { usePlatform } from '../../context/PlatformContext';
import { ConfidenceLevel } from '../../types/platform';
import { AssessmentStateIndicator, formatFriendlyDate } from '../common/StatusLabels';

type ProgressTab = 'evidence' | 'mistakes-quizzes' | 'consistency';

export const ProgressView: React.FC = () => {
  const {
    subjects,
    topicProfiles,
    quizAttempts,
    mistakes,
    dailyMinutes,
    setTopicConfidence,
    resolveMistake,
    openInTutor,
    openInStudyTools,
  } = usePlatform();

  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<ProgressTab>('evidence');
  const [expandedWhy, setExpandedWhy] = useState<Record<string, boolean>>({});

  const subjectMap = useMemo(
    () => Object.fromEntries(subjects.map((s) => [s.id, s])),
    [subjects]
  );

  const filteredProfiles = useMemo(
    () =>
      subjectFilter === 'all'
        ? topicProfiles
        : topicProfiles.filter((p) => p.topic.subjectId === subjectFilter),
    [topicProfiles, subjectFilter]
  );

  const filteredAttempts = useMemo(
    () =>
      subjectFilter === 'all'
        ? quizAttempts
        : quizAttempts.filter((q) => q.subjectId === subjectFilter),
    [quizAttempts, subjectFilter]
  );

  const filteredMistakes = useMemo(
    () =>
      subjectFilter === 'all'
        ? mistakes
        : mistakes.filter((m) => m.subjectId === subjectFilter),
    [mistakes, subjectFilter]
  );

  const summaryCounts = useMemo(() => {
    return {
      solid: filteredProfiles.filter((p) => p.assessmentState === 'solid').length,
      earlyOrDeveloping: filteredProfiles.filter(
        (p) =>
          p.assessmentState === 'early-evidence' ||
          p.assessmentState === 'developing'
      ).length,
      needsAttention: filteredProfiles.filter(
        (p) => p.assessmentState === 'needs-attention'
      ).length,
      unassessed: filteredProfiles.filter(
        (p) => p.assessmentState === 'not-yet-assessed'
      ).length,
    };
  }, [filteredProfiles]);

  const consistencySummary = useMemo(() => {
    const activeDays = dailyMinutes.filter((d) => d.minutes > 0).length;
    const totalMinutes = dailyMinutes.reduce((sum, d) => sum + d.minutes, 0);
    const avgActiveMinutes = activeDays > 0 ? Math.round(totalMinutes / activeDays) : 0;
    return { activeDays, totalDays: dailyMinutes.length, totalMinutes, avgActiveMinutes };
  }, [dailyMinutes]);

  return (
    <div className="space-y-6">
      {/* Header, Filter & 4-KPI Strip */}
      <section className="bg-[#0F1B33] border border-slate-800 rounded-xl p-5 sm:p-6 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="font-display text-xl font-semibold text-white">
              Multi-Dimensional Academic Progress
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Separates quiz scores, independent recall, explanations, confidence, misconceptions, and unassessed topics.
            </p>
          </div>

          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="px-3.5 py-2 text-xs sm:text-sm font-medium border border-slate-700 rounded-lg bg-[#0B1528] text-slate-100 self-start md:self-auto"
            aria-label="Filter academic progress by subject"
          >
            <option value="all">All subjects</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div className="pt-4 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-6">
          <div>
            <p className="text-xs text-slate-400">Multi-signal strong</p>
            <p className="mt-1 font-display text-xl font-semibold text-emerald-400 tabular-nums">
              {summaryCounts.solid} / {filteredProfiles.length}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Early / Developing</p>
            <p className="mt-1 font-display text-xl font-semibold text-cyan-300 tabular-nums">
              {summaryCounts.earlyOrDeveloping}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Needs attention</p>
            <p className="mt-1 font-display text-xl font-semibold text-amber-300 tabular-nums">
              {summaryCounts.needsAttention}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Not yet assessed</p>
            <p className="mt-1 font-display text-xl font-semibold text-slate-300 tabular-nums">
              {summaryCounts.unassessed}
            </p>
          </div>
        </div>

        {/* Clean Segmented View Switcher */}
        <div className="pt-2">
          <div
            role="tablist"
            aria-label="Progress sections"
            className="inline-flex flex-wrap items-center p-1 bg-[#0B1528] border border-slate-800 rounded-lg"
          >
            {(
              [
                { id: 'evidence', label: `Topic Evidence Matrix (${filteredProfiles.length})` },
                {
                  id: 'mistakes-quizzes',
                  label: `Mistakes & Quizzes (${filteredMistakes.filter((m) => !m.resolved).length})`,
                },
                { id: 'consistency', label: '14-Day Consistency' },
              ] as { id: ProgressTab; label: string }[]
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-[#162647] text-cyan-300'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* TAB 1: TOPIC EVIDENCE MATRIX */}
      {activeTab === 'evidence' && (
        <section className="bg-[#0F1B33] border border-slate-800 rounded-xl p-5 sm:p-6 space-y-4">
          <div>
            <h3 className="font-display text-lg font-semibold text-white">
              Evidence-based topic breakdown
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Expand &ldquo;Why&rdquo; on any topic to read the full classification rationale.
            </p>
          </div>

          <div className="divide-y divide-slate-800/80">
            {filteredProfiles.map((profile) => {
              const { topic } = profile;
              const isOpen = Boolean(expandedWhy[topic.id]);
              return (
                <div key={topic.id} className="py-4 first:pt-0 last:pb-0 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <p className="text-sm sm:text-base font-semibold text-white">
                        {topic.title}
                      </p>
                      <p className="text-xs text-slate-400">
                        {profile.subjectName} · {topic.unit}
                      </p>
                    </div>
                    <AssessmentStateIndicator
                      state={profile.assessmentState}
                      label={profile.label}
                    />
                  </div>

                  {/* 5 Separate Evidence Dimensions */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-3 bg-[#0B1528] border border-slate-800 rounded-lg text-xs">
                    <div>
                      <p className="text-slate-400">Quiz performance</p>
                      <p className="font-medium text-slate-100 tabular-nums mt-0.5">
                        {profile.quizSummary}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400">Independent recall</p>
                      <p className="font-medium text-slate-100 tabular-nums mt-0.5">
                        {profile.recallSummary}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400">Explanations</p>
                      <p className="font-medium text-slate-100 tabular-nums mt-0.5">
                        {profile.explanationSummary}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400">Misconceptions</p>
                      <p
                        className={`font-medium tabular-nums mt-0.5 ${
                          profile.activeMisconceptionsCount > 0
                            ? 'text-amber-300'
                            : 'text-slate-100'
                        }`}
                      >
                        {profile.activeMisconceptionsCount} active
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400">Your confidence</p>
                      <select
                        value={topic.studentConfidence}
                        onChange={(e) =>
                          setTopicConfidence(topic.id, e.target.value as ConfidenceLevel)
                        }
                        className="mt-0.5 px-2 py-0.5 text-xs border border-slate-700 rounded bg-[#0F1B33] text-slate-100"
                        aria-label={`Confidence for ${topic.title}`}
                      >
                        <option value="low">Low</option>
                        <option value="moderate">Moderate</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedWhy((prev) => ({ ...prev, [topic.id]: !prev[topic.id] }))
                      }
                      className="inline-flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-cyan-300"
                    >
                      {isOpen ? 'Hide evidence rationale' : 'Why this status?'}
                      {isOpen ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <div className="flex items-center gap-2 shrink-0">
                      {profile.assessmentState === 'not-yet-assessed' && (
                        <button
                          type="button"
                          onClick={() => openInStudyTools(topic.subjectId, 'quiz', topic.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400/30 rounded-lg whitespace-nowrap"
                        >
                          <HelpCircle className="w-3.5 h-3.5" />
                          Run baseline check
                        </button>
                      )}
                      {profile.assessmentState === 'needs-attention' && (
                        <button
                          type="button"
                          onClick={() => openInTutor(topic.subjectId)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg whitespace-nowrap"
                        >
                          Work with Tutor
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {(profile.assessmentState === 'early-evidence' ||
                        profile.assessmentState === 'developing') && (
                        <button
                          type="button"
                          onClick={() => openInStudyTools(topic.subjectId, 'practice', topic.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-200 bg-[#13223D] hover:bg-[#192D50] border border-slate-700 rounded-lg whitespace-nowrap"
                        >
                          Verify with explanation
                        </button>
                      )}
                    </div>
                  </div>

                  {isOpen && (
                    <p className="text-xs text-slate-300 bg-[#0B1528] border border-slate-800 rounded-lg px-3.5 py-2.5 leading-relaxed">
                      {profile.whyExplanation}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* TAB 2: MISTAKES & QUIZZES */}
      {activeTab === 'mistakes-quizzes' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <section className="lg:col-span-6 bg-[#0F1B33] border border-slate-800 rounded-xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <h3 className="font-display text-lg font-semibold text-white">
                Repeated misconceptions tracker
              </h3>
            </div>

            {filteredMistakes.length === 0 ? (
              <p className="text-sm text-slate-400">No repeated misconceptions recorded in this view.</p>
            ) : (
              <div className="divide-y divide-slate-800/80">
                {filteredMistakes.map((mk) => (
                  <div
                    key={mk.id}
                    className="py-3.5 first:pt-0 last:pb-0 space-y-2.5"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p
                          className={`text-sm font-semibold ${
                            mk.resolved ? 'line-through text-slate-500' : 'text-white'
                          }`}
                        >
                          {mk.concept}
                        </p>
                        <span className="text-xs font-mono text-slate-400 tabular-nums">
                          {subjectMap[mk.subjectId]?.name} · {mk.occurrences}x ·{' '}
                          {formatFriendlyDate(mk.lastSeen)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300">{mk.detail}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openInTutor(mk.subjectId)}
                        className="px-3 py-1.5 text-xs font-medium text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400/30 rounded-lg whitespace-nowrap"
                      >
                        Practise in Tutor
                      </button>
                      <button
                        type="button"
                        onClick={() => resolveMistake(mk.id)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap border inline-flex items-center gap-1 ${
                          mk.resolved
                            ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                            : 'bg-[#0B1528] text-slate-300 border-slate-700 hover:text-white'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {mk.resolved ? 'Resolved' : 'Mark resolved'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="lg:col-span-6 bg-[#0F1B33] border border-slate-800 rounded-xl p-5 sm:p-6 space-y-4">
            <h3 className="font-display text-lg font-semibold text-white">
              Quiz performance history
            </h3>

            {filteredAttempts.length === 0 ? (
              <p className="text-sm text-slate-400">
                No quizzes completed yet. Take a conceptual quiz in Study Tools to record real scores here.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-xs font-medium text-slate-400">
                      <th className="pb-2.5 pr-3">Date</th>
                      <th className="pb-2.5 pr-3">Topic</th>
                      <th className="pb-2.5 pr-3 text-right tabular-nums">Score</th>
                      <th className="pb-2.5">Missed / Note</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/70 text-xs sm:text-sm">
                    {filteredAttempts.map((qa) => (
                      <tr key={qa.id}>
                        <td className="py-3 pr-3 font-mono text-xs text-slate-400 tabular-nums whitespace-nowrap">
                          {formatFriendlyDate(qa.date)}
                        </td>
                        <td className="py-3 pr-3">
                          <p className="font-medium text-white">{qa.topicTitle}</p>
                          <p className="text-xs text-cyan-400">{subjectMap[qa.subjectId]?.name}</p>
                        </td>
                        <td className="py-3 pr-3 text-right font-mono font-semibold text-white tabular-nums whitespace-nowrap">
                          {qa.score}/{qa.total}
                        </td>
                        <td className="py-3 text-xs text-slate-300">
                          {qa.missedConcept || 'All concepts answered accurately'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      )}

      {/* TAB 3: CONSISTENCY LOG */}
      {activeTab === 'consistency' && (
        <section className="bg-[#0F1B33] border border-slate-800 rounded-xl p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <h3 className="font-display text-lg font-semibold text-white">
                Consistency of learning (14 days)
              </h3>
            </div>
            <span className="text-xs font-mono text-cyan-300 tabular-nums">
              {consistencySummary.totalMinutes} min total · {consistencySummary.activeDays}/
              {consistencySummary.totalDays} active days · avg {consistencySummary.avgActiveMinutes}m
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Rest days are normal—steady engagement matters more than streaks.
          </p>

          <div className="grid grid-cols-7 gap-2 pt-2">
            {dailyMinutes.map((day) => {
              const level =
                day.minutes === 0
                  ? 'bg-[#0B1528] text-slate-500 border-slate-800'
                  : day.minutes < 30
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                  : 'bg-cyan-400 text-slate-950 border-cyan-300 font-semibold';
              return (
                <div
                  key={day.date}
                  className={`p-2.5 rounded-lg border text-center space-y-0.5 ${level}`}
                  title={`${day.date}: ${day.minutes} minutes`}
                >
                  <p className="text-[10px] font-mono tabular-nums opacity-80">
                    {day.date.slice(5)}
                  </p>
                  <p className="text-xs font-mono font-semibold tabular-nums">
                    {day.minutes}m
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};
