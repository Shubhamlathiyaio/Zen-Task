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
import { Check, Trash2, Pencil } from 'lucide-react';
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
function SortableTaskCard({ task }: { task: Task }) {
  const { updateTaskStatus, setEditingTask, deleteTask } = useStore();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div 
      ref={setNodeRef}
      style={style}
      {...attributes} 
      {...listeners}
      className={`bg-(--color-neutral) p-3 pl-5 rounded-md flex justify-between items-start gap-2 shadow-sm border border-(--color-border) hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing relative group`}
    >
      <div className={`absolute left-2 top-1/2 -translate-y-1/2 w-1 h-3/5 rounded-full ${QUADRANT_COLORS_BG[task.quadrant]}`} />
      <div className="flex flex-col min-w-0 flex-1">
        <span className="text-(--color-on-surface) font-medium break-words" style={{ fontFamily: 'var(--font-roboto)' }}>{task.title}</span>
        {task.tags && task.tags.length > 0 && (
          <div className="flex gap-2 mt-2 flex-wrap">
            {task.tags.map(tag => (
              <span 
                key={tag} 
                className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-full font-bold border whitespace-nowrap"
                style={{
                  backgroundColor: getTagColor(tag),
                  color: getTagTextColor(tag),
                  borderColor: getTagTextColor(tag)
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0" onPointerDown={e => e.stopPropagation()}>
        <span className="text-(--color-reward) font-bold text-sm">
          +{task.reward_amount}
        </span>
        <div className="flex gap-1" onPointerDown={e => e.stopPropagation()}>
          <button 
            className="text-(--color-muted-text) hover:text-(--color-primary-60) rounded-md w-8 h-8 flex items-center justify-center transition-all cursor-pointer z-20 bg-transparent border-none group opacity-0 group-hover:opacity-100"
            onClick={(e) => {
              setEditingTask(task);
            }}
            title="Edit Quest"
          >
            <Pencil className="w-4 h-4 transition-transform group-hover:scale-110" />
          </button>
          
          <button 
            className="text-(--color-muted-text) hover:text-red-500 rounded-md w-8 h-8 flex items-center justify-center transition-all cursor-pointer z-20 bg-transparent border-none group opacity-0 group-hover:opacity-100"
            onClick={(e) => {
              if (confirm('Are you sure you want to abandon this quest?')) {
                deleteTask(task.id);
              }
            }}
            title="Abandon Quest"
          >
            <Trash2 className="w-4 h-4 transition-transform group-hover:scale-110" />
          </button>
          
          <button 
            className="text-(--color-muted-text) hover:text-(--color-primary-60) rounded-md w-10 h-10 flex items-center justify-center transition-all cursor-pointer z-20 bg-transparent border-none group"
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
            <div className="border-2 border-(--color-muted-text) group-hover:border-(--color-primary-60) rounded-full p-0.5 transition-colors">
              <Check className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

// Droppable Quadrant
function QuadrantContainer({ id, title, tasks }: { id: QuadrantType, title: string, tasks: Task[] }) {
  return (
    <div className={`${QUADRANT_BG_TINTS[id]} rounded-xl p-6 shadow-xl border flex flex-col min-h-[300px]`}>
      <h3 className="text-xl mb-4 font-normal text-(--color-on-surface)" style={{ fontFamily: 'var(--font-varela)' }}>{title}</h3>
      <SortableContext id={id} items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-3 flex-1 min-h-[150px]">
          <AnimatePresence>
            {tasks.map(task => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <SortableTaskCard task={task} />
              </motion.div>
            ))}
          </AnimatePresence>
          {tasks.length === 0 && (
            <div className="flex-1 flex items-center justify-center border-2 border-dashed border-(--color-border) rounded-lg p-4 opacity-50">
              <span className="text-(--color-muted-text) text-sm text-center">Drop quests here</span>
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}


export default function EisenhowerMatrix() {
  const { tasks, setTasks, user } = useStore();
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), // Prevent drag on simple clicks
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const pendingTasks = tasks.filter(t => t.status === 'pending');

  const getQuadrantTasks = (q: QuadrantType) => pendingTasks.filter(t => t.quadrant === q);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: any) => {
    const { active, over } = event;
    if (!over) return;
    
    const activeTaskId = active.id as string;
    const overId = over.id as string;
    if (activeTaskId === overId) return;

    const activeIndex = tasks.findIndex(t => t.id === activeTaskId);
    if (activeIndex === -1) return;
    
    const activeTask = tasks[activeIndex];
    const isOverQuadrant = ['q1_urgent_important', 'q2_not_urgent_important', 'q3_urgent_not_important', 'q4_not_urgent_not_important'].includes(overId);
    
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

  return (
    <DndContext 
      sensors={sensors} 
      collisionDetection={closestCorners} 
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-6xl mx-auto">
        <QuadrantContainer 
          id="q1_urgent_important" 
          title="Q1: Urgent & Important (Do First)" 
          tasks={getQuadrantTasks('q1_urgent_important')} 
        />
        <QuadrantContainer 
          id="q2_not_urgent_important" 
          title="Q2: Not Urgent, Important (Schedule)" 
          tasks={getQuadrantTasks('q2_not_urgent_important')} 
        />
        <QuadrantContainer 
          id="q3_urgent_not_important" 
          title="Q3: Urgent, Not Important (Delegate)" 
          tasks={getQuadrantTasks('q3_urgent_not_important')} 
        />
        <QuadrantContainer 
          id="q4_not_urgent_not_important" 
          title="Q4: Neither (Eliminate)" 
          tasks={getQuadrantTasks('q4_not_urgent_not_important')} 
        />
      </div>

      <DragOverlay>
        {activeTask ? (
          <div className="bg-(--color-surface-2) p-3 rounded-md flex justify-between items-start gap-2 shadow-2xl border-2 border-(--color-primary) opacity-90 scale-105 rotate-2 cursor-grabbing">
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-(--color-on-surface) font-medium break-words" style={{ fontFamily: 'var(--font-roboto)' }}>{activeTask.title}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-(--color-reward) font-bold text-sm">
                +{activeTask.reward_amount}
              </span>
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
