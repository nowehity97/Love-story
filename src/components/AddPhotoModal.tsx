/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Image as ImageIcon, Upload, Calendar, Loader2 } from 'lucide-react';
import imageCompression from 'browser-image-compression';

interface AddPhotoModalProps {
  onClose: () => void;
  onAdd: (file: File, caption: string, date: string) => void;
}

export default function AddPhotoModal({ onClose, onAdd }: AddPhotoModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [date, setDate] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const [isCompresing, setIsCompressing] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !caption) return;

    setIsCompressing(true);
    try {
      // Still compress to save server space
      const options = {
        maxSizeMB: 0.8,
        maxWidthOrHeight: 1200,
        useWebWorker: true,
      };
      
      const compressedFile = await imageCompression(file, options);
      onAdd(compressedFile as File, caption, date);
      onClose();
    } catch (error) {
      console.error(error);
      alert('Błąd podczas przygotowania zdjęcia.');
    } finally {
      setIsCompressing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative bg-white dark:bg-romantic-dark-card rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        <div className="p-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-romantic-bg/30 dark:bg-black/20">
          <h3 className="text-xl font-serif text-romantic-text">Nowe Wspomnienie</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors">
            <X className="w-5 h-5 text-romantic-muted" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-romantic-text flex items-center gap-2">
              <Upload className="w-4 h-4 text-romantic-accent" />
              Wybierz zdjęcie
            </label>
            <div className="relative group">
              <input
                type="file"
                accept="image/*"
                required
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="w-full h-40 rounded-xl border-2 border-dashed border-gray-200 dark:border-white/10 group-hover:border-romantic-accent transition-colors flex flex-col items-center justify-center bg-gray-50 dark:bg-black/20 overflow-hidden">
                {preview ? (
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <ImageIcon className="w-8 h-8 text-gray-300 dark:text-gray-700 mb-2" />
                    <span className="text-sm text-gray-400">Kliknij lub przeciągnij zdjęcie</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-romantic-text flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-romantic-accent" />
              Opis
            </label>
            <input
              type="text"
              required
              placeholder="Co wtedy robiliśmy?"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 dark:bg-black/20 dark:text-white focus:border-romantic-accent focus:ring-2 focus:ring-romantic-accent/20 outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-romantic-text flex items-center gap-2">
              <Calendar className="w-4 h-4 text-romantic-accent" />
              Data (opcjonalnie)
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 dark:bg-black/20 dark:text-white focus:border-romantic-accent focus:ring-2 focus:ring-romantic-accent/20 outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={isCompresing}
            className="w-full bg-romantic-accent text-white py-4 rounded-xl font-medium shadow-lg hover:bg-romantic-accent/90 transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isCompresing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Przygotowuję...
              </>
            ) : (
              'Dodaj do Naszej Opowieści'
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
