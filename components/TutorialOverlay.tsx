import React, { useEffect, useState, useLayoutEffect, useRef } from 'react';
import { ChevronRight, X, Check } from 'lucide-react';
import { Card } from './Card';

export interface TutorialStep {
  title: string;
  description: string;
  view: string;
  targetId: string; // DOM ID to highlight
  icon: any;
}

interface TutorialOverlayProps {
  steps: TutorialStep[];
  currentStep: number;
  onNext: () => void;
  onClose: () => void;
}

export const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ steps, currentStep, onNext, onClose }) => {
  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [windowSize, setWindowSize] = useState({ w: window.innerWidth, h: window.innerHeight });

  // Update target rect on step change or resize
  const updateRect = () => {
    const el = document.getElementById(step.targetId);
    if (el) {
      // Scroll into view with some padding
      el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
      
      // Wait a bit for scroll/render to settle
      setTimeout(() => {
        const rect = el.getBoundingClientRect();
        // Add some padding to the highlight
        setTargetRect(DOMRect.fromRect({
          x: rect.left - 10,
          y: rect.top - 10,
          width: rect.width + 20,
          height: rect.height + 20
        }));
      }, 300);
    } else {
        // Fallback if element not found (e.g., transitions) - center screen
        setTargetRect(null); 
    }
  };

  useLayoutEffect(() => {
    updateRect();
    const handleResize = () => {
        setWindowSize({ w: window.innerWidth, h: window.innerHeight });
        updateRect();
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [currentStep, step.targetId]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Enter') onNext();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNext, onClose]);

  // Calculate Card Position relative to target
  const getCardStyle = () => {
    if (!targetRect) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };

    const cardWidth = 320; // Approx width
    const cardHeight = 250; // Approx height
    const margin = 20;

    // Check space on right
    if (targetRect.right + cardWidth + margin < windowSize.w) {
        return { 
            top: Math.min(Math.max(margin, targetRect.top), windowSize.h - cardHeight - margin), 
            left: targetRect.right + margin 
        };
    }
    // Check space on left
    if (targetRect.left - cardWidth - margin > 0) {
        return { 
            top: Math.min(Math.max(margin, targetRect.top), windowSize.h - cardHeight - margin), 
            left: targetRect.left - cardWidth - margin 
        };
    }
    // Check space on bottom
    if (targetRect.bottom + cardHeight + margin < windowSize.h) {
        return { 
            top: targetRect.bottom + margin, 
            left: Math.max(margin, Math.min(targetRect.left, windowSize.w - cardWidth - margin)) 
        };
    }
    // Default to top (or center if really cramped)
    return { 
        top: Math.max(margin, targetRect.top - cardHeight - margin), 
        left: Math.max(margin, Math.min(targetRect.left, windowSize.w - cardWidth - margin)) 
    };
  };

  const cardStyle = getCardStyle();

  return (
    <div className="fixed inset-0 z-[100] animate-in fade-in duration-500">
      
      {/* SVG Spotlight Mask */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none transition-all duration-500 ease-in-out">
        <defs>
          <mask id="spotlight-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {targetRect && (
              <rect 
                x={targetRect.x} 
                y={targetRect.y} 
                width={targetRect.width} 
                height={targetRect.height} 
                rx="16" 
                fill="black" 
                className="transition-all duration-500 ease-in-out"
              />
            )}
          </mask>
        </defs>
        <rect 
            x="0" 
            y="0" 
            width="100%" 
            height="100%" 
            fill="rgba(0,0,0,0.75)" 
            mask="url(#spotlight-mask)" 
        />
        {/* Border Ring around target */}
        {targetRect && (
            <rect 
                x={targetRect.x} 
                y={targetRect.y} 
                width={targetRect.width} 
                height={targetRect.height} 
                rx="16" 
                fill="none"
                stroke="rgba(99, 102, 241, 0.5)"
                strokeWidth="2"
                className="transition-all duration-500 ease-in-out animate-pulse"
            />
        )}
      </svg>

      {/* Info Card */}
      <div 
        className="absolute transition-all duration-500 ease-in-out"
        style={cardStyle}
      >
        <Card className="w-[320px] bg-white/95 dark:bg-[#0f172a]/95 border-slate-200 dark:border-white/20 shadow-2xl backdrop-blur-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-indigo-500 rounded-xl text-white shadow-lg shadow-indigo-500/30">
                            <step.icon size={20} />
                        </div>
                        <div>
                            <span className="text-[9px] font-bold uppercase tracking-widest text-indigo-500 dark:text-indigo-400">
                                {currentStep + 1} / {steps.length}
                            </span>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">{step.title}</h3>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors p-1">
                        <X size={18} />
                    </button>
                </div>

                <p className="text-sm text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                    {step.description}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/5">
                    <button onClick={onClose} className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                        Skip
                    </button>
                    <button 
                        onClick={onNext}
                        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold uppercase text-[10px] tracking-widest shadow-lg shadow-indigo-600/20 transition-all active:scale-95 flex items-center gap-2"
                    >
                        {isLast ? 'Finish' : 'Next'} {isLast ? <Check size={14} /> : <ChevronRight size={14} />}
                    </button>
                </div>
            </div>
        </Card>
      </div>
    </div>
  );
};