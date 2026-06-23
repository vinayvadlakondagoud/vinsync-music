import { createContext, useContext, useRef, useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import useAudio from '../hooks/useAudio';
import { playlist } from '../data';
import { extractPrimaryColor } from '../utils/colorExtractor';
import { fetchRealLyrics } from '../utils/lyricsApi';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from './AuthContext';
import { isDownloaded, removeAudio, fetchAndStoreAudio, getDownloadedSongs } from '../utils/offlineStorage';

const MusicContext = createContext();

export const useMusic = () => {
    return useContext(MusicContext);
};

const initialState = {
    currentSongIndex: 0,
    isPlaylistOpen: false,
    isRightSidebarOpen: false,
    isMobilePlayerOpen: false,
    searchResults: [],
    currentActiveId: null,
    currentActiveSong: null,
    likedSongs: [],
    userPlaylists: [],
    history: [],
    queue: [],
    playbackSpeed: 1.0,
    notification: null,
    isPlaylistModalOpen: false,
    playlistModalSongId: null,
    lyrics: null,
    lyricsLoading: false,
    isEqualizerOpen: false,
    isVolumeSuiteOpen: false,
    showVisualizer: false,
    sleepTimer: null,
    shuffleEnabled: false,
    repeatMode: 'off',
    listeningStats: { totalTime: 0, songPlays: {} },
};

function musicReducer(state, action) {
    switch (action.type) {
        case 'SET_SONG_INDEX':
            return { ...state, currentSongIndex: action.payload, currentActiveId: null };
        case 'NEXT_SONG':
            return { ...state, currentSongIndex: (state.currentSongIndex + 1) % playlist.length, currentActiveId: null };
        case 'PREV_SONG':
            return { ...state, currentSongIndex: (state.currentSongIndex - 1 + playlist.length) % playlist.length, currentActiveId: null };
        case 'TOGGLE_PLAYLIST':
            return { ...state, isPlaylistOpen: action.payload !== undefined ? action.payload : !state.isPlaylistOpen };
        case 'TOGGLE_RIGHT_SIDEBAR':
            return { ...state, isRightSidebarOpen: action.payload !== undefined ? action.payload : !state.isRightSidebarOpen };
        case 'SET_MOBILE_PLAYER':
            return { ...state, isMobilePlayerOpen: action.payload };
        case 'SET_SEARCH_RESULTS':
            return { ...state, searchResults: action.payload };
        case 'PLAY_SEARCHED':
            return { ...state, currentSongIndex: -1, currentActiveId: action.payload.id, currentActiveSong: action.payload };
        case 'TOGGLE_LIKE': {
            const newLikedSongs = state.likedSongs.includes(action.payload)
                ? state.likedSongs.filter(id => id !== action.payload)
                : [...state.likedSongs, action.payload];
            return { ...state, likedSongs: newLikedSongs };
        }
        case 'SYNC_LIKED_SONGS':
            return { ...state, likedSongs: action.payload };
        case 'ADD_TO_QUEUE':
            return { ...state, queue: [...state.queue, action.payload] };
        case 'PLAY_NEXT': {
            const newQueue = [...state.queue];
            newQueue.unshift(action.payload);
            return { ...state, queue: newQueue };
        }
        case 'REMOVE_FROM_QUEUE':
            return { ...state, queue: state.queue.filter((_, i) => i !== action.payload) };
        case 'CLEAR_QUEUE':
            return { ...state, queue: [] };
        case 'REORDER_QUEUE': {
            const { fromIndex, toIndex } = action.payload;
            const newQueue = [...state.queue];
            const [moved] = newQueue.splice(fromIndex, 1);
            newQueue.splice(toIndex, 0, moved);
            return { ...state, queue: newQueue };
        }
        case 'SET_SPEED':
            return { ...state, playbackSpeed: action.payload };
        case 'POP_QUEUE': {
            const [, ...rest] = state.queue;
            return { ...state, queue: rest };
        }
        case 'SET_NOTIFICATION':
            return { ...state, notification: action.payload };
        case 'SYNC_DATA':
            return { 
                ...state, 
                likedSongs: action.payload.likedSongs,
                userPlaylists: action.payload.playlists,
                history: action.payload.history
            };
        case 'ADD_PLAYLIST':
            return { ...state, userPlaylists: [action.payload, ...state.userPlaylists] };
        case 'ADD_SONG_TO_PLAYLIST':
            return {
                ...state,
                userPlaylists: state.userPlaylists.map(pl => 
                    pl.id === action.payload.playlistId 
                        ? { ...pl, playlist_songs: [...pl.playlist_songs, action.payload.song] }
                        : pl
                )
            };
        case 'REMOVE_SONG_FROM_PLAYLIST':
            return {
                ...state,
                userPlaylists: state.userPlaylists.map(pl => 
                    pl.id === action.payload.playlistId 
                        ? { ...pl, playlist_songs: pl.playlist_songs.filter(ps => ps.id !== action.payload.recordId) }
                        : pl
                )
            };
        case 'UPDATE_HISTORY':
            return { ...state, history: [action.payload, ...state.history].slice(0, 20) };
        case 'TOGGLE_PLAYLIST_MODAL':
            return { 
                ...state, 
                isPlaylistModalOpen: action.payload.isOpen, 
                playlistModalSongId: action.payload.songId || null 
            };
        case 'SET_LYRICS':
            return { ...state, lyrics: action.payload, lyricsLoading: false };
        case 'SET_LYRICS_LOADING':
            return { ...state, lyricsLoading: action.payload };
        case 'SET_EQUALIZER_OPEN':
            return { ...state, isEqualizerOpen: action.payload };
        case 'SET_VOLUME_SUITE_OPEN':
            return { ...state, isVolumeSuiteOpen: action.payload };
        case 'TOGGLE_VISUALIZER':
            return { ...state, showVisualizer: !state.showVisualizer };
        case 'SET_SLEEP_TIMER':
            return { ...state, sleepTimer: action.payload };
        case 'TOGGLE_SHUFFLE':
            return { ...state, shuffleEnabled: !state.shuffleEnabled };
        case 'SET_REPEAT_MODE':
            return { ...state, repeatMode: action.payload };
        case 'UPDATE_STATS':
            return { ...state, listeningStats: action.payload };
        default:
            return state;
    }
}

/**
 * MusicProvider Component
 * 
 * Manages global music state, audio playback, user playlists, and data synchronization.
 * Integrates with Supabase for persistence and useAudio for playback control.
 */
export const MusicProvider = ({ children }) => {
    const [state, dispatch] = useReducer(musicReducer, initialState);
    const isFirstLoad = useRef(true);
    
    const { user } = useAuth();
    
    // Derived state destructuring
    const { 
        currentSongIndex, 
        isPlaylistOpen, 
        isRightSidebarOpen, 
        isMobilePlayerOpen, 
        likedSongs, 
        userPlaylists,
        history,
        searchResults, 
        queue, 
        playbackSpeed, 
        notification,
        sleepTimer,
        shuffleEnabled,
        repeatMode,
    } = state;

    const currentSong = useMemo(() => {
        if (currentSongIndex === -1) {
            return state.currentActiveSong || null;
        }
        return playlist[currentSongIndex] || null;
    }, [currentSongIndex, state.currentActiveSong]);

    // Sync data with Supabase
    useEffect(() => {
        if (!user) {
            dispatch({ type: 'SYNC_DATA', payload: { likedSongs: [], playlists: [], history: [] } });
            return;
        }

        const fetchData = async () => {
            if (!supabase) return;
            const [likes, playlists, historyData] = await Promise.all([
                supabase.from('liked_songs').select('song_id').eq('user_id', user.id),
                supabase.from('playlists').select('*, playlist_songs(*)').eq('user_id', user.id),
                supabase.from('listening_history').select('*').eq('user_id', user.id).order('played_at', { ascending: false }).limit(20)
            ]);

            dispatch({ 
                type: 'SYNC_DATA', 
                payload: { 
                    likedSongs: likes.data?.map(l => Number(l.song_id)) || [],
                    playlists: playlists.data?.map(p => ({
                        ...p,
                        playlist_songs: p.playlist_songs?.map(ps => ({
                            ...ps,
                            song_id: Number(ps.song_id)
                        })) || []
                    })) || [],
                    history: historyData.data || []
                } 
            });
        };

        fetchData();
    }, [user]);

    const setIsMobilePlayerOpen = useCallback((val) => {
        dispatch({ type: 'SET_MOBILE_PLAYER', payload: val });
    }, []);

    const showNotification = useCallback((message) => {
        dispatch({ type: 'SET_NOTIFICATION', payload: message });
        setTimeout(() => dispatch({ type: 'SET_NOTIFICATION', payload: null }), 3000);
    }, []);

    const addToQueue = useCallback((song) => {
        dispatch({ type: 'ADD_TO_QUEUE', payload: song });
        showNotification(`Added ${song.name} to queue`);
    }, [showNotification]);

    const playNext = useCallback((song) => {
        dispatch({ type: 'PLAY_NEXT', payload: song });
        showNotification(`${song.name} will play next`);
    }, [showNotification]);

    const removeFromQueue = useCallback((index) => {
        dispatch({ type: 'REMOVE_FROM_QUEUE', payload: index });
    }, []);

    const clearQueue = useCallback(() => {
        dispatch({ type: 'CLEAR_QUEUE' });
        showNotification('Queue cleared');
    }, [showNotification]);

    const reorderQueue = useCallback((fromIndex, toIndex) => {
        dispatch({ type: 'REORDER_QUEUE', payload: { fromIndex, toIndex } });
    }, []);

    const setPlaybackSpeed = useCallback((speed) => {
        dispatch({ type: 'SET_SPEED', payload: speed });
    }, []);

    const setSleepTimer = useCallback((minutes) => {
        dispatch({ type: 'SET_SLEEP_TIMER', payload: minutes ? { endTime: Date.now() + minutes * 60000, minutes } : null });
    }, []);

    const toggleShuffle = useCallback(() => {
        dispatch({ type: 'TOGGLE_SHUFFLE' });
    }, []);

    const cycleRepeatMode = useCallback(() => {
        const modes = ['off', 'all', 'one'];
        const idx = modes.indexOf(repeatMode);
        dispatch({ type: 'SET_REPEAT_MODE', payload: modes[(idx + 1) % modes.length] });
    }, [repeatMode]);

    const onEndedRef = useRef();
    
    // Audio Hook Integration
    const audio = useAudio(0.5, () => onEndedRef.current?.());
    const { loadSong, setSpeed } = audio;

    // Sync playback rate
    useEffect(() => {
        setSpeed(playbackSpeed);
    }, [playbackSpeed, setSpeed]);

    // Initial Load Logic
    useEffect(() => {
        if (isFirstLoad.current && playlist[currentSongIndex]) {
            const s = playlist[currentSongIndex];
            if (s.audio) loadSong(s.audio, false);
            isFirstLoad.current = false;
        }
    }, [loadSong, currentSongIndex]);

    const addToHistory = useCallback(async (songId) => {
        const entry = { song_id: String(songId), played_at: new Date().toISOString() };
        dispatch({ type: 'UPDATE_HISTORY', payload: entry });
        if (!user || !supabase) return;
        await supabase
            .from('listening_history')
            .insert([{ user_id: user.id, song_id: String(songId) }])
            .select('*')
            .single();
    }, [user]);

    const getShuffledIndex = useCallback((current) => {
        let next;
        do {
            next = Math.floor(Math.random() * playlist.length);
        } while (next === current && playlist.length > 1);
        return next;
    }, []);

    const getNextSongIndex = useCallback((current) => {
        if (shuffleEnabled) return getShuffledIndex(current);
        if (repeatMode === 'one') return current;
        return (current + 1) % playlist.length;
    }, [shuffleEnabled, repeatMode, getShuffledIndex]);

    const getPrevSongIndex = useCallback((current) => {
        if (shuffleEnabled) return getShuffledIndex(current);
        if (repeatMode === 'one') return current;
        return (current - 1 + playlist.length) % playlist.length;
    }, [shuffleEnabled, repeatMode, getShuffledIndex]);

    // Playback Handlers
    const handleNext = useCallback(() => {
        if (queue.length > 0) {
            const nextInQueue = queue[0];
            dispatch({ type: 'POP_QUEUE' });
            dispatch({ type: 'PLAY_SEARCHED', payload: nextInQueue }); 
            loadSong(nextInQueue.audio, true);
            return;
        }
        const nextIndex = getNextSongIndex(currentSongIndex);
        const nextSong = playlist[nextIndex];
        if (nextSong) {
            dispatch({ type: 'SET_SONG_INDEX', payload: nextIndex });
            loadSong(nextSong.audio, true);
        }
    }, [currentSongIndex, loadSong, queue, getNextSongIndex]);

    const handlePrev = useCallback(() => {
        const prevIndex = getPrevSongIndex(currentSongIndex);
        const prevSong = playlist[prevIndex];
        if (prevSong) {
            dispatch({ type: 'SET_SONG_INDEX', payload: prevIndex });
            loadSong(prevSong.audio, true);
        }
    }, [currentSongIndex, loadSong, getPrevSongIndex]);

    const playSong = useCallback((index) => {
        const songToPlay = playlist[index];
        if (songToPlay && songToPlay.audio) {
            isFirstLoad.current = false;
            dispatch({ type: 'SET_SONG_INDEX', payload: index });
            loadSong(songToPlay.audio, true);
            addToHistory(songToPlay.id);
        }
    }, [loadSong, addToHistory]);

    useEffect(() => {
        onEndedRef.current = handleNext;
    }, [handleNext]);

    const toggleLike = useCallback(async (songId) => {
        if (!user || !supabase) {
            showNotification(!supabase ? 'Supabase not initialized' : 'Please log in to like songs');
            return;
        }

        const isLiked = likedSongs.some(id => String(id) === String(songId));
        
        if (isLiked) {
            const { error } = await supabase
                .from('liked_songs')
                .delete()
                .eq('user_id', user.id)
                .eq('song_id', String(songId));
            
            if (!error) {
                dispatch({ type: 'TOGGLE_LIKE', payload: songId });
            }
        } else {
            const { error } = await supabase
                .from('liked_songs')
                .insert([{ user_id: user.id, song_id: String(songId) }]);
            
            if (!error) {
                dispatch({ type: 'TOGGLE_LIKE', payload: songId });
                showNotification('Added to Liked Songs');
            }
        }
    }, [user, likedSongs, showNotification]);

    const togglePlaylist = useCallback((val) => {
        dispatch({ type: 'TOGGLE_PLAYLIST', payload: val });
    }, []);

    const toggleRightSidebar = useCallback((val) => {
        dispatch({ type: 'TOGGLE_RIGHT_SIDEBAR', payload: val });
    }, []);

    const playSearchedSong = useCallback((song) => {
        isFirstLoad.current = false;
        
        const index = playlist.findIndex(s => s.id === song.id);
        if (index !== -1) {
            dispatch({ type: 'SET_SONG_INDEX', payload: index });
            if (playlist[index].audio) {
                loadSong(playlist[index].audio, true);
                addToHistory(song.id);
            }
        } else {
            dispatch({ type: 'PLAY_SEARCHED', payload: song });
            if (song.audio) {
                loadSong(song.audio, true);
                addToHistory(song.id);
            }
        }
    }, [loadSong, playlist, addToHistory]);

    // Offline Download State
    const [downloadState, setDownloadState] = useState({ downloadedIds: new Set(), downloadingIds: new Set() });

    useEffect(() => {
        getDownloadedSongs().then(songs => {
            setDownloadState(prev => ({ ...prev, downloadedIds: new Set(songs.map(s => String(s.id))) }));
        });
    }, []);

    const downloadSong = useCallback(async (song, onProgress) => {
        const id = String(song.id);
        if (downloadState.downloadingIds.has(id) || downloadState.downloadedIds.has(id)) return;
        setDownloadState(prev => ({ ...prev, downloadingIds: new Set([...prev.downloadingIds, id]) }));
        try {
            await fetchAndStoreAudio(song, onProgress);
            setDownloadState(prev => {
                const newDownloading = new Set(prev.downloadingIds);
                newDownloading.delete(id);
                return { downloadedIds: new Set([...prev.downloadedIds, id]), downloadingIds: newDownloading };
            });
            showNotification(`"${song.name}" saved offline`);
        } catch (err) {
            setDownloadState(prev => {
                const newDownloading = new Set(prev.downloadingIds);
                newDownloading.delete(id);
                return { ...prev, downloadingIds: newDownloading };
            });
            showNotification(err.message || 'Download failed');
        }
    }, [downloadState, showNotification]);

    const removeDownload = useCallback(async (songId) => {
        const id = String(songId);
        await removeAudio(id);
        setDownloadState(prev => {
            const newIds = new Set(prev.downloadedIds);
            newIds.delete(id);
            return { ...prev, downloadedIds: newIds };
        });
        showNotification('Removed from offline storage');
    }, [showNotification]);

    const isSongDownloaded = useCallback((songId) => {
        return downloadState.downloadedIds.has(String(songId));
    }, [downloadState.downloadedIds]);

    const isSongDownloading = useCallback((songId) => {
        return downloadState.downloadingIds.has(String(songId));
    }, [downloadState.downloadingIds]);

    const createPlaylist = useCallback(async (name) => {
        if (!user || !supabase) return { success: false, message: 'Supabase not initialized' };
        const { data, error } = await supabase
            .from('playlists')
            .insert([{ user_id: user.id, name }])
            .select('*')
            .single();
        
        if (!error && data) {
            dispatch({ type: 'ADD_PLAYLIST', payload: { ...data, playlist_songs: [] } });
            showNotification(`Playlist "${name}" created`);
            return { success: true, data };
        }
        return { success: false, message: error?.message || 'Failed to create playlist' };
    }, [user, showNotification]);

    const addSongToPlaylist = useCallback(async (playlistId, songId) => {
        if (!user || !supabase) return { success: false, message: 'Supabase not initialized' };
        const { data, error } = await supabase
            .from('playlist_songs')
            .insert([{ playlist_id: playlistId, song_id: String(songId) }])
            .select('*')
            .single();
        
        if (!error && data) {
            const normalizedData = { ...data, song_id: Number(data.song_id) };
            dispatch({ type: 'ADD_SONG_TO_PLAYLIST', payload: { playlistId, song: normalizedData } });
            showNotification('Added to playlist');
            return { success: true };
        } else if (error?.code === '23505') {
            showNotification('Song already in playlist');
            return { success: false, message: 'Already in playlist' };
        }
        return { success: false, message: error?.message || 'Failed to add song' };
    }, [user, showNotification]);

    const removeSongFromPlaylist = useCallback(async (playlistId, recordId) => {
        if (!user || !supabase) return { success: false };
        const { error } = await supabase
            .from('playlist_songs')
            .delete()
            .eq('id', recordId);
        
        if (!error) {
            dispatch({ type: 'REMOVE_SONG_FROM_PLAYLIST', payload: { playlistId, recordId } });
            showNotification('Removed from playlist');
            return { success: true };
        }
        return { success: false };
    }, [user, showNotification]);

    // Sleep Timer
    useEffect(() => {
        if (!sleepTimer || !audio.isPlaying) return;
        const remaining = sleepTimer.endTime - Date.now();
        if (remaining <= 0) {
            audio.togglePlay();
            dispatch({ type: 'SET_SLEEP_TIMER', payload: null });
            showNotification('Sleep timer ended');
            return;
        }
        const timeout = setTimeout(() => {
            audio.togglePlay();
            dispatch({ type: 'SET_SLEEP_TIMER', payload: null });
            showNotification('Sleep timer ended');
        }, remaining);
        return () => clearTimeout(timeout);
    }, [sleepTimer, audio.isPlaying, audio.togglePlay, showNotification]);

    // Lyrics Handling (Real API with fallback)
    useEffect(() => {
        if (!currentSong) return;

        const getLyrics = async () => {
            dispatch({ type: 'SET_LYRICS_LOADING', payload: true });

            const real = await fetchRealLyrics(currentSong.artist, currentSong.name);
            if (real) {
                dispatch({ type: 'SET_LYRICS', payload: real });
                return;
            }

            setTimeout(() => {
                const mockLyrics = [
                    { time: 0, text: `♪ ${currentSong.name}` },
                    { time: 5, text: `by ${currentSong.artist}` },
                    { time: 15, text: "No real lyrics found online" },
                    { time: 25, text: "But the vibe is real." },
                    { time: 35, text: "Enjoy the music!" },
                ];
                dispatch({ type: 'SET_LYRICS', payload: mockLyrics });
            }, 500);
        };

        getLyrics();
    }, [currentSong]);

    // Media Session Metadata & Actions
    useEffect(() => {
        if ('mediaSession' in navigator && currentSong) {
            navigator.mediaSession.metadata = new window.MediaMetadata({
                title: currentSong.name,
                artist: currentSong.artist,
                album: currentSong.album || 'Local Music',
                artwork: [
                    { src: currentSong.image, sizes: '96x96', type: 'image/webp' },
                    { src: currentSong.image, sizes: '128x128', type: 'image/webp' },
                    { src: currentSong.image, sizes: '192x192', type: 'image/webp' },
                    { src: currentSong.image, sizes: '256x256', type: 'image/webp' },
                    { src: currentSong.image, sizes: '384x384', type: 'image/webp' },
                    { src: currentSong.image, sizes: '512x512', type: 'image/webp' },
                ]
            });

            navigator.mediaSession.setActionHandler('play', audio.togglePlay);
            navigator.mediaSession.setActionHandler('pause', audio.togglePlay);
            navigator.mediaSession.setActionHandler('previoustrack', handlePrev);
            navigator.mediaSession.setActionHandler('nexttrack', handleNext);
            navigator.mediaSession.setActionHandler('seekto', (details) => {
                audio.seek(details.seekTime);
            });
        }
    }, [currentSong, audio, handleNext, handlePrev]);

    // Theme Color Extraction
    useEffect(() => {
        if (currentSong) {
            extractPrimaryColor(currentSong.image).then(color => {
                document.documentElement.style.setProperty('--theme-color', color);
            });
        }
    }, [currentSong]);

    const value = useMemo(() => ({
        ...audio,
        currentSong,
        currentSongIndex,
        playlist,
        likedSongs,
        toggleLike,
        handleNext,
        handlePrev,
        playSong,
        isPlaylistOpen,
        setIsPlaylistOpen: (val) => dispatch({ type: 'TOGGLE_PLAYLIST', payload: val }),
        togglePlaylist,
        isRightSidebarOpen,
        setIsRightSidebarOpen: (val) => dispatch({ type: 'TOGGLE_RIGHT_SIDEBAR', payload: val }),
        toggleRightSidebar,
        isMobilePlayerOpen,
        setIsMobilePlayerOpen,
        searchResults,
        setSearchResults: (results) => dispatch({ type: 'SET_SEARCH_RESULTS', payload: results }),
        playSearchedSong,
        userPlaylists,
        history,
        createPlaylist,
        addSongToPlaylist,
        removeSongFromPlaylist,
        isPlaylistModalOpen: state.isPlaylistModalOpen,
        playlistModalSongId: state.playlistModalSongId,
        openPlaylistModal: (songId) => dispatch({ type: 'TOGGLE_PLAYLIST_MODAL', payload: { isOpen: true, songId } }),
        closePlaylistModal: () => dispatch({ type: 'TOGGLE_PLAYLIST_MODAL', payload: { isOpen: false } }),
        
        // Equalizer & Visualizer
        isEqualizerOpen: state.isEqualizerOpen,
        openEqualizer: () => dispatch({ type: 'SET_EQUALIZER_OPEN', payload: true }),
        closeEqualizer: () => dispatch({ type: 'SET_EQUALIZER_OPEN', payload: false }),
        isVolumeSuiteOpen: state.isVolumeSuiteOpen,
        openVolumeSuite: () => dispatch({ type: 'SET_VOLUME_SUITE_OPEN', payload: true }),
        closeVolumeSuite: () => dispatch({ type: 'SET_VOLUME_SUITE_OPEN', payload: false }),
        analyser: audio.analyser,
        showVisualizer: state.showVisualizer,
        toggleVisualizer: () => dispatch({ type: 'TOGGLE_VISUALIZER' }),

        lyrics: state.lyrics,
        lyricsLoading: state.lyricsLoading,
        queue,
        addToQueue,
        playNext,
        removeFromQueue,
        clearQueue,
        reorderQueue,
        playbackSpeed,
        setPlaybackSpeed,
        notification,

        // New Features
        sleepTimer,
        setSleepTimer,
        shuffleEnabled,
        toggleShuffle,
        repeatMode,
        cycleRepeatMode,

        // Offline Download
        downloadSong,
        removeDownload,
        isSongDownloaded,
        isSongDownloading,
    }), [
        audio,
        currentSong,
        currentSongIndex,
        likedSongs,
        toggleLike,
        handleNext,
        handlePrev,
        playSong,
        isPlaylistOpen,
        togglePlaylist,
        isRightSidebarOpen,
        toggleRightSidebar,
        isMobilePlayerOpen,
        setIsMobilePlayerOpen,
        searchResults,
        state.currentActiveId,
        userPlaylists,
        history,
        createPlaylist,
        addSongToPlaylist,
        removeSongFromPlaylist,
        state.isPlaylistModalOpen,
        state.playlistModalSongId,
        state.lyrics,
        state.lyricsLoading,
        queue,
        addToQueue,
        playNext,
        removeFromQueue,
        clearQueue,
        reorderQueue,
        playbackSpeed,
        setPlaybackSpeed,
        notification,
        sleepTimer,
        setSleepTimer,
        shuffleEnabled,
        toggleShuffle,
        repeatMode,
        cycleRepeatMode,
        downloadSong,
        removeDownload,
        isSongDownloaded,
        isSongDownloading,
    ]);

    return (
        <MusicContext.Provider value={value}>
            {children}
        </MusicContext.Provider>
    );
};
