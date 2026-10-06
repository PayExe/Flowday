// Life block icons: each SF Symbol is paired with a unique emoji. The emoji stays the
// stored value (LifeBlock.emoji) so existing data and notification titles keep working,
// and the symbol is resolved from it at render time.
export const BLOCK_ICONS = [
  { symbol: 'laptopcomputer', emoji: '💻' },
  { symbol: 'briefcase.fill', emoji: '💼' },
  { symbol: 'brain.head.profile', emoji: '🧠' },
  { symbol: 'target', emoji: '🎯' },
  { symbol: 'pencil.line', emoji: '✍️' },
  { symbol: 'book.fill', emoji: '📚' },
  { symbol: 'graduationcap.fill', emoji: '🎓' },
  { symbol: 'figure.run', emoji: '🏃' },
  { symbol: 'dumbbell.fill', emoji: '🏋️' },
  { symbol: 'bicycle', emoji: '🚴' },
  { symbol: 'figure.mind.and.body', emoji: '🧘' },
  { symbol: 'heart.fill', emoji: '❤️' },
  { symbol: 'stethoscope', emoji: '🩺' },
  { symbol: 'bed.double.fill', emoji: '💤' },
  { symbol: 'fork.knife', emoji: '🍳' },
  { symbol: 'cup.and.saucer.fill', emoji: '☕' },
  { symbol: 'leaf.fill', emoji: '🌱' },
  { symbol: 'house.fill', emoji: '🏠' },
  { symbol: 'sparkles', emoji: '🧹' },
  { symbol: 'cart.fill', emoji: '🛒' },
  { symbol: 'banknote.fill', emoji: '💰' },
  { symbol: 'person.2.fill', emoji: '👥' },
  { symbol: 'pawprint.fill', emoji: '🐕' },
  { symbol: 'airplane', emoji: '✈️' },
  { symbol: 'paintpalette.fill', emoji: '🎨' },
  { symbol: 'guitars.fill', emoji: '🎸' },
  { symbol: 'headphones', emoji: '🎧' },
  { symbol: 'camera.fill', emoji: '📸' },
  { symbol: 'gamecontroller.fill', emoji: '🎮' },
] as const;

const EMOJI_TO_SYMBOL: Record<string, string> = {
  ...Object.fromEntries(BLOCK_ICONS.map((icon) => [icon.emoji, icon.symbol])),
  '⬜': 'square.dashed',
};

export function symbolForEmoji(emoji: string | undefined): string | undefined {
  return emoji ? EMOJI_TO_SYMBOL[emoji] : undefined;
}
