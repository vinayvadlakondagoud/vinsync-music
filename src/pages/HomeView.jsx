import { useMemo } from 'react';
import { useMusic } from '../context/MusicContext';
import { useAuth } from '../context/AuthContext';
import { Play, ListPlus, Plus, Globe } from 'lucide-react';
import UserBadge from '../components/UserBadge';
import IndustryBrowse from '../components/IndustryBrowse';
import { motion } from 'framer-motion';

const HomeView = ({ setCurrentView }) => {
    const { playlist, playSong, addToQueue, history, playSearchedSong, openPlaylistModal } = useMusic();
    const { user } = useAuth();
    
    // Map history IDs to song objects
    const recentSongs = useMemo(() => {
        return history
            .map(h => playlist.find(s => s.id === h.song_id))
            .filter(Boolean)
            .filter((song, index, self) => self.findIndex(s => s.id === song.id) === index) // Unique
            .slice(0, 8);
    }, [history, playlist]);

    // Get greeting based on time
    const hour = new Date().getHours();
    let greeting = "Good morning";
    if (hour >= 12 && hour < 17) greeting = "Good afternoon";
    if (hour >= 17 && hour < 21) greeting = "Good evening";
    if (hour >= 21 || hour < 5) greeting = "Good night";

    return (
        <div className="min-h-full overflow-y-auto no-scrollbar scroll-smooth px-3 md:px-8 pt-4 md:pt-6 pb-24">
            {/* Top Bar / Greeting */}
            <div className="flex items-center justify-between mb-6 md:mb-10">
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex flex-col"
                >
                    <div className="flex items-center gap-3 mb-1">
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tighter">
                            {greeting}
                            {user?.user_metadata?.name && <span className="text-gradient">, {user.user_metadata.name.split(' ')[0]}</span>}
                        </h1>
                    </div>
                    <p className="text-zinc-500 font-medium mt-1 text-sm md:text-base tracking-wide">Ready to sync into the rhythm?</p>
                </motion.div>
                <div className="md:hidden">
                    <UserBadge setCurrentView={setCurrentView} collapsed={true} />
                </div>
            </div>

            {/* Hero Section: Billboard */}
            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="relative h-48 md:h-64 lg:h-80 rounded-2xl md:rounded-[2.5rem] overflow-hidden mb-8 md:mb-12 group cursor-pointer"
                onClick={() => playlist[0] && playSong(0)}
            >
                <img 
                    src={playlist[0]?.image || "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=2070&auto=format&fit=crop"} 
                    alt="Featured" 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />
                {/* Accent glow */}
                <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full blur-[100px] opacity-10" style={{ backgroundColor: 'var(--accent)' }} />
                
                <div className="absolute bottom-4 md:bottom-8 left-4 md:left-8 right-4 md:right-8 flex items-end justify-between">
                    <div className="flex flex-col">
                        <span className="glass px-2 md:px-3 py-1 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-white/80 w-fit mb-2 md:mb-3">
                            Trending Now
                        </span>
                        <h2 className="text-xl md:text-3xl lg:text-5xl font-black text-white mb-1 md:mb-2 uppercase tracking-tight glow-text">
                            {playlist[0]?.name || "Discover New Vibes"}
                        </h2>
                        <p className="text-sm md:text-lg text-white/60 font-medium hidden sm:block">
                            {playlist[0]?.artist || "Explore the latest hits curated just for you"}
                        </p>
                    </div>
                    <button className="btn-accent text-black p-3 md:p-5 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all flex items-center justify-center" style={{color: 'white'}}>
                        <Play size={20} fill="currentColor" className="ml-0.5 md:w-7 md:h-7" />
                    </button>
                </div>
            </motion.div>

            {/* Quick Picks / Recently Played */}
            {recentSongs.length > 0 && (
                <div className="mb-8 md:mb-12">
                    <div className="flex items-center justify-between mb-4 md:mb-6">
                        <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight">Jump Back In</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                        {recentSongs.slice(0, 6).map((song, i) => (
                            <motion.div 
                                key={`recent-${song.id}-${i}`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 + (i * 0.05) }}
                                whileHover={{ x: 8 }}
                                onClick={() => playSearchedSong(song)}
                                className="flex items-center gap-3 md:gap-4 p-2.5 md:p-3 pr-4 md:pr-6 glass-card rounded-xl md:rounded-2xl group cursor-pointer"
                            >
                                <div className="relative w-14 h-14 md:w-16 md:h-16 rounded-lg md:rounded-xl overflow-hidden flex-shrink-0 shadow-lg">
                                    <img src={song.image} alt={song.name} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                        <Play size={16} fill="white" className="text-white ml-0.5 md:w-5 md:h-5" />
                                    </div>
                                </div>
                                <div className="flex flex-col min-w-0 flex-1">
                                    <h4 className="font-bold text-white truncate group-hover:text-[var(--accent)] transition-colors uppercase tracking-tight text-sm md:text-base">{song.name}</h4>
                                    <p className="text-xs text-zinc-500 font-medium truncate">{song.artist}</p>
                                </div>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); openPlaylistModal(song.id); }}
                                    className="btn-ghost p-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 rounded-full text-zinc-400 hover:text-white"
                                >
                                    <Plus size={16} className="md:w-[18px] md:h-[18px]" />
                                </button>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}


            {/* Section: Recommended */}
            <div className="mb-8 md:mb-12">
                 <div className="flex justify-between items-end mb-4 md:mb-8">
                    <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight">Made For You</h2>
                    <button 
                        onClick={() => setCurrentView && setCurrentView('library')}
                        className="text-[10px] font-black text-zinc-500 hover:text-white transition-colors uppercase tracking-[0.2em]"
                    >
                        View All
                    </button>
                 </div>
                  
                 <div className="flex gap-4 md:gap-5 overflow-x-auto pb-6 md:pb-8 no-scrollbar -mx-3 px-3 md:mx-0 md:px-0">
                    {playlist.slice(0, 8).map((song, i) => (
                         <motion.div 
                            key={song.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 + (i * 0.1) }}
                            whileHover={{ y: -10 }}
                            onClick={() => playSong(i)}
                            className="flex-shrink-0 w-40 md:w-48 glass-card p-3 md:p-4 rounded-2xl md:rounded-[2rem] group cursor-pointer"
                         >
                            <div className="relative mb-3 md:mb-5 rounded-xl md:rounded-2xl overflow-hidden aspect-square shadow-2xl">
                                <img src={song.image} alt={song.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                <div className="absolute inset-0 bg-black/20 md:bg-black/40 flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300">
                                    <div className="btn-accent text-white p-3 md:p-4 rounded-full scale-100 md:scale-50 md:group-hover:scale-100 transition-transform duration-300 shadow-2xl">
                                        <Play size={18} fill="currentColor" className="ml-0.5 md:w-6 md:h-6" />
                                    </div>
                                </div>
                            </div>
                            <h3 className="font-bold text-white mb-1 truncate uppercase tracking-tight group-hover:text-[var(--accent)] transition-colors text-sm md:text-base">{song.name}</h3>
                            <p className="text-xs text-zinc-500 font-medium truncate">{song.artist}</p>
                            
                            <div className="mt-3 md:mt-4 flex items-center justify-between opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                <button 
                                    onClick={(e) => { e.stopPropagation(); addToQueue(song); }}
                                    className="btn-ghost p-1.5 md:p-2 rounded-full text-zinc-400 hover:text-white"
                                >
                                    <ListPlus size={14} className="md:w-4 md:h-4" />
                                </button>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); openPlaylistModal(song.id); }}
                                    className="btn-ghost p-1.5 md:p-2 rounded-full text-zinc-400 hover:text-white"
                                >
                                    <Plus size={14} className="md:w-4 md:h-4" />
                                </button>
                            </div>
                         </motion.div>
                    ))}
                 </div>
            </div>

            {/* Section: Discover by Industry */}
            <div>
                <div className="flex items-center gap-2 mb-4 md:mb-6">
                    <Globe size={20} style={{color: 'var(--accent)'}} />
                    <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight">
                        Discover by Industry
                    </h2>
                </div>
                <div className="glass-card rounded-2xl md:rounded-[2rem] p-4 md:p-6">
                    <IndustryBrowse />
                </div>
            </div>
        </div>
    );
};

export default HomeView;
