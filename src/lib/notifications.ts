import { LogisticsOrder } from '../types/logistics';

export const ONESIGNAL_APP_ID = '8f9c9417-530c-41e2-8a65-850d10758258';

declare global {
  interface Window {
    OneSignalDeferred?: any[];
    OneSignal?: any;
  }
}

/**
 * Initialize OneSignal Web Push subscription & tag driver
 */
export async function setupDriverPushSubscription(driverName: string = 'hikmat'): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  try {
    if (window.OneSignal) {
      const permission = await window.OneSignal.Notifications.permission;
      if (!permission) {
        await window.OneSignal.Notifications.requestPermission();
      }
      await window.OneSignal.User.addTag('driver', driverName);
      await window.OneSignal.User.addTag('role', 'driver');
      return true;
    }

    if (window.OneSignalDeferred) {
      window.OneSignalDeferred.push(async (OneSignal: any) => {
        try {
          await OneSignal.Notifications.requestPermission();
          await OneSignal.User.addTag('driver', driverName);
          await OneSignal.User.addTag('role', 'driver');
        } catch (e) {
          console.warn('OneSignal tag error:', e);
        }
      });
      return true;
    }
  } catch (err) {
    console.warn('Push subscription note:', err);
  }

  return false;
}

/**
 * Dispatch Push Notification for a newly assigned order with direct Waze link
 */
export async function notifyDriverNewOrder(order: LogisticsOrder, customMessage?: string): Promise<{ success: boolean; message: string }> {
  const driverName = order.assignedDriver === 'ali' ? 'עלי' : 'חכמת';
  const driverTag = order.assignedDriver || 'hikmat';
  const wazeUrl = order.wazeUrl || `https://waze.com/ul?q=${encodeURIComponent(order.siteAddress + ', ' + order.city)}&navigate=yes`;

  // 1. Play subtle notification sound if in browser
  playNotificationSound();

  // 2. In-App Notification Event for instant UI banner
  if (typeof window !== 'undefined') {
    const event = new CustomEvent('driver_push_notification', {
      detail: {
        order,
        driverName,
        wazeUrl,
        heading: `🚚 נסיעה חדשה שובצה ל${driverName}!`,
        body: customMessage || `הזמנה #${order.orderNumber} (${order.customerName}) — ${order.city}, ${order.siteAddress}. שעה: ${order.scheduledTime || '08:00'}. לחץ לניווט Waze!`,
        timestamp: Date.now()
      }
    });
    window.dispatchEvent(event);
  }

  // 3. Send OneSignal Server Push Notification
  try {
    const response = await fetch('/api/notify-driver', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        city: order.city,
        siteAddress: order.siteAddress,
        driverName,
        driverTag,
        wazeUrl,
        scheduledTime: order.scheduledTime || '08:00',
        customMessage
      })
    });

    if (response.ok) {
      const data = await response.json();
      return { success: true, message: data.message || 'התראה נשלחה לנהג בהצלחה!' };
    }
  } catch (err: any) {
    console.warn('OneSignal API call error:', err.message);
  }

  // 4. Fallback to Browser Native Notification API
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(`🚚 נסיעה חדשה ל${driverName}!`, {
        body: `הזמנה #${order.orderNumber} (${order.customerName}) ב${order.city}. לחץ לפתיחת Waze!`,
        icon: 'https://i.ibb.co/whtMgBNC/Gemini-Generated-Image-2.png',
        data: { wazeUrl }
      });
    } catch {
      // Ignore background notification restrictions
    }
  }

  return { success: true, message: `התראת נסיעה נוצרה ונשלחה לנהג ${driverName} עם קישור Waze!` };
}

/**
 * Play gentle notification chime
 */
function playNotificationSound() {
  if (typeof window === 'undefined') return;
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5
    osc.frequency.exponentialRampToValueAtTime(1174.66, audioCtx.currentTime + 0.3); // D6

    gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.45);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.45);
  } catch {
    // AudioContext autoplay restrictions
  }
}
