import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Heart, RefreshCw, MessageCircleHeart } from 'lucide-react';
import { Photo } from '../types';

interface StoryHighlightsProps {
  photos: Photo[];
  onSaveSummary: (summary: string) => void;
  savedSummary?: string;
  names: { HE: string; SHE: string };
  backgroundType: 'theme' | 'image';
}

export default function StoryHighlights({ photos, onSaveSummary, savedSummary, names, backgroundType }: StoryHighlightsProps) {
  const [summary, setSummary] = useState(savedSummary || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (savedSummary) setSummary(savedSummary);
  }, [savedSummary]);

  const generateSummary = async () => {
    if (photos.length === 0) {
      setError('Dodaj najpierw kilka wspomnień, aby AI mogło stworzyć Waszą historię.');
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      const memoriesList = photos
        .filter(p => p.caption)
        .map(p => `- ${p.date || 'Nieznana data'}: ${p.caption}`)
        .join('\n');

      const prompt = `Jesteś romantycznym i czułym kronikarzem miłości. Twoim zadaniem jest stworzenie wzruszającego, osobistego podsumowania historii miłosnej pary: ${names.HE} i ${names.SHE}.
      
      Poniżej znajduje się lista ich wspólnych wspomnień (daty i opisy):
      ${memoriesList}
      
      Na podstawie tych chwil napisz przepiękną, spójną opowieść (3-4 akapity). 
      - Skup się na emocjach, które płyną z tych opisów.
      - Podkreśl, jak ich relacja ewoluowała.
      - Używaj ciepłego, poetyckiego (ale nie kiczowatego) języka polskiego.
      - Nie wymieniaj suchych faktów po kolei, ale stwórz z nich żywą narrację.
      - Zakończ czymś inspirującym o ich wspólnej przyszłości.
      
      Pisz bezpośrednio o nich (${names.HE} i ${names.SHE}), jakbyś opowiadał światu o najpiękniejszej historii, jaką widziałeś.`;

      const response = await fetch('/api.php?action=generate_story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Generowanie nie powiodło się');
      }

      const data = await response.json();
      if (data.text) {
        setSummary(data.text);
        onSaveSummary(data.text);
      } else {
        throw new Error('Pusta odpowiedź od AI');
      }
    } catch (err: any) {
      console.error('Generation error:', err);
      setError(err.message || 'Wystąpił problem przy tworzeniu Waszej historii. Sprawdź konfigurację API Gemini.');
    } finally {
      setIsGenerating(false);
    }
  };

  const isDark = backgroundType === 'image';

  return (
    <section className="mb-16 md:mb-24">
      <div className={`p-8 md:p-12 rounded-[2.5rem] transition-all duration-500 overflow-hidden relative ${isDark ? 'bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl' : 'bg-white/50 backdrop-blur-md border border-romantic-accent/5'}`}>
        
        {/* Background Decorative Elements */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-romantic-accent/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-romantic-accent/5 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-romantic-accent/20 rounded-2xl shadow-inner">
                <Sparkles className="w-6 h-6 text-romantic-accent" />
              </div>
              <div>
                <h2 className={`text-2xl md:text-3xl font-serif ${isDark ? 'text-white drop-shadow-md' : 'text-romantic-text'}`}>
                  Nasze Najważniejsze Chwile
                </h2>
                <p className={`text-sm font-light mt-1 ${isDark ? 'text-white/80 drop-shadow-sm' : 'text-romantic-muted'}`}>
                  Podsumowanie Waszej wspólnej drogi stworzone przez AI
                </p>
              </div>
            </div>
            
            <button
              onClick={generateSummary}
              disabled={isGenerating}
              className={`flex items-center justify-center gap-2 px-6 py-3 rounded-full font-medium transition-all ${isGenerating ? 'bg-romantic-accent/50 cursor-not-allowed' : 'bg-romantic-accent hover:bg-romantic-accent/90 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95'} text-white`}
            >
              {isGenerating ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <MessageCircleHeart className="w-5 h-5" />
              )}
              {summary ? 'Odśwież historię' : 'Stwórz naszą opowieść'}
            </button>
          </div>

          <AnimatePresence mode="wait">
            {isGenerating ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-12 flex flex-col items-center justify-center text-center space-y-4"
              >
                <div className="flex gap-2">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                      transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.2 }}
                      className="w-3 h-3 bg-romantic-accent rounded-full"
                    />
                  ))}
                </div>
                <p className={`text-sm italic ${isDark ? 'text-white/60' : 'text-romantic-muted'}`}>
                  Układam Wasze wspomnienia w piękne słowa...
                </p>
              </motion.div>
            ) : error ? (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="py-8 text-center"
              >
                <p className="text-red-500 font-medium">{error}</p>
              </motion.div>
            ) : summary ? (
              <motion.div
                key="summary"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="relative"
              >
                <div className={`prose prose-romantic max-w-none ${isDark ? 'text-white/90' : 'text-romantic-text'} leading-relaxed space-y-6 font-light`}>
                  {summary.split('\n\n').map((paragraph, idx) => (
                    <p key={idx} className="text-lg md:text-xl italic font-serif opacity-90 first-letter:text-3xl first-letter:font-bold first-letter:mr-1 first-letter:float-left">
                      {paragraph}
                    </p>
                  ))}
                </div>
                
                <div className="mt-8 pt-8 border-t border-romantic-accent/10 flex justify-center">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 3 }}
                  >
                    <Heart className="w-6 h-6 text-romantic-accent fill-romantic-accent opacity-30" />
                  </motion.div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`py-12 text-center rounded-3xl border-2 border-dashed ${isDark ? 'border-white/10 text-white/40' : 'border-romantic-accent/10 text-romantic-muted'}`}
              >
                <p className="font-light">
                  Kliknij przycisk powyżej, aby zobaczyć magię AI analizującą Wasze wspólne chwile.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
