import React, { useState } from 'react';
import { useStore, type Task } from '../store/useStore';
import { motion } from 'framer-motion';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensors,
  useSensor,
  useDroppable,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent
} from '@dnd-kit/core';
import { SortableContext, arrayMove, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import confetti from 'canvas-confetti';
import { getTagColor, getTagTextColor } from '../lib/colors';

const QUADRANT_COLORS_BG = {
  q1_urgent_important: 'bg-red-500',
  q2_not_urgent_important: 'bg-blue-500',
  q3_urgent_not_important: 'bg-amber-500',
  q4_not_urgent_not_important: 'bg-gray-500',
};

function SortableKanbanItem({ task, getTaskDeadline }: { task: Task, getTaskDeadline: (t: Task) => number }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    touchAction: 'pan-y'
  };

  const deadlineMs = getTaskDeadline(task);
  const now = Date.now();
  const timeRemaining = deadlineMs - now;
  const isNearDeadline = deadlineMs !== Infinity && timeRemaining < 3600000;
  
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
      className={`bg-(--color-surface-2) p-3 md:p-4 rounded-lg flex flex-col gap-2 shadow-sm border ${isNearDeadline && task.status !== 'completed' && task.status !== 'done' && task.status !== 'failed' ? 'border-red-500/50 bg-red-500/5' : 'border-(--color-border)'} hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing mb-3`}
    >
      <div className="flex justify-between items-start gap-2">
        <div className="flex items-center gap-2 flex-1">
          <div className={`w-2 h-2 rounded-full shrink-0 ${QUADRANT_COLORS_BG[task.quadrant]}`} />
          <span className="text-(--color-on-surface) font-bold text-sm break-words" style={{ fontFamily: 'var(--font-roboto)' }}>{task.title}</span>
        </div>
        <span className="text-(--color-reward) font-bold text-sm shrink-0">+{task.reward_amount}</span>
      </div>
      
      {task.description && (
        <p className="text-[11px] text-(--color-muted-text) m-0 break-words line-clamp-2">{task.description}</p>
      )}
      
      <div className="flex gap-1.5 mt-1 flex-wrap items-center">
        {task.tags && task.tags.map(tag => (
          <span 
            key={tag} 
            className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-full font-bold border whitespace-nowrap"
            style={{
              backgroundColor: getTagColor(tag),
              color: getTagTextColor(tag),
              borderColor: getTagTextColor(tag)
            }}
          >
            {tag}
          </span>
        ))}
        {deadlineMs !== Infinity && task.status !== 'completed' && task.status !== 'done' && task.status !== 'failed' && (
          <span className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-full font-bold flex items-center gap-1 ${isNearDeadline ? 'bg-red-500/20 text-red-500 border border-red-500/30' : 'bg-(--color-primary)/10 text-(--color-primary) border border-(--color-primary)/20'}`}>
            ⏱️ {deadlineString}
          </span>
        )}
      </div>
    </div>
  );
}

function KanbanColumn({ id, title, count, tasks, getTaskDeadline, isPending }: any) {
  const { setNodeRef } = useDroppable({ id });
  return (
    <div ref={setNodeRef} className="bg-(--color-neutral) rounded-xl p-4 border border-(--color-border) flex flex-col h-full min-h-[500px] md:min-h-[400px] w-[85vw] sm:w-[320px] shrink-0 md:w-auto snap-center md:snap-align-none">
      <h4 className="text-lg font-bold capitalize mb-4 text-(--color-on-surface) flex items-center justify-between">
        {title}
        <span className="text-xs bg-(--color-surface-2) text-(--color-muted-text) px-2 py-1 rounded-full">{count}</span>
      </h4>
      
      <SortableContext 
        id={id}
        items={tasks.map((t: Task) => t.id)} 
        strategy={verticalListSortingStrategy}
      >
        <div className="flex-1">
          {tasks.map((task: Task) => (
            <SortableKanbanItem key={task.id} task={task} getTaskDeadline={getTaskDeadline} />
          ))}
          {tasks.length === 0 && (
            <div className="h-full min-h-[100px] flex items-center justify-center p-4 border-2 border-dashed border-(--color-border) rounded-lg opacity-50">
              <span className="text-sm text-(--color-muted-text)">Drop quests here</span>
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}

export default function KanbanBoard() {
  const { tasks, updateTaskStatus, quadrantRules, taskFilterTag, taskFilterTimeline, taskFilterPriority } = useStore();
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

  const filteredTasks = tasks.filter(t => {
    if (taskFilterTag && (!t.tags || !t.tags.includes(taskFilterTag))) return false;
    if (taskFilterTimeline !== 'all' && t.frequency !== taskFilterTimeline) return false;
    if (taskFilterPriority && t.quadrant !== 'q1_urgent_important' && !t.is_required) return false;
    return true;
  }).sort((a, b) => getTaskDeadline(a) - getTaskDeadline(b));

  const columns = {
    todo: filteredTasks.filter(t => t.status === 'todo' || t.status === 'pending'),
    inprocess: filteredTasks.filter(t => t.status === 'inprocess'),
    in_review: filteredTasks.filter(t => t.status === 'in_review'),
    done: filteredTasks.filter(t => t.status === 'done' || t.status === 'completed').slice(0, 20)
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = filteredTasks.find(t => t.id === active.id);
    if (task) setActiveTask(task);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const activeTask = filteredTasks.find(t => t.id === active.id);
    if (!activeTask) return;

    const overId = over.id as string;
    
    let newStatus = activeTask.status;
    if (['todo', 'inprocess', 'in_review', 'done'].includes(overId)) {
      newStatus = overId as any;
    } else {
      const overTask = filteredTasks.find(t => t.id === overId);
      if (overTask) {
        newStatus = overTask.status;
      }
    }

    if (newStatus !== activeTask.status) {
      const isNowCompleted = newStatus === 'completed' || newStatus === 'done';
      const wasCompleted = activeTask.status === 'completed' || activeTask.status === 'done';
      
      if (isNowCompleted && !wasCompleted) {
         confetti({
           particleCount: 50,
           spread: 60,
           colors: ['#925CF3', '#FACC15', '#4ADE80'],
           disableForReducedMotion: true
         });
         try {
           const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3');
           audio.volume = 0.5;
           audio.play().catch(console.error);
         } catch(e) {}
      }
      updateTaskStatus(activeTask.id, newStatus);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-(--color-surface) rounded-xl p-4 md:p-6 shadow-xl border border-(--color-border)"
    >
      <h3 className="text-xl md:text-2xl mb-4 md:mb-6 font-normal text-(--color-on-surface)" style={{ fontFamily: 'var(--font-varela)' }}>Kanban Board</h3>
      
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex md:grid md:grid-cols-4 gap-4 md:gap-6 overflow-x-auto snap-x snap-mandatory pb-4 custom-scrollbar">
          <KanbanColumn id="todo" title="To Do" count={columns.todo.length} tasks={columns.todo} getTaskDeadline={getTaskDeadline} isPending={true} />
          <KanbanColumn id="inprocess" title="In Process" count={columns.inprocess.length} tasks={columns.inprocess} getTaskDeadline={getTaskDeadline} isPending={false} />
          <KanbanColumn id="in_review" title="In Review" count={columns.in_review.length} tasks={columns.in_review} getTaskDeadline={getTaskDeadline} isPending={false} />
          <KanbanColumn id="done" title="Done" count={columns.done.length} tasks={columns.done} getTaskDeadline={getTaskDeadline} isPending={false} />
        </div>
        
        <DragOverlay>
          {activeTask ? (
            <div className="opacity-80 rotate-2 scale-105 cursor-grabbing">
              <SortableKanbanItem task={activeTask} getTaskDeadline={getTaskDeadline} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </motion.div>
  );
}
