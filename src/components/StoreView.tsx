import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { supabase } from '../lib/supabase';
import { ShoppingBag, Plus, Trash2 } from 'lucide-react';
import confetti from 'canvas-confetti';

const PREDEFINED_ICONS = ['🎮', '🎬', '🍿', '📚', '☕', '🍰', '🚶', '🛌'];

export default function StoreView() {
  const { user, isGuest, coinBalance, setCoinBalance, rewards, addReward, deleteReward } = useStore();
  
  const [title, setTitle] = useState('');
  const [cost, setCost] = useState(50);
  const [icon, setIcon] = useState('🎮');

  const handleAddReward = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user && !isGuest) return;
    
    const newReward = {
      id: isGuest ? Math.random().toString(36).substring(2, 11) : undefined,
      user_id: user?.id || 'guest',
      title,
      cost,
      icon,
      created_at: new Date().toISOString()
    };
    
    if (isGuest) {
      addReward(newReward as any);
      setTitle('');
      setCost(50);
      return;
    }
    
    const { data, error } = await supabase.from('rewards').insert({
      user_id: user!.id,
      title,
      cost,
      icon
    }).select().single();
    
    if (data && !error) {
      addReward(data);
      setTitle('');
      setCost(50);
    }
  };

  const handlePurchase = async (rewardId: string, rewardCost: number, rewardTitle: string, e: React.MouseEvent) => {
    if (!user && !isGuest) return;
    
    if (coinBalance < rewardCost) {
      // Small visual feedback instead of alert? Or just a toast, but we don't have a toast library. Let's just do nothing or a simple console log
      return;
    }
    
    const newBalance = coinBalance - rewardCost;
    
    // Update local state and DB concurrently
    setCoinBalance(newBalance);
    
    if (user && !isGuest) {
      supabase.from('profiles').update({ coin_balance: newBalance }).eq('id', user.id).then();
      
      // Record transaction
      supabase.from('transactions').insert({
        user_id: user.id,
        amount: -rewardCost,
        type: 'purchase',
        description: `Purchased: ${rewardTitle}`
      }).then();
    }
    
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;
    
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { x, y },
      colors: ['#FACC15', '#F59E0B', '#D97706'],
      disableForReducedMotion: true
    });

    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3');
    audio.volume = 0.5;
    audio.play().catch(console.error);
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-6xl mx-auto">
      
      {/* Create New Reward Section */}
      <div className="bg-(--color-surface) rounded-2xl p-6 md:p-8 border border-(--color-border) shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-(--color-reward)/10 rounded-full blur-[80px] -z-10"></div>
        
        <h2 className="text-2xl font-normal mb-6 text-(--color-on-surface) flex items-center gap-2" style={{ fontFamily: 'var(--font-varela)' }}>
          <Plus className="text-(--color-reward)" /> Create Custom Reward
        </h2>
        
        <form onSubmit={handleAddReward} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-xs font-bold text-(--color-muted-text) uppercase mb-2">Reward Name</label>
            <input 
              type="text" 
              placeholder="e.g. 1 Hour of Gaming" 
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              className="w-full bg-(--color-neutral) text-(--color-on-surface) h-12 px-4 rounded-lg border border-(--color-border) focus:outline-none focus:border-(--color-reward)"
            />
          </div>
          
          <div className="w-full md:w-32">
            <label className="block text-xs font-bold text-(--color-muted-text) uppercase mb-2">Cost</label>
            <input 
              type="number" 
              min={1}
              value={cost}
              onChange={e => setCost(Number(e.target.value))}
              required
              className="w-full bg-(--color-neutral) text-(--color-reward) font-bold h-12 px-4 rounded-lg border border-(--color-border) focus:outline-none focus:border-(--color-reward)"
            />
          </div>
          
          <div className="w-full md:w-auto">
            <label className="block text-xs font-bold text-(--color-muted-text) uppercase mb-2">Icon</label>
            <select 
              value={icon}
              onChange={e => setIcon(e.target.value)}
              className="w-full md:w-24 bg-(--color-neutral) text-(--color-on-surface) text-xl h-12 px-2 rounded-lg border border-(--color-border) focus:outline-none focus:border-(--color-reward) appearance-none text-center cursor-pointer"
            >
              {PREDEFINED_ICONS.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>
          
          <button 
            type="submit" 
            className="w-full md:w-auto bg-(--color-surface-2) border border-(--color-reward)/30 text-(--color-reward) hover:bg-(--color-reward) hover:text-black transition-colors rounded-lg h-12 px-6 font-bold cursor-pointer"
          >
            Add
          </button>
        </form>
      </div>

      {/* Rewards List */}
      <div className="bg-(--color-surface) rounded-2xl p-6 md:p-8 border border-(--color-border) shadow-lg">
        <h2 className="text-2xl font-normal mb-6 text-(--color-on-surface) flex items-center gap-2" style={{ fontFamily: 'var(--font-varela)' }}>
          <ShoppingBag className="text-(--color-primary-60)" /> Rewards Inventory
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {rewards.length === 0 ? (
            <p className="text-(--color-muted-text) italic col-span-full opacity-60 text-center py-8">
              No rewards created yet. Add some treats above!
            </p>
          ) : (
            rewards.map(reward => (
              <div key={reward.id} className="relative bg-white/5 border border-(--color-border) p-5 rounded-xl flex flex-col items-center text-center gap-4 hover:border-(--color-reward)/50 transition-colors group">
                <button 
                  onClick={() => deleteReward(reward.id)}
                  className="absolute top-2 right-2 p-2 rounded-lg text-(--color-muted-text) hover:text-red-400 hover:bg-red-400/10 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                  title="Delete Reward"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="text-4xl bg-(--color-neutral) w-16 h-16 rounded-full flex items-center justify-center border border-(--color-border) shadow-md">
                  {reward.icon}
                </div>
                
                <h3 className="text-lg font-bold text-(--color-on-surface) leading-tight h-12 flex items-center justify-center">
                  {reward.title}
                </h3>
                
                <button 
                  onClick={(e) => handlePurchase(reward.id, reward.cost, reward.title, e)}
                  disabled={coinBalance < reward.cost}
                  className="w-full bg-(--color-surface-2) border border-(--color-reward)/20 text-(--color-reward) hover:bg-(--color-reward)/20 transition-colors rounded-lg py-3 font-bold disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex justify-center items-center gap-2"
                >
                  Buy for {reward.cost} coins
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
