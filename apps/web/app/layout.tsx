import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { QueryProvider } from "@/lib/providers";
import { StoreProvider } from "@/components/provider/StoreProvider";
import { MuiProvider } from "@/components/provider/MuiProvider";
import { EmotionCacheProvider } from "@/lib/emotion-cache";
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
  title: "Danmaku",
  description: "ドライブの動画にリアルタイムでコメントを表示できるプラットフォーム",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="ja"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <StoreProvider>
          <QueryProvider>
            <EmotionCacheProvider>
              <MuiProvider>
                {children}
              </MuiProvider>
            </EmotionCacheProvider>
          </QueryProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
