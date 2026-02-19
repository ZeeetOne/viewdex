import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/components/providers";
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
  title: {
    default: "ViewDex - Track Your Media",
    template: "%s | ViewDex",
  },
  description:
    "Track your anime, manga, manhwa, and donghua progress. Keep notes, rate your favorites, and never lose track of what you're watching or reading.",
  keywords: ["anime", "manga", "manhwa", "donghua", "tracker", "watchlist"],
  authors: [{ name: "ViewDex" }],
  creator: "ViewDex",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "ViewDex",
    title: "ViewDex - Track Your Media",
    description:
      "Track your anime, manga, manhwa, and donghua progress. Keep notes, rate your favorites, and never lose track.",
  },
  twitter: {
    card: "summary_large_image",
    title: "ViewDex - Track Your Media",
    description:
      "Track your anime, manga, manhwa, and donghua progress.",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ViewDex",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <Providers>
          {children}
          <Toaster position="top-center" richColors closeButton />
        </Providers>
      </body>
    </html>
  );
}
