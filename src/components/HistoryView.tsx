import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { History, Calendar, Target, Flame, Coins, Filter } from 'lucide-react';

export default function HistoryView() {
  const { taskHistory } = useStore();
  const [typeFilter, setTypeFilter] = useState<'all' | 'task' | 'habit'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month' | 'custom'>('all');
  const [customDate, setCustomDate] = useState('');

  const filteredHistory = taskHistory.filter(h => {
    if (typeFilter !== 'all' && h.item_type !== typeFilter) return false;
    
    if (dateFilter !== 'all') {
      const date = new Date(h.completed_at);
      const now = new Date();
      
      if (dateFilter === 'today') {
        return date.toDateString() === now.toDateString();
      }

      if (dateFilter === 'custom' && customDate) {
        const tzOffset = date.getTimezoneOffset() * 60000;
        const localISOTime = (new Date(date.getTime() - tzOffset)).toISOString().split('T')[0];
        return localISOTime === customDate;
      }
      
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (dateFilter === 'week' && diffDays > 7) return false;
      if (dateFilter === 'month' && diffDays > 30) return false;
    }
    return true;
  });
  
  const totalCoinsEarned = filteredHistory.reduce((sum, item) => sum + item.coins_earned, 0);

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="bg-(--color-primary-60)/20 p-3 rounded-xl border border-(--color-primary-60)/30">
          <History className="w-6 h-6 text-(--color-primary-60)" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-(--color-on-surface)" style={{ fontFamily: 'var(--font-varela)' }}>
          Chronicles
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-(--color-surface) rounded-2xl p-4 md:p-6 border border-(--color-border) shadow-xl flex flex-col justify-center items-center text-center">
          <Coins className="w-8 h-8 text-amber-500 mb-2" />
          <p className="text-(--color-muted-text) text-sm font-bold uppercase tracking-widest mb-1">Total Spoils</p>
          <p className="text-4xl font-black text-(--color-on-surface) font-mono">{totalCoinsEarned}</p>
        </div>
        <div className="bg-(--color-surface) rounded-2xl p-4 md:p-6 border border-(--color-border) shadow-xl flex flex-col justify-center items-center text-center">
          <Target className="w-8 h-8 text-(--color-primary-60) mb-2" />
          <p className="text-(--color-muted-text) text-sm font-bold uppercase tracking-widest mb-1">Actions Completed</p>
          <p className="text-4xl font-black text-(--color-on-surface) font-mono">{filteredHistory.length}</p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between bg-(--color-surface) p-2 rounded-xl border border-(--color-border) flex-wrap gap-2">
          <div className="flex items-center gap-2 px-3 text-(--color-muted-text)">
            <Filter className="w-4 h-4" />
            <span className="text-sm font-bold uppercase">Type</span>
          </div>
          <div className="flex gap-2">
            {['all', 'task', 'habit'].map(f => (
              <button
                key={f}
                onClick={() => setTypeFilter(f as any)}
                className={`px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wider transition-all border-none cursor-pointer ${typeFilter === f ? 'bg-(--color-primary) text-white' : 'bg-transparent text-(--color-muted-text) hover:bg-(--color-surface-2) hover:text-(--color-on-surface)'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between bg-(--color-surface) p-2 rounded-xl border border-(--color-border) flex-wrap gap-2">
          <div className="flex items-center gap-2 px-3 text-(--color-muted-text)">
            <Calendar className="w-4 h-4" />
            <span className="text-sm font-bold uppercase">Time</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0 custom-scrollbar">
            {[
              { id: 'today', label: 'Today' },
              { id: 'week', label: '7 Days' },
              { id: 'month', label: '30 Days' },
              { id: 'all', label: 'All Time' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setDateFilter(f.id as any)}
                className={`px-3 py-2 rounded-lg text-sm font-bold uppercase tracking-wider transition-all border-none cursor-pointer whitespace-nowrap shrink-0 ${dateFilter === f.id ? 'bg-(--color-primary) text-white' : 'bg-transparent text-(--color-muted-text) hover:bg-(--color-surface-2) hover:text-(--color-on-surface)'}`}
              >
                {f.label}
              </button>
            ))}
            <input 
              type="date"
              value={customDate}
              onChange={(e) => {
                setCustomDate(e.target.value);
                setDateFilter('custom');
              }}
              className={`px-3 py-1.5 rounded-lg text-sm font-bold tracking-wider transition-all border cursor-pointer outline-none shrink-0 h-[36px] ${dateFilter === 'custom' ? 'bg-(--color-primary) text-white border-transparent' : 'bg-transparent text-(--color-muted-text) border-(--color-border) hover:bg-(--color-surface-2)'}`}
              style={{ fontFamily: 'var(--font-roboto)' }}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 mt-4">
        <AnimatePresence>
          {filteredHistory.map(item => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-(--color-surface) p-4 rounded-xl border border-(--color-border) flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${item.item_type === 'habit' ? 'bg-amber-500/20 text-amber-500' : 'bg-(--color-primary-60)/20 text-(--color-primary-60)'}`}>
                  {item.item_type === 'habit' ? <Flame className="w-5 h-5" /> : <Target className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-(--color-on-surface) m-0" style={{ fontFamily: 'var(--font-roboto)' }}>{item.title}</h3>
                  <div className="flex items-center gap-2 mt-1 text-sm text-(--color-muted-text)">
                    <Calendar className="w-3 h-3" />
                    {new Date(item.completed_at).toLocaleDateString()} {new Date(item.completed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
              <div className="bg-(--color-surface-2) px-4 py-2 rounded-lg shrink-0 w-full md:w-auto text-center md:text-right">
                <span className="text-amber-500 font-bold font-mono text-lg">+{item.coins_earned}</span>
                <span className="text-(--color-muted-text) text-xs uppercase ml-1">coins</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredHistory.length === 0 && (
          <div className="text-center p-12 bg-(--color-surface) rounded-2xl border border-(--color-border) border-dashed">
            <History className="w-12 h-12 text-(--color-muted-text) opacity-50 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-(--color-on-surface) mb-2">No chronicles found</h3>
            <p className="text-(--color-muted-text)">Complete quests and habits to write your history.</p>
          </div>
        )}
      </div>
    </div>
  );
}
