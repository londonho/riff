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

function step(session) {
    const next = { ...session };

    if (next.lo >= next.hi) {
        next.finished = true;
        next.insertIndex = next.lo;
        next.opponent = null;
        next.opponentIndex = -1;
        return next;
    }

    const mid = Math.floor((next.lo + next.hi) / 2);
    next.opponentIndex = mid;
    next.opponent = next.items[mid];
    next.finished = false;
    return next;
} 

export function createSession(song, sentiment, bucket = []) {
    const items = Array.isArray(bucket) ? bucket.slice() : [];

    return step({
        song,
        sentiment,
        items,
        lo: 0,
        hi: items.length,
        asked: 0,
        total: estimateComparisons(items.length),
        history: [],
        finished: false,
        insertIndex: 0,
        opponent: null,
        opponentIndex: -1,
    });
}

export function answer(session, choice) {
    if (!session || session.finished) return session;

    const { lo, hi, opponentIndex } = session;
    const history = session.history.concat([{ lo, hi, opponentIndex, choice }]);

    if (choice === CHOICE.TIE) {
        return {
            ...session,
            history,
            asked: session.asked + 1,
            finished: true,
            insertIndex: Math.min(hi, opponentIndex + 1),
            opponent: null,
            opponentIndex: -1,
        };
    }

    const next = { ...session, history, asked: session.asked + 1 };

    if (choice === CHOICE.NEW) {
        next.hi = opponentIndex;
    } else {
        next.lo = opponentIndex + 1;
    }

    return step(next);
} 
export function undo(session) {
    if (!session || !session.history.length) return session;

    const history = session.history.slice(0, -1);
    const last = session.history[session.history.length - 1];

    return step({
        ...session,
        history,
        asked: Math.max(0, session.asked - 1),
        lo: last.lo,
        hi: last.hi,
        finished: false,
    });
}
export function tasteProfile(entries = [], limit = 6) {
    const counts = new Map();

    entries.forEach((e) => {
        const genre = (e.song && e.song.genre) || 'Unknown';
        const prev = counts.get(genre) || { genre, count: 0, scoreSum: 0 };
        prev.count += 1;
        prev.scoreSum += typeof e.score === 'number' ? e.score : 0;
        counts.set(genre, prev);
    });

    const total = entries.length || 1;

    return Array.from(counts.values()).map((g) => ({
        genre: g.genre,
        count: g.count,
        share: g.count / total,
        avgScore: Math.round((g.scoreSum / g.count) * 10) / 10,
    })).sort((a, b) => b.count - a.count || a.genre.localeCompare(b.genre))
    .slice(0, limit);
}
export function topArtists(entries = [], limit = 3) {
    const counts = new Map();
    entries.forEach((e) => {
        const artist = (e.song && e.song.artist) || 'Unknown';
        counts.set(artist, (counts.get(artist) || 0) + 1);
    });

    return Array.from(counts.entries())
        .map(([artist, count]) => ({ artist, count }))
        .sort((a, b) => b.count - a.count || a.artist.localeCompare(b.artist))
        .slice(0, limit);
}
export function libraryStats(entries = []) {
    const total = entries.length;
    
    const avg = total
        ? Math.round((entries.reduce((sum, e) => sum + (e.score || 0), 0) / total) * 10) / 10 : 0;
    
    const buckets = SENTIMENT_ORDER.reduce((acc, key) => {
        acc[key] = entries.filter((e) => e.sentiment === key).length;
        return acc;
    }, {});

    return { total, avg, buckets };
}   