// Sound notification utilities
export function playNotificationSound(
  type:
    | "success"
    | "warning"
    | "error"
    | "BUDGET_ALERT"
    | "GOAL_REMINDER"
    | "TRANSACTION_ALERT" = "warning",
) {
  // Only play sound if user hasn't disabled it
  const soundEnabled = localStorage.getItem("notification-sound") !== "false";

  if (!soundEnabled || typeof window === "undefined") return;

  try {
    // Create audio context
    const audioContext = new (
      window.AudioContext || (window as any).webkitAudioContext
    )();

    // Create oscillator for different notification types
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Configure sound based on type
    switch (type) {
      case "success":
      case "GOAL_REMINDER": // Goal reminders are positive
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(
          600,
          audioContext.currentTime + 0.1,
        );
        break;
      case "error":
      case "BUDGET_ALERT": // Budget alerts are warnings/errors
        oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(
          200,
          audioContext.currentTime + 0.2,
        );
        break;
      default:
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(
          400,
          audioContext.currentTime + 0.15,
        );
        break;
    }

    // Configure envelope
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + 0.3,
    );

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  } catch (error) {
    console.warn("Could not play notification sound:", error);
  }
}

export function vibrate(pattern: number | number[] = 200) {
  if ("vibrate" in navigator) {
    navigator.vibrate(pattern);
  }
}

export function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!("Notification" in window)) {
    return Promise.resolve("denied");
  }

  if (Notification.permission === "granted") {
    return Promise.resolve("granted");
  }

  if (Notification.permission === "denied") {
    return Promise.resolve("denied");
  }

  return Notification.requestPermission();
}

export function showBrowserNotification(
  title: string,
  options?: NotificationOptions,
) {
  if (Notification.permission === "granted") {
    return new Notification(title, {
      icon: "/icons/icon-192x192.png",
      badge: "/icons/icon-192x192.png",
      ...options,
    });
  }
  return null;
}
