export interface TemplateBlock {
  id: string;
  lifeBlockId: string;
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = lundi
  startTime: string; // "09:00"
  endTime: string; // "12:00"
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
