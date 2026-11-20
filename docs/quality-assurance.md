# Avā AI — Quality Assurance & Evaluation

This page documents how Avā AI is tested, what each check is intended to prove, and which limitations remain. It separates hands-on product testing from automated code tests and measured quality benchmarks.

## 1. Testing principles

- **Preserve the source:** the original transcript should remain available when an edited or organized version is generated.
- **Do not invent content:** Gemini should use only information present in the supplied transcript.
- **Keep the user in control:** transcript organization should happen only when the user requests it.
- **Preserve language:** output should remain in the spoken/source language unless the user explicitly requests translation.
- **Be transparent:** an AI-generated result is not automatically verified as factually correct.

## 2. Current verification status

| Area | Current status | Notes |
|---|---|---|
| Hands-on testing of the core app workflow | Manually tested during development | Exploratory checks have been carried out; detailed run-by-run records will be added here as they are documented. |
| Transcript chunk ordering and stitching | Automated tests present | The current test file covers chronological ordering, non-speech placeholders, and the all-empty case. |
| Gemini transcript formatting | Implementation present; dedicated automated coverage needed | The formatting function calls Gemini and applies source-grounding instructions. |
| Multilingual transcription quality | Needs systematic evaluation | Model support and accuracy can vary by language, dialect, and recording conditions. |
| Production reliability and accessibility | Further testing needed | A successful build or a small manual test set is not proof of production readiness. |

This status is intentionally conservative. Do not describe a feature as fully validated unless the relevant test has been run and its result recorded.

## 3. Manual evaluation checklist

Record the date, app version or commit, test conditions, expected result, actual result, and outcome for each run.

| Test | Expected result | Status |
|---|---|---|
| Clear speech in a supported language | Spoken words are transcribed in the source language | To be recorded |
| Automatic language detection | The detected language is reasonable and the transcript stays in that language | To be recorded |
| User-selected language | The selected language is used for transcription | To be recorded |
| Verbatim mode | Original wording and meaningful speech details are retained | To be recorded |
| Edited mode | Readability improves without changing the speaker's meaning | To be recorded |
| Custom summary request | Summary uses only information in the transcript | To be recorded |
| Meeting notes request | Notes distinguish stated decisions and action items from missing information | To be recorded |
| Q&A request | Questions and answers are grounded in the transcript; unknown answers are not invented | To be recorded |
| Custom formatting request | The requested structure is followed without adding unsupported details | To be recorded |
| Empty or non-speech audio | A clear no-speech result is returned | To be recorded |
| Long audio split into chunks | Transcript sections remain in chronological order without obvious loss or duplication | To be recorded |
| Network or model failure | The user receives a clear error and can understand that processing did not complete | To be recorded |

## 4. Automated test coverage

The currently inspected test file is:

- `src/server/audioService.test.ts`

It includes checks for:
- chronological stitching of out-of-order chunks;
- ignoring a non-speech placeholder when valid speech is present;
- returning a placeholder when all chunks contain no speech.

Recommended next automated tests:
- formatting returns a non-empty result when Gemini responds successfully;
- formatting rejects an empty transcript or empty instructions appropriately;
- formatting preserves the source language unless translation is requested;
- formatting instructions do not override the source-grounding and anti-invention rules;
- formatting failures are surfaced clearly to the API caller;
- the original `exactTranscript` remains unchanged after formatting.

Mock Gemini responses in automated tests so the tests do not require a live API key, consume quota, or depend on network availability.

## 5. AI output quality rubric

Evaluate each generated output against these dimensions:

1. **Source fidelity:** Are all claims supported by the transcript?
2. **Coverage:** Are important points omitted?
3. **No fabrication:** Were names, dates, decisions, quotations, or action items invented?
4. **Language fidelity:** Is the original language preserved unless translation was requested?
5. **Format adherence:** Does the result match the user's requested format?
6. **Clarity:** Is the output readable and appropriately structured?
7. **Uncertainty handling:** Does Ava clearly mark information that is missing or unclear?

A useful evaluation record should include the source transcript, user instruction, generated output, reviewer notes, and pass/fail decision. Avoid uploading private or sensitive recordings to public issues or documentation.

## 6. Important limitations

- Gemini output can contain errors even when the prompt instructs it not to hallucinate.
- Transcription quality depends on audio clarity, accents, language, background noise, and model availability.
- Automated tests of stitching logic do not establish transcription accuracy.
- A successful build does not establish usability, accessibility, or production-scale reliability.
- Do not display a “verified” or “zero hallucination” claim unless an independent, defined verification process actually supports it.

## 7. How to report a test or issue

When adding a test result, include:

- Date and commit tested
- Feature and test scenario
- Language and audio conditions (without exposing private recording content)
- Expected behavior
- Actual behavior
- Pass/fail result
- Reproduction notes, if applicable

This document is a living quality record. Update it when new tests are run; do not mark planned checks as passed in advance.
