import type React from "react"
import type { Metadata } from "next"
import { Montserrat, Raleway, Rubik, Manrope, JetBrains_Mono, Montagu_Slab } from "next/font/google"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-montserrat",
})

const raleway = Raleway({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-raleway",
})

const rubik = Rubik({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-rubik",
})

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-manrope",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-jetbrains-mono",
})

const montaguSlab = Montagu_Slab({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-montagu-slab",
})

export const metadata: Metadata = {
  title: "Jett - Auth",
  description: "Jett Authentication",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${montserrat.variable} ${raleway.variable} ${rubik.variable} ${manrope.variable} ${jetbrainsMono.variable} ${montaguSlab.variable}`}
    >
      <body className="bg-[#0a0a0a] font-rubik antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  )
}
