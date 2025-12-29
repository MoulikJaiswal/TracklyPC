import React from 'react';
import { X, Zap, ZapOff, CheckCircle2, Map, Globe, MousePointer2, Sparkles } from 'lucide-react';
import { Card } from './Card';
import { ThemeId } from '../types';
import { THEME_CONFIG } from '../constants';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  animationsEnabled: boolean;
  toggleAnimations: () => void;
  theme: ThemeId;
  setTheme: (theme: ThemeId) => void;
  onStartTutorial: () => void;
  showAurora: boolean;
  toggleAurora: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, 
  onClose, 
  animationsEnabled, 
  toggleAnimations,
  theme,
  setTheme,
  onStartTutorial,
  showAurora,
  toggleAurora
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <Card className="w-full max-w-lg bg-white dark:bg-[#0f172a] border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden relative max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-6 shrink-0">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Settings
          </h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6 overflow-y-auto pr-2 pb-4">
          {/* Tutorial Section */}
          <div className="p-4 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-xl flex items-center justify-between">
             <div>
                <h3 className="text-sm font-bold text-indigo-900 dark:text-indigo-100">New to Trackly?</h3>
                <p className="text-[10px] text-indigo-700 dark:text-indigo-300 mt-1">Take a quick interactive tour of features.</p>
             </div>
             <button 
               onClick={() => {
                 onStartTutorial();
                 onClose();
               }}
               className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-lg shadow-indigo-500/20 transition-all active:scale-95 flex items-center gap-2"
             >
               <Map size={14} /> Start Tour
             </button>
          </div>

          {/* Visual Preferences */}
          <div className="space-y-3">
             <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Visual Effects</label>
             <div className="grid grid-cols-1 gap-3">
                {/* Aurora Toggle */}
                <button 
                  onClick={toggleAurora}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${showAurora ? 'bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                        <Sparkles size={18} />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-slate-900 dark:text-white">Aurora Background</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">
                        Ambient colors & gradients
                      </p>
                    </div>
                  </div>
                  <div className={`w-10 h-5 rounded-full relative transition-colors ${showAurora ? 'bg-purple-500' : 'bg-slate-300 dark:bg-slate-600'}`}>
                      <div className={`absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm transition-all duration-300 ${showAurora ? 'left-6' : 'left-1'}`} />
                  </div>
                </button>
             </div>
          </div>

          {/* Theme Section */}
          <div className="space-y-3">
             <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Theme & Atmosphere</label>
             <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
                {Object.entries(THEME_CONFIG).map(([id, config]) => {
                  const isSelected = theme === id;
                  return (
                    <button
                      key={id}
                      onClick={() => setTheme(id as ThemeId)}
                      className={`relative p-3 rounded-xl border-2 text-left transition-all group overflow-hidden ${isSelected ? 'border-indigo-500 dark:border-indigo-400 bg-indigo-50 dark:bg-indigo-500/10' : 'border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10'}`}
                    >
                      <div className="flex items-center gap-3 mb-2 relative z-10">
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white shadow-sm"
                          style={{ backgroundColor: config.colors.accent }}
                        >
                          <config.icon size={14} />
                        </div>
                        <div className="flex-1 min-w-0">
                           <p className={`text-xs font-bold truncate ${isSelected ? 'text-indigo-900 dark:text-white' : 'text-slate-700 dark:text-slate-200'}`}>{config.label}</p>
                        </div>
                        {isSelected && <CheckCircle2 size={16} className="text-indigo-500 dark:text-indigo-400 shrink-0" />}
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 relative z-10 font-medium">
                        {config.description}
                      </p>
                      
                      {/* Preview Gradient Background */}
                      <div 
                        className="absolute inset-0 opacity-10 pointer-events-none"
                        style={{ backgroundColor: config.colors.bg }} 
                      />
                    </button>
                  )
                })}
             </div>
          </div>

          {/* Optimization Section */}
          <div className="space-y-3">
             <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Optimization</label>
             <div className="space-y-3">
                {/* High Performance Toggle */}
                <button 
                  onClick={toggleAnimations}
                  className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${animationsEnabled ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400'}`}>
                        {animationsEnabled ? <Zap size={18} /> : <ZapOff size={18} />}
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-slate-900 dark:text-white">High Performance</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">
                        {animationsEnabled ? 'Standard Mode' : 'Max FPS / Low Battery'}
                      </p>
                    </div>
                  </div>
                  <div className={`w-10 h-5 rounded-full relative transition-colors ${animationsEnabled ? 'bg-slate-300 dark:bg-slate-600' : 'bg-emerald-500'}`}>
                      <div className={`absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm transition-all duration-300 ${animationsEnabled ? 'left-1' : 'left-6'}`} />
                  </div>
                </button>
             </div>

             {!animationsEnabled && (
                <p className="text-[10px] text-amber-500/80 text-center font-bold tracking-wide">
                   Reduced motion automatically disables complex effects
                </p>
             )}
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/5 text-center shrink-0">
          <p className="text-[10px] text-slate-400 dark:text-slate-600 font-mono">Trackly v1.3.1</p>
        </div>
      </Card>
    </div>
  );
};