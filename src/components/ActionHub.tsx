import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import type { QuadrantType } from '../store/useStore';
import { Plus, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

const PREDEFINED_TAGS = ['Work', 'Health', 'Learning', 'Chores', 'Social', 'Personal'];

export default function ActionHub() {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [quadrant, setQuadrant] = useState<QuadrantType>('q1_urgent_important');
  const [reward, setReward] = useState(10);
  const [isRequired, setIsRequired] = useState(true);
  
  const { user, addTask } = useStore();

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
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
    
    const { data, error } = await supabase.from('tasks').insert(newTask).select().single();
    
    if (error) {
      console.error("Supabase Insert Error:", error);
      alert(`Error creating quest: ${error.message}\n(Make sure RLS policies allow inserts if enabled)`);
      return;
    }
    
    if (data) {
      addTask(data);
      setIsOpen(false);
      setTitle('');
      setSelectedTags([]);
      setReward(10);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 md:bottom-8 right-4 md:right-8 bg-(--color-primary) text-(--color-on-surface) hover:bg-(--color-primary-80) transition-transform active:scale-95 rounded-full h-14 md:h-16 px-6 md:px-8 flex items-center justify-center font-bold text-lg shadow-xl shadow-(--color-primary)/30 z-50 cursor-pointer border-none"
        style={{ fontFamily: 'var(--font-roboto)' }}
      >
        <Plus className="w-6 h-6 mr-2" />
        Add Quest
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-4 backdrop-blur-sm overflow-hidden">
          <div className="bg-(--color-neutral) border border-(--color-border) rounded-2xl p-6 w-full max-w-lg shadow-2xl relative my-auto max-h-[90vh] overflow-y-auto overflow-x-hidden flex flex-col box-border">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-(--color-muted-text) hover:text-(--color-on-surface) bg-(--color-surface-2) hover:bg-(--color-surface) rounded-full p-1 border-none cursor-pointer transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            
            <h2 className="text-3xl mb-6 text-(--color-on-surface) font-normal" style={{ fontFamily: 'var(--font-varela)' }}>
              Forge New Quest
            </h2>
            
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
                <div className="flex flex-wrap gap-2">
                  {PREDEFINED_TAGS.map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider border cursor-pointer transition-colors ${
                        selectedTags.includes(tag) 
                          ? 'bg-(--color-primary) border-(--color-primary) text-white' 
                          : 'bg-(--color-surface-2) border-(--color-border) text-(--color-muted-text) hover:text-(--color-on-surface)'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 flex flex-col gap-2">
                  <label className="text-(--color-muted-text) text-sm font-bold uppercase tracking-wider" style={{ fontFamily: 'var(--font-roboto)' }}>Quadrant</label>
                  <select 
                    value={quadrant} 
                    onChange={e => setQuadrant(e.target.value as QuadrantType)}
                    className="bg-(--color-surface) text-(--color-on-surface) h-14 px-4 rounded-lg border border-(--color-border) focus:outline-none focus:border-(--color-primary-60) appearance-none cursor-pointer"
                  >
                    <option value="q1_urgent_important">Q1 - Urgent & Important</option>
                    <option value="q2_not_urgent_important">Q2 - Not Urgent, Important</option>
                    <option value="q3_urgent_not_important">Q3 - Urgent, Not Important</option>
                    <option value="q4_not_urgent_not_important">Q4 - Neither</option>
                  </select>
                </div>

                <div className="flex-1 flex flex-col justify-end gap-2">
                  <label className="text-(--color-muted-text) text-sm font-bold uppercase tracking-wider" style={{ fontFamily: 'var(--font-roboto)' }}>Reward</label>
                  <input 
                    type="number" 
                    value={reward}
                    onChange={e => setReward(Number(e.target.value))}
                    min={0}
                    className="bg-(--color-surface) text-yellow-400 font-bold font-mono h-14 px-4 rounded-lg border border-(--color-border) focus:outline-none focus:border-(--color-primary-60) text-xl w-full"
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
                className="mt-2 bg-(--color-primary) text-(--color-on-surface) hover:bg-(--color-primary-80) transition-colors rounded-lg h-14 flex items-center justify-center font-bold text-lg border-none cursor-pointer shadow-lg"
                style={{ fontFamily: 'var(--font-roboto)' }}
              >
                Create Quest
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
