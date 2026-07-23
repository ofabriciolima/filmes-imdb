import { getSupabaseClient } from "@/lib/supabase/client";

/**
 * Toda a resolução de contexto (histórico pessoal vs. da sessão compartilhada)
 * e a atomicidade das escritas acontecem no banco, via RPCs `SECURITY DEFINER`
 * (ver supabase/migration_auth_sessions.sql). O client nunca decide isso.
 */

/** Busca o conjunto de rankings assistidos no contexto atual do usuário. */
export async function getWatchedRanks(): Promise<Set<number>> {
  const supabase = await getSupabaseClient();
  const { data, error } = await supabase.rpc("get_watched_ranks");
  if (error) throw error;
  return new Set((data ?? []) as number[]);
}

/** Marca um filme como assistido no contexto atual (pessoal ou sessão). */
export async function markAsWatched(rank: number, title: string): Promise<void> {
  const supabase = await getSupabaseClient();
  const { error } = await supabase.rpc("mark_watched", {
    p_ranking: rank,
    p_title: title,
  });
  if (error) throw error;
}

/** Reinicia o histórico do contexto atual (pessoal ou sessão). */
export async function resetWatchedHistory(): Promise<void> {
  const supabase = await getSupabaseClient();
  const { error } = await supabase.rpc("reset_watched_history");
  if (error) throw error;
}
