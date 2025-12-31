import React, { useState, useMemo, memo, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Plus, X, Trash2, Trophy, Clock, Calendar, UploadCloud, FileText, Image as ImageIcon, Atom, Zap, Calculator, BarChart3, AlertCircle, ChevronRight, PieChart, Filter, Target, Download, TrendingUp, TrendingDown } from 'lucide-react';
import { TestResult, Target as TargetType, SubjectBreakdown, MistakeCounts } from '../types';
import { Card } from './Card';
import { MISTAKE_TYPES } from '../constants';

// Helper for local date string YYYY-MM-DD
const getLocalDate = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

interface TestLogProps {
  tests: TestResult[];
  targets?: TargetType[]; 
  onSave: (test: Omit<TestResult, 'id' | 'timestamp'>) => void;
  onDelete: (id: string) => void;
}

const DEFAULT_BREAKDOWN: SubjectBreakdown = {
  correct: 0,
  incorrect: 0,
  unattempted: 0,
  calcErrors: 0,
  otherErrors: 0,
  mistakes: {}
};

// --- PERFORMANCE GRAPH COMPONENT ---
const PerformanceGraph = memo(({ tests }: { tests: TestResult[] }) => {
    // 1. Prepare Data
    const sortedTests = useMemo(() => {
        return [...tests]
            .sort((a, b) => a.date.localeCompare(b.date))
            .map(t => ({
                ...t,
                percentage: Math.round((t.marks / t.total) * 100)
            }));
    }, [tests]);

    if (sortedTests.length < 2) return null;

    // 2. Trend Calculation
    const trend = useMemo(() => {
        const recent = sortedTests.slice(-3); // Last 3 tests
        if (recent.length < 2) return 'neutral';
        const first = recent[0].percentage;
        const last = recent[recent.length - 1].percentage;
        return last > first ? 'up' : last < first ? 'down' : 'neutral';
    }, [sortedTests]);

    // 3. SVG Dimensions
    const height = 200;
    const width = 1000; // Virtual width for coordinate system
    const padding = 20;
    const availableWidth = width - (padding * 2);
    const availableHeight = height - (padding * 2);

    // 4. Generate Points
    const points = sortedTests.map((t, i) => {
        const x = padding + (i / (sortedTests.length - 1)) * availableWidth;
        const y = height - padding - ((t.percentage / 100) * availableHeight);
        return { x, y, data: t };
    });

    // 5. Create Path (Smooth Bezier)
    const generatePath = (points: {x:number, y:number}[]) => {
        if (points.length === 0) return '';
        
        // Move to first point
        let d = `M ${points[0].x} ${points[0].y}`;

        // Loop to create cubic bezier curves
        for (let i = 0; i < points.length - 1; i++) {
            const p0 = points[i];
            const p1 = points[i + 1];
            
            // Control points for smooth curve
            const cp1x = p0.x + (p1.x - p0.x) * 0.5;
            const cp1y = p0.y;
            const cp2x = p0.x + (p1.x - p0.x) * 0.5;
            const cp2y = p1.y;

            d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`;
        }
        return d;
    };

    const linePath = generatePath(points);
    // Close path for area fill
    const areaPath = `${linePath} L ${points[points.length-1].x} ${height} L ${points[0].x} ${height} Z`;

    const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

    return (
        <Card className="p-0 overflow-hidden border-indigo-200 dark:border-indigo-500/30">
            <div className="p-6 border-b border-indigo-100 dark:border-white/5 flex justify-between items-center bg-white/50 dark:bg-black/20">
                <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <TrendingUp className="text-indigo-500" size={20} /> Performance Curve
                    </h3>
                    <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-widest mt-1">
                        Score percentage over time
                    </p>
                </div>
                {trend !== 'neutral' && (
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${
                        trend === 'up' 
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
                            : 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400'
                    }`}>
                        {trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        <span className="text-[10px] font-bold uppercase tracking-wider">
                            {trend === 'up' ? 'Trending Up' : 'Declining'}
                        </span>
                    </div>
                )}
            </div>

            <div className="relative h-64 w-full bg-indigo-50/30 dark:bg-black/40">
                <svg 
                    viewBox={`0 0 ${width} ${height}`} 
                    className="w-full h-full preserve-3d"
                    preserveAspectRatio="none"
                >
                    <defs>
                        <linearGradient id="graphGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="rgb(99, 102, 241)" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="rgb(99, 102, 241)" stopOpacity="0" />
                        </linearGradient>
                    </defs>

                    {/* Grid Lines (Horizontal) - 25%, 50%, 75% */}
                    {[0.25, 0.5, 0.75].map(p => (
                        <line 
                            key={p} 
                            x1="0" 
                            y1={height - padding - (p * availableHeight)} 
                            x2={width} 
                            y2={height - padding - (p * availableHeight)} 
                            stroke="currentColor" 
                            className="text-slate-300 dark:text-white/5" 
                            strokeDasharray="4 4" 
                            strokeWidth="1"
                        />
                    ))}

                    {/* Area Fill */}
                    <path d={areaPath} fill="url(#graphGradient)" />

                    {/* Main Line */}
                    <path 
                        d={linePath} 
                        fill="none" 
                        stroke="rgb(99, 102, 241)" 
                        strokeWidth="3" 
                        strokeLinecap="round"
                        className="drop-shadow-lg"
                    />

                    {/* Data Points */}
                    {points.map((p, i) => (
                        <g 
                            key={i} 
                            onMouseEnter={() => setHoveredPoint(i)}
                            onMouseLeave={() => setHoveredPoint(null)}
                            className="cursor-pointer group"
                        >
                            {/* Invisible hit area for easier hovering */}
                            <circle cx={p.x} cy={p.y} r="20" fill="transparent" />
                            
                            {/* Visible Dot */}
                            <circle 
                                cx={p.x} 
                                cy={p.y} 
                                r={hoveredPoint === i ? 6 : 4} 
                                className={`transition-all duration-300 ${hoveredPoint === i ? 'fill-white stroke-indigo-500' : 'fill-indigo-500 stroke-white dark:stroke-slate-900'}`}
                                strokeWidth="2"
                            />
                        </g>
                    ))}
                </svg>

                {/* Tooltip Overlay */}
                {hoveredPoint !== null && (
                    <div 
                        className="absolute z-10 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-3"
                        style={{ 
                            left: `${(points[hoveredPoint].x / width) * 100}%`, 
                            top: `${(points[hoveredPoint].y / height) * 100}%` 
                        }}
                    >
                        <div className="bg-slate-900 text-white text-xs p-2 rounded-lg shadow-xl flex flex-col items-center min-w-[120px]">
                            <span className="font-bold">{points[hoveredPoint].data.percentage}% Score</span>
                            <span className="text-[9px] opacity-70 uppercase tracking-wider">{points[hoveredPoint].data.date}</span>
                            <span className="text-[9px] text-indigo-300 mt-1 font-mono">{points[hoveredPoint].data.marks}/{points[hoveredPoint].data.total} Marks</span>
                        </div>
                        <div className="w-2 h-2 bg-slate-900 transform rotate-45 mx-auto -mt-1"></div>
                    </div>
                )}
            </div>
        </Card>
    );
});

export const TestLog: React.FC<TestLogProps> = memo(({ tests, targets = [], onSave, onDelete }) => {
  const [isAdding, setIsAdding] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewFile, setPreviewFile] = useState<{ name: string; type: 'image' | 'pdf' } | null>(null);
  const [viewingAttachment, setViewingAttachment] = useState<TestResult | null>(null);
  const [viewingReport, setViewingReport] = useState<TestResult | null>(null);
  const [reportSubject, setReportSubject] = useState<'Physics' | 'Chemistry' | 'Maths' | null>(null);
  const [activeTab, setActiveTab] = useState<'Physics' | 'Chemistry' | 'Maths'>('Physics');
  const [globalQCount, setGlobalQCount] = useState<number>(75); 

  const [formData, setFormData] = useState<Omit<TestResult, 'id' | 'timestamp'>>({
    name: '',
    date: getLocalDate(),
    marks: 0,
    total: 300,
    temperament: 'Calm',
    attachment: undefined,
    attachmentType: undefined,
    fileName: undefined,
    breakdown: {
      Physics: { ...DEFAULT_BREAKDOWN, unattempted: 25 },
      Chemistry: { ...DEFAULT_BREAKDOWN, unattempted: 25 },
      Maths: { ...DEFAULT_BREAKDOWN, unattempted: 25 }
    }
  });

  const handleCalculateMarks = useCallback(() => {
    setFormData(prev => {
        if (!prev.breakdown) return prev;

        const { Physics, Chemistry, Maths } = prev.breakdown;

        const totalCorrect = (Physics.correct || 0) + (Chemistry.correct || 0) + (Maths.correct || 0);
        const totalIncorrect = (Physics.incorrect || 0) + (Chemistry.incorrect || 0) + (Maths.incorrect || 0);

        const calculatedMarks = (totalCorrect * 4) - totalIncorrect;

        return { ...prev, marks: calculatedMarks };
    });
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 800 * 1024) {
      alert("File is too large! Please upload an image/PDF smaller than 800KB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      const type = file.type.includes('pdf') ? 'pdf' : 'image';
      
      setFormData(prev => ({
        ...prev,
        attachment: result,
        attachmentType: type,
        fileName: file.name
      }));
      setPreviewFile({ name: file.name, type });
    };
    reader.readAsDataURL(file);
  };

  const removeAttachment = () => {
    setFormData(prev => ({
      ...prev,
      attachment: undefined,
      attachmentType: undefined,
      fileName: undefined
    }));
    setPreviewFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Detailed Mistake Updater
  const updateMistake = (subject: 'Physics' | 'Chemistry' | 'Maths', type: keyof MistakeCounts, delta: number) => {
    setFormData(prev => {
        const currentBreakdown = prev.breakdown![subject];
        const currentMistakes = currentBreakdown.mistakes || {};
        const totalWrong = currentBreakdown.incorrect;
        
        // Calculate current total mistakes tagged
        const totalTagged = (Object.values(currentMistakes) as number[]).reduce((a, b) => a + (b || 0), 0);
        
        const currentValue = currentMistakes[type] || 0;
        
        // Check constraints
        if (delta < 0 && currentValue <= 0) return prev;
        if (delta > 0 && totalTagged >= totalWrong) return prev;

        const nextValue = Math.max(0, currentValue + delta);
        const newMistakes = { ...currentMistakes, [type]: nextValue };
        
        return {
            ...prev,
            breakdown: {
                ...prev.breakdown!,
                [subject]: {
                    ...currentBreakdown,
                    mistakes: newMistakes,
                    calcErrors: newMistakes.calc || 0,
                    otherErrors: (Object.entries(newMistakes)
                        .filter(([k]) => k !== 'calc')
                        .reduce((acc, [_, v]) => acc + ((v as number) || 0), 0))
                }
            }
        };
    });
  };

  // Logic to handle Universal Total Questions change
  const handleGlobalQuestionChange = (val: number) => {
      setGlobalQCount(val);
      const perSubject = Math.floor(val / 3);
      const remainder = val % 3;

      setFormData(prev => {
          const newBreakdown = { ...prev.breakdown! };
          (['Physics', 'Chemistry', 'Maths'] as const).forEach((sub, idx) => {
              const subTotal = perSubject + (idx < remainder ? 1 : 0);
              const current = newBreakdown[sub];
              const minNeeded = current.correct + current.incorrect;
              const safeTotal = Math.max(minNeeded, subTotal);
              
              newBreakdown[sub] = {
                  ...current,
                  unattempted: safeTotal - current.correct - current.incorrect
              };
          });
          return { ...prev, breakdown: newBreakdown };
      });
  };

  // Logic to handle Total Questions change per subject
  const handleTotalChange = (subject: 'Physics' | 'Chemistry' | 'Maths', newTotal: number) => {
    const currentBreakdown = formData.breakdown![subject];
    const minTotal = currentBreakdown.correct + currentBreakdown.incorrect;
    const validSubjectTotal = Math.max(minTotal, newTotal);
    const newUnattempted = validSubjectTotal - currentBreakdown.correct - currentBreakdown.incorrect;

    let newGlobalTotal = 0;
    (['Physics', 'Chemistry', 'Maths'] as const).forEach(s => {
        if (s === subject) {
            newGlobalTotal += validSubjectTotal;
        } else {
            const b = formData.breakdown![s];
            newGlobalTotal += (b.correct + b.incorrect + b.unattempted);
        }
    });
    setGlobalQCount(newGlobalTotal);

    setFormData(prev => ({
        ...prev,
        breakdown: {
            ...prev.breakdown!,
            [subject]: { ...currentBreakdown, unattempted: newUnattempted }
        }
    }));
  };

  // Logic to handle Correct/Incorrect change
  const handleStatChange = (subject: 'Physics' | 'Chemistry' | 'Maths', field: 'correct' | 'incorrect', newValue: number) => {
    setFormData(prev => {
        const current = prev.breakdown![subject];
        const totalQuestions = current.correct + current.incorrect + current.unattempted;
        
        const otherMainFieldVal = field === 'correct' ? current.incorrect : current.correct;
        const validValue = Math.min(Math.max(0, newValue), totalQuestions - otherMainFieldVal);
        const newUnattempted = totalQuestions - validValue - otherMainFieldVal;

        const updatedSubject = {
            ...current,
            [field]: validValue,
            unattempted: newUnattempted
        };

        if (field === 'incorrect') {
            const newWrong = validValue;
            let currentMistakes = { ...(current.mistakes || {}) };
            let totalTagged = (Object.values(currentMistakes) as number[]).reduce((a, b) => a + (b || 0), 0);
            
            if (totalTagged > newWrong) {
                currentMistakes = {}; 
                updatedSubject.calcErrors = 0;
                updatedSubject.otherErrors = 0;
            }
            updatedSubject.mistakes = currentMistakes;
        }

        return {
            ...prev,
            breakdown: {
                ...prev.breakdown!,
                [subject]: updatedSubject
            }
        };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    onSave(formData);
    setIsAdding(false);
    setPreviewFile(null);
    setFormData({
      name: '',
      date: getLocalDate(),
      marks: 0,
      total: 300,
      temperament: 'Calm',
      attachment: undefined,
      attachmentType: undefined,
      fileName: undefined,
      breakdown: {
        Physics: { ...DEFAULT_BREAKDOWN, unattempted: 25 },
        Chemistry: { ...DEFAULT_BREAKDOWN, unattempted: 25 },
        Maths: { ...DEFAULT_BREAKDOWN, unattempted: 25 }
      }
    });
    setGlobalQCount(75);
  };

  const upcomingTests = useMemo(() => {
      const today = getLocalDate();
      return targets
        .filter(t => t.type === 'test' && t.date >= today && !t.completed)
        .sort((a, b) => a.date.localeCompare(b.date));
  }, [targets]);

  const activeBreakdown = formData.breakdown![activeTab];
  const activeTotalQuestions = activeBreakdown.correct + activeBreakdown.incorrect + activeBreakdown.unattempted;
  const activeMistakes = activeBreakdown.mistakes || {};
  const activeTaggedCount = (Object.values(activeMistakes) as number[]).reduce((a, b) => a + (b || 0), 0);

  return (
    <div id="test-log-container" className="space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Test Log</h2>
          <p className="text-xs text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mt-1 font-bold">Track performance curves</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)} 
          className="group flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 px-5 py-2.5 rounded-2xl text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-indigo-600/20 active:scale-95 transition-all"
        >
          {isAdding ? <X size={16} /> : <Plus size={16} className="group-hover:rotate-90 transition-transform" />}
          {isAdding ? 'Cancel' : 'Log Test'}
        </button>
      </div>

      {/* Add Form */}
      {isAdding && (
        <Card className="bg-slate-900/50 dark:bg-slate-900/50 border border-slate-800 max-w-2xl mx-auto shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Basic Info Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-slate-400 ml-1">Test Name</label>
                <input 
                  type="text" required placeholder="e.g., JEE Mains Mock 12"
                  className="w-full bg-slate-800 border border-slate-700 p-3 rounded-xl text-sm text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 outline-none transition-all placeholder:text-slate-500"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-slate-400 ml-1">Date</label>
                <input 
                  type="date" required
                  className="w-full bg-slate-800 border border-slate-700 p-3 rounded-xl text-sm text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 outline-none transition-all"
                  value={formData.date}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                />
              </div>
              
              <div className="md:col-span-2 grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center h-4 mb-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400 ml-1">Marks</label>
                    <button 
                        type="button" 
                        onClick={handleCalculateMarks}
                        className="flex items-center gap-1 px-2 py-0.5 rounded border border-indigo-500/30 text-indigo-400 text-[9px] font-bold uppercase hover:bg-indigo-500/10 transition-colors"
                    >
                        <Zap size={10} />
                        Auto-Calc
                    </button>
                  </div>
                  <input 
                    type="number" required placeholder="0"
                    className="w-full bg-slate-800 border border-slate-700 p-3 rounded-xl text-sm font-mono font-bold text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 outline-none transition-all"
                    value={formData.marks}
                    onChange={e => setFormData({...formData, marks: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div className="space-y-2">
                   <div className="flex justify-between items-center h-4 mb-1">
                      <label className="text-[10px] uppercase font-bold text-slate-400 ml-1">Total Marks</label>
                   </div>
                  <input 
                    type="number" required placeholder="300"
                    className="w-full bg-slate-800 border border-slate-700 p-3 rounded-xl text-sm font-mono font-bold text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 outline-none transition-all"
                    value={formData.total}
                    onChange={e => setFormData({...formData, total: parseInt(e.target.value) || 300})}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center h-4 mb-1">
                     <label className="text-[10px] uppercase font-bold text-indigo-400 ml-1">Total Qs</label>
                  </div>
                  <input 
                    type="number" placeholder="75"
                    className="w-full bg-indigo-500/10 border border-indigo-500/40 p-3 rounded-xl text-sm font-mono font-bold text-indigo-300 focus:border-indigo-500 outline-none transition-all"
                    value={globalQCount}
                    onChange={e => handleGlobalQuestionChange(parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] uppercase font-bold text-slate-400 ml-1">Temperament</label>
                <div className="grid grid-cols-4 gap-2">
                    {['Calm', 'Anxious', 'Focused', 'Fatigued'].map(t => (
                        <button
                            key={t}
                            type="button"
                            onClick={() => setFormData({...formData, temperament: t as any})}
                            className={`py-2 rounded-lg text-[10px] font-bold uppercase tracking-wide border transition-all ${formData.temperament === t ? 'bg-white text-slate-900 border-white' : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500'}`}
                        >
                            {t}
                        </button>
                    ))}
                </div>
              </div>
            </div>

            {/* Deep Dive Analysis Section */}
            <div className="space-y-4 pt-4 border-t border-indigo-500/20">
               <div className="flex items-center justify-between">
                   <label className="text-xs uppercase font-bold text-indigo-400 tracking-widest flex items-center gap-2">
                      <BarChart3 size={16} /> Question Breakdown
                   </label>
               </div>
               
               <div className="bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden shadow-sm">
                  {/* Subject Tabs */}
                  <div className="flex border-b border-slate-700 bg-slate-900/50">
                     {(['Physics', 'Chemistry', 'Maths'] as const).map(subject => (
                        <button
                           key={subject}
                           type="button"
                           onClick={() => setActiveTab(subject)}
                           className={`flex-1 py-4 text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 relative
                              ${activeTab === subject 
                                 ? 'text-indigo-400 bg-slate-800' 
                                 : 'text-slate-400 hover:text-slate-300'
                              }`}
                        >
                           {activeTab === subject && <div className="absolute top-0 left-0 w-full h-0.5 bg-indigo-500" />}
                           {subject === 'Physics' && <Atom size={14} />}
                           {subject === 'Chemistry' && <Zap size={14} />}
                           {subject === 'Maths' && <Calculator size={14} />}
                           <span className="hidden md:inline">{subject}</span>
                        </button>
                     ))}
                  </div>

                  {/* Input Fields */}
                  <div className="p-6 space-y-6">
                     {/* Total Questions Row */}
                     <div className="flex items-center gap-4 p-3 bg-slate-900/30 rounded-xl border border-slate-700">
                        <div className="p-2 bg-slate-800 rounded-lg text-slate-400">
                            <Target size={18} />
                        </div>
                        <div className="flex-1">
                            <p className="text-[10px] font-bold uppercase text-slate-500">Total {activeTab} Qs</p>
                            <input 
                                type="number" min="0" placeholder="0"
                                className="w-full bg-transparent text-lg font-mono font-bold text-white outline-none"
                                value={activeTotalQuestions || ''}
                                onChange={(e) => handleTotalChange(activeTab, parseInt(e.target.value) || 0)}
                            />
                        </div>
                     </div>

                     <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-1">
                           <label className="text-[9px] uppercase font-bold text-emerald-500 ml-1">Correct</label>
                           <input 
                              type="number" min="0" placeholder="0"
                              className="w-full bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl text-center font-mono font-bold text-emerald-300 focus:border-emerald-500 outline-none transition-all"
                              value={formData.breakdown?.[activeTab].correct || ''}
                              onChange={(e) => handleStatChange(activeTab, 'correct', parseInt(e.target.value) || 0)}
                           />
                        </div>
                        <div className="space-y-1">
                           <label className="text-[9px] uppercase font-bold text-rose-500 ml-1">Wrong</label>
                           <input 
                              type="number" min="0" placeholder="0"
                              className="w-full bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl text-center font-mono font-bold text-rose-300 focus:border-rose-500 outline-none transition-all"
                              value={formData.breakdown?.[activeTab].incorrect || ''}
                              onChange={(e) => handleStatChange(activeTab, 'incorrect', parseInt(e.target.value) || 0)}
                           />
                        </div>
                        <div className="space-y-1 opacity-60">
                           <label className="text-[9px] uppercase font-bold text-slate-400 ml-1">Skipped</label>
                           <input 
                              type="number" 
                              readOnly
                              disabled
                              className="w-full bg-slate-700/50 border border-slate-700 p-3 rounded-xl text-center font-mono font-bold text-slate-400 cursor-not-allowed"
                              value={formData.breakdown?.[activeTab].unattempted || 0}
                           />
                        </div>
                     </div>

                     <div className="p-4 bg-rose-500/10 rounded-xl border border-rose-500/20">
                        <div className="flex justify-between items-center mb-4">
                            <p className="text-[10px] font-bold text-rose-400 uppercase tracking-widest flex items-center gap-2">
                                <AlertCircle size={14} /> Mistake Analysis
                            </p>
                            <span className="text-[9px] px-2 py-1 bg-black/20 rounded text-rose-400 font-mono border border-rose-500/20">
                                {activeTaggedCount} / {formData.breakdown?.[activeTab].incorrect} tagged
                            </span>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {MISTAKE_TYPES.map(type => (
                                <div key={type.id} className="flex items-center justify-between p-2 bg-black/20 rounded-lg border border-white/5 hover:border-rose-500/30 transition-colors">
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <span className={`${type.color} shrink-0 scale-75`}>{type.icon}</span>
                                        <span className="text-[9px] font-bold uppercase text-slate-300 truncate">{type.label}</span>
                                    </div>
                                    <div className="flex items-center gap-1 bg-white/10 rounded p-0.5">
                                        <button 
                                            type="button"
                                            onClick={() => updateMistake(activeTab, type.id as keyof MistakeCounts, -1)}
                                            className="w-5 h-5 flex items-center justify-center rounded hover:bg-white/10 text-slate-400"
                                        >-</button>
                                        <span className="w-4 text-center font-mono font-bold text-xs text-white">
                                            {activeMistakes[type.id as keyof MistakeCounts] || 0}
                                        </span>
                                        <button 
                                            type="button"
                                            onClick={() => updateMistake(activeTab, type.id as keyof MistakeCounts, 1)}
                                            className="w-5 h-5 flex items-center justify-center rounded hover:bg-white/10 text-slate-400"
                                        >+</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            {/* File Upload Section */}
            <div className="space-y-2">
               <label className="text-[10px] uppercase font-bold text-slate-400 ml-1">Attachment</label>
               {!previewFile ? (
                 <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-slate-700 hover:border-indigo-500 bg-black/20 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all group"
                 >
                    <div className="p-3 bg-white/5 rounded-full mb-2 group-hover:scale-110 transition-transform shadow-sm">
                        <UploadCloud className="text-indigo-400" size={20} />
                    </div>
                    <p className="text-xs font-bold text-slate-400 group-hover:text-indigo-400 transition-colors">Click to upload Scorecard / PDF</p>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*,application/pdf"
                        onChange={handleFileChange}
                    />
                 </div>
               ) : (
                 <div className="flex items-center justify-between p-3 bg-black/20 border border-slate-700 rounded-xl">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400 shrink-0">
                            {previewFile.type === 'pdf' ? <FileText size={18} /> : <ImageIcon size={18} />}
                        </div>
                        <span className="text-xs font-bold text-slate-200 truncate">{previewFile.name}</span>
                    </div>
                    <button type="button" onClick={removeAttachment} className="p-2 hover:bg-rose-500/10 rounded-lg text-rose-500 transition-colors">
                        <X size={16} />
                    </button>
                 </div>
               )}
            </div>

            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 py-4 rounded-xl text-white font-bold uppercase text-xs tracking-widest shadow-xl shadow-indigo-600/20 transition-all active:scale-95">Save Performance</button>
          </form>
        </Card>
      )}

      {/* Grid Layout for Tests */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tests.length === 0 ? (
          <div className="col-span-full text-center py-20 opacity-60 border-2 border-dashed border-slate-300 dark:border-white/10 rounded-3xl bg-white/30 dark:bg-white/5">
            <Trophy size={48} className="mx-auto mb-4 text-slate-400 dark:text-slate-500" />
            <p className="text-xs uppercase font-bold tracking-[0.3em] text-slate-600 dark:text-slate-400">No test records found</p>
          </div>
        ) : (
          tests.map((t, i) => (
            <Card 
                key={t.id} 
                className="group flex flex-col justify-between hover:border-indigo-500/30 cursor-pointer overflow-hidden p-0" 
                delay={i * 0.1}
                onClick={() => { setViewingReport(t); setReportSubject(null); }}
            >
              <div className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex flex-col">
                         <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">{t.date}</span>
                         <h3 className="text-slate-900 dark:text-white font-bold text-base line-clamp-1 leading-tight">{t.name}</h3>
                         <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider mt-2 w-fit ${
                             t.temperament === 'Calm' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' :
                             t.temperament === 'Anxious' ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400' :
                             'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400'
                         }`}>
                             {t.temperament}
                         </span>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="text-3xl font-display font-bold text-slate-900 dark:text-white leading-none">
                          {t.marks}
                          <span className="text-xs text-slate-400 font-medium ml-0.5">/{t.total}</span>
                      </div>
                      <span className="text-[10px] font-bold text-indigo-500 mt-1">
                          {Math.round((t.marks/t.total)*100)}% Score
                      </span>
                    </div>
                  </div>
                  
                  {/* Visual Bar Breakdown */}
                  {t.breakdown && (
                    <div className="flex gap-1 h-2 w-full rounded-full overflow-hidden bg-slate-100 dark:bg-white/5 mt-4">
                        {(['Physics', 'Chemistry', 'Maths'] as const).map(sub => {
                            const d = t.breakdown![sub];
                            const accuracy = d.correct + d.incorrect > 0 ? (d.correct / (d.correct + d.incorrect)) : 0;
                            const width = (100/3); 
                            const color = sub === 'Physics' ? 'bg-blue-500' : sub === 'Chemistry' ? 'bg-orange-500' : 'bg-rose-500';
                            
                            return (
                                <div key={sub} className="h-full relative group/bar" style={{ width: `${width}%` }}>
                                    <div className={`h-full ${color} opacity-30 w-full absolute top-0 left-0`} />
                                    <div className={`h-full ${color} absolute top-0 left-0`} style={{ width: `${accuracy * 100}%` }} />
                                </div>
                            )
                        })}
                    </div>
                  )}
                  
                  {/* Legend */}
                  <div className="flex justify-between mt-2 px-1">
                      {(['Physics', 'Chemistry', 'Maths'] as const).map(sub => (
                          <span key={sub} className="text-[9px] font-bold uppercase tracking-wider text-slate-400">{sub.slice(0,1)}</span>
                      ))}
                  </div>
              </div>
              
              {/* Footer Actions */}
              <div className="flex justify-between items-center px-5 py-3 bg-slate-50 dark:bg-white/5 border-t border-slate-100 dark:border-white/5 mt-auto">
                <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider group-hover:text-indigo-500 transition-colors">
                    View Report <ChevronRight size={12} />
                </div>
                <div className="flex gap-2">
                    {t.attachment && (
                        <button 
                            onClick={(e) => { e.stopPropagation(); setViewingAttachment(t); }}
                            className="p-1.5 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-500/20 text-indigo-500 transition-colors"
                        >
                            {t.attachmentType === 'pdf' ? <FileText size={14} /> : <ImageIcon size={14} />}
                        </button>
                    )}
                    <button 
                        onClick={(e) => { e.stopPropagation(); onDelete(t.id); }} 
                        className="p-1.5 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-500/20 text-rose-500 transition-colors"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* --- Performance Trend Graph --- */}
      <PerformanceGraph tests={tests} />

      {/* --- Detailed Report Card Modal --- */}
      {viewingReport && createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
              <div className="bg-white dark:bg-[#0f172a] w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-white/10">
                  {/* Header */}
                  <div className="relative p-8 bg-slate-900 overflow-hidden shrink-0">
                      <div className="absolute inset-0 opacity-30">
                          <div className={`absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full blur-[80px] translate-x-1/2 -translate-y-1/2`} />
                          <div className={`absolute bottom-0 left-0 w-48 h-48 bg-purple-500 rounded-full blur-[60px] -translate-x-1/3 translate-y-1/3`} />
                      </div>
                      
                      <div className="relative z-10 flex justify-between items-start">
                          <div>
                              <div className="flex items-center gap-2 mb-2">
                                  <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">{viewingReport.date}</span>
                                  <span className="w-1 h-1 bg-white/40 rounded-full" />
                                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">{viewingReport.temperament}</span>
                              </div>
                              <h2 className="text-2xl font-bold text-white leading-tight">{viewingReport.name}</h2>
                          </div>
                          <button onClick={() => setViewingReport(null)} className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors">
                              <X size={18} />
                          </button>
                      </div>

                      <div className="relative z-10 flex items-end gap-2 mt-6">
                          <span className="text-6xl font-display font-bold text-white tracking-tighter">
                              {viewingReport.marks}
                          </span>
                          <div className="flex flex-col mb-2">
                              <span className="text-sm font-medium text-white/60">/ {viewingReport.total}</span>
                              <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-300">
                                  {Math.round((viewingReport.marks / viewingReport.total) * 100)}% Score
                              </span>
                          </div>
                      </div>
                  </div>

                  {/* Body */}
                  <div className="p-6 overflow-y-auto bg-slate-50 dark:bg-[#0f172a]">
                      
                      {/* Subject Breakdown List */}
                      <div className="mb-8">
                          <div className="flex justify-between items-center mb-4">
                              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 flex items-center gap-2">
                                  <PieChart size={14} /> Subject Analysis
                              </h4>
                              {reportSubject && (
                                <button 
                                    onClick={() => setReportSubject(null)}
                                    className="text-[9px] font-bold text-indigo-500 flex items-center gap-1 hover:underline"
                                >
                                    Viewing {reportSubject} <X size={10} />
                                </button>
                              )}
                          </div>
                          
                          <div className="space-y-3">
                              {(['Physics', 'Chemistry', 'Maths'] as const).map(sub => {
                                  const d = viewingReport.breakdown?.[sub] || { correct: 0, incorrect: 0, unattempted: 0 };
                                  const total = d.correct + d.incorrect + d.unattempted;
                                  const attempted = d.correct + d.incorrect;
                                  const acc = attempted > 0 ? Math.round((d.correct / attempted) * 100) : 0;
                                  
                                  const color = sub === 'Physics' ? 'text-blue-500' : sub === 'Chemistry' ? 'text-orange-500' : 'text-rose-500';
                                  const bg = sub === 'Physics' ? 'bg-blue-500' : sub === 'Chemistry' ? 'bg-orange-500' : 'bg-rose-500';
                                  const isSelected = reportSubject === sub;

                                  return (
                                      <div 
                                        key={sub} 
                                        onClick={() => setReportSubject(prev => prev === sub ? null : sub)}
                                        className={`
                                            relative overflow-hidden rounded-2xl p-4 cursor-pointer transition-all duration-300 border
                                            ${isSelected 
                                                ? 'bg-white dark:bg-white/5 border-indigo-500 dark:border-indigo-500 shadow-lg scale-[1.02]' 
                                                : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/5 hover:border-indigo-300 dark:hover:border-white/20'
                                            }
                                        `}
                                      >
                                          <div className="flex items-center justify-between mb-3 relative z-10">
                                              <div className="flex items-center gap-3">
                                                  <div className={`p-2 rounded-lg ${bg} bg-opacity-10 dark:bg-opacity-20 ${color}`}>
                                                      {sub === 'Physics' ? <Atom size={18} /> : sub === 'Chemistry' ? <Zap size={18} /> : <Calculator size={18} />}
                                                  </div>
                                                  <div>
                                                      <h5 className={`text-sm font-bold ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-900 dark:text-white'}`}>{sub}</h5>
                                                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{d.correct}/{total} Correct</p>
                                                  </div>
                                              </div>
                                              <div className="text-right">
                                                  <span className="text-lg font-mono font-bold text-slate-900 dark:text-white">{acc}%</span>
                                                  <p className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Accuracy</p>
                                              </div>
                                          </div>
                                          
                                          {/* Mini Stats Grid */}
                                          <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-white/5 relative z-10">
                                              <div className="text-center">
                                                  <span className="block text-xs font-mono font-bold text-emerald-500">{d.correct}</span>
                                                  <span className="block text-[8px] uppercase font-bold text-slate-400 tracking-wider">Right</span>
                                              </div>
                                              <div className="text-center">
                                                  <span className="block text-xs font-mono font-bold text-rose-500">{d.incorrect}</span>
                                                  <span className="block text-[8px] uppercase font-bold text-slate-400 tracking-wider">Wrong</span>
                                              </div>
                                              <div className="text-center">
                                                  <span className="block text-xs font-mono font-bold text-slate-500">{d.unattempted}</span>
                                                  <span className="block text-[8px] uppercase font-bold text-slate-400 tracking-wider">Skip</span>
                                              </div>
                                          </div>
                                      </div>
                                  )
                              })}
                          </div>
                      </div>

                      {/* Mistake Analysis Aggregation */}
                      <div>
                          <div className="flex items-center justify-between mb-4">
                              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 flex items-center gap-2">
                                  <AlertCircle size={14} className={reportSubject ? 'text-indigo-500' : 'text-slate-400'} /> 
                                  {reportSubject ? `${reportSubject} Mistakes` : 'Overall Mistakes'}
                              </h4>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3">
                              {MISTAKE_TYPES.map(type => {
                                  let count = 0;
                                  if (viewingReport.breakdown) {
                                      if (reportSubject) {
                                          const mistakes = viewingReport.breakdown[reportSubject].mistakes;
                                          if (mistakes) count = mistakes[type.id as keyof MistakeCounts] || 0;
                                          if (type.id === 'calc' && count === 0) count = viewingReport.breakdown[reportSubject].calcErrors || 0;
                                          if (type.id === 'concept' && count === 0) count = viewingReport.breakdown[reportSubject].otherErrors || 0;
                                      } else {
                                          (['Physics', 'Chemistry', 'Maths'] as const).forEach(sub => {
                                              const mistakes = viewingReport.breakdown![sub].mistakes;
                                              if (mistakes) count += (mistakes[type.id as keyof MistakeCounts] || 0);
                                          });
                                          if (type.id === 'calc' && count === 0) (['Physics', 'Chemistry', 'Maths'] as const).forEach(sub => count += viewingReport.breakdown![sub].calcErrors || 0);
                                          if (type.id === 'concept' && count === 0) (['Physics', 'Chemistry', 'Maths'] as const).forEach(sub => count += viewingReport.breakdown![sub].otherErrors || 0);
                                      }
                                  }

                                  if (count === 0) return null;

                                  return (
                                      <div key={type.id} className="flex items-center justify-between p-3 bg-white dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/5 shadow-sm animate-in zoom-in-95 duration-300">
                                          <div className="flex items-center gap-2 overflow-hidden">
                                              <span className={`${type.color} shrink-0`}>{type.icon}</span>
                                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 truncate">{type.label}</span>
                                          </div>
                                          <span className="text-sm font-mono font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-white/10 px-2 py-0.5 rounded">{count}</span>
                                      </div>
                                  )
                              })}
                              
                              <div className="col-span-2 text-center py-4">
                                  {!MISTAKE_TYPES.some(type => {
                                      let count = 0;
                                      if (viewingReport.breakdown) {
                                          if (reportSubject) {
                                              count = (viewingReport.breakdown[reportSubject].mistakes?.[type.id as keyof MistakeCounts] || 0);
                                          } else {
                                              (['Physics', 'Chemistry', 'Maths'] as const).forEach(sub => count += (viewingReport.breakdown![sub].mistakes?.[type.id as keyof MistakeCounts] || 0));
                                          }
                                      }
                                      return count > 0;
                                  }) && (
                                      <p className="text-[10px] uppercase font-bold text-slate-400 italic">No mistakes tagged for this selection</p>
                                  )}
                              </div>
                          </div>
                      </div>
                  </div>
                  
                  {/* Footer with Attachment button if exists */}
                  {viewingReport.attachment && (
                      <div className="p-4 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0f172a] shrink-0">
                          <button 
                              onClick={() => { setViewingReport(null); setViewingAttachment(viewingReport); }}
                              className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-500/30 rounded-xl text-indigo-600 dark:text-indigo-400 font-bold uppercase text-xs tracking-widest transition-all"
                          >
                              {viewingReport.attachmentType === 'pdf' ? <FileText size={16} /> : <ImageIcon size={16} />}
                              View Attached Paper
                          </button>
                      </div>
                  )}
              </div>
          </div>,
          document.body
      )}

      {/* Attachment Viewer Modal */}
      {viewingAttachment && createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
              <div className="bg-white dark:bg-[#0f172a] w-full max-w-4xl h-[85vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl border border-white/10">
                  <div className="p-4 border-b border-slate-200 dark:border-white/10 flex justify-between items-center bg-white dark:bg-[#0f172a]">
                      <div className="flex items-center gap-3">
                          <div className="p-2 bg-indigo-100 dark:bg-indigo-500/20 rounded-lg text-indigo-600 dark:text-indigo-400">
                              {viewingAttachment.attachmentType === 'pdf' ? <FileText size={20} /> : <ImageIcon size={20} />}
                          </div>
                          <div>
                              <h3 className="text-sm font-bold text-slate-900 dark:text-white">{viewingAttachment.name}</h3>
                              <p className="text-[10px] text-slate-500 font-mono uppercase">{viewingAttachment.fileName || 'Attachment'}</p>
                          </div>
                      </div>
                      <button 
                        onClick={() => setViewingAttachment(null)}
                        className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 transition-colors"
                      >
                          <X size={20} />
                      </button>
                  </div>
                  <div className="flex-1 bg-slate-100 dark:bg-black/50 overflow-auto flex items-center justify-center p-4 relative">
                      {viewingAttachment.attachmentType === 'image' ? (
                          <img 
                            src={viewingAttachment.attachment} 
                            alt="Test Paper" 
                            className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                          />
                      ) : (
                          <div className="text-center">
                              <FileText size={64} className="text-slate-400 mx-auto mb-4" />
                              <p className="text-slate-500 dark:text-slate-300 mb-6 font-medium">PDF Preview is not supported in this view.</p>
                              <a 
                                href={viewingAttachment.attachment} 
                                download={viewingAttachment.fileName || "test-paper.pdf"}
                                className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold uppercase text-xs tracking-widest shadow-lg transition-all inline-flex items-center gap-2"
                              >
                                  <Download size={16} /> Download PDF
                              </a>
                          </div>
                      )}
                  </div>
              </div>
          </div>,
          document.body
      )}

      {/* Upcoming Tests Section */}
      {upcomingTests.length > 0 && (
          <div className="pt-8 border-t border-slate-200 dark:border-white/10 mt-8">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                  <Calendar size={14} className="text-amber-500" /> Upcoming Scheduled Tests
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {upcomingTests.map(t => {
                      const dateObj = new Date(t.date + 'T00:00:00'); 
                      const daysLeft = Math.ceil((dateObj.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                      
                      return (
                          <div key={t.id} className="bg-amber-50 dark:bg-amber-500/5 border border-amber-100 dark:border-amber-500/20 p-4 rounded-2xl relative overflow-hidden group hover:border-amber-300 dark:hover:border-amber-500/40 transition-colors">
                              <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                  <Clock size={48} className="text-amber-600 dark:text-amber-400" />
                              </div>
                              <h4 className="font-bold text-slate-900 dark:text-white truncate pr-6 text-sm">{t.text}</h4>
                              <div className="flex justify-between items-end mt-3">
                                  <div className="flex flex-col">
                                      <span className="text-[10px] uppercase font-bold text-amber-600/70 dark:text-amber-400/70">Date</span>
                                      <span className="text-sm font-mono font-bold text-slate-700 dark:text-slate-300">
                                          {dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                      </span>
                                  </div>
                                  <div className="px-2 py-1 bg-amber-500 text-white text-[10px] font-bold uppercase rounded-lg shadow-md">
                                      {daysLeft <= 0 ? 'Today' : `T - ${daysLeft} days`}
                                  </div>
                              </div>
                          </div>
                      )
                  })}
              </div>
          </div>
      )}
    </div>
  );
});