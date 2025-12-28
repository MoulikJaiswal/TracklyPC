import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Settings2, 
  X, 
  Zap,
  Atom,
  Calculator,
  Waves,
  CheckCircle2,
  ListTodo,
  ChevronDown,
  Brain,
  Coffee,
  Armchair
} from 'lucide-react';
import { JEE_SYLLABUS } from '../constants';
import { Target } from '../types';

interface FocusTimerProps {
  targets?: Target[];
}

type TimerMode = 'focus' | 'short' | 'long';

// Helper for local date string YYYY-MM-DD
const getLocalDate = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const FocusTimer: React.FC<FocusTimerProps> = ({ targets = [] }) => {
  const [mode, setMode] = useState<TimerMode>('focus');
  const [selectedSubject, setSelectedSubject] = useState<keyof typeof JEE_SYLLABUS>('Physics');
  
  // Durations in minutes
  const [durations, setDurations] = useState({ focus: 25, short: 5, long: 15 });
  
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [selectedTask, setSelectedTask] = useState<string>('');
  
  const [todayStats, setTodayStats] = useState({ Physics: 0, Chemistry: 0, Maths: 0 });
  
  // Refs for accurate timing
  const timerRef = useRef<any>(null);
  const endTimeRef = useRef<number>(0);
  
  // Audio Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const brownNoiseNodeRef = useRef<ScriptProcessorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  useEffect(() => {
    const today = getLocalDate();
    const savedStats = localStorage.getItem(`zenith_stats_${today}`);
    if (savedStats) setTodayStats(JSON.parse(savedStats));
  }, []);

  useEffect(() => {
    const today = getLocalDate();
    localStorage.setItem(`zenith_stats_${today}`, JSON.stringify(todayStats));
  }, [todayStats]);

  const toggleAudio = () => {
    const shouldEnable = !soundEnabled;
    setSoundEnabled(shouldEnable);

    if (shouldEnable) {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx?.state === 'suspended') ctx.resume();
      
      // Create Brown Noise buffer
      const bufferSize = 4096;
      const brownNoise = ctx!.createScriptProcessor(bufferSize, 1, 1);
      brownNoise.onaudioprocess = (e) => {
        const output = e.outputBuffer.getChannelData(0);
        let lastOut = 0;
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            output[i] = (lastOut + (0.02 * white)) / 1.02;
            lastOut = output[i];
            output[i] *= 3.5;
        }
      };

      const gainNode = ctx!.createGain();
      gainNode.gain.value = 0.05;
      
      brownNoise.connect(gainNode);
      gainNode.connect(ctx!.destination);
      
      brownNoiseNodeRef.current = brownNoise;
      gainNodeRef.current = gainNode;
    } else {
      brownNoiseNodeRef.current?.disconnect();
      gainNodeRef.current?.disconnect();
    }
  };

  const startTimer = () => {
    setIsActive(true);
    // Set target end time based on current timeLeft
    endTimeRef.current = Date.now() + timeLeft * 1000;
  };

  const pauseTimer = () => {
    setIsActive(false);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  };

  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        const now = Date.now();
        const diff = Math.ceil((endTimeRef.current - now) / 1000);
        
        if (diff <= 0) {
          setTimeLeft(0);
          setIsActive(false);
          clearInterval(timerRef.current);
          if (soundEnabled) toggleAudio();
          // Here we could add a completion sound
        } else {
          setTimeLeft(diff);
          // Track stats only in focus mode
          if (mode === 'focus') {
             setTodayStats(prev => ({ ...prev, [selectedSubject]: prev[selectedSubject] + 1 }));
          }
        }
      }, 1000);
    }
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, mode, selectedSubject, soundEnabled]);

  const switchMode = (newMode: TimerMode) => {
    setMode(newMode);
    setIsActive(false);
    setTimeLeft(durations[newMode] * 60);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(durations[mode] * 60);
    if (soundEnabled) toggleAudio();
  };

  const updateDuration = (newDuration: number, modeKey: TimerMode) => {
      setDurations(prev => ({ ...prev, [modeKey]: newDuration }));
      if (mode === modeKey && !isActive) {
          setTimeLeft(newDuration * 60);
      }
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return h > 0 
      ? `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
      : `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const subjects = useMemo(() => [
    { id: 'Physics', icon: Atom, color: 'text-cyan-600 dark:text-cyan-400', border: 'border-cyan-500/50', shadow: 'shadow-cyan-500/20', bg: 'bg-cyan-600', gradient: 'from-cyan-600 to-blue-600' },
    { id: 'Chemistry', icon: Zap, color: 'text-amber-500 dark:text-amber-400', border: 'border-amber-500/50', shadow: 'shadow-amber-500/20', bg: 'bg-amber-500', gradient: 'from-amber-500 to-orange-600' },
    { id: 'Maths', icon: Calculator, color: 'text-rose-500 dark:text-rose-400', border: 'border-rose-500/50', shadow: 'shadow-rose-500/20', bg: 'bg-rose-500', gradient: 'from-rose-500 to-pink-600' },
  ], []);

  const currentSubject = subjects.find(s => s.id === selectedSubject)!;
  const activeTaskObj = targets.find(t => t.id === selectedTask);
  const pendingTasks = targets.filter(t => !t.completed);

  // Theme configuration based on Mode
  const getTheme = () => {
    if (mode === 'focus') {
        return {
            gradient: currentSubject.gradient,
            color: currentSubject.color,
            bg: currentSubject.bg,
            shadow: currentSubject.shadow,
            stops: [
                selectedSubject === 'Physics' ? '#0891b2' : selectedSubject === 'Chemistry' ? '#fbbf24' : '#fb7185', // Darker Cyan for Physics
                selectedSubject === 'Physics' ? '#2563eb' : selectedSubject === 'Chemistry' ? '#f97316' : '#db2777'
            ]
        };
    } else if (mode === 'short') {
        return {
            gradient: 'from-emerald-400 to-teal-500',
            color: 'text-emerald-500 dark:text-emerald-400',
            bg: 'bg-emerald-500',
            shadow: 'shadow-emerald-500/20',
            stops: ['#34d399', '#14b8a6']
        };
    } else {
        // Long Break (Default Theme Color Mode)
        // Uses CSS variables for stops to match the global theme accent
        return {
            gradient: 'from-indigo-500 to-indigo-600',
            color: 'text-indigo-500 dark:text-indigo-400',
            bg: 'bg-indigo-500',
            shadow: 'shadow-indigo-500/20',
            stops: ['var(--theme-accent)', 'var(--theme-accent-glow)']
        };
    }
  };

  const theme = getTheme();

  // SVG Config - Responsive Radius
  const viewBoxSize = 260;
  const radius = 110; 
  const circumference = 2 * Math.PI * radius;
  const progressPercentage = timeLeft / (durations[mode] * 60);
  const strokeDashoffset = circumference * (1 - progressPercentage);

  return (
    <div id="timer-container" className="w-full max-w-xl mx-auto min-h-[600px] flex flex-col items-center justify-center relative animate-in fade-in duration-700">
      
      {/* 1. Top Section: Mode Selector & Context */}
      <div className="w-full flex flex-col items-center gap-6 mb-8 md:mb-10 z-10">
        
        {/* Mode Selector Pill */}
        <div className="p-1 bg-slate-100 dark:bg-white/5 rounded-full flex items-center border border-slate-200 dark:border-white/5 shadow-inner">
            {[
                { id: 'focus', label: 'Focus', icon: Brain },
                { id: 'short', label: 'Short Break', icon: Coffee },
                { id: 'long', label: 'Long Break', icon: Armchair }
            ].map((m) => {
                const isSelected = mode === m.id;
                return (
                    <button
                        key={m.id}
                        onClick={() => switchMode(m.id as TimerMode)}
                        className={`
                            relative flex items-center gap-2 px-4 py-2 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider transition-all duration-300
                            ${isSelected ? 'text-slate-900 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}
                        `}
                    >
                        {isSelected && (
                            <div className="absolute inset-0 bg-white dark:bg-slate-800 rounded-full shadow-sm animate-in zoom-in-95 duration-200" />
                        )}
                        <span className="relative z-10 flex items-center gap-2">
                            <m.icon size={14} className={isSelected && mode !== 'focus' ? theme.color : ''} />
                            <span className="hidden sm:inline">{m.label}</span>
                        </span>
                    </button>
                )
            })}
        </div>

        {/* Subject Tabs - Only visible in Focus Mode */}
        {mode === 'focus' && (
            <div className="max-w-full overflow-x-auto no-scrollbar py-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="p-1.5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-full flex items-center shadow-xl">
                {subjects.map(s => {
                    const isSelected = selectedSubject === s.id;
                    return (
                    <button
                        key={s.id}
                        onClick={() => !isActive && setSelectedSubject(s.id as any)}
                        className={`
                        relative flex items-center gap-2 px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-300 flex-shrink-0
                        ${isSelected ? 'text-white' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}
                        ${isActive && !isSelected ? 'opacity-30 cursor-not-allowed' : ''}
                        `}
                    >
                        {isSelected && (
                        <div className={`absolute inset-0 ${s.bg} rounded-full opacity-100 dark:opacity-20 animate-in zoom-in-90 duration-300`} />
                        )}
                        {isSelected && (
                        <div className={`absolute inset-0 border ${s.border} rounded-full opacity-100 animate-in zoom-in-95 duration-300`} />
                        )}
                        
                        {/* Wrapper to bring content forward */}
                        <div className="relative z-10 flex items-center gap-2">
                            <s.icon size={14} className={isSelected ? 'text-white dark:' + s.color : 'text-slate-400'} />
                            <span className={isSelected ? 'text-white dark:text-current' : ''}>{s.id}</span>
                        </div>
                    </button>
                    )
                })}
                </div>
            </div>
        )}

        {/* Task Dropdown Pill - Only visible in Focus Mode */}
        {mode === 'focus' && (
            <div className="relative group w-64 max-w-[90vw] z-20 animate-in fade-in slide-in-from-top-2 duration-300 delay-100">
                <div className={`absolute inset-0 bg-gradient-to-r ${currentSubject.gradient} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300`} />
                <div className={`
                    flex items-center justify-between px-4 py-3 bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-2xl cursor-pointer transition-all duration-300
                    ${activeTaskObj ? 'border-white/20 bg-white/80 dark:bg-slate-800/80' : 'hover:bg-white/80 dark:hover:bg-slate-800/60'}
                `}>
                    <div className="flex items-center gap-3 overflow-hidden">
                        {activeTaskObj ? (
                            <div className={`p-1 rounded-full ${currentSubject.bg} bg-opacity-20`}>
                                <CheckCircle2 size={12} className={currentSubject.color} />
                            </div>
                        ) : (
                            <ListTodo size={14} className="text-slate-400 dark:text-slate-500 shrink-0" />
                        )}
                        
                        <select 
                            value={selectedTask}
                            onChange={(e) => setSelectedTask(e.target.value)}
                            disabled={isActive}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer text-base"
                        >
                            <option value="">Select a Goal...</option>
                            {pendingTasks.map(t => <option key={t.id} value={t.id}>{t.text}</option>)}
                        </select>

                        <span className={`text-xs font-medium truncate ${activeTaskObj ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>
                            {activeTaskObj ? activeTaskObj.text : 'Select Focus Goal...'}
                        </span>
                    </div>
                    <ChevronDown size={14} className="text-slate-400 dark:text-slate-600" />
                </div>
            </div>
        )}

        {/* Break Message - Visible only in Break Modes */}
        {mode !== 'focus' && (
            <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                 <p className="text-sm font-medium text-slate-600 dark:text-slate-300 italic text-center max-w-xs">
                    {mode === 'short' ? "Take a breath. Stretch your legs. Hydrate." : "Time to recharge completely. Step away from the screen."}
                 </p>
            </div>
        )}
      </div>

      {/* 2. Middle Section: The Timer Ring (Responsive) */}
      <div className="relative mb-12">
        {/* Back glow */}
        <div className={`
          absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[70vw] max-w-[280px] max-h-[280px] rounded-full blur-[80px] transition-all duration-1000
          ${isActive ? `${theme.bg} opacity-20` : 'bg-slate-500 opacity-5'}
        `} />

        {/* Responsive Container */}
        <div className="relative w-[75vw] h-[75vw] max-w-[320px] max-h-[320px] flex items-center justify-center">
            <svg 
                className="w-full h-full transform -rotate-90 drop-shadow-2xl"
                viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
            >
                {/* Defs for gradients */}
                <defs>
                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={theme.stops[0]} />
                        <stop offset="100%" stopColor={theme.stops[1]} />
                    </linearGradient>
                </defs>

                {/* Background Track */}
                <circle 
                    cx="50%" cy="50%" r={radius} 
                    className="stroke-slate-200 dark:stroke-slate-800/50 fill-none" 
                    strokeWidth="4" 
                    style={{ cx: viewBoxSize/2, cy: viewBoxSize/2 }}
                />

                {/* Progress Arc */}
                <circle 
                    cx="50%" cy="50%" r={radius} 
                    stroke="url(#progressGradient)"
                    strokeWidth="6"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-1000 ease-linear"
                    style={{ 
                        cx: viewBoxSize/2, cy: viewBoxSize/2,
                        filter: `drop-shadow(0 0 8px ${theme.stops[0]})`,
                        transition: isActive ? 'stroke-dashoffset 1s linear' : 'stroke-dashoffset 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                />
            </svg>

            {/* Content Inside Ring */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`
                    text-6xl md:text-7xl font-display font-medium tracking-tight tabular-nums transition-colors duration-300 select-none
                    ${isActive ? 'text-slate-900 dark:text-white' : 'text-slate-400'}
                `}>
                    {formatTime(timeLeft)}
                </span>
                
                <div className={`
                    mt-4 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-[0.2em] border transition-all duration-500
                    ${isActive 
                        ? `bg-slate-100 dark:bg-slate-900 border-${theme.color.split('-')[1]}-500/30 ${theme.color}` 
                        : 'bg-transparent border-transparent text-slate-400 dark:text-slate-600'}
                `}>
                    {isActive ? (mode === 'focus' ? 'Flow State' : 'Recharging') : 'Paused'}
                </div>
            </div>
        </div>
      </div>

      {/* 3. Bottom Section: Controls Dock */}
      <div className="flex items-center gap-6 p-2 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border border-slate-200 dark:border-white/5 rounded-[2rem] shadow-2xl transition-all duration-300 hover:bg-white/70 dark:hover:bg-slate-900/70 hover:border-slate-300 dark:hover:border-white/10 hover:shadow-indigo-500/5">
        
        {/* Sound Toggle */}
        <button 
          onClick={toggleAudio}
          className={`
            w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300
            ${soundEnabled ? 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5'}
          `}
          title="Brown Noise"
        >
           <Waves size={18} className={soundEnabled ? 'animate-pulse' : ''} />
        </button>

        {/* Main Play/Pause */}
        <button 
          onClick={() => isActive ? pauseTimer() : startTimer()}
          className={`
            w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg active:scale-95
            ${isActive 
                ? 'bg-slate-100 text-slate-900 hover:bg-white shadow-slate-200 dark:shadow-white/10' 
                : `bg-gradient-to-br ${theme.gradient} text-white shadow-lg`}
          `}
        >
          {isActive ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
        </button>

        {/* Settings Toggle */}
        <div className="relative">
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className={`
                w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300
                ${showSettings ? 'bg-black/5 dark:bg-white/10 text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5'}
            `}
          >
            {showSettings ? <X size={18} /> : <Settings2 size={18} />}
          </button>

          {/* Settings Popup */}
          {showSettings && (
             <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-72 p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl animate-in slide-in-from-bottom-2 fade-in duration-200 z-50">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4 text-center">Timer Configuration</h4>
                
                {/* Focus Duration */}
                <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">Focus</span>
                        <span className="text-xs font-mono font-bold text-indigo-500">{durations.focus}m</span>
                    </div>
                    <input 
                      type="range" min="5" max="90" step="5"
                      value={durations.focus}
                      onChange={(e) => updateDuration(parseInt(e.target.value), 'focus')}
                      className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full appearance-none cursor-pointer accent-indigo-500"
                    />
                </div>

                {/* Short Break Duration */}
                <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">Short Break</span>
                        <span className="text-xs font-mono font-bold text-emerald-500">{durations.short}m</span>
                    </div>
                    <input 
                      type="range" min="1" max="15" step="1"
                      value={durations.short}
                      onChange={(e) => updateDuration(parseInt(e.target.value), 'short')}
                      className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full appearance-none cursor-pointer accent-emerald-500"
                    />
                </div>

                {/* Long Break Duration */}
                <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">Long Break</span>
                        <span className="text-xs font-mono font-bold text-blue-500">{durations.long}m</span>
                    </div>
                    <input 
                      type="range" min="5" max="30" step="5"
                      value={durations.long}
                      onChange={(e) => updateDuration(parseInt(e.target.value), 'long')}
                      className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full appearance-none cursor-pointer accent-blue-500"
                    />
                </div>

                <div className="flex justify-center mt-2 border-t border-slate-100 dark:border-white/5 pt-3">
                     <button onClick={resetTimer} className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-rose-500 dark:text-rose-400 hover:text-rose-600 dark:hover:text-rose-300 transition-colors">
                        <RotateCcw size={10} /> Reset Current
                     </button>
                </div>
             </div>
          )}
        </div>

      </div>

    </div>
  );
};