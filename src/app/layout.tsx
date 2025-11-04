import type React from "react";
import type { Metadata } from "next";
import {
  Montserrat,
  Raleway,
  Rubik,
  Manrope,
  JetBrains_Mono,
  Montagu_Slab,
} from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemePreload } from "@/components/theme-preload";

import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-montserrat",
  display: "swap",
});

const raleway = Raleway({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-raleway",
  display: "swap",
});

const rubik = Rubik({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-rubik",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
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
  weight: ["400", "700"],
  variable: "--font-montagu-slab",
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
      className={`${montserrat.variable} ${raleway.variable} ${rubik.variable} ${manrope.variable} ${jetbrainsMono.variable} ${montaguSlab.variable}`}
      suppressHydrationWarning
    >
      <head>
        <link rel="preload" href="/images/hero_03-medium.webp" as="image" type="image/webp" />
        <ThemePreload />
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
