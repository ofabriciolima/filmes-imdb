export interface WatchProvider {
  id: number;
  name: string;
  logoUrl: string;
}

export interface WatchProvidersByType {
  flatrate: WatchProvider[];
  free: WatchProvider[];
  ads: WatchProvider[];
  rent: WatchProvider[];
  buy: WatchProvider[];
}

export type WatchProvidersResponse =
  | { status: "ok"; country: "BR"; link: string | null; providers: WatchProvidersByType }
  | { status: "unavailable" }
  | { status: "error"; message: string };
