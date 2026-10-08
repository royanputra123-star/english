import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { prepareLessons, questionTypes } from "../js/lesson-data.js";

const rawData = JSON.parse(await readFile(new URL("../data/lessons.json", import.meta.url), "utf8"));
const { levels } = prepareLessons(rawData);

function normalize(value) {
  return String(value).toLowerCase().replace(/[.,!?;:]/g, "").replace(/\s+/g, " ").trim();
}

test("course data contains ten levels with exactly fifteen questions each", () => {
  assert.equal(levels.length, 10);
  for (const level of levels) {
    assert.equal(level.questions.length, 15, `${level.title} should have 15 questions`);
    for (const type of questionTypes) {
      assert.ok(level.questions.some((question) => question.type === type), `${level.title} is missing ${type}`);
    }
  }
});

test("Level 1 is fully authored and covers all five exercise types", () => {
  const levelOne = levels[0];
  assert.equal(levelOne.questions.length, 15);
  for (const type of questionTypes) {
    assert.ok(levelOne.questions.some((question) => question.type === type), `missing ${type}`);
  }
  assert.equal(levelOne.questions.filter((question) => question.type === "matching").length, 2);
  assert.ok(levelOne.questions.every((question) => question.questionSpeech));
});

test("every question has usable content and a valid answer shape", () => {
  for (const level of levels) {
    for (const question of level.questions) {
      assert.ok(question.id, `${level.title} has a question without an id`);
      assert.ok(question.instruction, `${question.id} has no instruction`);
      assert.ok(question.questionSpeech, `${question.id} has no speech prompt`);

      if (question.type === "multipleChoice") {
        assert.ok(question.options.length >= 2);
        assert.ok(question.options.some((option) => normalize(option) === normalize(question.answer)));
      } else if (question.type === "fillBlank") {
        assert.ok(question.answer);
        assert.match(question.prompt, /___/);
      } else if (question.type === "wordBank" || question.type === "listening") {
        assert.ok(question.words.length >= question.answer.trim().split(/\s+/).length);
        assert.ok(question.answer);
        assert.ok(question.words.length > 0);
      } else if (question.type === "matching") {
        assert.equal(question.pairs.length, 4);
        assert.equal(new Set(question.pairs.map(({ left }) => left)).size, 4);
        assert.equal(new Set(question.pairs.map(({ right }) => right)).size, 4);
      }
    }
  }
});

test("word banks contain every token needed to build the answer", () => {
  for (const level of levels) {
    for (const question of level.questions.filter((item) => ["wordBank", "listening"].includes(item.type))) {
      const available = new Map();
      for (const token of question.words.map(normalize)) available.set(token, (available.get(token) || 0) + 1);
      for (const token of question.answer.trim().split(/\s+/).map(normalize)) {
        const remaining = available.get(token) || 0;
        assert.ok(remaining > 0, `${question.id} is missing answer token ${token}`);
        available.set(token, remaining - 1);
      }
    }
  }
});
