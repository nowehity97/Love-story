/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Photo } from '../types';
import { Camera, Calendar, Trash2, LayoutGrid, List, Heart } from 'lucide-react';
import Lightbox from './Lightbox';

interface GalleryProps {
  photos: Photo[];
  onDelete?: (id: string) => void;
  onUpdate?: (id: string, caption: string, date: string) => void;
  startDate?: string;
}

export default function Gallery({ photos, onDelete, onUpdate, startDate }: GalleryProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'timeline'>('grid');
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);

  const getAnniversary = (photoDate: string) => {
    if (!photoDate || !startDate) return null;
    try {
      const p = new Date(photoDate);
      const s = new Date(startDate);
      
      if (isNaN(p.getTime()) || isNaN(s.getTime())) return null;

      if (p.getMonth() === s.getMonth() && p.getDate() === s.getDate()) {
        const years = p.getFullYear() - s.getFullYear();
        if (years > 0) return years;
      }
    } catch (e) {
      return null;
    }
    return null;
  };

  if (photos.length === 0) {
    return (
      <div className="py-20 text-center bg-white/50 rounded-3xl border-2 border-dashed border-romantic-accent/20">
        <Camera className="w-12 h-12 text-romantic-accent/40 mx-auto mb-4" />
        <p className="text-romantic-muted italic">Nasze wspomnienia czekają na dodanie...</p>
      </div>
    );
  }

  const handleNext = () => {
    if (selectedPhotoIndex !== null) {
      setSelectedPhotoIndex((selectedPhotoIndex + 1) % photos.length);
    }
  };

  const handlePrev = () => {
    if (selectedPhotoIndex !== null) {
      setSelectedPhotoIndex((selectedPhotoIndex - 1 + photos.length) % photos.length);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-end gap-2 mb-4">
        <button
          onClick={() => setViewMode('grid')}
          className={`p-2 rounded-xl transition-all ${
            viewMode === 'grid' 
              ? 'bg-romantic-accent text-white shadow-md' 
              : 'bg-white dark:bg-romantic-dark-card text-romantic-muted hover:bg-gray-50 dark:hover:bg-black/20 border border-gray-100 dark:border-white/5'
          }`}
          title="Widok siatki"
        >
          <LayoutGrid className="w-5 h-5" />
        </button>
        <button
          onClick={() => setViewMode('timeline')}
          className={`p-2 rounded-xl transition-all ${
            viewMode === 'timeline' 
              ? 'bg-romantic-accent text-white shadow-md' 
              : 'bg-white dark:bg-romantic-dark-card text-romantic-muted hover:bg-gray-50 dark:hover:bg-black/20 border border-gray-100 dark:border-white/5'
          }`}
          title="Widok osi czasu"
        >
          <List className="w-5 h-5" />
        </button>
      </div>

      <AnimatePresence mode="wait">
        {viewMode === 'grid' ? (
          <motion.div 
            key="grid"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6"
          >
            {photos.map((photo, index) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                whileHover={{ y: -5, shadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)" }}
                transition={{ 
                  duration: 0.5,
                  delay: (index % 12) * 0.05, // Reset delay slightly for long lists
                  type: "spring",
                  stiffness: 100
                }}
                viewport={{ once: true, margin: "-50px" }}
                className={`relative group break-inside-avoid rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all bg-white cursor-zoom-in ${
                  getAnniversary(photo.date) ? 'ring-4 ring-romantic-accent ring-offset-2' : ''
                }`}
                onClick={() => setSelectedPhotoIndex(index)}
              >
                {getAnniversary(photo.date) && (
                  <div className="absolute top-4 left-4 z-10 bg-romantic-accent text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-lg flex items-center gap-1">
                    <Heart className="w-3 h-3 fill-white" />
                    {getAnniversary(photo.date)}. Rocznica
                  </div>
                )}
                <img
                  src={photo.url}
                  alt={photo.caption}
                  className="w-full h-auto object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                  {photo.date && (
                    <div className="flex items-center gap-2 text-white/80 text-xs mb-2">
                      <Calendar className="w-3 h-3" />
                      <span>{photo.date}</span>
                    </div>
                  )}
                  <p className="text-white font-medium text-lg leading-tight italic">"{photo.caption}"</p>
                  
                  {onDelete && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(photo.id);
                      }}
                      className="absolute top-4 right-4 bg-white/20 backdrop-blur-md p-2 rounded-xl text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            key="timeline"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="max-w-3xl mx-auto space-y-12 relative py-4"
          >
            <div className="absolute left-[23px] md:left-1/2 top-0 bottom-0 w-[2px] bg-romantic-accent/10 -translate-x-1/2" />
            
            {photos.map((photo, index) => (
              <div key={photo.id} className={`flex flex-col md:flex-row items-center gap-8 ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                {/* Timeline Point */}
                <motion.div 
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  className="absolute left-[20px] md:left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-white border-4 border-romantic-accent shadow-lg z-10" 
                />
                
                <div className="w-full md:w-[calc(50%-40px)]">
                  <motion.div
                    initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50, scale: 0.9 }}
                    whileInView={{ opacity: 1, x: 0, scale: 1 }}
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.6, type: "spring" }}
                    viewport={{ once: true, margin: "-20px" }}
                    className={`relative bg-white dark:bg-romantic-dark-card p-5 rounded-[2.5rem] shadow-xl border cursor-zoom-in ${
                      getAnniversary(photo.date) 
                        ? 'border-romantic-accent ring-4 ring-romantic-accent/20' 
                        : 'border-romantic-accent/5'
                    }`}
                    onClick={() => setSelectedPhotoIndex(index)}
                  >
                    {getAnniversary(photo.date) && (
                      <div className="absolute -top-3 -right-3 z-10 bg-romantic-accent text-white p-2 rounded-2xl shadow-lg border-4 border-white dark:border-romantic-dark-card">
                        <Heart className="w-5 h-5 fill-white" />
                      </div>
                    )}
                    <div className="aspect-[4/3] rounded-3xl overflow-hidden mb-5">
                      <img src={photo.url} alt={photo.caption} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
                    </div>
                    <div className="px-2">
                      <div className="flex items-center gap-2 text-romantic-accent text-xs font-bold uppercase tracking-wider mb-3">
                        <Calendar className="w-4 h-4" />
                        {photo.date || 'Wspomnienie'}
                        {getAnniversary(photo.date) && (
                          <span className="ml-auto bg-romantic-accent/10 px-2 py-0.5 rounded-lg text-[9px]">
                            {getAnniversary(photo.date)}. ROCZNICA
                          </span>
                        )}
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 italic text-lg leading-relaxed">"{photo.caption}"</p>
                    </div>
                  </motion.div>
                </div>
                <div className="hidden md:block md:w-[calc(50%-40px)]" />
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedPhotoIndex !== null && (
          <Lightbox 
            photo={photos[selectedPhotoIndex]} 
            onClose={() => setSelectedPhotoIndex(null)}
            onNext={handleNext}
            onPrev={handlePrev}
            onUpdate={onUpdate}
            anniversaryYears={getAnniversary(photos[selectedPhotoIndex].date)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
