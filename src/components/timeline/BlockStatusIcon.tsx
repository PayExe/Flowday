import type { BlockStatus } from '../../types/blockLog';
import type { ColorPalette } from '../../theme';
import { Symbol } from '../ui/Symbol';

export const BLOCK_STATUSES: readonly BlockStatus[] = ['done', 'partial', 'skipped'];

export const STATUS_META: Record<BlockStatus, { symbol: string; label: string; color: (colors: ColorPalette) => string }> = {
  done: { symbol: 'checkmark.circle.fill', label: 'Fait', color: (colors) => colors.system.green },
  partial: { symbol: 'circle.lefthalf.filled', label: 'En partie', color: (colors) => colors.system.orange },
  skipped: { symbol: 'xmark.circle.fill', label: 'Pas fait', color: (colors) => colors.system.gray },
};

interface BlockStatusIconProps {
  /** Undefined with `needsReview` shows the "to validate" marker. */
  status?: BlockStatus;
  needsReview?: boolean;
  size: number;
  colors: ColorPalette;
}

export function BlockStatusIcon({ status, needsReview, size, colors }: BlockStatusIconProps) {
  if (status) {
    const meta = STATUS_META[status];
    return <Symbol name={meta.symbol} size={size} color={meta.color(colors)} />;
  }
  if (needsReview) {
    return <Symbol name="circle.dashed" size={size} weight="semibold" color={colors.accent} />;
  }
  return null;
}
