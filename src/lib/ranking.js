export const SENTIMENTS = [
    {
        key: 'liked',
        label: 'I liked it!',
        short: 'Loved',
        emoji: '🔥',
        range: [6.7, 10.0],
        color: '#12A67E',
        soft: '#E2F4EF'
    },
    {
        key: 'fine',
        label: 'It was fine',
        short: 'Fine',
        emoji: '😐',
        range: [3.4, 6.6],
        color: '#DFA02A',
        soft: '#FBF0DA'
    },
    {
        key: 'disliked',
        label: "I didn't like it",
        short: 'Skips',
        emoji: '🥴',
        range: [0.0, 3.3],
        color: '#D2543F',
        soft: '#FAE5E1'
    }
];

export const SENTIMENT_ORDER = SENTIMENTS.map((s) => s.key);

export const CHOICE = {
    NEW: 'new',
    EXISTING: 'existing',
    TIE: 'tie',
};

export function getSentiment(key) {
    return SENTIMENTS.find((s) => s.key === key) || SENTIMENTS[1];
}

export function sentimentRank(key) {
    const i = SENTIMENT_ORDER.indexOf(key);
    return i === -1 ? SENTIMENT_ORDER.length : i;
}

export function bucketOf(entries = [], sentiment) {
    return entries.filter((e) => e && e.sentiment === sentiment);
}

export function findEntryBySongId(entries = [], songId) {
    return entries.find((e) => e.song && String(e.song.id) === String(songId)) || null;
}

export function estimateComparisons(n) {
    const size = Math.max(0, Number(n) || 0);
    if (size === 0) return 0;
    return Math.ceil(Math.log2(size + 1));
}

export function rescore(orderedEntries = []) { 
    const out = [];
    
    SENTIMENT_ORDER.forEach((key) => {
        const bucket = orderedEntries.filter((e) => e && e.sentiment === key);
        const [low, high] = getSentiment(key).range;
        const n = bucket.length;

        bucket.forEach((entry, i) => {
            let score;
            if (n === 1) {
                score = high - (high - low) * 0.15;
            } else {
                score = high - (high - low) * (i / (n - 1));
            }
            out.push({ ...entry, score: Math.round(score * 10) / 10 });
        });
    });

    return out.map((entry, i) => ({ ...entry, rank: i + 1 }));
}
export function normalize(entries = []) { 
    const ordered = [];

    SENTIMENT_ORDER.forEach((key) => {
        entries.forEach((e) => {
            if (e && e.sentiment === key) ordered.push(e);
        });
    });

    entries.forEach((e) => {
        if (e && SENTIMENT_ORDER.indexOf(e.sentiment) === -1) {
            ordered.push({ ...e, sentiment: 'fine'});
        }
    });

    return rescore(ordered);
}

export function insertEntry(entries = [], entry, indexInBucket = 0) { 
    const target = sentimentRank(entry.sentiment);

    const before = entries.filter((e) => sentimentRank(e.sentiment) < target);
    const after = entries.filter((e) => sentimentRank(e.sentiment) > target);
    const bucket = bucketOf(entries, entry.sentiment);

    const idx = Math.max(0, Math.min(bucket.length, indexInBucket));
    bucket.splice(idx, 0, entry);

    return rescore([ ...before, ...bucket, ...after]);
}

export function removeEntry(entries = [], entryId) { 
    return rescore(entries.filter((e) => e.id !== entryId));
}
export function createSession() { throw new Error('placeholder'); }
export function answer() { throw new Error('placeholder'); }
export function undo() { throw new Error('placeholder'); }
export function tasteProfile() { throw new Error('placeholder'); }
export function topArtists() { throw new Error('placeholder'); }
export function libraryStats() { throw new Error('placeholder'); }