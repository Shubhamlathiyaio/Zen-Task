import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export type QuadrantType = 'q1_urgent_important' | 'q2_not_urgent_important' | 'q3_urgent_not_important' | 'q4_not_urgent_not_important';
export type ViewType = 'tasks' | 'timer' | 'store' | 'party' | 'settings';
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
  theme: 'habitica-dark' | 'classic-light';
  
  // Timer State
  timerMode: 'work' | 'shortBreak' | 'longBreak';
  timerTimeLeft: number;
  timerIsRunning: boolean;
  
  setUser: (user: any) => void;
  setCoinBalance: (balance: number) => void;
  setTasks: (tasks: Task[]) => void;
  setRewards: (rewards: Reward[]) => void;
  setProfiles: (profiles: Profile[]) => void;
  setCurrentView: (view: ViewType) => void;
  setTaskViewMode: (mode: TaskViewMode) => void;
  
  addTask: (task: Task) => void;
  addReward: (reward: Reward) => void;
  updateTaskStatus: (taskId: string, status: 'completed' | 'failed') => void;
  unlockSoundscape: (id: string) => void;
  setActiveSoundscape: (id: string | null) => void;
  setTheme: (theme: 'habitica-dark' | 'classic-light') => void;

  setTimerMode: (mode: 'work' | 'shortBreak' | 'longBreak') => void;
  setTimerTimeLeft: (time: number) => void;
  setTimerIsRunning: (isRunning: boolean) => void;
  tickTimer: () => void;
  
  fetchUserData: () => Promise<void>;
  fetchPartyData: () => Promise<void>;
}

export const useStore = create<StoreState>((set, get) => ({
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
  theme: 'habitica-dark',
  timerMode: 'work',
  timerTimeLeft: 25 * 60,
  timerIsRunning: false,

  setUser: (user) => set({ user }),
  setCoinBalance: (coinBalance) => set({ coinBalance }),
  setTasks: (tasks) => set({ tasks }),
  setRewards: (rewards) => set({ rewards }),
  setProfiles: (profiles) => set({ profiles }),
  setCurrentView: (view) => set({ currentView: view }),
  setTaskViewMode: (mode) => set({ taskViewMode: mode }),
  setTheme: (theme) => set({ theme }),
  
  setTimerMode: (mode) => set({ timerMode: mode }),
  setTimerTimeLeft: (time) => set({ timerTimeLeft: time }),
  setTimerIsRunning: (isRunning) => set({ timerIsRunning: isRunning }),
  tickTimer: () => set((state) => {
    if (state.timerTimeLeft <= 1) {
      return { timerTimeLeft: 0, timerIsRunning: false };
    }
    return { timerTimeLeft: state.timerTimeLeft - 1 };
  }),
  
  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
  addReward: (reward) => set((state) => ({ rewards: [...state.rewards, reward] })),
  
  updateTaskStatus: (taskId, status) => {
    set((state) => ({
      tasks: state.tasks.map(t => t.id === taskId ? { ...t, status } : t)
    }));
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
}));
