/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Heart, Calendar } from 'lucide-react';

interface GateProps {
  onAccess: (startDate: string) => void;
  names?: { HE: string; SHE: string };
}

export default function Gate({ onAccess, names }: GateProps) {
  const [date, setDate] = useState('');
  const [error, setError] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // Fallback to default if names not loaded yet
  const displayNames = names || { HE: 'Łukasz', SHE: 'Klaudia' };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    
    try {
      const response = await fetch(`./api.php?action=verify&date=${date}`);
      if (response.ok) {
        const data = await response.json();
        onAccess(data.startDate);
      } else {
        throw new Error('Invalid date');
      }
    } catch (err) {
      setError(true);
      setTimeout(() => setError(false), 2000);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative"
    >
      {/* Subtle overlay */}
      <div className="fixed inset-0 -z-10 bg-white/20 dark:bg-black/20 pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white dark:bg-romantic-dark-card rounded-3xl shadow-xl p-8 text-center"
      >
        <div className="mb-6 flex justify-center">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <Heart className="text-romantic-accent fill-romantic-accent w-12 h-12" />
          </motion.div>
        </div>
        
        <h1 className="text-3xl font-serif mb-2 text-romantic-text">
          {displayNames.HE} & {displayNames.SHE}
        </h1>
        <p className="text-romantic-muted mb-8 italic">Pamiętasz dzień, od którego wszystko się zaczęło?</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-romantic-muted w-5 h-5" />
            <input
              type="text"
              placeholder="DD.MM.YYYY"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={`w-full pl-12 pr-4 py-3 rounded-xl border-2 transition-all outline-none bg-transparent dark:text-white ${
                error ? 'border-red-400 bg-red-50 dark:bg-red-900/20' : 'border-romantic-bg dark:border-romantic-bg/10 focus:border-romantic-accent'
              }`}
            />
          </div>
          
          <button
            type="submit"
            disabled={isVerifying}
            className="w-full bg-romantic-accent text-white py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isVerifying ? 'Sprawdzam...' : 'Odblokuj Wspomnienia'}
          </button>
        </form>
        
        {error && (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-500 text-sm mt-4"
          >
            To nie ta data... Spróbuj jeszcze raz ❤️
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}
