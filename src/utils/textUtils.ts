/**
 * Pure Persian text and audio validation utilities.
 * Completely decoupled from React for testing and performance.
 */

export const SUPPORTED_AUDIO_EXTENSIONS = ['.mp3', '.wav', '.m4a', '.webm', '.ogg', '.aac', '.flac'];

export const SUPPORTED_MIME_TYPES: Record<string, string> = {
  'audio/mpeg': 'audio/mp3',
  'audio/mp3': 'audio/mp3',
  'audio/wav': 'audio/wav',
  'audio/x-wav': 'audio/wav',
  'audio/wave': 'audio/wav',
  'audio/webm': 'audio/webm',
  'audio/ogg': 'audio/ogg',
  'audio/x-m4a': 'audio/m4a',
  'audio/m4a': 'audio/m4a',
  'audio/mp4': 'audio/mp4',
  'audio/aac': 'audio/aac',
  'audio/flac': 'audio/flac',
};

export const MAX_AUDIO_SIZE_BYTES = 100 * 1024 * 1024; // 100 MB (suitable for long podcasts, lectures, and interviews)
export const MAX_AUDIO_DURATION_SECONDS = 75 * 60; // 75 minutes max recommended duration

export interface FileValidationResult {
  valid: boolean;
  errorFa?: string;
  normalizedMime: string;
}

/**
 * Validates audio file type and size with natural Persian error messages.
 */
export function validateAudioFile(file: { name: string; size: number; type?: string }): FileValidationResult {
  if (!file) {
    return {
      valid: false,
      errorFa: 'هیچ فایلی انتخاب نشده است.',
      normalizedMime: '',
    };
  }

  if (file.size <= 0) {
    return {
      valid: false,
      errorFa: 'فایل صوتی انتخاب شده خالی است (حجم صفر بایت).',
      normalizedMime: '',
    };
  }

  if (file.size > MAX_AUDIO_SIZE_BYTES) {
    return {
      valid: false,
      errorFa: `حجم فایل (${formatFileSize(file.size)}) بیشتر از سقف مجاز (۱۰۰ مگابایت) است. برای فایل‌های بسیار طولانی، لطفاً از فرمت فشرده مانند MP3 یا M4A استفاده فرمایید.`,
      normalizedMime: '',
    };
  }

  const extension = '.' + (file.name.split('.').pop() || '').toLowerCase();
  const rawType = (file.type || '').toLowerCase();

  let normalizedMime = SUPPORTED_MIME_TYPES[rawType];

  if (!normalizedMime) {
    // Attempt deduction from file extension
    switch (extension) {
      case '.mp3':
        normalizedMime = 'audio/mp3';
        break;
      case '.wav':
        normalizedMime = 'audio/wav';
        break;
      case '.m4a':
        normalizedMime = 'audio/m4a';
        break;
      case '.webm':
        normalizedMime = 'audio/webm';
        break;
      case '.ogg':
        normalizedMime = 'audio/ogg';
        break;
      case '.aac':
        normalizedMime = 'audio/aac';
        break;
      case '.flac':
        normalizedMime = 'audio/flac';
        break;
      default:
        return {
          valid: false,
          errorFa: `فرمت فایل پشتیبانی نمی‌شود (${extension || 'نامشخص'}). لطفاً فایل با فرمت‌های MP3، WAV، M4A، AAC یا WebM انتخاب کنید.`,
          normalizedMime: '',
        };
    }
  }

  return {
    valid: true,
    normalizedMime,
  };
}

const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

/**
 * Converts Western digits 0-9 into Persian digits ۰-۹
 */
export function formatPersianNumber(value: number | string): string {
  const str = String(value);
  return str.replace(/\d/g, (d) => PERSIAN_DIGITS[parseInt(d, 10)] ?? d);
}

/**
 * General number formatter respecting active UI language
 */
export function formatNumber(value: number | string, lang: string = 'en'): string {
  if (lang === 'fa' || lang === 'ar') {
    return formatPersianNumber(value);
  }
  return String(value);
}

/**
 * Formats byte size into human-readable size string in chosen language
 */
export function formatFileSize(bytes: number, lang: string = 'fa'): string {
  const isRTL = lang === 'fa' || lang === 'ar';
  if (bytes <= 0) return isRTL ? '۰ بایت' : '0 B';

  if (bytes < 1024) {
    return isRTL ? `${formatPersianNumber(bytes)} بایت` : `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    const kb = (bytes / 1024).toFixed(1).replace('.0', '');
    return isRTL ? `${formatPersianNumber(kb)} کیلوبایت` : `${kb} KB`;
  }
  const mb = (bytes / (1024 * 1024)).toFixed(1).replace('.0', '');
  return isRTL ? `${formatPersianNumber(mb)} مگابایت` : `${mb} MB`;
}

/**
 * Formats duration in seconds into MM:SS format in chosen language
 */
export function formatDuration(seconds: number, lang: string = 'fa'): string {
  if (isNaN(seconds) || seconds < 0) return lang === 'fa' || lang === 'ar' ? '۰۰:۰۰' : '00:00';
  const total = Math.floor(seconds);
  const m = Math.floor(total / 60);
  const s = total % 60;
  const mStr = m.toString().padStart(2, '0');
  const sStr = s.toString().padStart(2, '0');
  if (lang === 'fa' || lang === 'ar') {
    return `${formatPersianNumber(mStr)}:${formatPersianNumber(sStr)}`;
  }
  return `${mStr}:${sStr}`;
}

/**
 * Accurately counts Persian words, respecting Persian half-spaces (ZWNJ).
 */
export function countPersianWords(text: string): number {
  if (!text || typeof text !== 'string') return 0;
  const cleaned = text
    .trim()
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/[«»"،؛؟!().:\-–—\\[\]{}"'…*]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleaned) return 0;
  return cleaned.split(' ').filter(Boolean).length;
}

/**
 * Cleans and standardizes Persian text:
 * - Normalizes Arabic Yeh (ي -> ی) and Kaf (ك -> ک)
 * - Standardizes Persian punctuation marks
 * - Enforces Persian half-spaces (ZWNJ) for prefixes (می / نمی) and suffixes (ها / تر)
 * - Removes excessive spaces
 */
export function normalizePersianText(text: string): string {
  if (!text) return '';
  return text
    .replace(/ي/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/,/g, '،')
    .replace(/;/g, '؛')
    .replace(/\?/g, '؟')
    .replace(/%{1,}/g, '٪')
    .replace(/،+/g, '،')
    .replace(/؟+/g, '؟')
    .replace(/؛+/g, '؛')
    .replace(/(^|\s)می\s+/g, '$1می\u200c')
    .replace(/(^|\s)نمی\s+/g, '$1نمی\u200c')
    .replace(/\s+ها(\s|[«»"،؛؟!().:\-–—\\[\]{}"'…*]|$)/g, '\u200cها$1')
    .replace(/\s+های(\s|[«»"،؛؟!().:\-–—\\[\]{}"'…*]|$)/g, '\u200cهای$1')
    .replace(/\s+تر(\s|[«»"،؛؟!().:\-–—\\[\]{}"'…*]|$)/g, '\u200cتر$1')
    .replace(/\s+ترین(\s|[«»"،؛؟!().:\-–—\\[\]{}"'…*]|$)/g, '\u200cترین$1')
    .replace(/[ \t]+/g, ' ')
    .replace(/ \n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Creates a downloadable Blob with UTF-8 BOM so text editors on Windows/Mac
 * open Persian characters without encoding or garbled font issues.
 */
export function createPersianDownloadBlob(text: string): Blob {
  // \uFEFF is the UTF-8 Byte Order Mark
  return new Blob(['\uFEFF' + text], { type: 'text/plain;charset=utf-8' });
}
