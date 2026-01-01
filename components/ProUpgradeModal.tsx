import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Check, Crown, TrendingUp, Grid, CreditCard, ArrowLeft, Loader2, Lock, Zap, Image as ImageIcon } from 'lucide-react';
import { Card } from './Card';

interface ProUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
}

export const ProUpgradeModal: React.FC<ProUpgradeModalProps> = ({ isOpen, onClose, onUpgrade }) => {
  const [step, setStep] = useState<'info' | 'payment'>('info');
  const [isLoading, setIsLoading] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');

  if (!isOpen) return null;

  const handleSimulatePayment = (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      
      // Simulate network delay
      setTimeout(() => {
          setIsLoading(false);
          onUpgrade();
          onClose();
          // Reset state after animation out
          setTimeout(() => {
              setStep('info');
              setCardNumber('');
              setExpiry('');
              setCvc('');
          }, 300);
      }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-600 rounded-[2rem] blur-xl opacity-50" />
        
        <Card className="relative bg-slate-900 border border-amber-500/30 overflow-hidden flex flex-col items-center text-center p-8 min-h-[580px]">
            <button 
                onClick={onClose}
                className="absolute top-5 right-5 z-10 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
            >
                <X size={18} />
            </button>

            {step === 'info' ? (
                <div className="w-full h-full flex flex-col items-center animate-in slide-in-from-left-8 duration-300">
                    <motion.div 
                        initial={{ scale: 0, rotate: -180, x: -50, opacity: 0 }}
                        animate={{ scale: 1, rotate: 0, x: 0, opacity: 1 }}
                        transition={{ 
                            type: "spring",
                            stiffness: 260,
                            damping: 20,
                            delay: 0.1 
                        }}
                        className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-amber-500/20"
                    >
                        <Crown size={32} className="text-white" fill="currentColor" />
                    </motion.div>

                    <h2 className="text-3xl font-display font-bold text-white mb-2">Trackly Pro</h2>
                    <p className="text-amber-400 font-bold uppercase tracking-widest text-xs mb-8">Unlock Your Potential</p>

                    <div className="text-5xl font-display font-bold text-white mb-1">
                        ₹50<span className="text-lg text-slate-400 font-sans font-medium">/mo</span>
                    </div>
                    <p className="text-slate-400 text-xs mb-8">Cancel anytime. No hidden fees.</p>

                    <div className="w-full space-y-3 mb-8 text-left">
                        <div className="flex items-center gap-4 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                            <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                                <TrendingUp size={18} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-white">Unlimited Test Logs</p>
                                <p className="text-[10px] text-blue-200/60">Track every single mock test performance.</p>
                            </div>
                            <Check size={16} className="ml-auto text-blue-400" />
                        </div>
                        <div className="flex items-center gap-4 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                            <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                                <Grid size={18} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-white">Topic Heatmap</p>
                                <p className="text-[10px] text-blue-200/60">Visualise syllabus mastery with a color-coded grid.</p>
                            </div>
                            <Check size={16} className="ml-auto text-blue-400" />
                        </div>
                        <div className="flex items-center gap-4 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                            <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                                <Zap size={18} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-white">Unlimited +1 Logging</p>
                                <p className="text-[10px] text-blue-200/60">Log questions instantly during focus sessions.</p>
                            </div>
                            <Check size={16} className="ml-auto text-blue-400" />
                        </div>
                        <div className="flex items-center gap-4 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                            <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                                <ImageIcon size={18} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-white">Custom Wallpapers</p>
                                <p className="text-[10px] text-blue-200/60">Personalize your study space with any image.</p>
                            </div>
                            <Check size={16} className="ml-auto text-blue-400" />
                        </div>
                    </div>

                    <button 
                        onClick={() => setStep('payment')}
                        className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl text-white font-bold uppercase tracking-widest shadow-lg shadow-orange-500/20 hover:scale-[1.02] active:scale-95 transition-all mt-auto"
                    >
                        Upgrade Now
                    </button>
                </div>
            ) : (
                <form onSubmit={handleSimulatePayment} className="w-full h-full flex flex-col animate-in slide-in-from-right-8 duration-300">
                    <div className="flex items-center justify-between mb-6">
                        <button 
                            type="button" 
                            onClick={() => setStep('info')}
                            className="p-2 -ml-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <span className="text-xs font-bold uppercase tracking-widest text-amber-500 flex items-center gap-2">
                            <Lock size={12} /> Secure Payment
                        </span>
                        <div className="w-8" />
                    </div>

                    <div className="text-left mb-8">
                        <h3 className="text-xl font-bold text-white mb-2">Payment Details</h3>
                        <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                            <p className="text-[10px] text-indigo-300 font-medium leading-relaxed">
                                <strong>Developer Mode:</strong> Enter any fake credentials to activate Pro status immediately.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-5 mb-8">
                        <div className="space-y-2 text-left">
                            <label className="text-[10px] uppercase font-bold text-slate-500 ml-1">Card Number</label>
                            <div className="relative">
                                <CreditCard size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input 
                                    type="text" 
                                    placeholder="4242 4242 4242 4242" 
                                    className="w-full bg-slate-950/50 border border-slate-700 rounded-xl py-4 pl-11 pr-4 text-white text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all font-mono placeholder:text-slate-600"
                                    value={cardNumber}
                                    onChange={(e) => {
                                        let v = e.target.value.replace(/\D/g, '').substring(0, 16);
                                        v = v.match(/.{1,4}/g)?.join(' ') || v;
                                        setCardNumber(v);
                                    }}
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2 text-left">
                                <label className="text-[10px] uppercase font-bold text-slate-500 ml-1">Expiry</label>
                                <input 
                                    type="text" 
                                    placeholder="MM/YY" 
                                    className="w-full bg-slate-950/50 border border-slate-700 rounded-xl py-4 px-4 text-white text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all font-mono text-center placeholder:text-slate-600"
                                    value={expiry}
                                    onChange={(e) => {
                                        let v = e.target.value.replace(/\D/g, '').substring(0, 4);
                                        if (v.length >= 2) v = v.slice(0, 2) + '/' + v.slice(2);
                                        setExpiry(v);
                                    }}
                                    required
                                />
                            </div>
                            <div className="space-y-2 text-left">
                                <label className="text-[10px] uppercase font-bold text-slate-500 ml-1">CVC</label>
                                <input 
                                    type="text" 
                                    placeholder="123" 
                                    className="w-full bg-slate-950/50 border border-slate-700 rounded-xl py-4 px-4 text-white text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all font-mono text-center placeholder:text-slate-600"
                                    value={cvc}
                                    onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').substring(0, 3))}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <button 
                        type="submit"
                        disabled={isLoading || cardNumber.replace(/\s/g, '').length < 16}
                        className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl text-white font-bold uppercase tracking-widest shadow-lg shadow-orange-500/20 hover:scale-[1.02] active:scale-95 transition-all mt-auto flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 size={16} className="animate-spin" /> Processing...
                            </>
                        ) : (
                            'Complete Payment'
                        )}
                    </button>
                </form>
            )}
        </Card>
      </div>
    </div>
  );
};