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
  useSensor, 
  useSensors, 
  type DragStartEvent, 
  type DragEndEvent 
} from '@dnd-kit/core';
import { SortableContext, arrayMove, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Draggable Task Card
function SortableTaskCard({ task }: { task: Task }) {
  const { updateTaskStatus } = useStore();
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
      className="bg-(--color-surface-2) p-3 rounded-md flex justify-between items-start gap-2 shadow-sm border border-transparent hover:border-(--color-primary-60)/30 transition-colors cursor-grab active:cursor-grabbing relative z-10"
    >
      <div className="flex flex-col min-w-0 flex-1">
        <span className="text-(--color-on-surface) font-medium break-words" style={{ fontFamily: 'var(--font-roboto)' }}>{task.title}</span>
        {task.tags && task.tags.length > 0 && (
          <div className="flex gap-2 mt-2 flex-wrap">
            {task.tags.map(tag => (
              <span key={tag} className="text-[10px] uppercase tracking-wider bg-(--color-tertiary) text-(--color-primary-60) px-2 py-1 rounded-full font-bold whitespace-nowrap">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0" onPointerDown={e => e.stopPropagation()}>
        <span className="text-yellow-400 font-bold text-sm bg-black/20 px-2 py-1 rounded-md border border-yellow-400/20">
          +{task.reward_amount}
        </span>
        <button 
          className="bg-(--color-surface) border border-(--color-border) text-(--color-primary-60) hover:bg-(--color-primary-60) hover:text-(--color-on-surface) rounded-md w-8 h-8 flex items-center justify-center transition-all cursor-pointer z-20"
          onClick={() => updateTaskStatus(task.id, 'completed')}
          title="Complete Quest"
        >
          ✓
        </button>
      </div>
    </div>
  );
}

// Droppable Quadrant
function QuadrantContainer({ id, title, tasks }: { id: QuadrantType, title: string, tasks: Task[] }) {
  return (
    <div className="bg-(--color-surface) rounded-xl p-6 shadow-xl border border-(--color-border) flex flex-col min-h-[300px]">
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
                layout
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

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    
    if (!over) return;
    
    const activeTaskId = active.id as string;
    const overId = over.id as string;

    // Find the task we are moving
    const activeTask = tasks.find(t => t.id === activeTaskId);
    if (!activeTask) return;

    // Find the destination quadrant
    let destinationQuadrant: QuadrantType | null = null;
    
    // Is over a quadrant directly?
    if (['q1_urgent_important', 'q2_not_urgent_important', 'q3_urgent_not_important', 'q4_not_urgent_not_important'].includes(overId)) {
      destinationQuadrant = overId as QuadrantType;
    } else {
      // Or is over another task?
      const overTask = tasks.find(t => t.id === overId);
      if (overTask) {
        destinationQuadrant = overTask.quadrant;
      }
    }

    if (destinationQuadrant && activeTask.quadrant !== destinationQuadrant) {
      // Optimistic UI update
      const newTasks = tasks.map(t => 
        t.id === activeTaskId ? { ...t, quadrant: destinationQuadrant as QuadrantType } : t
      );
      setTasks(newTasks);
      
      // Persist to DB
      if (user) {
        await supabase.from('tasks').update({ quadrant: destinationQuadrant }).eq('id', activeTaskId);
      }
    }
  };

  const activeTask = activeId ? tasks.find(t => t.id === activeId) : null;

  return (
    <DndContext 
      sensors={sensors} 
      collisionDetection={closestCorners} 
      onDragStart={handleDragStart}
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
              <span className="text-yellow-400 font-bold text-sm bg-black/20 px-2 py-1 rounded-md border border-yellow-400/20">
                +{activeTask.reward_amount}
              </span>
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
