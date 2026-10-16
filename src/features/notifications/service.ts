import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { BlockStatus } from '../../types/blockLog';
import { BLOCK_END_ACTIONS } from './blockEnd';
import {
  BLOCK_END_CATEGORY,
  FOCUS_ID,
  OWNED_PREFIX,
  PlannedNotification,
  toExpoWeekday,
} from './schedule';

const ANDROID_CHANNEL_ID = 'flowday-reminders';

const supported = Platform.OS === 'ios' || Platform.OS === 'android';

let configured = false;

export interface NotificationEvent {
  actionIdentifier: string;
  isDefaultAction: boolean;
  data: Record<string, unknown>;
  firedAt: Date;
}

export function configureNotifications(
  shouldShow: (data: Record<string, unknown>) => boolean = () => true
): void {
  if (!supported || configured) return;
  configured = true;

  Notifications.setNotificationHandler({
    handleNotification: async (notification) => {
      const show = shouldShow(notification.request.content.data ?? {});
      return {
        shouldShowBanner: show,
        shouldShowList: show,
        shouldPlaySound: show,
        shouldSetBadge: false,
      };
    },
  });

  if (Platform.OS === 'android') {
    void Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
      name: 'Flowday',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250],
    });
  }
}

export async function getPermissionGranted(): Promise<boolean> {
  if (!supported) return false;
  const { granted } = await Notifications.getPermissionsAsync();
  return granted;
}

export async function requestPermission(): Promise<boolean> {
  if (!supported) return false;
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  const { granted } = await Notifications.requestPermissionsAsync();
  return granted;
}

function triggerFor(
  notification: PlannedNotification
): Notifications.NotificationTriggerInput {
  const channelId = Platform.OS === 'android' ? ANDROID_CHANNEL_ID : undefined;
  if (notification.trigger.kind === 'daily') {
    return {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: notification.trigger.hour,
      minute: notification.trigger.minute,
      channelId,
    };
  }
  return {
    type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
    weekday: toExpoWeekday(notification.trigger.weekday),
    hour: notification.trigger.hour,
    minute: notification.trigger.minute,
    channelId,
  };
}

export async function syncPlannedNotifications(
  planned: PlannedNotification[]
): Promise<void> {
  if (!supported) return;

  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled
      .filter(
        (item) =>
          item.identifier.startsWith(OWNED_PREFIX) && item.identifier !== FOCUS_ID
      )
      .map((item) => Notifications.cancelScheduledNotificationAsync(item.identifier))
  );

  for (const notification of planned) {
    await Notifications.scheduleNotificationAsync({
      identifier: notification.id,
      content: {
        title: notification.title,
        body: notification.body,
        data: { ...notification.data, ...(notification.route ? { route: notification.route } : {}) },
        categoryIdentifier: notification.categoryId,
      },
      trigger: triggerFor(notification),
    });
  }
}

export async function countOwnedNotifications(): Promise<number> {
  if (!supported) return 0;
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  return scheduled.filter(
    (item) => item.identifier.startsWith(OWNED_PREFIX) && item.identifier !== FOCUS_ID
  ).length;
}

export async function cancelOwnedNotifications(): Promise<void> {
  if (!supported) return;
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled
      .filter((item) => item.identifier.startsWith(OWNED_PREFIX))
      .map((item) => Notifications.cancelScheduledNotificationAsync(item.identifier))
  );
}

export async function scheduleFocusAlert(
  seconds: number,
  title: string,
  body: string
): Promise<void> {
  if (!supported) return;
  await cancelFocusAlert();
  if (!Number.isFinite(seconds) || seconds < 1) return;
  await Notifications.scheduleNotificationAsync({
    identifier: FOCUS_ID,
    content: { title, body, data: { route: '/focus' } },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: Math.round(seconds),
      channelId: Platform.OS === 'android' ? ANDROID_CHANNEL_ID : undefined,
    },
  });
}

export async function cancelFocusAlert(): Promise<void> {
  if (!supported) return;
  await Notifications.cancelScheduledNotificationAsync(FOCUS_ID).catch(() => {});
}

export async function registerBlockEndCategory(
  labels: Record<BlockStatus, string>
): Promise<void> {
  if (!supported) return;
  await Notifications.setNotificationCategoryAsync(
    BLOCK_END_CATEGORY,
    BLOCK_END_ACTIONS.map((status) => ({
      identifier: status,
      buttonTitle: labels[status],
    }))
  );
}

function toEvent(response: Notifications.NotificationResponse): NotificationEvent {
  return {
    actionIdentifier: response.actionIdentifier,
    isDefaultAction: response.actionIdentifier === Notifications.DEFAULT_ACTION_IDENTIFIER,
    data: response.notification.request.content.data ?? {},
    firedAt: new Date(response.notification.date),
  };
}

export function takeLaunchResponse(): NotificationEvent | null {
  if (!supported) return null;
  const response = Notifications.getLastNotificationResponse();
  if (!response) return null;
  Notifications.clearLastNotificationResponse();
  return toEvent(response);
}

export function addNotificationResponseListener(
  onResponse: (event: NotificationEvent) => void
): () => void {
  if (!supported) return () => {};
  const subscription = Notifications.addNotificationResponseReceivedListener(
    (response) => {
      Notifications.clearLastNotificationResponse();
      onResponse(toEvent(response));
    }
  );
  return () => subscription.remove();
}
