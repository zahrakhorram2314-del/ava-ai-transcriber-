import React from 'react';
import { ShieldCheck, Lock, EyeOff, Server } from 'lucide-react';
import { UILanguage, t } from '../utils/i18n.ts';

interface PrivacyNoticeProps {
  currentLanguage?: UILanguage;
}

export const PrivacyNotice: React.FC<PrivacyNoticeProps> = ({ currentLanguage = 'en' }) => {
  return (
    <div className="w-full mt-6 p-4 rounded-xl border border-slate-800/80 bg-slate-900/40 text-xs text-slate-400">
      <div className="flex items-center gap-2 mb-2 font-semibold text-slate-200">
        <ShieldCheck className="w-4 h-4 text-teal-400" />
        <span>{t('privacyTitle', currentLanguage)}</span>
      </div>
      <p className="leading-relaxed mb-3">
        {t('privacyDesc', currentLanguage)}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <div className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-950/50 border border-slate-800/50">
          <Server className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
          <span>
            <strong className="text-slate-300 block mb-0.5">
              {t('privacyPoint1Title', currentLanguage)}
            </strong>
            {t('privacyPoint1Desc', currentLanguage)}
          </span>
        </div>

        <div className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-950/50 border border-slate-800/50">
          <Lock className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
          <span>
            <strong className="text-slate-300 block mb-0.5">
              {t('privacyPoint2Title', currentLanguage)}
            </strong>
            {t('privacyPoint2Desc', currentLanguage)}
          </span>
        </div>

        <div className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-950/50 border border-slate-800/50">
          <EyeOff className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
          <span>
            <strong className="text-slate-300 block mb-0.5">
              {t('privacyPoint3Title', currentLanguage)}
            </strong>
            {t('privacyPoint3Desc', currentLanguage)}
          </span>
        </div>
      </div>
    </div>
  );
};
