import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateAudioFile,
  formatPersianNumber,
  formatFileSize,
  formatDuration,
  countPersianWords,
  normalizePersianText,
  createPersianDownloadBlob,
  MAX_AUDIO_SIZE_BYTES,
} from './textUtils.ts';

test('formatPersianNumber converts English digits to Persian digits', () => {
  assert.equal(formatPersianNumber(1234567890), '۱۲۳۴۵۶۷۸۹۰');
  assert.equal(formatPersianNumber('Version 3.5'), 'Version ۳.۵');
});

test('formatFileSize produces accurate Persian strings', () => {
  assert.equal(formatFileSize(0), '۰ بایت');
  assert.equal(formatFileSize(500), '۵۰۰ بایت');
  assert.equal(formatFileSize(1024 * 50), '۵۰ کیلوبایت');
  assert.equal(formatFileSize(1024 * 1024 * 4.5), '۴.۵ مگابایت');
});

test('formatDuration formats seconds to MM:SS with Persian digits', () => {
  assert.equal(formatDuration(0), '۰۰:۰۰');
  assert.equal(formatDuration(65), '۰۱:۰۵');
  assert.equal(formatDuration(180), '۰۳:۰۰');
  assert.equal(formatDuration(3665), '۶۱:۰۵');
});

test('validateAudioFile accepts supported formats', () => {
  const mp3 = validateAudioFile({ name: 'voice.mp3', size: 1024 * 100, type: 'audio/mpeg' });
  assert.equal(mp3.valid, true);
  assert.equal(mp3.normalizedMime, 'audio/mp3');

  const wav = validateAudioFile({ name: 'recording.wav', size: 1024 * 500, type: 'audio/wav' });
  assert.equal(wav.valid, true);
  assert.equal(wav.normalizedMime, 'audio/wav');

  const m4a = validateAudioFile({ name: 'memo.m4a', size: 1024 * 300, type: '' });
  assert.equal(m4a.valid, true);
  assert.equal(m4a.normalizedMime, 'audio/m4a');
});

test('validateAudioFile rejects invalid files and oversized files', () => {
  const empty = validateAudioFile({ name: 'empty.mp3', size: 0 });
  assert.equal(empty.valid, false);
  assert.match(empty.errorFa!, /خالی/);

  const oversized = validateAudioFile({
    name: 'huge.wav',
    size: MAX_AUDIO_SIZE_BYTES + 1024,
  });
  assert.equal(oversized.valid, false);
  assert.match(oversized.errorFa!, /سقف مجاز/);

  const invalidFormat = validateAudioFile({
    name: 'document.pdf',
    size: 1024,
    type: 'application/pdf',
  });
  assert.equal(invalidFormat.valid, false);
  assert.match(invalidFormat.errorFa!, /فرمت فایل پشتیبانی نمی‌شود/);
});

test('countPersianWords counts Persian words correctly with punctuation and ZWNJ', () => {
  assert.equal(countPersianWords(''), 0);
  assert.equal(countPersianWords('سلام دنیا'), 2);
  assert.equal(countPersianWords('این یک متن آزمایشی است، که دارای علامت‌های نگارشی می‌باشد!'), 10);
  assert.equal(countPersianWords('می‌خواهم کتاب بخوانم.'), 3);
});

test('normalizePersianText replaces Arabic characters and standardizes Persian punctuation', () => {
  const input = 'يك كتاب عربي با متني نامناسب , و نقطه ؟';
  const expected = 'یک کتاب عربی با متنی نامناسب ، و نقطه ؟';
  assert.equal(normalizePersianText(input), expected);

  const halfSpaceInput = 'می روم و کتاب ها را با بهترین شیوه می خوانم';
  const halfSpaceExpected = 'می\u200cروم و کتاب\u200cها را با بهترین شیوه می\u200cخوانم';
  assert.equal(normalizePersianText(halfSpaceInput), halfSpaceExpected);
});

test('createPersianDownloadBlob adds UTF-8 BOM', async () => {
  const blob = createPersianDownloadBlob('سلام');
  const buffer = await blob.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  // UTF-8 BOM bytes are EF BB BF
  assert.equal(bytes[0], 0xef);
  assert.equal(bytes[1], 0xbb);
  assert.equal(bytes[2], 0xbf);
});
