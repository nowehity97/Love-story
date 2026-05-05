/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Heart, Stars } from 'lucide-react';

interface RelationshipJourneyProps {
  startDate: string;
}

export default function RelationshipJourney({ startDate }: RelationshipJourneyProps) {
  if (!startDate) return null;
  const start = new Date(startDate);
  const now = new Date();
  
  const totalDays = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  
  // Calculate next anniversary
  const nextAnniversary = new Date(now.getFullYear(), start.getMonth(), start.getDate());
  if (nextAnniversary < now) {
    nextAnniversary.setFullYear(now.getFullYear() + 1);
  }
  
  const lastAnniversary = new Date(nextAnniversary);
  lastAnniversary.setFullYear(nextAnniversary.getFullYear() - 1);
  
  const totalInYear = nextAnniversary.getTime() - lastAnniversary.getTime();
  const elapsedInYear = now.getTime() - lastAnniversary.getTime();
  const yearProgress = (elapsedInYear / totalInYear) * 100;
  
  // Days until next anniversary
  const daysLeft = Math.ceil((nextAnniversary.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  const milestones = [
    { days: 1000, label: '1000 dni' },
    { days: 2000, label: '2000 dni' },
    { days: 3000, label: '3000 dni' },
    { days: 4000, label: '4000+ dni' },
  ];

  return (
    <div className="max-w-2xl mx-auto px-2 md:px-6 mt-12 mb-16">
      <div className="relative pt-8 pb-4">
        {/* Connection Line */}
        <div className="absolute top-1/2 left-0 w-full h-[2px] bg-romantic-accent/10 -translate-y-1/2" />
        
        {/* Progress Line */}
        <motion.div 
          initial={{ width: 0 }}
          whileInView={{ width: `${yearProgress}%` }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute top-1/2 left-0 h-[3px] bg-romantic-accent -translate-y-1/2"
        />

        <div className="flex justify-between items-center relative">
          <div className="flex flex-col items-center">
            <div className="w-3 h-3 md:w-4 h-4 rounded-full bg-romantic-accent mb-2 shadow-[0_0_10px_rgba(255,107,107,0.4)]" />
            <span className="text-[8px] md:text-[10px] uppercase tracking-widest text-romantic-muted font-medium">Start</span>
          </div>
          
          <motion.div 
            style={{ left: `${yearProgress}%` }}
            className="absolute -translate-x-1/2 -top-8 flex flex-col items-center z-10"
          >
            <div className="bg-white dark:bg-romantic-dark-card p-1 md:p-1.5 rounded-full shadow-md border border-romantic-accent/10">
              <Heart className="w-4 h-4 md:w-5 h-5 text-romantic-accent fill-romantic-accent animate-pulse" />
            </div>
            <div className="mt-6 text-[8px] md:text-[10px] uppercase font-bold text-romantic-accent bg-romantic-accent/5 dark:bg-romantic-accent/20 px-2 py-0.5 rounded-full border border-romantic-accent/10 whitespace-nowrap">
              Dzisiaj
            </div>
          </motion.div>

          <div className="flex flex-col items-center">
            <div className="w-3 h-3 md:w-4 h-4 rounded-full border-2 border-romantic-accent bg-white dark:bg-romantic-dark-card mb-2" />
            <span className="text-[8px] md:text-[10px] uppercase tracking-widest text-romantic-muted font-medium">Rocznica</span>
          </div>
        </div>
      </div>

      <div className="text-center mt-4">
        <p className="text-xs md:text-sm text-romantic-muted flex items-center justify-center gap-2">
          <Stars className="w-4 h-4 text-romantic-accent/40" />
          Tylko <span className="font-bold text-romantic-accent">{daysLeft}</span> dni do kolejnej rocznicy
        </p>
      </div>

      {/* Milestone Badges */}
      <div className="grid grid-cols-4 gap-1 md:gap-2 mt-8">
        {milestones.map((m) => (
          <div 
            key={m.days} 
            className={`p-2 md:p-3 rounded-xl md:rounded-2xl border text-center transition-all ${
              totalDays >= m.days 
                ? 'bg-romantic-accent/5 border-romantic-accent/20' 
                : 'bg-gray-50 dark:bg-black/20 border-gray-100 dark:border-white/5 opacity-40'
            }`}
          >
            <div className={`text-[10px] md:text-sm font-bold block mb-1 ${totalDays >= m.days ? 'text-romantic-accent' : 'text-gray-400'}`}>
              {m.label}
            </div>
            <div className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full mx-auto bg-current opacity-20" />
          </div>
        ))}
      </div>
    </div>
  );
}
