import { useMusic } from '../context/MusicContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Music2 } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';

const LyricsView = () => {
    const { currentSong, lyrics, lyricsLoading, currentTime: contextTime, audioRef, isPlaying } = useMusic();
    const [localTime, setLocalTime] = useState(0);
    const rafRef = useRef();

    // Smooth Progress Loop for Lyrics
    useEffect(() => {
        const loop = () => {
            if (audioRef?.current && !audioRef.current.paused) {
                setLocalTime(audioRef.current.currentTime);
            }
            rafRef.current = requestAnimationFrame(loop);
        };
        
        if (isPlaying) {
            loop();
        } else {
             // If paused, sync once
            if (audioRef?.current) setLocalTime(audioRef.current.currentTime);
        }
        
        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [audioRef, isPlaying]);

    // Sync when context updates (seek)
    useEffect(() => {
        setLocalTime(contextTime);
    }, [contextTime]);

    if (lyricsLoading) {
        return (
            <div className="h-full flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-12 h-12 text-cyan-400 animate-spin" />
                <p className="text-zinc-500 font-bold animate-pulse">Fetching Lyrics...</p>
            </div>
        );
    }

    if (!lyrics) {
        return (
            <div className="h-full flex flex-col items-center justify-center space-y-6 text-center px-8">
                <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center text-zinc-700">
                    <Music2 size={40} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-white mb-2">No lyrics available</h2>
                    <p className="text-zinc-500 max-w-xs">{currentSong ? `We couldn't find lyrics for "${currentSong.name}"` : "Play a song to see lyrics"}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto no-scrollbar py-12 px-6">
            <div className="max-w-xl mx-auto space-y-12">
                {lyrics.map((line, index) => {
                    const isActive = localTime >= line.time && 
                                   (index === lyrics.length - 1 || localTime < lyrics[index + 1].time);
                    
                    return (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0.2, y: 20 }}
                            animate={{ 
                                opacity: isActive ? 1 : 0.3,
                                scale: isActive ? 1.1 : 1,
                                y: 0
                            }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className={`text-3xl md:text-5xl font-bold transition-all duration-500 cursor-default ${
                                isActive ? 'text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]' : 'text-zinc-400'
                            }`}
                        >
                            {line.text}
                        </motion.div>
                    );
                })}
                <div className="h-32" /> {/* Bottom spacing */}
            </div>
        </div>
    );
};

export default LyricsView;
