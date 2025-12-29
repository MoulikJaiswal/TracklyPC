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
    showAurora
}: { 
    themeId: ThemeId,
    showAurora: boolean
}) => {
  const config = THEME_CONFIG[themeId];
  
  const items = useMemo(() => {
    // --- MIDNIGHT QUIET THEME OVERHAUL ---
    if (themeId === 'midnight') {
        const midnightItems: any[] = [];
        
        // 1. Distant Star Field - Optimized count and properties
        // Reduced count slightly for performance, removed expensive box-shadows on distant stars
        for(let i=0; i<35; i++) {
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
                animationDuration: Math.random() * 3 + 3, // Slower animation is cheaper
                isBright // Only bright stars get shadow
            });
        }

        // 2. Shooting Star (Occasional)
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

    // --- FOREST THEME ---
    if (themeId === 'forest') {
        return [
            { id: 1, top: '-10%', left: '-10%', size: 45, shape: 'leaf', depth: 1, rotation: 135, opacity: 0.03 },
            { id: 2, top: '50%', left: '90%', size: 35, shape: 'leaf', depth: 1, rotation: 45, opacity: 0.03 },
            { id: 3, top: '85%', left: '5%', size: 25, shape: 'leaf', depth: 2, rotation: -25, opacity: 0.05 },
            { id: 4, top: '-10%', left: '60%', size: 28, shape: 'leaf', depth: 2, rotation: 160, opacity: 0.05 },
            { id: 5, top: '35%', left: '15%', size: 12, shape: 'leaf', depth: 3, rotation: 15, opacity: 0.08 },
            { id: 6, top: '20%', left: '85%', size: 15, shape: 'leaf', depth: 3, rotation: -10, opacity: 0.08 },
            { id: 7, top: '75%', left: '65%', size: 18, shape: 'leaf', depth: 3, rotation: 80, opacity: 0.08 },
            { id: 8, top: '58%', left: '22%', size: 9, shape: 'leaf', depth: 3, rotation: -45, opacity: 0.09 },
        ].map(item => ({
            ...item,
            parallaxFactor: item.depth * 0.005, 
            duration: 0, 
            delay: 0
        }));
    }

    // --- OBSIDIAN THEME ---
    if (themeId === 'obsidian') {
      return [
        { id: 1, top: '70%', left: '5%', size: 55, shape: 'obsidian-bipyramid', depth: 1, rotation: -15, opacity: 0.02, strokeWidth: 0.3, glow: false },
        { id: 2, top: '-15%', left: '75%', size: 65, shape: 'obsidian-bipyramid', depth: 1, rotation: 165, opacity: 0.02, strokeWidth: 0.3, glow: false },
        { id: 3, top: '45%', left: '88%', size: 22, shape: 'obsidian-bipyramid', depth: 2, rotation: 25, opacity: 0.04, strokeWidth: 0.5, glow: false },
        { id: 4, top: '15%', left: '15%', size: 18, shape: 'obsidian-bipyramid', depth: 2.5, rotation: 45, opacity: 0.05, strokeWidth: 0.5, glow: true },
        { id: 5, top: '25%', left: '60%', size: 12, shape: 'obsidian-bipyramid', depth: 3, rotation: -10, opacity: 0.08, strokeWidth: 0.8, glow: true, fill: true },
        { id: 6, top: '85%', left: '40%', size: 14, shape: 'obsidian-bipyramid', depth: 4, rotation: -35, opacity: 0.07, strokeWidth: 0.8, glow: true },
      ].map(item => ({
        ...item,
        parallaxFactor: item.depth * -0.01,
        duration: 50 + (item.id * 5),
        delay: -(item.id * 10)
      }));
    }

    // --- DEFAULT GEOMETRIC ---
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
        { id: 12, top: '88%', left: '65%', size: 1.5, shape: 'triangle', depth: 3, opacity: 0.15, rotation: -15 },
        { id: 13, top: '12%', left: '35%', size: 1.2, shape: 'plus', depth: 3, opacity: 0.15, rotation: 45 },
        { id: 14, top: '45%', left: '15%', size: 1, shape: 'circle', depth: 3, opacity: 0.1, rotation: 0 },
        { id: 15, top: '70%', left: '80%', size: 1.5, shape: 'grid', depth: 3, opacity: 0.1, rotation: 20 },
        { id: 16, top: '35%', left: '75%', size: 1.8, shape: 'ring', depth: 3, opacity: 0.12, rotation: 0 },
        { id: 17, top: '10%', left: '90%', size: 0.5, shape: 'circle', depth: 3, opacity: 0.2, rotation: 0 },
        { id: 18, top: '90%', left: '5%', size: 0.5, shape: 'circle', depth: 3, opacity: 0.2, rotation: 0 },
    ].map(item => ({
        ...item,
        parallaxFactor: item.depth * 0.08, 
        duration: 40 + (item.id * 2),
        delay: -(item.id * 5)
    }));
  }, [themeId]); 

  return (
    <div 
        className="fixed inset-0 z-0 pointer-events-none overflow-hidden select-none transition-colors duration-700" 
        style={{ 
            backgroundColor: config.colors.bg,
            contain: 'strict',
            transform: 'translateZ(0)' // Force GPU promotion for container
        } as React.CSSProperties}
    >
      
      {/* Layer 5: Static Grain (Global) - Optimized */}
      <div className="absolute inset-0 bg-noise opacity-[0.03] z-[5] pointer-events-none mix-blend-overlay" style={{ transform: 'translateZ(0)' }}></div>

      {/* MIDNIGHT: Layer 1 - Deep Space Gradient */}
      {themeId === 'midnight' && (
        <>
            <div 
                className="absolute inset-0 z-[1]" 
                style={{ 
                    // Pure black at top fading to a very deep subtle blue-grey at bottom for atmosphere
                    background: `linear-gradient(to bottom, #000000 0%, #050505 60%, #0f172a 100%)`, 
                    transform: 'translateZ(0)'
                }} 
            />
            {/* Subtle Horizon Glow - Reduced blur radius for performance */}
            <div 
                className="absolute bottom-[-10%] left-[-10%] right-[-10%] h-[40%] z-[1] opacity-30"
                style={{
                    background: 'radial-gradient(ellipse at center, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
                    filter: 'blur(40px)', // Reduced from 60px
                    transform: 'translateZ(0)'
                }}
            />
        </>
      )}

      {/* Layer 1: Other Theme Backgrounds */}
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

      {/* Aurora (Disabled for Midnight) */}
      {showAurora && !['forest', 'obsidian', 'midnight'].includes(themeId) && (
        <div className="absolute inset-0 z-[1] opacity-50 dark:opacity-20" style={{ filter: 'blur(60px)', transform: 'translateZ(0)' }}>
            <div 
               className="absolute top-[-40%] left-[-10%] w-[70vw] h-[70vw] mix-blend-screen dark:mix-blend-screen will-change-transform"
               style={{ 
                   transform: `translate3d(calc(var(--off-x) * 0.05 * 1px), calc(var(--off-y) * 0.05 * 1px), 0)`,
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
               }} 
            >
                 <div 
                    className="w-full h-full rounded-full animate-aurora-2"
                    style={{ background: `radial-gradient(circle, ${config.colors.accentGlow} 0%, transparent 70%)` }}
                />
            </div>
        </div>
      )}

      {/* Floating Elements / Star Trails */}
      <div className="absolute inset-0 z-[3] overflow-hidden">
        {items.map((item) => (
            <div 
                key={item.id}
                className={`absolute ${typeof item.id === 'number' && item.id % 2 === 0 ? 'hidden md:block' : ''} will-change-transform`}
                style={{
                    top: item.top,
                    left: item.left,
                    // GPU Parallax Transform
                    transform: `translate3d(calc(var(--off-x) * ${item.parallaxFactor} * 1px), calc(var(--off-y) * ${item.parallaxFactor} * 1px), 0)`,
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
                        // Reduce blur filters for better performance, use opacity for depth perception where possible
                        filter: (item as any).blur ? `blur(${(item as any).blur}px)` : 
                                item.shape === 'leaf' ? `blur(${Math.min(item.depth * 1, 3)}px)` : 
                                item.shape.startsWith('obsidian-') ? 'blur(0px)' : 
                                (item.depth === 1 ? 'blur(2px)' : 'blur(0px)'),
                        willChange: 'transform'
                    }}
                >
                    {/* SVG Shapes */}
                    {item.shape === 'leaf' && (
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                            <path d="M12 2C12 2 20 8 20 16C20 20.4 16.4 24 12 24C7.6 24 4 20.4 4 16C4 8 12 2 12 2Z" fill="currentColor" />
                        </svg>
                    )}
                    
                    {item.shape === 'obsidian-bipyramid' && (
                         <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className={`w-full h-full ${(item as any).glow ? 'drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]' : ''}`}>
                             <path d="M12 2 L12 10 M21 12 L12 10 M12 22 L12 10 M3 12 L12 10" strokeWidth="0.2" className="opacity-30" />
                             <path d="M12 2 L21 12 L12 22 L3 12 Z" strokeWidth={(item as any).strokeWidth || 0.5} />
                             <path d="M12 2 L12 14 M21 12 L12 14 M12 22 L12 14 M3 12 L12 14" strokeWidth={(item as any).strokeWidth || 0.5} />
                             {(item as any).fill && <path d="M12 2 L21 12 L12 14 Z M21 12 L12 22 L12 14 Z M12 22 L3 12 L12 14 Z M3 12 L12 2 L12 14 Z" fill="currentColor" fillOpacity="0.03" stroke="none" />}
                         </svg>
                    )}

                    {/* MIDNIGHT: Star Point */}
                    {item.shape === 'star-point' && (
                        <div 
                            className="w-full h-full rounded-full bg-white"
                            style={{
                                // Only apply shadow to bright stars to reduce paint cost
                                boxShadow: (item as any).isBright ? '0 0 4px 1px rgba(255,255,255,0.4)' : 'none'
                            }}
                        />
                    )}

                    {/* MIDNIGHT: Shooting Star */}
                    {item.shape === 'shooting-star' && (
                         <div className="w-[100px] h-[2px] bg-gradient-to-r from-transparent via-indigo-200 to-transparent rotate-[-35deg] opacity-20" />
                    )}

                    {/* Standard Geometric Shapes */}
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
  { view: 'planner', targetId: 'planner-container', title: 'Strategic Planning', description: 'Never miss a revision deadline. Use the Planner to schedule tasks for the week or month ahead.', icon: CalendarIcon },
  { view: 'focus', targetId: 'timer-container', title: 'Deep Focus Timer', description: 'Enter flow state with our Pomodoro-style timer. Enable Brown Noise for isolation and link sessions to specific tasks.', icon: Timer },
  { view: 'tests', targetId: 'test-log-container', title: 'Test Analysis', description: 'Log your mock test scores here. Record not just your marks, but your temperament and specific mistake patterns.', icon: PenTool },
  { view: 'analytics', targetId: 'analytics-container', title: 'Smart Analytics', description: 'Trackly identifies if you are struggling with Concepts, Formulas, or Calculation errors over time.', icon: BarChart3 },
  { view: 'daily', targetId: 'settings-btn', title: 'Themes & Controls', description: 'Open Settings to customize your experience with themes like Obsidian or Forest. You can also toggle Animations here for better performance on older devices.', icon: Settings }
];

const Sidebar = React.memo(({ 
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
});

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
  const [showAurora, setShowAurora] = useState(true);
  
  // UI State
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Tutorial State
  const [isTutorialActive, setIsTutorialActive] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);

  // Ref for global mouse tracking (Performance Optimization)
  const appContainerRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>();

  useEffect(() => {
    if (!animationsEnabled) return;

    const handleMouseMove = (e: MouseEvent) => {
        if (requestRef.current) return;
        requestRef.current = requestAnimationFrame(() => {
            if (appContainerRef.current) {
                const { innerWidth: w, innerHeight: h } = window;
                const x = e.clientX;
                const y = e.clientY;
                // Center origin
                const xOffset = (w / 2 - x);
                const yOffset = (h / 2 - y);

                // Update CSS variables scoped to the app container
                appContainerRef.current.style.setProperty('--mouse-x', `${x}px`);
                appContainerRef.current.style.setProperty('--mouse-y', `${y}px`);
                appContainerRef.current.style.setProperty('--off-x', `${xOffset}`);
                appContainerRef.current.style.setProperty('--off-y', `${yOffset}`);
            }
            requestRef.current = undefined;
        });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [animationsEnabled]);

  // Load Settings
  useEffect(() => {
    const savedAnim = localStorage.getItem('zenith_animations');
    const savedTheme = localStorage.getItem('zenith_theme_id');
    const savedSidebar = localStorage.getItem('zenith_sidebar_collapsed');
    const savedAurora = localStorage.getItem('zenith_aurora');
    
    if (savedAnim !== null) setAnimationsEnabled(JSON.parse(savedAnim));
    if (savedTheme && THEME_CONFIG[savedTheme as ThemeId]) setTheme(savedTheme as ThemeId);
    if (savedSidebar !== null) setSidebarCollapsed(JSON.parse(savedSidebar));
    if (savedAurora !== null) setShowAurora(JSON.parse(savedAurora));
  }, []);

  // Persist & Apply Settings
  useEffect(() => {
    localStorage.setItem('zenith_animations', JSON.stringify(animationsEnabled));
    if (!animationsEnabled) document.body.classList.add('disable-animations');
    else document.body.classList.remove('disable-animations');
  }, [animationsEnabled]);

  useEffect(() => { localStorage.setItem('zenith_theme_id', theme); }, [theme]);
  useEffect(() => { localStorage.setItem('zenith_aurora', JSON.stringify(showAurora)); }, [showAurora]);

  const toggleSidebar = useCallback(() => {
      setSidebarCollapsed(prev => {
          const next = !prev;
          localStorage.setItem('zenith_sidebar_collapsed', JSON.stringify(next));
          return next;
      });
  }, []);

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

  const themeConfig = THEME_CONFIG[theme];

  const dynamicStyles = useMemo(() => `
        :root {
          --theme-accent: ${themeConfig.colors.accent};
          --theme-accent-glow: ${themeConfig.colors.accentGlow};
          --theme-card-bg: ${themeConfig.colors.card};
          --theme-text-main: ${themeConfig.colors.text};
          --theme-text-sub: ${themeConfig.mode === 'dark' ? 'rgba(255,255,255,0.5)' : '#334155'};
        }
        
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

  return (
    <div 
        ref={appContainerRef}
        className={`min-h-screen font-sans overflow-x-hidden relative flex flex-col transition-colors duration-500 ${themeConfig.mode === 'dark' ? 'dark text-slate-100' : 'text-slate-900'}`}
    >
      <style>{dynamicStyles}</style>

      <AnimatedBackground 
        themeId={theme} 
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
        showAurora={showAurora}
        toggleAurora={() => setShowAurora(!showAurora)}
      />
    </div>
  );
};

export default App;