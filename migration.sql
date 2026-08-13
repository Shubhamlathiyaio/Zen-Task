-- Non-destructive additive updates
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS pending_coins INTEGER DEFAULT 0;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS matrix_quadrant INTEGER DEFAULT 1;

ALTER TABLE habits ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE habits ADD COLUMN IF NOT EXISTS reward_amount INTEGER DEFAULT 10;
ALTER TABLE habits ADD COLUMN IF NOT EXISTS is_required BOOLEAN DEFAULT true;

CREATE TABLE IF NOT EXISTS habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  habit_type TEXT CHECK (habit_type IN ('flexible', 'timed')),
  frequency TEXT CHECK (frequency IN ('daily', 'weekly', 'monthly')),
  tags TEXT[] DEFAULT '{}',
  reward_amount INTEGER DEFAULT 10,
  is_required BOOLEAN DEFAULT true,
  target_duration_mins INTEGER DEFAULT 0,
  pending_coins INTEGER DEFAULT 0,
  streak_count INTEGER DEFAULT 0,
  last_completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS task_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  item_type TEXT CHECK (item_type IN ('task', 'habit')),
  duration_logged_mins INTEGER DEFAULT 0,
  coins_earned INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own habits" ON habits;
CREATE POLICY "Users can manage their own habits" ON habits FOR ALL USING (auth.uid() = user_id);

ALTER TABLE task_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own task history" ON task_history;
CREATE POLICY "Users can manage their own task history" ON task_history FOR ALL USING (auth.uid() = user_id);

