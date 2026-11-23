import React, { useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  Edit3,
  FolderOpen,
  Layers,
  MessageSquareText,
  Plus,
  X,
} from 'lucide-react';
import { usePlatform } from '../../context/PlatformContext';
import { StudyRecommendation } from '../../types/platform';
import {
  ProcessingStatusIndicator,
  formatFriendlyDate,
  formatResourceTypeLabel,
} from '../common/StatusLabels';
import { AssignmentTaskManager } from '../dashboard/AssignmentTaskManager';

const STUDY_TIME_OPTIONS = [30, 60, 90, 120];

type ResourceFilterTab = 'all' | 'extracted' | 'attention';
type ProgressCardTab = 'subjects' | 'activity';

export const DashboardView: React.FC = () => {
  const {
    currentUser,
    curriculumProfile,
    openOnboardingWizard,
    subjects,
    tasks,
    resources,
    studyLogs,
    topicProfiles,
    recommendations,
    recommendationOverrides,
    availableStudyMinutes,
    setAvailableStudyMinutes,
    respondToRecommendation,
    openInTutor,
    openInStudyTools,
    openInSubject,
    setActiveSection,
  } = usePlatform();

  // Floating Quick-Add signal + scroll anchor for AssignmentTaskManager
  const [quickAddSignal, setQuickAddSignal] = useState(0);
  const taskManagerAnchorRef = useRef<HTMLDivElement>(null);

  // Card tabs & disclosures
  const [resourceTab, setResourceTab] = useState<ResourceFilterTab>('all');
  const [progressTab, setProgressTab] = useState<ProgressCardTab>('subjects');
  const [expandedRecWhy, setExpandedRecWhy] = useState<Record<string, boolean>>({});
  const [showAllRecs, setShowAllRecs] = useState(false);

  // Modify recommendation inline state
  const [editingRecId, setEditingRecId] = useState<string | null>(null);
  const [editMinutes, setEditMinutes] = useState(20);
  const [editActivity, setEditActivity] =
    useState<StudyRecommendation['suggestedActivity']>('tutor');

  const subjectById = useMemo(
    () => Object.fromEntries(subjects.map((s) => [s.id, s])),
    [subjects]
  );

  const todayTasks = useMemo(() => tasks.filter((t) => t.isTodayFocus), [tasks]);

  const evidenceTotals = useMemo(() => {
    const solid = topicProfiles.filter((p) => p.assessmentState === 'solid').length;
    const needsAttention = topicProfiles.filter(
      (p) => p.assessmentState === 'needs-attention'
    ).length;
    const unassessed = topicProfiles.filter(
      (p) => p.assessmentState === 'not-yet-assessed'
    ).length;
    return {
      solid,
      needsAttention,
      unassessed,
      total: Math.max(1, topicProfiles.length),
      rawTotal: topicProfiles.length,
    };
  }, [topicProfiles]);

  const activeRecommendations = useMemo(
    () =>
      recommendations.filter(
        (rec) => recommendationOverrides[rec.id]?.status !== 'rejected'
      ),
    [recommendations, recommendationOverrides]
  );

  const visibleRecommendations = showAllRecs
    ? activeRecommendations
    : activeRecommendations.slice(0, 3);

  const plannedRecMinutes = useMemo(
    () =>
      activeRecommendations
        .filter((r) => r.fitsTimeBudget)
        .reduce((sum, r) => {
          const override = recommendationOverrides[r.id];
          return sum + (override?.customMinutes ?? r.estimatedMinutes);
        }, 0),
    [activeRecommendations, recommendationOverrides]
  );

  const visibleResources = useMemo(() => {
    const filtered = resources.filter((r) => {
      if (resourceTab === 'extracted') return r.processingStatus === 'extracted';
      if (resourceTab === 'attention') return r.processingStatus !== 'extracted';
      return true;
    });
    return filtered.slice(0, 4);
  }, [resources, resourceTab]);

  const extractedResourcesCount = useMemo(
    () => resources.filter((r) => r.processingStatus === 'extracted').length,
    [resources]
  );

  const openQuickAdd = () => {
    setQuickAddSignal((n) => n + 1);
    taskManagerAnchorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const launchRecommendation = (rec: StudyRecommendation) => {
    const override = recommendationOverrides[rec.id];
    const activity = override?.customActivity ?? rec.suggestedActivity;
    if (activity === 'tutor') {
      openInTutor(rec.subjectId, rec.suggestedResourceId);
    } else {
      openInStudyTools(
        rec.subjectId,
        activity,
        rec.topicId,
        rec.suggestedResourceId ?? 'all'
      );
    }
  };

  const openTasksCount = tasks.filter((t) => !t.completed).length;
  const completedTodayCount = todayTasks.filter((t) => t.completed).length;
  const topRecommendation = activeRecommendations[0];
  const budgetRatio = Math.min(100, Math.round((plannedRecMinutes / availableStudyMinutes) * 100));
  const todayLabel = useMemo(
    () =>
      new Intl.DateTimeFormat('en-US', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      }).format(new Date()),
    []
  );

  return (
    <div className="space-y-6 lg:space-y-7 pb-16">
      {/* GROUP 1: Hero Progress Snapshot + Study Session Card */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <section className="xl:col-span-8 bg-[#0F1B33] border border-slate-800 rounded-2xl p-6 sm:p-7 flex flex-col justify-between gap-6">
          <div className="space-y-2">
            <p className="text-xs font-medium text-cyan-400 tracking-wide">
              {currentUser
                ? `${todayLabel} · ${curriculumProfile.gradeLevel} · ${curriculumProfile.country} · ${curriculumProfile.systemName}`
                : `${todayLabel} · Academic Overview`}
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-white text-balance">
              {currentUser ? `Welcome, ${currentUser.name}` : 'Welcome to your study workspace'}
            </h2>
            <p className="text-sm text-slate-300 max-w-2xl">
              {topRecommendation ? (
                <>
                  Highest-impact focus right now:{' '}
                  <span className="text-cyan-300 font-medium">
                    {topRecommendation.topicTitle}
                  </span>{' '}
                  ({subjectById[topRecommendation.subjectId]?.name}).
                </>
              ) : (
                'All priority study items are up to date.'
              )}
            </p>
            {!currentUser && (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => openOnboardingWizard(1)}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-cyan-300 hover:text-cyan-200 underline underline-offset-4"
                >
                  Personalise for your name, grade &amp; country
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* 4 Separated Progress Snapshot Mini-Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="bg-[#0B1528] border border-slate-800/90 rounded-xl p-4 space-y-2.5">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-xs text-slate-400">Strong topics</span>
                <span className="font-display text-lg font-semibold text-emerald-400 tabular-nums">
                  {evidenceTotals.solid}/{evidenceTotals.rawTotal}
                </span>
              </div>
              <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  style={{ width: `${(evidenceTotals.solid / evidenceTotals.total) * 100}%` }}
                  className="h-full bg-emerald-400 rounded-full transition-all"
                />
              </div>
            </div>

            <div className="bg-[#0B1528] border border-slate-800/90 rounded-xl p-4 space-y-2.5">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-xs text-slate-400">Needs focus</span>
                <span className="font-display text-lg font-semibold text-amber-300 tabular-nums">
                  {evidenceTotals.needsAttention}
                </span>
              </div>
              <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  style={{
                    width: `${(evidenceTotals.needsAttention / evidenceTotals.total) * 100}%`,
                  }}
                  className="h-full bg-amber-400 rounded-full transition-all"
                />
              </div>
            </div>

            <div className="bg-[#0B1528] border border-slate-800/90 rounded-xl p-4 space-y-2.5">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-xs text-slate-400">Unassessed</span>
                <span className="font-display text-lg font-semibold text-cyan-300 tabular-nums">
                  {evidenceTotals.unassessed}
                </span>
              </div>
              <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  style={{
                    width: `${(evidenceTotals.unassessed / evidenceTotals.total) * 100}%`,
                  }}
                  className="h-full bg-cyan-400 rounded-full transition-all"
                />
              </div>
            </div>

            <div className="bg-[#0B1528] border border-slate-800/90 rounded-xl p-4 space-y-2.5">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-xs text-slate-400">Open tasks</span>
                <span className="font-display text-lg font-semibold text-white tabular-nums">
                  {openTasksCount}
                </span>
              </div>
              <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  style={{
                    width: `${Math.min(100, (completedTodayCount / Math.max(1, todayTasks.length)) * 100)}%`,
                  }}
                  className="h-full bg-cyan-400 rounded-full transition-all"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Dedicated Study Session Budget & Quick Launch Card */}
        <section className="xl:col-span-4 bg-[#0F1B33] border border-slate-800 rounded-2xl p-6 sm:p-7 flex flex-col justify-between gap-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-white">
                <Clock className="w-4 h-4 text-cyan-400" />
                Study session budget
              </span>
              <span className="text-xs font-mono text-cyan-300 tabular-nums">
                {plannedRecMinutes}/{availableStudyMinutes}m fit
              </span>
            </div>

            <div
              role="group"
              aria-label="Available study time today"
              className="grid grid-cols-4 p-1 bg-[#0B1528] rounded-xl border border-slate-800"
            >
              {STUDY_TIME_OPTIONS.map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setAvailableStudyMinutes(mins)}
                  className={`py-2 text-xs font-medium rounded-lg transition-colors tabular-nums ${
                    availableStudyMinutes === mins
                      ? 'bg-cyan-400 text-slate-950 font-semibold'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {mins}m
                </button>
              ))}
            </div>

            <div className="space-y-1.5">
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  style={{ width: `${budgetRatio}%` }}
                  className="h-full bg-cyan-400 rounded-full transition-all"
                />
              </div>
              <p className="text-xs text-slate-400">
                Recommendations automatically rank to fit your selected evening study window.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => openInTutor('bio', 'res-bio-pdf')}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl transition-colors whitespace-nowrap"
            >
              <MessageSquareText className="w-3.5 h-3.5" />
              AI Tutor
            </button>
            <button
              type="button"
              onClick={() => openInStudyTools('bio', 'quiz')}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 text-xs font-medium text-slate-200 bg-[#13223D] hover:bg-[#192D50] border border-slate-700 rounded-xl transition-colors whitespace-nowrap"
            >
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              Study Tools
            </button>
          </div>
        </section>
      </div>

      {/* GROUP 2: Assignment & Task Management System + Priority Recommendations Card */}
      <div
        ref={taskManagerAnchorRef}
        className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
      >
        <AssignmentTaskManager quickAddSignal={quickAddSignal} />

        {/* Recommended Study Actions Card */}
        <section className="lg:col-span-6 bg-[#0F1B33] border border-slate-800 rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="font-display text-lg font-semibold text-white">
                Recommended next steps
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {currentUser
                  ? `Calibrated for ${curriculumProfile.gradeLevel} (${curriculumProfile.systemName}) · ${availableStudyMinutes}m budget`
                  : `Ranked from deadlines, evidence gaps, and your ${availableStudyMinutes}m budget.`}
              </p>
            </div>
            {activeRecommendations.length > 3 && (
              <button
                type="button"
                onClick={() => setShowAllRecs((v) => !v)}
                className="inline-flex items-center gap-1 text-xs font-medium text-cyan-400 hover:text-cyan-300 whitespace-nowrap shrink-0"
              >
                {showAllRecs ? (
                  <>
                    Top 3 <ChevronUp className="w-3.5 h-3.5" />
                  </>
                ) : (
                  <>
                    Show all ({activeRecommendations.length}) <ChevronDown className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            )}
          </div>

          {activeRecommendations.length === 0 ? (
            <div className="p-6 bg-[#0B1528] border border-slate-800 rounded-xl text-sm text-slate-400 text-center">
              No active recommendations remaining. Check Academic Progress or Subjects to review upcoming units.
            </div>
          ) : (
            <div className="space-y-3">
              {visibleRecommendations.map((rec) => {
                const subj = subjectById[rec.subjectId];
                const override = recommendationOverrides[rec.id];
                const status = override?.status ?? 'pending';
                const displayMinutes = override?.customMinutes ?? rec.estimatedMinutes;
                const displayActivity = override?.customActivity ?? rec.suggestedActivity;
                const isEditing = editingRecId === rec.id;
                const whyOpen = Boolean(expandedRecWhy[rec.id]);

                return (
                  <div
                    key={rec.id}
                    className="p-4 bg-[#0B1528] border border-slate-800/90 rounded-xl space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="space-y-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs">
                          <span className="font-semibold text-cyan-400">{subj?.name}</span>
                          <span aria-hidden="true" className="text-slate-600">·</span>
                          <span className="font-mono text-slate-300 tabular-nums">
                            {displayMinutes}m · {displayActivity}
                          </span>
                          {!rec.fitsTimeBudget && status === 'pending' && (
                            <span className="text-slate-400">
                              (Over {availableStudyMinutes}m budget)
                            </span>
                          )}
                          {status === 'accepted' && (
                            <span className="font-medium text-emerald-400">Added to today</span>
                          )}
                          {status === 'modified' && (
                            <span className="font-medium text-cyan-300">Modified &amp; added</span>
                          )}
                        </div>

                        <p className="text-sm sm:text-base font-semibold text-white">
                          {rec.topicTitle}
                        </p>

                        {rec.suggestedResourceTitle && (
                          <p className="text-xs text-slate-400 truncate">
                            Resource: <span className="text-slate-200">{rec.suggestedResourceTitle}</span>
                          </p>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => launchRecommendation(rec)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg whitespace-nowrap shrink-0 self-start transition-colors"
                      >
                        Start {displayActivity}
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {whyOpen && (
                      <p className="text-xs text-slate-300 bg-[#0F1B33] border border-slate-800 rounded-lg p-3 leading-relaxed">
                        {rec.rationale}
                      </p>
                    )}

                    {isEditing ? (
                      <div className="p-3 bg-[#0F1B33] border border-slate-700 rounded-lg flex flex-wrap items-center gap-2">
                        <select
                          value={editActivity}
                          onChange={(e) =>
                            setEditActivity(
                              e.target.value as StudyRecommendation['suggestedActivity']
                            )
                          }
                          className="px-2.5 py-1.5 text-xs bg-[#0B1528] border border-slate-700 text-slate-200 rounded-md"
                        >
                          <option value="tutor">AI Tutor</option>
                          <option value="quiz">Quiz</option>
                          <option value="flashcards">Flashcards</option>
                          <option value="practice">Practice Question</option>
                          <option value="summaries">Summary</option>
                        </select>
                        <input
                          type="number"
                          min={5}
                          max={90}
                          value={editMinutes}
                          onChange={(e) => setEditMinutes(Number(e.target.value))}
                          className="w-20 px-2.5 py-1.5 text-xs font-mono bg-[#0B1528] border border-slate-700 text-slate-200 rounded-md tabular-nums"
                        />
                        <span className="text-xs text-slate-400">min</span>
                        <button
                          type="button"
                          onClick={() => {
                            respondToRecommendation(rec, {
                              status: 'modified',
                              customMinutes: editMinutes,
                              customActivity: editActivity,
                            });
                            setEditingRecId(null);
                          }}
                          className="px-3 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-md"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingRecId(null)}
                          className="px-2.5 py-1.5 text-xs text-slate-400 hover:text-white"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex flex-wrap items-center gap-2">
                          {status === 'pending' && (
                            <button
                              type="button"
                              onClick={() =>
                                respondToRecommendation(rec, { status: 'accepted' })
                              }
                              className="inline-flex items-center gap-1 px-2.5 py-1 font-medium text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-md transition-colors"
                            >
                              <Check className="w-3 h-3" />
                              Accept
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setEditingRecId(rec.id);
                              setEditMinutes(displayMinutes);
                              setEditActivity(displayActivity);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 font-medium text-slate-300 bg-[#13223D] hover:bg-[#192D50] border border-slate-700 rounded-md transition-colors"
                          >
                            <Edit3 className="w-3 h-3" />
                            Modify
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              respondToRecommendation(rec, {
                                status: 'rejected',
                                rejectReason: 'Dismissed by student',
                              })
                            }
                            className="inline-flex items-center gap-1 px-2 py-1 text-slate-400 hover:text-slate-200"
                          >
                            <X className="w-3 h-3" />
                            Dismiss
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            setExpandedRecWhy((prev) => ({ ...prev, [rec.id]: !prev[rec.id] }))
                          }
                          className="inline-flex items-center gap-1 text-slate-400 hover:text-cyan-300"
                        >
                          {whyOpen ? 'Hide why' : 'Why this?'}
                          {whyOpen ? (
                            <ChevronUp className="w-3 h-3" />
                          ) : (
                            <ChevronDown className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* GROUP 3: Dedicated Learning Resources Card + Subject Progress & Activity Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Learning Resources Card */}
        <section className="lg:col-span-6 bg-[#0F1B33] border border-slate-800 rounded-2xl p-6 space-y-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-cyan-400" />
                <h3 className="font-display text-lg font-semibold text-white">
                  Learning resources
                </h3>
              </div>
              <p className="text-xs text-slate-400 tabular-nums mt-0.5">
                {extractedResourcesCount} processed · {resources.length} total in library
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveSection('resources')}
              className="text-xs font-medium text-cyan-400 hover:text-cyan-300 whitespace-nowrap"
            >
              Resource Centre →
            </button>
          </div>

          <div
            role="tablist"
            aria-label="Filter dashboard resources"
            className="inline-flex items-center p-1 bg-[#0B1528] border border-slate-800 rounded-xl"
          >
            {(
              [
                { id: 'all', label: 'Recent' },
                { id: 'extracted', label: 'Processed' },
                { id: 'attention', label: 'Needs Access' },
              ] as { id: ResourceFilterTab; label: string }[]
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={resourceTab === tab.id}
                onClick={() => setResourceTab(tab.id)}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                  resourceTab === tab.id
                    ? 'bg-[#162647] text-cyan-300'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {visibleResources.map((res) => {
              const subj = subjectById[res.subjectId];
              const isExtracted = res.processingStatus === 'extracted';
              return (
                <article
                  key={res.id}
                  className="bg-[#0B1528] border border-slate-800/90 hover:border-slate-700 rounded-xl p-4 flex flex-col justify-between gap-3 transition-colors"
                >
                  <div className="space-y-1.5">
                    <p className="text-[11px] font-medium text-cyan-400 truncate">
                      {subj?.name} · {formatResourceTypeLabel(res.type)}
                    </p>
                    <h4 className="text-sm font-semibold text-white line-clamp-2 leading-snug">
                      {res.title}
                    </h4>
                  </div>

                  <div className="space-y-2.5 pt-2 border-t border-slate-800/80">
                    <ProcessingStatusIndicator status={res.processingStatus} />
                    <div className="flex items-center gap-3 text-xs">
                      {isExtracted ? (
                        <>
                          <button
                            type="button"
                            onClick={() => openInTutor(res.subjectId, res.id)}
                            className="font-medium text-cyan-300 hover:text-cyan-200"
                          >
                            Tutor
                          </button>
                          <span aria-hidden="true" className="text-slate-700">·</span>
                          <button
                            type="button"
                            onClick={() =>
                              openInStudyTools(res.subjectId, 'summaries', 'all', res.id)
                            }
                            className="font-medium text-slate-300 hover:text-white"
                          >
                            Study Tools
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setActiveSection('resources')}
                          className="font-medium text-amber-300 hover:text-amber-200"
                        >
                          Inspect access →
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* Subject Progress & Activity Card */}
        <section className="lg:col-span-6 bg-[#0F1B33] border border-slate-800 rounded-2xl p-6 space-y-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-cyan-400" />
                <h3 className="font-display text-lg font-semibold text-white">
                  Progress &amp; recent sessions
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Multi-signal subject readiness and logged study activity.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveSection('progress')}
              className="text-xs font-medium text-cyan-400 hover:text-cyan-300 whitespace-nowrap"
            >
              Academic Progress →
            </button>
          </div>

          <div
            role="tablist"
            aria-label="Progress card tabs"
            className="inline-flex items-center p-1 bg-[#0B1528] border border-slate-800 rounded-xl"
          >
            {(
              [
                { id: 'subjects', label: 'Subject Readiness' },
                { id: 'activity', label: 'Recent Activity' },
              ] as { id: ProgressCardTab; label: string }[]
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={progressTab === tab.id}
                onClick={() => setProgressTab(tab.id)}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                  progressTab === tab.id
                    ? 'bg-[#162647] text-cyan-300'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {progressTab === 'subjects' ? (
            <div className="space-y-2.5">
              {subjects.map((subj) => {
                const subjProfiles = topicProfiles.filter(
                  (p) => p.topic.subjectId === subj.id
                );
                const total = Math.max(1, subjProfiles.length);
                const strong = subjProfiles.filter(
                  (p) => p.assessmentState === 'solid'
                ).length;
                const developing = subjProfiles.filter(
                  (p) =>
                    p.assessmentState === 'developing' ||
                    p.assessmentState === 'early-evidence'
                ).length;
                const weak = subjProfiles.filter(
                  (p) => p.assessmentState === 'needs-attention'
                ).length;
                const unassessed = subjProfiles.filter(
                  (p) => p.assessmentState === 'not-yet-assessed'
                ).length;

                return (
                  <button
                    key={subj.id}
                    type="button"
                    onClick={() => openInSubject(subj.id)}
                    className="w-full text-left p-3.5 bg-[#0B1528] border border-slate-800/90 hover:border-cyan-400/40 rounded-xl transition-colors space-y-2"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="inline-flex items-center gap-2 text-sm font-medium text-white">
                        <BookOpen className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        {subj.name}
                      </span>
                      <span className="text-xs font-mono text-slate-300 tabular-nums">
                        {strong}/{subjProfiles.length} strong
                        {weak > 0 ? (
                          <span className="text-amber-300"> · {weak} attention</span>
                        ) : null}
                      </span>
                    </div>

                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden flex">
                      <div
                        style={{ width: `${(strong / total) * 100}%` }}
                        className="bg-emerald-400"
                      />
                      <div
                        style={{ width: `${(developing / total) * 100}%` }}
                        className="bg-cyan-400"
                      />
                      <div
                        style={{ width: `${(weak / total) * 100}%` }}
                        className="bg-amber-400"
                      />
                      <div
                        style={{ width: `${(unassessed / total) * 100}%` }}
                        className="bg-slate-600"
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          ) : studyLogs.length === 0 ? (
            <div className="p-5 bg-[#0B1528] border border-slate-800/90 rounded-xl text-xs sm:text-sm text-slate-400">
              No study sessions logged yet. Complete a quiz, flashcard check, practice question, or AI Tutor check to record real activity here.
            </div>
          ) : (
            <div className="space-y-2.5">
              {studyLogs.slice(0, 4).map((log) => {
                const subj = subjectById[log.subjectId];
                return (
                  <div
                    key={log.id}
                    className="p-3.5 bg-[#0B1528] border border-slate-800/90 rounded-xl space-y-1"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-medium text-white">{log.activity}</p>
                      <span className="text-xs font-mono text-cyan-300 tabular-nums whitespace-nowrap shrink-0">
                        {log.durationMinutes}m · {formatFriendlyDate(log.date)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      {subj?.name} · {log.outcomeNote}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Floating Quick-Add Action Button */}
      <button
        type="button"
        onClick={openQuickAdd}
        className="fixed bottom-5 right-5 z-20 inline-flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 shadow-lg rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
        aria-label="Quick add task or deadline"
      >
        <Plus className="w-4 h-4" />
        <span>New Task</span>
      </button>
    </div>
  );
};
