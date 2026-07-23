import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

let cachedClient: SupabaseClient | null = null;
let configPromise: Promise<{ supabaseUrl: string; supabaseAnonKey: string }> | null = null;

async function fetchConfig() {
  if (!configPromise) {
    configPromise = fetch("/api/config").then(async (res) => {
      const data = await res.json();
      if (!data.supabaseUrl || !data.supabaseAnonKey) {
        throw new Error(
          "Supabase não configurado. Defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY nas variáveis de ambiente do servidor."
        );
      }
      return data as { supabaseUrl: string; supabaseAnonKey: string };
    });
  }
  return configPromise;
}

/**
 * Lazily cria o client Supabase no browser, buscando a config em runtime
 * via /api/config (em vez de ler NEXT_PUBLIC_* embutidas no build). Lança
 * um erro legível quando as variáveis ainda não foram configuradas, para
 * que a camada de serviço converta isso em um toast.
 */
export async function getSupabaseClient(): Promise<SupabaseClient> {
  if (cachedClient) return cachedClient;

  const { supabaseUrl, supabaseAnonKey } = await fetchConfig();
  cachedClient = createBrowserClient(supabaseUrl, supabaseAnonKey);
  return cachedClient;
}
