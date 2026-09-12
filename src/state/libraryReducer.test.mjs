import {
  ACTIONS,
  initialLibrary,
  libraryReducer,
} from './libraryReducer.js';

let passed = 0;
const failures = [];
let currentPart = '';

const part = (name) => { currentPart = name; };

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

const entry = (id, sentiment = 'liked') => ({
  id: `e${id}`,
  song: song(id),
  sentiment,
  note: '',
  addedAt: '2026-01-01T00:00:00.000Z',
});

const add = (e, insertIndex = 0) => ({ type: ACTIONS.ADD, entry: e, insertIndex });

part('1 — the shape');
console.log('\nPart 1 — the shape of state');

test('the initial state is empty and not ready', () => {
  eq(initialLibrary.entries, []);
  eq(initialLibrary.ready, false);
});

test('an unknown action returns the exact same object', () => {
  const state = { entries: [], ready: true };
  assert(libraryReducer(state, { type: 'nonsense' }) === state,
    'an unhandled action must return state by identity, not a copy');
});

part('2 — adding');
console.log('\nPart 2 — adding');

test('adding to an empty library scores the song', () => {
  const next = libraryReducer(initialLibrary, add(entry(1)));
  eq(next.entries.length, 1);
  eq(next.entries[0].score, 9.5);
  eq(next.entries[0].rank, 1);
});

test('adding does not mutate the state it was given', () => {
  const state = { entries: [], ready: true };
  libraryReducer(state, add(entry(1)));
  eq(state.entries, [], 'the original entries array must be untouched');
});

test('insertIndex decides the position inside the band', () => {
  let s = libraryReducer(initialLibrary, add(entry(1)));
  s = libraryReducer(s, add(entry(2), 0));
  eq(s.entries.map((e) => e.id), ['e2', 'e1'], 'index 0 means "better than everything"');

  let t = libraryReducer(initialLibrary, add(entry(1)));
  t = libraryReducer(t, add(entry(2), 1));
  eq(t.entries.map((e) => e.id), ['e1', 'e2']);
});

test('a song already in the library is rejected', () => {
  const first = libraryReducer(initialLibrary, add(entry(1)));
  const again = libraryReducer(first, add({ ...entry(1), id: 'different' }));
  assert(again === first, 'a duplicate song must return state by identity');
});

test('bands stay in order however you add', () => {
  let s = libraryReducer(initialLibrary, add(entry(1, 'disliked')));
  s = libraryReducer(s, add(entry(2, 'fine')));
  s = libraryReducer(s, add(entry(3, 'liked')));
  eq(s.entries.map((e) => e.sentiment), ['liked', 'fine', 'disliked']);
  eq(s.entries.map((e) => e.rank), [1, 2, 3]);
});

part('3 — removing and editing');
console.log('\nPart 3 — removing and editing');

test('removing re-scores what is left', () => {
  let s = libraryReducer(initialLibrary, add(entry(1)));
  s = libraryReducer(s, add(entry(2), 1));
  s = libraryReducer(s, { type: ACTIONS.REMOVE, entryId: 'e1' });
  eq(s.entries.map((e) => e.id), ['e2']);
  eq(s.entries[0].score, 9.5, 'the survivor is alone in its band again');
});

test('removing an id that is not there changes nothing', () => {
  const s = libraryReducer(initialLibrary, add(entry(1)));
  assert(libraryReducer(s, { type: ACTIONS.REMOVE, entryId: 'ghost' }) === s);
});

test('a note attaches to one entry and leaves the rest alone', () => {
  let s = libraryReducer(initialLibrary, add(entry(1)));
  s = libraryReducer(s, add(entry(2), 1));
  const withNote = libraryReducer(s, { type: ACTIONS.NOTE, entryId: 'e2', note: 'summer' });
  eq(withNote.entries.find((e) => e.id === 'e2').note, 'summer');
  eq(withNote.entries.find((e) => e.id === 'e1').note, '');
  assert(withNote.entries.find((e) => e.id === 'e1') === s.entries.find((e) => e.id === 'e1'),
    'untouched entries should keep their identity so React can skip them');
});

test('clearing an already empty library is a no-op', () => {
  const state = { entries: [], ready: true };
  assert(libraryReducer(state, { type: ACTIONS.CLEAR }) === state);
});

part('4 — hydrating');
console.log('\nPart 4 — hydrating from storage');

test('hydrate marks the library ready', () => {
  const s = libraryReducer(initialLibrary, { type: ACTIONS.HYDRATE, entries: [] });
  eq(s.ready, true);
  eq(s.entries, []);
});

test('hydrate survives rubbish from storage', () => {
  const s = libraryReducer(initialLibrary, { type: ACTIONS.HYDRATE, entries: null });
  eq(s.entries, []);
  eq(s.ready, true, 'ready must be true even when the load failed');
});

test('hydrate repairs unknown sentiments instead of dropping songs', () => {
  const saved = [
    { id: 'e1', song: song(1), sentiment: 'liked' },
    { id: 'e2', song: song(2), sentiment: 'obsessed' },
  ];
  const s = libraryReducer(initialLibrary, { type: ACTIONS.HYDRATE, entries: saved });
  eq(s.entries.length, 2, 'nothing may be thrown away');
  eq(s.entries.map((e) => e.sentiment), ['liked', 'fine']);
  eq(s.entries.map((e) => e.rank), [1, 2]);
});

test('hydrate re-scores, so saved scores can never drift', () => {
  const saved = [
    { id: 'e1', song: song(1), sentiment: 'liked', score: 0.1, rank: 99 },
    { id: 'e2', song: song(2), sentiment: 'liked', score: 0.2, rank: 98 },
  ];
  const s = libraryReducer(initialLibrary, { type: ACTIONS.HYDRATE, entries: saved });
  eq(s.entries.map((e) => e.score), [10, 6.7]);
  eq(s.entries.map((e) => e.rank), [1, 2]);
});

console.log('');
if (failures.length) {
  console.log(`\x1b[31m✗ ${failures.length} failing, ${passed} passing\x1b[0m`);
  console.log(`  next up: ${failures[0].part} — ${failures[0].name}`);
  process.exit(1);
} else {
  console.log(`\x1b[32m✓ all ${passed} tests passed — the reducer is done\x1b[0m`);
}
