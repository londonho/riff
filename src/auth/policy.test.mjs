import {
  RULES,
  normalizeEmail,
  isValidEmail,
  passwordIssues,
  passwordStrength,
  lockoutDelayMs,
  lockoutRemainingMs,
  describeWait,
  FREE_ATTEMPTS,
} from './policy.js';

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

part('1 — email');
console.log('\nPart 1 — email');

test('normalizeEmail trims and lowercases', () => {
  eq(normalizeEmail('  London@Example.COM '), 'london@example.com');
  eq(normalizeEmail(null), '');
});

test('isValidEmail accepts ordinary addresses', () => {
  assert(isValidEmail('london@example.com'));
  assert(isValidEmail('  London@Example.com  '), 'it must normalise first');
  assert(isValidEmail('a.b+tag@sub.example.co.uk'));
});

test('isValidEmail rejects the obvious failures', () => {
  assert(!isValidEmail(''), 'empty');
  assert(!isValidEmail('london'), 'no at sign');
  assert(!isValidEmail('london@'), 'no domain');
  assert(!isValidEmail('@example.com'), 'no local part');
  assert(!isValidEmail('london@example'), 'no dot in domain');
  assert(!isValidEmail('a@b..com'), 'double dot');
  assert(!isValidEmail('lon don@example.com'), 'whitespace inside');
  assert(!isValidEmail('a@b@c.com'), 'two at signs');
});

part('2 — password rules');
console.log('\nPart 2 — password rules');

test('a good password has no issues', () => {
  eq(passwordIssues('canoe-thunder-lamp'), []);
});

test('short passwords are rejected with the length in the message', () => {
  const issues = passwordIssues('short1');
  eq(issues.length, 1);
  assert(issues[0].includes(String(RULES.minLength)), 'the message should name the minimum');
});

test('common passwords are rejected however long', () => {
  assert(passwordIssues('password123').some((i) => i.includes('guessing list')));
  assert(passwordIssues('PASSWORD123').some((i) => i.includes('guessing list')),
    'the check must be case-insensitive');
});

test('a password containing the email local part is rejected', () => {
  const issues = passwordIssues('londonlondon123', { email: 'london@example.com' });
  assert(issues.some((i) => i.includes('email')), 'got: ' + JSON.stringify(issues));
});

test('a short email local part does not trigger the email rule', () => {
  eq(passwordIssues('abcanoe-thunder', { email: 'ab@example.com' }), [],
    'a two-letter local part would match far too much');
});

test('one repeated character is rejected', () => {
  assert(passwordIssues('aaaaaaaaaaaa').some((i) => i.includes('repeated')));
});

test('leading or trailing spaces are flagged', () => {
  assert(passwordIssues(' canoe-thunder-lamp').some((i) => i.includes('space')));
});

part('3 — the strength meter');
console.log('\nPart 3 — the strength meter');

test('an empty password scores 0', () => {
  eq(passwordStrength('').score, 0);
  eq(passwordStrength('').label, 'Empty');
});

test('length moves the meter more than symbols do', () => {
  const longPlain = passwordStrength('canoe thunder lamp harbour');
  const shortMessy = passwordStrength('aB3$x');
  assert(longPlain.score > shortMessy.score,
    `long passphrase (${longPlain.score}) should beat short gibberish (${shortMessy.score})`);
});

test('a common password scores 0 whatever its shape', () => {
  eq(passwordStrength('password123').score, 0);
});

test('the meter never leaves 0 to 4', () => {
  ['', 'a', 'aB3$aB3$aB3$aB3$aB3$aB3$aB3$'].forEach((p) => {
    const { score } = passwordStrength(p);
    assert(score >= 0 && score <= 4, `${p} gave ${score}`);
  });
});

part('4 — lockout');
console.log('\nPart 4 — lockout');

test('the first few failures cost nothing', () => {
  for (let i = 0; i < FREE_ATTEMPTS; i += 1) {
    eq(lockoutDelayMs(i), 0, `failure ${i} should be free`);
  }
});

test('the delay escalates and then stops', () => {
  eq(lockoutDelayMs(5), 5000);
  eq(lockoutDelayMs(6), 30000);
  eq(lockoutDelayMs(7), 120000);
  eq(lockoutDelayMs(8), 900000);
  eq(lockoutDelayMs(50), 900000, 'the ladder has a top step');
});

test('rubbish input does not produce a negative or NaN delay', () => {
  eq(lockoutDelayMs(-3), 0);
  eq(lockoutDelayMs(undefined), 0);
  eq(lockoutDelayMs('nonsense'), 0);
});

test('remaining time counts down and reaches zero', () => {
  const at = 1_000_000;
  eq(lockoutRemainingMs(5, at, at), 5000, 'nothing has elapsed yet');
  eq(lockoutRemainingMs(5, at, at + 2000), 3000);
  eq(lockoutRemainingMs(5, at, at + 5000), 0);
  eq(lockoutRemainingMs(5, at, at + 99999), 0, 'it must not go negative');
});

test('no failures means no wait even with a timestamp', () => {
  eq(lockoutRemainingMs(0, 1_000_000, 1_000_000), 0);
});

test('describeWait reads like a sentence', () => {
  eq(describeWait(0), '');
  eq(describeWait(1000), '1 second');
  eq(describeWait(5000), '5 seconds');
  eq(describeWait(120000), '2 minutes');
  eq(describeWait(900000), '15 minutes');
});

console.log('');
if (failures.length) {
  console.log(`\x1b[31m✗ ${failures.length} failing, ${passed} passing\x1b[0m`);
  console.log(`  next up: ${failures[0].part} — ${failures[0].name}`);
  process.exit(1);
} else {
  console.log(`\x1b[32m✓ all ${passed} tests passed — the policy layer is done\x1b[0m`);
}
