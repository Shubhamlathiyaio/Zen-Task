import React, { useState } from 'react';
import { useStore, type Task, type QuadrantType } from '../store/useStore';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DndContext, 
  DragOverlay, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  useSensors, 
  type DragStartEvent, 
  type DragEndEvent,
  useSensor,
  type DragOverEvent
} from '@dnd-kit/core';
import { SortableContext, arrayMove, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Check, Pencil, Trash2, Play } from 'lucide-react';
import confetti from 'canvas-confetti';
import { getTagColor, getTagTextColor } from '../lib/colors';

const QUADRANT_COLORS_BG = {
  q1_urgent_important: 'bg-red-500',
  q2_not_urgent_important: 'bg-blue-500',
  q3_urgent_not_important: 'bg-amber-500',
  q4_not_urgent_not_important: 'bg-gray-500',
};

const QUADRANT_TITLES = {
  q1_urgent_important: 'Urgent & Important',
  q2_not_urgent_important: 'Not Urgent, Important',
  q3_urgent_not_important: 'Urgent, Not Important',
  q4_not_urgent_not_important: 'Not Urgent, Not Important',
};

const QUADRANTS: QuadrantType[] = [
  'q1_urgent_important',
  'q2_not_urgent_important',
  'q3_urgent_not_important',
  'q4_not_urgent_not_important'
];

function SortableTaskItem({ task, deadlineMs }: { task: Task, deadlineMs: number }) {
  const { updateTaskStatus, setEditingTask, deleteTask, startActiveTimer } = useStore();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    touchAction: 'pan-y'
  };

  const now = Date.now();
  const timeRemaining = deadlineMs - now;
  const isNearDeadline = deadlineMs !== Infinity && timeRemaining < 3600000; // < 1 hour
  
  let deadlineString = '';
  if (deadlineMs !== Infinity) {
    if (timeRemaining <= 0) {
      deadlineString = 'Overdue';
    } else if (timeRemaining < 60000) {
      deadlineString = '< 1 min';
    } else if (timeRemaining < 3600000) {
      deadlineString = `${Math.floor(timeRemaining / 60000)} mins left`;
    } else if (timeRemaining < 86400000) {
      deadlineString = `${Math.floor(timeRemaining / 3600000)} hours left`;
    } else {
      deadlineString = `${Math.floor(timeRemaining / 86400000)} days left`;
    }
  }

  return (
    <div 
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-(--color-neutral) p-2.5 md:p-4 pl-4 md:pl-6 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-1.5 md:gap-4 shadow-sm border ${isNearDeadline ? 'border-red-500/50 bg-red-500/5' : 'border-(--color-border)'} hover:shadow-md transition-shadow relative z-10 cursor-grab active:cursor-grabbing mb-2.5 md:mb-4`}
    >
      <div className={`absolute left-1.5 md:left-2 top-1/2 -translate-y-1/2 w-1 md:w-1.5 h-1/2 rounded-full ${QUADRANT_COLORS_BG[task.quadrant]}`} />
      <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto flex-1 min-w-0">
        <div className="flex flex-col min-w-0 flex-1">
          <span className="text-(--color-on-surface) font-bold text-sm md:text-lg break-words" style={{ fontFamily: 'var(--font-roboto)' }}>{task.title}</span>
          {task.description && (
            <p className="text-[11px] md:text-sm text-(--color-muted-text) mt-0.5 md:mt-1 mb-0 break-words whitespace-pre-wrap">{task.description}</p>
          )}
          
          <div className="flex gap-1.5 md:gap-2 mt-1.5 md:mt-2 flex-wrap items-center">
            {task.tags && task.tags.map(tag => (
              <span 
                key={tag} 
                className="text-[9px] md:text-[10px] uppercase tracking-wider px-1.5 md:px-3 py-0.5 md:py-1 rounded-full font-bold border whitespace-nowrap"
                style={{
                  backgroundColor: getTagColor(tag),
                  color: getTagTextColor(tag),
                  borderColor: getTagTextColor(tag)
                }}
              >
                {tag}
              </span>
            ))}
            
            {task.is_required && (
              <span className="text-[9px] md:text-[10px] uppercase tracking-wider bg-red-500/10 text-red-400 px-1.5 md:px-3 py-0.5 md:py-1 rounded-full font-bold border border-red-500/20 whitespace-nowrap">
                Required
              </span>
            )}
            
            <span className="text-[9px] md:text-[10px] uppercase tracking-wider px-1.5 md:px-3 py-0.5 md:py-1 rounded-full font-bold bg-(--color-surface-2) text-(--color-muted-text) whitespace-nowrap">
              {QUADRANT_TITLES[task.quadrant]}
            </span>

            {deadlineMs !== Infinity && (
              <span className={`text-[9px] md:text-[10px] uppercase tracking-wider px-1.5 md:px-3 py-0.5 md:py-1 rounded-full font-bold flex items-center gap-1 ${isNearDeadline ? 'bg-red-500/20 text-red-500 border border-red-500/30' : 'bg-(--color-primary)/10 text-(--color-primary) border border-(--color-primary)/20'}`}>
                ⏱️ {deadlineString}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4 shrink-0 self-end md:self-auto w-full md:w-auto justify-between md:justify-end border-t border-(--color-border) md:border-none pt-2 md:pt-0 mt-1.5 md:mt-0" onPointerDown={e => e.stopPropagation()}>
        <div className="flex items-center gap-1 md:gap-2">
          <button 
            onClick={(e) => {
               e.stopPropagation();
               const multiplier = task.quadrant === 'q1_urgent_important' ? 4 : task.quadrant === 'q2_not_urgent_important' ? 3 : task.quadrant === 'q3_urgent_not_important' ? 2 : 1;
               startActiveTimer(task.id, 'task', task.title, multiplier);
            }}
            className="text-(--color-muted-text) hover:text-(--color-primary) p-1.5 md:p-2 rounded-md transition-colors cursor-pointer"
            title="Start Timer"
          >
            <Play className="w-4 h-4 md:w-5 md:h-5" />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); setEditingTask(task); }}
            className="text-(--color-muted-text) hover:text-(--color-primary) p-1.5 md:p-2 rounded-md transition-colors cursor-pointer"
          >
            <Pencil className="w-4 h-4 md:w-5 md:h-5" />
          </button>
          <button 
            onClick={(e) => { 
              e.stopPropagation(); 
              if (window.confirm('Are you sure you want to delete this quest?')) {
                deleteTask(task.id); 
              }
            }}
            className="text-(--color-muted-text) hover:text-red-500 p-1.5 md:p-2 rounded-md transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
          </button>
          <span className="text-(--color-reward) font-bold text-base md:text-lg px-2 ml-1 md:ml-2">+{task.reward_amount}</span>
        </div>
        <button 
          className="text-(--color-muted-text) hover:text-(--color-primary-60) rounded-md w-10 h-10 md:w-12 md:h-12 flex items-center justify-center transition-all cursor-pointer bg-transparent border-none group"
          onPointerDown={(e) => e.stopPropagation()} 
          onClick={(e) => {
            e.stopPropagation();
            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
            const x = (rect.left + rect.width / 2) / window.innerWidth;
            const y = (rect.top + rect.height / 2) / window.innerHeight;
            
            confetti({
              particleCount: 50,
              spread: 60,
              origin: { x, y },
              colors: ['#925CF3', '#FACC15', '#4ADE80'],
              disableForReducedMotion: true
            });
            try {
              const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3');
              audio.volume = 0.5;
              audio.play().catch(console.error);
            } catch(e) {}
            updateTaskStatus(task.id, 'completed');
          }}
          title="Complete Quest"
        >
          <div className="w-6 h-6 md:w-8 md:h-8 rounded-md flex items-center justify-center border-2 md:border-[3px] border-current group-hover:bg-(--color-primary-60) group-hover:border-(--color-primary-60) group-active:scale-90 transition-all">
            <Check className="w-4 h-4 md:w-5 md:h-5 text-transparent group-hover:text-white" strokeWidth={4} />
          </div>
        </button>
      </div>
    </div>
  );
}

export default function TaskList() {
  const { tasks, setTasks, user, taskFilterTag, taskFilterTimeline, taskFilterPriority, quadrantRules } = useStore();
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [, setTick] = useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 60000);
    return () => clearInterval(interval);
  }, []);

  const getTaskDeadline = (task: Task) => {
    const rule = quadrantRules[task.quadrant];
    if (task.due_date) return new Date(task.due_date).getTime();
    if (!rule || rule.deadline === 'none') return Infinity;
    
    const createdAt = new Date(task.created_at).getTime();
    let deadlineMs = 0;
    switch (rule.deadline) {
      case '10s': deadlineMs = 10 * 1000; break;
      case '20s': deadlineMs = 20 * 1000; break;
      case '30s': deadlineMs = 30 * 1000; break;
      case '40s': deadlineMs = 40 * 1000; break;
      case 'today': deadlineMs = 24 * 60 * 60 * 1000; break;
      case 'week': deadlineMs = 7 * 24 * 60 * 60 * 1000; break;
      case 'month': deadlineMs = 30 * 24 * 60 * 60 * 1000; break;
    }
    if (deadlineMs === 0) return Infinity;
    return createdAt + deadlineMs;
  };

  const pendingTasks = tasks.filter(t => {
    if (t.status !== 'pending') return false;
    if (taskFilterTag && (!t.tags || !t.tags.includes(taskFilterTag))) return false;
    if (taskFilterTimeline !== 'all' && t.frequency !== taskFilterTimeline) return false;
    if (taskFilterPriority && t.quadrant !== 'q1_urgent_important' && !t.is_required) return false;
    return true;
  }).sort((a, b) => getTaskDeadline(a) - getTaskDeadline(b));

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = pendingTasks.find(t => t.id === active.id);
    if (task) setActiveTask(task);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = tasks.findIndex(t => t.id === active.id);
    const newIndex = tasks.findIndex(t => t.id === over.id);
    
    if (oldIndex !== -1 && newIndex !== -1) {
      const newTasks = arrayMove(tasks, oldIndex, newIndex);
      setTasks(newTasks);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-(--color-surface) rounded-xl p-4 md:p-6 shadow-xl border border-(--color-border)"
    >
      <h3 className="text-xl md:text-2xl mb-4 md:mb-6 font-normal text-(--color-on-surface)" style={{ fontFamily: 'var(--font-varela)' }}>All Quests (Priority Sorted)</h3>
      
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex flex-col">
          <SortableContext items={pendingTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
            <div className="min-h-[10px]">
              {pendingTasks.map(task => (
                <SortableTaskItem key={task.id} task={task} deadlineMs={getTaskDeadline(task)} />
              ))}
            </div>
          </SortableContext>

          {pendingTasks.length === 0 && (
            <div className="text-center py-12">
              <p className="text-(--color-muted-text) text-lg italic opacity-50">The realm is quiet... no pending quests.</p>
            </div>
          )}
        </div>
        
        <DragOverlay>
          {activeTask ? (
            <SortableTaskItem task={activeTask} deadlineMs={getTaskDeadline(activeTask)} />
          ) : null}
        </DragOverlay>
      </DndContext>
    </motion.div>
  );
}
