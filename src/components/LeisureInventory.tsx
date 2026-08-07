import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { supabase } from '../lib/supabase';
import { Gamepad2, Film } from 'lucide-react';

export default function LeisureInventory() {
  const { user, coinBalance, tasks, addTask, setCoinBalance } = useStore();
  
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'movie' | 'game'>('movie');
  const [hours, setHours] = useState(2.5);
  const hourlyRate = 20; // 20 coins per hour
  
  const totalCost = Math.ceil(hourlyRate * hours);
  
  const leisureTasks = tasks.filter(t => t.is_leisure && t.status === 'pending');

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    if (coinBalance < totalCost) {
      alert("Not enough coins for this leisure activity!");
      return;
    }
    
    // Deduct coins via transaction (ideally via RPC in production, doing it locally + DB insert for prototype)
    const newBalance = coinBalance - totalCost;
    
    const newTask = {
      user_id: user.id,
      title: `${type === 'movie' ? '🎬' : '🎮'} ${title}`,
      tags: ['leisure', type],
      quadrant: 'q4_not_urgent_not_important', // Default quadrant
      reward_amount: 0,
      is_required: false,
      is_leisure: true,
      leisure_hourly_rate: hourlyRate,
    };
    
    const { data: taskData, error: taskError } = await supabase.from('tasks').insert(newTask).select().single();
    
    if (taskData && !taskError) {
      // Update balance
      await supabase.from('profiles').update({ coin_balance: newBalance }).eq('id', user.id);
      
      // Record transaction
      await supabase.from('transactions').insert({
        user_id: user.id,
        task_id: taskData.id,
        amount: -totalCost,
        type: 'purchase',
        description: `Purchased ${hours} hours of ${type}`
      });
      
      addTask(taskData);
      setCoinBalance(newBalance);
      setTitle('');
    }
  };

  return (
    <div className="bg-(--color-surface) rounded-xl p-6 border border-(--color-border) shadow-md">
      <h2 className="text-2xl font-normal mb-6 text-(--color-on-surface) flex items-center gap-2" style={{ fontFamily: 'var(--font-varela)' }}>
        <Gamepad2 className="text-(--color-primary-60)" /> Leisure Inventory
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-medium mb-4 text-(--color-muted-text)" style={{ fontFamily: 'var(--font-roboto)' }}>Unlock Activity</h3>
          
          <form onSubmit={handlePurchase} className="flex flex-col gap-4">
            <input 
              type="text" 
              placeholder="Title (e.g., Elden Ring, Dune 2)" 
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              className="bg-(--color-neutral) text-(--color-on-surface) h-10 px-3 rounded-sm border border-(--color-border) focus:outline-none focus:border-(--color-primary-60)"
            />
            
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm text-(--color-on-surface) cursor-pointer">
                <input 
                  type="radio" 
                  checked={type === 'movie'} 
                  onChange={() => setType('movie')}
                  className="accent-(--color-primary)" 
                />
                Movie
              </label>
              <label className="flex items-center gap-2 text-sm text-(--color-on-surface) cursor-pointer">
                <input 
                  type="radio" 
                  checked={type === 'game'} 
                  onChange={() => setType('game')}
                  className="accent-(--color-primary)" 
                />
                Game
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <label className="text-sm text-(--color-muted-text)">Duration: {hours} hours</label>
              <input 
                type="range" 
                min="0.5" max="10" step="0.5" 
                value={hours} 
                onChange={e => setHours(Number(e.target.value))}
                className="w-1/2 accent-(--color-primary)"
              />
            </div>
            
            <button 
              type="submit" 
              disabled={coinBalance < totalCost || !title}
              className="mt-2 bg-(--color-surface-2) text-(--color-on-surface) border border-(--color-primary-60) hover:bg-(--color-primary-60) transition-colors rounded-sm h-10 flex items-center justify-between px-4 font-bold disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <span>Purchase</span>
              <span className="text-(--color-reward) font-mono">-{totalCost} coins</span>
            </button>
          </form>
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-4 text-(--color-muted-text)" style={{ fontFamily: 'var(--font-roboto)' }}>Pending Leisure</h3>
          
          <div className="flex flex-col gap-3">
            {leisureTasks.length === 0 ? (
              <p className="text-sm text-(--color-muted-text) italic opacity-70">No pending leisure activities.</p>
            ) : (
              leisureTasks.map(task => (
                <div key={task.id} className="bg-(--color-neutral) border border-(--color-border) p-3 rounded-md flex justify-between items-center">
                  <span className="text-(--color-on-surface) font-medium">{task.title}</span>
                  <button 
                    onClick={() => useStore.getState().updateTaskStatus(task.id, 'completed')}
                    className="text-xs text-(--color-primary-60) hover:text-(--color-on-surface) bg-transparent border-none cursor-pointer hover:underline"
                  >
                    Mark Done
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
