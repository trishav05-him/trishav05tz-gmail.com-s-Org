import {
  MistakeRecord,
  ResourceItem,
  StudyRecommendation,
  SubjectItem,
  TaskItem,
  TimetableSlot,
  TopicItem,
  TopicUnderstandingProfile,
} from '../types/platform';

function getCurrentDateISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function daysBetween(fromIso: string, toIso: string): number {
  const from = new Date(`${fromIso}T00:00:00`).getTime();
  const to = new Date(`${toIso}T00:00:00`).getTime();
  return Math.round((to - from) / (1000 * 60 * 60 * 24));
}

export function evaluateTopicUnderstanding(
  topics: TopicItem[],
  subjects: SubjectItem[],
  mistakes: MistakeRecord[]
): TopicUnderstandingProfile[] {
  const subjectById = Object.fromEntries(subjects.map((s) => [s.id, s]));

  return topics.map((topic) => {
    const subjName = subjectById[topic.subjectId]?.name ?? 'Subject';
    const activeMistakes = mistakes.filter(
      (m) => !m.resolved && (m.topicId === topic.id || (!m.topicId && m.subjectId === topic.subjectId))
    );
    const {
      quizCorrect,
      quizTotal,
      quizAttemptsCount,
      independentRecallChecks,
      explanationChecksPassed,
    } = topic.evidence;

    const totalAssessments =
      quizAttemptsCount + independentRecallChecks + explanationChecksPassed;

    const quizPct = quizTotal > 0 ? Math.round((quizCorrect / quizTotal) * 100) : null;
    const quizSummary =
      quizTotal > 0
        ? `${quizCorrect}/${quizTotal} (${quizPct}%) across ${quizAttemptsCount} quiz${quizAttemptsCount === 1 ? '' : 'zes'}`
        : 'No quizzes taken';

    const recallSummary =
      independentRecallChecks > 0
        ? `${independentRecallChecks} independent recall check${independentRecallChecks === 1 ? '' : 's'}`
        : 'Not checked';

    const explanationSummary =
      explanationChecksPassed > 0
        ? `${explanationChecksPassed} explanation check${explanationChecksPassed === 1 ? '' : 's'} passed`
        : 'Not yet explained';

    const confidenceLabel =
      topic.studentConfidence === 'high'
        ? 'High confidence'
        : topic.studentConfidence === 'moderate'
        ? 'Moderate confidence'
        : 'Low confidence';

    // Rule 1: Topics with zero quiz, recall, or explanation evidence are explicitly "Not yet assessed"
    if (totalAssessments === 0) {
      return {
        topic,
        subjectName: subjName,
        assessmentState: 'not-yet-assessed',
        label: 'Not yet assessed',
        quizSummary,
        recallSummary,
        explanationSummary,
        confidenceLabel,
        activeMisconceptionsCount: activeMistakes.length,
        whyExplanation: `No quiz, recall, or explanation evidence recorded yet. Student reported ${topic.studentConfidence} confidence—needs an initial check before assuming readiness.`,
      };
    }

    // Rule 2: Weak / Needs attention when repeated misconceptions exist, quiz accuracy < 70%, or status is needs-review
    if (
      activeMistakes.length > 0 ||
      (quizPct !== null && quizPct < 70) ||
      topic.status === 'needs-review'
    ) {
      const reasons: string[] = [];
      if (quizPct !== null && quizPct < 70) {
        reasons.push(`quiz accuracy is ${quizCorrect}/${quizTotal} (${quizPct}%)`);
      }
      if (activeMistakes.length > 0) {
        const totalOcc = activeMistakes.reduce((s, m) => s + m.occurrences, 0);
        reasons.push(
          `${activeMistakes.length} active misconception${activeMistakes.length > 1 ? 's' : ''} (${totalOcc} occurrences)`
        );
      }
      if (explanationChecksPassed === 0) {
        reasons.push('no verified written or tutor explanation yet');
      }
      if (topic.studentConfidence === 'low') {
        reasons.push('student confidence is low');
      }

      return {
        topic,
        subjectName: subjName,
        assessmentState: 'needs-attention',
        label: 'Needs attention',
        quizSummary,
        recallSummary,
        explanationSummary,
        confidenceLabel,
        activeMisconceptionsCount: activeMistakes.length,
        whyExplanation: `Flagged weak because ${reasons.join('; ')}.`,
      };
    }

    // Rule 3: Never treat a single quiz result alone as proof of mastery!
    const hasMultipleEvidenceModes =
      (quizAttemptsCount >= 1 && independentRecallChecks >= 1) ||
      (quizAttemptsCount >= 1 && explanationChecksPassed >= 1) ||
      (independentRecallChecks >= 2 && explanationChecksPassed >= 1);

    if (!hasMultipleEvidenceModes) {
      return {
        topic,
        subjectName: subjName,
        assessmentState: 'early-evidence',
        label: 'Early evidence (verify further)',
        quizSummary,
        recallSummary,
        explanationSummary,
        confidenceLabel,
        activeMisconceptionsCount: 0,
        whyExplanation: `Only a single evidence source exists so far (${quizTotal > 0 ? quizSummary : recallSummary}). Add an explanation or recall check to confirm durable understanding.`,
      };
    }

    // Rule 4: Solid multi-signal understanding (quiz >= 75% + recall or explanation, zero unresolved misconceptions)
    if (
      topic.status === 'understood' &&
      (quizPct === null || quizPct >= 75) &&
      independentRecallChecks >= 1 &&
      explanationChecksPassed >= 1
    ) {
      return {
        topic,
        subjectName: subjName,
        assessmentState: 'solid',
        label: 'Strong understanding',
        quizSummary,
        recallSummary,
        explanationSummary,
        confidenceLabel,
        activeMisconceptionsCount: 0,
        whyExplanation: `Verified across multiple signals: ${quizSummary}, ${recallSummary}, and ${explanationSummary}, with zero unresolved misconceptions.`,
      };
    }

    return {
      topic,
      subjectName: subjName,
      assessmentState: 'developing',
      label: 'Developing',
      quizSummary,
      recallSummary,
      explanationSummary,
      confidenceLabel,
      activeMisconceptionsCount: 0,
      whyExplanation: `Partial evidence recorded (${quizSummary}; ${recallSummary}). Complete an explanation check or second recall session to solidify.`,
    };
  });
}

export interface CurriculumContextInput {
  country: string;
  gradeLevel: string;
  age: number;
  tier: 'foundation' | 'standard' | 'advanced';
  systemName: string;
  tierLabel: string;
}

export function buildIntelligentRecommendations(params: {
  subjects: SubjectItem[];
  topics: TopicItem[];
  tasks: TaskItem[];
  resources: ResourceItem[];
  mistakes: MistakeRecord[];
  timetable: TimetableSlot[];
  availableStudyMinutes: number;
  curriculumProfile?: CurriculumContextInput;
}): StudyRecommendation[] {
  const {
    subjects,
    topics,
    tasks,
    resources,
    mistakes,
    timetable,
    availableStudyMinutes,
    curriculumProfile,
  } = params;

  const profiles = evaluateTopicUnderstanding(topics, subjects, mistakes);
  const openTasks = tasks.filter((t) => !t.completed);
  const wednesdaySubjects = new Set(
    timetable.filter((slot) => slot.day === 'Wed').map((slot) => slot.subjectId)
  );

  const candidates: StudyRecommendation[] = [];

  for (const profile of profiles) {
    const { topic } = profile;
    // Do not push already solid topics unless they have an imminent assessment
    const linkedTask = openTasks
      .filter((t) => t.topicId === topic.id || t.subjectId === topic.subjectId)
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0];

    const daysUntil = linkedTask ? daysBetween(getCurrentDateISO(), linkedTask.dueDate) : undefined;
    const isUrgentDeadline = daysUntil !== undefined && daysUntil <= 5;

    if (profile.assessmentState === 'solid' && !isUrgentDeadline) {
      continue;
    }

    // Score strictly from concrete signals + curriculum profile calibration
    let score = 0;
    const evidenceReasons: string[] = [];

    if (profile.assessmentState === 'needs-attention') {
      score += 40;
      evidenceReasons.push(profile.whyExplanation.replace(/\.$/, ''));
    } else if (profile.assessmentState === 'not-yet-assessed') {
      score += 24;
      evidenceReasons.push('Topic has not yet been assessed');
    } else if (profile.assessmentState === 'early-evidence' || profile.assessmentState === 'developing') {
      score += 18;
      evidenceReasons.push('Needs second check beyond initial exposure');
    }

    if (curriculumProfile) {
      if (curriculumProfile.tier === 'foundation' && topic.difficulty === 'foundational') {
        score += 12;
        evidenceReasons.push(
          `Core ${curriculumProfile.gradeLevel} (${curriculumProfile.country}) foundation topic`
        );
      } else if (curriculumProfile.tier === 'advanced' && topic.difficulty === 'challenging') {
        score += 14;
        evidenceReasons.push(
          `High-weight ${curriculumProfile.gradeLevel} (${curriculumProfile.systemName}) exam topic`
        );
      } else if (curriculumProfile.tier === 'standard' && topic.difficulty === 'standard') {
        score += 8;
        evidenceReasons.push(
          `Aligned to ${curriculumProfile.gradeLevel} (${curriculumProfile.systemName})`
        );
      }
    } else if (topic.difficulty === 'challenging') {
      score += 10;
    }

    if (linkedTask) {
      if (linkedTask.kind === 'assessment') score += 22;
      else score += 12;

      if (linkedTask.urgency === 'critical') {
        score += 18;
        evidenceReasons.push(`Marked Critical priority (${linkedTask.title})`);
      } else if (linkedTask.urgency === 'high') {
        score += 10;
      }

      if (daysUntil !== undefined && daysUntil <= 2) {
        score += 22;
        evidenceReasons.push(`${linkedTask.title} due in ${Math.max(0, daysUntil)} day(s)`);
      } else if (daysUntil !== undefined && daysUntil <= 5) {
        score += 14;
        evidenceReasons.push(`${linkedTask.title} due in ${daysUntil} days`);
      }
    }

    if (wednesdaySubjects.has(topic.subjectId)) {
      score += 6;
      evidenceReasons.push('Class scheduled tomorrow (Wednesday timetable)');
    }

    // Find ONLY truly extracted, accessible resources covering this topic
    const matchingExtractedResource = resources.find(
      (r) =>
        r.subjectId === topic.subjectId &&
        r.processingStatus === 'extracted' &&
        (r.identifiedTopics.includes(topic.id) ||
          r.identifiedTopics.some((tag) =>
            topic.title.toLowerCase().includes(tag.toLowerCase())
          ))
    );

    const fallbackExtractedResource = resources.find(
      (r) => r.subjectId === topic.subjectId && r.processingStatus === 'extracted'
    );

    const chosenResource = matchingExtractedResource ?? fallbackExtractedResource;

    // Choose activity suited to the gap and student tier
    let suggestedActivity: StudyRecommendation['suggestedActivity'] = 'tutor';
    let estimatedMinutes = 25;

    if (profile.activeMisconceptionsCount > 0) {
      suggestedActivity = 'tutor';
      estimatedMinutes = 25;
    } else if (profile.assessmentState === 'not-yet-assessed') {
      suggestedActivity = curriculumProfile?.tier === 'advanced' && topic.difficulty === 'challenging'
        ? 'practice'
        : 'quiz';
      estimatedMinutes = suggestedActivity === 'practice' ? 20 : 15;
    } else if (topic.evidence.independentRecallChecks === 0) {
      suggestedActivity = 'flashcards';
      estimatedMinutes = 15;
    } else if (topic.evidence.explanationChecksPassed === 0) {
      suggestedActivity = 'practice';
      estimatedMinutes = 20;
    } else {
      suggestedActivity = 'summaries';
      estimatedMinutes = 15;
    }

    candidates.push({
      id: `rec-${topic.id}`,
      subjectId: topic.subjectId,
      topicId: topic.id,
      topicTitle: topic.title,
      linkedTaskId: linkedTask?.id,
      linkedTaskTitle: linkedTask?.title,
      daysUntilDeadline: daysUntil,
      suggestedResourceId: chosenResource?.id,
      suggestedResourceTitle: chosenResource?.title,
      suggestedActivity,
      estimatedMinutes,
      priorityScore: score,
      evidenceSummary: profile.quizSummary,
      rationale: evidenceReasons.join(' · '),
      fitsTimeBudget: estimatedMinutes <= availableStudyMinutes,
    });
  }

  candidates.sort((a, b) => b.priorityScore - a.priorityScore);

  // Mark which items fit cumulatively inside availableStudyMinutes
  let usedMinutes = 0;
  return candidates.map((rec) => {
    const fits = usedMinutes + rec.estimatedMinutes <= availableStudyMinutes;
    if (fits) usedMinutes += rec.estimatedMinutes;
    return {
      ...rec,
      fitsTimeBudget: fits,
    };
  });
}
