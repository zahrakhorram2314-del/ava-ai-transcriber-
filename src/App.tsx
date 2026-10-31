/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Mic,
  ArrowRight,
  Sparkles,
  AlertTriangle,
  KeyRound,
  RefreshCw,
} from 'lucide-react';
import {
  AudioFileInfo,
  BackendHealth,
  OutputMode,
  TranscriptionResult,
  TranscriptionProgress,
  UILanguage,
} from './types.ts';
import { Header } from './components/Header.tsx';
import { AudioUploader } from './components/AudioUploader.tsx';
import { SpokenLanguageSelector } from './components/SpokenLanguageSelector.tsx';
import { ModeSelector } from './components/ModeSelector.tsx';
import { ProcessingOverlay } from './components/ProcessingOverlay.tsx';
import { TranscriptResult } from './components/TranscriptResult.tsx';
import { PrivacyNotice } from './components/PrivacyNotice.tsx';
import { Toast } from './components/Toast.tsx';
import { HelpModal } from './components/HelpModal.tsx';
import { t } from './utils/i18n.ts';

export default function App() {
  // UI Language state: Primary default is English ('en')
  const [uiLanguage, setUiLanguage] = useState<UILanguage>(() => {
    try {
      const saved = localStorage.getItem('ava_ui_lang');
      if (saved && ['en', 'fa', 'es', 'ar', 'fr', 'de', 'tr', 'zh', 'ru', 'ja', 'pt'].includes(saved)) {
        return saved as UILanguage;
      }
    } catch {}
    return 'en';
  });

  // Audio Spoken Language state (Native language spoken in the audio)
  const [spokenLanguage, setSpokenLanguage] = useState<string>('auto');
  const [customSpokenLanguage, setCustomSpokenLanguage] = useState<string>('');

  // Backend health & credentials state
  const [backendHealth, setBackendHealth] = useState<BackendHealth | null>(null);
  const [checkingHealth, setCheckingHealth] = useState(true);

  // Selected audio file
  const [selectedAudio, setSelectedAudio] = useState<AudioFileInfo | null>(null);

  // Preferred output mode: 'exact' or 'edited'
  const [selectedMode, setSelectedMode] = useState<OutputMode>('exact');

  // Processing & results state
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcriptionProgress, setTranscriptionProgress] = useState<TranscriptionProgress | null>(null);
  const [transcriptionResult, setTranscriptionResult] = useState<TranscriptionResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // UI helpers
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Synchronize document language and direction
  useEffect(() => {
    try {
      localStorage.setItem('ava_ui_lang', uiLanguage);
    } catch {}
    const isRTL = uiLanguage === 'fa' || uiLanguage === 'ar';
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = uiLanguage;
    document.title = `${t('appTitle', uiLanguage)} — ${t('appSubtitle', uiLanguage)}`;
  }, [uiLanguage]);

  // Check backend health on mount
  useEffect(() => {
    checkBackend();
  }, []);

  const checkBackend = async () => {
    setCheckingHealth(true);
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        setBackendHealth(data);
      }
    } catch (err) {
      console.warn('Backend health check error:', err);
    } finally {
      setCheckingHealth(false);
    }
  };

  const getEffectiveSpokenLanguage = () => {
    if (spokenLanguage === 'custom' && customSpokenLanguage.trim()) {
      return customSpokenLanguage.trim();
    }
    return spokenLanguage;
  };

  const handleTranscribe = async () => {
    if (!selectedAudio || (!selectedAudio.file && !selectedAudio.base64Data) || isProcessing) return;

    const effectiveSpokenLang = getEffectiveSpokenLanguage();

    setIsProcessing(true);
    setErrorMessage(null);
    setTranscriptionProgress({
      stage: 'uploading',
      percent: 5,
      currentChunk: 0,
      totalChunks: 1,
      message: t('processingTitle', uiLanguage),
    });

    try {
      if (selectedAudio.file) {
        // Stream processing for uploaded files
        const formData = new FormData();
        formData.append('audio', selectedAudio.file);
        formData.append('fileName', selectedAudio.name);
        formData.append('requestedMode', selectedMode);
        formData.append('spokenLanguage', effectiveSpokenLang);

        const response = await fetch('/api/transcribe-stream', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          let errText = t('serverConnectionError', uiLanguage);
          try {
            const errJson = await response.json();
            errText = errJson.message || errText;
          } catch {
            if (response.status === 413) {
              errText = t('fileTooLarge', uiLanguage);
            }
          }
          throw new Error(errText);
        }

        if (!response.body) {
          throw new Error(t('serverConnectionError', uiLanguage));
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let buffer = '';
        let receivedResult: TranscriptionResult | null = null;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split('\n\n');
          buffer = parts.pop() || '';

          for (const part of parts) {
            const trimmed = part.trim();
            if (!trimmed.startsWith('data:')) continue;
            const jsonStr = trimmed.replace(/^data:\s*/, '');
            if (!jsonStr) continue;

            try {
              const event = JSON.parse(jsonStr);
              if (event.type === 'error') {
                throw new Error(event.message || 'Error processing audio.');
              } else if (event.type === 'progress' || event.type === 'chunk_done') {
                setTranscriptionProgress({
                  stage: event.stage || 'transcribing',
                  percent: event.percent,
                  currentChunk: event.currentChunk || 0,
                  totalChunks: event.totalChunks || 1,
                  message: event.message,
                  partialTranscript: event.partialTranscript,
                  chunkDurationSeconds: event.chunkDurationSeconds,
                });
              } else if (event.type === 'complete') {
                receivedResult = event.result;
                setTranscriptionResult(event.result);
                setToastMessage(t('antiHallucinationBadge', uiLanguage));
              }
            } catch (err: any) {
              if (err.message && !err.message.includes('JSON')) {
                throw err;
              }
            }
          }
        }

        if (!receivedResult) {
          throw new Error(t('serverConnectionError', uiLanguage));
        }
      } else {
        // Fallback for audio without a File instance
        setTranscriptionProgress({
          stage: 'transcribing',
          percent: 45,
          currentChunk: 1,
          totalChunks: 1,
          message: t('processingTitle', uiLanguage),
        });

        const response = await fetch('/api/transcribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            audioBase64: selectedAudio.base64Data,
            mimeType: selectedAudio.type,
            fileName: selectedAudio.name,
            requestedMode: selectedMode,
            spokenLanguage: effectiveSpokenLang,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.message || t('serverConnectionError', uiLanguage));
        }

        setTranscriptionResult({
          fileName: selectedAudio.name,
          exactTranscript: data.exactTranscript || '',
          editedTranscript: data.editedTranscript || data.exactTranscript || '',
          detectedLanguage: data.detectedLanguage || 'Auto-Detected',
          detectedTone: data.detectedTone || 'Conversational',
          wordCount: data.wordCount,
          durationSeconds: selectedAudio.durationSeconds || data.durationSeconds,
          confidenceSummary: data.confidenceSummary,
          antiHallucinationVerified: data.antiHallucinationVerified,
          spellingQuality: data.spellingQuality,
          modelUsed: data.modelUsed,
          chunksCount: 1,
        });

        setToastMessage(t('antiHallucinationBadge', uiLanguage));
      }
    } catch (err: any) {
      console.error('Transcription submit error:', err);
      setErrorMessage(err?.message || t('serverConnectionError', uiLanguage));
    } finally {
      setIsProcessing(false);
      setTranscriptionProgress(null);
    }
  };

  const handleReset = () => {
    setSelectedAudio(null);
    setTranscriptionResult(null);
    setTranscriptionProgress(null);
    setErrorMessage(null);
  };

  const isRTL = uiLanguage === 'fa' || uiLanguage === 'ar';

  return (
    <div
      className={`min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-teal-500/30 selection:text-teal-200 ${
        isRTL ? 'font-sans' : 'font-sans tracking-normal'
      }`}
    >
      {/* Header */}
      <Header
        backendHealth={backendHealth}
        currentLanguage={uiLanguage}
        onLanguageChange={(newLang) => setUiLanguage(newLang)}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-6 sm:py-10 flex flex-col">
        {/* Missing API Key Warning */}
        {!checkingHealth && backendHealth && !backendHealth.hasApiKey && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs sm:text-sm flex items-start gap-3">
            <KeyRound className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1 leading-relaxed">
              <strong className="block font-bold text-amber-300 mb-1">
                {t('apiKeyMissingTitle', uiLanguage)}
              </strong>
              {t('apiKeyMissingDesc', uiLanguage)}
            </div>
            <button
              onClick={checkBackend}
              className="p-1.5 rounded-lg text-amber-300 hover:text-white hover:bg-amber-900/40 shrink-0 cursor-pointer"
              title="Refresh status"
              aria-label="Refresh API key status"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Hero Section */}
        {!transcriptionResult && (
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-teal-500/30 text-teal-300 text-xs font-medium mb-3 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
              <span>{t('badgeAI', uiLanguage)}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
              {t('heroTitle', uiLanguage)}
            </h1>

            <p className="text-sm sm:text-base text-slate-400 max-w-lg mx-auto leading-relaxed">
              {t('heroDescription', uiLanguage)}
            </p>
          </div>
        )}

        {/* Workflow Area */}
        <div className="flex-1 flex flex-col gap-6">
          {/* State 1: Active Transcription Results */}
          {transcriptionResult ? (
            <TranscriptResult
              result={transcriptionResult}
              initialMode={selectedMode}
              currentLanguage={uiLanguage}
              onReset={handleReset}
              onShowToast={(msg) => setToastMessage(msg)}
            />
          ) : isProcessing ? (
            /* State 2: Processing Overlay */
            <ProcessingOverlay
              fileName={selectedAudio?.name}
              progress={transcriptionProgress}
              currentLanguage={uiLanguage}
            />
          ) : (
            /* State 3: Upload and Configuration Controls */
            <div className="flex flex-col gap-5">
              {/* Audio Uploader Card */}
              <AudioUploader
                currentAudio={selectedAudio}
                currentLanguage={uiLanguage}
                onAudioSelected={(audio) => {
                  setSelectedAudio(audio);
                  setErrorMessage(null);
                }}
                disabled={isProcessing}
              />

              {/* Spoken Language Selector (Any International Native Language) */}
              <SpokenLanguageSelector
                currentLanguage={uiLanguage}
                selectedSpokenLanguage={spokenLanguage}
                customSpokenLanguage={customSpokenLanguage}
                onSelectSpokenLanguage={(code) => setSpokenLanguage(code)}
                onCustomLanguageChange={(custom) => setCustomSpokenLanguage(custom)}
                disabled={isProcessing}
              />

              {/* Mode Selector */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/40 border border-slate-800 backdrop-blur-sm">
                <ModeSelector
                  currentMode={selectedMode}
                  currentLanguage={uiLanguage}
                  onModeChange={(mode) => setSelectedMode(mode)}
                />
              </div>

              {/* Primary Action Button */}
              <div className="flex flex-col items-center gap-2">
                <button
                  type="button"
                  onClick={handleTranscribe}
                  disabled={!selectedAudio || isProcessing}
                  className={`w-full py-4 px-6 rounded-2xl font-bold text-base sm:text-lg flex items-center justify-center gap-3 transition-all cursor-pointer ${
                    selectedAudio && !isProcessing
                      ? 'bg-gradient-to-r from-teal-500 via-teal-400 to-emerald-400 hover:from-teal-400 hover:to-emerald-300 text-slate-950 shadow-xl shadow-teal-500/25 active:scale-[0.99]'
                      : 'bg-slate-800 text-slate-500 border border-slate-700/60 cursor-not-allowed opacity-75'
                  }`}
                  aria-label={t('transcribeButton', uiLanguage)}
                >
                  <Mic className="w-5 h-5 stroke-[2.5]" />
                  <span>{t('transcribeButton', uiLanguage)}</span>
                  {selectedAudio && (
                    <ArrowRight className={`w-4 h-4 text-slate-950 transform ${isRTL ? 'rotate-180' : ''}`} />
                  )}
                </button>

                {!selectedAudio && (
                  <p className="text-xs text-slate-500 text-center">
                    {t('transcribePrompt', uiLanguage)}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Error Message Banner */}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs sm:text-sm flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">
                <strong className="block font-bold text-rose-200 mb-0.5">
                  {t('errorTitle', uiLanguage)}
                </strong>
                {errorMessage}
              </div>
            </div>
          )}

          {/* Privacy Notice */}
          <PrivacyNotice currentLanguage={uiLanguage} />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-850 py-4 text-center text-xs text-slate-500">
        <p>{t('footerText', uiLanguage)}</p>
      </footer>

      {/* Toast Notification */}
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />

      {/* Help Modal */}
      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        hasApiKey={Boolean(backendHealth?.hasApiKey)}
        currentLanguage={uiLanguage}
      />
    </div>
  );
}
