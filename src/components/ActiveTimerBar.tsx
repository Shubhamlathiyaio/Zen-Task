import React from 'react';
import { useStore } from '../store/useStore';
import { Play, Pause, Square, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

export default function ActiveTimerBar() {
  const { activeTimers, pauseActiveTimer, resumeActiveTimer, stopActiveTimer } = useStore();
  
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [startX, setStartX] = React.useState(0);
  const [scrollLeft, setScrollLeft] = React.useState(0);

  if (!activeTimers || activeTimers.length === 0) return null;

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
    
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (e.deltaY !== 0 && !e.shiftKey) {
      e.currentTarget.scrollLeft += e.deltaY;
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => setIsDragging(false);
  const handleMouseUp = () => setIsDragging(false);
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <div className="fixed bottom-[60px] md:bottom-6 left-0 md:left-64 right-0 z-40 transition-all duration-300 flex justify-center pointer-events-none">
      <div className="bg-(--color-surface) text-(--color-on-surface) shadow-[0_-10px_30px_rgba(0,0,0,0.5)] md:rounded-xl relative border-t md:border border-(--color-border) flex items-center h-16 w-full md:w-auto md:min-w-[400px] md:max-w-[calc(100vw-18rem)] pointer-events-auto">
        
        {/* Timer Carousel */}
        <div 
          ref={scrollRef}
          className={`flex overflow-x-auto snap-x custom-scrollbar w-full items-center h-full pb-1 md:pb-2 ${isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'}`}
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
        >
          <style>{`.custom-scrollbar::-webkit-scrollbar { display: none !important; }`}</style>
          <AnimatePresence>
            {activeTimers.map((timer) => {
              const minutes = Math.floor(timer.elapsed / 60);
              const seconds = Math.floor(timer.elapsed % 60);
              
              return (
                <motion.div 
                  key={timer.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="w-full md:w-[360px] shrink-0 snap-center px-4 flex items-center justify-between border-r border-(--color-border) last:border-r-0"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0 pr-2">
                    <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${timer.isRunning ? 'bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-gray-500'}`}></div>
                    <span className="font-bold text-sm md:text-base truncate" style={{ fontFamily: 'var(--font-roboto)' }}>{timer.title}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-base font-mono tracking-wider font-bold">
                      {minutes}:{seconds.toString().padStart(2, '0')}
                    </span>
                    <button 
                      onClick={(e) => handleStop(e, timer.id)}
                      className="w-8 h-8 bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white rounded-full flex items-center justify-center transition-colors cursor-pointer border-none"
                    >
                      <Square className="w-3.5 h-3.5 fill-current" />
                    </button>
                    <button 
                      onClick={() => timer.isRunning ? pauseActiveTimer(timer.id) : resumeActiveTimer(timer.id)}
                      className="w-8 h-8 bg-(--color-surface-2) text-(--color-on-surface) hover:bg-(--color-primary-60) rounded-full flex items-center justify-center transition-colors cursor-pointer border-none"
                    >
                      {timer.isRunning ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
        
        {/* Pagination Dots (Optional, inside panel now) */}
        {activeTimers.length > 1 && (
          <div className="absolute left-1/2 -translate-x-1/2 bottom-1 flex gap-1">
             {activeTimers.map((t, i) => (
                <div key={t.id} className={`w-1 h-1 rounded-full ${i === 0 ? 'bg-red-500' : 'bg-gray-500'}`} />
             ))}
          </div>
        )}
      </div>
    </div>
  );
}
