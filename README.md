# Simple Present

A small, cheerful English-practice app focused on the **simple present tense** and everyday routines. It is built with plain HTML, CSS, and vanilla JavaScript—no framework, build step, or runtime dependencies required.

## What’s included

- **10-level learning path**, with 15 questions in every level. A level unlocks after the previous one is completed; progress and XP are saved in the browser.
- **Five exercise types:** multiple choice, fill in the blank, word-bank sentence building, audio-first listening, and four-pair vocabulary matching.
- **A fully authored Level 1** that introduces positive, negative, and question forms along with routine and frequency vocabulary. Levels 2–10 use their own vocabulary and sentence recipes to create a balanced set of 15 questions each.
- **Browser voice support:** Web Speech API question audio, automatic playback for listening questions, replay controls, spoken multiple-choice options on hover/click, and spoken answer feedback.
- **Feedback and game mechanics:** five hearts per attempt, a lesson progress bar, Web Audio success/wrong tones, XP scoring, a completion screen, and a retry screen when hearts run out.
- **Responsive layouts** for desktop and mobile, with reduced-motion support and keyboard-friendly controls.
- **GitHub Actions validation** to run the course-data tests on pushes and pull requests.

## Run locally

Requirements: Python 3 and Node.js 22 or newer. There are no npm packages to install.

```bash
npm start
```

Open <http://localhost:4173>. The app fetches its JSON course data, so serve the folder over HTTP instead of opening `index.html` as a `file://` URL.

Run the data checks with:

```bash
npm test
```

## Project structure

```text
.
├── .github/workflows/test.yml  # CI: run the built-in Node test suite
├── data/lessons.json           # Course, Level 1 questions, and level recipes
├── index.html                  # App shell
├── js/
│   ├── app.js                  # UI, state, progression, voice, and scoring
│   └── lesson-data.js          # Expands level recipes into 15-question lessons
├── styles.css                  # Responsive visual system and animations
├── tests/lesson-data.test.js   # Course shape and answer-data checks
└── package.json                # Local server and test commands
```

## Extending the course data

`data/lessons.json` is the source of truth for the course. Level 1 stores its 15 question objects directly so its question wording, answer choices, audio, and word banks are easy to edit. Each of Levels 2–10 contains a `recipe` with three example sentences, four vocabulary pairs, and a frequency-word prompt. `js/lesson-data.js` turns each recipe into the same 15-question mix used throughout the course.

To add a new exercise template, update `buildPracticeQuestions()` and its tests. Each generated lesson should continue to contain exactly 15 valid questions; `prepareLessons()` and the test suite enforce that contract.

## Browser notes

Text-to-speech uses the voices installed in the user’s browser and device, so voice quality and language availability can vary. Listening prompts are spoken automatically when supported and can always be replayed from the speaker button. Success and incorrect-answer sounds are synthesized with Web Audio and do not use external audio files. Course completion, streak, and XP data are stored in `localStorage` under `simple-present-progress-v1`.
