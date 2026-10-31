import fs from 'fs';
import path from 'path';

// Helper to create a valid mono 16-bit PCM WAV file buffer
function createToneWav(durationSec = 2, sampleRate = 16000, frequency = 440): Buffer {
  const numSamples = durationSec * sampleRate;
  const blockAlign = 2; // 1 channel * 2 bytes
  const byteRate = sampleRate * blockAlign;
  const dataSize = numSamples * 2;
  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);

  // fmt subchunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // Subchunk1Size (16 for PCM)
  buffer.writeUInt16LE(1, 20); // AudioFormat (1 for PCM)
  buffer.writeUInt16LE(1, 22); // NumChannels (1 mono)
  buffer.writeUInt32LE(sampleRate, 24); // SampleRate
  buffer.writeUInt32LE(byteRate, 28); // ByteRate
  buffer.writeUInt16LE(blockAlign, 32); // BlockAlign
  buffer.writeUInt16LE(16, 34); // BitsPerSample (16 bits)

  // data subchunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  // Sine wave samples with voice-like harmonic modulation
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    // Harmonic carrier mimicking vocal formant
    const sample = Math.sin(2 * Math.PI * frequency * t) * 0.4 +
                   Math.sin(2 * Math.PI * (frequency * 1.5) * t) * 0.2 +
                   Math.sin(2 * Math.PI * 220 * t) * 0.3;
    // Envelope attack and decay
    const env = Math.min(1, Math.min(t / 0.1, (durationSec - t) / 0.1));
    const intSample = Math.floor(sample * env * 32767);
    buffer.writeInt16LE(Math.max(-32768, Math.min(32767, intSample)), 44 + i * 2);
  }

  return buffer;
}

const outDir = path.resolve(process.cwd(), 'public', 'samples');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

fs.writeFileSync(path.join(outDir, 'sample1.wav'), createToneWav(3, 16000, 320));
fs.writeFileSync(path.join(outDir, 'sample2.wav'), createToneWav(4, 16000, 260));

console.log('Sample WAV files created successfully in public/samples/');
