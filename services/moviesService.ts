import top250 from "@/data/top250.json";
import type { Movie } from "@/types/movie";

const movies = top250 as Movie[];

export function getAllMovies(): Movie[] {
  return movies;
}

export function getMovieByRank(rank: number): Movie | undefined {
  return movies.find((movie) => movie.rank === rank);
}

export function getTotalMoviesCount(): number {
  return movies.length;
}
