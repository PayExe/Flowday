export const LifeBlockColors = [
  '#30D158',
  '#FF453A',
  '#FFD60A',
  '#BF5AF2',
  '#0A84FF',
  '#FF9F0A',
  '#FF375F',
  '#5E5CE6',
  '#40CBE0',
  '#AC8E68',
  '#8E8E93',
  '#FFFFFF',
] as const;

export type LifeBlockColor = (typeof LifeBlockColors)[number];

export interface LifeBlock {
  id: string;
  name: string;
  emoji: string;
  color: LifeBlockColor;
  isArchived: boolean;
  weeklyGoalMinutes: number;
  order: number;
  createdAt: string;
  updatedAt: string;
}
