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

const QUADRANT_BG_TINTS: Record<QuadrantType, string> = {
  q1_urgent_important: 'bg-red-500/15 border-4 border-red-500/60',
  q2_not_urgent_important: 'bg-blue-500/15 border-4 border-blue-500/60',
  q3_urgent_not_important: 'bg-amber-500/15 border-4 border-amber-500/60',
  q4_not_urgent_not_important: 'bg-gray-500/15 border-4 border-gray-500/60',
};

// Draggable Task Card
function SortableTaskCard({ task, deadlineMs }: { task: Task, deadlineMs: number }) {
  const { updateTaskStatus, setEditingTask, deleteTask, startActiveTimer } = useStore();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    touchAction: 'pan-y' // Ensure vertical scrolling works on mobile
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
      className={`group relative bg-(--color-surface-2) p-1.5 md:p-3 pl-3.5 md:pl-5 rounded-md flex flex-col md:flex-row justify-between items-start md:items-center gap-1.5 md:gap-2 shadow-sm border ${isNearDeadline ? 'border-red-500/50 shadow-red-500/10 bg-red-500/5' : 'border-(--color-border)'} hover:shadow-md transition-all cursor-grab active:cursor-grabbing text-left mb-1.5 md:mb-2`}
    >
      <div className={`absolute left-1 md:left-2 top-1/2 -translate-y-1/2 w-1 h-3/5 rounded-full ${QUADRANT_COLORS_BG[task.quadrant]}`} />
      
      <div className="flex flex-col min-w-0 flex-1 w-full md:w-auto">
        <span className="text-(--color-on-surface) font-medium break-words text-sm md:text-base" style={{ fontFamily: 'var(--font-roboto)' }}>{task.title}</span>
        {task.description && (
          <p className="text-[10px] md:text-xs text-(--color-muted-text) mt-0.5 md:mt-1 mb-0 break-words whitespace-pre-wrap line-clamp-2 md:line-clamp-none">{task.description}</p>
        )}
        
        <div className="flex gap-1 md:gap-2 mt-1 md:mt-2 flex-wrap items-center">
          {task.tags?.map(tag => (
            <span 
              key={tag} 
              className="text-[9px] md:text-[10px] uppercase tracking-wider px-1 md:px-2 py-0.5 rounded-full font-bold border whitespace-nowrap"
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
            <span className="text-[9px] md:text-[10px] uppercase tracking-wider px-1 md:px-2 py-0.5 rounded-full font-bold border border-red-500/20 bg-red-500/10 text-red-500 whitespace-nowrap">
              Required
            </span>
          )}
          {deadlineMs !== Infinity && (
            <span className={`text-[9px] md:text-[10px] uppercase tracking-wider px-1 md:px-2 py-0.5 rounded-full font-bold border flex items-center gap-1 whitespace-nowrap ${isNearDeadline ? 'bg-red-500/20 text-red-500 border-red-500/30' : 'bg-(--color-primary)/10 text-(--color-primary) border-(--color-primary)/20'}`}>
              ⏱️ {deadlineString}
            </span>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-2 shrink-0 self-end md:self-auto mt-1 md:mt-0 pt-1 md:pt-0 border-t md:border-t-0 border-(--color-border) w-full md:w-auto justify-between md:justify-end" onPointerDown={e => e.stopPropagation()}>
        <div className="flex items-center gap-1 md:gap-2">
          <button 
            onClick={(e) => {
               e.stopPropagation();
               const multiplier = task.quadrant === 'q1_urgent_important' ? 4 : task.quadrant === 'q2_not_urgent_important' ? 3 : task.quadrant === 'q3_urgent_not_important' ? 2 : 1;
               startActiveTimer(task.id, 'task', task.title, multiplier);
            }}
            className="text-(--color-muted-text) hover:text-(--color-primary-60) transition-colors bg-transparent border-none cursor-pointer p-1.5 opacity-100 sm:opacity-0 group-hover:opacity-100"
            title="Start Timer"
          >
            <Play className="w-4 h-4" />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); setEditingTask(task); }}
            className="text-(--color-muted-text) hover:text-(--color-primary-60) transition-colors bg-transparent border-none cursor-pointer p-1.5 opacity-100 sm:opacity-0 group-hover:opacity-100"
            title="Edit"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button 
            onClick={(e) => { 
              e.stopPropagation(); 
              if (window.confirm('Are you sure you want to delete this quest?')) {
                deleteTask(task.id); 
              }
            }}
            className="text-(--color-muted-text) hover:text-red-500 transition-colors bg-transparent border-none cursor-pointer p-1.5 opacity-100 sm:opacity-0 group-hover:opacity-100 mr-1 md:mr-2"
            title="Delete Quest"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <span className="text-(--color-reward) font-bold text-xs md:text-sm">
            +{task.reward_amount}
          </span>
        </div>
        <button 
          className="text-(--color-muted-text) hover:text-(--color-primary-60) rounded-md w-8 h-8 md:w-10 md:h-10 flex items-center justify-center transition-all cursor-pointer z-20 bg-transparent border-none group"
          onClick={(e) => {
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
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3');
            audio.volume = 0.5;
            audio.play().catch(console.error);
            updateTaskStatus(task.id, 'completed');
          }}
          title="Complete Quest"
        >
          <div className="w-6 h-6 md:w-8 md:h-8 rounded-md flex items-center justify-center border-2 md:border-[3px] border-current group-hover:bg-(--color-primary-60) group-hover:border-(--color-primary-60) group-active:scale-90 transition-all">
            <Check className="w-3.5 h-3.5 md:w-5 md:h-5 text-transparent group-hover:text-white" strokeWidth={4} />
          </div>
        </button>
      </div>
    </div>
  );
}

// Droppable Quadrant
import { useDroppable } from '@dnd-kit/core';

function QuadrantContainer({ 
  id, title, tasks, isActiveMobile, onClick 
}: { 
  id: QuadrantType, title: string, tasks: { task: Task, deadlineMs: number }[], isActiveMobile: boolean, onClick: () => void 
}) {
  const { setNodeRef } = useDroppable({ id });
  
  return (
    <div 
      ref={setNodeRef} 
      onClick={onClick}
      className={`${QUADRANT_BG_TINTS[id]} rounded-xl shadow-xl border flex flex-col transition-all duration-300 relative
        ${isActiveMobile ? 'p-4 md:p-6 overflow-y-auto cursor-default' : 'p-3 md:p-6 overflow-hidden cursor-pointer opacity-70 hover:opacity-100'} 
        md:min-h-[300px] w-full h-full
      `}
    >
      <div className="flex items-center gap-2 mb-2 md:mb-4">
        <h3 
          className={`font-bold text-(--color-on-surface) transition-all md:text-xl md:whitespace-normal
            ${isActiveMobile ? 'text-lg whitespace-normal' : 'text-sm whitespace-nowrap overflow-hidden text-ellipsis'} 
          `} 
          style={{ fontFamily: 'var(--font-varela)' }}
        >
          {title}
        </h3>
        {!isActiveMobile && (
          <div className={`md:hidden shrink-0 text-xs font-bold px-2 py-0.5 rounded-full bg-(--color-on-surface) text-(--color-surface)`}>
            {tasks.length}
          </div>
        )}
      </div>
      
      <div className={`flex flex-col gap-3 flex-1 min-h-[50px] md:min-h-[150px] ${!isActiveMobile ? 'hidden md:flex' : 'flex'}`}>
        <SortableContext id={id} items={tasks.map(t => t.task.id)} strategy={verticalListSortingStrategy}>
          <AnimatePresence>
            {tasks.map(({ task, deadlineMs }) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <SortableTaskCard task={task} deadlineMs={deadlineMs} />
              </motion.div>
            ))}
          </AnimatePresence>
          {tasks.length === 0 && (
            <div className="flex-1 flex items-center justify-center border-2 border-dashed border-(--color-border) rounded-lg p-4 opacity-50 min-h-[100px]">
              <span className="text-(--color-muted-text) text-sm text-center">Drop quests here</span>
            </div>
          )}
        </SortableContext>
      </div>
    </div>
  );
}


export default function EisenhowerMatrix() {
  const { tasks, setTasks, user, setCurrentView, taskFilterTag, taskFilterTimeline, taskFilterPriority, quadrantRules } = useStore();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeMobileQuadrant, setActiveMobileQuadrant] = useState<QuadrantType>('q1_urgent_important');
  const [, setTick] = useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 60000);
    return () => clearInterval(interval);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

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
  });

  const getQuadrantTasks = (q: QuadrantType) => pendingTasks
    .filter(t => t.quadrant === q)
    .map(task => ({ task, deadlineMs: getTaskDeadline(task) }))
    .sort((a, b) => a.deadlineMs - b.deadlineMs);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: any) => {
    const { active, over } = event;
    if (!over) return;
    
    const activeTaskId = active.id as string;
    const overId = over.id as string;
    
    // Set active mobile quadrant for animation on drag-hover
    const isOverQuadrant = ['q1_urgent_important', 'q2_not_urgent_important', 'q3_urgent_not_important', 'q4_not_urgent_not_important'].includes(overId);
    if (isOverQuadrant) {
      setActiveMobileQuadrant(overId as QuadrantType);
    } else {
      const overTask = tasks.find(t => t.id === overId);
      if (overTask) {
        setActiveMobileQuadrant(overTask.quadrant);
      }
    }

    if (activeTaskId === overId) return;

    const activeIndex = tasks.findIndex(t => t.id === activeTaskId);
    if (activeIndex === -1) return;
    
    const activeTask = tasks[activeIndex];
    
    if (isOverQuadrant) {
      const destQ = overId as QuadrantType;
      if (activeTask.quadrant !== destQ) {
        const newTasks = [...tasks];
        newTasks[activeIndex] = { ...activeTask, quadrant: destQ };
        setTasks(newTasks);
      }
    } else {
      const overIndex = tasks.findIndex(t => t.id === overId);
      if (overIndex !== -1) {
        const destQ = tasks[overIndex].quadrant;
        if (activeTask.quadrant !== destQ) {
          const newTasks = [...tasks];
          newTasks[activeIndex] = { ...activeTask, quadrant: destQ };
          setTasks(arrayMove(newTasks, activeIndex, overIndex));
        }
      }
    }
  };

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    setActiveId(null);
    
    if (!over) return;
    
    const activeTaskId = active.id as string;
    const overId = over.id as string;

    const activeIndex = tasks.findIndex(t => t.id === activeTaskId);
    const overIndex = tasks.findIndex(t => t.id === overId);
    
    let finalTasks = tasks;
    if (activeIndex !== -1 && overIndex !== -1 && activeIndex !== overIndex) {
      finalTasks = arrayMove(tasks, activeIndex, overIndex);
      setTasks(finalTasks);
    }
      
    if (user) {
      const finalTask = finalTasks.find(t => t.id === activeTaskId);
      if (finalTask) {
        await supabase.from('tasks').update({ quadrant: finalTask.quadrant }).eq('id', activeTaskId);
      }
    }
  };

  const activeTask = activeId ? tasks.find(t => t.id === activeId) : null;

  const mCols = (activeMobileQuadrant === 'q1_urgent_important' || activeMobileQuadrant === 'q3_urgent_not_important') ? '85% 15%' : '15% 85%';
  const mRows = (activeMobileQuadrant === 'q1_urgent_important' || activeMobileQuadrant === 'q2_not_urgent_important') ? '85% 15%' : '15% 85%';

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-6">
      <style>{`
        .dynamic-mobile-grid {
          display: grid;
          gap: 0.5rem;
          height: 55vh;
          min-height: 320px;
          max-height: 480px;
          transition: grid-template-columns 0.35s ease, grid-template-rows 0.35s ease;
          grid-template-columns: var(--m-cols);
          grid-template-rows: var(--m-rows);
        }
        @media (min-width: 768px) {
          .dynamic-mobile-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            grid-template-rows: auto;
            height: auto;
            gap: 1.5rem;
          }
        }
      `}</style>
      
      <DndContext 
        sensors={sensors} 
        collisionDetection={closestCorners} 
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div 
          className="dynamic-mobile-grid w-full"
          style={{ '--m-cols': mCols, '--m-rows': mRows } as React.CSSProperties}
        >
          <QuadrantContainer 
            id="q1_urgent_important" 
            title="Q1: Urgent & Important" 
            tasks={getQuadrantTasks('q1_urgent_important')} 
            isActiveMobile={activeMobileQuadrant === 'q1_urgent_important'}
            onClick={() => setActiveMobileQuadrant('q1_urgent_important')}
          />
          <QuadrantContainer 
            id="q2_not_urgent_important" 
            title="Q2: Not Urgent, Important" 
            tasks={getQuadrantTasks('q2_not_urgent_important')} 
            isActiveMobile={activeMobileQuadrant === 'q2_not_urgent_important'}
            onClick={() => setActiveMobileQuadrant('q2_not_urgent_important')}
          />
          <QuadrantContainer 
            id="q3_urgent_not_important" 
            title="Q3: Urgent, Not Important" 
            tasks={getQuadrantTasks('q3_urgent_not_important')} 
            isActiveMobile={activeMobileQuadrant === 'q3_urgent_not_important'}
            onClick={() => setActiveMobileQuadrant('q3_urgent_not_important')}
          />
          <QuadrantContainer 
            id="q4_not_urgent_not_important" 
            title="Q4: Neither (Eliminate)" 
            tasks={getQuadrantTasks('q4_not_urgent_not_important')} 
            isActiveMobile={activeMobileQuadrant === 'q4_not_urgent_not_important'}
            onClick={() => setActiveMobileQuadrant('q4_not_urgent_not_important')}
          />
        </div>

      <DragOverlay>
        {activeTask ? (
          <div className="opacity-90 scale-105 rotate-2 cursor-grabbing">
            <SortableTaskCard task={activeTask} deadlineMs={getTaskDeadline(activeTask)} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
    </div>
  );
}
