import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { User, Trophy, Coins, Target, Pencil, X, RefreshCw } from 'lucide-react';

const STYLES = ['adventurer', 'bottts', 'lorelei', 'micah', 'pixel-art', 'avataaars'];
const generateRandomSeed = () => Math.random().toString(36).substring(2, 8);

export default function ProfileView() {
  const { user, profiles, tasks, avatarStyle, setAvatarStyle, avatarSeed, setAvatarSeed } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStyle, setModalStyle] = useState(avatarStyle || 'adventurer');
  const [randomSeeds, setRandomSeeds] = useState<string[]>(Array.from({ length: 9 }, generateRandomSeed));
  
  // Find current user's profile
  const profile = profiles.find(p => p.id === user?.id);
  
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const pendingTasks = tasks.filter(t => t.status === 'pending').length;

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-8">
      
      <div className="bg-(--color-surface) rounded-2xl p-6 md:p-8 border border-(--color-border) shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-(--color-primary)/20 rounded-full blur-[100px] -z-10"></div>
        
        <h2 className="text-3xl font-normal mb-8 text-(--color-on-surface) flex items-center gap-3" style={{ fontFamily: 'var(--font-varela)' }}>
          <User className="text-(--color-primary-60) w-8 h-8" /> 
          Adventurer Profile
        </h2>
        
        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start mb-8">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full bg-(--color-surface-2) flex items-center justify-center border-4 border-(--color-primary-60) overflow-hidden shrink-0 shadow-lg">
              <img src={`https://api.dicebear.com/7.x/${avatarStyle}/svg?seed=${avatarSeed || user?.id || 'default'}`} alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="absolute bottom-0 right-0 w-10 h-10 bg-(--color-primary) text-white rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:scale-110 transition-transform border-2 border-(--color-surface)"
            >
              <Pencil className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex flex-col gap-2 text-center md:text-left flex-1">
            <h3 className="text-2xl font-bold text-(--color-on-surface)">{profile?.username || user?.email || 'Guest Adventurer'}</h3>
            <p className="text-(--color-muted-text)">Level 1 Novice Adventurer</p>
            <div className="mt-4 flex flex-wrap gap-2 justify-center md:justify-start">
              <span className="px-3 py-1 bg-(--color-primary)/20 text-(--color-primary-60) rounded-full text-xs font-bold uppercase tracking-wider border border-(--color-primary-60)/30">Hero</span>
              <span className="px-3 py-1 bg-amber-500/20 text-amber-500 rounded-full text-xs font-bold uppercase tracking-wider border border-amber-500/30">Beta Tester</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-(--color-neutral) rounded-xl p-4 border border-(--color-border) flex flex-col items-center justify-center gap-2">
            <Coins className="text-(--color-reward) w-6 h-6" />
            <div className="text-2xl font-bold text-(--color-on-surface) font-mono">{profile?.coin_balance || 0}</div>
            <div className="text-xs text-(--color-muted-text) uppercase tracking-wider font-bold">Total Wealth</div>
          </div>
          
          <div className="bg-(--color-neutral) rounded-xl p-4 border border-(--color-border) flex flex-col items-center justify-center gap-2">
            <Trophy className="text-blue-500 w-6 h-6" />
            <div className="text-2xl font-bold text-(--color-on-surface) font-mono">{completedTasks}</div>
            <div className="text-xs text-(--color-muted-text) uppercase tracking-wider font-bold">Quests Completed</div>
          </div>
          
          <div className="bg-(--color-neutral) rounded-xl p-4 border border-(--color-border) flex flex-col items-center justify-center gap-2">
            <Target className="text-red-500 w-6 h-6" />
            <div className="text-2xl font-bold text-(--color-on-surface) font-mono">{pendingTasks}</div>
            <div className="text-xs text-(--color-muted-text) uppercase tracking-wider font-bold">Active Quests</div>
          </div>
        </div>

      </div>

      {/* Avatar Picker Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-4 backdrop-blur-sm overflow-hidden">
          <div 
            className="bg-(--color-surface) w-full max-w-2xl rounded-2xl shadow-2xl border border-(--color-border) flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-6 border-b border-(--color-border)">
              <h3 className="text-xl font-bold text-(--color-on-surface) flex items-center gap-2">
                <User className="text-(--color-primary-60)" /> Select Avatar
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-(--color-muted-text) hover:text-(--color-on-surface) transition-colors bg-transparent border-none cursor-pointer p-2"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex flex-col gap-6">
              
              <div>
                <label className="block text-sm font-bold text-(--color-muted-text) mb-3 uppercase tracking-wider">Style</label>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                  {STYLES.map(style => (
                    <button
                      key={style}
                      onClick={() => setModalStyle(style)}
                      className={`px-4 py-2 rounded-lg border text-sm font-bold capitalize transition-all cursor-pointer shrink-0 ${
                        modalStyle === style 
                          ? 'bg-(--color-primary)/20 border-(--color-primary-60) text-(--color-on-surface)' 
                          : 'bg-(--color-neutral) border-(--color-border) text-(--color-muted-text) hover:border-(--color-primary-60)/50'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-bold text-(--color-muted-text) uppercase tracking-wider">Select a Character</label>
                  <button 
                    onClick={() => setRandomSeeds(Array.from({ length: 9 }, generateRandomSeed))}
                    className="flex items-center gap-2 text-sm text-(--color-primary-60) hover:text-(--color-primary) bg-transparent border-none cursor-pointer font-bold transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" /> Shuffle
                  </button>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  {randomSeeds.map(seed => (
                    <button
                      key={seed}
                      onClick={() => {
                        setAvatarStyle(modalStyle);
                        setAvatarSeed(seed);
                        setIsModalOpen(false);
                      }}
                      className="bg-(--color-neutral) border-2 border-(--color-border) rounded-xl aspect-square overflow-hidden hover:border-(--color-primary-60) hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer p-2 flex items-center justify-center"
                    >
                      <img src={`https://api.dicebear.com/7.x/${modalStyle}/svg?seed=${seed}`} alt="Avatar option" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
              
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
