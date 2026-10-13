import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'expo-router';
import { translate } from '../../i18n';
import { useLanguageStore } from '../language/store';
import { useLifeBlocksStore } from '../lifeBlocks/store';
import { useRitualStore } from '../rituals/store';
import { useTemplateStore } from '../templates/store';
import { BREAK_SECONDS, POMODORO_SECONDS, useFocusStore } from '../focus/store';
import { useBlockLogStore } from '../blockLogs/store';
import { waitForHydration } from '../../utils/useStoresHydrated';
import { useNotificationStore } from './store';
import { blockEndTarget, blockLogFromResponse } from './blockEnd';
import {
  BlockEndInput,
  BlockReminderInput,
  planNotifications,
  planSignature,
} from './schedule';
import {
  addNotificationResponseListener,
  cancelFocusAlert,
  cancelOwnedNotifications,
  configureNotifications,
  getPermissionGranted,
  NotificationEvent,
  registerBlockEndCategory,
  requestPermission,
  scheduleFocusAlert,
  syncPlannedNotifications,
  takeLaunchResponse,
} from './service';

function isBlockEndAnswered(data: Record<string, unknown>): boolean {
  const target = blockEndTarget(data, new Date());
  return !!target && !!useBlockLogStore.getState().getLog(target.date, target.templateBlockId);
}

export function useNotifications(): void {
  const router = useRouter();
  const language = useLanguageStore((state) => state.language);
  const t = useCallback(
    (key: string, params?: Record<string, string | number>) => translate(key, language, params),
    [language]
  );

  const ritualsEnabled = useNotificationStore((state) => state.ritualsEnabled);
  const blocksEnabled = useNotificationStore((state) => state.blocksEnabled);
  const blockEndsEnabled = useNotificationStore((state) => state.blockEndsEnabled);
  const blockLeadMinutes = useNotificationStore((state) => state.blockLeadMinutes);
  const focusEnabled = useNotificationStore((state) => state.focusEnabled);
  const permissionRequested = useNotificationStore((state) => state.permissionRequested);
  const permissionGranted = useNotificationStore((state) => state.permissionGranted);
  const markPermissionRequested = useNotificationStore((state) => state.markPermissionRequested);
  const setPermission = useNotificationStore((state) => state.setPermission);

  const ritualLogs = useRitualStore((state) => state.logs);
  const morningConfig = useRitualStore((state) => state.morningConfig);
  const eveningConfig = useRitualStore((state) => state.eveningConfig);

  const templates = useTemplateStore((state) => state.templates);
  const activeTemplateId = useTemplateStore((state) => state.activeTemplateId);
  const getActiveTemplate = useTemplateStore((state) => state.getActiveTemplate);
  const lifeBlocks = useLifeBlocksStore((state) => state.blocks);

  const focusState = useFocusStore((state) => state.focusState);

  useEffect(() => {
    configureNotifications((data) => !isBlockEndAnswered(data));
  }, []);

  useEffect(() => {
    void registerBlockEndCategory({
      done: t('Fait'),
      partial: t('En partie'),
      skipped: t('Pas fait'),
    });
  }, [t]);

  const wantsNotifications = ritualsEnabled || blocksEnabled || blockEndsEnabled || focusEnabled;

  const promptIsEarned = ritualLogs.length > 0;

  useEffect(() => {
    if (!wantsNotifications) return;
    if (!permissionRequested && !promptIsEarned) return;
    let cancelled = false;

    const resolve = async () => {
      const granted = permissionRequested
        ? await getPermissionGranted()
        : await requestPermission();
      if (cancelled) return;
      if (!permissionRequested) markPermissionRequested();
      setPermission(granted);
    };

    void resolve();
    return () => {
      cancelled = true;
    };
  }, [wantsNotifications, permissionRequested, promptIsEarned, markPermissionRequested, setPermission]);

  const blockReminders = useMemo<BlockReminderInput[]>(() => {
    if (!blocksEnabled) return [];
    const template = getActiveTemplate();
    if (!template) return [];

    return template.blocks.flatMap((block) => {
      const lifeBlock = lifeBlocks.find((candidate) => candidate.id === block.lifeBlockId);
      if (!lifeBlock || lifeBlock.isArchived) return [];
      const label = block.title || lifeBlock.name;
      const timeRange = `${block.startTime} – ${block.endTime}`;
      return [
        {
          id: block.id,
          dayOfWeek: block.dayOfWeek,
          startTime: block.startTime,
          title: `${lifeBlock.emoji} ${label}`.trim(),
          body:
            blockLeadMinutes > 0
              ? t('blockReminderSoon', { minutes: blockLeadMinutes, timeRange })
              : t('blockReminderNow', { timeRange }),
        },
      ];
    });
  }, [blocksEnabled, blockLeadMinutes, getActiveTemplate, templates, activeTemplateId, lifeBlocks, t]);

  const blockEnds = useMemo<BlockEndInput[]>(() => {
    if (!blockEndsEnabled) return [];
    const template = getActiveTemplate();
    if (!template) return [];

    return template.blocks.flatMap((block) => {
      const lifeBlock = lifeBlocks.find((candidate) => candidate.id === block.lifeBlockId);
      if (!lifeBlock || lifeBlock.isArchived) return [];
      const label = block.title || lifeBlock.name;
      return [
        {
          id: block.id,
          lifeBlockId: block.lifeBlockId,
          dayOfWeek: block.dayOfWeek,
          startTime: block.startTime,
          endTime: block.endTime,
          title: `${lifeBlock.emoji} ${label}`.trim(),
          body: t('blockEndQuestion', { start: block.startTime, end: block.endTime }),
        },
      ];
    });
  }, [blockEndsEnabled, getActiveTemplate, templates, activeTemplateId, lifeBlocks, t]);

  const planned = useMemo(
    () =>
      planNotifications({
        morning:
          ritualsEnabled && morningConfig.enabled
            ? {
                time: morningConfig.time,
                title: t('Morning Ritual'),
                body: t('Prends deux minutes pour cadrer ta journée.'),
                route: '/morning-ritual',
              }
            : undefined,
        evening:
          ritualsEnabled && eveningConfig.enabled
            ? {
                time: eveningConfig.time,
                title: t('Evening Wrap'),
                body: t('Fais le bilan avant de couper.'),
                route: '/evening-wrap',
              }
            : undefined,
        blocks: blockReminders,
        blockEnds,
        leadMinutes: blockLeadMinutes,
      }),
    [
      ritualsEnabled,
      morningConfig.enabled,
      morningConfig.time,
      eveningConfig.enabled,
      eveningConfig.time,
      blockReminders,
      blockEnds,
      blockLeadMinutes,
      t,
    ]
  );

  const lastSignature = useRef<string | null>(null);

  useEffect(() => {
    if (!permissionGranted) {
      lastSignature.current = null;
      void cancelOwnedNotifications();
      return;
    }

    const signature = `${language}~${planSignature(planned)}`;
    if (lastSignature.current === signature) return;
    lastSignature.current = signature;
    void syncPlannedNotifications(planned);
  }, [permissionGranted, planned, language]);

  const pomodoroDoneTitle = t('Pomodoro terminé');
  const pomodoroDoneBody = t('breakReady', { minutes: BREAK_SECONDS / 60 });
  const breakDoneTitle = t('Pause terminée');
  const breakDoneBody = t('focusReady', { minutes: POMODORO_SECONDS / 60 });

  const isActive = focusState.isActive;
  const isBreak = focusState.isBreak;
  const currentTaskId = focusState.currentTaskId;

  useEffect(() => {
    if (!focusEnabled || !permissionGranted || !isActive) {
      void cancelFocusAlert();
      return;
    }

    const remaining = useFocusStore.getState().focusState.timeRemaining;
    void scheduleFocusAlert(
      remaining,
      isBreak ? breakDoneTitle : pomodoroDoneTitle,
      isBreak ? breakDoneBody : pomodoroDoneBody
    );
  }, [
    focusEnabled,
    permissionGranted,
    isActive,
    isBreak,
    currentTaskId,
    pomodoroDoneTitle,
    pomodoroDoneBody,
    breakDoneTitle,
    breakDoneBody,
  ]);

  useEffect(() => {
    const record = async (event: NotificationEvent) => {
      const entry = blockLogFromResponse(event.actionIdentifier, event.data, event.firedAt);
      if (!entry) return false;
      await waitForHydration(useBlockLogStore);
      useBlockLogStore.getState().setStatus(entry);
      return true;
    };

    const launch = takeLaunchResponse();
    if (launch) void record(launch);

    return addNotificationResponseListener((event) => {
      void record(event).then((recorded) => {
        const route = event.data.route;
        if (!recorded && event.isDefaultAction && typeof route === 'string') router.push(route);
      });
    });
  }, [router]);
}
