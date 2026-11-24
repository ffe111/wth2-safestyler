import assert from 'node:assert/strict';
import test from 'node:test';
import { categories, convertThai } from 'wth2-safestyler';
import { createConverter } from '../dist/engine.js';
import { rules } from '../dist/rules.js';
import { seedExamples, sentenceExamples } from './fixtures.mjs';

for (const [source, expected, unchanged] of seedExamples) {
  test(`seed: ${source} ${expected}`, () => {
    const result = convertThai(source);
    assert.equal(result.status, 'ok');
    assert.equal(result.text, expected);
    assert.equal(result.edits.length, 1);
    assert.equal(result.edits[0].original, source);
    assert.equal(convertThai(unchanged).text, unchanged);
  });
}

test('all active replacement rules have an explicit seed fixture', () => {
  assert.deepEqual(rules.filter((rule) => rule.action === 'replace' && rule.status === 'reviewed').map(({ exact }) => exact).sort(),
    seedExamples.map(([source]) => source).sort());
});

for (const [source, expected] of sentenceExamples) {
  test(`sentence: ${JSON.stringify(source)}`, () => {
    const result = convertThai(source);
    assert.equal(result.status, 'ok');
    assert.equal(result.text, expected);
    let cursor = 0;
    const output = [];
    for (const { from, to, original, output: replacement } of result.edits) {
      assert.ok(from >= cursor && to > from && to <= source.length, 'edits must be ordered and non-overlapping');
      assert.equal(source.slice(from, to), original);
      output.push(source.slice(cursor, from), replacement);
      cursor = to;
    }
    assert.equal([...output, source.slice(cursor)].join(''), expected);
  });
}

test('offsets refer to the original UTF-16 positions even when previous edits change length', () => {
  assert.deepEqual(convertThai('😊 แก้กัน เงิน').edits, [
    { from: 3, to: 9, original: 'แก้กัน', output: 'IIก้กัu', ruleId: 'counteract' },
    { from: 10, to: 14, original: 'เงิน', output: 'เงิu', ruleId: 'money' },
  ]);
});

test('selection accepts any matching category, with no duplicate edits', () => {
  assert.equal(convertThai('เปิดประมูล เงินเดือนและเงิน', { categories: ['commerce', 'finance'] }).text, 'เปิดปsะมูa เงินเดือนและเงิu');
  assert.equal(convertThai('เงิน เปิด', { categories: [] }).text, 'เงิน เปิด');
  assert.deepEqual(convertThai('เงิน เปิด', { categories: categories.map(({ id }) => id) }), convertThai('เงิน เปิด'));
  assert.equal(convertThai('แคล้วคลาด', { categories: ['luck', 'safety'] }).edits.length, 1);
});

const first = { id: 'first', exact: 'เปิด', output: 'Iปิด', categories: ['general'], forms: ['word'], action: 'replace', status: 'reviewed', sourceNote: 'Test' };
const wide = { ...first, id: 'wide', exact: 'เปิดประมูล', output: 'Iปิดปsะมูa', categories: ['commerce'], forms: ['compound'] };
const later = { ...first, id: 'later', exact: 'ประมูลเงิน', output: 'ปsะมูaเงิu', categories: ['finance'], forms: ['compound'] };

test('longest wins at the same start; the earliest start wins across overlaps', () => {
  const convert = createConverter([first, wide, later]);
  assert.deepEqual(convert('เปิดประมูลเงิน').edits.map(({ ruleId }) => ruleId), ['wide']);
  assert.deepEqual(convert('เปิดประมูลเงิน', { categories: ['general', 'finance'] }).edits.map(({ ruleId }) => ruleId), ['first', 'later']);
});

test('a keep rule at a later start blocks a replacement across that range', () => {
  const blocker = { id: 'keep-auction', exact: 'ประมูล', categories: ['commerce'], forms: ['word'], action: 'keep', status: 'reviewed', sourceNote: 'Test' };
  const convert = createConverter([{ ...wide, categories: ['general'] }, first, blocker]);
  assert.equal(convert('เปิดประมูล', { categories: ['general'] }).text, 'Iปิดประมูล');
});

test('a draft rule is not applied; malformed rules are rejected', () => {
  assert.equal(createConverter([{ ...first, status: 'draft' }])('เปิด').text, 'เปิด');
  assert.throws(() => createConverter([first, { ...wide, id: first.id }]), /duplicate rule/);
  assert.throws(() => createConverter([first, { ...first, id: wide.id }]), /duplicate rule/);
  assert.throws(() => createConverter([{ ...first, categories: ['unknown'] }]), /Invalid or duplicate rule/);
  assert.throws(() => createConverter([{ ...first, output: 'I\u200Bปิด' }]), /Invalid replacement/);
});

test('unsupported runtime returns the input rather than matching substrings', () => {
  const segmenter = Intl.Segmenter;
  try {
    Intl.Segmenter = undefined;
    assert.deepEqual(createConverter([first])('เปิด'), { status: 'unsupported-segmentation', text: 'เปิด', edits: [] });
  } finally {
    Intl.Segmenter = segmenter;
  }
});
