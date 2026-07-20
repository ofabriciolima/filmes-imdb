import Image from "next/image";
import { Star, Clock, CalendarDays } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Movie } from "@/types/movie";
import { formatRuntime, formatRating, formatRank } from "@/utils/format";

export function MovieCard({ movie }: { movie: Movie }) {
  return (
    <div className="glass-panel flex flex-col gap-6 p-5 sm:flex-row sm:gap-8 sm:p-8">
      <div className="relative mx-auto aspect-2/3 w-44 shrink-0 overflow-hidden rounded-2xl ring-1 ring-white/10 shadow-xl shadow-black/50 sm:mx-0 sm:w-56">
        <Image
          src={movie.poster}
          alt={`Pôster de ${movie.title}`}
          fill
          sizes="(min-width: 640px) 224px, 176px"
          className="object-cover"
          priority
        />
      </div>

      <div className="flex flex-1 flex-col items-center gap-3 text-center sm:items-start sm:text-left">
        <span className="inline-flex items-center rounded-full bg-gold/15 px-3 py-1 text-sm font-semibold text-gold-soft ring-1 ring-gold/30">
          {formatRank(movie.rank)} no IMDb Top 250
        </span>

        <h2 className="text-2xl font-bold tracking-tight text-balance sm:text-3xl">
          {movie.title}
        </h2>

        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground sm:justify-start">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="size-4" />
            {movie.year}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="size-4" />
            {formatRuntime(movie.runtimeMinutes)}
          </span>
          <span className="inline-flex items-center gap-1.5 font-medium text-gold-soft">
            <Star className="size-4 fill-gold-soft" />
            {formatRating(movie.imdbRating)}
          </span>
        </div>

        <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
          {movie.genres.map((genre) => (
            <Badge key={genre} variant="outline" className="text-muted-foreground">
              {genre}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
