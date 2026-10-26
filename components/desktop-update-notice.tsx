"use client";

import { useCallback, useEffect, useState } from "react";

type UpdateState = Awaited<ReturnType<NonNullable<Window["desktopUpdates"]>["check"]>>;

export function DesktopUpdateNotice() {
  const [state, setState] = useState<UpdateState | null>(null);
  const [checking, setChecking] = useState(false);
  const check = useCallback(async () => {
    if (!window.desktopUpdates) return;
    setChecking(true);
    try {
      setState(await window.desktopUpdates.check());
    } catch {
      setState((previous) => ({ status: "unavailable", currentVersion: previous?.currentVersion ?? "", message: "Не удалось проверить обновления." }));
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    if (!window.desktopUpdates) return;
    void check();
    const timer = window.setInterval(() => void check(), 6 * 60 * 60 * 1000);
    return () => window.clearInterval(timer);
  }, [check]);

  if (typeof window === "undefined" || !window.desktopUpdates) return null;
  return <div className={`desktop-update ${state?.status === "update" ? "has-update" : ""}`} role="status">
    <span>Версия {state?.currentVersion ?? "…"}</span>
    {state?.status === "update" ? <><strong>Доступна {state.latestVersion}</strong><button type="button" onClick={() => void window.desktopUpdates?.download()}>Скачать обновление</button></>
      : <button type="button" onClick={() => void check()} disabled={checking}>{checking ? "Проверяю…" : "Проверить обновления"}</button>}
    {state?.status === "unavailable" && <small>{state.message}</small>}
  </div>;
}
