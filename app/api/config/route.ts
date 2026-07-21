import { NextResponse } from "next/server";

/**
 * Expõe a config pública do Supabase para o client em runtime, em vez de
 * depender de NEXT_PUBLIC_* embutidas no build. Necessário porque nem todo
 * ambiente de deploy (ex.: build via Dockerfile no Easypanel) repassa as
 * env vars do serviço como build args do Docker.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? null,
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? null,
  });
}
