import {
  SENTIMENTS,
  CHOICE,
  getSentiment,
  sentimentRank,
  bucketOf,
  findEntryBySongId,
  estimateComparisons,
  rescore,
  normalize,
  insertEntry,
  removeEntry,
  createSession,
  answer,
  undo,
  tasteProfile,
  topArtists,
  libraryStats,
} from './ranking.js';

let passed = 0;
const failures = [];
let currentPart = '';

const part = (name) => {
  currentPart = name;
};

function test(name, fn) {
  try {
    fn();
    passed += 1;
    console.log(`  \x1b[32m✓\x1b[0m ${name}`);
  } catch (err) {
    failures.push({ part: currentPart, name, message: err.message });
    console.log(`  \x1b[31m✗\x1b[0m ${name}\n      ${err.message}`);
  }
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg || 'assertion failed');
}

function eq(actual, expected, msg) {
  const a = JSON.stringify(actual);
  const b = JSON.stringify(expected);
  if (a !== b) throw new Error(`${msg || 'not equal'}: got ${a}, expected ${b}`);
}

const song = (id, extra = {}) => ({
  id: String(id),
  title: `Song ${id}`,
  artist: extra.artist || `Artist ${id}`,
  album: `Album ${id}`,
  genre: extra.genre || 'Pop',
});

const entry = (id, sentiment = 'liked', extra = {}) => ({
  id: `e${id}`,
  song: song(id, extra),
  sentiment,
  note: '',
});

part('1 — lookups');
console.log('\nPart 1 — lookups');

test('getSentiment finds a band and falls back to the middle one', () => {
  eq(getSentiment('liked').range, [6.7, 10]);
  eq(getSentiment('disliked').range, [0, 3.3]);
  eq(getSentiment('nonsense').key, 'fine', 'unknown keys fall back to fine');
});

test('sentimentRank orders the bands', () => {
  eq(sentimentRank('liked'), 0);
  eq(sentimentRank('fine'), 1);
  eq(sentimentRank('disliked'), 2);
  assert(sentimentRank('mystery') > 2, 'unknown sentiments must sort last');
});

test('bucketOf filters to one band, preserving order', () => {
  const list = [entry(1, 'liked'), entry(2, 'fine'), entry(3, 'liked')];
  eq(bucketOf(list, 'liked').map((e) => e.id), ['e1', 'e3']);
  eq(bucketOf(list, 'disliked'), []);
});

test('findEntryBySongId compares ids as strings', () => {
  const list = [entry(42, 'liked')];
  assert(findEntryBySongId(list, '42'), 'should find by string id');
  assert(findEntryBySongId(list, 42), 'should find by numeric id');
  assert(!findEntryBySongId(list, '99'), 'should not invent a match');
});

part('2 — question count');
console.log('\nPart 2 — how many questions');

test('estimateComparisons grows logarithmically', () => {
  eq(estimateComparisons(0), 0, 'an empty band needs no questions');
  eq(estimateComparisons(1), 1);
  eq(estimateComparisons(3), 2);
  eq(estimateComparisons(7), 3);
  eq(estimateComparisons(15), 4);
  eq(estimateComparisons(1000), 10);
});

part('3 — scoring');
console.log('\nPart 3 — scoring');

test('a lone song sits 15% down from the top of its band', () => {
  const out = rescore([entry(1, 'liked')]);
  eq(out[0].score, 9.5);
  eq(out[0].rank, 1);
});

test('a full band spreads across its whole range', () => {
  const out = rescore([entry(1, 'liked'), entry(2, 'liked'), entry(3, 'liked'), entry(4, 'liked')]);
  eq(out.map((e) => e.score), [10, 8.9, 7.8, 6.7]);
  eq(out.map((e) => e.rank), [1, 2, 3, 4]);
});

test('scores never leave their band and never increase down the list', () => {
  const list = rescore([
    entry(1, 'liked'), entry(2, 'liked'),
    entry(3, 'fine'), entry(4, 'fine'),
    entry(5, 'disliked'),
  ]);
  list.forEach((e) => {
    const [low, high] = getSentiment(e.sentiment).range;
    assert(e.score >= low - 0.001 && e.score <= high + 0.001, `${e.id} scored ${e.score}, outside ${low}-${high}`);
  });
  for (let i = 1; i < list.length; i += 1) {
    assert(list[i].score <= list[i - 1].score + 0.001, 'scores must descend');
  }
});

test('rescore is stable: running it twice changes nothing', () => {
  const once = rescore([entry(1, 'liked'), entry(2, 'liked')]);
  eq(rescore(once), once);
});

test('normalize regroups bands and rescues unknown sentiments', () => {
  const messy = [entry(1, 'disliked'), entry(2, 'liked'), { ...entry(3), sentiment: 'mystery' }];
  const fixed = normalize(messy);
  eq(fixed.length, 3, 'nothing may be dropped');
  eq(fixed.map((e) => e.sentiment), ['liked', 'fine', 'disliked']);
  eq(fixed.map((e) => e.rank), [1, 2, 3]);
});

part('4 — insert and remove');
console.log('\nPart 4 — inserting and removing');

test('insertEntry keeps bands contiguous and in order', () => {
  let list = [];
  list = insertEntry(list, entry(1, 'disliked'), 0);
  list = insertEntry(list, entry(2, 'liked'), 0);
  list = insertEntry(list, entry(3, 'fine'), 0);
  list = insertEntry(list, entry(4, 'liked'), 1);
  eq(list.map((e) => e.sentiment), ['liked', 'liked', 'fine', 'disliked']);
  eq(list.map((e) => e.id), ['e2', 'e4', 'e3', 'e1']);
  eq(list.map((e) => e.rank), [1, 2, 3, 4]);
});

test('an out-of-range insert index is clamped, not fatal', () => {
  const list = insertEntry([entry(1, 'liked')], entry(2, 'liked'), 99);
  eq(list.map((e) => e.id), ['e1', 'e2']);
});

test('removeEntry re-ranks and re-scores what is left', () => {
  let list = [];
  ['a', 'b', 'c'].forEach((id, i) => {
    list = insertEntry(list, entry(id, 'liked'), i);
  });
  list = removeEntry(list, 'eb');
  eq(list.map((e) => e.song.id), ['a', 'c']);
  eq(list.map((e) => e.rank), [1, 2]);
  eq(list.map((e) => e.score), [10, 6.7]);
});

part('5 — the comparison session');
console.log('\nPart 5 — the comparison session');

test('an empty band finishes with no questions', () => {
  const s = createSession(song('new'), 'liked', []);
  assert(s.finished, 'should be finished immediately');
  eq(s.insertIndex, 0);
  eq(s.asked, 0);
});

test('always preferring the new song puts it on top', () => {
  const bucket = ['a', 'b', 'c'].map((id) => entry(id, 'liked'));
  let s = createSession(song('z'), 'liked', bucket);
  while (!s.finished) s = answer(s, CHOICE.NEW);
  eq(s.insertIndex, 0);
});

test('always preferring the existing song puts it at the bottom', () => {
  const bucket = ['a', 'b', 'c'].map((id) => entry(id, 'liked'));
  let s = createSession(song('z'), 'liked', bucket);
  while (!s.finished) s = answer(s, CHOICE.EXISTING);
  eq(s.insertIndex, 3);
});

test('"too close to call" parks it beside the opponent and stops', () => {
  const bucket = ['a', 'b', 'c', 'd', 'e'].map((id) => entry(id, 'liked'));
  const s = createSession(song('z'), 'liked', bucket);
  const idx = s.opponentIndex;
  const done = answer(s, CHOICE.TIE);
  assert(done.finished, 'a tie ends the session');
  eq(done.insertIndex, idx + 1);
  eq(done.asked, 1);
});

test('undo reopens the previous question', () => {
  const bucket = ['a', 'b', 'c', 'd', 'e', 'f', 'g'].map((id) => entry(id, 'liked'));
  const s0 = createSession(song('z'), 'liked', bucket);
  const s1 = answer(s0, CHOICE.NEW);
  const back = undo(s1);
  eq(back.lo, s0.lo);
  eq(back.hi, s0.hi);
  eq(back.opponentIndex, s0.opponentIndex);
  eq(back.asked, 0);
  assert(!back.finished, 'undo must reopen the session');
});

test('answer() does not mutate the session it was given', () => {
  const bucket = ['a', 'b', 'c'].map((id) => entry(id, 'liked'));
  const s0 = createSession(song('z'), 'liked', bucket);
  const before = JSON.stringify({ lo: s0.lo, hi: s0.hi, asked: s0.asked });
  answer(s0, CHOICE.NEW);
  eq(JSON.stringify({ lo: s0.lo, hi: s0.hi, asked: s0.asked }), before, 'React state must not be mutated in place');
});

test('THE BIG ONE: 25 songs land in exactly the right order', () => {
  const truth = Array.from({ length: 25 }, (_, i) => String(i));
  const insertOrder = truth.slice().sort((a, b) => ((Number(a) * 7) % 25) - ((Number(b) * 7) % 25));

  let entries = [];
  insertOrder.forEach((id) => {
    const candidate = song(id);
    const bucket = bucketOf(entries, 'liked');
    let session = createSession(candidate, 'liked', bucket);
    let guard = 0;
    while (!session.finished) {
      guard += 1;
      if (guard > 40) throw new Error('the session never terminated');
      const opponentTruth = truth.indexOf(session.opponent.song.id);
      const candidateTruth = truth.indexOf(candidate.id);
      session = answer(session, candidateTruth < opponentTruth ? CHOICE.NEW : CHOICE.EXISTING);
    }
    assert(
      session.asked <= estimateComparisons(bucket.length),
      `used ${session.asked} questions for a band of ${bucket.length} — the search is not halving`
    );
    entries = insertEntry(entries, entry(id, 'liked'), session.insertIndex);
  });

  eq(entries.map((e) => e.song.id), truth, 'the final order must match the listener taste order exactly');
});

/* ------------------------------------------------------------------ */
part('6 — taste profile');
console.log('\nPart 6 — the taste profile');

test('tasteProfile counts genres and shares', () => {
  let list = [];
  list = insertEntry(list, entry(1, 'liked', { genre: 'Hip-Hop/Rap' }), 0);
  list = insertEntry(list, entry(2, 'liked', { genre: 'Hip-Hop/Rap' }), 1);
  list = insertEntry(list, entry(3, 'fine', { genre: 'Pop' }), 0);
  list = insertEntry(list, entry(4, 'disliked', { genre: 'Country' }), 0);
  const profile = tasteProfile(list);
  eq(profile[0].genre, 'Hip-Hop/Rap');
  eq(profile[0].count, 2);
  eq(profile[0].share, 0.5);
  eq(profile.length, 3);
});

test('topArtists ranks by frequency', () => {
  let list = [];
  list = insertEntry(list, entry(1, 'liked', { artist: 'SZA' }), 0);
  list = insertEntry(list, entry(2, 'liked', { artist: 'SZA' }), 1);
  list = insertEntry(list, entry(3, 'liked', { artist: 'Drake' }), 2);
  eq(topArtists(list, 2), [{ artist: 'SZA', count: 2 }, { artist: 'Drake', count: 1 }]);
});

test('libraryStats survives an empty library', () => {
  eq(libraryStats([]), { total: 0, avg: 0, buckets: { liked: 0, fine: 0, disliked: 0 } });
  eq(tasteProfile([]), []);
});

/* ------------------------------------------------------------------ */
console.log('');
if (failures.length) {
  console.log(`\x1b[31m✗ ${failures.length} failing, ${passed} passing\x1b[0m`);
  console.log(`  next up: ${failures[0].part} — ${failures[0].name}\n`);
  process.exit(1);
}
console.log(`\x1b[32m✓ all ${passed} tests passed — the ranking engine is done\x1b[0m\n`);
