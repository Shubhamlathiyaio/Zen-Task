import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import type { QuadrantType } from '../store/useStore';
import { Plus, X, Calendar, Target } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getTagColor, getTagTextColor } from '../lib/colors';

export default function ActionHub() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'task' | 'habit'>('task');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTagInput, setCustomTagInput] = useState('');
  const [quadrant, setQuadrant] = useState<QuadrantType>('q1_urgent_important');
  const [frequency, setFrequency] = useState<'none' | 'daily' | 'weekly' | 'monthly'>('none');
  const [reward, setReward] = useState<number | ''>(10);
  const [isRequired, setIsRequired] = useState(true);
  const [dueDate, setDueDate] = useState('');
  
  const { user, isGuest, addTask, addHabit, editTask, customTags, editingTask, setEditingTask, activeTimers } = useStore();
  const hasTimers = activeTimers && activeTimers.length > 0;
  
  useEffect(() => {
    if (editingTask) {
      setActiveTab('task');
      setTitle(editingTask.title);
      setDescription(editingTask.description || '');
      setSelectedTags(editingTask.tags || []);
      setQuadrant(editingTask.quadrant);
      setReward(editingTask.reward_amount);
      setDueDate(editingTask.due_date ? new Date(editingTask.due_date).toISOString().slice(0, 16) : '');
      setFrequency(editingTask.frequency || 'none');
      setIsOpen(true);
    }
  }, [editingTask]);

  const handleClose = () => {
    setIsOpen(false);
    setEditingTask(null);
    setTitle('');
    setDescription('');
    setSelectedTags([]);
    setQuadrant('q1_urgent_important');
    setFrequency('none');
    setReward(10);
    setDueDate('');
  };

  const availableTags = Object.keys(customTags).length > 0 
    ? Object.keys(customTags) 
    : ['Work', 'Health', 'Learning', 'Chores', 'Social', 'Personal'];

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleAddCustomTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && customTagInput.trim() !== '') {
      e.preventDefault();
      const newTag = customTagInput.trim();
      if (!selectedTags.includes(newTag)) {
        setSelectedTags([...selectedTags, newTag]);
      }
      setCustomTagInput('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user && !isGuest) {
      alert("Please login first");
      return;
    }
    
    if (activeTab === 'task') {
      if (editingTask) {
        const taskUpdates = {
          title,
          description,
          tags: selectedTags,
          quadrant,
          reward_amount: reward === '' ? 0 : reward,
          is_required: isRequired,
          due_date: dueDate ? new Date(dueDate).toISOString() : null,
          frequency,
        };
        await editTask(editingTask.id, taskUpdates);
        handleClose();
        return;
      }

      const newTask = {
        id: isGuest ? Math.random().toString(36).substring(2, 11) : undefined,
        user_id: user?.id || 'guest',
        title,
        description,
        tags: selectedTags,
        quadrant,
        reward_amount: reward === '' ? 0 : reward,
        is_required: isRequired,
        status: 'pending' as const,
        created_at: new Date().toISOString(),
        due_date: dueDate ? new Date(dueDate).toISOString() : undefined,
        frequency,
        pending_coins: 0
      };
      
      if (isGuest) {
        addTask(newTask as any);
        handleClose();
        return;
      }
      
      const { data, error } = await supabase.from('tasks').insert({
         user_id: user!.id,
         title,
         description,
         tags: selectedTags,
         quadrant,
         reward_amount: reward === '' ? 0 : reward,
         is_required: isRequired,
         due_date: dueDate ? new Date(dueDate).toISOString() : null,
         frequency
      }).select().single();
      
      if (error) {
        console.error("Supabase Insert Error:", error);
        alert(`Error creating quest: ${error.message}`);
        return;
      }
      
      if (data) {
        addTask(data);
        handleClose();
      }
    } else {
      // Habit creation
      const newHabit = {
        id: isGuest ? Math.random().toString(36).substring(2, 11) : undefined,
        user_id: user?.id || 'guest',
        title,
        description,
        tags: selectedTags,
        frequency,
        reward_amount: reward === '' ? 0 : reward,
        is_required: isRequired,
        streak_count: 0,
        pending_coins: 0,
        created_at: new Date().toISOString()
      };
      
      if (isGuest) {
        addHabit(newHabit as any);
        handleClose();
        return;
      }
      
      const { data, error } = await supabase.from('habits').insert({
         user_id: user!.id,
         title,
         description,
         tags: selectedTags,
         frequency,
         reward_amount: reward === '' ? 0 : reward,
         is_required: isRequired,
         streak_count: 0,
         pending_coins: 0
      }).select().single();
      
      if (error) {
        console.error("Supabase Insert Error:", error);
        alert(`Error creating habit: ${error.message}`);
        return;
      }
      
      if (data) {
        addHabit(data);
        handleClose();
      }
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className={`fixed left-1/2 -translate-x-1/2 transition-all duration-300 ease-in-out bg-(--color-primary) text-white hover:bg-(--color-primary-80) active:scale-95 rounded-full w-[68px] h-[68px] md:w-16 md:h-16 flex items-center justify-center shadow-[0_4px_15px_rgba(146,92,243,0.4)] z-[60] cursor-pointer border-none
          ${hasTimers ? 'bottom-[108px] md:bottom-20' : 'bottom-3 md:bottom-8'} 
          md:left-auto md:right-8 md:translate-x-0`}
      >
        <Plus className="w-8 h-8 md:w-10 md:h-10" strokeWidth={2.5} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4 backdrop-blur-sm overflow-hidden">
          <div className="bg-(--color-surface) border-2 border-(--color-primary-60) rounded-2xl p-6 w-full max-w-lg shadow-[0_0_40px_rgba(146,92,243,0.3)] relative my-auto max-h-[90vh] overflow-y-auto overflow-x-hidden flex flex-col box-border">
            <button 
              onClick={handleClose}
              className="absolute top-4 right-4 text-(--color-primary-60) hover:text-(--color-on-surface) bg-(--color-surface-2) hover:bg-(--color-primary) rounded-full w-10 h-10 flex items-center justify-center transition-all cursor-pointer border-none"
            >
              <X className="w-6 h-6" />
            </button>
            
            <h2 className="text-2xl mb-6 font-bold text-(--color-on-surface) text-center" style={{ fontFamily: 'var(--font-varela)' }}>
              {editingTask ? 'Edit Quest' : 'Forge New Action'}
            </h2>
            
            {!editingTask && (
              <div className="flex bg-(--color-surface-2) p-1 rounded-xl mb-6">
                <button
                  type="button"
                  onClick={() => setActiveTab('task')}
                  className={`flex-1 flex justify-center items-center gap-2 py-2.5 rounded-lg font-bold text-sm transition-all border-none cursor-pointer ${
                    activeTab === 'task' 
                      ? 'bg-(--color-primary) text-white shadow-md' 
                      : 'bg-transparent text-(--color-primary-60) hover:text-(--color-on-surface)'
                  }`}
                >
                  <Target className="w-4 h-4" /> Quest
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('habit')}
                  className={`flex-1 flex justify-center items-center gap-2 py-2.5 rounded-lg font-bold text-sm transition-all border-none cursor-pointer ${
                    activeTab === 'habit' 
                      ? 'bg-(--color-primary) text-white shadow-md' 
                      : 'bg-transparent text-(--color-primary-60) hover:text-(--color-on-surface)'
                  }`}
                >
                  <Calendar className="w-4 h-4" /> Habit
                </button>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              
              <div className="flex flex-col gap-2">
                <label className="text-(--color-primary-60) text-xs font-bold uppercase tracking-wider" style={{ fontFamily: 'var(--font-roboto)' }}>Name</label>
                <input 
                  type="text" 
                  placeholder={activeTab === 'task' ? "What needs to be done?" : "What habit to build?"} 
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                  className="bg-(--color-surface-2) text-(--color-on-surface) h-12 px-4 rounded-lg border border-(--color-primary-60) focus:outline-none focus:border-(--color-primary-60) focus:ring-1 focus:ring-(--color-primary-60) text-base break-words transition-all placeholder:text-(--color-primary-60)/50"
                  style={{ fontFamily: 'var(--font-roboto)' }}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-(--color-primary-60) text-xs font-bold uppercase tracking-wider" style={{ fontFamily: 'var(--font-roboto)' }}>Details (Optional)</label>
                <textarea 
                  placeholder="Add notes, steps, or extra context..." 
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="bg-(--color-surface-2) text-(--color-on-surface) p-4 rounded-lg border border-(--color-primary-60) focus:outline-none focus:border-(--color-primary-60) focus:ring-1 focus:ring-(--color-primary-60) text-sm break-words transition-all placeholder:text-(--color-primary-60)/50 min-h-[80px] resize-y"
                  style={{ fontFamily: 'var(--font-roboto)' }}
                />
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="text-(--color-primary-60) text-xs font-bold uppercase tracking-wider" style={{ fontFamily: 'var(--font-roboto)' }}>Tags</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {selectedTags.map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className="px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider border cursor-pointer transition-transform active:scale-95"
                      style={{ 
                        backgroundColor: getTagColor(tag), 
                        color: getTagTextColor(tag),
                        borderColor: getTagTextColor(tag)
                      }}
                    >
                      {tag} ✕
                    </button>
                  ))}
                  {availableTags.filter(tag => !selectedTags.includes(tag)).map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className="px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider border cursor-pointer transition-colors bg-(--color-surface-2) border-(--color-primary-60) text-(--color-primary-60) hover:text-(--color-on-surface) hover:border-(--color-on-surface)"
                    >
                      + {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 flex flex-col gap-2">
                  <label className="text-(--color-primary-60) text-xs font-bold uppercase tracking-wider" style={{ fontFamily: 'var(--font-roboto)' }}>
                    {activeTab === 'task' ? 'Priority' : 'Frequency'}
                  </label>
                  
                  {activeTab === 'task' ? (
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'q1_urgent_important', label: 'Q1', color: 'bg-red-500', text: 'text-white', border: 'border-red-400' },
                        { id: 'q2_not_urgent_important', label: 'Q2', color: 'bg-blue-500', text: 'text-white', border: 'border-blue-400' },
                        { id: 'q3_urgent_not_important', label: 'Q3', color: 'bg-amber-500', text: 'text-white', border: 'border-amber-400' },
                        { id: 'q4_not_urgent_not_important', label: 'Q4', color: 'bg-gray-500', text: 'text-white', border: 'border-gray-400' },
                      ].map(q => (
                        <button
                          key={q.id}
                          type="button"
                          onClick={() => setQuadrant(q.id as QuadrantType)}
                          className={`h-10 rounded-lg text-xs font-bold tracking-wide border transition-all cursor-pointer ${quadrant === q.id ? `${q.color} ${q.text} ${q.border} shadow-lg shadow-${q.color.replace('bg-', '')}/30` : 'bg-(--color-surface-2) border-(--color-primary-60) text-(--color-primary-60) hover:border-(--color-on-surface) hover:text-(--color-on-surface)'}`}
                        >
                          {q.label}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      {['daily', 'weekly', 'monthly'].map(freq => (
                        <button
                          key={freq}
                          type="button"
                          onClick={() => setFrequency(freq as 'daily' | 'weekly' | 'monthly')}
                          className={`flex-1 h-10 rounded-lg text-xs font-bold uppercase tracking-wide border transition-all cursor-pointer ${frequency === freq ? 'bg-(--color-primary) text-white border-(--color-primary-60) shadow-lg shadow-(--color-primary)/30' : 'bg-(--color-surface-2) border-(--color-primary-60) text-(--color-primary-60) hover:border-(--color-on-surface) hover:text-(--color-on-surface)'}`}
                        >
                          {freq}
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {activeTab === 'task' && (
                    <>
                      <label className="text-(--color-primary-60) text-xs font-bold uppercase tracking-wider mt-2" style={{ fontFamily: 'var(--font-roboto)' }}>
                        Repeat Automatically?
                      </label>
                      <div className="flex gap-2">
                        {['none', 'daily', 'weekly', 'monthly'].map(freq => (
                          <button
                            key={freq}
                            type="button"
                            onClick={() => setFrequency(freq as any)}
                            className={`flex-1 h-10 rounded-lg text-xs font-bold uppercase tracking-wide border transition-all cursor-pointer ${frequency === freq ? 'bg-(--color-primary) text-white border-(--color-primary-60) shadow-lg shadow-(--color-primary)/30' : 'bg-(--color-surface-2) border-(--color-primary-60) text-(--color-primary-60) hover:border-(--color-on-surface) hover:text-(--color-on-surface)'}`}
                          >
                            {freq}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                <div className="flex-1 flex flex-col justify-end gap-2 max-w-[120px]">
                  <label className="text-(--color-primary-60) text-xs font-bold uppercase tracking-wider" style={{ fontFamily: 'var(--font-roboto)' }}>Reward</label>
                  <input 
                    type="number" 
                    value={reward}
                    onChange={e => setReward(e.target.value === '' ? '' : Number(e.target.value))}
                    min={0}
                    className="bg-(--color-surface-2) text-amber-500 font-bold font-mono h-12 px-3 rounded-lg border border-(--color-primary-60) focus:outline-none focus:border-(--color-primary-60) text-lg w-full text-center transition-all"
                  />
                </div>
              </div>

              {activeTab === 'task' && (
                <div className="flex flex-col gap-2">
                  <label className="text-(--color-primary-60) text-xs font-bold uppercase tracking-wider" style={{ fontFamily: 'var(--font-roboto)' }}>Custom Deadline (Optional)</label>
                  <input 
                    type="datetime-local" 
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                    className="bg-(--color-surface-2) text-(--color-on-surface) h-12 px-4 rounded-lg border border-(--color-primary-60) focus:outline-none focus:border-(--color-primary-60) text-sm transition-all"
                    style={{ fontFamily: 'var(--font-roboto)' }}
                  />
                  <span className="text-[10px] text-(--color-muted-text) mt-[-4px]">Overrides the default quadrant deadline.</span>
                </div>
              )}

              <div className="flex items-center gap-3 bg-(--color-surface-2) p-3 rounded-lg border border-(--color-primary-60)">
                <input 
                  type="checkbox" 
                  id="isRequired"
                  checked={isRequired}
                  onChange={e => setIsRequired(e.target.checked)}
                  className="w-5 h-5 cursor-pointer accent-(--color-primary) rounded"
                />
                <label htmlFor="isRequired" className="text-(--color-on-surface) cursor-pointer select-none" style={{ fontFamily: 'var(--font-roboto)' }}>
                  <span className="block font-bold text-sm">Required Action</span>
                  <span className="block text-[10px] text-(--color-primary-60) uppercase tracking-wider">Penalized if missed or ignored</span>
                </label>
              </div>

              <button 
                type="submit" 
                className="bg-(--color-primary) text-white h-12 mt-2 rounded-lg font-bold text-lg hover:bg-(--color-primary-80) transition-all active:scale-[0.98] cursor-pointer border-2 border-(--color-primary-60) shadow-[0_4px_15px_rgba(146,92,243,0.4)] hover:shadow-[0_6px_20px_rgba(146,92,243,0.6)]"
                style={{ fontFamily: 'var(--font-roboto)' }}
              >
                {editingTask ? 'Save Changes' : activeTab === 'task' ? 'Forge Quest' : 'Forge Habit'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
