"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { getSupabaseClient } from "@/lib/supabase/client";
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

/**
 * `sessionId` é o contexto atual (null = histórico pessoal). Quando definido,
 * assina mudanças em tempo real para refletir marcações feitas pelo parceiro.
 */
export function useWatchedMovies(sessionId: string | null) {
  const [watchedRanks, setWatchedRanks] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const ranks = await getWatchedRanks();
      setWatchedRanks(ranks);
    } catch (error) {
      toast.error("Não foi possível carregar os filmes assistidos", {
        description: errorMessage(error),
      });
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    let channel: RealtimeChannel | null = null;

    (async () => {
      setIsLoading(true);
      await refresh();
      if (cancelled) return;
      setIsLoading(false);

      if (!sessionId) return;

      const supabase = await getSupabaseClient();
      if (cancelled) return;
      channel = supabase
        .channel(`watched_movies_${sessionId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "watched_movies",
            filter: `session_id=eq.${sessionId}`,
          },
          () => {
            refresh();
          }
        )
        .subscribe();
    })();

    return () => {
      cancelled = true;
      channel?.unsubscribe();
    };
  }, [sessionId, refresh]);

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
