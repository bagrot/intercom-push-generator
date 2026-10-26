import React from "react";
import { createRoot } from "react-dom/client";
import RoundsGenerator from "../vendor/rounds/app/app/page.js";
import { DesktopUpdateNotice } from "../components/desktop-update-notice";
import "./styles.css";

function DesktopRounds() {
  const isDesktop = Boolean(window.desktopUpdates);
  return (
    <>
      <header className="rounds-profile-bar">
        <div className="rounds-profile-bar-inner">
          <div className="rounds-profile-brand"><span className="rounds-profile-logo">ЭД</span><span>Электронный дом</span></div>
          <div className="rounds-profile-actions"><span className="rounds-profile-current"><span className="rounds-profile-dot" />Сейчас: Обходы</span><a href="/">Сменить профиль</a>{isDesktop && <DesktopUpdateNotice />}</div>
        </div>
      </header>
      <div className="rounds-app">
        <div className="rounds-intro"><span>ОБХОДЫ</span><h1>Генератор уведомлений</h1><p>Выберите ситуацию, вставьте данные из таблицы и подготовьте тексты для публикации.</p></div>
        <RoundsGenerator />
      </div>
    </>
  );
}

createRoot(document.getElementById("root")).render(<DesktopRounds />);
