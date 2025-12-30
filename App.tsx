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
  LogOut,
  ShieldCheck,
  WifiOff
} from 'lucide-react';
import { ViewType, Session, TestResult, Target, ThemeId } from './types';
import { QUOTES, THEME_CONFIG } from './constants';
import { SettingsModal } from './components/SettingsModal';
import { TutorialOverlay, TutorialStep } from './components/TutorialOverlay';

// Firebase Imports
import { auth, db, googleProvider } from './firebase';
import { signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { collection, doc, setDoc, deleteDoc, onSnapshot, query, orderBy, QuerySnapshot, DocumentData } from 'firebase/firestore';

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
                const xOffset = (w / 2 - e.clientX);
                const yOffset = (h / 2 - e.clientY);
                containerRef.current.style.setProperty('--off-x', `${xOffset}`);
                containerRef.current.style.setProperty('--off-y', `${yOffset}`);
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
  
  const items = useMemo(() => {
    if (!showParticles || highPerformanceMode) return [];

    if (themeId === 'midnight') {
        const midnightItems: any[] = [];
        for(let i=0; i<25; i++) {
            const size = Math.random() * 0.15 + 0.05; 
            const depth = Math.random() * 3 + 1; 
            const isBright = Math.random() > 0.8;
            midnightItems.push({
                id: `star-${i}`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                size: size,
                shape: 'star-point',
                opacity: Math.random() * 0.5 + 0.1,
                parallaxFactor: depth * 0.005, 
                animationDelay: Math.random() * 5,
                animationDuration: Math.random() * 3 + 3,
                isBright
            });
        }
        midnightItems.push({
            id: 'shooting-star-1',
            top: '20%',
            left: '10%',
            size: 1, 
            shape: 'shooting-star',
            parallaxFactor: 0.02
        });
        return midnightItems;
    }

    if (themeId === 'forest') {
        return [
            { id: 1, top: '-10%', left: '-10%', size: 45, shape: 'leaf', depth: 1, rotation: 135, opacity: 0.03 },
            { id: 2, top: '50%', left: '90%', size: 35, shape: 'leaf', depth: 1, rotation: 45, opacity: 0.03 },
            { id: 3, top: '85%', left: '5%', size: 25, shape: 'leaf', depth: 2, rotation: -25, opacity: 0.05 },
            { id: 4, top: '-10%', left: '60%', size: 28, shape: 'leaf', depth: 2, rotation: 160, opacity: 0.05 },
            { id: 5, top: '35%', left: '15%', size: 12, shape: 'leaf', depth: 3, rotation: 15, opacity: 0.08 },
            { id: 6, top: '20%', left: '85%', size: 15, shape: 'leaf', depth: 3, rotation: -10, opacity: 0.08 },
        ].map(item => ({
            ...item,
            parallaxFactor: item.depth * 0.005, 
            duration: 0, 
            delay: 0
        }));
    }

    return [
        { id: 1, top: '8%', left: '5%', size: 16, shape: 'ring', depth: 1, opacity: 0.03, rotation: 0 },
        { id: 2, top: '75%', left: '85%', size: 20, shape: 'squircle', depth: 1, opacity: 0.03, rotation: 15 },
        { id: 3, top: '5%', left: '55%', size: 8, shape: 'circle', depth: 1, opacity: 0.02, rotation: 0 },
        { id: 4, top: '80%', left: '10%', size: 12, shape: 'square', depth: 1, opacity: 0.02, rotation: 45 },
        { id: 5, top: '30%', left: '90%', size: 4, shape: 'triangle', depth: 2, opacity: 0.06, rotation: 160 },
        { id: 6, top: '45%', left: '5%', size: 5, shape: 'grid', depth: 2, opacity: 0.06, rotation: 10 },
        { id: 7, top: '15%', left: '80%', size: 3.5, shape: 'plus', depth: 2, opacity: 0.08, rotation: 0 },
        { id: 8, top: '85%', left: '35%', size: 4, shape: 'ring', depth: 2, opacity: 0.06, rotation: 0 },
        { id: 9, top: '20%', left: '35%', size: 3, shape: 'circle', depth: 2, opacity: 0.05, rotation: 0 },
        { id: 10, top: '22%', left: '20%', size: 2, shape: 'squircle', depth: 3, opacity: 0.12, rotation: 30 },
        { id: 11, top: '60%', left: '88%', size: 2.5, shape: 'circle', depth: 3, opacity: 0.12, rotation: 0 },
    ].map(item => ({
        ...item,
        parallaxFactor: item.depth * 0.08, 
        duration: 40 + (item.id * 2),
        delay: -(item.id * 5)
    }));
  }, [themeId, showParticles, highPerformanceMode]); 

  return (
    <div 
        ref={containerRef}
        className="fixed inset-0 z-0 pointer-events-none overflow-hidden select-none transition-colors duration-700" 
        style={{ 
            backgroundColor: config.colors.bg,
            contain: 'strict',
            transform: 'translateZ(0)',
            '--off-x': 0,
            '--off-y': 0
        } as React.CSSProperties}
    >
      {!highPerformanceMode && (
         <div className="absolute inset-0 bg-noise opacity-[0.03] z-[5] pointer-events-none mix-blend-overlay" style={{ transform: 'translateZ(0)' }}></div>
      )}

      {themeId === 'midnight' && (
        <>
            <div 
                className="absolute inset-0 z-[1]" 
                style={{ 
                    background: `linear-gradient(to bottom, #000000 0%, #050505 60%, #0f172a 100%)`, 
                    transform: 'translateZ(0)'
                }} 
            />
            {!highPerformanceMode && (
                <div 
                    className="absolute bottom-[-10%] left-[-10%] right-[-10%] h-[40%] z-[1] opacity-30"
                    style={{
                        background: 'radial-gradient(ellipse at center, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
                        opacity: 0.2,
                        transform: 'translateZ(0)'
                    }}
                />
            )}
        </>
      )}

      {themeId === 'forest' && (
        <div 
            className="absolute inset-0 z-[1] opacity-60" 
            style={{ 
                background: `radial-gradient(circle at 50% 120%, #3f6212 0%, transparent 60%), radial-gradient(circle at 50% -20%, #1a2e22 0%, transparent 60%)`,
                transform: 'translateZ(0)'
            }} 
        />
      )}

      {themeId === 'obsidian' && (
        <div 
            className="absolute inset-0 z-[1]" 
            style={{ 
                background: `
                    radial-gradient(circle at 50% -10%, #0f172a 0%, #020617 45%, #000000 100%),
                    radial-gradient(circle at 85% 25%, rgba(6, 182, 212, 0.05) 0%, transparent 50%),
                    radial-gradient(circle at 15% 75%, rgba(8, 145, 178, 0.05) 0%, transparent 45%)
                `,
                transform: 'translateZ(0)'
            }} 
        />
      )}

      {showAurora && !highPerformanceMode && !['forest', 'obsidian', 'midnight'].includes(themeId) && (
        <div className="absolute inset-0 z-[1] opacity-50 dark:opacity-20" style={{ transform: 'translateZ(0)' }}>
            <div 
               className="absolute top-[-40%] left-[-10%] w-[70vw] h-[70vw] mix-blend-screen dark:mix-blend-screen will-change-transform"
               style={{ 
                   transform: `translate3d(calc(var(--off-x) * 0.05 * 1px), calc(var(--off-y) * 0.05 * 1px), 0)`,
                   filter: 'blur(40px)'
               }} 
            >
                <div 
                    className="w-full h-full rounded-full animate-aurora-1"
                    style={{ background: `radial-gradient(circle, ${config.colors.accent} 0%, transparent 70%)` }}
                />
            </div>
            
            <div 
               className="absolute bottom-[-45%] right-[-10%] w-[60vw] h-[60vw] mix-blend-screen dark:mix-blend-screen will-change-transform"
               style={{ 
                   transform: `translate3d(calc(var(--off-x) * 0.08 * 1px), calc(var(--off-y) * 0.08 * 1px), 0)`,
                   filter: 'blur(40px)'
               }} 
            >
                 <div 
                    className="w-full h-full rounded-full animate-aurora-2"
                    style={{ background: `radial-gradient(circle, ${config.colors.accentGlow} 0%, transparent 70%)` }}
                />
            </div>
        </div>
      )}

      {showParticles && !highPerformanceMode && (
        <div className="absolute inset-0 z-[3] overflow-hidden">
            {items.map((item) => (
                <div 
                    key={item.id}
                    className={`absolute ${typeof item.id === 'number' && item.id % 2 === 0 ? 'hidden md:block' : ''} will-change-transform`}
                    style={{
                        top: item.top,
                        left: item.left,
                        transform: parallaxEnabled 
                            ? `translate3d(calc(var(--off-x) * ${item.parallaxFactor} * 1px), calc(var(--off-y) * ${item.parallaxFactor} * 1px), 0)`
                            : 'translate3d(0,0,0)',
                        backfaceVisibility: 'hidden'
                    }}
                >
                    <div 
                        className={`flex items-center justify-center ${
                        themeId === 'obsidian' ? 'animate-obsidian-float' : 
                        !['forest', 'midnight'].includes(themeId) ? 'animate-float-gentle' : ''
                        }`}
                        style={{
                            width: (item as any).width || `${item.size}rem`,
                            height: (item as any).height || `${item.size}rem`,
                            animationDuration: `${item.duration}s`,
                            animationDelay: `${item.delay}s`,
                            color: (item as any).color || config.colors.accent, 
                            opacity: item.opacity,
                            transform: `rotate(${item.rotation || 0}deg)`,
                            filter: 'none',
                            willChange: 'transform'
                        }}
                    >
                        {item.shape === 'leaf' && (
                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                                <path d="M12 2C12 2 20 8 20 16C20 20.4 16.4 24 12 24C7.6 24 4 20.4 4 16C4 8 12 2 12 2Z" fill="currentColor" />
                            </svg>
                        )}
                        {item.shape === 'star-point' && <div className="w-full h-full rounded-full bg-white" />}
                        {item.shape === 'shooting-star' && <div className="w-[100px] h-[2px] bg-gradient-to-r from-transparent via-indigo-200 to-transparent rotate-[-35deg] opacity-20" />}
                        {item.shape === 'circle' && <div className="w-full h-full rounded-full bg-current" style={{ opacity: themeId === 'midnight' ? 1 : 0.4 }} />}
                        {item.shape === 'ring' && <div className="w-full h-full rounded-full border-[3px] border-current opacity-50" />}
                        {item.shape === 'squircle' && <div className="w-full h-full rounded-[2rem] border-[3px] border-current opacity-40" />}
                        {item.shape === 'square' && <div className="w-full h-full border-[3px] border-current rounded-3xl opacity-50" />}
                        {item.shape === 'triangle' && <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full opacity-40"><path d="M12 2L2 22h20L12 2z" /></svg>}
                        {item.shape === 'plus' && (
                            <div className="w-full h-full relative opacity-50">
                                <div className="absolute top-1/2 left-0 w-full h-[4px] bg-current -translate-y-1/2 rounded-full" />
                                <div className="absolute left-1/2 top-0 h-full w-[4px] bg-current -translate-x-1/2 rounded-full" />
                            </div>
                        )}
                        {item.shape === 'grid' && (
                            <div className="w-full h-full grid grid-cols-3 gap-2 opacity-40 p-1">
                                {[...Array(9)].map((_, k) => <div key={k} className="bg-current rounded-full w-full h-full" />)}
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
      )}

      <div 
        className="absolute inset-0 z-[4] pointer-events-none transition-colors duration-500"
        style={{
            background: config.mode === 'dark' 
                ? 'radial-gradient(circle at center, transparent 20%, rgba(0, 0, 0, 0.4) 100%)' 
                : 'radial-gradient(circle at center, transparent 40%, rgba(255,255,255,0.4) 100%)',
            transform: 'translateZ(0)'
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
  { view: 'daily', targetId: 'trackly-logo', title: 'Welcome to Trackly', description: 'Your command center for academic excellence. This guided tour will show you how to maximize your study efficiency.', icon: LayoutDashboard },
  { view: 'daily', targetId: 'dashboard-subjects', title: 'Track Subjects', description: 'These pods are your daily drivers. Click on Physics, Chemistry, or Maths to log your sessions and track syllabus progress.', icon: Atom },
  { view: 'planner', targetId: 'planner-container', title: 'Strategic Planning', description: 'Use the Planner to schedule tasks for the week or month ahead. Switch views to see your entire month at a glance.', icon: CalendarIcon },
  { view: 'focus', targetId: 'timer-container', title: 'Deep Focus Timer', description: 'Select a specific task from your planner to work on. Enable Brown Noise for isolation and track your flow state.', icon: Timer },
  { view: 'tests', targetId: 'test-log-container', title: 'Test Analysis', description: 'Log your mock test scores here. Record not just your marks, but your temperament and specific mistake patterns.', icon: PenTool },
  { view: 'analytics', targetId: 'analytics-container', title: 'Smart Analytics', description: 'Visualize your syllabus mastery with the new Topic Heatmap. See exactly which chapters are green (mastered) or red (needs work).', icon: BarChart3 },
  { view: 'daily', targetId: 'settings-btn', title: 'Themes & Controls', description: 'Customize your workspace. Switch themes, toggle Parallax Effects and Background Elements, or enable High Performance mode.', icon: Settings }
];

const Sidebar = React.memo(({ 
    view, 
    setView, 
    onOpenSettings, 
    isCollapsed, 
    toggleCollapsed,
    user,
    isGuest,
    onLogin,
    onLogout
}: { 
    view: ViewType, 
    setView: (v: ViewType) => void, 
    onOpenSettings: () => void,
    isCollapsed: boolean,
    toggleCollapsed: () => void,
    user: User | null,
    isGuest: boolean,
    onLogin: () => void,
    onLogout: () => void
}) => {
  return (
    <aside 
        className={`hidden md:flex flex-col h-screen fixed left-0 top-0 z-40 border-r border-slate-200 dark:border-white/5 bg-white/50 dark:bg-slate-950/30 backdrop-blur-xl transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) ${isCollapsed ? 'w-20 items-center' : 'w-64'} overflow-visible transform-gpu`}
        style={{ transform: 'translateZ(0)' }}
    >
      <div className={`h-20 flex items-center relative shrink-0 ${isCollapsed ? 'justify-center px-0 w-full' : 'justify-between px-6'}`}>
        <TracklyLogo collapsed={isCollapsed} id="trackly-logo" />
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

      {/* Auth Status Section */}
      <div className={`px-4 py-2 ${isCollapsed ? 'hidden' : 'block'}`}>
          {user ? (
            <div className="flex items-center gap-3 p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                <ShieldCheck size={16} className="text-emerald-500" />
                <div className="flex-1 overflow-hidden">
                    <p className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 tracking-wider">Sync Active</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 truncate">{user.displayName || 'User'}</p>
                </div>
                <button onClick={onLogout} className="text-slate-400 hover:text-rose-500 transition-colors">
                    <LogOut size={14} />
                </button>
            </div>
          ) : isGuest ? (
            <div className="flex items-center gap-3 p-3 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10">
                <WifiOff size={16} className="text-slate-500" />
                <div className="flex-1 overflow-hidden">
                    <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Offline Mode</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 truncate">Browser Storage</p>
                </div>
                <button onClick={onLogout} className="text-slate-400 hover:text-rose-500 transition-colors">
                    <LogOut size={14} />
                </button>
            </div>
          ) : (
            <button 
                onClick={onLogin}
                className="w-full flex items-center justify-center gap-2 p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
            >
                Sign In to Save
            </button>
          )}
      </div>

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
});

// Optimized slide variants
const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 50 : -50,
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 50 : -50, 
    opacity: 0,
  }),
};

const fadeVariants = {
  enter: { opacity: 0 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0 },
};

const App: React.FC = () => {
  const [view, setView] = useState<ViewType>('daily');
  const [sessions, setSessions] = useState<Session[]>([]);
  const [tests, setTests] = useState<TestResult[]>([]);
  const [targets, setTargets] = useState<Target[]>([]);
  const [goals, setGoals] = useState({ Physics: 30, Chemistry: 30, Maths: 30 });
  const [quoteIdx] = useState(() => Math.floor(Math.random() * QUOTES.length));

  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Settings State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const [theme, setTheme] = useState<ThemeId>('default-dark');
  const [showAurora, setShowAurora] = useState(true);
  
  const [parallaxEnabled, setParallaxEnabled] = useState(true);
  const [showParticles, setShowParticles] = useState(true);
  const [swipeAnimationEnabled, setSwipeAnimationEnabled] = useState(true);
  
  const [swipeStiffness, setSwipeStiffness] = useState(6000); 
  const [swipeDamping, setSwipeDamping] = useState(300);    
  
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isTutorialActive, setIsTutorialActive] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);

  const [touchStart, setTouchStart] = useState<{ x: number, y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number, y: number } | null>(null);
  const [direction, setDirection] = useState(0);
  const minSwipeDistance = 50;

  // 1. Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
          setIsGuest(false);
      }
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Check for existing guest session
  useEffect(() => {
      const storedGuest = localStorage.getItem('trackly_is_guest');
      if (storedGuest === 'true' && !user) {
          setIsGuest(true);
      }
  }, [user]);

  // 2. Data Syncing (Firestore OR LocalStorage)
  useEffect(() => {
    if (user) {
        // --- Firebase Sync ---
        const sessionsQ = query(collection(db, 'users', user.uid, 'sessions'), orderBy('timestamp', 'desc'));
        const unsubSessions = onSnapshot(sessionsQ, (snapshot: QuerySnapshot<DocumentData>) => {
            setSessions(snapshot.docs.map(d => d.data() as Session));
        });

        const testsQ = query(collection(db, 'users', user.uid, 'tests'), orderBy('timestamp', 'desc'));
        const unsubTests = onSnapshot(testsQ, (snapshot: QuerySnapshot<DocumentData>) => {
            setTests(snapshot.docs.map(d => d.data() as TestResult));
        });

        const targetsQ = query(collection(db, 'users', user.uid, 'targets'), orderBy('timestamp', 'desc'));
        const unsubTargets = onSnapshot(targetsQ, (snapshot: QuerySnapshot<DocumentData>) => {
            setTargets(snapshot.docs.map(d => d.data() as Target));
        });

        return () => {
            unsubSessions();
            unsubTests();
            unsubTargets();
        }
    } else if (isGuest) {
        // --- LocalStorage Sync (Guest Mode) ---
        setSessions(safeJSONParse('trackly_guest_sessions', []));
        setTests(safeJSONParse('trackly_guest_tests', []));
        setTargets(safeJSONParse('trackly_guest_targets', []));
        setGoals(safeJSONParse('trackly_guest_goals', { Physics: 30, Chemistry: 30, Maths: 30 }));
    } else {
        // Reset if logged out
        setSessions([]); 
        setTests([]);
        setTargets([]);
    }
  }, [user, isGuest]);

  // Persist Goals to LS if Guest
  useEffect(() => {
    if(isGuest) {
        localStorage.setItem('trackly_guest_goals', JSON.stringify(goals));
    }
  }, [goals, isGuest]);

  // Load Settings from LocalStorage
  useEffect(() => {
    setAnimationsEnabled(safeJSONParse('zenith_animations', true));
    const savedTheme = localStorage.getItem('zenith_theme_id');
    if (savedTheme && THEME_CONFIG[savedTheme as ThemeId]) setTheme(savedTheme as ThemeId);
    setSidebarCollapsed(safeJSONParse('zenith_sidebar_collapsed', false));
    setShowAurora(safeJSONParse('zenith_aurora', true));
    setParallaxEnabled(safeJSONParse('zenith_parallax', true));
    setShowParticles(safeJSONParse('zenith_particles', true));
    setSwipeAnimationEnabled(safeJSONParse('zenith_swipe_animation', true));
    setSwipeStiffness(Number(safeJSONParse('zenith_swipe_stiffness', 6000)));
    setSwipeDamping(Number(safeJSONParse('zenith_swipe_damping', 300)));
  }, []);

  // Persist Settings
  useEffect(() => {
    localStorage.setItem('zenith_animations', JSON.stringify(animationsEnabled));
    if (!animationsEnabled) document.body.classList.add('disable-animations');
    else document.body.classList.remove('disable-animations');
  }, [animationsEnabled]);

  useEffect(() => { localStorage.setItem('zenith_theme_id', theme); }, [theme]);
  useEffect(() => { localStorage.setItem('zenith_aurora', JSON.stringify(showAurora)); }, [showAurora]);
  useEffect(() => { localStorage.setItem('zenith_parallax', JSON.stringify(parallaxEnabled)); }, [parallaxEnabled]);
  useEffect(() => { localStorage.setItem('zenith_particles', JSON.stringify(showParticles)); }, [showParticles]);
  useEffect(() => { localStorage.setItem('zenith_swipe_animation', JSON.stringify(swipeAnimationEnabled)); }, [swipeAnimationEnabled]);
  useEffect(() => { localStorage.setItem('zenith_swipe_stiffness', String(swipeStiffness)); }, [swipeStiffness]);
  useEffect(() => { localStorage.setItem('zenith_swipe_damping', String(swipeDamping)); }, [swipeDamping]);

  const toggleSidebar = useCallback(() => {
      setSidebarCollapsed(prev => {
          const next = !prev;
          localStorage.setItem('zenith_sidebar_collapsed', JSON.stringify(next));
          return next;
      });
  }, []);

  const handleLogin = async () => {
    try {
        await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
        console.error("Login failed", error);
        
        let errorMessage = "Failed to sign in.";
        if (error.code === 'auth/unauthorized-domain') {
            errorMessage = `Domain Error:\n\nThe IP "${window.location.hostname}" is not whitelisted.\n\n1. Go to Firebase Console -> Auth -> Settings -> Authorized Domains\n2. Add: ${window.location.hostname}`;
        } else if (error.code === 'auth/popup-blocked') {
            errorMessage = "Popup Blocked. Please allow popups for this site.";
        } else if (error.code === 'auth/popup-closed-by-user') {
            return; // Ignore
        } else {
            errorMessage = `Login Failed: ${error.message}`;
        }
        alert(errorMessage);
    }
  };

  const handleGuestLogin = () => {
      setIsGuest(true);
      localStorage.setItem('trackly_is_guest', 'true');
  };

  const handleLogout = () => {
      if (user) {
          signOut(auth);
      } else {
          setIsGuest(false);
          localStorage.removeItem('trackly_is_guest');
      }
  };

  // 3. Database Operations (Universal: Works for Firebase AND Guest)
  const handleSaveSession = useCallback(async (newSession: Omit<Session, 'id' | 'timestamp'>) => {
    const id = generateUUID();
    const timestamp = Date.now();
    const session: Session = { ...newSession, id, timestamp };

    if (user) {
        await setDoc(doc(db, 'users', user.uid, 'sessions', id), session);
    } else if (isGuest) {
        const updated = [session, ...sessions];
        setSessions(updated);
        localStorage.setItem('trackly_guest_sessions', JSON.stringify(updated));
    }
  }, [user, isGuest, sessions]);

  const handleDeleteSession = useCallback(async (id: string) => {
    if (user) {
        await deleteDoc(doc(db, 'users', user.uid, 'sessions', id));
    } else if (isGuest) {
        const updated = sessions.filter(s => s.id !== id);
        setSessions(updated);
        localStorage.setItem('trackly_guest_sessions', JSON.stringify(updated));
    }
  }, [user, isGuest, sessions]);

  const handleSaveTest = useCallback(async (newTest: Omit<TestResult, 'id' | 'timestamp'>) => {
    const id = generateUUID();
    const timestamp = Date.now();
    const test: TestResult = { ...newTest, id, timestamp };

    if (user) {
        await setDoc(doc(db, 'users', user.uid, 'tests', id), test);
    } else if (isGuest) {
        const updated = [test, ...tests];
        setTests(updated);
        localStorage.setItem('trackly_guest_tests', JSON.stringify(updated));
    }
  }, [user, isGuest, tests]);

  const handleDeleteTest = useCallback(async (id: string) => {
    if (user) {
        await deleteDoc(doc(db, 'users', user.uid, 'tests', id));
    } else if (isGuest) {
        const updated = tests.filter(t => t.id !== id);
        setTests(updated);
        localStorage.setItem('trackly_guest_tests', JSON.stringify(updated));
    }
  }, [user, isGuest, tests]);

  const handleSaveTarget = useCallback(async (target: Target) => {
    if (user) {
        await setDoc(doc(db, 'users', user.uid, 'targets', target.id), target);
    } else if (isGuest) {
        const updated = [...targets, target];
        setTargets(updated);
        localStorage.setItem('trackly_guest_targets', JSON.stringify(updated));
    }
  }, [user, isGuest, targets]);

  const handleUpdateTarget = useCallback(async (id: string, completed: boolean) => {
    if (user) {
        const target = targets.find(t => t.id === id);
        if (target) {
            await setDoc(doc(db, 'users', user.uid, 'targets', id), { ...target, completed });
        }
    } else if (isGuest) {
        const updated = targets.map(t => t.id === id ? { ...t, completed } : t);
        setTargets(updated);
        localStorage.setItem('trackly_guest_targets', JSON.stringify(updated));
    }
  }, [user, isGuest, targets]);

  const handleDeleteTarget = useCallback(async (id: string) => {
    if (user) {
        await deleteDoc(doc(db, 'users', user.uid, 'targets', id));
    } else if (isGuest) {
        const updated = targets.filter(t => t.id !== id);
        setTargets(updated);
        localStorage.setItem('trackly_guest_targets', JSON.stringify(updated));
    }
  }, [user, isGuest, targets]);

  const changeView = useCallback((newView: ViewType) => {
     if (view === newView) return;
     const currentIdx = TABS.findIndex(t => t.id === view);
     const newIdx = TABS.findIndex(t => t.id === newView);
     setDirection(newIdx > currentIdx ? 1 : -1);
     setView(newView);
     window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [view]);

  const startTutorial = () => {
    setIsTutorialActive(true);
    setTutorialStep(0);
    setView('daily'); 
  };

  const nextTutorialStep = () => {
    const nextStep = tutorialStep + 1;
    if (nextStep >= TOUR_STEPS.length) {
      setIsTutorialActive(false);
      setTutorialStep(0);
      setView('daily');
    } else {
      setTutorialStep(nextStep);
      if (TOUR_STEPS[nextStep].view) {
        setView(TOUR_STEPS[nextStep].view as ViewType);
      }
    }
  };

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null); 
    setTouchStart({ x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY });
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd({ x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY });
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const xDistance = touchStart.x - touchEnd.x;
    const yDistance = touchStart.y - touchEnd.y;
    if (Math.abs(yDistance) > Math.abs(xDistance)) return;

    const isLeftSwipe = xDistance > minSwipeDistance;
    const isRightSwipe = xDistance < -minSwipeDistance;

    if (isLeftSwipe || isRightSwipe) {
      const currentIndex = TABS.findIndex(t => t.id === view);
      if (isLeftSwipe && currentIndex < TABS.length - 1) changeView(TABS[currentIndex + 1].id as ViewType);
      if (isRightSwipe && currentIndex > 0) changeView(TABS[currentIndex - 1].id as ViewType);
    }
    setTouchStart(null);
    setTouchEnd(null);
  }

  const themeConfig = THEME_CONFIG[theme];
  const effectiveShowAurora = animationsEnabled && showAurora;
  const effectiveParallax = animationsEnabled && parallaxEnabled;
  const effectiveShowParticles = animationsEnabled && showParticles;
  const effectiveSwipe = swipeAnimationEnabled; 

  const dynamicStyles = useMemo(() => `
        :root {
          --theme-accent: ${themeConfig.colors.accent};
          --theme-accent-glow: ${themeConfig.colors.accentGlow};
          --theme-card-bg: ${themeConfig.colors.card};
          --theme-text-main: ${themeConfig.colors.text};
          --theme-text-sub: ${themeConfig.mode === 'dark' ? 'rgba(255,255,255,0.5)' : '#334155'};
        }
        /* [Dynamic Styles Omitted for brevity, assume standard] */
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

        .text-slate-900, .text-gray-900, .text-zinc-900, .text-neutral-900 {
            color: var(--theme-text-main) !important;
        }
        .text-slate-500, .text-gray-500, .text-zinc-500, .text-neutral-500 {
            color: var(--theme-text-sub) !important;
        }
        ${themeConfig.mode === 'light' ? `
            .text-slate-300 { color: #94a3b8 !important; } 
            .text-slate-400, .text-gray-400 { color: #475569 !important; }
            .text-slate-600 { color: #1e293b !important; } 
            .placeholder\\:text-slate-400::placeholder { color: #64748b !important; }
        ` : ''}

        .bg-white\\/60, .bg-white\\/70, .bg-white\\/80, .bg-white\\/50 {
             background-color: ${themeConfig.mode === 'light' ? 'rgba(255,255,255,0.95)' : themeConfig.colors.card + '99'} !important;
             border-color: ${themeConfig.mode === 'light' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.1)'} !important;
             box-shadow: ${themeConfig.mode === 'light' ? '0 8px 16px -4px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02)' : 'none'} !important;
        }
        
        .dark .bg-slate-900\\/40, .dark .bg-slate-900\\/50, .dark .bg-slate-900\\/60, .dark .bg-slate-900\\/80 {
            background-color: ${themeConfig.colors.card}99 !important;
        }

        .from-indigo-400, .from-indigo-500, .from-indigo-600 { --tw-gradient-from: var(--theme-accent) !important; }
        .to-indigo-400, .to-indigo-500, .to-indigo-600 { --tw-gradient-to: var(--theme-accent) !important; }

        input, select, textarea {
            background-color: ${themeConfig.mode === 'dark' ? 'rgba(0,0,0,0.2)' : '#ffffff'} !important;
            border-color: ${themeConfig.mode === 'dark' ? 'rgba(255,255,255,0.1)' : '#cbd5e1'} !important;
            color: ${themeConfig.colors.text} !important;
        }
        input:focus, select:focus, textarea:focus {
            border-color: var(--theme-accent) !important;
            box-shadow: 0 0 0 1px var(--theme-accent) !important;
        }

        .bg-black\\/20, .dark .bg-black\\/20 {
            background-color: ${themeConfig.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'} !important;
        }

        .dark .dark\\:bg-indigo-600 { background-color: var(--theme-accent) !important; }
        .dark .dark\\:text-white { color: #ffffff !important; }
        
        ::-webkit-scrollbar-thumb {
            background-color: ${themeConfig.colors.accent}66 !important;
            border-radius: 10px;
        }
        ::-webkit-scrollbar-track { background: transparent; }

        ::selection {
          background-color: ${themeConfig.colors.accent}4d; 
          color: white;
        }

        @keyframes obsidian-float {
            0%, 100% { transform: translate3d(0,0,0) rotate(0deg); }
            50% { transform: translate3d(0, -15px, 0) rotate(2deg); }
        }
        .animate-obsidian-float {
             animation: obsidian-float 8s ease-in-out infinite;
        }
  `, [themeConfig]);

  if (isAuthLoading) {
    return (
        <div className={`min-h-screen flex items-center justify-center ${themeConfig.mode === 'dark' ? 'bg-[#020617]' : 'bg-slate-50'}`}>
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                <span className="text-sm font-bold uppercase tracking-widest text-slate-500">Syncing Data...</span>
            </div>
        </div>
    );
  }

  // Not Logged In View
  if (!user && !isGuest) {
    return (
        <div className={`min-h-screen font-sans flex flex-col relative overflow-hidden transition-colors duration-500 ${themeConfig.mode === 'dark' ? 'dark text-slate-100' : 'text-slate-900'}`}>
             <style>{dynamicStyles}</style>
             <AnimatedBackground 
                themeId={theme} 
                showAurora={effectiveShowAurora}
                parallaxEnabled={effectiveParallax}
                showParticles={effectiveShowParticles}
                highPerformanceMode={!animationsEnabled}
             />
             <div className="flex-1 flex flex-col items-center justify-center relative z-10 p-6">
                <TracklyLogo id="login-logo" />
                <div className="mt-8 bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl p-8 rounded-3xl border border-slate-200 dark:border-white/10 text-center max-w-sm w-full shadow-2xl">
                    <h2 className="text-2xl font-bold mb-3 text-slate-900 dark:text-white">Welcome Back</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
                        Sign in to sync your progress, sessions, and test scores across all your devices.
                    </p>
                    <button 
                        onClick={handleLogin}
                        className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold uppercase tracking-widest shadow-lg shadow-indigo-600/20 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3 mb-4"
                    >
                        <span>Sign In with Google</span>
                        <ArrowRightIcon />
                    </button>
                    
                    <button 
                        onClick={handleGuestLogin}
                        className="w-full py-3 bg-white/10 hover:bg-white/20 text-slate-600 dark:text-slate-300 rounded-2xl font-bold uppercase tracking-widest border border-slate-200 dark:border-white/10 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                    >
                        <span>Continue Offline</span>
                    </button>

                    <p className="mt-6 text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                        Secure • Cloud Synced • Fast
                    </p>
                </div>
             </div>
        </div>
    );
  }

  return (
    <div 
        className={`min-h-screen font-sans overflow-x-hidden relative flex flex-col transition-colors duration-500 ${themeConfig.mode === 'dark' ? 'dark text-slate-100' : 'text-slate-900'}`}
    >
      <style>{dynamicStyles}</style>

      <AnimatedBackground 
        themeId={theme} 
        showAurora={effectiveShowAurora}
        parallaxEnabled={effectiveParallax}
        showParticles={effectiveShowParticles}
        highPerformanceMode={!animationsEnabled}
      />
      
      <Sidebar 
          view={view} 
          setView={changeView} 
          onOpenSettings={() => setIsSettingsOpen(true)} 
          isCollapsed={sidebarCollapsed}
          toggleCollapsed={toggleSidebar}
          user={user}
          isGuest={isGuest}
          onLogin={handleLogin}
          onLogout={handleLogout}
      />

      {/* Mobile Header */}
      <div className="md:hidden relative z-10 p-6 flex justify-between items-center">
        <TracklyLogo id="trackly-logo-mobile" />
        <button onClick={() => setIsSettingsOpen(true)} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
          <Settings size={24} className="text-slate-600 dark:text-slate-300" />
        </button>
      </div>

      <main 
          className={`relative z-10 flex-grow p-4 md:p-10 pb-24 md:pb-10 w-full md:w-auto transition-all duration-500 ease-in-out overflow-x-hidden ${sidebarCollapsed ? 'md:ml-20' : 'md:ml-64'}`}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
      >
        <div className="max-w-7xl mx-auto w-full relative">
           <AnimatePresence initial={false} mode='wait' custom={direction}>
             <motion.div
                key={view}
                custom={direction}
                variants={effectiveSwipe ? slideVariants : fadeVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={effectiveSwipe ? (
                  animationsEnabled ? {
                    x: { type: "spring", stiffness: swipeStiffness, damping: swipeDamping, mass: 0.8 },
                    opacity: { duration: 0.15 }
                  } : {
                    x: { type: "tween", ease: "circOut", duration: 0.2 },
                    opacity: { duration: 0.2 }
                  }
                ) : { duration: animationsEnabled ? 0.2 : 0 }}
                className="w-full"
             >
                <Suspense fallback={
                    <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400">
                        <Loader2 className="w-10 h-10 animate-spin mb-4 text-indigo-500" />
                        <span className="text-xs font-bold uppercase tracking-widest">Loading View...</span>
                    </div>
                }>
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
                </Suspense>
             </motion.div>
           </AnimatePresence>
        </div>
      </main>

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
                    onClick={() => changeView(tab.id as ViewType)}
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

      {isTutorialActive && (
        <TutorialOverlay 
          steps={TOUR_STEPS}
          currentStep={tutorialStep}
          onNext={nextTutorialStep}
          onClose={() => setIsTutorialActive(false)}
        />
      )}

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        animationsEnabled={animationsEnabled}
        toggleAnimations={() => setAnimationsEnabled(!animationsEnabled)}
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
      />
    </div>
  );
};

// Simple Arrow Icon for Login Button
const ArrowRightIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

export default App;