import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Calendar, 
  Timer, 
  GraduationCap, 
  PieChart, 
  BookOpen, 
  Crown, 
  Settings,
  Menu
} from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { Planner } from './components/Planner';
import { TestLog } from './components/TestLog';
import { FocusTimer } from './components/FocusTimer';
import { Analytics } from './components/Analytics';
import { Resources } from './components/Resources';
import { SettingsModal } from './components/SettingsModal';
import { ProUpgradeModal } from './components/ProUpgradeModal';
import { TutorialOverlay, TutorialStep } from './components/TutorialOverlay';
import { PerformanceToast } from './components/PerformanceToast';
import { usePerformanceMonitor } from './hooks/usePerformanceMonitor';
import { THEME_CONFIG, QUOTES } from './constants';
import { Session, Target, TestResult, ViewType, ThemeId, QuestionLog } from './types';

// Constants
const TABS = [
  { id: 'daily', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'planner', label: 'Planner', icon: Calendar },
  { id: 'focus', label: 'Focus', icon: Timer },
  { id: 'tests', label: 'Tests', icon: GraduationCap },
  { id: 'analytics', label: 'Stats', icon: PieChart },
  { id: 'resources', label: 'Resources', icon: BookOpen },
];

const TOUR_STEPS: TutorialStep[] = [
  { title: 'Welcome to Trackly', description: 'Your personal JEE prep companion. Let\'s show you around.', view: 'daily', targetId: 'root', icon: LayoutDashboard },
  { title: 'Dashboard', description: 'View your daily progress, streaks, and upcoming tasks here.', view: 'daily', targetId: 'dashboard-subjects', icon: LayoutDashboard },
  { title: 'Focus Timer', description: 'Use the Pomodoro timer to stay focused during study sessions.', view: 'focus', targetId: 'timer-container', icon: Timer },
  { title: 'Planner', description: 'Schedule your revision and tasks efficiently.', view: 'planner', targetId: 'planner-container', icon: Calendar },
  { title: 'Test Log', description: 'Record your mock test scores and analyze mistakes.', view: 'tests', targetId: 'test-log-container', icon: GraduationCap },
];

const App: React.FC = () => {
  // -- State: View & Theme --
  const [view, setView] = useState<ViewType>('daily');
  const [theme, setTheme] = useState<ThemeId>('default-dark');
  const [isPro, setIsPro] = useState(false);
  
  // -- State: Data --
  const [sessions, setSessions] = useState<Session[]>([]);
  const [targets, setTargets] = useState<Target[]>([]);
  const [tests, setTests] = useState<TestResult[]>([]);
  const [goals, setGoals] = useState({ Physics: 20, Chemistry: 20, Maths: 20 });
  const [user, setUser] = useState<{name: string} | null>(null);

  // -- State: UI/Modals --
  const [showProModal, setShowProModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isTutorialActive, setIsTutorialActive] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);

  // -- State: Timer (Lifted) --
  const [timerMode, setTimerMode] = useState<'focus' | 'short' | 'long'>('focus');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [timerDurations, setTimerDurations] = useState({ focus: 25, short: 5, long: 15 });
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [sessionLogs, setSessionLogs] = useState<QuestionLog[]>([]);
  const [lastLogTime, setLastLogTime] = useState(Date.now());
  const [sessionCount, setSessionCount] = useState(0);

  // -- State: Settings --
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const [graphicsEnabled, setGraphicsEnabled] = useState(true);
  const [lagDetectionEnabled, setLagDetectionEnabled] = useState(true);
  const [showAurora, setShowAurora] = useState(true);
  const [parallaxEnabled, setParallaxEnabled] = useState(true);
  const [showParticles, setShowParticles] = useState(true);
  const [swipeAnimationEnabled, setSwipeAnimationEnabled] = useState(true);
  const [swipeStiffness, setSwipeStiffness] = useState(300);
  const [swipeDamping, setSwipeDamping] = useState(30);
  const [soundPitch, setSoundPitch] = useState(440);
  const [soundVolume, setSoundVolume] = useState(0.5);

  const { isLagging, dismiss: dismissLag } = usePerformanceMonitor(lagDetectionEnabled);
  const themeConfig = THEME_CONFIG[theme] || THEME_CONFIG['default-dark'];

  // -- Effects --

  // CSS Variables for Theme
  useEffect(() => {
    const root = document.documentElement;
    const t = themeConfig;
    
    // Set Mode
    if (t.mode === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');

    // Helper to convert hex to rgb for tailwind opacity usage
    const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? `${parseInt(result[1], 16)} ${parseInt(result[2], 16)} ${parseInt(result[3], 16)}` : '0 0 0';
    };

    root.style.setProperty('--theme-bg', t.colors.bg);
    root.style.setProperty('--theme-card', t.colors.card);
    root.style.setProperty('--theme-card-rgb', hexToRgb(t.colors.card));
    root.style.setProperty('--theme-accent', t.colors.accent);
    root.style.setProperty('--theme-accent-rgb', hexToRgb(t.colors.accent));
    root.style.setProperty('--theme-accent-glow', t.colors.accentGlow);
    root.style.setProperty('--theme-text-main', hexToRgb(t.colors.text));
    
  }, [theme, themeConfig]);

  // Timer Logic
  useEffect(() => {
    let interval: any = null;
    if (isTimerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isTimerActive) {
      setIsTimerActive(false);
      // Play sound
      if(soundEnabled) {
          try {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.setValueAtTime(soundPitch, ctx.currentTime);
            gain.gain.setValueAtTime(soundVolume, ctx.currentTime);
            osc.start();
            osc.stop(ctx.currentTime + 0.5);
          } catch(e) { console.error(e); }
      }
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timeLeft, soundEnabled, soundPitch, soundVolume]);

  // Load Data
  useEffect(() => {
      const load = (key: string, setter: any) => {
          const saved = localStorage.getItem(key);
          if(saved) setter(JSON.parse(saved));
      }
      load('trackly_sessions', setSessions);
      load('trackly_targets', setTargets);
      load('trackly_tests', setTests);
      load('trackly_goals', setGoals);
      load('trackly_theme', setTheme);
      load('trackly_pro', setIsPro);
      load('trackly_user', setUser);
      load('trackly_timer_durations', setTimerDurations);
  }, []);

  // Save Data
  useEffect(() => { localStorage.setItem('trackly_sessions', JSON.stringify(sessions)); }, [sessions]);
  useEffect(() => { localStorage.setItem('trackly_targets', JSON.stringify(targets)); }, [targets]);
  useEffect(() => { localStorage.setItem('trackly_tests', JSON.stringify(tests)); }, [tests]);
  useEffect(() => { localStorage.setItem('trackly_goals', JSON.stringify(goals)); }, [goals]);
  useEffect(() => { localStorage.setItem('trackly_theme', JSON.stringify(theme)); }, [theme]);
  useEffect(() => { localStorage.setItem('trackly_pro', JSON.stringify(isPro)); }, [isPro]);
  useEffect(() => { localStorage.setItem('trackly_timer_durations', JSON.stringify(timerDurations)); }, [timerDurations]);

  // -- Handlers --
  
  const changeView = (v: ViewType) => {
    setView(v);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveSession = (data: any) => {
      const newSession: Session = {
          id: Date.now().toString(),
          timestamp: Date.now(),
          ...data
      };
      setSessions(prev => [newSession, ...prev]);
  };

  const handleAddTarget = (t: Target) => setTargets(prev => [...prev, t]);
  const handleToggleTarget = (id: string, val: boolean) => {
      setTargets(prev => prev.map(t => t.id === id ? { ...t, completed: val } : t));
  };
  const handleDeleteTarget = (id: string) => setTargets(prev => prev.filter(t => t.id !== id));

  const handleSaveTest = (t: any) => {
      setTests(prev => [{ ...t, id: Date.now().toString(), timestamp: Date.now() }, ...prev]);
  };
  const handleDeleteTest = (id: string) => setTests(prev => prev.filter(t => t.id !== id));
  const handleDeleteSession = (id: string) => setSessions(prev => prev.filter(s => s.id !== id));

  // Timer Handlers
  const handleToggleTimer = () => {
      if(!isTimerActive) setLastLogTime(Date.now());
      setIsTimerActive(!isTimerActive);
  };
  const handleResetTimer = () => {
      setIsTimerActive(false);
      setTimeLeft(timerDurations[timerMode] * 60);
      setSessionLogs([]);
  };
  const handleSwitchMode = (m: 'focus' | 'short' | 'long') => {
      setTimerMode(m);
      setIsTimerActive(false);
      setTimeLeft(timerDurations[m] * 60);
  };
  const handleUpdateDurations = (val: number, m: 'focus' | 'short' | 'long') => {
      setTimerDurations(prev => ({...prev, [m]: val}));
      if(timerMode === m && !isTimerActive) setTimeLeft(val * 60);
  };
  const handleAddLog = (log: QuestionLog, subject: string) => {
      setSessionLogs(prev => [...prev, { ...log, subject }]);
      setLastLogTime(Date.now());
  };
  const handleCompleteSession = () => {
      // Aggregate session logs into a Session object
      const subjectCounts: Record<string, any> = {};
      
      sessionLogs.forEach(log => {
          if (!subjectCounts[log.subject]) {
              subjectCounts[log.subject] = { subject: log.subject, attempted: 0, correct: 0, mistakes: {} };
          }
          subjectCounts[log.subject].attempted++;
          if (log.result === 'correct') {
              subjectCounts[log.subject].correct++;
          } else {
              subjectCounts[log.subject].mistakes[log.result] = (subjectCounts[log.subject].mistakes[log.result] || 0) + 1;
          }
      });

      // Save multiple sessions if multiple subjects were covered
      Object.values(subjectCounts).forEach(data => {
          handleSaveSession({
              ...data,
              topic: 'Focus Session' // Generic topic for timer sessions
          });
      });
      
      setSessionCount(prev => prev + 1);
      handleResetTimer();
  };

  // Tutorial
  const nextTutorialStep = () => {
    if (tutorialStep < TOUR_STEPS.length - 1) {
      setTutorialStep(tutorialStep + 1);
      const nextView = TOUR_STEPS[tutorialStep + 1].view;
      if (nextView && nextView !== view) setView(nextView as ViewType);
    } else {
      setIsTutorialActive(false);
      setTutorialStep(0);
    }
  };
  
  const startTutorial = () => {
      setIsTutorialActive(true);
      setTutorialStep(0);
      setView('daily');
  };

  const getRandomQuote = () => QUOTES[Math.floor(Math.random() * QUOTES.length)];
  const [quote] = useState(getRandomQuote());

  return (
    <div 
        className="min-h-screen transition-colors duration-500 overflow-x-hidden"
        style={{ backgroundColor: themeConfig.colors.bg, color: themeConfig.colors.text }}
    >
      {/* Background Elements */}
      {graphicsEnabled && showAurora && (
          <div className="fixed inset-0 pointer-events-none opacity-30 dark:opacity-20 z-0 overflow-hidden">
             <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-500/20 blur-[120px] animate-pulse" />
             <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-purple-500/20 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
          </div>
      )}

      {/* Main Content Layout */}
      <div className="relative z-10 max-w-7xl mx-auto min-h-screen flex flex-col md:flex-row">
        
        {/* Desktop Sidebar (Hidden on Mobile) */}
        <aside className="hidden md:flex flex-col w-20 lg:w-64 sticky top-0 h-screen border-r border-slate-200 dark:border-white/5 bg-white/50 dark:bg-black/20 backdrop-blur-xl p-4">
            <div className="flex items-center gap-3 px-2 mb-10">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-600/20">
                    T
                </div>
                <span className="font-display font-bold text-xl hidden lg:block tracking-tight">Trackly</span>
            </div>

            <nav className="flex-1 space-y-2">
                {TABS.map(tab => {
                    const isActive = view === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => changeView(tab.id as ViewType)}
                            className={`
                                w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 group
                                ${isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:bg-white/10 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'}
                            `}
                        >
                            <tab.icon size={20} />
                            <span className="font-bold text-sm hidden lg:block">{tab.label}</span>
                            {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white hidden lg:block" />}
                        </button>
                    )
                })}
            </nav>

            <div className="mt-auto space-y-2">
                {!isPro && (
                    <button
                        onClick={() => setShowProModal(true)}
                        className="w-full flex items-center gap-3 px-3 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-orange-500/20 transition-transform hover:scale-105 active:scale-95"
                    >
                        <Crown size={20} />
                        <span className="font-bold text-sm hidden lg:block">Upgrade Pro</span>
                    </button>
                )}
                <button
                    onClick={() => setShowSettings(true)}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-slate-500 hover:bg-white/10 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                    <Settings size={20} />
                    <span className="font-bold text-sm hidden lg:block">Settings</span>
                </button>
            </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8 w-full max-w-full overflow-hidden">
            {/* Header Mobile */}
            <div className="md:hidden flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold">T</div>
                    <span className="font-display font-bold text-xl">Trackly</span>
                </div>
                <button onClick={() => setShowSettings(true)} className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white">
                    <Settings size={24} />
                </button>
            </div>

            {/* Views */}
            <div className="max-w-5xl mx-auto">
                {view === 'daily' && (
                    <Dashboard 
                        sessions={sessions}
                        targets={targets}
                        quote={quote}
                        onDelete={handleDeleteSession}
                        goals={goals}
                        setGoals={setGoals}
                        onSaveSession={handleSaveSession}
                        userName={user?.name || null}
                    />
                )}
                {view === 'planner' && (
                    <Planner 
                        targets={targets}
                        onAdd={handleAddTarget}
                        onToggle={handleToggleTarget}
                        onDelete={handleDeleteTarget}
                    />
                )}
                {view === 'focus' && (
                    <FocusTimer 
                        targets={targets}
                        mode={timerMode}
                        timeLeft={timeLeft}
                        isActive={isTimerActive}
                        durations={timerDurations}
                        soundEnabled={soundEnabled}
                        sessionLogs={sessionLogs}
                        lastLogTime={lastLogTime}
                        onToggleTimer={handleToggleTimer}
                        onResetTimer={handleResetTimer}
                        onSwitchMode={handleSwitchMode}
                        onToggleSound={() => setSoundEnabled(!soundEnabled)}
                        onUpdateDurations={handleUpdateDurations}
                        onAddLog={handleAddLog}
                        onCompleteSession={handleCompleteSession}
                        isPro={isPro}
                        sessionCount={sessionCount}
                        onOpenUpgrade={() => setShowProModal(true)}
                    />
                )}
                {view === 'tests' && (
                    <TestLog 
                        tests={tests}
                        targets={targets}
                        onSave={handleSaveTest}
                        onDelete={handleDeleteTest}
                        isPro={isPro}
                        onOpenUpgrade={() => setShowProModal(true)}
                    />
                )}
                {view === 'analytics' && (
                    <Analytics 
                        sessions={sessions}
                        tests={tests}
                        isPro={isPro}
                        onOpenUpgrade={() => setShowProModal(true)}
                    />
                )}
                {view === 'resources' && (
                    <Resources />
                )}
            </div>
        </main>
      </div>

      {/* Mobile Nav */}
      <nav 
        className="fixed bottom-0 left-0 w-full z-50 bg-white/95 dark:bg-[#020617]/95 backdrop-blur-xl border-t border-slate-200 dark:border-white/5 px-6 py-3 md:hidden transition-colors duration-500 shadow-[0_-5px_10px_rgba(0,0,0,0.03)] dark:shadow-none"
        style={{ 
            paddingBottom: 'calc(12px + env(safe-area-inset-bottom))',
            backgroundColor: themeConfig.mode === 'dark' ? themeConfig.colors.bg + 'ee' : 'rgba(255,255,255,0.95)'
        }}
      >
          <div className="flex justify-around items-center">
            {TABS.slice(0, 5).map(tab => {
              const isActive = view === tab.id;
              return (
                <button
                    key={tab.id}
                    onClick={() => changeView(tab.id as ViewType)}
                    className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${isActive ? 'text-indigo-600 dark:text-indigo-400 scale-105' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
                >
                    <div className={`p-1.5 rounded-xl transition-all duration-300 ${isActive ? 'bg-indigo-100 dark:bg-indigo-500/20' : 'bg-transparent'}`}>
                        <tab.icon size={22} strokeWidth={isActive ? 2.5 : 2} className="transition-all" />
                    </div>
                    <span className={`text-[9px] font-bold uppercase tracking-wider transition-opacity ${isActive ? 'opacity-100' : 'opacity-70'}`}>{tab.label}</span>
                </button>
            )})}

            {!isPro && (
                <button
                    onClick={() => setShowProModal(true)}
                    className="flex flex-col items-center gap-1.5 transition-all duration-300 text-amber-500 dark:text-amber-400 scale-100 hover:scale-105 active:scale-95 group"
                >
                    <div className="p-1.5 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/20 group-hover:bg-amber-500/20 transition-colors">
                        <Crown size={22} strokeWidth={2.5} className="transition-all" fill="currentColor" fillOpacity={0.2} />
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-wider">Pro</span>
                </button>
            )}
          </div>
      </nav>

      {isTutorialActive && (
        <TutorialOverlay 
          steps={TOUR_STEPS}
          currentStep={tutorialStep}
          onNext={nextTutorialStep}
          onClose={() => setIsTutorialActive(false)}
        />
      )}

      <SettingsModal 
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          animationsEnabled={animationsEnabled}
          toggleAnimations={() => setAnimationsEnabled(!animationsEnabled)}
          graphicsEnabled={graphicsEnabled}
          toggleGraphics={() => setGraphicsEnabled(!graphicsEnabled)}
          lagDetectionEnabled={lagDetectionEnabled}
          toggleLagDetection={() => setLagDetectionEnabled(!lagDetectionEnabled)}
          theme={theme}
          setTheme={setTheme}
          onStartTutorial={startTutorial}
          showAurora={showAurora}
          toggleAurora={() => setShowAurora(!showAurora)}
          parallaxEnabled={parallaxEnabled}
          toggleParallax={() => setParallaxEnabled(!parallaxEnabled)}
          showParticles={showParticles}
          toggleParticles={() => setShowParticles(!showParticles)}
          swipeAnimationEnabled={swipeAnimationEnabled}
          toggleSwipeAnimation={() => setSwipeAnimationEnabled(!swipeAnimationEnabled)}
          swipeStiffness={swipeStiffness}
          setSwipeStiffness={setSwipeStiffness}
          swipeDamping={swipeDamping}
          setSwipeDamping={setSwipeDamping}
          soundEnabled={soundEnabled}
          toggleSound={() => setSoundEnabled(!soundEnabled)}
          soundPitch={soundPitch}
          setSoundPitch={setSoundPitch}
          soundVolume={soundVolume}
          setSoundVolume={setSoundVolume}
      />

      <ProUpgradeModal 
          isOpen={showProModal}
          onClose={() => setShowProModal(false)}
          onUpgrade={() => {
              setIsPro(true);
          }}
      />

      <PerformanceToast 
          isVisible={isLagging}
          onSwitch={() => {
              setGraphicsEnabled(false);
              setAnimationsEnabled(false);
              dismissLag();
          }}
          onDismiss={dismissLag}
      />

    </div>
  );
};

export default App;