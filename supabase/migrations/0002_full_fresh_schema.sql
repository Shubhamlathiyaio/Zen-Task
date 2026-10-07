-- 0002_full_fresh_schema.sql
-- This script properly drops ALL existing tables (including the party system) 
-- and recreates a unified, perfect schema for Chronos Focus.

-- 1. DROP ALL EXISTING TABLES (The CASCADE ensures dependencies don't block this)
DROP TABLE IF EXISTS coin_transfers CASCADE;
DROP TABLE IF EXISTS party_members CASCADE;
DROP TABLE IF EXISTS parties CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS task_history CASCADE;
DROP TABLE IF EXISTS rewards CASCADE;
DROP TABLE IF EXISTS habits CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- 2. CREATE TABLES

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  coin_balance INTEGER NOT NULL DEFAULT 100,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  energy INTEGER DEFAULT 100,
  max_energy INTEGER DEFAULT 100,
  avatar_style TEXT DEFAULT 'adventurer',
  avatar_seed TEXT DEFAULT 'default',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE public.parties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  invite_code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE public.party_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  party_id UUID NOT NULL REFERENCES public.parties(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'Member' CHECK (role IN ('Leader', 'Member')),
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  quadrant TEXT NOT NULL DEFAULT 'q1_urgent_important' CHECK (quadrant IN ('q1_urgent_important', 'q2_not_urgent_important', 'q3_urgent_not_important', 'q4_not_urgent_not_important')),
  matrix_quadrant INTEGER DEFAULT 1,
  reward_amount INTEGER NOT NULL DEFAULT 10,
  is_required BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  due_date TIMESTAMP WITH TIME ZONE,
  frequency TEXT DEFAULT 'none',
  pending_coins INTEGER DEFAULT 0,
  strike_count INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE public.habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  habit_type TEXT DEFAULT 'flexible' CHECK (habit_type IN ('flexible', 'timed')),
  frequency TEXT DEFAULT 'daily' CHECK (frequency IN ('daily', 'weekly', 'monthly')),
  reward_amount INTEGER DEFAULT 10,
  is_required BOOLEAN DEFAULT true,
  target_duration_mins INTEGER DEFAULT 0,
  pending_coins INTEGER DEFAULT 0,
  streak_count INTEGER DEFAULT 0,
  strike_count INTEGER DEFAULT 0,
  last_completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.task_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  item_id UUID, 
  title TEXT NOT NULL,
  item_type TEXT CHECK (item_type IN ('task', 'habit')),
  duration_logged_mins INTEGER DEFAULT 0,
  coins_earned INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE public.rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  cost INTEGER NOT NULL,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE public.coin_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL CHECK (amount > 0),
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Completed', 'Rejected', 'Cancelled')),
  challenge_task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 3. ENABLE ROW LEVEL SECURITY
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.party_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coin_transfers ENABLE ROW LEVEL SECURITY;

-- 4. CREATE RLS POLICIES (Using auth.uid() which maps to profiles.id)
CREATE POLICY "Users can manage their own profile" ON public.profiles FOR ALL USING (auth.uid() = id);

-- Tasks & Habits
CREATE POLICY "Users can manage their own tasks" ON public.tasks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own habits" ON public.habits FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own history" ON public.task_history FOR ALL USING (auth.uid() = user_id);

-- Gamification / Store
CREATE POLICY "Users can manage their own transactions" ON public.transactions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own rewards" ON public.rewards FOR ALL USING (auth.uid() = user_id);

-- Party System (Users can see parties they belong to, etc.)
CREATE POLICY "Users can view parties they are in" ON public.parties FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.party_members WHERE party_members.party_id = id AND party_members.user_id = auth.uid())
);
CREATE POLICY "Users can create parties" ON public.parties FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can manage members of their party" ON public.party_members FOR ALL USING (
  auth.uid() = user_id OR 
  EXISTS (SELECT 1 FROM public.parties WHERE parties.id = party_id AND parties.created_by = auth.uid())
);

-- Transfers
CREATE POLICY "Users can view their transfers" ON public.coin_transfers FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Users can create transfers" ON public.coin_transfers FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Users can update transfers they receive" ON public.coin_transfers FOR UPDATE USING (auth.uid() = receiver_id);

-- 5. TRIGGERS
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, coin_balance)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'username', 'Adventurer'), 100);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
