import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { supabase } from '../lib/supabase';
import { ShoppingBag, Plus, Trash2 } from 'lucide-react';

const PREDEFINED_ICONS = ['🎮', '🎬', '🍿', '📚', '☕', '🍰', '🚶', '🛌'];

export default function StoreView() {
  const { user, coinBalance, setCoinBalance, rewards, addReward } = useStore();
  
  const [title, setTitle] = useState('');
  const [cost, setCost] = useState(50);
  const [icon, setIcon] = useState('🎮');

  const handleAddReward = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    const newReward = {
      user_id: user.id,
      title,
      cost,
      icon,
    };
    
    const { data, error } = await supabase.from('rewards').insert(newReward).select().single();
    
    if (data && !error) {
      addReward(data);
      setTitle('');
      setCost(50);
    }
  };

  const handlePurchase = async (rewardId: string, rewardCost: number, rewardTitle: string) => {
    if (!user) return;
    
    if (coinBalance < rewardCost) {
      alert("Not enough coins to purchase this reward.");
      return;
    }
    
    const newBalance = coinBalance - rewardCost;
    
    // Update local state and DB concurrently
    setCoinBalance(newBalance);
    await supabase.from('profiles').update({ coin_balance: newBalance }).eq('id', user.id);
    
    // Record transaction
    await supabase.from('transactions').insert({
      user_id: user.id,
      amount: -rewardCost,
      type: 'purchase',
      description: `Purchased: ${rewardTitle}`
    });
    
    alert(`Successfully purchased: ${rewardTitle}! Enjoy!`);
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-6xl mx-auto">
      
      {/* Create New Reward Section */}
      <div className="bg-(--color-surface) rounded-2xl p-6 md:p-8 border border-(--color-border) shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/10 rounded-full blur-[80px] -z-10"></div>
        
        <h2 className="text-2xl font-normal mb-6 text-(--color-on-surface) flex items-center gap-2" style={{ fontFamily: 'var(--font-varela)' }}>
          <Plus className="text-yellow-400" /> Create Custom Reward
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
              className="w-full bg-(--color-neutral) text-(--color-on-surface) h-12 px-4 rounded-lg border border-(--color-border) focus:outline-none focus:border-yellow-400"
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
              className="w-full bg-(--color-neutral) text-yellow-400 font-bold h-12 px-4 rounded-lg border border-(--color-border) focus:outline-none focus:border-yellow-400"
            />
          </div>
          
          <div className="w-full md:w-auto">
            <label className="block text-xs font-bold text-(--color-muted-text) uppercase mb-2">Icon</label>
            <select 
              value={icon}
              onChange={e => setIcon(e.target.value)}
              className="w-full md:w-24 bg-(--color-neutral) text-(--color-on-surface) text-xl h-12 px-2 rounded-lg border border-(--color-border) focus:outline-none focus:border-yellow-400 appearance-none text-center cursor-pointer"
            >
              {PREDEFINED_ICONS.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>
          
          <button 
            type="submit" 
            className="w-full md:w-auto bg-(--color-surface-2) border border-yellow-400/30 text-yellow-400 hover:bg-yellow-400 hover:text-black transition-colors rounded-lg h-12 px-6 font-bold cursor-pointer"
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
              <div key={reward.id} className="bg-white/5 border border-(--color-border) p-5 rounded-xl flex flex-col items-center text-center gap-4 hover:border-yellow-400/50 transition-colors group">
                <div className="text-4xl bg-(--color-neutral) w-16 h-16 rounded-full flex items-center justify-center border border-(--color-border) shadow-md">
                  {reward.icon}
                </div>
                
                <h3 className="text-lg font-bold text-(--color-on-surface) leading-tight h-12 flex items-center justify-center">
                  {reward.title}
                </h3>
                
                <button 
                  onClick={() => handlePurchase(reward.id, reward.cost, reward.title)}
                  disabled={coinBalance < reward.cost}
                  className="w-full bg-(--color-surface-2) border border-yellow-400/20 text-yellow-400 hover:bg-yellow-400/20 transition-colors rounded-lg py-3 font-bold disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex justify-center items-center gap-2"
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
