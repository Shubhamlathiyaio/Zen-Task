import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import Auth from './Auth';
import ActionHub from './ActionHub';
import EisenhowerMatrix from './EisenhowerMatrix';
import TaskList from './TaskList';
import FocusTimer from './FocusTimer';
import StoreView from './StoreView';
import PartyView from './PartyView';
import SettingsView from './SettingsView';
import ProfileView from './ProfileView';
import ActivityTiles from './ActivityTiles';
import { Coins, LogOut, LayoutDashboard, Timer, ShoppingBag, Users, Settings, User, Moon, Sun } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

export default function Dashboard() {
  const { user, coinBalance, currentView, setCurrentView, taskViewMode, setTaskViewMode, theme, setTheme, timerIsRunning, decrementTimer, avatarStyle, avatarSeed } = useStore();
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]); // Also updating this to react to theme changes

  useEffect(() => {
    if (timerIsRunning) {
      timerRef.current = setInterval(() => {
        decrementTimer();
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerIsRunning, decrementTimer]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    useStore.setState({ user: null });
  };

  if (!user) {
    return <Auth />;
  }

  const NavItem = ({ view, icon: Icon, label }: { view: any, icon: any, label: string }) => (
    <button
      onClick={() => setCurrentView(view)}
      className={`flex flex-col md:flex-row items-center gap-1 md:gap-3 p-2 md:px-4 md:py-3 w-full rounded-xl transition-all border-none cursor-pointer ${
        currentView === view 
          ? 'bg-(--color-primary) text-white shadow-md shadow-(--color-primary)/20' 
          : 'bg-transparent text-(--color-muted-text) hover:bg-(--color-surface-2) hover:text-(--color-on-surface)'
      }`}
    >
      <Icon className="w-6 h-6 md:w-5 md:h-5" />
      <span className="text-xs md:text-base font-medium hidden md:block" style={{ fontFamily: 'var(--font-roboto)' }}>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-(--color-neutral) text-(--color-on-surface) relative">
      
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col fixed inset-y-0 left-0 bg-(--color-surface) border-r border-(--color-border) z-20 shadow-2xl">
        <div className="p-6 border-b border-(--color-border)">
          <h1 className="text-3xl text-(--color-primary) font-normal tracking-wide" style={{ fontFamily: 'var(--font-varela)' }}>Chronos</h1>
        </div>
        
        <nav className="flex-1 p-4 flex flex-col gap-2">
          <NavItem view="tasks" icon={LayoutDashboard} label="Quests" />
          <NavItem view="timer" icon={Timer} label="Focus Timer" />
          <NavItem view="store" icon={ShoppingBag} label="Rewards Store" />
          <NavItem view="party" icon={Users} label="Party" />
        </nav>
        
        <div className="p-4 border-t border-(--color-border)">
          <NavItem view="settings" icon={Settings} label="Settings" />
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 flex flex-col min-h-screen pb-32 md:pb-24 relative">
        
        {/* Top Header */}
        <header className="sticky top-0 z-10 bg-(--color-neutral)/80 backdrop-blur-md p-4 md:px-8 border-b border-(--color-border) flex justify-between items-center">
          <h2 className="text-xl md:text-2xl font-normal capitalize text-(--color-on-surface)" style={{ fontFamily: 'var(--font-varela)' }}>
            {currentView === 'tasks' ? 'Quests Dashboard' : currentView}
          </h2>
          
          <div className="flex items-center gap-3 md:gap-4">
            <button
              onClick={() => {
                const newTheme = theme === 'habitica-dark' ? 'classic-light' : 'habitica-dark';
                setTheme(newTheme);
                document.documentElement.setAttribute('data-theme', newTheme);
              }}
              className="w-10 h-10 rounded-full bg-(--color-surface-2) border border-(--color-border) flex items-center justify-center text-(--color-muted-text) hover:text-(--color-on-surface) hover:border-(--color-primary-60) transition-all cursor-pointer"
            >
              {theme === 'habitica-dark' ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-purple-500" />}
            </button>
            <div className="flex items-center gap-2 md:gap-4 bg-(--color-surface-2) py-2 px-3 md:px-4 rounded-xl border border-(--color-border)">
              <Coins className="text-(--color-reward) w-5 h-5" />
              <span className="font-bold text-(--color-reward) text-lg font-mono">{coinBalance}</span>
            </div>
            
            <button 
              onClick={() => setCurrentView('profile')}
              className="w-10 h-10 rounded-full bg-(--color-surface) border-2 border-(--color-primary-60) flex items-center justify-center text-(--color-muted-text) hover:border-white transition-all cursor-pointer overflow-hidden shrink-0"
            >
              <img src={`https://api.dicebear.com/7.x/${avatarStyle}/svg?seed=${avatarSeed || user?.id || 'default'}`} alt="Avatar" className="w-full h-full object-cover" />
            </button>
          </div>
        </header>

        {/* Content Wrapper */}
        <div className="p-4 md:p-8 flex-1 w-full max-w-6xl mx-auto overflow-x-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="w-full h-full"
            >
              {currentView === 'tasks' && (
                <div className="flex flex-col gap-8">
                  <div className="flex justify-between items-center">
                    <ActivityTiles />
                  </div>
                  <div className="flex justify-end mb-4">
                    <div className="bg-(--color-surface) p-1 rounded-lg flex border border-(--color-border)">
                      <button 
                        onClick={() => setTaskViewMode('matrix')}
                        className={`px-4 py-2 rounded-md text-sm font-bold border-none cursor-pointer transition-colors ${taskViewMode === 'matrix' ? 'bg-(--color-primary) text-white' : 'bg-transparent text-(--color-muted-text) hover:text-white'}`}
                      >
                        Matrix
                      </button>
                      <button 
                        onClick={() => setTaskViewMode('list')}
                        className={`px-4 py-2 rounded-md text-sm font-bold border-none cursor-pointer transition-colors ${taskViewMode === 'list' ? 'bg-(--color-primary) text-white' : 'bg-transparent text-(--color-muted-text) hover:text-white'}`}
                      >
                        List
                      </button>
                    </div>
                  </div>
                  {taskViewMode === 'matrix' ? <EisenhowerMatrix /> : <TaskList />}
                </div>
              )}
              
              {currentView === 'timer' && <FocusTimer />}
              {currentView === 'store' && <StoreView />}
              {currentView === 'party' && <PartyView />}
              {currentView === 'profile' && <ProfileView />}
              {currentView === 'settings' && <SettingsView onLogout={handleLogout} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Mobile Bottom Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-(--color-surface) border-t border-(--color-border) z-20 flex justify-around p-2 pb-safe">
        <NavItem view="tasks" icon={LayoutDashboard} label="Quests" />
        <NavItem view="timer" icon={Timer} label="Focus" />
        <NavItem view="store" icon={ShoppingBag} label="Store" />
        <NavItem view="party" icon={Users} label="Party" />
        <NavItem view="settings" icon={Settings} label="Settings" />
      </div>

      <ActionHub />
    </div>
  );
}
