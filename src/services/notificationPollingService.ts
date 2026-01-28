import { getNotifications, getUnreadNotificationCount } from './notificationService';
import { showPushNotification, getNotificationDetails } from './pushNotificationService';
import { Notification } from '../types/notification.types';

let lastNotificationCount = 0;
let lastCheckedNotifications: string[] = [];
let pollingInterval: NodeJS.Timeout | null = null;

export function startNotificationPolling(userId: string) {
  // Clear any existing interval
  if (pollingInterval) {
    clearInterval(pollingInterval);
  }

  // Initial check
  checkForNewNotifications(userId);

  // Poll every 10 seconds
  pollingInterval = setInterval(() => {
    checkForNewNotifications(userId);
  }, 10000);

  console.log('✅ Notification polling started for user:', userId);
}

export function stopNotificationPolling() {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
    console.log('✅ Notification polling stopped');
  }
}

async function checkForNewNotifications(userId: string) {
  try {
    // Get all notifications
    const notifications = await getNotifications(userId);
    // @ts-ignore - read field may not exist on all notification objects
    const unreadNotifications = notifications.filter(n => !n.is_read && !n.read);

    // Check if there are new notifications
    const newNotifications = unreadNotifications.filter(
      n => !lastCheckedNotifications.includes(n.id)
    );

    if (newNotifications.length > 0) {
      console.log(`🔔 Found ${newNotifications.length} new notifications`);

      // Show push notification for each new notification
      for (const notification of newNotifications) {
        const details = getNotificationDetails(notification.type);
        
        await showPushNotification(
          details.title,
          notification.message,
          {
            notificationId: notification.id,
            type: notification.type,
            data: notification.data,
          }
        );
      }

      // Update tracked notifications
      lastCheckedNotifications = unreadNotifications.map(n => n.id);
    }

    lastNotificationCount = unreadNotifications.length;
  } catch (error) {
    console.error('❌ Error checking for new notifications:', error);
  }
}

export function resetNotificationTracking() {
  lastCheckedNotifications = [];
  lastNotificationCount = 0;
}

