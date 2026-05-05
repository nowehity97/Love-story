/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Heart, LogOut } from 'lucide-react';
import Gate from './components/Gate';
import Counter from './components/Counter';
import RelationshipJourney from './components/RelationshipJourney';
import FloatingHearts from './components/FloatingHearts';
import BucketList from './components/BucketList';
import SongEmbed from './components/SongEmbed';
import Gallery from './components/Gallery';
import StoryHighlights from './components/StoryHighlights';
import GalleryFilters from './components/GalleryFilters';
import AddPhotoModal from './components/AddPhotoModal';
import Settings from './components/Settings';
import Toast, { ToastType } from './components/Toast';
import { Photo } from './types';

export default function App() {
  const [hasAccess, setHasAccess] = useState(() => {
    return localStorage.getItem('lovestory_access') === 'true';
  });
  
  const [startDate, setStartDate] = useState(() => {
    return localStorage.getItem('lovestory_start_date') || '';
  });

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [names, setNames] = useState({ HE: 'Imię 1', SHE: 'Imię 2' });
  const [profilePics, setProfilePics] = useState({ HE: '', SHE: '' });
  const [spotifyUrl, setSpotifyUrl] = useState('');
  const [relationshipStartDate, setRelationshipStartDate] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [background, setBackground] = useState({ type: 'theme', value: 'default' });
  const [savedSummary, setSavedSummary] = useState('');

  // Toast state
  const [toast, setToast] = useState<{ isVisible: boolean; message: string; type: ToastType }>({
    isVisible: false,
    message: '',
    type: 'success'
  });

  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ isVisible: true, message, type });
  };

  // Filter states
  const [filterYear, setFilterYear] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'event' | 'upload'>('event');

  const availableYears = Array.from(new Set<string>(
    photos
      .map(p => p.date ? p.date.split('-')[0] : null)
      .filter((y): y is string => !!y)
  ));

  const filteredPhotos = [...photos].sort((a, b) => {
    if (sortBy === 'event') {
      // Sort by user-set photo date
      const dateA = a.date || '';
      const dateB = b.date || '';
      
      if (dateA !== dateB) {
        return dateB.localeCompare(dateA); // Newest date first
      }
      return b.createdAt - a.createdAt; // Then by exact upload time as fallback
    } else {
      // Sort by upload date (createdAt)
      return b.createdAt - a.createdAt;
    }
  }).filter(photo => {
    const matchesSearch = (photo.caption || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!photo.date) return matchesSearch && !filterYear && !filterMonth;
    
    const [year, month] = photo.date.split('-');
    const matchesYear = !filterYear || year === filterYear;
    const matchesMonth = !filterMonth || month === filterMonth;
    
    return matchesSearch && matchesYear && matchesMonth;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const init = async () => {
      const settings = await fetchSettings();
      
      // If relationship starts date is NOT set in database, allow entry automatically
      if (settings && !settings.start_date) {
        setHasAccess(true);
        localStorage.setItem('lovestory_access', 'true');
      }

      if (hasAccess || (settings && !settings.start_date)) {
        fetchPhotos();
      } else {
        setIsLoading(false);
      }
    };
    init();
  }, [hasAccess]);

  const fetchPhotos = async () => {
    try {
      const response = await fetch('./api.php');
      const data = await response.json();
      setPhotos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch photos', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await fetch('./api.php?action=get_settings');
      const data = await response.json();
      if (data.names) setNames(data.names);
      if (data.profile_pics) setProfilePics(data.profile_pics);
      if (data.spotify_url) setSpotifyUrl(data.spotify_url);
      if (data.start_date) setRelationshipStartDate(data.start_date);
      if (data.dark_mode !== undefined) setIsDarkMode(data.dark_mode);
      if (data.background) setBackground(data.background);
      if (data.story_summary) setSavedSummary(data.story_summary);
      return data;
    } catch (error) {
      console.error('Failed to fetch settings', error);
      return null;
    }
  };

  const updateSettings = async (key: string, value: any) => {
    try {
      const response = await fetch('./api.php?action=update_settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value })
      });
      if (response.ok) {
        if (key === 'names') setNames(value);
        if (key === 'profile_pics') setProfilePics(value);
        if (key === 'spotify_url') setSpotifyUrl(value);
        if (key === 'dark_mode') setIsDarkMode(value);
        if (key === 'background') setBackground(value);
        if (key === 'story_summary') setSavedSummary(value);
        if (key === 'start_date') {
          setRelationshipStartDate(value);
          setStartDate(value);
        }
        showToast('Ustawienia zapisane pomyślnie!');
      }
    } catch (error) {
      console.error('Failed to update settings', error);
      showToast('Nie udało się zapisać ustawień.', 'error');
    }
  };

  useEffect(() => {
    if (hasAccess && relationshipStartDate) {
      const today = new Date();
      const start = new Date(relationshipStartDate);
      
      const isAnniversaryMonth = today.getMonth() === start.getMonth();
      const isAnniversaryDay = today.getDate() === start.getDate();
      
      if (isAnniversaryMonth && isAnniversaryDay) {
        const years = today.getFullYear() - start.getFullYear();
        if (years > 0) {
          setTimeout(() => {
            showToast(`✨ Wszystkiego najlepszego z okazji ${years}. rocznicy! ❤️`, 'success');
          }, 2000);
        } else if (years === 0) {
          // Monthly anniversary for the first year or just special day
          setTimeout(() => {
            showToast(`✨ Dziś mija kolejny miesiąc Razem! ❤️`, 'success');
          }, 2000);
        }
      }
    }
  }, [hasAccess, relationshipStartDate]);

  useEffect(() => {
    const style = getBackgroundStyle();
    if (style.backgroundImage) {
      document.body.style.backgroundImage = style.backgroundImage;
      document.body.style.backgroundSize = style.backgroundSize as string;
      document.body.style.backgroundPosition = style.backgroundPosition as string;
      document.body.style.backgroundAttachment = style.backgroundAttachment as string;
      document.body.style.backgroundRepeat = style.backgroundRepeat as string;
      document.body.style.backgroundColor = '';
    } else {
      document.body.style.backgroundImage = '';
      document.body.style.backgroundColor = style.backgroundColor as string;
    }
  }, [background, isDarkMode]);

  const getBackgroundStyle = () => {
    if (background.type === 'image') {
      return {
        backgroundImage: `url(${background.value})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        backgroundRepeat: 'no-repeat'
      } as React.CSSProperties;
    }

    const themeColors: Record<string, string> = {
      midnight: '#0f172a',
      sunset: '#fef3c7',
      lavender: '#f5f3ff',
      rosegold: '#fff1f2',
      default: isDarkMode ? '#121212' : '#fdfaf8'
    };

    const isDarkTheme = background.value === 'midnight' || (background.value === 'default' && isDarkMode);

    return {
      backgroundColor: themeColors[background.value] || themeColors.default,
      color: isDarkTheme ? '#f8fafc' : ''
    };
  };

  const handleAccess = (date: string) => {
    setHasAccess(true);
    setStartDate(date);
    localStorage.setItem('lovestory_access', 'true');
    localStorage.setItem('lovestory_start_date', date);
  };

  const logout = () => {
    setHasAccess(false);
    setStartDate('');
    localStorage.removeItem('lovestory_access');
    localStorage.removeItem('lovestory_start_date');
  };

  const addPhoto = async (file: File, caption: string, date: string) => {
    const formData = new FormData();
    formData.append('photo', file);
    formData.append('caption', caption);
    formData.append('date', date);

    try {
      const response = await fetch('./api.php', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Upload failed');
      const newPhoto = await response.json();
      setPhotos([newPhoto, ...photos]);
      showToast('Wspomnienie dodane pomyślnie!');
    } catch (error) {
      console.error('Failed to upload photo', error);
      showToast('Nie udało się zapisać zdjęcia.', 'error');
    }
  };

  const updatePhoto = async (id: string, caption: string, date: string) => {
    try {
      const response = await fetch(`./api.php?update=${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caption, date }),
      });
      if (!response.ok) throw new Error('Update failed');
      
      setPhotos(photos.map(p => p.id === id ? { ...p, caption, date } : p));
      showToast('Zmiany zapisane!');
    } catch (error) {
      console.error('Failed to update photo', error);
      showToast('Nie udało się zapisać zmian.', 'error');
    }
  };

  const deletePhoto = async (id: string) => {
    if (confirm('Usunąć to wspomnienie?')) {
      try {
        await fetch(`./api.php?delete=${id}`, { method: 'POST' });
        setPhotos(photos.filter(p => p.id !== id));
        showToast('Wspomnienie usunięte.');
      } catch (error) {
        console.error('Failed to delete photo', error);
        showToast('Nie udało się usunąć zdjęcia.', 'error');
      }
    }
  };

  if (!hasAccess) {
    return <Gate onAccess={handleAccess} names={names} />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-romantic-bg transition-colors duration-300">
        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }}>
          <Heart className="text-romantic-accent fill-romantic-accent w-12 h-12" />
        </motion.div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen selection:bg-romantic-accent/20 dark:text-romantic-dark-text transition-colors duration-300 text-romantic-text relative"
    >
      {/* Subtle overlay for better readability on custom backgrounds */}
      {background.type === 'image' && (
        <div className="fixed inset-0 -z-10 bg-black/60 dark:bg-black/70 backdrop-blur-[1px] pointer-events-none" />
      )}
      {!isDarkMode && background.type === 'theme' && (
        <div className="fixed inset-0 -z-10 bg-white/10 pointer-events-none" />
      )}
      
      <FloatingHearts />
      {/* Header */}
      <motion.header 
        whileHover={{ scale: 1.005 }}
        transition={{ duration: 0.3 }}
        className={`fixed top-0 left-0 right-0 z-40 backdrop-blur-md transition-colors ${background.type === 'image' ? 'bg-black/40 border-b border-white/10' : 'bg-romantic-bg/80 dark:bg-romantic-dark-bg/80'}`}
      >
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-20 flex justify-between items-center relative">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ 
                scale: [1, 1.12, 1],
                opacity: [0.9, 1, 0.9]
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 3, 
                ease: "easeInOut" 
              }}
            >
              <Heart className="text-romantic-accent fill-romantic-accent w-5 h-5 md:w-6 h-6 drop-shadow-[0_0_8px_rgba(236,72,153,0.3)]" />
            </motion.div>
            <h1 className={`text-xl md:text-2xl font-serif truncate max-w-[200px] md:max-w-none ${background.type === 'image' ? 'text-white drop-shadow-[0_2px_4px_rgba(0,0,0,1)]' : 'dark:text-white text-romantic-text'}`}>
              {names.HE} & {names.SHE}
            </h1>
          </div>
          <button 
            onClick={logout}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-romantic-muted"
            title="Wyloguj"
          >
            <LogOut className="w-5 h-5" />
          </button>

          {/* Gradient Bottom Border */}
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-romantic-accent/40 to-transparent" />
        </div>
      </motion.header>

      <main className="max-w-6xl mx-auto px-4 md:px-6 pt-24 md:pt-32 pb-24">
        {/* Intro */}
        <div className={`mb-16 md:mb-20 text-center p-8 md:p-12 rounded-[2.5rem] transition-all duration-500 ${background.type === 'image' ? 'bg-black/20 backdrop-blur-md border border-white/10 shadow-2xl' : ''}`}>
          <div className="flex justify-center items-center gap-4 md:gap-6 mb-8 md:mb-12">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-4 border-white dark:border-romantic-dark-card shadow-xl bg-romantic-accent/10"
            >
              {profilePics.HE ? (
                <img src={profilePics.HE} alt={names.HE} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-romantic-accent text-xl md:text-2xl font-bold font-serif">{names.HE[0]}</div>
              )}
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ 
                opacity: 1, 
                scale: [1, 1.1, 1],
              }}
              transition={{ 
                opacity: { duration: 0.3, delay: 0.2 },
                scale: { repeat: Infinity, duration: 2, ease: "easeInOut", delay: 0.5 }
              }}
              className="p-2 md:p-3 rounded-full bg-white dark:bg-romantic-dark-card shadow-md border border-romantic-accent/10 z-10"
            >
              <Heart className="text-romantic-accent fill-romantic-accent w-5 h-5 md:w-6 h-6" />
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-4 border-white dark:border-romantic-dark-card shadow-xl bg-romantic-accent/10"
            >
              {profilePics.SHE ? (
                <img src={profilePics.SHE} alt={names.SHE} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-romantic-accent text-xl md:text-2xl font-bold font-serif">{names.SHE[0]}</div>
              )}
            </motion.div>
          </div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            className={`text-4xl md:text-6xl font-serif mb-4 md:mb-6 leading-tight relative inline-block group ${background.type === 'image' ? 'text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.7)]' : 'text-romantic-text'}`}
          >
            Nasza Wspólna Opowieść
            <span className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-romantic-accent to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`text-base md:text-lg max-w-2xl mx-auto font-light px-2 leading-relaxed ${background.type === 'image' ? 'text-white drop-shadow-md' : 'text-romantic-muted'}`}
          >
            To miejsce na nasze najpiękniejsze chwile, wspólne podróże i codzienne radości. 
            Zatrzymane w kadrze wspomnienia, które tworzą naszą historię.
          </motion.p>
          
          <div className="max-w-md mx-auto mt-10 md:mt-12 px-4 text-left">
            <SongEmbed url={spotifyUrl} isImageBackground={background.type === 'image'} />
          </div>
        </div>

        {/* Counter Section */}
        <section className="mb-16 md:mb-24 bg-white dark:bg-romantic-dark-card rounded-[2rem] md:rounded-[3rem] shadow-sm border border-romantic-accent/5 p-6 md:p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-romantic-accent/5 rounded-full blur-3xl -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-romantic-accent/3 rounded-full blur-3xl -ml-32 -mb-32" />
          {startDate && (
            <>
              <Counter startDate={startDate} />
              <RelationshipJourney startDate={startDate} />
            </>
          )}
        </section>
        
        <StoryHighlights 
          photos={photos} 
          savedSummary={savedSummary} 
          onSaveSummary={(summary) => updateSettings('story_summary', summary)}
          names={names}
          backgroundType={background.type}
        />

        <BucketList isImageBackground={background.type === 'image'} />

        {/* Gallery Section */}
        <section>
          <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
            <div>
              <h2 className={`text-3xl font-serif mb-2 ${background.type === 'image' ? 'text-white drop-shadow-md' : 'text-romantic-text'}`}>Kolekcja Wspomnień</h2>
              <p className={background.type === 'image' ? 'text-white/80 drop-shadow-sm' : 'text-romantic-muted'}>Nasze życie w obiektywie</p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-romantic-accent text-white px-8 py-4 rounded-full font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all w-full md:w-auto justify-center"
            >
              <Plus className="w-5 h-5" />
              Dodaj zdjęcie
            </button>
          </div>

          <GalleryFilters 
            onYearChange={setFilterYear}
            onMonthChange={setFilterMonth}
            onSearchChange={setSearchQuery}
            onSortChange={setSortBy}
            selectedYear={filterYear}
            selectedMonth={filterMonth}
            searchQuery={searchQuery}
            sortBy={sortBy}
            availableYears={availableYears}
          />
          
          <Gallery 
            photos={filteredPhotos} 
            onDelete={deletePhoto} 
            onUpdate={updatePhoto}
            startDate={startDate}
          />
        </section>
      </main>

      {/* Floating Action Button for mobile */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-romantic-accent text-white rounded-full shadow-2xl flex items-center justify-center md:hidden z-40"
      >
        <Plus className="w-6 h-6" />
      </motion.button>

      {/* Footer */}
      <footer className={`py-12 text-center border-t transition-colors ${background.type === 'image' ? 'border-white/10' : 'border-romantic-accent/10'}`}>
        <p className={`text-sm font-light flex items-center justify-center gap-1 ${background.type === 'image' ? 'text-white/80 drop-shadow-sm' : 'text-romantic-muted'}`}>
          Stworzone z 
          <motion.span
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            className="inline-block"
          >
            <Heart className="w-4 h-4 text-romantic-accent fill-romantic-accent" />
          </motion.span>
          dla {names.SHE} i {names.HE} • {relationshipStartDate ? relationshipStartDate.split('-')[0] : '2014'} - {new Date().getFullYear()}
        </p>
      </footer>

      <Settings 
        names={names} 
        profilePics={profilePics} 
        startDate={relationshipStartDate}
        spotifyUrl={spotifyUrl}
        darkMode={isDarkMode}
        background={background}
        onUpdate={updateSettings} 
      />

      <Toast 
        isVisible={toast.isVisible} 
        message={toast.message} 
        type={toast.type} 
        onClose={() => setToast({ ...toast, isVisible: false })} 
      />

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <AddPhotoModal 
            onClose={() => setIsModalOpen(false)} 
            onAdd={addPhoto} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

