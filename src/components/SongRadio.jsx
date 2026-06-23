import { useMusic } from '../context/MusicContext';
import { Radio, Music2, Play, Plus } from 'lucide-react';
import { useMemo } from 'react';

const ARTIST_CLUSTERS = {
  'The Weeknd': ['After Hours', 'Timeless', 'Lost In The Fire'],
  'Ed Sheeran': ['Shape of You'],
  'Harry Styles': ['Watermelon Sugar', 'As It Was'],
  'Dua Lipa': ['Levitating'],
  'Selena Gomez': ['Good For You'],
  'Glass Animals': ['Heat Waves'],
  'The Chainsmokers': ['Closer'],
  'Falak Shabir': ['Ijazat'],
  'Yo Yo Honey Singh': ['Superman', 'Call Aundi', 'Desi Kalakaar'],
  'Ayushmann Khurrana': ['Mitti Di Khushboo'],
};

const SongRadio = () => {
  const { currentSong, playlist, playSearchedSong, addToQueue } = useMusic();

  const recommendations = useMemo(() => {
    if (!currentSong) return [];

    const artistCluster = ARTIST_CLUSTERS[currentSong.artist] || [];
    const sameArtist = playlist.filter(s => s.artist === currentSong.artist && s.id !== currentSong.id);
    const others = playlist.filter(s => s.artist !== currentSong.artist);

    const scored = others.map((song, idx) => {
      let score = 0;
      if (artistCluster.includes(song.name)) score += 5;
      if (ARTIST_CLUSTERS[song.artist]?.some(t => artistCluster.includes(t))) score += 3;
      score += (idx % 3) * 0.5;
      return { song, score };
    });

    scored.sort((a, b) => b.score - a.score);
    const mixed = [...sameArtist, ...scored.map(s => s.song)];
    return mixed.slice(0, 8);
  }, [currentSong, playlist]);

  if (!currentSong || recommendations.length === 0) return null;

  return (
    <div className="w-full bg-white/5 rounded-2xl p-4 border border-white/5 space-y-3">
      <div className="flex items-center gap-2 text-cyan-400 mb-2">
        <Radio size={16} />
        <span className="text-xs font-bold uppercase tracking-wider">Smart Radio</span>
      </div>
      <p className="text-[10px] text-zinc-500 mb-3">Based on "{currentSong.name}"</p>
      <div className="space-y-1.5">
        {recommendations.map(song => (
          <div
            key={song.id}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/5 transition-colors group cursor-pointer"
            onClick={() => playSearchedSong(song)}
          >
            <div className="w-8 h-8 rounded-md overflow-hidden flex-shrink-0 bg-zinc-800">
              <img src={song.image} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{song.name}</p>
              <p className="text-[10px] text-zinc-400 truncate">{song.artist}</p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); addToQueue(song); }}
              className="p-1 text-zinc-500 hover:text-white opacity-0 group-hover:opacity-100 transition-all"
            >
              <Plus size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SongRadio;
