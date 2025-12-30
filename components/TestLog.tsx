
import React, { useState, useMemo, memo, useRef } from 'react';
import { Plus, X, Trash2, Trophy, Clock, AlertCircle, Calendar, UploadCloud, FileText, Image as ImageIcon, Eye, Paperclip } from 'lucide-react';
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
  targets?: Target[]; 
  onSave: (test: Omit<TestResult, 'id' | 'timestamp'>) => void;
  onDelete: (id: string) => void;
}

export const TestLog: React.FC<TestLogProps> = memo(({ tests, targets = [], onSave, onDelete }) => {
  const [isAdding, setIsAdding] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewFile, setPreviewFile] = useState<{ name: string; type: 'image' | 'pdf' } | null>(null);
  const [viewingAttachment, setViewingAttachment] = useState<TestResult | null>(null);

  const [formData, setFormData] = useState<Omit<TestResult, 'id' | 'timestamp'>>({
    name: '',
    date: getLocalDate(),
    marks: 0,
    total: 300,
    temperament: 'Calm',
    analysis: '',
    attachment: undefined,
    attachmentType: undefined,
    fileName: undefined
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Size limit check (approx 800KB to be safe for Firestore documents)
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
      analysis: '',
      attachment: undefined,
      attachmentType: undefined,
      fileName: undefined
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

            {/* File Upload Section */}
            <div className="space-y-2">
               <label className="text-[10px] uppercase font-bold text-indigo-500/80 dark:text-indigo-300/60 ml-1">Upload Question Paper / Scorecard</label>
               {!previewFile ? (
                 <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-indigo-200 dark:border-white/10 hover:border-indigo-400 dark:hover:border-indigo-500 bg-white/50 dark:bg-black/20 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors group"
                 >
                    <div className="p-3 bg-indigo-50 dark:bg-white/5 rounded-full mb-3 group-hover:scale-110 transition-transform">
                        <UploadCloud className="text-indigo-500 dark:text-indigo-400" size={24} />
                    </div>
                    <p className="text-xs font-bold text-slate-600 dark:text-slate-300">Click to upload image or PDF</p>
                    <p className="text-[10px] text-slate-400 mt-1">Max 800KB (Scorecards only)</p>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*,application/pdf"
                        onChange={handleFileChange}
                    />
                 </div>
               ) : (
                 <div className="flex items-center justify-between p-3 bg-white dark:bg-black/20 border border-indigo-200 dark:border-white/10 rounded-2xl">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-500/20 rounded-xl text-indigo-600 dark:text-indigo-400 shrink-0">
                            {previewFile.type === 'pdf' ? <FileText size={20} /> : <ImageIcon size={20} />}
                        </div>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">{previewFile.name}</span>
                    </div>
                    <button type="button" onClick={removeAttachment} className="p-2 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg text-rose-500 transition-colors">
                        <X size={16} />
                    </button>
                 </div>
               )}
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

                  {/* Attachment Button */}
                  {t.attachment && (
                      <button 
                        onClick={() => setViewingAttachment(t)}
                        className="w-full flex items-center justify-center gap-2 py-2 mb-4 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-xl text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-all text-xs font-bold uppercase tracking-wider"
                      >
                          {t.attachmentType === 'pdf' ? <FileText size={14} /> : <Paperclip size={14} />}
                          View Paper
                      </button>
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

      {/* Attachment Viewer Modal */}
      {viewingAttachment && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
              <div className="bg-white dark:bg-[#0f172a] w-full max-w-4xl h-[80vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl">
                  <div className="p-4 border-b border-slate-200 dark:border-white/10 flex justify-between items-center bg-white dark:bg-[#0f172a]">
                      <div className="flex items-center gap-3">
                          <div className="p-2 bg-indigo-100 dark:bg-indigo-500/20 rounded-lg text-indigo-600 dark:text-indigo-400">
                              {viewingAttachment.attachmentType === 'pdf' ? <FileText size={20} /> : <ImageIcon size={20} />}
                          </div>
                          <div>
                              <h3 className="text-sm font-bold text-slate-900 dark:text-white">{viewingAttachment.name}</h3>
                              <p className="text-[10px] text-slate-500 font-mono">{viewingAttachment.fileName || 'Attachment'}</p>
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
                              <p className="text-slate-500 dark:text-slate-300 mb-4">PDF Preview is not supported in this view.</p>
                              <a 
                                href={viewingAttachment.attachment} 
                                download={viewingAttachment.fileName || "test-paper.pdf"}
                                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold uppercase text-xs tracking-widest shadow-lg transition-all"
                              >
                                  Download PDF
                              </a>
                          </div>
                      )}
                  </div>
              </div>
          </div>
      )}

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
