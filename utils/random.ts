/** Escolhe um elemento aleatório com distribuição uniforme. */
export function pickRandom<T>(items: T[]): T {
  const index = Math.floor(Math.random() * items.length);
  return items[index];
}

/** Inteiro aleatório uniforme entre min e max, inclusive. */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
