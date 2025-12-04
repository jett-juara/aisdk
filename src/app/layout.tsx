import type React from "react";
import type { Metadata } from "next";
import Script from "next/script";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/about/theme-provider";
import { ThemePreload } from "@/components/theme-preload";

import "./globals.css";

// Google fonts dinonaktifkan di environment ini (offline build-safe).
const fallbackFont = { variable: "" };
const montserrat = fallbackFont;
const rubik = fallbackFont;
const manrope = fallbackFont;
const jetbrainsMono = fallbackFont;
const montaguSlab = fallbackFont;
const albertSans = fallbackFont;
const instrumentSans = fallbackFont;
const funnelDisplay = fallbackFont;

export const metadata: Metadata = {
  title: "JETT – AI Event Management Assistant",
  description: "Professional event management with AI technology.",
  keywords: ["event management", "JUARA", "AI assistant", "off the grid events"],
  openGraph: {
    title: "JETT – AI Event Management Assistant",
    description: "Professional event management with AI technology.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "JETT – AI Event Management Assistant",
    description: "Professional event management with AI technology.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${montserrat.variable} ${rubik.variable} ${manrope.variable} ${jetbrainsMono.variable} ${montaguSlab.variable} ${albertSans.variable} ${instrumentSans.variable} ${funnelDisplay.variable}`}
      suppressHydrationWarning
    >
      <head>
        <ThemePreload />
        {process.env.NODE_ENV === "development" && (
          <Script
            src="//unpkg.com/react-grab/dist/index.global.js"
            crossOrigin="anonymous"
            strategy="beforeInteractive"
            data-enabled="true"
          />
        )}
      </head>
      <body className="bg-background font-rubik antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
