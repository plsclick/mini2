export const nativeNotificationService = {
  async send(title: string, body: string) {
    if ("Notification" in window && Notification.permission === "default")
      await Notification.requestPermission();
    if ("Notification" in window && Notification.permission === "granted")
      new Notification(title, { body });
  },
};
