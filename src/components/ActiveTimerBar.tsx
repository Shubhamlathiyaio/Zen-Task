import React from 'react';
import { useStore } from '../store/useStore';
import { Play, Pause, Square, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

export default function ActiveTimerBar() {
  const { activeTimers, pauseActiveTimer, resumeActiveTimer, stopActiveTimer } = useStore();

  const handleStop = (e: React.MouseEvent, timerId: string) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;
    
    confetti({
      particleCount: 30,
      spread: 50,
      origin: { x, y },
      colors: ['#F59E0B', '#FCD34D'],
      disableForReducedMotion: true,
      gravity: 1.2,
      ticks: 200,
      shapes: ['circle']
    });
    
    try {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3');
      audio.volume = 0.5;
      audio.play().catch(console.error);
    } catch (err) {}
    
    stopActiveTimer(timerId);
  };

  if (activeTimers.length === 0) return null;

  return (
    <div className="fixed bottom-[72px] md:bottom-6 left-0 right-0 z-40 flex justify-center pointer-events-none px-4">
      <div className="flex gap-4 overflow-x-auto custom-scrollbar w-full max-w-4xl pb-2 snap-x pointer-events-auto items-end">
        <AnimatePresence>
          {activeTimers.map((timer) => {
            const minutes = Math.floor(timer.elapsed / 60);
            const seconds = Math.floor(timer.elapsed % 60);
            const coinsEarned = minutes * timer.multiplier;
            
            return (
              <motion.div 
                key={timer.id}
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-(--color-surface) border-2 border-(--color-primary-60) rounded-2xl shadow-2xl p-3 flex items-center gap-4 min-w-[280px] md:min-w-[320px] snap-center shrink-0 backdrop-blur-md bg-opacity-95"
              >
                {/* Status indicator */}
                <div className={`w-3 h-3 rounded-full shrink-0 ${timer.isRunning ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`}></div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-(--color-primary-60) shrink-0">{timer.type}</span>
                    <h4 className="text-sm font-bold text-(--color-on-surface) truncate m-0" style={{ fontFamily: 'var(--font-roboto)' }}>{timer.title}</h4>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <div className="flex items-center gap-1.5 text-(--color-on-surface) font-mono text-lg tracking-wider font-bold">
                      {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
                    </div>
                    <div className="text-xs font-bold text-(--color-reward) bg-(--color-surface-2) px-2 py-0.5 rounded-full">
                      +{coinsEarned} <span className="text-(--color-muted-text)">coins</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 shrink-0">
                  <button 
                    onClick={() => timer.isRunning ? pauseActiveTimer(timer.id) : resumeActiveTimer(timer.id)}
                    className="w-10 h-10 rounded-full flex items-center justify-center bg-(--color-surface-2) text-(--color-on-surface) hover:bg-(--color-primary-60) transition-colors border-none cursor-pointer"
                  >
                    {timer.isRunning ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-1" />}
                  </button>
                  <button 
                    onClick={(e) => handleStop(e, timer.id)}
                    className="w-10 h-10 rounded-full flex items-center justify-center bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-colors border-none cursor-pointer"
                  >
                    <Square className="w-4 h-4 fill-current" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {activeTimers.length > 0 && (
          <div className="min-w-[140px] md:min-w-[180px] h-1 shrink-0 snap-end" />
        )}
      </div>
    </div>
  );
}
