import { NextResponse } from "next/server";
import type {
  WatchProvidersByType,
  WatchProvidersResponse,
} from "@/types/watchProvider";

/**
 * Busca onde um filme pode ser assistido no Brasil, via TMDB (que agrega
 * dados do JustWatch por país). A chave fica só no servidor — o client
 * chama essa rota, nunca a TMDB diretamente.
 */
export const dynamic = "force-dynamic";

const TMDB_BASE = "https://api.themoviedb.org/3";
const LOGO_BASE = "https://image.tmdb.org/t/p/w92";
const REVALIDATE_SECONDS = 60 * 60 * 24;

interface TmdbProviderRaw {
  provider_id: number;
  provider_name: string;
  logo_path: string;
}

interface TmdbCountryProviders {
  link?: string;
  flatrate?: TmdbProviderRaw[];
  free?: TmdbProviderRaw[];
  ads?: TmdbProviderRaw[];
  rent?: TmdbProviderRaw[];
  buy?: TmdbProviderRaw[];
}

function mapProviders(list: TmdbProviderRaw[] | undefined) {
  return (list ?? []).map((provider) => ({
    id: provider.provider_id,
    name: provider.provider_name,
    logoUrl: `${LOGO_BASE}${provider.logo_path}`,
  }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ imdbId: string }> }
) {
  const { imdbId } = await params;
  const apiKey = process.env.TMDB_API_KEY;

  if (!apiKey) {
    return NextResponse.json<WatchProvidersResponse>({
      status: "error",
      message: "TMDB_API_KEY não configurada no servidor.",
    });
  }

  try {
    const findRes = await fetch(
      `${TMDB_BASE}/find/${imdbId}?api_key=${apiKey}&external_source=imdb_id`,
      { next: { revalidate: REVALIDATE_SECONDS } }
    );
    if (!findRes.ok) {
      throw new Error(`TMDB find falhou com status ${findRes.status}`);
    }
    const findData = await findRes.json();
    const tmdbId = findData?.movie_results?.[0]?.id as number | undefined;

    if (!tmdbId) {
      return NextResponse.json<WatchProvidersResponse>({ status: "unavailable" });
    }

    const providersRes = await fetch(
      `${TMDB_BASE}/movie/${tmdbId}/watch/providers?api_key=${apiKey}`,
      { next: { revalidate: REVALIDATE_SECONDS } }
    );
    if (!providersRes.ok) {
      throw new Error(`TMDB watch/providers falhou com status ${providersRes.status}`);
    }
    const providersData = await providersRes.json();
    const br: TmdbCountryProviders | undefined = providersData?.results?.BR;

    if (!br) {
      return NextResponse.json<WatchProvidersResponse>({ status: "unavailable" });
    }

    const providers: WatchProvidersByType = {
      flatrate: mapProviders(br.flatrate),
      free: mapProviders(br.free),
      ads: mapProviders(br.ads),
      rent: mapProviders(br.rent),
      buy: mapProviders(br.buy),
    };

    const hasAny = Object.values(providers).some((list) => list.length > 0);
    if (!hasAny) {
      return NextResponse.json<WatchProvidersResponse>({ status: "unavailable" });
    }

    return NextResponse.json<WatchProvidersResponse>({
      status: "ok",
      country: "BR",
      link: br.link ?? null,
      providers,
    });
  } catch (error) {
    return NextResponse.json<WatchProvidersResponse>({
      status: "error",
      message: error instanceof Error ? error.message : "Erro desconhecido.",
    });
  }
}
