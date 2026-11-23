import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  Calendar,
  CheckSquare,
  Edit3,
  Filter,
  Plus,
  Square,
  Star,
  Trash2,
  X,
} from 'lucide-react';
import { usePlatform } from '../../context/PlatformContext';
import { TaskItem, TaskUrgency } from '../../types/platform';
import {
  getDueCountdownLabel,
  getEffectiveTaskUrgency,
  sortTasksByMode,
  TaskSortMode,
  URGENCY_META,
  URGENCY_ORDER,
} from '../../utils/taskPriority';

type ManagerTab = 'priority' | 'today' | 'by-subject' | 'classes';

interface AssignmentTaskManagerProps {
  quickAddSignal: number;
}

export const AssignmentTaskManager: React.FC<AssignmentTaskManagerProps> = ({
  quickAddSignal,
}) => {
  const {
    subjects,
    topics,
    tasks,
    timetable,
    toggleTaskCompleted,
    toggleTaskTodayFocus,
    addTask,
    updateTask,
    deleteTask,
    openInSubject,
  } = usePlatform();

  const [activeTab, setActiveTab] = useState<ManagerTab>('priority');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [urgencyFilter, setUrgencyFilter] = useState<TaskUrgency | 'all'>('all');
  const [sortBy, setSortBy] = useState<TaskSortMode>('smart');
  const [showCompleted, setShowCompleted] = useState(false);

  // Create / Edit Task Form State
  const [formOpen, setFormOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState(subjects[0]?.id ?? 'bio');
  const [topicId, setTopicId] = useState<string>('');
  const [kind, setKind] = useState<TaskItem['kind']>('assignment');
  const [urgency, setUrgency] = useState<TaskUrgency>('high');
  const [dueDate, setDueDate] = useState(() =>
    new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10)
  );
  const [estimatedMinutes, setEstimatedMinutes] = useState(25);
  const [isTodayFocus, setIsTodayFocus] = useState(true);
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (quickAddSignal > 0) {
      resetFormForCreate();
      setFormOpen(true);
      if (activeTab === 'classes') setActiveTab('priority');
      setTimeout(() => titleInputRef.current?.focus(), 40);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quickAddSignal]);

  const subjectById = useMemo(
    () => Object.fromEntries(subjects.map((s) => [s.id, s])),
    [subjects]
  );

  const subjectNameById = useMemo(
    () => Object.fromEntries(subjects.map((s) => [s.id, s.name])),
    [subjects]
  );

  const topicById = useMemo(
    () => Object.fromEntries(topics.map((tp) => [tp.id, tp])),
    [topics]
  );

  const subjectTopics = useMemo(
    () => topics.filter((tp) => tp.subjectId === subjectId),
    [topics, subjectId]
  );

  const tomorrowClasses = useMemo(
    () => timetable.filter((slot) => slot.day === 'Wed'),
    [timetable]
  );

  // Live metrics from real tasks
  const metrics = useMemo(() => {
    const openTasks = tasks.filter((t) => !t.completed);
    const completedTasks = tasks.filter((t) => t.completed);
    const todayFocusOpen = openTasks.filter((t) => t.isTodayFocus);
    const urgencyCounts: Record<TaskUrgency, number> = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
    };
    let totalOpenMinutes = 0;

    for (const t of openTasks) {
      const u = getEffectiveTaskUrgency(t);
      urgencyCounts[u] += 1;
      totalOpenMinutes += t.estimatedMinutes;
    }

    return {
      openCount: openTasks.length,
      completedCount: completedTasks.length,
      todayCount: tasks.filter((t) => t.isTodayFocus).length,
      todayOpenCount: todayFocusOpen.length,
      urgentCount: urgencyCounts.critical + urgencyCounts.high,
      urgencyCounts,
      totalOpenMinutes,
    };
  }, [tasks]);

  // Filtered & sorted list for Priority Queue / Today Focus
  const visibleTasks = useMemo(() => {
    const filtered = tasks.filter((t) => {
      if (!showCompleted && t.completed) return false;
      if (activeTab === 'today' && !t.isTodayFocus) return false;
      if (subjectFilter !== 'all' && t.subjectId !== subjectFilter) return false;
      if (urgencyFilter !== 'all' && getEffectiveTaskUrgency(t) !== urgencyFilter) return false;
      return true;
    });
    return sortTasksByMode(filtered, sortBy, subjectNameById);
  }, [tasks, showCompleted, activeTab, subjectFilter, urgencyFilter, sortBy, subjectNameById]);

  // Grouped by subject, ordered by highest urgency & workload
  const groupedBySubject = useMemo(() => {
    const targetSubjects =
      subjectFilter === 'all'
        ? subjects
        : subjects.filter((s) => s.id === subjectFilter);

    const groups = targetSubjects.map((subj) => {
      const subjTasks = tasks.filter((t) => {
        if (t.subjectId !== subj.id) return false;
        if (!showCompleted && t.completed) return false;
        if (urgencyFilter !== 'all' && getEffectiveTaskUrgency(t) !== urgencyFilter) return false;
        return true;
      });
      const sorted = sortTasksByMode(subjTasks, sortBy === 'subject' ? 'smart' : sortBy, subjectNameById);
      const openSubjTasks = subjTasks.filter((t) => !t.completed);
      const highestUrgencyRank = openSubjTasks.reduce(
        (max, t) => Math.max(max, URGENCY_META[getEffectiveTaskUrgency(t)].rank),
        0
      );
      const urgentCount = openSubjTasks.filter((t) => {
        const u = getEffectiveTaskUrgency(t);
        return u === 'critical' || u === 'high';
      }).length;
      const totalMins = openSubjTasks.reduce((sum, t) => sum + t.estimatedMinutes, 0);

      return {
        subject: subj,
        tasks: sorted,
        openCount: openSubjTasks.length,
        urgentCount,
        totalMins,
        highestUrgencyRank,
      };
    });

    return groups.sort((a, b) => {
      if (b.highestUrgencyRank !== a.highestUrgencyRank) {
        return b.highestUrgencyRank - a.highestUrgencyRank;
      }
      return b.openCount - a.openCount;
    });
  }, [subjects, tasks, subjectFilter, urgencyFilter, showCompleted, sortBy, subjectNameById]);

  function resetFormForCreate(presetSubjectId?: string) {
    setEditingTaskId(null);
    setTitle('');
    setSubjectId(presetSubjectId ?? (subjectFilter !== 'all' ? subjectFilter : subjects[0]?.id ?? 'bio'));
    setTopicId('');
    setKind('assignment');
    setUrgency(urgencyFilter !== 'all' ? urgencyFilter : 'high');
    setDueDate(new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10));
    setEstimatedMinutes(25);
    setIsTodayFocus(activeTab === 'today');
  }

  function openCreateForm(presetSubjectId?: string) {
    resetFormForCreate(presetSubjectId);
    setFormOpen(true);
    setTimeout(() => titleInputRef.current?.focus(), 40);
  }

  function openEditForm(task: TaskItem) {
    setEditingTaskId(task.id);
    setTitle(task.title);
    setSubjectId(task.subjectId);
    setTopicId(task.topicId ?? '');
    setKind(task.kind);
    setUrgency(getEffectiveTaskUrgency(task));
    setDueDate(task.dueDate);
    setEstimatedMinutes(task.estimatedMinutes);
    setIsTodayFocus(task.isTodayFocus);
    setFormOpen(true);
    setTimeout(() => titleInputRef.current?.focus(), 40);
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const payload = {
      subjectId,
      topicId: topicId || undefined,
      title: title.trim(),
      kind,
      urgency,
      dueDate,
      estimatedMinutes: Math.max(5, Math.min(240, Number(estimatedMinutes) || 25)),
      isTodayFocus,
    };

    if (editingTaskId) {
      updateTask(editingTaskId, payload);
    } else {
      addTask(payload);
    }

    setFormOpen(false);
    setEditingTaskId(null);
    setTitle('');
  };

  const renderTaskRow = (task: TaskItem, hideSubjectTag = false) => {
    const subj = subjectById[task.subjectId];
    const linkedTopic = task.topicId ? topicById[task.topicId] : undefined;
    const effectiveUrgency = getEffectiveTaskUrgency(task);
    const meta = URGENCY_META[effectiveUrgency];
    const countdown = getDueCountdownLabel(task.dueDate);

    return (
      <div
        key={task.id}
        className={`p-3.5 bg-[#0B1528] border border-slate-800/90 rounded-xl transition-colors ${
          task.completed ? 'opacity-60' : meta.borderAccentClass
        }`}
      >
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={() => toggleTaskCompleted(task.id)}
            className="mt-0.5 text-slate-400 hover:text-cyan-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded shrink-0"
            aria-label={
              task.completed
                ? `Mark "${task.title}" incomplete`
                : `Mark "${task.title}" complete`
            }
          >
            {task.completed ? (
              <CheckSquare className="w-4 h-4 text-cyan-400" />
            ) : (
              <Square className="w-4 h-4" />
            )}
          </button>

          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <p
                className={`text-sm font-medium leading-snug ${
                  task.completed ? 'line-through text-slate-500' : 'text-white'
                }`}
              >
                {task.title}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-400">
              {!hideSubjectTag && (
                <button
                  type="button"
                  onClick={() =>
                    setSubjectFilter((prev) =>
                      prev === task.subjectId ? 'all' : task.subjectId
                    )
                  }
                  className="inline-flex items-center gap-1.5 text-cyan-300 hover:text-cyan-200 font-medium"
                  title="Filter by this subject"
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: subj?.accentHex ?? '#22d3ee' }}
                  />
                  {subj?.name ?? 'General'}
                </button>
              )}

              <span className="capitalize text-slate-400">{task.kind}</span>
              <span aria-hidden="true" className="text-slate-700">·</span>

              <span
                className={`font-mono tabular-nums ${
                  countdown.isOverdue
                    ? 'text-rose-300 font-semibold'
                    : countdown.isImminent && !task.completed
                    ? 'text-amber-300 font-medium'
                    : 'text-slate-400'
                }`}
              >
                {countdown.label}
              </span>

              <span aria-hidden="true" className="text-slate-700">·</span>
              <span className="font-mono tabular-nums text-slate-400">
                {task.estimatedMinutes}m
              </span>

              {linkedTopic && (
                <>
                  <span aria-hidden="true" className="text-slate-700">·</span>
                  <span className="truncate max-w-[190px] text-slate-400">
                    {linkedTopic.title}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Inline Prioritization & Task Actions Row */}
        <div className="mt-2.5 pt-2 border-t border-slate-800/70 flex flex-wrap items-center justify-between gap-2 pl-7">
          <div className="flex items-center gap-2">
            <label className="sr-only" htmlFor={`urgency-${task.id}`}>
              Urgency for {task.title}
            </label>
            <select
              id={`urgency-${task.id}`}
              value={effectiveUrgency}
              onChange={(e) =>
                updateTask(task.id, { urgency: e.target.value as TaskUrgency })
              }
              className={`px-2 py-1 text-[11px] font-semibold border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-400 cursor-pointer ${meta.badgeClass}`}
              aria-label={`Priority level for ${task.title}`}
            >
              {URGENCY_ORDER.map((u) => (
                <option key={u} value={u} className="bg-[#0F1B33] text-slate-100">
                  {URGENCY_META[u].label} urgency
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => toggleTaskTodayFocus(task.id)}
              className={`inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium rounded-md border transition-colors ${
                task.isTodayFocus
                  ? 'bg-cyan-500/15 text-cyan-300 border-cyan-400/40'
                  : 'bg-[#0F1B33] text-slate-400 border-slate-700/80 hover:text-slate-200'
              }`}
              title={task.isTodayFocus ? 'Remove from Today Focus' : 'Pin to Today Focus'}
            >
              <Star
                className={`w-3 h-3 ${task.isTodayFocus ? 'fill-cyan-300 text-cyan-300' : ''}`}
              />
              {task.isTodayFocus ? 'Today' : 'Pin today'}
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => openEditForm(task)}
              className="p-1.5 text-slate-400 hover:text-cyan-300 rounded-md hover:bg-slate-800/70 transition-colors"
              aria-label={`Edit ${task.title}`}
              title="Edit assignment"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => deleteTask(task.id)}
              className="p-1.5 text-slate-400 hover:text-rose-300 rounded-md hover:bg-slate-800/70 transition-colors"
              aria-label={`Delete ${task.title}`}
              title="Delete assignment"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section
      aria-label="Assignment and task prioritization manager"
      className="lg:col-span-6 bg-[#0F1B33] border border-slate-800 rounded-2xl p-6 space-y-4"
    >
      {/* Card Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-semibold text-white">
            Assignment &amp; task manager
          </h3>
          <p className="text-xs text-slate-400 tabular-nums mt-0.5">
            {metrics.openCount} open ·{' '}
            <span className={metrics.urgentCount > 0 ? 'text-amber-300 font-medium' : ''}>
              {metrics.urgentCount} critical/high
            </span>{' '}
            · {metrics.totalOpenMinutes}m est. workload
          </p>
        </div>
        <button
          type="button"
          onClick={() => (formOpen && !editingTaskId ? setFormOpen(false) : openCreateForm())}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg whitespace-nowrap shrink-0 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          New task
        </button>
      </div>

      {/* 1-Click Urgency Summary / Filter Strip */}
      <div className="grid grid-cols-4 gap-2" role="group" aria-label="Filter by urgency">
        {URGENCY_ORDER.map((level) => {
          const meta = URGENCY_META[level];
          const isSelected = urgencyFilter === level;
          const count = metrics.urgencyCounts[level];
          return (
            <button
              key={level}
              type="button"
              onClick={() => {
                setUrgencyFilter((prev) => (prev === level ? 'all' : level));
                if (activeTab === 'classes') setActiveTab('priority');
              }}
              className={`px-2.5 py-2 rounded-xl border text-left transition-colors ${
                isSelected
                  ? meta.activeFilterClass
                  : 'bg-[#0B1528] border-slate-800 hover:border-slate-700 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between gap-1.5">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-medium truncate">
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${meta.dotClass}`} />
                  {meta.label}
                </span>
                <span className="font-mono text-xs font-semibold tabular-nums">
                  {count}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* View Switcher */}
      <div
        role="tablist"
        aria-label="Task management views"
        className="grid grid-cols-4 p-1 bg-[#0B1528] border border-slate-800 rounded-xl"
      >
        {(
          [
            { id: 'priority', label: `Queue (${metrics.openCount})` },
            { id: 'today', label: `Today (${metrics.todayOpenCount})` },
            { id: 'by-subject', label: 'By Subject' },
            { id: 'classes', label: 'Tomorrow' },
          ] as { id: ManagerTab; label: string }[]
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-1.5 px-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap truncate ${
              activeTab === tab.id
                ? 'bg-[#162647] text-cyan-300'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Create / Edit Assignment Form */}
      {formOpen && (
        <form
          onSubmit={handleFormSubmit}
          className="p-4 bg-[#0B1528] border border-cyan-500/30 rounded-xl space-y-3"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-cyan-300">
              {editingTaskId ? 'Edit assignment / task' : 'Add school assignment or task'}
            </span>
            <button
              type="button"
              onClick={() => {
                setFormOpen(false);
                setEditingTaskId(null);
              }}
              className="text-slate-400 hover:text-white"
              aria-label="Close task form"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <input
            ref={titleInputRef}
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Assignment title (e.g. Lab Report Draft or Chapter 5 Problems)"
            className="w-full px-3 py-2 text-sm bg-[#0F1B33] border border-slate-700 text-slate-100 placeholder:text-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
          />

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <select
              value={subjectId}
              onChange={(e) => {
                setSubjectId(e.target.value);
                setTopicId('');
              }}
              className="px-2.5 py-1.5 text-xs bg-[#0F1B33] border border-slate-700 text-slate-200 rounded-lg"
              aria-label="Task subject"
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>

            <select
              value={urgency}
              onChange={(e) => setUrgency(e.target.value as TaskUrgency)}
              className="px-2.5 py-1.5 text-xs bg-[#0F1B33] border border-slate-700 text-slate-200 rounded-lg"
              aria-label="Task urgency"
            >
              {URGENCY_ORDER.map((u) => (
                <option key={u} value={u}>
                  {URGENCY_META[u].label} urgency
                </option>
              ))}
            </select>

            <select
              value={kind}
              onChange={(e) => setKind(e.target.value as TaskItem['kind'])}
              className="px-2.5 py-1.5 text-xs bg-[#0F1B33] border border-slate-700 text-slate-200 rounded-lg"
              aria-label="Task type"
            >
              <option value="assignment">Assignment</option>
              <option value="assessment">Assessment</option>
              <option value="revision">Revision</option>
            </select>

            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="px-2 py-1.5 text-xs font-mono bg-[#0F1B33] border border-slate-700 text-slate-200 rounded-lg"
              aria-label="Due date"
            />

            <div className="flex items-center gap-1.5 bg-[#0F1B33] border border-slate-700 rounded-lg px-2.5">
              <input
                type="number"
                min={5}
                max={240}
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                className="w-full py-1.5 text-xs font-mono tabular-nums bg-transparent text-slate-200 focus:outline-none"
                aria-label="Estimated minutes"
              />
              <span className="text-[11px] text-slate-400 shrink-0">min</span>
            </div>

            <select
              value={topicId}
              onChange={(e) => setTopicId(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-[#0F1B33] border border-slate-700 text-slate-200 rounded-lg"
              aria-label="Linked syllabus topic"
            >
              <option value="">General topic</option>
              {subjectTopics.map((tp) => (
                <option key={tp.id} value={tp.id}>
                  {tp.title}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <label className="inline-flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={isTodayFocus}
                onChange={(e) => setIsTodayFocus(e.target.checked)}
                className="rounded border-slate-600 bg-[#0F1B33] text-cyan-400 focus:ring-cyan-400"
              />
              Pin to Today Focus
            </label>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setFormOpen(false);
                  setEditingTaskId(null);
                }}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg"
              >
                {editingTaskId ? 'Save changes' : 'Add task'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Filter & Sort Toolbar (for Priority Queue, Today Focus, and By Subject) */}
      {activeTab !== 'classes' && (
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-1.5 bg-[#0B1528] border border-slate-800 rounded-lg px-2 py-1">
              <Filter className="w-3 h-3 text-cyan-400 shrink-0" />
              <select
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
                className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer"
                aria-label="Filter tasks by subject"
              >
                <option value="all" className="bg-[#0F1B33]">
                  All subjects
                </option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id} className="bg-[#0F1B33]">
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as TaskSortMode)}
              className="px-2.5 py-1 text-xs bg-[#0B1528] border border-slate-800 text-slate-200 rounded-lg focus:outline-none cursor-pointer"
              aria-label="Sort tasks"
            >
              <option value="smart">Sort: Smart priority</option>
              <option value="urgency">Sort: Urgency (High → Low)</option>
              <option value="due-date">Sort: Soonest due date</option>
              <option value="subject">Sort: Subject (A–Z)</option>
            </select>

            {(subjectFilter !== 'all' || urgencyFilter !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSubjectFilter('all');
                  setUrgencyFilter('all');
                }}
                className="text-[11px] text-cyan-300 hover:text-cyan-200 underline underline-offset-2"
              >
                Clear filters
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setShowCompleted((v) => !v)}
            className={`px-2.5 py-1 text-[11px] font-medium rounded-lg border transition-colors ${
              showCompleted
                ? 'bg-[#162647] border-cyan-500/40 text-cyan-300'
                : 'bg-[#0B1528] border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {showCompleted
              ? `Showing done (${metrics.completedCount})`
              : `Done (${metrics.completedCount})`}
          </button>
        </div>
      )}

      {/* TAB 1 & 2: Priority Queue & Today Focus */}
      {(activeTab === 'priority' || activeTab === 'today') && (
        <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-0.5">
          {visibleTasks.length === 0 ? (
            <div className="p-6 bg-[#0B1528] border border-slate-800/90 rounded-xl text-center space-y-2">
              <p className="text-sm text-slate-300 font-medium">
                {activeTab === 'today'
                  ? 'No focus tasks match these filters for today.'
                  : 'No assignments match these filters.'}
              </p>
              <p className="text-xs text-slate-400">
                {subjectFilter !== 'all' || urgencyFilter !== 'all'
                  ? 'Try clearing your subject or urgency filter, or add a new assignment.'
                  : 'Add an assignment or pin an urgent task from the Priority Queue.'}
              </p>
            </div>
          ) : (
            visibleTasks.map((task) => renderTaskRow(task))
          )}
        </div>
      )}

      {/* TAB 3: Grouped By Subject */}
      {activeTab === 'by-subject' && (
        <div className="space-y-3 max-h-[520px] overflow-y-auto pr-0.5">
          {groupedBySubject.map((group) => (
            <div
              key={group.subject.id}
              className="bg-[#0B1528] border border-slate-800/90 rounded-xl p-3.5 space-y-2.5"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: group.subject.accentHex }}
                  />
                  <button
                    type="button"
                    onClick={() => openInSubject(group.subject.id)}
                    className="text-sm font-semibold text-white hover:text-cyan-300 truncate transition-colors"
                  >
                    {group.subject.name}
                  </button>
                  <span className="text-[11px] font-mono text-slate-400 tabular-nums">
                    {group.openCount} open · {group.totalMins}m
                  </span>
                  {group.urgentCount > 0 && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-amber-300 font-medium">
                      <AlertTriangle className="w-3 h-3" />
                      {group.urgentCount} urgent
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => openCreateForm(group.subject.id)}
                  className="text-[11px] font-medium text-cyan-300 hover:text-cyan-200 whitespace-nowrap"
                >
                  + Add
                </button>
              </div>

              {group.tasks.length === 0 ? (
                <p className="text-xs text-slate-500 pl-4">
                  No open tasks matching current filters.
                </p>
              ) : (
                <div className="space-y-2">
                  {group.tasks.map((task) => renderTaskRow(task, true))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: Tomorrow's Timetable */}
      {activeTab === 'classes' && (
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 text-xs text-slate-400 pb-1">
            <Calendar className="w-3.5 h-3.5 text-cyan-400" />
            <span>Wednesday school timetable</span>
          </div>
          {tomorrowClasses.map((slot) => {
            const subj = subjectById[slot.subjectId];
            const openForSubj = tasks.filter(
              (t) => !t.completed && t.subjectId === slot.subjectId
            ).length;
            return (
              <button
                key={slot.id}
                type="button"
                onClick={() => openInSubject(slot.subjectId)}
                className="w-full text-left p-3.5 bg-[#0B1528] border border-slate-800/90 hover:border-cyan-400/40 rounded-xl transition-colors flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: subj?.accentHex ?? '#22d3ee' }}
                  />
                  <span className="text-sm font-medium text-white">{subj?.name}</span>
                  {openForSubj > 0 && (
                    <span className="text-[11px] font-mono text-amber-300">
                      {openForSubj} open task{openForSubj > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                <span className="text-xs font-mono text-slate-400 tabular-nums">
                  {slot.time} · {slot.room}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
};
