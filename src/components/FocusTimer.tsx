import React, { useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { Play, Pause, RotateCcw, Volume2, Coffee, Brain } from 'lucide-react';

const TIMER_DURATIONS = {
  work: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60
};

export default function FocusTimer() {
  const { 
    timerMode, setTimerMode, 
    timerTimeLeft, setTimerTimeLeft, 
    timerIsRunning, setTimerIsRunning,
    tickTimer,
    soundscapes, activeSoundscape, setActiveSoundscape
  } = useStore();
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (timerIsRunning) {
      timerRef.current = setInterval(() => {
        tickTimer();
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerIsRunning, tickTimer]);

  const toggleTimer = () => setTimerIsRunning(!timerIsRunning);

  const resetTimer = () => {
    setTimerIsRunning(false);
    setTimerTimeLeft(TIMER_DURATIONS[timerMode]);
  };

  const handleModeChange = (mode: 'work' | 'shortBreak' | 'longBreak') => {
    setTimerMode(mode);
    setTimerIsRunning(false);
    setTimerTimeLeft(TIMER_DURATIONS[mode]);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
      <div className="bg-(--color-surface) rounded-2xl p-8 border border-(--color-border) shadow-xl flex flex-col items-center justify-center min-h-[400px] relative overflow-hidden">
        
        {/* Animated Background Pulse when running */}
        {timerIsRunning && (
          <div className="absolute inset-0 bg-(--color-primary)/5 animate-pulse -z-10 pointer-events-none"></div>
        )}
        
        <div className="flex gap-2 mb-8 bg-(--color-neutral) p-2 rounded-xl border border-(--color-border)">
          <button 
            onClick={() => handleModeChange('work')}
            className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 cursor-pointer transition-colors border-none ${timerMode === 'work' ? 'bg-(--color-primary) text-white' : 'bg-transparent text-(--color-muted-text) hover:text-(--color-on-surface)'}`}
          >
            <Brain className="w-4 h-4" /> Focus
          </button>
          <button 
            onClick={() => handleModeChange('shortBreak')}
            className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 cursor-pointer transition-colors border-none ${timerMode === 'shortBreak' ? 'bg-blue-500/20 text-blue-400' : 'bg-transparent text-(--color-muted-text) hover:text-(--color-on-surface)'}`}
          >
            <Coffee className="w-4 h-4" /> Short Break
          </button>
          <button 
            onClick={() => handleModeChange('longBreak')}
            className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 cursor-pointer transition-colors border-none ${timerMode === 'longBreak' ? 'bg-green-500/20 text-green-400' : 'bg-transparent text-(--color-muted-text) hover:text-(--color-on-surface)'}`}
          >
            <Coffee className="w-4 h-4" /> Long Break
          </button>
        </div>

        <div className="relative">
          <svg className="w-64 h-64 md:w-80 md:h-80 transform -rotate-90">
            <circle
              cx="50%"
              cy="50%"
              r="45%"
              className="fill-none stroke-(--color-neutral) stroke-[8]"
            />
            <circle
              cx="50%"
              cy="50%"
              r="45%"
              className={`fill-none stroke-[8] stroke-current transition-all duration-1000 ${
                timerMode === 'work' ? 'text-(--color-primary)' : 
                timerMode === 'shortBreak' ? 'text-blue-500' : 'text-green-500'
              }`}
              strokeDasharray={`${2 * Math.PI * 45 * (timerMode === 'work' ? 1.6 : 2)}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (timerMode === 'work' ? 1.6 : 2) * (1 - timerTimeLeft / TIMER_DURATIONS[timerMode])}`}
              strokeLinecap="round"
            />
          </svg>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-6xl md:text-7xl font-bold text-(--color-on-surface) font-mono tracking-tight drop-shadow-md">
              {formatTime(timerTimeLeft)}
            </span>
            <span className="text-(--color-muted-text) mt-2 uppercase tracking-widest text-sm font-bold">
              {timerMode === 'work' ? 'Stay Focused' : 'Take a breath'}
            </span>
          </div>
        </div>

        <div className="flex gap-6 mt-10">
          <button
            onClick={toggleTimer}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-lg active:scale-95 border-none ${
              timerIsRunning 
                ? 'bg-(--color-surface-2) text-(--color-on-surface) hover:bg-white/10' 
                : 'bg-(--color-primary) text-white hover:bg-(--color-primary-80)'
            }`}
          >
            {timerIsRunning ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
          </button>
          
          <button
            onClick={resetTimer}
            className="w-16 h-16 rounded-full flex items-center justify-center bg-(--color-surface-2) text-(--color-muted-text) hover:bg-white/10 hover:text-(--color-on-surface) transition-colors cursor-pointer border-none"
          >
            <RotateCcw className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="bg-(--color-surface) rounded-2xl p-6 border border-(--color-border) shadow-md">
        <h3 className="text-lg font-bold text-(--color-on-surface) mb-4 flex items-center gap-2">
          <Volume2 className="text-(--color-primary-60)" /> Ambient Soundscapes
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {soundscapes.map(sound => (
            <button
              key={sound.id}
              onClick={() => sound.unlocked && setActiveSoundscape(activeSoundscape === sound.id ? null : sound.id)}
              className={`p-4 rounded-xl flex items-center justify-between border cursor-pointer transition-all ${
                activeSoundscape === sound.id 
                  ? 'bg-(--color-primary)/20 border-(--color-primary-60) text-(--color-on-surface)' 
                  : sound.unlocked
                    ? 'bg-(--color-neutral) border-(--color-border) text-(--color-on-surface) hover:border-(--color-primary-60)/50'
                    : 'bg-black/20 border-transparent text-(--color-muted-text) opacity-50 cursor-not-allowed'
              }`}
            >
              <span className="font-bold">{sound.name}</span>
              {!sound.unlocked && (
                <span className="text-xs bg-yellow-500/20 text-yellow-500 px-2 py-1 rounded-md">
                  {sound.cost} coins
                </span>
              )}
              {activeSoundscape === sound.id && (
                <div className="flex gap-1">
                  <div className="w-1 h-3 bg-(--color-primary) animate-pulse"></div>
                  <div className="w-1 h-4 bg-(--color-primary) animate-pulse delay-75"></div>
                  <div className="w-1 h-2 bg-(--color-primary) animate-pulse delay-150"></div>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
