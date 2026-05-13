import type { Metadata } from "next";
import { Inter, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import IntroGate from "@/components/IntroGate";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mohab Tohamy — frontend engineer",
  description:
    "I build the unglamorous software that makes engineering data usable. React, Next.js, and a lot of Python. Riyadh → Austria, 2026.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${inter.variable} ${instrumentSerif.variable} ${jetbrainsMono.variable} antialiased min-h-screen grain`}
      >
        <IntroGate />
        <Navigation />
        <main className="pt-16">{children}</main>
        <footer className="border-t border-[var(--hairline)] mt-24 py-10">
          <div className="max-w-6xl mx-auto px-6 flex flex-wrap gap-6 justify-between items-center text-sm text-[var(--fg-muted)]">
            <span>© {new Date().getFullYear()} Mohab Tohamy</span>
            <span className="hidden sm:inline">Riyadh — Austria, 2026</span>
            <a
              href="mailto:MohabTohamyAbdallah@gmail.com"
              className="link-arrow"
            >
              say hi
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
            </a>
          </div>
        </footer>
      </body>
    </html>
  );
}
