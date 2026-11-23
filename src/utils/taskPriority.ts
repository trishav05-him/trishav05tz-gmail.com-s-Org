import { TaskItem, TaskUrgency } from '../types/platform';

export const URGENCY_ORDER: TaskUrgency[] = ['critical', 'high', 'medium', 'low'];

export const URGENCY_META: Record<
  TaskUrgency,
  {
    label: string;
    rank: number;
    badgeClass: string;
    dotClass: string;
    activeFilterClass: string;
    borderAccentClass: string;
  }
> = {
  critical: {
    label: 'Critical',
    rank: 4,
    badgeClass: 'bg-rose-500/15 text-rose-300 border-rose-500/40',
    dotClass: 'bg-rose-400',
    activeFilterClass: 'bg-rose-500/20 text-rose-200 border-rose-400/60',
    borderAccentClass: 'border-l-2 border-l-rose-400',
  },
  high: {
    label: 'High',
    rank: 3,
    badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/40',
    dotClass: 'bg-amber-400',
    activeFilterClass: 'bg-amber-500/20 text-amber-200 border-amber-400/60',
    borderAccentClass: 'border-l-2 border-l-amber-400',
  },
  medium: {
    label: 'Medium',
    rank: 2,
    badgeClass: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/35',
    dotClass: 'bg-cyan-400',
    activeFilterClass: 'bg-cyan-500/20 text-cyan-200 border-cyan-400/60',
    borderAccentClass: 'border-l-2 border-l-cyan-400',
  },
  low: {
    label: 'Low',
    rank: 1,
    badgeClass: 'bg-slate-700/40 text-slate-300 border-slate-600/60',
    dotClass: 'bg-slate-400',
    activeFilterClass: 'bg-slate-700/70 text-white border-slate-400/60',
    borderAccentClass: 'border-l-2 border-l-slate-600',
  },
};

export function getDaysUntilDue(dueDate: string): number {
  const today = new Date();
  const todayMid = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  const parts = dueDate.split('-').map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) return 7;
  const targetMid = Date.UTC(parts[0], parts[1] - 1, parts[2]);
  return Math.round((targetMid - todayMid) / 86400000);
}

export function getEffectiveTaskUrgency(task: TaskItem): TaskUrgency {
  if (task.urgency) return task.urgency;
  const days = getDaysUntilDue(task.dueDate);
  if (days <= 1) return 'critical';
  if (days <= 3 || (task.kind === 'assessment' && days <= 5)) return 'high';
  if (days <= 7) return 'medium';
  return 'low';
}

export function getDueCountdownLabel(dueDate: string): {
  label: string;
  isOverdue: boolean;
  isImminent: boolean;
  daysLeft: number;
} {
  const days = getDaysUntilDue(dueDate);
  if (days < 0) {
    return {
      label: `${Math.abs(days)}d overdue`,
      isOverdue: true,
      isImminent: true,
      daysLeft: days,
    };
  }
  if (days === 0) {
    return { label: 'Due today', isOverdue: false, isImminent: true, daysLeft: 0 };
  }
  if (days === 1) {
    return { label: 'Due tomorrow', isOverdue: false, isImminent: true, daysLeft: 1 };
  }
  if (days <= 7) {
    return { label: `In ${days}d`, isOverdue: false, isImminent: days <= 2, daysLeft: days };
  }
  const parsed = new Date(`${dueDate}T00:00:00`);
  const formatted = Number.isNaN(parsed.getTime())
    ? dueDate
    : new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(parsed);
  return { label: formatted, isOverdue: false, isImminent: false, daysLeft: days };
}

export type TaskSortMode = 'smart' | 'urgency' | 'due-date' | 'subject';

export function sortTasksByMode(
  tasks: TaskItem[],
  sortBy: TaskSortMode,
  subjectNameById: Record<string, string>
): TaskItem[] {
  return [...tasks].sort((a, b) => {
    // Incomplete tasks always come before completed tasks
    if (a.completed !== b.completed) return a.completed ? 1 : -1;

    const urgA = URGENCY_META[getEffectiveTaskUrgency(a)].rank;
    const urgB = URGENCY_META[getEffectiveTaskUrgency(b)].rank;

    if (sortBy === 'urgency') {
      if (urgA !== urgB) return urgB - urgA;
      return a.dueDate.localeCompare(b.dueDate);
    }

    if (sortBy === 'due-date') {
      const dateCmp = a.dueDate.localeCompare(b.dueDate);
      if (dateCmp !== 0) return dateCmp;
      return urgB - urgA;
    }

    if (sortBy === 'subject') {
      const nameA = subjectNameById[a.subjectId] ?? '';
      const nameB = subjectNameById[b.subjectId] ?? '';
      const nameCmp = nameA.localeCompare(nameB);
      if (nameCmp !== 0) return nameCmp;
      if (urgA !== urgB) return urgB - urgA;
      return a.dueDate.localeCompare(b.dueDate);
    }

    // 'smart': Urgency tier first, then overdue/soonest due date, then assessments before revision
    if (urgA !== urgB) return urgB - urgA;
    const dateCmp = a.dueDate.localeCompare(b.dueDate);
    if (dateCmp !== 0) return dateCmp;
    const kindWeight = (k: TaskItem['kind']) =>
      k === 'assessment' ? 3 : k === 'assignment' ? 2 : 1;
    return kindWeight(b.kind) - kindWeight(a.kind);
  });
}
