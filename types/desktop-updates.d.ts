export {};

type DesktopUpdateResult =
  | { status: "current"; currentVersion: string; latestVersion: string }
  | { status: "update"; currentVersion: string; latestVersion: string; releaseUrl: string }
  | { status: "unavailable"; currentVersion: string; message: string };

declare global {
  interface Window {
    desktopUpdates?: {
      version: () => Promise<string>;
      check: () => Promise<DesktopUpdateResult>;
      download: () => Promise<boolean>;
      releases: () => Promise<boolean>;
    };
  }
}
