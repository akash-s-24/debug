import type { Metadata } from "next";
import { Orbitron, Rajdhani, Exo_2, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const orbitron = Orbitron({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const rajdhani = Rajdhani({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const exo2 = Exo_2({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Debug Duel Arena — The Ultimate Live Coding Battle Platform",
  description:
    "Step into the arena. Share your screen. Battle in real-time. Debug Duel Arena is the esports-style live coding battle platform where developers go head-to-head in debugging, algorithm, and code golf challenges.",
  keywords: [
    "coding battle",
    "live coding",
    "debug challenge",
    "esports coding",
    "programming duel",
    "screen share battle",
    "code arena",
    "competitive programming",
    "debug duel",
  ],
  authors: [{ name: "Debug Duel Arena" }],
  openGraph: {
    title: "Debug Duel Arena — The Ultimate Live Coding Battle Platform",
    description:
      "Step into the arena. Share your screen. Battle in real-time.",
    type: "website",
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
      className={`${orbitron.variable} ${rajdhani.variable} ${exo2.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-void text-text-primary">
        <main className="min-h-screen flex flex-col">{children}</main>
      </body>
    </html>
  );
}
