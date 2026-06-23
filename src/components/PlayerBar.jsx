import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Repeat, Shuffle, ListMusic, Heart, Sliders, Gauge, Maximize2 } from 'lucide-react';
import { useMusic } from '../context/MusicContext';
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const PlayerBar = ({ setCurrentView }) => {
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
        togglePlaylist,
        openEqualizer,
        openVolumeSuite,
        likedSongs,
        toggleLike,
        toggleRightSidebar,
        setIsMobilePlayerOpen,
        playbackSpeed,
        setPlaybackSpeed,
        audioRef,
        toggleMute,
        shuffleEnabled,
        toggleShuffle,
        repeatMode,
        cycleRepeatMode,
    } = useMusic();

    const [dragValue, setDragValue] = useState(null);
    const [localTime, setLocalTime] = useState(0);
    const rafRef = useRef();

    const isLiked = currentSong ? likedSongs.some(id => String(id) === String(currentSong.id)) : false;

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

    useEffect(() => {
        setLocalTime(contextTime);
    }, [contextTime]);

    const handleSeekChange = (e) => {
        setDragValue(Number(e.target.value));
        setLocalTime(Number(e.target.value));
    };

    const handleSeekEnd = (e) => {
        const val = Number(e.target.value);
        seek(val);
        setDragValue(null);
        setLocalTime(val);
    };
    
    const handlePlayerClick = () => {
        if (window.innerWidth < 768) {
            setIsMobilePlayerOpen(true);
        } else {
            toggleRightSidebar();
        }
    };

    const handleDragEnd = (_, info) => {
        if (window.innerWidth >= 768) return;
        if (info.offset.x > 50) {
            handlePrev();
        } else if (info.offset.x < -50) {
            handleNext();
        }
    };

    const formatTime = (time) => {
        if (!time || isNaN(time)) return "0:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    if (!currentSong) return null;

    const displayTime = dragValue !== null ? dragValue : localTime;
    const progressPercent = (displayTime / (duration || 1)) * 100;

    return (
        <motion.div 
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            className="h-16 md:h-20 glass-strong text-white flex items-center justify-between px-4 md:px-6 shadow-2xl shadow-black/50 overflow-hidden relative group touch-none rounded-2xl md:rounded-[2rem]"
            style={{ borderColor: 'var(--glass-border)' }}
        >
            {/* Animated Gradient Border */}
            <div className="absolute inset-0 rounded-2xl md:rounded-[2rem] overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent opacity-30" />
            </div>
            
            {/* Ambient Glow */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-48 h-8 rounded-full blur-2xl opacity-20" style={{ backgroundColor: 'var(--accent)' }} />

            {/* Left: Song Info */}
            <div 
                className="flex items-center gap-3 md:gap-4 flex-1 md:w-[30%] min-w-0 cursor-pointer hover:bg-white/5 p-1 md:p-2 rounded-xl transition-colors"
                onClick={handlePlayerClick}
            >
                <div className="relative group flex-shrink-0">
                    <img 
                        src={currentSong.image} 
                        alt="Cover" 
                        className={`w-10 h-10 md:w-12 md:h-12 rounded-full shadow-lg object-contain bg-zinc-900 transition-transform duration-700 ${isPlaying ? 'animate-[spin_10s_linear_infinite]' : ''}`} 
                        style={{ animationPlayState: isPlaying ? 'running' : 'paused' }}
                    />
                    <button
                        onClick={(e) => { e.stopPropagation(); setCurrentView('nowplaying'); }}
                        className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Open Now Playing"
                    >
                        <Maximize2 size={14} className="text-white" />
                    </button>
                    <div className="absolute inset-0 rounded-full shadow-[inset_0_0_10px_rgba(255,255,255,0.1)] pointer-events-none" />
                </div>
                <div className="flex flex-col justify-center overflow-hidden mr-2">
                    <h4 className="font-bold text-[13px] md:text-sm tracking-wide hover:text-white cursor-pointer truncate">{currentSong.name}</h4>
                    <span className="text-[11px] md:text-xs text-zinc-400 hover:text-white cursor-pointer truncate">{currentSong.artist}</span>
                </div>
                <button 
                    onClick={(e) => { e.stopPropagation(); toggleLike(currentSong.id); }}
                    className={`ml-1 md:ml-4 transition-transform active:scale-90 flex-shrink-0 ${isLiked ? '' : 'text-zinc-500 hover:text-white'}`}
                    style={{ color: isLiked ? 'var(--theme-color)' : '' }}
                >
                    <Heart size={18} md:size={20} fill={isLiked ? "currentColor" : "none"} />
                </button>
            </div>

            {/* Center: Controls (Desktop) */}
            <div className="hidden md:flex flex-col items-center w-[40%] max-w-[500px] gap-1">
                <div className="flex items-center gap-6">
                    <button 
                        onClick={toggleShuffle}
                        className={`transition-colors hover:scale-110 ${shuffleEnabled ? 'text-cyan-400' : 'text-zinc-400 hover:text-white'}`}
                    >
                        <Shuffle size={18} />
                    </button>
                    <button onClick={handlePrev} className="text-zinc-300 hover:text-white transition-colors hover:scale-110"><SkipBack size={22} fill="currentColor" /></button>
                    <button 
                        onClick={togglePlay} 
                        className="bg-white text-black rounded-full p-2 hover:scale-105 transition-all shadow-lg hover:shadow-white/20 active:scale-95"
                    >
                        {isPlaying ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" className="ml-0.5" />}
                    </button>
                    <button onClick={handleNext} className="text-zinc-300 hover:text-white transition-colors hover:scale-110"><SkipForward size={22} fill="currentColor" /></button>
                    <button 
                        onClick={cycleRepeatMode}
                        className={`transition-colors hover:scale-110 ${repeatMode !== 'off' ? 'text-cyan-400' : 'text-zinc-400 hover:text-white'}`}
                        title={repeatMode === 'one' ? 'Repeat One' : repeatMode === 'all' ? 'Repeat All' : 'No Repeat'}
                    >
                        <Repeat size={18} className={repeatMode === 'one' ? 'relative' : ''} />
                        {repeatMode === 'one' && <span className="absolute text-[8px] font-black">1</span>}
                    </button>
                </div>
                
                <div className="flex items-center w-full gap-3 text-[10px] text-zinc-400 font-mono font-medium">
                    <span className="min-w-[30px] text-right">{formatTime(displayTime)}</span>
                    <div className="relative w-full h-1 group flex items-center">
                        <input 
                            type="range" 
                            min="0" 
                            max={duration || 100}
                            value={displayTime}
                            onChange={handleSeekChange}
                            onMouseUp={handleSeekEnd}
                            onTouchEnd={handleSeekEnd}
                            className="absolute z-10 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
                             <div 
                                className="h-full rounded-full transition-all duration-100 ease-linear" 
                                style={{ 
                                    width: `${progressPercent}%`,
                                    backgroundColor: 'var(--theme-color)' 
                                }}
                             />
                        </div>
                    </div>
                    <span className="min-w-[30px]">{formatTime(duration)}</span>
                </div>
            </div>

            {/* Right: Volume & Extras (Desktop) */}
            <div className="hidden md:flex items-center justify-end w-[30%] gap-4">
                <button 
                    onClick={() => {
                        const speeds = [0.5, 1.0, 1.5, 2.0];
                        const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
                        setPlaybackSpeed(speeds[nextIdx]);
                    }}
                    className="text-[10px] font-bold bg-white/10 hover:bg-white/20 px-2 py-1 rounded-md text-zinc-300 hover:text-white transition-colors min-w-[40px]"
                >
                    {playbackSpeed}x
                </button>
                <button 
                    onClick={openEqualizer}
                    className="text-zinc-400 hover:text-white transition-colors hover:scale-110"
                    title="10-Band Equalizer"
                >
                    <Sliders size={18} />
                </button>
                <button 
                    onClick={openVolumeSuite}
                    className="text-zinc-400 hover:text-white transition-colors hover:scale-110"
                    title="Volume Suite"
                >
                    <Gauge size={18} />
                </button>
                <button onClick={togglePlaylist} className="text-zinc-400 hover:text-white transition-colors"><ListMusic size={20} /></button>
                <div className="flex items-center gap-2 w-28 group">
                    <button onClick={toggleMute} className="text-zinc-400 hover:text-white">
                        {volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                    </button>
                    <div className="h-1 bg-white/10 rounded-full w-full relative overflow-hidden">
                        <input 
                            type="range" 
                            min="0" max="1" step="0.01" 
                            value={volume}
                            onChange={(e) => setVolume(Number(e.target.value))}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div 
                            className="h-full bg-zinc-400 group-hover:bg-white rounded-full transition-colors"
                            style={{ width: `${volume * 100}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Mobile Play Button */}
            <div className="flex items-center md:hidden">
                <button 
                    onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                    className="p-2 text-white active:scale-90 transition-transform"
                >
                    {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
                </button>
            </div>
        </motion.div>
    );
};

export default PlayerBar;
