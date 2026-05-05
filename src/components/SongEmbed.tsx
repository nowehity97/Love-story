/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Music } from 'lucide-react';

interface SongEmbedProps {
  url?: string;
  isImageBackground?: boolean;
}

export default function SongEmbed({ url, isImageBackground }: SongEmbedProps) {
  // Przykładowy link do romantycznej playlisty/utworu na Spotify
  const defaultUrl = "https://open.spotify.com/embed/track/5In96eE0i714iU8N7a80S0?utm_source=generator";
  const getEmbedUrl = (url: string) => {
    if (!url) return defaultUrl;
    if (url.includes('/embed/')) return url;
    
    // Try to convert standard share links
    try {
      const match = url.match(/spotify\.com\/(track|album|playlist|artist)\/([a-zA-Z0-9]+)/);
      if (match) {
        return `https://open.spotify.com/embed/${match[1]}/${match[2]}?utm_source=generator`;
      }
    } catch (e) {
      console.error('Invalid Spotify URL');
    }
    return url;
  };

  const spotifyUrl = getEmbedUrl(url || '');

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      <div className={`flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-widest ${isImageBackground ? 'text-white drop-shadow-md' : 'text-romantic-muted'}`}>
        <Music className="w-4 h-4 text-romantic-accent" />
        Nasza Ścieżka Dźwiękowa
      </div>
      <div className="rounded-[1.5rem] md:rounded-[2rem] overflow-hidden shadow-lg border border-romantic-accent/5 bg-white dark:bg-black/20">
        <iframe 
          style={{ borderRadius: '0' }} 
          src={spotifyUrl} 
          width="100%" 
          height="152" 
          frameBorder="0" 
          allowFullScreen={false} 
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
          loading="lazy"
        />
      </div>
    </motion.div>
  );
}
