<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=10,24,15&height=200&section=header&text=Av%C4%81%20AI&fontSize=80&animation=twinkle&fontColor=ffffff" />
</div>

<div align="center">

![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)
![Gemini API](https://img.shields.io/badge/Powered%20by-Gemini%20API-8E44AD)

**Turn spoken words into text you can work with.**

Avā AI is a multilingual audio transcription app built with Google's Gemini API. It helps users turn recordings into editable text, whether they want to keep speech close to the original or make the transcript easier to read.

</div>

📖 **How was the experience designed?**  
Explore the [UX & Product Design Case Study](./docs/case-study.md) for the thinking behind the interface and product decisions.

## Preview

![Avā AI Transcriber](Screenshot_۲۰۲۶۱۱۰۴_۱۲۵۹۵۳_Chrome.png)

## What you can do with Avā AI

### 🎙️ Add and prepare audio
- Upload an audio file or record directly through your browser.
- Preview audio before starting transcription.
- Work with MP3, WAV, M4A, AAC, WebM, OGG, and FLAC files.
- Process files up to approximately 100 MB and 75 minutes long.
- Inspect audio duration with FFprobe and prepare longer files with FFmpeg.

### 🤖 Choose how your transcript reads

Avā AI offers two output modes:

- **Verbatim:** Keeps the speaker's wording, repetitions, informal expressions, and natural speech patterns.
- **Edited:** Improves punctuation, spelling, and readability while preserving the original meaning.

You can also let the app detect the spoken language, select a language yourself, or enter a custom language.

### ⏱️ Process longer recordings
Long recordings are handled in sequential audio segments:
- Audio is split into smaller parts.
- Each segment is transcribed individually.
- Results are brought back together in their original order.
- Server-Sent Events (SSE) provide progress updates while processing.
- Partial results can appear before the full transcript is ready.

### ✍️ Review, edit, and export
- Edit the transcript in the app.
- Switch between Verbatim and Edited versions.
- Restore the originally generated transcript.
- Copy text or export it as a TXT file.
- Review details such as detected language, speaking tone, word count, and processing information.

### 🌍 Use the interface in your language
- Interface localization in 11 languages.
- Right-to-left (RTL) layouts for Persian and Arabic.
- Responsive design for mobile and desktop.
- Vazirmatn typography for Persian and Arabic text.

## Built with

| Technology | Role |
|---|---|
| React 19 | Frontend |
| TypeScript | Type-safe development |
| Vite | Development and build tooling |
| Express.js | Backend server |
| Google Gemini API | AI-powered transcription |
| `@google/genai` | Gemini SDK integration |
| FFmpeg / FFprobe | Audio conversion, segmentation, and inspection |
| Multer | Audio file uploads |
| Tailwind CSS | Interface styling |
| Motion | UI animations |
| Lucide React | Interface icons |
| dotenv | Environment configuration |

## How it works

1. The user uploads an audio file or records audio in the browser.
2. The frontend sends the audio to the backend.
3. The backend validates the file and checks its duration.
4. FFmpeg prepares the audio and splits longer recordings into segments.
5. The segments are sent to Gemini for transcription.
6. The backend assembles the results in chronological order.
7. Progress updates are streamed to the frontend using Server-Sent Events.
8. The user reviews, edits, copies, or exports the transcript.

## Backend API

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/health` | GET | Backend health and configuration status |
| `/api/transcribe-stream` | POST | Transcription with streaming progress |
| `/api/transcribe` | POST | Alternative transcription request |

## Privacy and data handling

- Gemini API requests are made through the backend.
- The API key is read from the server environment, not exposed in frontend code.
- Uploaded audio is handled using temporary server-side files.
- Cleanup routines are included for uploaded files and temporary processing directories.
- Public transcript sharing is not required for the core workflow.

**Please review the privacy practices and deployment configuration before submitting sensitive recordings.**

## Testing and limitations

The core workflow has been tested with audio recordings, including file upload, transcription in both modes, transcript editing, copying, and TXT export.

Transcription quality can vary with audio clarity, background noise, accents, recording conditions, and language. Generated text should be checked before being used for official or important purposes.

A few things to keep in mind:
- A valid Gemini API key must be configured on the server.
- Processing time depends on recording length, network conditions, and model availability.
- Microphone recording requires browser support and user permission.
- FFmpeg and FFprobe must be available in the deployment environment.

## Why I built it

Avā AI is an exploration of how AI, audio processing, and thoughtful interface design can come together in a practical tool. The goal is simple: make transcription easier to use, easier to review, and more accessible across languages and devices.

## License

This project is licensed under the [Apache License 2.0](./LICENSE).
