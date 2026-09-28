export type Mood = 'bad' | 'meh' | 'good';

export interface RitualLog {
  date: string;
  type: 'morning' | 'evening';
  mood?: Mood;
  intention?: string;
  note?: string;
  completedAt: string;
}

export interface MorningRitualConfig {
  enabled: boolean;
  time: string;
  fastMode: boolean;
  steps: {
    mood: boolean;
    overview: boolean;
    priorities: boolean;
    intention: boolean;
  };
}

export interface EveningWrapConfig {
  enabled: boolean;
  time: string;
}
