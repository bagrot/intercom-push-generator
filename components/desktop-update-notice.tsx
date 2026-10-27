"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type UpdateState = Awaited<ReturnType<NonNullable<Window["desktopUpdates"]>["check"]>>;

export function DesktopUpdateNotice() {
  const [state, setState] = useState<UpdateState | null>(null);
  const [checking, setChecking] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const check = useCallback(async (showResult = false) => {
    if (!window.desktopUpdates) return;
    if (showResult) setDialogOpen(true);
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
    if (dialogOpen && !dialogRef.current?.open) dialogRef.current?.showModal();
  }, [dialogOpen]);

  useEffect(() => {
    if (!window.desktopUpdates) return;
    void check();
    const timer = window.setInterval(() => void check(), 6 * 60 * 60 * 1000);
    return () => window.clearInterval(timer);
  }, [check]);

  if (typeof window === "undefined" || !window.desktopUpdates) return null;
  return <>
    <div className={`desktop-update ${state?.status === "update" ? "has-update" : ""}`}>
      <span>Версия {state?.currentVersion || "…"}</span>
      <button type="button" onClick={() => { if (checking) setDialogOpen(true); else void check(true); }} aria-label="Проверить обновления и показать результат">
        {state?.status === "update" ? "Доступно обновление" : "Проверить обновления"}
      </button>
    </div>
    {dialogOpen && createPortal(
      <dialog ref={dialogRef} className="desktop-update-dialog" onClose={() => setDialogOpen(false)} onClick={(event) => { if (event.target === event.currentTarget) event.currentTarget.close(); }} aria-labelledby="desktop-update-title">
        <div className="desktop-update-dialog-content">
          <span className="desktop-update-dialog-icon" aria-hidden="true">{checking ? "…" : state?.status === "update" ? "↑" : state?.status === "current" ? "✓" : "!"}</span>
          <h2 id="desktop-update-title">{checking ? "Проверяем обновления" : state?.status === "update" ? "Доступна новая версия" : state?.status === "current" ? "Обновлений нет" : "Не удалось проверить обновления"}</h2>
          <p role="status">{checking ? "Подключаемся к GitHub…" : state?.status === "update" ? `Установлена версия ${state.currentVersion}. Можно скачать версию ${state.latestVersion}.` : state?.status === "current" ? `У вас установлена актуальная версия ${state.currentVersion}.` : state?.message || "Попробуйте ещё раз позже."}</p>
          <div className="desktop-update-dialog-actions">
            {state?.status === "update" && !checking && <button type="button" className="desktop-update-primary" onClick={() => void window.desktopUpdates?.download()}>Скачать обновление</button>}
            <button type="button" className="desktop-update-secondary" onClick={() => dialogRef.current?.close()}>Закрыть</button>
          </div>
        </div>
      </dialog>, document.body
    )}
  </>;
}
