import React, { useState, useMemo } from 'react';
import { Plus, Trash2, CheckCircle2, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Target, Trophy, List } from 'lucide-react';
import { Target as TargetType } from '../types';
import { Card } from './Card';

// Helper for local date string YYYY-MM-DD
const getLocalDate = (d = new Date()) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

interface PlannerProps {
  targets: TargetType[];
  onAdd: (target: TargetType) => void;
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
}

export const Planner: React.FC<PlannerProps> = ({ targets, onAdd, onToggle, onDelete }) => {
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [selectedDate, setSelectedDate] = useState(getLocalDate());
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date()); // For month navigation
  const [newTargetText, setNewTargetText] = useState('');
  const [isTest, setIsTest] = useState(false);

  const todayStr = getLocalDate();

  // Weekly View Logic
  const getWeekDays = () => {
    const days = [];
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 is Sunday
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek);

    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      days.push(getLocalDate(d));
    }
    return days;
  };

  const weekDays = getWeekDays();

  // Monthly View Logic
  const calendarGrid = useMemo(() => {
    const year = currentMonthDate.getFullYear();
    const month = currentMonthDate.getMonth();
    
    const firstDayOfMonth = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Day of week (0-6) the month starts on
    const startDayOfWeek = firstDayOfMonth.getDay(); 

    const days = [];
    // Add empty placeholders for start padding
    for (let i = 0; i < startDayOfWeek; i++) {
        days.push(null);
    }
    // Add actual days
    for (let i = 1; i <= daysInMonth; i++) {
        days.push(getLocalDate(new Date(year, month, i)));
    }
    return days;
  }, [currentMonthDate]);

  const changeMonth = (delta: number) => {
    const newDate = new Date(currentMonthDate);
    newDate.setMonth(newDate.getMonth() + delta);
    setCurrentMonthDate(newDate);
  };

  const handleAdd = () => {
    if (!newTargetText.trim()) return;
    onAdd({
      id: crypto.randomUUID(),
      date: selectedDate,
      text: newTargetText,
      completed: false,
      timestamp: Date.now(),
      type: isTest ? 'test' : 'task'
    });
    setNewTargetText('');
    setIsTest(false);
  };

  const dayTargets = targets.filter(t => t.date === selectedDate);
  const monthName = currentMonthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div id="planner-container" className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Planner Controls - Expanded Full Width */}
      <div className="flex flex-col md:flex-row gap-4 bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl p-2 rounded-[1.5rem] border border-slate-200 dark:border-white/10 shadow-sm w-full">
          {/* Segmented Toggle - Grows to fill space */}
          <div className="flex flex-1 p-1 bg-slate-100 dark:bg-black/20 rounded-2xl relative">
              <button 
                onClick={() => setViewMode('week')}
                className={`flex-1 py-3 md:py-3.5 rounded-xl text-xs md:text-sm font-bold uppercase tracking-widest transition-all ${viewMode === 'week' ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-md scale-[1.02]' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                  Week
              </button>
              <button 
                onClick={() => setViewMode('month')}
                className={`flex-1 py-3 md:py-3.5 rounded-xl text-xs md:text-sm font-bold uppercase tracking-widest transition-all ${viewMode === 'month' ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-md scale-[1.02]' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                  Month
              </button>
          </div>

          <button 
             onClick={() => {
                 setSelectedDate(todayStr);
                 setCurrentMonthDate(new Date());
             }}
             className="px-6 py-3 bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 text-[10px] md:text-xs font-bold uppercase tracking-widest rounded-2xl hover:bg-indigo-600 hover:text-white transition-colors shrink-0"
           >
             Go to Today
           </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Calendar Column */}
        <div className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-xl select-none transition-colors h-fit">
            {/* Month Header (Visible in Month Mode) */}
            {viewMode === 'month' && (
                <div className="flex justify-between items-center mb-8 px-2">
                    <button onClick={() => changeMonth(-1)} className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
                        <ChevronLeft size={20} className="text-slate-600 dark:text-slate-300" />
                    </button>
                    <div className="flex items-center gap-2">
                        <CalendarIcon size={18} className="text-indigo-500 dark:text-indigo-400" />
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest">
                            {monthName}
                        </h3>
                    </div>
                    <button onClick={() => changeMonth(1)} className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
                        <ChevronRight size={20} className="text-slate-600 dark:text-slate-300" />
                    </button>
                </div>
            )}

            {/* Week Header (Visible in Week Mode) */}
            {viewMode === 'week' && (
                <div className="flex justify-between items-center mb-8 px-2">
                    <div className="flex items-center gap-2">
                        <CalendarIcon size={18} className="text-indigo-500 dark:text-indigo-400" />
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest">
                            {new Date(weekDays[0]).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </h3>
                    </div>
                </div>
            )}

            {/* View Grids */}
            {viewMode === 'week' ? (
                <div className="grid grid-cols-7 gap-2 md:gap-4">
                    {weekDays.map((dateStr) => {
                        const [y, m, day] = dateStr.split('-').map(Number);
                        const d = new Date(y, m - 1, day);
                        const isSelected = selectedDate === dateStr;
                        const isToday = dateStr === todayStr;
                        const tasksForDay = targets.filter(t => t.date === dateStr);
                        const hasTest = tasksForDay.some(t => t.type === 'test');
                        const allDone = tasksForDay.length > 0 && tasksForDay.every(t => t.completed);

                        return (
                        <button 
                            key={dateStr}
                            onClick={() => setSelectedDate(dateStr)}
                            className={`
                            relative flex flex-col items-center justify-center py-6 rounded-2xl transition-all duration-300 group
                            ${isSelected ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 scale-105 z-10' : 'bg-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-slate-200'}
                            ${isToday && !isSelected ? 'ring-1 ring-indigo-500/50' : ''}
                            `}
                        >
                            <span className="text-xs font-bold uppercase tracking-wider mb-2">{d.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 1)}</span>
                            <span className={`text-xl font-mono font-bold ${isSelected ? 'text-white' : 'text-slate-700 dark:text-slate-200'}`}>{d.getDate()}</span>
                            
                            <div className="flex gap-1 mt-3">
                                {hasTest && <div className={`w-2 h-2 rounded-full ${isSelected ? 'bg-amber-300' : 'bg-amber-500'}`} />}
                                {!hasTest && tasksForDay.length > 0 && (
                                    <div className={`w-2 h-2 rounded-full ${allDone ? 'bg-emerald-400' : isSelected ? 'bg-indigo-300' : 'bg-indigo-500/50'}`} />
                                )}
                            </div>
                        </button>
                        )
                    })}
                </div>
            ) : (
                <div>
                    {/* Day Labels */}
                    <div className="grid grid-cols-7 mb-4">
                        {['S','M','T','W','T','F','S'].map((d, i) => (
                            <div key={i} className="text-center text-xs font-bold text-slate-400 dark:text-slate-600">{d}</div>
                        ))}
                    </div>
                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-2">
                        {calendarGrid.map((dateStr, index) => {
                            if (!dateStr) return <div key={`empty-${index}`} className="p-2" />;
                            
                            const [y, m, day] = dateStr.split('-').map(Number);
                            const isSelected = selectedDate === dateStr;
                            const isToday = dateStr === todayStr;
                            const tasksForDay = targets.filter(t => t.date === dateStr);
                            const hasTest = tasksForDay.some(t => t.type === 'test');
                            const hasTasks = tasksForDay.length > 0;

                            return (
                                <button
                                    key={dateStr}
                                    onClick={() => setSelectedDate(dateStr)}
                                    className={`
                                        h-12 md:h-16 rounded-xl flex flex-col items-center justify-center relative transition-all
                                        ${isSelected ? 'bg-indigo-600 text-white shadow-md z-10' : 'hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300'}
                                        ${isToday && !isSelected ? 'border border-indigo-500/50 text-indigo-500' : ''}
                                    `}
                                >
                                    <span className="text-sm font-mono font-bold">{day}</span>
                                    <div className="flex gap-1 mt-1.5">
                                        {hasTest && <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-amber-300' : 'bg-amber-500'}`} />}
                                        {!hasTest && hasTasks && <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-indigo-300' : 'bg-indigo-500'}`} />}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>

        {/* Tasks Column */}
        <Card className="min-h-[400px] md:min-h-[500px]">
            {/* Add Input Area */}
            <div className="mb-6 md:mb-8">
                <div className="flex gap-3 mb-3">
                    <input 
                        type="text" 
                        placeholder="Add a task for this day..." 
                        className="flex-grow bg-white dark:bg-black/20 border border-slate-200 dark:border-white/5 p-3 md:p-4 rounded-2xl text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500" 
                        value={newTargetText} 
                        onChange={e => setNewTargetText(e.target.value)} 
                        onKeyDown={e => e.key === 'Enter' && handleAdd()} 
                    />
                    <button 
                        onClick={handleAdd} 
                        className="bg-indigo-600 p-3 md:p-4 rounded-2xl text-white hover:bg-indigo-500 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-indigo-600/20"
                    >
                        <Plus size={20} />
                    </button>
                </div>
                {/* Type Toggle */}
                <div className="flex items-center gap-2 pl-1">
                    <button 
                        onClick={() => setIsTest(!isTest)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border ${isTest ? 'bg-amber-500/10 border-amber-500 text-amber-600 dark:text-amber-400' : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                    >
                        {isTest ? <CheckCircle2 size={12} /> : <div className="w-3 h-3 rounded-full border-2 border-current" />}
                        Mark as Scheduled Test
                    </button>
                </div>
            </div>

            <div className="space-y-3">
            <h4 className="text-[10px] uppercase font-bold text-indigo-500/80 dark:text-indigo-400/50 tracking-[0.2em] mb-4 flex items-center gap-3">
                Tasks for {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                <div className="h-[1px] flex-grow bg-slate-200 dark:bg-white/5"></div>
            </h4>

            {dayTargets.length === 0 ? (
                <div className="text-center py-24 opacity-40 border-2 border-dashed border-slate-200 dark:border-white/5 rounded-3xl">
                <Target size={48} className="mx-auto mb-4 text-slate-400 dark:text-slate-600"/>
                <p className="text-xs uppercase font-bold tracking-widest text-slate-500 dark:text-slate-400">No goals set for today</p>
                </div>
            ) : (
                dayTargets.map(t => (
                <div key={t.id} className={`flex items-center gap-4 p-3 md:p-4 rounded-2xl group border transition-all ${t.type === 'test' ? 'bg-amber-50 dark:bg-amber-500/5 border-amber-200 dark:border-amber-500/10' : 'bg-slate-50 dark:bg-white/[0.03] border-slate-100 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10'}`}>
                    <button 
                    onClick={() => onToggle(t.id, !t.completed)} 
                    className={`transition-all duration-300 ${t.completed ? 'text-emerald-500 dark:text-emerald-400' : t.type === 'test' ? 'text-amber-500' : 'text-slate-300 dark:text-slate-600 hover:text-indigo-500 dark:hover:text-indigo-400'}`}
                    >
                    {t.completed ? <CheckCircle2 size={24} /> : <div className="w-6 h-6 border-2 border-current rounded-full"></div>}
                    </button>
                    <div className="flex-grow flex flex-col">
                        <span className={`text-sm md:text-base transition-all duration-300 ${t.completed ? 'text-slate-400 dark:text-slate-500 line-through' : 'text-slate-700 dark:text-slate-200'}`}>
                            {t.text}
                        </span>
                        {t.type === 'test' && (
                            <span className="text-[9px] uppercase font-bold text-amber-500 tracking-wider flex items-center gap-1 mt-1">
                                <Trophy size={10} /> Scheduled Test
                            </span>
                        )}
                    </div>
                    <button 
                    onClick={() => onDelete(t.id)} 
                    className="opacity-0 group-hover:opacity-100 p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-all"
                    >
                    <Trash2 size={16} />
                    </button>
                </div>
                ))
            )}
            </div>
        </Card>
      </div>
    </div>
  );
};