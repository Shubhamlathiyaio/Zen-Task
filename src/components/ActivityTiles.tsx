import React from 'react';
import { Flame, BookOpen, PenTool } from 'lucide-react';

export default function ActivityTiles() {
  const activities = [
    { id: 1, name: 'Exercise', icon: Flame, progress: 65, target: '30 mins left', color: 'text-orange-500' },
    { id: 2, name: 'Reading', icon: BookOpen, progress: 20, target: '40 pages left', color: 'text-blue-400' },
    { id: 3, name: 'Writing', icon: PenTool, progress: 85, target: '100 words left', color: 'text-(--color-primary)' },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto my-8">
      <h2 className="text-2xl font-normal mb-6 text-(--color-on-surface)" style={{ fontFamily: 'var(--font-varela)' }}>Daily Rituals</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {activities.map(activity => {
          const Icon = activity.icon;
          return (
            <div key={activity.id} className="bg-(--color-surface) rounded-lg p-5 shadow-sm border border-(--color-border) flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Icon className={`w-5 h-5 ${activity.color}`} />
                  <span className="font-bold text-(--color-on-surface)" style={{ fontFamily: 'var(--font-roboto)' }}>{activity.name}</span>
                </div>
                <span className="text-xs text-(--color-muted-text) font-mono">{activity.progress}%</span>
              </div>
              
              <div className="w-full bg-(--color-neutral) rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${activity.color.replace('text-', 'bg-')}`} 
                  style={{ width: `${activity.progress}%`, backgroundColor: activity.color.includes('(--color-primary)') ? 'var(--color-primary)' : undefined }}
                ></div>
              </div>
              
              <div className="text-sm text-(--color-muted-text) text-right mt-1">
                {activity.target}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
