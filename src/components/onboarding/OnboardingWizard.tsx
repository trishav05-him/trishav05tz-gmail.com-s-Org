import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Globe2,
  GraduationCap,
  User,
  X,
} from 'lucide-react';
import { APP_CONFIG } from '../../config/appConfig';
import { usePlatform } from '../../context/PlatformContext';
import {
  COUNTRY_CURRICULA,
  getCountryConfig,
  resolveCurriculumTier,
} from '../../utils/curriculumProfile';

const STEP_LABELS: { step: 1 | 2 | 3; label: string }[] = [
  { step: 1, label: 'Your Name' },
  { step: 2, label: 'Country' },
  { step: 3, label: 'Grade & Age' },
];

export const OnboardingWizard: React.FC = () => {
  const {
    currentUser,
    onboardingOpen,
    onboardingInitialStep,
    closeOnboardingWizard,
    completeOnboarding,
  } = usePlatform();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState<string>(APP_CONFIG.defaultCountry);
  const [gradeLevel, setGradeLevel] = useState<string>(APP_CONFIG.defaultYearLevel);
  const [age, setAge] = useState<number>(APP_CONFIG.defaultAge);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!onboardingOpen) return;
    setStep(onboardingInitialStep);
    setName(currentUser?.name ?? '');
    setEmail(currentUser?.email ?? '');
    const initialCountry = currentUser?.country ?? APP_CONFIG.defaultCountry;
    setCountry(initialCountry);
    const cfg = getCountryConfig(initialCountry);
    const matchingGrade = cfg.grades.find((g) => g.label === currentUser?.gradeLevel);
    const fallbackGrade = cfg.grades[Math.min(3, Math.max(0, cfg.grades.length - 1))];
    setGradeLevel(matchingGrade?.label ?? currentUser?.gradeLevel ?? fallbackGrade.label);
    setAge(currentUser?.age ?? matchingGrade?.suggestedAge ?? APP_CONFIG.defaultAge);
    setErrorMessage(null);
  }, [onboardingOpen, onboardingInitialStep, currentUser]);

  const countryConfig = useMemo(() => getCountryConfig(country), [country]);
  const preview = useMemo(
    () => resolveCurriculumTier(country, gradeLevel, age),
    [country, gradeLevel, age]
  );

  if (!onboardingOpen) return null;

  const handleSelectCountry = (nextCountry: string) => {
    setCountry(nextCountry);
    const cfg = getCountryConfig(nextCountry);
    const defaultGrade = cfg.grades[Math.min(3, Math.max(0, cfg.grades.length - 1))];
    if (defaultGrade) {
      setGradeLevel(defaultGrade.label);
      setAge(defaultGrade.suggestedAge);
    }
  };

  const handleSelectGrade = (label: string, suggestedAge: number) => {
    setGradeLevel(label);
    setAge(suggestedAge);
  };

  const handleNextFromStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('Please enter your name so your workspace greets and tracks you accurately.');
      return;
    }
    setErrorMessage(null);
    setStep(2);
  };

  const handleComplete = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) {
      setStep(1);
      setErrorMessage('Please enter your name before finishing setup.');
      return;
    }
    const clampedAge = Math.min(20, Math.max(10, Number(age) || APP_CONFIG.defaultAge));
    completeOnboarding({
      name: cleanName,
      email: email.trim(),
      country,
      gradeLevel,
      age: clampedAge,
    });
  };

  const recommendationSummary =
    preview.tier === 'foundation'
      ? 'Prioritises foundational concept building, guided quizzes, and everyday explanations.'
      : preview.tier === 'advanced'
      ? 'Prioritises challenging exam-weighted units, structured mark-scheme practice, and analytical tutor prompts.'
      : 'Balances core concept checks, recall flashcards, and syllabus-aligned practice.';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-wizard-title"
    >
      <div className="w-full max-w-xl bg-[#0F1B33] border border-slate-700/90 rounded-2xl p-6 sm:p-7 space-y-6 shadow-2xl my-auto">
        {/* Header & Close */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs font-mono text-cyan-400 tabular-nums">
              Step {step} of 3 · Student setup
            </p>
            <h2
              id="onboarding-wizard-title"
              className="font-display text-xl sm:text-2xl font-semibold text-white text-balance"
            >
              {step === 1 && 'Personalise your learning workspace'}
              {step === 2 && 'Select your country & curriculum'}
              {step === 3 && 'Choose your grade level & age'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              {step === 1 &&
                'Tell us your name so recommendations, study tools, and the AI tutor adapt directly to you.'}
              {step === 2 &&
                'Curriculum frameworks vary by country—pick yours to align topics and question style.'}
              {step === 3 &&
                'Questions, vocabulary depth, and study priorities adjust automatically to your year level.'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => closeOnboardingWizard(true)}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 shrink-0"
            aria-label="Close setup wizard"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 3-Step Interactive Stepper */}
        <div className="grid grid-cols-3 gap-2" role="navigation" aria-label="Onboarding steps">
          {STEP_LABELS.map((item) => {
            const isCurrent = step === item.step;
            const isComplete = step > item.step || (item.step === 1 && Boolean(name.trim()) && step !== 1);
            const canJump =
              item.step === 1 || (item.step > 1 && Boolean(name.trim()));
            return (
              <button
                key={item.step}
                type="button"
                disabled={!canJump}
                onClick={() => canJump && setStep(item.step)}
                className={`text-left px-3 py-2.5 rounded-xl border transition-colors ${
                  isCurrent
                    ? 'bg-[#162647] border-cyan-400/70 text-white'
                    : isComplete
                    ? 'bg-[#0B1528] border-emerald-500/40 text-slate-200 hover:border-slate-600'
                    : 'bg-[#0B1528] border-slate-800 text-slate-500 disabled:cursor-not-allowed'
                }`}
              >
                <div className="flex items-center justify-between gap-1 text-[11px] font-mono tabular-nums">
                  <span className={isCurrent ? 'text-cyan-300' : isComplete ? 'text-emerald-400' : 'text-slate-500'}>
                    0{item.step}
                  </span>
                  {isComplete && !isCurrent && (
                    <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                  )}
                </div>
                <p className="text-xs font-medium mt-0.5 truncate">{item.label}</p>
              </button>
            );
          })}
        </div>

        {errorMessage && (
          <p className="text-xs text-amber-200 bg-amber-500/10 border border-amber-400/30 rounded-lg px-3.5 py-2.5">
            {errorMessage}
          </p>
        )}

        {/* STEP 1: Name & Optional Email */}
        {step === 1 && (
          <form onSubmit={handleNextFromStep1} className="space-y-4">
            <div>
              <label
                htmlFor="onboarding-name"
                className="flex items-center gap-1.5 text-xs font-medium text-slate-200 mb-1.5"
              >
                <User className="w-3.5 h-3.5 text-cyan-400" />
                Your full name
              </label>
              <input
                id="onboarding-name"
                type="text"
                required
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your first and last name"
                className="w-full px-3.5 py-2.5 text-sm bg-[#0B1528] border border-slate-700 text-white placeholder:text-slate-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
            </div>

            <div>
              <label
                htmlFor="onboarding-email"
                className="block text-xs font-medium text-slate-300 mb-1.5"
              >
                School or personal email (optional)
              </label>
              <input
                id="onboarding-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@school.edu"
                className="w-full px-3.5 py-2.5 text-sm bg-[#0B1528] border border-slate-700 text-white placeholder:text-slate-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => closeOnboardingWizard(true)}
                className="px-3.5 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
              >
                {currentUser ? 'Cancel' : 'Skip for now'}
              </button>

              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl transition-colors whitespace-nowrap"
              >
                Next: Country
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: Country / Curriculum Selection */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-200">
              <Globe2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Which country are you studying in?</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 max-h-[280px] overflow-y-auto pr-1">
              {COUNTRY_CURRICULA.map((cfg) => {
                const selected = country === cfg.country;
                return (
                  <button
                    key={cfg.country}
                    type="button"
                    onClick={() => handleSelectCountry(cfg.country)}
                    className={`text-left p-3 rounded-xl border transition-colors space-y-0.5 ${
                      selected
                        ? 'bg-[#162647] border-cyan-400 text-white'
                        : 'bg-[#0B1528] border-slate-800 text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <p className="text-sm font-semibold truncate">{cfg.country}</p>
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-snug">
                      {cfg.systemName}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium text-slate-300 bg-[#0B1528] border border-slate-700 hover:text-white rounded-xl transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back
              </button>

              <button
                type="button"
                onClick={() => setStep(3)}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl transition-colors whitespace-nowrap"
              >
                Next: Grade level
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Grade Level, Age & Live Personalisation Preview */}
        {step === 3 && (
          <form onSubmit={handleComplete} className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 text-xs font-medium text-slate-200">
                  <GraduationCap className="w-3.5 h-3.5 text-cyan-400" />
                  Grade / Year level in {country}
                </span>
                <span className="text-[11px] text-slate-400">{countryConfig.systemName}</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {countryConfig.grades.map((g) => {
                  const selected = gradeLevel === g.label;
                  return (
                    <button
                      key={g.label}
                      type="button"
                      onClick={() => handleSelectGrade(g.label, g.suggestedAge)}
                      className={`px-3 py-2.5 rounded-xl border text-left transition-colors ${
                        selected
                          ? 'bg-[#162647] border-cyan-400 text-white'
                          : 'bg-[#0B1528] border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                      }`}
                    >
                      <p className="text-xs sm:text-sm font-medium truncate">{g.label}</p>
                      <p className="text-[11px] font-mono text-slate-400 tabular-nums">
                        Typical age {g.suggestedAge}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-stretch">
              <div className="sm:col-span-4 bg-[#0B1528] border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
                <label
                  htmlFor="onboarding-age"
                  className="block text-xs font-medium text-slate-300"
                >
                  Confirm your age
                </label>
                <input
                  id="onboarding-age"
                  type="number"
                  min={10}
                  max={20}
                  required
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="mt-1.5 w-full px-3 py-2 text-sm font-mono tabular-nums bg-[#0F1B33] border border-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
              </div>

              <div className="sm:col-span-8 bg-[#0B1528] border border-cyan-500/30 rounded-xl p-3.5 space-y-1 text-xs">
                <p className="font-semibold text-cyan-300">
                  Personalised for {name.trim() || 'you'} · {preview.tierLabel}
                </p>
                <p className="text-slate-300 leading-relaxed">{recommendationSummary}</p>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium text-slate-300 bg-[#0B1528] border border-slate-700 hover:text-white rounded-xl transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back
              </button>

              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl transition-colors whitespace-nowrap"
              >
                <Check className="w-4 h-4" />
                Save &amp; personalise workspace
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
