import type React from "react";
import type { Metadata } from "next";
import Script from "next/script";
import {
  Montserrat,
  Rubik,
  Manrope,
  JetBrains_Mono,
  Montagu_Slab,
  Albert_Sans,
  Instrument_Sans,
} from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/about/theme-provider";
import { ThemePreload } from "@/components/theme-preload";

import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: [
    "100",
    "200",
    "300",
    "400",
    "500",
    "600",
    "700",
    "800",
    "900",
  ],
  style: ["normal", "italic"],
  variable: "--font-montserrat",
  display: "swap",
});


const rubik = Rubik({
  subsets: ["latin"],
  weight: [
    "300",
    "400",
    "500",
    "600",
    "700",
    "800",
    "900",
  ],
  style: ["normal", "italic"],
  variable: "--font-rubik",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  variable: "--font-manrope",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

const montaguSlab = Montagu_Slab({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-montagu-slab",
  display: "swap",
});

const albertSans = Albert_Sans({
  subsets: ["latin"],
  weight: ["100","200","300","400","500","600","700","800","900"],
  style: ["normal","italic"],
  variable: "--font-albert-sans",
  display: "swap",
});

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-instrument-sans",
  display: "swap",
});

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
      className={`${montserrat.variable} ${rubik.variable} ${manrope.variable} ${jetbrainsMono.variable} ${montaguSlab.variable} ${albertSans.variable} ${instrumentSans.variable}`}
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
