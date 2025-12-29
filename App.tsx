import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  Activity, 
  Calendar as CalendarIcon, 
  PenTool, 
  BarChart3, 
  LayoutDashboard,
  Timer,
  Settings,
  LogOut,
  ChevronRight,
  ChevronLeft,
  Map,
  CheckCircle2,
  Atom,
  Zap,
  Calculator
} from 'lucide-react';
import { ViewType, Session, TestResult, Target, ThemeId } from './types';
import { QUOTES, THEME_CONFIG } from './constants';
import { Dashboard } from './components/Dashboard';
import { FocusTimer } from './components/FocusTimer';
import { Planner } from './components/Planner';
import { TestLog } from './components/TestLog';
import { Analytics } from './components/Analytics';
import { SettingsModal } from './components/SettingsModal';
import { TutorialOverlay, TutorialStep } from './components/TutorialOverlay';

// Helper for local date string YYYY-MM-DD
const getLocalDate = (d = new Date()) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const TracklyLogo = React.memo(({ collapsed = false, id }: { collapsed?: boolean, id?: string }) => {
  // Generate a unique ID for the gradient to prevent collisions when multiple logos exist (e.g. Sidebar hidden + Mobile visible)
  const uniqueId = React.useId();
  const gradientId = `logo-gradient-${uniqueId.replace(/:/g, '')}`;

  return (
    <div id={id} className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'} select-none transition-all duration-300`}>
      {/* SVG Waveform Icon - Simplified shadow for performance */}
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
      {/* Text */}
      <span className={`text-xl font-display font-extrabold text-slate-900 dark:text-white tracking-tight transition-all duration-300 origin-left whitespace-nowrap overflow-hidden ${collapsed ? 'w-0 opacity-0 scale-0' : 'w-auto opacity-100 scale-100'}`}>
        Trackly
      </span>
    </div>
  );
});

const AnimatedBackground = React.memo(({ 
    enabled, 
    themeId,
    showGlow,
    showAurora
}: { 
    enabled: boolean, 
    themeId: ThemeId,
    showGlow: boolean,
    showAurora: boolean
}) => {
  const config = THEME_CONFIG[themeId];
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const requestRef = useRef<number>();

  // Efficient Mouse Tracking for Parallax & Glow
  useEffect(() => {
    if (!enabled) return;

    const handleMouseMove = (e: MouseEvent) => {
      // Throttle via requestAnimationFrame
      if (requestRef.current) return;
      
      requestRef.current = requestAnimationFrame(() => {
        setMousePos({ x: e.clientX, y: e.clientY });
        requestRef.current = undefined;
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [enabled]);
  
  // Custom formulas/elements based on theme vibe
  const items = useMemo(() => {
    let baseItems = [
        "E = mc²", "∇ · B = 0", "iℏ∂ψ/∂t = Ĥψ", "F = G(m₁m₂)/r²",
        "PV = nRT", "∫ eˣ dx = eˣ", "x = (-b±√Δ)/2a", "F = ma"
    ];

    // Theme Specific Symbols
    if (themeId === 'forest') baseItems = ["●", "•", "◦", "○", "•", "●"];
    if (themeId === 'morning') baseItems = ["☁", "☼", "☁", "○", "•"];
    if (themeId === 'void') baseItems = ["0", "1", "0", "1", "<>", "{}"];
    
    return Array.from({ length: 15 }).map((_, i) => ({
        id: i,
        top: `${(i * 17) % 95}%`,
        left: `${(i * 23) % 95}%`,
        duration: 35 + (i % 25),
        delay: -(i * 7),
        size: 0.7 + (i % 4) * 0.25,
        content: baseItems[i % baseItems.length],
        // Add parallax depth factor
        parallaxFactor: (i % 3 + 1) * 0.02
    }));
  }, [themeId]);

  if (!enabled) return <div className="fixed inset-0 z-0 pointer-events-none" style={{ backgroundColor: config.colors.bg }} />;

  // Calculate Parallax Transforms
  // We move background elements OPPOSITE to mouse direction
  const xOffset = (window.innerWidth / 2 - mousePos.x);
  const yOffset = (window.innerHeight / 2 - mousePos.y);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden select-none transition-colors duration-700" style={{ backgroundColor: config.colors.bg }}>
      
      {/* 1. CINEMATIC GRAIN (Texture) */}
      <div className="absolute inset-0 bg-noise opacity-[0.03] z-[5] pointer-events-none mix-blend-overlay"></div>

      {/* 2. AURORA MESH GRADIENTS (The "Breathing" Blobs) */}
      {showAurora && (
        <div className="absolute inset-0 z-[1] opacity-50 dark:opacity-20" style={{ filter: 'blur(80px)' }}>
            {/* Blob 1: Top Left (Accent Color) */}
            <div 
               className="absolute top-[-25%] left-[-10%] w-[60vw] h-[60vw] rounded-full animate-aurora-1 mix-blend-screen dark:mix-blend-screen"
               style={{ 
                   background: `radial-gradient(circle, ${config.colors.accent} 0%, transparent 70%)`,
                   transform: `translate(${xOffset * 0.02}px, ${yOffset * 0.02}px)` // Subtle Parallax
               }} 
            />
            
            {/* Blob 2: Bottom Right (Glow Color) */}
            <div 
               className="absolute bottom-[-30%] right-[-10%] w-[50vw] h-[50vw] rounded-full animate-aurora-2 mix-blend-screen dark:mix-blend-screen"
               style={{ 
                   background: `radial-gradient(circle, ${config.colors.accentGlow} 0%, transparent 70%)`,
                   transform: `translate(${xOffset * 0.03}px, ${yOffset * 0.03}px)` // Different speed
               }} 
            />
            
            {/* Blob 3: Center Drifter (Subtle Highlight) */}
            <div 
               className="absolute top-[20%] left-[30%] w-[40vw] h-[40vw] rounded-full animate-aurora-3 opacity-30 mix-blend-overlay"
               style={{ 
                   background: `radial-gradient(circle, ${config.mode === 'dark' ? '#ffffff' : config.colors.accent} 0%, transparent 60%)`,
               }} 
            />
        </div>
      )}

      {/* 3. MOUSE FOLLOW LIGHT (The "Spotlight") */}
      {config.mode === 'dark' && showGlow && (
          <div 
            className="absolute z-[2] w-[300px] h-[300px] rounded-full pointer-events-none transition-opacity duration-500"
            style={{
                // Reduced opacity to ~12% and added blur for a softer, non-intrusive glow
                background: `radial-gradient(circle, ${config.colors.accent}20 0%, transparent 70%)`,
                left: mousePos.x,
                top: mousePos.y,
                filter: 'blur(30px)',
                transform: 'translate(-50%, -50%)',
                willChange: 'transform' // Optimize layout thrashing
            }}
          />
      )}

      {/* 4. FLOATING SYMBOLS (With Parallax) */}
      <div className="absolute inset-0 z-[3]">
        {items.map((item) => (
            <div 
            key={item.id}
            className={`absolute font-mono whitespace-nowrap animate-float-gentle mix-blend-screen ${item.id % 2 === 0 ? 'hidden md:block' : ''}`}
            style={{
                top: item.top,
                left: item.left,
                fontSize: `${item.size}rem`,
                animationDuration: `${item.duration}s`,
                animationDelay: `${item.delay}s`,
                color: config.mode === 'dark' ? `${config.colors.accent}30` : `${config.colors.accent}20`,
                textShadow: config.mode === 'dark' ? `0 0 8px ${config.colors.accent}20` : 'none',
                // Interactive Parallax Transform
                transform: `translate(${xOffset * item.parallaxFactor}px, ${yOffset * item.parallaxFactor}px)`
            }}
            >
            {item.content}
            </div>
        ))}
      </div>

      {/* 5. VIGNETTE (Focus focus) */}
      <div 
        className="absolute inset-0 z-[4] pointer-events-none transition-colors duration-500"
        style={{
            background: config.mode === 'dark' 
                ? 'radial-gradient(circle at center, transparent 20%, rgba(2, 6, 23, 0.4) 100%)' 
                : 'radial-gradient(circle at center, transparent 40%, rgba(255,255,255,0.4) 100%)' 
        }}
      />
    </div>
  );
});

const TABS = [
  { id: 'daily', label: 'Home', icon: LayoutDashboard },
  { id: 'planner', label: 'Plan', icon: CalendarIcon },
  { id: 'focus', label: 'Focus', icon: Timer },
  { id: 'tests', label: 'Tests', icon: PenTool },
  { id: 'analytics', label: 'Stats', icon: BarChart3 },
];

const TOUR_STEPS: TutorialStep[] = [
  { 
    view: 'daily', 
    targetId: 'trackly-logo',
    title: 'Welcome to Trackly', 
    description: 'Your command center for academic excellence. This guided tour will show you how to maximize your study efficiency.', 
    icon: LayoutDashboard 
  },
  { 
    view: 'daily', 
    targetId: 'dashboard-subjects',
    title: 'Track Subjects', 
    description: 'These pods are your daily drivers. Click on Physics, Chemistry, or Maths to log your sessions and track syllabus progress.', 
    icon: Atom 
  },
  { 
    view: 'planner', 
    targetId: 'planner-container',
    title: 'Strategic Planning', 
    description: 'Never miss a revision deadline. Use the Planner to schedule tasks for the week or month ahead.', 
    icon: CalendarIcon 
  },
  { 
    view: 'focus', 
    targetId: 'timer-container',
    title: 'Deep Focus Timer', 
    description: 'Enter flow state with our Pomodoro-style timer. Enable Brown Noise for isolation and link sessions to specific tasks.', 
    icon: Timer 
  },
  { 
    view: 'tests', 
    targetId: 'test-log-container',
    title: 'Test Analysis', 
    description: 'Log your mock test scores here. Record not just your marks, but your temperament and specific mistake patterns.', 
    icon: PenTool 
  },
  { 
    view: 'analytics', 
    targetId: 'analytics-container',
    title: 'Smart Analytics', 
    description: 'Trackly identifies if you are struggling with Concepts, Formulas, or Calculation errors over time.', 
    icon: BarChart3 
  },
  {
    view: 'daily',
    targetId: 'settings-btn',
    title: 'Themes & Controls',
    description: 'Open Settings to customize your experience with themes like Obsidian or Forest. You can also toggle Animations here for better performance on older devices.',
    icon: Settings
  }
];

const Sidebar = ({ 
    view, 
    setView, 
    onOpenSettings, 
    isCollapsed, 
    toggleCollapsed 
}: { 
    view: ViewType, 
    setView: (v: ViewType) => void, 
    onOpenSettings: () => void,
    isCollapsed: boolean,
    toggleCollapsed: () => void
}) => {
  return (
    <aside 
        className={`hidden md:flex flex-col h-screen fixed left-0 top-0 z-40 border-r border-slate-200 dark:border-white/5 bg-white/50 dark:bg-slate-950/30 backdrop-blur-xl transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) ${isCollapsed ? 'w-20 items-center' : 'w-64'} overflow-visible transform-gpu`}
        style={{ transform: 'translateZ(0)' }}
    >
      <div className={`h-20 flex items-center relative shrink-0 ${isCollapsed ? 'justify-center px-0 w-full' : 'justify-between px-6'}`}>
        <TracklyLogo collapsed={isCollapsed} id="trackly-logo" />
        
        {/* Toggle Button */}
        <button 
           onClick={toggleCollapsed}
           className={`absolute top-1/2 -translate-y-1/2 -right-3 z-50 w-6 h-6 flex items-center justify-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-full text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-all shadow-sm hover:shadow-md hover:scale-110 active:scale-95`}
           title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
           {isCollapsed ? <ChevronRight size={12} strokeWidth={3} /> : <ChevronLeft size={12} strokeWidth={3} />}
        </button>
      </div>

      <nav className="flex-1 px-3 py-6 space-y-2 w-full">
        {TABS.map(tab => {
          const isActive = view === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setView(tab.id as ViewType)}
              className={`w-full flex items-center px-3 py-3 rounded-xl transition-all duration-300 group relative
                ${isActive 
                  ? 'bg-indigo-50/50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }
                ${isCollapsed ? 'justify-center gap-0' : 'gap-4'}
              `}
              title={isCollapsed ? tab.label : ''}
            >
              <div className={`p-2 rounded-xl transition-all duration-300 flex-shrink-0 relative z-10 will-change-transform
                  ${isActive 
                     ? 'bg-white dark:bg-white/10 shadow-indigo-500/20 shadow-lg' 
                     : 'group-hover:text-indigo-500 dark:group-hover:text-indigo-400 group-hover:bg-indigo-50/50 dark:group-hover:bg-indigo-500/10 group-hover:shadow-[0_0_15px_rgba(99,102,241,0.2)]'
                  }
              `}>
                <tab.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              
              <span className={`text-sm font-bold tracking-wide transition-all duration-300 overflow-hidden whitespace-nowrap ${isCollapsed ? 'w-0 opacity-0 translate-x-4' : 'w-auto opacity-100 translate-x-0'}`}>
                  {tab.label}
              </span>
              
              {isActive && !isCollapsed && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div>}
            </button>
          )
        })}
      </nav>

      <div className="p-4 border-t border-slate-200 dark:border-white/5 w-full">
        <button 
          id="settings-btn"
          onClick={onOpenSettings}
          className={`w-full flex items-center px-3 py-3 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-all group ${isCollapsed ? 'justify-center gap-0' : 'gap-3'}`}
          title={isCollapsed ? "Settings" : ''}
        >
          <div className="p-2 rounded-xl transition-all duration-300 flex-shrink-0 relative z-10 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 group-hover:bg-indigo-50/50 dark:group-hover:bg-indigo-500/10 group-hover:shadow-[0_0_15px_rgba(99,102,241,0.2)] will-change-transform">
             <Settings size={20} className="group-hover:rotate-90 transition-transform duration-500" />
          </div>
          <span className={`text-sm font-bold transition-all duration-300 overflow-hidden whitespace-nowrap ${isCollapsed ? 'w-0 opacity-0 translate-x-4' : 'w-auto opacity-100 translate-x-0'}`}>Settings</span>
        </button>
      </div>
    </aside>
  );
};

const App: React.FC = () => {
  const [view, setView] = useState<ViewType>('daily');
  const [sessions, setSessions] = useState<Session[]>([]);
  const [tests, setTests] = useState<TestResult[]>([]);
  const [targets, setTargets] = useState<Target[]>([]);
  const [goals, setGoals] = useState({ Physics: 30, Chemistry: 30, Maths: 30 });
  const [quoteIdx] = useState(() => Math.floor(Math.random() * QUOTES.length));

  // Settings State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const [theme, setTheme] = useState<ThemeId>('default-dark');
  const [showCursorGlow, setShowCursorGlow] = useState(true);
  const [showAurora, setShowAurora] = useState(true);
  
  // UI State
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Tutorial State
  const [isTutorialActive, setIsTutorialActive] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);

  // Load Settings
  useEffect(() => {
    const savedAnim = localStorage.getItem('zenith_animations');
    const savedTheme = localStorage.getItem('zenith_theme_id');
    const savedSidebar = localStorage.getItem('zenith_sidebar_collapsed');
    const savedGlow = localStorage.getItem('zenith_glow');
    const savedAurora = localStorage.getItem('zenith_aurora');
    
    if (savedAnim !== null) setAnimationsEnabled(JSON.parse(savedAnim));
    if (savedTheme && THEME_CONFIG[savedTheme as ThemeId]) setTheme(savedTheme as ThemeId);
    if (savedSidebar !== null) setSidebarCollapsed(JSON.parse(savedSidebar));
    if (savedGlow !== null) setShowCursorGlow(JSON.parse(savedGlow));
    if (savedAurora !== null) setShowAurora(JSON.parse(savedAurora));
  }, []);

  // Persist & Apply Settings
  useEffect(() => {
    localStorage.setItem('zenith_animations', JSON.stringify(animationsEnabled));
    if (!animationsEnabled) document.body.classList.add('disable-animations');
    else document.body.classList.remove('disable-animations');
  }, [animationsEnabled]);

  useEffect(() => { localStorage.setItem('zenith_theme_id', theme); }, [theme]);
  useEffect(() => { localStorage.setItem('zenith_glow', JSON.stringify(showCursorGlow)); }, [showCursorGlow]);
  useEffect(() => { localStorage.setItem('zenith_aurora', JSON.stringify(showAurora)); }, [showAurora]);

  const toggleSidebar = () => {
      setSidebarCollapsed(prev => {
          const next = !prev;
          localStorage.setItem('zenith_sidebar_collapsed', JSON.stringify(next));
          return next;
      });
  };

  // Load Data
  useEffect(() => {
    const savedSessions = localStorage.getItem('zenith_sessions');
    const savedTests = localStorage.getItem('zenith_tests');
    const savedTargets = localStorage.getItem('zenith_targets');
    const savedGoals = localStorage.getItem('zenith_goals');

    if (savedSessions) setSessions(JSON.parse(savedSessions));
    if (savedTests) setTests(JSON.parse(savedTests));
    if (savedTargets) setTargets(JSON.parse(savedTargets));
    if (savedGoals) setGoals(JSON.parse(savedGoals));
  }, []);

  // Persistence Effects
  useEffect(() => { setTimeout(() => localStorage.setItem('zenith_sessions', JSON.stringify(sessions)), 500) }, [sessions]);
  useEffect(() => { setTimeout(() => localStorage.setItem('zenith_tests', JSON.stringify(tests)), 500) }, [tests]);
  useEffect(() => { setTimeout(() => localStorage.setItem('zenith_targets', JSON.stringify(targets)), 500) }, [targets]);
  useEffect(() => { setTimeout(() => localStorage.setItem('zenith_goals', JSON.stringify(goals)), 500) }, [goals]);

  const handleSaveSession = useCallback((newSession: Omit<Session, 'id' | 'timestamp'>) => {
    const session: Session = { ...newSession, id: crypto.randomUUID(), timestamp: Date.now() };
    setSessions(prev => [session, ...prev]);
  }, []);

  const handleDeleteSession = useCallback((id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
  }, []);

  const handleSaveTest = useCallback((newTest: Omit<TestResult, 'id' | 'timestamp'>) => {
    const test: TestResult = { ...newTest, id: crypto.randomUUID(), timestamp: Date.now() };
    setTests(prev => [test, ...prev]);
  }, []);

  const handleDeleteTest = useCallback((id: string) => {
    setTests(prev => prev.filter(t => t.id !== id));
  }, []);

  const handleSaveTarget = useCallback((target: Target) => {
    setTargets(prev => [...prev, target]);
  }, []);

  const handleUpdateTarget = useCallback((id: string, completed: boolean) => {
    setTargets(prev => prev.map(t => t.id === id ? { ...t, completed } : t));
  }, []);

  const handleDeleteTarget = useCallback((id: string) => {
    setTargets(prev => prev.filter(t => t.id !== id));
  }, []);

  // Tutorial Logic
  const startTutorial = () => {
    setIsTutorialActive(true);
    setTutorialStep(0);
    setView('daily'); // Start at home
  };

  const nextTutorialStep = () => {
    const nextStep = tutorialStep + 1;
    if (nextStep >= TOUR_STEPS.length) {
      setIsTutorialActive(false);
      setTutorialStep(0);
      setView('daily'); // Reset to home
    } else {
      setTutorialStep(nextStep);
      // Automatically switch view based on the step configuration
      if (TOUR_STEPS[nextStep].view) {
        setView(TOUR_STEPS[nextStep].view as ViewType);
      }
    }
  };

  const themeConfig = THEME_CONFIG[theme];

  return (
    <div className={`min-h-screen font-sans overflow-x-hidden relative flex flex-col transition-colors duration-500 ${themeConfig.mode === 'dark' ? 'dark text-slate-100' : 'text-slate-900'}`}>
      
      {/* Dynamic Theme Styles Injection - The "Skinning" Engine */}
      <style>{`
        :root {
          --theme-accent: ${themeConfig.colors.accent};
          --theme-accent-glow: ${themeConfig.colors.accentGlow};
          --theme-card-bg: ${themeConfig.colors.card};
          --theme-text-main: ${themeConfig.colors.text};
          /* Stronger contrast for subtext in light mode */
          --theme-text-sub: ${themeConfig.mode === 'dark' ? 'rgba(255,255,255,0.5)' : '#334155'}; /* Slate-700 in light mode */
        }
        
        /* --- GLOBAL COLOR MAPPING --- */

        /* 1. Map all Indigo Utility Classes to Theme Accent */
        .text-indigo-50, .text-indigo-100, .text-indigo-200, .text-indigo-300, .text-indigo-400, .text-indigo-500, .text-indigo-600, .text-indigo-700, .text-indigo-800, .text-indigo-900 {
            color: var(--theme-accent) !important;
        }
        .bg-indigo-400, .bg-indigo-500, .bg-indigo-600, .bg-indigo-700 {
            background-color: var(--theme-accent) !important;
        }
        .border-indigo-100, .border-indigo-200, .border-indigo-300, .border-indigo-400, .border-indigo-500, .border-indigo-600 {
            border-color: var(--theme-accent) !important;
        }
        .ring-indigo-500, .ring-indigo-600 {
            --tw-ring-color: var(--theme-accent) !important;
        }
        .shadow-indigo-500\\/20, .shadow-indigo-600\\/20, .shadow-indigo-500\\/40, .shadow-indigo-600\\/30 {
            box-shadow: 0 10px 15px -3px ${themeConfig.colors.accent}40 !important;
        }

        /* 2. TEXT NORMALIZATION (Crucial for visibility) */
        /* Forces standard Tailwind text classes to use theme-aware colors */
        .text-slate-900, .text-gray-900, .text-zinc-900, .text-neutral-900 {
            color: var(--theme-text-main) !important;
        }
        /* Mapped Subtext */
        .text-slate-500, .text-gray-500, .text-zinc-500, .text-neutral-500 {
            color: var(--theme-text-sub) !important;
        }
        /* In light mode, ensure 'slate-400' is darker for readability */
        ${themeConfig.mode === 'light' ? `
            .text-slate-300 { color: #94a3b8 !important; } /* Becomes Slate 400 */
            .text-slate-400, .text-gray-400 { color: #475569 !important; } /* Becomes Slate 600 */
            .text-slate-600 { color: #1e293b !important; } /* Becomes Slate 800 */
            .placeholder\\:text-slate-400::placeholder { color: #64748b !important; }
        ` : ''}

        /* 3. Card & Glass Effect Overrides */
        
        /* Light Mode Cards: Higher Opacity White + Border */
        .bg-white\\/60, .bg-white\\/70, .bg-white\\/80, .bg-white\\/50 {
             background-color: ${themeConfig.mode === 'light' ? 'rgba(255,255,255,0.95)' : themeConfig.colors.card + '99'} !important;
             border-color: ${themeConfig.mode === 'light' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.1)'} !important;
             box-shadow: ${themeConfig.mode === 'light' ? '0 8px 16px -4px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02)' : 'none'} !important;
        }
        
        /* Dark Mode Cards */
        .dark .bg-slate-900\\/40, .dark .bg-slate-900\\/50, .dark .bg-slate-900\\/60, .dark .bg-slate-900\\/80 {
            background-color: ${themeConfig.colors.card}99 !important;
        }

        /* 4. Gradient Overrides */
        .from-indigo-400, .from-indigo-500, .from-indigo-600 { --tw-gradient-from: var(--theme-accent) !important; }
        .to-indigo-400, .to-indigo-500, .to-indigo-600 { --tw-gradient-to: var(--theme-accent) !important; }

        /* 5. Input Field Visibility */
        input, select, textarea {
            background-color: ${themeConfig.mode === 'dark' ? 'rgba(0,0,0,0.2)' : '#ffffff'} !important;
            border-color: ${themeConfig.mode === 'dark' ? 'rgba(255,255,255,0.1)' : '#cbd5e1'} !important;
            color: ${themeConfig.colors.text} !important;
        }
        /* Fix focus ring color */
        input:focus, select:focus, textarea:focus {
            border-color: var(--theme-accent) !important;
            box-shadow: 0 0 0 1px var(--theme-accent) !important;
        }

        .bg-black\\/20, .dark .bg-black\\/20 {
            background-color: ${themeConfig.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'} !important;
        }

        /* 6. Planner Toggle & Button Specifics */
        .dark .dark\\:bg-indigo-600 { background-color: var(--theme-accent) !important; }
        .dark .dark\\:text-white { color: #ffffff !important; }
        
        /* 7. Scrollbars */
        ::-webkit-scrollbar-thumb {
            background-color: ${themeConfig.colors.accent}66 !important;
            border-radius: 10px;
        }
        ::-webkit-scrollbar-track { background: transparent; }

        /* 8. Selection Color */
        ::selection {
          background-color: ${themeConfig.colors.accent}4d; 
          color: white;
        }
      `}</style>

      <AnimatedBackground 
        enabled={animationsEnabled} 
        themeId={theme} 
        showGlow={showCursorGlow}
        showAurora={showAurora}
      />
      
      {/* Desktop Sidebar */}
      <Sidebar 
          view={view} 
          setView={setView} 
          onOpenSettings={() => setIsSettingsOpen(true)} 
          isCollapsed={sidebarCollapsed}
          toggleCollapsed={toggleSidebar}
      />

      {/* Mobile Header */}
      <div className="md:hidden relative z-10 p-6 flex justify-between items-center">
        <TracklyLogo id="trackly-logo-mobile" />
        <button onClick={() => setIsSettingsOpen(true)} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
          <Settings size={24} className="text-slate-600 dark:text-slate-300" />
        </button>
      </div>

      {/* Main Content Area */}
      <main className={`relative z-10 flex-grow p-4 md:p-10 pb-24 md:pb-10 w-full md:w-auto transition-all duration-500 ease-in-out ${sidebarCollapsed ? 'md:ml-20' : 'md:ml-64'}`}>
        <div className="max-w-7xl mx-auto w-full">
          {view === 'daily' && (
              <Dashboard 
                  sessions={sessions}
                  targets={targets}
                  quote={QUOTES[quoteIdx]}
                  onDelete={handleDeleteSession}
                  goals={goals}
                  setGoals={setGoals}
                  onSaveSession={handleSaveSession}
              />
          )}
          {view === 'planner' && (
              <Planner 
                  targets={targets}
                  onAdd={handleSaveTarget}
                  onToggle={handleUpdateTarget}
                  onDelete={handleDeleteTarget}
              />
          )}
          {view === 'focus' && (
              <div className="min-h-[80vh] flex flex-col justify-center">
                <FocusTimer targets={targets} />
              </div>
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
        </div>
      </main>

      {/* Mobile Navigation Tabs */}
      <nav 
        className="fixed bottom-0 left-0 w-full z-50 bg-white/95 dark:bg-[#020617]/95 backdrop-blur-xl border-t border-slate-200 dark:border-white/5 px-6 py-3 md:hidden transition-colors duration-500 shadow-[0_-5px_10px_rgba(0,0,0,0.03)] dark:shadow-none"
        style={{ 
            paddingBottom: 'calc(12px + env(safe-area-inset-bottom))',
            backgroundColor: themeConfig.mode === 'dark' ? themeConfig.colors.bg + 'ee' : 'rgba(255,255,255,0.95)'
        }}
      >
          <div className="flex justify-around items-center">
            {TABS.map(tab => {
              const isActive = view === tab.id;
              return (
                <button
                    key={tab.id}
                    onClick={() => setView(tab.id as ViewType)}
                    className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${isActive ? 'text-indigo-600 dark:text-indigo-400 scale-105' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
                >
                    <div className={`p-1.5 rounded-xl transition-all duration-300 ${isActive ? 'bg-indigo-100 dark:bg-indigo-500/20' : 'bg-transparent'}`}>
                        <tab.icon size={22} strokeWidth={isActive ? 2.5 : 2} className="transition-all" />
                    </div>
                    <span className={`text-[9px] font-bold uppercase tracking-wider transition-opacity ${isActive ? 'opacity-100' : 'opacity-70'}`}>{tab.label}</span>
                </button>
            )})}
          </div>
      </nav>

      {/* Tutorial Overlay */}
      {isTutorialActive && (
        <TutorialOverlay 
          steps={TOUR_STEPS}
          currentStep={tutorialStep}
          onNext={nextTutorialStep}
          onClose={() => setIsTutorialActive(false)}
        />
      )}

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        animationsEnabled={animationsEnabled}
        toggleAnimations={() => setAnimationsEnabled(!animationsEnabled)}
        theme={theme}
        setTheme={setTheme}
        onStartTutorial={startTutorial}
        showCursorGlow={showCursorGlow}
        toggleCursorGlow={() => setShowCursorGlow(!showCursorGlow)}
        showAurora={showAurora}
        toggleAurora={() => setShowAurora(!showAurora)}
      />
    </div>
  );
};

export default App;