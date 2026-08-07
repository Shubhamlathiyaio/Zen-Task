import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Settings, LogOut, User, Moon, Sun, Palette } from 'lucide-react';

export default function SettingsView({ onLogout }: { onLogout: () => void }) {
  const { user, theme, setTheme } = useStore();

  const handleThemeChange = (newTheme: 'habitica-dark' | 'classic-light') => {
    setTheme(newTheme);
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-6">
      <div className="bg-(--color-surface) rounded-2xl p-6 md:p-8 border border-(--color-border) shadow-xl">
        <h2 className="text-3xl font-normal mb-8 text-(--color-on-surface) flex items-center gap-3" style={{ fontFamily: 'var(--font-varela)' }}>
          <Settings className="text-(--color-primary-60) w-8 h-8" /> 
          Preferences
        </h2>
        
        <div className="flex flex-col gap-8">
          {/* Profile Section */}
          <section>
            <h3 className="text-sm font-bold text-(--color-muted-text) uppercase tracking-wider mb-4 border-b border-(--color-border) pb-2 flex items-center gap-2">
              <User className="w-4 h-4" /> Profile
            </h3>
            <div className="flex items-center justify-between p-4 bg-(--color-neutral) rounded-xl border border-(--color-border)">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-(--color-surface-2) flex items-center justify-center text-xl font-bold text-(--color-primary-60) border border-(--color-border)">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-(--color-on-surface)">{user?.email}</p>
                  <p className="text-xs text-(--color-muted-text)">Adventurer ID: {user?.id.substring(0, 8)}...</p>
                </div>
              </div>
            </div>
          </section>

          {/* Theme Section */}
          <section>
            <h3 className="text-sm font-bold text-(--color-muted-text) uppercase tracking-wider mb-4 border-b border-(--color-border) pb-2 flex items-center gap-2">
              <Palette className="w-4 h-4" /> Appearance
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <button 
                onClick={() => handleThemeChange('habitica-dark')}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer ${
                  theme === 'habitica-dark' 
                    ? 'bg-(--color-primary)/20 border-(--color-primary-60) text-(--color-on-surface)' 
                    : 'bg-(--color-neutral) border-(--color-border) text-(--color-muted-text) hover:border-(--color-primary-60)/50'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-[#121212] flex items-center justify-center text-[#925CF3] border border-(--color-border)">
                  <Moon className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="font-bold">Habitica Dark</p>
                  <p className="text-xs opacity-70">Deep purple & moody</p>
                </div>
              </button>

              <button 
                onClick={() => handleThemeChange('classic-light')}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer ${
                  theme === 'classic-light' 
                    ? 'bg-(--color-primary)/20 border-(--color-primary-60) text-(--color-on-surface)' 
                    : 'bg-(--color-neutral) border-(--color-border) text-(--color-muted-text) hover:border-(--color-primary-60)/50'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-amber-500 border border-(--color-border)">
                  <Sun className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="font-bold">Classic Light</p>
                  <p className="text-xs opacity-70">Bright & airy (Preview)</p>
                </div>
              </button>

            </div>
          </section>

          {/* Danger Zone */}
          <section className="mt-8">
            <button 
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 transition-colors rounded-xl h-14 font-bold cursor-pointer shadow-sm active:scale-95"
            >
              <LogOut className="w-5 h-5" />
              Sign Out of Realm
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
