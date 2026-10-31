import React from 'react';
import { X, Mic, Sparkles, Shield, KeyRound, CheckCircle2 } from 'lucide-react';
import { UILanguage, t } from '../utils/i18n.ts';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  hasApiKey: boolean;
  currentLanguage?: UILanguage;
}

export const HelpModal: React.FC<HelpModalProps> = ({
  isOpen,
  onClose,
  hasApiKey,
  currentLanguage = 'en',
}) => {
  if (!isOpen) return null;

  const isFa = currentLanguage === 'fa';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-teal-500/20 text-teal-300">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white">
              {isFa ? 'راهنما و مشخصات آوا AI' : 'Ava AI Help & Specifications'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
          {/* Status section */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <h4 className="font-semibold text-white flex items-center gap-2 mb-1.5">
              <KeyRound className="w-4 h-4 text-teal-400" />
              <span>{isFa ? 'وضعیت اتصال به هوش مصنوعی' : 'AI Connection Status'}</span>
            </h4>
            {hasApiKey ? (
              <div className="flex items-center gap-2 text-emerald-300">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>
                  {isFa
                    ? 'کلید دسترسی Gemini API بر روی سرور فعال و آماده پردازش است.'
                    : 'Gemini API key is active and ready on the server.'}
                </span>
              </div>
            ) : (
              <div className="text-amber-300 space-y-1">
                <p>
                  {isFa
                    ? 'کلید دسترسی GEMINI_API_KEY در متغیرهای سرور یافت نشد.'
                    : 'GEMINI_API_KEY environment variable was not detected.'}
                </p>
                <p className="text-slate-400 text-xs">
                  {isFa
                    ? 'در صورت استقرار در AI Studio، کلید شما به صورت خودکار از پنل Secrets خوانده می‌شود.'
                    : 'Please configure GEMINI_API_KEY in the AI Studio Secrets panel.'}
                </p>
              </div>
            )}
          </div>

          {/* Audio tips */}
          <div>
            <h4 className="font-semibold text-white flex items-center gap-2 mb-2">
              <Mic className="w-4 h-4 text-teal-400" />
              <span>{isFa ? 'نکات دستیابی به بالاترین دقت پیاده‌سازی' : 'Accuracy & Audio Tips'}</span>
            </h4>
            <ul className="list-disc list-inside space-y-1.5 text-slate-400 pr-1">
              {isFa ? (
                <>
                  <li>پشتیبانی از هر زبان مادری بین‌المللی با دقت فوق‌العاده.</li>
                  <li>پشتیبانی از پادکست‌ها، مصاحبه‌ها و سخنرانی‌های طولانی تا سقف ۱۰۰ مگابایت و ۷۵ دقیقه.</li>
                  <li>فایل‌های طولانی به صورت بخش‌بندی متوالی پردازش شده و متن کامل بدون قطعی یا خلاصه شدن استخراج می‌شود.</li>
                  <li>فرمت‌های MP3، M4A، WAV، WebM، AAC، OGG و FLAC بیشترین سازگاری را دارند.</li>
                </>
              ) : (
                <>
                  <li>Supports any native international language with native dialect fidelity.</li>
                  <li>Supports long podcasts, interviews, and lectures up to 100MB and ~75 minutes.</li>
                  <li>Long files are processed sequentially in smart chunks to extract the complete transcript without cuts or truncation.</li>
                  <li>Popular audio formats supported: MP3, WAV, M4A, AAC, WebM, OGG, and FLAC.</li>
                </>
              )}
            </ul>
          </div>

          {/* Privacy */}
          <div>
            <h4 className="font-semibold text-white flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-teal-400" />
              <span>{isFa ? 'حفظ محرمانگی صدا و متون' : 'Privacy & Confidentiality'}</span>
            </h4>
            <p className="text-slate-400 text-xs leading-relaxed">
              {isFa
                ? 'تمامی پردازش‌های تبدیل صوت در لایه سرور به طور مستقیم با مدل Gemini انجام شده و فایل‌های صوتی بلافاصله پس از استخراج متن از حافظه موقت حذف می‌گردند. هیچ لینک عمومی برای متون یا فایل‌ها ایجاد نمی‌شود.'
                : 'All transcription processing happens securely on the server via Gemini AI. Audio files are cleared from temporary storage immediately after transcription. No public URLs are ever created.'}
            </p>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-teal-500 hover:bg-teal-400 text-slate-950 cursor-pointer"
          >
            {isFa ? 'متوجه شدم' : 'Got it'}
          </button>
        </div>
      </div>
    </div>
  );
};
