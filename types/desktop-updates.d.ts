export {};

type DesktopUpdateResult =
  | { status: "current"; currentVersion: string; latestVersion: string }
  | { status: "update"; currentVersion: string; latestVersion: string; releaseUrl: string; releaseNotes: string }
  | { status: "unavailable"; currentVersion: string; message: string };

declare global {
  interface Window {
    desktopUpdates?: {
      version: () => Promise<string>;
      check: () => Promise<DesktopUpdateResult>;
      install: () => Promise<{ ok: boolean; message?: string }>;
      onProgress: (callback: (progress: { phase: "downloading" | "verifying" | "launching"; percent: number }) => void) => () => void;
      releases: () => Promise<boolean>;
    };
  }
}
