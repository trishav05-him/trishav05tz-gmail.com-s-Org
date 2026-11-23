import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  BookOpen,
  Compass,
  FolderOpen,
  Layers,
  LogIn,
  LogOut,
  Menu,
  MessageSquareText,
  RotateCcw,
  SlidersHorizontal,
  Sparkles,
  SpellCheck,
  X,
} from 'lucide-react';
import { APP_CONFIG } from '../../config/appConfig';
import { usePlatform } from '../../context/PlatformContext';
import { NavigationSection } from '../../types/platform';
import {
  COUNTRY_CURRICULA,
  getCountryConfig,
  resolveCurriculumTier,
} from '../../utils/curriculumProfile';

const NAV_ITEMS: {
  id: NavigationSection;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: 'dashboard', label: 'Dashboard', icon: Compass },
  { id: 'subjects', label: 'Subjects', icon: BookOpen },
  { id: 'tutor', label: 'AI Tutor', icon: MessageSquareText },
  { id: 'ai-studio', label: 'AI Studio & Lab', icon: Sparkles },
  { id: 'resources', label: 'Resources', icon: FolderOpen },
  { id: 'study-tools', label: 'Study Tools', icon: Layers },
  { id: 'spelling', label: 'Spelling & Literacy', icon: SpellCheck },
  { id: 'progress', label: 'Academic Progress', icon: BarChart3 },
];

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    activeSection,
    setActiveSection,
    openInTutor,
    resetDemoData,
    availableStudyMinutes,
    currentUser,
    signInUser,
    signOutUser,
  } = usePlatform();

  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [authStep, setAuthStep] = useState<1 | 2>(1);
  const [isEditingProfileOnly, setIsEditingProfileOnly] = useState(false);

  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authCountry, setAuthCountry] = useState<string>(APP_CONFIG.defaultCountry);
  const [authGrade, setAuthGrade] = useState<string>(APP_CONFIG.defaultYearLevel);
  const [authAge, setAuthAge] = useState<number>(APP_CONFIG.defaultAge);
  const [authError, setAuthError] = useState<string | null>(null);

  const currentNav = NAV_ITEMS.find((item) => item.id === activeSection) ?? NAV_ITEMS[0];

  const countryConfig = useMemo(() => getCountryConfig(authCountry), [authCountry]);
  const tierPreview = useMemo(
    () => resolveCurriculumTier(authCountry, authGrade, authAge),
    [authCountry, authGrade, authAge]
  );

  const handleNavClick = (section: NavigationSection) => {
    setActiveSection(section);
    setMobileNavOpen(false);
  };

  const openSignInModal = () => {
    setIsEditingProfileOnly(false);
    setAuthStep(1);
    setAuthError(null);
    setAuthName(currentUser?.name ?? '');
    setAuthEmail(currentUser?.email ?? '');
    setAuthCountry(currentUser?.country ?? APP_CONFIG.defaultCountry);
    setAuthGrade(currentUser?.gradeLevel ?? APP_CONFIG.defaultYearLevel);
    setAuthAge(currentUser?.age ?? APP_CONFIG.defaultAge);
    setAuthModalOpen(true);
  };

  const openProfileCalibrationModal = () => {
    if (!currentUser) {
      openSignInModal();
      return;
    }
    setIsEditingProfileOnly(true);
    setAuthStep(2);
    setAuthError(null);
    setAuthName(currentUser.name);
    setAuthEmail(currentUser.email);
    setAuthCountry(currentUser.country);
    setAuthGrade(currentUser.gradeLevel);
    setAuthAge(currentUser.age);
    setAuthModalOpen(true);
  };

  const handleCountryChange = (nextCountry: string) => {
    setAuthCountry(nextCountry);
    const cfg = getCountryConfig(nextCountry);
    const defaultIdx = Math.min(3, Math.max(0, cfg.grades.length - 1));
    const nextGrade = cfg.grades[defaultIdx];
    if (nextGrade) {
      setAuthGrade(nextGrade.label);
      setAuthAge(nextGrade.suggestedAge);
    }
  };

  const handleGradeChange = (nextGradeLabel: string) => {
    setAuthGrade(nextGradeLabel);
    const match = countryConfig.grades.find((g) => g.label === nextGradeLabel);
    if (match) {
      setAuthAge(match.suggestedAge);
    }
  };

  const handleStepOneNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authName.trim()) {
      setAuthError('Please enter your real name so your workspace addresses you properly.');
      return;
    }
    if (!authEmail.trim()) {
      setAuthError('Please enter your email address.');
      return;
    }
    if (!authPassword.trim()) {
      setAuthError('Please enter a password.');
      return;
    }
    setAuthError(null);
    setAuthStep(2);
  };

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = authName.trim();
    if (!cleanName) {
      setAuthStep(1);
      setAuthError('Please enter your name.');
      return;
    }
    const numericAge = Math.min(20, Math.max(10, Number(authAge) || APP_CONFIG.defaultAge));
    signInUser({
      name: cleanName,
      email: authEmail.trim(),
      country: authCountry,
      gradeLevel: authGrade,
      age: numericAge,
    });
    setAuthModalOpen(false);
    setAuthPassword('');
    setAuthError(null);
  };

  const userInitials = currentUser
    ? currentUser.name
        .trim()
        .split(/\s+/)
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '';

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0B1528] text-slate-100 select-none">
      <div className="px-5 h-16 flex items-center justify-between border-b border-slate-800/80 shrink-0">
        <div className="min-w-0">
          <span className="block font-display text-base font-semibold tracking-tight text-white truncate">
            {APP_CONFIG.platformName}
          </span>
          <span className="block text-[11px] text-cyan-400/80 truncate">
            {APP_CONFIG.platformStageLabel}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setMobileNavOpen(false)}
          className="lg:hidden p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
          aria-label="Close navigation menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav aria-label="Main navigation" className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors text-left whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                isActive
                  ? 'bg-[#152544] text-cyan-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 ${
                  isActive ? 'text-cyan-400' : 'text-slate-400'
                }`}
              />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800/80 space-y-3 shrink-0">
        <div className="px-1 text-xs space-y-0.5">
          <p className="font-medium text-white truncate">
            {currentUser ? currentUser.name : 'Not signed in'}
          </p>
          <p className="text-slate-400 tabular-nums truncate">
            {currentUser
              ? `${currentUser.gradeLevel} · ${currentUser.country} · Age ${currentUser.age}`
              : `${availableStudyMinutes} min planned · Sign in to calibrate`}
          </p>
        </div>
        <button
          type="button"
          onClick={resetDemoData}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 border border-slate-700/80 hover:bg-slate-800/70 hover:text-white transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
        >
          <RotateCcw className="w-3.5 h-3.5 shrink-0" />
          Reset workspace data
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-[#070E1B] text-slate-100">
      {/* Desktop / Chromebook persistent sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 border-r border-slate-800/80 bg-[#0B1528]">
        <div className="sticky top-0 h-screen">{sidebarContent}</div>
      </aside>

      {/* Mobile / Tablet slide-over navigation */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs"
            onClick={() => setMobileNavOpen(false)}
            aria-hidden="true"
          />
          <aside className="relative w-72 max-w-[85vw] h-full z-10 border-r border-slate-800 shadow-2xl">
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Main content area */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-30 h-16 bg-[#0B1528]/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              className="lg:hidden p-2 -ml-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="font-display text-base sm:text-lg font-semibold text-white truncate">
              {currentNav.label}
            </h1>
          </div>

          <nav className="hidden xl:flex items-center gap-6 text-sm text-slate-300">
            <button
              type="button"
              onClick={() => setActiveSection('dashboard')}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
                activeSection === 'dashboard'
                  ? 'text-cyan-300 font-medium underline underline-offset-4'
                  : ''
              }`}
            >
              Overview
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('ai-studio')}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
                activeSection === 'ai-studio'
                  ? 'text-cyan-300 font-medium underline underline-offset-4'
                  : ''
              }`}
            >
              AI Studio
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('resources')}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
                activeSection === 'resources'
                  ? 'text-cyan-300 font-medium underline underline-offset-4'
                  : ''
              }`}
            >
              Resource Centre
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('study-tools')}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
                activeSection === 'study-tools'
                  ? 'text-cyan-300 font-medium underline underline-offset-4'
                  : ''
              }`}
            >
              Study Tools
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('progress')}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
                activeSection === 'progress'
                  ? 'text-cyan-300 font-medium underline underline-offset-4'
                  : ''
              }`}
            >
              Progress
            </button>
          </nav>

          {/* Top-right actions: quick Tutor button + persistent Log in / Sign in (until signed in) */}
          <div className="flex items-center gap-2.5 shrink-0">
            {activeSection === 'tutor' ? (
              <button
                type="button"
                onClick={() => setActiveSection('dashboard')}
                className="hidden sm:inline-flex px-3 py-1.5 text-xs font-medium text-slate-200 bg-[#13223D] hover:bg-[#192D50] border border-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                Dashboard
              </button>
            ) : (
              <button
                type="button"
                onClick={() => openInTutor('bio', 'res-bio-pdf')}
                className="hidden sm:inline-flex px-3 py-1.5 text-xs font-medium text-slate-200 bg-[#13223D] hover:bg-[#192D50] border border-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                Open AI Tutor
              </button>
            )}

            {currentUser === null ? (
              <button
                type="button"
                onClick={openSignInModal}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
              >
                <LogIn className="w-3.5 h-3.5" />
                Log in / Sign in
              </button>
            ) : (
              <div className="inline-flex items-center gap-2 pl-2 pr-1.5 py-1 bg-[#0F1B33] border border-slate-700/80 rounded-lg">
                <button
                  type="button"
                  onClick={openProfileCalibrationModal}
                  className="inline-flex items-center gap-2 text-left rounded-md hover:bg-white/5 px-1 py-0.5 transition-colors"
                  title="Update grade, country & age calibration"
                >
                  <span className="w-7 h-7 rounded-md bg-cyan-400/20 border border-cyan-400/40 text-cyan-300 text-xs font-semibold flex items-center justify-center shrink-0">
                    {userInitials}
                  </span>
                  <div className="hidden sm:block leading-tight pr-1">
                    <p className="text-xs font-medium text-white truncate max-w-[130px]">
                      {currentUser.name}
                    </p>
                    <p className="text-[10px] text-cyan-300/90 truncate max-w-[150px] tabular-nums">
                      {currentUser.gradeLevel} · {currentUser.country}
                    </p>
                  </div>
                  <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 hidden md:block" />
                </button>
                <button
                  type="button"
                  onClick={signOutUser}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-md transition-colors whitespace-nowrap"
                  title="Sign out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Sign out</span>
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {children}
        </main>
      </div>

      {/* Log in / Sign in + Grade / Country / Age Onboarding Modal */}
      {authModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="auth-modal-title"
        >
          <div className="w-full max-w-md bg-[#0F1B33] border border-slate-700 rounded-2xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider">
                  {isEditingProfileOnly
                    ? 'Curriculum calibration'
                    : `Step ${authStep} of 2 · ${authStep === 1 ? 'Your account' : 'Country, grade & age'}`}
                </p>
                <h2 id="auth-modal-title" className="font-display text-lg font-semibold text-white mt-0.5">
                  {isEditingProfileOnly
                    ? 'Update your study profile'
                    : authStep === 1
                    ? authMode === 'login'
                      ? 'Log in to your workspace'
                      : 'Create your student account'
                    : 'Tell us your grade, country & age'}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {authStep === 1
                    ? 'We will always greet you with the exact name you enter.'
                    : 'Questions in Study Tools and the AI Tutor calibrate to your age and national curriculum.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAuthModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                aria-label="Close sign-in dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {!isEditingProfileOnly && authStep === 1 && (
              <div className="grid grid-cols-2 p-1 bg-[#0B1528] border border-slate-800 rounded-lg">
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className={`py-1.5 text-xs font-medium rounded-md transition-colors ${
                    authMode === 'login'
                      ? 'bg-[#162647] text-cyan-300'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Log in
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode('signup')}
                  className={`py-1.5 text-xs font-medium rounded-md transition-colors ${
                    authMode === 'signup'
                      ? 'bg-[#162647] text-cyan-300'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Sign up
                </button>
              </div>
            )}

            {authError && (
              <p className="text-xs text-amber-200 bg-amber-500/10 border border-amber-400/30 rounded-lg px-3 py-2">
                {authError}
              </p>
            )}

            {authStep === 1 ? (
              <form onSubmit={handleStepOneNext} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Your name
                  </label>
                  <input
                    type="text"
                    required
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    placeholder="Enter your first and last name"
                    className="w-full px-3 py-2 text-sm bg-[#0B1528] border border-slate-700 text-slate-100 placeholder:text-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    School or personal email
                  </label>
                  <input
                    type="email"
                    required
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="you@school.edu"
                    className="w-full px-3 py-2 text-sm bg-[#0B1528] border border-slate-700 text-slate-100 placeholder:text-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full px-3 py-2 text-sm bg-[#0B1528] border border-slate-700 text-slate-100 placeholder:text-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 text-sm font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors"
                >
                  Continue to grade &amp; country
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleFinalSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    What country are you studying in?
                  </label>
                  <select
                    value={authCountry}
                    onChange={(e) => handleCountryChange(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[#0B1528] border border-slate-700 text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  >
                    {COUNTRY_CURRICULA.map((cfg) => (
                      <option key={cfg.country} value={cfg.country}>
                        {cfg.country} ({cfg.systemName})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      What grade / year are you in?
                    </label>
                    <select
                      value={authGrade}
                      onChange={(e) => handleGradeChange(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-[#0B1528] border border-slate-700 text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    >
                      {countryConfig.grades.map((g) => (
                        <option key={g.label} value={g.label}>
                          {g.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Your age
                    </label>
                    <input
                      type="number"
                      min={10}
                      max={20}
                      required
                      value={authAge}
                      onChange={(e) => setAuthAge(Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm font-mono tabular-nums bg-[#0B1528] border border-slate-700 text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    />
                  </div>
                </div>

                <div className="p-3.5 bg-[#0B1528] border border-cyan-500/30 rounded-xl space-y-1 text-xs">
                  <p className="font-semibold text-cyan-300">
                    Question calibration preview
                  </p>
                  <p className="text-slate-300 leading-relaxed">
                    Questions for <span className="text-white font-medium">{authName || 'you'}</span> will target{' '}
                    <span className="text-white font-medium">{tierPreview.tierLabel}</span> aligned to{' '}
                    <span className="text-cyan-300">{tierPreview.systemName}</span> ({authGrade}, age {authAge}).
                  </p>
                </div>

                <div className="flex items-center gap-2.5">
                  {!isEditingProfileOnly && (
                    <button
                      type="button"
                      onClick={() => setAuthStep(1)}
                      className="inline-flex items-center gap-1 px-3.5 py-2.5 text-xs font-medium text-slate-300 bg-[#0B1528] border border-slate-700 hover:text-white rounded-lg"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      Back
                    </button>
                  )}
                  <button
                    type="submit"
                    className="flex-1 py-2.5 text-sm font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors"
                  >
                    {isEditingProfileOnly ? 'Save curriculum profile' : 'Complete sign in'}
                  </button>
                </div>
              </form>
            )}

            <p className="text-[11px] text-slate-400 text-center pt-2 border-t border-slate-800">
              Your profile and study progress stay saved in this browser.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

