import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Settings, LogOut, User, Moon, Sun, Palette, Timer, Brain, Coffee, Tag, Plus, Trash2, LayoutGrid, List } from 'lucide-react';

export default function SettingsView({ onLogout }: { onLogout: () => void }) {
  const { user, theme, setTheme, timerSettings, setTimerSettings, timerIsRunning, customTags, setCustomTagColor, deleteCustomTag, taskViewMode, setTaskViewMode, avatarStyle, avatarSeed, quadrantRules, setQuadrantRule, strikeSettings, setStrikeSettings } = useStore();
  
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#FACC15');

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
                <div className="w-16 h-16 rounded-full bg-(--color-surface-2) flex items-center justify-center border-2 border-(--color-primary-60) overflow-hidden shrink-0">
                  <img src={`https://api.dicebear.com/7.x/${avatarStyle}/svg?seed=${avatarSeed || user?.id || 'default'}`} alt="Avatar" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="font-bold text-(--color-on-surface)">{user?.email}</p>
                  <p className="text-xs text-(--color-muted-text)">Adventurer ID: {user?.id.substring(0, 8)}...</p>
                </div>
              </div>
            </div>
          </section>

          {/* Tags Section */}
          <section>
            <h3 className="text-sm font-bold text-(--color-muted-text) uppercase tracking-wider mb-4 border-b border-(--color-border) pb-2 flex items-center gap-2">
              <Tag className="w-4 h-4" /> Tags
            </h3>
            <div className="bg-(--color-neutral) rounded-xl p-4 border border-(--color-border) flex flex-col gap-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="New tag name"
                  value={newTagName}
                  onChange={e => setNewTagName(e.target.value)}
                  className="flex-1 bg-(--color-surface) text-(--color-on-surface) h-10 px-3 rounded-lg border border-(--color-border) focus:outline-none focus:border-(--color-primary-60) text-sm"
                />
                <button
                  onClick={() => {
                    if (newTagName.trim()) {
                      setCustomTagColor(newTagName.trim(), newTagColor);
                      setNewTagName('');
                    }
                  }}
                  disabled={!newTagName.trim()}
                  className="bg-(--color-primary) text-white h-10 px-4 rounded-lg font-bold flex items-center justify-center disabled:opacity-50 border-none cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="flex gap-2 mb-2 flex-wrap">
                {['#EF4444', '#F97316', '#EAB308', '#22C55E', '#3B82F6', '#A855F7', '#EC4899', '#64748B'].map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNewTagColor(color)}
                    className={`w-6 h-6 rounded-full cursor-pointer transition-transform border-none ${newTagColor === color ? 'scale-125 ring-2 ring-offset-2 ring-(--color-primary-60)' : 'hover:scale-110'}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              {Object.keys(customTags).length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {Object.entries(customTags).map(([tag, color]) => (
                    <div key={tag} className="flex items-center gap-1 bg-(--color-surface) border border-(--color-border) pr-1 pl-3 py-1 rounded-full">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
                      <span className="text-xs font-bold text-(--color-on-surface)">{tag}</span>
                      <button 
                        onClick={() => deleteCustomTag(tag)}
                        className="w-6 h-6 rounded-full flex items-center justify-center text-(--color-muted-text) hover:text-red-500 hover:bg-red-500/10 cursor-pointer border-none transition-colors ml-1"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>



          {/* Rules Section */}
          <section>
            <h3 className="text-sm font-bold text-(--color-muted-text) uppercase tracking-wider mb-4 border-b border-(--color-border) pb-2 flex items-center gap-2">
              <Timer className="w-4 h-4" /> Deadlines & Penalties
            </h3>
            <div className="bg-(--color-neutral) rounded-xl p-4 border border-(--color-border) flex flex-col gap-4">
              <p className="text-sm text-(--color-muted-text) mb-2">Set automatic deadlines and missed task penalties for each quadrant.</p>
              
              {[
                { id: 'q1_urgent_important', name: 'Urgent & Important (Q1)' },
                { id: 'q2_not_urgent_important', name: 'Not Urgent & Important (Q2)' },
                { id: 'q3_urgent_not_important', name: 'Urgent & Not Important (Q3)' },
                { id: 'q4_not_urgent_not_important', name: 'Neither (Q4)' }
              ].map(q => {
                const rule = quadrantRules?.[q.id] || { deadline: 'none', penalty: 0 };
                
                return (
                  <div key={q.id} className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 bg-(--color-surface) rounded-lg border border-(--color-border)">
                    <span className="font-bold text-sm text-(--color-on-surface) flex-1">{q.name}</span>
                    <div className="flex items-center gap-3 shrink-0">
                      <select 
                        value={rule.deadline}
                        onChange={(e) => setQuadrantRule(q.id, { deadline: e.target.value as any })}
                        className="bg-(--color-surface-2) text-(--color-on-surface) border border-(--color-border) rounded-md px-2 py-1.5 text-sm outline-none"
                      >
                        <option value="none">No Deadline</option>
                        <option value="today">Today</option>
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                        <option disabled>──────</option>
                        <option value="10s">10 Seconds (Test)</option>
                        <option value="20s">20 Seconds (Test)</option>
                        <option value="30s">30 Seconds (Test)</option>
                        <option value="40s">40 Seconds (Test)</option>
                      </select>
                      <div className="flex items-center gap-1 bg-(--color-surface-2) border border-(--color-border) rounded-md px-2 py-1.5">
                        <span className="text-xs text-amber-500 font-bold">🪙</span>
                        <input 
                          type="number" 
                          min="0"
                          value={rule.penalty}
                          onChange={(e) => setQuadrantRule(q.id, { penalty: parseInt(e.target.value) || 0 })}
                          className="w-12 bg-transparent text-(--color-on-surface) text-sm outline-none border-none text-right font-mono"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Strike Settings */}
          <section>
            <h3 className="text-sm font-bold text-(--color-muted-text) uppercase tracking-wider mb-4 border-b border-(--color-border) pb-2 flex items-center gap-2 text-red-500">
              <span className="text-lg">🗑️</span> Strike System (Auto-Delete)
            </h3>
            
            <p className="text-xs text-(--color-muted-text) mb-4">
              If a quest or habit is missed consecutively, it will be automatically deleted when it reaches the strike limit.
            </p>
            
            <div className="flex flex-col gap-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-3 bg-(--color-surface-2) rounded-lg border border-(--color-border)">
                <div>
                  <h4 className="font-bold text-sm text-(--color-on-surface)">Quests Strike Limit</h4>
                  <p className="text-[10px] text-(--color-muted-text)">Missed deadlines before deletion.</p>
                </div>
                <select
                  value={strikeSettings?.taskLimit || 3}
                  onChange={(e) => setStrikeSettings({ taskLimit: Number(e.target.value) })}
                  className="bg-(--color-surface) text-(--color-on-surface) border border-(--color-border) rounded-md px-2 py-1.5 text-sm font-bold outline-none"
                >
                  <option value={0}>Disabled</option>
                  <option value={1}>1 Miss = Delete</option>
                  <option value={2}>2 Misses = Delete</option>
                  <option value={3}>3 Misses = Delete</option>
                  <option value={5}>5 Misses = Delete</option>
                </select>
              </div>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-3 bg-(--color-surface-2) rounded-lg border border-(--color-border)">
                <div>
                  <h4 className="font-bold text-sm text-(--color-on-surface)">Habits Strike Limit</h4>
                  <p className="text-[10px] text-(--color-muted-text)">Consecutive missed cycles before deletion.</p>
                </div>
                <select
                  value={strikeSettings?.habitLimit || 3}
                  onChange={(e) => setStrikeSettings({ habitLimit: Number(e.target.value) })}
                  className="bg-(--color-surface) text-(--color-on-surface) border border-(--color-border) rounded-md px-2 py-1.5 text-sm font-bold outline-none"
                >
                  <option value={0}>Disabled</option>
                  <option value={1}>1 Miss = Delete</option>
                  <option value={2}>2 Misses = Delete</option>
                  <option value={3}>3 Misses = Delete</option>
                  <option value={5}>5 Misses = Delete</option>
                </select>
              </div>
            </div>
          </section>

          {/* Theme Section */}
          <section>
            <h3 className="text-sm font-bold text-(--color-muted-text) uppercase tracking-wider mb-4 border-b border-(--color-border) pb-2 flex items-center gap-2">
              <Palette className="w-4 h-4" /> Appearance
            </h3>
            
            <div className="mb-6 flex flex-col gap-4">
              <div className="font-bold text-(--color-on-surface) mb-2">Default Task View</div>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setTaskViewMode('matrix')}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                    taskViewMode === 'matrix' 
                      ? 'bg-(--color-primary)/20 border-(--color-primary-60) text-(--color-on-surface)' 
                      : 'bg-(--color-neutral) border-(--color-border) text-(--color-muted-text) hover:border-(--color-primary-60)/50'
                  }`}
                >
                  <LayoutGrid className="w-5 h-5" />
                  <span className="font-bold">Matrix (2x2)</span>
                </button>
                <button 
                  onClick={() => setTaskViewMode('list')}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                    taskViewMode === 'list' 
                      ? 'bg-(--color-primary)/20 border-(--color-primary-60) text-(--color-on-surface)' 
                      : 'bg-(--color-neutral) border-(--color-border) text-(--color-muted-text) hover:border-(--color-primary-60)/50'
                  }`}
                >
                  <List className="w-5 h-5" />
                  <span className="font-bold">Combined List</span>
                </button>
              </div>
            </div>

            <div className="font-bold text-(--color-on-surface) mb-2 mt-4">Theme</div>
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
