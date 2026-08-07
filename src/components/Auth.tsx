import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useStore } from '../store/useStore';
import { Eye, EyeOff } from 'lucide-react';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  
  const { user, fetchUserData } = useStore();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) fetchUserData();
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) fetchUserData();
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error, data } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        
        // Ensure profile exists for new users
        if (data.user) {
          await supabase.from('profiles').insert({
            id: data.user.id,
            username: username.trim() || email.split('@')[0],
            coin_balance: 100 // Starting bonus
          }).select().single();
        }
      }
    } catch (error: any) {
      alert(error.error_description || error.message);
    } finally {
      setLoading(false);
    }
  };

  if (user) return null;

  return (
    <div className="flex justify-center items-center h-screen w-full relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-(--color-primary)/20 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] -z-10 pointer-events-none"></div>

      <div className="bg-(--color-surface) p-8 rounded-2xl shadow-2xl max-w-md w-full border border-(--color-border) relative z-10">
        <div className="mb-8 text-center">
          <h1 className="text-4xl text-(--color-on-surface) mb-2 font-normal" style={{ fontFamily: 'var(--font-varela)' }}>Chronos</h1>
          <p className="text-(--color-muted-text)" style={{ fontFamily: 'var(--font-roboto)' }}>Welcome to the Dark Quest</p>
        </div>
        
        <form onSubmit={handleAuth} className="flex flex-col gap-5">
          {!isLogin && (
            <input
              type="text"
              placeholder="Choose a Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required={!isLogin}
              className="bg-(--color-neutral) text-(--color-on-surface) h-12 px-4 rounded-md border border-(--color-border) focus:outline-none focus:border-(--color-primary-60) transition-colors"
            />
          )}

          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-(--color-neutral) text-(--color-on-surface) h-12 px-4 rounded-md border border-(--color-border) focus:outline-none focus:border-(--color-primary-60) transition-colors"
          />
          
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-(--color-neutral) text-(--color-on-surface) h-12 px-4 rounded-md border border-(--color-border) focus:outline-none focus:border-(--color-primary-60) transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-(--color-muted-text) hover:text-(--color-on-surface) bg-transparent border-none cursor-pointer p-1"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="mt-2 bg-(--color-primary) text-(--color-on-surface) hover:bg-(--color-primary-80) transition-all active:scale-[0.98] rounded-md h-12 flex items-center justify-center font-bold disabled:opacity-50 border-none cursor-pointer shadow-lg shadow-(--color-primary)/20"
          >
            {loading ? 'Processing...' : isLogin ? 'Enter Realm' : 'Forge Account'}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-(--color-primary-60) bg-transparent border-none hover:text-(--color-on-surface) cursor-pointer text-sm transition-colors"
          >
            {isLogin ? "Need an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}
