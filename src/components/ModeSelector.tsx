import React from 'react';
import { FileText, Sparkles, CheckCircle2 } from 'lucide-react';
import { OutputMode } from '../types.ts';
import { UILanguage, t } from '../utils/i18n.ts';

interface ModeSelectorProps {
  currentMode: OutputMode;
  currentLanguage: UILanguage;
  onModeChange: (mode: OutputMode) => void;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({
  currentMode,
  currentLanguage,
  onModeChange,
}) => {
  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2.5">
        <label className="text-sm font-bold text-slate-200 flex items-center gap-2">
          <span>{t('outputModeLabel', currentLanguage)}</span>
        </label>
        <span className="text-xs text-slate-400">
          {t('outputModeDesc', currentLanguage)}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Mode 1: Verbatim Exact */}
        <button
          type="button"
          onClick={() => onModeChange('exact')}
          className={`relative p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
            currentMode === 'exact'
              ? 'bg-slate-800/90 border-teal-500 shadow-md shadow-teal-500/10 ring-1 ring-teal-500/50'
              : 'bg-slate-900/50 border-slate-800 hover:bg-slate-850 hover:border-slate-700'
          }`}
          aria-pressed={currentMode === 'exact'}
        >
          <div className="flex items-start justify-between w-full mb-1.5">
            <div className="flex items-center gap-2">
              <div
                className={`p-1.5 rounded-lg ${
                  currentMode === 'exact' ? 'bg-teal-500/20 text-teal-300' : 'bg-slate-800 text-slate-400'
                }`}
              >
                <FileText className="w-4 h-4" />
              </div>
              <span className="text-sm font-bold text-white">
                {t('exactModeTitle', currentLanguage)}
              </span>
            </div>
            {currentMode === 'exact' && (
              <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
            )}
          </div>
          <p className="text-xs text-slate-300 leading-relaxed mt-1">
            {t('exactModeDesc', currentLanguage)}
          </p>
        </button>

        {/* Mode 2: Polished & Punctuated */}
        <button
          type="button"
          onClick={() => onModeChange('edited')}
          className={`relative p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
            currentMode === 'edited'
              ? 'bg-slate-800/90 border-teal-500 shadow-md shadow-teal-500/10 ring-1 ring-teal-500/50'
              : 'bg-slate-900/50 border-slate-800 hover:bg-slate-850 hover:border-slate-700'
          }`}
          aria-pressed={currentMode === 'edited'}
        >
          <div className="flex items-start justify-between w-full mb-1.5">
            <div className="flex items-center gap-2">
              <div
                className={`p-1.5 rounded-lg ${
                  currentMode === 'edited' ? 'bg-teal-500/20 text-teal-300' : 'bg-slate-800 text-slate-400'
                }`}
              >
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-sm font-bold text-white">
                {t('editedModeTitle', currentLanguage)}
              </span>
            </div>
            {currentMode === 'edited' && (
              <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
            )}
          </div>
          <p className="text-xs text-slate-300 leading-relaxed mt-1">
            {t('editedModeDesc', currentLanguage)}
          </p>
        </button>
      </div>
    </div>
  );
};
