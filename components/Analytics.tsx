
import React, { useMemo, useState, useEffect, memo } from 'react';
import { Activity, Target, Trophy, Clock, Brain, TrendingUp, Zap, Atom, Calculator, BarChart2, Grid, Sparkles, Loader2, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react';
import { Session, TestResult } from '../types';
import { Card } from './Card';
import { MISTAKE_TYPES, JEE_SYLLABUS } from '../constants';
import { generateAnalysis } from '../services/geminiService';

// Helper for local date string YYYY-MM-DD
const getLocalDate = (d = new Date()) => {
  if (isNaN(d.getTime())) return '1970-01-01'; // Fallback for invalid dates
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

interface AnalyticsProps {
  sessions: Session[];
  tests: TestResult[];
}

const SubjectProficiency = memo(({ sessions }: { sessions: Session[] }) => {
  const subjects = useMemo(() => [
    { id: 'Physics', icon: Atom, color: 'text-blue-500 dark:text-blue-400', bg: 'bg-blue-500 dark:bg-blue-400' },
    { id: 'Chemistry', icon: Zap, color: 'text-orange-500 dark:text-orange-400', bg: 'bg-orange-500 dark:bg-orange-400' },
    { id: 'Maths', icon: Calculator, color: 'text-rose-500 dark:text-rose-400', bg: 'bg-rose-500 dark:bg-rose-400' }
  ], []);

  const stats = useMemo(() => {
      const acc = {
          Physics: { attempted: 0, correct: 0 },
          Chemistry: { attempted: 0, correct: 0 },
          Maths: { attempted: 0, correct: 0 }
      };
      
      sessions.forEach(s => {
          const sub = s.subject as keyof typeof acc;
          if (acc[sub]) {
              // Ensure number types
              acc[sub].attempted += (Number(s.attempted) || 0);
              acc[sub].correct += (Number(s.correct) || 0);
          }
      });
      return acc;
  }, [sessions]);

  return (
    <div className="space-y-4">
      {subjects.map(sub => {
        const { attempted, correct } = stats[sub.id as keyof typeof stats];
        const accuracy = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;
        
        return (
          <div key={sub.id} className="flex items-center gap-4 bg-slate-50 dark:bg-black/20 p-3 rounded-2xl border border-slate-200 dark:border-white/5">
             <div className={`p-2.5 rounded-xl bg-white dark:bg-white/5 ${sub.color}`}>
                <sub.icon size={18} />
             </div>
             <div className="flex-grow min-w-0">
               <div className="flex justify-between items-end mb-1.5">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">{sub.id}</span>
                  <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">{accuracy}%</span>
               </div>
               <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                 <div 
                    className={`h-full ${sub.bg} transition-transform duration-1000 origin-left will-change-transform`} 
                    style={{ width: '100%', transform: `scaleX(${accuracy / 100})` }} 
                 />
               </div>
               <div className="mt-1.5 text-[9px] text-slate-500 dark:text-slate-600 font-bold uppercase tracking-widest text-right">
                 {attempted} Questions
               </div>
             </div>
          </div>
        )
      })}
    </div>
  );
});

const SyllabusHeatmap = memo(({ sessions }: { sessions: Session[] }) => {
  const topicStats = useMemo(() => {
    const stats: Record<string, { attempted: number, correct: number }> = {};
    sessions.forEach(s => {
        const key = `${s.subject}|${s.topic}`;
        if (!stats[key]) stats[key] = { attempted: 0, correct: 0 };
        // Ensure number types
        stats[key].attempted += (Number(s.attempted) || 0);
        stats[key].correct += (Number(s.correct) || 0);
    });
    return stats;
  }, [sessions]);

  return (
    <div className="mt-8 space-y-6">
      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-2">
         <Grid size={14} /> Topic Mastery Heatmap
      </h3>
      <div className="grid grid-cols-1 gap-6">
         {Object.entries(JEE_SYLLABUS).map(([subject, topics]) => (
            <div key={subject} className="bg-white/60 dark:bg-slate-900/60 p-4 rounded-3xl border border-slate-200 dark:border-white/5">
                <div className="flex items-center gap-2 mb-4">
                    <span className={`w-2 h-2 rounded-full ${
                        subject === 'Physics' ? 'bg-blue-500' : subject === 'Chemistry' ? 'bg-orange-500' : 'bg-rose-500'
                    }`} />
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">{subject}</h4>
                </div>
                <div className="flex flex-wrap gap-1.5">
                    {topics.map(topic => {
                        const stat = topicStats[`${subject}|${topic}`] || { attempted: 0, correct: 0 };
                        const { attempted, correct } = stat;
                        const accuracy = attempted > 0 ? (correct / attempted) : 0;
                        
                        let bgClass = "bg-slate-200 dark:bg-white/5 text-slate-400 dark:text-slate-600";
                        if (attempted > 0) {
                            if (attempted < 20 || accuracy < 0.3) {
                                bgClass = "bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30";
                            } else if (attempted < 50 || accuracy < 0.7) {
                                bgClass = "bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30";
                            } else {
                                bgClass = "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30";
                            }
                        }

                        return (
                            <div 
                              key={topic} 
                              className={`
                                cursor-help h-8 px-3 rounded-lg flex items-center justify-center transition-all hover:scale-105
                                ${bgClass}
                              `}
                              title={`${topic}: ${attempted} Qs (${Math.round(accuracy * 100)}%)`}
                            >
                                <span className="text-[9px] font-bold uppercase truncate max-w-[100px]">{topic.split(' ').slice(0, 2).join(' ')}</span>
                            </div>
                        )
                    })}
                </div>
            </div>
         ))}
      </div>
      <div className="flex justify-center gap-6 mt-4">
         <div className="flex items-center gap-2">
             <div className="w-3 h-3 rounded bg-slate-200 dark:bg-white/5" />
             <span className="text-[10px] uppercase font-bold text-slate-400">Untouched</span>
         </div>
         <div className="flex items-center gap-2">
             <div className="w-3 h-3 rounded bg-rose-500/20 border border-rose-500/30" />
             <span className="text-[10px] uppercase font-bold text-slate-400">Needs Work</span>
         </div>
         <div className="flex items-center gap-2">
             <div className="w-3 h-3 rounded bg-amber-500/20 border border-amber-500/30" />
             <span className="text-[10px] uppercase font-bold text-slate-400">Improving</span>
         </div>
         <div className="flex items-center gap-2">
             <div className="w-3 h-3 rounded bg-emerald-500/20 border border-emerald-500/30" />
             <span className="text-[10px] uppercase font-bold text-slate-400">Mastered</span>
         </div>
      </div>
    </div>
  )
});

export const Analytics: React.FC<AnalyticsProps> = memo(({ sessions, tests }) => {
  const [aiReport, setAiReport] = useState<any | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const stats = useMemo(() => {
    // Ensure numbers for aggregation
    const totalAttempted = sessions.reduce((acc, s) => acc + (Number(s.attempted) || 0), 0);
    const totalCorrect = sessions.reduce((acc, s) => acc + (Number(s.correct) || 0), 0);
    const avgAccuracy = totalAttempted > 0 ? (totalCorrect / totalAttempted) * 100 : 0;

    const mistakeDistribution: Record<string, number> = {};
    sessions.forEach(s => {
        Object.entries(s.mistakes).forEach(([key, val]) => {
            mistakeDistribution[key] = (mistakeDistribution[key] || 0) + (Number(val) || 0);
        });
    });

    const totalMistakes = Object.values(mistakeDistribution).reduce((a: number, b: number) => a + b, 0);

    return { totalAttempted, totalCorrect, avgAccuracy, mistakeDistribution, totalMistakes };
  }, [sessions]);

  const handleGenerateReport = async () => {
    if (sessions.length < 3) {
      alert("Please log at least 3 study sessions to get a meaningful analysis.");
      return;
    }
    
    setIsAnalyzing(true);
    try {
      const reportText = await generateAnalysis(sessions, tests);
      try {
          const json = JSON.parse(reportText || '{}');
          setAiReport(json);
      } catch (e) {
          // Fallback if AI returns plain text despite schema
          setAiReport({ analysis: reportText, bottleneckTitle: "General Analysis", temperament: "Analysis", actionPlan: [] });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div id="analytics-container" className="space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-10">
      
      {/* Header Stats - Render Immediately */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="relative overflow-hidden group" delay={0.1}>
           <div className="absolute right-0 top-0 p-3 opacity-20 dark:opacity-5 group-hover:opacity-30 dark:group-hover:opacity-10 transition-opacity">
              <TrendingUp size={80} className="text-indigo-200 dark:text-white" />
           </div>
           <div className="flex flex-col relative z-10">
              <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-300 tracking-widest mb-1">Accuracy</span>
              <div className="flex items-baseline gap-2">
                 <span className="text-4xl font-mono font-light text-slate-900 dark:text-white">{Math.round(stats.avgAccuracy)}%</span>
                 {stats.avgAccuracy > 75 && <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded uppercase">Good</span>}
              </div>
           </div>
        </Card>

        <Card className="relative overflow-hidden group" delay={0.2}>
           <div className="absolute right-0 top-0 p-3 opacity-20 dark:opacity-5 group-hover:opacity-30 dark:group-hover:opacity-10 transition-opacity">
              <Target size={80} className="text-emerald-200 dark:text-white" />
           </div>
           <div className="flex flex-col relative z-10">
              <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-300 tracking-widest mb-1">Solved</span>
              <div className="flex items-baseline gap-2">
                 <span className="text-4xl font-mono font-light text-slate-900 dark:text-white">{stats.totalAttempted}</span>
                 <span className="text-xs text-slate-500 font-bold uppercase">Qs</span>
              </div>
           </div>
        </Card>

        <Card className="relative overflow-hidden group" delay={0.3}>
           <div className="absolute right-0 top-0 p-3 opacity-20 dark:opacity-5 group-hover:opacity-30 dark:group-hover:opacity-10 transition-opacity">
              <Trophy size={80} className="text-amber-200 dark:text-white" />
           </div>
           <div className="flex flex-col relative z-10">
              <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-300 tracking-widest mb-1">Tests</span>
              <div className="flex items-baseline gap-2">
                 <span className="text-4xl font-mono font-light text-slate-900 dark:text-white">{tests.length}</span>
                 <span className="text-xs text-slate-500 font-bold uppercase">Taken</span>
              </div>
           </div>
        </Card>
      </div>

      <div className="animate-in fade-in duration-500 space-y-6 md:space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                {/* Left Col: Subjects */}
                <div className="lg:col-span-2 space-y-6 md:space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                        {/* Subject Breakdown */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Subject Proficiency</h3>
                            <SubjectProficiency sessions={sessions} />
                        </div>

                        {/* AI Coach Insight */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Gemini Coach</h3>
                            <div className="p-6 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-900/10 dark:to-purple-900/5 rounded-3xl border border-indigo-100 dark:border-indigo-500/20 relative overflow-hidden min-h-[300px] flex flex-col transform-gpu">
                                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                                    <Sparkles size={80} className="text-indigo-900 dark:text-white" />
                                </div>
                                
                                <div className="relative z-10 flex-grow">
                                    {isAnalyzing ? (
                                        <div className="h-full flex flex-col items-center justify-center gap-4 text-indigo-600 dark:text-indigo-300 py-10">
                                            <Loader2 size={32} className="animate-spin" />
                                            <div className="text-center">
                                                <span className="text-xs font-bold uppercase tracking-widest block mb-1">Analyzing Patterns</span>
                                                <span className="text-[10px] text-indigo-400 dark:text-indigo-500 uppercase font-bold tracking-widest">Studying {sessions.length} sessions...</span>
                                            </div>
                                        </div>
                                    ) : aiReport ? (
                                        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                            {/* Bottleneck Card */}
                                            <div className="bg-rose-50/80 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-500/20 p-4 rounded-2xl">
                                                <div className="flex items-start gap-3">
                                                    <div className="p-2 bg-rose-100 dark:bg-rose-500/20 rounded-xl text-rose-600 dark:text-rose-400 shrink-0">
                                                        <AlertTriangle size={18} />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-bold text-rose-900 dark:text-rose-100 uppercase tracking-wide mb-1">{aiReport.bottleneckTitle || "Critical Area"}</h4>
                                                        <p className="text-xs text-rose-800/80 dark:text-rose-200/70 leading-relaxed">
                                                            {aiReport.analysis}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Temperament */}
                                            {aiReport.temperament && (
                                                <div className="flex items-center gap-3 px-4 py-3 bg-blue-50/80 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-500/20 rounded-2xl">
                                                    <Brain size={16} className="text-blue-600 dark:text-blue-400 shrink-0" />
                                                    <p className="text-xs text-blue-900 dark:text-blue-100 font-medium">
                                                        <span className="font-bold uppercase text-[10px] tracking-wider text-blue-500 dark:text-blue-400 mr-2">Temperament:</span>
                                                        {aiReport.temperament}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Action Plan */}
                                            <div className="space-y-2">
                                                <h5 className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 ml-1">Weekly Strategy</h5>
                                                {aiReport.actionPlan?.map((step: string, i: number) => (
                                                    <div key={i} className="flex items-start gap-3 p-3 bg-white/60 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5">
                                                        <CheckCircle2 size={14} className="text-emerald-500 mt-0.5 shrink-0" />
                                                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-snug">{step}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center text-center py-8">
                                            <h4 className="text-lg font-bold text-indigo-900 dark:text-white mb-2">Performance Review</h4>
                                            <p className="text-xs text-indigo-700 dark:text-indigo-300 mb-6 max-w-[200px] leading-relaxed">
                                                Gemini analyzes your speed, accuracy, and mistake patterns to build a custom study plan.
                                            </p>
                                            <button 
                                                onClick={handleGenerateReport}
                                                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-indigo-600/20 transition-all active:scale-95 flex items-center gap-2 group"
                                            >
                                                <Sparkles size={14} className="group-hover:animate-pulse" /> Generate Analysis
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {aiReport && !isAnalyzing && (
                                    <div className="mt-6 pt-4 border-t border-indigo-200 dark:border-white/5 flex justify-between items-center">
                                        <div className="flex items-center gap-2 text-indigo-500/60 dark:text-indigo-400/60">
                                            <Zap size={12} />
                                            <span className="text-[9px] uppercase font-bold tracking-widest">Gemini 2.0 Flash</span>
                                        </div>
                                        <button 
                                            onClick={handleGenerateReport}
                                            className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                                        >
                                            Refresh <ArrowRight size={10} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Col: Error Distribution */}
                <div className="lg:col-span-1">
                    <Card className="bg-white/60 dark:bg-slate-900/60 p-6 h-full">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-rose-500 dark:text-rose-400 mb-6 flex items-center gap-2">
                        <Brain size={16} /> Error Analysis
                    </h3>
                    <div className="space-y-5">
                        {MISTAKE_TYPES.map(type => {
                        const count = stats.mistakeDistribution[type.id] || 0;
                        const totalMistakes = stats.totalMistakes;
                        const percent = totalMistakes > 0 ? (count / totalMistakes) : 0;
                        
                        if (totalMistakes > 0 && count === 0) return null;

                        return (
                            <div key={type.id} className="group">
                            <div className="flex justify-between items-end mb-2">
                                <div className="flex items-center gap-2">
                                <span className={`${type.color.replace('text-','text-').replace('-400','-500 dark:text-' + type.color.split('-')[1] + '-400')} opacity-80 group-hover:opacity-100 transition-opacity`}>{type.icon}</span>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors">{type.label}</span>
                                </div>
                                <span className="text-[10px] font-mono text-slate-500">{count}</span>
                            </div>
                            <div className="h-2 w-full bg-slate-200 dark:bg-black/40 rounded-full overflow-hidden">
                                <div 
                                className={`h-full ${type.color.replace('text', 'bg').replace('-400', '-500 dark:bg-' + type.color.split('-')[1] + '-400')} transition-transform duration-1000 ease-out origin-left will-change-transform`}
                                style={{ width: '100%', transform: `scaleX(${Math.max(percent, totalMistakes > 0 ? 0.05 : 0)})` }}
                                />
                            </div>
                            </div>
                        );
                        })}
                        {Object.keys(stats.mistakeDistribution).length === 0 && (
                        <div className="text-center py-10 opacity-30">
                            <p className="text-[10px] uppercase font-bold tracking-widest text-slate-900 dark:text-white">No mistakes recorded</p>
                        </div>
                        )}
                    </div>
                    </Card>
                </div>
            </div>
            
            {/* Syllabus Heatmap Section */}
            <SyllabusHeatmap sessions={sessions} />
      </div>
    </div>
  );
});
