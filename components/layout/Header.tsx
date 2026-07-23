import { LogOut } from "lucide-react";
import { WatchedToggle } from "./WatchedToggle";
import { SessionBar } from "@/components/session/SessionBar";
import { Button } from "@/components/ui/button";
import type { SessionWithMembers } from "@/types/session";

interface HeaderProps {
  includeWatched: boolean;
  onIncludeWatchedChange: (checked: boolean) => void;
  eligibleCount: number;
  totalCount: number;
  userEmail: string | null;
  onSignOut: () => void;
  session: SessionWithMembers | null;
  currentUserId: string | null;
  onCreateSession: () => void;
  onJoinSession: (code: string) => Promise<void>;
  onLeaveSession: () => void;
  onEndSession: () => void;
  onRegenerateCode: () => void;
}

export function Header({
  includeWatched,
  onIncludeWatchedChange,
  eligibleCount,
  totalCount,
  userEmail,
  onSignOut,
  session,
  currentUserId,
  onCreateSession,
  onJoinSession,
  onLeaveSession,
  onEndSession,
  onRegenerateCode,
}: HeaderProps) {
  return (
    <header className="flex w-full flex-col items-center gap-4 px-4 pt-8 pb-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between sm:px-8">
      <div className="text-center sm:text-left">
        <h1 className="text-lg font-bold tracking-tight sm:text-xl">
          🎬 Roleta de Filmes
        </h1>
        <p className="text-xs text-muted-foreground">
          IMDb Top 250 · {eligibleCount}/{totalCount} filmes elegíveis
        </p>
      </div>

      <div className="flex flex-col items-center gap-2 sm:items-end">
        <SessionBar
          session={session}
          currentUserId={currentUserId}
          onCreateSession={onCreateSession}
          onJoinSession={onJoinSession}
          onLeaveSession={onLeaveSession}
          onEndSession={onEndSession}
          onRegenerateCode={onRegenerateCode}
        />
        <div className="flex items-center gap-3">
          <WatchedToggle
            checked={includeWatched}
            onCheckedChange={onIncludeWatchedChange}
          />
          <Button
            size="sm"
            variant="ghost"
            onClick={onSignOut}
            title={userEmail ?? undefined}
            className="gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <LogOut className="size-4" />
            Sair
          </Button>
        </div>
      </div>
    </header>
  );
}
