/** Espelha o retorno da RPC `mark_watched` (tabela `public.watched_movies`). */
export interface WatchedRow {
  id: number;
  user_id: string;
  session_id: string | null;
  ranking_imdb: number;
  nome_filme: string | null;
  assistido: boolean;
  created_at: string;
  updated_at: string;
}
