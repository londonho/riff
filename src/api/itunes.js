export function normalizeTrack(raw) {
    if (raw.trackId == null || raw.trackName == null) {
        return null;
    }
    return {
        id: String(raw.trackId),
        title: raw.trackName || 'Unknown Title',
        artist: raw.artistName || 'Unknown Artist',
        album: raw.collectionName || 'Unknown Album',
        genre: raw.primaryGenreName || 'Unknown Genre',
        artwork: raw.artworkUrl100 ? raw.artworkUrl100.replace('100x100bb', '600x600bb') : null,
        artworkSmall: raw.artworkUrl100 ? raw.artworkUrl100 : null,
        previewUrl: raw.previewUrl ? raw.previewUrl : null,
        releaseDate: raw.releaseDate ? raw.releaseDate : null,
        durationMs: raw.trackTimeMillis ? raw.trackTimeMillis : 0,
        explicit: raw.trackExplicitness ? raw.trackExplicitness === 'explicit' : false,
        artistId: raw.artistId ? String(raw.artistId) : null,
        collectionId: raw.collectionId ? String(raw.collectionId) : null,
    }
}

const ITUNES_SEARCH_ENDPOINT = 'https://itunes.apple.com/search';

function buildSearchURL(term, limit) {
    return ITUNES_SEARCH_ENDPOINT + `?term=${encodeURIComponent(term)}&entity=song&media=music&limit=${limit}`;
}

export async function searchSongs(term, { limit = 50 } = {}) {
    if (term.trim().length < 2) {
        return [];
    }
    const url = buildSearchURL(term.trim(), limit);
    let res;
    try {
        res = await fetch(url);
    } catch (err) {
        const e = new Error('Network Error: ' + NetworkError.message);
        e.userMessage = 'Failed to fetch songs from iTunes. Please try again later.';
        throw e;
    }
    if (!res.ok) {
            const e = new Error('HTTP Error: ' + res.status);
            e.userMessage = 'Failed to fetch songs from iTunes. Please try again later.';
            throw e;
        }
    let jsonData;
    try {
        const data = await res.text();
        jsonData = JSON.parse(data);
    } catch (error) {
        const e = new Error('Error parsing text: ' + error.message);
        e.userMessage = 'Failed to parse text from iTunes. Please try again later.';
        throw e;
    }
    const rows = Array.isArray(jsonData?.results) ? jsonData.results : [];
    return deDupeTracks(rows.map(normalizeTrack).filter(track => track !== null));
}

function deDupeTracks(tracks) {
    const seen = new Set();
    const kept = [];
    for (const track of tracks) {
        const key = JSON.stringify([track.title, track.artist, track.album, track.durationMs]);
        if (!seen.has(key) && !seen.has(track.id)) {
            seen.add(key);
            seen.add(track.id);
            kept.push(track);
        }
    }
    return kept;
}   