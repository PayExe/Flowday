export type BlockStatus = 'done' | 'partial' | 'skipped';

export interface BlockLog {
  date: string;
  lifeBlockId: string;
  templateBlockId: string;
  plannedMinutes: number;
  status: BlockStatus;
  source: 'notification' | 'manual';
  updatedAt: string;
}
