import React from 'react';
import { useStore } from '../store/useStore';
import { Zap, Gift, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function TavernActivity() {
  const { tavernActivities } = useStore();

  return (
    <div className="bg-(--color-surface) rounded-2xl p-4 border border-(--color-border) shadow-xl w-full h-full flex flex-col">
      <h3 className="text-xl font-normal mb-4 text-(--color-on-surface) flex items-center gap-2" style={{ fontFamily: 'var(--font-varela)' }}>
        Tavern Activity
      </h3>
      
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar flex flex-col gap-3">
        <AnimatePresence>
          {tavernActivities.length === 0 ? (
            <div className="text-(--color-muted-text) text-sm italic p-4 text-center">
              The tavern is quiet right now...
            </div>
          ) : (
            tavernActivities.map((activity) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`p-3 rounded-xl border flex gap-3 items-start ${
                  activity.type === 'challenge' ? 'bg-[#00F5FF]/10 border-[#00F5FF]/30' :
                  activity.type === 'gift' ? 'bg-[#FFD700]/10 border-[#FFD700]/30' :
                  'bg-(--color-surface-2) border-(--color-border)'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {activity.type === 'challenge' && <Zap className="w-4 h-4 text-[#00F5FF]" />}
                  {activity.type === 'gift' && <Gift className="w-4 h-4 text-[#FFD700]" />}
                  {activity.type === 'task' && <CheckCircle className="w-4 h-4 text-(--color-reward)" />}
                </div>
                <div>
                  <p className={`text-sm ${
                    activity.type === 'challenge' ? 'text-[#00F5FF]' :
                    activity.type === 'gift' ? 'text-[#FFD700]' :
                    'text-(--color-on-surface)'
                  }`}>
                    {activity.message}
                  </p>
                  <span className="text-xs text-(--color-muted-text) mt-1 block">
                    {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
