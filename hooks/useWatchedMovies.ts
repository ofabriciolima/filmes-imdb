"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  getWatchedRanks,
  markAsWatched,
  resetWatchedHistory,
} from "@/services/watchedService";
import type { Movie } from "@/types/movie";

function errorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Não foi possível conectar ao Supabase.";
}

export function useWatchedMovies() {
  const [watchedRanks, setWatchedRanks] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getWatchedRanks()
      .then((ranks) => {
        if (!cancelled) setWatchedRanks(ranks);
      })
      .catch((error) => {
        toast.error("Não foi possível carregar os filmes assistidos", {
          description: errorMessage(error),
        });
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const markWatched = useCallback(
    async (movie: Movie, successMessage: string) => {
      const previous = watchedRanks;
      setWatchedRanks((current) => new Set(current).add(movie.rank));
      try {
        await markAsWatched(movie.rank, movie.title);
        toast.success(successMessage);
      } catch (error) {
        setWatchedRanks(previous);
        toast.error("Não foi possível salvar no Supabase", {
          description: errorMessage(error),
        });
      }
    },
    [watchedRanks]
  );

  const resetHistory = useCallback(async () => {
    const previous = watchedRanks;
    setWatchedRanks(new Set());
    try {
      await resetWatchedHistory();
      toast.success("Histórico reiniciado! Todos os 250 filmes estão elegíveis novamente.");
    } catch (error) {
      setWatchedRanks(previous);
      toast.error("Não foi possível reiniciar o histórico", {
        description: errorMessage(error),
      });
    }
  }, [watchedRanks]);

  return { watchedRanks, isLoading, markWatched, resetHistory };
}
