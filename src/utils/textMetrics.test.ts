import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateLengthDeltaLabel,
  countCharacters,
  countWords,
  estimateReadingTimeMinutes,
  MAX_TEXT_LENGTH,
  validateInputText,
  validateUploadedFile,
} from './textMetrics';

test('countWords handles empty, whitespace, and multi-line prose', () => {
  assert.equal(countWords(''), 0);
  assert.equal(countWords('   \n\t  '), 0);
  assert.equal(countWords('Hello world'), 2);
  assert.equal(countWords('  One   two\nthree\tfour  '), 4);
});

test('countCharacters counts exact string length', () => {
  assert.equal(countCharacters(''), 0);
  assert.equal(countCharacters('abc 123'), 7);
});

test('estimateReadingTimeMinutes returns 0 for empty and >=1 otherwise', () => {
  assert.equal(estimateReadingTimeMinutes(0), 0);
  assert.equal(estimateReadingTimeMinutes(50), 1);
  assert.equal(estimateReadingTimeMinutes(401), 3);
});

test('calculateLengthDeltaLabel summarizes compression or expansion', () => {
  assert.equal(calculateLengthDeltaLabel(0, 10), null);
  assert.equal(calculateLengthDeltaLabel(100, 50), '50% shorter');
  assert.equal(calculateLengthDeltaLabel(100, 150), '50% longer');
  assert.equal(calculateLengthDeltaLabel(100, 99), 'Similar length');
});

test('validateInputText enforces non-empty, min length, and max length', () => {
  assert.equal(validateInputText('').valid, false);
  assert.equal(validateInputText('short').valid, false);
  assert.equal(validateInputText('This is a clear sample sentence with enough context.').valid, true);
  assert.equal(validateInputText('a'.repeat(MAX_TEXT_LENGTH + 1)).valid, false);
});

test('validateUploadedFile accepts txt/md files and rejects unsupported or oversized files', () => {
  assert.equal(validateUploadedFile({ name: 'article.txt', size: 1024, type: 'text/plain' }).valid, true);
  assert.equal(validateUploadedFile({ name: 'notes.md', size: 512 }).valid, true);
  assert.equal(validateUploadedFile({ name: 'empty.txt', size: 0, type: 'text/plain' }).valid, false);
  assert.equal(validateUploadedFile({ name: 'huge.txt', size: 400 * 1024, type: 'text/plain' }).valid, false);
  assert.equal(validateUploadedFile({ name: 'photo.png', size: 1024, type: 'image/png' }).valid, false);
});
