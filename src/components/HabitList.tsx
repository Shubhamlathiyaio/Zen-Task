import React from 'react';
import { useStore, type Habit } from '../store/useStore';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Trash2, Play, Flame } from 'lucide-react';
import confetti from 'canvas-confetti';
import { getTagColor, getTagTextColor } from '../lib/colors';

export default function HabitList() {
  const { habits, updateHabitStatus, startActiveTimer, user, setHabits, taskFilterTag, taskFilterTimeline, taskFilterPriority } = useStore();

  const deleteHabit = async (id: string) => {
    setHabits(habits.filter(h => h.id !== id));
    if (user) {
      await supabase.from('habits').delete().eq('id', id);
    }
  };

  const filteredHabits = habits.filter(habit => {
    if (taskFilterTag && (!habit.tags || !habit.tags.includes(taskFilterTag))) return false;
    if (taskFilterTimeline !== 'all' && habit.frequency !== taskFilterTimeline) return false;
    if (taskFilterPriority && habit.frequency !== 'daily') return false; // Priority mode only shows daily habits
    return true;
  });

  if (filteredHabits.length === 0) return null;

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-4 text-(--color-on-surface) flex items-center gap-2" style={{ fontFamily: 'var(--font-varela)' }}>
        <Flame className="w-5 h-5 text-amber-500" /> Daily Habits & Routines
      </h2>
      <div className="flex flex-col gap-3">
        <AnimatePresence>
          {filteredHabits.map(habit => (
            <motion.div
              key={habit.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`bg-(--color-neutral) p-4 pl-6 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm border border-(--color-border) hover:shadow-md transition-shadow relative z-10`}
            >
              <div className={`absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1/2 rounded-full ${habit.frequency === 'daily' ? 'bg-amber-500' : habit.frequency === 'weekly' ? 'bg-blue-500' : 'bg-purple-500'}`} />
              <div className="flex items-center gap-3 w-full md:w-auto flex-1 min-w-0">
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-(--color-on-surface) font-bold text-lg break-words" style={{ fontFamily: 'var(--font-roboto)' }}>{habit.title}</span>
                  {habit.description && (
                    <p className="text-sm text-(--color-muted-text) mt-1 mb-0 break-words whitespace-pre-wrap">{habit.description}</p>
                  )}
                  
                  <div className="flex gap-2 mt-2 flex-wrap items-center">
                    {habit.tags && habit.tags.map(tag => (
                      <span 
                        key={tag} 
                        className="text-[10px] uppercase tracking-wider px-3 py-1 rounded-full font-bold border whitespace-nowrap"
                        style={{
                          backgroundColor: getTagColor(tag),
                          color: getTagTextColor(tag),
                          borderColor: getTagTextColor(tag)
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                    
                    <span className="text-xs text-(--color-muted-text) opacity-60 md:ml-2 whitespace-nowrap">
                      {habit.frequency.toUpperCase()}
                    </span>
                    {habit.streak_count > 0 && (
                      <span className="text-xs font-bold text-amber-500 bg-amber-500/10 px-2 py-1 rounded-full flex items-center gap-1">
                        <Flame className="w-3 h-3" /> {habit.streak_count}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0 self-end md:self-auto w-full md:w-auto justify-between md:justify-end border-t border-(--color-border) md:border-none pt-4 md:pt-0 mt-2 md:mt-0">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => {
                       startActiveTimer(habit.id, 'habit', habit.title, habit.reward_amount || 1);
                    }}
                    className="text-(--color-muted-text) hover:text-(--color-primary-60) transition-colors bg-(--color-surface-2) rounded-md border-none cursor-pointer p-2 opacity-50 hover:opacity-100"
                    title="Start Focus Timer"
                  >
                    <Play className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => deleteHabit(habit.id)}
                    className="text-(--color-muted-text) hover:text-red-500 transition-colors bg-(--color-surface-2) rounded-md border-none cursor-pointer p-2 opacity-50 hover:opacity-100"
                    title="Delete Habit"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="flex flex-col items-end">
                  <span className="text-(--color-reward) font-bold text-sm bg-(--color-surface-2) px-3 py-1.5 rounded-md border border-(--color-border)">
                    +{habit.reward_amount} coins / min
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
