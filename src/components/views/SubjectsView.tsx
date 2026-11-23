import React, { useMemo, useState } from 'react';
import {
  CalendarClock,
  CheckSquare,
  ChevronDown,
  ChevronUp,
  FolderOpen,
  Layers,
  MessageSquareText,
  Plus,
  Square,
  Trash2,
} from 'lucide-react';
import { usePlatform } from '../../context/PlatformContext';
import { ConfidenceLevel, TimetableSlot, UnderstandingStatus } from '../../types/platform';
import { ResourceCard } from '../common/ResourceCard';
import {
  AssessmentStateIndicator,
  formatFriendlyDate,
} from '../common/StatusLabels';

type SubjectTab = 'topics' | 'schedule' | 'resources';

export const SubjectsView: React.FC = () => {
  const {
    currentUser,
    curriculumProfile,
    subjects,
    topics,
    topicProfiles,
    tasks,
    timetable,
    resources,
    selectedSubjectId,
    setSelectedSubjectId,
    addSubject,
    addTopic,
    updateTopicStatus,
    setTopicConfidence,
    addTask,
    toggleTaskCompleted,
    addTimetableSlot,
    removeTimetableSlot,
    openInTutor,
    openInStudyTools,
    setActiveSection,
  } = usePlatform();

  const [activeTab, setActiveTab] = useState<SubjectTab>('topics');
  const [expandedTopicIds, setExpandedTopicIds] = useState<Record<string, boolean>>({});
  const [showAddTopic, setShowAddTopic] = useState(false);

  const [showNewSubjectForm, setShowNewSubjectForm] = useState(false);
  const [newSubjName, setNewSubjName] = useState('');
  const [newSubjCode, setNewSubjCode] = useState('');
  const [newSubjTeacher, setNewSubjTeacher] = useState('');
  const [newSubjFocus, setNewSubjFocus] = useState('');

  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicUnit, setNewTopicUnit] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState('');

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskKind, setNewTaskKind] =
    useState<'assignment' | 'assessment' | 'revision'>('assignment');
  const [newTaskDue, setNewTaskDue] = useState(() =>
    new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10)
  );
  const [newTaskMinutes, setNewTaskMinutes] = useState(30);

  const [slotDay, setSlotDay] = useState<TimetableSlot['day']>('Wed');
  const [slotTime, setSlotTime] = useState('11:15');
  const [slotRoom, setSlotRoom] = useState('');

  const currentSubject = subjects.find((s) => s.id === selectedSubjectId) ?? subjects[0];

  const subjectProfiles = useMemo(
    () => topicProfiles.filter((p) => p.topic.subjectId === currentSubject?.id),
    [topicProfiles, currentSubject]
  );

  const subjectTasks = useMemo(
    () =>
      tasks
        .filter((t) => t.subjectId === currentSubject?.id)
        .sort((a, b) => a.dueDate.localeCompare(b.dueDate)),
    [tasks, currentSubject]
  );

  const subjectResources = useMemo(
    () => resources.filter((r) => r.subjectId === currentSubject?.id),
    [resources, currentSubject]
  );

  const subjectTimetable = useMemo(
    () => timetable.filter((slot) => slot.subjectId === currentSubject?.id),
    [timetable, currentSubject]
  );

  const progressSummary = useMemo(() => {
    const total = subjectProfiles.length;
    const solid = subjectProfiles.filter((p) => p.assessmentState === 'solid').length;
    const developing = subjectProfiles.filter(
      (p) => p.assessmentState === 'developing' || p.assessmentState === 'early-evidence'
    ).length;
    const attention = subjectProfiles.filter(
      (p) => p.assessmentState === 'needs-attention'
    ).length;
    const unassessed = subjectProfiles.filter(
      (p) => p.assessmentState === 'not-yet-assessed'
    ).length;
    return { total, solid, developing, attention, unassessed };
  }, [subjectProfiles]);

  const toggleTopicExpand = (topicId: string) => {
    setExpandedTopicIds((prev) => ({ ...prev, [topicId]: !prev[topicId] }));
  };

  const handleCreateSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjName.trim()) return;
    addSubject({
      name: newSubjName.trim(),
      code: newSubjCode.trim() || 'SUB-101',
      teacher: newSubjTeacher.trim() || 'Subject Teacher',
      accentHex: '#22D3EE',
      currentFocus: newSubjFocus.trim() || 'Core Foundations',
    });
    setNewSubjName('');
    setNewSubjCode('');
    setNewSubjTeacher('');
    setNewSubjFocus('');
    setShowNewSubjectForm(false);
  };

  const handleAddTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicTitle.trim() || !currentSubject) return;
    addTopic({
      subjectId: currentSubject.id,
      title: newTopicTitle.trim(),
      unit: newTopicUnit.trim() || currentSubject.currentFocus,
      status: 'developing',
      studentNote: '',
    });
    setNewTopicTitle('');
    setNewTopicUnit('');
    setShowAddTopic(false);
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !currentSubject) return;
    addTask({
      subjectId: currentSubject.id,
      title: newTaskTitle.trim(),
      kind: newTaskKind,
      dueDate: newTaskDue,
      estimatedMinutes: Number(newTaskMinutes) || 25,
      isTodayFocus: false,
    });
    setNewTaskTitle('');
  };

  const handleAddSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSubject) return;
    addTimetableSlot({
      day: slotDay,
      time: slotTime,
      subjectId: currentSubject.id,
      room: slotRoom.trim() || 'Classroom',
    });
    setSlotRoom('');
  };

  if (!currentSubject) return null;

  return (
    <div className="space-y-6">
      {/* Subject Selector Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1.5">
          {subjects.map((subj) => {
            const active = subj.id === currentSubject.id;
            return (
              <button
                key={subj.id}
                type="button"
                onClick={() => setSelectedSubjectId(subj.id)}
                className={`px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                  active
                    ? 'bg-cyan-400 text-slate-950 font-semibold'
                    : 'bg-[#0F1B33] text-slate-300 border border-slate-800 hover:text-white hover:border-slate-700'
                }`}
              >
                {subj.name}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => setShowNewSubjectForm((v) => !v)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-medium text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400/30 rounded-lg transition-colors whitespace-nowrap shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          New subject
        </button>
      </div>

      {showNewSubjectForm && (
        <form
          onSubmit={handleCreateSubject}
          className="bg-[#0F1B33] border border-slate-800 rounded-xl p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end"
        >
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Subject name</label>
            <input
              type="text"
              required
              value={newSubjName}
              onChange={(e) => setNewSubjName(e.target.value)}
              placeholder="e.g. Physics"
              className="w-full px-3 py-2 text-sm bg-[#0B1528] border border-slate-700 text-slate-100 placeholder:text-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Course code</label>
            <input
              type="text"
              value={newSubjCode}
              onChange={(e) => setNewSubjCode(e.target.value)}
              placeholder="e.g. PHY-101"
              className="w-full px-3 py-2 text-sm bg-[#0B1528] border border-slate-700 text-slate-100 placeholder:text-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Teacher</label>
            <input
              type="text"
              value={newSubjTeacher}
              onChange={(e) => setNewSubjTeacher(e.target.value)}
              placeholder="e.g. Mr. S. Nair"
              className="w-full px-3 py-2 text-sm bg-[#0B1528] border border-slate-700 text-slate-100 placeholder:text-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Current unit focus</label>
            <input
              type="text"
              value={newSubjFocus}
              onChange={(e) => setNewSubjFocus(e.target.value)}
              placeholder="e.g. Kinematics & Forces"
              className="w-full px-3 py-2 text-sm bg-[#0B1528] border border-slate-700 text-slate-100 placeholder:text-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 text-sm font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg whitespace-nowrap"
            >
              Add subject
            </button>
            <button
              type="button"
              onClick={() => setShowNewSubjectForm(false)}
              className="px-3 py-2 text-sm text-slate-400 hover:text-white"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Selected Subject Header + Visual Evidence Bar + 3-Tab Switcher */}
      <section className="bg-[#0F1B33] border border-slate-800 rounded-xl p-5 sm:p-6 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs font-mono text-cyan-400">
              {currentSubject.code} · {currentSubject.teacher}
              {currentUser ? ` · ${curriculumProfile.gradeLevel} (${curriculumProfile.systemName})` : ''}
            </p>
            <h2 className="font-display text-2xl font-semibold text-white">
              {currentSubject.name}
            </h2>
            <p className="text-sm text-slate-300">Current unit: {currentSubject.currentFocus}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => openInTutor(currentSubject.id)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg whitespace-nowrap"
            >
              <MessageSquareText className="w-3.5 h-3.5" />
              Practise in AI Tutor
            </button>
            <button
              type="button"
              onClick={() => openInStudyTools(currentSubject.id, 'summaries')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-200 bg-[#13223D] border border-slate-700 hover:bg-[#192D50] rounded-lg whitespace-nowrap"
            >
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              Open Study Tools
            </button>
          </div>
        </div>

        <div className="space-y-2 pt-3 border-t border-slate-800">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 tabular-nums">
            <span>
              <span className="text-emerald-400 font-medium">{progressSummary.solid} strong</span>
              {' · '}
              <span className="text-cyan-300 font-medium">{progressSummary.developing} developing</span>
              {' · '}
              <span className="text-amber-300 font-medium">{progressSummary.attention} needs attention</span>
              {' · '}
              <span>{progressSummary.unassessed} unassessed</span>
            </span>
            <span>{progressSummary.total} tracked topics</span>
          </div>
          {progressSummary.total > 0 && (
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex">
              <div
                style={{ width: `${(progressSummary.solid / progressSummary.total) * 100}%` }}
                className="bg-emerald-400 transition-all"
              />
              <div
                style={{ width: `${(progressSummary.developing / progressSummary.total) * 100}%` }}
                className="bg-cyan-400 transition-all"
              />
              <div
                style={{ width: `${(progressSummary.attention / progressSummary.total) * 100}%` }}
                className="bg-amber-400 transition-all"
              />
              <div
                style={{ width: `${(progressSummary.unassessed / progressSummary.total) * 100}%` }}
                className="bg-slate-600 transition-all"
              />
            </div>
          )}
        </div>

        {/* Clean Segmented Sub-Tabs */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
          <div
            role="tablist"
            aria-label="Subject sections"
            className="inline-flex items-center p-1 bg-[#0B1528] border border-slate-800 rounded-lg"
          >
            {(
              [
                { id: 'topics', label: `Topics & Evidence (${subjectProfiles.length})` },
                {
                  id: 'schedule',
                  label: `Timetable & Deadlines (${subjectTasks.filter((t) => !t.completed).length})`,
                },
                { id: 'resources', label: `Resource Library (${subjectResources.length})` },
              ] as { id: SubjectTab; label: string }[]
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

          {activeTab === 'topics' && (
            <button
              type="button"
              onClick={() => setShowAddTopic((v) => !v)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400/30 rounded-lg"
            >
              <Plus className="w-3.5 h-3.5" />
              {showAddTopic ? 'Close form' : 'Add topic'}
            </button>
          )}
        </div>
      </section>

      {/* TAB 1: TOPICS & EVIDENCE */}
      {activeTab === 'topics' && (
        <section className="bg-[#0F1B33] border border-slate-800 rounded-xl p-5 sm:p-6 space-y-5">
          {showAddTopic && (
            <form
              onSubmit={handleAddTopic}
              className="p-4 bg-[#0B1528] border border-slate-700 rounded-xl grid grid-cols-1 sm:grid-cols-12 gap-2.5"
            >
              <input
                type="text"
                value={newTopicTitle}
                onChange={(e) => setNewTopicTitle(e.target.value)}
                placeholder="Topic title (e.g. Osmosis & Water Potential)"
                className="sm:col-span-6 px-3 py-2 text-sm bg-[#0F1B33] border border-slate-700 text-slate-100 placeholder:text-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
              <input
                type="text"
                value={newTopicUnit}
                onChange={(e) => setNewTopicUnit(e.target.value)}
                placeholder="Unit name"
                className="sm:col-span-4 px-3 py-2 text-sm bg-[#0B1528] border border-slate-700 text-slate-100 placeholder:text-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
              <button
                type="submit"
                className="sm:col-span-2 px-3 py-2 text-sm font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg whitespace-nowrap"
              >
                Save topic
              </button>
            </form>
          )}

          {subjectProfiles.length === 0 ? (
            <p className="text-sm text-slate-400 py-4">
              No topics recorded for {currentSubject.name} yet.
            </p>
          ) : (
            <ul className="divide-y divide-slate-800/80">
              {subjectProfiles.map((profile) => {
                const { topic } = profile;
                const isExpanded = Boolean(expandedTopicIds[topic.id]);
                return (
                  <li key={topic.id} className="py-4 first:pt-0 last:pb-0 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm sm:text-base font-semibold text-white">
                          {topic.title}
                        </p>
                        <p className="text-xs text-slate-400 tabular-nums mt-0.5">
                          {topic.unit} · {profile.quizSummary} · {profile.recallSummary} ·{' '}
                          {profile.explanationSummary}
                        </p>
                      </div>
                      <AssessmentStateIndicator
                        state={profile.assessmentState}
                        label={profile.label}
                      />
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="inline-flex items-center p-0.5 bg-[#0B1528] rounded-lg border border-slate-800">
                          {(['understood', 'developing', 'needs-review'] as UnderstandingStatus[]).map(
                            (st) => (
                              <button
                                key={st}
                                type="button"
                                onClick={() => updateTopicStatus(topic.id, st)}
                                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                                  topic.status === st
                                    ? 'bg-[#162647] text-cyan-300'
                                    : 'text-slate-400 hover:text-white'
                                }`}
                              >
                                {st === 'understood'
                                  ? 'Understood'
                                  : st === 'developing'
                                  ? 'Developing'
                                  : 'Needs review'}
                              </button>
                            )
                          )}
                        </div>

                        <select
                          value={topic.studentConfidence}
                          onChange={(e) =>
                            setTopicConfidence(topic.id, e.target.value as ConfidenceLevel)
                          }
                          className="px-2.5 py-1 text-xs border border-slate-700 rounded-lg bg-[#0B1528] text-slate-200"
                          aria-label={`Confidence for ${topic.title}`}
                        >
                          <option value="low">Confidence: Low</option>
                          <option value="moderate">Confidence: Moderate</option>
                          <option value="high">Confidence: High</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => openInStudyTools(currentSubject.id, 'quiz', topic.id)}
                          className="text-xs font-medium text-cyan-400 hover:text-cyan-300 whitespace-nowrap"
                        >
                          Quiz topic
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleTopicExpand(topic.id)}
                          className="inline-flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-white whitespace-nowrap"
                        >
                          {isExpanded ? 'Hide rationale & note' : 'Rationale & note'}
                          {isExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="p-3.5 bg-[#0B1528] border border-slate-800 rounded-xl space-y-3">
                        <p className="text-xs text-slate-300 leading-relaxed">
                          <span className="font-semibold text-cyan-300">Evidence rationale: </span>
                          {profile.whyExplanation}
                        </p>

                        {editingNoteId === topic.id ? (
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={noteDraft}
                              onChange={(e) => setNoteDraft(e.target.value)}
                              placeholder="Note what makes sense or where you still get stuck..."
                              className="flex-1 px-3 py-1.5 text-xs bg-[#0F1B33] border border-slate-700 text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                updateTopicStatus(topic.id, topic.status, noteDraft);
                                setEditingNoteId(null);
                              }}
                              className="px-3 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg whitespace-nowrap"
                            >
                              Save
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-start justify-between gap-3 text-xs">
                            <p className="text-slate-400">
                              <span className="font-medium text-slate-200">Your note: </span>
                              {topic.studentNote || 'No personal note added yet.'}
                            </p>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingNoteId(topic.id);
                                setNoteDraft(topic.studentNote);
                              }}
                              className="text-cyan-400 hover:text-cyan-300 whitespace-nowrap shrink-0"
                            >
                              Edit note
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}

      {/* TAB 2: TIMETABLE & DEADLINES */}
      {activeTab === 'schedule' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <section className="lg:col-span-5 bg-[#0F1B33] border border-slate-800 rounded-xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2">
              <CalendarClock className="w-4 h-4 text-cyan-400" />
              <h3 className="font-display text-base sm:text-lg font-semibold text-white">
                Weekly class periods
              </h3>
            </div>

            {subjectTimetable.length === 0 ? (
              <p className="text-xs text-slate-400">No timetable periods added yet.</p>
            ) : (
              <ul className="divide-y divide-slate-800/80">
                {subjectTimetable.map((slot) => (
                  <li
                    key={slot.id}
                    className="py-2.5 flex items-center justify-between text-xs text-slate-200"
                  >
                    <span className="font-mono tabular-nums">
                      {slot.day} · {slot.time} · {slot.room}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeTimetableSlot(slot.id)}
                      className="text-slate-500 hover:text-rose-400 p-1"
                      aria-label="Remove timetable slot"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <form
              onSubmit={handleAddSlot}
              className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-800"
            >
              <select
                value={slotDay}
                onChange={(e) => setSlotDay(e.target.value as TimetableSlot['day'])}
                className="px-2 py-1.5 text-xs border border-slate-700 rounded-lg bg-[#0B1528] text-slate-200"
              >
                {(['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] as TimetableSlot['day'][]).map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              <input
                type="time"
                value={slotTime}
                onChange={(e) => setSlotTime(e.target.value)}
                className="px-2 py-1.5 text-xs font-mono border border-slate-700 rounded-lg bg-[#0B1528] text-slate-200"
              />
              <div className="flex gap-1">
                <input
                  type="text"
                  value={slotRoom}
                  onChange={(e) => setSlotRoom(e.target.value)}
                  placeholder="Room"
                  className="min-w-0 flex-1 px-2 py-1.5 text-xs border border-slate-700 rounded-lg bg-[#0B1528] text-slate-200"
                />
                <button
                  type="submit"
                  className="px-2.5 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg"
                >
                  Add
                </button>
              </div>
            </form>
          </section>

          <section className="lg:col-span-7 bg-[#0F1B33] border border-slate-800 rounded-xl p-5 sm:p-6 space-y-4">
            <h3 className="font-display text-base sm:text-lg font-semibold text-white">
              Assignments &amp; assessment dates
            </h3>

            <form onSubmit={handleAddTask} className="space-y-2.5 p-3.5 bg-[#0B1528] border border-slate-800 rounded-xl">
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="New assignment or assessment title"
                className="w-full px-3 py-2 text-sm bg-[#0F1B33] border border-slate-700 text-slate-100 placeholder:text-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
              <div className="grid grid-cols-3 gap-2">
                <select
                  value={newTaskKind}
                  onChange={(e) =>
                    setNewTaskKind(e.target.value as 'assignment' | 'assessment' | 'revision')
                  }
                  className="px-2.5 py-2 text-xs border border-slate-700 rounded-lg bg-[#0F1B33] text-slate-200"
                  aria-label="Task type"
                >
                  <option value="assignment">Assignment</option>
                  <option value="assessment">Assessment</option>
                  <option value="revision">Revision</option>
                </select>
                <input
                  type="date"
                  value={newTaskDue}
                  onChange={(e) => setNewTaskDue(e.target.value)}
                  className="px-2.5 py-2 text-xs border border-slate-700 rounded-lg bg-[#0F1B33] text-slate-200 font-mono"
                  aria-label="Due date"
                />
                <input
                  type="number"
                  min={5}
                  max={180}
                  value={newTaskMinutes}
                  onChange={(e) => setNewTaskMinutes(Number(e.target.value))}
                  className="px-2.5 py-2 text-xs border border-slate-700 rounded-lg bg-[#0F1B33] text-slate-200 font-mono tabular-nums"
                  aria-label="Estimated minutes"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors"
              >
                Add deadline to {currentSubject.name}
              </button>
            </form>

            {subjectTasks.length === 0 ? (
              <p className="text-xs text-slate-400">No assignments or assessments scheduled.</p>
            ) : (
              <ul className="divide-y divide-slate-800/80">
                {subjectTasks.map((task) => (
                  <li key={task.id} className="py-2.5 flex items-start gap-2.5">
                    <button
                      type="button"
                      onClick={() => toggleTaskCompleted(task.id)}
                      className="mt-0.5 text-slate-400 hover:text-cyan-400"
                      aria-label={`Toggle ${task.title}`}
                    >
                      {task.completed ? (
                        <CheckSquare className="w-4 h-4 text-cyan-400" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-sm font-medium ${
                          task.completed ? 'line-through text-slate-500' : 'text-slate-100'
                        }`}
                      >
                        {task.title}
                      </p>
                      <p className="text-xs text-slate-400 font-mono tabular-nums">
                        {task.kind} · {formatFriendlyDate(task.dueDate)} · {task.estimatedMinutes}m
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}

      {/* TAB 3: RESOURCE LIBRARY */}
      {activeTab === 'resources' && (
        <section className="bg-[#0F1B33] border border-slate-800 rounded-xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-base sm:text-lg font-semibold text-white">
              {currentSubject.name} resource library
            </h3>
            <button
              type="button"
              onClick={() => setActiveSection('resources')}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-cyan-400 hover:text-cyan-300"
            >
              <FolderOpen className="w-3.5 h-3.5" />
              Open Resource Centre
            </button>
          </div>

          {subjectResources.length === 0 ? (
            <p className="text-xs text-slate-400">
              No materials in {currentSubject.name}&apos;s library yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {subjectResources.map((res) => (
                <ResourceCard
                  key={res.id}
                  resource={res}
                  subjectName={currentSubject.name}
                  topics={topics}
                  compact
                  onOpenTutor={() => openInTutor(currentSubject.id, res.id)}
                  onOpenStudyTools={() =>
                    openInStudyTools(currentSubject.id, 'summaries', 'all', res.id)
                  }
                />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
};
