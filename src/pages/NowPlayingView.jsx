import { useState, useEffect, useRef } from 'react';
import { useMusic } from '../context/MusicContext';
import { motion } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, Heart, Shuffle, Repeat, Repeat1, Volume2, ListMusic, Radio, Activity, Sliders, Gauge, ArrowLeft } from 'lucide-react';
import Visualizer from '../components/Visualizer';
import LyricsView from '../components/LyricsView';
import SongRadio from '../components/SongRadio';

const formatTime = (s) => {
    if (!Number.isFinite(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
};

const NowPlayingView = ({ setCurrentView, setSelectedArtist }) => {
    const {
        currentSong, isPlaying, togglePlay, handleNext, handlePrev,
        currentTime, duration, seek, volume, setVolume,
        likedSongs, toggleLike,
        openEqualizer, openVolumeSuite,
        toggleRightSidebar, isRightSidebarOpen,
        shuffleEnabled, toggleShuffle,
        repeatMode, cycleRepeatMode,
        lyricsLoading,
        analyser,
    } = useMusic();

    const [localTime, setLocalTime] = useState(0);
    const [dragValue, setDragValue] = useState(null);
    const [activeTab, setActiveTab] = useState('playing');
    const [isRotating, setIsRotating] = useState(false);
    const rafRef = useRef();
    const audioRef = useRef(null);
    const progressRef = useRef(null);

    const isLiked = currentSong ? likedSongs.some(id => String(id) === String(currentSong.id)) : false;

    useEffect(() => {
        audioRef.current = document.querySelector('audio');
        const loop = () => {
            if (audioRef?.current && !audioRef.current.paused) {
                setLocalTime(audioRef.current.currentTime);
            }
            rafRef.current = requestAnimationFrame(loop);
        };
        loop();
        return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
    }, [isPlaying]);

    useEffect(() => { setLocalTime(currentTime); }, [currentTime]);

    useEffect(() => { setIsRotating(isPlaying); }, [isPlaying]);

    const displayTime = dragValue !== null ? dragValue : localTime;
    const progress = duration > 0 ? (displayTime / duration) * 100 : 0;

    const handleProgressClick = (e) => {
        const rect = progressRef.current?.getBoundingClientRect();
        if (!rect) return;
        const x = (e.clientX - rect.left) / rect.width;
        const newTime = x * duration;
        seek(newTime);
        setLocalTime(newTime);
    };

    const handleProgressDrag = (e) => {
        const rect = progressRef.current?.getBoundingClientRect();
        if (!rect) return;
        const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        setDragValue(x * duration);
    };

    const handleDragEnd = () => {
        if (dragValue !== null) {
            seek(dragValue);
            setLocalTime(dragValue);
            setDragValue(null);
        }
    };

    if (!currentSong) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <p className="text-zinc-500 text-lg">No track playing</p>
            </div>
        );
    }

    const RepeatIcon = repeatMode === 'one' ? Repeat1 : Repeat;

    return (
        <div className="relative flex-1 flex flex-col h-full overflow-hidden">
            {/* Background: blurred album art */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <img src={currentSong.image} alt="" className="w-full h-full object-cover blur-3xl opacity-30 scale-110" />
                <div className="absolute inset-0 bg-black/40" />
            </div>

            {/* Header */}
            <div className="relative z-10 flex items-center gap-3 p-4">
                <button
                    onClick={() => setCurrentView('home')}
                    className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>
                <span className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Now Playing</span>
            </div>

            {/* Content */}
            <div className="relative z-10 flex-1 flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-10 px-4 pb-4 overflow-y-auto no-scrollbar">
                {/* Left: Album Art + Visualizer */}
                <div className="flex flex-col items-center gap-4 w-full max-w-sm lg:max-w-md">
                    <motion.div
                        animate={{ rotate: isRotating ? 360 : 0 }}
                        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                        className="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 lg:w-72 lg:h-72 rounded-full overflow-hidden shadow-2xl border-4 border-white/10 flex-shrink-0"
                    >
                        <img
                            src={currentSong.image}
                            alt={currentSong.name}
                            className="w-full h-full object-cover"
                        />
                    </motion.div>

                    <div className="w-full max-w-xs">
                        <Visualizer height={60} />
                    </div>
                </div>

                {/* Right: Info + Controls + Tabs */}
                <div className="w-full max-w-lg flex flex-col gap-4">
                    {/* Song Info */}
                    <div className="text-center lg:text-left">
                        <h1 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight truncate">
                            {currentSong.name}
                        </h1>
                        <button
                            onClick={() => { setSelectedArtist(currentSong.artist); setCurrentView('artist'); }}
                            className="text-base md:text-lg text-zinc-400 hover:text-cyan-400 truncate mt-1 transition-colors text-left"
                        >
                            {currentSong.artist}
                        </button>
                        {currentSong.album && (
                            <p className="text-sm text-zinc-600 truncate">{currentSong.album}</p>
                        )}
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1.5">
                        <div
                            ref={progressRef}
                            className="relative h-2 bg-white/10 rounded-full cursor-pointer group"
                            onClick={handleProgressClick}
                            onMouseMove={(e) => e.buttons === 1 && handleProgressDrag(e)}
                            onMouseUp={handleDragEnd}
                            onMouseLeave={handleDragEnd}
                        >
                            <div
                                className="absolute left-0 top-0 h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all"
                                style={{ width: `${progress}%` }}
                            />
                            <div
                                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                style={{ left: `calc(${progress}% - 8px)` }}
                            />
                        </div>
                        <div className="flex justify-between text-xs text-zinc-500 font-medium">
                            <span>{formatTime(displayTime)}</span>
                            <span>{formatTime(duration)}</span>
                        </div>
                    </div>

                    {/* Main Controls */}
                    <div className="flex items-center justify-center gap-4">
                        <button
                            onClick={cycleRepeatMode}
                            className={`p-2 rounded-full transition-all ${repeatMode !== 'off' ? 'text-cyan-400' : 'text-zinc-500 hover:text-white'}`}
                            title={`Repeat: ${repeatMode}`}
                        >
                            <RepeatIcon size={18} />
                        </button>
                        <button
                            onClick={handlePrev}
                            className="p-2 text-zinc-300 hover:text-white transition-colors"
                        >
                            <SkipBack size={28} fill="currentColor" />
                        </button>
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={togglePlay}
                            className="p-4 bg-white text-black rounded-full hover:scale-105 transition-transform shadow-xl"
                        >
                            {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
                        </motion.button>
                        <button
                            onClick={handleNext}
                            className="p-2 text-zinc-300 hover:text-white transition-colors"
                        >
                            <SkipForward size={28} fill="currentColor" />
                        </button>
                        <button
                            onClick={toggleShuffle}
                            className={`p-2 rounded-full transition-all ${shuffleEnabled ? 'text-cyan-400' : 'text-zinc-500 hover:text-white'}`}
                            title="Shuffle"
                        >
                            <Shuffle size={18} />
                        </button>
                    </div>

                    {/* Secondary Controls */}
                    <div className="flex items-center justify-center gap-3">
                        <button
                            onClick={() => toggleLike(currentSong.id)}
                            className={`p-2 rounded-full transition-all ${isLiked ? 'text-cyan-400' : 'text-zinc-500 hover:text-white'}`}
                            title="Like"
                        >
                            <Heart size={20} fill={isLiked ? 'currentColor' : 'none'} />
                        </button>

                        <div className="flex items-center gap-2 bg-white/5 rounded-full px-3 py-1.5">
                            <Volume2 size={14} className="text-zinc-500" />
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={volume}
                                onChange={(e) => setVolume(Number(e.target.value))}
                                className="w-20 h-1 accent-cyan-400 cursor-pointer"
                            />
                        </div>

                        <button
                            onClick={openEqualizer}
                            className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-zinc-500 hover:text-white transition-all"
                            title="Equalizer"
                        >
                            <Sliders size={16} />
                        </button>
                        <button
                            onClick={openVolumeSuite}
                            className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-zinc-500 hover:text-white transition-all"
                            title="Volume Suite"
                        >
                            <Gauge size={16} />
                        </button>
                        <button
                            onClick={() => toggleRightSidebar(!isRightSidebarOpen)}
                            className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-zinc-500 hover:text-white transition-all"
                            title="Queue / Lyrics"
                        >
                            <ListMusic size={16} />
                        </button>
                    </div>

                    {/* Tabs: Lyrics / Radio */}
                    <div className="bg-white/5 rounded-2xl border border-white/5 overflow-hidden">
                        <div className="flex border-b border-white/5">
                            {['playing', 'lyrics', 'radio'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-widest transition-colors ${
                                        activeTab === tab ? 'text-cyan-400 bg-white/5' : 'text-zinc-500 hover:text-white'
                                    }`}
                                >
                                    {tab === 'playing' && <Activity size={14} className="inline mr-1" />}
                                    {tab === 'lyrics' && '🎤 '}
                                    {tab === 'radio' && <Radio size={14} className="inline mr-1" />}
                                    {tab === 'playing' ? 'Now' : tab === 'lyrics' ? 'Lyrics' : 'Radio'}
                                </button>
                            ))}
                        </div>
                        <div className="max-h-40 overflow-y-auto no-scrollbar p-3">
                            {activeTab === 'playing' && (
                                <div className="text-center text-zinc-400 text-xs">
                                    {isPlaying ? '🎵 Playing from library' : '⏸ Paused'}
                                    <br />
                                    <span className="text-zinc-600 text-[10px]">
                                        {currentSong.source === 'itunes' ? 'iTunes 30s Preview' : 'Local song'}
                                    </span>
                                </div>
                            )}
                            {activeTab === 'lyrics' && (
                                lyricsLoading
                                    ? <p className="text-center text-zinc-500 text-sm py-4">Loading lyrics...</p>
                                    : <LyricsView />
                            )}
                            {activeTab === 'radio' && <SongRadio />}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NowPlayingView;
