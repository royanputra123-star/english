const FREQUENCY_PAIRS = [
  { left: "always", right: "selalu" },
  { left: "usually", right: "biasanya" },
  { left: "sometimes", right: "kadang-kadang" },
  { left: "never", right: "tidak pernah" },
];

const BANK_DISTRACTORS = ["usually", "not", "every", "at"];

function withBlank(sentence, word) {
  const index = sentence.toLowerCase().indexOf(word.toLowerCase());
  if (index === -1) return sentence;
  return `${sentence.slice(0, index)}___${sentence.slice(index + word.length)}`;
}

function wordTiles(sentence, extras = 2) {
  const words = sentence.trim().split(/\s+/);
  const distractors = BANK_DISTRACTORS.slice(0, extras);
  return [...words, ...distractors];
}

function generatedQuestion(level, index, question) {
  return {
    id: `l${level.id}-q${String(index).padStart(2, "0")}`,
    ...question,
  };
}

function buildPracticeQuestions(level) {
  const [first, second, third] = level.recipe.examples;
  const frequency = level.recipe.frequencyPractice;
  const vocab = level.recipe.vocabulary;
  const normalVerbOptions = [...new Set([first.baseVerb, first.verb])];
  const negativeAux = second.questionAux.toLowerCase();

  return [
    generatedQuestion(level, 1, {
      type: "multipleChoice",
      instruction: "Choose the correct verb",
      prompt: withBlank(first.affirmativeSentence, first.verb),
      questionSpeech: `${first.subject}, blank, ${first.complement}. Choose the correct verb.`,
      options: normalVerbOptions,
      answer: first.verb,
      answerSpeech: first.affirmativeSentence,
      explanation: "With he, she, it, or one person, the verb usually ends in s.",
    }),
    generatedQuestion(level, 2, {
      type: "fillBlank",
      instruction: "Fill in the missing word",
      prompt: withBlank(second.affirmativeSentence, second.verb),
      questionSpeech: `${second.subject}, blank, ${second.complement}. Fill in the missing word.`,
      answer: second.baseVerb,
      answerSpeech: second.affirmativeSentence,
      explanation: "Use the base verb with I, you, we, and they.",
    }),
    generatedQuestion(level, 3, {
      type: "wordBank",
      instruction: "Build the English sentence",
      prompt: third.translation,
      questionSpeech: third.translation,
      questionLanguage: "id-ID",
      answer: third.affirmativeSentence,
      answerSpeech: third.affirmativeSentence,
      words: wordTiles(third.affirmativeSentence),
    }),
    generatedQuestion(level, 4, {
      type: "listening",
      instruction: "Listen, then build the sentence",
      prompt: "",
      questionSpeech: second.affirmativeSentence,
      answer: second.affirmativeSentence,
      answerSpeech: second.affirmativeSentence,
      words: wordTiles(second.affirmativeSentence, 3),
    }),
    generatedQuestion(level, 5, {
      type: "matching",
      instruction: "Match each routine to its meaning",
      questionSpeech: "Match each English routine to its Indonesian meaning.",
      pairs: vocab,
    }),
    generatedQuestion(level, 6, {
      type: "multipleChoice",
      instruction: "Choose the correct helper verb",
      prompt: `___ ${first.questionRest}?`,
      questionSpeech: `Blank, ${first.questionRest}? Choose do or does.`,
      options: ["Do", "Does"],
      answer: first.questionAux,
      answerSpeech: first.questionSentence,
      explanation: "Use does with he, she, it, or one person. Use do with I, you, we, and they.",
    }),
    generatedQuestion(level, 7, {
      type: "fillBlank",
      instruction: "Complete the negative sentence",
      prompt: second.negativeSentence.replace(/\b(do|does)\s+not\b/i, "___ not"),
      questionSpeech: `${second.negativeSentence.replace(/\b(do|does)\s+not\b/i, "blank not")} Fill in do or does.`,
      answer: negativeAux,
      answerSpeech: second.negativeSentence,
      explanation: `Use ${negativeAux} not with ${second.subject.toLowerCase()}.`,
    }),
    generatedQuestion(level, 8, {
      type: "wordBank",
      instruction: "Build the negative sentence",
      prompt: first.negativeTranslation,
      questionSpeech: first.negativeTranslation,
      questionLanguage: "id-ID",
      answer: first.negativeSentence,
      answerSpeech: first.negativeSentence,
      words: wordTiles(first.negativeSentence, 3),
    }),
    generatedQuestion(level, 9, {
      type: "listening",
      instruction: "Listen, then build the question",
      prompt: "",
      questionSpeech: second.questionSentence,
      answer: second.questionSentence,
      answerSpeech: second.questionSentence,
      words: wordTiles(second.questionSentence, 2),
    }),
    generatedQuestion(level, 10, {
      type: "multipleChoice",
      instruction: "Choose the correct verb",
      prompt: first.negativePrompt,
      questionSpeech: `${first.negativePrompt.replace("___", "blank")} Choose the correct verb.`,
      options: normalVerbOptions,
      answer: first.baseVerb,
      answerSpeech: first.negativeSentence,
      explanation: "After do not or does not, use the base verb.",
    }),
    generatedQuestion(level, 11, {
      type: "fillBlank",
      instruction: "Add a frequency word",
      prompt: frequency.prompt,
      questionSpeech: `${frequency.prompt.replace("___", "blank")}. Fill in the frequency word.`,
      answer: frequency.answer,
      answerSpeech: frequency.answerSentence,
      explanation: "Frequency words usually go before the main verb.",
    }),
    generatedQuestion(level, 12, {
      type: "matching",
      instruction: "Match each frequency word to its meaning",
      questionSpeech: "Match each English frequency word to its Indonesian meaning.",
      pairs: FREQUENCY_PAIRS,
    }),
    generatedQuestion(level, 13, {
      type: "wordBank",
      instruction: "Put the words in order to make a question",
      prompt: "Put the words in order to make a yes-or-no question.",
      questionSpeech: "Put the words in order to make a yes-or-no question.",
      answer: first.questionSentence,
      answerSpeech: first.questionSentence,
      words: wordTiles(first.questionSentence, 2),
    }),
    generatedQuestion(level, 14, {
      type: "listening",
      instruction: "Listen, then build the sentence",
      prompt: "",
      questionSpeech: third.negativeSentence,
      answer: third.negativeSentence,
      answerSpeech: third.negativeSentence,
      words: wordTiles(third.negativeSentence, 3),
    }),
    generatedQuestion(level, 15, {
      type: "fillBlank",
      instruction: "Fill in the missing word",
      prompt: withBlank(third.affirmativeSentence, third.verb),
      questionSpeech: `${third.subject}, blank, ${third.complement}. Fill in the missing word.`,
      answer: third.verb,
      answerSpeech: third.affirmativeSentence,
      explanation: "Remember the s ending for he, she, it, and singular subjects.",
    }),
  ];
}

export function prepareLessons(data) {
  if (!data || !Array.isArray(data.levels)) {
    throw new TypeError("Lesson data must contain a levels array.");
  }

  const levels = data.levels.map((level) => {
    const questions = level.questions ?? buildPracticeQuestions(level);
    if (questions.length !== 15) {
      throw new Error(`Level ${level.id} must contain exactly 15 questions.`);
    }
    return { ...level, questions };
  });

  if (levels.length !== 10) {
    throw new Error("The Simple Present course must contain exactly 10 levels.");
  }

  return { ...data, levels };
}

export const questionTypes = ["multipleChoice", "fillBlank", "wordBank", "listening", "matching"];
