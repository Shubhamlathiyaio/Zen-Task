import React from 'react';
import { useStore } from '../store/useStore';
import { motion } from 'framer-motion';
export default function TaskList() {
  const { tasks, updateTaskStatus } = useStore();
  const pendingTasks = tasks.filter(t => t.status === 'pending');

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-(--color-surface) rounded-xl p-6 shadow-xl border border-(--color-border)"
    >
      <h3 className="text-2xl mb-6 font-normal text-(--color-on-surface)" style={{ fontFamily: 'var(--font-varela)' }}>All Quests</h3>
      
      <div className="flex flex-col gap-4">
        {pendingTasks.map((task, index) => (
          <motion.div 
            key={task.id} 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-(--color-neutral) p-4 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm border border-(--color-border) hover:border-(--color-primary-60) transition-colors"
          >
            
            <div className="flex flex-col min-w-0 flex-1 w-full">
              <span className="text-(--color-on-surface) font-bold text-lg break-words" style={{ fontFamily: 'var(--font-roboto)' }}>{task.title}</span>
              
              <div className="flex gap-2 mt-2 flex-wrap items-center">
                {task.tags && task.tags.map(tag => (
                  <span key={tag} className="text-[10px] uppercase tracking-wider bg-(--color-surface-2) text-(--color-muted-text) px-3 py-1 rounded-full font-medium border border-(--color-border) whitespace-nowrap">
                    {tag}
                  </span>
                ))}
                
                {task.is_required && (
                  <span className="text-[10px] uppercase tracking-wider bg-red-500/10 text-red-400 px-3 py-1 rounded-full font-bold border border-red-500/20 whitespace-nowrap">
                    Required
                  </span>
                )}
                
                <span className="text-xs text-(--color-muted-text) opacity-60 md:ml-2 whitespace-nowrap">
                  {task.quadrant.replace(/_/g, ' ').toUpperCase()}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 shrink-0 self-end md:self-auto w-full md:w-auto justify-between md:justify-end border-t border-(--color-border) md:border-none pt-4 md:pt-0 mt-2 md:mt-0">
              <div className="flex items-center">
                <span className="text-yellow-400 font-bold text-lg px-2 bg-black/20 rounded-md border border-yellow-400/20">+{task.reward_amount}</span>
              </div>
              <button 
                className="bg-(--color-surface-2) border border-(--color-primary-60) text-(--color-primary-60) hover:bg-(--color-primary-60) hover:text-(--color-on-surface) rounded-md w-10 h-10 flex items-center justify-center transition-all cursor-pointer shadow-sm active:scale-95"
                onClick={() => updateTaskStatus(task.id, 'completed')}
                title="Complete Quest"
              >
                ✓
              </button>
            </div>

          </motion.div>
        ))}

        {pendingTasks.length === 0 && (
          <div className="text-center py-12">
            <p className="text-(--color-muted-text) text-lg italic opacity-50">The realm is quiet... no pending quests.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
