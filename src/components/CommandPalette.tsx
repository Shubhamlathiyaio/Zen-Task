import React, { useState, useEffect } from 'react';
import { Command } from 'cmdk';
import { useStore } from '../store/useStore';
import { 
  Search, 
  CheckSquare, 
  Timer, 
  ShoppingBag, 
  Users, 
  Settings,
  Play
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const setCurrentView = useStore((state) => state.setCurrentView);
  const tasks = useStore((state) => state.tasks);
  const setTimerMode = useStore((state) => state.setTimerMode);

  // Toggle the menu when Cmd/Ctrl+K is pressed or close on Escape
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  if (!open) return null;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] flex items-start justify-center pt-32 p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) setOpen(false);
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          className="w-full max-w-xl bg-(--color-surface) border border-(--color-border) rounded-2xl shadow-2xl overflow-hidden"
        >
          <Command 
            className="w-full"
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                e.preventDefault();
                setOpen(false);
              }
            }}
          >
            <div className="flex items-center border-b border-(--color-border) px-4">
              <Search className="w-5 h-5 text-(--color-muted-text)" />
              <Command.Input 
                autoFocus 
                placeholder="Type a command or search..." 
                className="w-full bg-transparent border-none focus:outline-none text-(--color-on-surface) py-4 px-3 text-lg outline-none ring-0"
              />
              <span className="text-xs text-(--color-muted-text) bg-(--color-neutral) px-2 py-1 rounded">ESC</span>
            </div>

            <Command.List className="max-h-[300px] overflow-y-auto p-2 custom-scrollbar">
              <Command.Empty className="py-6 text-center text-(--color-muted-text)">No results found.</Command.Empty>

              <Command.Group heading="Navigation" className="text-xs font-bold text-(--color-muted-text) mb-2 px-2 pt-2">
                <Command.Item 
                  onSelect={() => { setCurrentView('tasks'); setOpen(false); }}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer hover:bg-(--color-primary) hover:text-white transition-colors"
                >
                  <CheckSquare className="w-5 h-5" />
                  <span className="text-sm font-medium">Go to Quests (Tasks)</span>
                </Command.Item>
                <Command.Item 
                  onSelect={() => { setCurrentView('timer'); setOpen(false); }}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer hover:bg-(--color-primary) hover:text-white transition-colors"
                >
                  <Timer className="w-5 h-5" />
                  <span className="text-sm font-medium">Go to Focus Timer</span>
                </Command.Item>
                <Command.Item 
                  onSelect={() => { setCurrentView('store'); setOpen(false); }}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer hover:bg-(--color-primary) hover:text-white transition-colors"
                >
                  <ShoppingBag className="w-5 h-5" />
                  <span className="text-sm font-medium">Go to Store</span>
                </Command.Item>
                <Command.Item 
                  onSelect={() => { setCurrentView('party'); setOpen(false); }}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer hover:bg-(--color-primary) hover:text-white transition-colors"
                >
                  <Users className="w-5 h-5" />
                  <span className="text-sm font-medium">Go to Party</span>
                </Command.Item>
                <Command.Item 
                  onSelect={() => { setCurrentView('settings'); setOpen(false); }}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer hover:bg-(--color-primary) hover:text-white transition-colors"
                >
                  <Settings className="w-5 h-5" />
                  <span className="text-sm font-medium">Go to Settings</span>
                </Command.Item>
              </Command.Group>

              <Command.Group heading="Quick Actions" className="text-xs font-bold text-(--color-muted-text) mb-2 px-2 pt-2 border-t border-(--color-border) mt-2">
                <Command.Item 
                  onSelect={() => { setTimerMode('work'); setCurrentView('timer'); setOpen(false); }}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer hover:bg-(--color-primary) hover:text-white transition-colors"
                >
                  <Play className="w-5 h-5" />
                  <span className="text-sm font-medium">Start Pomodoro Session</span>
                </Command.Item>
              </Command.Group>

              {tasks.length > 0 && (
                <Command.Group heading="Pending Quests" className="text-xs font-bold text-(--color-muted-text) mb-2 px-2 pt-2 border-t border-(--color-border) mt-2">
                  {tasks.filter(t => t.status === 'pending').slice(0, 5).map(task => (
                    <Command.Item 
                      key={task.id}
                      onSelect={() => { setCurrentView('tasks'); setOpen(false); }}
                      className="flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer hover:bg-(--color-primary) hover:text-white transition-colors"
                    >
                      <div className={`w-3 h-3 rounded-full ${
                        task.quadrant === 'q1_urgent_important' ? 'bg-red-500' :
                        task.quadrant === 'q2_not_urgent_important' ? 'bg-blue-500' :
                        task.quadrant === 'q3_urgent_not_important' ? 'bg-amber-500' :
                        'bg-gray-500'
                      }`} />
                      <span className="text-sm font-medium truncate">{task.title}</span>
                    </Command.Item>
                  ))}
                </Command.Group>
              )}
            </Command.List>
          </Command>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
