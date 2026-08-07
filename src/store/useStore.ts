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
  coinBalance: number;
  tasks: Task[];
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
  
  setIsGuest: (isGuest: boolean) => void;
  setUser: (user: any) => void;
  setCoinBalance: (balance: number) => void;
  setTasks: (tasks: Task[]) => void;
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
  setEditingTask: (task: Task | null) => void;
  
  addTask: (task: Task) => void;
  addReward: (reward: Reward) => void;
  deleteReward: (rewardId: string) => Promise<void>;
  updateTaskStatus: (taskId: string, status: 'completed' | 'failed') => void;
  deleteTask: (taskId: string) => void;
  editTask: (taskId: string, updates: Partial<Task>) => void;
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
      isGuest: false,
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
      activeParty: null,
      partyMembers: [],
      tavernActivities: [],
      pendingTransfers: [],
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
  
  setTheme: (theme) => {
    set({ theme });
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
    }
  },
  
  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
  addReward: (reward) => set((state) => ({ rewards: [...state.rewards, reward] })),
  deleteReward: async (rewardId: string) => {
    set((state) => ({ rewards: state.rewards.filter(r => r.id !== rewardId) }));
    if (get().user) {
      await supabase.from('rewards').delete().eq('id', rewardId);
    }
  },
  
  updateTaskStatus: async (taskId, status) => {
    const { tasks, user, coinBalance } = get();
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    // Optimistic update
    set((state) => ({
      tasks: state.tasks.map(t => t.id === taskId ? { ...t, status } : t)
    }));

    if (status === 'completed') {
      const newBalance = coinBalance + task.reward_amount;
      set({ coinBalance: newBalance });
      
      if (user) {
        // Update DB
        supabase.from('tasks').update({ status }).eq('id', taskId).then();
        supabase.from('profiles').update({ coin_balance: newBalance }).eq('id', user.id).then();
        supabase.from('transactions').insert({
          user_id: user.id,
          amount: task.reward_amount,
          type: 'reward',
          description: `Completed quest: ${task.title}`
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

    } else if (user) {
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
    }
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
