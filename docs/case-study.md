
<p align="center">
  <img src="./assets/overview-demo.gif" alt="Ava AI Overview" width="700">
</p>





Avā AI — Designing a Multilingual AI Transcription Experience

A UX and AI-assisted product development case study

1. Project Overview

Avā AI started with a simple idea: working with audio should not have to feel complicated.

It is a mobile-first, multilingual transcription assistant that turns spoken content into editable text and gives users the option to organize that text into different formats.

As I developed the project, I became interested in more than the transcription process itself. I wanted to explore how people could interact with AI-generated content, make sense of the results, and stay in control of what happens to their words.

- Project type: Independent product concept and prototype
- Focus: UX Design, Human-AI Interaction, AI-assisted development, Accessibility
- AI technology: Gemini API
- Status: Ongoing development

2. The Problem I Wanted to Explore

A recording rarely becomes useful just because it has been transcribed.

Sometimes the original wording matters. In other situations, a person needs a cleaner version, a short summary, meeting notes, or a more organized document. Long recordings and different languages can make the process even more demanding.

I wanted Avā AI to bring these steps together in one place, so users could move from audio to text, review the result, and decide what they wanted to do next.

3. My Role

I initiated Avā AI and have been involved in shaping its direction, making UX decisions, designing the interface, building prototypes, and using AI-assisted tools during implementation.

As a psychology student, I naturally pay attention to how people process information, where cognitive effort can build up, and how much control they have when interacting with an AI system.

That perspective has influenced the way I approach the project. I am particularly interested in making the experience easier to follow without taking decisions away from the user.

4. What I Wanted to Build

From the beginning, I had a few practical goals in mind:

- Make audio transcription straightforward.
- Let users choose between preserving speech and improving readability.
- Support different spoken languages.
- Offer transcript organization without making it compulsory.
- Design an experience that works well on mobile devices.
- Make processing and AI-generated results easier to understand.

5. The Main Features

Audio Input

Users can upload an audio file or record directly through their device's microphone.

Two Transcription Styles

- Verbatim: Keeps the original spoken wording and natural speech patterns as much as possible.
- Polished: Presents the transcript in a more readable form while aiming to retain its original meaning.

Language Selection

Users can choose the spoken language or use automatic language detection.

AI Model Selection

The interface provides options for selecting models for transcription and transcript organization.

Organizing a Transcript

Once a transcript is available, users can choose how they would like the content to be structured:

- Key Points & Actionable Highlights
- Executive Summary
- Meeting Minutes & Action Items
- Dialogue & Interview Q&A
- Polished Article / Essay
- Custom Instruction

One decision I considered important was keeping the organized version separate from the original transcript. This gives users the chance to compare both versions, make corrections, and decide which one they want to keep.

6. Design Decisions

Letting Users Decide What Happens Next

I did not want transcript organization to happen automatically. A user may only need the original text, while someone else may want a summary or meeting notes. The choice should remain theirs.

Keeping the Original Text Available

AI can change the structure or wording of content. Keeping the original transcript accessible makes it easier to review those changes and correct anything that does not look right.

Making Processing Easier to Follow

Audio processing can take time, particularly with longer recordings. Status messages and progress indicators help users understand that the application is working and what stage it has reached.

Designing with Mobile and Persian in Mind

The interface uses a responsive layout and includes right-to-left support for Persian. This was an important part of making the experience practical for Persian-speaking users, rather than treating language support as an afterthought.

Considering Accessibility

I have also worked on screen-reader status and progress semantics so that processing feedback is not communicated through visual changes alone. There is still more accessibility testing to do.

7. How It Works

Avā AI is built with:

- React 19
- TypeScript
- Vite
- Express
- Tailwind CSS
- Gemini API
- FFmpeg and FFprobe for audio processing

The frontend handles the interface, user input, and transcript presentation. The backend manages audio processing and communication with Gemini.

The application is designed to keep API credentials on the server rather than exposing them in browser code.

8. Testing and Validation

I have used automated tests and development checks to catch issues as the project has evolved.

At the latest reported verification stage:

- 13 automated tests passed.
- The TypeScript check completed with zero reported errors.
- The Vite production build succeeded.

These checks are useful, but they do not tell the whole story. A successful build does not automatically mean that every recording, language, device, or user interaction will work as expected.

Some areas still need more thorough evaluation:

- Processing longer audio recordings.
- Handling different audio formats and encoding conditions.
- Evaluating Persian and multilingual transcription quality.
- Checking for missing or repeated words at audio chunk boundaries.
- Testing on different mobile browsers.
- Evaluating accessibility with actual screen readers.

I have not conducted a formal usability study or established a quantitative transcription accuracy benchmark, so I do not present those as project results.

9. Challenges and What I Learned

Making Audio Processing Reliable

Handling a short recording is one thing; processing a much longer file is another. File size, audio duration, memory use, network conditions, and API limitations all affect the experience.

Working on Avā AI has made me more aware of how much happens behind a seemingly simple upload button.

Keeping Transcripts Consistent

Long recordings may need to be divided into smaller segments before processing. However, splitting audio can sometimes lead to repeated or missing words where two segments meet.

This is one of the areas I still want to improve and evaluate carefully.

Understanding AI Model Limitations

Not every model supports the same capabilities, and availability can change. A model-selection interface is only useful when the selected model actually works with the intended operation. This makes verification and error handling important parts of the product.

Keeping People in the Loop

One of the most important lessons for me has been that AI-generated content should not be treated as unquestionably correct.

People need room to review, edit, and make their own decisions. I want that principle to remain part of Avā AI as it develops.

10. Current Limitations

Avā AI is still a prototype under active development. There are several things I cannot claim at this stage:

- A measured improvement in transcription accuracy.
- A verified reduction in processing time.
- Results from a formal usability study.
- Production-scale reliability.
- Consistent performance across every language and audio format.

These are not finished achievements; they are areas that need further testing.

11. What I Want to Improve Next

There is still plenty of room to make Avā AI better. My next areas of focus are:

- Making large audio uploads more reliable.
- Improving transcript continuity across audio segments.
- Expanding automated tests.
- Improving keyboard navigation and accessibility.
- Testing the experience with real users and practical tasks.
- Evaluating transcription quality across different languages.
- Making errors and interrupted processing easier to understand and recover from.

12. Final Thoughts

Building Avā AI has given me a practical way to explore the connection between psychology, UX design, and artificial intelligence.

What interests me most is not simply getting AI to produce text. It is thinking about the experience around that result: how clearly people understand it, how easily they can work with it, and whether they still feel in control.

The project is still evolving, and I see that as part of the process. There are things I have learned, decisions I would approach differently, and improvements I want to make next.

Project repository: https://github.com/zahrakhorram2314-del/ava-ai-transcriber-

Project status: Ongoing development
