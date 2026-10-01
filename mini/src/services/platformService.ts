/** Keeps browser, Tauri desktop, and Android-specific capability behind one boundary. */
export const platformService = {
  async selectAttachment(): Promise<File | null> {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*,.pdf";
    return new Promise((resolve) => {
      input.onchange = () => resolve(input.files?.[0] ?? null);
      input.click();
    });
  },
  notify(title: string, body: string) {
    if ("Notification" in window && Notification.permission === "granted")
      new Notification(title, { body });
  },
};
