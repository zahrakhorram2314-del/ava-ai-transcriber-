import React, { useState, useRef, useEffect } from 'react';
import { Mic, Globe, ChevronDown, Check, HelpCircle } from 'lucide-react';
import { BackendHealth } from '../types.ts';
import { UILanguage, SUPPORTED_UI_LANGUAGES, t } from '../utils/i18n.ts';

interface HeaderProps {
  backendHealth: BackendHealth | null;
  currentLanguage: UILanguage;
  onLanguageChange: (lang: UILanguage) => void;
  onOpenHelp: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  backendHealth,
  currentLanguage,
  onLanguageChange,
  onOpenHelp,
}) => {
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeLangObj = SUPPORTED_UI_LANGUAGES.find((l) => l.code === currentLanguage) || SUPPORTED_UI_LANGUAGES[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setLangMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="border-b border-slate-800/80 bg-slate-900/70 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 text-slate-950 shadow-lg shadow-teal-500/20">
            <Mic className="w-5 h-5 stroke-[2.5]" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-300"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                <span>{currentLanguage === 'fa' ? 'آوا' : 'Ava'}</span>
                <span className="text-teal-400 text-xs font-semibold tracking-wider font-mono px-1.5 py-0.5 rounded bg-slate-800 border border-teal-500/30">
                  AI
                </span>
              </h1>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-teal-500/10 text-teal-300 border border-teal-500/20">
                {activeLangObj.nativeName}
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden md:block">
              {t('appSubtitle', currentLanguage)}
            </p>
          </div>
        </div>

        {/* Right actions: Language Switcher, Health & Help */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* UI Language Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-200 bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700/80 transition-all cursor-pointer shadow-sm"
              title={t('uiLanguage', currentLanguage)}
              aria-label="Select Interface Language"
              aria-expanded={langMenuOpen}
            >
              <Globe className="w-3.5 h-3.5 text-teal-400" />
              <span className="text-xs">{activeLangObj.flag}</span>
              <span className="hidden sm:inline font-semibold">{activeLangObj.nativeName}</span>
              <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${langMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {langMenuOpen && (
              <div
                className="absolute right-0 mt-1.5 w-52 max-h-72 overflow-y-auto rounded-xl bg-slate-900 border border-slate-700/80 shadow-2xl p-1 z-50 text-xs"
                dir="ltr"
              >
                <div className="px-2.5 py-1.5 text-[10px] uppercase tracking-wider text-slate-400 border-b border-slate-800 font-bold flex items-center justify-between">
                  <span>Interface Language</span>
                  <Globe className="w-3 h-3 text-teal-400" />
                </div>
                <div className="py-1">
                  {SUPPORTED_UI_LANGUAGES.map((lang) => {
                    const isSelected = lang.code === currentLanguage;
                    return (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => {
                          onLanguageChange(lang.code);
                          setLangMenuOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-teal-500/20 text-teal-300 font-semibold border border-teal-500/30'
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span>{lang.flag}</span>
                          <span>{lang.nativeName}</span>
                          <span className="text-[10px] text-slate-500">({lang.name})</span>
                        </span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-teal-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Backend Status indicator */}
          {backendHealth && (
            <div
              className={`hidden xs:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs border ${
                backendHealth.hasApiKey
                  ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                  : 'bg-amber-950/40 border-amber-500/30 text-amber-300'
              }`}
              title={
                backendHealth.hasApiKey
                  ? 'Gemini API Connected'
                  : 'GEMINI_API_KEY required in AI Studio Secrets'
              }
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  backendHealth.hasApiKey ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                }`}
              />
              <span className="text-[11px] font-medium hidden md:inline">
                {backendHealth.hasApiKey ? t('apiReady', currentLanguage) : t('apiNeedsKey', currentLanguage)}
              </span>
            </div>
          )}

          {/* Help & Privacy button */}
          <button
            onClick={onOpenHelp}
            type="button"
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 transition-colors cursor-pointer"
            aria-label={t('helpAndPrivacy', currentLanguage)}
          >
            <HelpCircle className="w-3.5 h-3.5 text-teal-400" />
            <span className="hidden sm:inline">{t('helpAndPrivacy', currentLanguage)}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
