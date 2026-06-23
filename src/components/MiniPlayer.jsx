import { motion } from 'framer-motion';
import { Play, Pause, SkipForward, X } from 'lucide-react';
import { useMusic } from '../context/MusicContext';
import { useState, useEffect, useRef } from 'react';

const MiniPlayer = () => {
  const {
    currentSong, isPlaying, togglePlay, handleNext,
    isMobilePlayerOpen
  } = useMusic();

  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 16, y: 80 });
  const [isDragging, setIsDragging] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      if (scrollY > 200 && lastScrollY.current <= 200 && !isMobilePlayerOpen) {
        setIsVisible(true);
      } else if (scrollY <= 200) {
        setIsVisible(false);
      }
      lastScrollY.current = scrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMobilePlayerOpen]);

  if (!currentSong || !isVisible || isMobilePlayerOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0, x: isDragging ? position.x : 16 }}
      exit={{ opacity: 0, scale: 0.8, y: 20 }}
      drag
      dragMomentum={false}
      onDragStart={() => setIsDragging(true)}
      onDrag={(_, info) => {
        setPosition(p => ({ x: p.x + info.delta.x, y: p.y + info.delta.y }));
      }}
      onDragEnd={() => setIsDragging(false)}
      className="fixed bottom-24 right-4 z-50 flex items-center gap-3 bg-black/80 backdrop-blur-2xl border border-white/10 rounded-2xl p-3 pr-4 shadow-2xl cursor-grab active:cursor-grabbing select-none"
      style={{ touchAction: 'none' }}
    >
      <div className="relative flex-shrink-0">
        <img
          src={currentSong.image}
          alt=""
          className="w-10 h-10 rounded-xl object-cover"
        />
        <div className="absolute inset-0 rounded-xl ring-1 ring-white/10" />
      </div>
      <div className="min-w-0 max-w-[120px]">
        <p className="text-xs font-bold text-white truncate">{currentSong.name}</p>
        <p className="text-[10px] text-zinc-400 truncate">{currentSong.artist}</p>
      </div>
      <button onClick={togglePlay} className="p-1.5 text-white hover:bg-white/10 rounded-lg transition-colors">
        {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
      </button>
      <button onClick={handleNext} className="p-1.5 text-zinc-400 hover:text-white transition-colors">
        <SkipForward size={14} />
      </button>
      <button onClick={() => setIsVisible(false)} className="p-1 text-zinc-500 hover:text-white transition-colors">
        <X size={12} />
      </button>
    </motion.div>
  );
};

export default MiniPlayer;
