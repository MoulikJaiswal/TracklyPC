import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = React.memo(({ children, className = '', delay = 0, onClick }) => (
  <div 
    onClick={onClick}
    className={`
      backdrop-blur-lg md:backdrop-blur-xl 
      bg-white/60 dark:bg-slate-900/40 
      border border-slate-200 dark:border-white/10 
      rounded-3xl p-5 md:p-6 shadow-xl dark:shadow-2xl 
      transition-all duration-500 
      hover:bg-white/80 dark:hover:bg-slate-900/50 
      hover:border-slate-300 dark:hover:border-white/20
      transform-gpu will-change-transform
      ${onClick ? 'cursor-pointer active:scale-95' : ''}
      ${className}
    `}
    style={{ 
      animation: `fadeIn 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) ${delay}s backwards`,
      // Enforce layer creation for GPU compositing of backdrop filters
      transform: 'translateZ(0)'
    }}
  >
    {children}
  </div>
));

export const FloatingCard: React.FC<CardProps> = React.memo(({ children, className = '', delay = 0 }) => (
  <div 
    className={`
      backdrop-blur-lg md:backdrop-blur-2xl 
      bg-white/70 dark:bg-slate-900/60 
      border border-slate-200 dark:border-white/10 
      rounded-3xl p-5 md:p-6 shadow-xl animate-float
      transform-gpu will-change-transform
      ${className}
    `}
    style={{ 
      animation: `float 6s ease-in-out infinite ${delay}s, fadeIn 1s ease-out ${delay}s backwards`,
      transform: 'translateZ(0)'
    }}
  >
    {children}
  </div>
));