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

function SortableTaskItem({ task }: { task: Task }) {
  const { updateTaskStatus, setEditingTask, deleteTask, startActiveTimer } = useStore();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    touchAction: 'pan-y'
  };

  return (
    <div 
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-(--color-neutral) p-4 pl-6 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm border border-(--color-border) hover:shadow-md transition-shadow relative z-10 cursor-grab active:cursor-grabbing mb-3`}
    >
      <div className={`absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1/2 rounded-full ${QUADRANT_COLORS_BG[task.quadrant]}`} />
      <div className="flex items-center gap-3 w-full md:w-auto flex-1 min-w-0">
        <div className="flex flex-col min-w-0 flex-1">
          <span className="text-(--color-on-surface) font-bold text-lg break-words" style={{ fontFamily: 'var(--font-roboto)' }}>{task.title}</span>
          
          <div className="flex gap-2 mt-2 flex-wrap items-center">
            {task.tags && task.tags.map(tag => (
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
      </div>

      <div className="flex items-center gap-4 shrink-0 self-end md:self-auto w-full md:w-auto justify-between md:justify-end border-t border-(--color-border) md:border-none pt-4 md:pt-0 mt-2 md:mt-0" onPointerDown={e => e.stopPropagation()}>
        <div className="flex items-center gap-2">
          <button 
            onClick={(e) => {
               e.stopPropagation();
               const multiplier = task.quadrant === 'q1_urgent_important' ? 4 : task.quadrant === 'q2_not_urgent_important' ? 3 : task.quadrant === 'q3_urgent_not_important' ? 2 : 1;
               startActiveTimer(task.id, 'task', task.title, multiplier);
            }}
            className="text-(--color-muted-text) hover:text-(--color-primary-60) transition-colors bg-(--color-surface-2) rounded-md border-none cursor-pointer p-2 opacity-50 hover:opacity-100"
            title="Start Focus Timer"
          >
            <Play className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setEditingTask(task)}
            className="text-(--color-muted-text) hover:text-(--color-primary-60) transition-colors bg-(--color-surface-2) rounded-md border-none cursor-pointer p-2 opacity-50 hover:opacity-100"
            title="Edit Quest"
          >
            <Pencil className="w-5 h-5" />
          </button>
          <button 
            onClick={() => deleteTask(task.id)}
            className="text-(--color-muted-text) hover:text-red-500 transition-colors bg-(--color-surface-2) rounded-md border-none cursor-pointer p-2 opacity-50 hover:opacity-100"
            title="Delete Quest"
          >
            <Trash2 className="w-5 h-5" />
          </button>
          <span className="text-(--color-reward) font-bold text-lg px-2 ml-2">+{task.reward_amount}</span>
        </div>
        <button 
          className="text-(--color-muted-text) hover:text-(--color-primary-60) rounded-md w-12 h-12 flex items-center justify-center transition-all cursor-pointer bg-transparent border-none group"
          onPointerDown={(e) => e.stopPropagation()} // Prevent dragging when clicking complete
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
          <div className="w-8 h-8 rounded-md flex items-center justify-center border-[3px] border-current group-hover:bg-(--color-primary-60) group-hover:border-(--color-primary-60) group-active:scale-90 transition-all">
            <Check className="w-5 h-5 text-transparent group-hover:text-white" strokeWidth={4} />
          </div>
        </button>
      </div>
    </div>
  );
}

function TaskListQuadrant({ quadrant, tasks }: { quadrant: QuadrantType, tasks: Task[] }) {
  if (tasks.length === 0) return null;

  return (
    <div className="mb-6">
      <h4 className="text-sm font-bold text-(--color-muted-text) uppercase tracking-wider mb-3 flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${QUADRANT_COLORS_BG[quadrant]}`} />
        {QUADRANT_TITLES[quadrant]}
      </h4>
      <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
        <div className="min-h-[10px]">
          {tasks.map(task => (
            <SortableTaskItem key={task.id} task={task} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}

export default function TaskList() {
  const { tasks, setTasks, user } = useStore();
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const pendingTasks = tasks.filter(t => t.status === 'pending');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = pendingTasks.find(t => t.id === active.id);
    if (task) setActiveTask(task);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeTask = pendingTasks.find(t => t.id === active.id);
    const overTask = pendingTasks.find(t => t.id === over.id);

    if (!activeTask) return;

    const activeQuadrant = activeTask.quadrant;
    let overQuadrant = activeQuadrant;

    if (overTask) {
      overQuadrant = overTask.quadrant;
    } else if (QUADRANTS.includes(over.id as QuadrantType)) {
      overQuadrant = over.id as QuadrantType;
    }

    if (activeQuadrant !== overQuadrant) {
      setTasks(tasks.map(t => t.id === activeTask.id ? { ...t, quadrant: overQuadrant } : t));
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;
    
    if (!over) return;

    const activeTask = pendingTasks.find(t => t.id === active.id);
    if (!activeTask) return;

    const overTask = pendingTasks.find(t => t.id === over.id);
    const overQuadrant = overTask ? overTask.quadrant : QUADRANTS.includes(over.id as QuadrantType) ? over.id as QuadrantType : activeTask.quadrant;

    let finalTasks = [...tasks];
    
    if (activeTask.quadrant !== overQuadrant) {
      finalTasks = finalTasks.map(t => t.id === activeTask.id ? { ...t, quadrant: overQuadrant } : t);
    }

    if (active.id !== over.id && overTask) {
      const activeQuadrantTasks = finalTasks.filter(t => t.quadrant === overQuadrant && t.status === 'pending');
      const oldIndex = activeQuadrantTasks.findIndex(t => t.id === active.id);
      const newIndex = activeQuadrantTasks.findIndex(t => t.id === over.id);
      
      const newQuadrantTasks = arrayMove(activeQuadrantTasks, oldIndex, newIndex);
      
      // Replace the quadrant tasks in the final array
      finalTasks = finalTasks.filter(t => t.quadrant !== overQuadrant || t.status !== 'pending');
      finalTasks = [...finalTasks, ...newQuadrantTasks];
    }
    
    setTasks(finalTasks);

    if (user && activeTask.quadrant !== overQuadrant) {
      try {
        await supabase.from('tasks').update({ quadrant: overQuadrant }).eq('id', activeTask.id);
      } catch (e) {
        console.error('Failed to save quadrant move', e);
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-(--color-surface) rounded-xl p-6 shadow-xl border border-(--color-border)"
    >
      <h3 className="text-2xl mb-6 font-normal text-(--color-on-surface)" style={{ fontFamily: 'var(--font-varela)' }}>All Quests</h3>
      
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex flex-col">
          {QUADRANTS.map(quadrant => (
            <TaskListQuadrant 
              key={quadrant} 
              quadrant={quadrant} 
              tasks={pendingTasks.filter(t => t.quadrant === quadrant)} 
            />
          ))}

          {pendingTasks.length === 0 && (
            <div className="text-center py-12">
              <p className="text-(--color-muted-text) text-lg italic opacity-50">The realm is quiet... no pending quests.</p>
            </div>
          )}
        </div>
        
        <DragOverlay>
          {activeTask ? (
            <SortableTaskItem task={activeTask} />
          ) : null}
        </DragOverlay>
      </DndContext>
    </motion.div>
  );
}
