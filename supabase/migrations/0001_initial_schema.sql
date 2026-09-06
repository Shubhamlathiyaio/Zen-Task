-- 0001_initial_schema.sql
-- This script creates a fresh foundation for the Zen Task (Chronos) application.
-- Please run this directly in your Supabase SQL Editor.

-- WARNING: This will drop existing tables to give us a clean slate!
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS task_history CASCADE;
DROP TABLE IF EXISTS rewards CASCADE;
DROP TABLE IF EXISTS habits CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- 1. Profiles Table (extends auth.users with gamification data)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT,
  coin_balance INTEGER DEFAULT 0,
  xp INTEGER DEFAULT 0, -- New for next-level gamification
  level INTEGER DEFAULT 1, -- New for next-level gamification
  energy INTEGER DEFAULT 100, -- New for next-level gamification
  max_energy INTEGER DEFAULT 100, -- New for next-level gamification
  avatar_style TEXT DEFAULT 'adventurer',
  avatar_seed TEXT DEFAULT 'default',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tasks Table
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  quadrant TEXT DEFAULT 'q1_urgent_important', -- 'q1_urgent_important', etc.
  matrix_quadrant INTEGER DEFAULT 1, -- Fallback/Alternative representation
  tags TEXT[] DEFAULT '{}',
  reward_amount INTEGER DEFAULT 10,
  is_required BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  due_date TIMESTAMP WITH TIME ZONE,
  frequency TEXT DEFAULT 'none' CHECK (frequency IN ('none', 'daily', 'weekly', 'monthly')),
  pending_coins INTEGER DEFAULT 0,
  strike_count INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Habits Table
CREATE TABLE habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
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

-- 4. Task History Table
CREATE TABLE task_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id UUID, -- References the task or habit ID (optional for foreign key to allow deleted items to stay in history)
  title TEXT NOT NULL,
  item_type TEXT CHECK (item_type IN ('task', 'habit')),
  duration_logged_mins INTEGER DEFAULT 0,
  coins_earned INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Transactions Table (For rewards/purchases/gifts)
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL, -- positive for earn, negative for spend
  type TEXT NOT NULL, -- e.g., 'reward', 'purchase', 'penalty', 'transfer'
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Rewards Table (Store Items)
CREATE TABLE rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  cost INTEGER DEFAULT 0,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================

-- Enable RLS for all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read and update their own profile
CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Tasks: Users can CRUD their own tasks
CREATE POLICY "Users can manage their own tasks" ON tasks FOR ALL USING (auth.uid() = user_id);

-- Habits: Users can CRUD their own habits
CREATE POLICY "Users can manage their own habits" ON habits FOR ALL USING (auth.uid() = user_id);

-- Task History: Users can CRUD their own task history
CREATE POLICY "Users can manage their own history" ON task_history FOR ALL USING (auth.uid() = user_id);

-- Transactions: Users can view their own transactions
CREATE POLICY "Users can view their own transactions" ON transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own transactions" ON transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Rewards: Users can CRUD their own rewards
CREATE POLICY "Users can manage their own rewards" ON rewards FOR ALL USING (auth.uid() = user_id);

-- =========================================================================
-- TRIGGERS
-- =========================================================================
-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, coin_balance)
  VALUES (new.id, new.raw_user_meta_data->>'username', 0);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
