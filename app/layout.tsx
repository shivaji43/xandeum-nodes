import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Analytics } from "@vercel/analytics/next"
import { AppSidebar } from "@/components/AppSidebar";
import { WalletContextProvider } from "@/components/WalletContextProvider";
import { NetworkProvider } from "@/components/NetworkContext";
import { SpeedInsights } from "@vercel/speed-insights/next"

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
  title: {
    default: "Xandeum pNode Explorer",
    template: "%s | Xandeum Explorer",
  },
  description: "Explore the Xandeum network, monitor pNode status, check leaderboard rankings, and track network health in real-time.",
  applicationName: "Xandeum Explorer",
  authors: [{ name: "Xandeum Team", url: "https://xandeum.com" }],
  generator: "Next.js",
  keywords: ["Xandeum", "Solana", "Storage", "Nodes", "Explorer", "Crypto", "Blockchain", "pNode", "DePIN"],
  referrer: "origin-when-cross-origin",
  creator: "Xandeum",
  publisher: "Xandeum",
  metadataBase: new URL("https://xandeum-pnode-explorer.vercel.app"),
  openGraph: {
    title: "Xandeum pNode Explorer",
    description: "Real-time monitoring and analytics for the Xandeum storage network.",
    url: "https://xandeum-pnode-explorer.vercel.app",
    siteName: "Xandeum Explorer",
    images: [
      {
        url: "/og-image.png", 
        width: 1200,
        height: 630,
        alt: "Xandeum Explorer Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Xandeum pNode Explorer",
    description: "Monitor Xandeum pNodes, track network stats, and view leaderboards.",
    creator: "@Xandeum",    // Assuming this is the handle
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
  },
};

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
                  <SpeedInsights />
                </main>
              </div>
            </WalletContextProvider>
          </NetworkProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
