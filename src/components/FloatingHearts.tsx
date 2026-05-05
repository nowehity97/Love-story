/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart } from 'lucide-react';

interface HeartIcon {
  id: number;
  x: number;
  size: number;
  duration: number;
  delay: number;
}

export default function FloatingHearts() {
  const [hearts, setHearts] = useState<HeartIcon[]>([]);

  useEffect(() => {
    // Generate initial hearts
    const initialHearts = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      size: Math.random() * (30 - 10) + 10,
      duration: Math.random() * (15 - 10) + 10,
      delay: Math.random() * 10,
    }));
    setHearts(initialHearts);

    // Add a new heart occasionally
    const interval = setInterval(() => {
      setHearts(prev => [
        ...prev.slice(-20), // Keep max 20 hearts
        {
          id: Date.now(),
          x: Math.random() * 100,
          size: Math.random() * (30 - 10) + 10,
          duration: Math.random() * (20 - 15) + 15,
          delay: 0,
        }
      ]);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <AnimatePresence>
        {hearts.map((heart) => (
          <motion.div
            key={heart.id}
            initial={{ y: '110vh', x: `${heart.x}vw`, opacity: 0, scale: 0 }}
            animate={{ 
              y: '-10vh', 
              opacity: [0, 0.4, 0.4, 0],
              scale: [0, 1, 1, 0.5],
              x: `${heart.x + (Math.sin(heart.id) * 5)}vw`
            }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: heart.duration, 
              delay: heart.delay,
              ease: "linear",
              repeat: Infinity
            }}
            className="absolute text-romantic-accent/20"
          >
            <Heart 
              size={heart.size} 
              fill="currentColor" 
              className="drop-shadow-sm" 
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
