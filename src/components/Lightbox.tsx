/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, MessageSquare, ChevronLeft, ChevronRight, Edit2, Check, Heart } from 'lucide-react';
import { Photo } from '../types';
import { getImageUrl } from '../utils.ts';

interface LightboxProps {
  photo: Photo;
  onClose: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  onUpdate?: (id: string, caption: string, date: string) => void;
  anniversaryYears?: number | null;
}

export default function Lightbox({ photo, onClose, onNext, onPrev, onUpdate, anniversaryYears }: LightboxProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editCaption, setEditCaption] = React.useState(photo.caption);
  const [editDate, setEditDate] = React.useState(photo.date || '');

  React.useEffect(() => {
    setEditCaption(photo.caption);
    setEditDate(photo.date || '');
  }, [photo]);

  React.useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isEditing) return;
      
      if (e.key === 'ArrowRight' && onNext) onNext();
      if (e.key === 'ArrowLeft' && onPrev) onPrev();
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNext, onPrev, onClose, isEditing]);

  const handleSave = () => {
    if (onUpdate) {
      onUpdate(photo.id, editCaption, editDate);
    }
    setIsEditing(false);
  };

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 md:p-8"
        onClick={onClose}
      >
        <div className="absolute top-6 right-6 flex items-center gap-4 z-[110]">
          {onUpdate && (
            <button 
              onClick={(e) => { e.stopPropagation(); setIsEditing(!isEditing); }}
              className="text-white/50 hover:text-white transition-colors"
            >
              <Edit2 className="w-6 h-6" />
            </button>
          )}
          <button 
            onClick={onClose}
            className="text-white/50 hover:text-white transition-colors"
          >
            <X className="w-8 h-8" />
          </button>
        </div>
  
        {onPrev && (
          <button 
            onClick={(e) => { e.stopPropagation(); onPrev(); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 text-white/50 hover:text-white bg-white/5 rounded-full backdrop-blur-md transition-all z-[110]"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
        )}
  
        {onNext && (
          <button 
            onClick={(e) => { e.stopPropagation(); onNext(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-white/50 hover:text-white bg-white/5 rounded-full backdrop-blur-md transition-all z-[110]"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        )}
  
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative max-w-5xl w-full max-h-full flex flex-col md:flex-row gap-6 items-center"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex-1 relative group w-full flex justify-center items-center overflow-hidden rounded-2xl shadow-2xl">
            <img 
              src={getImageUrl(photo.url)} 
              alt={photo.caption}
              className="max-h-[70vh] md:max-h-[85vh] object-contain rounded-lg shadow-2xl"
            />
          </div>

        <div className="w-full md:w-80 flex flex-col gap-4 text-white p-4">
          {isEditing ? (
            <div className="space-y-4 bg-white/5 p-4 rounded-2xl border border-white/10">
              <div className="space-y-2">
                <label className="text-xs text-white/50 font-bold uppercase tracking-widest">Opis</label>
                <textarea
                  value={editCaption}
                  onChange={(e) => setEditCaption(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white outline-none focus:border-romantic-accent"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-white/50 font-bold uppercase tracking-widest">Data</label>
                <input
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white outline-none focus:border-romantic-accent"
                />
              </div>
              <button
                onClick={handleSave}
                className="w-full bg-romantic-accent text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2"
              >
                <Check className="w-5 h-5" />
                Zastosuj zmiany
              </button>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-romantic-accent" />
                  Wspomnienie
                </h3>
                <p className="text-white/80 leading-relaxed italic text-lg">
                  "{photo.caption}"
                </p>
              </div>

              {photo.date && (
                <div className="pt-4 border-t border-white/10 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3 text-romantic-accent">
                    <Calendar className="w-5 h-5" />
                    <span className="font-medium tracking-wide">{photo.date}</span>
                  </div>
                  {anniversaryYears && (
                    <div className="bg-romantic-accent text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 animate-pulse">
                      <Heart className="w-3 h-3 fill-white" />
                      {anniversaryYears}. Rocznica
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
