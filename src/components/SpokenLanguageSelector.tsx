import React, { useState, useRef, useEffect } from 'react';
import { Languages, ChevronDown, Check, Sparkles, Edit3 } from 'lucide-react';
import { UILanguage, SUPPORTED_SPOKEN_LANGUAGES, t } from '../utils/i18n.ts';

interface SpokenLanguageSelectorProps {
  currentLanguage: UILanguage;
  selectedSpokenLanguage: string;
  customSpokenLanguage: string;
  onSelectSpokenLanguage: (langCode: string) => void;
  onCustomLanguageChange: (name: string) => void;
  disabled?: boolean;
}

export const SpokenLanguageSelector: React.FC<SpokenLanguageSelectorProps> = ({
  currentLanguage,
  selectedSpokenLanguage,
  customSpokenLanguage,
  onSelectSpokenLanguage,
  onCustomLanguageChange,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeOption =
    SUPPORTED_SPOKEN_LANGUAGES.find((opt) => opt.code === selectedSpokenLanguage) ||
    SUPPORTED_SPOKEN_LANGUAGES[0];

  return (
    <div ref={containerRef} className="p-4 sm:p-5 rounded-2xl bg-slate-900/40 border border-slate-800 backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <Languages className="w-4 h-4 text-teal-400" />
          <span className="text-sm font-bold text-white">
            {t('spokenLanguageLabel', currentLanguage)}
          </span>
        </div>
        <p className="text-xs text-slate-400">
          {t('spokenLanguageDesc', currentLanguage)}
        </p>
      </div>

      <div className="relative">
        {/* Trigger Button */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full p-3 rounded-xl border flex items-center justify-between text-left transition-all cursor-pointer ${
            disabled
              ? 'bg-slate-900/60 border-slate-800 text-slate-500 cursor-not-allowed'
              : isOpen
              ? 'bg-slate-850 border-teal-500/50 text-white shadow-lg shadow-teal-500/10'
              : 'bg-slate-900/80 border-slate-700/70 text-slate-200 hover:border-slate-600 hover:bg-slate-850'
          }`}
          aria-expanded={isOpen}
          aria-label="Select Spoken Language"
        >
          <div className="flex items-center gap-2.5 truncate">
            <span className="text-base shrink-0">{activeOption.flag}</span>
            <div className="truncate">
              <span className="font-semibold text-xs sm:text-sm text-slate-100">
                {activeOption.code === 'custom' && customSpokenLanguage.trim()
                  ? customSpokenLanguage.trim()
                  : activeOption.nameNative}
              </span>
              <span className="text-xs text-slate-400 ml-2">
                ({activeOption.nameEn})
              </span>
            </div>
          </div>
          <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown Options */}
        {isOpen && !disabled && (
          <div className="absolute top-full left-0 right-0 mt-2 max-h-72 overflow-y-auto rounded-xl bg-slate-900 border border-slate-700/80 shadow-2xl p-1.5 z-40 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
              {SUPPORTED_SPOKEN_LANGUAGES.map((option) => {
                const isSelected = selectedSpokenLanguage === option.code;
                return (
                  <button
                    key={option.code}
                    type="button"
                    onClick={() => {
                      onSelectSpokenLanguage(option.code);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left p-2 rounded-lg flex items-center justify-between transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-teal-500/20 text-teal-300 font-semibold border border-teal-500/30'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span>{option.flag}</span>
                      <span className="truncate">{option.nameNative}</span>
                      <span className="text-[10px] text-slate-400 truncate hidden sm:inline">
                        ({option.nameEn.split('(')[0].trim()})
                      </span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-teal-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Custom Language input if "custom" selected */}
      {selectedSpokenLanguage === 'custom' && (
        <div className="mt-3 flex items-center gap-2">
          <Edit3 className="w-4 h-4 text-teal-400 shrink-0" />
          <input
            type="text"
            value={customSpokenLanguage}
            onChange={(e) => onCustomLanguageChange(e.target.value)}
            placeholder={t('customLanguagePlaceholder', currentLanguage)}
            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-teal-500/40 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400"
            disabled={disabled}
            autoFocus
          />
        </div>
      )}
    </div>
  );
};
