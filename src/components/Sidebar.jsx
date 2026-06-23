import { Home, Search, Library, Heart, PlusSquare, Clock, Download, ListMusic, Sparkles, Palette } from 'lucide-react';
import UserBadge from './UserBadge';
import SleepTimer from './SleepTimer';
import { memo } from 'react';

const NavItem = ({ icon: Icon, label, view, currentView, setCurrentView }) => {
    const isActive = currentView === view;
    return (
        <button 
            onClick={() => setCurrentView(view)}
            className={`relative group flex items-center justify-center w-14 h-14 rounded-2xl transition-all duration-300 ${
                isActive 
                    ? 'nav-active text-white scale-105' 
                    : 'text-zinc-500 hover:bg-white/5 hover:text-white hover:scale-105'
            }`}
            style={isActive ? {background: `rgba(var(--accent-rgb), 0.12)`} : {}}
        >
            <Icon size={22} className={isActive ? 'text-[var(--accent)]' : ''} />
            
            {/* Tooltip */}
            <div className="absolute left-full ml-4 px-3 py-1.5 bg-black/80 text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 translate-x-[-10px] group-hover:translate-x-0 transition-all pointer-events-none whitespace-nowrap backdrop-blur-md border border-white/10 z-50">
                {label}
            </div>

            {/* Active Indicator */}
            {isActive && (
                <div className="absolute left-0 w-1 h-6 rounded-r-full nav-indicator" />
            )}
        </button>
    );
};

const Sidebar = ({ currentView, setCurrentView, openTheme }) => {
    return (
        <div className="h-full glass rounded-[2rem] flex flex-col items-center py-8 shadow-2xl relative">
            
            {/* VinSync Brand */}
            <div className="mb-10 flex flex-col items-center gap-2">
                <div className="p-3 brand-icon rounded-2xl shadow-lg shadow-cyan-500/20">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M8 5L8 19" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                        <path d="M12 3L12 21" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                        <path d="M16 7L16 17" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                        <path d="M4 9L4 15" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.6"/>
                        <path d="M20 11L20 13" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.6"/>
                    </svg>
                </div>
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase brand-gradient">VinSync</span>
            </div>

            {/* Main Nav */}
            <div className="flex flex-col gap-4 w-full items-center">
                <NavItem icon={Home} label="Home" view="home" currentView={currentView} setCurrentView={setCurrentView} />
                <NavItem icon={Search} label="Search" view="search" currentView={currentView} setCurrentView={setCurrentView} />
                <NavItem icon={Library} label="Library" view="library" currentView={currentView} setCurrentView={setCurrentView} />
                <NavItem icon={Clock} label="History" view="history" currentView={currentView} setCurrentView={setCurrentView} />
                <NavItem icon={ListMusic} label="Queue" view="queue" currentView={currentView} setCurrentView={setCurrentView} />
                <NavItem icon={Download} label="Downloads" view="downloads" currentView={currentView} setCurrentView={setCurrentView} />
                <NavItem icon={Sparkles} label="Moods" view="moods" currentView={currentView} setCurrentView={setCurrentView} />
            </div>

            {/* Playlists / Likes */}
            <div className="mt-10 flex flex-col gap-4 w-full items-center pt-8 border-t border-white/5">
                <button className="relative group w-12 h-12 bg-white/5 hover:bg-white/10 rounded-2xl flex items-center justify-center transition-all">
                    <PlusSquare size={22} className="text-zinc-400 group-hover:text-white" />
                     {/* Tooltip */}
                    <div className="absolute left-full ml-4 px-3 py-1.5 bg-black/80 text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 translate-x-[-10px] group-hover:translate-x-0 transition-all pointer-events-none whitespace-nowrap backdrop-blur-md border border-white/10 z-50">
                        Create Playlist
                    </div>
                </button>

                <NavItem icon={Heart} label="Liked Songs" view="liked" currentView={currentView} setCurrentView={setCurrentView} />
            </div>

            {/* Theme */}
            <button
                onClick={openTheme}
                className="relative group flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300 text-zinc-500 hover:bg-white/5 hover:text-white hover:scale-105 mb-2"
            >
                <Palette size={22} />
                <div className="absolute left-full ml-4 px-3 py-1.5 bg-black/80 text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 translate-x-[-10px] group-hover:translate-x-0 transition-all pointer-events-none whitespace-nowrap backdrop-blur-md border border-white/10 z-50">
                    Theme
                </div>
            </button>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Sleep Timer */}
            <div className="mb-4 w-full px-4">
                <SleepTimer />
            </div>

            {/* User Profile (Collapsed) */}
            <div className="mb-4">
                <div className="w-12 h-12">
                     <UserBadge setCurrentView={setCurrentView} collapsed={true} />
                </div>
            </div>
        </div>
    );
};

export default memo(Sidebar);
