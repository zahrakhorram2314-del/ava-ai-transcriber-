import React from 'react';
import { Loader2, Mic, Sparkles, Layers, FileText } from 'lucide-react';
import { TranscriptionProgress } from '../types.ts';
import { formatNumber } from '../utils/textUtils.ts';
import { UILanguage, t } from '../utils/i18n.ts';

interface ProcessingOverlayProps {
  fileName?: string;
  progress?: TranscriptionProgress | null;
  currentLanguage?: UILanguage;
}

export const ProcessingOverlay: React.FC<ProcessingOverlayProps> = ({
  fileName,
  progress,
  currentLanguage = 'en',
}) => {
  const percent = progress?.percent ?? 15;
  const currentChunk = progress?.currentChunk ?? 0;
  const totalChunks = progress?.totalChunks ?? 1;
  const displayMessage = progress?.message || t('processingTitle', currentLanguage);
  const partialText = progress?.partialTranscript?.trim();

  return (
    <div className="w-full p-6 sm:p-8 rounded-2xl border border-teal-500/30 bg-slate-900/90 backdrop-blur-md shadow-2xl flex flex-col items-center justify-center text-center">
      {/* Central icon with pulsing effect */}
      <div className="relative mb-5">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 shadow-inner">
          <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 animate-spin text-teal-400" />
        </div>
        <div className="absolute -bottom-1 -right-1 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-900 border border-teal-500/50 flex items-center justify-center text-teal-300 shadow">
          <Mic className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </div>
      </div>

      <h3 className="text-base sm:text-lg font-bold text-white mb-1">
        {t('processingTitle', currentLanguage)}
      </h3>

      {fileName && (
        <p className="text-xs text-slate-400 max-w-sm truncate mb-4" dir="auto">
          {fileName}
        </p>
      )}

      {/* Progress Bar & Percentage */}
      <div className="w-full max-w-md my-3">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-1.5 px-0.5">
          <div className="flex items-center gap-1.5 text-teal-300">
            {totalChunks > 1 && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-teal-500/15 border border-teal-500/30 text-[11px]">
                <Layers className="w-3 h-3 text-teal-400" />
                <span>
                  {t('processingChunk', currentLanguage, {
                    current: formatNumber(currentChunk, currentLanguage),
                    total: formatNumber(totalChunks, currentLanguage),
                  })}
                </span>
              </span>
            )}
            <span>{t('processingProgress', currentLanguage)}</span>
          </div>
          <span className="text-teal-400 font-bold">
            {formatNumber(percent, currentLanguage)}%
          </span>
        </div>

        <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-700/60 shadow-inner">
          <div
            className="bg-gradient-to-r from-teal-500 via-teal-400 to-emerald-400 h-full rounded-full transition-all duration-500 ease-out shadow-sm"
            style={{ width: `${Math.min(100, Math.max(5, percent))}%` }}
          />
        </div>
      </div>

      {/* Wave animation */}
      <div className="flex items-center gap-1.5 h-7 my-3">
        {[18, 30, 14, 38, 24, 42, 20, 32, 12, 26].map((h, i) => (
          <div
            key={i}
            className="w-1.5 bg-gradient-to-t from-teal-500 to-emerald-400 rounded-full wave-bar"
            style={{ height: `${h}px`, animationDelay: `${i * 0.1}s` }}
          />
        ))}
      </div>

      {/* Current status message */}
      <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/90 border border-slate-700/80 text-xs sm:text-sm text-teal-200 mt-2 max-w-lg">
        <Sparkles className="w-4 h-4 text-teal-400 shrink-0" />
        <span className="leading-relaxed">{displayMessage}</span>
      </div>

      {/* Live partial transcript preview if available for long files */}
      {partialText && (
        <div className="w-full max-w-lg mt-5 p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-left animate-in fade-in duration-300">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-1.5">
            <FileText className="w-3.5 h-3.5 text-teal-400" />
            <span>{t('livePreview', currentLanguage)}</span>
          </div>
          <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed opacity-90 select-none">
            {partialText}
          </p>
        </div>
      )}
    </div>
  );
};
