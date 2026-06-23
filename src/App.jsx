import React, { useState, lazy, Suspense, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { MusicProvider, useMusic } from './context/MusicContext';
import MainLayout from './components/MainLayout';
import KeyboardShortcuts from './components/KeyboardShortcuts';
import EqualizerModal from './components/EqualizerModal';
import VolumeSuite from './components/VolumeSuite';
import ThemeCustomizer from './components/ThemeCustomizer';
import { loadTheme, applyTheme } from './utils/themeUtils';

const EqualizerModalManager = () => {
    const { isEqualizerOpen, closeEqualizer } = useMusic();
    return <EqualizerModal isOpen={isEqualizerOpen} onClose={closeEqualizer} />;
};

const VolumeSuiteManager = () => {
    const { isVolumeSuiteOpen, closeVolumeSuite } = useMusic();
    return <VolumeSuite isOpen={isVolumeSuiteOpen} onClose={closeVolumeSuite} />;
};

const HomeView = lazy(() => import('./pages/HomeView'));
const SearchView = lazy(() => import('./pages/SearchView'));
const ProfileView = lazy(() => import('./pages/ProfileView'));
const LibraryView = lazy(() => import('./pages/LibraryView'));
const LikedSongsView = lazy(() => import('./pages/LikedSongsView'));
const PlaylistDetailView = lazy(() => import('./pages/PlaylistDetailView'));
const NowPlayingView = lazy(() => import('./pages/NowPlayingView'));
const ArtistView = lazy(() => import('./pages/ArtistView'));
const AlbumView = lazy(() => import('./pages/AlbumView'));
const HistoryView = lazy(() => import('./pages/HistoryView'));
const DownloadsView = lazy(() => import('./pages/DownloadsView'));
const QueueView = lazy(() => import('./pages/QueueView'));
const MoodPlaylistsView = lazy(() => import('./pages/MoodPlaylistsView'));

function App() {
  const [currentView, setCurrentView] = useState('home');
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [isThemeOpen, setIsThemeOpen] = useState(false);

  useEffect(() => {
    applyTheme(loadTheme());
  }, []);

  return (
    <AuthProvider>
        <MusicProvider>
            <MainLayout currentView={currentView} setCurrentView={setCurrentView} openTheme={() => setIsThemeOpen(true)}>
                <Suspense fallback={<div className="flex-1 flex items-center justify-center"><div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" /></div>}>
                    {currentView === 'home' && <HomeView setCurrentView={setCurrentView} />}
                    {currentView === 'search' && <SearchView setCurrentView={setCurrentView} setSelectedArtist={setSelectedArtist} setSelectedAlbum={setSelectedAlbum} />}
                    {currentView === 'profile' && <ProfileView />}
                    {currentView === 'library' && <LibraryView setCurrentView={setCurrentView} setSelectedPlaylist={setSelectedPlaylist} />}
                    {currentView === 'liked' && <LikedSongsView />}
                    {currentView === 'playlistDetail' && <PlaylistDetailView playlistId={selectedPlaylist} onBack={() => setCurrentView('library')} />}
                    {currentView === 'nowplaying' && <NowPlayingView setCurrentView={setCurrentView} setSelectedArtist={setSelectedArtist} />}
                    {currentView === 'artist' && <ArtistView artistName={selectedArtist} setCurrentView={setCurrentView} setSelectedArtist={setSelectedArtist} />}
                    {currentView === 'album' && <AlbumView albumName={selectedAlbum?.name} albumArtist={selectedAlbum?.artist} albumImage={selectedAlbum?.image} tracks={selectedAlbum?.tracks} setCurrentView={setCurrentView} setSelectedAlbum={setSelectedAlbum} />}
                    {currentView === 'history' && <HistoryView setCurrentView={setCurrentView} />}
                    {currentView === 'downloads' && <DownloadsView setCurrentView={setCurrentView} />}
                    {currentView === 'queue' && <QueueView />}
                    {currentView === 'moods' && <MoodPlaylistsView />}
                </Suspense>
            </MainLayout>
            <KeyboardShortcuts />
            <EqualizerModalManager />
            <VolumeSuiteManager />
            <ThemeCustomizer isOpen={isThemeOpen} onClose={() => setIsThemeOpen(false)} />
        </MusicProvider>
    </AuthProvider>
  );
}

export default App;
