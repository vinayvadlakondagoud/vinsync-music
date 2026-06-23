import { motion } from 'framer-motion';
import { Home, Search, Library, Heart, Clock, ListMusic, Sparkles } from 'lucide-react';

const MobileTabBar = ({ currentView, setCurrentView }) => {
    
    const navItems = [
        { id: 'home', icon: Home, label: 'Home' },
        { id: 'search', icon: Search, label: 'Search' },
        { id: 'library', icon: Library, label: 'Library' },
        { id: 'queue', icon: ListMusic, label: 'Queue' },
        { id: 'moods', icon: Sparkles, label: 'Moods' },
        { id: 'history', icon: Clock, label: 'History' },
        { id: 'liked', icon: Heart, label: 'Liked' }
    ];

    return (
        <div className="pb-6 px-4 md:hidden">
            <div className="glass-strong rounded-[2.5rem] shadow-2xl shadow-black/50 flex items-center px-4 h-16 overflow-hidden relative">
                {/* Top accent line */}
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent opacity-40" />

                <div className="flex items-center justify-evenly w-full relative z-10">
                    {navItems.map((item) => {
                        const isActive = currentView === item.id;
                        const Icon = item.icon;
                        
                        return (
                            <button
                                key={item.id}
                                onClick={() => setCurrentView(item.id)}
                                className={`group flex flex-col items-center justify-center transition-all duration-300 w-12 h-12 rounded-full relative`}
                            >
                                {/* Active Glow Background */}
                                {isActive && (
                                    <div className="absolute inset-0 rounded-full blur-md" style={{backgroundColor: 'rgba(var(--accent-rgb), 0.12)'}} />
                                )}

                                <div className={`p-1 transition-all z-10 ${isActive ? '-translate-y-0.5' : 'translate-y-0 group-hover:-translate-y-0.5'}`}>
                                    <Icon 
                                        size={22} 
                                        strokeWidth={isActive ? 2.5 : 2}
                                        className={`transition-all duration-300 ${
                                            isActive 
                                                ? 'text-white drop-shadow-[0_0_8px_rgba(var(--accent-rgb),0.6)]' 
                                                : 'text-zinc-500 group-hover:text-zinc-300'
                                        }`}
                                        style={isActive ? {color: 'var(--accent)'} : {}}
                                        fill={item.id === 'liked' && isActive ? "currentColor" : "none"}
                                    />
                                </div>
                                
                                {/* Active Dot */}
                                {isActive && (
                                    <div className="absolute bottom-1 w-1 h-1 rounded-full" style={{backgroundColor: 'var(--accent)', boxShadow: '0 0 5px var(--accent)'}} />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default MobileTabBar;