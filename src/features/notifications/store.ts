import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { persistOptions } from '../../utils/persistence';

export const BLOCK_LEAD_CHOICES = [0, 5, 10] as const;

export type BlockLeadMinutes = (typeof BLOCK_LEAD_CHOICES)[number];

export interface NotificationPrefs {
  ritualsEnabled: boolean;
  blocksEnabled: boolean;
  blockLeadMinutes: BlockLeadMinutes;
  focusEnabled: boolean;
}

interface NotificationState extends NotificationPrefs {
  permissionRequested: boolean;
  permissionGranted: boolean;
  setRitualsEnabled: (enabled: boolean) => void;
  setBlocksEnabled: (enabled: boolean) => void;
  setBlockLeadMinutes: (minutes: number) => void;
  setFocusEnabled: (enabled: boolean) => void;
  setPermission: (granted: boolean) => void;
  markPermissionRequested: () => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      ritualsEnabled: true,
      blocksEnabled: false,
      blockLeadMinutes: 5,
      focusEnabled: true,
      permissionRequested: false,
      permissionGranted: false,

      setRitualsEnabled: (ritualsEnabled) => set({ ritualsEnabled }),
      setBlocksEnabled: (blocksEnabled) => set({ blocksEnabled }),
      setBlockLeadMinutes: (minutes) => {
        if (!BLOCK_LEAD_CHOICES.includes(minutes as BlockLeadMinutes)) return;
        set({ blockLeadMinutes: minutes as BlockLeadMinutes });
      },
      setFocusEnabled: (focusEnabled) => set({ focusEnabled }),
      setPermission: (permissionGranted) => set({ permissionGranted }),
      markPermissionRequested: () => set({ permissionRequested: true }),
    }),
    persistOptions<NotificationState>('flowday-notifications', { version: 1 })
  )
);
