import { useMusic } from '../context/MusicContext';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';
import PlayerBar from './PlayerBar';
import Playlist from './Playlist'; 
import AuthModal from './AuthModal';
import RightSidePlayer from './RightSidePlayer';
import MobileTabBar from './MobileTabBar';
import MobilePlayer from './MobilePlayer';
import MiniPlayer from './MiniPlayer';
import { motion, AnimatePresence } from 'framer-motion';
import PlaylistModal from './PlaylistModal';

const MainLayout = ({ children, currentView, setCurrentView, openTheme }) => {
    const { 
        playlist, 
        queue,
        currentSong,
        currentSongIndex, 
        playSong, 
        playSearchedSong,
        isPlaylistOpen, 
        setIsPlaylistOpen,
        notification,
        isPlaylistModalOpen,
        playlistModalSongId,
        closePlaylistModal
    } = useMusic();
    const { isAuthModalOpen, closeAuthModal } = useAuth();

    return (
        <div className="flex flex-col h-screen overflow-hidden font-sans relative selection:bg-cyan-500/30" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
            
            {/* Notifications */}
            <AnimatePresence>
                {notification && (
                    <motion.div 
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                        className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] bg-cyan-500 text-black px-6 py-2 rounded-full font-bold shadow-2xl shadow-cyan-500/20"
                    >
                        {notification}
                    </motion.div>
                )}
            </AnimatePresence>
            
            {/* Animated Mesh Background (Aurora Theme) */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none transition-colors duration-1000">
                <div 
                    className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[40px] md:blur-[80px] animate-[pulse_8s_ease-in-out_infinite] opacity-20" 
                    style={{ backgroundColor: 'var(--theme-color)' }}
                />
                <div 
                    className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[40px] md:blur-[80px] animate-[pulse_10s_ease-in-out_infinite_2s] opacity-20" 
                    style={{ backgroundColor: 'var(--theme-color)' }}
                />
                <div 
                    className="absolute top-[20%] right-[20%] w-[30%] h-[30%] rounded-full blur-[30px] md:blur-[60px] animate-[pulse_12s_ease-in-out_infinite_4s] opacity-10" 
                    style={{ backgroundColor: 'var(--theme-color)' }}
                />
            </div>

            <div className="flex flex-1 overflow-hidden relative z-10 p-2 md:p-4 gap-4">
                
                {/* Sidebar (Desktop) - Slim Dock */}
                <div className="hidden md:block w-24 h-full transition-all duration-500 relative z-20"> 
                    <Sidebar currentView={currentView} setCurrentView={setCurrentView} openTheme={openTheme} />
                </div>

                {/* Main Content Area - Glass Panel */}
                <div className="flex-1 flex flex-col relative overflow-hidden bg-white/5 md:bg-white/5 rounded-[1.5rem] md:rounded-[2rem] border border-white/5 shadow-xl">
                    
                    {/* View Content */}
                    <main className="flex-1 overflow-y-auto z-10 p-4 pb-32 md:p-8 md:pb-28 [&::-webkit-scrollbar]:hidden no-scrollbar">
                        {children}
                    </main>
                </div>
            </div>

            {/* Bottom Section - Consolidated for Mobile */}
            <div className="fixed bottom-0 left-0 right-0 z-40 md:static md:z-auto">
                {/* Floating Player Bar */}
                <div className="px-4 pb-2 md:px-0 md:pb-0 md:fixed md:bottom-6 md:left-1/2 md:-translate-x-1/2 md:w-[95%] md:max-w-5xl md:z-40">
                    <PlayerBar setCurrentView={setCurrentView} />
                </div>

                {/* Mobile Tab Bar */}
                <div className="md:hidden">
                    <MobileTabBar currentView={currentView} setCurrentView={setCurrentView} />
                </div>
            </div>

             {/* Playlist Overlay (Mobile/Global) */}
             <Playlist 
                playlist={playlist}
                queue={queue}
                currentSong={currentSong}
                onSelect={(index, song) => {
                    if (index === -1 && song) {
                        playSearchedSong(song);
                    } else {
                        playSong(index);
                    }
                    setIsPlaylistOpen(false);
                }}
                isOpen={isPlaylistOpen}
                onClose={() => setIsPlaylistOpen(false)}
             />

             {/* Global Auth Modal */}
             <AuthModal isOpen={isAuthModalOpen} onClose={closeAuthModal} />

             {/* Right Side Player (Now Playing) */}
             <RightSidePlayer />

              <MobilePlayer />
              <MiniPlayer />

              {/* Playlist Selection Modal */}
             <PlaylistModal 
                isOpen={isPlaylistModalOpen} 
                onClose={closePlaylistModal} 
                songId={playlistModalSongId} 
             />
        </div>
    );
};

export default MainLayout;
