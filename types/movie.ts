export interface Movie {
  /** Posição oficial no ranking IMDb Top 250 (1 a 250). */
  rank: number;
  title: string;
  year: number;
  runtimeMinutes: number;
  genres: string[];
  imdbRating: number;
  imdbId: string;
  poster: string;
  director?: string;
  plot?: string;
  actors?: string;
  awards?: string;
}
