import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import {
  FOCUS_ID,
  OWNED_PREFIX,
  PlannedNotification,
  toExpoWeekday,
} from './schedule';

const ANDROID_CHANNEL_ID = 'flowday-reminders';

/** Local notifications are not available on the web build. */
const supported = Platform.OS === 'ios' || Platform.OS === 'android';

let configured = false;

export function configureNotifications(): void {
  if (!supported || configured) return;
  configured = true;

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
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

/**
 * Asks the system for permission, returning whether we ended up with it.
 * Safe to call when already granted: the OS resolves without a prompt.
 */
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

/**
 * Replaces every reminder we own with `planned`, leaving the pending focus
 * alert and any notification we did not create untouched.
 */
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
        data: notification.route ? { route: notification.route } : undefined,
      },
      trigger: triggerFor(notification),
    });
  }
}

/** How many reminders we currently own, used as feedback in Settings. */
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

/**
 * Fires once when the running pomodoro or break ends. This is what keeps the
 * timer useful after the app goes to the background and the JS timer stops.
 */
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

export function addNotificationTapListener(
  onRoute: (route: string) => void
): () => void {
  if (!supported) return () => {};
  const subscription = Notifications.addNotificationResponseReceivedListener(
    (response) => {
      const route = response.notification.request.content.data?.route;
      if (typeof route === 'string') onRoute(route);
    }
  );
  return () => subscription.remove();
}
