import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';

export type QuadrantType = 'q1_urgent_important' | 'q2_not_urgent_important' | 'q3_urgent_not_important' | 'q4_not_urgent_not_important';
export type ViewType = 'tasks' | 'timer' | 'store' | 'party' | 'settings' | 'profile';
export type TaskViewMode = 'matrix' | 'list';

export interface Task {
  id: string;
  user_id: string;
  title: string;
  tags: string[];
  quadrant: QuadrantType;
  reward_amount: number;
  is_required: boolean;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
}

export interface Reward {
  id: string;
  user_id: string;
  title: string;
  cost: number;
  icon: string;
  created_at: string;
}

export interface Profile {
  id: string;
  username: string;
  coin_balance: number;
}

export interface Soundscape {
  id: string;
  name: string;
  unlocked: boolean;
  cost: number;
}

interface StoreState {
  user: any | null;
  coinBalance: number;
  tasks: Task[];
  rewards: Reward[];
  profiles: Profile[];
  soundscapes: Soundscape[];
  activeSoundscape: string | null;
  currentView: ViewType;
  taskViewMode: TaskViewMode;
  editingTask: Task | null;
  
  // Timer State
  timerMode: 'work' | 'shortBreak' | 'longBreak';
  timerTimeLeft: number;
  timerIsRunning: boolean;
  timerSettings: { work: number; shortBreak: number; longBreak: number; autoStart: boolean; cyclesBeforeLongBreak: number };
  
  // Theme State
  theme: 'habitica-dark' | 'classic-light';
  
  // Avatar State
  avatarStyle: string;
  avatarSeed: string;
  setAvatarStyle: (style: string) => void;
  setAvatarSeed: (seed: string) => void;
  
  // Tags State
  customTags: Record<string, string>;
  setCustomTagColor: (tag: string, color: string) => void;
  deleteCustomTag: (tag: string) => void;
  
  setUser: (user: any) => void;
  setCoinBalance: (balance: number) => void;
  setTasks: (tasks: Task[]) => void;
  setRewards: (rewards: Reward[]) => void;
  setProfiles: (profiles: Profile[]) => void;
  setCurrentView: (view: ViewType) => void;
  setTaskViewMode: (mode: TaskViewMode) => void;
  
  addTask: (task: Task) => void;
  addReward: (reward: Reward) => void;
  updateTaskStatus: (taskId: string, status: 'completed' | 'failed' | 'pending') => void;
  updateTaskContent: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  unlockSoundscape: (id: string) => void;
  setActiveSoundscape: (id: string | null) => void;

  setTimerMode: (mode: 'work' | 'shortBreak' | 'longBreak') => void;
  setTimerTimeLeft: (time: number) => void;
  setTimerIsRunning: (isRunning: boolean) => void;
  setTimerSettings: (settings: Partial<{work: number, shortBreak: number, longBreak: number, autoStart: boolean, cyclesBeforeLongBreak: number}>) => void;
  decrementTimer: () => void;
  
  setTheme: (theme: 'habitica-dark' | 'classic-light') => void;
  
  fetchUserData: () => Promise<void>;
  fetchPartyData: () => Promise<void>;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      user: null,
      coinBalance: 0,
      tasks: [],
      rewards: [],
      profiles: [],
      soundscapes: [
        { id: 'deep-rain', name: 'Deep Rain', unlocked: false, cost: 50 },
        { id: 'white-noise', name: 'White Noise', unlocked: true, cost: 0 },
      ],
      activeSoundscape: null,
      currentView: 'tasks',
      taskViewMode: 'matrix',
      editingTask: null,
      avatarStyle: 'adventurer',
      avatarSeed: '',
      timerMode: 'work',
      timerTimeLeft: 25 * 60,
      timerIsRunning: false,
      timerSettings: { work: 25, shortBreak: 5, longBreak: 15, autoStart: false, cyclesBeforeLongBreak: 4 },
      theme: 'habitica-dark',
      customTags: {
        'Work': '#3B82F6',
        'Health': '#22C55E',
        'Learning': '#A855F7',
        'Chores': '#F97316',
        'Social': '#EC4899',
        'Personal': '#64748B'
      },

      setCustomTagColor: (tag, color) => set((state) => ({ customTags: { ...state.customTags, [tag]: color } })),
      deleteCustomTag: (tag) => set((state) => {
        const newTags = { ...state.customTags };
        delete newTags[tag];
        return { customTags: newTags };
      }),

  setUser: (user) => set({ user }),
  setCoinBalance: (coinBalance) => set({ coinBalance }),
  setTasks: (tasks) => set({ tasks }),
  setRewards: (rewards) => set({ rewards }),
  setProfiles: (profiles) => set({ profiles }),
  setCurrentView: (view) => set({ currentView: view }),
  setTaskViewMode: (mode) => set({ taskViewMode: mode }),
  
  setTimerMode: (mode) => set({ timerMode: mode }),
  setTimerTimeLeft: (time) => set({ timerTimeLeft: time }),
  setTimerIsRunning: (isRunning) => set({ timerIsRunning: isRunning }),
  setAvatarStyle: (style) => set({ avatarStyle: style }),
  setAvatarSeed: (seed) => set({ avatarSeed: seed }),
  setEditingTask: (task) => set({ editingTask: task }),
  setTimerSettings: (settings) => set((state) => {
    const newSettings = { ...state.timerSettings, ...settings };
    if (!state.timerIsRunning) {
      return { 
        timerSettings: newSettings,
        timerTimeLeft: newSettings[state.timerMode] * 60
      };
    }
    return { timerSettings: newSettings };
  }),

  updateTaskContent: async (taskId, updates) => {
    set((state) => ({
      tasks: state.tasks.map(t => t.id === taskId ? { ...t, ...updates } : t)
    }));
    
    try {
      await supabase.from('tasks').update(updates).eq('id', taskId);
    } catch (e) {
      console.error("Error updating task:", e);
    }
  },
  
  deleteTask: async (taskId) => {
    set((state) => ({
      tasks: state.tasks.filter(t => t.id !== taskId)
    }));
    
    try {
      await supabase.from('tasks').delete().eq('id', taskId);
    } catch (e) {
      console.error("Error deleting task:", e);
    }
  },

  decrementTimer: () => set((state) => {
    if (state.timerTimeLeft <= 1) {
      try {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3');
        audio.volume = 0.5;
        audio.play().catch(e => console.error(e));
      } catch (e) {}

      const nextMode = state.timerMode === 'work' ? 'shortBreak' : 'work';
      return { 
        timerMode: nextMode, 
        timerTimeLeft: state.timerSettings[nextMode] * 60, 
        timerIsRunning: state.timerSettings.autoStart 
      };
    }
    return { timerTimeLeft: state.timerTimeLeft - 1 };
  }),
  
  setTheme: (theme) => {
    set({ theme });
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
    }
  },
  
  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
  addReward: (reward) => set((state) => ({ rewards: [...state.rewards, reward] })),
  
  updateTaskStatus: async (taskId, status) => {
    const { tasks, user, coinBalance } = get();
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    // Optimistic update
    set((state) => ({
      tasks: state.tasks.map(t => t.id === taskId ? { ...t, status } : t)
    }));

    if (status === 'completed' && user) {
      const newBalance = coinBalance + task.reward_amount;
      set({ coinBalance: newBalance });
      
      // Update DB
      supabase.from('tasks').update({ status }).eq('id', taskId).then();
      supabase.from('profiles').update({ coin_balance: newBalance }).eq('id', user.id).then();
      supabase.from('transactions').insert({
        user_id: user.id,
        amount: task.reward_amount,
        type: 'reward',
        description: `Completed quest: ${task.title}`
      }).then();
    } else if (user) {
      supabase.from('tasks').update({ status }).eq('id', taskId).then();
    }
  },

  unlockSoundscape: (id) => {
    const { coinBalance, soundscapes } = get();
    const soundscape = soundscapes.find(s => s.id === id);
    if (soundscape && !soundscape.unlocked && coinBalance >= soundscape.cost) {
      set((state) => ({
        coinBalance: state.coinBalance - soundscape.cost,
        soundscapes: state.soundscapes.map(s => s.id === id ? { ...s, unlocked: true } : s)
      }));
    }
  },

  setActiveSoundscape: (id) => set({ activeSoundscape: id }),

  fetchUserData: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      set({ user });
      let { data: profile } = await supabase
        .from('profiles')
        .select('coin_balance, username')
        .eq('id', user.id)
        .single();
      
      // If profile doesn't exist (e.g. RLS blocked it on signup previously, or foreign key constraint would fail), create it now
      if (!profile) {
        const { data: newProfile } = await supabase.from('profiles').insert({
          id: user.id,
          username: user.email?.split('@')[0] || 'adventurer',
          coin_balance: 100
        }).select('coin_balance, username').single();
        
        if (newProfile) {
          profile = newProfile;
        }
      }

      if (profile) {
        set({ coinBalance: profile.coin_balance });
      }

      const { data: tasks } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (tasks) set({ tasks });

      const { data: rewards } = await supabase
        .from('rewards')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (rewards) set({ rewards });
    }
  },

  fetchPartyData: async () => {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, username, coin_balance')
      .order('coin_balance', { ascending: false });
      
    if (profiles) set({ profiles });
  }
    }),
    {
      name: 'zen-task-storage',
      merge: (persistedState: any, currentState) => {
        const merged = { ...currentState, ...persistedState };
        if (persistedState.customTags && Object.keys(persistedState.customTags).length === 0) {
          merged.customTags = currentState.customTags;
        }
        if (persistedState.timerSettings) {
          merged.timerTimeLeft = persistedState.timerSettings.work * 60;
          merged.timerMode = 'work';
        }
        return merged;
      },
      partialize: (state) => ({ 
        customTags: state.customTags,
        timerSettings: state.timerSettings,
        theme: state.theme,
        taskViewMode: state.taskViewMode,
        soundscapes: state.soundscapes
      }),
    }
  )
);
