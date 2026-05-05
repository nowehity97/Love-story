/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Circle, Plus, Trash2, Sparkles } from 'lucide-react';

interface BucketItem {
  id: string;
  title: string;
  isCompleted: boolean;
}

interface BucketListProps {
  isImageBackground?: boolean;
}

export default function BucketList({ isImageBackground }: BucketListProps) {
  const [items, setItems] = useState<BucketItem[]>([]);
  const [newItem, setNewItem] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await fetch('./api.php?action=bucket_list');
      const data = await response.json();
      setItems(data.map((item: any) => ({
        ...item,
        isCompleted: !!item.isCompleted
      })));
    } catch (error) {
      console.error('Failed to fetch bucket list', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.trim()) return;

    try {
      const response = await fetch('./api.php?action=bucket_add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newItem })
      });
      if (response.ok) {
        const result = await response.json();
        setItems([{ id: result.id, title: newItem, isCompleted: false }, ...items]);
        setNewItem('');
      }
    } catch (error) {
      console.error('Failed to add item', error);
    }
  };

  const toggleItem = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`./api.php?action=bucket_toggle&id=${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isCompleted: !currentStatus })
      });
      if (response.ok) {
        setItems(items.map(item => 
          item.id === id ? { ...item, isCompleted: !currentStatus } : item
        ));
      }
    } catch (error) {
      console.error('Failed to toggle item', error);
    }
  };

  const deleteItem = async (id: string) => {
    try {
      const response = await fetch(`./api.php?action=bucket_delete&id=${id}`, {
        method: 'POST'
      });
      if (response.ok) {
        setItems(items.filter(item => item.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete item', error);
    }
  };

  const completedCount = items.filter(i => i.isCompleted).length;
  const progress = items.length > 0 ? (completedCount / items.length) * 100 : 0;

  return (
    <section className="mt-16 md:mt-24 mb-32 max-w-3xl mx-auto px-4 md:px-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-romantic-accent/20 p-3 rounded-2xl shadow-inner">
          <Sparkles className="w-6 h-6 text-romantic-accent" />
        </div>
        <div>
          <h2 className={`text-2xl md:text-3xl font-serif ${isImageBackground ? 'text-white drop-shadow-md' : 'text-romantic-text dark:text-white'}`}>Nasza Lista Marzeń</h2>
          <p className={`text-xs md:text-sm ${isImageBackground ? 'text-white/80 drop-shadow-sm' : 'text-romantic-muted'}`}>To, co chcemy razem przeżyć...</p>
        </div>
      </div>

      <div className="bg-white dark:bg-romantic-dark-card rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 shadow-xl border border-romantic-accent/5">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-[10px] md:text-xs font-bold uppercase tracking-widest text-romantic-muted mb-2">
            <span>Postęp marzeń</span>
            <span>{completedCount} / {items.length}</span>
          </div>
          <div className="h-2 bg-romantic-accent/10 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-romantic-accent"
            />
          </div>
        </div>

        <form onSubmit={addItem} className="flex gap-2 mb-8">
          <input
            type="text"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            placeholder="Dodaj nowe marzenie..."
            className="flex-1 bg-romantic-bg dark:bg-black/10 border border-romantic-accent/10 rounded-2xl px-4 md:px-6 py-2 md:py-3 outline-none focus:border-romantic-accent transition-all text-sm dark:text-white"
          />
          <button
            type="submit"
            className="bg-romantic-accent text-white p-2 md:p-3 rounded-2xl hover:shadow-lg transition-all active:scale-95"
          >
            <Plus className="w-6 h-6" />
          </button>
        </form>

        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {items.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-2xl border transition-all ${
                  item.isCompleted 
                    ? 'bg-romantic-accent/5 border-romantic-accent/10 opacity-70' 
                    : 'bg-white dark:bg-black/20 border-gray-100 dark:border-white/5 hover:border-romantic-accent/20 shadow-sm'
                }`}
              >
                <button 
                  onClick={() => toggleItem(item.id, item.isCompleted)}
                  className={`transition-colors ${item.isCompleted ? 'text-romantic-accent' : 'text-gray-300 dark:text-gray-600 hover:text-romantic-accent'}`}
                >
                  {item.isCompleted ? <CheckCircle2 className="w-5 h-5 md:w-6 h-6" /> : <Circle className="w-5 h-5 md:w-6 h-6" />}
                </button>
                
                <span className={`flex-1 text-sm md:text-base font-medium ${item.isCompleted ? 'line-through text-romantic-muted' : 'text-romantic-text dark:text-gray-200'}`}>
                  {item.title}
                </span>

                <button 
                  onClick={() => deleteItem(item.id)}
                  className="text-gray-300 dark:text-gray-600 hover:text-red-500 transition-colors p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {!isLoading && items.length === 0 && (
            <div className="text-center py-12 text-romantic-muted italic">
              Lista jest pusta. Czas coś zaplanować! ✨
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
