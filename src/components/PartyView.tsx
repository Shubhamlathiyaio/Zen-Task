import React, { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { Users, Coins, Search, Gift, Zap, Shield } from 'lucide-react';

export default function PartyView() {
  const { activeParty, partyMembers, fetchPartyDetails, user, isGuest, avatarStyle, avatarSeed, createParty, joinParty, sendGift, requestCoinsWithChallenge, tasks } = useStore();
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [partyNameInput, setPartyNameInput] = useState('');
  
  useEffect(() => {
    fetchPartyDetails();
  }, []);

  if (isGuest) {
    return (
      <div className="w-full h-full max-w-4xl mx-auto flex flex-col gap-6 items-center justify-center text-center pb-12">
        <div className="w-24 h-24 bg-(--color-surface) rounded-full flex items-center justify-center mb-4">
          <Shield className="w-12 h-12 text-(--color-primary-60)" />
        </div>
        <h2 className="text-3xl font-normal text-(--color-on-surface)" style={{ fontFamily: 'var(--font-varela)' }}>Join a Party</h2>
        <p className="text-(--color-muted-text) max-w-md">Adventuring alone is dangerous, but you need a full account to join a party. Sign up to share quests, send motivation gifts, and challenge your friends.</p>
        <button 
          onClick={() => useStore.setState({ user: null, isGuest: false })}
          className="bg-(--color-primary) text-white font-bold py-3 px-8 rounded-xl cursor-pointer mt-4"
        >
          Create Account
        </button>
      </div>
    );
  }

  if (!activeParty) {
    return (
      <div className="w-full h-full max-w-4xl mx-auto flex flex-col gap-6 items-center justify-center text-center pb-12">
        <div className="w-24 h-24 bg-(--color-surface) rounded-full flex items-center justify-center mb-4">
          <Shield className="w-12 h-12 text-(--color-primary)" />
        </div>
        <h2 className="text-3xl font-normal text-(--color-on-surface)" style={{ fontFamily: 'var(--font-varela)' }}>Join a Party</h2>
        <p className="text-(--color-muted-text) max-w-md">Adventuring alone is dangerous. Join a party to share quests, send motivation gifts, and challenge your friends.</p>
        
        <div className="w-full max-w-md bg-(--color-surface) p-6 rounded-2xl border border-(--color-border) flex flex-col gap-4">
          <input 
            type="text" 
            placeholder="Enter Invite Code" 
            value={inviteCodeInput}
            onChange={e => setInviteCodeInput(e.target.value)}
            className="w-full bg-(--color-neutral) border border-(--color-border) p-3 rounded-xl text-(--color-on-surface)"
          />
          <button onClick={() => joinParty(inviteCodeInput)} className="w-full bg-(--color-primary) text-white font-bold py-3 rounded-xl cursor-pointer">Join Party</button>
        </div>
        
        <div className="text-(--color-muted-text)">- OR -</div>
        
        <div className="w-full max-w-md bg-(--color-surface) p-6 rounded-2xl border border-(--color-border) flex flex-col gap-4">
          <input 
            type="text" 
            placeholder="Party Name" 
            value={partyNameInput}
            onChange={e => setPartyNameInput(e.target.value)}
            className="w-full bg-(--color-neutral) border border-(--color-border) p-3 rounded-xl text-(--color-on-surface)"
          />
          <button onClick={() => createParty(partyNameInput)} className="w-full bg-transparent border border-(--color-primary) text-(--color-primary-60) font-bold py-3 rounded-xl cursor-pointer">Create New Party</button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-8">
      
      <div className="bg-(--color-surface) rounded-2xl p-6 md:p-8 border border-(--color-border) shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-(--color-primary)/20 rounded-full blur-[100px] -z-10"></div>
        
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-normal mb-2 text-(--color-on-surface) flex items-center gap-3" style={{ fontFamily: 'var(--font-varela)' }}>
              <Users className="text-(--color-primary-60) w-8 h-8" /> 
              {activeParty.name}
            </h2>
            <p className="text-(--color-muted-text)">Invite Code: <span className="font-mono text-white bg-black/30 px-2 py-1 rounded">{activeParty.invite_code}</span></p>
          </div>
        </div>
        
        <div className="bg-(--color-neutral) rounded-xl overflow-x-auto border border-(--color-border)">
          <table className="w-full min-w-[420px] text-left border-collapse">
            <thead>
              <tr className="bg-(--color-surface-2) border-b border-(--color-border)">
                <th className="p-2.5 sm:p-4 text-(--color-muted-text) font-bold uppercase text-xs tracking-wider">Adventurer</th>
                <th className="p-2.5 sm:p-4 text-(--color-muted-text) font-bold uppercase text-xs tracking-wider text-right">Wealth</th>
                <th className="p-2.5 sm:p-4 text-(--color-muted-text) font-bold uppercase text-xs tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {partyMembers.map((member) => (
                  <tr 
                    key={member.id} 
                    className={`border-b border-(--color-border) hover:bg-white/5 transition-colors ${member.user_id === user?.id ? 'bg-(--color-primary)/10' : ''}`}
                  >
                    <td className="p-2.5 sm:p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-(--color-surface-2) flex items-center justify-center text-sm font-bold border border-(--color-border) overflow-hidden shrink-0">
                          <img src={`https://api.dicebear.com/7.x/${member.user_id === user?.id ? avatarStyle : 'adventurer'}/svg?seed=${member.user_id === user?.id && avatarSeed ? avatarSeed : member.user_id}`} alt="Avatar" className="w-full h-full object-cover" />
                        </div>
                        <span className={`font-medium truncate max-w-[120px] sm:max-w-none ${member.user_id === user?.id ? 'text-(--color-primary-60) font-bold' : 'text-(--color-on-surface)'}`}>
                          {member.profiles?.username} {member.user_id === user?.id && '(You)'}
                        </span>
                      </div>
                    </td>
                    <td className="p-2.5 sm:p-4 text-right">
                      <div className="flex items-center justify-end gap-2 bg-(--color-surface) px-3 py-1 rounded-full border border-(--color-border) w-fit ml-auto">
                        <span className={`font-bold font-mono ${(member.profiles?.coin_balance || 0) < 50 ? 'text-red-400' : 'text-(--color-reward)'}`}>{member.profiles?.coin_balance || 0}</span>
                        <Coins className="text-(--color-reward) w-4 h-4" />
                      </div>
                    </td>
                    <td className="p-2.5 sm:p-4 text-right">
                      {member.user_id !== user?.id && (
                        <div className="flex justify-end gap-2">
                          <button onClick={() => sendGift(member.user_id, 50)} className="bg-[#FFD700]/20 text-[#FFD700] hover:bg-[#FFD700]/30 p-2 rounded-lg transition-colors cursor-pointer" title="Send 50 Solar Gold Gift">
                            <Gift className="w-4 h-4" />
                          </button>
                          <button onClick={() => {
                            const task = tasks[0]; // naive challenge selection for now
                            if(task) requestCoinsWithChallenge(member.user_id, 50, task.id);
                          }} className="bg-[#00F5FF]/20 text-[#00F5FF] hover:bg-[#00F5FF]/30 p-2 rounded-lg transition-colors cursor-pointer" title="Challenge to earn 50 Gold">
                            <Zap className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
