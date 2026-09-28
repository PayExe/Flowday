export interface TemplateBlock {
  id: string;
  lifeBlockId: string;
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  startTime: string;
  endTime: string;
  title?: string;
  notes?: string;
  isFlexible: boolean;
}

export interface WeeklyTemplate {
  id: string;
  name: string;
  isActive: boolean;
  blocks: TemplateBlock[];
  createdAt: string;
  updatedAt: string;
}
