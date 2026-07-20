/** "142" -> "2h 22min" */
export function formatRuntime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  if (hours === 0) return `${remaining}min`;
  if (remaining === 0) return `${hours}h`;
  return `${hours}h ${remaining}min`;
}

export function formatRating(rating: number): string {
  return rating.toFixed(1);
}

export function formatRank(rank: number): string {
  return `#${rank}`;
}
