
import React from 'react';
import { X, CheckCircle2, Map, MousePointer2, Sparkles, Layers, Volume2, VolumeX, Trash2, AlertTriangle, Eye, Smartphone, Battery, BatteryCharging } from 'lucide-react';
import { Card } from './Card';
import { ThemeId } from '../types';
import { THEME_CONFIG } from '../constants';
import { BuyMeCoffee } from './BuyMeCoffee';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  animationsEnabled: boolean;
  toggleAnimations: () => void;
  graphicsEnabled: boolean;
  toggleGraphics: () => void;
  theme: ThemeId;
  setTheme: (theme: ThemeId) => void;
  onStartTutorial: () => void;
  showAurora: boolean;
  toggleAurora: () => void;
  parallaxEnabled: boolean;
  toggleParallax: () => void;
  showParticles: boolean;
  toggleParticles: () => void;
  swipeAnimationEnabled: boolean;
  toggleSwipeAnimation: () => void;
  swipeStiffness: number;
  setSwipeStiffness: (val: number) => void;
  swipeDamping: number;
  setSwipeDamping: (val: number) => void;
  
  // Sound Props
  soundEnabled: boolean;
  toggleSound: () => void;
  soundPitch: number;
  setSoundPitch: (val: number) => void;
  soundVolume: number;
  setSoundVolume: (val: number) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, 
  onClose, 
  animationsEnabled, 
  toggleAnimations,
  graphicsEnabled,
  toggleGraphics,
  theme,
  setTheme,
  onStartTutorial,
  showAurora,
  toggleAurora,
  parallaxEnabled,
  toggleParallax,
  showParticles,
  toggleParticles,
  swipeAnimationEnabled,
  toggleSwipeAnimation,
  swipeStiffness,
  setSwipeStiffness,
  swipeDamping,
  setSwipeDamping,
  
  soundEnabled,
  toggleSound,
  soundPitch,
  setSoundPitch,
  soundVolume,
  setSoundVolume
}) => {
  if (!isOpen) return null;

  const handleClearData = () => {
      if (window.confirm("Are you sure? This will wipe all local data, settings, and guest progress. This action cannot be undone.")) {
          localStorage.clear();
          window.location.reload();
      }
  };

  // Helper to force enable animations if they are off, while toggling graphics
  const setMode = (mode: 'standard' | 'lite') => {
      if (mode === 'standard') {
          if (!graphicsEnabled) toggleGraphics(); // Turn Graphics ON
      } else {
          if (graphicsEnabled) toggleGraphics(); // Turn Graphics OFF
      }
      
      // Enforce Motion ON for both modes as per requirement
      if (!animationsEnabled) {
          toggleAnimations();
      }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <Card className="w-full max-w-lg bg-white dark:bg-[#0f172a] border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden relative max-h-[90vh] flex flex-col [&>div.z-10]:flex [&>div.z-10]:flex-col [&>div.z-10]:h-full [&>div.z-10]:overflow-hidden">
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

        <div className="space-y-6 overflow-y-auto pr-2 pb-4 flex-1 min-h-0">
          
          {/* Performance Control Center */}
          <div className="space-y-3">
             <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Performance Mode</label>
             <div className="grid grid-cols-2 gap-3">
                {/* Standard Mode */}
                <button 
                    onClick={() => setMode('standard')}
                    className={`
                        relative flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-300 group
                        ${graphicsEnabled 
                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10' 
                            : 'border-slate-200 dark:border-white/5 hover:border-indigo-200 dark:hover:border-white/20'
                        }
                    `}
                >
                    {graphicsEnabled && <div className="absolute top-3 right-3 text-indigo-500"><CheckCircle2 size={16} /></div>}
                    <div className={`p-3 rounded-full mb-3 transition-colors ${graphicsEnabled ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400' : 'bg-slate-100 dark:bg-white/5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`}>
                        <Eye size={24} />
                    </div>
                    <span className={`text-sm font-bold transition-colors ${graphicsEnabled ? 'text-indigo-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200'}`}>Standard</span>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mt-1">Glassmorphism • High GPU</span>
                </button>

                {/* Lite Mode */}
                <button 
                    onClick={() => setMode('lite')}
                    className={`
                        relative flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-300 group
                        ${!graphicsEnabled 
                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10' 
                            : 'border-slate-200 dark:border-white/5 hover:border-emerald-200 dark:hover:border-white/20'
                        }
                    `}
                >
                    {!graphicsEnabled && <div className="absolute top-3 right-3 text-emerald-500"><CheckCircle2 size={16} /></div>}
                    <div className={`p-3 rounded-full mb-3 transition-colors ${!graphicsEnabled ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 dark:bg-white/5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`}>
                        <BatteryCharging size={24} />
                    </div>
                    <span className={`text-sm font-bold transition-colors ${!graphicsEnabled ? 'text-emerald-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200'}`}>Lite Mode</span>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-600/70 dark:text-emerald-400/70 mt-1">Saves ~20% Battery</span>
                </button>
             </div>
             <p className="text-[10px] text-center text-slate-400 dark:text-slate-500 px-4 italic">
                {graphicsEnabled 
                    ? "Full visual fidelity. Uses roughly 15-20% more battery during active scrolling." 
                    : "Removes blur and transparency for maximum power efficiency."}
             </p>
          </div>

          <div className="h-px bg-slate-100 dark:bg-white/5 w-full" />

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
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-white shadow-sm ${id === 'midnight' ? 'border border-white/20' : ''}`}
                          style={{ backgroundColor: id === 'midnight' ? '#000000' : config.colors.accent }}
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

          {/* Visual Preferences - Disabled in Lite Mode */}
          <div className={`space-y-3 transition-all duration-300 ${!graphicsEnabled ? 'opacity-40 grayscale pointer-events-none select-none' : ''}`}>
             <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Visual Effects</label>
                {(!graphicsEnabled) && <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-500">Disabled in Lite Mode</span>}
             </div>
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

                {/* Particles Toggle */}
                <button 
                  onClick={toggleParticles}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${showParticles ? 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                        <Layers size={18} />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-slate-900 dark:text-white">Background Elements</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">
                        Stars, shapes & floating objects
                      </p>
                    </div>
                  </div>
                  <div className={`w-10 h-5 rounded-full relative transition-colors ${showParticles ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-600'}`}>
                      <div className={`absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm transition-all duration-300 ${showParticles ? 'left-6' : 'left-1'}`} />
                  </div>
                </button>

                {/* Parallax Toggle */}
                <button 
                  onClick={toggleParallax}
                  disabled={!showParticles}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-white/10 transition-colors ${!showParticles ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-50 dark:hover:bg-white/5'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${parallaxEnabled && showParticles ? 'bg-pink-100 text-pink-600 dark:bg-pink-500/20 dark:text-pink-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                        <MousePointer2 size={18} />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-slate-900 dark:text-white">Parallax Effect</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">
                        Depth movement on mouse hover
                      </p>
                    </div>
                  </div>
                  <div className={`w-10 h-5 rounded-full relative transition-colors ${parallaxEnabled && showParticles ? 'bg-pink-500' : 'bg-slate-300 dark:bg-slate-600'}`}>
                      <div className={`absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm transition-all duration-300 ${parallaxEnabled && showParticles ? 'left-6' : 'left-1'}`} />
                  </div>
                </button>
             </div>
          </div>

          <div className="h-px bg-slate-100 dark:bg-white/5 w-full" />

          {/* Sound Settings */}
          <div className="space-y-3">
             <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Audio Feedback</label>
             <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 rounded-xl space-y-4">
                <button
                  onClick={toggleSound}
                  className="w-full flex items-center justify-between p-2 -ml-2 rounded-lg hover:bg-slate-200 dark:hover:bg-white/5 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded-lg ${soundEnabled ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400' : 'bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400'}`}>
                            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                        </div>
                        <span className="text-sm font-bold text-slate-900 dark:text-white">Click Sounds</span>
                    </div>
                    <div className={`w-10 h-5 rounded-full relative transition-colors ${soundEnabled ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-slate-600'}`}>
                      <div className={`absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm transition-all duration-300 ${soundEnabled ? 'left-6' : 'left-1'}`} />
                    </div>
                </button>

                {soundEnabled && (
                  <div className="space-y-4 pl-1 animate-in slide-in-from-top-2 fade-in duration-300">
                      <div className="h-px bg-slate-200 dark:bg-white/5 w-full" />
                      
                      {/* Pitch Slider */}
                      <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-bold text-slate-900 dark:text-white">Pitch (Tone)</span>
                                <span className="text-xs font-mono font-bold text-indigo-500">{soundPitch}Hz</span>
                            </div>
                            <input 
                                type="range" 
                                min="200" 
                                max="1200" 
                                step="50"
                                value={soundPitch}
                                onChange={(e) => setSoundPitch(Number(e.target.value))}
                                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-indigo-500"
                            />
                            <p className="text-[10px] text-slate-500 dark:text-slate-400">
                                Low = Thud. High = Click.
                            </p>
                      </div>

                      {/* Volume / Softness Slider */}
                      <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-bold text-slate-900 dark:text-white">Volume / Softness</span>
                                <span className="text-xs font-mono font-bold text-emerald-500">{Math.round(soundVolume * 100)}%</span>
                            </div>
                            <input 
                                type="range" 
                                min="0.1" 
                                max="1.0" 
                                step="0.1"
                                value={soundVolume}
                                onChange={(e) => setSoundVolume(Number(e.target.value))}
                                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-emerald-500"
                            />
                      </div>
                  </div>
                )}
             </div>
          </div>

          {/* Animation Tuning Section */}
          <div className="space-y-3">
             <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Animation Tuning</label>
             <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 rounded-xl space-y-4">
                
                {/* Swipe Toggle */}
                <button
                  onClick={toggleSwipeAnimation}
                  className="w-full flex items-center justify-between p-2 -ml-2 rounded-lg hover:bg-slate-200 dark:hover:bg-white/5 transition-colors"
                >
                    <span className="text-sm font-bold text-slate-900 dark:text-white">Swipe Transitions</span>
                    <div className={`w-10 h-5 rounded-full relative transition-colors ${swipeAnimationEnabled ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-slate-600'}`}>
                      <div className={`absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm transition-all duration-300 ${swipeAnimationEnabled ? 'left-6' : 'left-1'}`} />
                    </div>
                </button>
                
                {/* Sliders */}
                {animationsEnabled && (
                  <>
                    <div className="h-px bg-slate-200 dark:bg-white/5 w-full" />

                    <div className={`space-y-4 transition-opacity ${!swipeAnimationEnabled ? 'opacity-40 pointer-events-none' : ''}`}>
                        {/* Stiffness Slider */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-bold text-slate-900 dark:text-white">Swipe Speed (Stiffness)</span>
                                <span className="text-xs font-mono font-bold text-indigo-500">{swipeStiffness}</span>
                            </div>
                            <input 
                                type="range" 
                                min="50" 
                                max="8000" 
                                step="50"
                                value={swipeStiffness}
                                onChange={(e) => setSwipeStiffness(Number(e.target.value))}
                                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-indigo-500"
                            />
                            <p className="text-[10px] text-slate-500 dark:text-slate-400">
                                Higher = Faster/Snappier. Lower = Slower/Softer. (Default: 600)
                            </p>
                        </div>

                        {/* Damping Slider */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-bold text-slate-900 dark:text-white">Bounce Control (Damping)</span>
                                <span className="text-xs font-mono font-bold text-emerald-500">{swipeDamping}</span>
                            </div>
                            <input 
                                type="range" 
                                min="5" 
                                max="500" 
                                step="5"
                                value={swipeDamping}
                                onChange={(e) => setSwipeDamping(Number(e.target.value))}
                                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-emerald-500"
                            />
                            <p className="text-[10px] text-slate-500 dark:text-slate-400">
                                Lower = More Bounce. Higher = Less Bounce. (Default: 40)
                            </p>
                        </div>
                    </div>
                  </>
                )}
             </div>
          </div>

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

          {/* Support Section - Buy me a coffee */}
          <div className="space-y-3">
             <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
                Buy me a coffee ☕
             </label>
             <div className="p-1">
                <BuyMeCoffee />
             </div>
          </div>

          {/* Danger Zone */}
          <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-white/10">
             <label className="text-xs font-bold text-rose-500 uppercase tracking-widest flex items-center gap-2">
                <AlertTriangle size={12} /> Danger Zone
             </label>
             <button 
               onClick={handleClearData}
               className="w-full flex items-center justify-between p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 rounded-xl hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-colors group"
             >
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 group-hover:bg-rose-200 dark:group-hover:bg-rose-500/30 transition-colors">
                        <Trash2 size={18} />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-rose-700 dark:text-rose-300">Clear All Data</p>
                      <p className="text-[10px] text-rose-600/70 dark:text-rose-400/70 uppercase font-bold tracking-wider">
                        Reset app & local storage
                      </p>
                    </div>
                </div>
             </button>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/5 text-center shrink-0">
          <p className="text-[10px] text-slate-400 dark:text-slate-600 font-mono">Trackly v1.3.2</p>
        </div>
      </Card>
    </div>
  );
};
