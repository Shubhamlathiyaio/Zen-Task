import React, { useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Users, Coins, Trophy } from 'lucide-react';

export default function PartyView() {
  const { profiles, fetchPartyData, user } = useStore();

  useEffect(() => {
    fetchPartyData();
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-8">
      
      <div className="bg-(--color-surface) rounded-2xl p-6 md:p-8 border border-(--color-border) shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-(--color-primary)/20 rounded-full blur-[100px] -z-10"></div>
        
        <h2 className="text-3xl font-normal mb-2 text-(--color-on-surface) flex items-center gap-3" style={{ fontFamily: 'var(--font-varela)' }}>
          <Users className="text-(--color-primary-60) w-8 h-8" /> 
          The Global Tavern
        </h2>
        <p className="text-(--color-muted-text) mb-8">See how your fellow adventurers are doing.</p>
        
        <div className="bg-(--color-neutral) rounded-xl overflow-hidden border border-(--color-border)">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-(--color-surface-2) border-b border-(--color-border)">
                <th className="p-4 text-(--color-muted-text) font-bold uppercase text-xs tracking-wider">Rank</th>
                <th className="p-4 text-(--color-muted-text) font-bold uppercase text-xs tracking-wider">Adventurer</th>
                <th className="p-4 text-(--color-muted-text) font-bold uppercase text-xs tracking-wider text-right">Wealth</th>
              </tr>
            </thead>
            <tbody>
              {profiles.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-(--color-muted-text) italic">
                    The tavern is empty...
                  </td>
                </tr>
              ) : (
                profiles.map((profile, index) => (
                  <tr 
                    key={profile.id} 
                    className={`border-b border-(--color-border) hover:bg-white/5 transition-colors ${profile.id === user?.id ? 'bg-(--color-primary)/10' : ''}`}
                  >
                    <td className="p-4 w-16">
                      {index === 0 ? <Trophy className="text-yellow-400 w-5 h-5" /> : 
                       index === 1 ? <Trophy className="text-gray-400 w-5 h-5" /> : 
                       index === 2 ? <Trophy className="text-amber-600 w-5 h-5" /> : 
                       <span className="text-(--color-muted-text) font-mono pl-1">{index + 1}</span>}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-(--color-surface-2) flex items-center justify-center text-sm font-bold text-(--color-primary-60) border border-(--color-border)">
                          {profile.username.charAt(0).toUpperCase()}
                        </div>
                        <span className={`font-medium ${profile.id === user?.id ? 'text-(--color-primary-60) font-bold' : 'text-(--color-on-surface)'}`}>
                          {profile.username} {profile.id === user?.id && '(You)'}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className="font-bold font-mono text-yellow-400">{profile.coin_balance}</span>
                        <Coins className="text-yellow-400 w-4 h-4" />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
