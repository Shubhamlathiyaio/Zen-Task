import React, { useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { Play, Pause, RotateCcw, Volume2, Coffee, Brain, SkipForward, Timer } from 'lucide-react';

export default function FocusTimer() {
  const { 
    timerMode, setTimerMode, 
    timerTimeLeft, setTimerTimeLeft, 
    timerIsRunning, setTimerIsRunning,
    timerSettings, setTimerSettings,
    soundscapes, activeSoundscape, setActiveSoundscape
  } = useStore();

  const getTimerDuration = (mode: 'work' | 'shortBreak' | 'longBreak') => {
    return timerSettings[mode] * 60;
  };

  const toggleTimer = () => setTimerIsRunning(!timerIsRunning);

  const resetTimer = () => {
    setTimerIsRunning(false);
    setTimerTimeLeft(getTimerDuration(timerMode));
  };

  const handleModeChange = (mode: 'work' | 'shortBreak' | 'longBreak') => {
    setTimerMode(mode);
    setTimerIsRunning(false);
    setTimerTimeLeft(getTimerDuration(mode));
  };

  const handleSkip = () => {
    if (timerMode === 'work') {
      handleModeChange('shortBreak');
    } else {
      handleModeChange('work');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Full circumference of the circle (r=45%)
  const C = 2 * Math.PI * 45;

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
          <svg className="w-64 h-64 md:w-80 md:h-80 transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              className="fill-none stroke-(--color-neutral) stroke-[6]"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              className={`fill-none stroke-[6] stroke-current transition-all duration-1000 ${
                timerMode === 'work' ? 'text-(--color-primary)' : 
                timerMode === 'shortBreak' ? 'text-blue-500' : 'text-green-500'
              }`}
              strokeDasharray={`${C}`}
              strokeDashoffset={`${C * (timerTimeLeft / getTimerDuration(timerMode))}`}
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
            onClick={resetTimer}
            className="w-16 h-16 rounded-full flex items-center justify-center bg-(--color-surface-2) text-(--color-muted-text) hover:bg-white/10 hover:text-(--color-on-surface) transition-colors cursor-pointer border-none"
            title="Reset timer"
          >
            <RotateCcw className="w-6 h-6" />
          </button>

          <button
            onClick={toggleTimer}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-lg active:scale-95 border-none ${
              timerIsRunning 
                ? 'bg-(--color-surface-2) text-(--color-on-surface) hover:bg-white/10' 
                : 'bg-(--color-primary) text-white hover:bg-(--color-primary-80)'
            }`}
            title={timerIsRunning ? 'Pause' : 'Start'}
          >
            {timerIsRunning ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
          </button>
          
          <button
            onClick={handleSkip}
            className="w-16 h-16 rounded-full flex items-center justify-center bg-(--color-surface-2) text-(--color-muted-text) hover:bg-white/10 hover:text-(--color-on-surface) transition-colors cursor-pointer border-none"
            title="Skip to next phase"
          >
            <SkipForward className="w-6 h-6" />
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
                <span className="text-xs bg-(--color-reward)/20 text-(--color-reward) px-2 py-1 rounded-md">
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
      {/* Timer Settings Section */}
      <div className="bg-(--color-surface) rounded-2xl p-6 border border-(--color-border) shadow-md">
        <h3 className="text-lg font-bold text-(--color-on-surface) mb-4 flex items-center gap-2">
          <Timer className="text-(--color-primary-60) w-5 h-5" /> Timer Configuration
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-4">
            <h4 className="text-sm font-bold text-(--color-muted-text) uppercase tracking-wider mb-2">Durations</h4>
            
            <div className="bg-(--color-neutral) rounded-xl p-4 border border-(--color-border) flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 font-bold text-(--color-on-surface)">
                  <Brain className="text-red-500 w-4 h-4" /> Focus
                </div>
                <span className="text-red-500 font-bold bg-red-500/10 px-2 py-0.5 rounded text-sm">{timerSettings.work} min</span>
              </div>
              <input 
                type="range" min="5" max="60" step="1"
                value={timerSettings.work}
                onChange={(e) => setTimerSettings({ work: parseInt(e.target.value) })}
                disabled={timerIsRunning}
                style={{ '--slider-color': '#ef4444' } as React.CSSProperties}
                className={`w-full custom-slider ${timerIsRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
              />
            </div>

            <div className="bg-(--color-neutral) rounded-xl p-4 border border-(--color-border) flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 font-bold text-(--color-on-surface)">
                  <Coffee className="text-blue-500 w-4 h-4" /> Short Break
                </div>
                <span className="text-blue-500 font-bold bg-blue-500/10 px-2 py-0.5 rounded text-sm">{timerSettings.shortBreak} min</span>
              </div>
              <input 
                type="range" min="1" max="15" step="1"
                value={timerSettings.shortBreak}
                onChange={(e) => setTimerSettings({ shortBreak: parseInt(e.target.value) })}
                disabled={timerIsRunning}
                style={{ '--slider-color': '#3b82f6' } as React.CSSProperties}
                className={`w-full custom-slider ${timerIsRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
              />
            </div>

            <div className="bg-(--color-neutral) rounded-xl p-4 border border-(--color-border) flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 font-bold text-(--color-on-surface)">
                  <Coffee className="text-green-500 w-4 h-4" /> Long Break
                </div>
                <span className="text-green-500 font-bold bg-green-500/10 px-2 py-0.5 rounded text-sm">{timerSettings.longBreak} min</span>
              </div>
              <input 
                type="range" min="5" max="30" step="1"
                value={timerSettings.longBreak}
                onChange={(e) => setTimerSettings({ longBreak: parseInt(e.target.value) })}
                disabled={timerIsRunning}
                style={{ '--slider-color': '#22c55e' } as React.CSSProperties}
                className={`w-full custom-slider ${timerIsRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
              />
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="text-sm font-bold text-(--color-muted-text) uppercase tracking-wider mb-2">Behaviour</h4>
            
            <div className="bg-(--color-neutral) rounded-xl p-4 border border-(--color-border) flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <div className="flex flex-col">
                  <div className="font-bold text-(--color-on-surface) text-sm">Cycles before long break</div>
                </div>
                <span className="text-red-500 font-bold bg-red-500/10 px-2 py-0.5 rounded text-sm">{timerSettings.cyclesBeforeLongBreak}</span>
              </div>
              <input 
                type="range" min="1" max="10" step="1"
                value={timerSettings.cyclesBeforeLongBreak}
                onChange={(e) => setTimerSettings({ cyclesBeforeLongBreak: parseInt(e.target.value) })}
                style={{ '--slider-color': '#ef4444' } as React.CSSProperties}
                className="w-full custom-slider"
              />
            </div>

            <div className="bg-(--color-neutral) rounded-xl p-4 border border-(--color-border) flex justify-between items-center gap-4">
              <div className="flex flex-col">
                <div className="font-bold text-(--color-on-surface) text-sm">Auto-start next timer</div>
              </div>
              <button 
                onClick={() => setTimerSettings({ autoStart: !timerSettings.autoStart })}
                className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer border-none shrink-0 ${timerSettings.autoStart ? 'bg-red-500' : 'bg-(--color-surface-2)'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform ${timerSettings.autoStart ? 'translate-x-5' : 'translate-x-1'}`}></div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
