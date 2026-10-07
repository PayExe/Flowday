export type BlockStatus = 'done' | 'partial' | 'skipped';

/**
 * What actually happened to one planned slot on one day: the "lived" side that
 * the weekly template (the "planned" side) is compared against.
 */
export interface BlockLog {
  /** YYYY-MM-DD */
  date: string;
  lifeBlockId: string;
  templateBlockId: string;
  plannedMinutes: number;
  status: BlockStatus;
  source: 'notification' | 'manual';
  updatedAt: string;
}
