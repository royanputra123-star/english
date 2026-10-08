import { prepareLessons } from "./lesson-data.js";

const STORAGE_KEY = "simple-present-progress-v1";
const MAX_HEARTS = 5;
const app = document.querySelector("#app");

const state = {
  view: "home",
  levels: [],
  course: null,
  profile: null,
  activeLevel: null,
  questionIndex: 0,
  hearts: MAX_HEARTS,
  correctCount: 0,
  xpEarned: 0,
  feedback: null,
  selectedOption: null,
  input: "",
  wordTiles: [],
  selectedWordIds: [],
  rightOrder: [],
  matches: {},
  selectedLeft: null,
  selectedRight: null,
};

const svg = {
  arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6"/></svg>',
  book: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.8A2.8 2.8 0 0 1 6.8 3H20v16H6.8A2.8 2.8 0 0 0 4 21z"/><path d="M4 6v15M8 7h8M8 11h7"/></svg>',
  home: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/></svg>',
  map: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3z"/><path d="M9 3v15M15 6v15"/></svg>',
  flame: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12.1 22a7.1 7.1 0 0 1-7.2-7.1c0-3.3 1.8-5.4 4.2-8.3.6 2.4 1.8 3.5 2.6 4.1.2-3.2 2.2-6 4.1-7.7.1 3.6 3.3 6.3 3.3 11.2a7 7 0 0 1-7 7.8Z"/><path d="M12.1 22c-1.8 0-3.2-1.5-3.2-3.4 0-1.6 1-2.8 2.5-4.5.2 1.3.9 1.9 1.4 2.1.2-1.6 1.2-2.8 2.2-3.7.1 2.1 1.2 3.2 1.2 5.3a3.7 3.7 0 0 1-4.1 4.2Z"/></svg>',
  gem: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 3-4 6 10 13L22 9l-4-6z"/><path d="M2 9h20M6 3l3 6 3 13 3-13 3-6"/></svg>',
  heart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 8.8c0 5-8.8 11-8.8 11s-8.8-6-8.8-11A4.8 4.8 0 0 1 12 6.4a4.8 4.8 0 0 1 8.8 2.4Z"/></svg>',
  speaker: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16 9.5a4 4 0 0 1 0 5M18.5 7a7.5 7.5 0 0 1 0 10"/></svg>',
  check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg>',
  lock: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 1 1 8 0v3M12 14v3"/></svg>',
  spark: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2 1.8 7.2L21 12l-7.2 1.8L12 21l-1.8-7.2L3 12l7.2-2.8z"/></svg>',
  close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>',
  headphones: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 13v-1a9 9 0 0 1 18 0v1"/><path d="M3 13h4v7H5a2 2 0 0 1-2-2zm18 0h-4v7h2a2 2 0 0 0 2-2z"/></svg>',
  trophy: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M7 7H4v2a4 4 0 0 0 4 4M17 7h3v2a4 4 0 0 1-4 4"/></svg>',
};

function safeText(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);
}

function icon(name, className = "") {
  return `<span class="svg-icon ${className}">${svg[name] ?? ""}</span>`;
}

function brandMark() {
  return `<span class="brand-mark" aria-hidden="true"><span>s</span><i></i></span>`;
}

function loadProfile() {
  const emptyProfile = { completedLevels: [], totalXP: 0, streak: 0, lastStudyDate: "" };
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (!stored || typeof stored !== "object") return emptyProfile;
    return {
      ...emptyProfile,
      ...stored,
      completedLevels: [...new Set((stored.completedLevels || []).filter((id) => Number.isInteger(id) && id >= 1 && id <= 10))],
      totalXP: Math.max(0, Number(stored.totalXP) || 0),
      streak: Math.max(0, Number(stored.streak) || 0),
    };
  } catch {
    return emptyProfile;
  }
}

function saveProfile() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.profile));
  } catch {
    // The lesson remains playable when browser storage is disabled or full.
  }
}

function shuffled(items) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

function currentQuestion() {
  return state.activeLevel?.questions[state.questionIndex] ?? null;
}

function currentLevelToPlay() {
  return state.levels.find((level) => !state.profile.completedLevels.includes(level.id))
    ?? state.levels[state.levels.length - 1];
}

function isLevelUnlocked(level) {
  return level.id === 1 || state.profile.completedLevels.includes(level.id - 1);
}

function setUpQuestion() {
  const question = currentQuestion();
  state.feedback = null;
  state.selectedOption = null;
  state.input = "";
  state.selectedWordIds = [];
  state.wordTiles = question?.words
    ? shuffled(question.words.map((text, index) => ({ id: index, text })))
    : [];
  state.rightOrder = question?.pairs
    ? shuffled(question.pairs.map((pair) => pair.right))
    : [];
  state.matches = {};
  state.selectedLeft = null;
  state.selectedRight = null;
}

function formatSentence(sentence) {
  return safeText(sentence).replace(/___/g, '<span class="blank-space" aria-label="missing word"><i></i><i></i><i></i></span>');
}

function speakerButton(label = "Hear question", isLarge = false) {
  return `<button class="speaker-button${isLarge ? " speaker-button--large" : ""}" data-action="question-audio" type="button" aria-label="${safeText(label)}">
    <span class="speaker-glyph">${svg.speaker}</span>
    <span class="speaker-button-label">${safeText(label)}</span>
    <span class="speaker-bars" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
  </button>`;
}

function levelState(level) {
  const completed = state.profile.completedLevels.includes(level.id);
  const unlocked = isLevelUnlocked(level);
  return { completed, unlocked, current: unlocked && !completed };
}

function renderLevelCard(level) {
  const { completed, unlocked, current } = levelState(level);
  const stateText = completed ? "Completed" : current ? "Ready to learn" : "Locked";
  const numberOrIcon = completed ? icon("check") : unlocked ? String(level.id).padStart(2, "0") : icon("lock");
  const classes = ["level-card", current ? "is-current" : "", completed ? "is-completed" : "", !unlocked ? "is-locked" : ""]
    .filter(Boolean).join(" ");
  const progress = completed ? 100 : 0;
  return `<button class="${classes}" type="button" data-action="start-level" data-level="${level.id}" ${unlocked ? "" : "disabled"} aria-label="Level ${level.id}: ${safeText(level.title)}, ${stateText}">
    <span class="level-icon" aria-hidden="true">${safeText(level.icon)}</span>
    <span class="level-card-copy">
      <span class="level-card-kicker">LEVEL ${String(level.id).padStart(2, "0")} <span class="status-dot ${current ? "status-dot--current" : ""}"></span> ${stateText}</span>
      <strong>${safeText(level.title)}</strong>
      <span class="level-card-theme">${safeText(level.theme)}</span>
      <span class="level-mini-track" aria-hidden="true"><i style="width:${progress}%"></i></span>
    </span>
    <span class="level-card-state ${completed ? "state-done" : current ? "state-ready" : "state-locked"}" aria-hidden="true">${numberOrIcon}</span>
  </button>`;
}

function renderHome() {
  const completedCount = state.profile.completedLevels.length;
  const progressPercent = Math.round((completedCount / state.levels.length) * 100);
  const nextLevel = currentLevelToPlay();
  const allDone = completedCount === state.levels.length;
  const greeting = allDone ? "You made it!" : completedCount ? "Welcome back, learner." : "A fresh start looks good on you.";
  const cta = allDone ? "Review a level" : completedCount ? "Continue your journey" : "Start your first lesson";
  const streakText = state.profile.streak === 1 ? "day" : "days";

  document.title = "Simple Present — everyday English, brighter";
  app.innerHTML = `<div class="app-shell">
    <aside class="sidebar" aria-label="Main navigation">
      <a class="brand" href="#home" data-action="go-home" aria-label="Simple Present home">
        ${brandMark()}<span class="brand-wordmark">simple<span>present</span></span>
      </a>
      <div class="sidebar-label">YOUR SPACE</div>
      <nav class="side-nav">
        <button class="nav-item is-active" type="button" data-action="go-home">${icon("home")}<span>Home</span></button>
        <button class="nav-item" type="button" data-action="scroll-map">${icon("map")}<span>Learning path</span></button>
      </nav>
      <div class="sidebar-course-card">
        <div class="sidebar-course-top"><span class="sidebar-course-icon">${icon("book")}</span><span>YOUR COURSE</span></div>
        <strong>Simple Present</strong>
        <p>Little lessons for the things you do every day.</p>
        <div class="sidebar-progress-label"><span>Course progress</span><strong>${progressPercent}%</strong></div>
        <div class="sidebar-progress-track" role="progressbar" aria-label="Course progress" aria-valuenow="${progressPercent}" aria-valuemin="0" aria-valuemax="100"><i style="width:${progressPercent}%"></i></div>
      </div>
      <div class="sidebar-sticker" aria-hidden="true"><span>✦</span><p>Little by little,<br />you get fluent.</p></div>
      <div class="sidebar-bottom">
        <div class="mini-profile-avatar">S</div>
        <div class="mini-profile-copy"><strong>Your progress</strong><span>${completedCount} of 10 levels complete</span></div>
        ${icon("spark", "mini-profile-spark")}
      </div>
    </aside>

    <div class="main-column">
      <header class="topbar">
        <div class="mobile-brand">${brandMark()}<span>simple<span>present</span></span></div>
        <div class="breadcrumb"><span>YOUR COURSE</span><b>/</b><strong>Simple Present</strong></div>
        <div class="topbar-stats" aria-label="Your learning stats">
          <div class="top-stat top-stat--streak" title="Current streak">${icon("flame")}<strong>${state.profile.streak}</strong><span>${streakText}</span></div>
          <div class="top-stat top-stat--xp" title="Total experience points">${icon("gem")}<strong>${state.profile.totalXP.toLocaleString()} XP</strong></div>
          <div class="top-avatar" aria-label="Learner profile">S</div>
        </div>
      </header>

      <main class="home-content" id="home">
        <section class="hero-banner" aria-labelledby="hero-title">
          <div class="hero-copy">
            <div class="eyebrow"><span class="eyebrow-dot"></span> ${greeting}</div>
            <h1 id="hero-title">Everyday English,<br /><em>brighter.</em></h1>
            <p>Make the simple present part of your daily routine—one quick lesson at a time.</p>
            <button class="button-primary hero-cta" type="button" data-action="start-level" data-level="${nextLevel.id}">
              <span>${cta}</span>${icon("arrow")}
            </button>
            <div class="hero-footnote"><span class="tiny-check">${icon("check")}</span> 15 bite-sized questions · about 5 minutes</div>
          </div>
          <div class="hero-art" aria-hidden="true">
            <div class="art-orbit orbit-one"></div><div class="art-orbit orbit-two"></div>
            <div class="art-sun"></div>
            <div class="art-book book-back"></div><div class="art-book book-front"><span>hello!</span><i></i></div>
            <div class="art-plant"><i></i><b></b><span></span></div>
            <div class="art-sparkle sparkle-one">✦</div><div class="art-sparkle sparkle-two">✦</div>
            <div class="art-note">one small win<br /><strong>at a time</strong></div>
            <div class="art-floor"></div>
          </div>
          <div class="hero-decoration hero-decoration--one" aria-hidden="true"></div>
          <div class="hero-decoration hero-decoration--two" aria-hidden="true"></div>
        </section>

        <section class="overview-row" id="my-progress" aria-label="Course overview">
          <article class="overview-card overview-card--progress">
            <span class="overview-icon overview-icon--mint">${icon("map")}</span>
            <div class="overview-copy"><span>Course progress</span><strong>${completedCount}<small> / 10 levels</small></strong></div>
            <div class="overview-progress"><div class="overview-progress-track"><i style="width:${progressPercent}%"></i></div><span>${progressPercent}%</span></div>
          </article>
          <article class="overview-card">
            <span class="overview-icon overview-icon--yellow">${icon("flame")}</span>
            <div class="overview-copy"><span>Day streak</span><strong>${state.profile.streak}<small> ${streakText}</small></strong></div>
            <span class="overview-side-note">${state.profile.streak ? "Keep the glow going" : "Start one today"}</span>
          </article>
          <article class="overview-card">
            <span class="overview-icon overview-icon--blue">${icon("gem")}</span>
            <div class="overview-copy"><span>Total points</span><strong>${state.profile.totalXP.toLocaleString()}<small> XP</small></strong></div>
            <span class="overview-side-note">Earn 10 per correct answer</span>
          </article>
        </section>

        <section class="journey-section" id="course-map" aria-labelledby="journey-title">
          <div class="section-heading">
            <div><div class="section-kicker">YOUR LEARNING PATH</div><h2 id="journey-title">Ten little steps.</h2><p>Each level unlocks after you finish the one before it.</p></div>
            <div class="journey-count"><span>${icon("spark")}</span><strong>${completedCount}<small> / 10</small></strong><span>levels done</span></div>
          </div>
          <div class="level-grid">${state.levels.map(renderLevelCard).join("")}</div>
        </section>

        <section class="gentle-reminder">
          <span class="reminder-icon" aria-hidden="true">✦</span>
          <div><strong>Practice at your own pace</strong><p>Miss a question? That’s part of learning. You get five hearts in every lesson.</p></div>
          <span class="reminder-spark" aria-hidden="true">✧</span>
        </section>
        <footer class="home-footer"><span>Made for everyday learners</span><span>Simple Present <b>·</b> A1 English</span></footer>
      </main>
    </div>
  </div>`;
}

function typeTitle(type) {
  return {
    multipleChoice: "Pick the right form.",
    fillBlank: "Complete the sentence.",
    wordBank: "Build it, word by word.",
    listening: "Tune in and listen.",
    matching: "Make the connection.",
  }[type] ?? "Your next question.";
}

function typeLabel(type) {
  return {
    multipleChoice: "MULTIPLE CHOICE",
    fillBlank: "FILL IN THE BLANK",
    wordBank: "WORD BANK",
    listening: "LISTENING",
    matching: "MATCHING",
  }[type] ?? "PRACTICE";
}

function typeGlyph(type) {
  return {
    multipleChoice: "A·B",
    fillBlank: "___",
    wordBank: "Aa",
    listening: "♫",
    matching: "↔",
  }[type] ?? "✦";
}

function renderWordBank(question) {
  const selected = state.selectedWordIds.map((id) => ({ id, text: question.words[id] }));
  const expectedCount = question.answer.trim().split(/\s+/).length;
  const tileMarkup = state.wordTiles.map(({ id, text }) => {
    const used = state.selectedWordIds.includes(id);
    return `<button class="word-tile${used ? " is-used" : ""}" type="button" data-action="select-word" data-word-index="${id}" ${used || state.feedback ? "disabled" : ""} aria-label="${safeText(text)}${used ? ", selected" : ""}">${safeText(text)}</button>`;
  }).join("");
  const selectedMarkup = selected.length
    ? selected.map(({ id, text }) => `<button class="answer-word" type="button" data-action="remove-word" data-word-index="${id}" ${state.feedback ? "disabled" : ""} aria-label="Remove ${safeText(text)}">${safeText(text)}<span aria-hidden="true">×</span></button>`).join("")
    : `<span class="drop-placeholder">Tap the words to build your answer</span>`;

  return `<div class="word-answer-zone" aria-label="Your answer, ${selected.length} of ${expectedCount} words">
      <div class="word-answer-label"><span>Your sentence</span><span>${selected.length} <i>/</i> ${expectedCount}</span></div>
      <div class="word-answer-line" aria-live="polite">${selectedMarkup}</div>
    </div>
    <div class="word-bank-area"><div class="word-answer-label"><span>Word bank</span><span class="bank-hint">Choose the words in order</span></div><div class="word-bank-tiles">${tileMarkup}</div></div>`;
}

function renderMatchBoard(question) {
  const leftMarkup = question.pairs.map(({ left }) => {
    const assigned = Object.hasOwn(state.matches, left);
    const selected = state.selectedLeft === left;
    return `<button class="match-tile${selected ? " is-selected" : ""}${assigned ? " is-paired" : ""}" type="button" data-action="match-select" data-match-side="left" data-match-value="${safeText(left)}" aria-pressed="${selected}" ${state.feedback ? "disabled" : ""}>
      <span>${safeText(left)}</span>${assigned ? `<i>${icon("check")}</i>` : ""}
    </button>`;
  }).join("");
  const usedRights = Object.values(state.matches);
  const rightMarkup = state.rightOrder.map((right) => {
    const assigned = usedRights.includes(right);
    const selected = state.selectedRight === right;
    return `<button class="match-tile match-tile--right${selected ? " is-selected" : ""}${assigned ? " is-paired" : ""}" type="button" data-action="match-select" data-match-side="right" data-match-value="${safeText(right)}" aria-pressed="${selected}" ${state.feedback ? "disabled" : ""}>
      <span>${safeText(right)}</span>${assigned ? `<i>${icon("check")}</i>` : ""}
    </button>`;
  }).join("");
  const pairRows = question.pairs.filter(({ left }) => Object.hasOwn(state.matches, left)).map(({ left }) => `<div class="linked-pair"><span>${safeText(left)}</span>${icon("arrow")}<span>${safeText(state.matches[left])}</span></div>`).join("");

  return `<div class="matching-instruction"><span class="match-mark" aria-hidden="true">↔</span><div><strong>Tap one from each column</strong><span>Match each English phrase to its meaning.</span></div></div>
    <div class="matching-board">
      <div class="matching-column"><div class="column-label">ENGLISH</div>${leftMarkup}</div>
      <div class="matching-column"><div class="column-label">BAHASA INDONESIA</div>${rightMarkup}</div>
    </div>
    ${pairRows ? `<div class="linked-pairs" aria-label="Selected pairs">${pairRows}</div>` : ""}`;
}

function renderExercise(question) {
  switch (question.type) {
    case "multipleChoice": {
      const choices = question.options.map((option, index) => `<button class="choice-card${state.selectedOption === option ? " is-selected" : ""}" type="button" data-action="select-option" data-option-index="${index}" aria-pressed="${state.selectedOption === option}" ${state.feedback ? "disabled" : ""}>
        <span class="choice-letter">${String.fromCharCode(65 + index)}</span><span class="choice-text">${safeText(option)}</span><span class="choice-check">${icon("check")}</span>
      </button>`).join("");
      return `<div class="sentence-panel"><span class="sentence-panel-tag">THE SENTENCE</span><p class="sentence-line">${formatSentence(question.prompt)}</p></div><div class="choice-grid">${choices}</div>`;
    }
    case "fillBlank":
      return `<div class="sentence-panel"><span class="sentence-panel-tag">THE SENTENCE</span><p class="sentence-line">${formatSentence(question.prompt)}</p></div>
        <label class="answer-input-wrap" for="answer-input"><span class="input-label">YOUR ANSWER</span><input id="answer-input" data-role="fill-answer" type="text" value="${safeText(state.input)}" placeholder="Type one word…" autocomplete="off" autocapitalize="none" spellcheck="false" maxlength="80" ${state.feedback ? "disabled" : ""} /><span class="input-end-icon" aria-hidden="true">↵</span></label>`;
    case "wordBank":
      return `<div class="translation-panel"><span class="sentence-panel-tag">${question.questionLanguage === "id-ID" ? "IN INDONESIAN" : "YOUR TASK"}</span><p lang="${safeText(question.questionLanguage || "en")}">${safeText(question.prompt)}</p></div>${renderWordBank(question)}`;
    case "listening":
      return `<div class="listen-panel"><div class="listen-illustration" aria-hidden="true"><span class="listen-circle listen-circle--outer"></span><span class="listen-circle listen-circle--inner"></span><span class="listen-headphone">${svg.headphones}</span><span class="listen-star">✦</span></div><div class="listen-copy"><span class="sentence-panel-tag">NO TEXT CLUES</span><strong>Listen for the words.</strong><p>Build the sentence you hear using the word bank.</p></div><span class="listen-wave" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></span></div>${renderWordBank(question)}`;
    case "matching":
      return renderMatchBoard(question);
    default:
      return `<p>We couldn't load this question.</p>`;
  }
}

function answerDisplay(question) {
  if (question.type === "matching") {
    return question.pairs.map(({ left, right }) => `${left} → ${right}`).join(" · ");
  }
  return question.answerSpeech || question.answer;
}

function heartsMarkup() {
  return `<div class="hearts-display" aria-label="${state.hearts} of ${MAX_HEARTS} hearts remaining">${Array.from({ length: MAX_HEARTS }, (_, index) => `<span class="heart-item${index < state.hearts ? " is-full" : " is-empty"}${state.hearts <= 2 && index < state.hearts ? " is-low" : ""}">${svg.heart}</span>`).join("")}</div>`;
}

function canCheck() {
  if (state.feedback) return false;
  const question = currentQuestion();
  if (!question) return false;
  if (question.type === "multipleChoice") return Boolean(state.selectedOption);
  if (question.type === "fillBlank") return Boolean(state.input.trim());
  if (question.type === "wordBank" || question.type === "listening") {
    return state.selectedWordIds.length === question.answer.trim().split(/\s+/).length;
  }
  if (question.type === "matching") return Object.keys(state.matches).length === question.pairs.length;
  return false;
}

function renderFeedback() {
  const question = currentQuestion();
  if (!state.feedback) {
    return `<div class="bottom-prompt"><span class="bottom-sparkle">✦</span><span>Take a breath. You’ve got this.</span><span class="bottom-progress-note">${state.questionIndex + 1} of 15</span></div>
      <button class="button-check" type="button" data-action="check-answer" ${canCheck() ? "" : "disabled"}>Check answer ${icon("arrow")}</button>`;
  }
  const isCorrect = state.feedback.correct;
  const title = isCorrect ? "Lovely work!" : "Not quite — keep going!";
  const detail = isCorrect
    ? (question.explanation || "That's exactly right. Keep that rhythm going!")
    : `Correct answer: ${answerDisplay(question)}`;
  const continueLabel = state.hearts === 0 ? "See results" : "Continue";
  return `<div class="feedback-message ${isCorrect ? "feedback-message--correct" : "feedback-message--wrong"}" role="status" aria-live="polite">
      <span class="feedback-symbol">${isCorrect ? icon("check") : "↺"}</span>
      <div class="feedback-copy"><strong>${title}</strong><p>${safeText(detail)}</p></div>
      <button class="answer-audio-button" type="button" data-action="answer-audio" aria-label="Hear the correct answer">${svg.speaker}<span>Hear answer</span></button>
    </div>
    <button class="button-continue ${isCorrect ? "button-continue--correct" : "button-continue--wrong"}" type="button" data-action="continue">${continueLabel}${icon("arrow")}</button>`;
}

function renderLesson() {
  const question = currentQuestion();
  if (!question) return;
  const resolvedQuestions = state.questionIndex + (state.feedback ? 1 : 0);
  const progress = Math.min(100, Math.round((resolvedQuestions / state.activeLevel.questions.length) * 100));
  const lessonNumber = String(state.activeLevel.id).padStart(2, "0");
  const label = typeLabel(question.type);
  const heading = typeTitle(question.type);
  const speakerLabel = question.type === "listening" ? "Listen again" : "Hear question";
  const title = `Level ${state.activeLevel.id} · ${safeText(state.activeLevel.title)} · Question ${state.questionIndex + 1}`;

  document.title = `${title} — Simple Present`;
  app.innerHTML = `<div class="lesson-shell">
    <header class="lesson-topbar">
      <button class="lesson-exit" type="button" data-action="go-home" aria-label="Leave lesson and return home">${svg.close}</button>
      <div class="lesson-progress-block"><div class="lesson-progress-track" role="progressbar" aria-label="Lesson progress" aria-valuenow="${progress}" aria-valuemin="0" aria-valuemax="100"><i style="width:${progress}%"></i></div><span>${state.questionIndex + 1}<i>/</i>${state.activeLevel.questions.length}</span></div>
      <div class="lesson-hearts"><span class="hearts-word">HEARTS</span>${heartsMarkup()}<strong>${state.hearts}</strong></div>
    </header>
    <main class="lesson-main">
      <div class="lesson-content">
        <div class="lesson-context"><span class="lesson-level-tag">LEVEL ${lessonNumber}</span><span class="context-separator">·</span><span>${safeText(state.activeLevel.theme)}</span><span class="question-count">QUESTION ${String(state.questionIndex + 1).padStart(2, "0")} <i>/</i> 15</span></div>
        <div class="question-heading"><div><h1>${heading}</h1><p>${safeText(question.instruction)}</p></div><span class="heading-spark" aria-hidden="true">✦</span></div>
        <section class="exercise-card" aria-label="${safeText(question.instruction)}">
          <div class="exercise-card-top"><span class="exercise-type"><span class="type-glyph">${safeText(typeGlyph(question.type))}</span>${label}</span>${speakerButton(speakerLabel, question.type === "listening")}</div>
          <div class="exercise-content">${renderExercise(question)}</div>
        </section>
        ${question.explanation && state.feedback?.correct ? `<p class="grammar-note"><span>✦</span>${safeText(question.explanation)}</p>` : ""}
      </div>
    </main>
    <footer class="lesson-bottom${state.feedback ? ` has-feedback ${state.feedback.correct ? "is-correct" : "is-wrong"}` : ""}">
      <div class="lesson-bottom-inner">${renderFeedback()}</div>
    </footer>
  </div>`;
}

function confettiMarkup() {
  return `<div class="confetti-field" aria-hidden="true">${Array.from({ length: 16 }, (_, index) => `<i class="confetti confetti-${index + 1}"></i>`).join("")}</div>`;
}

function resultStats() {
  const accuracy = Math.round((state.correctCount / state.activeLevel.questions.length) * 100);
  return `<div class="result-stats">
    <div><span class="result-stat-icon result-stat-icon--mint">${icon("check")}</span><strong>${state.correctCount}<small> / 15</small></strong><span>correct answers</span></div>
    <div><span class="result-stat-icon result-stat-icon--yellow">${icon("spark")}</span><strong>${accuracy}%</strong><span>accuracy</span></div>
    <div><span class="result-stat-icon result-stat-icon--blue">${icon("gem")}</span><strong>${state.profile.totalXP.toLocaleString()}</strong><span>total XP</span></div>
  </div>`;
}

function renderComplete() {
  const isFinal = state.profile.completedLevels.length === state.levels.length;
  const nextLevel = state.levels.find((level) => level.id === state.activeLevel.id + 1);
  document.title = "Level complete! — Simple Present";
  app.innerHTML = `<main class="result-shell result-shell--complete">
    ${confettiMarkup()}
    <a class="result-brand" href="#home" data-action="go-home">${brandMark()}<span>simple<span>present</span></span></a>
    <section class="result-card" aria-labelledby="result-title">
      <div class="result-medal result-medal--complete"><span>✦</span><strong>${icon("trophy")}</strong><i>✦</i></div>
      <div class="result-kicker">${isFinal ? "COURSE COMPLETE" : "LEVEL COMPLETE"}</div>
      <h1 id="result-title">${isFinal ? "Look at you go!" : "You did it!"}</h1>
      <p class="result-description">${isFinal ? "You’ve completed all ten levels. Everyday English is looking brighter already." : `You finished ${safeText(state.activeLevel.title)}. Every little practice adds up.`}</p>
      <div class="xp-award"><span class="xp-gem">${icon("gem")}</span><div><span>THIS LESSON</span><strong>+${state.xpEarned} XP</strong></div><span class="xp-spark">✦</span></div>
      ${resultStats()}
      <div class="result-actions">
        ${nextLevel ? `<button class="button-primary result-primary" type="button" data-action="start-level" data-level="${nextLevel.id}">Next level ${icon("arrow")}</button>` : `<button class="button-primary result-primary" type="button" data-action="go-home">See your journey ${icon("arrow")}</button>`}
        <button class="button-secondary" type="button" data-action="go-home">Back to home</button>
      </div>
    </section>
    <p class="result-footer">Small steps. Big progress. <span>✦</span></p>
  </main>`;
}

function renderGameOver() {
  document.title = "Lesson paused — Simple Present";
  app.innerHTML = `<main class="result-shell result-shell--gameover">
    <a class="result-brand" href="#home" data-action="go-home">${brandMark()}<span>simple<span>present</span></span></a>
    <section class="result-card" aria-labelledby="result-title">
      <div class="result-medal result-medal--gameover"><span>♡</span><strong>${svg.heart}</strong><i>✦</i></div>
      <div class="result-kicker">A QUICK PAUSE</div>
      <h1 id="result-title">Out of hearts.</h1>
      <p class="result-description">Mistakes are part of the rhythm. Take a breath, then try ${safeText(state.activeLevel.title)} again with five fresh hearts.</p>
      <div class="hearts-lost-card"><div class="lost-hearts">${Array.from({ length: MAX_HEARTS }, () => `<span>${svg.heart}</span>`).join("")}</div><strong>5 new hearts on your next try</strong></div>
      <div class="result-stats result-stats--two">
        <div><span class="result-stat-icon result-stat-icon--mint">${icon("check")}</span><strong>${state.correctCount}<small> / 15</small></strong><span>correct this round</span></div>
        <div><span class="result-stat-icon result-stat-icon--blue">${icon("gem")}</span><strong>${state.profile.totalXP.toLocaleString()}</strong><span>total XP</span></div>
      </div>
      <div class="result-actions"><button class="button-primary result-primary" type="button" data-action="retry-level">Try this level again ${icon("arrow")}</button><button class="button-secondary" type="button" data-action="go-home">Back to home</button></div>
    </section>
    <p class="result-footer">You’re learning every time you try. <span>✦</span></p>
  </main>`;
}

function render() {
  if (!state.course) return;
  if (state.view === "home") renderHome();
  else if (state.view === "lesson") renderLesson();
  else if (state.view === "complete") renderComplete();
  else if (state.view === "gameover") renderGameOver();
}

function setView(view) {
  state.view = view;
  render();
}

function cancelSpeech() {
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
}

function speak(text, language = "en-US", button = null) {
  const spokenText = String(text || "").trim();
  if (!spokenText) return;
  if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) {
    announce("Text-to-speech is not available in this browser.");
    return;
  }
  cancelSpeech();
  document.querySelectorAll(".speaker-button.is-speaking").forEach((item) => item.classList.remove("is-speaking"));
  const utterance = new SpeechSynthesisUtterance(spokenText);
  utterance.lang = language;
  utterance.rate = 0.92;
  utterance.pitch = 1.02;
  const voices = window.speechSynthesis.getVoices();
  const voice = voices.find((item) => item.lang.toLowerCase() === language.toLowerCase())
    || voices.find((item) => item.lang.toLowerCase().startsWith(language.slice(0, 2).toLowerCase()));
  if (voice) utterance.voice = voice;
  utterance.onstart = () => button?.classList.add("is-speaking");
  const clearSpeaking = () => button?.classList.remove("is-speaking");
  utterance.onend = clearSpeaking;
  utterance.onerror = clearSpeaking;
  window.speechSynthesis.speak(utterance);
}

function questionAudio(button = null) {
  const question = currentQuestion();
  if (!question) return;
  speak(question.questionSpeech || question.prompt || question.instruction, question.questionLanguage || "en-US", button);
}

function answerAudio(button = null) {
  const question = currentQuestion();
  if (!question) return;
  const spokenAnswer = question.type === "matching"
    ? question.pairs.map(({ left, right }) => `${left} means ${right}.`).join(" ")
    : answerDisplay(question);
  speak(spokenAnswer, question.answerLanguage || "en-US", button);
}

function announce(message) {
  let liveRegion = document.querySelector("#sr-announcement");
  if (!liveRegion) {
    liveRegion = document.createElement("div");
    liveRegion.id = "sr-announcement";
    liveRegion.className = "sr-only";
    liveRegion.setAttribute("role", "status");
    document.body.append(liveRegion);
  }
  liveRegion.textContent = message;
}

function playTone(correct) {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;
  try {
    const context = new AudioContextClass();
    const now = context.currentTime;
    const notes = correct ? [{ frequency: 660, at: 0 }, { frequency: 880, at: 0.12 }] : [{ frequency: 190, at: 0 }, { frequency: 150, at: 0.13 }];
    notes.forEach(({ frequency, at }) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = correct ? "sine" : "sawtooth";
      oscillator.frequency.setValueAtTime(frequency, now + at);
      gain.gain.setValueAtTime(0.0001, now + at);
      gain.gain.exponentialRampToValueAtTime(correct ? 0.12 : 0.07, now + at + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + at + (correct ? 0.21 : 0.19));
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(now + at);
      oscillator.stop(now + at + (correct ? 0.23 : 0.21));
    });
    window.setTimeout(() => context.close(), 500);
  } catch {
    // Audio feedback is a bonus; the visual answer state still works without it.
  }
}

function startLevel(levelId) {
  const level = state.levels.find((item) => item.id === Number(levelId));
  if (!level || !isLevelUnlocked(level)) return;
  cancelSpeech();
  state.activeLevel = level;
  state.questionIndex = 0;
  state.hearts = MAX_HEARTS;
  state.correctCount = 0;
  state.xpEarned = 0;
  state.view = "lesson";
  setUpQuestion();
  render();
  autoplayListening();
}

function autoplayListening() {
  const question = currentQuestion();
  if (state.view !== "lesson" || question?.type !== "listening") return;
  const levelId = state.activeLevel.id;
  const questionIndex = state.questionIndex;
  window.setTimeout(() => {
    if (state.view !== "lesson" || state.activeLevel?.id !== levelId || state.questionIndex !== questionIndex || state.feedback) return;
    questionAudio(app.querySelector('[data-action="question-audio"]'));
  }, 280);
}

function normalizeAnswer(value) {
  return String(value ?? "")
    .toLocaleLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/[.,!?;:]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function answerIsCorrect(question) {
  if (question.type === "multipleChoice") return normalizeAnswer(state.selectedOption) === normalizeAnswer(question.answer);
  if (question.type === "fillBlank") {
    const acceptable = Array.isArray(question.acceptedAnswers) ? question.acceptedAnswers : [question.answer];
    return acceptable.some((answer) => normalizeAnswer(state.input) === normalizeAnswer(answer));
  }
  if (question.type === "wordBank" || question.type === "listening") {
    const built = state.selectedWordIds.map((id) => question.words[id]).join(" ");
    return normalizeAnswer(built) === normalizeAnswer(question.answer);
  }
  if (question.type === "matching") {
    return question.pairs.every(({ left, right }) => state.matches[left] === right);
  }
  return false;
}

function submitAnswer() {
  if (!canCheck()) return;
  const question = currentQuestion();
  const correct = answerIsCorrect(question);
  state.feedback = { correct };
  if (correct) {
    state.correctCount += 1;
  } else {
    state.hearts = Math.max(0, state.hearts - 1);
  }
  playTone(correct);
  render();
  answerAudio();
}

function updateStreak() {
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  if (state.profile.lastStudyDate === today) return;
  state.profile.streak = state.profile.lastStudyDate === yesterday ? state.profile.streak + 1 : 1;
  state.profile.lastStudyDate = today;
}

function finishLevel() {
  const firstCompletion = !state.profile.completedLevels.includes(state.activeLevel.id);
  if (firstCompletion) state.profile.completedLevels.push(state.activeLevel.id);
  state.xpEarned = state.correctCount * 10;
  state.profile.totalXP += state.xpEarned;
  updateStreak();
  saveProfile();
  cancelSpeech();
  state.view = "complete";
  render();
}

function showGameOver() {
  cancelSpeech();
  state.xpEarned = 0;
  state.view = "gameover";
  render();
}

function continueLesson() {
  if (!state.feedback) return;
  cancelSpeech();
  if (state.hearts === 0) {
    showGameOver();
    return;
  }
  if (state.questionIndex === state.activeLevel.questions.length - 1) {
    finishLevel();
    return;
  }
  state.questionIndex += 1;
  setUpQuestion();
  render();
  autoplayListening();
}

function goHome() {
  cancelSpeech();
  state.view = "home";
  state.activeLevel = null;
  state.feedback = null;
  render();
  window.scrollTo?.({ top: 0, behavior: "smooth" });
}

function selectMatch(side, value) {
  if (state.feedback) return;
  if (side === "left") {
    if (state.selectedLeft === value) {
      state.selectedLeft = null;
      renderLesson();
      return;
    }
    delete state.matches[value];
    state.selectedLeft = value;
    if (state.selectedRight !== null) assignMatch(value, state.selectedRight);
  } else {
    if (state.selectedRight === value) {
      state.selectedRight = null;
      renderLesson();
      return;
    }
    const previouslyMatched = Object.entries(state.matches).find(([, right]) => right === value);
    if (previouslyMatched) delete state.matches[previouslyMatched[0]];
    state.selectedRight = value;
    if (state.selectedLeft !== null) assignMatch(state.selectedLeft, value);
  }
  renderLesson();
}

function assignMatch(left, right) {
  for (const [existingLeft, existingRight] of Object.entries(state.matches)) {
    if (existingRight === right || existingLeft === left) delete state.matches[existingLeft];
  }
  state.matches[left] = right;
  state.selectedLeft = null;
  state.selectedRight = null;
}

function handleClick(event) {
  const actionButton = event.target.closest("[data-action]");
  if (!actionButton || !app.contains(actionButton)) return;
  const action = actionButton.dataset.action;
  if (actionButton.tagName === "A") event.preventDefault();

  if (action === "start-level") startLevel(actionButton.dataset.level);
  else if (action === "go-home") goHome();
  else if (action === "scroll-map") {
    document.querySelector("#course-map")?.scrollIntoView({ behavior: "smooth", block: "start" });
  } else if (action === "check-answer") submitAnswer();
  else if (action === "continue") continueLesson();
  else if (action === "retry-level") startLevel(state.activeLevel.id);
  else if (action === "question-audio") questionAudio(actionButton);
  else if (action === "answer-audio") answerAudio(actionButton);
  else if (action === "select-option") {
    const question = currentQuestion();
    if (!question || state.feedback) return;
    const option = question.options[Number(actionButton.dataset.optionIndex)];
    state.selectedOption = option;
    speak(option, "en-US");
    renderLesson();
  } else if (action === "select-word") {
    const wordIndex = Number(actionButton.dataset.wordIndex);
    if (state.feedback || state.selectedWordIds.includes(wordIndex)) return;
    state.selectedWordIds.push(wordIndex);
    renderLesson();
  } else if (action === "remove-word") {
    const wordIndex = Number(actionButton.dataset.wordIndex);
    if (state.feedback) return;
    state.selectedWordIds = state.selectedWordIds.filter((id) => id !== wordIndex);
    renderLesson();
  } else if (action === "match-select") {
    selectMatch(actionButton.dataset.matchSide, actionButton.dataset.matchValue);
  }
}

app.addEventListener("click", handleClick);
app.addEventListener("input", (event) => {
  if (event.target.matches('[data-role="fill-answer"]')) {
    state.input = event.target.value;
    const checkButton = app.querySelector('[data-action="check-answer"]');
    if (checkButton) checkButton.disabled = !canCheck();
  }
});
app.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && event.target.matches('[data-role="fill-answer"]')) {
    event.preventDefault();
    if (state.feedback) continueLesson();
    else submitAnswer();
  }
});
app.addEventListener("pointerover", (event) => {
  const choice = event.target.closest('[data-action="select-option"]');
  if (!choice || !app.contains(choice) || state.feedback || choice.contains(event.relatedTarget)) return;
  const question = currentQuestion();
  const option = question?.options[Number(choice.dataset.optionIndex)];
  if (option) speak(option, "en-US");
});

async function boot() {
  try {
    const response = await fetch(new URL("../data/lessons.json", import.meta.url));
    if (!response.ok) throw new Error(`Could not load lesson data (${response.status}).`);
    const rawData = await response.json();
    const prepared = prepareLessons(rawData);
    state.course = prepared.course;
    state.levels = prepared.levels;
    state.profile = loadProfile();
    render();
  } catch (error) {
    console.error(error);
    app.innerHTML = `<main class="load-error"><div class="load-error-mark">!</div><h1>We couldn’t load the course.</h1><p>Please refresh the page. If you opened the HTML file directly, run the local server described in the README first.</p></main>`;
  }
}

boot();
