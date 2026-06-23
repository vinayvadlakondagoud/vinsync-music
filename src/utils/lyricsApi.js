const fetchRealLyrics = async (artist, title) => {
  const encodedArtist = encodeURIComponent(artist);
  const encodedTitle = encodeURIComponent(title);
  const url = `https://api.lyrics.ovh/v1/${encodedArtist}/${encodedTitle}`;

  // Try direct fetch first
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) throw new Error('Not found');
    const data = await res.json();
    if (!data.lyrics) throw new Error('No lyrics');
    return parseLyrics(data.lyrics);
  } catch {
    // CORS or network error — return null silently
    return null;
  }
};

const parseLyrics = (text) => {
  const lines = text.split('\n').filter(l => l.trim());
  const duration = 180;
  const interval = duration / lines.length;
  return lines.map((line, i) => ({
    time: i * interval,
    text: line.trim(),
  }));
};

export { fetchRealLyrics };