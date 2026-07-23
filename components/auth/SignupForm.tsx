"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUp } from "@/services/authService";

export function SignupForm() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [needsEmailConfirmation, setNeedsEmailConfirmation] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }
    if (password.length < 6) {
      setError("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { needsEmailConfirmation } = await signUp(email, password, displayName);
      if (needsEmailConfirmation) {
        setNeedsEmailConfirmation(true);
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível criar a conta.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (needsEmailConfirmation) {
    return (
      <div className="glass-panel flex w-full max-w-sm flex-col items-center gap-3 p-8 text-center">
        <span className="text-3xl">📬</span>
        <h1 className="text-lg font-bold">Confirme seu e-mail</h1>
        <p className="text-sm text-muted-foreground">
          Enviamos um link de confirmação para <strong className="text-foreground">{email}</strong>.
          Depois de confirmar, é só entrar normalmente.
        </p>
        <Link href="/login" className="mt-2 text-sm font-medium text-gold-soft hover:underline">
          Ir para o login
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="glass-panel flex w-full max-w-sm flex-col gap-5 p-8">
      <div className="text-center">
        <h1 className="text-xl font-bold">🎬 Criar conta</h1>
        <p className="mt-1 text-sm text-muted-foreground">Leva menos de um minuto</p>
      </div>

      {error && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-2">
        <Label htmlFor="display-name">Nome ou apelido</Label>
        <Input
          id="display-name"
          autoComplete="nickname"
          required
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="password">Senha</Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="confirm-password">Confirmar senha</Label>
        <Input
          id="confirm-password"
          type="password"
          autoComplete="new-password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="h-11 rounded-2xl bg-gold text-gold-foreground hover:bg-gold-soft"
      >
        {isSubmitting ? "Criando conta..." : "Criar conta"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Já tem conta?{" "}
        <Link href="/login" className="font-medium text-gold-soft hover:underline">
          Entrar
        </Link>
      </p>
    </form>
  );
}
