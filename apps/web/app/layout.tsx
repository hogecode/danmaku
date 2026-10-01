import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { QueryProvider } from "@/lib/providers";
import { StoreProvider } from "@/components/provider/StoreProvider";
import { MuiProvider } from "@/components/provider/MuiProvider";
import { ThemeContextProvider } from "@/lib/theme-context";
import { EmotionCacheProvider } from "@/lib/emotion-cache";
import { SentryErrorBoundary } from "@/components/error/SentryErrorBoundary";
import "./globals.css";
import "./sentry-client-init";

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
        <SentryErrorBoundary>
          <StoreProvider>
            <QueryProvider>
              <ThemeContextProvider initialTheme="light">
                <EmotionCacheProvider>
                  <MuiProvider>
                    {children}
                  </MuiProvider>
                </EmotionCacheProvider>
              </ThemeContextProvider>
            </QueryProvider>
          </StoreProvider>
        </SentryErrorBoundary>
      </body>
    </html>
  );
}
