/**
 * Web Notifications API utility with permission handling
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    return false;
  }
  if (Notification.permission === 'granted') {
    return true;
  }
  if (Notification.permission !== 'denied') {
    const result = await Notification.requestPermission();
    return result === 'granted';
  }
  return false;
}

export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission;
}

export function sendNotification(title: string, body: string, icon = '/icon.svg') {
  if (!isNotificationSupported()) return;
  if (Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        icon,
        badge: '/icon.svg',
        vibrate: [200, 100, 200],
        tag: 'pomodoro-notification',
      } as NotificationOptions);
    } catch {
      // Fallback or mobile limitation
    }
  }
}
