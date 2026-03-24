import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Game Scheduler",
  description: "게임 일정을 친구들과 함께 관리하세요",
  openGraph: {
    title: "Game Scheduler",
    description: "게임 일정을 친구들과 함께 관리하세요",
    images: [{ url: "/og-image.jpg", width: 1546, height: 423 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Game Scheduler",
    description: "게임 일정을 친구들과 함께 관리하세요",
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
