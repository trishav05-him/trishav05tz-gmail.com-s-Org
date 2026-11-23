import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Plus,
  RefreshCw,
  Volume2,
  XCircle,
} from 'lucide-react';
import { usePlatform } from '../../context/PlatformContext';
import { SpellingWord } from '../../types/platform';

type SpellingMode = 'word-lists' | 'test' | 'bee';
type ListFilter = 'all' | 'ai-curriculum' | 'custom' | 'mistake-review';

export const SpellingView: React.FC = () => {
  const {
    spellingWords,
    recordSpellingResult,
    addCustomSpellingWord,
    recordStudySession,
  } = usePlatform();

  const [mode, setMode] = useState<SpellingMode>('word-lists');
  const [listFilter, setListFilter] = useState<ListFilter>('all');
  const [speechRate, setSpeechRate] = useState<1 | 0.75>(1);
  const [audioFallbackNotice, setAudioFallbackNotice] = useState<string | null>(null);
  const [expandedWordIds, setExpandedWordIds] = useState<Record<string, boolean>>({});

  const [showAddWord, setShowAddWord] = useState(false);
  const [newWord, setNewWord] = useState('');
  const [newPhonetic, setNewPhonetic] = useState('');
  const [newPos, setNewPos] = useState('noun');
  const [newDef, setNewDef] = useState('');
  const [newSentence, setNewSentence] = useState('');
  const [newSubjectTag, setNewSubjectTag] = useState('General');

  const [practiceIndex, setPracticeIndex] = useState(0);
  const [typedInput, setTypedInput] = useState('');
  const [lastCheck, setLastCheck] = useState<{
    submitted: string;
    expected: string;
    isCorrect: boolean;
  } | null>(null);
  const [showClue, setShowClue] = useState(false);
  const [sessionStats, setSessionStats] = useState({ answered: 0, correct: 0 });

  const filteredWords = useMemo(() => {
    if (listFilter === 'mistake-review') {
      return spellingWords.filter((w) => w.needsPractice);
    }
    if (listFilter === 'all') return spellingWords;
    return spellingWords.filter((w) => w.listType === listFilter);
  }, [spellingWords, listFilter]);

  const practicePool = useMemo(() => {
    const mistakes = spellingWords.filter((w) => w.needsPractice);
    return mistakes.length > 0 ? mistakes : spellingWords;
  }, [spellingWords]);

  const currentPracticeWord: SpellingWord | undefined =
    practicePool[practiceIndex % Math.max(1, practicePool.length)];

  const literacyProgress = useMemo(() => {
    const totalAttempts = spellingWords.reduce((sum, w) => sum + w.attempts, 0);
    const totalCorrect = spellingWords.reduce((sum, w) => sum + w.correctCount, 0);
    const needsPracticeCount = spellingWords.filter((w) => w.needsPractice).length;
    const accuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : null;
    return {
      totalWords: spellingWords.length,
      needsPracticeCount,
      masteredCount: spellingWords.filter((w) => w.attempts > 0 && !w.needsPractice).length,
      accuracy,
    };
  }, [spellingWords]);

  const speakText = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setAudioFallbackNotice(
        'Audio pronunciation uses browser speech synthesis, which is unavailable here. Use the phonetic guide shown on each card.'
      );
      return;
    }
    setAudioFallbackNotice(null);
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate = speechRate;
    utt.onerror = () => {
      setAudioFallbackNotice('Speech synthesis could not play audio in this browser context.');
    };
    window.speechSynthesis.speak(utt);
  };

  const handleAddCustomWord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWord.trim() || !newDef.trim()) return;
    addCustomSpellingWord({
      word: newWord.trim().toLowerCase(),
      phonetic: newPhonetic.trim() || `/${newWord.trim().toLowerCase()}/`,
      partOfSpeech: newPos,
      definition: newDef.trim(),
      exampleSentence:
        newSentence.trim() || `Use "${newWord.trim().toLowerCase()}" accurately in your subject writing.`,
      memoryNote: 'Custom student vocabulary entry.',
      subjectTag: newSubjectTag,
    });
    setNewWord('');
    setNewPhonetic('');
    setNewDef('');
    setNewSentence('');
    setShowAddWord(false);
  };

  const handleCheckSpelling = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPracticeWord || !typedInput.trim()) return;
    const cleanInput = typedInput.trim().toLowerCase();
    const expected = currentPracticeWord.word.toLowerCase();
    const isCorrect = cleanInput === expected;
    recordSpellingResult(currentPracticeWord.id, isCorrect);
    setLastCheck({ submitted: cleanInput, expected, isCorrect });
    const nextAnswered = sessionStats.answered + 1;
    const nextCorrect = sessionStats.correct + (isCorrect ? 1 : 0);
    setSessionStats({ answered: nextAnswered, correct: nextCorrect });

    if (nextAnswered % 3 === 0) {
      recordStudySession({
        subjectId: 'eng',
        activity: mode === 'bee' ? 'Spelling Bee Practice Round' : 'Personalised Spelling Test',
        durationMinutes: 10,
        outcomeNote: `${nextCorrect}/${nextAnswered} words spelled accurately in current session.`,
      });
    }
  };

  const handleNextWord = () => {
    setTypedInput('');
    setLastCheck(null);
    setShowClue(false);
    setPracticeIndex((i) => i + 1);
  };

  const maskedSentence = currentPracticeWord
    ? currentPracticeWord.exampleSentence.replace(
        new RegExp(currentPracticeWord.word, 'gi'),
        '________'
      )
    : '';

  return (
    <div className="space-y-6">
      {/* Header & Literacy Summary */}
      <section className="bg-[#0F1B33] border border-slate-800 rounded-xl p-5 sm:p-6 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="font-display text-xl font-semibold text-white">
              Spelling &amp; Academic Literacy
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Practise subject vocabulary with audio pronunciation and targeted review of missed words.
            </p>
          </div>

          <div className="inline-flex items-center p-1 bg-[#0B1528] rounded-lg border border-slate-800 self-start">
            <button
              type="button"
              onClick={() => setMode('word-lists')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                mode === 'word-lists' ? 'bg-[#162647] text-cyan-300' : 'text-slate-400 hover:text-white'
              }`}
            >
              Word Lists
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('test');
                setLastCheck(null);
                setTypedInput('');
              }}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                mode === 'test' ? 'bg-[#162647] text-cyan-300' : 'text-slate-400 hover:text-white'
              }`}
            >
              Spelling Test
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('bee');
                setLastCheck(null);
                setTypedInput('');
              }}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                mode === 'bee' ? 'bg-[#162647] text-cyan-300' : 'text-slate-400 hover:text-white'
              }`}
            >
              Spelling Bee
            </button>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-slate-400">Tracked vocabulary</p>
            <p className="mt-0.5 font-display text-lg font-semibold text-white tabular-nums">
              {literacyProgress.totalWords} words
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Historical accuracy</p>
            <p className="mt-0.5 font-display text-lg font-semibold text-cyan-300 tabular-nums">
              {literacyProgress.accuracy !== null ? `${literacyProgress.accuracy}%` : '—'}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Reliable spelling</p>
            <p className="mt-0.5 font-display text-lg font-semibold text-emerald-400 tabular-nums">
              {literacyProgress.masteredCount}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Personalised review queue</p>
            <p className="mt-0.5 font-display text-lg font-semibold text-amber-300 tabular-nums">
              {literacyProgress.needsPracticeCount} words
            </p>
          </div>
        </div>
      </section>

      {audioFallbackNotice && (
        <p className="text-xs text-amber-200 bg-amber-500/10 border border-amber-400/30 rounded-lg p-3">
          {audioFallbackNotice}
        </p>
      )}

      {/* MODE 1: WORD LISTS */}
      {mode === 'word-lists' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
              {(
                [
                  { id: 'all', label: 'All Lists' },
                  { id: 'ai-curriculum', label: 'AI Curriculum (Demo)' },
                  { id: 'mistake-review', label: 'Personalised Mistakes' },
                  { id: 'custom', label: 'Custom Words' },
                ] as { id: ListFilter; label: string }[]
              ).map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setListFilter(f.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                    listFilter === f.id
                      ? 'bg-cyan-400 text-slate-950 font-semibold'
                      : 'bg-[#0F1B33] text-slate-300 border border-slate-800 hover:text-white'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSpeechRate((r) => (r === 1 ? 0.75 : 1))}
                className="px-3 py-1.5 text-xs font-mono text-slate-200 bg-[#0F1B33] border border-slate-800 hover:border-slate-700 rounded-lg whitespace-nowrap"
              >
                Speed: {speechRate}x
              </button>
              <button
                type="button"
                onClick={() => setShowAddWord((v) => !v)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" />
                Add custom word
              </button>
            </div>
          </div>

          {showAddWord && (
            <form
              onSubmit={handleAddCustomWord}
              className="bg-[#0F1B33] border border-slate-800 rounded-xl p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
            >
              <input
                type="text"
                required
                value={newWord}
                onChange={(e) => setNewWord(e.target.value)}
                placeholder="Word (e.g. electrolysis)"
                className="px-3 py-2 text-sm bg-[#0B1528] border border-slate-700 text-slate-100 placeholder:text-slate-500 rounded-lg"
              />
              <input
                type="text"
                value={newPhonetic}
                onChange={(e) => setNewPhonetic(e.target.value)}
                placeholder="Phonetic (optional)"
                className="px-3 py-2 text-sm bg-[#0B1528] border border-slate-700 text-slate-100 placeholder:text-slate-500 rounded-lg"
              />
              <div className="flex gap-2">
                <select
                  value={newPos}
                  onChange={(e) => setNewPos(e.target.value)}
                  className="px-3 py-2 text-sm border border-slate-700 rounded-lg bg-[#0B1528] text-slate-100"
                >
                  <option value="noun">noun</option>
                  <option value="verb">verb</option>
                  <option value="adjective">adjective</option>
                </select>
                <input
                  type="text"
                  value={newSubjectTag}
                  onChange={(e) => setNewSubjectTag(e.target.value)}
                  placeholder="Subject"
                  className="flex-1 px-3 py-2 text-sm bg-[#0B1528] border border-slate-700 text-slate-100 placeholder:text-slate-500 rounded-lg"
                />
              </div>
              <input
                type="text"
                required
                value={newDef}
                onChange={(e) => setNewDef(e.target.value)}
                placeholder="Clear definition"
                className="sm:col-span-2 lg:col-span-3 px-3 py-2 text-sm bg-[#0B1528] border border-slate-700 text-slate-100 placeholder:text-slate-500 rounded-lg"
              />
              <input
                type="text"
                value={newSentence}
                onChange={(e) => setNewSentence(e.target.value)}
                placeholder="Example sentence"
                className="sm:col-span-2 px-3 py-2 text-sm bg-[#0B1528] border border-slate-700 text-slate-100 placeholder:text-slate-500 rounded-lg"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddWord(false)}
                  className="px-3 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg"
                >
                  Save word
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredWords.map((item) => {
              const isExpanded = Boolean(expandedWordIds[item.id]);
              return (
                <article
                  key={item.id}
                  className="bg-[#0F1B33] border border-slate-800 rounded-xl p-5 space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-baseline gap-2.5">
                        <h3 className="font-display text-lg font-semibold text-white">
                          {item.word}
                        </h3>
                        <span className="text-xs font-mono text-cyan-400">{item.phonetic}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 tabular-nums">
                        {item.partOfSpeech} · {item.subjectTag} ·{' '}
                        {item.attempts > 0
                          ? `${item.correctCount}/${item.attempts} correct`
                          : 'Not practised yet'}
                        {item.needsPractice ? (
                          <span className="text-amber-300 font-medium"> · Needs review</span>
                        ) : null}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => speakText(item.word)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400/30 rounded-lg whitespace-nowrap shrink-0"
                      aria-label={`Pronounce ${item.word}`}
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      Hear
                    </button>
                  </div>

                  <p className="text-sm text-slate-200 leading-relaxed">{item.definition}</p>

                  <button
                    type="button"
                    onClick={() =>
                      setExpandedWordIds((prev) => ({ ...prev, [item.id]: !prev[item.id] }))
                    }
                    className="inline-flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-cyan-300"
                  >
                    {isExpanded ? 'Hide example & tip' : 'Example & memory tip'}
                    {isExpanded ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="p-3 bg-[#0B1528] border border-slate-800 rounded-lg space-y-1.5 text-xs">
                      <p className="text-slate-200">&ldquo;{item.exampleSentence}&rdquo;</p>
                      <p className="text-slate-400">Tip: {item.memoryNote}</p>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </div>
      )}

      {/* MODE 2 & 3: SPELLING TEST & SPELLING BEE */}
      {(mode === 'test' || mode === 'bee') && currentPracticeWord && (
        <section className="bg-[#0F1B33] border border-slate-800 rounded-xl p-6 sm:p-8 max-w-3xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
            <div>
              <p className="text-xs font-medium text-cyan-400">
                {mode === 'bee' ? 'Spelling Bee Round' : 'Personalised Spelling Test'} ·{' '}
                {currentPracticeWord.subjectTag}
              </p>
              <h3 className="font-display text-lg font-semibold text-white">
                Listen, understand the meaning, and spell accurately
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-300 tabular-nums">
              Session: {sessionStats.correct}/{sessionStats.answered} accurate
            </span>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={() => speakText(currentPracticeWord.word)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg"
            >
              <Volume2 className="w-4 h-4" />
              Pronounce word ({speechRate}x)
            </button>
            <button
              type="button"
              onClick={() => setSpeechRate((r) => (r === 1 ? 0.75 : 1))}
              className="px-3.5 py-2 text-xs font-medium text-slate-200 bg-[#0B1528] border border-slate-700 hover:border-slate-600 rounded-lg"
            >
              Switch speed ({speechRate === 1 ? 'Slow 0.75x' : 'Normal 1x'})
            </button>
            {mode === 'bee' && (
              <button
                type="button"
                onClick={() => setShowClue((v) => !v)}
                className="px-3.5 py-2 text-xs font-medium text-cyan-300 bg-cyan-500/10 border border-cyan-400/30 rounded-lg"
              >
                {showClue ? 'Hide root clue' : 'Request root / origin clue'}
              </button>
            )}
          </div>

          <div className="p-4 bg-[#0B1528] border border-slate-800 rounded-xl space-y-2">
            <p className="text-xs font-medium text-slate-400">
              {currentPracticeWord.partOfSpeech} · Phonetic cue: {currentPracticeWord.phonetic}
            </p>
            <p className="text-sm text-slate-100">
              <span className="font-semibold text-cyan-300">Definition: </span>
              {currentPracticeWord.definition}
            </p>
            <p className="text-sm text-slate-300">
              <span className="font-semibold text-cyan-300">Sentence: </span>
              {maskedSentence}
            </p>
            {showClue && (
              <p className="text-xs text-cyan-300 pt-1">
                <span className="font-semibold">Memory &amp; origin note: </span>
                {currentPracticeWord.memoryNote}
              </p>
            )}
          </div>

          <form onSubmit={handleCheckSpelling} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={typedInput}
              onChange={(e) => setTypedInput(e.target.value)}
              disabled={lastCheck !== null}
              placeholder="Type your spelling here..."
              autoComplete="off"
              spellCheck={false}
              className="flex-1 px-4 py-2.5 text-base font-mono bg-[#0B1528] border border-slate-700 text-white placeholder:text-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
            {lastCheck === null ? (
              <button
                type="submit"
                className="px-5 py-2.5 text-sm font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg whitespace-nowrap"
              >
                Check spelling
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNextWord}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg whitespace-nowrap"
              >
                <RefreshCw className="w-4 h-4" />
                Next word
              </button>
            )}
          </form>

          {lastCheck && (
            <div
              className={`p-4 rounded-xl border space-y-2 ${
                lastCheck.isCorrect
                  ? 'bg-emerald-500/10 border-emerald-400/30 text-emerald-200'
                  : 'bg-amber-500/10 border-amber-400/30 text-amber-200'
              }`}
            >
              <div className="flex items-center gap-2 text-sm font-semibold">
                {lastCheck.isCorrect ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Accurate!</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-rose-400" />
                    <span>Added to your Personalised Mistakes list for extra practice</span>
                  </>
                )}
              </div>
              {!lastCheck.isCorrect && (
                <div className="text-xs font-mono space-y-1">
                  <p>Your spelling: {lastCheck.submitted}</p>
                  <p className="font-semibold text-white">Correct spelling: {lastCheck.expected}</p>
                  <p className="font-sans text-slate-300 pt-1">
                    Note: {currentPracticeWord.memoryNote}
                  </p>
                </div>
              )}
            </div>
          )}
        </section>
      )}
    </div>
  );
};
