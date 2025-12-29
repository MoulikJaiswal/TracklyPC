import React, { useState, useMemo, memo } from 'react';
import { Plus, X, Trash2, Trophy, Clock, AlertCircle, Calendar } from 'lucide-react';
import { TestResult, Target } from '../types';
import { Card } from './Card';

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
  targets?: Target[]; // Optional because it might not be passed in older versions or tests
  onSave: (test: Omit<TestResult, 'id' | 'timestamp'>) => void;
  onDelete: (id: string) => void;
}

export const TestLog: React.FC<TestLogProps> = memo(({ tests, targets = [], onSave, onDelete }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Omit<TestResult, 'id' | 'timestamp'>>({
    name: '',
    date: getLocalDate(),
    marks: 0,
    total: 300,
    temperament: 'Calm',
    analysis: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    onSave(formData);
    setIsAdding(false);
    setFormData({
      name: '',
      date: getLocalDate(),
      marks: 0,
      total: 300,
      temperament: 'Calm',
      analysis: ''
    });
  };

  const upcomingTests = useMemo(() => {
      const today = getLocalDate();
      return targets
        .filter(t => t.type === 'test' && t.date >= today && !t.completed)
        .sort((a, b) => a.date.localeCompare(b.date));
  }, [targets]);

  return (
    <div id="test-log-container" className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Test Log</h2>
          <p className="text-xs text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mt-1 font-bold">Track performance curves</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)} 
          className="bg-indigo-600 hover:bg-indigo-500 px-4 md:px-5 py-2.5 md:py-3 rounded-2xl text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
        >
          {isAdding ? <X size={16} /> : <Plus size={16} />}
          {isAdding ? 'Cancel' : 'Add Record'}
        </button>
      </div>

      {isAdding && (
        <Card className="border-indigo-100 dark:border-indigo-500/30 bg-indigo-50 dark:bg-indigo-500/5 max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-indigo-500/80 dark:text-indigo-300/60 ml-1">Test Name</label>
                <input 
                  type="text" required placeholder="e.g., JEE Mains Mock 12"
                  className="w-full bg-white dark:bg-black/20 border border-indigo-100 dark:border-white/10 p-3 md:p-4 rounded-2xl text-sm text-slate-900 dark:text-white focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-indigo-500/80 dark:text-indigo-300/60 ml-1">Date</label>
                <input 
                  type="date" required
                  className="w-full bg-white dark:bg-black/20 border border-indigo-100 dark:border-white/10 p-3 md:p-4 rounded-2xl text-sm text-slate-900 dark:text-white focus:border-indigo-500 outline-none transition-all"
                  value={formData.date}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                />
              </div>
              <div className="flex gap-4">
                <div className="w-1/2 space-y-2">
                  <label className="text-[10px] uppercase font-bold text-indigo-500/80 dark:text-indigo-300/60 ml-1">Marks</label>
                  <input 
                    type="number" required placeholder="0"
                    className="w-full bg-white dark:bg-black/20 border border-indigo-100 dark:border-white/10 p-3 md:p-4 rounded-2xl text-sm text-slate-900 dark:text-white focus:border-indigo-500 outline-none transition-all font-mono"
                    value={formData.marks}
                    onChange={e => setFormData({...formData, marks: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div className="w-1/2 space-y-2">
                  <label className="text-[10px] uppercase font-bold text-indigo-500/80 dark:text-indigo-300/60 ml-1">Total</label>
                  <input 
                    type="number" required placeholder="300"
                    className="w-full bg-white dark:bg-black/20 border border-indigo-100 dark:border-white/10 p-3 md:p-4 rounded-2xl text-sm text-slate-900 dark:text-white focus:border-indigo-500 outline-none transition-all font-mono"
                    value={formData.total}
                    onChange={e => setFormData({...formData, total: parseInt(e.target.value) || 300})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-indigo-500/80 dark:text-indigo-300/60 ml-1">Temperament</label>
                <select 
                  className="w-full bg-white dark:bg-slate-900 border border-indigo-100 dark:border-white/10 p-3 md:p-4 rounded-2xl text-sm text-slate-900 dark:text-white focus:border-indigo-500 outline-none transition-all"
                  value={formData.temperament}
                  onChange={e => setFormData({...formData, temperament: e.target.value as any})}
                >
                  {['Calm', 'Anxious', 'Focused', 'Fatigued'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-indigo-500/80 dark:text-indigo-300/60 ml-1">Quick Analysis</label>
              <textarea 
                placeholder="What went wrong? Any syllabus gaps?"
                className="w-full bg-white dark:bg-black/20 border border-indigo-100 dark:border-white/10 p-3 md:p-4 rounded-2xl text-sm text-slate-900 dark:text-white min-h-[100px] outline-none focus:border-indigo-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
                value={formData.analysis}
                onChange={e => setFormData({...formData, analysis: e.target.value})}
              />
            </div>
            <button type="submit" className="w-full bg-indigo-500 hover:bg-indigo-400 py-3 md:py-4 rounded-2xl text-white font-bold uppercase text-xs tracking-widest shadow-lg transition-colors">Save Performance</button>
          </form>
        </Card>
      )}

      {/* Grid Layout for Tests */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {tests.length === 0 ? (
          <div className="col-span-full text-center py-20 opacity-60 border-2 border-dashed border-slate-300 dark:border-white/10 rounded-3xl bg-white/30 dark:bg-white/5">
            <Trophy size={48} className="mx-auto mb-4 text-slate-400 dark:text-slate-500" />
            <p className="text-xs uppercase font-bold tracking-[0.3em] text-slate-600 dark:text-slate-400">No test records found</p>
          </div>
        ) : (
          tests.map((t, i) => (
            <Card key={t.id} className="group flex flex-col justify-between" delay={i * 0.1}>
              <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-4">
                       <div className="p-3 bg-slate-100 dark:bg-white/5 rounded-2xl text-indigo-600 dark:text-indigo-300"><Trophy size={20} /></div>
                       <div>
                         <h3 className="text-slate-900 dark:text-white font-bold text-base line-clamp-1" title={t.name}>{t.name}</h3>
                         <div className="flex items-center gap-2 mt-1">
                           <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{t.date}</span>
                           <span className="w-1 h-1 bg-indigo-500/50 rounded-full"></span>
                           <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{t.temperament}</span>
                         </div>
                       </div>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-light text-slate-900 dark:text-white font-mono">{t.marks}</span>
                      <span className="text-xs text-slate-500 font-bold ml-1">/{t.total}</span>
                    </div>
                  </div>
                  {t.analysis && (
                    <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border-l-4 border-indigo-500/40 mb-4 h-24 overflow-y-auto">
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic">{t.analysis}</p>
                    </div>
                  )}
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-white/5 mt-auto">
                <div className="flex gap-2">
                   <div className="px-2 py-1 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg text-[9px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-tighter">
                     {Math.round((t.marks / t.total) * 100)}% Accuracy
                   </div>
                </div>
                <button 
                  onClick={() => onDelete(t.id)} 
                  className="opacity-0 group-hover:opacity-100 text-xs text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 transition-all p-2 rounded-lg"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Upcoming Tests Section */}
      {upcomingTests.length > 0 && (
          <div className="pt-8 border-t border-slate-200 dark:border-white/10 mt-8">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                  <Calendar size={14} className="text-amber-500" /> Upcoming Scheduled Tests
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {upcomingTests.map(t => {
                      const dateObj = new Date(t.date + 'T00:00:00'); // Use simple string parse to avoid TZ issues
                      const daysLeft = Math.ceil((dateObj.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                      
                      return (
                          <div key={t.id} className="bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 p-4 rounded-2xl relative overflow-hidden group hover:border-amber-300 dark:hover:border-amber-500/40 transition-colors">
                              <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                  <Clock size={48} className="text-amber-600 dark:text-amber-400" />
                              </div>
                              <h4 className="font-bold text-slate-900 dark:text-white truncate pr-6">{t.text}</h4>
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