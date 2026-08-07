import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import type { QuadrantType } from '../store/useStore';
import { Plus, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getTagColor, getTagTextColor } from '../lib/colors';

export default function ActionHub() {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTagInput, setCustomTagInput] = useState('');
  const [quadrant, setQuadrant] = useState<QuadrantType>('q1_urgent_important');
  const [reward, setReward] = useState(10);
  const [isRequired, setIsRequired] = useState(true);
  
  const { user, addTask, customTags, editingTask, setEditingTask, updateTaskContent } = useStore();
  
  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setSelectedTags(editingTask.tags || []);
      setQuadrant(editingTask.quadrant);
      setReward(editingTask.reward_amount);
      setIsRequired(editingTask.is_required);
      setIsOpen(true);
    }
  }, [editingTask]);

  const handleClose = () => {
    setIsOpen(false);
    if (editingTask) {
      setTimeout(() => setEditingTask(null), 300);
    }
    setTitle('');
    setSelectedTags([]);
    setReward(10);
    setQuadrant('q1_urgent_important');
  };
  
  // If no custom tags exist, provide some defaults for the UI just to click, 
  // but preferably the user adds them in settings.
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
    if (!user) {
      alert("Please login first");
      return;
    }
    
    const newTask = {
      user_id: user.id,
      title,
      tags: selectedTags,
      quadrant,
      reward_amount: reward,
      is_required: isRequired,
    };
    
    if (editingTask) {
      updateTaskContent(editingTask.id, newTask);
      handleClose();
    } else {
      const { data, error } = await supabase.from('tasks').insert(newTask).select().single();
      
      if (error) {
        console.error("Supabase Insert Error:", error);
        alert(`Error creating quest: ${error.message}\n(Make sure RLS policies allow inserts if enabled)`);
        return;
      }
      
      if (data) {
        addTask(data);
        handleClose();
      }
    }
  };

  return (
    <>
      <button 
        onClick={() => {
          setEditingTask(null);
          setTitle('');
          setSelectedTags([]);
          setReward(10);
          setQuadrant('q1_urgent_important');
          setIsOpen(true);
        }}
        className="fixed bottom-20 md:bottom-8 right-4 md:right-8 bg-(--color-primary) text-white hover:bg-(--color-primary-80) transition-transform active:scale-95 rounded-full h-14 md:h-16 px-6 md:px-8 flex items-center justify-center font-bold text-lg shadow-xl shadow-(--color-primary)/30 z-50 cursor-pointer border-none"
        style={{ fontFamily: 'var(--font-roboto)' }}
      >
        <Plus className="w-6 h-6 mr-2" />
        Add Quest
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-4 backdrop-blur-sm overflow-hidden">
          <div className="bg-(--color-neutral) border border-(--color-border) rounded-2xl p-6 w-full max-w-lg shadow-2xl relative my-auto max-h-[90vh] overflow-y-auto overflow-x-hidden flex flex-col box-border">
            
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-normal text-(--color-on-surface) m-0" style={{ fontFamily: 'var(--font-varela)' }}>
                {editingTask ? 'Edit Quest' : 'Forge New Quest'}
              </h2>
              <button onClick={handleClose} className="bg-transparent border-none text-(--color-muted-text) hover:text-red-500 cursor-pointer p-1">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              
              <div className="flex flex-col gap-2">
                <label className="text-(--color-muted-text) text-sm font-bold uppercase tracking-wider" style={{ fontFamily: 'var(--font-roboto)' }}>Quest Name</label>
                <input 
                  type="text" 
                  placeholder="What needs to be done?" 
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                  className="bg-(--color-surface) text-(--color-on-surface) h-14 px-4 rounded-lg border border-(--color-border) focus:outline-none focus:border-(--color-primary-60) text-lg break-words"
                  style={{ fontFamily: 'var(--font-roboto)' }}
                />
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="text-(--color-muted-text) text-sm font-bold uppercase tracking-wider" style={{ fontFamily: 'var(--font-roboto)' }}>Tags</label>
                
                <div className="flex flex-wrap gap-2 mt-2">
                  {/* Show selected tags first (including custom ones) */}
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
                  {/* Show unselected tags as suggestions */}
                  {availableTags.filter(tag => !selectedTags.includes(tag)).map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className="px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider border cursor-pointer transition-colors bg-(--color-surface-2) border-(--color-border) text-(--color-muted-text) hover:text-(--color-on-surface)"
                    >
                      + {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 flex flex-col gap-2">
                  <label className="text-(--color-muted-text) text-sm font-bold uppercase tracking-wider" style={{ fontFamily: 'var(--font-roboto)' }}>Priority</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'q1_urgent_important', label: 'Q1', color: 'bg-red-500', text: 'text-white' },
                      { id: 'q2_not_urgent_important', label: 'Q2', color: 'bg-blue-500', text: 'text-white' },
                      { id: 'q3_urgent_not_important', label: 'Q3', color: 'bg-amber-500', text: 'text-white' },
                      { id: 'q4_not_urgent_not_important', label: 'Q4', color: 'bg-gray-500', text: 'text-white' },
                    ].map(q => (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => setQuadrant(q.id as QuadrantType)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold tracking-wide border transition-all cursor-pointer ${quadrant === q.id ? `${q.color} ${q.text} border-transparent` : 'bg-(--color-surface-2) border-(--color-border) text-(--color-muted-text) hover:border-(--color-primary-60)'}`}
                      >
                        {q.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex-1 flex flex-col justify-end gap-2">
                  <label className="text-(--color-muted-text) text-sm font-bold uppercase tracking-wider" style={{ fontFamily: 'var(--font-roboto)' }}>Reward</label>
                  <input 
                    type="number" 
                    value={reward}
                    onChange={e => setReward(Number(e.target.value))}
                    min={0}
                    className="bg-(--color-surface) text-(--color-reward) font-bold font-mono h-14 px-4 rounded-lg border border-(--color-border) focus:outline-none focus:border-(--color-primary-60) text-xl w-full"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 bg-(--color-surface-2) p-4 rounded-lg border border-(--color-border)">
                <input 
                  type="checkbox" 
                  id="isRequired"
                  checked={isRequired}
                  onChange={e => setIsRequired(e.target.checked)}
                  className="w-5 h-5 cursor-pointer accent-(--color-primary) rounded"
                />
                <label htmlFor="isRequired" className="text-(--color-on-surface) cursor-pointer select-none" style={{ fontFamily: 'var(--font-roboto)' }}>
                  <span className="block font-bold">Required Quest</span>
                  <span className="block text-xs text-(--color-muted-text)">Penalized if missed or ignored</span>
                </label>
              </div>

              <button 
                type="submit"
                className="w-full bg-(--color-primary) text-(--color-on-surface) hover:bg-(--color-primary-80) transition-transform active:scale-[0.98] h-14 rounded-xl flex items-center justify-center font-bold text-lg shadow-lg border-none cursor-pointer mt-2 shadow-(--color-primary)/20"
                style={{ fontFamily: 'var(--font-roboto)' }}
              >
                {editingTask ? 'Save Changes' : 'Manifest Quest'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
