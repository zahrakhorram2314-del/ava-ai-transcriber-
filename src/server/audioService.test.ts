import test from 'node:test';
import assert from 'node:assert/strict';
import { stitchTranscripts, ChunkTranscriptionResult } from './audioService.ts';

test('stitchTranscripts joins chunks chronologically without loss', () => {
  const chunks: ChunkTranscriptionResult[] = [
    {
      index: 1,
      exactTranscript: 'بخش دوم صحبت‌ها درباره ادامه پروژه است.',
      editedTranscript: 'بخش دوم صحبت‌ها درباره ادامه پروژه است.',
      detectedTone: 'رسمی و اداری',
      modelUsed: 'gemini-3.1-flash-lite',
    },
    {
      index: 0,
      exactTranscript: 'سلام، این بخش اول پادکست است.',
      editedTranscript: 'سلام، این بخش اول پادکست است.',
      detectedTone: 'رسمی و اداری',
      modelUsed: 'gemini-3.1-flash-lite',
    },
  ];

  const result = stitchTranscripts(chunks);
  assert.equal(
    result.exactTranscript,
    'سلام، این بخش اول پادکست است.\n\nبخش دوم صحبت‌ها درباره ادامه پروژه است.'
  );
  assert.equal(result.detectedTone, 'رسمی و اداری');
});

test('stitchTranscripts ignores non-speech placeholders when valid speech is present', () => {
  const chunks: ChunkTranscriptionResult[] = [
    {
      index: 0,
      exactTranscript: 'سلام دوستان عزیز',
      editedTranscript: 'سلام دوستان عزیز',
      modelUsed: 'gemini-3.1-flash-lite',
    },
    {
      index: 1,
      exactTranscript: '[بدون گفتار یا کلام مشخص]',
      editedTranscript: '[بدون گفتار یا کلام مشخص]',
      modelUsed: 'gemini-3.1-flash-lite',
    },
  ];

  const result = stitchTranscripts(chunks);
  assert.equal(result.exactTranscript, 'سلام دوستان عزیز');
});

test('stitchTranscripts returns placeholder when all chunks have no speech', () => {
  const chunks: ChunkTranscriptionResult[] = [
    {
      index: 0,
      exactTranscript: '[بدون گفتار یا کلام مشخص]',
      editedTranscript: '[بدون گفتار یا کلام مشخص]',
      modelUsed: 'gemini-3.1-flash-lite',
    },
  ];

  const result = stitchTranscripts(chunks);
  assert.equal(result.exactTranscript, '[بدون گفتار یا کلام مشخص]');
});
