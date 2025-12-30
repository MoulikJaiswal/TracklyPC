import React, { useState, useEffect, useCallback, useMemo, useRef, Suspense, lazy } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  Activity, 
  Calendar as CalendarIcon, 
  PenTool, 
  BarChart3, 
  LayoutDashboard,
  Timer,
  Settings,
  ChevronRight,
  ChevronLeft,
  Atom,
  Loader2,
  HardDrive,
  WifiOff,
  Map
} from 'lucide-react';
import { ViewType, Session, TestResult, Target, ThemeId } from './types';
import { QUOTES, THEME_CONFIG } from './constants';
import { SettingsModal } from './components/SettingsModal';
import { TutorialOverlay, TutorialStep } from './components/TutorialOverlay';
import { Confetti } from './components/Confetti';

// Lazy Load Components
const Dashboard = lazy(() => import('./components/Dashboard').then(module => ({ default: module.Dashboard })));
const FocusTimer = lazy(() => import('./components/FocusTimer').then(module => ({ default: module.FocusTimer })));
const Planner = lazy(() => import('./components/Planner').then(module => ({ default: module.Planner })));
const TestLog = lazy(() => import('./components/TestLog').then(module => ({ default: module.TestLog })));
const Analytics = lazy(() => import('./components/Analytics').then(module => ({ default: module.Analytics })));

// UUID Generator
const generateUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Safe LocalStorage Parser
const safeJSONParse = <T,>(key: string, fallback: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    return fallback;
  }
};

const TracklyLogo = React.memo(({ collapsed = false, id }: { collapsed?: boolean, id?: string }) => {
  const uniqueId = React.useId();
  const gradientId = `logo-gradient-${uniqueId.replace(/:/g, '')}`;

  return (
    <div id={id} className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'} select-none transition-all duration-300 transform-gpu`}>
      <div className="relative w-8 h-5 flex-shrink-0">
        <svg viewBox="0 0 48 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-[0_0_5px_currentColor] text-indigo-500">
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="48" y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0%" className="stop-accent-light" stopColor="currentColor" /> 
              <stop offset="100%" className="stop-accent-dark" stopColor="currentColor" /> 
            </linearGradient>
          </defs>
          <path 
            d="M2 18 C 6 18, 8 10, 12 14 C 15 17, 17 6, 20 2 C 23 -2, 26 18, 28 22 C 30 26, 32 10, 36 12 C 40 14, 42 18, 46 18" 
            stroke={`url(#${gradientId})`}
            strokeWidth="4" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <span className={`text-xl font-display font-extrabold text-slate-900 dark:text-white tracking-tight transition-all duration-300 origin-left whitespace-nowrap overflow-hidden ${collapsed ? 'w-0 opacity-0 scale-0' : 'w-auto opacity-100 scale-100'}`}>
        Trackly
      </span>
    </div>
  );
});

const AnimatedBackground = React.memo(({ 
    themeId,
    showAurora,
    parallaxEnabled,
    showParticles,
    highPerformanceMode
}: { 
    themeId: ThemeId,
    showAurora: boolean,
    parallaxEnabled: boolean,
    showParticles: boolean,
    highPerformanceMode: boolean
}) => {
  const config = THEME_CONFIG[themeId];
  const containerRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>();

  useEffect(() => {
    if (!parallaxEnabled) return;

    const handleMouseMove = (e: MouseEvent) => {
        if (requestRef.current) return;
        requestRef.current = requestAnimationFrame(() => {
            if (containerRef.current) {
                const { innerWidth: w, innerHeight: h } = window;
                const xOffset = (w / 2 - e.clientX) / 50;
                const yOffset = (h / 2 - e.clientY) / 50;
                containerRef.current.style.transform = `translate(${xOffset}px, ${yOffset}px)`;
            }
            requestRef.current = undefined;
        });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [parallaxEnabled]);
  
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10" style={{ backgroundColor: config.colors.bg }}>
        {/* Base Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20" />
        
        {/* Parallax Container */}
        <div ref={containerRef} className="absolute inset-[-50px] w-[calc(100%+100px)] h-[calc(100%+100px)] transition-transform duration-75 ease-out">
            {showAurora && !highPerformanceMode && (
                <>
                    <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full mix-blend-screen filter blur-[80px] opacity-30 animate-aurora-1" 
                         style={{ backgroundColor: config.colors.accent }} />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-aurora-2"
                         style={{ backgroundColor: config.colors.accentGlow }} />
                </>
            )}
            {showParticles && !highPerformanceMode && (
                <div className="absolute inset-0 bg-noise opacity-[0.03]" />
            )}
        </div>
    </div>
  );
});

export default function App() {
  // --- STATE MANAGEMENT ---
  const [sessions, setSessions] = useState<Session[]>(() => safeJSONParse('sessions', []));
  const [targets, setTargets] = useState<Target[]>(() => safeJSONParse('targets', []));
  const [tests, setTests] = useState<TestResult[]>(() => safeJSONParse('tests', []));
  const [goals, setGoals] = useState(() => safeJSONParse('goals', { Physics: 20, Chemistry: 20, Maths: 20 }));
  const [theme, setTheme] = useState<ThemeId>(() => safeJSONParse('theme', 'default-dark'));
  
  // Navigation State
  const [view, setViewState] = useState<ViewType>('daily');
  const [slideDirection, setSlideDirection] = useState<number>(1); // 1 for next (right), -1 for prev (left)

  // --- NAVIGATION CONFIG ---
  const views: { id: ViewType; label: string; icon: any }[] = [
    { id: 'daily', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'focus', label: 'Focus', icon: Timer },
    { id: 'planner', label: 'Planner', icon: CalendarIcon },
    { id: 'tests', label: 'Tests', icon: Activity },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  // Smart View Setter that calculates direction
  const setView = (newView: ViewType) => {
    const currentIdx = views.findIndex(v => v.id === view);
    const newIdx = views.findIndex(v => v.id === newView);
    setSlideDirection(newIdx > currentIdx ? 1 : -1);
    setViewState(newView);
  };
  
  // Settings
  const [animationsEnabled, setAnimationsEnabled] = useState(() => safeJSONParse('animations', true));
  const [showAurora, setShowAurora] = useState(() => safeJSONParse('showAurora', true));
  const [parallaxEnabled, setParallaxEnabled] = useState(() => safeJSONParse('parallax', true));
  const [showParticles, setShowParticles] = useState(() => safeJSONParse('particles', true));
  const [swipeAnimationEnabled, setSwipeAnimationEnabled] = useState(() => safeJSONParse('swipeAnimation', true));
  const [swipeStiffness, setSwipeStiffness] = useState(() => safeJSONParse('swipeStiffness', 600));
  const [swipeDamping, setSwipeDamping] = useState(() => safeJSONParse('swipeDamping', 40));

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  // --- PERSISTENCE ---
  useEffect(() => localStorage.setItem('sessions', JSON.stringify(sessions)), [sessions]);
  useEffect(() => localStorage.setItem('targets', JSON.stringify(targets)), [targets]);
  useEffect(() => localStorage.setItem('tests', JSON.stringify(tests)), [tests]);
  useEffect(() => localStorage.setItem('goals', JSON.stringify(goals)), [goals]);
  useEffect(() => localStorage.setItem('theme', JSON.stringify(theme)), [theme]);
  
  // Persist Settings
  useEffect(() => {
     localStorage.setItem('animations', JSON.stringify(animationsEnabled));
     localStorage.setItem('showAurora', JSON.stringify(showAurora));
     localStorage.setItem('parallax', JSON.stringify(parallaxEnabled));
     localStorage.setItem('particles', JSON.stringify(showParticles));
     localStorage.setItem('swipeAnimation', JSON.stringify(swipeAnimationEnabled));
     localStorage.setItem('swipeStiffness', JSON.stringify(swipeStiffness));
     localStorage.setItem('swipeDamping', JSON.stringify(swipeDamping));
  }, [animationsEnabled, showAurora, parallaxEnabled, showParticles, swipeAnimationEnabled, swipeStiffness, swipeDamping]);

  // --- HANDLERS ---
  const handleSaveSession = useCallback((data: Omit<Session, 'id' | 'timestamp'>) => {
    const newSession: Session = { ...data, id: generateUUID(), timestamp: Date.now() };
    setSessions(prev => [newSession, ...prev]);
  }, []);

  const handleDeleteSession = useCallback((id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
  }, []);

  const handleAddTarget = useCallback((target: Target) => {
    setTargets(prev => [target, ...prev]);
  }, []);

  const handleToggleTarget = useCallback((id: string, completed: boolean) => {
    setTargets(prev => prev.map(t => t.id === id ? { ...t, completed } : t));
    if (completed) {
        // Check if all tasks for today are done
        const today = new Date().toISOString().split('T')[0];
        const todays = targets.filter(t => t.date === today && t.id !== id); // Exclude current being toggled (it's not updated in state yet)
        if (todays.length > 0 && todays.every(t => t.completed)) {
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 5000);
        }
    }
  }, [targets]);

  const handleDeleteTarget = useCallback((id: string) => {
    setTargets(prev => prev.filter(t => t.id !== id));
  }, []);

  const handleSaveTest = useCallback((data: Omit<TestResult, 'id' | 'timestamp'>) => {
    const newTest: TestResult = { ...data, id: generateUUID(), timestamp: Date.now() };
    setTests(prev => [newTest, ...prev]);
  }, []);

  const handleDeleteTest = useCallback((id: string) => {
    setTests(prev => prev.filter(t => t.id !== id));
  }, []);

  const handleGoalChange = useCallback((newGoals: { Physics: number, Chemistry: number, Maths: number }) => {
     setGoals(newGoals); // Directly set the object
  }, []);

  // --- TOUCH SWIPE HANDLERS ---
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    
    // Check if total swipe distance is significant enough
    if (Math.abs(distance) < 50) return;

    const currentIndex = views.findIndex(v => v.id === view);
    
    // Swipe Left -> Next Tab
    if (isLeftSwipe && currentIndex < views.length - 1) {
        setView(views[currentIndex + 1].id);
    }
    
    // Swipe Right -> Prev Tab
    if (isRightSwipe && currentIndex > 0) {
        setView(views[currentIndex - 1].id);
    }

    // Reset
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  // --- THEME APPLICATION ---
  useEffect(() => {
    const root = document.documentElement;
    const config = THEME_CONFIG[theme];
    
    if (config.mode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    if (!animationsEnabled) {
      root.classList.add('disable-animations');
    } else {
      root.classList.remove('disable-animations');
    }

    // CSS Variables for dynamic gradients
    root.style.setProperty('--theme-accent', config.colors.accent);
    root.style.setProperty('--theme-accent-glow', config.colors.accentGlow);
    root.style.setProperty('--theme-bg', config.colors.bg);
  }, [theme, animationsEnabled]);

  const config = THEME_CONFIG[theme];

  const tutorialSteps: TutorialStep[] = [
    { title: 'Welcome to Trackly', description: 'Your high-performance study companion. Let\'s show you around.', view: 'daily', targetId: 'desktop-logo', icon: Map },
    { title: 'Subject Hubs', description: 'Track problems solved for Physics, Chemistry, and Maths here.', view: 'daily', targetId: 'dashboard-subjects', icon: Atom },
    { title: 'Focus Timer', description: 'Enter flow state with our distraction-free timer and brown noise.', view: 'focus', targetId: 'timer-container', icon: Timer },
    { title: 'Planner', description: 'Schedule daily tasks and upcoming tests.', view: 'planner', targetId: 'planner-container', icon: CalendarIcon },
    { title: 'Test Analytics', description: 'Log mock tests and analyze your mistake patterns.', view: 'tests', targetId: 'test-log-container', icon: BarChart3 },
    { title: 'Settings', description: 'Customize themes, animations, and performance modes here.', view: 'daily', targetId: 'settings-trigger', icon: Settings },
  ];

  return (
    <div 
      className={`min-h-screen text-slate-900 dark:text-slate-200 selection:bg-indigo-500/30 overflow-x-hidden ${config.mode}`}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <AnimatedBackground 
        themeId={theme} 
        showAurora={showAurora} 
        parallaxEnabled={parallaxEnabled} 
        showParticles={showParticles}
        highPerformanceMode={!animationsEnabled}
      />
      
      {showConfetti && <Confetti />}

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        animationsEnabled={animationsEnabled}
        toggleAnimations={() => setAnimationsEnabled(!animationsEnabled)}
        theme={theme}
        setTheme={setTheme}
        onStartTutorial={() => { setShowTutorial(true); setTutorialStep(0); }}
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
      />

      {/* --- DESKTOP SIDEBAR --- */}
      <nav className="fixed left-0 top-0 bottom-0 w-64 p-4 hidden md:flex flex-col z-50">
        <div className="bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl h-full flex flex-col p-4 shadow-2xl">
           <div className="px-2 py-4 mb-6">
             <TracklyLogo id="desktop-logo" />
           </div>

           <div className="flex-grow space-y-2">
             {views.map(v => (
               <button
                 key={v.id}
                 onClick={() => setView(v.id)}
                 className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all duration-300 group ${
                   view === v.id 
                   ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' 
                   : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
                 }`}
               >
                 <v.icon size={20} className={`transition-transform duration-300 ${view === v.id ? 'scale-110' : 'group-hover:scale-110'}`} />
                 <span className="font-bold text-sm tracking-wide">{v.label}</span>
                 {view === v.id && <ChevronRight size={14} className="ml-auto opacity-60" />}
               </button>
             ))}
           </div>

           <div className="mt-auto space-y-2">
             <div className="p-4 bg-slate-50 dark:bg-black/20 rounded-2xl border border-slate-200 dark:border-white/5">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
                      LC
                   </div>
                   <div className="overflow-hidden">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">Local User</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                         <HardDrive size={10} /> Offline Mode
                      </p>
                   </div>
                </div>
             </div>
             
             <button 
               id="settings-trigger"
               onClick={() => setIsSettingsOpen(true)}
               className="w-full flex items-center gap-3 p-3 rounded-2xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
             >
               <Settings size={20} />
               <span className="font-bold text-sm tracking-wide">Settings</span>
             </button>
           </div>
        </div>
      </nav>

      {/* --- MOBILE CONTENT WRAPPER --- */}
      <main className="md:pl-64 min-h-screen pb-24 md:pb-0">
         <div className="max-w-7xl mx-auto p-4 md:p-8 lg:p-10">
           
           {/* Mobile Header */}
           <div className="md:hidden flex justify-between items-center mb-6">
              <TracklyLogo id="mobile-logo" />
              <button 
                onClick={() => setIsSettingsOpen(true)}
                className="p-2.5 bg-white/10 dark:bg-black/20 backdrop-blur-md rounded-full border border-slate-200 dark:border-white/10 text-slate-600 dark:text-white"
              >
                <Settings size={20} />
              </button>
           </div>

           {/* View Content */}
           <AnimatePresence mode="wait" custom={slideDirection}>
             <motion.div
               key={view}
               custom={slideDirection}
               initial={{ opacity: 0, x: slideDirection * 20, scale: 0.98 }}
               animate={{ opacity: 1, x: 0, scale: 1 }}
               exit={{ opacity: 0, x: slideDirection * -20, scale: 0.98 }}
               transition={{ 
                 type: "spring", 
                 stiffness: swipeStiffness, 
                 damping: swipeDamping 
               }}
               className="will-change-transform"
             >
                <Suspense fallback={
                    <div className="flex flex-col items-center justify-center h-[50vh]">
                        <Loader2 size={40} className="animate-spin text-indigo-500 mb-4" />
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Loading Module...</p>
                    </div>
                }>
                    {view === 'daily' && (
                        <Dashboard 
                          sessions={sessions}
                          targets={targets}
                          quote={QUOTES[new Date().getDate() % QUOTES.length]}
                          onDelete={handleDeleteSession}
                          goals={goals}
                          setGoals={setGoals as any}
                          onSaveSession={handleSaveSession}
                        />
                    )}
                    {view === 'focus' && (
                        <FocusTimer targets={targets} />
                    )}
                    {view === 'planner' && (
                        <Planner 
                            targets={targets}
                            onAdd={handleAddTarget}
                            onToggle={handleToggleTarget}
                            onDelete={handleDeleteTarget}
                        />
                    )}
                    {view === 'tests' && (
                        <TestLog 
                            tests={tests}
                            targets={targets}
                            onSave={handleSaveTest}
                            onDelete={handleDeleteTest}
                        />
                    )}
                    {view === 'analytics' && (
                        <Analytics sessions={sessions} tests={tests} />
                    )}
                </Suspense>
             </motion.div>
           </AnimatePresence>
         </div>
      </main>

      {/* --- MOBILE BOTTOM NAV --- */}
      <nav className="fixed bottom-0 left-0 right-0 p-4 md:hidden z-50">
        <div className="bg-white/90 dark:bg-[#0f172a]/90 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl flex justify-between items-center px-6 py-3">
          {views.map(v => (
            <button
              key={v.id}
              onClick={() => setView(v.id)}
              className={`flex flex-col items-center gap-1 transition-all duration-300 ${
                view === v.id ? 'text-indigo-600 dark:text-indigo-400 scale-110' : 'text-slate-400 dark:text-slate-500'
              }`}
            >
              <v.icon size={22} strokeWidth={view === v.id ? 2.5 : 2} />
              <span className={`text-[9px] font-bold ${view === v.id ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>{v.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Tutorial */}
      {showTutorial && (
        <TutorialOverlay 
           currentStep={tutorialStep} 
           steps={tutorialSteps}
           onNext={() => {
              if (tutorialStep < tutorialSteps.length - 1) {
                  setTutorialStep(s => s + 1);
                  setView(tutorialSteps[tutorialStep + 1].view as ViewType);
              } else {
                  setShowTutorial(false);
              }
           }}
           onClose={() => setShowTutorial(false)}
        />
      )}
    </div>
  );
}