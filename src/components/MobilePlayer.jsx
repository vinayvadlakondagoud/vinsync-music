import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Heart, MoreHorizontal, Repeat, Shuffle, SkipBack, SkipForward, Play, Pause, ListMusic, Mic2, Activity } from 'lucide-react';
import { useMusic } from '../context/MusicContext';
import { useRef, useState, useEffect } from 'react';
import LyricsView from './LyricsView';
import Visualizer from './Visualizer'; // Added

const MobilePlayer = () => {
    // ... existing hook calls ...
    const { 
        currentSong, 
        isPlaying, 
        togglePlay, 
        handleNext, 
        handlePrev, 
        currentTime: contextTime, 
        duration, 
        seek,
        volume,
        setVolume,
        isMobilePlayerOpen,
        setIsMobilePlayerOpen,
        likedSongs,
        toggleLike,
        togglePlaylist,
        showVisualizer,
        toggleVisualizer,
        audioRef,
        shuffleEnabled,
        toggleShuffle,
        repeatMode,
        cycleRepeatMode,
    } = useMusic();

    const [dragValue, setDragValue] = useState(null);
    const [localTime, setLocalTime] = useState(0);
    const [showLyrics, setShowLyrics] = useState(false);
    const rafRef = useRef();

    // Smooth Progress Loop
    useEffect(() => {
        const loop = () => {
            if (audioRef?.current && !audioRef.current.paused) {
                setLocalTime(audioRef.current.currentTime);
            }
            rafRef.current = requestAnimationFrame(loop);
        };
        
        loop();
        
        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [audioRef, isPlaying]);

    // Sync with context time (seek/pause updates)
    useEffect(() => {
        setLocalTime(contextTime);
    }, [contextTime]);

    // Handle Swipe to Close
    const handleDragEnd = (_, info) => {
        if (info.offset.y > 100 || info.velocity.y > 500) {
            setIsMobilePlayerOpen(false);
        }
    };

    // Seek Handlers
    const handleSeekChange = (e) => {
        setDragValue(Number(e.target.value));
        setLocalTime(Number(e.target.value));
    };

    const handleSeekEnd = (e) => {
        const newValue = Number(e.target.value);
        seek(newValue);
        setDragValue(null);
        setLocalTime(newValue);
    };

    const formatTime = (time) => {
        if (!time || isNaN(time)) return "0:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    if (!currentSong) return null;

    const isLiked = likedSongs.includes(currentSong.id);
    const displayValue = dragValue !== null ? dragValue : localTime;

    return (
        <AnimatePresence>
            {isMobilePlayerOpen && (
                <motion.div
                    drag="y"
                    dragConstraints={{ top: 0, bottom: 0 }}
                    dragElastic={{ top: 0.1, bottom: 0.5 }}
                    onDragEnd={handleDragEnd}
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    transition={{ type: "spring", stiffness: 200, damping: 25, mass: 0.8 }}
                    className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-xl flex flex-col md:hidden touch-none"
                >
                    {/* Background Gradient & Visualizer */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                         <img src={currentSong.image} className="w-full h-full object-cover opacity-10 blur-3xl scale-150" alt="" />
                         <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black" />
                         
                         {/* Integrated Visualizer */}
                         {showVisualizer && (
                             <div className="absolute bottom-0 left-0 right-0 h-64 opacity-30 mask-linear-gradient">
                                 <Visualizer height={250} barColor="rgba(255,255,255,0.2)" />
                             </div>
                         )}
                    </div>

                    {/* Drag Handle */}
                    <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mt-3 relative z-20" />

                    {/* Header */}
                    <div className="flex items-center justify-between px-6 pt-8 pb-4 relative z-10">
                        <button 
                            onClick={() => setIsMobilePlayerOpen(false)}
                            className="p-2 -ml-2 text-white/70 hover:text-white transition-colors"
                        >
                            <ChevronDown size={28} />
                        </button>
                        <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/40">Now Playing</span>
                        <div className="flex gap-1 -mr-2">
                             <button
                                onClick={toggleVisualizer}
                                className={`p-2 transition-colors ${showVisualizer ? 'text-cyan-400' : 'text-white/70 hover:text-white'}`}
                                title="Toggle Visualizer"
                            >
                                <Activity size={24} />
                            </button>
                            <button 
                                onClick={() => setShowLyrics(!showLyrics)}
                                className={`p-2 transition-colors ${showLyrics ? 'text-cyan-400' : 'text-white/70 hover:text-white'}`}
                            >
                                <Mic2 size={24} />
                            </button>
                        </div>
                    </div>

                    {/* Main Content - Spotify Layout */}
                    <div className="flex-1 flex flex-col px-6 relative z-10 min-h-0">
                        
                        {/* Album Art - Flexible & Centered */}
                        <div className="flex-1 flex items-center justify-center py-4 min-h-0">
                            <AnimatePresence mode="wait">
                                {!showLyrics ? (
                                    <motion.div 
                                        key="artwork"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className="w-full h-full flex items-center justify-center"
                                    >
                                        <div className="aspect-square w-auto h-auto max-w-full max-h-full rounded-[1.5rem] overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.6)] bg-black">
                                            <img src={currentSong.image} alt={currentSong.name} className="w-full h-full object-cover" />
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div 
                                        key="lyrics"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 20 }}
                                        className="w-full h-full overflow-hidden"
                                    >
                                        <LyricsView />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Song Info & Controls - Bottom Section */}
                        <div className="flex-shrink-0 space-y-6 pb-8">
                            
                            {/* Song Title & Like */}
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <h1 className="text-[22px] font-bold text-white truncate">{currentSong.name}</h1>
                                    <p className="text-[15px] text-white/60 truncate mt-1">{currentSong.artist}</p>
                                </div>
                                <button 
                                    onClick={() => toggleLike(currentSong.id)}
                                    className={`p-2 transition-transform active:scale-75 ${isLiked ? 'text-cyan-400' : 'text-white/40'}`}
                                >
                                    <Heart size={24} fill={isLiked ? "currentColor" : "none"} />
                                </button>
                            </div>

                            {/* Progress Bar */}
                            <div className="space-y-2">
                                <div className="relative h-2 w-full flex items-center group">
                                    <input 
                                        type="range"
                                        min="0"
                                        max={duration || 100}
                                        value={displayValue}
                                        onChange={handleSeekChange}
                                        onMouseUp={handleSeekEnd}
                                        onTouchEnd={handleSeekEnd}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                                    />
                                    {/* Track Background */}
                                    <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
                                        {/* Filled Track */}
                                        <div 
                                            className="h-full bg-white rounded-full group-hover:bg-cyan-400 transition-colors"
                                            style={{ width: `${(displayValue / (duration || 1)) * 100}%` }}
                                        />
                                    </div>
                                    {/* Thumb Indicator - Visible on hover/active or usually small dot */}
                                    <div 
                                        className="absolute w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10"
                                        style={{ left: `${(displayValue / (duration || 1)) * 100}%`, transform: 'translateX(-50%)' }}
                                    />
                                </div>
                                
                                <div className="flex justify-between text-[11px] text-white/40 font-mono">
                                    <span>{formatTime(displayValue)}</span>
                                    <span>{formatTime(duration)}</span>
                                </div>
                            </div>

                            {/* Playback Controls */}
                            <div className="flex items-center justify-between px-2">
                                <button 
                                    onClick={toggleShuffle}
                                    className={`active:scale-90 transition-transform ${shuffleEnabled ? 'text-cyan-400' : 'text-white/40'}`}
                                >
                                    <Shuffle size={22} />
                                </button>
                                
                                <button onClick={handlePrev} className="text-white active:scale-90 transition-transform">
                                    <SkipBack size={32} fill="currentColor" />
                                </button>
                                
                                <button 
                                    onClick={togglePlay}
                                    className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-lg active:scale-95 transition-transform"
                                >
                                    {isPlaying ? (
                                        <Pause size={28} fill="black" stroke="black" />
                                    ) : (
                                        <Play size={28} fill="black" stroke="black" className="ml-1" />
                                    )}
                                </button>
                                
                                <button onClick={handleNext} className="text-white active:scale-90 transition-transform">
                                    <SkipForward size={32} fill="currentColor" />
                                </button>

                                <button 
                                    onClick={cycleRepeatMode}
                                    className={`active:scale-90 transition-transform relative ${repeatMode !== 'off' ? 'text-cyan-400' : 'text-white/40'}`}
                                >
                                    <Repeat size={22} />
                                    {repeatMode === 'one' && <span className="absolute -top-1 -right-1 text-[8px] font-black">1</span>}
                                </button>
                            </div>

                            {/* Volume Control */}
                            <div className="flex items-center gap-3 px-2">
                                <span className="text-white/40 text-sm">🔊</span>
                                <input 
                                    type="range" 
                                    min="0" 
                                    max="1" 
                                    step="0.01" 
                                    value={volume}
                                    onChange={(e) => setVolume(Number(e.target.value))}
                                    className="flex-1 h-1 accent-white bg-white/10 rounded-full cursor-pointer"
                                    style={{
                                        background: `linear-gradient(to right, white 0%, white ${volume * 100}%, rgb(255 255 255 / 0.1) ${volume * 100}%, rgb(255 255 255 / 0.1) 100%)`
                                    }}
                                />
                            </div>

                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default MobilePlayer;
