import React, { useRef, useState, useEffect } from 'react';
import {
  UploadCloud,
  FileAudio,
  Mic,
  Square,
  Play,
  Pause,
  AlertCircle,
  X,
  Volume2,
  Sparkles,
} from 'lucide-react';
import { AudioFileInfo } from '../types.ts';
import {
  validateAudioFile,
  formatFileSize,
  formatDuration,
  formatNumber,
} from '../utils/textUtils.ts';
import { UILanguage, t } from '../utils/i18n.ts';

interface AudioUploaderProps {
  currentAudio: AudioFileInfo | null;
  currentLanguage: UILanguage;
  onAudioSelected: (audio: AudioFileInfo | null) => void;
  disabled?: boolean;
}

export const AudioUploader: React.FC<AudioUploaderProps> = ({
  currentAudio,
  currentLanguage,
  onAudioSelected,
  disabled = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioPreviewRef = useRef<HTMLAudioElement>(null);

  const [dragActive, setDragActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Live recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordTimerRef = useRef<number | null>(null);

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Reset audio playback states when audio changes
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(currentAudio?.durationSeconds || 0);
  }, [currentAudio]);

  // Clean up recording timer on unmount
  useEffect(() => {
    return () => {
      if (recordTimerRef.current) clearInterval(recordTimerRef.current);
    };
  }, []);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setErrorMessage(null);

    const file = files[0];
    const validation = validateAudioFile({
      name: file.name,
      size: file.size,
      type: file.type,
    });

    if (!validation.valid) {
      if (file.size <= 0) {
        setErrorMessage(t('emptyFile', currentLanguage));
      } else if (file.size > 100 * 1024 * 1024) {
        setErrorMessage(t('fileTooLarge', currentLanguage));
      } else {
        setErrorMessage(t('unsupportedFormat', currentLanguage));
      }
      return;
    }

    try {
      // Create preview object URL
      const previewUrl = URL.createObjectURL(file);

      // Read duration
      const tempAudio = new Audio(previewUrl);
      let detectedDuration = 0;
      await new Promise<void>((resolve) => {
        tempAudio.onloadedmetadata = () => {
          detectedDuration = tempAudio.duration || 0;
          resolve();
        };
        tempAudio.onerror = () => resolve();
        // Fallback timeout in case metadata event doesn't fire
        setTimeout(() => resolve(), 1500);
      });

      // Convert file to base64
      const reader = new FileReader();
      reader.onload = () => {
        const base64Data = (reader.result as string).split(',')[1];
        onAudioSelected({
          file,
          name: file.name,
          size: file.size,
          type: validation.normalizedMime,
          durationSeconds: detectedDuration,
          previewUrl,
          base64Data,
        });
      };
      reader.onerror = () => {
        setErrorMessage(currentLanguage === 'fa' ? 'خطا در خواندن فایل صوتی از دستگاه.' : 'Error reading audio file from device.');
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setErrorMessage((currentLanguage === 'fa' ? 'خطا در بارگذاری فایل: ' : 'Error uploading file: ') + (err?.message || 'Unknown'));
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (disabled || isRecording) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  // Start microphone recording
  const startRecording = async () => {
    setErrorMessage(null);
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setErrorMessage(currentLanguage === 'fa' ? 'مرورگر شما از قابلیت ضبط صدا با میکروفون پشتیبانی نمی‌کند.' : 'Your browser does not support audio recording.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      // Determine supported mime type for recording
      let mimeType = 'audio/webm';
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4';
      } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
        mimeType = 'audio/ogg';
      }

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        // Stop audio tracks
        stream.getTracks().forEach((track) => track.stop());

        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        if (audioBlob.size < 100) {
          setErrorMessage(currentLanguage === 'fa' ? 'صدایی ضبط نشد. لطفاً مجدداً امتحان کنید.' : 'No speech detected in recording.');
          return;
        }

        const previewUrl = URL.createObjectURL(audioBlob);
        const reader = new FileReader();
        reader.onload = () => {
          const base64Data = (reader.result as string).split(',')[1];
          const recName = `live-recording-${Date.now()}.webm`;
          const recFile = new File([audioBlob], recName, { type: mimeType });
          onAudioSelected({
            file: recFile,
            name: recName,
            size: audioBlob.size,
            type: 'audio/webm',
            durationSeconds: recordingSeconds,
            previewUrl,
            base64Data,
          });
        };
        reader.readAsDataURL(audioBlob);
      };

      mediaRecorder.start(250);
      setIsRecording(true);
      setRecordingSeconds(0);

      recordTimerRef.current = window.setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Mic access error:', err);
      setErrorMessage(currentLanguage === 'fa' ? 'دسترسی به میکروفون داده نشد یا میکروفون در دسترس نیست.' : 'Microphone permission was not granted or microphone is unavailable.');
    }
  };

  // Stop microphone recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordTimerRef.current) {
        clearInterval(recordTimerRef.current);
        recordTimerRef.current = null;
      }
    }
  };

  // Predefined sample selector
  const loadSampleAudio = async (samplePath: string, sampleTitle: string) => {
    setErrorMessage(null);
    try {
      const response = await fetch(samplePath);
      if (!response.ok) throw new Error('Error fetching sample');
      const blob = await response.blob();
      const fileName = `${sampleTitle}.wav`;
      const file = new File([blob], fileName, { type: 'audio/wav' });
      const previewUrl = URL.createObjectURL(blob);

      const reader = new FileReader();
      reader.onload = () => {
        const base64Data = (reader.result as string).split(',')[1];
        onAudioSelected({
          file,
          name: fileName,
          size: blob.size,
          type: 'audio/wav',
          durationSeconds: 3,
          previewUrl,
          base64Data,
        });
      };
      reader.readAsDataURL(blob);
    } catch (err: any) {
      setErrorMessage((currentLanguage === 'fa' ? 'خطا در بارگذاری نمونه: ' : 'Error loading sample: ') + err?.message);
    }
  };

  const handleClearAudio = () => {
    if (currentAudio?.previewUrl) {
      URL.revokeObjectURL(currentAudio.previewUrl);
    }
    onAudioSelected(null);
    setErrorMessage(null);
  };

  const togglePlayAudio = () => {
    if (!audioPreviewRef.current) return;
    if (isPlaying) {
      audioPreviewRef.current.pause();
      setIsPlaying(false);
    } else {
      audioPreviewRef.current.play().then(() => setIsPlaying(true)).catch((e) => {
        console.warn('Playback error:', e);
        setIsPlaying(false);
      });
    }
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*,.mp3,.wav,.m4a,.webm,.ogg,.aac,.flac"
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
        disabled={disabled || isRecording}
      />

      {/* Main Dropzone / Card */}
      {!currentAudio ? (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-2xl p-6 sm:p-10 transition-all flex flex-col items-center justify-center text-center ${
            dragActive
              ? 'border-teal-400 bg-teal-500/10 scale-[1.01]'
              : 'border-slate-700/80 hover:border-teal-500/50 bg-slate-900/40 hover:bg-slate-900/60'
          } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
        >
          {/* Active recording state */}
          {isRecording ? (
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-rose-500/20 border-2 border-rose-500 flex items-center justify-center animate-pulse">
                  <Mic className="w-8 h-8 text-rose-500 animate-bounce" />
                </div>
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500"></span>
                </span>
              </div>

              <div>
                <p className="text-base font-bold text-white mb-1">
                  {t('recordingActive', currentLanguage)}
                </p>
                <p className="text-2xl font-mono font-black text-rose-400 tracking-wider">
                  {formatDuration(recordingSeconds, currentLanguage)}
                </p>
              </div>

              <button
                type="button"
                onClick={stopRecording}
                className="mt-2 inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30 active:scale-95 transition-all cursor-pointer"
              >
                <Square className="w-4 h-4 fill-white" />
                <span>{t('stopRecording', currentLanguage)}</span>
              </button>
            </div>
          ) : (
            /* Upload / Browse / Mic start options */
            <div className="flex flex-col items-center">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-center mb-4 text-teal-400 shadow-inner group hover:scale-105 transition-transform cursor-pointer"
              >
                <UploadCloud className="w-8 h-8 sm:w-10 sm:h-10 group-hover:text-teal-300 transition-colors" />
              </div>

              <h2 className="text-base sm:text-lg font-bold text-white mb-1.5">
                {t('selectAudioFile', currentLanguage)}
              </h2>

              <p className="text-xs sm:text-sm text-slate-400 max-w-md mb-6 leading-relaxed">
                {t('uploaderDescription', currentLanguage)}
              </p>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={disabled}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl font-bold text-base bg-gradient-to-r from-teal-500 to-teal-400 hover:from-teal-400 hover:to-teal-300 text-slate-950 shadow-lg shadow-teal-500/25 active:scale-98 transition-all cursor-pointer"
                >
                  <FileAudio className="w-5 h-5 text-slate-950" />
                  <span>{t('browseFile', currentLanguage)}</span>
                </button>

                <button
                  type="button"
                  onClick={startRecording}
                  disabled={disabled}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-medium text-sm bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700/80 active:scale-98 transition-all cursor-pointer"
                  title="Record audio with microphone"
                >
                  <Mic className="w-4 h-4 text-teal-400" />
                  <span>{t('orRecordMic', currentLanguage)}</span>
                </button>
              </div>

              {/* Quick test sample clips */}
              <div className="mt-6 pt-5 border-t border-slate-800/80 w-full max-w-md">
                <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 mb-2.5">
                  <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                  <span>{t('quickSamples', currentLanguage)}</span>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => loadSampleAudio('/samples/sample1.wav', 'sample-short-audio')}
                    className="px-3 py-1.5 rounded-lg text-xs bg-slate-800/90 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
                  >
                    {t('sampleShort', currentLanguage)}
                  </button>
                  <button
                    type="button"
                    onClick={() => loadSampleAudio('/samples/sample2.wav', 'sample-conversational-audio')}
                    className="px-3 py-1.5 rounded-lg text-xs bg-slate-800/90 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
                  >
                    {t('sampleConversation', currentLanguage)}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Selected Audio Preview Card */
        <div className="border border-teal-500/40 rounded-2xl p-4 sm:p-5 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-slate-850/80 shadow-xl backdrop-blur-md">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-300 shrink-0">
                <FileAudio className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm sm:text-base font-bold text-white truncate" dir="auto">
                  {currentAudio.name}
                </h3>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-1">
                  <span className="font-medium text-slate-300">
                    {t('fileSize', currentLanguage)}: {formatFileSize(currentAudio.size, currentLanguage)}
                  </span>
                  <span>•</span>
                  <span>{t('fileType', currentLanguage)}: {currentAudio.type.replace('audio/', '').toUpperCase()}</span>
                  {duration > 0 && (
                    <>
                      <span>•</span>
                      <span>{t('fileDuration', currentLanguage)}: {formatDuration(duration, currentLanguage)}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleClearAudio}
              disabled={disabled}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title={t('removeAudio', currentLanguage)}
              aria-label={t('removeAudio', currentLanguage)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Audio Player Bar */}
          {currentAudio.previewUrl && (
            <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center gap-3">
              <audio
                ref={audioPreviewRef}
                src={currentAudio.previewUrl}
                onTimeUpdate={() => {
                  if (audioPreviewRef.current) {
                    setCurrentTime(audioPreviewRef.current.currentTime);
                  }
                }}
                onLoadedMetadata={() => {
                  if (audioPreviewRef.current) {
                    setDuration(audioPreviewRef.current.duration);
                  }
                }}
                onEnded={() => setIsPlaying(false)}
                className="hidden"
              />

              <button
                type="button"
                onClick={togglePlayAudio}
                className="w-9 h-9 rounded-full bg-teal-500 hover:bg-teal-400 text-slate-950 flex items-center justify-center shrink-0 transition-transform active:scale-95 cursor-pointer"
                aria-label={isPlaying ? t('pause', currentLanguage) : t('play', currentLanguage)}
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-slate-950" /> : <Play className="w-4 h-4 fill-slate-950 ml-0.5" />}
              </button>

              <div className="flex-1 flex flex-col justify-center">
                <div className="flex items-center justify-between text-[11px] font-medium text-slate-400 mb-1">
                  <span>{formatDuration(currentTime, currentLanguage)}</span>
                  <span>{formatDuration(duration, currentLanguage)}</span>
                </div>
                <div
                  className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden cursor-pointer"
                  onClick={(e) => {
                    if (!audioPreviewRef.current || duration <= 0) return;
                    const rect = e.currentTarget.getBoundingClientRect();
                    const clickX = e.clientX - rect.left;
                    const percent = Math.max(0, Math.min(1, clickX / rect.width));
                    audioPreviewRef.current.currentTime = percent * duration;
                  }}
                >
                  <div
                    className="bg-teal-400 h-full rounded-full transition-all"
                    style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <Volume2 className="w-4 h-4 text-slate-400 hidden sm:block" />
            </div>
          )}
        </div>
      )}

      {/* Error Alert */}
      {errorMessage && (
        <div className="mt-3 p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs sm:text-sm flex items-start gap-2.5 animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1 leading-relaxed">{errorMessage}</div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-rose-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
