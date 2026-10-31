import React, { useState, useEffect } from 'react';
import {
  Copy,
  Check,
  Download,
  RotateCcw,
  Sparkles,
  FileText,
  Clock,
  Type,
  CheckCircle,
  HelpCircle,
  PlusCircle,
} from 'lucide-react';
import { OutputMode, TranscriptionResult } from '../types.ts';
import {
  countPersianWords,
  formatNumber,
  createPersianDownloadBlob,
} from '../utils/textUtils.ts';
import { UILanguage, t } from '../utils/i18n.ts';

interface TranscriptResultProps {
  result: TranscriptionResult;
  initialMode: OutputMode;
  currentLanguage: UILanguage;
  onReset: () => void;
  onShowToast: (msg: string) => void;
}

export const TranscriptResult: React.FC<TranscriptResultProps> = ({
  result,
  initialMode,
  currentLanguage,
  onReset,
  onShowToast,
}) => {
  const [activeMode, setActiveMode] = useState<OutputMode>(initialMode);

  // Maintain separate editable states for exact and edited transcripts
  const [exactText, setExactText] = useState(result.exactTranscript);
  const [editedText, setEditedText] = useState(result.editedTranscript);
  const [copied, setCopied] = useState(false);

  // Sync if new result arrives
  useEffect(() => {
    setExactText(result.exactTranscript);
    setEditedText(result.editedTranscript);
    setActiveMode(initialMode);
  }, [result, initialMode]);

  const currentContent = activeMode === 'exact' ? exactText : editedText;
  const wordCount = countPersianWords(currentContent);
  const charCount = currentContent.length;
  const readingMinutes = Math.max(1, Math.ceil(wordCount / 180));

  const hasInaudible = currentContent.includes('[Inaudible]') || currentContent.includes('[نامفهوم]');
  const isRTLText = /[\u0600-\u06FF]/.test(currentContent);

  const handleTextChange = (newVal: string) => {
    if (activeMode === 'exact') {
      setExactText(newVal);
    } else {
      setEditedText(newVal);
    }
  };

  const handleCopy = async () => {
    let success = false;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(currentContent);
        success = true;
      }
    } catch {
      // Fall through to fallback
    }

    if (!success) {
      try {
        const textarea = document.createElement('textarea');
        textarea.value = currentContent;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        success = document.execCommand('copy');
        document.body.removeChild(textarea);
      } catch (fallbackErr) {
        console.error('Copy fallback error:', fallbackErr);
      }
    }

    if (success) {
      setCopied(true);
      onShowToast(t('copiedToast', currentLanguage));
      setTimeout(() => setCopied(false), 2000);
    } else {
      onShowToast('Text selected; please use Ctrl+C / Cmd+C to copy.');
    }
  };

  const handleDownload = () => {
    try {
      const blob = createPersianDownloadBlob(currentContent);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const modeSuffix = activeMode === 'exact' ? 'verbatim' : 'polished';
      const cleanName = (result.fileName || 'transcript')
        .replace(/\.[a-zA-Z0-9]+$/, '')
        .replace(/\s+/g, '-');
      a.href = url;
      a.download = `${cleanName}-${modeSuffix}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      onShowToast(t('downloadTxt', currentLanguage) + ' ✓');
    } catch {
      onShowToast('Error generating text file download.');
    }
  };

  const handleRestoreInitial = () => {
    if (activeMode === 'exact') {
      setExactText(result.exactTranscript);
    } else {
      setEditedText(result.editedTranscript);
    }
    onShowToast(t('resetTranscript', currentLanguage));
  };

  return (
    <div className="w-full border border-teal-500/40 rounded-2xl bg-slate-900/90 backdrop-blur-md shadow-2xl p-5 sm:p-6 transition-all animate-in fade-in duration-300">
      {/* Top Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400"></span>
            <h2 className="text-base sm:text-lg font-bold text-white">
              {t('resultTitle', currentLanguage)}
            </h2>
            <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-teal-500/10 text-teal-300 border border-teal-500/20">
              {result.detectedLanguage || 'Auto-Detected'}
            </span>
            {result.detectedTone && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-indigo-950/60 text-indigo-300 border border-indigo-500/30">
                <span>{t('resultTone', currentLanguage)}:</span>
                <strong className="text-white font-semibold">{result.detectedTone}</strong>
              </span>
            )}
            {result.chunksCount && result.chunksCount > 1 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-teal-950/60 text-teal-300 border border-teal-500/30">
                <span>
                  {t('chunksCountLabel', currentLanguage, {
                    count: formatNumber(result.chunksCount, currentLanguage),
                  })}
                </span>
              </span>
            )}
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-950/50 text-emerald-300 border border-emerald-500/30">
              <span>{t('antiHallucinationBadge', currentLanguage)}</span>
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 truncate max-w-sm" dir="auto">
            {t('resultSource', currentLanguage)}: {result.fileName}
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex items-center p-1 rounded-xl bg-slate-950/70 border border-slate-800 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveMode('exact')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeMode === 'exact'
                ? 'bg-teal-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            aria-pressed={activeMode === 'exact'}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{t('exactModeTitle', currentLanguage)}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMode('edited')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeMode === 'edited'
                ? 'bg-teal-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            aria-pressed={activeMode === 'edited'}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('editedModeTitle', currentLanguage)}</span>
          </button>
        </div>
      </div>

      {/* Mode explanation banner */}
      <div className="mt-3.5 mb-3 px-3.5 py-2 rounded-xl bg-slate-850 border border-slate-800/80 text-xs text-slate-300 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {activeMode === 'exact' ? (
            <FileText className="w-4 h-4 text-teal-400 shrink-0" />
          ) : (
            <Sparkles className="w-4 h-4 text-teal-400 shrink-0" />
          )}
          <span>
            {activeMode === 'exact'
              ? t('viewExactNote', currentLanguage)
              : t('viewEditedNote', currentLanguage)}
          </span>
        </div>
        <button
          type="button"
          onClick={handleRestoreInitial}
          className="text-[11px] text-teal-400 hover:text-teal-300 underline font-medium mr-2 shrink-0 cursor-pointer"
          title="Reset to original AI transcript"
        >
          {t('resetTranscript', currentLanguage)}
        </button>
      </div>

      {/* Text Editor */}
      <div className="relative mt-2">
        <div className="flex items-center justify-between mb-1.5 px-1">
          <span className="text-xs font-medium text-slate-400">
            {t('editableLabel', currentLanguage)}
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold text-teal-300 hover:text-white bg-teal-500/15 hover:bg-teal-500/25 border border-teal-500/40 transition-all cursor-pointer active:scale-95"
            aria-label="Copy to Clipboard"
            title="Copy to Clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-teal-400 stroke-[3]" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-teal-400" />
                <span>{t('copyButton', currentLanguage)}</span>
              </>
            )}
          </button>
        </div>
        <label htmlFor="transcript-editor" className="sr-only">
          Transcript Editor
        </label>
        <textarea
          id="transcript-editor"
          value={currentContent}
          onChange={(e) => handleTextChange(e.target.value)}
          rows={10}
          dir={isRTLText ? 'rtl' : 'ltr'}
          className="w-full rounded-xl bg-slate-950/80 border border-slate-700/80 focus:border-teal-400 focus:ring-1 focus:ring-teal-400 text-slate-100 p-4 text-sm sm:text-base leading-relaxed resize-y outline-none transition-all placeholder:text-slate-600 font-normal"
          placeholder="Transcription will appear here..."
        />
      </div>

      {/* Inaudible hint if detected */}
      {hasInaudible && (
        <div className="mt-2.5 px-3 py-2 rounded-lg bg-amber-950/30 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
          <HelpCircle className="w-4 h-4 shrink-0 text-amber-400" />
          <span>
            Parts marked as <strong className="font-bold">[Inaudible] / [نامفهوم]</strong> indicate words that could not be clearly resolved due to background noise or overlapping voices.
          </span>
        </div>
      )}

      {/* Stats bar */}
      <div className="mt-3.5 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 pt-3 border-t border-slate-800">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <Type className="w-3.5 h-3.5 text-teal-400" />
            <span>{t('wordCount', currentLanguage)}:</span>
            <strong className="text-slate-200 font-semibold">{formatNumber(wordCount, currentLanguage)}</strong>
          </span>
          <span className="flex items-center gap-1.5">
            <span>{t('charCount', currentLanguage)}:</span>
            <strong className="text-slate-200 font-semibold">{formatNumber(charCount, currentLanguage)}</strong>
          </span>
          <span className="hidden sm:flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-teal-400" />
            <span>{t('readingTime', currentLanguage)}:</span>
            <strong className="text-slate-200 font-semibold">
              {t('readingTimeValue', currentLanguage, { min: formatNumber(readingMinutes, currentLanguage) })}
            </strong>
          </span>
        </div>

        {result.modelUsed && (
          <span className="text-[11px] text-slate-400 hidden md:block">
            {t('modelUsed', currentLanguage)}: <span className="font-mono text-teal-400/90">{result.modelUsed}</span>
          </span>
        )}
      </div>

      {/* Action Buttons: Copy, Download, New Audio */}
      <div className="mt-5 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleCopy}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-md shadow-teal-500/20 active:scale-95 transition-all cursor-pointer"
            aria-label="Copy to Clipboard"
            title="Copy to Clipboard"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-slate-950 stroke-[3]" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-950" />
                <span>{t('copyButton', currentLanguage)}</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 active:scale-95 transition-all cursor-pointer"
            title="Download full text with UTF-8 BOM"
          >
            <Download className="w-4 h-4 text-teal-400" />
            <span>{t('downloadTxt', currentLanguage)}</span>
          </button>
        </div>

        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-slate-300 hover:text-white bg-slate-950/60 hover:bg-slate-800 border border-slate-800 transition-colors cursor-pointer"
        >
          <PlusCircle className="w-4 h-4 text-teal-400" />
          <span>{t('newAudioButton', currentLanguage)}</span>
        </button>
      </div>
    </div>
  );
};
