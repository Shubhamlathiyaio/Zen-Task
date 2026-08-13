import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';

export type QuadrantType = 'q1_urgent_important' | 'q2_not_urgent_important' | 'q3_urgent_not_important' | 'q4_not_urgent_not_important';
export type ViewType = 'tasks' | 'timer' | 'store' | 'party' | 'settings' | 'profile' | 'history';
export type TaskViewMode = 'matrix' | 'list';
export type HabitType = 'flexible' | 'timed';
export type HabitFrequency = 'daily' | 'weekly' | 'monthly';

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
  pending_coins?: number;
  matrix_quadrant?: number;
}

export interface Habit {
  id: string;
  user_id: string;
  title: string;
  tags?: string[];
  habit_type?: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  reward_amount: number;
  is_required: boolean;
  target_duration_mins?: number;
  pending_coins: number;
  streak_count: number;
  last_completed_at?: string;
  created_at: string;
}

export interface TaskHistory {
  id: string;
  user_id: string;
  title: string;
  item_type: 'task' | 'habit';
  duration_logged_mins: number;
  coins_earned: number;
  completed_at: string;
}

export interface ActiveTimer {
  id: string;
  refId: string;
  type: 'task' | 'habit';
  title: string;
  startTime: number;
  elapsed: number;
  isRunning: boolean;
  multiplier: number;
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

export interface Party {
  id: string;
  name: string;
  invite_code: string;
}

export interface PartyMember {
  id: string;
  party_id: string;
  user_id: string;
  role: string;
  profiles?: Profile;
}

export interface TavernActivity {
  id: string;
  type: 'challenge' | 'gift' | 'task';
  message: string;
  timestamp: string;
}

export interface CoinTransfer {
  id: string;
  sender_id: string;
  receiver_id: string;
  amount: number;
  status: 'Pending' | 'Completed' | 'Rejected' | 'Cancelled';
  challenge_task_id?: string;
  created_at: string;
}


interface StoreState {
  user: any | null;
  isGuest: boolean;
  isAuthLoading: boolean;
  coinBalance: number;
  tasks: Task[];
  habits: Habit[];
  taskHistory: TaskHistory[];
  rewards: Reward[];
  profiles: Profile[];
  soundscapes: Soundscape[];
  activeSoundscape: string | null;
  currentView: ViewType;
  taskViewMode: TaskViewMode;
  
  // Party & Social State
  activeParty: Party | null;
  partyMembers: PartyMember[];
  tavernActivities: TavernActivity[];
  pendingTransfers: CoinTransfer[];
  onlineCount: number;
  
  // Timer State
  timerMode: 'work' | 'shortBreak' | 'longBreak';
  timerTimeLeft: number;
  timerIsRunning: boolean;
  timerSettings: { work: number; shortBreak: number; longBreak: number; autoStart: boolean; cyclesBeforeLongBreak: number };
  activeTimers: ActiveTimer[];
  
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
  
  setIsGuest: (isGuest: boolean) => void;
  setIsAuthLoading: (loading: boolean) => void;
  setUser: (user: any) => void;
  setCoinBalance: (balance: number) => void;
  setTasks: (tasks: Task[]) => void;
  setHabits: (habits: Habit[]) => void;
  setTaskHistory: (history: TaskHistory[]) => void;
  setRewards: (rewards: Reward[]) => void;
  setProfiles: (profiles: Profile[]) => void;
  setCurrentView: (view: ViewType) => void;
  setTaskViewMode: (mode: TaskViewMode) => void;
  
  // Party Actions
  createParty: (name: string) => Promise<void>;
  joinParty: (inviteCode: string) => Promise<void>;
  sendGift: (receiverId: string, amount: number) => Promise<void>;
  requestCoinsWithChallenge: (receiverId: string, amount: number, taskId: string) => Promise<void>;
  fetchPartyDetails: () => Promise<void>;
  setupRealtime: () => void;
  setupPresence: () => void;
  teardownPresence: () => void;
  setEditingTask: (task: Task | null) => void;
  
  addTask: (task: Task) => void;
  addHabit: (habit: Habit) => void;
  addReward: (reward: Reward) => void;
  deleteReward: (rewardId: string) => Promise<void>;
  updateTaskStatus: (taskId: string, status: 'completed' | 'failed') => void;
  updateHabitStatus: (habitId: string) => void;
  deleteTask: (taskId: string) => void;
  deleteHabit: (habitId: string) => void;
  editTask: (taskId: string, updates: Partial<Task>) => void;
  editHabit: (habitId: string, updates: Partial<Habit>) => void;
  unlockSoundscape: (id: string) => void;
  setActiveSoundscape: (id: string | null) => void;

  setTimerMode: (mode: 'work' | 'shortBreak' | 'longBreak') => void;
  setTimerTimeLeft: (time: number) => void;
  setTimerIsRunning: (isRunning: boolean) => void;
  setTimerSettings: (settings: Partial<{work: number, shortBreak: number, longBreak: number, autoStart: boolean, cyclesBeforeLongBreak: number}>) => void;
  decrementTimer: () => void;
  
  startActiveTimer: (refId: string, type: 'task' | 'habit', title: string, multiplier: number) => void;
  pauseActiveTimer: (id: string) => void;
  resumeActiveTimer: (id: string) => void;
  stopActiveTimer: (id: string) => void;
  updateTimersElapsed: () => void;
  
  setTheme: (theme: 'habitica-dark' | 'classic-light') => void;
  
  fetchUserData: () => Promise<void>;
  fetchPartyData: () => Promise<void>;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      user: null,
      isGuest: false,
      isAuthLoading: true,
      coinBalance: 0,
      tasks: [],
      habits: [],
      taskHistory: [],
      rewards: [],
      profiles: [],
      soundscapes: [
        { id: 'deep-rain', name: 'Deep Rain', unlocked: false, cost: 50 },
        { id: 'white-noise', name: 'White Noise', unlocked: true, cost: 0 },
      ],
      activeSoundscape: null,
      currentView: 'tasks',
      taskViewMode: 'matrix',
      activeParty: null,
      partyMembers: [],
      tavernActivities: [],
      pendingTransfers: [],
      onlineCount: 0,
      editingTask: null,
      avatarStyle: 'adventurer',
      avatarSeed: '',
      timerMode: 'work',
      timerTimeLeft: 25 * 60,
      timerIsRunning: false,
      timerSettings: { work: 25, shortBreak: 5, longBreak: 15, autoStart: false, cyclesBeforeLongBreak: 4 },
      activeTimers: [],
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

  setIsGuest: (isGuest) => set({ isGuest }),
  setUser: (user) => set({ user }),
  setCoinBalance: (coinBalance) => set({ coinBalance }),
  setTasks: (tasks) => set({ tasks }),
  setRewards: (rewards) => set({ rewards }),
  setProfiles: (profiles) => set({ profiles }),
  setCurrentView: (view) => set({ currentView: view }),
  setTaskViewMode: (mode) => set({ taskViewMode: mode }),
  setEditingTask: (task) => set({ editingTask: task }),
  
  setTimerMode: (mode) => set({ timerMode: mode }),
  setTimerTimeLeft: (time) => set({ timerTimeLeft: time }),
  setTimerIsRunning: (isRunning) => set({ timerIsRunning: isRunning }),
  setAvatarStyle: (style) => set({ avatarStyle: style }),
  setAvatarSeed: (seed) => set({ avatarSeed: seed }),
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

  startActiveTimer: (refId, type, title, multiplier) => set((state) => {
    // Only allow one active timer for a given task/habit to prevent duplicates
    if (state.activeTimers.find(t => t.refId === refId)) return state;
    return {
      activeTimers: [
        ...state.activeTimers,
        {
          id: Math.random().toString(36).substring(2, 9),
          refId,
          type,
          title,
          startTime: Date.now(),
          elapsed: 0,
          isRunning: true,
          multiplier
        }
      ]
    };
  }),

  pauseActiveTimer: (id) => set((state) => ({
    activeTimers: state.activeTimers.map(t => 
      t.id === id ? { ...t, isRunning: false } : t
    )
  })),

  resumeActiveTimer: (id) => set((state) => ({
    activeTimers: state.activeTimers.map(t => 
      t.id === id ? { ...t, isRunning: true, startTime: Date.now() } : t
    )
  })),

  stopActiveTimer: (id) => {
    const state = get();
    const timer = state.activeTimers.find(t => t.id === id);
    if (!timer) return;
    
    const minutes = Math.floor(timer.elapsed / 60);
    const coinsEarned = minutes * timer.multiplier;
    
    // Optimistic state update
    set((s) => {
      const newTimers = s.activeTimers.filter(t => t.id !== id);
      
      if (timer.type === 'task') {
        const tasks = s.tasks.map(t => t.id === timer.refId ? {
          ...t,
          pending_coins: (t.pending_coins || 0) + coinsEarned
        } : t);
        return { activeTimers: newTimers, tasks };
      } else {
        const habits = s.habits.map(h => h.id === timer.refId ? {
          ...h,
          pending_coins: (h.pending_coins || 0) + coinsEarned
        } : h);
        return { activeTimers: newTimers, habits };
      }
    });

    // Update DB
    if (state.user && coinsEarned > 0) {
      if (timer.type === 'task') {
        const task = state.tasks.find(t => t.id === timer.refId);
        if (task) {
           supabase.from('tasks').update({ pending_coins: (task.pending_coins || 0) + coinsEarned }).eq('id', timer.refId).then();
        }
      } else {
        const habit = state.habits.find(h => h.id === timer.refId);
        if (habit) {
           supabase.from('habits').update({ pending_coins: (habit.pending_coins || 0) + coinsEarned }).eq('id', timer.refId).then();
        }
      }
    }
  },

  updateTimersElapsed: () => set((state) => {
    const now = Date.now();
    let changed = false;
    const newTimers = state.activeTimers.map(t => {
      if (t.isRunning) {
        changed = true;
        const diff = (now - t.startTime) / 1000;
        return {
          ...t,
          elapsed: t.elapsed + diff,
          startTime: now
        };
      }
      return t;
    });
    return changed ? { activeTimers: newTimers } : state;
  }),
  
  setTheme: (theme) => {
    set({ theme });
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
    }
  },
  
  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
  addHabit: (habit) => set((state) => ({ habits: [...state.habits, habit] })),
  addReward: (reward) => set((state) => ({ rewards: [...state.rewards, reward] })),
  deleteReward: async (rewardId: string) => {
    set((state) => ({ rewards: state.rewards.filter(r => r.id !== rewardId) }));
    if (get().user) {
      await supabase.from('rewards').delete().eq('id', rewardId);
    }
  },
  
  updateHabitStatus: async (habitId) => {
    const state = get();
    const habit = state.habits.find(h => h.id === habitId);
    if (!habit) return;

    let extraCoins = 0;
    const activeTimer = state.activeTimers.find(t => t.refId === habitId && t.type === 'habit');
    if (activeTimer) {
      const minutes = Math.floor(activeTimer.elapsed / 60);
      extraCoins = minutes * activeTimer.multiplier;
      set((s) => ({ activeTimers: s.activeTimers.filter(t => t.id !== activeTimer.id) }));
    }

    const coinsEarned = habit.pending_coins + extraCoins;
    const newBalance = state.coinBalance + coinsEarned;
    
    // Optimistic update
    set((state) => ({
      coinBalance: newBalance,
      habits: state.habits.map(h => h.id === habitId ? { 
        ...h, 
        streak_count: h.streak_count + 1, 
        pending_coins: 0,
        last_completed_at: new Date().toISOString()
      } : h)
    }));

    if (state.user) {
      const user = state.user;
      supabase.from('profiles').update({ coin_balance: newBalance }).eq('id', user.id).then();
      supabase.from('habits').update({ 
        streak_count: habit.streak_count + 1,
        pending_coins: 0,
        last_completed_at: new Date().toISOString()
      }).eq('id', habitId).then();
      
      supabase.from('task_history').insert({
        user_id: user.id,
        title: habit.title,
        item_type: 'habit',
        coins_earned: coinsEarned,
      }).then();
    }
  },

  updateTaskStatus: async (taskId, status) => {
    const state = get();
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;

    let extraCoins = 0;
    if (status === 'completed') {
      const activeTimer = state.activeTimers.find(t => t.refId === taskId && t.type === 'task');
      if (activeTimer) {
        const minutes = Math.floor(activeTimer.elapsed / 60);
        extraCoins = minutes * activeTimer.multiplier;
        set((s) => ({ activeTimers: s.activeTimers.filter(t => t.id !== activeTimer.id) }));
      }
    }

    // Optimistic update
    set((state) => ({
      tasks: state.tasks.map(t => t.id === taskId ? { ...t, status } : t)
    }));

    if (status === 'completed') {
      const totalReward = task.reward_amount + (task.pending_coins || 0) + extraCoins;
      const newBalance = state.coinBalance + totalReward;
      set({ coinBalance: newBalance });
      
      if (state.user) {
        const user = state.user;
        // Update DB
        supabase.from('tasks').update({ status, pending_coins: 0 }).eq('id', taskId).then();
        supabase.from('profiles').update({ coin_balance: newBalance }).eq('id', user.id).then();
        supabase.from('transactions').insert({
          user_id: user.id,
          amount: totalReward,
          type: 'reward',
          description: `Completed quest: ${task.title}`
        }).then();
        supabase.from('task_history').insert({
          user_id: user.id,
          title: task.title,
          item_type: 'task',
          coins_earned: totalReward,
        }).then();
      }

      // Check for pending challenges to complete transfers
      const { pendingTransfers } = get();
      const challengeTransfer = pendingTransfers.find(pt => pt.challenge_task_id === taskId && pt.status === 'Pending' && pt.receiver_id === user.id);
      
      if (challengeTransfer) {
        // Complete the transfer
        supabase.from('coin_transfers').update({ status: 'Completed' }).eq('id', challengeTransfer.id).then(() => {
          // Add funds to the receiver
          const finalBalance = newBalance + challengeTransfer.amount;
          set({ coinBalance: finalBalance });
          supabase.from('profiles').update({ coin_balance: finalBalance }).eq('id', user.id).then();
        });
      }

    } else if (state.user) {
      supabase.from('tasks').update({ status }).eq('id', taskId).then();
    }
  },

  deleteTask: async (taskId: string) => {
    set((state) => ({ tasks: state.tasks.filter(t => t.id !== taskId) }));
    if (get().user) {
      await supabase.from('tasks').delete().eq('id', taskId);
    }
  },

  editTask: async (taskId: string, updates: Partial<Task>) => {
    set((state) => ({
      tasks: state.tasks.map(t => t.id === taskId ? { ...t, ...updates } : t)
    }));
    if (get().user) {
      await supabase.from('tasks').update(updates).eq('id', taskId);
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

      const { data: habits } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (habits) {
        const now = new Date();
        const updatedHabits = [...habits];
        
        for (let i = 0; i < updatedHabits.length; i++) {
          const habit = updatedHabits[i];
          if (!habit.last_completed_at) continue;
          
          const lastDate = new Date(habit.last_completed_at);
          let shouldReset = false;
          
          if (habit.frequency === 'daily') {
            shouldReset = now.getDate() !== lastDate.getDate() || now.getMonth() !== lastDate.getMonth() || now.getFullYear() !== lastDate.getFullYear();
          } else if (habit.frequency === 'weekly') {
             const lastMonday = new Date(now);
             lastMonday.setDate(now.getDate() - (now.getDay() === 0 ? 6 : now.getDay() - 1));
             lastMonday.setHours(0,0,0,0);
             shouldReset = lastDate < lastMonday;
          } else if (habit.frequency === 'monthly') {
             shouldReset = now.getMonth() !== lastDate.getMonth() || now.getFullYear() !== lastDate.getFullYear();
          }
          
          if (shouldReset) {
            updatedHabits[i] = { ...habit, last_completed_at: undefined };
            supabase.from('habits').update({ last_completed_at: null }).eq('id', habit.id).then();
          }
        }
        set({ habits: updatedHabits });
      }
      
      const { data: taskHistory } = await supabase
        .from('task_history')
        .select('*')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false });
        
      if (taskHistory) set({ taskHistory });
    }
    set({ isAuthLoading: false });
  },

  createParty: async (name: string) => {
    const { user } = get();
    if (!user) return;
    
    if (!name || name.trim() === '') {
      alert("Please enter a party name first!");
      return;
    }
    
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const { data: party, error } = await supabase.from('parties').insert({
      name,
      created_by: user.id,
      invite_code: inviteCode
    }).select().single();
    
    if (error) {
      alert("Database error creating party: " + error.message);
      return;
    }
    
    if (party) {
      const { error: memberError } = await supabase.from('party_members').insert({
        party_id: party.id,
        user_id: user.id,
        role: 'Leader'
      });
      if (memberError) {
        alert("Database error joining party: " + memberError.message);
        return;
      }
      set({ activeParty: party });
      get().fetchPartyDetails();
    }
  },

  joinParty: async (inviteCode: string) => {
    const { user } = get();
    if (!user) return;
    
    if (!inviteCode || inviteCode.trim() === '') {
      alert("Please enter an invite code!");
      return;
    }
    
    const { data: party, error: findError } = await supabase.from('parties').select('*').eq('invite_code', inviteCode).single();
    
    if (findError || !party) {
      alert("Could not find a party with that invite code.");
      return;
    }
    
    if (party) {
      const { error: joinError } = await supabase.from('party_members').insert({
        party_id: party.id,
        user_id: user.id,
        role: 'Member'
      });
      if (joinError) {
        alert("Failed to join: " + joinError.message);
        return;
      }
      set({ activeParty: party });
      get().fetchPartyDetails();
    }
  },

  sendGift: async (receiverId: string, amount: number) => {
    const { user, coinBalance } = get();
    if (!user || coinBalance < amount) return;
    
    // Deduct locally
    set({ coinBalance: coinBalance - amount });
    
    // Process transfer
    await supabase.from('coin_transfers').insert({
      sender_id: user.id,
      receiver_id: receiverId,
      amount: amount,
      status: 'Completed'
    });
    
    // Note: A real app would use a DB function/RPC to ensure atomic balance transfers.
    // For now we assume the receiver's realtime sub picks it up or we increment it directly.
    const { data: receiverProfile } = await supabase.from('profiles').select('coin_balance').eq('id', receiverId).single();
    if (receiverProfile) {
      await supabase.from('profiles').update({ coin_balance: receiverProfile.coin_balance + amount }).eq('id', receiverId);
    }
    await supabase.from('profiles').update({ coin_balance: coinBalance - amount }).eq('id', user.id);
  },
  
  requestCoinsWithChallenge: async (receiverId: string, amount: number, taskId: string) => {
    const { user, coinBalance } = get();
    if (!user || coinBalance < amount) return;
    
    // Deduct sender balance immediately for escrow (optional, but good for logic)
    set({ coinBalance: coinBalance - amount });
    await supabase.from('profiles').update({ coin_balance: coinBalance - amount }).eq('id', user.id);
    
    await supabase.from('coin_transfers').insert({
      sender_id: user.id,
      receiver_id: receiverId,
      amount: amount,
      status: 'Pending',
      challenge_task_id: taskId
    });
  },

  fetchPartyDetails: async () => {
    const { user } = get();
    if (!user) return;

    // Find if user is in a party
    const { data: membership } = await supabase.from('party_members').select('party_id').eq('user_id', user.id).single();
    
    if (membership) {
      const { data: party } = await supabase.from('parties').select('*').eq('id', membership.party_id).single();
      if (party) set({ activeParty: party });
      
      const { data: members } = await supabase.from('party_members')
        .select(`*, profiles(username, coin_balance)`)
        .eq('party_id', membership.party_id);
      
      if (members) {
        set({ partyMembers: members as any });
      }
      
      const { data: transfers } = await supabase.from('coin_transfers')
        .select('*')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);
        
      if (transfers) {
        set({ pendingTransfers: transfers });
      }
      
      get().setupRealtime();
    }
  },

  setupRealtime: () => {
    // Only setup once
    const existingChannel = supabase.getChannels().find(c => c.topic === 'tavern_activity');
    if (existingChannel) return;

    supabase.channel('tavern_activity')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'coin_transfers' }, payload => {
        const transfer = payload.new as CoinTransfer;
        const msg = transfer.challenge_task_id 
          ? `A challenge of ${transfer.amount} Solar Gold was issued!`
          : `A gift of ${transfer.amount} Solar Gold was sent!`;
          
        set((state) => ({
          tavernActivities: [{
            id: Math.random().toString(),
            type: transfer.challenge_task_id ? 'challenge' : 'gift',
            message: msg,
            timestamp: new Date().toISOString()
          }, ...state.tavernActivities].slice(0, 10),
          pendingTransfers: [...state.pendingTransfers, transfer]
        }));
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'tasks' }, payload => {
        const task = payload.new as Task;
        if (task.status === 'completed') {
           set((state) => ({
             tavernActivities: [{
               id: Math.random().toString(),
               type: 'task',
               message: `Someone just completed: ${task.title}`,
               timestamp: new Date().toISOString()
             }, ...state.tavernActivities].slice(0, 10)
           }));
        }
      })
      .subscribe();
  },

  setupPresence: () => {
    const existingChannel = supabase.getChannels().find(c => c.topic === 'online_presence');
    if (existingChannel) return;

    const channel = supabase.channel('online_presence');
    const { user } = get();

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const onlineUsers = new Set<string>(
          Object.values(state)
            .flat()
            .map((p: any) => p.user_id)
            .filter(Boolean)
        );
        set({ onlineCount: onlineUsers.size });
      })
      .subscribe(async (status) => {
        if (status !== 'SUBSCRIBED') return;
        try {
          await channel.track({
            user_id: user?.id,
            username: user?.email?.split('@')[0] || 'guest',
            online_at: new Date().toISOString(),
          });
        } catch (e) {
          console.error('Presence track failed:', e);
        }
      });
  },

  teardownPresence: () => {
    const channel = supabase.getChannels().find(c => c.topic === 'online_presence');
    if (channel) {
      supabase.removeChannel(channel);
    }
    set({ onlineCount: 0 });
  },

  fetchPartyData: async () => {
    // For legacy support or global fallback
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
        soundscapes: state.soundscapes,
        isGuest: state.isGuest,
        ...(state.isGuest ? {
          coinBalance: state.coinBalance,
          tasks: state.tasks,
          rewards: state.rewards
        } : {})
      }),
    }
  )
);
