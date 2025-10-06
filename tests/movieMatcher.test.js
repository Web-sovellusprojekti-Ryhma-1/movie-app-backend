import test from "node:test";
import assert from "node:assert/strict";
import { matcherInternals, matchFinnkinoEventToTmdb } from "../Helpers/movieMatcher.js";

const { normalizeTitle, levenshteinDistance, scoreTitleSimilarity, scoreReleaseDate, scoreRuntime, weightScore, resolveEventReleaseDate, resolveEventRuntime } = matcherInternals;

test("normalizeTitle removes punctuation and accents", () => {
  const input = "Àmélie: The Fabulous Adventure!";
  const expected = "amelie the fabulous adventure";
  assert.equal(normalizeTitle(input), expected);
});

test("levenshteinDistance handles simple substitutions", () => {
  assert.equal(levenshteinDistance("abc", "axc"), 1);
  assert.equal(levenshteinDistance("abc", "abc"), 0);
});

test("scoreTitleSimilarity returns value between 0 and 1", () => {
  const score = scoreTitleSimilarity("The Matrix", "Matrix");
  assert.ok(score >= 0 && score <= 1);
  assert.ok(score > 0.4);
});

test("scoreReleaseDate rewards close dates", () => {
  const perfect = scoreReleaseDate("2024-01-01", "2024-01-01");
  const close = scoreReleaseDate("2024-01-01", "2024-01-10");
  const far = scoreReleaseDate("2024-01-01", "2025-01-01");

  assert.equal(perfect, 1);
  assert.ok(close < 1 && close > 0);
  assert.equal(far, 0);
});

test("scoreRuntime rewards matching runtimes", () => {
  const perfect = scoreRuntime(120, 120);
  const close = scoreRuntime(120, 135);
  const far = scoreRuntime(120, 190);

  assert.equal(perfect, 1);
  assert.ok(close < 1 && close > 0);
  assert.equal(far, 0);
});

test("weightScore combines components", () => {
  const score = weightScore({ title: 1, releaseDate: 0.5, runtime: 0 });
  assert.ok(score < 1);
  assert.ok(score > 0.5);
});

test("resolveEventReleaseDate falls back to production year", () => {
  const withFullDate = resolveEventReleaseDate({ dtLocalRelease: "2024-05-01" });
  const withYear = resolveEventReleaseDate({ ProductionYear: 2024 });

  assert.equal(withFullDate, "2024-05-01");
  assert.equal(withYear, "2024-01-01");
});

test("resolveEventRuntime prefers LengthInMinutes", () => {
  const event = { LengthInMinutes: 110, Duration: 120 };
  assert.equal(resolveEventRuntime(event), 110);
});

test("matchFinnkinoEventToTmdb throws when title missing", async () => {
  await assert.rejects(() => matchFinnkinoEventToTmdb({}), {
    message: /title/i,
  });
});
