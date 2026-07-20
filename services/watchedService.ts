import { getSupabaseClient } from "@/lib/supabase/client";

const TABLE = "filmes_imdb";

/** Busca o conjunto de rankings já marcados como assistidos. */
export async function getWatchedRanks(): Promise<Set<number>> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from(TABLE)
    .select("ranking_imdb")
    .eq("assistido", true);

  if (error) throw error;

  return new Set(
    (data ?? [])
      .map((row) => row.ranking_imdb)
      .filter((rank): rank is number => rank !== null)
  );
}

/**
 * Marca um filme como assistido. Não há constraint UNIQUE em `ranking_imdb`
 * na tabela existente, então fazemos select-then-write em vez de upsert.
 */
export async function markAsWatched(
  rank: number,
  title: string
): Promise<void> {
  const supabase = getSupabaseClient();

  const { data: existing, error: selectError } = await supabase
    .from(TABLE)
    .select("id")
    .eq("ranking_imdb", rank)
    .maybeSingle();

  if (selectError) throw selectError;

  if (existing) {
    const { error } = await supabase
      .from(TABLE)
      .update({ nome_filme: title, assistido: true })
      .eq("id", existing.id);
    if (error) throw error;
    return;
  }

  const { error } = await supabase
    .from(TABLE)
    .insert({ nome_filme: title, ranking_imdb: rank, assistido: true });
  if (error) throw error;
}

/** Reinicia o histórico: marca todos os registros como não assistidos. */
export async function resetWatchedHistory(): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from(TABLE)
    .update({ assistido: false })
    .eq("assistido", true);
  if (error) throw error;
}
