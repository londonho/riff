export function songKey(song) {
    if (!song) return '';
    const norm = (value) =>
        String(value || '')
            .toLowerCase()
            .replace(/\(.*?\)|\[.*?\]/g, ' ')
            .replace(/[^a-z0-9]+/g, ' ')
            .trim();
    const title = norm(song.title);
    const artist = norm(song.artist);
    if (!title || !artist) return '';
    return `${title}|${artist}`;
}

function genreCounts(entries) {
    const counts = new Map();
    entries.forEach((e) => {
        const genre = (e.song && e.song.genre) || 'Unknown';
        counts.set(genre, (counts.get(genre) || 0) + 1);
    });
    return counts;
}

export function genreSimilarity(mine = [], theirs = []) {
    if (!mine.length || !theirs.length) return null;
    const a = genreCounts(mine);
    const b = genreCounts(theirs);
    let dot = 0;
    let normA = 0;
    let normB = 0;
    new Set([...a.keys(), ...b.keys()]).forEach((genre) => {
        const x = a.get(genre) || 0;
        const y = b.get(genre) || 0;
        dot += x * y;
        normA += x * x;
        normB += y * y;
    });
    if (!normA || !normB) return null;
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

function artistSet(entries) {
    const set = new Set();
    entries.forEach((e) => {
        const artist = String((e.song && e.song.artist) || '').toLowerCase().trim();
        if (artist) set.add(artist);
    });
    return set;
}

export function artistSimilarity(mine = [], theirs = []) {
    if (!mine.length || !theirs.length) return null;
    const a = artistSet(mine);
    const b = artistSet(theirs);
    if (!a.size || !b.size) return null;
    let shared = 0;
    a.forEach((artist) => {
        if (b.has(artist)) shared += 1;
    });
    const union = a.size + b.size - shared;
    return union === 0 ? null : shared / union;
}

export function sharedSongs(mine = [], theirs = []) {
    const index = new Map();
    theirs.forEach((e) => {
        const key = songKey(e.song);
        if (key && !index.has(key)) index.set(key, e);
    });

    const out = [];
    const seen = new Set();
    mine.forEach((e) => {
        const key = songKey(e.song);
        if (!key || seen.has(key) || !index.has(key)) return;
        seen.add(key);
        out.push({ key, mine: e, theirs: index.get(key) });
    });
    return out;
}

export function catalogOverlap(mine = [], theirs = []) {
    if (!mine.length || !theirs.length) return null;
    return sharedSongs(mine, theirs).length / Math.min(mine.length, theirs.length);
}

export function scoreAgreement(mine = [], theirs = []) {
    const shared = sharedSongs(mine, theirs);
    if (!shared.length) return null;
    const totalGap = shared.reduce(
        (sum, pair) => sum + Math.abs((pair.mine.score || 0) - (pair.theirs.score || 0)),
        0,
    );
    return 1 - totalGap / shared.length / 10;
}

export const WEIGHTS = {
    genre: 0.4,
    agreement: 0.25,
    artist: 0.2,
    catalog: 0.15,
};

export function matchLabel(score) {
    if (score >= 80) return 'Musical twins';
    if (score >= 60) return 'Strong match';
    if (score >= 40) return 'Some overlap';
    if (score >= 20) return 'Different lanes';
    return 'Opposites';
}

export function compareTastes(mine = [], theirs = []) {
    const signals = {
        genre: genreSimilarity(mine, theirs),
        agreement: scoreAgreement(mine, theirs),
        artist: artistSimilarity(mine, theirs),
        catalog: catalogOverlap(mine, theirs),
    };

    let weighted = 0;
    let usedWeight = 0;
    Object.keys(WEIGHTS).forEach((name) => {
        if (signals[name] === null) return;
        weighted += signals[name] * WEIGHTS[name];
        usedWeight += WEIGHTS[name];
    });

    const score = usedWeight === 0 ? 0 : Math.round((weighted / usedWeight) * 100);

    return {
        score,
        label: matchLabel(score),
        signals,
        usedWeight,
        shared: sharedSongs(mine, theirs),
    };
}