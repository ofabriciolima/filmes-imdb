"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ExternalLink } from "lucide-react";
import type {
  WatchProvider,
  WatchProvidersByType,
  WatchProvidersResponse,
} from "@/types/watchProvider";

interface WhereToWatchProps {
  imdbId: string;
}

const TYPE_LABELS: Record<keyof WatchProvidersByType, string> = {
  flatrate: "Disponível por assinatura",
  free: "Disponível gratuitamente",
  ads: "Grátis com anúncios",
  rent: "Disponível para aluguel",
  buy: "Disponível para compra",
};

const TYPE_ORDER: (keyof WatchProvidersByType)[] = [
  "flatrate",
  "free",
  "ads",
  "rent",
  "buy",
];

export function WhereToWatch({ imdbId }: WhereToWatchProps) {
  const [data, setData] = useState<WatchProvidersResponse | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch(`/api/watch-providers/${imdbId}`)
      .then((res) => res.json())
      .then((json: WatchProvidersResponse) => {
        if (!cancelled) setData(json);
      })
      .catch(() => {
        if (!cancelled) {
          setData({
            status: "error",
            message: "Não foi possível carregar as opções de streaming.",
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [imdbId]);

  return (
    <div className="flex flex-col gap-2 border-t border-border pt-3">
      <h3 className="text-sm font-semibold text-foreground">
        Onde assistir no Brasil
      </h3>

      {!data && (
        <div className="flex flex-col gap-1.5">
          <div className="h-10 w-full animate-pulse rounded-lg bg-muted" />
          <div className="h-10 w-4/5 animate-pulse rounded-lg bg-muted" />
        </div>
      )}

      {data?.status === "unavailable" && (
        <p className="text-sm text-muted-foreground">
          Não encontramos informação de disponibilidade no Brasil para este
          filme no momento.
        </p>
      )}

      {data?.status === "error" && (
        <p className="text-sm text-muted-foreground">
          Não foi possível carregar as opções de streaming agora.
        </p>
      )}

      {data?.status === "ok" && (
        <>
          <div className="flex flex-col gap-1.5">
            {TYPE_ORDER.flatMap((type) =>
              data.providers[type].map((provider) => (
                <ProviderRow
                  key={`${type}-${provider.id}`}
                  provider={provider}
                  typeLabel={TYPE_LABELS[type]}
                  link={data.link}
                />
              ))
            )}
          </div>
          <p className="text-right text-[11px] text-muted-foreground/70">
            Dados de disponibilidade fornecidos por{" "}
            <a
              href="https://www.themoviedb.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground"
            >
              TMDB
            </a>
          </p>
        </>
      )}
    </div>
  );
}

function ProviderRow({
  provider,
  typeLabel,
  link,
}: {
  provider: WatchProvider;
  typeLabel: string;
  link: string | null;
}) {
  const content = (
    <div className="flex items-center gap-2.5 rounded-lg bg-white/[0.03] px-2.5 py-2 transition-colors hover:bg-white/[0.07]">
      <div className="relative size-8 shrink-0 overflow-hidden rounded-md ring-1 ring-white/10">
        <Image
          src={provider.logoUrl}
          alt={provider.name}
          fill
          sizes="32px"
          className="object-cover"
        />
      </div>
      <div className="flex flex-1 flex-col leading-tight">
        <span className="text-sm font-medium text-foreground">
          {provider.name}
        </span>
        <span className="text-xs text-muted-foreground">{typeLabel}</span>
      </div>
      {link && (
        <ExternalLink className="size-3.5 shrink-0 text-muted-foreground" />
      )}
    </div>
  );

  if (!link) return content;

  return (
    <a href={link} target="_blank" rel="noopener noreferrer">
      {content}
    </a>
  );
}
