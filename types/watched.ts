/** Espelha a tabela `public.filmes_imdb` já existente no Supabase. */
export interface WatchedRow {
  id: number;
  created_at: string;
  nome_filme: string | null;
  assistido: boolean | null;
  ranking_imdb: number | null;
}

export type WatchedInsert = Omit<WatchedRow, "id" | "created_at">;
