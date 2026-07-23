"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Users, Copy, LogOut, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JoinSessionDialog } from "./JoinSessionDialog";
import type { SessionWithMembers } from "@/types/session";

interface SessionBarProps {
  session: SessionWithMembers | null;
  currentUserId: string | null;
  onCreateSession: () => void;
  onJoinSession: (code: string) => Promise<void>;
  onLeaveSession: () => void;
  onEndSession: () => void;
  onRegenerateCode: () => void;
}

export function SessionBar({
  session,
  currentUserId,
  onCreateSession,
  onJoinSession,
  onLeaveSession,
  onEndSession,
  onRegenerateCode,
}: SessionBarProps) {
  const [joinOpen, setJoinOpen] = useState(false);

  if (!session) {
    return (
      <>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="rounded-full border-white/15 bg-white/[0.03] hover:bg-white/[0.08]"
            onClick={onCreateSession}
          >
            Criar sessão
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="rounded-full border-white/15 bg-white/[0.03] hover:bg-white/[0.08]"
            onClick={() => setJoinOpen(true)}
          >
            Entrar com código
          </Button>
        </div>
        <JoinSessionDialog open={joinOpen} onOpenChange={setJoinOpen} onJoin={onJoinSession} />
      </>
    );
  }

  const names = session.members
    .map((member) => member.profile?.display_name ?? "?")
    .join(" & ");
  const isOwner = session.owner_id === currentUserId;
  const isFull = session.members.length >= session.max_members;

  function handleCopyCode() {
    if (!session?.invite_code) return;
    navigator.clipboard.writeText(session.invite_code);
    toast.success("Código copiado!");
  }

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-2 text-xs sm:text-sm">
      <span className="inline-flex items-center gap-1.5 font-medium">
        <Users className="size-4 text-gold-soft" />
        Sessão: {names}
      </span>

      {!isFull && session.invite_code && (
        <span className="inline-flex items-center gap-1">
          <button
            type="button"
            onClick={handleCopyCode}
            title="Copiar código"
            className="inline-flex items-center gap-1 rounded-full bg-gold/15 px-2 py-0.5 font-mono text-gold-soft"
          >
            {session.invite_code} <Copy className="size-3" />
          </button>
          <button
            type="button"
            onClick={onRegenerateCode}
            title="Gerar novo código"
            className="text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className="size-3.5" />
          </button>
        </span>
      )}

      <button
        type="button"
        onClick={onLeaveSession}
        className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
      >
        <LogOut className="size-3.5" /> Sair
      </button>

      {isOwner && (
        <button
          type="button"
          onClick={onEndSession}
          className="text-muted-foreground hover:text-destructive"
        >
          Encerrar sessão
        </button>
      )}
    </div>
  );
}
