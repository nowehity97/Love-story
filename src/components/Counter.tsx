/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { calculateTimeElapsed } from '../utils';

interface CounterProps {
  startDate: string;
}

export default function Counter({ startDate }: CounterProps) {
  if (!startDate) return null;
  const time = calculateTimeElapsed(startDate);

  return (
    <div className="py-12 text-center">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <h2 className="text-romantic-muted text-sm uppercase tracking-[0.2em] mb-4 font-medium">Jesteśmy razem od</h2>
        <div className="flex flex-wrap justify-center gap-4 md:gap-16 px-2">
          <Unit value={time.years} label="lat" />
          <Unit value={time.months} label="miesięcy" />
          <Unit value={time.days} label="dni" />
        </div>
        <div className="mt-8 px-4">
          <p className="text-romantic-accent font-serif italic text-lg md:text-xl">
            To już {time.totalDays.toLocaleString()} dni wspólnych zachwytów.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

function Unit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-5xl md:text-7xl font-serif text-romantic-text dark:text-white">{value}</span>
      <span className="text-romantic-muted font-light mt-1">{label}</span>
    </div>
  );
}
