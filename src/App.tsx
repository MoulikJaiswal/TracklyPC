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
  WifiOff,
  ShoppingBag,
  Download,
  Trophy,
  ArrowRight,
  Crown,
  Wifi,
  Menu
} from 'lucide-react';
import { ViewType, Session, TestResult, Target, ThemeId, QuestionLog, MistakeCounts } from './types';
import { QUOTES, THEME_CONFIG } from './constants';
import { SettingsModal } from './components/SettingsModal';
import { TutorialOverlay, TutorialStep } from './components/TutorialOverlay';
import { usePerformanceMonitor } from './hooks/usePerformanceMonitor';
import { PerformanceToast } from './components/PerformanceToast';
import { ProUpgradeModal } from './components/ProUpgradeModal';
import { SmartRecommendationToast } from './components/SmartRecommendationToast';

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
const Resources = lazy(() => import('./components/Resources').then(module => ({ default: module.Resources })));


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

// Helper for local date string YYYY-MM-DD
const getLocalDate = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper to convert Hex to RGB for CSS variables
const hexToRgb = (hex: string) => {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '0, 0, 0';
};

const TracklyLogo = React.memo(({ collapsed = false, id }: { collapsed?: boolean, id?: string }) => {
  return (
    <div id={id} className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'} select-none transition-all duration-300 transform-gpu will-change-transform`}>
      <div className="relative w-8 h-8 flex-shrink-0 text-slate-900 dark:text-white">
          <svg viewBox="0 0 100 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="w-full h-full filter drop-shadow-[0_0_8px_rgba(99,102,241,0.3)]">
             <path d="M10 22.5C10 15.5964 15.5964 10 22.5 10H77.5C84.4036 10 90 15.5964 90 22.5C90 29.4036 84.4036 35 77.5 35H22.5C15.5964 35 10 29.4036 10 22.5Z" />
             <path d="M37.5 42H62.5V77.5C62.5 84.4036 56.9036 90 50 90C43.0964 90 37.5 84.4036 37.5 77.5V42Z" />
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
    graphicsEnabled,
    animationsEnabled,
    customBackground,
    customBackgroundAlign = 'center'
}: { 
    themeId: ThemeId,
    showAurora: boolean,
    parallaxEnabled: boolean,
    showParticles: boolean,
    graphicsEnabled: boolean,
    animationsEnabled: boolean,
    customBackground: string | null,
    customBackgroundAlign?: 'center' | 'top' | 'bottom'
}) => {
  const config = THEME_CONFIG[themeId];
  
  if (!graphicsEnabled) {
      return (
        <div 
            className="fixed inset-0 z-0 pointer-events-none transition-colors duration-300"
            style={{ 
                backgroundColor: config.colors.bg,
                ...(customBackground ? { backgroundImage: `url(${customBackground})`, backgroundSize: 'cover', backgroundPosition: customBackgroundAlign } : {})
            }}
        >
            {!customBackground && (
                <div className="absolute inset-0 opacity-20" style={{ 
                    background: `radial-gradient(circle at 50% 0%, ${config.colors.accent}40, transparent 70%)` 
                }} />
            )}
            {customBackground && <div className="absolute inset-0 bg-black/30" />}
        </div>
      );
  }

  const shouldAnimate = animationsEnabled && showParticles;

  const containerRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!parallaxEnabled || !animationsEnabled) return;

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
  }, [parallaxEnabled, animationsEnabled]);
  
  const items = useMemo(() => {
    if (!shouldAnimate) return [];
    
    if (themeId === 'midnight') {
        const midnightItems: any[] = [];
        for(let i=0; i<15; i++) { 
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
        { id: 5, top: '30%', left: '90%', size: 4, shape: 'triangle', depth: 2, opacity: 0.06, rotation: 160 },
        { id: 6, top: '45%', left: '5%', size: 5, shape: 'grid', depth: 2, opacity: 0.06, rotation: 10 },
        { id: 9, top: '20%', left: '35%', size: 3, shape: 'circle', depth: 2, opacity: 0.05, rotation: 0 },
    ].map(item => ({
        ...item,
        parallaxFactor: item.depth * 0.08, 
        duration: 40 + (item.id * 2),
        delay: -(item.id * 5)
    }));
  }, [themeId, shouldAnimate]); 

  return (
    <div 
        ref={containerRef}
        className="fixed inset-0 z-0 pointer-events-none overflow-hidden select-none transition-colors duration-700 transform-gpu" 
        style={{ 
            backgroundColor: config.colors.bg,
            contain: 'strict',
            '--off-x': 0,
            '--off-y': 0
        } as React.CSSProperties}
    >
      <div className="absolute inset-0 bg-noise opacity-[0.03] z-[5] pointer-events-none mix-blend-overlay transform-gpu"></div>
      {customBackground && (
          <div 
            className="absolute inset-0 z-[0] bg-cover bg-no-repeat transition-opacity duration-700"
            style={{ 
                backgroundImage: `url(${customBackground})`, 
                backgroundPosition: customBackgroundAlign,
                opacity: 1 
            }}
          />
      )}
      {customBackground && <div className="absolute inset-0 z-[0] bg-black/40 dark:bg-black/60" />}
      
      {!customBackground && themeId === 'midnight' && (
        <>
            <div 
                className="absolute inset-0 z-[1] transform-gpu" 
                style={{ 
                    background: `linear-gradient(to bottom, #000000 0%, #050505 60%, #0f172a 100%)`
                }} 
            />
            <div 
                className="absolute bottom-[-10%] left-[-10%] right-[-10%] h-[40%] z-[1] opacity-30 transform-gpu"
                style={{
                    background: 'radial-gradient(ellipse at center, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
                    opacity: 0.2
                }}
            />
        </>
      )}

      {!customBackground && themeId === 'forest' && (
        <div 
            className="absolute inset-0 z-[1] opacity-60 transform-gpu" 
            style={{ 
                background: `radial-gradient(circle at 50% 120%, #3f6212 0%, transparent 60%), radial-gradient(circle at 50% -20%, #1a2e22 0%, transparent 60%)`
            }} 
        />
      )}

      {!customBackground && themeId === 'obsidian' && (
        <div 
            className="absolute inset-0 z-[1] transform-gpu" 
            style={{ 
                background: `
                    radial-gradient(circle at 50% -10%, #0f172a 0%, #020617 45%, #000000 100%),
                    radial-gradient(circle at 85% 25%, rgba(6, 182, 212, 0.05) 0%, transparent 50%),
                    radial-gradient(circle at 15% 75%, rgba(8, 145, 178, 0.05) 0%, transparent 45%)
                `
            }} 
        />
      )}

      {showAurora && !['forest', 'obsidian', 'midnight'].includes(themeId) && !customBackground && (
        <div className="absolute inset-0 z-[1] opacity-50 dark:opacity-20 transform-gpu">
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

      {shouldAnimate && (
        <div className="absolute inset-0 z-[3] overflow-hidden transform-gpu">
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
                        {item.shape === 'triangle' && <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full opacity-40"><path d="M12 2L2 22h20L12 2z" /></svg>}
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
        className="absolute inset-0 z-[4] pointer-events-none transition-colors duration-500 transform-gpu"
        style={{
            background: config.mode === 'dark' 
                ? 'radial-gradient(circle at center, transparent 20%, rgba(0, 0, 0, 0.4) 100%)' 
                : 'radial-gradient(circle at center, transparent 40%, rgba(255,255,255,0.4) 100%)'
        }}
      />
    </div>
  );
});

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
  const [userName, setUserName] = useState<string | null>(null);
  const [guestNameInput, setGuestNameInput] = useState('');

  // Pro State
  const [isPro, setIsPro] = useState(false);
  const [showProModal, setShowProModal] = useState(false);

  // Settings State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const [graphicsEnabled, setGraphicsEnabled] = useState(true);
  const [lagDetectionEnabled, setLagDetectionEnabled] = useState(true);
  const [theme, setTheme] = useState<ThemeId>('default-dark');
  const [showAurora, setShowAurora] = useState(true);
  
  const [parallaxEnabled, setParallaxEnabled] = useState(true);
  const [showParticles, setShowParticles] = useState(true);
  const [swipeAnimationEnabled, setSwipeAnimationEnabled] = useState(true);
  
  const [swipeStiffness, setSwipeStiffness] = useState(6000); 
  const [swipeDamping, setSwipeDamping] = useState(300);    

  // Audio Settings (UI)
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [soundPitch, setSoundPitch] = useState(600);
  const [soundVolume, setSoundVolume] = useState(0.5);
  // Audio Settings (Ambient)
  const [activeSound, setActiveSound] = useState<'off' | 'rain' | 'forest' | 'lofi' | 'cafe'>('off');
  
  // NEW: Custom Background
  const [customBackground, setCustomBackground] = useState<string | null>(null);
  const [customBackgroundEnabled, setCustomBackgroundEnabled] = useState(false);
  const [customBackgroundAlign, setCustomBackgroundAlign] = useState<'center' | 'top' | 'bottom'>('center');

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isTutorialActive, setIsTutorialActive] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);

  const [touchStart, setTouchStart] = useState<{ x: number, y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number, y: number } | null>(null);
  const [direction, setDirection] = useState(0);
  const minSwipeDistance = 50;
  
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showNetworkToast, setShowNetworkToast] = useState(false);

  const [showTestReminder, setShowTestReminder] = useState(false);
  const [reminderMessage, setReminderMessage] = useState('');
  
  const [recommendation, setRecommendation] = useState<{subject: string, topic: string, accuracy: number} | null>(null);
  const [showRecommendation, setShowRecommendation] = useState(false);

  const clickAudioCtxRef = useRef<AudioContext | null>(null);

  // --- PERSISTENT TIMER STATE ---
  const [timerMode, setTimerMode] = useState<'focus' | 'short' | 'long'>('focus');
  const [timerDurations, setTimerDurations] = useState({ focus: 25, short: 5, long: 15 });
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [sessionLogs, setSessionLogs] = useState<QuestionLog[]>([]);
  const [lastLogTime, setLastLogTime] = useState<number>(Date.now()); 
  const [todayStats, setTodayStats] = useState({ Physics: 0, Chemistry: 0, Maths: 0 });

  const timerRef = useRef<any>(null);
  const endTimeRef = useRef<number>(0);
  const brownNoiseCtxRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  const { isLagging, dismiss: dismissLag } = usePerformanceMonitor(graphicsEnabled && lagDetectionEnabled);

  // Helper function to change view
  const changeView = useCallback((newView: ViewType) => {
    setView(newView);
  }, []);

  const activateLiteMode = useCallback(() => {
      setGraphicsEnabled(false);
      setAnimationsEnabled(false);
      dismissLag();
  }, [dismissLag]);

  useEffect(() => {
      const handleOnline = () => {
          setIsOnline(true);
          setShowNetworkToast(true);
          setTimeout(() => setShowNetworkToast(false), 3000);
      };
      const handleOffline = () => {
          setIsOnline(false);
          setShowNetworkToast(true);
          setTimeout(() => setShowNetworkToast(false), 3000);
      };

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
          window.removeEventListener('online', handleOnline);
          window.removeEventListener('offline', handleOffline);
      };
  }, []);

  useEffect(() => {
      const today = getLocalDate();
      const saved = localStorage.getItem(`zenith_stats_${today}`);
      if (saved) setTodayStats(JSON.parse(saved));
  }, []);

  useEffect(() => {
      const today = getLocalDate();
      localStorage.setItem(`zenith_stats_${today}`, JSON.stringify(todayStats));
  }, [todayStats]);

  useEffect(() => {
      if (sessions.length < 5) return; 

      const analyze = () => {
          const subjectTopics = { Physics: new Set<string>(), Chemistry: new Set<string>(), Maths: new Set<string>() };
          const topicStats: Record<string, { subject: string, correct: number, attempted: number }> = {};

          sessions.forEach(s => {
              if (!s.topic) return;
              const subj = s.subject as keyof typeof subjectTopics;
              if (subjectTopics[subj]) {
                  subjectTopics[subj].add(s.topic);
                  
                  const key = `${s.subject}|${s.topic}`;
                  if (!topicStats[key]) topicStats[key] = { subject: s.subject, correct: 0, attempted: 0 };
                  topicStats[key].correct += (s.correct || 0);
                  topicStats[key].attempted += (s.attempted || 0);
              }
          });

          const pCount = subjectTopics.Physics.size;
          const cCount = subjectTopics.Chemistry.size;
          const mCount = subjectTopics.Maths.size;

          if (pCount >= 2 && cCount >= 2 && mCount >= 2) {
              let weakest = null;
              let minAcc = 100; 

              Object.entries(topicStats).forEach(([key, stats]) => {
                  if (stats.attempted < 5) return; 
                  const acc = (stats.correct / stats.attempted) * 100;
                  if (acc < minAcc) {
                      minAcc = acc;
                      weakest = {
                          topic: key.split('|')[1],
                          subject: stats.subject,
                          accuracy: acc
                      };
                  }
              });

              if (weakest) {
                  const lastRec = localStorage.getItem('trackly_last_rec_hash');
                  const currentHash = `${weakest.subject}-${weakest.topic}-${Math.round(weakest.accuracy)}`;
                  if (lastRec !== currentHash) {
                      setRecommendation(weakest);
                      setShowRecommendation(true);
                  }
              }
          }
      };
      
      const timer = setTimeout(analyze, 1500);
      return () => clearTimeout(timer);

  }, [sessions]);

  const handleDismissRecommendation = () => {
      setShowRecommendation(false);
      if (recommendation) {
          const hash = `${recommendation.subject}-${recommendation.topic}-${Math.round(recommendation.accuracy)}`;
          localStorage.setItem('trackly_last_rec_hash', hash);
      }
  };

  const handlePracticeRecommendation = () => {
      handleDismissRecommendation();
      changeView('focus');
  };

  useEffect(() => {
      if (isTimerActive) {
          timerRef.current = setInterval(() => {
              const now = Date.now();
              const diff = Math.ceil((endTimeRef.current - now) / 1000);
              if (diff <= 0) {
                  setTimeLeft(0);
                  setIsTimerActive(false);
                  clearInterval(timerRef.current);
                  if (activeSound !== 'off') setActiveSound('off'); 
              } else {
                  setTimeLeft(diff);
              }
          }, 1000);
      }
      return () => clearInterval(timerRef.current);
  }, [isTimerActive, activeSound]);

  useEffect(() => {
      if (sourceNodeRef.current) {
          try { sourceNodeRef.current.stop(); } catch(e){}
          sourceNodeRef.current.disconnect();
          sourceNodeRef.current = null;
      }
      if (gainNodeRef.current) {
          gainNodeRef.current.disconnect();
          gainNodeRef.current = null;
      }

      if (activeSound !== 'off') {
          if (!brownNoiseCtxRef.current) {
              brownNoiseCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
          }
          const ctx = brownNoiseCtxRef.current;
          if (ctx?.state === 'suspended') ctx.resume();
          
          const bufferSize = ctx!.sampleRate * 2;
          const buffer = ctx!.createBuffer(1, bufferSize, ctx!.sampleRate);
          const data = buffer.getChannelData(0);

          if (activeSound === 'cafe' || activeSound === 'lofi') {
             let lastOut = 0;
             for (let i = 0; i < bufferSize; i++) {
                 const white = Math.random() * 2 - 1;
                 data[i] = (lastOut + (0.02 * white)) / 1.02;
                 lastOut = data[i];
                 data[i] *= 3.5;
                 if (activeSound === 'lofi' && Math.random() > 0.9995) {
                    data[i] += (Math.random() * 0.8); 
                 }
             }
          } else {
             let b0=0, b1=0, b2=0, b3=0, b4=0, b5=0, b6=0;
             for (let i = 0; i < bufferSize; i++) {
                 const white = Math.random() * 2 - 1;
                 b0 = 0.99886 * b0 + white * 0.0555179;
                 b1 = 0.99332 * b1 + white * 0.0750759;
                 b2 = 0.96900 * b2 + white * 0.1538520;
                 b3 = 0.86650 * b3 + white * 0.3104856;
                 b4 = 0.55000 * b4 + white * 0.5329522;
                 b5 = -0.7616 * b5 - white * 0.0168980;
                 data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
                 data[i] *= 0.11;
                 b6 = white * 0.115926;
             }
          }

          const source = ctx!.createBufferSource();
          source.buffer = buffer;
          source.loop = true;
          const gain = ctx!.createGain();
          
          if (activeSound === 'forest') {
               gain.gain.value = 0.08;
               const filter = ctx!.createBiquadFilter();
               filter.type = 'highpass';
               filter.frequency.value = 600;
               source.connect(filter);
               filter.connect(gain);
          } else if (activeSound === 'rain') {
               gain.gain.value = 0.12;
               const filter = ctx!.createBiquadFilter();
               filter.type = 'lowpass';
               filter.frequency.value = 800;
               source.connect(filter);
               filter.connect(gain);
          } else if (activeSound === 'lofi') {
               gain.gain.value = 0.15;
               const filter = ctx!.createBiquadFilter();
               filter.type = 'lowpass';
               filter.frequency.value = 2000;
               source.connect(filter);
               filter.connect(gain);
          } else { 
               gain.gain.value = 0.1;
               source.connect(gain);
          }

          gain.connect(ctx!.destination);
          source.start();
          
          sourceNodeRef.current = source;
          gainNodeRef.current = gain;
      }
  }, [activeSound]);

  const handleTimerToggle = useCallback(() => {
      if (!isTimerActive) {
          setIsTimerActive(true);
          endTimeRef.current = Date.now() + timeLeft * 1000;
          setLastLogTime(Date.now()); 
      } else {
          setIsTimerActive(false);
          clearInterval(timerRef.current);
      }
  }, [isTimerActive, timeLeft]);

  const handleTimerReset = useCallback(() => {
      setIsTimerActive(false);
      setTimeLeft(timerDurations[timerMode] * 60);
      setSessionLogs([]); 
      if (activeSound !== 'off') setActiveSound('off');
  }, [timerMode, timerDurations, activeSound]);

  const handleModeSwitch = useCallback((mode: 'focus'|'short'|'long') => {
      setTimerMode(mode);
      setIsTimerActive(false);
      setTimeLeft(timerDurations[mode] * 60);
  }, [timerDurations]);

  const handleDurationUpdate = useCallback((newDuration: number, modeKey: 'focus'|'short'|'long') => {
      setTimerDurations(prev => ({ ...prev, [modeKey]: newDuration }));
      if (timerMode === modeKey && !isTimerActive) {
          setTimeLeft(newDuration * 60);
      }
  }, [timerMode, isTimerActive]);

  const handleAddLog = useCallback((log: QuestionLog, subject: string) => {
      setSessionLogs(prev => [log, ...prev]);
      setTodayStats(prev => ({ ...prev, [subject]: (prev[subject as keyof typeof prev] || 0) + 1 }));
  }, []);

  // Data Handlers
  const handleSaveSession = (data: Omit<Session, 'id' | 'timestamp'>) => {
    const newSession: Session = {
      id: generateUUID(),
      timestamp: Date.now(),
      ...data
    };
    setSessions(prev => [newSession, ...prev]);
  };

  const handleDeleteSession = (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
  };

  const handleSaveTest = (data: Omit<TestResult, 'id' | 'timestamp'>) => {
    const newTest: TestResult = {
      id: generateUUID(),
      timestamp: Date.now(),
      ...data
    };
    setTests(prev => [...prev, newTest]);
  };

  const handleDeleteTest = (id: string) => {
    setTests(prev => prev.filter(t => t.id !== id));
  };

  const handleAddTarget = (target: Target) => {
    setTargets(prev => [...prev, target]);
  };

  const handleToggleTarget = (id: string, completed: boolean) => {
    setTargets(prev => prev.map(t => t.id === id ? { ...t, completed } : t));
  };

  const handleDeleteTarget = (id: string) => {
    setTargets(prev => prev.filter(t => t.id !== id));
  };

  // UI Handlers
  const toggleSound = () => setSoundEnabled(prev => !prev);
  const toggleAnimations = () => setAnimationsEnabled(prev => !prev);
  const toggleGraphics = () => setGraphicsEnabled(prev => !prev);
  const toggleLagDetection = () => setLagDetectionEnabled(prev => !prev);
  const toggleAurora = () => setShowAurora(prev => !prev);
  const toggleParallax = () => setParallaxEnabled(prev => !prev);
  const toggleParticles = () => setShowParticles(prev => !prev);
  const toggleSwipeAnimation = () => setSwipeAnimationEnabled(prev => !prev);
  const toggleCustomBackground = () => setCustomBackgroundEnabled(prev => !prev);
  const openProModal = () => setShowProModal(true);

  // Dynamic Styles Calculation for Themes
  const themeConfig = THEME_CONFIG[theme];
  const dynamicStyles = useMemo(() => {
    const rgbBg = hexToRgb(themeConfig.colors.bg);
    const rgbCard = hexToRgb(themeConfig.colors.card);
    const rgbAccent = hexToRgb(themeConfig.colors.accent);
    
    // Determine optimal text color for accent backgrounds
    // Themes with light/bright accents (like white, yellow, lime) need dark text.
    // Themes with dark/deep accents (like indigo, blue) need white text.
    const lightAccentThemes: ThemeId[] = ['midnight', 'forest', 'void', 'obsidian', 'earth', 'morning'];
    const onAccentColor = lightAccentThemes.includes(theme) ? '#020617' : '#ffffff';

    return `
        :root {
          --theme-accent: ${themeConfig.colors.accent};
          --theme-accent-rgb: ${rgbAccent};
          --theme-accent-glow: ${themeConfig.colors.accentGlow};
          --theme-card-bg: ${themeConfig.colors.card};
          --theme-card-rgb: ${rgbCard};
          --theme-bg-rgb: ${rgbBg};
          --theme-text-main: ${themeConfig.colors.text};
          --theme-text-sub: ${themeConfig.mode === 'dark' ? 'rgba(255,255,255,0.5)' : '#334155'};
          --theme-on-accent: ${onAccentColor};
        }
        .text-indigo-50, .text-indigo-100, .text-indigo-200, .text-indigo-300, .text-indigo-400, .text-indigo-500, .text-indigo-600, .text-indigo-700, .text-indigo-800, .text-indigo-900 {
            color: var(--theme-accent) !important;
        }
        
        /* Force Text Contrast on Theme Accent Buttons */
        .bg-indigo-400, .bg-indigo-500, .bg-indigo-600, .bg-indigo-700 {
            background-color: var(--theme-accent) !important;
            color: var(--theme-on-accent) !important;
        }
        
        /* Fix internal icons in buttons */
        .bg-indigo-600 svg, .bg-indigo-500 svg {
            color: var(--theme-on-accent) !important;
        }

        .border-indigo-100, .border-indigo-200, .border-indigo-300, .border-indigo-400, .border-indigo-500, .border-indigo-600 {
            border-color: var(--theme-accent) !important;
        }
        /* Override Ring Colors for Focus Rings */
        .ring-indigo-500 {
            --tw-ring-color: var(--theme-accent) !important;
        }
        
        /* Override specific shadow opacities */
        .shadow-indigo-500\\/30, .shadow-indigo-600\\/30 {
            --tw-shadow-color: rgba(var(--theme-accent-rgb), 0.3) !important;
        }
        .shadow-indigo-500\\/20, .shadow-indigo-600\\/20 {
            --tw-shadow-color: rgba(var(--theme-accent-rgb), 0.2) !important;
        }
        
        /* Specific glow for Midnight/Light themes where shadow might be too subtle */
        ${['midnight', 'default-light', 'morning'].includes(theme) ? `
            .shadow-indigo-600\\/20, .shadow-indigo-500\\/20 {
                box-shadow: 0 10px 15px -3px rgba(var(--theme-accent-rgb), 0.3), 0 4px 6px -2px rgba(var(--theme-accent-rgb), 0.1) !important;
            }
        ` : ''}
  `}, [themeConfig, theme]);

  return (
    <div className={`app-container ${theme} min-h-screen text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-500/30 overflow-x-hidden`} style={THEME_CONFIG[theme].mode === 'dark' ? { colorScheme: 'dark' } : { colorScheme: 'light' }}>
      <style>{dynamicStyles}</style>
      
      <AnimatedBackground 
         themeId={theme}
         showAurora={showAurora}
         parallaxEnabled={parallaxEnabled}
         showParticles={showParticles}
         graphicsEnabled={graphicsEnabled}
         animationsEnabled={animationsEnabled}
         customBackground={customBackgroundEnabled ? customBackground : null}
         customBackgroundAlign={customBackgroundAlign}
      />
      
      <div className="relative z-10 flex h-screen overflow-hidden">
        
        {/* Sidebar (Desktop) */}
        <aside className={`
            hidden md:flex flex-col border-r border-slate-200 dark:border-white/5 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl transition-all duration-300 ease-spring
            ${sidebarCollapsed ? 'w-20' : 'w-72'}
        `}>
          <div className="p-6 flex items-center justify-between">
            <TracklyLogo collapsed={sidebarCollapsed} />
            <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 transition-colors">
               {sidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </button>
          </div>
          
          <nav className="flex-1 px-3 space-y-2 overflow-y-auto no-scrollbar py-4">
             {[
               { id: 'daily', label: 'Dashboard', icon: LayoutDashboard },
               { id: 'planner', label: 'Planner', icon: CalendarIcon },
               { id: 'focus', label: 'Focus Timer', icon: Timer },
               { id: 'tests', label: 'Test Log', icon: PenTool },
               { id: 'analytics', label: 'Analytics', icon: BarChart3 },
               { id: 'resources', label: 'Resources', icon: ShoppingBag }
             ].map((item) => (
               <button
                 key={item.id}
                 onClick={() => changeView(item.id as ViewType)}
                 className={`
                   w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden
                   ${view === item.id 
                     ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                     : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'}
                 `}
               >
                 <item.icon size={20} className={`shrink-0 transition-transform duration-300 ${view === item.id ? 'scale-110' : 'group-hover:scale-110'}`} />
                 <span className={`font-bold text-sm tracking-wide transition-all duration-300 ${sidebarCollapsed ? 'opacity-0 w-0 translate-x-4' : 'opacity-100 w-auto translate-x-0'}`}>
                   {item.label}
                 </span>
                 {view === item.id && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white/20 rounded-r-full" />
                 )}
               </button>
             ))}
          </nav>

          <div className="p-4 border-t border-slate-200 dark:border-white/5">
            <button 
                onClick={() => setIsSettingsOpen(true)}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-all`}
            >
                <Settings size={20} className="shrink-0" />
                <span className={`font-bold text-sm tracking-wide transition-all duration-300 ${sidebarCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>Settings</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden relative scroll-smooth" id="main-content">
          
          {/* Mobile Header */}
          <header className="md:hidden sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-white/5 px-4 py-3 flex items-center justify-between">
             <TracklyLogo id="mobile-logo" />
             <div className="flex gap-2">
                 {!isPro && (
                     <button onClick={() => setShowProModal(true)} className="p-2 bg-amber-500/10 text-amber-500 rounded-lg">
                         <Crown size={20} />
                     </button>
                 )}
                 <button onClick={() => setIsSettingsOpen(true)} className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg text-slate-600 dark:text-slate-300 transition-colors">
                    <Settings size={24} />
                 </button>
             </div>
          </header>

          <div className="max-w-7xl mx-auto p-4 md:p-8 lg:p-12 pb-24 md:pb-12 min-h-full flex flex-col">
            <Suspense fallback={
                <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh]">
                    <Loader2 size={40} className="animate-spin text-indigo-500 mb-4" />
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs animate-pulse">Loading Experience...</p>
                </div>
            }>
                <AnimatePresence mode="wait">
                    {view === 'daily' && (
                        <motion.div key="daily" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
                            <Dashboard 
                                sessions={sessions} 
                                targets={targets} 
                                quote={QUOTES[quoteIdx]} 
                                onDelete={handleDeleteSession}
                                goals={goals}
                                setGoals={setGoals}
                                onSaveSession={handleSaveSession}
                                userName={userName}
                            />
                        </motion.div>
                    )}
                    {view === 'planner' && (
                        <motion.div key="planner" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                            <Planner 
                                targets={targets} 
                                onAdd={handleAddTarget} 
                                onToggle={handleToggleTarget} 
                                onDelete={handleDeleteTarget} 
                            />
                        </motion.div>
                    )}
                    {view === 'focus' && (
                        <motion.div key="focus" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.3 }}>
                            <FocusTimer 
                                targets={targets}
                                mode={timerMode}
                                timeLeft={timeLeft}
                                isActive={isTimerActive}
                                durations={timerDurations}
                                activeSound={activeSound}
                                sessionLogs={sessionLogs}
                                lastLogTime={lastLogTime}
                                onToggleTimer={handleTimerToggle}
                                onResetTimer={handleTimerReset}
                                onSwitchMode={handleModeSwitch}
                                onSetSound={setActiveSound}
                                onUpdateDurations={handleDurationUpdate}
                                onAddLog={handleAddLog}
                                onCompleteSession={handleTimerReset}
                                onToggleSound={() => setSoundEnabled(p => !p)}
                                isPro={isPro}
                                sessionCount={sessions.length}
                                onOpenUpgrade={openProModal}
                            />
                        </motion.div>
                    )}
                    {view === 'tests' && (
                        <motion.div key="tests" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
                            <TestLog 
                                tests={tests} 
                                targets={targets}
                                onSave={handleSaveTest} 
                                onDelete={handleDeleteTest}
                                isPro={isPro}
                                onOpenUpgrade={openProModal}
                            />
                        </motion.div>
                    )}
                    {view === 'analytics' && (
                        <motion.div key="analytics" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
                            <Analytics 
                                sessions={sessions} 
                                tests={tests} 
                                isPro={isPro}
                                onOpenUpgrade={openProModal}
                            />
                        </motion.div>
                    )}
                    {view === 'resources' && (
                        <motion.div key="resources" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                            <Resources />
                        </motion.div>
                    )}
                </AnimatePresence>
            </Suspense>
          </div>

          {/* Mobile Navigation Bar */}
          <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-200 dark:border-white/10 px-6 py-2 flex justify-between items-center z-40 safe-area-bottom shadow-2xl">
              {[
                  { id: 'daily', icon: LayoutDashboard },
                  { id: 'planner', icon: CalendarIcon },
                  { id: 'focus', icon: Timer },
                  { id: 'tests', icon: PenTool },
                  { id: 'analytics', icon: BarChart3 }
              ].map((item) => (
                  <button
                      key={item.id}
                      onClick={() => changeView(item.id as ViewType)}
                      className={`
                          p-3 rounded-2xl transition-all duration-300 relative
                          ${view === item.id ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 -translate-y-2 shadow-lg shadow-indigo-500/20' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}
                      `}
                  >
                      <item.icon size={24} strokeWidth={view === item.id ? 2.5 : 2} />
                      {view === item.id && <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-indigo-500" />}
                  </button>
              ))}
          </nav>
        </main>
      </div>

      {/* Modals & Overlays */}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        animationsEnabled={animationsEnabled}
        toggleAnimations={toggleAnimations}
        graphicsEnabled={graphicsEnabled}
        toggleGraphics={toggleGraphics}
        lagDetectionEnabled={lagDetectionEnabled}
        toggleLagDetection={toggleLagDetection}
        theme={theme}
        setTheme={setTheme}
        onStartTutorial={() => setIsTutorialActive(true)}
        showAurora={showAurora}
        toggleAurora={toggleAurora}
        parallaxEnabled={parallaxEnabled}
        toggleParallax={toggleParallax}
        showParticles={showParticles}
        toggleParticles={toggleParticles}
        swipeAnimationEnabled={swipeAnimationEnabled}
        toggleSwipeAnimation={toggleSwipeAnimation}
        swipeStiffness={swipeStiffness}
        setSwipeStiffness={setSwipeStiffness}
        swipeDamping={swipeDamping}
        setSwipeDamping={setSwipeDamping}
        
        soundEnabled={soundEnabled}
        toggleSound={toggleSound}
        soundPitch={soundPitch}
        setSoundPitch={setSoundPitch}
        soundVolume={soundVolume}
        setSoundVolume={setSoundVolume}

        customBackground={customBackground}
        setCustomBackground={setCustomBackground}
        customBackgroundEnabled={customBackgroundEnabled}
        toggleCustomBackground={toggleCustomBackground}
        customBackgroundAlign={customBackgroundAlign}
        setCustomBackgroundAlign={setCustomBackgroundAlign}
        isPro={isPro}
        onOpenUpgrade={openProModal}
      />
      
      <ProUpgradeModal 
        isOpen={showProModal} 
        onClose={() => setShowProModal(false)} 
        onUpgrade={() => { setIsPro(true); setShowProModal(false); }}
      />
      
      {isTutorialActive && (
        <TutorialOverlay 
           steps={[
               { title: "Welcome to Trackly", description: "Your minimal, high-performance study companion for JEE preparation.", view: 'daily', targetId: 'dashboard-subjects', icon: Crown },
               { title: "Plan Your Day", description: "Set daily goals and track your tasks. Mark items as tests to schedule them.", view: 'planner', targetId: 'planner-container', icon: CalendarIcon },
               { title: "Deep Focus", description: "Use the timer to study without distractions. Log questions as you solve them.", view: 'focus', targetId: 'timer-container', icon: Timer },
               { title: "Track Progress", description: "Log your mock test scores and analyze detailed performance metrics.", view: 'tests', targetId: 'test-log-container', icon: PenTool },
               { title: "Analyze Weakness", description: "Visualize your strengths and weak chapters with the Heatmap.", view: 'analytics', targetId: 'analytics-container', icon: BarChart3 }
           ]}
           currentStep={tutorialStep}
           onNext={() => {
               if (tutorialStep < 4) {
                   const views: ViewType[] = ['daily', 'planner', 'focus', 'tests', 'analytics'];
                   changeView(views[tutorialStep + 1]);
                   setTutorialStep(p => p + 1);
               } else {
                   setIsTutorialActive(false);
                   changeView('daily');
                   setTutorialStep(0);
               }
           }}
           onClose={() => { setIsTutorialActive(false); setTutorialStep(0); changeView('daily'); }}
        />
      )}

      <PerformanceToast 
         isVisible={isLagging && !graphicsEnabled} // Only show if lagging AND high graphics are on (wait logic handled in hook)
         onSwitch={activateLiteMode}
         onDismiss={dismissLag}
      />

      <SmartRecommendationToast 
         isVisible={showRecommendation}
         data={recommendation}
         onDismiss={handleDismissRecommendation}
         onPractice={handlePracticeRecommendation}
      />

    </div>
  );
};

export default App;