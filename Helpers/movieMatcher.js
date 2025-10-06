import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_BEARER = process.env.TMDB_BEARER;

if (!TMDB_BEARER) {
  console.warn("TMDB_BEARER token missing. Matching endpoints will fail until it is provided.");
}

const normalizeTitle = (title = "") => {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
};

const levenshteinDistance = (a, b) => {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const matrix = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));

  for (let i = 0; i <= a.length; i++) {
    matrix[i][0] = i;
  }

  for (let j = 0; j <= b.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return matrix[a.length][b.length];
};

const scoreTitleSimilarity = (finnkinoTitle, tmdbTitle) => {
  const normalizedFinnkino = normalizeTitle(finnkinoTitle);
  const normalizedTmdb = normalizeTitle(tmdbTitle);

  if (!normalizedFinnkino || !normalizedTmdb) {
    return 0;
  }

  const distance = levenshteinDistance(normalizedFinnkino, normalizedTmdb);
  const maxLen = Math.max(normalizedFinnkino.length, normalizedTmdb.length);

  if (maxLen === 0) {
    return 0;
  }

  const ratio = 1 - distance / maxLen;
  return Math.max(0, Math.min(1, ratio));
};

const parseDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const scoreReleaseDate = (finnkinoDate, tmdbDate) => {
  const finsDate = parseDate(finnkinoDate);
  const tmDate = parseDate(tmdbDate);

  if (!finsDate || !tmDate) {
    return 0.5; // neutral score when missing data
  }

  const diffDays = Math.abs(finsDate - tmDate) / (1000 * 60 * 60 * 24);
  if (diffDays === 0) {
    return 1;
  }

  if (diffDays >= 30) {
    return 0;
  }

  return Math.max(0, 1 - diffDays / 30);
};

const scoreRuntime = (finnkinoRuntime, tmdbRuntime) => {
  const finRuntime = Number(finnkinoRuntime);
  const tmRuntime = Number(tmdbRuntime);

  if (!finRuntime || !tmRuntime) {
    return 0.5; // neutral score when missing data
  }

  const diffMinutes = Math.abs(finRuntime - tmRuntime);

  if (diffMinutes === 0) {
    return 1;
  }

  if (diffMinutes >= 45) {
    return 0;
  }

  return Math.max(0, 1 - diffMinutes / 45);
};

const weightScore = (components) => {
  const weights = {
    title: 0.6,
    releaseDate: 0.25,
    runtime: 0.15,
  };

  return (
    components.title * weights.title +
    components.releaseDate * weights.releaseDate +
    components.runtime * weights.runtime
  );
};

const buildSearchUrl = (title, releaseDate) => {
  const params = new URLSearchParams({
    query: title,
    include_adult: "false",
    language: "en-US",
  });

  if (releaseDate) {
    const year = new Date(releaseDate).getFullYear();
    if (!Number.isNaN(year)) {
      params.append("primary_release_year", String(year));
    }
  }

  return `${TMDB_BASE_URL}/search/movie?${params.toString()}`;
};

const fetchFromTmdb = async (url) => {
  if (!TMDB_BEARER) {
    throw new Error("TMDB_BEARER environment variable is not set");
  }
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${TMDB_BEARER}`,
    },
  });

  if (!response.ok) {
    throw new Error(`TMDB request failed with status ${response.status}`);
  }

  return response.json();
};

const fetchMovieDetails = async (movieId) => {
  const data = await fetchFromTmdb(`${TMDB_BASE_URL}/movie/${movieId}?language=en-US`);
  return data;
};

const resolveEventReleaseDate = (event) => {
  if (!event) return null;
  if (event.dtLocalRelease) return event.dtLocalRelease;
  if (event.ReleaseDate) return event.ReleaseDate;
  if (event.ProductionYear) {
    return `${event.ProductionYear}-01-01`;
  }
  return null;
};

const resolveEventRuntime = (event) => {
  if (!event) return null;
  if (event.LengthInMinutes) return event.LengthInMinutes;
  if (event.RuntimeInMinutes) return event.RuntimeInMinutes;
  if (event.Duration) return event.Duration;
  return null;
};

export const matchFinnkinoEventToTmdb = async (event) => {
  const title = event?.OriginalTitle || event?.Title;
  const releaseDate = resolveEventReleaseDate(event);

  if (!title) {
    throw new Error("Finnkino event must include a title or original title for matching");
  }

  const searchUrl = buildSearchUrl(title, releaseDate);
  const searchResults = await fetchFromTmdb(searchUrl);
  const candidates = searchResults?.results?.slice(0, 10) || [];

  if (!candidates.length) {
    return {
      match: null,
      candidates: [],
    };
  }

  const details = await Promise.all(
    candidates.map(async (candidate) => {
      try {
        const detail = await fetchMovieDetails(candidate.id);
        return { ...candidate, detail };
      } catch (error) {
        console.error(`Failed to fetch TMDB details for movie ${candidate.id}`, error);
        return { ...candidate, detail: null };
      }
    })
  );

  const evaluated = details.map((candidate) => {
    const eventRuntime = resolveEventRuntime(event);
    const eventReleaseDate = resolveEventReleaseDate(event);
    const componentScores = {
      title: scoreTitleSimilarity(title, candidate.original_title || candidate.title),
      releaseDate: scoreReleaseDate(eventReleaseDate, candidate.release_date),
      runtime: scoreRuntime(eventRuntime, candidate.detail?.runtime),
    };

    const score = weightScore(componentScores);

    return {
      tmdbId: candidate.id,
      title: candidate.title,
      originalTitle: candidate.original_title,
      releaseDate: candidate.release_date,
      runtime: candidate.detail?.runtime,
      score,
      componentScores,
      tmdb: candidate.detail || candidate,
    };
  });

  evaluated.sort((a, b) => b.score - a.score);

  const bestMatch = evaluated[0];
  const threshold = 0.55;

  return {
    match: bestMatch && bestMatch.score >= threshold ? bestMatch : null,
    candidates: evaluated,
  };
};

export const matcherInternals = {
  normalizeTitle,
  levenshteinDistance,
  scoreTitleSimilarity,
  scoreReleaseDate,
  scoreRuntime,
  weightScore,
  resolveEventReleaseDate,
  resolveEventRuntime,
};
