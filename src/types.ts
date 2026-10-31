import { UILanguage } from './utils/i18n.ts';

export type { UILanguage };
export type OutputMode = 'exact' | 'edited';

export interface AudioFileInfo {
  file?: File;
  name: string;
  size: number;
  type: string;
  durationSeconds?: number;
  previewUrl?: string;
  base64Data?: string;
}

export interface TranscriptionResult {
  fileName: string;
  exactTranscript: string;
  editedTranscript: string;
  detectedLanguage?: string;
  detectedTone?: string;
  wordCount?: number;
  durationSeconds?: number;
  confidenceSummary?: string;
  antiHallucinationVerified?: boolean;
  spellingQuality?: string;
  modelUsed?: string;
  chunksCount?: number;
}

export interface TranscriptionProgress {
  stage: 'uploading' | 'analyzing' | 'chunking' | 'transcribing' | 'polishing' | 'done';
  percent: number;
  currentChunk: number;
  totalChunks: number;
  message: string;
  partialTranscript?: string;
  chunkDurationSeconds?: number;
}

export interface BackendHealth {
  status: string;
  hasApiKey: boolean;
  defaultModel: string;
  fallbackModel: string;
}

export interface PredefinedSample {
  id: string;
  title: string;
  description: string;
  duration: string;
  filePath: string;
}
