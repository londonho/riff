import {
  songKey,
  genreSimilarity,
  artistSimilarity,
  sharedSongs,
  catalogOverlap,
  scoreAgreement,
  compareTastes,
  matchLabel,
  WEIGHTS,
} from './compare.js';

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

function close(actual, expected, tol = 0.001, msg) {
  if (typeof actual !== 'number' || Math.abs(actual - expected) > tol) {
    throw new Error(`${msg || 'not close'}: got ${actual}, expected ~${expected}`);
  }
}

/** entry(title, artist, genre, score) */
const entry = (title, artist, genre = 'Pop', score = 8) => ({
  id: `${title}-${artist}`,
  song: { id: `${title}-${artist}`, title, artist, album: 'Album', genre },
  sentiment: 'liked',
  score,
});

part('1 — matching songs across libraries');
console.log('\nPart 1 — matching songs across libraries');

test('songKey ignores case, punctuation and bracketed extras', () => {
  eq(songKey({ title: 'Nights', artist: 'Frank Ocean' }), 'nights|frank ocean');
  eq(
    songKey({ title: 'Nights (Remastered)', artist: 'Frank Ocean' }),
    songKey({ title: 'NIGHTS', artist: 'frank  ocean' }),
    'a remaster must match the original',
  );
  eq(
    songKey({ title: 'Ivy [Live]', artist: 'Frank Ocean' }),
    songKey({ title: 'Ivy', artist: 'Frank Ocean' }),
  );
});

test('songKey returns empty for unusable input', () => {
  eq(songKey(null), '');
  eq(songKey({ title: 'Nights' }), '', 'no artist means no key');
  eq(songKey({ artist: 'Frank Ocean' }), '', 'no title means no key');
});

test('sharedSongs matches on the key, not the catalog id', () => {
  const mine = [entry('Nights', 'Frank Ocean')];
  const theirs = [{ ...entry('Nights (Remastered)', 'Frank Ocean'), id: 'totally-different' }];
  const shared = sharedSongs(mine, theirs);
  eq(shared.length, 1);
  eq(shared[0].key, 'nights|frank ocean');
});

test('sharedSongs counts each song once', () => {
  const mine = [entry('Nights', 'Frank Ocean'), entry('Nights (Live)', 'Frank Ocean')];
  const theirs = [entry('Nights', 'Frank Ocean')];
  eq(sharedSongs(mine, theirs).length, 1, 'two of my copies are still one shared song');
});

part('2 — genres');
console.log('\nPart 2 — the genre signal');

test('identical genre mixes score 1', () => {
  const a = [entry('A', 'X', 'Pop'), entry('B', 'Y', 'Rap')];
  const b = [entry('C', 'Z', 'Pop'), entry('D', 'W', 'Rap')];
  close(genreSimilarity(a, b), 1, 0.001);
});

test('genre similarity ignores library size', () => {
  const small = [entry('A', 'X', 'Pop')];
  const big = Array.from({ length: 20 }, (_, i) => entry(`S${i}`, `Ar${i}`, 'Pop'));
  close(genreSimilarity(small, big), 1, 0.001, 'one Pop song vs twenty is still all Pop');
});

test('no genres in common scores 0', () => {
  const a = [entry('A', 'X', 'Pop')];
  const b = [entry('B', 'Y', 'Metal')];
  close(genreSimilarity(a, b), 0, 0.001);
});

test('genre similarity is null when a library is empty', () => {
  eq(genreSimilarity([], [entry('A', 'X')]), null);
  eq(genreSimilarity([entry('A', 'X')], []), null);
});

part('3 — artists and catalog');
console.log('\nPart 3 — artists and catalog');

test('artistSimilarity is the Jaccard overlap', () => {
  const a = [entry('A', 'One'), entry('B', 'Two')];
  const b = [entry('C', 'Two'), entry('D', 'Three')];
  close(artistSimilarity(a, b), 1 / 3, 0.001, 'one shared of three distinct');
});

test('artistSimilarity ignores case and padding', () => {
  const a = [entry('A', 'Frank Ocean')];
  const b = [entry('B', '  frank ocean ')];
  close(artistSimilarity(a, b), 1, 0.001);
});

test('catalogOverlap divides by the smaller library', () => {
  const mine = [entry('A', 'X'), entry('B', 'Y'), entry('C', 'Z'), entry('D', 'W')];
  const theirs = [entry('A', 'X'), entry('E', 'V')];
  close(catalogOverlap(mine, theirs), 0.5, 0.001, '1 shared, smaller library has 2');
});

test('catalogOverlap is null when a library is empty', () => {
  eq(catalogOverlap([], []), null);
});

part('4 — score agreement');
console.log('\nPart 4 — score agreement');

test('rating shared songs the same scores 1', () => {
  const mine = [entry('A', 'X', 'Pop', 9)];
  const theirs = [entry('A', 'X', 'Pop', 9)];
  close(scoreAgreement(mine, theirs), 1, 0.001);
});

test('a two point gap costs 20%', () => {
  const mine = [entry('A', 'X', 'Pop', 9)];
  const theirs = [entry('A', 'X', 'Pop', 7)];
  close(scoreAgreement(mine, theirs), 0.8, 0.001);
});

test('agreement is null when nothing is shared', () => {
  eq(scoreAgreement([entry('A', 'X')], [entry('B', 'Y')]), null,
    'no shared songs means no opinion, not zero agreement');
});

part('5 — the blend');
console.log('\nPart 5 — the blend');

test('two identical libraries score 100', () => {
  const lib = [entry('A', 'One', 'Pop', 9), entry('B', 'Two', 'Rap', 7)];
  const out = compareTastes(lib, lib);
  eq(out.score, 100);
  eq(out.label, 'Musical twins');
  close(out.usedWeight, 1, 0.001, 'all four signals available');
});

test('the weights add up to 1', () => {
  const total = Object.values(WEIGHTS).reduce((s, w) => s + w, 0);
  close(total, 1, 0.0001);
});

test('missing signals renormalise instead of counting as zero', () => {
  const mine = [entry('A', 'One', 'Pop', 9)];
  const theirs = [entry('B', 'Two', 'Pop', 9)];
  const out = compareTastes(mine, theirs);
  eq(out.signals.agreement, null, 'nothing shared, so no agreement signal');
  close(out.usedWeight, 0.75, 0.001, 'the 0.25 agreement weight drops out');
  const expected = Math.round(
    ((out.signals.genre * 0.4 + out.signals.artist * 0.2 + out.signals.catalog * 0.15) / 0.75) * 100,
  );
  eq(out.score, expected, 'the remaining weights must be renormalised, not left at 0.75');
});

test('two empty libraries score 0 rather than crashing', () => {
  const out = compareTastes([], []);
  eq(out.score, 0);
  eq(out.usedWeight, 0);
  eq(out.shared, []);
});

test('the shared list comes back with the result', () => {
  const mine = [entry('A', 'One', 'Pop', 9), entry('B', 'Two', 'Rap', 5)];
  const theirs = [entry('A', 'One', 'Pop', 6)];
  const out = compareTastes(mine, theirs);
  eq(out.shared.length, 1);
  eq(out.shared[0].mine.score, 9);
  eq(out.shared[0].theirs.score, 6);
});

test('matchLabel covers every band', () => {
  eq(matchLabel(100), 'Musical twins');
  eq(matchLabel(80), 'Musical twins');
  eq(matchLabel(79), 'Strong match');
  eq(matchLabel(60), 'Strong match');
  eq(matchLabel(40), 'Some overlap');
  eq(matchLabel(20), 'Different lanes');
  eq(matchLabel(0), 'Opposites');
});

console.log('');
if (failures.length) {
  console.log(`\x1b[31m✗ ${failures.length} failing, ${passed} passing\x1b[0m`);
  console.log(`  next up: ${failures[0].part} — ${failures[0].name}`);
  process.exit(1);
} else {
  console.log(`\x1b[32m✓ all ${passed} tests passed — the comparison engine is done\x1b[0m`);
}
