import Image from "next/image";
import { Star, Clock, CalendarDays, Award, Users, Clapperboard } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { WhereToWatch } from "./WhereToWatch";
import type { Movie } from "@/types/movie";
import { formatRuntime, formatRating, formatRank } from "@/utils/format";

interface MovieDetailsDialogProps {
  movie: Movie | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MovieDetailsDialog({
  movie,
  open,
  onOpenChange,
}: MovieDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        {movie && (
          <>
            <DialogHeader>
              <span className="text-xs font-semibold tracking-wide text-gold-soft">
                {formatRank(movie.rank)} no IMDb Top 250
              </span>
              <DialogTitle className="text-xl">{movie.title}</DialogTitle>
              <DialogDescription className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="inline-flex items-center gap-1">
                  <CalendarDays className="size-3.5" /> {movie.year}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="size-3.5" /> {formatRuntime(movie.runtimeMinutes)}
                </span>
                <span className="inline-flex items-center gap-1 text-gold-soft">
                  <Star className="size-3.5 fill-gold-soft" /> {formatRating(movie.imdbRating)}
                </span>
              </DialogDescription>
            </DialogHeader>

            <div className="flex gap-4">
              <div className="relative aspect-2/3 w-24 shrink-0 overflow-hidden rounded-xl ring-1 ring-white/10 sm:w-32">
                <Image
                  src={movie.poster}
                  alt={`Pôster de ${movie.title}`}
                  fill
                  sizes="128px"
                  className="object-cover"
                />
              </div>

              <div className="flex flex-col gap-2 text-sm">
                <div className="flex flex-wrap gap-1.5">
                  {movie.genres.map((genre) => (
                    <Badge key={genre} variant="secondary">
                      {genre}
                    </Badge>
                  ))}
                </div>
                {movie.plot && (
                  <p className="text-muted-foreground">{movie.plot}</p>
                )}
              </div>
            </div>

            {/* key força remount ao trocar de filme, reiniciando o fetch/loading */}
            <WhereToWatch key={movie.imdbId} imdbId={movie.imdbId} />

            <div className="flex flex-col gap-2 border-t border-border pt-3 text-sm text-muted-foreground">
              {movie.director && (
                <p className="inline-flex items-start gap-2">
                  <Clapperboard className="mt-0.5 size-4 shrink-0" />
                  <span>
                    <span className="font-medium text-foreground">Direção:</span>{" "}
                    {movie.director}
                  </span>
                </p>
              )}
              {movie.actors && (
                <p className="inline-flex items-start gap-2">
                  <Users className="mt-0.5 size-4 shrink-0" />
                  <span>
                    <span className="font-medium text-foreground">Elenco:</span>{" "}
                    {movie.actors}
                  </span>
                </p>
              )}
              {movie.awards && (
                <p className="inline-flex items-start gap-2">
                  <Award className="mt-0.5 size-4 shrink-0" />
                  <span>{movie.awards}</span>
                </p>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
