import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildHistoricalPrompt,
  buildSimplificationPrompt,
  buildSummarizationPrompt,
  MAX_SERVER_TEXT_LENGTH,
  validateHistoricalPayload,
  validateSimplifyPayload,
  validateSummarizePayload,
} from './prompts';

const SAMPLE = 'Scientists announced a new discovery in clean energy storage that reduces battery degradation over time.';

test('validateSimplifyPayload validates text and readingLevel', () => {
  assert.equal(validateSimplifyPayload({ text: '', readingLevel: 'standard' }).ok, false);
  assert.equal(validateSimplifyPayload({ text: SAMPLE, readingLevel: 'invalid' }).ok, false);
  assert.equal(
    validateSimplifyPayload({ text: 'x'.repeat(MAX_SERVER_TEXT_LENGTH + 1), readingLevel: 'standard' }).ok,
    false
  );
  const valid = validateSimplifyPayload({ text: SAMPLE, readingLevel: 'very-simple', preferredLanguage: 'Spanish' });
  assert.equal(valid.ok, true);
  if (valid.ok) {
    assert.equal(valid.data.readingLevel, 'very-simple');
    assert.equal(valid.data.preferredLanguage, 'Spanish');
  }
});

test('validateSummarizePayload validates length and format', () => {
  assert.equal(
    validateSummarizePayload({ text: SAMPLE, summaryLength: 'short', outputFormat: 'bullets' }).ok,
    true
  );
  assert.equal(
    validateSummarizePayload({ text: SAMPLE, summaryLength: 'huge', outputFormat: 'bullets' }).ok,
    false
  );
  assert.equal(
    validateSummarizePayload({ text: SAMPLE, summaryLength: 'medium', outputFormat: 'xml' }).ok,
    false
  );
});

test('validateHistoricalPayload validates period and writingFormat', () => {
  assert.equal(
    validateHistoricalPayload({ text: SAMPLE, period: '1980s', writingFormat: 'newspaper' }).ok,
    true
  );
  assert.equal(
    validateHistoricalPayload({ text: SAMPLE, period: '1890s', writingFormat: 'newspaper' }).ok,
    false
  );
  assert.equal(
    validateHistoricalPayload({ text: SAMPLE, period: '1920s', writingFormat: 'podcast' }).ok,
    false
  );
});

test('prompt builders include core system guidelines and integrity rules', () => {
  const simp = buildSimplificationPrompt({ text: SAMPLE, readingLevel: 'advanced', preferredLanguage: 'preserve' });
  assert.match(simp.systemInstruction, /Never invent facts/);
  assert.match(simp.systemInstruction, /Reading Level: Advanced/);

  const sum = buildSummarizationPrompt({
    text: SAMPLE,
    summaryLength: 'detailed',
    outputFormat: 'takeaways',
    preferredLanguage: 'French',
  });
  assert.match(sum.systemInstruction, /Detailed Summary/);
  assert.match(sum.systemInstruction, /French/);

  const hist = buildHistoricalPrompt({
    text: SAMPLE,
    period: '1980s',
    writingFormat: 'editorial',
    preferredLanguage: 'preserve',
  });
  assert.match(hist.systemInstruction, /1980s/);
  assert.match(hist.systemInstruction, /Do not falsely present modern events as historical events/);
});
