
import React from 'react';
import { ExternalLink, BookOpen, ShoppingBag, Star, Bookmark } from 'lucide-react';
import { RECOMMENDED_RESOURCES } from '../constants';
import { Card } from './Card';

export const Resources: React.FC = () => {
  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-20">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Study Resources</h2>
        <p className="text-xs text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mt-1 font-bold">Recommended Materials for JEE Success</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {RECOMMENDED_RESOURCES.map((item, index) => {
          const colorClass = item.color === 'indigo' ? 'text-indigo-500' : 
                             item.color === 'rose' ? 'text-rose-500' : 
                             item.color === 'orange' ? 'text-orange-500' : 
                             item.color === 'emerald' ? 'text-emerald-500' : 'text-slate-500';
          
          const bgClass = item.color === 'indigo' ? 'bg-indigo-500' : 
                          item.color === 'rose' ? 'bg-rose-500' : 
                          item.color === 'orange' ? 'bg-orange-500' : 
                          item.color === 'emerald' ? 'bg-emerald-500' : 'bg-slate-500';
                          
          return (
            <Card key={item.id} className="flex flex-col h-full group hover:border-indigo-500/30 transition-all" delay={index * 0.1}>
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl bg-slate-50 dark:bg-white/5 ${colorClass}`}>
                  <BookOpen size={24} />
                </div>
                <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-lg ${bgClass} bg-opacity-10 dark:bg-opacity-20 ${colorClass}`}>
                  {item.tag}
                </span>
              </div>
              
              <div className="flex-grow">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">
                  by {item.author}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/5">
                <a 
                  href={item.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-600 dark:hover:bg-indigo-400 dark:hover:text-white transition-all shadow-lg shadow-black/5 active:scale-95"
                >
                  <ShoppingBag size={14} /> Buy on Amazon <ExternalLink size={12} />
                </a>
                <p className="text-[9px] text-center text-slate-400 mt-2 italic">
                  *Affiliate link. Helps support Trackly.
                </p>
              </div>
            </Card>
          );
        })}
      </div>
      
      {/* Disclaimer / Transparency */}
      <div className="text-center p-6 opacity-60">
         <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-widest">
            Trackly is a participant in the Amazon Associates Program
         </p>
      </div>
    </div>
  );
};
