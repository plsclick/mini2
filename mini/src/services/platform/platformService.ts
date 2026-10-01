export type PlatformKind = "web" | "desktop" | "android";
export const platformService = {
  kind: (): PlatformKind =>
    navigator.userAgent.toLowerCase().includes("android")
      ? "android"
      : "__TAURI_INTERNALS__" in window
        ? "desktop"
        : "web",
  isNative: () => "__TAURI_INTERNALS__" in window,
};
