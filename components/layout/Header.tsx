import { WatchedToggle } from "./WatchedToggle";

interface HeaderProps {
  includeWatched: boolean;
  onIncludeWatchedChange: (checked: boolean) => void;
  eligibleCount: number;
  totalCount: number;
}

export function Header({
  includeWatched,
  onIncludeWatchedChange,
  eligibleCount,
  totalCount,
}: HeaderProps) {
  return (
    <header className="flex w-full flex-col items-center gap-4 px-4 pt-8 pb-4 sm:flex-row sm:justify-between sm:px-8">
      <div className="text-center sm:text-left">
        <h1 className="text-lg font-bold tracking-tight sm:text-xl">
          🎬 Roleta de Filmes
        </h1>
        <p className="text-xs text-muted-foreground">
          IMDb Top 250 · {eligibleCount}/{totalCount} filmes elegíveis
        </p>
      </div>
      <WatchedToggle
        checked={includeWatched}
        onCheckedChange={onIncludeWatchedChange}
      />
    </header>
  );
}
