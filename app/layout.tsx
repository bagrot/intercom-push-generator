import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Генератор пушей — домофоны и шлагбаумы",
  description: "Подготовка новостей и пуш-уведомлений по домофонам и шлагбаумам",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className="antialiased">{children}</body>
    </html>
  );
}
