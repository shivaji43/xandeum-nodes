import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Analytics } from "@vercel/analytics/next"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Xandeum Explorer",
  description: "Xandeum pNode Explorer",
};

import { AppSidebar } from "@/components/AppSidebar";
import { WalletContextProvider } from "@/components/WalletContextProvider";

import { NetworkProvider } from "@/components/NetworkContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          themes={["light", "dark", "xandeum"]}
        >
          <NetworkProvider>
            <WalletContextProvider>
              <div className="flex h-screen overflow-hidden">
                <AppSidebar />
                <main className="flex-1 overflow-y-auto bg-background">
                  {children}
                  <Analytics />
                </main>
              </div>
            </WalletContextProvider>
          </NetworkProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
