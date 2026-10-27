"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type UpdateState = Awaited<ReturnType<NonNullable<Window["desktopUpdates"]>["check"]>>;

export function DesktopUpdateNotice() {
  const [state, setState] = useState<UpdateState | null>(null);
  const [checking, setChecking] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [installProgress, setInstallProgress] = useState<{ phase: "downloading" | "verifying" | "launching"; percent: number } | null>(null);
  const [installError, setInstallError] = useState("");
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

  useEffect(() => window.desktopUpdates?.onProgress(setInstallProgress), []);

  const install = async () => {
    if (!window.desktopUpdates || installing) return;
    setInstalling(true);
    setInstallError("");
    setInstallProgress({ phase: "downloading", percent: 0 });
    try {
      const result = await window.desktopUpdates.install();
      if (!result.ok) throw new Error(result.message || "Не удалось установить обновление.");
    } catch (error) {
      setInstallError(error instanceof Error ? error.message : "Не удалось установить обновление. Попробуйте ещё раз.");
      setInstalling(false);
    }
  };

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
      <dialog ref={dialogRef} className="desktop-update-dialog" onClose={() => setDialogOpen(false)} onCancel={(event) => { if (installing) event.preventDefault(); }} onClick={(event) => { if (!installing && event.target === event.currentTarget) event.currentTarget.close(); }} aria-labelledby="desktop-update-title">
        <div className="desktop-update-dialog-content">
          <span className="desktop-update-dialog-icon" aria-hidden="true">{checking ? "…" : state?.status === "update" ? "↑" : state?.status === "current" ? "✓" : "!"}</span>
          <h2 id="desktop-update-title">{checking ? "Проверяем обновления" : state?.status === "update" ? "Доступна новая версия" : state?.status === "current" ? "Обновлений нет" : "Не удалось проверить обновления"}</h2>
          <p role="status">{checking ? "Проверяем Яндекс Диск…" : state?.status === "update" ? `Установлена версия ${state.currentVersion}. Можно скачать версию ${state.latestVersion}.` : state?.status === "current" ? `У вас установлена актуальная версия ${state.currentVersion}.` : state?.message || "Попробуйте ещё раз позже."}</p>
          {state?.status === "update" && !checking && <>
            <div className="desktop-update-notes"><strong>Что изменится</strong><div>{state.releaseNotes}</div></div>
            <p className="desktop-update-install-hint">После загрузки приложение запустит установщик и закроется. Ваши локальные данные сохранятся.</p>
          </>}
          {installing && <div className="desktop-update-progress" role="status"><span>{installProgress?.phase === "verifying" ? "Проверяем установщик…" : installProgress?.phase === "launching" ? "Запускаем установку…" : `Загрузка: ${installProgress?.percent ?? 0}%`}</span><progress max="100" value={installProgress?.percent ?? 0} /></div>}
          {installError && <p className="desktop-update-error" role="alert">{installError}</p>}
          <div className="desktop-update-dialog-actions">
            {state?.status === "update" && !checking && <button type="button" className="desktop-update-primary" disabled={installing} onClick={() => void install()}>{installing ? "Подготовка установки…" : "Скачать и установить"}</button>}
            <button type="button" className="desktop-update-secondary" disabled={installing} onClick={() => dialogRef.current?.close()}>Закрыть</button>
          </div>
        </div>
      </dialog>, document.body
    )}
  </>;
}
