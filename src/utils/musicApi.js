import { playlist } from '../data';

/**
 * Searches songs from the local playlist in data.js
 */
export const searchSongs = async (query) => {
    try {
        if (!query || query.length < 1) return [];

        const lowercaseQuery = query.toLowerCase();

        // Filter local songs by name or artist
        const results = playlist.filter(song =>
            song.name.toLowerCase().includes(lowercaseQuery) ||
            song.artist.toLowerCase().includes(lowercaseQuery)
        );

        // Simulate async if needed, though local filter is instant
        return results;
    } catch (error) {
        console.error('Local Search failed:', error);
        return [];
    }
};

/**
 * Returns a subset of local songs as "trending"
 */
export const getTrendingSongs = async () => {
    try {
        // Just return the first few songs as trending/latest for local mode
        return playlist.slice(0, 10);
    } catch (error) {
        return [];
    }
};
