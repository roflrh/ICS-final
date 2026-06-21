import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "src/context/CartContext";
import Header from "src/components/Header";
import Sidebar from "src/components/Sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "바이브 딜리버리 | 실시간 배달 주문 서비스",
  description: "Next.js 풀스택과 PostgreSQL을 연동하여 개발 및 배포된 기말 프로젝트 배달 웹 애플리케이션입니다.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <CartProvider>
          <Header />
          <div className="main-layout">
            <Sidebar />
            <main className="main-content">
              {children}
            </main>
          </div>
        </CartProvider>
      </body>
    </html>
  );
}
