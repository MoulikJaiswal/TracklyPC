
import React from 'react';
import { Coffee, Heart, Sparkles, ExternalLink } from 'lucide-react';

export const BuyMeCoffee: React.FC = () => {
  return (
    <div className="space-y-4 w-full">
      {/* The Visual Scene Card - Using div instead of Card to avoid default blue/slate styles */}
      <div className="relative overflow-hidden min-h-[220px] flex items-center justify-center bg-[#2C1810] border border-amber-900/20 shadow-2xl p-0 group rounded-2xl transform-gpu">
        
        {/* Starry Night & Forest Background - Brown Theme */}
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#4A2C20] to-[#1a0f0a]">
            {/* Stars */}
            <div className="absolute top-6 left-6 w-0.5 h-0.5 bg-amber-100 rounded-full opacity-60 animate-pulse"></div>
            <div className="absolute top-10 right-10 w-1 h-1 bg-amber-200 rounded-full opacity-40 animate-pulse" style={{ animationDuration: '4s' }}></div>
            <div className="absolute top-1/4 left-1/3 w-0.5 h-0.5 bg-amber-100 rounded-full opacity-30"></div>
            
            {/* Moon */}
            <div className="absolute top-6 left-[20%] w-6 h-6 rounded-full bg-amber-100 opacity-10 blur-md"></div>
            <svg className="absolute top-6 left-[20%] w-4 h-4 text-amber-100 opacity-40" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z" />
            </svg>
        </div>

        {/* The Scene Container */}
        <div className="relative z-10 w-full h-full flex flex-col items-center justify-end">
            
            {/* Scene Composition - Responsive Sizing */}
            <svg 
                viewBox="0 0 400 240" 
                preserveAspectRatio="xMidYMid meet"
                className="w-full h-full max-w-[400px] drop-shadow-2xl"
                style={{ maxHeight: '100%' }}
            >
                <defs>
                    <radialGradient id="fireGlow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                        <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.6" />
                        <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                    </radialGradient>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                        <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                </defs>

                {/* Background Trees Silhouette (Wider) */}
                <g opacity="0.3" transform="translate(0, 15)">
                    <path d="M-20,200 L40,80 L100,200 Z" fill="#251510" />
                    <path d="M60,200 L110,110 L160,200 Z" fill="#2C1810" />
                    <path d="M300,200 L350,90 L400,200 Z" fill="#251510" />
                    <path d="M360,200 L400,120 L440,200 Z" fill="#2C1810" />
                </g>

                {/* Ground (Centered Curve) */}
                <path d="M0,200 Q200,190 400,200 L400,240 L0,240 Z" fill="#22120e" />

                {/* Campfire Group (Centered Left: X=140) */}
                <g transform="translate(140, 185)">
                    {/* Logs - Adjusted to sit firmly on ground */}
                    <g transform="translate(0, 5)">
                        <path d="M-18,10 L18,-2" stroke="#5D4037" strokeWidth="6" strokeLinecap="round" />
                        <path d="M18,10 L-18,-2" stroke="#4E342E" strokeWidth="6" strokeLinecap="round" />
                        <path d="M0,-5 L0,15" stroke="#3E2723" strokeWidth="6" strokeLinecap="round" />
                    </g>
                    
                    {/* Glow */}
                    <circle cx="0" cy="-5" r="40" fill="url(#fireGlow)" className="animate-pulse" style={{ animationDuration: '2s' }} />

                    {/* Animated Flames - Centered above logs */}
                    <g filter="url(#glow)" transform="translate(0, 5)">
                        <path d="M-6,5 Q0,-30 6,5" fill="#f59e0b" opacity="0.9">
                            <animate attributeName="d" values="M-6,5 Q0,-30 6,5; M-5,5 Q3,-25 7,5; M-6,5 Q0,-30 6,5" dur="0.8s" repeatCount="indefinite" />
                        </path>
                        <path d="M-3,5 Q2,-20 7,5" fill="#ef4444" opacity="0.8">
                            <animate attributeName="d" values="M-3,5 Q2,-20 7,5; M0,5 Q-3,-22 5,5; M-3,5 Q2,-20 7,5" dur="1.1s" repeatCount="indefinite" />
                        </path>
                        {/* Occasional Spark */}
                        <circle cx="0" cy="-20" r="1.5" fill="#fbbf24">
                             <animate attributeName="cy" values="-10;-50" dur="2s" repeatCount="indefinite" begin="0.5s" />
                             <animate attributeName="opacity" values="1;0" dur="2s" repeatCount="indefinite" begin="0.5s" />
                             <animate attributeName="cx" values="0;10" dur="2s" repeatCount="indefinite" begin="0.5s" />
                        </circle>
                    </g>
                </g>

                {/* Coffee Cup Character (Centered Right: X=260) */}
                <g transform="translate(260, 190)">
                    {/* Shadow */}
                    <ellipse cx="0" cy="22" rx="28" ry="6" fill="#000000" opacity="0.5" />

                    {/* Feet */}
                    <g transform="translate(0, 20)">
                       <ellipse cx="-12" cy="0" rx="10" ry="7" fill="#3E2723" />
                       <ellipse cx="12" cy="0" rx="10" ry="7" fill="#3E2723" />
                       <path d="M-18,2 Q-12,5 -6,2" stroke="#5D4037" strokeWidth="1.5" fill="none" />
                       <path d="M6,2 Q12,5 18,2" stroke="#5D4037" strokeWidth="1.5" fill="none" />
                    </g>

                    {/* Body (Cup) */}
                    <path d="M-30,-35 L30,-35 Q34,-35 34,-30 L28,20 Q28,30 0,30 Q-28,30 -28,20 L-34,-30 Q-34,-35 -30,-35 Z" fill="#fef3c7" />
                    
                    {/* Coffee Liquid Top */}
                    <ellipse cx="0" cy="-35" rx="30" ry="7" fill="#3E2723" />
                    <ellipse cx="0" cy="-34" rx="26" ry="5" fill="#5D4037" opacity="0.5" />

                    {/* Rim Highlight */}
                    <path d="M-30,-35 Q0,-28 30,-35" fill="none" stroke="#fffbeb" strokeWidth="2.5" opacity="0.6" />

                    {/* Handle */}
                    <path d="M30,-25 Q44,-25 44,-10 Q44,5 28,5" fill="none" stroke="#fef3c7" strokeWidth="6" strokeLinecap="round" />

                    {/* Face */}
                    <g transform="translate(0, -5)">
                        {/* Eyes */}
                        <circle cx="-10" cy="0" r="3" fill="#3E2723">
                            <animate attributeName="ry" values="3;0.5;3" dur="4s" repeatCount="indefinite" begin="2s" />
                        </circle>
                        <circle cx="10" cy="0" r="3" fill="#3E2723">
                            <animate attributeName="ry" values="3;0.5;3" dur="4s" repeatCount="indefinite" begin="2s" />
                        </circle>
                        
                        {/* Blush */}
                        <circle cx="-14" cy="6" r="4" fill="#fca5a5" opacity="0.6" />
                        <circle cx="14" cy="6" r="4" fill="#fca5a5" opacity="0.6" />

                        {/* Smile */}
                        <path d="M-5,5 Q0,9 5,5" fill="none" stroke="#3E2723" strokeWidth="2" strokeLinecap="round" />
                    </g>

                    {/* Steam */}
                    <g transform="translate(0, -10)">
                        <path d="M-8,-40 Q-20,-60 -8,-80" fill="none" stroke="#ffffff" strokeWidth="2.5" opacity="0.3" strokeLinecap="round">
                            <animate attributeName="d" values="M-8,-40 Q-20,-60 -8,-80; M-8,-45 Q4,-65 -8,-85; M-8,-40 Q-20,-60 -8,-80" dur="4s" repeatCount="indefinite" />
                            <animate attributeName="opacity" values="0.3;0;0.3" dur="4s" repeatCount="indefinite" />
                        </path>
                        <path d="M8,-35 Q20,-55 8,-75" fill="none" stroke="#ffffff" strokeWidth="2.5" opacity="0.2" strokeLinecap="round">
                            <animate attributeName="d" values="M8,-35 Q20,-55 8,-75; M8,-40 Q-4,-60 8,-80; M8,-35 Q20,-55 8,-75" dur="5s" repeatCount="indefinite" begin="1s" />
                            <animate attributeName="opacity" values="0.2;0;0.2" dur="5s" repeatCount="indefinite" begin="1s" />
                        </path>
                    </g>
                </g>

                {/* Floating Leaves (Atmosphere) */}
                <g>
                    <path d="M50,50 Q60,40 50,30 Q40,40 50,50" fill="#d97706" opacity="0.6" transform="translate(0,0)">
                        <animateTransform attributeName="transform" type="translate" from="0,0" to="20,50" dur="10s" repeatCount="indefinite" />
                        <animateTransform attributeName="transform" type="rotate" values="0;360" dur="8s" repeatCount="indefinite" additive="sum" />
                        <animate attributeName="opacity" values="0;0.6;0" dur="10s" repeatCount="indefinite" />
                    </path>
                    <path d="M350,40 Q360,30 350,20 Q340,30 350,40" fill="#b45309" opacity="0.5" transform="translate(0,0)">
                        <animateTransform attributeName="transform" type="translate" from="0,0" to="-30,60" dur="12s" repeatCount="indefinite" begin="2s" />
                        <animateTransform attributeName="transform" type="rotate" values="0;-360" dur="9s" repeatCount="indefinite" additive="sum" />
                        <animate attributeName="opacity" values="0;0.5;0" dur="12s" repeatCount="indefinite" begin="2s" />
                    </path>
                </g>
            </svg>
        </div>

        {/* Interactive Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#2C1810] via-transparent to-transparent opacity-60 pointer-events-none"></div>
      </div>

      {/* Support Options */}
      <div className="flex flex-col gap-3">
          <a 
            href="https://buymeacoffee.com" // Replace with your actual link
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 p-4 bg-amber-400 hover:bg-amber-300 text-amber-950 rounded-xl transition-all shadow-lg hover:shadow-amber-400/20 active:scale-95 group"
          >
              <div className="p-2 bg-amber-900/10 rounded-lg group-hover:scale-110 transition-transform">
                <Coffee size={24} strokeWidth={2.5} />
              </div>
              <div className="flex-1 text-left">
                 <span className="block text-sm font-bold uppercase tracking-wide">Buy a Coffee</span>
                 <span className="block text-[10px] font-bold opacity-60 uppercase tracking-widest">$3.00 • Keep the fire burning</span>
              </div>
              <ExternalLink size={16} className="opacity-50" />
          </a>

          <div className="grid grid-cols-2 gap-3">
              <button className="flex flex-col items-center justify-center gap-2 p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl hover:border-rose-400 dark:hover:border-rose-500/50 group transition-all">
                  <Heart size={20} className="text-rose-500 group-hover:animate-pulse" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 group-hover:text-rose-500">Share App</span>
              </button>

              <button className="flex flex-col items-center justify-center gap-2 p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl hover:border-indigo-400 dark:hover:border-indigo-500/50 group transition-all">
                  <Sparkles size={20} className="text-indigo-500 group-hover:rotate-12 transition-transform" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 group-hover:text-indigo-500">Request Feature</span>
              </button>
          </div>
      </div>
      
      <div className="text-center pt-4 opacity-50">
         <p className="text-[10px] text-slate-500 dark:text-slate-400 italic">
            "Software is easy. Physics is hard. Coffee makes both possible."
         </p>
      </div>

    </div>
  );
};
