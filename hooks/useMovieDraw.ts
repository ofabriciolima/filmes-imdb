"use client";

import { useCallback, useMemo, useState } from "react";
import type { Movie } from "@/types/movie";
import { pickRandom, randomInt } from "@/utils/random";

export type DrawPhase = "idle" | "spinning" | "revealed";

export function useMovieDraw(
  allMovies: Movie[],
  watchedRanks: Set<number>,
  includeWatched: boolean
) {
  const [phase, setPhase] = useState<DrawPhase>("idle");
  const [targetRank, setTargetRank] = useState<number | null>(null);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [spinDurationMs, setSpinDurationMs] = useState(4000);

  const eligibleMovies = useMemo(
    () =>
      includeWatched
        ? allMovies
        : allMovies.filter((movie) => !watchedRanks.has(movie.rank)),
    [allMovies, watchedRanks, includeWatched]
  );

  const draw = useCallback(() => {
    if (eligibleMovies.length === 0) {
      setPhase("idle");
      setSelectedMovie(null);
      return;
    }
    const movie = pickRandom(eligibleMovies);
    setSelectedMovie(movie);
    setTargetRank(movie.rank);
    setSpinDurationMs(randomInt(3000, 5000));
    setPhase("spinning");
  }, [eligibleMovies]);

  const completeSpin = useCallback(() => {
    setPhase("revealed");
  }, []);

  const resetToIdle = useCallback(() => {
    setPhase("idle");
    setSelectedMovie(null);
    setTargetRank(null);
  }, []);

  const isAllWatched = phase === "idle" && eligibleMovies.length === 0;

  return {
    phase,
    isAllWatched,
    selectedMovie,
    targetRank,
    spinDurationMs,
    eligibleCount: eligibleMovies.length,
    totalCount: allMovies.length,
    draw,
    completeSpin,
    resetToIdle,
  };
}
