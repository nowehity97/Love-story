/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Settings as SettingsIcon, Save, User, Camera, Calendar, Music, Moon, Sun } from 'lucide-react';
import { getImageUrl } from '../utils.ts';

interface SettingsProps {
  names: { HE: string; SHE: string };
  profilePics: { HE: string; SHE: string };
  startDate: string;
  spotifyUrl: string;
  darkMode: boolean;
  background: { type: 'theme' | 'image'; value: string };
  onUpdate: (key: string, value: any) => void;
}

export default function Settings({ names, profilePics, startDate, spotifyUrl, darkMode, background, onUpdate }: SettingsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [editNames, setEditNames] = useState(names);
  const [editPics, setEditPics] = useState(profilePics);
  const [editDate, setEditDate] = useState(startDate);
  const [editSpotify, setEditSpotify] = useState(spotifyUrl);
  const [editDarkMode, setEditDarkMode] = useState(darkMode);
  const [editBackground, setEditBackground] = useState(background);

  const themes = [
    { id: 'default', name: 'Kremowy', color: '#fdfaf8' },
    { id: 'midnight', name: 'Północ', color: '#0f172a' },
    { id: 'sunset', name: 'Zachód Słońca', color: '#fef3c7' },
    { id: 'lavender', name: 'Lawenda', color: '#f5f3ff' },
    { id: 'rosegold', name: 'Różowe Złoto', color: '#fff1f2' }
  ];

  const handleProfilePicUpload = async (person: 'HE' | 'SHE', file: File) => {
    const formData = new FormData();
    formData.append('photo', file);
    
    try {
      const response = await fetch(`./api.php?action=upload_profile_pic&person=${person}`, {
        method: 'POST',
        body: formData
      });
      if (response.ok) {
        const result = await response.json();
        setEditPics(result.pics);
        onUpdate('profile_pics', result.pics);
      }
    } catch (error) {
      console.error('Failed to upload profile pic', error);
    }
  };

  const handleSave = async () => {
    await onUpdate('names', editNames);
    await onUpdate('profile_pics', editPics);
    await onUpdate('start_date', editDate);
    await onUpdate('spotify_url', editSpotify);
    await onUpdate('dark_mode', editDarkMode);
    await onUpdate('background', editBackground);
    setIsOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-white/80 backdrop-blur-md text-romantic-muted p-4 rounded-full shadow-lg hover:shadow-xl hover:text-romantic-accent transition-all active:scale-95 border border-romantic-accent/5"
      >
        <SettingsIcon className="w-6 h-6" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-lg bg-white dark:bg-romantic-dark-card rounded-[2.5rem] md:rounded-[3rem] shadow-2xl overflow-hidden m-4"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6 md:p-8 border-b border-romantic-accent/5 flex justify-between items-center bg-romantic-accent/5 dark:bg-black/20">
                  <div>
                    <h2 className="text-xl md:text-2xl font-serif text-romantic-text dark:text-white">Personalizacja</h2>
                    <p className="text-romantic-muted text-xs md:text-sm">Dostosuj waszą wspólną historię</p>
                  </div>
                  <button onClick={() => setIsOpen(false)} className="text-romantic-muted hover:text-romantic-accent transition-colors">
                    <X className="w-8 h-8" />
                  </button>
                </div>

                <div className="p-6 md:p-8 space-y-8 max-h-[60vh] md:max-h-[70vh] overflow-y-auto">
                  {/* Theme Section */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-romantic-muted flex items-center gap-2">
                      <Sun className="w-4 h-4" /> Tryb Wyglądu
                    </h3>
                    <div className="flex items-center justify-between p-4 bg-romantic-bg dark:bg-black/20 rounded-2xl border border-romantic-accent/10">
                      <div className="flex items-center gap-3">
                        {editDarkMode ? <Moon className="w-5 h-5 text-romantic-accent" /> : <Sun className="w-5 h-5 text-romantic-accent" />}
                        <span className="text-sm font-medium text-romantic-text dark:text-gray-200">
                          {editDarkMode ? 'Tryb Ciemny' : 'Tryb Jasny'}
                        </span>
                      </div>
                      <button
                        onClick={() => setEditDarkMode(!editDarkMode)}
                        className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${editDarkMode ? 'bg-romantic-accent' : 'bg-gray-300'}`}
                      >
                        <motion.div
                          animate={{ x: editDarkMode ? 26 : 2 }}
                          className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-sm"
                        />
                      </button>
                    </div>
                  </div>

                  {/* Background Section */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-romantic-muted flex items-center gap-2">
                       <Camera className="w-4 h-4" /> Tło strony
                    </h3>
                    <div className="grid grid-cols-5 gap-2">
                      {themes.map(theme => (
                        <button
                          key={theme.id}
                          onClick={() => {
                            const newBg = { type: 'theme', value: theme.id } as const;
                            setEditBackground(newBg);
                            onUpdate('background', newBg);
                          }}
                          className={`group relative h-12 rounded-xl border-2 transition-all ${editBackground.type === 'theme' && editBackground.value === theme.id ? 'border-romantic-accent scale-105' : 'border-transparent hover:border-romantic-accent/30'}`}
                          title={theme.name}
                        >
                          <div className="absolute inset-0 rounded-lg shadow-inner" style={{ backgroundColor: theme.color }} />
                        </button>
                      ))}
                    </div>
                    
                    <div className="space-y-3">
                      <p className="text-[10px] text-romantic-muted font-bold uppercase">Własne zdjęcie w tle (Link)</p>
                      <div className="flex gap-4 items-center">
                        {editBackground.type === 'image' && (
                          <div className="w-12 h-12 rounded-lg overflow-hidden border-2 border-romantic-accent flex-shrink-0">
                            <img src={getImageUrl(editBackground.value)} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <input
                          type="text"
                          placeholder="Wklej link do zdjęcia..."
                          value={editBackground.type === 'image' ? editBackground.value : ''}
                          onChange={(e) => {
                            const newBg = { type: 'image', value: e.target.value } as const;
                            setEditBackground(newBg);
                            if (e.target.value) onUpdate('background', newBg);
                          }}
                          className="w-full bg-romantic-bg dark:bg-black/20 border border-romantic-accent/10 rounded-2xl px-4 py-2 outline-none focus:border-romantic-accent text-xs dark:text-white"
                        />
                      </div>
                      {editBackground.type === 'image' && (
                        <button 
                          onClick={() => setEditBackground({ type: 'theme', value: 'default' })}
                          className="text-[10px] text-romantic-accent font-medium hover:underline"
                        >
                          Przywróć domyślne tło
                        </button>
                      )}
                    </div>
                  </div>
                {/* Names Section */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-romantic-muted flex items-center gap-2">
                    <User className="w-4 h-4" /> Imiona
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] text-romantic-muted font-bold uppercase">On</label>
                      <input
                        type="text"
                        value={editNames.HE}
                        onChange={(e) => setEditNames({ ...editNames, HE: e.target.value })}
                        className="w-full bg-romantic-bg dark:bg-black/20 border border-romantic-accent/10 rounded-2xl px-4 py-2 outline-none focus:border-romantic-accent text-romantic-text dark:text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] text-romantic-muted font-bold uppercase">Ona</label>
                      <input
                        type="text"
                        value={editNames.SHE}
                        onChange={(e) => setEditNames({ ...editNames, SHE: e.target.value })}
                        className="w-full bg-romantic-bg dark:bg-black/20 border border-romantic-accent/10 rounded-2xl px-4 py-2 outline-none focus:border-romantic-accent text-romantic-text dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Profile Pics Section */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-romantic-muted flex items-center gap-2">
                    <Camera className="w-4 h-4" /> Zdjęcia profilowe
                  </h3>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] text-romantic-muted font-bold uppercase">Zdjęcie {editNames.HE}</label>
                      <div className="flex gap-4 items-center">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-romantic-accent/5 border border-romantic-accent/10 flex-shrink-0">
                          {editPics.HE ? <img src={getImageUrl(editPics.HE)} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-romantic-accent font-bold">{editNames.HE[0]}</div>}
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => e.target.files?.[0] && handleProfilePicUpload('HE', e.target.files[0])}
                          className="text-xs text-romantic-muted file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-romantic-accent/10 file:text-romantic-accent hover:file:bg-romantic-accent/20 cursor-pointer"
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="Lub wklej link..."
                        value={editPics.HE}
                        onChange={(e) => setEditPics({ ...editPics, HE: e.target.value })}
                        className="w-full bg-romantic-bg dark:bg-black/20 border border-romantic-accent/10 rounded-2xl px-4 py-2 outline-none focus:border-romantic-accent text-[10px] dark:text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] text-romantic-muted font-bold uppercase">Zdjęcie {editNames.SHE}</label>
                      <div className="flex gap-4 items-center">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-romantic-accent/5 border border-romantic-accent/10 flex-shrink-0">
                          {editPics.SHE ? <img src={getImageUrl(editPics.SHE)} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-romantic-accent font-bold">{editNames.SHE[0]}</div>}
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => e.target.files?.[0] && handleProfilePicUpload('SHE', e.target.files[0])}
                          className="text-xs text-romantic-muted file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-romantic-accent/10 file:text-romantic-accent hover:file:bg-romantic-accent/20 cursor-pointer"
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="Lub wklej link..."
                        value={editPics.SHE}
                        onChange={(e) => setEditPics({ ...editPics, SHE: e.target.value })}
                        className="w-full bg-romantic-bg dark:bg-black/20 border border-romantic-accent/10 rounded-2xl px-4 py-2 outline-none focus:border-romantic-accent text-[10px] dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Relationship Date Section */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-romantic-muted flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Początek związku
                  </h3>
                  <div className="space-y-2">
                    <p className="text-[10px] text-romantic-muted italic">Ustawienie tej daty aktywuje blokadę strony (wymagane wpisanie daty przy wejściu).</p>
                    <input
                      type="date"
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                      className="w-full bg-romantic-bg dark:bg-black/20 border border-romantic-accent/10 rounded-2xl px-4 py-2 outline-none focus:border-romantic-accent dark:text-white"
                    />
                  </div>
                </div>

                {/* Spotify Section */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-romantic-muted flex items-center gap-2">
                    <Music className="w-4 h-4" /> Wasza piosenka (Spotify)
                  </h3>
                  <div className="space-y-2">
                    <label className="text-[10px] text-romantic-muted font-bold uppercase">Link do osadzenia (Embed URL)</label>
                    <input
                      type="text"
                      placeholder="https://open.spotify.com/embed/track/..."
                      value={editSpotify}
                      onChange={(e) => setEditSpotify(e.target.value)}
                      className="w-full bg-romantic-bg dark:bg-black/20 border border-romantic-accent/10 rounded-2xl px-4 py-2 outline-none focus:border-romantic-accent text-xs dark:text-white"
                    />
                    <p className="text-[10px] text-romantic-muted italic">Pamiętaj, aby użyć linku typu "embed" (Udostępnij &rarr; Osadź utwór).</p>
                  </div>
                </div>
              </div>

              <div className="p-6 md:p-8 bg-gray-50 dark:bg-black/20 border-t border-romantic-accent/5">
                <button
                  onClick={handleSave}
                  className="w-full bg-romantic-accent text-white py-4 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  Zapisz ustawienia
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
